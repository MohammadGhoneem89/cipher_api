
const uuid = require('uuid/v1');
const Letters = require('../../../lib/models/letters.js');

const rp = require('request-promise');
const path = require('path');

async function testLetter(payload, UUIDKey, route, callback, JWToken, res) {
    try {
        // console.log('WORKS');
        // console.log(payload, '============');
        // if (!validateJsonLength(payload)) {
        //     return callback(error('JSON in request is not valid'));
        // }



        const { templateId } = payload.templatePayload;
        if (templateId) {

            let resp = await Letters.find({
                "templateId": templateId
            });



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
                    filePath: payload.templatePayload.filePath,
                    templateType: resp[0].templateType,
                    outputFileName: payload.templatePayload.outputFileName,
                    // data: payload.templatePayload.data
                    data: JSON.parse(resp[0].sampleJson)
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

            
            let fileName;
            console.log(payload, 'PAYLOAD');
            if (resp[0].templatePath) {
                fileName = payload.templatePayload.template.filePath+'/'+payload.templatePayload.template.outputFileName+'.pdf';
            } else {
                fileName = payload.templatePayload.filePath+'/'+payload.templatePayload.outputFileName+'.pdf';
            }
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

async function apiDocumentationLetter(payload, UUIDKey, route, callback, JWToken, res) {
    try {
        const { templateId } = payload.templatePayload;
        if (templateId) {

            let resp = await Letters.find({
                "templateId": templateId
            });

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
                    filePath: payload.templatePayload.filePath,
                    templateType: resp[0].templateType,
                    outputFileName: payload.templatePayload.outputFileName,
                    data: JSON.parse(resp[0].sampleJson)
                },
                json: true
            };

            options.body.data.data = {
                apiList: payload.templatePayload.data
            }
            //calling letter services
            await rp(options);

            let fileName;
            fileName = payload.templatePayload.template.filePath + '/' + payload.templatePayload.template.outputFileName + '.pdf';

            async function downloadDoc(document) {
                const file = path.normalize(document);
                return path.resolve(file);
            }
            console.log("fileName", fileName)
            let result = await downloadDoc(fileName);
            return res.sendFile(result);
        }

    } catch (err) {
        return callback(err);
    }
}


module.exports = {
    testLetter,
    apiDocumentationLetter
}