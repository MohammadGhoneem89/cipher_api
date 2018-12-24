'use strict';

const validator = require('../validator');
const apiPayloadRepo = require('../repositories/apiPayload');
const permissionConst = require('../constants/permissions');
const _ = require('lodash');
const permissionsHelper = require('../helpers/permissions');
const dates = require('../helpers/dates');
const transConst = require('../constants/transactions');
const requestPromise = require('request-promise');
const config = require('../../config');
const logger = require('../helpers/logger')();

module.exports = {
  getList,
  getDetails,
  replayList
};

function getList(payload) {
  let count = 0;
  return validator.validate(payload, validator.schemas.apiPayload.get)
    .then(() => apiPayloadRepo.findPageAndCount(payload))
    .then((res) => {
      count = res[1];
      const params = {
        userId: payload.userId,
        documents: res[0],
        docType: 'actions',
        page: permissionConst.apiPayloadList.pageId,
        component: permissionConst.apiPayloadList.component.searchGrid
      };
      return permissionsHelper.embed(params);
    })
    .then((res) => {
      const response = {};
      response.count = count;
      response.list = _.get(res, 'documents', []);
      response.actions = _.get(res, 'pageActions', []);
      for (const list of response.list) {
        list.createdAt = dates.MSddMMyyyy(list.createdAt);
      }
      return response;
    });
}

function getDetails(payload) {
  return validator.validate(payload, validator.schemas.apiPayload.details)
    .then(() => {
      return apiPayloadRepo.findOne({ _id: payload.id });
    });
}

function replayList(payload) {
  return validator.validate(payload, validator.schemas.apiPayload.replay)
    .then(() => {
      payload.fromDate = dates.ddMMyyyyHHmmSSMS(payload.fromDate);
      payload.toDate = dates.ddMMyyyyHHmmSSMS(payload.toDate);
      const query = { action: { $in: transConst.actions }, createdAt: { $gte: payload.fromDate, $lte: payload.toDate } };
      return apiPayloadRepo.find(query);
    })
    .then((res) => {
      return startReplay(res);
    });

  function startReplay(params) {
    if (!params || !params.length) {
      return Promise.resolve({ message: 'success' });
    }
    const param = params.splice(0, 1)[0];
    const options = {
      method: 'POST',
      uri: `${config.get('URLRestInterface')}APII/${param.channel}/${param.action}`,
      body: param.payload,
      json: true
    };
    return requestPromise(options)
      .then((res) => {
        if (!res.messageStatus) {
          logger.app.error('replay error occurred ', res);
        }
        return startReplay(params);
      })
      .catch((err) => {
        logger.app.error('replay error occurred ', err);
        return startReplay(params);
      });
  }

}
