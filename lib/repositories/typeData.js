'use strict';

const models = require('../models');
const mongoose = require('mongoose');
const _ = require('lodash');

const TypeData = models.TypeData;


module.exports = {
  findTypeData,
  select,
  getValues,
  findOne,
  findFields,
  getDetails,
  getCount,
  getTypeDataDetailByType,
  insertTypeData,
  updateTypeData,
  getTypeDataList,
  selectProjected,
  deleteAndInsert,
  getTypeDataDetailById
};

function findTypeData() {
  return TypeData.find({
    'typeName': 'CTEMP_categoryTypes'
  }, {
    'data.CTEMP_categoryTypes': 1
  });
}

function select(query) {
  return TypeData
    .find(query)
    .sort('mappingName')
    .lean(true)
    .exec();
}
function selectProjected(query, projection) {
  return TypeData
    .find(query, projection)
    .sort('mappingName')
    .lean(true)
    .exec();
}
function getValues(typeName, codes) {
  return TypeData.findOne({ typeName: typeName }).lean(true)
    .then((typeData) => {
      const values = [];
      if (_.indexOf(codes, 'All') >= 0) {
        values.push('All');
      }
      for (const prop in typeData.data) {
        typeData.data[prop] = typeData.data[prop] || [];
        for (const code of codes) {
          const label = _.get(_.find(typeData.data[prop], { value: code }), 'label');
          if (label) {
            values.push(label);
          }
        }
      }
      return values;
    });
}

function findOne(query) {
  return TypeData
    .findOne(query);
}

function findFields(typeName) {
  return TypeData.findOne({ typeName: typeName }).lean(true);
}

function getDetails(typeName, pageSize, currentPageNumber) {
  return TypeData.find({ typeName: { $regex: typeName } }, { 'typeName': 1 })
    .limit(pageSize)
    .skip(pageSize * (currentPageNumber - 1))
    .lean(true);
}

async function getTypeDataDetailByType(type) {
  let query = { type: { $regex: type } }
  return Promise.all([
    TypeData.find(query)
      .lean(true)
      .exec(),
    TypeData.count(query)
  ]);
};

function getCount(typeName) {
  return TypeData.find({ typeName: { $regex: typeName } }).count();
}

function getTypeDataList(typeName) {

  return TypeData.aggregate([
    {
      $match:
      {
        typeName: { $regex: typeName }
      }
    },
    {
      $project: {
        "_id": 0,
        "label": "$typeName",
        "value": "$_id"
      }
    }
  ]);

}

function insertTypeData(typeName, data, type, isForign = false) {
  let errorMsg = { typeName: 'typeName Already exists' }
  const query = {};
  query.typeName = typeName;
  query.type = type;
  query.isForign = isForign;
  query.data = {};
  query.data[typeName] = data;
  return TypeData.findOne({ typeName: typeName }).lean(true)
    .then((typeName) => {
      if (typeName) {
        throw errorMsg;
      }
      else {
        return new TypeData(query).save();
      }
    });

}

function updateTypeData(id, type, typeName, typeNameDetails, isForign = false) {
  const query = {};
  query.type = type;
  query.isForign = isForign;
  query.typeName = typeName;
  query.data = {};
  query.data[typeName] = typeNameDetails;
  return TypeData.update({ _id: id || new mongoose.mongo.ObjectID() }, { $set: query }, { upsert: true });
}
function deleteAndInsert(query, set) {
  return TypeData.findOne(query).then((data) => {
    let queryUpsert = {};
    if (data && data._id) {
      queryUpsert = { _id: data._id };
    } else {
      queryUpsert = query;
    }
    return TypeData.update(queryUpsert, { $set: set }, { upsert: true }).then((dataupsert) => {
      if (dataupsert && dataupsert.upserted) {
        return dataupsert.upserted[0];
      }
      return { _id: data._id };
    });
  });
}


function getTypeDataDetailById(ObjectID) {
  return TypeData.findOne({ _id: ObjectID });
}
