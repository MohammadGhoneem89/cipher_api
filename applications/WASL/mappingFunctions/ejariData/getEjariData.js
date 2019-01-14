const dates = require('../../../../lib/helpers/dates');
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');



function getEjariData(payload, UUIDKey, route, callback, JWToken) {

    console.log("Entry Recived"+JSON.stringify(payload))
    let query ;
    let res = {"contractDetail": {}};
    let ejariNumber = ``;
    let ContractRef = ``;

    if(!_.isEmpty(payload.ejariNumber)){
        ejariNumber = ` AND "tranxData" -> 'ejariData' ->> 'ejariNumber' = '${payload.ejariNumber}'`;
    }

    query = `SELECT json_agg(res.*) as data FROM (SELECT "tranxData" ->> 'contractID' as contractID,
        "tranxData" ->> 'contractAmount' as contractAmount,
        "tranxData" ->> 'contractStartDate' as contractStartDate,
        "tranxData" ->> 'contractEndDate' as contractEndDate,
        "tranxData" ->> 'contractStatus' as contractStatus,
        "tranxData" ->> 'oldEjariNumber' as oldEjariNumber,
        "tranxData" ->> 'paymentCount' as paymentCount,
        "tranxData" ->> 'businessPartnerNumber' as businessPartnerNumber,
        "tranxData" ->> 'CRMTicketNo' as CRMTicketNo,
        "tranxData" ->> 'contractReference' as contractReference,
        "tranxData" ->> 'userReferenceNumber' as userReferenceNumber,
        "tranxData" -> 'ejariData' ->> 'ejariNumber' as ejariNumber,
        "tranxData" -> 'ejariData' ->> 'ejariStatus' as ejariStatus,
        "tranxData" -> 'ejariData' ->> 'ejariTerminationStatus' as ejariTerminationStatus,
        "tranxData" -> 'ejariData' ->> 'ejariHash' as ejariHash,
        "tranxData" -> 'ejariData' ->> 'signedEjariHash' as signedEjariHash,
        "tranxData" -> 'ejariData' ->> 'tenantNumber' as tenantNumber
        FROM "Contracts" WHERE 1=1 ${ejariNumber}) as res`;
    pg.connection().then((conn) => {
        return conn.query(query, [])
            .then((ejariData) => {
            let Data = ejariData.rows[0] || {};
                Data = Data.data || [];
                res.contractDetail = ejariFormatter(Data);
                return callback(res);
        });
    }).catch((err) => {
        callback(err);
    });
}

function getInstrumentList(payload, UUIDKey, route, callback, JWToken) {
    let query = '';
    let res = {
        page : {},
        paymentInstruments : []
    };

    let queryData = `SELECT json_agg(res.*) as data FROM (SELECT "tranxData" ->> 'bankCode' as bankCode,
        "tranxData" ->> 'paymentMethod' as paymentMethod,
        "tranxData" ->> 'instrumentID' as instrumentID,
        "tranxData" ->> 'status' as status,
        "tranxData" ->> 'date' as date,
        "tranxData" ->> 'amount' as amount,
        "tranxData" ->> 'cancellationReason' as cancellationReason,
        "tranxData" ->> 'replacementReason' as replacementReason,
        "tranxData" ->> 'newInstrumentRefNo' as newInstrumentRefNo,
        "tranxData" ->> 'oldInstrumentRefNo' as oldInstrumentRefNo,
        "tranxData" ->> 'failureReasonCode' as failureReasonCode,
        "tranxData" ->> 'failureDescription' as failureDescription,
        "tranxData" ->> 'legacyStatus' as legacyStatus
        
         FROM "PaymentInstruments" WHERE 1=1`

    if (payload.body && payload.body.toDate && payload.body.fromDate) {
        let fromdate = dates.ddMMyyyyFromDate(payload.body.fromDate) / 1000;
        let todate = dates.ddMMyyyyFromDate(payload.body.toDate) / 1000;
        query += ` AND "tranxData" ->> 'date' between  '${fromdate}' AND '${todate}' `;
    }

    let queryCriteriaFull = queryData + query;

    if (payload.page) {
        queryCriteriaFull += ` order by "tranxData" ->> 'date' desc limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}) as res`;
    }

    pg.connection().then((conn) => {
        return conn.query(queryCriteriaFull, [])
            .then((instrumentData) => {
            let Data = _.get(instrumentData, 'rows[0].data', []);
            let formattedData = instrumentFormatter(Data);
            res.page.pageSize = payload.page.pageSize;
            res.page.currentPageNo = payload.page.currentPageNo;
            res.page.totalRecords = formattedData.length;
            res.paymentInstruments = formattedData;
            return callback(res);
        });
    }).catch((err) => {
        callback(err);
    });
}

