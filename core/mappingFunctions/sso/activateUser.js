'use strict';

const userRepo = require('../../../lib/repositories/user');

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
        let userResult = await userRepo.getGroups({ userID: payload.body.id })
        if (userResult) {
            await userRepo.update({ _id: userResult._id }, { passwordRetries: 0 })
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

