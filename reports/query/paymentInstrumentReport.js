'use strict';

const find = require('../../lib/couch/selectWithProjection');
const _ = require('lodash');
const dates = require('../../lib/helpers/dates');
const findStatus = require('../../lib/helpers/findStatus');
const amountFormat = require('../../lib/helpers/amountFormat');
const func = require('../../applications/WASL/mappingFunctions/ejariData/getEjariData');
const typeDataRepo = require('../../lib/repositories/typeData');
const pg = require('../../core/api/connectors/postgress');

function paymentInstrumentReport(payload) {
    return new Promise((resolve, reject) => {
        let criteria = { body:{}, page : { pageSize : 10000, currentPageNo: 1}};
        if(!_.isEmpty(payload.query)){
            if(!_.isEmpty(payload.query.fromDate)){
                criteria.body.fromDate = _.get(payload.query,'fromDate.$gte','');
            }
            if(!_.isEmpty(payload.query.toDate)){
                criteria.body.toDate = _.get(payload.query,'toDate.$lte','');
            }
            if(!_.isEmpty(payload.query.contractRef)){
                criteria.body.contractRef = _.get(payload.query,'contractRef.$in[0]','');
            }
            if(!_.isEmpty(payload.query.instrumentStatus)){
                criteria.body.status = _.get(payload.query,'instrumentStatus.$in[0]','');
            }
            if(!_.isEmpty(payload.query.paymentMethod)){
                criteria.body.paymentMethod = _.get(payload.query,'paymentMethod.$in[0]','');
            }
        }

        let queryfull = `SELECT kyc."tranxData" -> 'SDG' ->> 'emailID' as "email",
                         kyc."tranxData" -> 'SDG' ->> 'mobileNumber' as "mobile",
                         kyc."tranxData" -> 'SDG' ->> 'emiratesID' as "emiratesID",
                         contract."tranxData" ->> 'contractReference'  as "contractReference",
                         contract."tranxData" ->> 'CRMTicketNo'  as "CRMNo",
                         contract."tranxData" ->> 'tenantName'  as "tenantName",
                         contract."tranxData" ->> 'tranDate'  as "tranDate",
                         payment."tranxData" ->> 'bankCode' as "bank",
                         payment."tranxData" -> 'bankMetaData' ->> 'ApprovalNo' as "DDSPreApproveNo",
                         payment."tranxData" ->> 'amount' as "amount",
                         payment."tranxData" ->> 'paymentMethod' as "paymentMethod",
                         payment."tranxData" -> 'date' as "dueDate",
                         payment."tranxData" -> 'status' as "status"
                         FROM "Contracts" as contract, "kycCollections" as kyc, "PaymentInstruments" as payment
                         where contract."tranxData" ->> 'EIDA' = kyc."tranxData" -> 'SDG' ->> 'emiratesID' 
                         and contract."tranxData" ->> 'contractID' = payment."tranxData" ->> 'contractID'`;

        if (criteria.body && criteria.body.toDate && criteria.body.fromDate) {
            let fromdate = criteria.body.fromDate;
            let todate = criteria.body.toDate;
            queryfull += ` AND (contract."tranxData" ->> 'tranDate')::bigint between ${fromdate} and ${todate}`;
        }

        if(!_.isEmpty(criteria.body.contractRef)){
            queryfull += ` AND contract."tranxData" ->> 'contractReference' = '${criteria.body.contractRef}'`;
        }

        if(!_.isEmpty(criteria.body.status)){
            queryfull += ` AND payment."tranxData" ->> 'status' = '${criteria.body.status}'`;
        }

        if(!_.isEmpty(criteria.body.paymentMethod)){
            queryfull += ` AND contract."tranxData" ->> 'paymentMethod' = '${criteria.body.paymentMethod}'`;
        }

        if (payload.page) {
            queryfull += ` order by contract."tranxData" ->> 'date' desc limit ${criteria.page.pageSize} OFFSET ${criteria.page.pageSize * (criteria.page.currentPageNo - 1)}) as res`;
        }
        pg.connection()
            .then((conn) => {
                Promise.all([
                    conn.query(queryfull, []),
                    valueMap("Instrument_Status"),
                    valueMap("InstrumentType")
                ])
                    .then((data) => {
                    let Data = _.get(data[0], 'rows', []);
                    Data = formatter(Data,data[1],data[2]);
                    resolve(
                        {
                            totalTransactions: Data.length,
                            criteria: payload.criteria,
                            couchData: Data,
                            content: payload.content
                        });
                });
        }).catch((err) => {
            console.log("ERROR : ", err);
            reject(err);
        });

    });
}


function formatter(data,typeData1,typeData2){
    let formatedData = [];
    let obj;
    let date;
    for(let val of data){
        date = +(_.get(val,'tranDate',0)) * 1000;
                obj = {};
                obj.ContractRef = _.get(val,'contractReference','');
                obj.CRMNo = _.get(val,'CRMNo','');
                obj.TenantName = _.get(val,'tenantName','');
                obj.Mobile = _.get(val,'mobile','');
                obj.Email = _.get(val,'email','');
                obj.EmiratesID = _.get(val,'emiratesID','');
                obj.Bank = _.get(val,'bank','');
                obj.DOSPreApprovedNo = _.get(val,'DDSPreApproveNo','');
                obj.Amount =  amountFormat(+_.get(val,'amount',''));
                obj.InstrumentType =  _.get(_.find(typeData2, {value: _.get(val,'paymentMethod','') }), 'label', '');
                obj.InstrumentNo = _.get(val,'instrumentNo','');
                obj.DueDate  = dates.MMddyyyy(+_.get(val,'dueDate',''));
                obj.TransactionDate  = dates.MMddyyyy(date);
                obj.Status  =_.get(_.find(typeData1, {value: _.get(val,'status','') }), 'label', '');
                formatedData.push(obj);
            }
    return formatedData;
}


function valueMap(name){
    return typeDataRepo.findFields(name)
        .then((res) => _.get(res,`data.${name}`,[]))
}



module.exports = paymentInstrumentReport;

