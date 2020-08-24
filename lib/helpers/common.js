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
        hashType: 'sha512',
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
  console.log(user, '_)(!@#_)(@!#_)(!@#_)(@!_#()');
  const token = jwt.createBasic(user);
  return {
    uri: `${config.get('webAddress')}/changePassword?t=${token}`,
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

// function validPassword(password) {
//   console.log(password, 'PW');
//   return passwordPolicyRepo.findOne()
//     .then((policy) => {
//       console.log(policy, 'POL');
//       const msg = {
//         error: policy.errorMessage,
//         valid: false,
//         unAcceptedKeywords: policy.unAcceptedKeywords || []
//       };
//       console.log(password, 'PASSWORDDDDD ');
//       console.log(password.length, 'LENGTH ');
//       console.log(policy.minimumPasswordLength, 'MIN PASS ');
//       console.log(password.length > policy.minimumPasswordLength || password.length < policy.maximumPasswordLength, 'CASE ');
//       console.log(password, 'PASSWORDDDDD ');
//       if (password.length < policy.minimumPasswordLength || password.length > policy.maximumPasswordLength)
//         return msg
//       const arr = password.split('')

//       let specialCharacter = []
//       for (let i = 0; i < arr.length; i++) {
//         if (policy.unAcceptedKeywords.includes(arr[i]))
//           return msg
//         if (new RegExp(`[^A-Za-z0-9]`).test(arr[i])) {
//           specialCharacter.push(arr[i])
//         }
//       }
//       if (specialCharacter.length < policy.minimumSpecialCharacterCount)
//         return msg

//       const alphabetsArr = arr.filter((elem) => {
//         return new RegExp(`[a-zA-Z]`, 'g').test(elem)
//       })
//       if (alphabetsArr.length < policy.minimumAlphabetCount || alphabetsArr.length > policy.maximumAlphabetCount)
//         return msg
//       const capsArr = alphabetsArr.filter((elem) => {
//         return new RegExp(`[A-Z]`, 'g').test(elem)
//       })
//       if (capsArr.length < policy.minimumUpperCase)
//         return msg
//       const smallArr = alphabetsArr.filter((elem) => {
//         return new RegExp(`[a-z]`, 'g').test(elem)
//       })
//       if (smallArr.length < policy.minimumLowerCase)
//         return msg
//       const digitArr = arr.filter((elem) => {
//         return new RegExp(`[0-9]`, 'g').test(elem)
//       })
//       if (digitArr.length < policy.minimumDigitCount || digitArr.length > policy.maximumDigitCount)
//         return msg

//       msg.valid = true;
//       return msg;
//     });
// }

function validPassword(password) {
  return passwordPolicyRepo.findOne().lean()
    .then((policy) => {
      const msg = {
        error: policy.errorMessage,
        valid: false,
        unAcceptedKeywords: policy.unAcceptedKeywords || []
      };
      if (!new RegExp(`^.{${policy.minimumPasswordLength},${policy.maximumPasswordLength}}$`, 'g').test(password)) {
        console.log("failing min length", policy.minimumPasswordLength, policy.maximumPasswordLength, msg)
        return msg;
      }
      if (!new RegExp(`(?=.*?[?!@%^&*-])`, 'g').test(password)) {
        console.log("failing special cha")
        return msg;
      }
      console.log("PPP", password)
      // if (!new RegExp(/^\d(?=.*?[?!@%^&*-]?\d){2,3}$/, 'g').test(password)) {
      //   console.log("failing digit length",policy.maximumDigitCount,policy.minimumDigitCount)
      //   return msg;
      // }
      let testPass = password
      if (testPass.replace(/[^0-9]/g, "").length < policy.minimumDigitCount || testPass.replace(/[^0-9]/g, "").length > policy.maximumDigitCount) {
        console.log("failing digit length", policy.maximumDigitCount, policy.minimumDigitCount)
        return msg;
      }
      if (!new RegExp(`[A-Z].{${policy.minimumUpperCase},${policy.maximumAlphabetCount}}`, 'g').test(password)) {
        console.log("failing uupercase count length")
        return msg;
      }
      if (!new RegExp(`[a-z].{${policy.minimumLowerCase},${policy.maximumAlphabetCount}}`, 'g').test(password)) {
        console.log("failing lowercase count length")
        return msg;
      }
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
