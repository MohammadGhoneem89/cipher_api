'use strict';

const validator = require('../validator');
const dates = require('../helpers/dates');
const config = require('../../config');
const appConfig = config._instance;
const request = require('request-promise');
const auditLogRepo = require('../repositories/auditLog');

module.exports = {
  entity,
  acquirer
};

function entity(payload) {
  let initOptions;
  let reconOptions;
  return validator.errorValidate(payload, validator.schemas.reconcile.entity)
    .then(() => {
      payload.data = Object.assign({ timestamp: dates.newDateStr() }, payload.data);
      initOptions = {
        method: 'POST',
        uri: `${config.get('URLRestInterface')}APII/Cipher/initiateTransaction`,
        body: { header: appConfig.authentications.avanzaISC, body: Object.assign({ transactionStatus: 'Initiated' }, payload.data) },
        json: true
      };
      return request(initOptions);
    })
    .then(() => {
      reconOptions = {
        method: 'POST',
        uri: `${config.get('URLRestInterface')}APII/Cipher/reconcileTransaction`,
        body: { header: appConfig.authentications.avanzaISC, body: Object.assign({ transactionStatus: 'Reconciled' }, payload.data) },
        json: true
      };
      return Promise.all([
        request(reconOptions),
        auditLogRepo.create({ event: 'UPDATE', collectionName: 'Manual Reconcile', current: initOptions.body, createdBy: payload.userID, ipAddress: payload.ipAddress })
      ]);
    })
    .then(() => {
      return auditLogRepo.create({ event: 'UPDATE', collectionName: 'Manual Reconcile', current: reconOptions.body, createdBy: payload.userID, ipAddress: payload.ipAddress });
    });
}

function acquirer(payload) {
  let options;
  return validator.errorValidate(payload, validator.schemas.reconcile.acquirer)
    .then(() => {
      payload.data = Object.assign({ timestamp: dates.newDateStr(), action: 'Authorized' }, payload.data);
      options = {
        method: 'POST',
        uri: `${config.get('URLRestInterface')}APII/Cipher/UpdateTranStatusAcq`,
        body: { header: appConfig.authentications.avanzaISC, body: Object.assign({ action: 'Authorized' }, payload.data) },
        json: true
      };
      return request(options);
    })
    .then(() => {
      return auditLogRepo.create({ event: 'UPDATE', collectionName: 'Manual Reconcile', current: options.body, createdBy: payload.userID, ipAddress: payload.ipAddress });
    });
}
