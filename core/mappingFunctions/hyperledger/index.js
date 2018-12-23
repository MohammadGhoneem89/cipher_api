'use strict';
const log4js = require('log4js');
const logger = log4js.getLogger('hypmonitor');
const pointer = require('json-pointer');
const config = require('../../../config');
const grpcConfig = config.get('grpc');
const rp = require('request-promise');
const fs = require('fs');

let main = function (payload, UUIDKey, route, callback, JWToken) {
  if (!payload.function) {
    return callback(errorResponse("Invalid Arguments!!! ", UUIDKey));
  }
  let GRPRequest = {
    Header: {
      tranType: "0200",
      tranCode: payload.function,
      userID: "STUB",
      network: "STUB",
      timeStamp: (new Date()).toTimeString(),
      UUID: UUIDKey,
      ResponseMQ: []
    },
    BCData: {
      configType: "peerQuery"
    },
    Body: {
      fcnName: "STUB",
      arguments: payload.arguments
    }
  };
  sendRequestBLA(grpcConfig, GRPRequest, UUIDKey, (data) => {
    if (data.Body) {
      return callback(JSON.parse(data.Body.result));
    }
    callback(data);
  });
};

let generalNetworkOps = function (payload, UUIDKey, route, callback, JWToken) {
  if (!payload.function) {
    return callback(errorResponse("Invalid Arguments!!! ", UUIDKey));
  }

  let envelope;
  let chainpack;

  if (payload.channelConfigPath) {
    try {
      envelope = fs.readFileSync(payload.channelConfigPath);
    }
    catch (ex) {
      console.log(ex);
      return callback(errorResponse("Invalid Channel File Path!!! ", UUIDKey));
    }
  }

  if (payload.smartContractPackPath) {
    try {
      chainpack = fs.readFileSync(payload.smartContractPackPath);
    }
    catch (ex) {
      console.log(ex);
      return callback(errorResponse("Invalid Chain Pack File Path!!! ", UUIDKey));
    }
  }
  let RPCRequest = {
    Header: {
      tranType: "0200",
      tranCode: payload.function,
      userID: JWToken.userID || "STUB",
      network: payload.network,
      timeStamp: (new Date()).toTimeString(),
      UUID: UUIDKey,
      ResponseMQ: []
    },
    BCData: {
      "channelName": payload.channelName,
      "smartContractName": payload.smartContractName,
      "channelConfig": envelope,
      "smartContractPackage": chainpack,
      'smartContractVersion': payload.smartContractVersion,
      'actionType': payload.actionType,
      'channelConfigPath': payload.channelConfigPath
    },
    Body: {
      fcnName: payload.smartContractMethod,
      arguments: payload.smartContractArgs
    }
  };
  sendRequestBLA(grpcConfig, RPCRequest, UUIDKey, (data) => {
    let response = {
      HyperledgerConnect: {
        action: 'generalNetworkOps',
        data: data,
      }
    };
    callback(response);
  });
};

function sendRequestBLA(srvcAddressNPort, Request, UUIDKey, responseCallback) {
  logger.debug({ fs: 'RestController.js', func: 'sendGRPCRequest' }, ' [sendGRPCRequest] srvc Address and Port: ' + srvcAddressNPort);
  logger.debug({ fs: 'RestController.js', func: 'sendGRPCRequest' }, ' [sendGRPCRequest] Sending query to Micservice');
  let url = `http://${srvcAddressNPort}/process`;
  let rpOptions = {
    method: 'POST',
    url,
    body: Request,
    json: true // Automatically stringifies the body to JSON
  };
  logger.debug({ fs: 'RestController.js', func: 'sendGRPCRequest' }, "[RP][SEND]", url, JSON.stringify(rpOptions.body || rpOptions));
  return rp(rpOptions).then((msg) => {
    logger.debug(' [sendGRPCRequest] Response MSG: ' + JSON.stringify(msg, null, 2));
    responseCallback(msg);
  }).catch((error) => {
    logger.error(error);
    let resp = {
      responseMessage: {
        action: 'health',
        data: {
          message: {
            status: 'ERROR',
            errorDescription: " Hyperledger Connect Failed!!! ",
            displayToUser: true
          },
          error: " GRPC Connection Failed!!! "
        }
      }
    };
    responseCallback(resp);
  });
}
function errorResponse(exp, UUIDKey) {
  let response = {
    action: 'health',
    data: {
      message: {
        status: 'ERROR',
        errorDescription: exp,
        displayToUser: true
      }
    }
  };

  return response;
}
exports.main = main;
exports.generalNetworkOps = generalNetworkOps;
