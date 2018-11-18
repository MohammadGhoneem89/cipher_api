'use strict';

const logger = require('../api/connectors/logger').app;
const _ = require('lodash');
const config = require('../../AppConfig');
const apiPayloadRepo = require('../../lib/repositories/apiPayload');
const GeneralRequestProcessor = require('./requestProcessor');
const constants = require('../Common/constants_en.js');
const ObjectMapper = require('./objectMapper');
const OldRestController = require('./_RestController');

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
  let configdata = _.get(global.routeConfig, `${channel}.${incommingRoute}`, null);
  if (!configdata) {
    console.log(`Route ${channel}.${incommingRoute}`);

    /*  let successStatus = false;
    let responseObj = {
      __cipherSuccessStatus: successStatus,
      __cipherMessage: "Request Configuration not found",
      __cipherUIErrorStatus: constants.cipherUIFailure,
      __cipherExternalErrorStatus: constants.cipherExternalFailure,
      __cipherMetaData: constants.errRequestParsing
    };
    //return ResponseCaller(responseObj); */
    return OldRestController.handleExternalRequest(payload, channel, incommingRoute, UUIDKey, responseCallback, JWToken, ConnMQ);
  }
  let millisecondsstart = (new Date()).getTime();
  let Cipher = new GeneralRequestProcessor(payload, configdata, UUIDKey, global.enumInfo, JWToken);
  Cipher.processIncommingMessage().then((response) => {
    if (configdata.isResValBypass === false) {
      let successStatus = true;
      if (!response.__cipherMessage) {
        _.set(response, '__cipherSuccessStatus', successStatus);
        _.set(response, '__cipherMessage', constants.cipherGeneralSuccess);
        _.set(response, '__cipherUIErrorStatus', constants.cipherUISuccess);
        _.set(response, '__cipherExternalErrorStatus', constants.cipherExternalSuccess);
      };
      let objMapper = new ObjectMapper(response, configdata.ResponseMapping, global.enumInfo, UUIDKey);
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
    let millisecondsend = (new Date()).getTime();
    logger.error({ fs: 'RestController.js', func: 'handleExternalRequest' }, `Message Processed In:  ${(millisecondsend - millisecondsstart)} ms`);
    logger.error({ fs: 'RestController.js', func: 'handleExternalRequest' }, "Response Recieved: " + JSON.stringify(data));
  });
};

exports.handleExternalRequest = handleExternalRequest;
