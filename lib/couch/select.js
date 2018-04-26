'use strict';

const couch = require('../../api/bootstrap/couchDB');
const commonConst = require('../../lib/constants/common');
const config = require('../../config');

const select = function(channel, query) {
  channel = config.get('couch.channel');
  const where = {
    selector: query.selector,
    limit: commonConst.couch.limit + 1,
    skip: 0
  };
  return couch.mango(channel, where, {})
    .then((res) => {
      if (res.data.docs.length > commonConst.couch.limit) {
        throw commonConst.couch.error;
      }
      return res;
    });
};

module.exports = select;
