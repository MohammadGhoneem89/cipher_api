'use strict';

const logger = require('../api/connectors/logger').app;
let parse = require('fast-json-parse');
let config = require('../../AppConfig');
let routeConfiguration = Object.assign(require('../routeConfig/routeConfiguration.json'), require('../../applications/routeConfig/routeConfiguration.json'));

let customFunctions = require('../Common/customFunctions.js');
let validationFunctions = require('../Common/validationFunctions.js');
let pointer = require('json-pointer');
let MQSend = require('../IntegrationMQ/MQSendResponse.js');
// var grpc = require('grpc');
const apiPayloadRepo = require('../../lib/repositories/apiPayload');
const _ = require('lodash');

let handleExternalRequest = function (payload, channel, incommingRoute, UUIDKey, responseCallback, JWToken, ConnMQ) {
  logger.debug({
    fs: 'RestController.js',
    func: 'handleExternalRequest'
  }, "===========Got Message [" + UUIDKey + "]!!!============");
  logger.debug({ fs: 'RestController.js', func: 'handleExternalRequest' }, JSON.stringify(payload, null, 2));
  logger.debug({ fs: 'RestController.js', func: 'handleExternalRequest' }, incommingRoute);

  let requestData = {
    uuid: UUIDKey,
    channel: channel,
    action: incommingRoute,
    payload: payload
  };

  apiPayloadRepo.create(requestData);

  let ResponseCaller = function (data) {
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
    responseCallback.send(data);
    return;
  };
  let route = "";
  let ignoreAttrib = false;
  let isError = false;
  let errorField = "";
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

    let dependencyResponse = null;
    var RequestJSON = null;

    logger.debug({
      fs: 'RestController.js',
      func: 'handleExternalRequest'
    }, " [handleExternalRequest] Checking for customMapping");
    if (routeConfig.customMapping === true) {
      logger.debug({
        fs: 'RestController.js',
        func: 'handleExternalRequest'
      }, " [handleExternalRequest] customMapping returned true");
      handleCustomMappingFunction(routeConfig.MappingfunctionName, routeConfig.CustomMappingFile, payload, UUIDKey, route, ResponseCaller, JWToken, routeConfig, ConnMQ, channel);
      return;
    }
    logger.debug({
      fs: 'RestController.js',
      func: 'handleExternalRequest'
    }, " [handleExternalRequest] customMapping returned false");

    let mappingConfiguration = require(config.MappingConfig + routeConfig.mappingConfigFile);

    let tranMapping = mappingConfiguration[route];
    var RequestJSON = {};
    logger.debug({
      fs: 'RestController.js',
      func: 'handleExternalRequest'
    }, " [handleExternalRequest] Transforming data and performing validation checks");
    for (let i = 0; i < tranMapping.requestMapping.length; i++) {
      ignoreAttrib = false;
      let leftObjConfigurationMap = tranMapping.requestMapping[i][0];
      let rightObjConfigurationMap = tranMapping.requestMapping[i][1];

      logger.debug({
        fs: 'RestController.js',
        func: 'handleExternalRequest'
      }, " [handleExternalRequest] Mapping data to field");
      let val = "";
      logger.debug({
        fs: 'RestController.js',
        func: 'handleExternalRequest'
      }, " [handleExternalRequest] Extracting Input Value");
      switch (leftObjConfigurationMap.type) {
        case "dependency":
          var tmpVal = parseDependencyDataAndExtractValue(dependencyResponse, leftObjConfigurationMap);
          logger.debug({
            fs: 'RestController.js',
            func: 'handleExternalRequest'
          }, " [handleExternalRequest] Executing Data Conversion");
          val = convert(rightObjConfigurationMap.primitiveType, tmpVal);
          break;
        case "function":
          val = execTrigger(payload, leftObjConfigurationMap);
          break;
        case "execFunctionOnData":
          var tmpVal = parseDataAndExtractValue(payload, leftObjConfigurationMap);
          val = execTrigger(tmpVal, leftObjConfigurationMap);
          break;
        case "UUID":
          logger.debug({
            fs: 'RestController.js',
            func: 'handleExternalRequest'
          }, " [handleExternalRequest] UUIDKey" + UUIDKey);
          val = UUIDKey;
          break;
        case "ignore":
          ignoreAttrib = true;
          break;
        case "data":
          logger.debug({
            fs: 'RestController.js',
            func: 'handleExternalRequest'
          }, " [handleExternalRequest] payload Value " + JSON.stringify(payload));
          var tmpVal = parseDataAndExtractValue(payload, leftObjConfigurationMap);
          logger.debug({
            fs: 'RestController.js',
            func: 'handleExternalRequest'
          }, " [handleExternalRequest] Temp Value " + tmpVal);
          logger.debug({
            fs: 'RestController.js',
            func: 'handleExternalRequest'
          }, " [handleExternalRequest] Executing Data Conversion");
          val = convert(rightObjConfigurationMap.primitiveType, tmpVal);
          break;
        default:
          var tmpVal = leftObjConfigurationMap.value;
          val = tmpVal;// convert(rightObjConfigurationMap.primitiveType, tmpVal);
          break;
      }

      if (ignoreAttrib === true) {
        logger.debug({
          fs: 'RestController.js',
          func: 'handleExternalRequest'
        }, " [handleExternalRequest] Value ignored continuing execution");
        continue;
      }

      logger.debug({
        fs: 'RestController.js',
        func: 'handleExternalRequest'
      }, " [handleExternalRequest] Value Extracted Successfully");
      logger.debug({ fs: 'RestController.js', func: 'handleExternalRequest' }, " [handleExternalRequest] Value: " + val);

      logger.debug({
        fs: 'RestController.js',
        func: 'handleExternalRequest'
      }, " [handleExternalRequest] Executing validation function");

      if (execValidation(val, leftObjConfigurationMap.validationFunction) === true) {
        logger.debug({
          fs: 'RestController.js',
          func: 'handleExternalRequest'
        }, " [handleExternalRequest] Adding value to Request JSON");
        let locationPlacement = '';
        if (rightObjConfigurationMap.Hierarchy.join('/') === '') {
          locationPlacement = '';
        }
        else {
          locationPlacement = '/' + rightObjConfigurationMap.Hierarchy.join('/');
        }

        var obj = {};
        let isObjectPresent = false;
        try {
          logger.debug({
            fs: 'RestController.js',
            func: 'handleExternalRequest'
          }, " [handleExternalRequest] Fetching Location Placement : " + locationPlacement + '/' + rightObjConfigurationMap.fieldName);
          var obj = pointer.get(RequestJSON, locationPlacement + '/' + rightObjConfigurationMap.fieldName);
          isObjectPresent = true;
        }
        catch (exp) {
          logger.debug({
            fs: 'RestController.js',
            func: 'handleExternalRequest'
          }, " [handleExternalRequest] Exception: " + exp);
          isObjectPresent = false;
        }

        if (typeof obj === 'object' && Array.isArray(obj) === true && isObjectPresent === true) {

          if (typeof val === 'object' && Array.isArray(val) === true) {

            logger.debug({
              fs: 'RestController.js',
              func: 'handleExternalRequest'
            }, ' [handleExternalRequest] val: ', val);
            logger.debug({
              fs: 'RestController.js',
              func: 'handleExternalRequest'
            }, ' [handleExternalRequest] Length: ', val.length);

            for (let j = 0, len = val.length; j < len; j++) {
              obj.push(val[j]);
            }

          }
          else {
            obj.push(val);
          }

          pointer.set(RequestJSON, locationPlacement + '/' + rightObjConfigurationMap.fieldName, obj);
        }
        else {
          pointer.set(RequestJSON, locationPlacement + '/' + rightObjConfigurationMap.fieldName, val);
        }

      }
      else {
        errorField += leftObjConfigurationMap.fieldName + " ";
        isError = true;
        // break;
      }

    }

    logger.debug({
      fs: 'RestController.js',
      func: 'handleExternalRequest'
    }, " [handleExternalRequest] UUID Key   " + UUIDKey);
    if (isError === false) {

      if (routeConfig.isAsync === true) {
        logger.debug({
          fs: 'RestController.js',
          func: 'handleExternalRequest'
        }, " [handleExternalRequest] Async True Recieved");
        let ResponseMQ = [];
        ResponseMQ.push(routeConfig.responseQueue);
        RequestJSON.Header.ResponseMQ = ResponseMQ;
        logger.debug({
          fs: 'RestController.js',
          func: 'handleExternalRequest'
        }, "Sending Request to MicroSrvc \n" + JSON.stringify(RequestJSON, null, 2));
        MQSend.MQOut(ConnMQ, routeConfig.requestServiceQueue, RequestJSON);
        var ErrorMessage = "Processed OK";
        var resJS = parseAndMapResponse(RequestJSON, dependencyResponse, tranMapping, ErrorMessage, UUIDKey);
        logger.debug({
          fs: 'RestController.js',
          func: 'handleExternalRequest'
        }, " [handleExternalRequest] JSON: " + JSON.stringify(resJS, null, 2));
        responseCallback.send(resJS);
      }
      else {
        logger.debug({
          fs: 'RestController.js',
          func: 'handleExternalRequest'
        }, " [handleExternalRequest] Async false Recieved");
        var ErrorMessage = "Processed OK";
        sendGRPCRequest(routeConfig.protoFile, routeConfig.GRPCServiceIP + ":" + routeConfig.GRPCServicePort, RequestJSON, UUIDKey, responseCallback, tranMapping, ErrorMessage);
        logger.debug({
          fs: 'RestController.js',
          func: 'handleExternalRequest'
        }, " [handleExternalRequest] Async false ended..");
      }

    }
    else {

      var ErrorMessage = getErrorMessage(errorField);
      logger.debug({
        fs: 'RestController.js',
        func: 'handleExternalRequest'
      }, " [handleExternalRequest] ERROR: " + ErrorMessage);
      var resJS = parseAndMapResponse(RequestJSON, dependencyResponse, tranMapping, ErrorMessage, UUIDKey);
      logger.debug({
        fs: 'RestController.js',
        func: 'handleExternalRequest'
      }, " [handleExternalRequest] JSON: " + JSON.stringify(resJS, null, 2));
      responseCallback.send(resJS);
    }
  }
  catch (exp) {
    logger.error(exp);
    responseCallback.send(errorResponse(" Route Configuration invalid", UUIDKey));
  }

};

