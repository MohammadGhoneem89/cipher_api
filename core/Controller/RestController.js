'use strict';
const logger = require('../api/connectors/logger').app;
const _ = require('lodash');
const Stopwatch = require('statman-stopwatch');
const config = require('../../config');
const apiPayloadRepo = require('../../lib/repositories/apiPayload');
const GeneralRequestProcessor = require('./requestProcessor');
const constants = require('../Common/constants_en.js');
const ObjectMapper = require('./objectMapper');
const OldRestController = require('./_RestController');
const APIDefination = require('../mappingFunctions/systemAPI/APIDefination');
const dates = require('../../lib/helpers/dates');
const apiFilter = config.get('apiFilters') || [];
const sprintf = require('sprintf-js').sprintf,
  vsprintf = require('sprintf-js').vsprintf
const txTracking = require('../api/txTracking');
let handleExternalRequest = function (payload, channel, incommingRoute, UUIDKey, responseCallback, JWToken, ConnMQ) {
  let sw = new Stopwatch();
  sw.start();
  logger.debug({
    fs: 'RestController.js',
    func: 'handleExternalRequest'
  }, "===========Got Message [" + UUIDKey + "]!!!============");
  logger.debug({fs: 'RestController.js', func: 'handleExternalRequest'}, JSON.stringify(payload, null, 2));
  logger.debug({fs: 'RestController.js', func: 'handleExternalRequest'}, incommingRoute);

  let configdata = _.get(global.routeConfig, `${channel}.${incommingRoute}`, null);
  let username = _.get(JWToken, `userID`, 'No User');
  let orgcode = _.get(JWToken, `orgCode`, 'No Org');
  _.get(global.routeConfig, `${channel}.${incommingRoute}`, null);
  let eRRTBasic = _.get(configdata, 'estimatedRtt', 10000)
  let ResponseCaller = function (data) {
    data = enrichError(data);
    let delta = sw.read();
    sw.reset();
    logger.debug({
      fs: 'RestController.js',
      func: 'ResponseCaller'
    }, "===========Sending Out Message [" + UUIDKey + "]!!!============");
    data = data || {};
    if (data.stack) {
      let error = {
        "messageStatus": "ERROR",
        "cipherMessageId": UUIDKey,
        "errorDescription": 'some error occured!!!!',
        "errorCode": 201,
        "timestamp": dates.DDMMYYYYHHmmssSSS(new Date)
      };
      // console.log(data.stack)
      txTracking.create(UUIDKey, channel, incommingRoute, payload, {}, delta, data.stack, eRRTBasic, username, orgcode);
      responseCallback.status(500);
      responseCallback.json(error);
      return responseCallback.end();
    }
    logger.debug({fs: 'RestController.js', func: 'ResponseCaller'}, "=========== [" + UUIDKey + "]!!! ============");
    let apiSample = _.cloneDeep(payload);
    if (_.get(apiSample, '_apiRecorder', false) === true) {
      apiSample = _.omit(apiSample, 'token', 'action', 'channel', 'ipAddress', '_apiRecorder', 'JWToken', 'header', 'CipherJWT');
      APIDefination.updateRequestStub(apiSample, incommingRoute, channel);
    }

    let ss = _.get(data, '__cipherUIErrorStatus', undefined);
    if (ss && ss == 'ERROR') {
      let error = _.get(data, '__cipherMessage', undefined);
      data = {
        "messageStatus": ss,
        "cipherMessageId": UUIDKey,
        "errorDescription": error,
        "errorCode": 201,
        "timestamp": new Date().toISOString()
      };
    }
    let errCode = _.get(data, 'errorCode', 200);
    if ((apiFilter.indexOf(incommingRoute) >= 0) || (configdata && configdata.isTracked) || errCode != 200) {
      txTracking.create(UUIDKey, channel, incommingRoute, payload, data, delta, undefined, eRRTBasic, username, orgcode, errCode);
    }
    logger.info({
      fs: 'RestController.js',
      func: 'handleExternalRequest'
    }, `Message Processed In:  ${delta} ms`);


    return responseCallback.json(data);
    // responseCallback.end();
  };
  if (!configdata) {
    console.log(`Route ${channel}.${incommingRoute}`);
    return OldRestController.handleExternalRequest(payload, channel, incommingRoute, UUIDKey, ResponseCaller, JWToken, ConnMQ, responseCallback);
  }
  _.set(payload, '__JWTORG', JWToken.orgCode);
  let Cipher = new GeneralRequestProcessor(payload, configdata, global.enumInfo, UUIDKey, JWToken);
  Cipher.processIncommingMessage().then((response) => {
    let bypassSimu = _.get(payload, 'bypassSimu', false);
    let simuStatus = configdata.isSimulated === true && bypassSimu === false;
    if (configdata.isResValBypass === false && simuStatus === false) {
      let successStatus = true;
      if (!response.__cipherMessage) {
        _.set(response, '__cipherSuccessStatus', successStatus);
        _.set(response, '__cipherMessage', constants.cipherGeneralSuccess);
        _.set(response, '__cipherUIErrorStatus', constants.cipherUISuccess);
        _.set(response, '__cipherExternalErrorStatus', constants.cipherExternalSuccess);
      }

      let objMapper = new ObjectMapper(response, configdata.ResponseMapping, global.enumInfo, UUIDKey, JWToken, 'Response', configdata.ResponseTransformations);
      return objMapper.start().then((mappedData) => {
        return mappedData;
      }).catch((ex) => {
        let errResponse = {};
        if (simuStatus) {
          _.set(errResponse, 'messageStatus', constants.cipherUIFailure);
          _.set(errResponse, 'errorDescription', ex.message || ex);
          _.set(errResponse, 'cipherMessageId', this.UUID);
          _.set(errResponse, 'errorCode', constants.cipherExternalSuccess);
          _.set(errResponse, 'timestamp', new Date().toISOString());
          _.set(errResponse, 'parsingError', constants.errResponseParsing);
        } else {
          _.set(errResponse, '__cipherSuccessStatus', successStatus);
          _.set(errResponse, '__cipherMessage', ex);
          _.set(errResponse, '__cipherMetaData', constants.errResponseParsing);
        }
        return errResponse;
      });
    }
    _.set(response, 'error', undefined);
    _.set(response, 'success', undefined);
    _.set(response, 'message', undefined);
    return response;
  }).then((data) => {

    ResponseCaller(data);
  });
}

function enrichError(response, successStatus = true) {
  let errCode = _.get(response, 'result.errorCode', undefined);
  if (!errCode) {
    errCode = _.get(response, 'errorCode', undefined);
  }

  let options = _.get(response, 'result.options', undefined);
  if (!options) {
    options = _.get(response, 'options', undefined);
  }
  let errMsg = _.get(global.codelist, errCode, '');
  if (errCode && errMsg) {
    _.set(response, 'errorCode', parseInt(errCode, 10));
    _.set(response, 'errorDescription', vsprintf(errMsg, options));
  }
  return response;
}

exports.handleExternalRequest = handleExternalRequest;
