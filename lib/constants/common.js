'use strict';

const entity = 'Entity';
const dof = 'DOF';
const acquirer = 'Acquirer';
const dsg = 'DSG';
const admin = 'Admin';
const settlement = 'Settlement';
const processor = 'Processor';
const ports = 'Ports';
const custom = 'Custom';

const human = 'Human';
const api = 'API';

const system = 'System';
const local = 'Local';

const insert = 'INSERT';
const update = 'UPDATE';
const delt = 'DELETE';
const E = 'E';
const A = 'A';
let exclusionList = ['passwordReset', 'setPassword', 'permission', 'user', 'notificationList'];
const healthService = ['health'];
exclusionList = exclusionList.concat( healthService);

module.exports = {
  user: {
    orgTypeKeys: {
      entity: entity,
      dof: dof,
      acquirer: acquirer,
      dsg: dsg,
      admin: admin,
      settlement: settlement,
      processor: processor
    },
    userType: [human, api],
    userTypeKeys: {
      human: human,
      api: api
    },
    authType: [system, local],
    hashTypes: ['md5', 'plain', 'sha256', 'sha512'],
    authTypeKey: {
      system: system,
      local: local
    }
  },
  permissions: {
    types: {
      modules: 'module',
      pages: 'page',
      pagesActions: 'pageAction',
      components: 'component',
      actions: 'componentAction',
      upload: 'upload',
      dowload: 'download'
    }
  },
  auditLog: {
    event: [insert, update, delt],
    eventKeys: {
      insert: insert,
      update: update,
      delt: delt
    }
  },
  reconAudit: {
    reqType: [E, A],
    reqTypeKeys: {
      e: E,
      a: A
    }
  },
  permissionExcludeList: exclusionList,
  couch: {
    limit: 1000000,
    error: 'Pdf limit exceeded Please correct your Filters'
  }
};