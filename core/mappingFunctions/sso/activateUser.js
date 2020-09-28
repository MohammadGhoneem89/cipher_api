'use strict';

const userRepo = require('../../../lib/repositories/user');
const models = require('../../../lib/models');
const User = models.User;
async function activate(payload, UUIDKey, route, callback, JWToken) {
    const response = {
        responseMessage: {
            action: payload.action,
            data: {
                message: {
                    status: '',
                    errorDescription: '',
                    displayToUser: true,
                    newPageURL: ""
                }
            }
        }
    };

    try {
        let userResult = await User.findOne({ userID: payload.body.id })
        
        if (userResult) {
           
            userResult.passwordRetries=0;
            console.log(JSON.stringify(userResult))
            await userRepo.update({ userID: payload.body.id },userResult)
            response.responseMessage.data.message.status = "OK"
            response.responseMessage.data.message.errorDescription = "Success user activated"
            response.responseMessage.data.message.newPageURL = "/userList"
        } else {
            response.responseMessage.data.message.status = "ERROR"
            response.responseMessage.data.message.errorDescription = "No user found"
        }
        return callback(response);

    } catch (err) {
        console.log("err", err);
        response.responseMessage.data.message.status = "ERROR"
        response.responseMessage.data.message.errorDescription = "Some internal server error"
        return callback(response);
    }
}

exports.activate = activate;

