'use strict';

const TypeData = require('../lib/repositories/typeData');
const reportsCriteria = require('../lib/repositories/reportsCriteria');
const _ = require('lodash');

function getFilterData(id) {
    const filterData = {
        reportFilters: {
            data: []
        }
    };
    let filters;
    id = id || null;
    return reportsCriteria.findOne(id)
        .then((data) => {
            filters = data.filters;
            return TypeData.select({ typeName: { '$in': _.map(data.filters, 'typeData') } });
        })
        .then((typeData) => {
            for (let filter of filters) {
                filter = filter || {};
                filter.typeDataDetails = _.find(typeData, { typeName: filter.typeData });
                filter.typeData = filter.typeData || '';
                const data = _.get(_.get(filter, 'typeDataDetails.data', {}), filter.typeData, []);
                if (data.length) {
                    _.set(filter, `typeDataDetails.data.${filter.typeData}`, _.sortBy(data, (d) => d.label.toLowerCase()));
                }
            }
            filterData.reportFilters.data = filters;
            return filterData;
        });

}

module.exports = getFilterData;

