'use strict';

const commissionTemplate = require('../../../lib/services/commissionTemplate');
var pointer = require("json-pointer");

function get(payload, UUIDKey, route, callback, JWToken) {
	payload.userId = JWToken._id;
    commissionTemplateDetail(payload, callback);
}

function commissionTemplateDetail(payload, callback) {
    commissionTemplate.getDetails(payload)
        .then((templateData) => {
			let commissionDetails = templateData.data.commissionDetails;
            if(commissionDetails && commissionDetails.length > 0){
				templateData.data.commissionDetails.forEach(function(d){
                pointer.set(d,"/actions",[
						{
							"label": "Edit",
							"iconName": "fa fa-edit",
							"actionType": "COMPONENT_FUNCTION"
						},
						{
							"label": "Delete",
							"iconName": "fa fa-trash",
							"actionType": "COMPONENT_FUNCTION"
						}
                    ]);
                });
			}
            const response = {
                commissionTemplateDetail: {
                    action: payload.action,
                    data: templateData.data
                }
            };

            callback(response);
        })
        .catch((err) => {
            callback(err);
        });
}

exports.get = get;

