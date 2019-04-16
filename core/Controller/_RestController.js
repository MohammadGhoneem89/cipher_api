'use strict';

const logger = require('../api/connectors/logger').app;
let config = require('../../AppConfig');
let routeConfiguration = Object.assign(require('../routeConfig/routeConfiguration.json'), require('../../applications/routeConfig/routeConfiguration.json'));
let pointer = require('json-pointer');
const apiPayloadRepo = require('../../lib/repositories/apiPayload');
const _ = require('lodash');
const apiFilter = ['RenewContract'];

let handleExternalRequest = function (payload, channel, incommingRoute, UUIDKey, responseCallback, JWToken, ConnMQ) {
  logger.debug({
    fs: 'RestController.js',
    func: 'handleExternalRequest'
  }, "===========Got Message [" + UUIDKey + "]!!!============");
  logger.debug({ fs: 'RestController.js', func: 'handleExternalRequest' }, JSON.stringify(payload, null, 2));
  logger.debug({ fs: 'RestController.js', func: 'handleExternalRequest' }, incommingRoute);

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
    logger.debug({
      fs: 'RestController.js',
      func: 'ResponseCaller'
    }, "===========Sending Out Message [" + UUIDKey + "]!!!============");
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
    logger.debug({ fs: 'RestController.js', func: 'ResponseCaller' }, JSON.stringify(data, null, 2));
    logger.debug({ fs: 'RestController.js', func: 'ResponseCaller' }, "=========== [" + UUIDKey + "]!!! ============");
    if (responderMethod) {
      responderMethod(responseCallback);
    }
    responseCallback.send(data);
    return;
  };
  let route = "";
  try {

    let routeConfigTemp = routeConfiguration[channel][incommingRoute];
    if (routeConfigTemp && routeConfigTemp.isRouteOveride && routeConfigTemp.isRouteOveride === true) {
      if (routeConfigTemp.fieldName && routeConfigTemp.Hierarchy) {
        try {
          route = parseDependencyDataAndExtractValue(payload, routeConfigTemp);
        }
        catch (err) {
          responseCallback.send(errorResponse(" Cannot Extract Route Overide Field", UUIDKey));
          return;
        }

      }
      else {
        responseCallback.send(errorResponse(" Route Configuration invalid for Route Overide", UUIDKey));
        return;
      }
    }
    else {
      route = incommingRoute;
    }

    let routeConfig = routeConfiguration[channel][route];
    logger.debug({
      fs: 'RestController.js',
      func: 'handleExternalRequest'
    }, " [handleExternalRequest] Checking for customMapping");
    if (routeConfig.customMapping === true) {
      logger.debug({
        fs: 'RestController.js',
        func: 'handleExternalRequest'
      }, " [handleExternalRequest] customMapping returned true");
      handleCustomMappingFunction(routeConfig.MappingfunctionName, routeConfig.CustomMappingFile, payload, UUIDKey, route, ResponseCaller, JWToken, responseCallback, routeConfig, channel);
      return;
    }
    logger.debug({
      fs: 'RestController.js',
      func: 'handleExternalRequest'
    }, " [handleExternalRequest] customMapping returned false");
  }
  catch (exp) {
    logger.error(exp);
    responseCallback.send(errorResponse(" Route Configuration invalid", UUIDKey));
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

function parseDependencyDataAndExtractValue(payload, extConfig) {
  let locationPlacement = '';
  if (extConfig.Hierarchy.join('/') === '') {
    locationPlacement = '';
  }
  else {
    locationPlacement = '/' + extConfig.Hierarchy.join('/');
  }
  let obj = "";
  try {
    logger.debug({
      fs: 'RestController.js',
      func: 'parseAndMapResponse'
    }, " [parseAndMapResponse] Fetching Location Placement : " + locationPlacement + '/' + extConfig.fieldName);
    obj = pointer.get(payload, locationPlacement + '/' + extConfig.fieldName);

  }
  catch (exp) {
    logger.debug({ fs: 'RestController.js', func: 'parseAndMapResponse' }, " [parseAndMapResponse] Exception: " + exp);
  }
  return obj;

}

exports.handleExternalRequest = handleExternalRequest;
