'use strict';

const couch = require('../../api/bootstrap/couchDB');
const commonConst = require('../../lib/constants/common');
const config = require('../../config');

const selectTransactionCount = function (channel, query, fieldName) {
  channel = config.get('couch.channel');
  const where = {
    selector: query,
    limit: config.get('transactionListCount') + 1,
    skip: 0,
    fields: fieldName
  };

  return couch.mango(channel, where, {})
    .then((res) => {
      return res;
    });
};

module.exports = selectTransactionCount;
