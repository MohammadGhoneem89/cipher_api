var logger = require('../../lib/helpers/logger')().app;

var Validate = require("../../validation/validate.js");
var validType = require("../../validation/validationFields");
var pointer = require("json-pointer");
const commissionPolicy = require('../getCommissionPolicy');
const config = require('../../config');
const defaultImage = config.get('defaultImage');
const auditLog = require('../../lib/services/auditLog');
const commonConst = require('../../lib/constants/common');
const Date = require('../../lib/helpers/dates');


var entityUpdateOut = function (payload, UUIDKey, route, callback, JWToken) {

    logger.debug(" [ Entit Update ] PAYLOAD : " + JSON.stringify(payload, null, 2));
    logger.debug(" [ Entit Update ] UUID : " + UUIDKey);
    logger.debug(" [ Entit Update ] Route : " + route);
    logger.debug(" [ Entit Update ] JWToken : " + JSON.stringify(JWToken, null, 2));

    orgUpdate(payload, JWToken._id, callback);


}

var orgUpdate = function (payload, userID, entityUpdateCB) {

    logger.debug(" [ Entity Update ] Entity data in request : " + JSON.stringify(payload, 2));
    var response = {
        "responseMessage": {
            "action": "entityUpdate",
            "data": {
                "message": {
                    "status": "ERROR",
                    "errorDescription": "Entity not Updated",
                    "displayToUser": true
                }
            }
        }
    };

    var data = payload.data;

    var format = {
        "entityName": "",
        "arabicName": "",
        "spCode": "",
        "shortCode": "",
        "legacyCode": "",
        "services": [
            {
                "serviceName": "",
                "serviceCode": ""
            }
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
            {
                "contactName": "",
                "email": "",
                "mobile": ""
            },
            {
                "contactName": "",
                "email": "",
                "mobile": ""
            }
        ],
        "documents": [
            {
                "documentName": "",
                "fileType": "",
                "retreivalPath": "",
                "documentHash": ""
            }
        ],
        "actions": [],
     //   "dateCreated": "",
     //  "createdBy": "",
        "dateUpdated": "",
        "updatedBy": "",
        "status": {
            "value": "",
            "type": ""
        },
        "lastReconDate": "",
        "isGRP": "",
        "isCTS": "",
        "POBox" : "",
        "contactType" : ""
    };

    if (data) {
        if (data._id) {
            Validate.formValidate(data, validType.entityValidation, function (err) {
                if (Object.keys(err).length > 0) {
                    logger.debug(" [ Entity Update] Error in Validation : " + JSON.stringify(err));
                    pointer.set(response, "/responseMessage/data/error", err);
                    entityUpdateCB(response);
                }
                else {
                    var date = Date.newDate();
                    var id = data["_id"];
                    delete data["_id"];

                    format.entityName = data.entityName ? data.entityName : "";
                    format.arabicName = data.arabicName ? data.arabicName : "";
                    format.spCode = data.spCode ? data.spCode : "";
                    format.shortCode = data.shortCode ? data.shortCode : "";
                    format.legacyCode = data.legacyCode ? data.legacyCode : "";
                    for (var i = 0; i < data.services.length; i++) {
                        format.services.push({
                            "serviceName": data.services[i]["serviceName"],
                            "serviceCode": data.services[i]["serviceCode"]
                        });
                    }
                    format.isActive = data.isActive ? data.isActive : "";
                    format.entityLogo.sizeSmall = data.entityLogo.sizeSmall ? data.entityLogo.sizeSmall : "";
                    format.entityLogo.sizeMedium = data.entityLogo.sizeMedium ? data.entityLogo.sizeMedium : "";
                    format.parentEntity = data.parentEntity ? data.parentEntity : "";
                    format.accounting.GISAccountNo = data.accounting.GISAccountNo ? data.accounting.GISAccountNo : "";
                    format.accounting.exemptedTillDate = data.accounting.exemptedTillDate ? data.accounting.exemptedTillDate : "";
                    format.accounting.notifyBeforeMonth = data.accounting.notifyBeforeMonth ? data.accounting.notifyBeforeMonth : "";
                    format.commissionTemplate = data.commissionTemplate ? data.commissionTemplate : "";
                    if (Object.keys(data["recon"]).length > 0) {
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
                    for (var i = 0; i < data.contacts.length; i++) {
                        format.contacts.push({
                            "contactName": data.contacts[i]["contactName"],
                            "email": data.contacts[i]["email"],
                            "mobile": data.contacts[i]["mobile"]
                        });
                    }
                    for (var i = 0; i < data.documents.length; i++) {
                        format.documents.push({
                            "documentName": data.documents[i]["documentName"],
                            "fileType": data.documents[i]["fileType"],
                            "retreivalPath": data.documents[i]["retreivalPath"],
                            "documentHash": data.documents[i]["documentHash"]
                        });
                    }
                    for (var i = 0; i < data.actions.length; i++) {
                        format.actions.push({
                            "name": data.actions[i]["name"],
                            "actionURI": data.actions[i]["actionURI"],
                            "params": data.actions[i]["params"],
                            "icon": data.actions[i]["icon"]
                        });
                    }
                    format.dateCreated = data["dateCreated"];
                    format.createdBy = data["createdBy"];
                    format.dateUpdated = date;
                    format.updatedBy = userID;
                    format.status.value = data.status.value ? data.status.value : "Pending";
                    format.status.type = data.status.type ? data.status.type : "Info";
                    format.lastReconDate = data.lastReconDate ? data.lastReconDate : "";
                    format.isGRP = data.isGRP ? data.isGRP : "";
                    format.isCTS = data.isCTS ? data.isCTS : "";
                    format.POBox = data.POBox ? data.POBox : "";
                    format.contactType = data.contactType ? data.contactType : "";


                    global.db.select("Entity", {
                        "id": id
                    }, "", function (err, entityData) {
                        if (err) {
                            logger.error(" [ Entity Update ] Get ERROR : " + err);
                            entityUpdateCB(response);
                        }
                        else if (entityData.length == 0) {
                            logger.error(" [ Entity Update ] Entity Data is not available : " + entityData);
                            entityUpdateCB(response);
                        }
                        else {
                            var date = Date.newDate();
                            entityData = entityData[0];
                            data["dateUpdated"] = date;
                            data["updatedBy"] = userID;
                            if (!data.isActive) {
                                data.isActive = false;
                            }
                            else {
                                data.isActive = true;
                            }
                            var docDate = entityData["dateUpdated"];
                            if (docDate < date) {
                                global.db.update("Entity", {
                                    "id": id
                                }, format, function (err) {
                                    if (err) {
                                        logger.error(" [ Entity Update ] Entity is not updated : " + err);
                                        entityUpdateCB(response);
                                    }
                                    else {
                                        var auditData = {};
                                        if (entityData) {
                                            auditData = {
                                                event: commonConst.auditLog.eventKeys.update,
                                                collectionName: 'Entity',
                                                ipAddress: payload.ipAddress,
                                                current: payload.data,
                                                previous: entityData,
                                                createdBy: userID
                                            };
                                            auditLog.create(auditData);
                                            response["responseMessage"]["data"]["message"]["status"] = "OK";
                                            response["responseMessage"]["data"]["message"]["errorDescription"] = "Entity Successfully Updated";
                                            response["responseMessage"]["data"]["message"].newPageURL = "/entitySearch";
                                            entityUpdateCB(response);

                                            setTimeout(function(){commissionPolicy.findPolicy(payload.data._id)},100)
                                        }

                                        /*if (payload.data.commissionTemplate!=""){
                                         //setTimeout(function(){commissionPolicy.findPolicy(payload.data.commissionTemplate)},100)
                                         }*/
                                    }
                                });
                            } else {
                                logger.error(" [ Entity Update ] Document is already modified : " + JSON.stringify(docDate) + " > " + JSON.stringify(date));
                                entityUpdateCB(response);
                            }
                        }
                    });

                }
            })

        }
        else {
            logger.error(" [ Entity Update ] ID is not available in updated data : " + JSON.stringify(data));
            entityUpdateCB(response);
        }
    }
    else {
        logger.error(" [ Entity Update ] Data is not define for update ... " + data);
        entityUpdateCB(response);
    }
}


exports.entityUpdateOut = entityUpdateOut;


