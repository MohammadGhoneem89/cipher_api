'use strict';
const APIDefinitation = require('../../../lib/repositories/apiDefination');
const entity = require('../../../core/mappingFunctions/org/orgList');
const pg = require('../../api/connectors/postgress');
const moment = require('moment');
const _ = require('lodash');
const sqlserver = require('../../api/connectors/mssql');
const config = require('../../../config');


async function calculate(payload, UUIDKey, route, callback, JWToken) {
  try {
    // input from date todate

    let apiList = await APIDefinitation.find({ isBilled: true })
    let entityList = await entity.orgCodeList();
    for (const org of entityList) {

      let endEpoch = 0;
      let start = moment().startOf('month'),
        end = moment().startOf('day')
      if (_.isEmpty(org.cycle)) {
        console.log("Skipping ORG ", org.spCode)
        continue;
      }
      if (org.cycle && org.cycle == "Monthly") {
        if (org.lastbilldate)
          start = moment(org.lastbilldate);
        else
          start = moment().startOf('month');
      } else {
        if (org.lastbilldate)
          start = moment(org.lastbilldate);
        else
          start = moment().subtract(1, 'days').endOf('day');
      }
      // end = moment().subtract(1, 'days').endOf('day');
      end = moment().endOf('day');
      console.log("*********TEST**********1", org.lastbilldate, org.cycle, end.diff(start, 'days') + 1, org.spCode)
      for (let api of apiList) {
        if (!api.isActive || !api.isBilled) {
          console.log("Skipping API api.route ", api.route)
          continue;
        } else {
          console.log("Calculating API api.route ", api.route)
        }
        console.log(start, end)
        // console.log(JSON.stringify(org), JSON.stringify(api));
        let result = 0;
        if (api.BillingPolicy) {
          // get total number of hits of this org
          // let qry = `select id,"hits" as totalhits from billing apiaction='${api.route}' and orgcode='${org.spCode}' and txdate between '${start.format('YYYY-MM-DD 00:00:00')}' and '${end.format('YYYY-MM-DD hh:mm:ss')}' `;
          let qry = `select sum("hits") as totalhits,extract(epoch from txdate) * 1000 as "date", txdate from billing 
          where orgcode='${org.spCode}' and apiaction='${api.route}' and txdate>= '${start.format('YYYY-MM-DD 00:00:00')}' and 
          txdate<='${end.format('YYYY-MM-DD hh:mm:ss')}' group by txdate `;

          let data;
          if (config.get('database', 'postgres') == 'mssql') {
            let conn = await sqlserver.connection()
            data = await conn.request().query(qry);
            conn.close();
          } else {
            let conn = await pg.connection();
            data = await conn.query(qry);
          }
           
          let globalhits = 0; // helps determine slab in monthly case
          let slabsToApplyMonthly = []
          for (let elem of data.rows) {
            let realhits=elem.totalhits
            if (config.get('database', 'postgres') == 'mssql') {
              let conn = await sqlserver.connection()
              await conn.request().query(`update billing set isbilled=true where  apiaction='${api.route}' and txdate='${moment(elem.date).format('YYYY-MM-DD')}'`);
              hits += elem.totalhits;
              conn.close();
            } else {
              let connBill = await pg.connection();
              await connBill.query(`update billing set isbilled=true where  apiaction='${api.route}' and txdate='${moment(elem.date).format('YYYY-MM-DD')}'`);

              let totalhits = 0;
              let hits = parseInt(elem.totalhits);;

              if (hits > 0) {
                if (org.cycle && org.cycle == "Monthly") {
                  totalhits = _.cloneDeep(hits);
                  globalhits += hits;
                  let slabsToApply = []
                  // api.BillingPolicy.forEach((, ) => {
                  for (const [index, policy] of api.BillingPolicy.entries()) {

                    let applied = false;
                    slabsToApplyMonthly.forEach((slab) => {
                      if (slab.from == policy.from && slab.to == policy.to) {
                        applied = true;
                      }
                    })

                    if (applied && index + 1 == api.BillingPolicy.length) {
                      slabsToApply.push(policy);
                      break;
                    }

                    if (applied) {
                      continue;
                    }
                    console.log(globalhits, parseInt(policy.from, 10), parseInt(policy.to, 10))
                    if (globalhits >= parseInt(policy.from, 10) && globalhits <= parseInt(policy.to, 10)) {
                      console.log("met first")
                      slabsToApply.push(policy);
                      slabsToApplyMonthly.push(policy);
                      break; // applied hurray
                    } else if (globalhits >= parseInt(policy.from, 10) && globalhits >= parseInt(policy.to, 10)) {
                      console.log("met second")
                      slabsToApply.push(policy);
                      slabsToApplyMonthly.push(policy);
                      continue;
                    }

                  }

                  let remhits = hits;
                  result = 0
                  console.log("PEV", JSON.stringify(result), hits, remhits)
                  slabsToApply.forEach((policy, index) => {
                    console.log("APPLYING", JSON.stringify(policy))
                    let difference = parseInt(policy.to, 10) - parseInt(policy.from, 10) + 1;
                    console.log("difference", JSON.stringify(difference))
                    if (difference >= hits || index + 1 == slabsToApply.length) {
                      result += remhits * policy.billVal;
                    } else {
                      result += difference * policy.billVal;
                      remhits = remhits - difference
                    }
                    console.log("RESULT", JSON.stringify(result))
                  })

                } else {
                  // apply simple
                  totalhits = hits;
                  let slabsToApply = []
                  // api.BillingPolicy.forEach((, ) => {
                  for (const [index, policy] of api.BillingPolicy.entries()) {
                    if (hits >= parseInt(policy.from, 10) && hits <= parseInt(policy.to, 10)) {
                      slabsToApply.push(policy);
                      break; // applied hurray
                    } else if (hits >= parseInt(policy.from, 10) && hits >= parseInt(policy.to, 10)) {
                      slabsToApply.push(policy);
                      let difference = parseInt(policy.to, 10) - parseInt(elem.from, 10);
                      hits = hits - difference;
                      continue;
                    }
                  }

                  let remhits = totalhits;
                  slabsToApply.forEach((policy, index) => {
                    console.log(JSON.stringify(policy))
                    let difference = parseInt(policy.to, 10) - parseInt(policy.from, 10);
                    if (difference >= hits || index + 1 == slabsToApply.length) {
                      result += remhits * policy.billVal;
                    } else {
                      result += difference * policy.billVal;
                      remhits = remhits - difference
                    }
                  })

                }

                console.log("*********totalhits**********", org.cycle, end.diff(start, 'days') + 1, org.spCode, hits)
                //determine which slabs to be applied in order






                let litmus = false;
                if (result > 0) {
                  if (config.get('database', 'postgres') == 'mssql') {
                    let conn = await sqlserver.connection();
                    await conn.request().query(`
          delete from
          billingreport where startdate='${moment(elem.date).format('YYYY-MM-DD 00:00:00')}' and enddate='${moment(elem.date).format('YYYY-MM-DD hh:mm:ss')}'`);
                    await conn.request().query(`
          insert
          into
          billingreport(startdate, enddate, amount, currency, status, billingcycle, orgcode)
          values('${moment(elem.date).format('YYYY-MM-DD 00:00:00')}', '${moment(elem.date).format('YYYY-MM-DD hh:mm:ss')}',${result}, '${org.currency}', 'Pending', '${org.cycle}', '${org.spCode}')`);
                    conn.close();
                    litmus = true;
                  } else {
                    let connUpdate = await pg.connection();

                    await connUpdate.query(`
          delete from
          billingreport where startdate='${moment(elem.date).format('YYYY-MM-DD 00:00:00')}' and enddate='${moment(elem.date).format('YYYY-MM-DD 11:59:00')}' and orgcode='${org.spCode}' and route='${api.route}'`);

          await connUpdate.query(`
          insert
          into
          billingreport(startdate, enddate, amount, currency, status, billingcycle, orgcode, route, hits)
          values('${moment(elem.date).format('YYYY-MM-DD 00:00:00')}', '${moment(elem.date).format('YYYY-MM-DD 11:59:00')}',${result}, '${org.currency}', 'Pending', '${org.cycle}', '${org.spCode}','${api.route}',${realhits})`);
                    litmus = true;
                  }
                  if (litmus) {
                    await entity.updateLastBilling(endEpoch, org.spCode).catch((ex) => {
                      console.log(ex);
                    })
                  }
                }


              }
            } // if is postgress
          }// for each api
        }
      }
    }
    callback({ success: true });
  } catch (error) {
    console.log(error.stack)
  }
}


exports.calculate = calculate;


