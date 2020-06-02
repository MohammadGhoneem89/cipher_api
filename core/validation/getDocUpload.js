var logger = require('../../lib/helpers/logger')().app;
let fs = require('fs');
let docRepo = require('../../lib/repositories/sharedDocument');
let select = require("../../lib/couch/selectWithProjection");
let check = require("../../lib/helpers/file");
let _ = require("lodash");

var getDocUpload = function (data) {
    logger.info({fs:'getDocUpload.js', func:'getDocUpload'}, " [ Get Document Upload ] Request : " + JSON.stringify(data));

    if (data.JWToken) {
        if (data.JWToken.orgType === "DSG" || data.JWToken.orgType === "DOF") {
            return download(data)
        }
        if (data.JWToken.orgType === "Entity" || data.JWToken.orgType === "Acquirer") {
            return verify(data)
        }
    }
};


function download(data) {
    logger.info({fs:'getDocUpload.js', func:'download'}, " [ Get Document Upload ] ID  : " + data.id);
    let fileData = {};
    return docRepo.findOne({UUID: data.id})
        .then((docData) => {
            logger.info({fs:'getDocUpload.js', func:'download'}, " [ Get Document Upload ] Template DATA : " + JSON.stringify(docData));
            fileData.path = docData.path;
            fileData.name = docData.name;
            return check.isExist(fileData.path)
        })
        .then(() => {
            return fileData;
        });
}


function verify(data) {
    let query = Object.assign({}, {"data.DocumentName": "RefundView"});
    let fields = ["data.Document"];
    if (data.source) {
        logger.info({fs:'getDocUpload.js', func:'verify'}, " [ Get Document Upload ] source : " + data.source);
        if (data.ePayRefNo) {
            logger.info(" [ Get Document Upload ] ePayRefNo : " + data.ePayRefNo);
            query = Object.assign(query, {"data.PayRef": data.ePayRefNo});
            return select("transactions", query, fields)
                .then((docData)=> {
                    logger.info({fs:'getDocUpload.js', func:'verify'}, " [ Get Document Upload ] Couch DATA : " + JSON.stringify(docData));
                    let a = _.flatMap(_.map(_.flatMap(_.map(docData, "data.Document")), 'IDList'));
                    let exists = _.indexOf(a, data.id) >= 0;
                    if (exists) {
                        return download(data)
                    }
                })
                .then((res) => {
                    return res;
                });
        }
    }

}


module.exports = getDocUpload;
