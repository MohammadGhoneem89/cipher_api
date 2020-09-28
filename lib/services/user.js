'use strict';

const validator = require('../validator');
const userRepo = require('../repositories/user');
const emailTemplateRepo = require('../repositories/emailTemplate');
const passwordHistoryRepo = require('../repositories/passwordHistory');
const groupRepo = require('../repositories/group');
const loginAttemptsRepo = require('../repositories/loginAttempts');
const commonConst = require('../constants/common');
const msgConst = require('../constants/msg');
const permissionConst = require('../constants/permissions');
const _ = require('lodash');
const commonHelper = require('../helpers/common');
const permissionsHelper = require('../helpers/permissions');
const auditLog = require('./auditLog');
const hash = require('../hash');
const dates = require('../helpers/dates');
const crypto = require('../helpers/crypto');
const email = require('../email');
const config = require('../../config');
const nodemailer = require('nodemailer');
// const  _decrypt = require('../../scripts/decrypt.js');
const jwt = require('../helpers/jwt');
const APIDefination = require('../../core/mappingFunctions/systemAPI/APIDefination.js');


module.exports = {
  getList,
  getDetails,
  create,
  update,
  approve,
  reject,
  updatePassword,
  resetPassword,
  setPassword,
  getBasicDetail,
  authenticateUser,
  updateStatus,
  isAvailable,
  ssoResetPassword,
  search,
  createOnDemandWelCome
};

function getList(payload, jwt) {
  let count = 0;
  return validator.validate(payload, validator.schemas.user.get)
    .then(() => userRepo.findPageAndCount(payload, jwt))
    .then((res) => {
      count = res[1];
      const params = {
        userId: payload.userID,
        documents: res[0],
        docType: 'actions',
        page: permissionConst.userList.pageId,
        component: permissionConst.userList.component.searchGrid
      };
      return permissionsHelper.embed(params);
    })
    .then((res) => {
      const response = {};
      response.count = count;
      response.users = _.get(res, 'documents', []);
      response.actions = _.get(res, 'pageActions', []);
      return response;
    });
}

function getDetails(payload) {
  return validator.validate(payload, validator.schemas.user.userDetails)
    .then(() => {

      console.log("payload get details,", payload.id)
      const query = payload.allowedGroups ? {
        name: { $in: payload.allowedGroups },
        orgCode: payload.orgCode
      } :
        { orgCode: payload.orgCode };
      console.log('================================' + JSON.stringify(query))
      return Promise.all([
        userRepo.getGroups({ _id: payload.id, mode: payload.mode }, 'name', true),
        groupRepo.find({}, 'name type', true),
        loginAttemptsRepo.lastLoginIn(payload.id)
      ]);
    })
    .then((res) => {
      const user = res[0] || {};
      const groups = res[1] || [];

      user.lastLoginTime = res[2];
      let selected = _.cloneDeep(user.groups);
      user.groups = [];
      let idList = [];
      if (selected) {
        for (const group of selected) {
          idList.push(group.name)
        }
      }
      for (const group of groups) {
        if (idList.indexOf(group.name) == -1) {
          group.isAssigned = false;
          user.groups.push(group);
        } else {
          group.isAssigned = true;
          user.groups.push(group);
        }
      }
      const params = {
        userId: payload.userID,
        documents: user,
        docType: 'actions',
        page: permissionConst.userDetails.pageId,
        component: ''
      };
      return permissionsHelper.embed(params);
    })
    .then((res) => {
      return {
        searchResult: _.get(res, 'documents[0]', {}),
        actions: res.pageActions || []
      };
    });
}

