'use strict';

const _ = require('lodash');
const moment = require('moment');
module.exports = {
  STUB: (data, payload, jwt) => {
    return data;
  },
  getDate: (data, payload, jwt) => {
    let format = 'YYYY/MM/DD HH:mm:ss ZZ';
    return moment().format(format);
  }
};
