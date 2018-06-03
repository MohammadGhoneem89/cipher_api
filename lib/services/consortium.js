'use strict';

const validator = require('../validator');
const consortiumRepo = require('../repositories/consortium');
const permissionsHelper = require('../helpers/permissions');
const permissionConst = require('../constants/permissions');
const common = require('../../lib/helpers/common');
const _ = require('lodash');
const consortium = require('./consortium');
const commonConst = require('../constants/common');
const config = require('../../api/bootstrap/quorum.json');
const rp = require('request-promise');

const configurations = require('../../config');
const basePath = configurations.get('basePath');
const fs = require('fs');
const uuid = require('uuid/v1');

function date() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  today = dd + '-' + mm + '-' + yyyy;
  return today;
}

function createFile(data) {
  const destinationPath = basePath + "/document" + "/" + date() + "/" + uuid() + ".sol";
  return new Promise((resolve, reject) => {
    fs.writeFile(destinationPath, data, function (err) {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  })
}

function _getDataFromServer(path, data) {
  const URL = config['host'] + path;

  const options = {
    method: 'POST',
    uri: URL,
    body: data,
    json: true // Automatically stringifies the body to JSON
  };
  return rp(options);
}

function create(payload) {
  return validator.errorValidate(payload, validator.schemas.consortium.create)
    .then(() => {
      payload.data.createdBy = payload.createdBy;
      return consortiumRepo.create(payload.data);
    });
}

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, function (err, file) {
      if (err) {
        reject(err);
      }
      resolve(file);
    });
  })
}

function getFiles(payload) {
  return consortiumRepo.findOneById(payload.consortiumID || payload._id)
    .then((res) => {
      let contract = res.smartContractTemplates[payload.index];
      let data = [];
      let i =0;
      contract.files.forEach(file => {
        let fileContent = fs.readFileSync(file.path);
        file.content = fileContent;
        data.push({template:contract.templateName, label: file.name, fileContent:fileContent.toString(), status: contract.status, value:i})
        i++;
      })
      return data;
    });
}


function getDetails(payload) {
  return validator.validate(payload, validator.schemas.consortium.consortiumDetail)
    .then(() => consortiumRepo.findOneById(payload.consortiumID || payload._id))
    .then((res) => {
      const response = updateResponseFormatter(res);
      return response;
    });
}

function getList(payload) {
  const count = 0;
  return validator.validate(payload, validator.schemas.consortium.getConsortium)
    .then(() => consortiumRepo.find(payload))
    .then((res) => {
      const response = {};
      response.count = _.get(res, '[1]', '');
      response.consortium = _.get(res, '[0]', []);
      response.typeData = _.get(res, '[2]', []).data.Cipher_blockchainType;
      return response;
    });
}

function update(payload) {
  return validator.errorValidate(payload, validator.schemas.consortium.update)
    .then(() => {
      payload.data.updatedBy = payload.userId;
      payload.data.updatedAt = payload.updatedAt;
      return consortiumRepo.findOneAndUpdate({ _id: payload.data._id }, payload.data);
    });
}

function writeDeployedToDB(id, template, response, channels, deployedBy) {
  const record = {
    templateName: template.templateName,
    transactionHash: response.transactionHash,
    from: response.receipt.from,
    bindingId: response.receipt.contractAddress,
    channel: channels,
    deployedBy: deployedBy,
    deployedOn: new Date(),
    status: 'ACTIVE'
  }
  return consortiumRepo.findOneAndUpdate({ _id: id }, {
    $push: { deployedContracts: record }
  });
}

function getOrgs(consortium, channels) {
  let orgs = [];
  consortium.channels.forEach(element => {
    if (channels.indexOf(element.name)) {
      orgs.concat(element.orgs);
    }
  });
  return orgs;
}

function getConstellationKeys(orgs, consortium) {
  let keys = [];
  let index = orgs.indexOf(consortium.owner.orgCode)
  if (index !== -1) {
    keys.push(consortium.owner.key);
    orgs = orgs.splice(index, 1);
  }
  for (let i = 0; i < orgs.length; i++) {
    consortium.directParticipants.forEach(element => {
      if (element.orgCode === orgs[i]) {
        keys.push(element.key);
      }
    })
    consortium.indirectParticipants.forEach(element => {
      if (element.orgCode === orgs[i]) {
        keys.push(element.key);
      }
    })
  }
  return keys;
}

function getContractStruct(payload) {
  const data = payload.data;
  return consortiumRepo.findOneById(data._id)
    .then((consortium) => {
      let templateName;
      let deployed;
      consortium.deployedContracts.forEach(element => {
        if (element.bindingId === data.bindingId) {
          deployed = element;
          templateName = deployed.templateName;
        }
      });

      let channels = [];
      consortium.channels.forEach(element => {
        const channelList = deployed.channel.split(',');
        if (channelList.indexOf(element.name) !== -1) {
          element.keys.forEach(key => {
            if (channels.indexOf(key) === -1) {
              channels.push(key);
            }
          })
        }
      });

      let contract;
      consortium.smartContractTemplates.forEach(element => {
        if (element.templateName === templateName) {
          contract = element;
        }
      });

      deployed.ABI = contract.ABI
      if (contract) {
        const struct = ABIFormatter(contract.ABI, 1);
        return {
          contractStruct: {
            action: 'contractStruct',
            data: {
              structure: struct,
              detail: deployed,
              channels: channels
            }
          }
        };
      }
    });
}

