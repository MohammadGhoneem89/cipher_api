'use strict';

const _ = require('lodash');
const moment = require('moment');
const dates = require('../../../lib/helpers/dates');
module.exports = {

  transformDataStructure: (data, payload, jwt, config) => {
    if (data) {
      let outVal = {
        dsName: config.IN_FIELD.replace("body.", ""),
        arguments: data
      };
      return outVal;
    }
    return undefined;

  },
  appendPrefixDS: (data, payload, jwt, config) => {
    return "DS_" + data;
  },
  appendPrefixDynamic: (data, payload, jwt, config) => {
    return _.get(payload, 'body.prefix', '') + data;
  }
};