var getErrorMessage = function (field) {
  let message = field + ' field is missing or Invalid in the request';
  return message;
};

function parseAndMapResponse(response, dependencyResponse, tranMapping, ErrorMessage, UUIDKey) {

  logger.debug(JSON.stringify(response));

  let ignoreAttrib = false;
  let isError = false;
  let errorField = "";
  let ResponseJSON = {};
  logger.debug({
    fs: 'RestController.js',
    func: 'parseAndMapResponse'
  }, " [parseAndMapResponse] Transforming data and performing validation checks");
  for (let i = 0; i < tranMapping.responseMapping.length; i++) {
    ignoreAttrib = false;
    let leftObjConfigurationMap = tranMapping.responseMapping[i][0];
    let rightObjConfigurationMap = tranMapping.responseMapping[i][1];

    logger.debug({
      fs: 'RestController.js',
      func: 'parseAndMapResponse'
    }, " [parseAndMapResponse] Mapping data to field");
    let val = "";
    logger.debug({
      fs: 'RestController.js',
      func: 'parseAndMapResponse'
    }, " [parseAndMapResponse] Extracting Input Value");
    switch (leftObjConfigurationMap.type) {
      case "dependency":
        var tmpVal = parseDependencyDataAndExtractValue(dependencyResponse, leftObjConfigurationMap);
        logger.debug({
          fs: 'RestController.js',
          func: 'parseAndMapResponse'
        }, " [parseAndMapResponse] Executing Data Conversion");
        val = convert(rightObjConfigurationMap.primitiveType, tmpVal);
        break;
      case "function":
        val = execTrigger(response, leftObjConfigurationMap);
        break;
      case "ignore":
        ignoreAttrib = true;
        break;
      case "execFunctionOnData":
        var tmpVal = parseDataAndExtractValue(payload, leftObjConfigurationMap);
        val = execTrigger(tmpVal, leftObjConfigurationMap);
        break;
      case "UUID":
        val = UUIDKey;
        break;
      case "SuccessFlag":
        if (ErrorMessage === 'Processed OK') {
          val = true;
        }
        else {
          val = false;
        }
        break;
      case "errorCode":
        if (ErrorMessage === 'Processed OK') {
          val = "00";
        }
        else {
          val = "01";
        }
        break;
      case "statusUI":
        if (ErrorMessage === 'Processed OK') {
          val = "OK";
        }
        else {
          val = "ERROR";
        }
        break;
      case "Status":
        if (ErrorMessage === 'Processed OK') {
          val = "OK";
        }
        else {
          val = "FAIL";
        }
        break;
      case "error":
        if (ErrorMessage === '') {
          ignoreAttrib = true;
        }

        val = ErrorMessage;

        logger.debug({
          fs: 'RestController.js',
          func: 'parseAndMapResponse'
        }, " [parseAndMapResponse] Error Message: " + ErrorMessage);
        break;
      case "data":
        var tmpVal = parseDataAndExtractValue(response, leftObjConfigurationMap);
        logger.debug({
          fs: 'RestController.js',
          func: 'parseAndMapResponse'
        }, " [parseAndMapResponse] Executing Data Conversion");
        val = convert(rightObjConfigurationMap.primitiveType, tmpVal);
        break;
      default:
        val = leftObjConfigurationMap.value;
        break;
    }

    if (ignoreAttrib === true) {
      logger.debug({
        fs: 'RestController.js',
        func: 'parseAndMapResponse'
      }, " [parseAndMapResponse] Value ignored continuing execution");
      continue;
    }

    logger.debug({
      fs: 'RestController.js',
      func: 'parseAndMapResponse'
    }, " [parseAndMapResponse] Value Extracted Successfully");
    logger.debug({ fs: 'RestController.js', func: 'parseAndMapResponse' }, " [parseAndMapResponse] Value: " + val);
    logger.debug({
      fs: 'RestController.js',
      func: 'parseAndMapResponse'
    }, " [parseAndMapResponse] Executing validation function");

    if (true) {
      logger.debug({ fs: 'RestController.js', func: 'parseAndMapResponse' }, " [parseAndMapResponse] Validation Success");
      logger.debug({
        fs: 'RestController.js',
        func: 'parseAndMapResponse'
      }, " [parseAndMapResponse] Adding value to Request JSON ");
      let locationPlacement = '';
      if (rightObjConfigurationMap.Hierarchy.join('/') === '') {
        locationPlacement = '';
      }
      else {
        locationPlacement = '/' + rightObjConfigurationMap.Hierarchy.join('/');
      }

      var obj = null;
      try {
        logger.debug({
          fs: 'RestController.js',
          func: 'parseAndMapResponse'
        }, " [parseAndMapResponse] Fetching Location Placement : " + locationPlacement + '/' + rightObjConfigurationMap.fieldName);
        var obj = pointer.get(ResponseJSON, locationPlacement + '/' + rightObjConfigurationMap.fieldName);

      }
      catch (exp) {
        logger.debug({
          fs: 'RestController.js',
          func: 'parseAndMapResponse'
        }, " [parseAndMapResponse] Exception: " + exp);
      }

      if (typeof obj === 'object' && Array.isArray(obj) === true) {
        if (typeof val === 'object' && Array.isArray(val) === true) {
          logger.debug({
            fs: 'RestController.js',
            func: 'parseAndMapResponse'
          }, ' [parseAndMapResponse] Length: ', val.length);

          for (let j = 0, len = val.length; j < len; j++) {
            obj.push(val[j]);
          }
        }
        else {
          obj.push(val);
        }
        pointer.set(ResponseJSON, locationPlacement + '/' + rightObjConfigurationMap.fieldName, obj);

      }
      else {

        pointer.set(ResponseJSON, locationPlacement + '/' + rightObjConfigurationMap.fieldName, val);
      }

    }
    else {
      logger.debug({ fs: 'RestController.js', func: 'parseAndMapResponse' }, " [parseAndMapResponse] Validation Failure");
      errorField += rightObjConfigurationMap.fieldName + " ";
      isError = true;
      // break;
    }

  }

  return ResponseJSON;

}

