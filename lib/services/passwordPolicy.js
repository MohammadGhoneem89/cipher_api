'use strict';

const _ = require('lodash');
const validator = require('../validator');
const passwordPolicyRepo = require('../repositories/passwordPolicy');


module.exports = {
    create,
    update,
    fetchAll
};


function create(payload){
    return validator.errorValidate(payload,validator.schemas.passwordPolicy.createPasswordObject)
        .then(()=>passwordPolicyRepo.create(payload))
}

function update(payload){
    return validator.errorValidate(payload,validator.schemas.passwordPolicy.updatePasswordObject)
        .then(()=>passwordPolicyRepo.update(payload))
}

function fetchAll(){
    return passwordPolicyRepo.fetchAll();


}