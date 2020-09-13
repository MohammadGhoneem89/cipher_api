
const uuid = require('uuid/v1');
// const organizationType = require('../../../../lib/models/organizationType');
const Letters = require('../../../lib/models/letters');

async function addUpdateLetter(payload, UUIDKey, route, callback, JWToken) {
    try {

        console.log(payload.body, 'BODY+=======================');
        // if (!validateJsonLength(payload.body)) {
        //     return callback(error('JSON in request is not valid'));
        // }
        const { templateName, templatePath, templateMarkup, templateId, templateType, sampleJson } = payload.body;
        if (!templateId) {

            let res = await Letters.create({
                "templateId": 'Let_' + uuid(),
                "templateName": templateName,
                "templatePath": templatePath,
                "templateMarkup": templateMarkup,
                "templateType": templateType,
                "sampleJson": sampleJson,

            });


            console.log(res);


            // return callback(success('Success Record Created'));
            const resp = {
                responseMessage: {
                    action: null,
                    data: {
                        message: {
                            status: 'OK',
                            errorDescription: 'Success Record Created !!!',
                            displayToUser: true,
                            newPageURL: '/templateList'
                        }
                    }
                }
            };
            callback(resp)
        } else {
            let res = await Letters.findOneAndUpdate({
                "templateId": templateId,
            }, {
                "templatePath": templatePath,
                "templateMarkup": templateMarkup,
                "templateName": templateName,
                "templateType": templateType,
                "sampleJson": sampleJson,
            });


            console.log(res);


            // return callback(success('Success Record Created'));
            const resp = {
                responseMessage: {
                    action: null,
                    data: {
                        message: {
                            status: 'OK',
                            errorDescription: 'Success Record Updated !!!',
                            displayToUser: true,
                            newPageURL: '/templateList'
                        }
                    }
                }
            };
            callback(resp)
            // return callback(success('Success Record Updated'));
        }
    } catch (err) {
        return callback(err);
    }
}

module.exports = {
    addUpdateLetter
}