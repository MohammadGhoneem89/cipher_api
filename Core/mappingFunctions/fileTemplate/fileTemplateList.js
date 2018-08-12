
const logger = require('../../../lib/helpers/logger')().app;
const typeData = require("./fileTemplateTypeData");
const pointer = require("json-pointer");
const permissionsHelper = require('../../lib/helpers/permissions');
const permissionConst = require('../../lib/constants/permissions');

var fileTemplateListOut = function (payload, UUIDKey, route, callback, JWToken) {

    logger.debug(" [ file Template List ] PAYLOAD : " + JSON.stringify(payload, null, 2));
    logger.debug(" [ file Template List ] UUID : " + UUIDKey);
    logger.debug(" [ file Template List ] Route : " + route);
    logger.debug(" [ file Template List ] JWToken : " + JSON.stringify(JWToken, null, 2));

	payload.userId = JWToken._id;
    fileTemplateList(payload, callback);

}


function fileTemplateList(payload, fileTemplateList_CB) {


    logger.debug(" [ File Template List ] File Template list Data : " + JSON.stringify(payload));
    let response = {
        "fileTemplateList": {
            "action": "fileTemplateList",
            "searchCriteria": payload["searchCriteria"],
            "pageData": payload["page"],
            "data": {
                "searchResult": [],
                "typeData": {
                    "fileTemplateNames": []
                }
            }
        }
    }

    let where = {};

    let searchCriteria = payload.searchCriteria;

    if (searchCriteria) {
        where = {"$and": []};
        if (searchCriteria["templateName"]) {
            var templateName = searchCriteria["templateName"];
            where["$and"].push({"templateName": {'$regex': templateName, '$options': 'i'}});
        }
    }

    let options = {};

    if (payload["page"]) {
        options["currentPageNo"] = payload["page"]["currentPageNo"];
        options["pageSize"] = payload["page"]["pageSize"];
        options["lastID"] = payload["page"]["lastID"];
    }


    global.db.count("FileTemplate", where, function (err, countData) {
        if (err) {
            logger.debug(" [ File Template List ] Count ERROR : " + err);
            fileTemplateList_CB(response);
        }
        else {
            pointer.set(response, "/fileTemplateList/pageData/totalRecords", countData);

            global.db.select2("FileTemplate", where, {
                "templateName": 1,
                "fileType": 1,
                "actions": 1
            }, options, function (err, fileTemplateData) {
                if (err) {
                    logger.debug(" [ File Template List ] ERROR : " + err);
                    fileTemplateList_CB(response);
                }
                else if (fileTemplateData.length == 0) {
                    logger.debug(" [ File Template List ] Acquirer Data length : " + err);
                    fileTemplateList_CB(response);
                }
                else {
                    typeData(function (nameData) {
						
                       const params = {
                            userId: payload.userId,
                            documents: fileTemplateData,
                            docType: 'actions',
                            page: permissionConst.fileTemplateList.pageId,
                            component: permissionConst.fileTemplateList.component.searchGrid
                        };
                        permissionsHelper.embed(params)
                            .then((res) => {
								response["fileTemplateList"]["data"]["actions"] = res.pageActions;
                                response["fileTemplateList"]["data"]["searchResult"] = res.documents;
                                response["fileTemplateList"]["data"]["typeData"]["fileTemplateNames"] = nameData;
                                fileTemplateList_CB(response);
                            })
							.catch((err) => {
								logger.error("ERROR > > > > >  " + err);
							})

                    });
                }
            })
        }
        ;
    })

}

exports.fileTemplateListOut = fileTemplateListOut;
