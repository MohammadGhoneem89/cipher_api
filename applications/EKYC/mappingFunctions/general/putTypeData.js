const { insertTypeDataObject } = require('../../../../core/mappingFunctions/typeData/insertTypeDataObject');
const { typeDataOut } = require('../../helpers/getTypeData');
const typeData = require('../../../../lib/services/typeData');
const _ = require('lodash');

exports.putTypeData = function (payload, UUIDKey, route, callback, JWToken) {

    try {
        let typeDataObject = {}
        let data = _.get(payload, "body.data", null);

        if (!data || !Array.isArray(data)) {
            throw 'data field missing or format is incorrect';
        }

        data.forEach((element, index) => {
            if (!element.Id) {
                throw `Id missing in data[${index}]`
            }
            if (!element.type) {
                throw `type missing in data[${index}]`
            }
            if (!element.description) {
                throw `description missing in data[${index}]`
            }

            let operation = _.get(element, 'operation', 'I')
            if (!(operation == 'I' || operation == 'U' || operation == 'D')) {
                throw `Invalid operation specified in data[${index}]`
            }


            if (!typeDataObject[element.type]) {
                typeDataObject[element.type] = [];
            }
            typeDataObject[element.type].push(element);
        });


        Object.entries(typeDataObject).forEach(async entry => {
            let typeName = entry[0];
            let incomingElements = entry[1];

            let typeDataDetails = await typeDataOut({ "action": "TypeData", "typeData": [typeName] });
            let request = {}
            console.log("------------->", JSON.stringify(typeDataDetails))
            let existingElements = _.get(typeDataDetails, `typeData.data[${typeName}].data[${typeName}]`, null);

            if (existingElements != null) {
                let id = _.get(typeDataDetails, `typeData.data[${typeName}]._id`, null);
                incomingElements.forEach(element => {
                    let operation = _.get(element, 'operation', 'I')
                    switch (operation) {
                        case 'I': {
                            insertUpdateElement(existingElements, element)
                            break;
                        }
                        case 'U': {
                            insertUpdateElement(existingElements, element)
                            break;
                        }
                        case 'D': {
                            removeElement(existingElements, element)
                            break;
                        }
                    }
                });
                request = _.clone(payload);
                delete request.body
                request.id = id.toString();
                request.typeNameDetails = existingElements;
                request.typeName = typeName
                request.type = 'etisalat-recon'
                let response = await typeData.updateTypeData(request)
            }
            else {
                existingElements = []
                incomingElements.forEach(element => {
                    let operation = _.get(element, 'operation', 'I');
                    switch (operation) {
                        case 'I': {
                            insertUpdateElement(existingElements, element)
                            break;
                        }
                        case 'U': {
                            insertUpdateElement(existingElements, element)
                            break;
                        }
                    }
                });
                request = payload;
                request.typeNameDetails = existingElements;
                request.typeName = typeName
                request.type = 'etisalat-recon'
                let response = await typeData.insertTypeData(request)
            }
        })

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
        callback(response);
    }
    catch (err) {
        const response = {
            responseMessage: {
                action: payload.action,
                data: {
                    message: {
                        status: 'ERROR',
                        errorDescription: 'typeData not inserted',
                        displayToUser: true
                    },
                    error: err
                }
            }
        };
        callback(response);
    };

    // let typeName = _.get(payload, "body.data[0].type", null);
    // let typeNameDetails = _.get(payload, "body.data", null);
    // payload.body.typeNameDetails = typeNameDetails;
    // delete payload.body.data;

    // if (!typeName) {
    //     const response = {
    //         responseMessage: {
    //             action: payload.action,
    //             data: {
    //                 message: {
    //                     status: 'ERROR',
    //                     errorDescription: 'typeData not inserted',
    //                     displayToUser: true
    //                 },
    //                 error: 'typeName not found'
    //             }
    //         }
    //     };
    //     callback(response);
    // }

    // payload.body.typeName = typeName;
    // payload = { ...payload, ...payload.body, type: 'etisalat-recon' }
    // delete payload.body;
    // console.log('!!!!!!', payload)
    // insertTypeDataObject(payload, UUIDKey, route, callback, JWToken)
}

function insertUpdateElement(existingElements, incomingElement) {
    let flag = false;

    existingElements.forEach(existingElement => {
        if (existingElement.label == incomingElement.Id) {
            existingElement.value = incomingElement.description
            flag = true;
            return;
        }
    });

    if (!flag) {
        existingElements.push(
            {
                label: incomingElement.Id,
                value: incomingElement.description
            }
        )
    }
}

function removeElement(existingElements, incomingElement) {
    existingElements.forEach((existingElement, index) => {
        if (existingElement.label == incomingElement.Id) {
            existingElements.splice(index, 1)
            return;
        }
    });
}