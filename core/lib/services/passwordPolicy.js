'use strict';

const _ = require('lodash');
const validator = require('../validator');
const passwordPolicyRepo = require('../repositories/passwordPolicy');
const permissionsHelper = require('../helpers/permissions');
const permissionConst = require('../constants/permissions');
const common = require('../../lib/helpers/common');


module.exports = {
  create,
  update,
  fetchAll
};


function create(payload) {
  return validator.errorValidate(payload, validator.schemas.passwordPolicy.createPasswordObject)
    .then(() => passwordPolicyRepo.create(payload))
}

function update(payload) {
  payload.minimumPasswordLength = parseInt(payload.minimumPasswordLength);
  payload.maximumPasswordLength = parseInt(payload.maximumPasswordLength);
  payload.minimumAlphabetCount = parseInt(payload.maximumPasswordLength);
  payload.maximumAlphabetCount = parseInt(payload.maximumAlphabetCount);
  payload.minimumDigitCount = parseInt(payload.minimumDigitCount);
  payload.maximumDigitCount = parseInt(payload.maximumDigitCount);
  payload.allowIncorrectLoginAttempts = parseInt(payload.allowIncorrectLoginAttempts);
  payload.minimumUpperCase = parseInt(payload.minimumUpperCase);
  payload.minimumLowerCase = parseInt(payload.minimumLowerCase);
  payload.lockTimeInMinutes = parseInt(payload.lockTimeInMinutes);
  // payload.unAcceptedKeywords =  payload.unAcceptedKeywords;
  payload.changePeriodDays = parseInt(payload.changePeriodDays);
  return validator.errorValidate(payload, validator.schemas.passwordPolicy.updatePasswordObject)
    .then(() => passwordPolicyRepo.update(payload));
}

function fetchAll(payload) {

  const response = {};
  return passwordPolicyRepo.fetchAll()
    .then((res) => {
      const params = {
        userId: payload.userId,
        documents: res,
        docType: 'actions',
        page: permissionConst.fetchAllPasswordPolicy.pageId,
        component: ''
      };
      return permissionsHelper.embed(params);
    }).then((res) => {
      response.data = _.get(res, 'documents', []);
      response.actions = _.get(res, 'pageActions', []);
      return response;
    });


}