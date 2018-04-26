'use strict';

const emailTemplate = require('../../lib/services/emailTemplate');
const _ = require('lodash');
const pointer = require('json-pointer');

function emailTemplateListOut(payload, UUIDKey, route, callback, JWToken) {
	payload.userId = JWToken._id;
    emailTemplateList(payload, callback);
}

function emailTemplateList(payload, callback) {
    Promise.all([
        emailTemplate.getList(payload),
        emailTemplate.findTypeData()
    ])
    .then((res)=>{
           const response = {
                    emailTemplateList: {
                        action: payload.action,
                        pageData: {
                            pageSize: payload.page.pageSize,
                            currentPageNo: payload.page.currentPageNo,
                            totalRecords: res.count
                        },
                        data: {
                            searchResult: res[0].emailTemplate,
							actions: res[0].actions,
                            typeData : {
                                emailTemplateNames : res[1]
                            }
                        }
                    }
                };
                callback(response);
        })
    .catch((err) => {
        callback(err);
    });

}

exports.emailTemplateListOut = emailTemplateListOut;

