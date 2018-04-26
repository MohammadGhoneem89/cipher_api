'use strict';

const models = require('../models');
const _ = require('lodash');
const commonConst = require('../constants/common');

const Permission = models.Permission;

module.exports = {
  find,
  filterPermissionsOnURI,
  filterPermissions
};

function find(query) {
  query = query || {};
  return Permission.find(query);
}

function filterPermissionsOnURI(permissions, uri) {
  uri = '/' + uri;
  for (const permission of permissions) {
    permission.pages = permission.pages || [];
    _.remove(permission.pages, (page) => _.indexOf(page.URI, uri) < 0);
    for (const page of permission.pages) {
      for (const component of page.components) {
        _.remove(component.actions, (action) => _.indexOf(action.URI, uri) < 0);
      }
      _.remove(page.pageActions, (action) => _.indexOf(action.URI, uri) < 0);
    }
  }
  return permissions;
}

function filterPermissions(checked) {
  // bhai samj na aye tu gale mat dena , majboori the
  return find()
    .then((permissions) => {
      for (const permission of permissions) {
        for (const page of permission.children) {
          for (const component of page.children) {
            // remove component Actions
            _.remove(component.children, (action) => _.indexOf(checked, action.value) < 0);
          }
          _.remove(page.children, (component) => !component.children.length && (component.type !== commonConst.permissions.types.pagesActions));
          _.remove(page.children, (component) => (_.indexOf(checked, component.value) < 0) && (component.type === commonConst.permissions.types.pagesActions));
        }
        _.remove(permission.children, (page) => !page.children.length);
      }
      _.remove(permissions, (permission) => !permission.children.length);
      return permissions;
    });
}
