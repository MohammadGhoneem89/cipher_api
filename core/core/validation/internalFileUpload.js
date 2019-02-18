var logger = require('../../lib/helpers/logger')().app;
const mv = require('mv');
const fs = require('fs');
const pointer = require("json-pointer");
const config = require('../../config/index');



var internalFileUpload = function(path,UUID,ext,type,userID,source,context,fileUpload_CB) {

    logger.debug({fs:'internalFileUpload.js', func:'internalFileUpload'}, ">>>>>>>>>>>>>>>    " + file.name);
    logger.debug({fs:'internalFileUpload.js', func:'internalFileUpload'}, ">>>>>>>>>>>>>>>    " + UUID);
    logger.debug({fs:'internalFileUpload.js', func:'internalFileUpload'}, ">>>>>>>>>>>>>>>    " + ext);
    logger.debug({fs:'internalFileUpload.js', func:'internalFileUpload'}, ">>>>>>>>>>>>>>>    " + params);

    var response = {
        "message": "Error acquired in file upload",
        "status": false,
        "contextData" : []
    }

    var basePath = config.get('basePath');
    var fileName = file.name;
    var dirDate = date();
    var data = {};
    var contentType = file.mimetype;
    var path = "";
    var destinationPath = "";
    if (params == "Document") {
        path = basePath + "/document" + "/" +dirDate;

        destinationPath = basePath + "/document" + "/" + dirDate + "/" + UUID + "." + ext;
    }
    else if (params == "Image") {
        path = basePath + "/public/images";
        destinationPath = basePath + "/public/images" + "/" + UUID + "." + ext;
    }

    fsDirectory(path,destinationPath,function(msg){
        if(msg){
            logger.debug(" [ Image Upload ] Directory : " + msg);
            mv(destinationPath,function(err){
                if (err) {
                    logger.debug({fs:'internalFileUpload.js', func:'fsDirectory'}, "[ Image upload ] Error acquired in file move : " + err);
                }
                else {
                    data["path"] = destinationPath;
                    data["ext"]  = ext;
                    data["name"] = file.name;
                    data["type"] = params;
                    data["userID"] = userID;
                    data["source"] = source;
                    data["UUID"] = UUID;
                    data["context"] = context;
                    data["contentType"] = contentType;
                    data["hash"] = "";



                    global.db.insert("ImageUpload",data,function(err,data){
                        if(err){
                            logger.error({fs:'internalFileUpload.js', func:'fsDirectory'}, " [ Image Upload ] Image Upload Data : " + err);
                        }
                        else{
                            global.db.select("ImageUpload",{
                                "context" : context
                            },{
                                "context" : 1,
                                "path" : 1,
                                "ext" : 1,
                                "name" : 1,
                                "UUID" : 1
                            },function(err,contextData){
                                if(err){
                                    logger.error({fs:'internalFileUpload.js', func:'fsDirectory'}, " [ Image Upload ] ERROR in get context : " + err);
                                    fileUpload_CB(response);
                                }
                                else if(contextData.length == 0){
                                    logger.error({fs:'internalFileUpload.js', func:'fsDirectory'}, " [ Image Upload ] Context data is empty : " + contextData.length);
                                    fileUpload_CB(response);
                                }
                                else{
                                    contextData.forEach(function(d){

                                        let fileDetail = {"name" : d.name, "UUID": d.UUID}
                                        pointer.set(d,"/fileDetail",fileDetail)
                                    });
                                    response["message"] = "Successfully Uploaded";
                                    response["status"] = "ok";
                                    response["contextData"] = contextData;
                                    fileUpload_CB(response);
                                }
                            });
                        }
                    });

                }
            });
        }
        else{
            logger.debug({fs:'internalFileUpload.js', func:'internalFileUpload'}, " [ Image Upload ] Error acquired in directory creation : " + msg);
        }

    });

}

function fsDirectory(path,destinationPath,callback) {
    fs.exists(path,function(exist){
        if(exist){
            callback("Success");
        }
        else{
            fs.mkdir(path,function(err){
                if(err){
                    callback(err);
                }
                else{
                    callback("Success");
                }
            });
        }
    })
}

function date(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    today = dd+'-'+mm+'-'+yyyy;
    return today;
}

module.exports = internalFileUpload;


