'use strict';

const workingCalendar = require('../../../lib/services/workingCalendar');
const _ = require('lodash');
const moment = require('moment');

function workingDays(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  workingCalendarDays(payload, callback);
}

function getDates(startDate, stopDate) {
  var dateArray = [];
  var currentDate = moment(startDate);
  var stopDate = moment(stopDate);
  while (currentDate <= stopDate) {
    dateArray.push(moment(currentDate).format('YYYY-MM-DD'))
    currentDate = moment(currentDate).add(1, 'days');
  }
  return dateArray;
}

function arr_diff(a1, a2) {
  var a = [],
    diff = [];
  for (var i = 0; i < a1.length; i++) {
    a[a1[i]] = true;
  }
  for (var i = 0; i < a2.length; i++) {
    if (a[a2[i]]) {
      delete a[a2[i]];
    } else {
      a[a2[i]] = true;
    }
  }
  for (var k in a) {
    diff.push(k);
  }
  return diff;
}

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function removeItemAll(arr, value) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}

function count(finalWorkingDays) {
  finalWorkingDays.sort();
  var current = null;
  var cnt = 0;
  let val = []
  for (var i = 0; i < finalWorkingDays.length; i++) {
    if (finalWorkingDays[i] != current) {
      if (cnt > 0) {
        val.push({
          day: current,
          count: cnt
        })
      }
      current = finalWorkingDays[i];
      cnt = 1;
    } else {
      cnt++;
    }
  }
  if (cnt > 0) {
    val.push({
      day: current,
      count: cnt
    })
  }
  return val
}

function uniqueFirstArray(a1, a2) {
  let result = []
  let position = 0;
  for (let i = 0; i < a1.length; i++) {
    let unique = true;
    for (let j = 0; j < a2.length; j++) {
      if (a1[i] == a2[j]) {
        unique = false;
        break;
      }
    }
    if (unique == true) {
      result[position] = a1[i];
      position++;
    }
  }
  return result
}

