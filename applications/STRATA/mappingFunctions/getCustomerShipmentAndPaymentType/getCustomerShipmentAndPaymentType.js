/* eslint-disable eol-last */
/* eslint-disable no-console */
'use strict';

const { findOneAsync } = require('../customerAssociation/index.js');

function getCustomerShipmentAndPaymentType(payload, UUIDKey, route, callback, JWToken) {
  const userID = JWToken._id;
  const request = {
    data: {
      userId: userID
    }
  }
  console.log("PAYLOAD --- >> ", payload, "\n", "JWToken --->> ", JWToken._id);
  findOneAsync(callback, request).then((res) => {
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