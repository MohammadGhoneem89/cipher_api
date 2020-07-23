'use strict';

const logger = require('../api/connectors/logger').app;
let routeConfiguration = Object.assign(require('../routeConfig/routeConfiguration.json'), require('../../applications/routeConfig/routeConfiguration.json'));
const _ = require('lodash');

let handleExternalRequest = function (payload, channel, route, UUIDKey, ResponseCaller, JWToken, ConnMQ, res) {
  try {
    let routeConfig = routeConfiguration[channel][route];
    if (routeConfig.customMapping === true) {
      handleCustomMappingFunction(routeConfig.MappingfunctionName, routeConfig.CustomMappingFile, payload, UUIDKey, route, ResponseCaller, JWToken, res, routeConfiguration, channel, res);
      return;
    }
    ResponseCaller(errorResponse("custom mapping must be true", UUIDKey));
  } catch (exp) {
    console.log(exp);
    return ResponseCaller(errorResponse(" Route Configuration invalid", UUIDKey));
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
