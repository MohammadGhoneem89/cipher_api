'use strict';

const passwordPolicyRepo = require('../repositories/passwordPolicy');
const jwt = require('./jwt');
const config = require('../../config');

function generatePassword() {
  return passwordPolicyRepo.findOne()
    .then((policy) => {
      const diff = policy.minimumPasswordLength - (policy.minimumDigitCount + policy.minimumAlphabetCount);
      const numLength = Math.ceil(diff / 2) + policy.minimumDigitCount;
      return {
        password: randomUpperCase(policy.minimumUpperCase) + randomLowerCase(policy.minimumLowerCase) + randomNum(numLength),
        hashType: 'md5',
        id: policy._id
      };
    });

  function randomUpperCase(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length; i += 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  function randomLowerCase(length) {
    let text = '';
    const possible = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < length; i += 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  function randomNum(length) {
    let text = '';
    const possible = '0123456789';
    for (let i = 0; i < length; i += 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}

function generateResetUri(user) {
  const token = jwt.create(user);
  return {
    uri: `${config.get('webAddress')}changePassword/SDG?t=${token}`,
    passwordToken: token
  };
}

function success(scopeData) {
  return new Promise((resolve, reject) => {
    resolve(scopeData);
  });
}

function reject(scopeData) {
  return new Promise((resolve, reject) => {
    reject(scopeData);
  });
}

function validPassword(password) {
  return passwordPolicyRepo.findOne()
    .then((policy) => {
      const msg = {
        error: policy.errorMessage,
        valid: false,
        unAcceptedKeywords: policy.unAcceptedKeywords || []
      };
      if (password.length < policy.minimumPasswordLength || password.length > policy.maximumPasswordLength)
        return msg
      const arr = password.split('')

      let specialCharacter = []
      for (let i = 0; i < arr.length; i++) {
        if (policy.unAcceptedKeywords.includes(arr[i]))
          return msg
        if (new RegExp(`[^A-Za-z0-9]`).test(arr[i])) {
          specialCharacter.push(arr[i])
        }
      }
      if (specialCharacter.length < policy.minimumSpecialCharacterCount)
        return msg

      const alphabetsArr = arr.filter((elem) => {
        return new RegExp(`[a-zA-Z]`, 'g').test(elem)
      })
      if (alphabetsArr.length < policy.minimumAlphabetCount || alphabetsArr.length > policy.maximumAlphabetCount)
        return msg
      const capsArr = alphabetsArr.filter((elem) => {
        return new RegExp(`[A-Z]`, 'g').test(elem)
      })
      if (capsArr.length < policy.minimumUpperCase)
        return msg
      const smallArr = alphabetsArr.filter((elem) => {
        return new RegExp(`[a-z]`, 'g').test(elem)
      })
      if (smallArr.length < policy.minimumLowerCase)
        return msg
      const digitArr = arr.filter((elem) => {
        return new RegExp(`[0-9]`, 'g').test(elem)
      })
      if (digitArr.length < policy.minimumDigitCount || digitArr.length > policy.maximumDigitCount)
        return msg

      msg.valid = true;
      return msg;
    });
}

module.exports = {
  generatePassword: generatePassword,
  generateResetUri: generateResetUri,
  validPassoword: validPassword,
  chainBreaker: { success, reject }
};
