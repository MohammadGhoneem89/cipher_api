'use strict';
const APIDefinitation = require('../../../lib/repositories/apiDefination');
const enitity = require('../../../core/mappingFunctions/org/orgList');
const pg = require('../api/connectors/postgress');
async function calculate(payload, UUIDKey, route, callback, JWToken) {
  try {
    // input from date todate

    let apiList = await APIDefinitation.find({isBilled: true})

    // foreach org
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


