
var logger = require('../../../lib/helpers/logger')().app;

var Validate = require("../../validation/validate.js");
var validType = require("../../validation/validationFields");
var pointer = require("json-pointer");
const auditLog = require('../../../lib/services/auditLog');
const commonConst = require('../../../lib/constants/common');

var fileTemplateInsertOut = function (payload, UUIDKey, route, callback, JWToken) {

    logger.debug(" [ File Template Insert ] PAYLOAD : " + JSON.stringify(payload, null, 2));
    logger.debug(" [ File Template Insert ] UUID : " + UUIDKey);
    logger.debug(" [ File Template Insert ] Route : " + route);
    logger.debug(" [ File Template Insert ] JWToken : " + JSON.stringify(JWToken, null, 2));

    fileTemplateInsert(payload, JWToken._id, callback);

};


var fileTemplateInsert = function (payload, userID, fileTemplateInsert_CB) {

    logger.debug(" [ Acquirer Insert] Acquirer Inserted data : " + JSON.stringify(payload));

    var data = payload.data;

    var format = {
        "templateName": "",
        "fileType": "",
        "skipLines": "",
        "separator": "",
        "XMLMainTag": "",
        "endpoint": "",
        "table": "",
        "fields": [],
        "dateCreated": "",
        "createdBy": "",
        "dateUpdated": "",
        "updatedBy": ""
    };


    var response = {
        "responseMessage": {
            "action": "fileTemplateInsert",
            "data": {
                "message": {
                    "status": "ERROR",
                    "errorDescription": "File Template not Inserted",
                    "displayToUser": true
                }
            }
        }
    }


    Validate.formValidate(data, validType.fileTemplateValidation, function (err) {
        if (Object.keys(err).length > 0) {
            logger.debug(" [ File Template Insert] Error in Validation : " + JSON.stringify(err));
            pointer.set(response, "/responseMessage/data/error", err);
            fileTemplateInsert_CB(response);
        }
        else {
            var date = new Date();

            format.templateName = data.templateName ? data.templateName : "";
            format.fileNameRegEx = data.fileNameRegEx ? data.fileNameRegEx : "\w+";
            format.fileType = data.fileType ? data.fileType : "";
            format.skipLines = data.skipLines ? data.skipLines : "";
            format.separator = data.separator ? data.separator : "";
            format.XMLMainTag = data.XMLMainTag ? data.XMLMainTag : "";
            format.endpoint = data.endpoint ? data.endpoint : "";
            format.table = data.table ? data.table : "";
            for (var i = 0; i < data.fields.length; i++) {
                let field = data.fields[i];
                let fieldType = field.type;
                format.fields.push({
                    "columnNo": field.columnNo,
                    "fieldNameTag": field.fieldNameTag,
                    "fieldName": field.fieldName,
                    "type": {
                        "required": fieldType ? fieldType.required : "",
                        "format": fieldType ? fieldType.format : "",
                        "maxlength": fieldType ? fieldType.maxlength : "",
                        "dataType": fieldType ? fieldType.dataType : ""
                    },
                    "internalField": field.internalField,
                    "functionName": field.functionName,
                    "specialFunction": field.specialFunction,
                    "param1": field.param1,
                    "param2": field.param2
                });
            }
            format.dateCreated = date;
            format.createdBy = userID;
            format.dateUpdated = date;
            format.updatedBy = userID;

            format.rulesList = data.rulesList

            global.db.insert("FileTemplate", format, function (err) {
                if (err) {
                    logger.debug("[ File Template Insert] ERROR : " + err);
                    fileTemplateInsert_CB(response);
                }
                else {

                    const params = {
                        event: commonConst.auditLog.eventKeys.insert,
                        collectionName: 'File Template',
                        ipAddress: payload.ipAddress,
                        current: payload.data,
                        createdBy: userID
                    };
                    auditLog.create(params);

                    logger.debug(" [ File Template Insert] Inserted data in DB : " + JSON.stringify(format));
                    response["responseMessage"]["data"]["message"]["status"] = "OK";
                    response["responseMessage"]["data"]["message"]["errorDescription"] = "File Template Inserted Successfully";
                    response["responseMessage"]["data"]["message"].newPageURL = "/fileTemplateSearch";
                    fileTemplateInsert_CB(response);
                }
            });
        }
    });
}


exports.fileTemplateInsertOut = fileTemplateInsertOut;
