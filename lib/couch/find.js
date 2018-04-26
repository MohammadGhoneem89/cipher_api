'use strict';

const couch = require('../../api/bootstrap/couchDB');
const _ = require('lodash');
const commonConst = require('../../lib/constants/common');
const config = require('../../config');

module.exports = find;

function find(channel, query = {}, fields = []) {
  channel = config.get('couch.channel');
  const where = {
    selector: query,
    fields: fields,
    // sort : query.sort,
    limit: commonConst.couch.limit + 1,
    skip: 0
  };
  return couch.mango(channel, where, {})
    .then((res) => {
      const data = _.get(res, 'data.docs', []);
      if (data.length > commonConst.couch.limit) {
        throw commonConst.couch.error;
      }
      return data;
    });
}
