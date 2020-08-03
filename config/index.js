'use strict';

const _ = require('lodash');
const config = global.config;

function get(path,defaultVal= undefined) {
  return _.get(config, path, defaultVal);
}

module.exports.get = get;
module.exports._instance = config;
