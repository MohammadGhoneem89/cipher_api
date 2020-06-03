'use strict';
const APIDefinitation = require('../../../lib/repositories/apiDefination');
const entity = require('../../../core/mappingFunctions/org/orgList');
const pg = require('../../api/connectors/postgress');
const moment = require('moment');
const _ = require('lodash');

async function calculate(payload, UUIDKey, route, callback, JWToken) {
  try {
    // input from date todate

    let apiList = await APIDefinitation.find({isBilled: true})
    let entityList = await entity.orgCodeList();
    console.log(JSON.stringify(apiList), '\n', JSON.stringify(entityList));
    entityList.forEach((org) => {
      apiList.forEach(async (api) => {
        if (org.cycle && org.cycle == "Monthly") {
          const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm:ss');
          const endOfMonth = moment().endOf('month').format('YYYY-MM-DD hh:mm:ss');
          console.log(startOfMonth, endOfMonth)
          console.log(JSON.stringify(org), JSON.stringify(api));
          if (api.BillingPolicy) {
            // get total number of hits of this org
            let conn = await pg.connection();
            let data = await conn.query(`select sum("hits")::int as totalhits from billing where apiaction='${api.route}' and orgcode='${org.spCode}' and txdate between '${startOfMonth}' and '${endOfMonth}' `);
            let hits = _.get(data, 'rows[0].totalhits', 0)
            console.log(JSON.stringify(hits));
            api.BillingPolicy.forEach((elem) => {
              // apply policy on max
              if (hits > elem.from && hits < elem.from) {
                console.log(JSON.stringify(hits));
              }
            });
          }
          // foreach api calculate
          // update billing
        } else if (org.cycle == "Daily") {
          const startOfDay = moment().startOf('day').format('YYYY-MM-DD hh:mm:ss');
          const endOfEnd = moment().endOf('day').format('YYYY-MM-DD hh:mm:ss');
          if (api.BillingPolicy) {
            api.BillingPolicy.forEach((elem) => {

            });
          }
        }

      })
    })
    //    foreach billed api
    //          apply policy
    //            create bill
    //            put bill
    // select * from billing where action=this and month or day isequal to this and org=this


    // callback(finalRoutes);


  } catch (error) {
    console.log(error.stack)
  }
}


exports.calculate = calculate;


