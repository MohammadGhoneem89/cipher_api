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
const pg = require('../api/connectors/postgress');
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

  if (apiFilter.indexOf(incommingRoute) >= 0) {
    _.set(payload, 'body.password', undefined);
    _.set(payload, 'JWToken', undefined)
    _.set(payload, 'JWT', undefined)
    let requestData = {
      uuid: UUIDKey,
      channel: channel,
      action: incommingRoute,
      payload: payload,
      createdat: Date.now()
    };

  }

  let ResponseCaller = function (data) {
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

      txTracking.create(UUIDKey, channel, incommingRoute, payload, {}, delta, data.stack, configdata.estimatedRtt);

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
    if (apiFilter.indexOf(incommingRoute) >= 0) {
      txTracking.create(UUIDKey, channel, incommingRoute, payload, data, delta, undefined, configdata.estimatedRtt);
    }

    logger.error({
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
      ;
      let objMapper = new ObjectMapper(response, configdata.ResponseMapping, global.enumInfo, UUIDKey, JWToken, 'Response', configdata.ResponseTransformations);
      return objMapper.start().then((mappedData) => {
        return mappedData;
      }).catch((ex) => {
        let errResponse = {};
        _.set(errResponse, '__cipherSuccessStatus', successStatus);
        _.set(errResponse, '__cipherMessage', ex);
        _.set(errResponse, '__cipherMetaData', constants.errResponseParsing);
        return errResponse;
      });
    }
    return response;
  }).then((data) => {
    ResponseCaller(data);
  });
}

exports.handleExternalRequest = handleExternalRequest;
