'use strict';

const userRepo = require('../repositories/user');
const passwordPolicyRepo = require('../repositories/passwordPolicy');
const tokenLookup = require('../repositories/tokenLookup');
const loginAttemptsRepo = require('../repositories/loginAttempts');
const hash = require('../hash');
const dates = require('../helpers/dates');
const jwt = require('../helpers/jwt');

module.exports = user;

function user(payload) {
  let token;
  let user;
  return Promise.all([
    userRepo.findOneWithPass({ userID: payload.userId }).collation({ locale: 'en', strength: 2 }),
    passwordPolicyRepo.findOne()
  ])
    .then((res) => {
      const user = res[0];
      const policy = res[1];
      let error = {};
      if (!user) {
        insertAttempt({ isValid: false });
        error = { desc: 'invalid userId' };
        throw error;
      }
      if (user.userType !== 'Human') {
        insertAttempt({ userId: user._id, isValid: false });
        error = { desc: 'invalid user type' };
        throw error;
      }
      if (!user.isActive) {
        insertAttempt({ userId: user._id, isValid: false });
        error = { desc: 'user is inactive' };
        throw error;
      }
      return validatePassword(user, policy);
    })
    .then((_user) => {
      user = _user;
      token = jwt.create(user);
      return tokenLookup.removeAndCreate({ token: token, userId: user._id });
    })
    .then(() => {
      return { token: token, firstScreen: user.firstScreen };
    });

  function validatePassword(user, policy) {
    const data = { passwordRetries: 0, updatedBy: user._id, updatedAt: dates.newDate() };
    let error = {};
    if (user.password !== hash[user.passwordHashType](payload.password) || user.passwordRetries > policy.allowIncorrectLoginAttempts) {
      data.passwordRetries = user.passwordRetries + 1;
      return userRepo.update({ _id: user._id }, data)
        .then(() => {
          insertAttempt({ userId: user._id, isValid: false });
          error = user.passwordRetries > policy.allowIncorrectLoginAttempts ? { desc: 'Your account is locked, password attempts exceeds the limit' } : { desc: 'invalid password' };
          throw error;
        });
    }
    insertAttempt({ userId: user._id, isValid: true });
    return userRepo.findOneAndUpdate({ _id: user._id }, data);
  }

  function insertAttempt(params) {
    const obj = Object.assign({ userID: payload.userId }, params);
    return loginAttemptsRepo.create(obj);
  }
}
