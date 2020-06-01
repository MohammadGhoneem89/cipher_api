'use strict';

const user = require('../../../lib/services/user');

function userCreate(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;
  create(payload, callback);
}

function createOnDemandWelCome(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;
  onDemandWelCome(payload, callback);
}

function onDemandWelCome(payload, callback) {
  user.createOnDemandWelCome(payload)
    .then((data) => {
        payload.welcome.forEach((elem) => {
          switch (elem.id) {
            case 'C-ONBD-01':
              elem.status = data.isUserAPI ? 'Done' : 'User Already Exist!';
              break;
            case 'C-ONBD-02':
              elem.status = data.isUserUI ? 'Done' : 'User Already Exist!';
              break;
            case 'C-ONBD-03':
              elem.status = data.isCollection ? 'Done' : 'Failed creating Collection';
              break;
            case 'C-ONBD-04':
              elem.status = data.isEmail ? 'Done' : 'Failed sending email';
              break;
          }
        });
        const response = {
          createOnDemandWelCome: {
            action: payload.action,
            data: payload.welcome

          }
        };
        callback(response);
      }
    )
    .catch((err) => {
      console.log(err);
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'ERROR',
              errorDescription: 'User not inserted',
              displayToUser: true
            },
            error: err
          }
        }
      };
      callback(response);
    });
}

function create(payload, callback) {
  user.create(payload)
    .then(() => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'OK',
              errorDescription: 'Welcome Package sent successfully',
              displayToUser: true,
              newPageURL: '/userList'
            }
          }
        }
      };
      callback(response);
    })
    .catch((err) => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'ERROR',
              errorDescription: 'User not inserted',
              displayToUser: true
            },
            error: err
          }
        }
      };
      callback(response);
    });
}

exports.userCreate = userCreate;
exports.createOnDemandWelCome = createOnDemandWelCome;

