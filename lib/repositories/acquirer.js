'use strict';

const Acquirer = require('../models/Acquirer');
const _ = require('lodash');

module.exports = {
  findReconNotifications,
  findOneAndUpdate,
  findOneByShortCode,
  findOne,
  find,
  findAllCardTypes,
  findAllAcquirers
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
    Acquirer.mapReduce(o, function(err, results) {
      if (err) {
        return reject(err);
      }
      return resolve(_.map(results, 'value'));
    });
  });
}

function findOneAndUpdate(query, payload) {
  return Acquirer
    .findOneAndUpdate(query, payload);
}

function findOneByShortCode(shortCode) {
  return Acquirer.findOne({ shortCode: shortCode }).lean(true);
}

function findOne(query) {
  return Acquirer.findOne(query);
}

function find(query = {}, attrs = '', lean = false) {
  return Acquirer
    .find(query)
    .select(attrs)
    .lean(lean);
}

function findAllCardTypes() {
  return Acquirer.find({})
    .then((acquirers) => {
      let list = [];
      for (const acquirer of acquirers) {
        list = list.concat([{
          acquirer: acquirer.shortCode,
          acquirerName: acquirer.acquirerName,
          cardType: 'VISA'
        }, {
          acquirer: acquirer.shortCode,
          acquirerName: acquirer.acquirerName,
          cardType: 'MasterCard'
        }, {
          acquirer: acquirer.shortCode,
          acquirerName: acquirer.acquirerName,
          cardType: 'Credit Card'
        }]);
      }
      return list;
    });
}

function findAllAcquirers() {
  return Acquirer.find({})
    .then((acquirers) => {
      let list = [];
      for (const acquirer of acquirers) {
        list = list.concat([{
          shortCode: acquirer.shortCode,
          acquirerName: acquirer.acquirerName,
          status: 'REFUNDED',
          paymentMethod: 'Credit Card'
        }, {
          shortCode: acquirer.shortCode,
          acquirerName: acquirer.acquirerName,
          status: 'Match With SP',
          paymentMethod: 'Credit Card'
        }, {
          shortCode: acquirer.shortCode,
          acquirerName: acquirer.acquirerName,
          status: 'Match With Bank',
          paymentMethod: 'Credit Card'
        }, {
          shortCode: acquirer.shortCode,
          acquirerName: acquirer.acquirerName,
          status: 'Complete Match',
          paymentMethod: 'Credit Card'
        }, {
          shortCode: acquirer.shortCode,
          acquirerName: acquirer.acquirerName,
          status: 'REFUNDED',
          paymentMethod: 'MasterCard'
        }, {
          shortCode: acquirer.shortCode,
          acquirerName: acquirer.acquirerName,
          status: 'Match With SP',
          paymentMethod: 'MasterCard'
        }, {
          shortCode: acquirer.shortCode,
          acquirerName: acquirer.acquirerName,
          status: 'Match With Bank',
          paymentMethod: 'MasterCard'
        }, {
          shortCode: acquirer.shortCode,
          acquirerName: acquirer.acquirerName,
          status: 'Complete Match',
          paymentMethod: 'MasterCard'
        }, {
          shortCode: acquirer.shortCode,
          acquirerName: acquirer.acquirerName,
          status: 'REFUNDED',
          paymentMethod: 'VISA'
        }, {
          shortCode: acquirer.shortCode,
          acquirerName: acquirer.acquirerName,
          status: 'Match With SP',
          paymentMethod: 'VISA'
        }, {
          shortCode: acquirer.shortCode,
          acquirerName: acquirer.acquirerName,
          status: 'Match With Bank',
          paymentMethod: 'VISA'
        }, {
          shortCode: acquirer.shortCode,
          acquirerName: acquirer.acquirerName,
          status: 'Complete Match',
          paymentMethod: 'VISA'
        }]);
      }
      return list;
    });
}
