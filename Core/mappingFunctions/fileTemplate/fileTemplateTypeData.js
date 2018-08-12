
var logger = require('../../lib/helpers/logger')().app;


function getFileTemplateData(getFileTemplateData_CB){

    global.db.aggregate("FileTemplate",{label:"$templateName",value : "$_id",_id : 0},function(err,data){
        if(err){
            logger.debug(" [ File Template Type Data ] ERROR : " + err);
        }
        else{
            getFileTemplateData_CB(data);
        }
    });
}


module.exports = getFileTemplateData;




