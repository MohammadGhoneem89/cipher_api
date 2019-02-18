'use strict';

const models = require('../models');

const PasswordPolicy = models.PasswordPolicy;

module.exports = {
    findOne,
    create,
    update,
    fetchAll,
    getCount
};

function findOne() {
  return PasswordPolicy.findOne();
}

function create(payload){
    return new PasswordPolicy(payload).save();
}

function update(payload){
    const id = payload.id;
    return PasswordPolicy.findById(id)
    .then((res)=>{
        if(!res){
            throw "Object not found";
        }
        return  PasswordPolicy.findOneAndUpdate({_id:id},payload)
    });
}


function fetchAll() {
    return PasswordPolicy.find({})
        .lean(true);
}


function getCount() {
    return PasswordPolicy.find({}).count();
}
