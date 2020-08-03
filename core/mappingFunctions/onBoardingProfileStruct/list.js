'use strict';

const onBoarding = require('../../../lib/services/OnBoardingProfileStruct');

function list(payload, UUIDKey, route, callback, JWToken) {
	payload.userId = JWToken._id;
    onBoardingList(payload, callback);
}

function onBoardingList(payload, callback) {

    onBoarding.getList(payload)
    .then((res)=>{
             const response = {
                 getOnBoardingProStructList: {
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

