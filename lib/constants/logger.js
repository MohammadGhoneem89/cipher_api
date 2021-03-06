'use strict';

module.exports = {
  name: 'RestInterface',
  appPath: '/logs/app-%d-%b-%y.log',
  activityPath: '/logs/activity-%d-%b-%y.log',
  requestPath: '/logs/request-%d-%b-%y.log',
  soapPath: '/logs/soap-%d-%b-%y.log',
  filter: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] // default values ['trace', 'debug', 'info', 'warn', 'error', 'fatal']
};

