'use strict';
const moment = require('moment');

function UNIXConvertToDate(UNIXTS) {
  if (UNIXTS === 0) {return '';}
  const date = new Date(UNIXTS * 1000);
  return moment(date).tz('Asia/Dubai').format('DD/MM/YYYY H:mm:ss');
}

module.exports = UNIXConvertToDate;