function create(payload, errorMsg) {
  let customValidates = validator.schemas.user.create;
  if (_.get(payload, 'data.userType') === commonConst.user.userTypeKeys.human) {
    customValidates = _.merge({}, customValidates, validator.schemas.user.createHuman);
  }
  customValidates = _.merge({}, customValidates, validator.schemas.user.userTypeAPI);
  return commonHelper.generatePassword()
    .then((policy) => {
      payload.data.createdBy = payload.createdBy;
      payload.data.updatedBy = payload.createdBy;
      payload.data.passwordPolicy = policy.id;
      return commonHelper.validPassoword(payload.data.password);
    }).then((validPass) => {
      if (!validPass.valid) {
        throw { // eslint-disable-line
          password: validPass.error
        };
      }
      payload.data.password = hash['sha512'](payload.data.password);
      const params = {
        event: commonConst.auditLog.eventKeys.insert,
        collectionName: 'User',
        ipAddress: payload.ipAddress,
        current: payload.data,
        createdBy: payload.createdBy
      };
      auditLog.create(params);
      return userRepo.create(payload.data, errorMsg);
    })
    .then((user) => {


      return user;
    });
}

function update(payload) {
  console.log(payload, 'ACTUAL PAYLOAD');
  let customValidates = validator.schemas.user.update;
  if (_.get(payload, 'data.userType') === commonConst.user.userTypeKeys.human) {
    customValidates = _.merge({}, customValidates, validator.schemas.user.createHuman);
  }
  if (payload.data.password) {
    return validator.errorValidate(payload, customValidates)
      .then(() => {
        // delete payload.data.password;
        // delete payload.data.passwordHashType;
        return commonHelper.validPassoword(payload.data.password);
      })
      .then((validPass) => {
        if (!validPass.valid) {
          throw {
            password: validPass.error
          };
        }
        console.log("HERE>>>>>>>>>>>>????")
        payload.data.password = hash['sha512'](payload.data.password);
        payload.data.updatedBy = payload.updatedBy;
        payload.data.updatedAt = payload.updatedAt;
        return userRepo.findOneAndUpdateInterm({ _id: payload.data.id }, payload.data);
      });
  } else {
    return userRepo.findOneAndUpdateInterm({ _id: payload.data.id }, payload.data);
  }
}
function reject(payload) {
  console.log(payload, 'ACTUAL PAYLOAD>>>>');
  let customValidates = validator.schemas.user.update;
  if (_.get(payload, 'data.userType') === commonConst.user.userTypeKeys.human) {
    customValidates = _.merge({}, customValidates, validator.schemas.user.createHuman);
  }
  if (payload.data.password) {
    return validator.errorValidate(payload, customValidates)
      .then(() => {
        // delete payload.data.password;
        // delete payload.data.passwordHashType;
        return commonHelper.validPassoword(payload.data.password);
      })
      .then((validPass) => {
        if (!validPass.valid) {
          throw {
            password: validPass.error
          };
        }
        payload.data.password = hash['sha512'](payload.data.password);
        payload.data.updatedBy = payload.updatedBy;
        payload.data.updatedAt = payload.updatedAt;
        return userRepo.findOneAndReject({ _id: payload.data.id, rejectionReason: payload.data.rejectionReason }, payload.data);
      });
  } else {
    return userRepo.findOneAndReject({ _id: payload.data.id, rejectionReason: payload.data.rejectionReason }, payload.data).catch((ex) => {
      console.log(ex);
    });
  }
}

async function approve(payload) {
  if (_.get(payload, 'data.userType') === commonConst.user.userTypeKeys.human && _.get(payload, 'data.isNewUser') == true) {
    let user = await userRepo.findOneAndApprove({ _id: payload.data.id }, payload.data);
    return resetPassword({
      action: 'resetPassword',
      userID: user.userID,
      email: user.email
    }, msgConst.set, 'Welcome');
  } else {

    return userRepo.findOneAndApprove({ _id: payload.data.id }, payload.data);
  }

}

