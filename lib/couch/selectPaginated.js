'use strict';

const couch = require('../../api/bootstrap/couchDB');
const config = require('../../config');

module.exports = selectPaginated;

function selectPaginated(channel, where = {}, projection = [], option = {}) {

  channel = config.get('couch.channel');

  option.limit = option.limit || 5;
  option.skip = option.skip || 0;

  if (projection.length > 0) {
    where = {
      selector: where,
      fields: projection,
      limit: option.limit,
      skip: option.skip
    };
  }
  else {
    where = {
      selector: where,
      limit: option.limit,
      skip: option.skip
    };
  }
  return couch.mango(channel, where, {});
}
