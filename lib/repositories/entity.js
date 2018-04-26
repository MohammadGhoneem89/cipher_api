'use strict';

const Entity = require('../models/Entity');
const _ = require('lodash');

module.exports = {
  findReconNotifications,
  findOneAndUpdate,
  findOneByShortCode,
  findOne,
  findAllServiceCodes,
  findAllServiceCodes1,
  findAllServiceCodes2,
  find
};

function findReconNotifications() {
  const o = {};
  o.map = function() {
    const someDate = new Date(this.lastReconDate);
    const numberOfDaysToAdd = +this.recon.noOfDays - 2;
    this.reconPendingDate = someDate.setDate(someDate.getDate() + numberOfDaysToAdd);
    if (this.reconPendingDate < new Date()) {
      emit(this._id, this);
    }
  };
  o.reduce = function(id, recon) {
    return recon;
  };
  o.query = {
    $and: [
      { $or: [{ 'recon.lastNotification': { $exists: false } }, { 'recon.lastNotification': null }] },
      { 'recon.integrationType': { $ne: 'Blockchain' } },
      { lastReconDate: { $exists: true } }
    ]
  };
  return new Promise((resolve, reject) => {
    Entity.mapReduce(o, function(err, results) {
      if (err) {
        return reject(err);
      }
      return resolve(_.map(results, 'value'));
    });
  });
}

function findOneAndUpdate(query, payload) {
  return Entity
    .findOneAndUpdate(query, payload);
}

function findOneByShortCode(shortCode) {
  return Entity.findOne({ shortCode: shortCode }).lean(true);
}

function findOne(query) {
  return Entity.findOne(query);
}

function findAllServiceCodes() {
  return Entity.aggregate([{ $unwind: '$services' }])
    .then((entities) => {
      let list = [];
      for (const entity of entities) {
        list = list.concat([{
          spCode: entity.spCode,
          entityName: entity.entityName,
          serviceCode: entity.services.serviceCode,
          serviceName: entity.services.serviceName,
          status: 'SUCCESS'
        }, {
          spCode: entity.spCode,
          entityName: entity.entityName,
          serviceCode: entity.services.serviceCode,
          serviceName: entity.services.serviceName,
          status: 'FAILED'
        },{
          spCode: entity.spCode,
          entityName: entity.entityName,
          serviceCode: entity.services.serviceCode,
          serviceName: entity.services.serviceName,
          status: 'PENDING'
        }]);
      }
      return list;
    });
}

function findAllServiceCodes1() {
  return Entity.aggregate([{ $unwind: '$services' }])
    .then((entities) => {
      let list = [];
      for (const entity of entities) {
        list = list.concat([{
          spCode: entity.spCode,
          entityName: entity.entityName,
          serviceCode: entity.services.serviceCode,
          serviceName: entity.services.serviceName
        }]);
      }
      return list;
    });
}

function findAllServiceCodes2() {
  return Entity.aggregate([{ $unwind: '$services' }])
    .then((entities) => {
      let list = [];
      for (const entity of entities) {
        list = list.concat([{
          spCode: entity.spCode,
          entityName: entity.entityName,
          serviceCode: entity.services.serviceCode,
          serviceName: entity.services.serviceName,
          status: 'REFUNDED'
        }, {
          spCode: entity.spCode,
          entityName: entity.entityName,
          serviceCode: entity.services.serviceCode,
          serviceName: entity.services.serviceName,
          status: 'Match With SP'
        }, {
          spCode: entity.spCode,
          entityName: entity.entityName,
          serviceCode: entity.services.serviceCode,
          serviceName: entity.services.serviceName,
          status: 'Match With Bank'
        }, {
          spCode: entity.spCode,
          entityName: entity.entityName,
          serviceCode: entity.services.serviceCode,
          serviceName: entity.services.serviceName,
          status: 'Complete Match'
        }]);
      }
      return list;
    });
}

function find(query = {}, project = '', lean = false) {
  return Entity
    .find(query)
    .select(project)
    .lean(lean)
    .exec();
}