function updatePassword(payload) {
  let userDetails;
  let newPassHash;
  return validator.validate(payload, validator.schemas.user.changePassword)
    .then(() => {
      return Promise.all([
        commonHelper.validPassoword(payload.data.newPassword),
        userRepo.findOneWithPass({ _id: payload.userID })
      ]);
    })
    .then((res) => {
      let error = {};
      const validPass = res[0];
      userDetails = res[1];
      try {
        newPassHash = hash['sha512'](payload.data.newPassword);
      } catch (err) {
        error = { desc: err.stack || err };
        throw error;
      }
      console.log(newPassHash, 'NEW PASS HASH');
      if (hash['sha512'](payload.data.oldPassword) !== userDetails.password) {
        error = { desc: 'Invalid current password' };
        throw error;
      }
      if (!validPass.valid) {
        error = { desc: validPass.error };
        throw error;
      }
      if (newPassHash === userDetails.password) {
        error = { desc: 'Same password not allowed' };
        throw error;
      }
      const pDetails = [userDetails.userType, userDetails.orgType, userDetails.userID, userDetails.firstName, userDetails.lastName];
      for (const item of pDetails) {
        const index = payload.data.newPassword.toLocaleLowerCase().match(new RegExp(item.toLocaleLowerCase(), 'ig'));
        if (index && index.length) {
          error = { desc: 'Personal details not allowed' };
          throw error;
        }
      }
      for (const item of validPass.unAcceptedKeywords) {
        const index = payload.data.newPassword.toLocaleLowerCase().match(new RegExp(item.toLocaleLowerCase(), 'ig'));
        if (index && index.length) {
          error = { desc: 'Common words not allowed' };
          throw error;
        }
      }
      return passwordHistoryRepo.findByUserId(userDetails._id);
    })
    .then((histories) => {
      for (const history of histories) {
        if (history.password === newPassHash) {
          throw { // eslint-disable-line
            desc: 'You have used this password recently'
          };
        }
      }
      const passHis = {
        userId: userDetails._id,
        password: userDetails.password,
        createdAt: dates.newDate()
      };
      const userPass = {
        password: newPassHash,
        passwordUpdatedAt: dates.newDate(),
        updatedAt: dates.newDate(),
        updatedBy: payload.userID,
        isNewUser: false
      }
        ;
      const promises = [
        passwordHistoryRepo.create(passHis),
        userRepo.findOneAndUpdate({ _id: userDetails._id }, userPass)
      ];
      return Promise.all(promises);
    });
}

function authenticateUser(payload) {
  let userDetails;
  let newPassHash;


  console.log("authenticateUser  PAYLOAD >>> ", payload);
  return validator.errorValidate(payload, validator.schemas.user.authenticateUser)
    .then(() => {
      return Promise.all([
        commonHelper.validPassoword(payload.Password),
        userRepo.findOneWithPass({ userID: payload.userCode })
      ]);
    })
    .then((res) => {
      let error = {};
      const validPass = res[0];

      console.log("\n\n <<<<< validPass >>> ", validPass);
      userDetails = res[1];

      console.log("\n\n <<<<< userDetails >>> ", userDetails);
      if (!userDetails) {
        error = { desc: 'User code is invalid' };
        throw error;
      }
      try {

        newPassHash = hash['sha512'](payload.Password);
      } catch (err) {
        error = { desc: err.stack || err };
        throw error;
      }

      if (!validPass.valid) {
        error = { desc: validPass.error };
        throw error;
      }
      if (newPassHash === userDetails.password) {
        error = { desc: 'Same password not allowed' };
        throw error;
      }
      const pDetails = [userDetails.userType, userDetails.orgType, userDetails.userID, userDetails.firstName, userDetails.lastName];
      for (const item of pDetails) {
        const index = payload.Password.toLocaleLowerCase().match(new RegExp(item.toLocaleLowerCase(), 'ig'));
        if (index && index.length) {
          error = { desc: 'Personal details not allowed' };
          throw error;
        }
      }
      for (const item of validPass.unAcceptedKeywords) {
        const index = payload.Password.toLocaleLowerCase().match(new RegExp(item.toLocaleLowerCase(), 'ig'));
        if (index && index.length) {
          error = { desc: 'Common words not allowed' };
          throw error;
        }
      }
      return passwordHistoryRepo.findByUserId(userDetails._id);
    })
    .then((histories) => {
      for (const history of histories) {
        if (history.password === newPassHash) {
          throw { // eslint-disable-line
            desc: 'You have used this password recently'
          };
        }
      }
      const passHis = {
        userId: userDetails._id,
        password: userDetails.password,
        createdAt: dates.newDate()
      };
      const userPass = {
        password: newPassHash,
        passwordUpdatedAt: dates.newDate(),
        updatedAt: dates.newDate(),
        updatedBy: payload.userID
      };
      const promises = [
        passwordHistoryRepo.create(passHis),
        userRepo.findOneAndUpdate({ _id: userDetails._id }, userPass)
      ];
      return Promise.all(promises);
    });
}

