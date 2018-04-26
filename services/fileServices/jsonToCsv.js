var json2csv = require('json2csv');
var fs = require('fs');




var CSV_to_JSON = function(filePath,data,fields,CSV_to_JSON_CB){

    response = {
        "message" : "Invalid Request for converting json to csv",
        "status" : false
    }
    var csv = json2csv({ data: data, fields: fields });
    fs.writeFile(filePath, csv, function(err) {
        if (err) {
            logger.debug("Error acquired in converting csv to json ..." + err);
            CSV_to_JSON_CB(response);
        }
        else{
            response.message = "Successfully Wirte json to csv";
            response.status = true;
            CSV_to_JSON_CB(response);
        }
    });
}

module.exports = CSV_to_JSON;


//var csvData = {
//    "_id" : "59b646c4212297005d466c7b",
//    "entityName" : "Dar Al Ber Society",
//    "arabicName" : "Dar Al Ber Society",
//    "spCode" : "1",
//    "shortCode" : "12",
//    "legacyCode" : "999999",
//    "services" : [
//        {
//            "serviceName" : "Service Name 1",
//            "serviceCode" : "Service Code 1"
//        },
//        {
//            "serviceName" : "Service Name 2",
//            "serviceCode" : "Service Code 1"
//        }
//    ],
//    "isActive" : true,
//    "entityLogo" : {
//        "sizeSmall" : "http://smallImage.jpg",
//        "sizeMedium" : "https://botw-pd.s3.amazonaws.com/styles/logo-thumbnail/s3/0014/7627/brand.gif?itok=SNrp-Ex7"
//    },
//    "parentEntity" : "object_id ('ParentEntity')",
//    "accounting" : {
//        "GISAccountNo" : "abc-123-xyz",
//        "exemptedTillDate" : "3/04/2014",
//        "notifyBeforeMonth" : "Sep"
//    },
//    "commissionTemplate" : "",
//    "recon" : {
//        "integrationType" : "Blockchain",
//        "fileFormatTemplate" : "DSGStandard",
//        "noOfDays" : "3",
//        "serverDetails" : {
//            "serverIP" : "192.168.0.21",
//            "port" : "2202",
//            "username" : "Sandeep",
//            "password" : "abc123",
//            "certificate" : ""
//        }
//    },
//    "settlement" : {
//        "settlementCriteria" : "2WAY",
//        "settlementType" : "Manual",
//        "autoPeriod" : "4",
//        "escalationAfter" : "2"
//    },
//    "contacts" : [
//        {
//            "contactName" : "kashan",
//            "email" : "kashan@abc.com",
//            "mobile" : "9235698955655"
//        },
//        {
//            "contactName" : "safwan",
//            "email" : "safwan@abc.com",
//            "mobile" : "9235698955655"
//        }
//    ],
//    "documents" : [
//        {
//            "documentName" : "costumer",
//            "fileType" : "DSGStandard",
//            "retreivalPath" : "http://temp.xml",
//            "documentHash" : ""
//        }
//    ],
//    "actions" : [
//        {
//            "name" : "Edit",
//            "actionURI" : "/entitySetup/59b646c4212297005d466c7b",
//            "params" : "",
//            "icon" : "fa fa-edit"
//        }
//    ],
//    "dateCreated" : "Sept 16, 2016, 10:15",
//    "createdBy" : "Abdullah",
//    "dateUpdated" : "Sept 17, 2017, 10:15",
//    "updatedBy" : "Abdullah"
//}
//var fields = ['_id','entityName','arabicName','spCode','legacyCode','services','isActive','entityLogo','parentEntity','accounting','commissionTemplate','recon','settlement','contacts','documents','actions','dateCreated','createdBy','dateUpdated','updatedBy'];
//
//
//jsonToCsv("./temp/demoCSV.csv",csvData,fields,function(data){
//    console.log(JSON.stringify(data));
//});
