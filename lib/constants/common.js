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
const DP_World = ['exports', 'actions', 'getValue', 'getParticipants', 'getExportsByParticipant', 'exportSearch'];
const quorumAPIList = ['info', 'txCount', 'blockContent', 'getTxByHash', 'txReceiptFromHash', 'getTxByBlock', 'smartContractCompile', 'deployContract', 'contractSetter', 'contractGetter', 'getCode', 'getAccounts', 'getAccountBalance', 'getLogs'];
let exclusionList = ['passwordReset', 'setPassword', 'tranBlockChainId', 'getTranxByHash', 'permission', 'user', 'notificationList',
  'entityList', 'acquirerList', 'typeData'];

const extras = ['smartContractFiles', 'consortiumDetail', 'getSmartContractDetail', , 'consortiumSearch', 'consortiumInsert', 'consortiumUpdate', 'smartContractDeploy', 'groupList', 'groupDetail'];
const health_service = ['health']
const smiles = ['getProviderCards', 'getMerchantInfo', 'viewOrders', 'viewPendingOrders', 'viewCatalogue', 'viewPoints', 'viewSettlements',
  'viewTransactions', 'getTxCard', 'viewCompletedSettlements', 'viewPendingSettlements', 'placeOrder', 'addItem','settle','requestForSettlement','addMultipleItems','resolveEscrow','viewItem'];
exclusionList = exclusionList.concat(quorumAPIList, DP_World, extras, health_service, smiles);

module.exports = {
  user: {
    orgType: [entity, dof, acquirer, dsg, admin, settlement, processor, ports, custom],
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
      actions: 'componentAction'
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