function resetPassword(payload, msg, template, file) {
  console.log(validator.schemas.user.resetPassword, 'VAL');
  let userDetails;
  return validator.validate(payload, validator.schemas.user.resetPassword)
    .then(() => {
      return userRepo.findOneWithPass({ userID: payload.userID, email: payload.email });
    })
    .then((user) => {

      if (!user) {
        const error = { message: 'Invalid userID or password' };
        throw error;
      }
      let currtimestamp = dates.newDate();

      console.log(`time elapsed since reset password ${currtimestamp - user.lastResetTime}`)

      if ((currtimestamp - user.lastResetTime) / 1000 < 100 && !file) {
        console.log('here')
        const error = { message: 'Please try again after some time' };
        throw error;
      } else {
        user.lastResetTime = currtimestamp;
      }

      userDetails = user;
      return commonHelper.generateResetUri(user);
    })
    .then(async (link) => {
      console.log('generatedLInk', link)
      emailTemplateRepo.findOne({ templateType: template }).then(async (template) => {
        let templateObject = template[0];
        console.log(templateObject, 'TEMP');
        let transporter = nodemailer.createTransport({
          host: config.get('email.host'),
          port: config.get('email.port'),
          secure: config.get('email.ssl'), // use TLS
          requireTLS: config.get('email.requireTLS', false),
          auth: {
            user: config.get('email.username'),
            pass: config.get('email.authPassword')//
          },
          tls: {
            rejectUnauthorized: config.get('email.rejectUnauthorized', false)
          }
        });
        console.log(userDetails.email);
        console.log(msg, 'MSG');
        transporter.verify(function (error, success) {
          if (error) {
            console.log("\n\n\n\n errCONNETINGG >> ", error);
          } else {
            console.log("\n\n\n\nServer is ready to take our messages");
          }
        });

        let dataForTemplate = {
          firstName: userDetails.firstName,
          link: link.uri,
          apiLnk: payload.apiLnk,
          platform: config.get('platform'),
          usecase: config.get('usecase'),
          scriptLink: config.get('scriptLink'),
          apiusername: `${userDetails.firstName.toLowerCase()}_api`,
          adminusername: `${userDetails.firstName.toLowerCase()}_admin`
        }
        let emailOptions = {
          from: config.get('email.address'), // sender address
          to: userDetails.email,  // list of receivers
          subject: templateObject.subjectEng,    // Subject line
          html: `${replaceEmailText(templateObject.templateTextEng, dataForTemplate)}`,
        };
        if (file) {
          emailOptions.attachments = [
            {
              filename: 'collection.json',
              content: JSON.stringify(file[0])
            }, {
              filename: 'env.json',
              content: JSON.stringify(file[1])
            }]
        }
        let info = await transporter.sendMail(emailOptions);
        console.log('Message sent: %s', info.messageId);

        const userObj = {
          passwordReset: link.passwordToken,
          updatedAt: dates.newDate(),
          updatedBy: userDetails._id,
          lastResetTime: userDetails.lastResetTime
        };
        return userRepo.findOneAndUpdate({ _id: userDetails._id }, userObj);
      });
    })
}

function replaceEmailText(msg, obj) {
  let result = msg.slice(0)
  for (let key in obj) {
    let value = obj[key]
    result = result.replace('{{' + key + '}}', value)
  }

  return result
}

