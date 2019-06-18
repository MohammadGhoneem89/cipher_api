'use strict';
const typeData = require('../../../../lib/services/typeData');
const _ = require('lodash');



function createTypeData(payload, UUIDKey, route, callback, JWToken) {

    const data = payload.data;
    let structureTypeData;
    let getTypeData = [];
    let unique;
    let newGroup = {}
    let newTypeData;
    let keys;
    let typeData;


    data.forEach((object) => {
        getTypeData.push({
            "typeName": object.type,
            "label": object.id,
            "value": object.description
        });
    });

    newTypeData = [...new Set(getTypeData.map(item => item.typeName))];
    getTypeData.forEach(() => {
        unique = getTypeData.filter(item => newTypeData.find(obj => item.typeName === obj));
    })

    unique.forEach(obj => {
        newGroup[obj.typeName] ? // check if that array exists or not in newGroup object
            newGroup[obj.typeName].push({ label: obj.label, value: obj.value })  // just push
            : (newGroup[obj.typeName] = [],
                newGroup[obj.typeName].push({ label: obj.label, value: obj.value })); // create a new array and push
    })

    keys = Object.keys(newGroup);
    typeData = Object.values(newGroup);
    for (let i in Object.keys(newGroup)) {
        structureTypeData = {
            action: "typeData",
            typeName: keys[i],
            typeNameDetails: typeData[i]
        }
        console.log(structureTypeData, "structureTypeData");
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

            // console.log(JSON.stringify(response));
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
            // console.log(JSON.stringify(response))
            callback(response);
        });
}

exports.createTypeData = createTypeData;



