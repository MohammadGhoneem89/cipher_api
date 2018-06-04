'use strict';

const smileContractRepo = require('../repositories/smilesContracts');

function getAll(){
  return smileContractRepo.findAll().then(data=>{
    data = data.map(element=>{
      element.value = element.contractAddress;
      return element;
    });
    return data;
  })
}

module.exports = {
  getAll
};

