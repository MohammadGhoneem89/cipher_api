var log4js = require('log4js');
var logger = log4js.getLogger('CipherRESTInterface');

var csvjson = require('csvjson');
var fs = require('fs');

var CSV_to_JSON = function (filePath,CSV_to_JSON_CB) {
    var response = {
        "action": "CSV to JSON",
        "data" : {
            "message" : {
                "status" : "ERROR",
                "errorDescription" : "CSV is not converted to JSON",
                "displayToUser" : true,
                "data" : ""
            }
        }
    }
    fs.readFile(filePath, { "encoding" : 'utf8'}, function (err,data) {
        if(err){
            logger.debug("Invalid request for read file CSV" + err);
            CSV_to_JSON_CB(response);
        }
        else{
            var options = {
                delimiter : ',',
                quote     : '"'
            };
            var data = csvjson.toObject(data, options);
            response["data"]["message"]["status"] = "OK";
            response["data"]["message"]["errorDescription"] = "CSV is converted to JSON successfully";
            response["data"]["message"]["data"] = data;
            CSV_to_JSON_CB(response);
        }
    });
}


module.exports = CSV_to_JSON;