function sendGRPCRequest(protoFile, srvcAddressNPort, Request, UUIDKey, responseCallback, tranMapping, ErrorMessage) {

  logger.debug({ fs: 'RestController.js', func: 'sendGRPCRequest' }, ' [sendGRPCRequest] protoFile: ' + protoFile);
  logger.debug({
    fs: 'RestController.js',
    func: 'sendGRPCRequest'
  }, ' [sendGRPCRequest] srvc Address and Port: ' + srvcAddressNPort);
  logger.debug({
    fs: 'RestController.js',
    func: 'sendGRPCRequest'
  }, ' [sendGRPCRequest] Request: ' + JSON.stringify(Request, null, 2));

  // var RESTSrvc = grpc.load(protoFile);
  let RESTSrvc = "";
  let client = new RESTSrvc.BLA.BLAService(srvcAddressNPort, grpc.credentials.createInsecure());
  logger.debug({ fs: 'RestController.js', func: 'sendGRPCRequest' }, ' [sendGRPCRequest] Sending query to Micservice');
  client.query(Request, function (error, msg) {

    // printResponse(error, msg);
    if (error) {
      logger.error(error);
      responseCallback.send(errorResponse(" GRPC Connection Failed!!! ", UUIDKey));
    }
    else {

      logger.debug({
        fs: 'RestController.js',
        func: 'sendGRPCRequest'
      }, ' [sendGRPCRequest] Response MSG: ' + JSON.stringify(msg));

      if (msg.Body.success === false) {
        ErrorMessage = msg.Body.result;
      }
      logger.debug({
        fs: 'RestController.js',
        func: 'handleExternalRequest'
      }, " [handleExternalRequest] tranMapping: " + JSON.stringify(tranMapping, null, 2));
      let resJS = parseAndMapResponse(msg, null, tranMapping, ErrorMessage, UUIDKey);
      logger.debug({
        fs: 'RestController.js',
        func: 'handleExternalRequest'
      }, " [handleExternalRequest] JSON: " + JSON.stringify(resJS, null, 2));
      responseCallback.send(resJS);

    }
  });

}

