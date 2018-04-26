'use strict';

const workingCalendar = require('../../lib/services/workingCalendar');
const _ = require('lodash');

function workingCalendarListOut(payload, UUIDKey, route, callback, JWToken) {
	payload.userId = JWToken._id;
    workingCalendarList(payload, callback);
}

function workingCalendarList(payload, callback) {
    Promise.all([
        workingCalendar.getList(payload),
        workingCalendar.findTypeData()
    ])
    .then((res)=>{
             const response = {
                    workingCalendarList: {
                        action: payload.action,
                        pageData: {
                            pageSize: payload.page.pageSize,
                            currentPageNo: payload.page.currentPageNo,
                            totalRecords: res.count
                        },
                        data: {
                            searchResult: res[0].workingCalendar,
							actions: res.actions
                            typeData : {
                                workingCalendarNames : res[1]
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

exports.workingCalendarListOut = workingCalendarListOut;

