'use strict';
const Widgets = require('../../../../lib/models/widget.js');
const _ = require('lodash');

exports.getWidgetList = async function (payload, UUIDKey, route, callback, JWToken) {

    
            let data = await Widgets.find();

    
            let response = {
                "getWidgetList": {
                    "action": "getWidgetList",
                    "pageData": {
                        "pageSize": 10,
                        "currentPageNo": 1,
                        "totalRecords": data.length
                    },
                    "data": {
                        "searchResult": {
                            widgetList: data
                        }
                    }
                }
            };
            return callback(response);
}

