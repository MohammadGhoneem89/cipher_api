'use strict';
const logger = require('../../../lib/helpers/logger')().app;
const Validate = require("../../validation/validate.js");
const validType = require("../../validation/validationFields");
const pointer = require("json-pointer");
const auditLog = require('../../../lib/services/auditLog');
const commonConst = require('../../../lib/constants/common');
const Date = require('../../../lib/helpers/dates');

let entityInsertOut = function (payload, UUIDKey, route, callback, JWToken) {

  logger.debug(" [ Entity Insert ] PAYLOAD : " + JSON.stringify(payload, null, 2));
  logger.debug(" [ Entity Insert ] UUID : " + UUIDKey);
  logger.debug(" [ Entity Insert ] Route : " + route);
  logger.debug(" [ Entity Insert ] JWToken : " + JSON.stringify(JWToken, null, 2));

  orgInsert(payload, JWToken._id, callback);

};

function orgInsert(payload, userID, entityInsertCB) {

  logger.debug(" [ Org Insert] Org Inserted data : " + JSON.stringify(payload));

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
    "status": {}
  };

  let response = {
    "responseMessage": {
      "action": "entityInsert",
      "data": {
        "message": {
          "status": "ERROR",
          "errorDescription": "Entity not Inserted",
          "displayToUser": true
        }
      }
    }
  };

  global.db.select('Entity', {
    spCode: data.spCode
  }, '', function (err, duplicate) {
    if (err) {
      logger.debug(" [ Org Insert] Error : " + err);
      entityInsertCB(response);
    }
    else if (duplicate.length > 0) {
      let msg = "duplicate records";
      pointer.set(response, "/responseMessage/data/error/spCode", msg);
      entityInsertCB(response);
    }
    else {
      Validate.formValidate(data, validType.entityValidation, function (err) {
        if (Object.keys(err).length > 0) {
          logger.debug(" [ Entity Insert] Error in Validation : " + JSON.stringify(err));
          pointer.set(response, "/responseMessage/data/error", err);
          entityInsertCB(response);
        }
        else {

          let date = Date.newDate();
          format.entityName = data.entityName ? data.entityName : "";
          format.arabicName = data.arabicName ? data.arabicName : "";
          format.spCode = data.spCode ? data.spCode : "";
          format.shortCode = data.shortCode ? data.shortCode : "";
          format.orgType = date.orgType;
          format.isActive = data.isActive ? data.isActive : "";
          format.entityLogo.sizeSmall = data.entityLogo ? data.entityLogo.sizeSmall : "";
          format.entityLogo.sizeMedium = data.entityLogo ? data.entityLogo.sizeMedium : "";
          format.parentEntity = data.parentEntity ? data.parentEntity : "";
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
          format.actions = [];
          format.dateCreated = date;
          format.createdBy = userID;
          format.dateUpdated = date;
          format.updatedBy = "";
          format.status.value = data.status.value ? data.status.value : "Pending";
          format.status.type = data.status.type ? data.status.type : "Info";
          format.lastReconDate = data.lastReconDate ? data.lastReconDate : "";
          format.contactType = data.contactType ? data.contactType : "";

          global.db.insert("Entity", format, function (err, data) {
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
              response["responseMessage"]["data"]["message"].newPageURL = "/orgSearch";
              entityInsertCB(response);

            }
          });
        }
      });
    }
  });
}

exports.entityInsertOut = entityInsertOut;

