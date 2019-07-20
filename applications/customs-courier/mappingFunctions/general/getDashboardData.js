'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const moment = require('moment');
const _ = require('lodash');

exports.getDashboardData = async (payload, UUIDKey, route, callback, JWToken) => {

//
    let response = {
        "getDashboardData": {
            "action": "getDashboardData",
            "data": {
                "summary": {"couriers": 1, "orders": 50, "returns": 1},
                "orderTracking": {
                    "finalized": 0,
                    "hawbCreated": 0,
                    "exportCleared": 0,
                    "delivered": 0,
                    "returnByCustomer": 0,
                    "undelivered": 0,
                    "importCleared": 0,
                    "partialReturn": 0,
                    "fullReturn": 0
                },
                "filterCriteria": "HS Codes",
                "topStats": [],
                "analysisByValue": {"return": 0, "delivered": 0},
                "courierByValue": []
            }
        }
    };
    try {
        const conn = await pg.connection();
        console.log('date ', payload.searchCriteria);
        console.log('startDate ', new Date(payload.searchCriteria.startDate), new Date(payload.searchCriteria.startDate).setTime(0));
        let searchCriteria = _.get(payload, 'searchCriteria', undefined);
        let startDate, endDate;
        if (searchCriteria && searchCriteria.startDate && searchCriteria.endDate) {
            startDate = searchCriteria.startDate;
            endDate = searchCriteria.endDate;
        } else {
            console.log('inside ');
            startDate = moment().subtract(29, 'days').startOf('day');
            endDate = moment().startOf('day');
        }
        let totalCuriersQ = `select count(distinct(x.courierorgcode)) as courierorgcode, count(distinct(x.ecommerceorgcode)) as ecommerceorgcode, count(x.id) as totalorders,
                       sum(x.partialreturn) + sum(x.fullreturn) as totalreturns, sum(x.finalize) as finalize, sum(x.hawbcreated) as hawbcreated,
                       sum(x.expertcreated) as expertcreated, sum(x.delivered) as delivered, sum(x.returnbycustomer) as returnbycustomer,
                       sum(x.undelivered) as undelivered, sum(x.importcleaned) as importcleaned, sum(x.partialreturn) as partialreturn, 
                       sum(x.fullreturn) as fullreturn 
                       from dashboardsummaryreport as x where x.orderdate between '${startDate}' and '${endDate}'`;
        console.log(totalCuriersQ);
        const resultDs = await conn.query(totalCuriersQ);
        const resultDsRow = resultDs['rows'][0];
        let hscodeQ = ``;
        if (searchCriteria && searchCriteria.ecommerce === '001') {
            hscodeQ = `select x.ecommerceorgcode as cod, sum(x.totalvalue) as total
                       from dashboardsummaryreport as x where x.orderdate between '${startDate}' and '${endDate}' group by x.ecommerceorgcode`;
        } else if (searchCriteria && searchCriteria.ecommerce === '003') {
            hscodeQ = `select h.countryofdestination as cod, sum(h.totals) as total from hssummaryreport as h 
                       where h.hsdate between '${startDate}' and '${endDate}' group by h.countryofdestination `;
        } else {
            hscodeQ = `select h.hscode as cod, sum(h.totals) as total from hssummaryreport as h 
                       where h.hsdate between '${startDate}' and '${endDate}' group by h.hscode `;
        }
        const hscodeDs = await conn.query(hscodeQ);
        const hscodeResult = hscodeDs['rows'];
        let cbvQ = `select x.courierorgcode as cod, sum(x.totalvalue) as total
                    from dashboardsummaryreport as x where x.orderdate between '${startDate}' and '${endDate}'
                    group by x.courierorgcode`;

        const cbvQDs = await conn.query(cbvQ);
        const cbvQResult = cbvQDs['rows'];

        console.log('hscodeQ', hscodeQ);

        let abvQ = `select (select a.totalvalue from dashboardsummaryreport as a where a.fullreturn > 0 and a.partialreturn > 0) as rtotal,
                    (select a.totalvalue from dashboardsummaryreport as a where a.delivered > 0) as dtotal`;
        const abvDs = await conn.query(abvQ);
        const abvQResult = _.get(abvDs, `['rows'][0]`, []);

        response.getDashboardData.data.summary.couriers = resultDsRow['courierorgcode'] || 0;
        response.getDashboardData.data.summary.orders = resultDsRow['totalorders'] || 0;
        response.getDashboardData.data.summary.returns = resultDsRow['totalreturns'] || 0;
        response.getDashboardData.data.orderTracking.finalized = resultDsRow['finalize'] || 0;
        response.getDashboardData.data.orderTracking.hawbCreated = resultDsRow['hawbcreated'] || 0;
        response.getDashboardData.data.orderTracking.exportCleared = resultDsRow['expertcreated'] || 0;
        response.getDashboardData.data.orderTracking.delivered = resultDsRow['delivered'] || 0;
        response.getDashboardData.data.orderTracking.returnByCustomer = resultDsRow['returnbycustomer'] || 0;
        response.getDashboardData.data.orderTracking.undelivered = resultDsRow['undelivered'] || 0;
        response.getDashboardData.data.orderTracking.importCleared = resultDsRow['importcleaned'] || 0;
        response.getDashboardData.data.orderTracking.partialReturn = resultDsRow['partialreturn'] || 0;
        response.getDashboardData.data.orderTracking.fullReturn = resultDsRow['fullreturn'] || 0;
        response.getDashboardData.data.analysisByValue.delivered = abvQResult['dtotal'] || 0;
        response.getDashboardData.data.analysisByValue.return = abvQResult['rtotal'] || 0;

        for (let hsc of hscodeResult) {
            response.getDashboardData.data.topStats.push({
                label: hsc.cod,
                expAuth: hsc.total
            });
        }
        for (let cbv of cbvQResult) {
            response.getDashboardData.data.courierByValue.push({
                name: cbv.cod,
                value: cbv.total
            });
        }


        return callback(response);
    } catch (error) {
        callback(error.stack);
        throw new Error(error.stack);
    }
};
