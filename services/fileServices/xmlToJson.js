var log4js = require('log4js');
var logger = log4js.getLogger('CipherRESTInterface');

var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

var XML_to_JSON = function(filePath, XML_to_JSON_CB){

    var response = {
        "message" : "Invalid Request ...",
        "status" : false,
        "data" : ""
    }

    fs.readFile(filePath, function(err, data) {
        if(err){
            logger.debug("Invalid request for read file XML" + err);
            XML_to_JSON_CB(response);
        }
        else{
            parser.parseString(data, function (err, result) {
                if(err){
                    logger.debug("Error acquired in parseing data to json");
                    XML_to_JSON_CB(response);
                }
                else{
                    //response["message"] = "Successfully converted xml to json";
                    //response["status"] = true;
                    //response["data"] = result
                    XML_to_JSON_CB(response);
                }
            });
        }
    });
}


module.exports = XML_to_JSON;


//xmlToJson("./temp/edirham_20.xml",function(data){
//	console.log(JSON.stringify(data));
//});
