
var logger = require('../../../lib/helpers/logger')().app;

var Validate = require("../../validation/validate.js");
var validType = require("../../validation/validationFields");
var pointer = require("json-pointer");
const auditLog = require('../../../lib/services/auditLog');
const commonConst = require('../../../lib/constants/common');

var fileTemplateUpdateOut = function (payload, UUIDKey, route, callback, JWToken) {

    logger.debug(" [ File Template Update ] PAYLOAD : " + JSON.stringify(payload, null, 2));
    logger.debug(" [ File Template Update ] UUID : " + UUIDKey);
    logger.debug(" [ File Template Update ] Route : " + route);
    logger.debug(" [ File Template Update ] JWToken : " + JSON.stringify(JWToken, null, 2));

    fileTemplateUpdate(payload, JWToken._id, callback);

}

var fileTemplateUpdate = function (payload, userID, fileTemplateUpdate_CB) {

    logger.debug(" [ File Template Update ] File Template Update data in request : " + JSON.stringify(payload, 2));
    var response = {
        "responseMessage": {
            "action": "fileTemplateUpdate",
            "data": {
                "message": {
                    "status": "ERROR",
                    "errorDescription": "File Template not Update",
                    "displayToUser": true
                }
            }
        }
    };

    var format = {
        "templateName": "",
        "fileType": "",
        "skipLines": "",
        "separator": "",
        "XMLMainTag": "",
        "fields": [],
        "dateCreated": "",
        "createdBy": "",
        "dateUpdated": "",
        "updatedBy": ""
    }

    var data = payload.data;

    if (data) {
        if (data._id) {
            Validate.formValidate(data, validType.fileTemplateValidation, function (err) {
                if (Object.keys(err).length > 0) {
                    logger.debug(" [ File Template Update ] Error in Validation : " + JSON.stringify(err));
                    pointer.set(response, "/responseMessage/data/error", err);
                    fileTemplateUpdate_CB(response);
                }
                else {

                    var id = data["_id"];
                    delete data["_id"];

                    global.db.select("FileTemplate", {
                        "id": id
                    }, "", function (err, FileTemplateData) {
                        if (err) {
                            logger.error(" [ File Template Update ] Get ERROR : " + err);
                            fileTemplateUpdate_CB(response);
                        }
                        else if (FileTemplateData.length == 0) {
                            logger.error(" [ File Template Update ] File Template Data is not available : " + FileTemplateData);
                            fileTemplateUpdate_CB(response);
                        }
                        else {
                            var date = new Date();

                            format.templateName = data.templateName ? data.templateName : "";
                            format.fileNameRegEx = data.fileNameRegEx ? data.fileNameRegEx : "\w+";
                            format.fileType = data.fileType ? data.fileType : "";
                            format.skipLines = data.skipLines ? data.skipLines : "";
                            format.separator = data.separator ? data.separator : "";
                            format.XMLMainTag = data.XMLMainTag ? data.XMLMainTag : "";
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
                            format.dateCreated = data.dateCreated;
                            format.createdBy = data.createdBy;
                            format.dateUpdated = date;
                            format.updatedBy = userID;

                            format.rulesList = data.rulesList
                            FileTemplateData = FileTemplateData[0];
                            data["dateUpdated"] = date;
                            data["updatedBy"] = userID;
                            if (!data.isActive) {
                                data.isActive = false;
                            }
                            else {
                                data.isActive = true;
                            }
                            var docDate = Date.parse(FileTemplateData["dateUpdated"]);

                            if (docDate < date) {
                                global.db.update("FileTemplate", {
                                    "id": id
                                }, format, function (err) {
                                    if (err) {
                                        logger.error(" [ File Template Update ] File Template is not updated : " + err);
                                        fileTemplateUpdate_CB(response);
                                    }
                                    else {

                                        var auditData = {};
                                        if (FileTemplateData) {
                                            auditData = {
                                                event: commonConst.auditLog.eventKeys.update,
                                                collectionName: 'Entity',
                                                ipAddress: payload.ipAddress,
                                                current: payload.data,
                                                previous: FileTemplateData,
                                                createdBy: userID
                                            };
                                            auditLog.create(auditData);
                                            response["responseMessage"]["data"]["message"]["status"] = "OK";
                                            response["responseMessage"]["data"]["message"]["errorDescription"] = "Successfully Updated";
                                            response["responseMessage"]["data"]["message"].newPageURL = "/fileTemplateSearch";
                                            fileTemplateUpdate_CB(response);
                                        }
                                    }
                                });
                            } else {
                                logger.error(" [ File Template Update ] Document is already modified : " + JSON.stringify(docDate) + " > " + JSON.stringify(date));
                                fileTemplateUpdate_CB(response);
                            }
                        }
                    });

                }
            })

        }
        else {
            logger.error(" [ File Template Update ] ID is not available in updated data : " + JSON.stringify(data));
            fileTemplateUpdate_CB(response);
        }
    }
    else {
        logger.error(" [ File Template Update ] Data is not define for update ... " + data);
        fileTemplateUpdate_CB(response);
    }
}




exports.fileTemplateUpdateOut = fileTemplateUpdateOut;





