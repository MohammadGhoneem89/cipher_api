

'use strict';

const notifications = require('../../lib/services/notifications');
const ChainBreaker = require('../../lib/helpers/common').chainBreaker;

function list(payload, UUIDKey, route, callback, JWToken) {
    payload.userId = JWToken._id;
    payload.isRead = false;
    _list(payload, callback);
}

function _list(payload, callback) {
    const response = {
        notificationList: undefined
    };

    notifications.find(payload)
        .then((noti) => {
            noti[0].map((item)=>{
                item.actions= [
                    {
                        "label": "Archive",
                        "iconName": "fa fa-archive",
                        "actionType": "COMPONENT_FUNCTION"
                    }];
                if(item.action){
                    item.actions.push({
                        "label": "View",
                        "iconName": "fa fa-eye",
                        "actionType": "COMPONENT_FUNCTION"
                    });
                }
            });
            response.notificationList = {
                action: payload.action,
                pageData: {
                    pageSize: payload.page.pageSize,
                    currentPageNo: payload.page.currentPageNo,
                    totalRecords: noti[1]
                },
                data: noti[0]
            };
            return ChainBreaker.success("Success");
        })
        .then(()=>{
            callback(response);
        })
        .catch((err) => {
            callback(err);
        });
}

function listByUserID(payload, UUIDKey, route, callback, JWToken) {
    //payload.userId = 'admin';
    payload.userId = payload.userID;
    _listByUserID(payload, callback);
}

function _listByUserID(payload, callback) {
    notifications.findByUserID(payload)
        .then((noti) => {
            const response = {
                notificationList: {
                    action: payload.action,
                    pageData: {
                        pageSize: payload.page.pageSize,
                        currentPageNo: payload.page.currentPageNo,
                        totalRecords: noti[1]
                    },
                    data: noti[0]
                }
            };
            callback(response);
        })
        .catch((err) => {
            callback(err);
        });
}

exports.list = list;
exports.listByUserID = listByUserID;

