
const sqlserver = require('../../../../core/api/connectors/mssql');
const {
    error
} = require('../../lib/response');
const uuid = require('uuid/v1');
// const organizationType = require('../../../../lib/models/organizationType');
const SampleLetters = require('../../../../lib/models/sampleLetters');

const { validateJsonLength } = require('../../lib/utils')

async function addUpdateSampleLetter(payload, UUIDKey, route, callback, JWToken) {
    try {

        console.log(payload.body, 'BODY+=======================');
        // if (!validateJsonLength(payload.body)) {
        //     return callback(error('JSON in request is not valid'));
        // }
        const { templateName, templateMarkup, templateType, templateId, templatePayload, templatePath } = payload.body;
        if (!templateId) {

            let res = await SampleLetters.create({
                "templateId": uuid(),
                "templateName": templateName,
                "templateMarkup": templateMarkup,
                "templatePayload": JSON.stringify(templatePayload),
                "templateType": templateType,                
                "templatePath": templatePath,                

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
                            newPageURL: '/purehealth/templateList'
                        }
                    }
                }
            };
            callback(resp)
        } else {
            let res = await SampleLetters.findOneAndUpdate({
                "templateId": templateId,
            }, {
                "templateMarkup": templateMarkup,
                "templateName": templateName,
                "templatePayload": templatePayload,
                "templateType": templateType,
                "templatePath": templatePath
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
                        newPageURL: '/app/templateList'
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
    addUpdateSampleLetter
}