'use strict';

const _ = require('lodash');
const moment = require('moment');
const dates = require('../../../lib/helpers/dates');
module.exports = {

  transformDataStructure: (data, payload, jwt, config) => {
    let outVal = {
      dsName: config.IN_FIELD.replace("body.", ""),
      arguments: data
    };
    return outVal;
  }

};
