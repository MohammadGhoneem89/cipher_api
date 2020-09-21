// const {validateJsonLength} = require('../../lib/utils');
const SampleLetters = require('../../../lib/models/sampleLetters');

async function getSampleLetters(payload, UUIDKey, route, callback, JWToken) {
    try {
        // if(!validateJsonLength(payload.body)){
        //     return callback(error('JSON in request is not valid'));
        // }
        try {
            let res = await SampleLetters.find({})
            // console.log(res, '================');

            let response = {
                sampleLetters: res,
            }

            return callback(response)

        } catch (error) {
            console.log(error)
        }

        // return callback(success('Success Record Created'));
        // const resp = {
        //     responseMessage: {
        //         action: null,
        //         data: {
        //             message: {
        //                 status: 'OK',
        //                 errorDescription: 'Success Record Created !!!',
        //                 displayToUser: true,
        //                 // newPageURL: '/lab/addLab'
        //             }
        //         }
        //     }
        // };
        // callback(resp)

    } catch (err) {
        return callback(err);
    }
}

module.exports = {
    getSampleLetters
}