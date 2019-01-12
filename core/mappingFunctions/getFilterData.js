'use strict';

const TypeData = require('../../lib/repositories/typeData');
const reportsCriteria = require('../../lib/repositories/reportsCriteria');
const _ = require('lodash');

function getFilterData(payload, UUIDKey, route, callback, JWToken) {

  get(payload, JWToken, callback);
}

function get(payload, JWToken, callback) {
  const isAcq = JWToken.orgType === 'Acquirer';

  payload = payload || {};
  let id = payload.id || null;

  const filterData = {
    reportFilters: {
      allowedDays: 0,
      data: []
    }
  };

  let temp = ['Payment_Method', 'CTEMP_cardTypes'];
  let filters;
  let allowedDays;
  reportsCriteria.findOne(id)
      .then((data) => {
        filters = data.filters;
        allowedDays = data.allowedDays || 60;
        let promises = [TypeData.select({typeName: {'$in': _.map(data.filters, 'typeData')}})];
        if(isAcq){
          promises.push(TypeData.select({typeName: JWToken.orgCode}));
        }
        return Promise.all(promises)
      })
      .then((typeData) => {
        let acqTypeData  = _.get(typeData, '[1][0]', {});
        typeData = typeData[0];
        for (let filter of filters) {
          filter = filter || {};
          filter.typeDataDetails = _.find(typeData, {typeName: filter.typeData});
          filter.typeData = filter.typeData || '';
          if (temp.indexOf(filter.typeData) >= 0 && isAcq) {
            acqTypeData[filter.typeData] = acqTypeData[filter.typeData] || [];
            _.set(filter, `typeDataDetails.data.${filter.typeData}`, _.sortBy(acqTypeData[filter.typeData], (d) => d.label.toLowerCase()));
          }
          else {
            const data = _.get(_.get(filter, 'typeDataDetails.data', {}), filter.typeData, []);
            _.set(filter, `typeDataDetails.data.${filter.typeData}`, _.sortBy(data, (d) => d.label.toLowerCase()));
          }
        }

        filterData.reportFilters.data = filters;
        filterData.reportFilters.allowedDays = allowedDays;

        callback(filterData);
      });

}


exports.getFilterData = getFilterData;

