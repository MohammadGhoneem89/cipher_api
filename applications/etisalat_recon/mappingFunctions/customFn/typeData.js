// var request = require("request");
 const typeData = require('../../../../lib/services/typeData');
// insertTypeDataName()

function test(payload, UUIDKey, route, callback, JWToken){
    console.log(JSON.stringify(payload.body.data),"PAYLOAD")

    typeData.insertTypeData(structureTypeData)
        .then((typeData) => {

            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: {
                            status: 'OK',
                            errorDescription: 'typeData inserted successfully',
                            displayToUser: true
                        }
                    }
                }
            };
            console.log(JSON.stringify(response))
        })
        .catch((err) => {
            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: {
                            status: 'ERROR',
                            errorDescription: 'typeData not inserted',
                            displayToUser: true
                        },
                        error: err.stack || err
                    }
                }
            };
            // callback(response);
            console.log(JSON.stringify(response))
        });
}
exports.test=test;

    console.log(" inside insert fun")
    


