
const {
    error
} = require('../../../lib/response/response');

const Letters = require('../../../lib/models/letters');

// const {validateJsonLength} = require('../../lib/utils')

async function getAllLetters(payload, UUIDKey, route, callback, JWToken) {
    try {
        console.log(Letters, 'LETTERSSSS');
        // if(!validateJsonLength(payload.body)){
        //     return callback(error('JSON in request is not valid'));
        // }


            //  organizationType.create({
            //     "orgType" : "LAB",
            //     "orgCode" : insertedLabId,
            //     "orgName" : insertedLabId
            // })
            try {
                let res = await Letters.find({})
                console.log(res, '================');

                let response = {
                    getAllLetters: res,
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
    getAllLetters
}