'use strict'
// const connector = require('../../../../core/api/client');
// const pg = require('../../../../core/api/connectors/postgress');
// const appConfig = global.config;
const connector = require('../../../core/api/client');
 //const pg = require('../../../core/api/connectors/postgress');
 const pg = require('../../../core/api/connectors/taskPostgres');
//let rp = require('request-promise');

async function search(payload, UUIDKey, route, callback, JWToken) {
   console.log("-----------------response")
   console.log("payload",payload.body.searchCriteria)
   let queryTask=`SELECT * FROM public.tasks  WHERE 1=1 `
   let queryCnt = `SELECT count(*) FROM public.tasks WHERE 1=1 `;
  // let queryCnt = `SELECT count(*) FROM public.tasks WHERE 1=1`;
    let query=''
    if(payload.body.searchCriteria.task_type){
      let task_type = payload.body.searchCriteria.task_type;
      console.log("-----------------task_type",task_type)
      query += ` AND task_type = '${task_type}' `
    }
    if(payload.body.searchCriteria.api_url){
      let api_url = payload.body.searchCriteria.api_url;
      console.log("-----------------api_url", api_url)
      query += ` AND api_url = '${api_url}' ` 
    }
    if(payload.body.searchCriteria.schedule_time){ 
      let schedule_time = payload.body.searchCriteria.schedule_time;
      console.log("-----------------schedule_time",schedule_time)  
      query += ` AND INT8(schedule_time) <= '${schedule_time}' `    

      //query += ` AND schedule_time = '${schedule_time}' `    
    }
    if(payload.body.searchCriteria.status){
      let status = payload.body.searchCriteria.status;
      console.log("-----------------status",status)
      query += ` AND status = '${status}' `
    }
    let queryCriteriaFull = queryTask + query;
    let queryCriteria = queryCnt + query;

    if (payload.body.page && payload.body.page.pageSize && payload.body.page.currentPageNo) {
      queryCriteriaFull += ` limit ${payload.body.page.pageSize} 
  OFFSET ${payload.body.page.pageSize * (payload.body.page.currentPageNo - 1)}`;
  }
    // pg.connection().then(async (conn)=>{
    //   res = await conn.query(queryCriteriaFull,[])
    //   console.log("res----------------------",res)
    //   return callback(res)
    // })
 //   console.log("-------------------------------query",query)
    console.log("-------------------------------queryCriteriaFull",queryCriteriaFull)
   // console.log("-------------------------------queryCriteria",queryCriteria)

    pg.connection().then((conn) => {
       console.log("Connected to DB successfully !")
       return Promise.all([
           conn.query(queryCriteria , []),
           conn.query(queryCriteriaFull, []),
           //conn.query(query2,[]),
       ]).then((data) => {
           let result = data[1].rows
           let total=data[0].rows[0].count
          // console.log("obj1----------------------",data)

          console.log("obj1----------------------",data[0].rows[0].count)
          console.log("obj2----------------------",data[1].rows)
          let response = {
            "searchTask": {
                "pageData": {
                    "pageSize": payload.body.page ? payload.body.page.pageSize : undefined,
                    "currentPageNo": payload.body.page ? payload.body.page.currentPageNo : 1,
                     "totalRecords": total
                },

                "searchResult": result
            }
        };

           return callback(response)
           
       });
   }).catch((err) => {
       console.log("Error occurred while executing query ", err);
       return callback(err);
   });

    // pg.connection().then((conn)=>{
    //   return Promise.all([
    //     conn.query(queryCriteriaFull,[]),
    //     conn.query(queryCriteria,[])
    //   ]).then((data)=>{
    //     console.log("data----------------------")
    //   })
    // })

    



   //return callback(payload.body.searchCriteria)
   
 
 
  
  
    
}
exports.search = search;

 // rp(options).then(val=>{console.log("val-------------",val)}).catch(err=> console.log("err-------------",err))
    //console.log("---------------res",res)
   
    //
   
   
   //return callback(response)