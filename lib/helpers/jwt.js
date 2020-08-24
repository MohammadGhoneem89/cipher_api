'use strict';

const crypto = require('./crypto');
const dates = require('../helpers/dates');
const uuid = require('uuid/v1');
const _ = require('lodash');
module.exports = {
  create: create,
  createBasic: createBasic
};

function createBasic(user) {
  const jwt = {
    _id: user._id,
    userType: user.userType,
    userID: user.userID,
    orgType: user.orgType,
    hypUser: user.hypUser,
    quorrumUser: user.quorrumUser,
    orgCode: user.orgCode || '',
    isNewUser: user.isNewUser || false,
    createdAt: dates.newDate()
  };
  return crypto.encryptEx(jwt);

}

function create(user, sessionId = undefined, lang = 'EN') {
  return new Promise((res, rej) => {
    global.db.select("Entity", { spCode: user.orgCode }, "", function (err, data) {
      if (err) {
        console.log(" [Entity Detail] Error : " + err);
      }
      let HmacPvtKey = _.get(data, '[0].publicKey', undefined)
      let clientKey = _.get(data, '[0].clientKey', undefined)
      const jwt = {
        _id: user._id,
        userType: user.userType,
        userID: user.userID,
        orgType: user.orgType,
        hypUser: user.hypUser,
        quorrumUser: user.quorrumUser,
        orgCode: user.orgCode || '',
        isNewUser: user.isNewUser || false,
        createdAt: dates.newDate(),
        HmacPvtKey: HmacPvtKey,
        clientKey: clientKey,
        sessionId,
        lang
      };

      res(crypto.encryptEx(jwt));
    });
  });
}
