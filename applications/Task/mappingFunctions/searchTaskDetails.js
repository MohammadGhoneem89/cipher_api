'use strict'
 const connector = require('../../../core/api/client');
 //const pg = require('../../../core/api/connectors/postgress');
 const pg = require('../../../core/api/connectors/taskPostgres');

// const appConfig = global.config;
//let rp = require('request-promise');

async function searchTaskDetails(payload, UUIDKey, route, callback, JWToken) {
   console.log("-----------------payload.body.task_id",payload.body.task_id)
  let  task_id=payload.body.task_id
  //let id=payload.body.id
  //let query=`SELECT * from logs`
   let query=`SELECT * from logs where task_id=${task_id}`
   //let query=`SELECT * from logs where log_id='${id}'`
   console.log("-----------------query",query)

  // let query=`select * from apipayloadevents`
   let res 
   pg.connection().then(async (conn) => {
     res = await conn.query(query, []);
     console.log("-----------------response",res.rows)
     let searchTaskDetailsData= {searchTaskDetailsData:res.rows}
     return callback(searchTaskDetailsData)
  });
   

   
  
    
}
exports.searchTaskDetails = searchTaskDetails;

 // rp(options).then(val=>{console.log("val-------------",val)}).catch(err=> console.log("err-------------",err))
    //console.log("---------------res",res)
   
    //
   
   
   //return callback(response)