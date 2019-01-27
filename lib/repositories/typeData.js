'use strict';

const models = require('../models');
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
  getTypeDataDetailById,
  insertTypeData,
  updateTypeData,
  getTypeDataList,
  selectProjected
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

function getTypeDataDetailById(ObjectID) {
  return TypeData.findOne({ _id: ObjectID });
}


function insertTypeData(typeName, data, errorMsg = { typeName: 'typeName Already exists' }) {
  const query = {};
  query.typeName = typeName;
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

function updateTypeData(id, typeName, typeNameDetails) {
  const query = {};
  query.typeName = typeName;
  query.data = {};
  query.data[typeName] = typeNameDetails;
  return TypeData.findOne({ typeName: typeName, _id: { $ne: id } })
    .then((res) => {
      if (res) {
        throw { typeName: 'typeName already exists' }
      }
      return TypeData.findOneAndUpdate({ _id: id }, { $set: query });
    })


}