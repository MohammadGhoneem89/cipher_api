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
   let queryTask=`SELECT * FROM public.tasks`
   let queryCnt = `SELECT count(*) FROM public.tasks WHERE 1=1`;
   let query=''
    if(payload.body.searchCriteria.task_type){
      task_type = payload.body.searchCriteria.task_type;
      query += ` AND task_type = '${task_type}' `;
    }
    if(payload.body.searchCriteria.api_url){
      api_url = payload.body.searchCriteria.api_url;
      query += ` AND api_url = '${api_url}' `;
    }
    if(payload.body.searchCriteria.schedule_time){
      schedule_time = payload.body.searchCriteria.schedule_time;
      query += ` AND schedule_time = '${schedule_time}' `;
    }
    if(payload.body.searchCriteria.status){
      status = payload.body.searchCriteria.status;
      query += ` AND status = '${status}' `;
    }
    let queryCriteriaFull = queryTask + query;
    let queryCriteria = queryCnt + query;

    console.log("-------------------------------query",query)
    console.log("-------------------------------queryCriteriaFull",queryCriteriaFull)
    console.log("-------------------------------queryCriteria",queryCriteria)



   return callback(payload.body.searchCriteria)
   
 
 
  
  
    
}
exports.search = search;

 // rp(options).then(val=>{console.log("val-------------",val)}).catch(err=> console.log("err-------------",err))
    //console.log("---------------res",res)
   
    //
   
   
   //return callback(response)