function setPassword(payload) {
  console.log(JSON.stringify(payload, null, 2))
  let userDetails;
  let newPassHash;
  let error;
  return validator.errorValidate(payload, validator.schemas.user.setPassword)
    .then(() => {

      if (payload.isAuth) {

        return Promise.all([
          commonHelper.validPassoword(payload.newPassword),
          userRepo.findOneWithPass({ _id: payload.userId })
        ])
      } else {
        let now = new Date();
        console.log(">>>>>>>>>>>-----", JSON.stringify(payload))
        let tokenPWD = _.get(payload, 'passwordToken', payload.token)
        const token = crypto.decryptEx(tokenPWD);
        if (token.createdAt + (config.get('tokenlifetime', 1) * 24 * 3600 * 1000) < now) {
          error = {
            desc: 'Token has expired!!'
          };
          throw error;
        }

        if (!token) {
          error = { desc: 'Invalid passwordToken' };
          throw error;
        }
        return Promise.all([
          commonHelper.validPassoword(payload.newPassword),
          userRepo.findOneWithPass({ _id: token._id, passwordReset: payload.passwordToken })
        ])
      }

    })
    .then((res) => {

      console.log(res, 'RES ===========================================================');
      const validPass = res[0];
      userDetails = res[1];
      // console.log('000000', res[0], '000000');
      // console.log('111111', res[1], '111111');
      if (userDetails) {
        if (userDetails.passwordHashType && payload.isAuth) {
          let oldPassHash = hash[userDetails.passwordHashType](payload.oldPassword);
          if (userDetails.password != oldPassHash) {
            error = { desc: 'Invalid Old Password' };
            throw error;
          }
        }
      } else {
        error = { desc: _.get(validPass, 'error', 'Link has expired!!') };
        throw error;
      }
      newPassHash = hash['sha512'](payload.newPassword);

      if (!validPass.valid) {
        error = { desc: validPass.error };
        throw error;
      }
      if (newPassHash === userDetails.password) {
        error = { desc: 'Same current password' };
        throw error;
      }
      return passwordHistoryRepo.findByUserId(userDetails._id);
    })
    .then((histories) => {
      for (const history of histories) {
        if (history.password === newPassHash) {
          error = { desc: 'You have used this password recently' };
          throw error;
        }
      }
      const passHis = {
        userId: payload.userID,
        password: userDetails.password,
        createdAt: dates.newDate()
      };
      const userPass = {
        password: newPassHash,
        passwordUpdatedAt: dates.newDate(),
        passwordReset: '',
        updatedAt: dates.newDate(),
        updatedBy: userDetails._id,
        isNewUser: false
      };
      const promises = [
        passwordHistoryRepo.create(passHis),
        userRepo.findOneAndUpdate({ _id: userDetails._id }, userPass)
      ];
      return Promise.all(promises);
    });
}

function getBasicDetail(payload) {
  return userRepo.findForBasicDetail({ _id: payload.id })
    .then((res) => {
      return {
        searchResult: res
      };
    });
}

function updateStatus(payload) {
  return validator.errorValidate(payload, validator.schemas.user.updateStatus)
    .then(() => {
      const query = {
        userID: payload.userCode
      };
      return userRepo.findOne(query, true);
    })
    .then((user) => {
      let error = {};
      if (!user) {
        error = { desc: 'User code is invalid' };
        throw error;
      }
      if (user.isActive === payload.isActive) {
        const activeMsg = payload.isActive ? 'active' : 'inactive';
        error = { desc: `User already ${activeMsg}` };
        throw error;
      }
      const userObj = {
        isActive: payload.isActive,
        updatedAt: dates.newDate(),
        updatedBy: payload.userID
      };
      user.isActive = payload.isActive;
      return userRepo.update({ userID: payload.userCode }, userObj)
        .then(() => user);
    });
}

function isAvailable(payload) {
  return validator.errorValidate(payload, validator.schemas.user.isAvailable)
    .then(() => {
      return userRepo.findOne({ userID: payload.userCode });
    });
}

