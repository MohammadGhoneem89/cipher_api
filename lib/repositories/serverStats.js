'use strict';

const models = require('../models');
const dates = require('../helpers/dates');

const ServerStats = models.ServerStats;

module.exports = {
  update,
  find
};

function update(ip) {
  const query = { ip: ip };
  const payload = { updatedAt: dates.newDate() };

  return ServerStats.findOne(query)
    .then((stats) => {
      if (stats) {
        return ServerStats.update(query, payload);
      }
      return new ServerStats(Object.assign(query, payload)).save();
    })
    .then(() => {
      return { success: true };
    });
}

function find(query = {}) {
  return ServerStats
    .find(query);
}
