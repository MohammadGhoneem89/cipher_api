'use strict';

const validator = require('../validator');
const workingCalendarRepo = require('../repositories/workingCalendar');
const permissionsHelper = require('../helpers/permissions');
const permissionConst = require('../constants/permissions');
const _ = require('lodash');

function getList(payload) {
  let count = 0;
  return workingCalendarRepo.find(payload)
    .then((res) => {
      count = res[1];
      const params = {
        userId: payload.userId,
        documents: res[0],
        docType: 'actions',
        page: permissionConst.workingCalendarList.pageId,
        component: permissionConst.workingCalendarList.component.searchGrid
      };
      return permissionsHelper.embed(params);
    })
    .then((res) => {
      const response = {};
      response.count = count;
      response.workingCalendar = _.get(res, 'documents', []);
      response.actions = _.get(res, 'pageActions', []);
      return response;
    });
}

function findActive(payload) {
  return workingCalendarRepo.findActive(payload)
    .then((res) => {
      const params = {
        userId: payload.userID,
        documents: res,
        docType: 'actions',
        page: permissionConst.workingCalendarDetail.pageId,
        component: ''
      };
      return permissionsHelper.embed(params);
    })
    .then((res) => _.get(res, 'documents[0]', {}))
    .catch((err) => err);
}

function findAllActive(payload) {
  return workingCalendarRepo.findAllActive(payload)
    .then((res) => {
      const params = {
        userId: payload.userID,
        documents: res,
        docType: 'actions',
        page: permissionConst.workingCalendarDetail.pageId,
        component: ''
      };
      return permissionsHelper.embed(params);
    })
    .then((res) => _.get(res, 'documents', []))
    .catch((err) => err);
}

function findTypeData() {
  return workingCalendarRepo.findTypeData();
}

function getDetails(payload) {
  return validator.validate(payload, validator.schemas.workingCalendar.calendarDetail)
    .then(() => {
      return workingCalendarRepo.findOneById(payload.calendarID);
    }).then((res) => {
      const params = {
        userId: payload.userID,
        documents: res,
        docType: 'actions',
        page: permissionConst.workingCalendarDetail.pageId,
        component: ''
      };
      return permissionsHelper.embed(params);
    })
    .then((res) => _.get(res, 'documents[0]', {}));
}

function update(payload) {
  return validator.errorValidate(payload, validator.schemas.workingCalendar.update)
    .then(() => {
      payload.data.updatedBy = payload.userId;
      payload.data.updatedAt = payload.updatedAt;
      return workingCalendarRepo.findOneAndUpdate({ _id: payload.data._id }, payload.data);
    });
}

function create(payload) {
  return validator.errorValidate(payload, validator.schemas.workingCalendar.create)
    .then(async() => {
      payload.data.createdBy = payload.userId;
      payload.data.updatedBy = payload.userId;
      // return workingCalendarRepo.create(payload.data);
      let val = await workingCalendarRepo.findOneByName(payload.data.calendarName)
      if (val!= null) {
      }
      else{
        return workingCalendarRepo.create(payload.data);
      }
      if(payload.value==true){
        try{
          await workingCalendarRepo.RemoveOneByName(payload.data.calendarName );
          return workingCalendarRepo.create(payload.data);
        }catch(err){
            console.log("err",err);
        }
      }
    });
}

module.exports = {
  getList,
  getDetails,
  create,
  update,
  findTypeData,
  findActive,
  findAllActive
};