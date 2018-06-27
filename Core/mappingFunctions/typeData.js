
var logger = require('../../lib/helpers/logger')().app;
var pointer = require("json-pointer");


var typeDataOut = function(payload,UUIDKey,route,callback,JWToken){

    logger.debug(" [ Type Data ] PAYLOAD : "+JSON.stringify(payload,null,2));
    logger.debug(" [ Type Data ] UUID : "+UUIDKey);
    logger.debug(" [ Type Data ] Route : "+route);
    logger.debug(" [ Type Data ] JWToken : "+JSON.stringify(JWToken,null,2));

    var typeData = payload.typeData;
    getTypeData(typeData,callback);

}

function getTypeData(typeData,getTypeData_CB){

    var response = {
        typeData:{
            "action" : "TypeData",
            "data" : {}
        }
    }

    logger.debug(" [ Type Data ] Type Data IDs : " + typeData);

    global.db.select("TypeData",{
            "typeName" : {
                "$in" : typeData
            }
        }
        ,{
            "data" : 1
        },function(err,typeDataData){
            if(err){
                logger.debug(" [ Type Data ] ERROR : " + err);
                getTypeData_CB(response);
            }
            else{

                for(let i=0 ; i<typeData.length ; i++){
                    let x = {}
                    try{
                        x = pointer.get(typeDataData,'/'+i+ '/data' );
                    }
                    catch(err){
                        logger.error(err);
                    }
                    if(x){
                        pointer.set(response,"/typeData/data/" + typeData[i],x[typeData[i]])
                    }
                }
                getTypeData_CB(response);
            }
        });
}



exports.typeDataOut = typeDataOut;

