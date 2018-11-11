'use strict';

const _ = require('lodash');
const moment = require('moment');
module.exports = {
  STUB: (payload) => {
    return payload;
  },
  getDate: (payload) => {
    return new Date().toLocaleString();
  },
  ConvertDateToISO: (value) => {
    if (value) {
      value = this._getUnixDate(value);
    }
    return value.toString() || "";
  },
  getHyphen: (value) => {
    return '000';
  },
  ConvertCaptureDateDateToISO: (payload) => {
    return this._getUnixDate(payload.TransactionCaptureDate);
  },
  _getUnixDate: (dateStr) => {
    let unixDate = moment(dateStr, 'DD-MM-YYYY HH:mm:ss').valueOf() / 1000;
    return unixDate.toString();
  },
  ArrayToString: (value) => {
    if (value) {
      return value.join();
    }
    return value;
  },
  dataToString: (value) => {
    let retval = '';
    if (value) {
      retval = JSON.stringify(value);
    }
    if (retval === null) {
      retval = '';
    }
    return retval;
  },
  actionTransform: (str) => {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  emptyToDash: (value) => {
    value = _.isEmpty(value) ? '-' : value;
    return value;
  },
  consolidatedQuery: (value) => {
    return ["100"];
  }
};
