const jsons = require('./jsons');
const equal = require('deep-equal');
const _ = require('lodash');

function manipulator(currentObject, previousObject) {
    let finalObject = [];
    let previousValue = [];
    let newValue = [];
    for (let [props, values] of Object.entries(currentObject)) {
        if (previousObject.hasOwnProperty(props)) {
            if (typeof currentObject[props] === 'object') {
                // console.log(Object.keys(currentObject),"+++++++++++++++++++");
                let equalResult = equal(currentObject[props], previousObject[props]);
                if (!equalResult && !_.isArray(currentObject[props])) {
                    previousValue.push(previousObject[props]);
                    newValue.push(currentObject[props])
                    finalObject.push({
                        "attributeName": props,
                        previousValue,
                        newValue
                    })
                } else if (!equalResult && _.isArray(currentObject[props])) {
                    // console.log("ARRAY !!!!!!")
                    finalObject.push({
                        "attributeName": props,
                        previousValue: previousObject[props],
                        newValue: currentObject[props]
                    })
                }
            } else {

                if (currentObject[props] !== previousObject[props]) {
                    let previousValue = [];
                    let newValue = [];
                    previousValue.push(previousObject[props]);
                    newValue.push(currentObject[props])
                    finalObject.push({
                        "attributeName": props,
                        previousValue,
                        newValue
                    })
                }
            }
        } else {
            // if (!finalObject['new']) {
            //     finalObject['new'] = []
            // }
            if (typeof currentObject[props] === 'object' && !_.isArray(currentObject[props])) {
                let newValue = [];
                newValue.push(currentObject[props])
                finalObject.push({
                    "attributeName": props,
                    newValue
                })
            }
            else if (typeof currentObject[props] === 'object' && _.isArray(currentObject[props])) {
                finalObject.push({
                    "attributeName": props,
                    newValue: currentObject[props]
                })
            }
            else if (typeof currentObject[props] === 'object') {
                finalObject.push({
                    "attributeName": props,
                    "newValue": [{
                        [props]: currentObject[props]
                    }]
                })
            }

        }
    }
    currentObject['deltaData'] = finalObject;
    console.log(JSON.stringify(currentObject.deltaData));
    return currentObject['deltaData'];
    // console.log(JSON.stringify());
}
exports.manipulator = manipulator;