function convert(type, value) {
  let outVal = [];
  let cValue = value;
  logger.debug(' [convert] cValue: ' + typeof (cValue));
  logger.debug(' [convert] cValue: ' + cValue);
  switch (type) {
    case "int":
      outVal = parseInt(cValue);
      break;
    case "float":
      outVal = String(cValue);
      break;
    case "jsonparse":
      outVal = parse(cValue);
      break;
    case "array":
      if (typeof (cValue) === 'string') {
        outVal.push(cValue);
      }
      else {
        outVal = cValue;
      }
      break;
    default:
      outVal = String(cValue);
  }
  return outVal;
}

function handleCustomMappingFunction(MappingfunctionName, CustomMappingFile, payload, UUIDKey, route, callback, JWToken, routeConfig, MQConn, channel) {
  logger.debug({
    fs: 'RestController.js',
    func: 'handleCustomMappingFunction'
  }, " [handleCustomMappingFunction] MappingfunctionName : " + MappingfunctionName);
  try {
    let fileLoc = (routeConfiguration[channel]['CustomFunctionsLocation'] || config.CustomFunctionsLocation) + CustomMappingFile;
    console.log(fileLoc);
    logger.debug({
      fs: 'RestController.js',
      func: 'handleCustomMappingFunction'
    }, " [handleCustomMappingFunction] Loading File : " + fileLoc);
    let mappingFunctions = require(fileLoc);
    logger.debug({
      fs: 'RestController.js',
      func: 'handleCustomMappingFunction'
    }, " [handleCustomMappingFunction] Loaded Successfully for execution File : " + CustomMappingFile);
    logger.debug({
      fs: 'RestController.js',
      func: 'handleCustomMappingFunction'
    }, " [handleCustomMappingFunction] Calling Mapping function from Custom functions : " + MappingfunctionName);
    let outVal = mappingFunctions[MappingfunctionName](payload, UUIDKey, route, callback, JWToken, routeConfig, MQConn);
    logger.debug({
      fs: 'RestController.js',
      func: 'handleCustomMappingFunction'
    }, " [handleCustomMappingFunction] Sending Out Message : " + JSON.stringify(outVal, null, 2));
    return outVal;
  }
  catch (exp) {
    logger.error(exp);
    // return errorResponse(exp,UUIDKey);
  }
}

