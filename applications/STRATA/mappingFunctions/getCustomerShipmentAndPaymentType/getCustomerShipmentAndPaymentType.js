/* eslint-disable eol-last */
/* eslint-disable no-console */
'use strict';

const { findOneAsync } = require('../customerAssociation/index.js');

function getCustomerShipmentAndPaymentType(payload, UUIDKey, route, callback, JWToken) {
  let palyd = payload;
  if (JWToken._id) { palyd.data.userId = JWToken._id; }
  findOneAsync(callback, palyd).then((res) => {
    console.log(res, "++++ RES");
    let response = {
      [payload.action]: {
        customerType: res[payload.action].data.customerType,
        paymentType: res[payload.action].data.paymentType,
        shipmentType: res[payload.action].data.shipmentType,
        purchaseOrderType: res[payload.action].data.purchaseOrderType
      }
    };
    return callback(response);
  }).catch((err) => {
    return err;
  });
}
exports.getCustomerShipmentAndPaymentType = getCustomerShipmentAndPaymentType;