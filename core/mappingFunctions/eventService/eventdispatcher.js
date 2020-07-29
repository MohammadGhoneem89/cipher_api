'use strict';
const config = require('../../../config');
const pgrepo = require('./dispatch_postgres');
const mssqlrepo = require('./dispatch_mssql');
const _ = require('lodash')

let database = config.get('database', 'postgres')

switch (database) {
  case "mssql":
    exports.getEventDispatcherList = mssqlrepo.getEventDispatcherList;
    exports.getEventDispatcher = mssqlrepo.getEventDispatcher;
    exports.getEventDispatcherByID = mssqlrepo.getEventDispatcherByID;
    exports.upsertEventDispatcher = mssqlrepo.upsertEventDispatcher;
    exports.getEventDispatcherStatus = mssqlrepo.getEventDispatcherStatus;
    exports.getDispatcherMeta = mssqlrepo.getDispatcherMeta;
    exports.updateEventDispatcherStatus = mssqlrepo.updateEventDispatcherStatus;
  default:
    exports.getEventDispatcherList = pgrepo.getEventDispatcherList;
    exports.getEventDispatcher = pgrepo.getEventDispatcher;
    exports.getEventDispatcherByID = pgrepo.getEventDispatcherByID;
    exports.upsertEventDispatcher = pgrepo.upsertEventDispatcher;
    exports.getEventDispatcherStatus = pgrepo.getEventDispatcherStatus;
    exports.getDispatcherMeta = pgrepo.getDispatcherMeta;
    exports.updateEventDispatcherStatus = pgrepo.updateEventDispatcherStatus;
    break;
}
