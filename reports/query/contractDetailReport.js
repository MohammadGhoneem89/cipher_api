'use strict';

const _ = require('lodash');
const dates = require('../../lib/helpers/dates');
const findStatus = require('../../lib/helpers/findStatus');
const amountFormat = require('../../lib/helpers/amountFormat');
const func = require('../../applications/WASL/mappingFunctions/ejariData/getEjariData');
const pg = require('../../core/api/connectors/postgress');
const typeDataRepo = require('../../lib/repositories/typeData');

function contractDetailReport(payload) {
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
            if(!_.isEmpty(payload.query.contractStatus)){
                criteria.body.status = _.get(payload.query,'contractStatus.$in[0]','');
            }
        }

        let queryfull = `SELECT kyc."tranxData" -> 'SDG' ->> 'emailID' as "email",
                         kyc."tranxData" -> 'SDG' ->> 'mobileNumber' as "mobile",
                         kyc."tranxData" -> 'SDG' ->> 'emiratesID' as "emiratesID",
                         contract."tranxData" ->> 'tranDate'  as "tranDate",
                         contract."tranxData" ->> 'contractReference'  as "contractReference",
                         contract."tranxData" ->> 'CRMTicketNo'  as "CRMNo",
                         contract."tranxData" ->> 'tenantName'  as "tenantName",
                         contract."tranxData" ->> 'contractAmount'  as "contractAmount",
                         contract."tranxData" ->> 'contractStartDate'  as "contractStartDate",
                         contract."tranxData" ->> 'contractEndDate'  as "contractEndDate",
                         contract."tranxData" ->> 'paymentMethod'  as "paymentMethod",
                         contract."tranxData" ->> 'businessPartnerNumber'  as "businessPartnerNumber",
                         contract."tranxData" ->> 'contractStatus'  as "contractStatus",
                         contract."tranxData" -> 'ejariData' ->> 'ejariNumber' as "ejariNumber"
                         FROM "Contracts" as contract, "kycCollections" as kyc
                         where contract."tranxData" ->> 'EID' = kyc."tranxData" -> 'SDG' ->> 'emiratesID'`;

        if (criteria.body && criteria.body.toDate && criteria.body.fromDate) {
            let fromdate = criteria.body.fromDate;
            let todate = criteria.body.toDate;
             queryfull += ` AND cast(contract."tranxData" ->> 'tranDate' as bigint) <= ${todate} OR cast(contract."tranxData" ->> 'tranDate' as bigint) >= ${fromdate} `;
        }

        if(!_.isEmpty(criteria.body.contractRef)){
            queryfull += ` AND contract."tranxData" ->> 'contractReference' = '${criteria.body.contractRef}'`;
        }
        if(!_.isEmpty(criteria.body.status)){
            queryfull += ` AND contract."tranxData" ->> 'contractStatus' = '${criteria.body.status}'`;
        }
        if (payload.page) {
            queryfull += ` order by contract."tranxData" ->> 'date' desc limit ${criteria.page.pageSize} OFFSET ${criteria.page.pageSize * (criteria.page.currentPageNo - 1)}) as res`;
        }
        pg.connection()
            .then((conn) => {
                Promise.all([
                    conn.query(queryfull, []),
                    valueMap("Contract_Status"),
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


function formatter(data,typeData,typeData2){
    let formatedData = [];
        let obj;
        for(let val of data){

            obj = {};
            obj.ContractRef = _.get(val,'contractReference','');
            obj.CRMNo = _.get(val,'CRMNo','');
            obj.TenantName = _.get(val,'tenantName','');
            obj.Mobile = _.get(val,'mobile','');
            obj.Email = _.get(val,'email','');
            obj.EmiratesID = _.get(val,'emiratesID','');
            obj.BusinessPartnerNo = _.get(val,'businessPartnerNumber','');
            obj.RentAmount = _.get(val,'contractAmount','');
            obj.TranDate = _.get(val,'tranDate','');
            obj.PaymentMethod = _.get(_.find(typeData2, {value: _.get(val,'paymentMethod','') }), 'label', '');
            obj.EjariNumber = _.get(val,'ejariNumber','');
            obj.Status = _.get(_.find(typeData, {value: _.get(val,'contractStatus','') }), 'label', '');
            obj.ContractStartDate =  dates.MMddyyyy(+_.get(val,'contractStartDate',''));
            obj.ContractEndDate = dates.MMddyyyy(+_.get(val,'contractEndDate',''));
            formatedData.push(obj);
        }
        return formatedData;
}


function valueMap(name){
    return typeDataRepo.findFields(name)
        .then((res) => _.get(res,`data.${name}`,[]))
}

module.exports = contractDetailReport;

