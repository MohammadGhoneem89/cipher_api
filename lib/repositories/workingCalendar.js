'use strict';

const models = require('../models');

const WorkingCalendar = models.WorkingCalendar;

function find(payload) {
  const query = {};
  if (payload.searchCriteria.calendarName) {
    query.calendarName = { $regex: RegExp(payload.searchCriteria.calendarName, 'gi'), $options: 'si' };
  }
  if (payload.searchCriteria.calendarYear) {
    query.calendarYear = { $regex: RegExp(payload.searchCriteria.calendarYear, 'gi'), $options: 'si' };
  }
  return Promise.all([
    WorkingCalendar
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1)),
    WorkingCalendar.count(query)
  ]);
}

function findActive(payload) {
  return WorkingCalendar
    .findOne({ isActive: true });
}

function findAllActive(payload) {
  return WorkingCalendar
    .find({ isActive: true });
}

function findTypeData() {
  return WorkingCalendar.aggregate([
    {
      $project: {
        label: '$calendarName', _id: 0
      }
    }
  ]);
}

function findOneById(id) {
  return WorkingCalendar.findOne({ _id: id });
}

function create(payload) {
  return new WorkingCalendar(payload).save();
}

function findOneAndUpdate(query, payload) {
  return WorkingCalendar
    .findOneAndUpdate(query, payload);
}

module.exports = {
  find,
  findOneById,
  create,
  findTypeData,
  findOneAndUpdate,
  findActive,
  findAllActive
};