
const sqlserver = require('../../../../core/api/connectors/mssql');
const {
    error
} = require('../../lib/response');
const uuid = require('uuid/v1');
// const organizationType = require('../../../../lib/models/organizationType');
const Letters = require('../../../../lib/models/letters');

const rp = require('request-promise');
const path = require('path');

const { validateJsonLength } = require('../../lib/utils')

async function testLetter(payload, UUIDKey, route, callback, JWToken, res) {
    try {
        console.log('WORKS');
        console.log(payload, '============');
        // if (!validateJsonLength(payload)) {
        //     return callback(error('JSON in request is not valid'));
        // }



        const { templateId } = payload.templatePayload.template;
        if (templateId) {

            let resp = await Letters.find({
                "templateId": templateId
            });


            console.log(resp);

            const options = {
                method: 'POST',
                uri: 'http://localhost:8000/reportPdfSubmit',
                headers: {
                    'User-Agent': 'Request-Promise',
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive'
                },
                body: {
                    templateName: resp[0].templateName,
                    templatePath: resp[0].templatePath,
                    templateMarkup: resp[0].templateMarkup,
                    filePath: payload.templatePayload.template.filePath,
                    templateType: resp[0].templateType,
                    outputFileName: payload.templatePayload.template.outputFileName,
                    data: payload.templatePayload.data
                },
                // body: {
                //     templateName: payload.templatePayload.template.outputFileName,
                //     templatePath: resp[0].templatePath,
                //     templateMarkup: resp[0].templateMarkup,
                //     filePath: payload.templatePayload.template.filePath,
                //     outputFileName:payload.templatePayload.template.outputFileName,
                //     data: payload.templatePayload.data
                // },
                json: true
            };
            let document = await rp(options);

            console.log(document, 'DOCUMENTTTTTTTTTTTTTT');
            let fileName = payload.templatePayload.template.filePath+'/'+payload.templatePayload.template.outputFileName+'.pdf';
            async function downloadDoc(document) {
                const file = path.normalize(document);
                return path.resolve(file);
            }
            let result = await downloadDoc(fileName);
    
            return res.sendFile(result);

            // const resp = {
            //     responseMessage: {
            //         message: "document downloaded successfully",
            //         path: payload.templatePayload.template.filePath+'/'+payload.templatePayload.template.outputFileName+'.pdf'
            //     }
            // }

            // callback(resp);
            // const resp = {
            //     responseMessage: {
            //         action: null,
            //         data: {
            //             message: {
            //                 status: 'OK',
            //                 errorDescription: 'Success Record Created !!!',
            //                 displayToUser: true,
            //                 newPageURL: '/app/templateList'
            //             }
            //         }
            //     }
            // };
            // callback(resp)
        }
        // else {
        //     let res = await Letters.findOneAndUpdate({
        //         "templateId": templateId,
        //     }, {
        //         "templatePath": templatePath,
        //         "templateMarkup": templateMarkup,
        //         "templateName": templateName
        //     });


        // console.log(res);


        // const resp = {
        //     responseMessage: {
        //         action: null,
        //         data: {
        //             message: {
        //                 status: 'OK',
        //                 errorDescription: 'Success Record Updated !!!',
        //                 displayToUser: true,
        //                 newPageURL: '/app/templateList'
        //             }
        //         }
        //     }
        // };
        // callback(resp)
        // }
    } catch (err) {
        return callback(err);
    }
}

module.exports = {
    testLetter
}