
const logger = require('../../lib/helpers/logger')().app;

const Validate = require("../../validation/validate.js");
const validType = require("../../validation/validationFields");
const pointer = require("json-pointer");
const auditLog = require('../../lib/services/auditLog');
const commonConst = require('../../lib/constants/common');
const commissionPolicy = require('../getCommissionPolicy');
const Date = require('../../lib/helpers/dates');

var entityInsertOut = function(payload,UUIDKey,route,callback,JWToken){

    logger.debug(" [ Entity Insert ] PAYLOAD : " + JSON.stringify(payload,null,2));
    logger.debug(" [ Entity Insert ] UUID : " + UUIDKey);
    logger.debug(" [ Entity Insert ] Route : " + route);
    logger.debug(" [ Entity Insert ] JWToken : " + JSON.stringify(JWToken,null,2));

    orgInsert(payload,JWToken._id,callback);


};

var orgInsert = function (payload, userID, entityInsertCB) {

    logger.debug(" [ Entity Insert] Entity Inserted data : " + JSON.stringify(payload));

    var data = payload.data;
    var format = {
        "entityName": "",
        "arabicName": "",
        "spCode": "",
        "shortCode": "",
        "legacyCode": "",
        "services": [
        ],
        "isActive": true,
        "entityLogo": {
            "sizeSmall": "",
            "sizeMedium": ""
        },
        "parentEntity": "",
        "accounting": {
            "GISAccountNo": "",
            "exemptedTillDate": "",
            "notifyBeforeMonth": ""
        },
        "commissionTemplate": "",
        "recon": {
            "isBlockchain": "",
            "isFile": "",
            "isSFTP": "",
            "isService": "",
            "fileFormatTemplate": "",
            "noOfDays": ""
        },
        "settlement": {
            "settlementCriteria": "",
            "settlementType": "",
            "autoPeriod": "",
            "escalationAfter": "2"
        },
        "contacts": [
        ],
        "documents": [
        ],
        "actions": [],
        "dateCreated": "",
        "createdBy": "",
        "dateUpdated": "",
        "updatedBy": "",
        "status" : {
            "value" : "",
            "type" : ""
        },
		"lastReconDate" : "",
        "isGRP" : "",
        "isCTS" : "",
        "POBox" : "",
        "contactType" : ""
    };


    var response = {
        "responseMessage" : {
            "action": "entityInsert",
            "data" : {
                "message" : {
                    "status" : "ERROR",
                    "errorDescription" : "Entity not Inserted",
                    "displayToUser" : true
                }
            }
        }
    }

	global.db.select('Entity',{
		spCode : data.spCode
	},'',function(err,duplicate){
		if(err){
			logger.debug(" [ Acquirer Insert] Error : " + err);
			 entityInsertCB(response);
		}
		else if(duplicate.length > 0){
			var msg = "duplicate records";
			pointer.set(response,"/responseMessage/data/error/spCode",msg);
			 entityInsertCB(response);
		}
		else{
    Validate.formValidate(data,validType.entityValidation,function(err){
        if(Object.keys(err).length > 0){
            logger.debug(" [ Entity Insert] Error in Validation : " + JSON.stringify(err));
            pointer.set(response,"/responseMessage/data/error",err);
            entityInsertCB(response);
        }
        else{

            var date = Date.newDate();
            format.entityName = data.entityName ? data.entityName : "";
            format.arabicName = data.arabicName ? data.arabicName : "";
            format.spCode = data.spCode ? data.spCode : "";
            format.shortCode = data.shortCode ? data.shortCode : "";
            format.legacyCode = data.legacyCode ? data.legacyCode : "";
            for(var i=0 ; i<data.services.length ; i++){
                format.services.push({
                    "serviceName" : data.services[i]["serviceName"],
                    "serviceCode" : data.services[i]["serviceCode"]
                });
            }
            format.isActive = data.isActive ? data.isActive : "";
            format.entityLogo.sizeSmall = data.entityLogo ? data.entityLogo.sizeSmall : "";
            format.entityLogo.sizeMedium = data.entityLogo ? data.entityLogo.sizeMedium : "";
            format.parentEntity = data.parentEntity ? data.parentEntity : "";
            format.accounting.GISAccountNo = data.accounting.GISAccountNo ? data.accounting.GISAccountNo : "";
            format.accounting.exemptedTillDate = data.accounting.exemptedTillDate ? data.accounting.exemptedTillDate : "";
            format.accounting.notifyBeforeMonth = data.accounting.notifyBeforeMonth ? data.accounting.notifyBeforeMonth : "";
            format.commissionTemplate = data.commissionTemplate ? data.commissionTemplate : "";
            if(Object.keys(data["recon"]).length > 0){
                format.recon.isBlockchain = data.recon.isBlockchain ? data.recon.isBlockchain : false;
                format.recon.isFile = data.recon.isFile ? data.recon.isFile : false;
                format.recon.isSFTP = data.recon.isSFTP ? data.recon.isSFTP : false;
                format.recon.isService = data.recon.isService ? data.recon.isService : false;
                format.recon.fileFormatTemplate = data.recon.fileFormatTemplate ? data.recon.fileFormatTemplate : "";
                format.recon.noOfDays = data.recon.noOfDays ? data.recon.noOfDays : "";
            }
            format.settlement.settlementCriteria = data.settlement.settlementCriteria ? data.settlement.settlementCriteria : "";
            format.settlement.settlementType = data.settlement.settlementType ? data.settlement.settlementType : "";
            format.settlement.autoPeriod = data.settlement.autoPeriod ? data.settlement.autoPeriod : "";
            format.settlement.escalationAfter = data.settlement.escalationAfter ? data.settlement.escalationAfter : "";
            for(var i=0 ; i<data.contacts.length ; i++){
                format.contacts.push({
                    "contactName" : data.contacts[i]["contactName"],
                    "email" : data.contacts[i]["email"],
                    "mobile" : data.contacts[i]["mobile"]
                });
            }
            for(var i=0 ; i<data.documents.length ; i++){
                format.documents.push({
                    "documentName" : data.documents[i]["documentName"],
                    "fileType" : data.documents[i]["fileType"],
                    "retreivalPath" : data.documents[i]["retreivalPath"],
                    "documentHash" : data.documents[i]["documentHash"]
                });
            }
            format.actions = [];
            format.dateCreated = date;
            format.createdBy = userID;
            format.dateUpdated = date;
            format.updatedBy = "";
            format.status.value = data.status.value ? data.status.value : "Pending";
            format.status.type = data.status.type ? data.status.type : "Info";
			format.lastReconDate = data.lastReconDate ? data.lastReconDate : "";
            format.isGRP = data.isGRP ? data.isGRP : "";
            format.isCTS = data.isCTS ? data.isCTS : "";
            format.POBox = data.POBox ? data.POBox : "";
            format.contactType = data.contactType ? data.contactType : "";

            global.db.insert("Entity",format,function (err,data) {
                if (err) {
                    logger.debug("[ Entity Insert] ERROR : " + err);
                    entityInsertCB(response);
                }
                else {
                    const params = {
                        event: commonConst.auditLog.eventKeys.insert,
                        collectionName: 'Entity',
                        ipAddress: payload.ipAddress,
                        current: payload.data,
                        createdBy: userID
                    };
                    auditLog.create(params);

                    response["responseMessage"]["data"]["message"]["status"] = "OK";
                    response["responseMessage"]["data"]["message"]["errorDescription"] = "Entity Inserted Successfully";
                    response["responseMessage"]["data"]["message"].newPageURL = "/entitySearch";
                    entityInsertCB(response);

                }
            });
        }
    });
  }
})
}


exports.entityInsertOut = entityInsertOut;


