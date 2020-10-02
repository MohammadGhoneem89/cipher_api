'use strict';

const userRepo = require('../repositories/user');
const passwordPolicyRepo = require('../repositories/passwordPolicy');
const tokenLookup = require('../repositories/tokenLookup');
const loginAttemptsRepo = require('../repositories/loginAttempts');
const { authenticate } = require('ldap-authentication')
const hash = require('../hash');
const dates = require('../helpers/dates');
const jwt = require('../helpers/jwt');
const config = require('../../config');
module.exports = user;

function user(payload, sessionUUID = undefined) {
  let token;
  let user;
  return Promise.all([
    userRepo.findOneWithPass({ userID: payload.userId }).collation({ locale: 'en', strength: 2 }),
    passwordPolicyRepo.findOne()
  ])
    .then((res) => {
      user = res[0];
      const policy = res[1];
      let error = {};
      if (!user) {
        insertAttempt({ isValid: false });
      }
      if (!user) {
        error = {
          desc: 'username or password is not valid!',
          userType: payload.isui ? 'Human' : "API"
        };
        throw error;
      }
      if (user && user.authType == "LDAP") {
        let options = {
          ldapOpts: { url: config.get('LDAPUrl', 'ldap://transit1.avanza.pk') },
          userDn: `uid=${payload.userId},${payload.domaincontroller}`,
          userPassword: payload.password
        };
        let dataUsr = { passwordRetries: 0, updatedBy: user._id, updatedAt: dates.newDate() };
        return authenticate(options).then((userobj) => {
          insertAttempt({ userId: user._id, isValid: true });
          return userRepo.findOneAndUpdate({ _id: user._id }, dataUsr);
        }).catch((ex) => {
          error = { desc: ex.message };
          throw error;
        });
      }


      if (!user && !user.isActive) {
        insertAttempt({ userId: user._id, isValid: false });
        error = {
          desc: 'The account you are trying to connect is inactive or blocked \nplease contact support',
          userType: user.userType
        };
        throw error;
      }
      return validatePassword(user, policy);
    })
    .then((_user) => {
      return jwt.create(user, sessionUUID, payload.lang).then((token) => {
        return { token: token, firstScreen: user.firstScreen, userType: user.userType, isNewUser: user.isNewUser, _id: user._id };
      });
    });

  function validatePassword(user, policy) {
    const data = { passwordRetries: 0, updatedBy: user._id, updatedAt: dates.newDate() };
    let error = {};
    if (user.userType == "API") {
      if (user.password !== (payload.password) || user.passwordRetries > policy.allowIncorrectLoginAttempts) {
        data.passwordRetries = user.passwordRetries + 1;
        return userRepo.findOneAndUpdate({ _id: user._id }, data)
          .then(() => {
            insertAttempt({ userId: user._id, isValid: false });
            error = user.passwordRetries > policy.allowIncorrectLoginAttempts ? {
              desc: 'Your account is locked, password attempt exceeds the limit',
              userType: user.userType
            } : { desc: 'username or password is incorrect', userType: user.userType };
            throw error;
          });
      }
    } else {

      if ((user.password !== payload.password) || user.passwordRetries > policy.allowIncorrectLoginAttempts) {
        data.passwordRetries = user.passwordRetries + 1;
        return userRepo.findOneAndUpdate({ _id: user._id }, data)
          .then(() => {
            insertAttempt({ userId: user._id, isValid: false });
            error = user.passwordRetries > policy.allowIncorrectLoginAttempts ? {
              desc: 'Your account is locked, password attempt exceeds the limit',
              userType: user.userType
            } : { desc: 'username or password is incorrect', userType: user.userType };
            throw error;
          });
      }
    }
    insertAttempt({ userId: user._id, isValid: true });
    return userRepo.findOneAndUpdate({ _id: user._id }, data);
  }

  function insertAttempt(params) {
    const obj = Object.assign({ userID: payload.userId }, params);
    return loginAttemptsRepo.create(obj);
  }
}
