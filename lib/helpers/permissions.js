'use strict';

const _ = require('lodash');
const commonConst = require('../constants/common');

function embed(params) {
    const User = require('../models/User');

    /* {  `````sample params````
          userId: payload.userId,
          docType: 'actions',
          page: '1',
          component: '4',
          documents: {}[]
      }*/

    const map = {
        componentActions: componentActions,
        pageActions: pageActions
    };

    function componentActions(permissions) {
        let actions = [];

        // console.log("permissions inside componentactions ",JSON.stringify(permissions))
        for (const permission of permissions) {
            for (const page of _.get(permission, 'children', [])) {
                if (page.value === params.page) {
                    for (const component of _.get(page, 'children', [])) {
                        if (component.value === params.component) { // eslint-disable-line max-depth
                            actions = actions.concat(component.children);
                        }
                    }
                }
            }
        }
        return actions;
    }

    function pageActions(permissions) {
        const actions = [];
        // console.log("permissions inside pageactions ",JSON.stringify(permissions))
        for (const permission of permissions) {
            for (const page of _.get(permission, 'children', [])) {
                if (page.value === params.page) {
                    for (const pageAction of _.get(page, 'children', [])) {
                        if (pageAction.type === commonConst.permissions.types.pagesActions) { // eslint-disable-line max-depth
                            actions.push(pageAction);
                        }
                    }
                }
            }
        }
        return actions;
    }

    function _getGroups() {
        return User
            .findOne({ _id: params.userId })
            .populate({ path: 'groups' })
            .lean(true);
    }

    return _getGroups()
        .then((user) => {
            user = user || {};
            return _.flatMap(user.groups, 'permissions');
        })
        .then((permissions) => {
            params.documents = _.isArray(params.documents) ? params.documents : [params.documents];
            for (const doc of params.documents) {
                // console.log("permissions inside componentactions ",permissions)
                doc[params.docType] = map.componentActions(permissions, params.action);
                
            }
            console.log("params.documents ",params.documents[params.documents.length-1].actions);
            params.pageActions = map.pageActions(permissions, params.action);
            return params;
        });
}

module.exports = {
    embed: embed
};