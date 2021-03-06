'use strict';

const _ = require('lodash');
const constants = require('../Common/constants_en.js');
const ObjectMapper = require('./objectMapper');
const Dispatcher = require('./dispatcher');

module.exports = class GeneralRequestProcessor {
  constructor(req, configdata, typeData, UUID, JWTokenData) {
    this.request = req;
    this.configdata = configdata;
    this.typeData = typeData;
    this.UUID = UUID;
    this.JWTokenData = JWTokenData;
  }

  processIncommingMessage() {
    return new Promise((resolve, reject) => {
      let promiseList = [];
      let objMapper = new ObjectMapper(this.request, this.configdata.RequestMapping, global.enumInfo, this.UUID, this.JWTokenData, 'Request', this.configdata.RequestTransformations);
      if (this.configdata.isValBypass === false) {
        promiseList.push(objMapper.start());
      }
      Promise.all(promiseList).then((data) => {
        let message;
        if (data.length > 0) {
          message = data[0];
        } else {
          message = this.request;
        }

        let controller = new Dispatcher(this.request, message, this.configdata, this.UUID, global.enumInfo, this.JWTokenData);
        return controller.SendGetRequest().then((response) => {
          if (response.success || response.error === false) {
            resolve(response);
          } else {
            let responseObj = {
              __cipherSuccessStatus: false,
              __cipherMessage: response.message || "Some unknown error occured, please check logs",
              __cipherUIErrorStatus: constants.cipherUIFailure,
              __cipherExternalErrorStatus: constants.cipherExternalFailure,
              __cipherMetaData: constants.errRequestParsing,
              ...response
            };
            _.set(responseObj, 'success', undefined);
            _.set(responseObj, 'message', undefined);
            resolve(responseObj);
          }


        });
      }).catch((ex) => {
        let successStatus = false;
        let simuStatus = this.configdata.isSimulated === true;
        let responseObj = {};
        if (simuStatus) {
          _.set(responseObj, 'messageStatus', constants.cipherUIFailure);
          _.set(responseObj, 'errorDescription', ex.message || ex);
          _.set(responseObj, config.get('responseMessageAttribute',"cipherMessageId"), this.UUID);
          _.set(responseObj, 'errorCode', constants.cipherExternalSuccess);
          _.set(responseObj, 'timestamp', new Date().toISOString());
        } else {
          responseObj = {
            __cipherSuccessStatus: successStatus,
            __cipherMessage: ex.message || ex,
            __cipherUIErrorStatus: constants.cipherUIFailure,
            __cipherExternalErrorStatus: constants.cipherExternalFailure,
            __cipherMetaData: constants.errRequestParsing
          };
        }
        resolve(responseObj);
      });
    });
  }
};