function getBouncedCheques(payload, UUIDKey, route, callback, JWToken) {
    let query = '';
    let res = {
       page : {},
       bouncedCheques : {}
    };

    let queryData = `SELECT json_agg(res.*) as data FROM (SELECT "tranxData" ->> 'bankCode' as bankCode,
        "tranxData" ->> 'paymentMethod' as paymentMethod,
        "tranxData" ->> 'instrumentID' as instrumentID,
        "tranxData" ->> 'date' as date,
        "tranxData" ->> 'amount' as amount
         FROM "PaymentInstruments" WHERE 1=1 `


    if (payload.body && payload.body.toDate && payload.body.fromDate) {
        let fromdate = dates.ddMMyyyyFromDate(payload.body.fromDate) / 1000;
        let todate = dates.ddMMyyyyFromDate(payload.body.toDate) / 1000;
        query += ` AND "tranxData" ->> 'date' between  '${fromdate}' AND '${todate}' AND "tranxData" ->> 'status' = '001' `;
    }

    let queryCriteriaFull = queryData + query;

    if (payload.page) {
        queryCriteriaFull += ` order by "tranxData" ->> 'date' desc limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}) as res`;
    }

    pg.connection().then((conn) => {
        return conn.query(queryCriteriaFull, [])
            .then((bouncedChequeData) => {
                let Data = _.get(bouncedChequeData, 'rows[0].data', []);
                let formattedData = bouncedChequesFormatter(Data);
                res.page.pageSize = payload.page.pageSize;
                res.page.currentPageNo = payload.page.currentPageNo;
                res.page.totalRecords = formattedData.length;
                res.bouncedCheques = formattedData;
                return callback(res);
            });
    }).catch((err) => {
        callback(err);
    });
}



function ejariFormatter(data){
    let array = [];
    let obj;
    if(data) {
        for (let i = 0; i < data.length; i++) {
            obj = { ejariData : {ejariAttributes : {}}};
            obj.contractID = _.get(data[i], 'contractid', '');
            obj.contractAmount = _.get(data[i], 'contractamount', '');
            obj.contractStartDate = dates.MMddyyyy(+_.get(data[i], 'contractstartdate', ''));
            obj.contractEndDate = dates.MMddyyyy(+_.get(data[i], 'contractenddate', ''));
            obj.contractStatus = _.get(data[i], 'contractstatus', '');
            obj.oldEjariNumber = _.get(data[i], 'oldejarinumber', '');
            obj.paymentCount = _.get(data[i], 'paymentcount', '');
            obj.userReferenceNumber = _.get(data[i], 'userreferencenumber', '');
            obj.ejariData.ejariNumber = _.get(data[i], 'ejarinumber', '');
            obj.ejariData.ejariStatus = _.get(data[i], 'ejaristatus', '');
            obj.ejariData.terminationStatus = _.get(data[i], 'ejariterminationstatus', '');
            obj.ejariData.ejariAttributes = _.get(data[i], 'ejariattributes', {});
            obj.ejariData.ejariHash = _.get(data[i], 'ejarihash', '');
            obj.ejariData.signedEjariHash = _.get(data[i], 'signedejarihash', '');
            obj.ejariData.tenantNumber = _.get(data[i], 'tenantnumber', '');
            obj.businessPartnerNumber = _.get(data[i], 'businesspartnernumber', '');
            obj.contractReference = _.get(data[i], 'contractreference', '');
            obj.CRMTicketNo = _.get(data[i], 'crmticketno', '');
            array.push(obj);
        }
    }
    return array;
}

function instrumentFormatter(data){
    let array = [];
    let obj ;
    if(data){
        for(let i=0 ; i < data.length ; i++){
            obj = { bankMetaData : {}, providerMetaData : {} };
            obj.bankCode = data[i].bankcode;
            obj.paymentMethod = data[i].paymentmethod;
            obj.instrumentID = data[i].instrumentid;
            obj.status = data[i].status;
            obj.date = dates.MMddyyyy(+data[i].date);
            obj.amount = data[i].amount;
            obj.cancellationReason = data[i].cancellationreason;
            obj.replacementReason = data[i].replacementreason;
            obj.bankMetaData.registrationNo = _.get(data[i],'registrationNo','');
            obj.bankMetaData.MICR = _.get(data[i],'MICR','');
            obj.bankMetaData.paymentID = _.get(data[i],'paymentID','');
            obj.legacyStatus = data[i].legacystatus;
            obj.newInstrumentRefNo = data[i].newInstrumentrefno;
            obj.oldInstrumentRefNo = data[i].oldInstrumentrefno;
            obj.failureReasonCode = data[i].failurereasoncode;
            obj.failureDescription = data[i].failuredescription;
            array.push(obj);
        }
    }
    return array;
}

function bouncedChequesFormatter(data){
    let array = [];
    let obj ;
    if(data){
        for(let i=0 ; i < data.length ; i++){
            obj = {};
            obj.bankCode = _.get(data[i],'bankcode', '');
            obj.paymentMethod = _.get(data[i],'paymentmethod', '');
            obj.instrumentID = _.get(data[i],'instrumentID', '');
            obj.date = dates.MMddyyyy(+_.get(data[i],'date', ''));
            obj.amount = _.get(data[i],'amount', '');
            array.push(obj);
        }
    }
    return array;
}

exports.getEjariData = getEjariData;
exports.getInstrumentList = getInstrumentList;
exports.getBouncedCheques = getBouncedCheques;