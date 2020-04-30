'use strict';

const logger = require('../api/connectors/logger').app;
const _ = require('lodash');
const config = require('../../config');
const apiPayloadRepo = require('../../lib/repositories/apiPayload');
const GeneralRequestProcessor = require('./requestProcessor');
const constants = require('../Common/constants_en.js');
const ObjectMapper = require('./objectMapper');
const OldRestController = require('./_RestController');
const APIDefination = require('../mappingFunctions/systemAPI/APIDefination');
const apiFilter = config.get('apiFilters') || [];
const pg = require('../api/connectors/postgress');

let handleExternalRequest = function (payload, channel, incommingRoute, UUIDKey, responseCallback, JWToken, ConnMQ) {

  logger.debug({
    fs: 'RestController.js',
    func: 'handleExternalRequest'
  }, "===========Got Message [" + UUIDKey + "]!!!============");
  logger.debug({fs: 'RestController.js', func: 'handleExternalRequest'}, JSON.stringify(payload, null, 2));
  logger.debug({fs: 'RestController.js', func: 'handleExternalRequest'}, incommingRoute);

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

    let apiplquery = `INSERT into "apipayload" ("uuid", "channel", "action", "payload", "createdat") VALUES($1, $2, $3, $4, now())`;
    let params = [requestData.uuid, requestData.channel, requestData.action, requestData.payload];
    pg.connection().then(async (conn) => {
      let res = await conn.query(apiplquery, params);
      logger.debug({fs: 'RestController.js', func: 'handleExternalRequest'}, apiplquery);
      console.log("Query response: ", res);
    });
  }

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
      responseCallback.json(error);
      return responseCallback.end();
    }
    //logger.debug({ fs: 'RestController.js', func: 'ResponseCaller' }, JSON.stringify(data, null, 2));
    logger.debug({fs: 'RestController.js', func: 'ResponseCaller'}, "=========== [" + UUIDKey + "]!!! ============");
    let apiSample = _.cloneDeep(payload);
    if (_.get(apiSample, '_apiRecorder', false) === true) {
      apiSample = _.omit(apiSample, 'token', 'action', 'channel', 'ipAddress', '_apiRecorder', 'JWToken', 'header', 'CipherJWT');
      APIDefination.updateRequestStub(apiSample, incommingRoute, channel);
    }
    responseCallback.json(data);
    return responseCallback.end();
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
  console.log('__JWTORG>>>>>>>>>>>>>>>>>>>>>>' + JWToken.orgCode)
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
    let millisecondsend = (new Date()).getTime();
    logger.error({
      fs: 'RestController.js',
      func: 'handleExternalRequest'
    }, `Message Processed In:  ${(millisecondsend - millisecondsstart)} ms`);
    //  logger.error({ fs: 'RestController.js', func: 'handleExternalRequest' }, "Response Recieved: " + JSON.stringify(data));
  });
};

exports.handleExternalRequest = handleExternalRequest;
