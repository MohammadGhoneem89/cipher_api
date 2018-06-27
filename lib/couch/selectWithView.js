'use strict';

const couch = require('../../Core/api/bootstrap/couchDB');
const _ = require('lodash');
const config = require('../../config');

const selectWithView = function(channel, view, options) {

  channel = config.get('couch.channel');

  return couch.get(channel, view, options)
    .then((res) => _.get(res, 'data.rows', []));
};

module.exports = selectWithView;
