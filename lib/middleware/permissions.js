'use strict';

const jwt = require('../helpers/jwt');
const crypto = require('../helpers/crypto');
const dates = require('../helpers/dates');
const logger = require('../helpers/logger')();
const permissions = require('../services/permission');
const commonConst = require('../constants/common');
const _ = require('lodash');
const config = require('../../config');
const userRepo = require('../repositories/user');
const tokenLookupRepo = require('../repositories/tokenLookup');
const url = require('url');
const functionPath = require('../../exports/query/functionPath.json');
const passwordPolicyRepo = require('../repositories/passwordPolicy');
const loginAttemptsRepo = require('../repositories/loginAttempts');
const uuid = require('uuid/v1');
const authorization = require('auth-header');

function contains(input, checkval) {
  return (input.indexOf(checkval) !== -1);
}

module.exports = (req, res, next) => {

  try {

    _.set(req.body, 'rawBody', JSON.stringify(req.body));
    console.log(JSON.stringify(req.body))


    const JBT = req.get('token') || req.cookies.token;
    const header = Object.assign(_.get(req, 'body.header', {}), _.get(req, 'headers', {}));

    let authType = req.get('authorization')
    if (authType) {
      let auth = authorization.parse(authType);
      if (auth.scheme == 'Basic' && auth.token) {
        let encTkn = Buffer.from(auth.token, 'base64');
        let cred = encTkn.toString().split(':');
        console.log(JSON.stringify(cred))
        if (cred.length != 2) {
          return sendError('bad authorization token for Basic Auth', 401, JBT, res);
        }

        _.set(header, 'username', cred[0])
        _.set(header, 'password', cred[1])
      }
    }
    let action;
    if (req.params.channel && req.params.channel === 'Export') {
      const url_parts = url.parse(req.url, true);
      const type = url_parts.query.type;
      const gridType = url_parts.query.gridType;
      action = functionPath[gridType].split('/').pop(-1);
    } else {
      action = req.params.action;
    }
    // check for TLB hit

    if (header.username) {
      if (global.TLB && global.TLB[header.username] != undefined) {
        if (global.TLB[header.username].password == header.password) {
          if (global.TLB[header.username].cachedURI.indexOf(action) > -1) {
            console.log("Cache HIT Detected for user " + header.username + "!!");
            req.body.JWToken = global.TLB[header.username].token;
            return next();
          }
        }
      }
    }
    // cheking for illeagal characters
    const requestString = JSON.stringify(Object.assign(_.get(req, 'body', {})));
    if (contains(requestString, "$")) {
      return sendError({desc: "illegal characters in the request.."}, 403, JBT, res);
    }
    console.log(req)
    getUserId(req)
      .then((user) => {
        if (!user) {
          return Promise.resolve(false);
        }

        return permissions.uriPermissions({userID: user._id, URI: action});
      })
      .then((allowed) => {
        console.log("ALLOWED >>>>>> ", allowed);
        if (commonConst.permissionExcludeList.indexOf(action) >= 0) {
          if (header.username) {
            let cachedURI = [];
            if (global.TLB && global.TLB[header.username] !== undefined) {
              cachedURI = global.TLB[header.username].cachedURI;
            }
            if (!global.TLB) {
              global.TLB = {};
            }
            cachedURI.push(action);
            global.TLB[header.username] = {
              username: header.username,
              password: header.password,
              cachedURI: cachedURI,
              token: req.body.JWToken
            };
          }
          return next();
        } else if (!allowed) {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>ACCESS DENIED>>>>>>>>>>>>>>>>>", action);
          // return next();
          if (config.get('mode') === 'DEV') {
            return sendError(`Do you want to add the permissions for action ${action}`, 201, undefined, res, action);
            // return next();
          } else {
            return sendError('You are not allowed to access this resource', 403, undefined, res);
          }
        }

        if (header.username) {
          let cachedURI = [];
          if (global.TLB && global.TLB[header.username] !== undefined) {
            cachedURI = global.TLB[header.username].cachedURI;
          }
          if (!global.TLB) {
            global.TLB = {};
          }
          cachedURI.push(action);
          global.TLB[header.username] = {
            username: header.username,
            password: header.password,
            cachedURI: cachedURI,
            token: req.body.JWToken
          };
        }
        return next();
      })
      .catch((err) => {
        console.log(err);
        console.log("sending response 403 - ");
        return sendError('You are not allowed to access this resource', 403, undefined, res);
      });

    function getUserId(req) {
      let JWToken;
      if (req.params.channel === 'Report' || req.params.channel === 'Export' || req.params.action === 'download') {
        const url_parts = url.parse(req.url, true);

        JWToken = url_parts.query.JWT;
      } else {
        JWToken = req.get('token') || req.cookies.token;
      }
      if (JWToken) {
        return Promise.resolve(crypto.decrypt(JWToken));
        // return validateToken(JWToken);
      }
      const header = Object.assign(_.get(req, 'body.header', {}), _.get(req, 'headers', {}));
      if (!header.username) {
        return Promise.resolve(false);
      }

      return validateAPIUser({userID: header.username, password: header.password})
        .then((user) => {
          if (user) {
            return jwt.create(user).then((token) => {
              req.body.JWToken = token;
              return JSON.parse(JSON.stringify(user));
            });
          }
          return false;
        });
    }

    function validateToken(token) {
      return tokenLookupRepo.findOne({token: token})
        .then((res) => {
          if (!res) {
            return false;
          }
          const diff = dates.diffFromNow(res.updatedAt, 'minutes');
          if (false) { //diff > config.get('tokenExp') || diff < 0) {
            return false;
          }
          return tokenLookupRepo.update({_id: res._id}, {$set: {updatedAt: dates.newDate()}})
            .then(() => {
              return crypto.decrypt(token);
            });
        });
    }

    function validateAPIUser(payload) {
      return Promise.all([
        userRepo.findOneWithPass({userID: payload.userID}).collation({locale: 'en', strength: 2}),
        passwordPolicyRepo.findOne()
      ])
        .then((res) => {
          const user = res[0];
          const policy = res[1];
          let error = {};
          if (!user) {
            insertAttempt({isValid: false});
            error = {desc: 'invalid username'};
            throw error;
          }
          if (user.userType !== 'API') {
            insertAttempt({userId: user._id, isValid: false});
            error = {desc: 'invalid user type'};
            throw error;
          }
          if (!user.isActive) {
            insertAttempt({userId: user._id, isValid: false});
            error = {desc: 'user is inactive'};
            throw error;
          }
          return validatePassword(user, policy);
        });

      function validatePassword(user, policy) {
        const data = {passwordRetries: 0, updatedBy: user._id, updatedAt: dates.newDate()};
        let error = {};
        if (user.password !== payload.password || user.passwordRetries > policy.allowIncorrectLoginAttempts) {
          data.passwordRetries = user.passwordRetries + 1;
          return userRepo.update({_id: user._id}, data)
            .then(() => {
              insertAttempt({userId: user._id, isValid: false});
              error = user.passwordRetries > policy.allowIncorrectLoginAttempts ? {desc: 'Your account is locked, password attempts exceeds the limit'} : {desc: 'invalid password'};
              throw error;
            });
        }
        insertAttempt({userId: user._id, isValid: true});
        return userRepo.findOneAndUpdate({_id: user._id}, data);
      }

      function insertAttempt(params) {
        const obj = Object.assign({userID: payload.userId}, params);
        return payload.userId ? loginAttemptsRepo.create(obj) : Promise.resolve('userId is missing');
      }
    }

  } catch (ex) {
    console.log("Getting error" + ex.stack)
    res.json({
      "cipherMessageId": uuid(),
      "messageStatus": "ERROR",
      "errorCode": 201,
      "errorDescription": "An error occurred While processing your request",
      "timestamp": dates.DDMMYYYYHHmmssSSS(new Date)
    });
    res.end();
  }

};


function sendError(err, statusCode = 403, JBT, res, uri) {
  let responseType = 'API'
  if (JBT) {
    let token = crypto.decrypt(JBT);
    if (token.userType == "Human") {
      responseType = 'UI';
    }
    if (statusCode == 201) {
      responseType = 'UI';
    }
  }
  console.log("pO->>>>>>>", JSON.stringify(JBT))

  err = err instanceof Error ? err.stack : err;
  err = _.get(err, 'desc', err);

  let errMsg;
  if (responseType == 'API') {
    const UUID = uuid();
    let date = new Date().toISOString();
    errMsg = {
      "messageStatus": "ERROR",
      "cipherMessageId": UUID,
      "errorDescription": err || 'You are not allowed to access this resource',
      "errorCode": 201,
      "timestamp": dates.DDMMYYYYHHmmssSSS(new Date)
    };
  } else {
    errMsg = {
      uri,
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
      },
      error: true
    };
  }

  logger.app.error({fs: 'middleware/permissions.js', func: 'sendError'}, JSON.stringify(errMsg, null, 2));
  res.status(statusCode);
  res.json(errMsg);
  res.end();
}