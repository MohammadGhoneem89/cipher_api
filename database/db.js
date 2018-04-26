'use strict';

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
const config = require('../config');
const crypto = require('../lib/helpers/crypto');
const logger = require('../api/bootstrap/logger');

module.exports = function (callback) {
  const dbURL = crypto.decrypt(config.get('mongodb.url'));

  MongoClient.connect(dbURL, function (err, db) {
    if (err) {
      logger.app.error({error: err}, 'Unable to connect mongodb...');
      throw new Error('Unable to connect mongodb...');
    }
    else {
      function select(table, where, projection, callback) {
        if (where['id']) {
          if (typeof where['id'] === 'object') {
            where['_id'] = where['id'];
            const inData = where['_id']['$in'];
            if (inData) {
              for (let i = 0; i < inData.length; i += 1) {
                inData[i] = new ObjectID(inData[i]);
              }
              where['_id']['$in'] = inData;
            }
          }
          else {
            where['_id'] = new ObjectID(where['id']);
          }
          delete where['id'];
        }
        db.collection(table).find(where, projection).toArray(callback);
      }

      function select2(table, where, projection, options, callback) {

        options.lastID = options.lastID || 1;
        const pageSize = options.pageSize || 10;
        const currentPageNo = options.currentPageNo || 1;
        const skip = currentPageNo * pageSize - pageSize;

        if (where['id']) {
          if (typeof where['id'] === 'object') {
            where['_id'] = where['id'];
          }
          else {
            where['_id'] = new ObjectID(where['id']);
          }
          delete where['id'];
        }

        if (options.lastID !== '') {
          options.lastID = new ObjectID(options.lastID);
        }

        const strWhere = JSON.stringify(where);
        const lastID1 = JSON.stringify(options['lastID']);

        let strWhere2 = '{}';
        let where2 = {};
        if (strWhere.length > 0 && options.lastID !== '') {
          strWhere2 = '{ "$and" : [' + strWhere + ', {"_id": {"$gt":' + lastID1 + '}}]}';
        }
        else if (strWhere === '' && lastID1 !== '') {
          strWhere2 = '{"_id": {$gt:' + lastID1 + '}}';
        }
        else {
          strWhere2 = strWhere;
        }

        where2 = JSON.parse(strWhere2);

        if (options.lastID !== '') {
          where2.$and[1]._id.$gt = new ObjectID(where2.$and[1]._id.$gt);
        }
        db.collection(table).find(where2, projection).skip(skip).limit(pageSize).toArray(callback);
      }

      function selectWithSort(table, where, projection, options, callback) {

        options.lastID = options.lastID || 1;
        const pageSize = options.pageSize || 10;
        const currentPageNo = options.currentPageNo || 1;
        const skip = currentPageNo * pageSize - pageSize;

        if (where['id']) {
          if (typeof where['id'] === 'object') {
            where['_id'] = where['id'];
          }
          else {
            where['_id'] = new ObjectID(where['id']);
          }
          delete where['id'];
        }

        if (options.lastID !== '') {
          options.lastID = new ObjectID(options.lastID);
        }

        const strWhere = JSON.stringify(where);
        const lastID1 = JSON.stringify(options['lastID']);

        let strWhere2 = '{}';
        let where2 = {};
        if (strWhere.length > 0 && options.lastID !== '') {
          strWhere2 = '{ "$and" : [' + strWhere + ', {"_id": {"$gt":' + lastID1 + '}}]}';
        }
        else if (strWhere === '' && lastID1 !== '') {
          strWhere2 = '{"_id": {$gt:' + lastID1 + '}}';
        }
        else {
          strWhere2 = strWhere;
        }

        where2 = JSON.parse(strWhere2);

        if (options.lastID !== '') {
          where2.$and[1]._id.$gt = new ObjectID(where2.$and[1]._id.$gt);
        }
        db.collection(table).find(where2, projection).sort(options.sortData).skip(skip).limit(pageSize).toArray(callback);
      }

      function update(table, where, data, callback) {
        if (where['id']) {
          if (typeof where['id'] === 'object') {
            where['_id'] = where['id'];
          }
          else {
            where['_id'] = new ObjectID(where['id']);
          }
          delete where['id'];
        }

        db.collection(table).updateOne(where, {
          '$set': data
        }, callback);
      }

      function insert(table, data, callback) {
        db.collection(table).insertOne(data, callback);
      }

      function count(table, where, callback) {
        db.collection(table).count(where, callback);
      }

      function aggregate(table, where, callback) {
        db.collection(table).aggregate([
          {
            '$project': where
          }
        ]).toArray(callback);
      }

      function join(table, where, callback) {
        db.collection(table).aggregate(where).toArray(callback);
      }

      function createIndex(table, keys) {
        db.collection(table).createIndex(keys);
      }

      global.db = {
        'select': select,
        'select2': select2,
        'update': update,
        'count': count,
        'insert': insert,
        'aggregate': aggregate,
        'join': join,
        'selectWithSort': selectWithSort,
        'createIndex': createIndex
      };

    }
  });
};