function workingCalendarDays(payload, callback) {
  Promise.all([
      workingCalendar.getList(payload)
      // ,workingCalendar.findTypeData()
    ])
    .then((res) => {
      if (payload.startDate && payload.endDate) {
        let allData = res[0].workingCalendar[0].toObject()
        let startDate = payload.startDate
        let endDate = payload.endDate
        let holidays = allData.holidays
        let dateArray = getDates(startDate, endDate)
        var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        let workDays = []
        for (let i = 0; i < allData.daysWithTime.length; i++) {
          workDays.push(allData.daysWithTime[i].title)
        }
        let result = []
        let dateArray2 = []
        for (let i = 0; i < allData.exceptionList.length; i++) {
          if (allData.exceptionList[i].type == 'workingTime') {
            result.push(allData.exceptionList[i].start)
            result.push(allData.exceptionList[i].end)
            dateArray2.push(...getDates(allData.exceptionList[i].start, allData.exceptionList[i].end))
          }
        }
        let intersection = dateArray.filter(x => dateArray2.includes(x));
        let notHoliday = uniqueFirstArray(dateArray, holidays)
        let weekEnds = uniqueFirstArray(weekdays, workDays)
        let intersection2 = uniqueFirstArray(notHoliday, intersection)
        let allDays = []
        for (let i = 0; i < intersection2.length; i++) {
          const date = moment(intersection2[i]);
          const name = moment(date, 'YYYY-MM-DD').format('dddd')
          allDays.push(name)
        }
        let finalWorkingDays = ''
        for (let i = 0; i < weekEnds.length; i++) {
          finalWorkingDays = removeItemAll(allDays, weekEnds[i])
        }
        let daysWithCount = count(finalWorkingDays);
        let daysWithTimeMap = new Map()
        for (let i = 0; i < allData.daysWithTime.length; i++) {
          daysWithTimeMap.set(allData.daysWithTime[i].title, allData.daysWithTime[i].hours)
        }
        let totalHours = 0
        for (let j = 0; j < daysWithCount.length; j++) {
          if (daysWithTimeMap.has(daysWithCount[j].day)) {
            totalHours += parseInt(daysWithTimeMap.get(daysWithCount[j].day)) * daysWithCount[j].count
          }
        }
        let shortWorkingTime = []

        let tempDaysWithTime = intersection.map(day => {
          return allData.exceptionList.find(obj => obj.start == day)
        })
        for (let i = 0; i < tempDaysWithTime.length; i++) {
          if (tempDaysWithTime[i] != undefined) {
            let dateArray3 = getDates(tempDaysWithTime[i].start, tempDaysWithTime[i].end)
            let notHoliday = uniqueFirstArray(dateArray3, holidays)
            let allDays = []
            let allDays2 = []
            for (let i = 0; i < notHoliday.length; i++) {
              const date = moment(notHoliday[i]);
              const name = moment(date, 'YYYY-MM-DD').format('dddd')
              allDays.push(name)
              allDays2.push({
                name: name,
                date: notHoliday[i]
              })
            }
            let newWeekends = []
            for (let i = 0; i < weekEnds.length; i++) {
              newWeekends.push({
                day: weekEnds[i]
              })
            }
            let notHolidayShort = allDays2.filter(
              ({
                name: id1
              }) => !newWeekends.some(({
                day: id2
              }) => id2 == id1)
            );


            let newIntersection = []
            for (let i = 0; i < intersection.length; i++) {
              newIntersection.push({
                intersect: intersection[i]
              })
            }

            let onlyShortDays = newIntersection.filter(
              ({
                intersect: id1
              }) => notHolidayShort.some(({
                date: id2
              }) => id2 == id1)
            );



            let t1 = tempDaysWithTime[i].dayStartTime.split(':')
            let t2 = tempDaysWithTime[i].dayEndTime.split(':')
            shortWorkingTime.push((parseInt(t2[0]) - parseInt(t1[0])) * onlyShortDays.length)
          }
        }
        shortWorkingTime = _.sum(shortWorkingTime);
        totalHours = totalHours + shortWorkingTime
        const response = {
          workingCalendarList: {
            // action: payload.action,
            // pageData: {
            //   pageSize: payload.page.pageSize,
            //   currentPageNo: payload.page.currentPageNo,
            //   totalRecords: res[0].count
            // },
            data: {
              searchResult: {
                WorkingHours: totalHours + ' hours',
              },
              // actions: res.actions,
              // typeData: {
              //   workingCalendarNames: res[1]
              // }
            }
          }
        };
        callback(response);
      } else if (payload.startDate && payload.workingHours) {
        let allData = res[0].workingCalendar[0].toObject()
        let startDate1 = payload.startDate.split(' ')
        let startDate = startDate1[0]
        let workingHours = payload.workingHours
        let holidays = allData.holidays
        var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        let workDays = []
        for (let i = 0; i < allData.daysWithTime.length; i++) {
          workDays.push(allData.daysWithTime[i].title)
        }
        let weekEnds = uniqueFirstArray(weekdays, workDays)
        let days = []
        let name = []
        let isHoliday = holidays.includes(startDate)
        if (!isHoliday) {
          const date = moment(startDate);
          name = moment(date, 'YYYY-MM-DD').format('dddd')
          days = {
            date: startDate,
            day: name
          }
        }
        let finalDays = []
        for (let i = 0; i < weekEnds.length; i++) {
          if (days.day != weekEnds[i]) {
            finalDays = days
          }
        }
        let finalDays2 = ''
        for (let i = 0; i < allData.shortWorkingTimes.length; i++) {
          if (finalDays.date != allData.shortWorkingTimes[i].date) {
            finalDays2 = finalDays
          }
        }
        let hours = 0
        let duration = ''
        for (let i = 0; i < allData.daysWithTime.length; i++) {
          if (finalDays2.day == allData.daysWithTime[i].title) {
            hours += parseInt(allData.daysWithTime[i].hours)
            duration = allData.daysWithTime[i].duration
          }
        }
        let todayDate = moment().format('YYYY-MM-DD');
        if (startDate == todayDate && !isHoliday) {
          // let todayTime = moment().format('HH:mm');
          // console.log("todayTime",todayTime);
          let t1 = duration.split('-')
          let t2 = t1[1].split(':')
          // let tempHours = parseInt(t2[0]) - parseInt(todayTime)
          let tempHours = parseInt(t2[0]) - parseInt(startDate1[1])
          hours = tempHours
        }

        function againFunc(nextDay) {
          nextDay = new Date(nextDay.date)
          nextDay.setDate(nextDay.getDate() + 1)
          nextDay = moment(nextDay).format('YYYY-MM-DD');
          name = moment(nextDay, 'YYYY-MM-DD').format('dddd')
          days = ({
            date: nextDay,
            day: name
          })
          return days
        }
        let nextDay = ''
        let nextFuncs = 0

        function nextFunc(startDate, allData) {
          var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
          let workDays = []
          for (let i = 0; i < allData.daysWithTime.length; i++) {
            workDays.push(allData.daysWithTime[i].title)
          }
          let weekEnds = uniqueFirstArray(weekdays, workDays)
          let days = []
          let name = []
          let notHoliday = ''
          for (let i = 0; i < allData.holidays.length; i++) {
            if (startDate.date != allData.holidays[i]) {
              const date = moment(startDate.date);
              name = moment(date, 'YYYY-MM-DD').format('dddd')
              days = {
                date: startDate.date,
                day: name
              }
              notHoliday = uniqueFirstArray([days.date], allData.holidays)
            }
          }
          let tempDaysWithTime = notHoliday.map(day => {
            return [days].find(obj => obj.date == day)
          })
          let finalDays = ''
          let notWeekEnds = ''
          for (let i = 0; i < weekEnds.length; i++) {
            if (tempDaysWithTime.length > 0 && tempDaysWithTime[0].day != weekEnds[i]) {
              finalDays = tempDaysWithTime[0]
              notWeekEnds = uniqueFirstArray([finalDays.day], weekEnds)
            }
          }
          let tempNotWeekEnds = ''
          if (notWeekEnds.length > 0) {
            tempNotWeekEnds = notWeekEnds.map(day => {
              return [finalDays].find(obj => obj.day == day)
            })
          }
          let shortWorkingTimes = []
          for (let i = 0; i < allData.shortWorkingTimes.length; i++) {
            if (tempNotWeekEnds && tempNotWeekEnds[0].date == allData.shortWorkingTimes[i].date) {
              shortWorkingTimes.push(tempNotWeekEnds[0].date)
            }
          }
          let tempNotWeekEnds2 = []
          if (tempNotWeekEnds && tempNotWeekEnds.length > 0) {
            tempNotWeekEnds2.push(tempNotWeekEnds[0].date)
          }
          if (shortWorkingTimes.length > 0) {
            tempNotWeekEnds2 = uniqueFirstArray(tempNotWeekEnds2, shortWorkingTimes)
          }
          let shortHours = 0
          for (let i = 0; i < allData.exceptionList.length; i++) {
            for (let j = 0; j < shortWorkingTimes.length; j++) {
              if (allData.exceptionList[i].type == 'workingTime') {
                let t1 = allData.exceptionList[i].dayStartTime.split(':')
                let t2 = allData.exceptionList[i].dayEndTime.split(':')
                shortHours = parseInt(t2[0]) - parseInt(t1[0])
              }
            }
          }
          if (shortHours != 0) {
            hours += shortHours
          }
          let tempNotWeekEnds3 = []
          if (tempNotWeekEnds2.length > 0) {
            const date2 = moment(tempNotWeekEnds2[0]);
            let name2 = moment(date2, 'YYYY-MM-DD').format('dddd')
            tempNotWeekEnds3.push({
              date: tempNotWeekEnds2[0],
              day: name2
            })
          }
          let finalDays2 = ''
          for (let i = 0; i < allData.shortWorkingTimes.length; i++) {
            if (tempNotWeekEnds && tempNotWeekEnds[0].date != allData.shortWorkingTimes[i].date) {
              finalDays2 = tempNotWeekEnds
            }
          }
          for (let i = 0; i < allData.daysWithTime.length; i++) {
            if (tempNotWeekEnds3.length > 0 && tempNotWeekEnds3[0].day == allData.daysWithTime[i].title) {
              hours += parseInt(allData.daysWithTime[i].hours)
            }
          }
          return {
            hours,
            finalDays2
          }
        }
        if (finalDays2.length == 0) {
          const date = moment(startDate);
          name = moment(date, 'YYYY-MM-DD').format('dddd')
          finalDays2 = {
            date: startDate,
            day: name
          }
        }

        
        for (let i = 0; i < workingHours; i++) {
          if (hours < workingHours) {
            nextDay = againFunc(finalDays2)
            nextFuncs = nextFunc(nextDay, allData)
            finalDays2 = nextDay
          }
        }
        const response = {
          workingCalendarList: {
            // action: payload.action,
            // pageData: {
            //   pageSize: payload.page.pageSize,
            //   currentPageNo: payload.page.currentPageNo,
            //   totalRecords: res[0].count
            // },
            data: {
              searchResult: {
                EndDate: (nextFuncs != 0 ? nextFuncs.finalDays2[0].date : finalDays2.date),
                EndDay: (nextFuncs != 0 ? nextFuncs.finalDays2[0].day : finalDays2.day),
              },
              // actions: res.actions,
              // typeData: {
              //   workingCalendarNames: res[1]
              // }
            }
          }
        };
        callback(response);
      } else {
        console.log('Error');
      }
    })
    .catch((err) => {
      callback(err);
    });
}
exports.workingDays = workingDays;