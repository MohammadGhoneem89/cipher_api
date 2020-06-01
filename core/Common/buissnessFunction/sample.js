/* eslint-disable eqeqeq */
/* eslint-disable no-console */
'use strict';

const _ = require('lodash');
const moment = require('moment');
const dates = require('../../../lib/helpers/dates');
const org = require('../../mappingFunctions/org/orgList');
const user = require('../../../lib/repositories/user');
const uuid = require('uuid/v1');

module.exports = {
  jsonParseNoError: (data, payload, jwt) => {
    try {
      return JSON.parse(data);
    } catch (ex) {
      console.log(ex);
      return {};
    }
  }
}
