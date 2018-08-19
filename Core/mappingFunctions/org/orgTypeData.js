
const logger = require('../../../lib/helpers/logger')().app;

function getEntityTypeData(getEntityTypeData_CB){

    global.db.aggregate("Entity",{labelAR: "$arabicName", label:"$entityName",value : "$spCode",_id : 0},function(err,data){
        if(err){
            logger.error(err);
        }
        else{
            getEntityTypeData_CB(data);
        }
    });

}


module.exports = getEntityTypeData;
//
//



