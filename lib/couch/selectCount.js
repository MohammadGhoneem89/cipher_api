'use strict';

const couch = require('../../core/api/connectors/couchDB');
const commonConst = require('../../lib/constants/common');
const config = require('../../config');

const selectCount = function(channel, query, fieldName) {
  channel = config.get('couch.channel');
  const where = {
    selector: query,
    limit: commonConst.couch.limit + 1,
    skip: 0,
    fields: fieldName
  };

  return couch.mango(channel, where, {})
    .then((res) => {
      if (res.data.docs.length > commonConst.couch.limit) {
        throw commonConst.couch.error;
      }
      return res;
    });
};

module.exports = selectCount;
