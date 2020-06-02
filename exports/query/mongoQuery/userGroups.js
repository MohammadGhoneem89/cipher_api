'use strict';


const projection = require('../projection');
const dates = require('../../../lib/helpers/dates');
const dataFunc = require('../../../lib/services/group');

function userGroups(body) {

    body = body || {};
    body.action = body.action || "";
    body.page = body.page || {};
    body.searchCriteria = body.searchCriteria || {};
    if(body.page){
        body.page.currentPageNo = 1;
        body.page.pageSize = 100000;
    }
    let format =  [];
    return dataFunc.list(body)
        .then((userGroupData) => {
            for (const userGroup of userGroupData.searchResult) {
                format.push({
                    "name" : userGroup.name,
                    "description" :  userGroup.description,
                    "type" : userGroup.type
                });
            }
            return format;
        });
}

module.exports = userGroups;