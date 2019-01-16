'use strict';

const find = require('../../lib/couch/selectWithProjection');
const _ = require('lodash');
const date = require('../../lib/helpers/dates');
const findStatus = require('../../lib/helpers/findStatus');
const func = require('../../applications/WASL/mappingFunctions/ejariData/getEjariData');
const pg = require('../../core/api/connectors/postgress');
const typeDataRepo = require('../../lib/repositories/typeData');
const amountFormat = require('../../lib/helpers/amountFormat');


function ejariReport(payload) {
    return new Promise((resolve, reject) => {
        let criteria = { body:{}};
        if(!_.isEmpty(payload.query)){
            if(!_.isEmpty(payload.query.fromDate)){
                criteria.body.fromDate = _.get(payload.query,'fromDate.$gte','');
            }
            if(!_.isEmpty(payload.query.toDate)){
                criteria.body.toDate = _.get(payload.query,'toDate.$lte','');
            }
            if(!_.isEmpty(payload.query.ejariNumber)){
                criteria.body.ejariNumber = _.get(payload.query,'ejariNumber.$in[0]','');
            }
            if(!_.isEmpty(payload.query.contractRef)){
                criteria.body.contractRef = _.get(payload.query,'contractRef.$in[0]','');
            }
        }

        let queryfull = `SELECT kyc."tranxData" -> 'SDG' ->> 'emailID' as "email",
                         kyc."tranxData" -> 'SDG' ->> 'mobileNumber' as "mobile",
                         kyc."tranxData" -> 'SDG' ->> 'emiratesID' as "emiratesID",
                         contract."tranxData" ->> 'contractReference'  as "contractReference",
                         contract."tranxData" ->> 'CRMTicketNo'  as "CRMNo",
                         contract."tranxData" ->> 'tenantName'  as "tenantName",
                         contract."tranxData" ->> 'contractAmount'  as "contractAmount",
                         contract."tranxData" ->> 'paymentMethod'  as "paymentMethod",
                         contract."tranxData" ->> 'businessPartnerNumber'  as "businessPartnerNumber",
                         contract."tranxData" ->> 'contractStatus'  as "contractStatus",
                         contract."tranxData" -> 'ejariData' ->> 'ejariNumber' as "ejariNumber",
                         contract."tranxData" -> 'ejariData' ->> 'ejariStatus' as "ejariStatus",
                         contract."tranxData" -> 'ejariData' ->> 'ejariTerminationStatus' as "ejariTerminationStatus"
                         FROM "Contracts" as contract, "kycCollections" as kyc
                         where contract."tranxData" ->> 'EID' = kyc."tranxData" -> 'SDG' ->> 'emiratesID'`;

        // if (criteria.body && criteria.body.toDate && criteria.body.fromDate) {
        //     let fromdate = criteria.body.fromDate;
        //     let todate = criteria.body.toDate;
        //     queryfull += ` AND (contract."tranxData" ->> 'tranDate')::bigint between ${fromdate} and ${todate}`;
        // }

        if(!_.isEmpty(criteria.body.contractRef)){
            queryfull += ` AND contract."tranxData" ->> 'contractReference' = '${criteria.body.contractRef}'`;
        }

        if(!_.isEmpty(criteria.body.ejariNumber)){
            queryfull += ` AND contract."tranxData" -> 'ejariData' ->> 'ejariNumber' = '${criteria.body.ejariNumber}'`;
        }
        pg.connection()
            .then((conn) => {
            Promise.all([
                conn.query(queryfull, []),
                valueMap()
            ])
                .then((data) => {
                    let Data = _.get(data[0], 'rows', []);
                    Data = formatter(Data,data[1]);

                    resolve(
                        {
                            totalTransactions: Data.length,
                            criteria: payload.criteria,
                            couchData: Data,
                            content: payload.content
                        });
                });
        }).catch((err) => {
            console.log("ERROR : ", err)
            reject(err);
        });
    });
}


function formatter(data,typeData){
    let formatedData = [];
    let obj;
    for(let val of data){
        obj = {};
        obj.ContractRef = _.get(val,'contractReference','');
        obj.CRMRef = _.get(val,'CRMTicketNo','');
        obj.TenantName = _.get(val,'tenantName','');
        obj.Mobile = _.get(val,'mobile','');
        obj.Email = _.get(val,'email','');
        obj.EmiratesID = _.get(val,'emiratesID','');
        obj.BusinessPartnerNo = _.get(val,'businessPartnerNumber','');
        obj.ContractStatus = _.get(_.find(typeData, {value: _.get(val,'contractStatus','') }), 'label', '');
        obj.Amount = amountFormat(+_.get(val,'contractAmount',''));
        obj.EjariNumber =  _.get(val,'ejariNumber','');
        obj.EjariStatus = _.get(val,'ejariStatus','');
        obj.EjariTerminationStatus  = _.get(val,'ejariTerminationStatus','');
        formatedData.push(obj);
    }

    return formatedData;
}


function valueMap(){
    return typeDataRepo.findFields("Contract_Status")
        .then((res) => _.get(res,'data.Contract_Status',[]))
}


module.exports = ejariReport;

