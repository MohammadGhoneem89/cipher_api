
const equal = require('deep-equal');
let finalObject = [];

function manipulator(currentObject, previousObject) {
   console.log("INSIDE manipulator==============")
    for (let [props, values] of Object.entries(currentObject)) {
        // console.log(previousObject.hasOwnProperty(props));
        if (previousObject.hasOwnProperty(props)) {
            if (typeof currentObject[props] === 'object') {
                let equalResult = equal(currentObject[props], previousObject[props]);
                if (!equalResult) {
                    finalObject.push({
                        "attributeName": props,
                        "previousValue": {
                            [props]: previousObject[props]
                        },
                        "newValue": {
                            [props]: currentObject[props]
                        }
                    })
                }
            } else {

                if (currentObject[props] !== previousObject[props]) {
                    // if (!finalObject['modified']) {
                    //     finalObject['modified'] = []
                    // }
                    finalObject.push({
                        "attributeName": props,
                        "previousValue": {
                            [props]: previousObject[props]
                        },
                        "newValue": {
                            [props]: currentObject[props]
                        }
                    })
                }
            }
        } else {
            // if (!finalObject['new']) {
            //     finalObject['new'] = []
            // }
            finalObject.push({
                "attributeName": props,
                "newValue": {
                    [props]: currentObject[props]
                }
            })
        }
    }
    currentObject['deltaData'] = finalObject;
    return currentObject['deltaData'];
    // console.log(JSON.stringify());
}
exports.manipulator=manipulator;