function smartContractDeploy(payload) {
  // payload.data.updatedBy = payload.userId;
  // payload.data.updatedAt = payload.updatedAt;
  const data = payload.data;
  let template;
  return consortiumRepo.findOneById(data._id)
    .then((consortium) => {
      let orgs = getOrgs(consortium, data.channels);

      let channels = getConstellationKeys(orgs, consortium);

      template = consortium.smartContractTemplates[data.index];
      const quorumRequest = {
        'code': template.code,
        'abi': JSON.parse(template.ABI),
        'params': data.params || [],
        'from': consortium.owner.account,
        'value': data.value || 0,
        'privateFor': channels || []
      };

      return _getDataFromServer('/contract/deploy', quorumRequest);
    }).then(serverData => {
      return writeDeployedToDB(data._id, template, serverData, data.channels, payload.deployedBy);
    }).then(updatedData => {
      return consortiumRepo.findOneById(payload.data._id);
    })
    .then(consortiumData => {
      const response = updateResponseFormatter(consortiumData);
      return {
        consortiumDetail: {
          action: payload.action,
          data: response
        }
      };
    });
}

function ABIFormatter(abi, type) {
  try {
    const ABI = JSON.parse(abi);
    let details = {
      constructor: {
        inputs: []
      },
      setters: [],
      getters: [],
      events: []
    }
    for (let i = 0; i < ABI.length; i++) {
      if (ABI[i].type === 'constructor') {
        details.constructor.inputs = ABI[i].inputs
      }
      if (type === 1 && ABI[i].type === 'function') {
        if (ABI[i].constant && ABI[i].constant === true) {
          details.getters.push({ label: ABI[i].name, value: ABI[i].name, inputs: ABI[i].inputs, outputs: ABI[i].outputs })
        } else {
          details.setters.push({ value: ABI[i].name, label: ABI[i].name, inputs: ABI[i].inputs, outputs: ABI[i].outputs })
        }
      }
      if (type === 1 && ABI[i].type === 'event') {
        details.events.push({ label: ABI[i].name, value: ABI[i].name })
      }
    }
    return details;
  } catch (err) {
    console.error(err);
  }
}

function updateResponseFormatter(consortiumData) {
  let i = 0;
  consortiumData.directParticipants = consortiumData.directParticipants.map(element => {
    element.status = { type: element.status === 'ACTIVE' ? 'OK' : 'WARNING', value: element.status };
    return element;
  });
  consortiumData.indirectParticipants = consortiumData.indirectParticipants.map(element => {
    element.status = { type: element.status === 'ACTIVE' ? 'OK' : 'WARNING', value: element.status };
    return element;
  });
  consortiumData.deployedContracts = consortiumData.deployedContracts.map(element => {
    element.status = { type: element.status === 'ACTIVE' ? 'OK' : 'WARNING', value: element.status };
    return element;
  });
  consortiumData.smartContractTemplates = consortiumData.smartContractTemplates.map(element => {
    element.actions = [
      {
        "label": "View",
        "iconName": "fa fa-eye",
        "actionType": "componentAction",
        "URI": ["/cipher/" + consortiumData['_id'] + "/smartContractFiles/"]
      },
      {
        "label": "Edit",
        "iconName": "fa fa-edit",
        "actionType": "COMPONENT_FUNCTION"
      },
      {
        "label": "Deploy",
        "iconName": "fa fa-cogs",
        "actionType": "COMPONENT_FUNCTION"
      }
    ];

    element.status = { type: element.status === 'ACTIVE' ? 'OK' : 'WARNING', value: element.status };
    const abis = ABIFormatter(element.ABI, 0);
    element.struct = abis;
    delete element.ABI;
    delete element.code;
    delete element.files;
    
    element._id = i;
    i += 1;
    return element;
  });
  consortiumData.deployedContracts = consortiumData.deployedContracts.map(element => {
    element.actions = [
      {
        "label": "View",
        "iconName": "fa fa-eye",
        "actionType": "COMPONENT_FUNCTION"
      }
    ];
    return element;
  });

  return consortiumData;
}


async function smartContractCompile(payload) {
  let id = payload.data._id;
  delete payload.data._id;
  if (payload.data.insertContract) {
    try {
      const file = await createFile(payload.data.insertContract);
      payload.data.files = [file];
    } catch (err) {
      console.log(error)
    }
  }
  return _getDataFromServer('/contract/compile', payload['data'])
    .then((result) => {
      payload.data.ABI = result.compiledContracts.data[0].abi;
      payload.data.code = result.compiledContracts.data[0].code;
      return consortiumRepo.findOneAndUpdate({ _id: id }, {
        $push: { smartContractTemplates: payload['data'] }
      });
    })
    .then(updatedData => {
      return consortiumRepo.findOneById(id);
    })
    .then(consortiumData => {
      const response = updateResponseFormatter(consortiumData);
      return {
        consortiumDetail: {
          action: payload.action,
          data: response
        }
      };
    });
}

function getUpdatedById(id) {
  return consortiumRepo.findOneById(id);
}

module.exports = {
  getList,
  getDetails,
  create,
  update,
  getContractStruct,
  smartContractCompile,
  smartContractDeploy,
  getUpdatedById,
  getFiles
};

