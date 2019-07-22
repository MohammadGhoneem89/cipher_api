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
                    "FINALIZED": 0,
                    "HAWBCREATED": 0,
                    "EXPORTCLEARED": 0,
                    "DELIVERED": 0,
                    "RETURNBYCUSTOMER": 0,
                    "UNDELIVERED": 0,
                    "IMPORTCLEARED": 0,
                    "PARTIALRETURN": 0,
                    "FULLRETURN": 0
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
        let totalCuriersQ = `select sum(ds.statuscount) as total, 
                            (select count(ds.id) as totalorders from dashboardsummaryreport as ds where orderdate
                            between '${startDate}' and '${endDate}') as totalorders,
                            (select count(distinct(ds.courierorgcode)) from dashboardsummaryreport as ds
                            where orderdate between '${startDate}' and '${endDate}') as totalcourier,
                            (select count(ds.orderstatus) from dashboardsummaryreport as ds where ds.orderstatus = 'FULLRETURN' and orderdate
                            between '${startDate}' and '${endDate}') +
                            (select count(ds.orderstatus) from dashboardsummaryreport as ds where ds.orderstatus = 'PARTIALRETURN' and orderdate
                            between '${startDate}' and '${endDate}') as totalreturn,
                             ds.orderstatus from dashboardsummaryreport as ds where orderdate
                             between '${startDate}' and '${endDate}' group by ds.orderstatus`;

        console.log(totalCuriersQ);
        const resultDs = await conn.query(totalCuriersQ);
        const resultDsRow = resultDs['rows'];
        console.log('resultDsRow', resultDsRow);
        let hscodeQ = ``;
        if (searchCriteria && searchCriteria.ecommerce === '001') {
            hscodeQ = `select x.ecommerceorgcode as cod, sum(x.totalvalue) as total
                       from dashboardsummaryreport as x where x.orderdate between '${startDate}' and '${endDate}' group by x.ecommerceorgcode`;
        } else if (searchCriteria && searchCriteria.ecommerce === '002') {
            hscodeQ = `select h.countryofdestination as cod, sum(h.totals) as total from hssummaryreport as h 
                       where h.hsdate between '${startDate}' and '${endDate}' group by h.countryofdestination `;
        } else if (searchCriteria && searchCriteria.ecommerce === '003') {
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

        let abvQ = `select (select sum(ds.totalvalue) from dashboardsummaryreport as ds where ds.orderstatus = 'DELIVERED' and orderdate
                            between '${startDate}' and '${endDate}') as dtotal,
        (select sum(ds.totalvalue) from dashboardsummaryreport as ds where ds.orderstatus = 'FULLRETURN' and orderdate
                            between '${startDate}' and '${endDate}')
        +
        (select sum(ds.totalvalue) from dashboardsummaryreport as ds where ds.orderstatus = 'PARTIALRETURN' and orderdate
                            between '${startDate}' and '${endDate}') as rtotal;`;
        const abvDs = await conn.query(abvQ);
        const abvQResult = _.get(abvDs, `['rows'][0]`, []);

        response.getDashboardData.data.summary.orders = resultDsRow[0]['totalorders'] || 0;
        response.getDashboardData.data.summary.couriers = resultDsRow[0]['totalcourier'] || 0;
        response.getDashboardData.data.summary.returns = resultDsRow[0]['totalreturn'] || 0;

        for (let elem of resultDsRow) {
            response.getDashboardData.data.orderTracking[elem.orderstatus] = elem.total;
        }

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
        callback({error});
        throw new Error(error.stack);
    }
};
