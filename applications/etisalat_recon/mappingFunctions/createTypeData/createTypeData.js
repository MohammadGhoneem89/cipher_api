const typeData = require('../../../../lib/services/typeData');
const _ = require('lodash');

function createTypeData(payload, UUIDKey, route, callback, JWToken) {
    let structureTypeData;
    let getTypeData = [];

    for (let i = 0; i < payload.body.data.length; i++) {
        getTypeData.push({
            "typeName": payload.body.data[i].type,
            "label": payload.body.data[i].id,
            "value": payload.body.data[i].description
        })
    }
    const newTypeData = [...new Set(getTypeData.map(it => it.typeName))];
    let unique;
    for (let i = 0; i < getTypeData.length; i++) {
        unique = getTypeData.filter(item => newTypeData.find(obj => item.typeName === obj))
    }

    let newGroup = {}
    unique.forEach(obj => {
        newGroup[obj.typeName] ? // check if that array exists or not in newGroup object
            newGroup[obj.typeName].push({ label: obj.label, value: obj.value })  // just push
            : (newGroup[obj.typeName] = [],
                newGroup[obj.typeName].push({ label: obj.label, value: obj.value })) // create a new array and push
    })

    console.log(newGroup, "newGroup");
    let keys = Object.keys(newGroup);
    let typeData = Object.values(newGroup)
    console.log(keys, "keys")
    console.log(typeData, "values")

    for (let i = 0; i < Object.keys(newGroup).length; i++) {
        structureTypeData = {
            action: "typeData",
            typeName: keys[i],
            typeNameDetails: typeData[i]
        }
        console.log(structureTypeData, "structureTypeData")
        insertTypeData(structureTypeData, callback);
    }
}
function insertTypeData(structureTypeData, callback) {
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
                    action: structureTypeData.action,
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



