var logger = require('../../lib/helpers/logger')().app;
const fs = require('fs');
const pointer = require("json-pointer");
const config = require('../../config/index');



let ImageUpload = function (data, UUID, params, userID, source, context, imageUpload_CB) {

    logger.debug({fs:'ImageUpload.js', func:'ImageUpload'}, " [ Image Upload ] >>>>>>>>>>>>>>>    " + JSON.stringify(data));
    logger.debug({fs:'ImageUpload.js', func:'ImageUpload'}, " [ Image Upload ] >>>>>>>>>>>>>>>    " + UUID);
    logger.debug({fs:'ImageUpload.js', func:'ImageUpload'}, " [ Image Upload ] >>>>>>>>>>>>>>>    " + params);

    let response =  {
        "responseMessage": {
            "action": "ImageUpload",
            "data": {
                "message": {
                    "status": "ERROR",
                    "errorDescription": "Image Not Uploaded!!",
                    "displayToUser": true
                },
                "entityLogo": {
                    "sizeMedium": "",
                    "sizeSmall": ""
                }
            }
        }
    }
	let basePath = config.get('publicImagesPath');
    let base64Data = data.byteData;
    let fileName = data.context.name;
    let contentType = data.context.name;
    let arr = fileName.split(".");
    let name = arr[0];
    let ext = arr[1];
    let imageData = {};
	
	let path = "/images" + "/" + UUID + "." + ext;
    let destinationPath = basePath + "public" + path;

    base64Data = base64Data.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
    
    fs.writeFile(destinationPath, base64Data, 'base64', function (err) {
        if (err) {
            logger.error({fs:'ImageUpload.js', func:'ImageUpload'}, " [ Image Upload ] ERROR in write file : " + err);
            imageUpload_CB(response)
        }
        else {
            imageData["path"] = path;
            imageData["ext"]  = ext;
            imageData["name"] = fileName;
            imageData["type"] = params;
            imageData["userID"] = userID;
            imageData["source"] = source;
            imageData["UUID"] = UUID;
            imageData["context"] = context;
            imageData["contentType"] = contentType;
            imageData["hash"] = "";
            global.db.insert("ImageUpload", imageData, function (err, data) {
                if (err) {
                    logger.error({fs:'ImageUpload.js', func:'ImageUpload'}, " [ Image Upload ] Error in Image Insert : " + err);
                    imageUpload_CB(response)
                }
                else {
                    response["responseMessage"]["data"]["entityLogo"]["sizeMedium"] = path;
                    response["responseMessage"]["data"]["entityLogo"]["sizeSmall"] = path;
                    response["responseMessage"]["data"]["message"]["status"] = "OK";
                    response["responseMessage"]["data"]["message"]["errorDescription"] = "Image Successfully Upload";
                    imageUpload_CB(response)
                }
            });

        }
    });

}



module.exports = ImageUpload;