function ssoResetPassword(payload, msg) {
  let userDetails;
  let newPassHash;
  return validator.errorValidate(payload, validator.schemas.user.ssoResetPassword)
    .then(() => {
      return Promise.all([
        commonHelper.validPassoword(payload.password),
        userRepo.findOneWithPass({ userID: payload.userCode })
      ]);
    })
    .then((res) => {
      let error = {};
      const validPass = res[0];
      userDetails = res[1];
      if (!userDetails) {
        const error = { userCode: 'User code is invalid' };
        throw error;
      }
      try {
        newPassHash = hash['sha512'](payload.password);
      } catch (err) {
        error = { error: err.stack || err };
        throw error;
      }
      if (payload.password !== payload.confirmPassword) {
        error = { password: 'New and confirm passwords are not matched' };
        throw error;
      }
      if (!validPass.valid) {
        error = { password: validPass.error };
        throw error;
      }
      if (newPassHash === userDetails.password) {
        error = { password: 'Same password not allowed' };
        throw error;
      }
      const pDetails = [userDetails.userType, userDetails.orgType, userDetails.userID, userDetails.firstName, userDetails.lastName];
      for (const item of pDetails) {
        const index = payload.password.toLocaleLowerCase().match(new RegExp(item.toLocaleLowerCase(), 'ig'));
        if (index && index.length) {
          error = { password: 'Personal details not allowed' };
          throw error;
        }
      }
      for (const item of validPass.unAcceptedKeywords) {
        const index = payload.password.toLocaleLowerCase().match(new RegExp(item.toLocaleLowerCase(), 'ig'));
        if (index && index.length) {
          error = { password: 'Common words not allowed' };
          throw error;
        }
      }
      return passwordHistoryRepo.findByUserId(userDetails._id);
    })
    .then((histories) => {
      for (const history of histories) {
        if (history.password === newPassHash) {
          throw { // eslint-disable-line
            password: 'You have used this password recently'
          };
        }
      }
      const passHis = {
        userId: userDetails._id,
        password: userDetails.password,
        createdAt: dates.newDate()
      };
      const userPass = {
        password: newPassHash,
        passwordUpdatedAt: dates.newDate(),
        updatedAt: dates.newDate(),
        updatedBy: payload.userID
      };
      const promises = [
        passwordHistoryRepo.create(passHis),
        userRepo.findOneAndUpdate({ _id: userDetails._id }, userPass)
      ];
      return Promise.all(promises);
    });
}

function search(payload) {
  return validator.errorValidate(payload, validator.schemas.user.searchUser)
    .then(() => {
      const query = {};
      if (payload.userCode) {
        query.userID = payload.userCode;
      }
      if (payload.hasOwnProperty('active')) {
        query.isActive = payload.active;
      }
      if (payload.type) {
        query.orgType = payload.type;
      }
      if (payload.subtype) {
        query.orgCode = payload.subtype;
      }
      return userRepo.find(query, 'profilePic userType orgType orgCode userID firstName email lastName name description type', true);
    })
    .then((users) => {
      users = users || [];
      if (payload.role) {
        users = _.filter(users, (user) => _.findIndex(_.get(user, 'groups', []), { name: payload.role }) >= 0);
      }
      return users;
    });
}


