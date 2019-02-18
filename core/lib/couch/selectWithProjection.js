'use strict';

const couch = require('../../core/api/connectors/couchDB');
const _ = require('lodash');
const config = require('../../config');

module.exports = selectWithProjection;

function selectWithProjection(channel, query = {}, fields = []) {

  channel = config.get('couch.channel');

  const where = {
    selector: query,
    fields: fields,
    limit: 10000000
  };
  return couch.mango(channel, where, {})
    .then((res) => {
      const data = _.get(res, 'data.docs', []);
      return data;
    });
}
