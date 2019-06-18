const typeData = require('../../../../lib/services/typeData');

function createTypeData(payload, UUIDKey, route, callback, JWToken) {
    let structureTypeData;
    let typeName;
    let typeNameDetails = [];
    for (let i = 0; i < payload.body.data.length; i++) {
        typeName = "integration_" + payload.body.data[i].type;
        typeNameDetails.push({
            "label": payload.body.data[i].id,
            "value": payload.body.data[i].description
        })
    }
    structureTypeData = {
        action: "typeData",
        typeName: typeName,
        typeNameDetails: typeNameDetails
    }
    typeData.insertTypeData(structureTypeData)
        .then(() => {
            const response = {
                responseMessage: {
                    action: structureTypeData.action,
                    data: {
                        message: {
                            status: 'OK',
                            errorDescription: 'typeData inserted successfully',
                            displayToUser: true
                        }
                    }
                }
            };

            console.log(JSON.stringify(response));
            callback(response);
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
            console.log(JSON.stringify(response))
            callback(response);
        });
}
exports.createTypeData = createTypeData;



