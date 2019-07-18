'use strict';

const models = require('../models');
const _ = require('lodash');
const Entity = models.Entity;

module.exports = {
  findBySpCode,
};


function findBySpCode(payload) {
  console.log(payload.orgCode)
  return Promise.all([
    
    Entity.find({ spCode: {$in: payload.orgCode }}).populate({ path: 'network' }).select("-__v ").lean(true)
  ])
    .then((res) => {
      if (!res[0]) {
        const err = { message: 'no record found' };
        throw err;
      }
      return res[0];
    });
}