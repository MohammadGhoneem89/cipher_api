const log4js = require('log4js');
const logger = require('../../lib/helpers/logger')().app;
const pointer = require("json-pointer");
const permissionsHelper = require('../../lib/helpers/permissions');
const permissionConst = require('../../lib/constants/permissions');
const _ = require('lodash');


var fileTemplateDetailOut = function(payload,UUIDKey,route,callback,JWToken){
	
	 logger.debug(" [ File Template Detail ] PAYLOAD : "+JSON.stringify(payload,null,2));
	 logger.debug(" [ File Template Detail ] UUID : "+UUIDKey);
	 logger.debug(" [ File Template Detail ] Route : "+route);
	 logger.debug(" [ File Template Detail ] JWToken : "+JSON.stringify(JWToken,null,2));
	 
	 payload.userId = JWToken._id;
	
    fileTemplateDetail(payload,callback);
	 
}


var fileTemplateDetail = function (payload,fileTemplateGet_CB) {

    logger.debug(" [ File Template Detail ] File Template ID : " + payload.fileTemplateID);
    var response = {
        "fileTemplateDetail": {
            "action": "fileTemplateDetail",
            "data": ""
        }
    };

	payload.fileTemplateID = payload.fileTemplateID || "";
	
  
        global.db.select("FileTemplate",{
            "id" : payload.fileTemplateID
        },"",function (err, data) {
            if (err) {
                logger.error(" [ File Template Detail ] Error : "+ err);
                fileTemplateGet_CB(response);
            }
            else {
                data = _.get(data, '[0]', {});
				
				data.fields = data.fields || [];
				data["fields"].forEach(function(d){
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
				const params = {
                    userId: payload.userId,
                    documents: data,
                    docType: 'actions',
                    page: permissionConst.fileTemplateDetail.pageId,
                    component: ''
                };
                permissionsHelper.embed(params)
                    .then((res) => {
                        pointer.set(data,'/actions',res.pageActions);
                        response["fileTemplateDetail"]["data"] = data;
                        fileTemplateGet_CB(response);
                    });
            }
        });
}

exports.fileTemplateDetailOut = fileTemplateDetailOut;
