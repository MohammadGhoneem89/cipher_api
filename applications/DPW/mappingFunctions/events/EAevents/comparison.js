
const equal = require('deep-equal');
let previousValue = [];
let newValue = [];
function manipulator(currentObject, previousObject) {

    for (let [props, values] of Object.entries(currentObject)) {
        if (previousObject.hasOwnProperty(props)) {
            if (typeof currentObject[props] === 'object') {
                // console.log(Object.keys(currentObject),"+++++++++++++++++++");
                let equalResult = equal(currentObject[props], previousObject[props]);
                if (!equalResult) {
                    previousValue.push(previousObject[props]);
                    newValue.push(currentObject[props])
                    finalObject.push({
                        "attributeName": props,
                        previousValue,
                        newValue
                    })
                }
            } else {

                if (currentObject[props] !== previousObject[props]) {
                    // if (!finalObject['modified']) {
                    //     finalObject['modified'] = []
                    // }
                    finalObject.push({
                        "attributeName": props,
                        "previousValue": [{
                            [props]: previousObject[props]
                        }],
                        "newValue": [{
                            [props]: currentObject[props]
                        }]
                    })
                }
            }
        } else {
            // if (!finalObject['new']) {
            //     finalObject['new'] = []
            // }
            finalObject.push({
                "attributeName": props,
                "newValue": [{
                    [props]: currentObject[props]
                }]
            })
        }
    }
    currentObject['deltaData'] = finalObject;
    console.log(JSON.stringify(currentObject.deltaData));
    return currentObject['deltaData'];
    // console.log(JSON.stringify());
}
exports.manipulator = manipulator;
