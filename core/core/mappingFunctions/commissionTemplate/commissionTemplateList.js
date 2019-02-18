'use strict';
const logger = require('../../../lib/helpers/logger')().app;
const commissionTemplate = require('../../../lib/services/commissionTemplate');
const _ = require('lodash');
const pointer = require('json-pointer');

function commissionTemplateListOut(payload, UUIDKey, route, callback, JWToken) {
	payload.userId = JWToken._id;
    commissionTemplateList(payload, callback);
}

function commissionTemplateList(payload, callback) {
    return Promise.all([
        commissionTemplate.getList(payload),
        commissionTemplate.findTypeData()
    ])
    .then((res)=>{
            const response = {
                    commissionTemplateList: {
                        action: payload.action,
                        pageData: {
                            pageSize: payload.page.pageSize,
                            currentPageNo: payload.page.currentPageNo,
                            totalRecords: res.count
                        },
                        data: {
                            searchResult: res[0].commissionTemplate,
							actions: res[0].actions,
                            typeData : {
                                commissionTemplateNames : res[1]
                            }
                        }
                    }
                };
                callback(response);
        })
    .catch((err) => {
        logger.error(err);
        callback(err);
    });

}

exports.commissionTemplateListOut = commissionTemplateListOut;

