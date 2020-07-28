'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const dates = require('../../../../lib/helpers/dates');
const _ = require('lodash');
function getTaskList(payload, UUIDKey, route, callback, JWToken) {
  let fromDate = _.get(payload, 'searchCriteria.fromDate', null);
  let toDate = _.get(payload, 'searchCriteria.toDate', null);

  let listParams = [];
  let chartParams = [];
  let task_ndgDateWhere = ' 1=1 ';
  let taskDetailsDateWhere = ' 1=1 '
  if (fromDate && toDate) {
    fromDate += ' 00:00:00';
    toDate += ' 23:59:59';
    listParams.push(fromDate);
    listParams.push(toDate);
    chartParams.push(fromDate);
    chartParams.push(toDate);
    task_ndgDateWhere = `task_ndg.datetime between $1::timestamp AND $2::timestamp`;
    taskDetailsDateWhere = `taskdetails.datetime between $1::timestamp AND $2::timestamp`;
  }
  

  let queryData = `SELECT task_ndg.taskid, technician.name, problem, task_ndg.status, task_ndg.ecd, task_ndg.datetime FROM ( SELECT taskdetails.taskid, SUM( CASE WHEN taskdetails.status='PROBLEM' THEN 1 END ) AS problem FROM taskdetails where ${taskDetailsDateWhere} and attributename <> 'Y' GROUP BY taskid ) details INNER JOIN task_ndg ON details.taskid=task_ndg.taskid LEFT JOIN technician ON task_ndg.technicianid=technician.technicianid WHERE 1=1`;
  let queryCnt = `SELECT count(*) FROM ( SELECT taskdetails.taskid, SUM( CASE WHEN taskdetails.status='PROBLEM' THEN 1 END ) AS problem FROM taskdetails where ${taskDetailsDateWhere} GROUP BY taskid ) details INNER JOIN task_ndg ON details.taskid=task_ndg.taskid LEFT JOIN technician ON task_ndg.technicianid=technician.technicianid WHERE 1=1 `;
  let queryTaskStatus = `SELECT status, count(*) FROM (SELECT * FROM task_ndg WHERE ${task_ndgDateWhere}) task_ndg GROUP BY status`;
  let queryAttributeWise = `SELECT (CASE WHEN attributename = 'X' THEN 'Location' ELSE attributename  END) as attribute, SUM( CASE WHEN status='PROBLEM' OR status='ACCEPTED' THEN 1 ELSE 0 END ) AS reported, SUM( CASE WHEN status='ACCEPTED' THEN 1 ELSE 0 END ) AS accepted FROM (select * from taskdetails where ${taskDetailsDateWhere}) taskdetails GROUP BY attributename HAVING attributename IN ('EID', 'flat', 'Splitter', 'X') ORDER BY attributename`;
  let queryTopFive = `SELECT actions.technicianid, technician.name as technician, COUNT(attributename) as reported , min(datetime) as mindate FROM (SELECT taskdetails.taskid, attributename, taskdetails.status, taskdetails.datetime, task_ndg.technicianid FROM taskdetails INNER JOIN task_ndg ON taskdetails.taskid=task_ndg.taskid WHERE taskdetails.status='ACCEPTED' AND taskdetails.attributename <> 'Y' AND ${taskDetailsDateWhere} ORDER BY taskdetails.datetime ASC) AS actions INNER JOIN technician ON actions.technicianid = technician.technicianid GROUP BY actions.technicianid, technician.name ORDER BY reported DESC, mindate ASC LIMIT 5`;
  // let queryProblem = 'SELECT actions.technicianid, technician.name, technician.image FROM (SELECT* FROM taskdetails INNER JOIN task ON taskdetails.taskid=task.taskid WHERE taskdetails.status=\'ACCEPTED\' ) AS actions INNER JOIN technician ON actions.technicianid = technician.technicianid GROUP BY actions.technicianid, technician.name, technician.image ORDER BY COUNT(*) DESC LIMIT 1'
  let queryTopTechnician = `SELECT actions.technicianid, technician.name, technician.image FROM (SELECT* FROM taskdetails INNER JOIN task_ndg ON taskdetails.taskid=task_ndg.taskid WHERE taskdetails.status='ACCEPTED'  and ${taskDetailsDateWhere}) AS actions INNER JOIN technician ON actions.technicianid = technician.technicianid GROUP BY actions.technicianid, technician.name, technician.image ORDER BY COUNT(*) DESC LIMIT 1`;
  let query = '';


  if (payload.searchCriteria.searchTasks) {
    if (payload.searchCriteria.searchTasks.fromECD != undefined && payload.searchCriteria.searchTasks.toECD != undefined) {
      queryData = `SELECT task_ndg.taskid, technician.name, problem, task_ndg.status, task_ndg.ecd, task_ndg.datetime FROM ( SELECT taskdetails.taskid, SUM( CASE WHEN taskdetails.status=\'PROBLEM\' THEN 1 END ) AS problem FROM taskdetails where ${taskDetailsDateWhere} GROUP BY taskdetails.taskid) details INNER JOIN task_ndg ON details.taskid=task_ndg.taskid LEFT JOIN technician ON task_ndg.technicianid=technician.technicianid WHERE task_ndg.ecd between $${listParams.length + 1}::bigInt AND $${listParams.length + 2}::bigInt`;
      queryCnt = `SELECT count(*) FROM ( SELECT taskdetails.taskid, SUM( CASE WHEN taskdetails.status=\'PROBLEM\' THEN 1 END ) AS problem FROM taskdetails where ${taskDetailsDateWhere} GROUP BY taskdetails.taskid) details INNER JOIN task_ndg ON details.taskid=task_ndg.taskid LEFT JOIN technician ON task_ndg.technicianid=technician.technicianid WHERE task_ndg.ecd between $${listParams.length + 1}::bigInt AND $${listParams.length + 2}::bigInt`;
      listParams.push(payload.searchCriteria.searchTasks.fromECD);
      listParams.push(payload.searchCriteria.searchTasks.toECD);
    }
    if (payload.searchCriteria.searchTasks.status != undefined && payload.searchCriteria.searchTasks.technician) {
      queryData += ' AND task_ndg.status = $' + (listParams.length + 1) + '::varchar  AND technician.name= $' + (listParams.length + 2) + '::varchar';
      queryCnt += ' AND task_ndg.status = $' + (listParams.length + 1) + '::varchar AND technician.name= $' + (listParams.length + 2) + '::varchar';
      listParams.push(payload.searchCriteria.searchTasks.status);
      listParams.push(payload.searchCriteria.searchTasks.technician);
    }
    else if (payload.searchCriteria.searchTasks.status != undefined) {
      queryData += ' AND task_ndg.status = $' + (listParams.length + 1) + '::varchar';
      queryCnt += ' AND task_ndg.status = $' + (listParams.length + 1) + '::varchar';
      listParams.push(payload.searchCriteria.searchTasks.status);
    }
    else if (payload.searchCriteria.searchTasks.technician) {
      queryData += ' AND technician.name ilike $' + (listParams.length + 1) + '::varchar';
      queryCnt += ' AND technician.name ilike $' + (listParams.length + 1) + '::varchar';
      let technician = `%${payload.searchCriteria.searchTasks.technician}%`;
      listParams.push(technician);
    }
    else if (payload.searchCriteria.searchTasks.region) {
      queryData += ' AND technician.region = $' + (listParams.length + 1) + '::varchar';
      queryCnt += ' AND technician.region= $' + (listParams.length + 1) + '::varchar';
      listParams.push(payload.searchCriteria.searchTasks.region);
    }
  }

  let sortData = payload.searchCriteria.sortData;

  if (sortData && sortData[0] === "technicianName") {
    queryData += ` ORDER BY technician.name ${sortData[1] == 1 ? 'ASC' : 'DESC'}`;
  }
  else if (sortData && sortData[0] === "taskId") {
    queryData += ` ORDER BY task_ndg.taskid ${sortData[1] == 1 ? 'ASC' : 'DESC'} `;
  }
  else if (sortData && sortData[0] == "status") {
    queryData += ` ORDER BY task_ndg.status ${sortData[1] == 1 ? 'ASC' : 'DESC'} `;
  }
  else if (sortData && sortData[0] == "ecd") {
    queryData += ` ORDER BY task_ndg.ecd ${sortData[1] == 1 ? 'ASC' : 'DESC'} `;
  }
  else if (sortData && sortData[0] == "dateTime") {
    queryData += ` ORDER BY task_ndg.datetime ${sortData[1] == 1 ? 'ASC' : 'DESC'} `;
  }
  else {
    queryData += ' ORDER BY task_ndg.datetime DESC';
  }

  let queryCriteria = queryCnt + query;
  let queryCriteriaFull = queryData + query;

  if (payload.page) {
    queryCriteriaFull += ` limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`;
  }


  console.log("+++", queryCriteria);
  console.log("---", queryCriteriaFull);
  console.log("===", queryTaskStatus);
  console.log("###", queryAttributeWise);
  console.log("***", queryTopFive);
  console.log("&&&", queryTopTechnician);

  pg.connection().then((conn) => {
    return Promise.all([
      conn.query(queryCriteria, listParams),
      conn.query(queryCriteriaFull, listParams),
      conn.query(queryTaskStatus, chartParams),
      conn.query(queryAttributeWise, chartParams),
      conn.query(queryTopFive, chartParams),
      conn.query(queryTopTechnician, chartParams)
    ]).then((data) => {
      let outVal = [];
      data[1].rows.forEach((elemt) => {
        let date = new Date(elemt.datetime);

        let dateTime = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        outVal.push({
          taskId: elemt.taskid,
          status: elemt.status,
          technicianName: elemt.name,
          pbTl: (elemt.problem == null ? 0 : elemt.problem) + '/4',
          ecd: elemt.ecd,
          dateTime: dateTime,
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