function errorResponse(exp, UUIDKey) {
  let response = {
    success: false,
    message: "Error: " + exp,
    UUID: UUIDKey
  };
  return response;
}

function execTrigger(payload, extConfig) {
  logger.debug({
    fs: 'RestController.js',
    func: 'execTrigger'
  }, " [execTrigger] Calling function from Custom functions Config Recieved : " + JSON.stringify(extConfig));
  logger.debug({
    fs: 'RestController.js',
    func: 'execTrigger'
  }, " [execTrigger] Calling function from Custom functions : " + extConfig.functionName);
  let outVal = customFunctions[extConfig.functionName](payload);
  return outVal;
}

function execValidation(value, functionName) {
  logger.debug({
    fs: 'RestController.js',
    func: 'execTrigger'
  }, " [execValidation] Calling function from validation functions : " + functionName);
  let outVal = validationFunctions[functionName](value);
  return outVal;
}

function parseDataAndExtractValue(payload, extConfig) {
  let locationPlacement = '';
  if (extConfig.Hierarchy.join('/') === '') {
    locationPlacement = '';
  }
  else {
    locationPlacement = '/' + extConfig.Hierarchy.join('/');
  }

  var obj = "";
  try {
    logger.debug({
      fs: 'RestController.js',
      func: 'parseAndMapResponse'
    }, " [parseAndMapResponse] Fetching Location Placement : " + locationPlacement + '/' + extConfig.fieldName);
    var obj = pointer.get(payload, locationPlacement + '/' + extConfig.fieldName);

  }
  catch (exp) {
    logger.debug({ fs: 'RestController.js', func: 'parseAndMapResponse' }, " [parseAndMapResponse] Exception: " + exp);
  }

  return obj;

}

function parseDependencyDataAndExtractValue(payload, extConfig) {
  let locationPlacement = '';
  if (extConfig.Hierarchy.join('/') === '') {
    locationPlacement = '';
  }
  else {
    locationPlacement = '/' + extConfig.Hierarchy.join('/');
  }

  var obj = "";
  try {
    logger.debug({
      fs: 'RestController.js',
      func: 'parseAndMapResponse'
    }, " [parseAndMapResponse] Fetching Location Placement : " + locationPlacement + '/' + extConfig.fieldName);
    var obj = pointer.get(payload, locationPlacement + '/' + extConfig.fieldName);

  }
  catch (exp) {
    logger.debug({ fs: 'RestController.js', func: 'parseAndMapResponse' }, " [parseAndMapResponse] Exception: " + exp);
  }
  return obj;

}

exports.handleExternalRequest = handleExternalRequest;