async function createOnDemandWelCome(payloadRecv, errorMsg) {
  let payload = {
    api: {
      "password": hash['sha512'](payloadRecv.spCode),
      "userType": "API",
      "orgType": payloadRecv.orgType,
      "orgCode": payloadRecv.spCode,
      "userID": `${payloadRecv.spCode.toLowerCase()}_api`,
      "passwordHashType": "sha512",
      "createdBy": "59b6431d212297005d466c56",
      "updatedBy": "5a07439653f81de88ccdd0bc",
      "passwordPolicy": "59b7c297212297005d4682ef",
      "groups": [
        payloadRecv.apiGroup
      ],
      "updatedAt": dates.newDate(),
      "createdAt": dates.newDate(),
      "passwordUpdatedAt": dates.newDate(),
      "passwordRetries": 0,
      "allowedIPRange": [
        "*.*.*.*"
      ],
      "isActive": true,
      "__v": 0,
      "email": payloadRecv.email,
      "authType": "Local",
      "firstScreen": "",
      "network": ""
    },
    user: {
      "password": hash['sha512'](payloadRecv.spCode),
      "profilePic": "/images/image-user.png",
      "userType": "Human",
      "orgType": payloadRecv.orgType,
      "userID": `${payloadRecv.spCode.toLowerCase()}_admin`,
      "firstName": payloadRecv.spCode,
      "firstScreen": payloadRecv.firstScreen,
      "email": payloadRecv.email,
      "isNewUser": false,
      "authType": "System",
      "passwordHashType": "sha512",
      "createdBy": "59b6431d212297005d466c56",
      "updatedBy": "5a07439653f81de88ccdd0bc",
      "passwordPolicy": "59b7c297212297005d4682ef",
      "groups": [
        payloadRecv.userGroup
      ],
      "updatedAt": dates.newDate(),
      "createdAt": dates.newDate(),
      "passwordRetries": dates.newDate(),
      "allowedIPRange": [
        "*.*.*.*"
      ],
      "isActive": true,
      "__v": 0,
      "lastLoginTime": dates.newDate(),
      "lastName": "",
      "passwordRetryAt": dates.newDate(),
      "orgCode": payloadRecv.spCode,
      "hypUser": "admin",
      "quorrumUser": "",
      "network": "",
      "passwordUpdatedAt": dates.newDate()
    }
  }
  let bone = {
    "info": {
      "_postman_id": "c351856e-04c8-e36f-775b-f97a50bcc0cf",
      "name": `${payloadRecv.spCode} - API Collection`,
      "schema": "https:\/\/schema.getpostman.com\/json\/collection\/v2.0.0\/collection.json"
    },
    "item": [{
      "name": 'general-login',
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": `{\n    \"userId\": "${payload.api.userID}",\n    \"password\": "${payload.api.password}",\n    \"langauge\": \"EN\"\n}`

        },
        "url": `${config.get('webAddress')}/Login`,
        "description": "This api provides bearer token on successful login"
      },
      "response": []
    }],
    "protocolProfileBehavior": {}
  }
  let apiLnk = commonHelper.generateResetUri(payload.api);
  console.log(apiLnk);


  let mapList = await APIDefination.getActiveAPIListForDocumentationNew();
  for (let usecase in mapList) {
    for (let api in mapList[usecase]) {
      let result = _.get(mapList, `${usecase}.${api}.simucases`, undefined)
      if (result) {
        result.forEach((elem) => {
          let tuple = {
            "name": `${usecase} - ${api} - ${elem.RuleName}`,
            "request": {
              "method": "POST",
              "auth": {
                "type": "basic",
                "basic": {
                  "password": payload.api.password,
                  "username": payload.api.userID
                }
              },
              "header": [
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": elem.SimulatorRequest || JSON.stringify(result.requestSchema, null, 2)
              },
              "url": `{{host}}/API/${usecase}/${api}`,
              "description": result.description
            },
            "response": []
            // "response": [JSON.stringify(result.responseSchema)]
          }
          bone.item.push(tuple);
        })
      }
    }
  }
  let file = [bone, {
    "id": "8f52f5d5-7329-6e71-60fd-9c1f61701ec9",
    "name": "SIT Blockchain",
    "values": [
      {
        "key": "host",
        "value": config.get('ServerRestInterfacePublic'),
        "type": "text",
        "enabled": true
      }
    ],
    "_postman_variable_scope": "environment",
    "_postman_exported_using": "Postman/7.25.0"
  }];
  let isUserAPI, isUserUI, isEmail, isCollection = true

  try {
    let userApi = await userRepo.create(payload.api);
    console.log("user api is created", userApi);
    isUserAPI = true
  } catch (e) {
    console.log(e);
    isUserAPI = false
  }

  try {
    let userUI = await userRepo.create(payload.user);
    console.log("user ui is created", userUI);
    isUserUI = true
  } catch (e) {
    console.log(e);
    isUserUI = false
  }
  try {
    await resetPassword({
      action: 'resetPassword',
      userID: payload.user.userID,
      email: payload.user.email,
      apiLnk: apiLnk.uri
    }, msgConst.set, 'WelcomeGroup', file);
    isEmail = true;
  } catch (ex) {
    console.log(ex);
    isEmail = false;
  }
  return { isUserAPI, isUserUI, isEmail, isCollection };

}
