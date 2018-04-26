'use strict';

const apiPayload = require('../../lib/services/apiPayload');

function list(payload, UUIDKey, route, callback, JWToken) {
    payload.userId = JWToken._id;
    _list(payload, callback);
}

function _list(payload, callback) {
    apiPayload.getList(payload)
        .then((res) => {
            const response = { } ;
            response[payload.action] = {
                    action: payload.action,
                    pageData: {
                        pageSize: payload.page.pageSize,
                        currentPageNo: payload.page.currentPageNo,
                        totalRecords: res.count
                    },
                    data: {
                        searchResult: res.list
                    }
                };
            callback(response);
        })
        .catch((err) => {
            callback(err);
        });
}

exports.list = list;

