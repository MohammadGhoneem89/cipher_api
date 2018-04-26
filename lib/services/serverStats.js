'use strict';

const serverStatsRepo = require('../repositories/serverStats');
const config = require('../../config');
const minutes = 5;

module.exports = {
  upsert,
  find
};

function upsert() {
  const ip = config.get('URLRestInterface');
  function updateStats() {
    serverStatsRepo.update(ip);
  }
  updateStats();
  setInterval(updateStats, minutes * 60 * 1000);
}

function find() {
  return serverStatsRepo.find();
}
