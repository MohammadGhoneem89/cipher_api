const log4js = require('log4js');
const logger = log4js.getLogger('getPermission');
const fs = require('fs');
//var pdf = require('html-pdf');
const gridProjection = require("./gridProjection.js");
const json2xls = require('json2xls');
const entityService = require("../../../mappingFunctions/entity/entityList");
const acquirerService = require("../../../mappingFunctions/acquirer/acquirerList");
const pointer = require("json-pointer");
const uuid = require("uuid");
const destinationPath = require("./destinationPath");
const config = require('../../../config');


var exportFile = function (payload,type,gridType,JWToken, export_CB) {

    logger.debug(" [ File Exports ] Search Criteria  : " + JSON.stringify(payload, 2));
    logger.debug(" [ File Exports ] type  : " + type);
    logger.debug(" [ File Exports ] gridType  : " + gridType);
	
	var response = {
        "message": "Error acquired in file export",
        "success": false
    }

    var basePath = config.get('basePath');
    var tempObj = {};
    var searchCriteria = "";
    if(payload.length > 0){
        searchCriteria = parseJsonBase64(payload);
    }
    else{
        pointer.set(tempObj,'/searchCriteria',searchCriteria);
		pointer.set(tempObj,'/page',{});
    }
	
    var path = "";
    var UUID = uuid();
    

    if(gridType == "Acquirer"){

        acquirerService.acquirerListOut(tempObj, "", "", function (data) {

            logger.debug(" [ File Exports ] Acquirer Data  : " + JSON.stringify(data, 2));


            if (type == "excel") {

                let acquirerListDataA = data.acquirer.data.searchResult;

                entityListData = GetFlattenedData(acquirerListDataA, destinationPath.acquirer.popPath,
                destinationPath.acquirer.pushPath);

                path = basePath + "\\temp\\" + UUID + ".xlsx";

                excelConverter(entityListData, path, function (flag) {
                    if (flag == false) {
                        export_CB(response);
                    }
                    else {
                        export_CB(path);
                    }
                });

            }
        });

    }

    if(gridType == "Entity"){

        entityService.entityListOut(tempObj, "", "", function (data) {

            logger.debug(" [ File Exports ] Entity Data  : " + JSON.stringify(data, 2));

            if (type == "excel") {
                let entityListDataA = data.entityList.data.searchResult;

                //entityListData = GetFlattenedData(entityListDataA, destinationPath.entity.popPath,
                //destinationPath.entity.pushPath);
				
                path = basePath + "\\temp\\" + UUID + ".xlsx";

                excelConverter(dataB, path, function (flag) {
                    if (flag == false) {
                        export_CB(response);
                    }
                    else {
                        export_CB(path);
                    }
                });

            }
        },JWToken);

    }



}


//var pdfConverter = function(){
//
//    var html = fs.readFileSync(global.appDir + '/sample.html', 'utf8');
//    var options = { format: 'Letter' };
//
//    pdf.create(html, options).toFile(__dirname + "/abc.pdf", function(err, res) {
//        if (err) {
//            console.log("ERROR   " + err);
//        }
//        else{
//            console.log(JSON.stringify(res) + "  >>>>>>>>>>>>>>>>");
//        }
//    });
//}


function excelConverter(entityData, path, excel_CB) {
    var flag = false
    var xls = json2xls(entityData);


    fs.writeFile(path, xls, 'binary', function (err) {
        if (err) {
            logger.debug(" [ File Exports ] ERROR in write file " + err);
            excel_CB(flag);
        }
        else {
            flag = true
            excel_CB(flag);
        }
    });
}


function GetFlattenedData(data, srcArr, destArr) {
    let destObj = [];
    const UUID = uuid();

    for (let j = 0; j < data.length; j++) {
        let targetJSONObj = {};
        for (let i = 0; i < destArr.length; i++) {
            let val = pointer.get(data[j], srcArr[i]);
            pointer.set(targetJSONObj, destArr[i], val);
        }
        destObj.push(targetJSONObj);
    }
    return destObj;
}


function parseJsonBase64(str) {
    return JSON.parse(new Buffer(str, 'base64'));
}


module.exports = exportFile;
