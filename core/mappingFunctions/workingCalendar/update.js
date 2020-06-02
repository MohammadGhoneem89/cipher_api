'use strict';

const workingCalendar = require('../../../lib/services/workingCalendar');
const dates = require('../../../lib/helpers/dates');

function workingCalendarUpdateOut(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  payload.updatedAt = dates.now;
  Update(payload, callback);
}

function Update(payload, callback) {
  workingCalendar.update(payload)
    .then((calendarData) => {
      let message = {};
      if (!calendarData) {
        message = {
          status: 'ERROR',
          errorDescription: 'Working Calender not Updated',
          displayToUser: true
        }
      } else {
        message = {
          status: 'OK',
          errorDescription: 'Working Calender Updated Successfully',
          displayToUser: true,
          newPageURL: ''
        }
      }
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: message
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
              errorDescription: 'Working Calender not Inserted',
              displayToUser: true
            },
            error: err
          }
        }
      };
      callback(response);
    });
}

exports.workingCalendarUpdateOut = workingCalendarUpdateOut;