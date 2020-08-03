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
      userID: JWToken.hypUser,
      network: payload.network || 'network1',
      timeStamp: (new Date()).toTimeString(),
      UUID: UUIDKey,
      ResponseMQ: []
    },
    BCData: {
      "channelName": payload.channelName || 'prwchannel'
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
  console.log("-------->>>>>>>>>>>>-----****---->>>>>>>>>>>>Payload : ", JSON.stringify(payload));
  let RPCRequest = {
    Header: {
      tranType: "0200",
      tranCode: payload.function,
      userID: JWToken.hypUser || "STUB",
      network: payload.network,
      timeStamp: (new Date()).toTimeString(),
      UUID: UUIDKey,
      ResponseMQ: []
    },
    BCData: {
      "orderer":payload.orderer,
      "ordererDomain":payload.ordererDomain,
      "ordererPort":payload.ordererPort,
      "MSP":payload.MSP,
      "peer":payload.peer,
      "peerDomain":payload.peerDomain,
      "peerPort":payload.peerPort,
      "signaturePolicy":payload.signaturePolicy,
      "sequence":payload.sequence,
      "packageIdentifier":payload.packageIdentifier,
      "smartContractArgs":payload.smartContractArgs,
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
  console.log("-------->>>>>>>>>>>>-----****---->>>>>>>>>>>>Request : ", JSON.stringify(RPCRequest));
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
  
  Request.Header.userID = "admin";
  console.log("-------------------****---->>>>>>>>>>>>Request : ", JSON.stringify(Request));
  logger.debug({ fs: 'RestController.js', func: 'sendGRPCRequest' }, ' [sendGRPCRequest] srvc Address and Port: ' + srvcAddressNPort);
  logger.debug({ fs: 'RestController.js', func: 'sendGRPCRequest' }, ' [sendGRPCRequest] Sending query to Micservice');
  let url = `http://${srvcAddressNPort}/process`;
  let rpOptions = {
    method: 'POST',
    url,
    body: Request,
    json: true // Automatically stringifies the body to JSON
  };
  console.log("-------------------****--------------------------");
  console.log("-------------------****--------------------------");
  console.log("-------------------****--------------------------");
  console.log("-------------------****--------------------------");
  logger.debug({ fs: 'RestController.js', func: 'sendGRPCRequest' }, "[RP][SEND]", url, JSON.stringify(rpOptions.body || rpOptions));
  console.log("-------------------****--------------------------");
  console.log("-------------------****--------------------------");
  console.log("-------------------****--------------------------");
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
