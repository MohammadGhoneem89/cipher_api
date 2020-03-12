'use strict';

const _ = require('lodash');
const moment = require('moment');
const dates = require('../../lib/helpers/dates');
const inst = require('./buissnessFunction/instrument.js');
const ds = require('./buissnessFunction/datastructure');
module.exports = {
  STUB: (data, payload, jwt) => {
    return data;
  },
  ...ds,
  ...inst,
  getDate: (data, payload, jwt) => {
    let format = 'YYYY/MM/DD HH:mm:ss ZZ';
    return moment().format(format);
  },
  translateDateToEpoch: (data, payload, jwt) => {
    return dates.ddMMyyyyslash(data);
  },
  ddMMyyyy: (data, payload, jwt) => {
    return dates.ddMMyyyyMS(data);
  },
  ddMMyyyyformat: (data, payload, jwt) => {
    let e = parseInt(data) / 1000
    return dates.waslDateformat(e);
  },

  MSddMMyyyyHHmmS: (data, payload, jwt) => {
    return dates.MSddMMyyyyHHmmS(data);
  },
  convertStringToFloat: (data, payload, jwt) => {
    let number = parseFloat(data);
    if (isNaN(number)) {
      throw new Error("Could not Parse Float!!!");
    }
    return number;
  },
  jsonParse: (data, payload, jwt) => {
    try {
      return JSON.parse(data);
    } catch (ex) {
      console.log(ex);
      throw new Error("Could not Parse incomming data!!!");
    }
  }

};
