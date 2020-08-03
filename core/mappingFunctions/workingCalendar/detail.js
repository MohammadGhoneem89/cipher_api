'use strict';

const workingCalendar = require('../../../lib/services/workingCalendar');

function get(payload, UUIDKey, route, callback, JWToken) {
  console.log('\n\n\n\n\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
  console.log('\n\n', payload, '  payload\n\n')
  console.log('working detail\n\n\n')
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

function mergeIntoOne(calendarArray) {
  let calendarData = {
    workinghours: {}
  };
  let holidays = [];
  console.log(`\n\n\n\n\n\n\n\n\n\n\n\n${calendarArray.length}`)
  for (let i = 0; i < calendarArray.length; i++) {
    holidays.push(...(calendarArray[i].holidays || []));
    calendarData.workinghours[`${calendarArray[i].calendarYear}_${calendarArray[i].calendarMonth}`] = (calendarArray[i].workinghours || {})
  }
  calendarData.holidays = [...holidays].filter((v, i, a) => a.indexOf(v) === i);



  return calendarData
}


function getActiveWorkingCalendar(payload, UUIDKey, route, callback, JWToken) {
  workingCalendar.findActive(payload)
    .then(calendarData => {
      const response = {
        activeCalendarDetail: {
          action: payload.action,
          data: {
            workinghours: calendarData.workinghours,
            holidays: calendarData.holidays
          }
        }
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

exports.get = get;
exports.getActiveWorkingCalendar = getActiveWorkingCalendar