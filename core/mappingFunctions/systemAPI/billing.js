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
    console.log(JSON.stringify(apiList), '\n', JSON.stringify(entityList));
    for (const org of entityList) {
      let result = 0;
      let endEpoch = 0;
      let start = moment().startOf('month').format('YYYY-MM-DD hh:mm:ss'),
        end = moment().startOf('day').format('YYYY-MM-DD hh:mm:ss');

      if (org.cycle && org.cycle == "Monthly") {
        if (org.lastbilldate)
          start = moment(org.lastbilldate).format('YYYY-MM-DD 00:00:00');
        else
          start = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD 00:00:00');
        end = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD hh:mm:ss');
        endEpoch = moment().subtract(1, 'month').endOf('month').unix();
      } else if (org.cycle == "Daily") {
        if (org.lastbilldate)
          start = moment(org.lastbilldate).format('YYYY-MM-DD 00:00:00');
        else
          start = moment().subtract(1, 'days').startOf('day').format('YYYY-MM-DD 00:00:00');
        end = moment().subtract(1, 'days').endOf('day').format('YYYY-MM-DD hh:mm:ss');
        endEpoch = moment().subtract(1, 'days').endOf('day').unix();
      }
      console.log(endEpoch, moment().unix())
      if (endEpoch > moment().unix()) {
        console.log("billing cycle not started yet!!");
        break;
      } else {
        console.log("billing cycle started!!");
      }
      for (let api of apiList) {

        console.log(start, end)
        console.log(JSON.stringify(org), JSON.stringify(api));
        if (api.BillingPolicy) {
          // get total number of hits of this org
          let qry = `select id,"hits" as totalhits from billing where isbilled=false and apiaction='${api.route}' and orgcode='${org.spCode}' and txdate between '${start}' and '${end}' `;
          let data;
          if (config.get('database', 'postgres') == 'mssql') {
            let conn = await sqlserver.connection()
            data = await conn.request().query(qry);
            conn.close();
          } else {
            let conn = await pg.connection(qry);
            data = await conn.query();
          }
          let hits = 0;
          for (let elem of data.rows) {
            if (config.get('database', 'postgres') == 'mssql') {
              let conn = await sqlserver.connection()
              await conn.request().query(`update billing set isbilled=true where id='${elem.id}'`);
              hits += elem.totalhits;
              conn.close();
            } else {
              let connBill = await pg.connection();
              hits += elem.totalhits;
              await connBill.query(`update billing set isbilled=true where id='${elem.id}'`);
            }
          }
          // let hits = _.get(data, 'rows[0].totalhits', 0)
          console.log('>>>>>>>>>', JSON.stringify(hits));
          console.log(JSON.stringify(api.BillingPolicy));
          let lastPolicy = undefined;
          let isApplied = false;
          if (hits > 0) {
            api.BillingPolicy.forEach((elem) => {
              // apply policy on max
              if (hits >= parseInt(elem.from, 10) && hits <= parseInt(elem.to, 10)) {
                result += elem.billVal * hits;
                isApplied = true;
              }
              lastPolicy = elem;
            });
            if (hits > 0 && isApplied === false) {
              let factor = (hits / lastPolicy.to) * hits
              result += factor * lastPolicy.billVal;
            }
          }
        }
      }
      if (result > 0) {

        if (config.get('database', 'postgres') == 'mssql') {
          let conn = await sqlserver.connection()
          await conn.request().query(`
          insert
          into
          billingreport(startdate, enddate, amount, currency, status, billingcycle, orgcode)
          values('${start}', '${end}',${result}, '${org.currency}', 'Pending', '${org.cycle}', '${org.spCode}')
          on
          conflict(startdate, enddate, status, billingcycle, orgcode)
          do update set
          amount = billingreport.amount +${result}`);
          conn.close();
        } else {
          let connUpdate = await pg.connection();
          await connUpdate.query(`
              insert
              into
              billingreport(startdate, enddate, amount, currency, status, billingcycle, orgcode)
              values('${start}', '${end}',${result}, '${org.currency}', 'Pending', '${org.cycle}', '${org.spCode}')
              on
              conflict(startdate, enddate, status, billingcycle, orgcode)
              do update set
              amount = billingreport.amount +${result}`);
        }



      }
      entity.updateLastBilling(endEpoch, org.spCode).then(() => {
        callback({ success: true });
      }).catch((ex) => {
        console.log(ex);
        callback({ success: false });
      })

    }
  } catch (error) {
    console.log(error.stack)
    callback({ success: false })
  }
}


exports.calculate = calculate;


