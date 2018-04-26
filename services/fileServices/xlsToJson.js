var log4js = require('log4js');
var logger = log4js.getLogger('CipherRESTInterface');
var xls_to_json = require("xls-to-json");



var xlsToJson = function(inputFile,outputFile,sheetName,callback){

    xls_to_json({
        input  : inputFile,
        output : outputFile,
        sheet  : sheetName
    }, function(err, result) {
        if(err) {
            logger.debug(err + " >>>>>>>>>>> ERROR")
            console.error(err + " >>>>>>>>>>> ERROR");
        } else {
            logger.debug(result + " >>>>>>>>>>> RESULT");
            callback(result);
        }
    });

}

module.exports = xlsToJson ;

