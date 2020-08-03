'use strict';

const workingCalendar = require('../../../lib/services/workingCalendar');

function workingCalendarInsertOut(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  create(payload, callback);
}

function create(payload, callback) {
  workingCalendar.create(payload)
    .then((calendarData) => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'OK',
              errorDescription: 'Working Calendar inserted successfully',
              displayToUser: true,
              newPageURL: '/workingCalendarList'
            }
          }
        }
      };
      callback(response);
    })
    .catch((err) => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'ERROR',
              errorDescription: 'Working Calendar not inserted',
              displayToUser: true
            },
            error: err
          }
        }
      };
      callback(response);
    });
}

exports.workingCalendarInsertOut = workingCalendarInsertOut;