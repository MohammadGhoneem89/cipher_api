'use strict';
const config = require('../../../../config')
const pg = require('../../../../core/api/connectors/postgress');
const logger = require('../../../../lib/helpers/logger')().app;
const _ = require('lodash');
const crypto = require('../../../../lib/helpers/crypto');
const rp = require('request-promise');
const dates = require('../../../../lib/helpers/dates.js')
const moment = require('moment');

function getDashboardData(payload, UUIDKey, route, callback, JWToken) {
    console.log(JSON.stringify(payload));


    var a = moment(payload.body.searchCriteria.fromDate, 'DD/MM/YYYY');
    var b = moment(payload.body.searchCriteria.toDate, 'DD/MM/YYYY');
    let general = {}
    for (var m = moment(a); m.isBefore(b); m.add(1, 'days')) {
        _.set(general, m.format('DD/MM/YYYY'), 0)
    }
    console.log(JWToken.orgCode);
    let queryCnt = `select  to_char(datecreated, 'DD/MM/YYYY') as datecreated,status,sum(occurence)
    from public.dashboard_tx_summary where 
    "to"='${JWToken.orgCode}' group by datecreated,status`;

    let querySummary = `select  to_char(datecreated, 'DD/MM/YYYY') as datecreated,status,sum(occurence), sum(amount) as amount
    from public.dashboard_tx_summary where 
    "to"='${JWToken.orgCode}' group by datecreated,status`;


    let querySummaryPayables = `select  to_char(datecreated, 'DD/MM/YYYY') as datecreated,status,sum(occurence),  sum(amount) as amount
    from public.dashboard_tx_summary where 
    "from"='${JWToken.orgCode}' group by datecreated,status`;

    pg.connection().then((conn) => {
        console.log("Connected to DB successfully !")
        return Promise.all([
            conn.query(queryCnt, []),
            conn.query(querySummary, []),
            conn.query(querySummaryPayables, [])

        ]).then((data) => {

            let result = _.get(data[0], 'rows', []);
            let resultSummary = _.get(data[1], 'rows', []);
            let resultSummaryRecv = _.get(data[2], 'rows', []);
            let listdates = [];
            let listConfirmed = _.cloneDeep(general);
            let listPending = _.cloneDeep(general);
            let listRejected = _.cloneDeep(general);




            result.forEach(element => {
                listdates.push(element.datecreated)
                if (element.status == 'UNCONFIRMED')
                    _.set(listPending, element.datecreated, _.get(listPending, element.datecreated, 0) + parseInt(element.sum))
                if (element.status == 'CONFIRMED')
                    _.set(listConfirmed, element.datecreated, _.get(listConfirmed, element.datecreated, 0) + parseInt(element.sum))
                if (element.status == 'FAILED')
                    _.set(listRejected, element.datecreated, _.get(listRejected, element.datecreated, 0) + parseInt(element.sum))
            });

            let recievables = 0;
            let payables = 0;
            resultSummary.forEach(element => {
                listdates.push(element.datecreated)
                if (element.settlementstatus != 'PAID')
                    payables += parseFloat(element.amount) || 0;
            });
            resultSummaryRecv.forEach(element => {
                listdates.push(element.datecreated)
                if (element.settlementstatus != 'PAID')
                    recievables += parseFloat(element.amount) || 0;
            });
            let finaldates=[]
            let finalConfirm=[]
            for(let key in listConfirmed){
                finaldates.push(key);
                finalConfirm.push(listConfirmed[key]);
            }
            let finalPending=[]
            for(let key in listConfirmed){
                finalPending.push(listPending[key]);
            }

            let finalRejected=[]
            for(let key in listConfirmed){
                finalRejected.push(listRejected[key]);
            }

            let response = {
                "getDashboardData": {
                    "action": "getPartnersList",
                    data: {
                        listdates:finaldates,
                        listConfirmed:finalConfirm,
                        listPending:finalPending,
                        listRejected:finalRejected,
                        recievables,
                        payables
                    }
                }
            };
            return callback(response);
        });
    }).catch((err) => {
        console.log("Some Error occurred while executing query..! ", err);
        return callback(err);
    });
}

exports.getDashboardData = getDashboardData