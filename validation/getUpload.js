var logger = require('../lib/helpers/logger')().app;
var fs = require('fs');

var getUpload = function(UUID,res,getUpload_CB){

    var response = {
        "status" : "ERROR",
        "message" : "Download file failed"
    };

    logger.debug({fs:'getUpload.js', func:'getUpload'}, " [ Get Upload ] UUID : " + UUID);

    global.db.select("ImageUpload",{
        "UUID" : UUID
    },"",function(err,data){
        if(err){
            logger.error({fs:'getUpload.js', func:'getUpload'}, " [ Get Upload ] ERROR : " + err);
            getUpload_CB(response);
        }
        else if(data.length == 0){
            logger.error({fs:'getUpload.js', func:'getUpload'}, " [ Get Upload ] Data is Empty : " + data.length);
            getUpload_CB(response);
        }
        else{
			data = data[0];
            fs.exists(data["path"], function(exists){
			if (exists) {
				res.download(data["path"],data["name"]);
			}else {
				res.send(response);
				res.end();
				}
			});
        }
    });
};






module.exports = getUpload;
