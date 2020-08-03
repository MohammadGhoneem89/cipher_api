'use strict';

const validator = require('../validator');
const userRepo = require('../repositories/user');
const group = require('../repositories/group');
const _ = require('lodash');

module.exports = {
  get,
  uriPermissions,
  uriPermissionsByOrgCode
};

function get(payload) {
  return validator.validate(payload, validator.schemas.permission.get)
    .then(() => userRepo.getGroups({_id: payload.userID}))
    .then((user) => {
      user = user || {};
      return _.orderBy(_.flatMap(user.groups, 'permissions'), ['order']);
    });
}


function uriPermissions(payload) {

  return validator.validate(payload, validator.schemas.permission.getURI)
    .then(() => userRepo.getGroups({_id: payload.userID}))
    .then((user) => {
      let URIs = [];
      user = user || {};
      const permissions = _.flatMap(user.groups, 'permissions');

      for (const permission of permissions) {
        for (const page of _.get(permission, 'children', [])) {
          if (page.URI) {
            URIs = URIs.concat(page.URI);
          }
          for (const component of _.get(page, 'children', [])) {
            if (component.URI) {
              URIs = URIs.concat(component.URI);
            }
            for (const action of _.get(component, 'children', [])) { // eslint-disable-line max-depth
              if (action.URI.length) { // eslint-disable-line max-depth
                URIs = URIs.concat(action.URI);
              }
            }
          }
        }
      }

      console.log('>>>>>>>>>>**', JSON.stringify(payload), _.indexOf(URIs, '/' + payload.URI) >= 0);
      return _.indexOf(URIs, '/' + payload.URI) >= 0;
    });
}

function uriPermissionsByOrgCode(payload) {

  return userRepo.getGroupsByOrgCode(payload)
    .then(async (groupList) => {
      let URIs = [];
      for (let elem of groupList) {
        let grp = await group.findOneById({_id: elem});
        const permissions = _.get(grp, 'permissions', []);
        for (const permission of permissions) {
          for (const page of _.get(permission, 'children', [])) {
            if (page.URI) {
              URIs = URIs.concat(page.URI);
            }
            for (const component of _.get(page, 'children', [])) {
              if (component.URI) {
                URIs = URIs.concat(component.URI);
              }
              for (const action of _.get(component, 'children', [])) { // eslint-disable-line max-depth
                if (action.URI.length) { // eslint-disable-line max-depth
                  URIs = URIs.concat(action.URI);
                }
              }
            }
          }
        }
      }
      return URIs;
    });
}
