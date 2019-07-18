const logger = require('../../../lib/helpers/logger')().app;
const pointer = require("json-pointer");
const permissionsHelper = require('../../../lib/helpers/permissions');
const permissionConst = require('../../../lib/constants/permissions');
const Entity = require('../../../lib/repositories/entity');
const _ = require('lodash');

var orgDetailByCode = function (payload, UUIDKey, route, callback, JWToken) {

    logger.debug(" [ Org Detail By Code ] PAYLOAD : " + JSON.stringify(payload, null, 2));
    logger.debug(" [ Org Detail By Code ] UUID : " + UUIDKey);
    logger.debug(" [ Org Detail By Code ] Route : " + route);
    logger.debug(" [ Org Detail By Code ] JWToken : " + JSON.stringify(JWToken, null, 2));

    payload.userId = JWToken._id;
    orgDetail(payload, callback);

};

var orgDetail = function (payload, entityGetCB) {

    logger.debug(" [Org Detail By Code] Entity Code : " + payload.orgCode);

    payload.orgCode = payload.orgCode || [];

    var response = {
        "orgDetailByCode": {
            "action": "orgDetailByCode",
            "data": {}
        }
    };

    Entity.findBySpCode(payload).then((result) => {
        result.forEach(element => {
            response.orgDetailByCode.data[element.spCode] = element.entityLogo
        });
        
        entityGetCB(response)
    }).catch((error) => {
        console.log(error);
        entityGetCB(response)
    })

};

exports.orgDetailByCode = orgDetailByCode;
