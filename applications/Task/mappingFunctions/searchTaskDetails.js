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
   let queryCnt = `SELECT count(*) FROM public.logs where task_id=${task_id}`;
   //let query=`SELECT * from logs where log_id='${id}'`
   console.log("-----------------query",payload.body.page)
   //let queryCriteria = queryCnt + query;

   if (payload.body.page && payload.body.page.pageSize && payload.body.page.currentPageNo) {
      query += ` limit ${payload.body.page.pageSize} 
  OFFSET ${payload.body.page.pageSize * (payload.body.page.currentPageNo - 1)}`;
  }
  // let res 
   pg.connection().then(async (conn) => {
      console.log("Connected to DB successfully !")
      return Promise.all([
         conn.query(query),
         conn.query(queryCnt)
      ]).then((data)=>{
         let result=data[0].rows
         let total=data[1].rows[0].count
         console.log(data[0].rows)
         console.log(data[1].rows[0].count)
         let response={
            "TaskDetails": {
               "pageData": {
                   "pageSize": payload.body.page ? payload.body.page.pageSize : undefined,
                   "currentPageNo": payload.body.page ? payload.body.page.currentPageNo : 1,
                    "totalRecords": total
               },

               "searchResult": result
           }
         }

         return callback(response)
      })
   //   res = await conn.query(query, []);
   //   console.log("-----------------response",res.rows)
   //   let searchTaskDetailsData= {searchTaskDetailsData:res.rows}
   //   return callback(searchTaskDetailsData)
  });
   

   
  
    
}
exports.searchTaskDetails = searchTaskDetails;







/**
 * async function searchTaskDetails(payload, UUIDKey, route, callback, JWToken) {
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
 */

 // rp(options).then(val=>{console.log("val-------------",val)}).catch(err=> console.log("err-------------",err))
    //console.log("---------------res",res)
   
    //
   
   
   //return callback(response)