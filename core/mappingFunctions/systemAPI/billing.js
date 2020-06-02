'use strict';
const APIDefinitation = require('../../../lib/repositories/apiDefination');
const enitity = require('../../../core/mappingFunctions/org/orgList');
const pg = require('../api/connectors/postgress');
const moment = require('moment');

async function calculate(payload, UUIDKey, route, callback, JWToken) {
  try {
    // input from date todate

    let apiList = await APIDefinitation.find({isBilled: true})
    let entityList = await entity.orgCodeList();

    entityList.forEach((org) => {
      apiList.forEach((api) => {
        if (org.cycle == "Monthly") {
          const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm:ss');
          const endOfMonth = moment().endOf('month').format('YYYY-MM-DD hh:mm:ss');
          console.log(startOfMonth, endOfMonth)

          if (api.BillingPolicy) {
            api.BillingPolicy.forEach((elem) => {

            })
          }
          // foreach api calculate
          // update billing
        } else if (org.cycle == "Daily") {
          const startOfDay = moment().startOf('day').format('YYYY-MM-DD hh:mm:ss');
          const endOfEnd = moment().endOf('day').format('YYYY-MM-DD hh:mm:ss');
          if (api.BillingPolicy) {
            api.BillingPolicy.forEach((elem) => {

            })
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


