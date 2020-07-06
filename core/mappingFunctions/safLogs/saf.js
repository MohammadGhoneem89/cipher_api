'use strict';

const dates = require('../../../lib/helpers/dates');
const pg = require('../../api/connectors/postgress');
const config = require('../../../config');
const _ = require('lodash');
const moment = require('moment');

function getSafLogs(payload, UUIDKey, route, callback, JWToken) {
  let queryData = 'SELECT * FROM saflogs WHERE 1=1 ';
  let queryCnt = 'SELECT count(*) FROM saflogs WHERE 1=1 ';
  let query = '';
  if (payload.searchCriteria && payload.searchCriteria.toDate && payload.searchCriteria.fromDate) {
    let fromdate = dates.ddMMyyyyslash(payload.searchCriteria.fromDate);
    let todate = dates.ddMMyyyyslash(payload.searchCriteria.toDate);
    query += ` AND date_part('epoch'::text,createdon)::bigint between  ${fromdate / 1000} AND ${todate / 1000} `;
  }
  if (payload.searchCriteria && payload.searchCriteria.functionName) {
    let functionName = payload.searchCriteria.functionName;
    query += ` AND functionName = '${functionName}' `;
  }
  if (payload.searchCriteria && payload.searchCriteria.network) {
    let network = payload.searchCriteria.network;
    query += ` AND network like '%${network}%'`;
  }
  let queryCriteria = queryCnt + query;
  let queryCriteriaFull = queryData + query;
  if (payload.page) {
    queryCriteriaFull += ` order by createdon desc limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`;
  }
  pg.connection().then((conn) => {
    return Promise.all([
      conn.query(queryCriteria, []),
      conn.query(queryCriteriaFull, [])
    ]).then((data) => {
      data[1].rows.forEach((elemt) => {
        elemt.status = Status(elemt.status);
        elemt.actions = [{
          label: "ReQueue",
          iconName: "fa fa-recycle",
          actionType: "COMPONENT_FUNCTION"
        }, {label: "viewData", iconName: "fa fa-eye", actionType: "COMPONENT_FUNCTION"}];
      });
      console.log(JSON.stringify(data[0].rows, null, 5))
      let response = {
        "EventDispatcherStatus": {
          "action": "EventDispatcherStatus",
          "pageData": {
            "pageSize": payload.page.pageSize,
            "currentPageNo": payload.page.currentPageNo,
            "totalRecords": data[0].rows[0].count
          },
          "data": {
            "searchResult": data[1].rows
          }
        }
      };
      return callback(response);
    });
  }).catch((err) => {
    console.log(err);
  });
}

async function updateSafLogs(payload, UUIDKey, route, callback, JWToken) {
  let queryData = `update saflogs set status=2 WHERE id=${payload.id}`;
  let resp = {
    "responseMessage": {
      "data": {
        "message": {
          "status": "ERROR",
          "errorDescription": "",
          "displayToUser": true,
          "newPageURL": ""
        }
      }
    }
  };
  const amq = require('../../api/connectors/queue');
  let channelSender = await amq.start();
  let queueName = config.get('queues.SAFQueue', 'BLA_Input_Queue');
  console.log(">>++++__", JSON.stringify(payload))
  return channelSender.sendToQueue(queueName, payload.payload).then(function () {
    return pg.connection().then((conn) => {
      return conn.query(queryData, []).then((data) => {
        resp.responseMessage.data.message.status = "OK";
        resp.responseMessage.data.message.errorDescription = `Message ReQueued to [${queueName}] !!`;
        return callback(resp);
      }).catch((ex) => {
        console.log(ex)
        resp.responseMessage.data.message.status = "ERROR";
        resp.responseMessage.data.message.errorDescription = ex.message;
        return callback(resp);
      });
    }).catch((ex) => {
      console.log(ex);
      resp.responseMessage.data.message.status = "ERROR";
      resp.responseMessage.data.message.errorDescription = ex.message;
      return callback(resp);
    });
  }).catch(function (err) {
    console.log(err);
    resp.responseMessage.data.message.status = "ERROR";
    resp.responseMessage.data.message.errorDescription = "Message was rejected!";
    return console.log("Message was rejected!");
  });
}

async function consumeSaflogs() {
  const amq = require('../../api/connectors/queue');
  let connection = await amq.start();
  console.log("system ")
  connection.addSetup(function (channel) {
    return Promise.all([
      channel.assertQueue(config.get('queues.unprocessed', 'UN_PROCESSED'), config.get('queueGeneralConfig', {})),
      channel.consume(config.get('queues.unprocessed', 'UN_PROCESSED'), async function handleMessage(msg) {
        try {
          let message = Buffer.from(msg.content).toString();
          console.log('SAF Record Found>', message)
          console.log(message)
          let data = JSON.parse(message);
          let error = _.get(data, 'Error', {});
          let fcnName = _.get(data, 'Body.fcnName', 'N/A');
          let status = '1';
          let payload = data;
          let uuid = _.get(data, 'Header.UUID', 'N/A');
          let messagedate = _.get(data, 'Header.timeStamp', 'N/A');
          if (messagedate) {
            let dateEp = new Date(messagedate);
            messagedate = moment.unix(dateEp.valueOf() / 1000).format('YYYY-MM-DD HH:mm:ss');
          }
          let network = _.get(data, 'Header.network', 'Exhausted');
          let smartcontract = `${_.get(data, 'BCData.channelName', 'N/A')}/${_.get(data, 'BCData.smartContractName', 'N/A')}`
          let query = `INSERT INTO public.saflogs (createdon, functionname, errormsg, status, payload, uuid, messagedate, network, smartcontract)
                 VALUES(now(), $1::varchar, $2::json, $3::json, $4::json, $5::varchar,$6::timestamptz, $7::varchar, $8::varchar)`;

          console.log(query)
          return pg.connection().then((conn) => {
            return conn.query(query, [fcnName, error, status, payload, uuid, messagedate, network, smartcontract]).then(() => {
              console.log('SAF Record Found archived successfully!');
            })
          });
        } catch (e) {
          console.log(e)
        } finally {
          connection.ack(msg);
        }
      })
    ])
  });
}


function Status(tranStatus) {
  let vs = {
    "value": "",
    "type": "INFO"
  }
  if (tranStatus === '1') {
    vs.value = "Rejected";
    vs.type = "ERROR";

  } else if (tranStatus === '2') {
    vs.value = 'Dispatched';
    vs.type = "SUCCESS";
  }
  return vs;

}

exports.getSafLogs = getSafLogs;
exports.updateSafLogs = updateSafLogs;
exports.consumeSaflogs = consumeSaflogs;