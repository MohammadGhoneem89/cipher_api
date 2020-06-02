'use strict';

const common = require('./common');
const user = require('./user');

const get = {
  properties: {
    action: common.action,
    userID: user.userID
  }
};

const getURI = {
  properties: {
    URI: common.URI,
    userID: user.userID
  }
};

module.exports = {
  get,
  getURI
};
