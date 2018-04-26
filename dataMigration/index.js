let log4js = require('log4js');
let logger = log4js.getLogger('CipherRESTInterface');

let csvjson = require('csvjson');
let fs = require('fs');
let config = require("./config.json");
let _ = require("lodash");
let select = require("../lib/couch/select");



let dataMigration = function (value) {

    let filePath = config[value].path;

    let json = config[value].format;
    logger.info("-----------FilePath   " + JSON.stringify(filePath));
    logger.info("-----------Json   " + JSON.stringify(json));
    let encode = {"encoding": 'utf8'};
    let options = {
        delimiter : ',',
        quote     : '"'
    };


    readFile(filePath,encode)
        .then((fileData) => {
            logger.info("-----------FileData   " + JSON.stringify(fileData));

            let data = csvjson.toObject(fileData, options);
            logger.info("-----------csv to json   " + JSON.stringify(data));

            for(var i of data){
                return dataTransformation(data[i],value)
            }
        })
    .catch((e) => {
        })
};


function dataTransformation(jsonData,value){
    let ePayRef = jsonData.PayRef;
    let query ={};
    query.selector = Object.assign({},{"data.PayRef" : ePayRef});
    if(value === "dispute"){
        query.selector = Object.assign({},{"data.DocumentName" : "DisputeView"});
    }
    if(value === "refund"){
        query.selector = Object.assign({},{"data.DocumentName" : "RefundView"});
    }
    if(value === "transaction"){
        query.selector = Object.assign({},{"data.DocumentName" : "ConsolidatedView"});
    }
    select(config.channelName,query)
    .then((couchData) => {
            couchData = couchData.data.docs || [];
            logger.info("------------>>> couchData   " + JSON.stringify(couchData));
            let mapData = mappingFunctions[value](couchData[0],jsonData);
            logger.info("------------>>> MAPDATa    " + JSON.stringify(mapData));

            //upSert(mapData,config.channelName)

        })
    .catch((e)=>{
        })
}

function readFile(filePath, encode) {
    return new Promise((resolve, reject)=> {
        fs.readFile(filePath, encode, function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}


let format = {};

let mappingFunctions = {
    "dispute" : function(couchData,jsonData){

        couchData.data.DisputeRef = jsonData.DisputeRef || "";
        couchData.data.Status = jsonData.Status || "";
        couchData.data.ISDISPUTEINIT = jsonData.ISDISPUTEINIT || "";
        couchData.data.DISPUTEFRWDTS = jsonData.DISPUTEFRWDTS || "";
        couchData.data.DISPUTEAPRVTS = jsonData.DISPUTEAPRVTS || "";
        couchData.data.DISPUTECNCLTS = jsonData.DISPUTECNCLTS || "";
        couchData.data.DISPUTEAPRVBY = jsonData.DISPUTEAPRVBY || "";
        couchData.data.DISPUTEINITBY = jsonData.DISPUTEINITBY || "";
        couchData.data.DISPUTEFRWDBY = jsonData.DISPUTEFRWDBY || "";
        couchData.data.DISPUTECNCLBY = jsonData.DISPUTECNCLBY || "";
        couchData.data.Comment = jsonData.Comment;
        return couchData;
    },
    "refund" : function(couchData,jsonData){

        couchData.data.RefundRef = jsonData.RefundRef || "";
        couchData.data.Status = jsonData.Status || "";
        couchData.data.REFUNDINITTS = jsonData.REFUNDINITTS || "";
        couchData.data.REFUNDPROCTS = jsonData.REFUNDPROCTS || "";
        couchData.data.REFUNDAPRVTS = jsonData.REFUNDAPRVTS || "";
        couchData.data.REFUNDCNCLTS = jsonData.REFUNDCNCLTS || "";
        couchData.data.REFUNDAPRVBY = jsonData.REFUNDAPRVBY || "";
        couchData.data.REFUNDINITBY = jsonData.REFUNDINITBY || "";
        couchData.data.REFUNDPROCBY = jsonData.REFUNDPROCBY || "";
        couchData.data.REFUNDCNCLBY = jsonData.REFUNDCNCLBY || "";
        couchData.data.Comment = jsonData.Comment;

        return couchData;
    },
    "transaction" : function(couchData,jsonData){

        couchData.data.PayRef = jsonData.PayRef || "";
        couchData.data.ISException = jsonData.ISException || "";
        couchData.data.EntityBillAmount = jsonData.EntityBillAmount || "";
        couchData.data.AuthorizedAmount = jsonData.AuthorizedAmount || "";
        couchData.data.BatchID = jsonData.BatchID || "";
        couchData.data.CommissionBatchID = jsonData.CommissionBatchID || "";
        couchData.data.EntityCommissionAmt = jsonData.EntityCommissionAmt || "";
        couchData.data.AcquirerCommissionAmt = jsonData.AcquirerCommissionAmt || "";
        couchData.data.RefundRef = jsonData.RefundRef || "";
        couchData.data.DisputeRef = jsonData.DisputeRef || "";
        couchData.data.DisputeBatchNo = jsonData.DisputeBatchNo || "";
        couchData.data.PGRefNumber = jsonData.PGRefNumber || "";
        couchData.data.BillerRefNo = jsonData.BillerRefNo || "";
        couchData.data.RefundBatchNo = jsonData.RefundBatchNo || "";

        return couchData;

    }
};




function upSert(doc, targetChannel){

    let finalStatus = false;
    let key = doc._id.split("\u0000");
    let req = {
        "body": {
            "key":key[1],
            "data": doc,
            "channelName" : targetChannel
        }
    };
    let options = {
        method: 'POST',
        uri: getUpsertURL,
        body: req,
        json: true // Automatically stringifies the body to JSON
    };

    rp(options)
        .then(function (parsedBody) {
            logger.debug("==================== UPSERT SUCESS key = " + key[1] + "==================");
            logger.debug(parsedBody);
            logger.debug("=========================================================================");

            finalStatus = true
        })
        .catch(function (err) {
            // POST failed...
            logger.debug("==================== Call for Upsert  failed" + key[1] + "==================" );
            logger.debug(err);
            logger.debug("=========================================================================");

        });
    return finalStatus;
}


module.exports = dataMigration;
