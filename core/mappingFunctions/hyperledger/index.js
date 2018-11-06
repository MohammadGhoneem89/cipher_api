'use strict';
const log4js = require('log4js');
const logger = log4js.getLogger('hypmonitor');
const pointer = require('json-pointer');
const config = require('../../../config');
const grpcConfig = config.get('grpc');
const rp = require('request-promise');
let main = function (payload, UUIDKey, route, callback, JWToken) {
	if (!payload.function) {
		return callback(errorResponse("Invalid Arguments!!! ", UUIDKey));
	}
	let GRPRequest = {
		Header: {
			tranType: "0200",
			tranCode: payload.function,
			userID: "STUB",
			org: "STUB",
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
	}
	sendGRPCRequest("Rest.proto", grpcConfig, GRPRequest, UUIDKey, callback);

}

function sendGRPCRequest(protoFile, srvcAddressNPort, Request, UUIDKey, responseCallback) {
	logger.debug({ fs: 'RestController.js', func: 'sendGRPCRequest' }, ' [sendGRPCRequest] protoFile: ' + protoFile);
	logger.debug({ fs: 'RestController.js', func: 'sendGRPCRequest' }, ' [sendGRPCRequest] srvc Address and Port: ' + srvcAddressNPort);
	logger.debug({ fs: 'RestController.js', func: 'sendGRPCRequest' }, ' [sendGRPCRequest] Request: ' + JSON.stringify(Request, null, 2));
	logger.debug({ fs: 'RestController.js', func: 'sendGRPCRequest' }, ' [sendGRPCRequest] Sending query to Micservice');
	let url = "http://" + srvcAddressNPort + "/query"
	console.log(url);
	let rpOptions = {
		method: 'POST',
		url,
		body: Request,
		json: true // Automatically stringifies the body to JSON
	};
	logger.debug({ fs: 'RestController.js', func: 'sendGRPCRequest' }, "[RP][SEND]", url, JSON.stringify(rpOptions.body || rpOptions));
	return rp(rpOptions).then(msg => {
		logger.debug(' [sendGRPCRequest] Response MSG: ' + JSON.stringify(msg));
		if (msg.Body.success === false) {
			ErrorMessage = msg.Body.result;
		}
		responseCallback(JSON.parse(msg.Body.result));
	}).catch((error) => {
		logger.error(error);
		let resp={
			responseMessage: {
				action:'health',
				data:{
					message:{
						status:'ERROR',
						errorDescription: " Hyperledger Connect Failed!!! ",
						displayToUser: true
					},
					error: errorResponse(" GRPC Connection Failed!!! ", UUIDKey)
				}
			}
		}
		responseCallback(resp);
	});

}

function errorResponse(exp, UUIDKey) {
	var response = {
		success: false,
		message: "Error: " + exp,
		UUID: UUIDKey
	};
	return response;
}


exports.main = main