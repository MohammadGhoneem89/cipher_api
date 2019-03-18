'use strict';
const log4js = require('log4js');
const logger = log4js.getLogger('hypmonitor');
const pointer = require('json-pointer');
const config = require('../../../config');
const grpcConfig = config.get('rpcQuorum');
const rp = require('request-promise');
const _ = require('lodash');
const smartContract = require('../systemAPI/smartcontract.js');
const fs = require('fs');

let main = function (payload, UUIDKey, route, callback, JWToken) {
  if (!payload.function) {
    return callback(errorResponse("Invalid Arguments!!! ", UUIDKey));
  }
  let GRPRequest = {
    Header: {
      tranType: "0200",
      tranCode: payload.function,
      userID: JWToken.quorrumUser,
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
  let chainpack;
  if (payload.smartContractPackPath) {
    try {
      chainpack = fs.readFileSync(payload.smartContractPackPath);
    }
    catch (ex) {
      console.log(ex);
      return callback(errorResponse("Invalid Chain Pack File Path!!! ", UUIDKey));
    }
  }
  console.log(">>>>>>>>>>>>>", JSON.stringify(payload, null, 2))
  let RPCRequest = {
    Header: {
      tranType: "0200",
      tranCode: payload.function,
      userID: JWToken.quorrumUser,
      network: payload.network,
      timeStamp: (new Date()).toTimeString(),
      UUID: UUIDKey,
      ResponseMQ: []
    },
    BCData: {
      "channelName": payload.channelName,
      "smartContractName": payload.smartContractName,
      "smartContractPackage": chainpack,
      'smartContractVersion': payload.smartContractVersion,
      'actionType': payload.actionType,
      "privateFor": payload.privateFor,
      "abi": payload.abi,
      "contractAddress": payload.contractAddress,
      'channelConfigPath': payload.channelConfigPath
    },
    Body: {
      fcnName: payload.smartContractMethod || "Constructor",
      arguments: payload.smartContractArgs
    }
  };
  // console.log(JSON.stringify(payload));
  sendRequestBLA(grpcConfig, RPCRequest, UUIDKey, (response) => {
    if (response.tranCode) {
      return callback({
        HyperledgerConnect: {
          action: 'generalNetworkOps',
          data: response
        }
      });
    }

    let retVal = {};
    if (response && response.success == true) {

      let NewPayload = payload.savePayload;
      _.set(NewPayload, 'abi', response.data[0].abi);
      _.set(NewPayload, 'contractAddress', response.data[0].address);
      _.set(NewPayload, 'code', response.data[0].code);
      smartContract.updateSmartContractConfig(NewPayload, UUIDKey, route, (data) => {
        console.log(JSON.stringify(NewPayload));

        let resp = {
          responseMessage: data.responseMessage,
          HyperledgerConnect: {
            data: {
              success: true,
              contractAddress: response.data[0].address
            }
          }
        };
        if (NewPayload._id) {
          _.set(resp, 'responseMessage', undefined);
        };
        callback(resp);
      }, JWToken);
    }
    else {
      console.log("Failure!!!");
      let resp = {
        HyperledgerConnect: {
          action: 'generalNetworkOps',
          data: response
        }
      };
      callback(resp);
    }

  });
};

function sendRequestBLA(srvcAddressNPort, Request, UUIDKey, responseCallback) {
  logger.debug({ fs: 'RestController.js', func: 'sendGRPCRequest' }, ' [sendGRPCRequest] srvc Address and Port: ' + srvcAddressNPort);
  logger.debug({ fs: 'RestController.js', func: 'sendGRPCRequest' }, ' [sendGRPCRequest] Sending query to Micservice');
  let url = `${srvcAddressNPort}/contract/process`;
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
            errorDescription: " Quorum Connect Failed!!! ",
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
