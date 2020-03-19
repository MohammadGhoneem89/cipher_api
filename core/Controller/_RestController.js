'use strict';

const logger = require('../api/connectors/logger').app;
let config = require('../../AppConfig');
let routeConfiguration = Object.assign(require('../routeConfig/routeConfiguration.json'), require('../../applications/routeConfig/routeConfiguration.json'));
let pointer = require('json-pointer');
const apiPayloadRepo = require('../../lib/repositories/apiPayload');
const _ = require('lodash');
const apiFilter = ['RenewContract'];

let handleExternalRequest = function (payload, channel, incommingRoute, UUIDKey, responseCallback, JWToken, ConnMQ) {
  if (apiFilter.indexOf(incommingRoute) >= 0) {
    if (payload.body.password || payload.JWToken || payload.JWT) {
      delete payload.body.password;
      delete payload.JWToken;
      delete payload.JWT;
    }

    let requestData = {
      uuid: UUIDKey,
      channel: channel,
      action: incommingRoute,
      payload: payload
    };

    apiPayloadRepo.create(requestData);
  }

  let ResponseCaller = function (data, responderMethod) {
    data = data || {};
    if (data.stack) {
      let error = {
        error: {
          message: data.toString(),
          stack: data.stack
        }
      };
      responseCallback.status(500);
      responseCallback.send(error);
      return responseCallback.end();
    }
    //logger.debug({ fs: 'RestController.js', func: 'ResponseCaller' }, JSON.stringify(data, null, 2));
    logger.debug({ fs: 'RestController.js', func: 'ResponseCaller' }, "=========== [" + UUIDKey + "]!!! ============");
    if (responderMethod) {
      responderMethod(responseCallback);
    }
    responseCallback.json(data);
    return responseCallback.end();
  };
  let route = incommingRoute;
  try {

    let routeConfig = routeConfiguration[channel][route];
    if (routeConfig.customMapping === true) {
      handleCustomMappingFunction(routeConfig.MappingfunctionName, routeConfig.CustomMappingFile, payload, UUIDKey, route, ResponseCaller, JWToken, responseCallback, routeConfiguration, channel);
      return;
    }
    responseCallback.json(errorResponse("custom mapping must be true", UUIDKey));
    return responseCallback.end();
  }
  catch (exp) {
    logger.error(exp);
    responseCallback.json(errorResponse(" Route Configuration invalid", UUIDKey));
    return responseCallback.end();
  }

};

function handleCustomMappingFunction(MappingfunctionName, CustomMappingFile, payload, UUIDKey, route, callback, JWToken, res, routeConfiguration, channel) {

  let path = _.get(routeConfiguration, `${channel}.CustomFunctionsLocation`, config.CustomFunctionsLocation)
  let fileLoc = (path) + CustomMappingFile;
  console.log(fileLoc);
  let mappingFunctions = require(fileLoc);
  return mappingFunctions[MappingfunctionName](payload, UUIDKey, route, callback, JWToken, res);

}

function errorResponse(exp, UUIDKey) {
  let response = {
    success: false,
    message: "Error: " + exp,
    UUID: UUIDKey
  };
  return response;
}

exports.handleExternalRequest = handleExternalRequest;
