'use strict';
const jwt = require('../helpers/jwt');
const crypto = require('../helpers/crypto');
const _ = require('lodash');
const userRepo = require('../repositories/user');

module.exports = (req, res, next) => {
  let JWToken = req.get('token');
  try {
    JWToken = crypto.decrypt(JWToken);
  }
  catch (err) {
    return sendError('Invalid token !!!');
  }
  userRepo.findOne({ _id: JWToken._id })
    .then((user) => {
      if (!user) {
        return sendError();
      }
      return next();
    })
    .catch((e) => {
      return sendError(e);
    });

  function sendError(err) {
    err = err instanceof Error ? err.stack : err;
    const errMsg = {
      loginResponse: {
        data: {
          message: {
            status: 'ERROR',
            errorDescription: err || 'You are not allowed to access this resource',
            routeTo: '',
            displayToUser: true
          },
          success: false
        }
      }
    };
    res.status(403);
    res.json(errMsg);
    res.end();
  }
};