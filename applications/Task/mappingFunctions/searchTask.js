'use strict'
// const connector = require('../../../../core/api/client');
// const pg = require('../../../../core/api/connectors/postgress');
// const appConfig = global.config;
let rp = require('request-promise');

async function searchTask(payload, UUIDKey, route, callback, JWToken) {
   console.log("-----------------response")

   let options
    options = {
      method: 'POST',
      url: 'http://localhost:8080/search', //'https://5cc165b90e53350014908d51.mockapi.io/api/v1/getAllTask',
      body: {
        // header: {
        //  "Authorization":payload.token
        // },
        body: payload.body
      },
     // strictSSL: false,
      json: true
    };
   //}
 
  //console.log("---------------options",options)
    //let res= await rp(options)
    try{
      let res= await rp(options)
      let data={searchData:res}
      console.log("------------",data)
      return callback(data)
    }catch (err) {
     // console(err, '---------------');
      return callback({
          "messageStatus": "ERROR",
          "errorCode": 201,
          "errorDescription": "API not responding",
      })
    }
  
    
}
exports.searchTask = searchTask;

 // rp(options).then(val=>{console.log("val-------------",val)}).catch(err=> console.log("err-------------",err))
    //console.log("---------------res",res)
   
    //
   
   
   //return callback(response)