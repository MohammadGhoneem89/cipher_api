'use strict';

const chrono = require('chronoscript');
const mongoDB = require('../api/bootstrap/mongoDB');
const config = require('../config');
const syncMicroService = require('./crons/syncMicroService');
process.on('uncaughtException', (err) => {
  console.log('Processes UNCAUGHT EXCEPTION:', err); // eslint-disable-line no-console
});

// mongoDB
//   .connection(config.get('mongodb.url'))
//   .then(initiateCrons);

function initiateCrons() {
  const tags = ['lastReconNotifications', 'SLAEvent'];

  chrono.script({
    startDate: config.get('cron.startDate'),
    endDate: config.get('cron.endDate'),
    interval: config.get('cron.interval'),
    triggers: tags
  }, function (info, triggers) {
    triggers();
  });

  chrono.trigger({ name: 'lastReconNotifications' }, function () {
    // lastRecon.init();
  });

  /* chrono.trigger({ name: 'syncMicroService' }, function() {
    syncMicroService.init();
  }); */

  chrono.trigger({ name: 'SLAEvent' }, function () {
    // slaEvent.init();
  });

  chrono.start();
}
