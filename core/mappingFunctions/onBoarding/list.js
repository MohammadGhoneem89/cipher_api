'use strict';

const onBoarding = require('../../../lib/services/onBoarding');

function list(payload, UUIDKey, route, callback, JWToken) {
	payload.userId = JWToken._id;
    onBoardingList(payload, callback);
}

function onBoardingList(payload, callback) {

    onBoarding.getList(payload)
    .then((res)=>{
        console.log(res," RES      @@@@@@@@@@@@@@2")
             const response = {
                    getOnBoardingList: {
                        action: payload.action,
                        pageData: {
                            pageSize: payload.pageData.pageSize,
                            currentPageNo: payload.pageData.currentPageNo,
                            totalRecords: res ? res.count : 0
                        },
                        data: {
                            searchResult: res ? res.paymentList : 0
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

