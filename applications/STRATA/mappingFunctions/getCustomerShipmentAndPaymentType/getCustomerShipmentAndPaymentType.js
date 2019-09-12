/* eslint-disable eol-last */
/* eslint-disable no-console */
'use strict';

const { findOneAsync } = require('../customerAssociation/index.js');

function getCustomerShipmentAndPaymentType(payload, UUIDKey, route, callback, JWToken) {
  console.log(payload);
  findOneAsync(callback, payload).then((res) => {
    let response = {
      [payload.action]: {
        customerType: res[payload.action].data.customerType,
        paymentType: res[payload.action].data.paymentType,
        shipmentType: res[payload.action].data.shipmentType
      }
    }
    return callback(response);
  }).catch((err) => {
    return err;
  })
}
exports.getCustomerShipmentAndPaymentType = getCustomerShipmentAndPaymentType;