'use strict';
const config = require('../../../config/config.json');
const _ = require('lodash');
const rp = require('request-promise');
const pg = require('../../api/connectors/postgress');
const crypto = require('../../../lib/helpers/crypto');
const configGlobal = require('../../../config/index');
const logger = require('../../../lib/helpers/logger')().app;
const networkConfig = require('../../../lib/repositories/networkConfig');
const endpoint = require('../../../lib/repositories/endpointDefination');
const url = require('url');
const isReachable = require('is-reachable');
const vaultURL = url.parse(config.keyVault.url);
exports.restart = async function (payload, UUIDKey, route, callback, JWToken) {
  // validation for restart
  if (req.body.envSvc &&
    req.body.svc &&
    req.body.pid) {
    await rp({
      method: 'POST',
      uri: `http://${vaultURL.host}/exit`,
      json: true,
      body: req.body
    });
    callback({
      responseMessage: {
        action: 'health',
        data: {
          message: {
            status: 'OK',
            errorDescription: "Exit Request Sent!",
            displayToUser: true
          }
        }
      }
    })
  } else {
    callback({
      responseMessage: {
        action: 'health',
        data: {
          message: {
            status: 'OK',
            errorDescription: "Exit Some Error Occured!",
            displayToUser: true
          },
          error: err
        }
      }
    })
  }
}
exports.configUpdate = async function (payload, UUIDKey, route, callback, JWToken) {
  // validation for config update

  if (req.body.envSvc &&
    req.body.svc &&
    req.body.pid) {
    await rp({
      method: 'POST',
      uri: `http://${vaultURL.host}/configupdate`,
      json: true,
      body: req.body
    });
    callback({
      responseMessage: {
        action: 'health',
        data: {
          message: {
            status: 'OK',
            errorDescription: "Config Update Request Sent!",
            displayToUser: true
          }
        }
      }
    });
  } else {
    callback({
      responseMessage: {
        action: 'health',
        data: {
          message: {
            status: 'OK',
            errorDescription: "Config Update Some Error Occured!",
            displayToUser: true
          }
        }
      }
    });
  }
}


