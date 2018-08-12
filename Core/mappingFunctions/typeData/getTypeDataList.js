'use strict';

const typeData = require('../../lib/services/typeData');
let pointer = require("json-pointer");

function typeDataList(payload, UUIDKey, route, callback, JWToken) {
    payload.userId = JWToken._id;
    get(payload, callback);
}

function get(payload, callback) {
    typeData.getDetails(payload)
        .then((typeData) => {
            const response = {
                typeDataList: {
                    action: payload.action,
                    pageData: {
                        pageSize: payload.page.pageSize,
                        currentPageNo: payload.page.currentPageNo,
                        totalRecords: typeData.count
                    },
                    data: {
                        searchResult: typeData.data,
                        typeData: {
                            typeDataListNames:typeData.typeDataList

                        },
                        actions: typeData.actions
                    }
                }
            };
            callback(response);
        })
        .catch((err) => {
            callback(err);
        });
}

exports.typeDataList = typeDataList;

