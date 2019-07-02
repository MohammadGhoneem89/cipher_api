'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const dates = require('../../../../lib/helpers/dates');
const _ = require('lodash');
function getTaskList(payload, UUIDKey, route, callback, JWToken) {
  let fromdate = dates.ddMMyyyyslash(payload.searchCriteria.fromDate);
  let todate = dates.ddMMyyyyslash(payload.searchCriteria.toDate);


  let queryData = 'SELECT task.taskid, technician.name, problem, task.status, task.ecd FROM ( SELECT taskdetails.taskid, SUM( CASE WHEN taskdetails.status=\'PROBLEM\' THEN 1 END ) AS problem FROM taskdetails GROUP BY taskid ) details INNER JOIN task ON details.taskid=task.taskid LEFT JOIN technician ON task.technicianid=technician.technicianid WHERE 1=1';
  let queryCnt = 'SELECT count(*) FROM task left join technician on task.technicianid=technician.technicianid WHERE 1=1';
  let queryTaskStatus = 'SELECT status, count(*) FROM (SELECT * FROM task WHERE datetime BETWEEN \'' + payload.searchCriteria.fromDate + '\' AND \'' + payload.searchCriteria.toDate + '\') task GROUP BY status';
  let queryAttributeWise = 'SELECT attributename as attribute, SUM( CASE WHEN status=\'PROBLEM\' OR status=\'ACCEPTED\' THEN 1 ELSE 0 END ) AS reported, SUM( CASE WHEN status=\'ACCEPTED\' THEN 1 ELSE 0 END ) AS accepted FROM (select * from taskdetails where datetime between \'' + payload.searchCriteria.fromDate + '\' AND \'' + payload.searchCriteria.toDate + '\') taskdetails GROUP BY attributename HAVING attributename IN (\'eid\', \'flat\', \'splitter\', \'dropD\', \'x\', \'y\') ORDER BY attributename';
  let queryTopFive = 'SELECT actions.technicianid, technician.name as technician, COUNT(attributename) as reported FROM(SELECT* FROM taskdetails INNER JOIN task ON taskdetails.taskid=task.taskid WHERE taskdetails.status=\'ACCEPTED\' AND taskdetails.datetime BETWEEN \'' + payload.searchCriteria.fromDate +'\' AND \'' + payload.searchCriteria.toDate + '\') AS actions INNER JOIN technician ON actions.technicianid = technician.technicianid GROUP BY actions.technicianid, technician.name ORDER BY COUNT(*) DESC LIMIT 5'
  // let queryProblem = 'SELECT actions.technicianid, technician.name, technician.image FROM (SELECT* FROM taskdetails INNER JOIN task ON taskdetails.taskid=task.taskid WHERE taskdetails.status=\'ACCEPTED\' ) AS actions INNER JOIN technician ON actions.technicianid = technician.technicianid GROUP BY actions.technicianid, technician.name, technician.image ORDER BY COUNT(*) DESC LIMIT 1'
  let queryTopTechnician = 'SELECT actions.technicianid, technician.name, technician.image FROM (SELECT* FROM taskdetails INNER JOIN task ON taskdetails.taskid=task.taskid WHERE taskdetails.status=\'ACCEPTED\'  and taskDetails.datetime between \'' + payload.searchCriteria.fromDate + '\' and \'' + payload.searchCriteria.toDate + '\') AS actions INNER JOIN technician ON actions.technicianid = technician.technicianid GROUP BY actions.technicianid, technician.name, technician.image ORDER BY COUNT(*) DESC LIMIT 1'
  let query = '';

  if (payload.searchCriteria.searchTasks) {
    if(payload.searchCriteria.searchTasks.fromECD != undefined && payload.searchCriteria.searchTasks.toECD != undefined) {
      queryData = 'SELECT task.taskid, technician.name, problem, task.status, task.ecd FROM ( SELECT taskdetails.taskid, SUM( CASE WHEN taskdetails.status=\'PROBLEM\' THEN 1 END ) AS problem FROM taskdetails GROUP BY taskdetails.taskid ) details INNER JOIN task ON details.taskid=task.taskid LEFT JOIN technician ON task.technicianid=technician.technicianid WHERE task.ecd between \'' + payload.searchCriteria.searchTasks.fromECD + '\' AND \'' + payload.searchCriteria.searchTasks.toECD + '\'';
      queryCnt = 'SELECT count(*) FROM task left join technician on task.technicianid=technician.technicianid WHERE task.ecd between \'' + payload.searchCriteria.searchTasks.fromECD + '\' AND \'' + payload.searchCriteria.searchTasks.toECD + '\'';
    }
    if(payload.searchCriteria.searchTasks.status != undefined && payload.searchCriteria.searchTasks.technician) {
        queryData += ' AND task.status = \'' + payload.searchCriteria.searchTasks.status + '\'  AND technician.name= \'' + payload.searchCriteria.searchTasks.technician + '\''
        queryCnt += ' AND task.status = \'' + payload.searchCriteria.searchTasks.status + '\'  AND technician.name= \'' + payload.searchCriteria.searchTasks.technician + '\''
      }
    else if(payload.searchCriteria.searchTasks.status != undefined) {
      queryData += ' AND task.status = \'' + payload.searchCriteria.searchTasks.status + '\''
      queryCnt += ' AND task.status = \'' + payload.searchCriteria.searchTasks.status + '\''
    }
    else if(payload.searchCriteria.searchTasks.technician) {
      queryData += ' AND technician.name= \'' + payload.searchCriteria.searchTasks.technician + '\''
      queryCnt += ' AND technician.name= \'' + payload.searchCriteria.searchTasks.technician + '\''
    }
    queryData += ' ORDER BY task.datetime DESC';
  }

  let queryCriteria = queryCnt + query;
  let queryCriteriaFull = queryData + query;
  //if (payload.page) { queryCriteriaFull += ` order by "createdAt" desc limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`; }
  if (payload.page) {
      queryCriteriaFull += ` limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`;
      // queryProblem += ` limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`;
    }
  pg.connection().then((conn) => {
      console.log("+++",queryCriteria)
      console.log("---",queryCriteriaFull)
      console.log("===",queryTaskStatus)
      console.log("###",queryAttributeWise)
      console.log("***",queryTopFive)
      console.log("&&&",queryTopTechnician)
    return Promise.all([
      conn.query(queryCriteria, []),
      conn.query(queryCriteriaFull, []),
      conn.query(queryTaskStatus, []),
      conn.query(queryAttributeWise, []),
      conn.query(queryTopFive, []),
      conn.query(queryTopTechnician, [])
    ]).then((data) => {
      let outVal = [];
      data[1].rows.forEach((elemt) => {
        outVal.push({
          taskId: elemt.taskid,
          status: elemt.status,
          technicianName: elemt.name,
          pbTl: (elemt.problem == null ? 0 : elemt.problem) + '/6',
          ecd: elemt.ecd,
          actions: [{ "value": "1003", "type": "componentAction", "label": "View", "params": "", "iconName": "icon-docs", "URI": ["/etisalat/datastructure"] }]
        });
      });
      let response = {
        "getTaskList": {
          "action": "getTaskList",
          "pageData": {
            "pageSize": payload.page.pageSize,
            "currentPageNo": payload.page.currentPageNo,
            "totalRecords": data[0].rows[0].count
          },
          "data": {
            "searchResult": {
              taskStatus: data[2].rows,
              attributewise: data[3].rows,
              topFive: data[4].rows,
              topTechnician: data[5].rows,
              list: outVal
            }
          }
        }
      };
      return callback(response);
    });
  }).catch((err) => {
    console.log(err);
  });
}

exports.getTaskList = getTaskList;
