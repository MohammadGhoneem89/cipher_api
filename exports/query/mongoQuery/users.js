'use strict';


const projection = require('../projection');
const dates = require('../../../lib/helpers/dates');
const dataFunc = require('../../../lib/services/user');

function users(body) {

    body = body || {};
    body.action = body.action || "";
    body.page = body.page || {};
    body.searchCriteria = body.searchCriteria || {};
    if(body.page){
        body.page.currentPageNo = 1;
        body.page.pageSize = 1000000;
    }
    let format =  {};
    return dataFunc.getList(body)
        .then((userData) => {
            let format = [];
            for (const user of userData.users) {
                format.push({
                    "userID" : user.userID,
                    "firstName" :  user.firstName,
                    "lastName" : user.lastName,
                    "status" : user.isActive,
                    "organization" : user.orgCode || user.orgType
                });
            }
            return format;
        });
}

module.exports = users;