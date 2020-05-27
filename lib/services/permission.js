'use strict';

const validator = require('../validator');
const userRepo = require('../repositories/user');
const _ = require('lodash');

module.exports = {
  get,
  uriPermissions
};

function get(payload) {
  return validator.validate(payload, validator.schemas.permission.get)
    .then(() => userRepo.getGroups({ _id: payload.userID }))
    .then((user) => {
      user = user || {};
      return _.orderBy(_.flatMap(user.groups, 'permissions'), ['order']);
    });
}

function uriPermissions(payload) {
  return validator.validate(payload, validator.schemas.permission.getURI)
    .then(() => userRepo.getGroups({ _id: payload.userID }))
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

      return _.indexOf(URIs, '/' + payload.URI) >= 0;
    });
}
