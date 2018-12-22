'use strict';

const payment = require('../../../lib/services/payment');

function list(payload, UUIDKey, route, callback, JWToken) {
	payload.userId = JWToken._id;
    paymentList(payload, callback);
}

function paymentList(payload, callback) {
    console.log("::::::payload::::::: ", JSON.stringify(payload));
    payment.getList(payload)
    .then((res)=>{
             const response = {
                    paymentList: {
                        action: payload.action,
                        pageData: {
                            pageSize: payload.page.pageSize,
                            currentPageNo: payload.page.currentPageNo,
                            totalRecords: res.count
                        },
                        data: {
                            searchResult: res.paymentList
                        }
                    }
                };
                callback(response);
        })
    .catch((err) => {
        callback(err);
    });
}

exports.list = list;

