
const logger = require('../../../lib/helpers/logger')().app;
const pointer = require("json-pointer");
const permissionsHelper = require('../../../lib/helpers/permissions');
const permissionConst = require('../../../lib/constants/permissions');
const _ = require('lodash');


var entityDetailOut = function(payload,UUIDKey,route,callback,JWToken){
	
	 logger.debug(" [ Entity Detail ] PAYLOAD : "+JSON.stringify(payload,null,2));
	 logger.debug(" [ Entity Detail ] UUID : "+UUIDKey);
	 logger.debug(" [ Entity Detail ] Route : "+route);
	 logger.debug(" [ Entity Detail ] JWToken : "+JSON.stringify(JWToken,null,2));
	 
	 payload.userId = JWToken._id;
	 orgDetail(payload,callback);
	 
}


var orgDetail = function (payload, entityGetCB) {

   
    logger.debug(" [Entity Detail] Entity ID : " + payload.entityID);
    var response = {
        "entityDetail": {
            "action": "EntityDetail",
            "data": ""
        }
    };
		payload.entityID = payload.entityID || "";
		
        global.db.select("Entity",{
            "id" : payload.entityID
        },"",function (err, data) {
            if (err) {
                logger.error(" [Entity Detail] Error : "+ err);
                return entityGetCB(response);
            }
                data = _.get(data, '[0]', {});
				data.services = data.services || [];
				data.contacts = data.contacts || [];
				
                data["contacts"].forEach(function(d){
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
                    ])
                });
                data["services"].forEach(function(d){
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
                    ])
                });
                
				const params = {
                    userId: payload.userId,
                    documents: data,
                    docType: 'actions',
                    page: permissionConst.entityDetail.pageId,
                    component: ''
                };
                permissionsHelper.embed(params)
                    .then((res) => {
                        pointer.set(data,'/actions',res.pageActions);
                        response["entityDetail"]["data"] = data;
                        entityGetCB(response);
					});
        });
		
}

exports.entityDetailOut = entityDetailOut;