exports.health = async function (payload, UUIDKey, route, callback, JWToken) {
  // networkConfig
  let networks = await networkConfig.getList({type: 'Hyperledger'})
  let peerList = [];
  let epList = await endpoint.findAll();
  let endpointList = [];

  for (let epnt of epList) {
    let ep = _.get(epnt, 'address', undefined);
    let epURL = url.parse(ep);
    let status = await isReachable(epURL.host);
    let fStatus = status ? "Reachable" : "Down";
    if (status) {
      endpointList.push({
        name: epnt.name,
        host: epURL.host,
        lastUpdateTime: Date.now(),
        status: fStatus
      });
    }
  }

  let ordererList = [];
  for (let element of networks) {
    let ordererName = _.get(element, 'orderer.serverHostname', 'N/A');
    let ordererAddress = _.get(element, 'orderer.url', 'N/A').replace('grpcs://', '').replace('grpc://', '');
    let metrics = _.get(element, 'orderer.metrics', undefined);
    let status = await isReachable(ordererAddress);
    let fStatus = status == true ? "Alive" : "Dead"
    let metricsData = {}
    if (status && metrics) {
      let response = await rp({
        method: 'GET',
        uri: metrics,
        json: false
      })
      metricsData = parser(response);
    }
    ordererList.push({
      ordererName,
      ordererAddress,
      status: fStatus,
      lastUpdateTime: Date.now(),
      metricsData
    });
    console.log(ordererList);
  }

  for (let element of networks) {
    for (let elem of element.peerList) {
      let peerName = _.get(elem, 'server_hostname', 'N/A');
      let peerAddress = _.get(elem, 'requests', 'N/A').replace('grpcs://', '').replace('grpc://', '');
      let metrics = _.get(elem, 'metrics', undefined);
      let status = await isReachable(peerAddress);
      let fStatus = status == true ? "Alive" : "Dead"
      let metricsData = {}
      if (status && metrics) {
        let response = await rp({
          method: 'GET',
          uri: metrics,
          json: false
        })
        metricsData = parser(response);
      }
      peerList.push({
        peerName,
        peerAddress,
        status: fStatus,
        lastUpdateTime: Date.now(),
        metricsData
      });
      console.log(peerList);
    }
  }

  // pg status
  logger.info("The notification going is as follows" + JSON.stringify(payload))
  let clientList = []
  let connection = await pg.connection()

  for (let element of connection._clients) {
    let isConnect = false;
    try {
      let finalObj = {};
      _.set(finalObj, 'port', _.get(element, 'port', '0.0.0.0'))
      _.set(finalObj, 'host', _.get(element, 'host', '5432'))
      _.set(finalObj, 'queryQueue', _.get(element, 'queryQueue', []).length)
      _.set(finalObj, 'readyForQuery', _.get(element, 'readyForQuery', isConnect))
      _.set(finalObj, 'lastUpdateTime', Date.now())

      clientList.push(finalObj);
      isConnect = await isReachable(`${_.get(element, 'host', '0.0.0.0')}:${_.get(element, 'port', '5432')}`)
      let statusLabel = isConnect ? "Alive" : "Dead";
      _.set(finalObj, 'connected', statusLabel)

    } catch (ex) {
      console.log(ex)
    }
  }

  let rabbitURL = url.parse(crypto.decrypt(configGlobal.get('amqp.health')))
  let rabbitMQ = []
  try {
    let parsedBody = await rp({
      method: 'GET',
      uri: `http://${rabbitURL.auth}@${rabbitURL.host}/api/overview`,
      json: true
    })
    let finalObj = {};
    _.set(finalObj, 'cluster_name', _.get(parsedBody, 'cluster_name', 'Not Available'))
    _.set(finalObj, 'publish', _.get(parsedBody, 'publish', 'Not Available'))
    _.set(finalObj, 'publish_details_rate', _.get(parsedBody, 'publish_details.rate', 0.0))
    _.set(finalObj, 'publish', _.get(parsedBody, 'confirm', 0.0))
    _.set(finalObj, 'publish', _.get(parsedBody, 'confirm_details.rate', 0.0))
    _.set(finalObj, 'lastUpdateTime', Date.now())
    _.set(finalObj, 'status', 'Alive')
    _.set(finalObj, 'message', 'Reachable')
    rabbitMQ.push(finalObj);
  } catch (ex) {
    let finalObj = {};
    _.set(finalObj, 'cluster_name', rabbitURL.host)
    _.set(finalObj, 'publish', 0.0)
    _.set(finalObj, 'publish_details_rate', 0.0)
    _.set(finalObj, 'publish', 0.0)
    _.set(finalObj, 'publish', 0.0)
    _.set(finalObj, 'lastUpdateTime', Date.now())
    _.set(finalObj, 'status', 'Dead')
    _.set(finalObj, 'message', ex.message)
    rabbitMQ.push(finalObj);
    console.log(JSON.stringify(rabbitMQ))
    console.log(ex.message)
  }

  // end Rabbit Health
  rp({
    method: 'GET',
    uri: `http://${vaultURL.host}/getCipherHealth`,
    json: true // Automatically stringifies the body to JSON
  }).then(function (parsedBody) {
    logger.debug(JSON.stringify(parsedBody));
    logger.debug('==================== Sent Successfully==================');
    const response = {
      health: {
        action: "health",
        data: {
          cipherSvc: parsedBody,
          clientList: clientList,
          rabbitMQ: rabbitMQ,
          peerList,
          ordererList,
          endpointList
        }
      }
    };
    callback(response);
  }).catch(function (err) {
    console.log(err)
    logger.debug('==================== Request Failed==================' + err);
    callback({
      responseMessage: {
        action: 'health',
        data: {
          message: {
            status: 'ERROR',
            errorDescription: "Service not available",
            displayToUser: true
          },
          error: err
        }
      }
    })
  });
}

let parser = (data) => {
  data = res.data.split('\n')
  let help = "";
  let type = "";
  let first = true;
  let result = []
  for (let i = 0; i < data.length; i++) {
    let line = data[i]
    if (line[0] == '#') {
      if (!first) {
        // FETCH TYPE
        first = true
        type = line.split(' ').slice(3).join(' ')
      } else {
        // FETCH HELP
        first = false
        help = line.split(' ').slice(3).join(' ')
      }
    } else {
      // Fetch JSON
      let nam_val = line.split(' ')
      if (!line.includes('=')) {
        // Simple Name Value
        result.push({
          help,
          type,
          name: nam_val[0],
          value: parseFloat(nam_val[1])
        })
      } else {
        // Has Labels
        let labls = (`{${nam_val[0].split('{')[1]}`)
        labls = labls.replace('{', '').replace('}', '').split(',')
        let labels = []
        for (let j = 0; j < labls.length; j++) {
          let key_val = labls[j].split('=')
          labels.push({
            [key_val[0]]: key_val[1].replace(/"/g, '')
          })
        }
        result.push({
          help,
          type,
          labels,
          name: nam_val[0].split('{')[0],
          value: parseFloat(nam_val[1]) || ""
        })
      }
    }
  }
  return result;
}