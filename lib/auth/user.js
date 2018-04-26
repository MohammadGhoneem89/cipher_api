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
      if (user.passwordReset) {
        insertAttempt({ userId: user._id, isValid: false });
        error = { desc: 'please visit your email to set/reset password' };
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
    const diffUnit = 'minutes';
    const attemptDiff = dates.diffFromNow(user.passwordRetryAt, diffUnit);
    const policyDiff = policy.lockTimeInMinutes || 30;
    const unitText = policyDiff - attemptDiff > 1 ? 'minutes' : 'minute';
    if (user.passwordRetries > policy.allowIncorrectLoginAttempts && attemptDiff < policyDiff) {
      data.passwordRetries = user.passwordRetries + 1;
      return userUpdate(data, { desc: `Your account is locked, password attempts exceeds the limit. Please try again after ${policyDiff - attemptDiff} ${unitText}.` });
    }
    if (user.password !== hash[user.passwordHashType](payload.password)) {
      data.passwordRetries = user.passwordRetries > policy.allowIncorrectLoginAttempts ? 1 : user.passwordRetries + 1;
      data.passwordRetryAt = dates.newDate();
      return userUpdate(data, { desc: 'invalid password' });
    }
    insertAttempt({ userId: user._id, isValid: true });
    return userRepo.findOneAndUpdate({ _id: user._id }, data);

    function userUpdate(userDetails, error = { desc: 'invalid credentials' }) {
      return userRepo.update({ _id: user._id }, userDetails)
        .then(() => {
          insertAttempt({ userId: user._id, isValid: false });
          throw error;
        });
    }
  }

  function insertAttempt(params) {
    const obj = Object.assign({ userID: payload.userId }, params);
    return payload.userId ? loginAttemptsRepo.create(obj) : Promise.resolve('userId is missing');
  }
}
