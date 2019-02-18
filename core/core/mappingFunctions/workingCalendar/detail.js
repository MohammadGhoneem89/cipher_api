'use strict';

const workingCalendar = require('../../../lib/services/workingCalendar');

function get(payload, UUIDKey, route, callback, JWToken) {
    workingCalendarDetail(payload, callback);
}

function workingCalendarDetail(payload, callback) {
    workingCalendar.getDetails(payload)
        .then((calendarData) => {
            const response = {
                workingCalendarDetail: {
                    action: payload.action,
                    data: calendarData
                }
            };
            callback(response);
        })
        .catch((err) => {
            callback(err);
        });
}

exports.get = get;

