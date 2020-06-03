'use strict';
var logger = require('../../../lib/helpers/logger')().app;

var Validate = require("../../validation/validate.js");
var validType = require("../../validation/validationFields");
var pointer = require("json-pointer");
const config = require('../../../config');
const defaultImage = config.get('defaultImage');
const auditLog = require('../../../lib/services/auditLog');
const commonConst = require('../../../lib/constants/common');
const Date = require('../../../lib/helpers/dates');

let entityUpdateOut = function (payload, UUIDKey, route, callback, JWToken) {
  logger.debug(" [ Entit Update ] PAYLOAD : " + JSON.stringify(payload, null, 2));
  logger.debug(" [ Entit Update ] UUID : " + UUIDKey);
  logger.debug(" [ Entit Update ] Route : " + route);
  logger.debug(" [ Entit Update ] JWToken : " + JSON.stringify(JWToken, null, 2));
  orgUpdate(payload, JWToken._id, callback);

};

function orgUpdate(payload, userID, entityUpdateCB) {

  logger.debug(" [ Entity Update ] Entity data in request : " + JSON.stringify(payload, 2));
  let response = {
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

  let data = payload.data;

  let format = {
    "entityName": "",
    "arabicName": "",
    "spCode": "",
    "shortCode": "",
    "orgType": "",
    "isActive": "",
    "entityLogo": {
      "sizeSmall": "",
      "sizeMedium": ""
    },
    "parentEntity": "",
    "commissionTemplate": "",
    "contacts": [],
    "documents": [],
    "dateCreated": "",
    "createdBy": "",
    "dateUpdated": "",
    "updatedBy": "",
    "status": {},
    "actions": []
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
          let date = Date.newDate();
          let id = data["_id"];
          delete data["_id"];
          format.taxNO1 = data.taxNO1 ? data.taxNO1 : "";
          format.taxNO2 = data.taxNO2 ? data.taxNO2 : "";
          format.address = data.address ? data.address : "";
          format.publicKey = data.publicKey ? data.publicKey : "";
          format.entityName = data.entityName ? data.entityName : "";
          format.arabicName = data.arabicName ? data.arabicName : "";
          format.spCode = data.spCode ? data.spCode : "";
          format.shortCode = data.shortCode ? data.shortCode : "";
          format.orgType = data.orgType;
          format.isActive = data.isActive ? data.isActive : "";
          format.entityLogo.sizeSmall = data.entityLogo ? data.entityLogo.sizeSmall : "";
          format.entityLogo.sizeMedium = data.entityLogo ? data.entityLogo.sizeMedium : "";
          format.parentEntity = data.parentEntity ? data.parentEntity : "";
          format.cycle = data.cycle ? data.cycle : "";
          format.currency = data.currency ? data.currency : "";
          format.clientKey = data.clientKey;
          format.commissionTemplate = data.commissionTemplate ? data.commissionTemplate : "";
          for (let i = 0; i < data.contacts.length; i++) {
            format.contacts.push({
              "contactName": data.contacts[i]["contactName"],
              "email": data.contacts[i]["email"],
              "mobile": data.contacts[i]["mobile"]
            });
          }
          for (let i = 0; i < data.documents.length; i++) {
            format.documents.push({
              "documentName": data.documents[i]["documentName"],
              "fileType": data.documents[i]["fileType"],
              "retreivalPath": data.documents[i]["retreivalPath"],
              "documentHash": data.documents[i]["documentHash"]
            });
          }
          for (let i = 0; i < data.actions.length; i++) {
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
          format.contactType = data.contactType ? data.contactType : "";


          global.db.select("Entity", {
            "id": id
          }, "", function (err, entityData) {
            if (err) {
              logger.error(" [ Entity Update ] Get ERROR : " + err);
              entityUpdateCB(response);
            }
            else if (entityData.length === 0) {
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
                      response["responseMessage"]["data"]["message"].newPageURL = "/orgSearch";
                      entityUpdateCB(response);
                    }
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


