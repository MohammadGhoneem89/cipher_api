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

module.exports = {
  getList,
  getDetails,
  create,
  update,
  updatePassword,
  resetPassword,
  setPassword,
  getBasicDetail,
  authenticateUser,
  updateStatus,
  isAvailable,
  ssoResetPassword,
  search
};

function getList(payload) {
  let count = 0;
  return validator.validate(payload, validator.schemas.user.get)
    .then(() => userRepo.findPageAndCount(payload))
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
          name: {$in: payload.allowedGroups},
          orgCode: payload.orgCode
        } :
        {orgCode: payload.orgCode};
      console.log('================================' + JSON.stringify(query))
      return Promise.all([
        userRepo.getGroups({_id: payload.id}, 'name', true),
        groupRepo.find({}, 'name type', true),
        loginAttemptsRepo.lastLoginIn(payload.id)
      ]);
    })
    .then((res) => {
      const user = res[0] || {};
      const groups = res[1] || [];
      user.lastLoginTime = res[2];
      user.groups = user.groups || [];
      for (const group of user.groups) {
        group.isAssigned = true;
      }
      for (const group of groups) {
        if (!_.find(user.groups, {'_id': group._id})) {
          group.isAssigned = false;
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

  /* if (_.get(payload, 'data.userType') === commonConst.user.userTypeKeys.api) {
customValidates = _.merge({}, customValidates, validator.schemas.user.userTypeAPI);
}*/

  customValidates = _.merge({}, customValidates, validator.schemas.user.userTypeAPI);
  return commonHelper.generatePassword()
    .then((policy) => {

      /* if (_.get(payload, 'data.userType') === commonConst.user.userTypeKeys.human) {
payload.data.password = policy.password;
payload.data.passwordHashType = policy.hashType;
}*/
      payload.data.createdBy = payload.createdBy;
      payload.data.updatedBy = payload.createdBy;
      payload.data.passwordPolicy = policy.id;
      return commonHelper.validPassoword(payload.data.password);
    })
    .then((validPass) => {
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
      if (_.get(payload, 'data.userType') === commonConst.user.userTypeKeys.human) {
        return resetPassword({action: 'resetPassword', userID: user.userID, email: user.email}, msgConst.set,'Welcome');
      }
      return user;
    });
}

function update(payload) {
  console.log(payload, 'ACTUAL PAYLOAD');
  let customValidates = validator.schemas.user.update;
  if (_.get(payload, 'data.userType') === commonConst.user.userTypeKeys.human) {
    customValidates = _.merge({}, customValidates, validator.schemas.user.createHuman);
  }

  /* if (_.get(payload, 'data.userType') === commonConst.user.userTypeKeys.api) {
customValidates = _.merge({}, customValidates, validator.schemas.user.userTypeAPI);
}*/
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
      return userRepo.findOneAndUpdate({_id: payload.data.id}, payload.data);
    });
}

function updatePassword(payload) {
  let userDetails;
  let newPassHash;
  return validator.validate(payload, validator.schemas.user.changePassword)
    .then(() => {
      return Promise.all([
        commonHelper.validPassoword(payload.data.newPassword),
        userRepo.findOneWithPass({_id: payload.userID})
      ]);
    })
    .then((res) => {
      let error = {};
      const validPass = res[0];
      userDetails = res[1];
      try {
        newPassHash = hash['sha512'](payload.data.newPassword);
      } catch (err) {
        error = {desc: err.stack || err};
        throw error;
      }
      console.log(newPassHash, 'NEW PASS HASH');
      if (hash['sha512'](payload.data.oldPassword) !== userDetails.password) {
        error = {desc: 'Invalid current password'};
        throw error;
      }
      if (!validPass.valid) {
        error = {desc: validPass.error};
        throw error;
      }
      if (newPassHash === userDetails.password) {
        error = {desc: 'Same password not allowed'};
        throw error;
      }
      const pDetails = [userDetails.userType, userDetails.orgType, userDetails.userID, userDetails.firstName, userDetails.lastName];
      for (const item of pDetails) {
        const index = payload.data.newPassword.toLocaleLowerCase().match(new RegExp(item.toLocaleLowerCase(), 'ig'));
        if (index && index.length) {
          error = {desc: 'Personal details not allowed'};
          throw error;
        }
      }
      for (const item of validPass.unAcceptedKeywords) {
        const index = payload.data.newPassword.toLocaleLowerCase().match(new RegExp(item.toLocaleLowerCase(), 'ig'));
        if (index && index.length) {
          error = {desc: 'Common words not allowed'};
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
        userRepo.findOneAndUpdate({_id: userDetails._id}, userPass)
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
        userRepo.findOneWithPass({userID: payload.userCode})
      ]);
    })
    .then((res) => {
      let error = {};
      const validPass = res[0];

      console.log("\n\n <<<<< validPass >>> ", validPass);
      userDetails = res[1];

      console.log("\n\n <<<<< userDetails >>> ", userDetails);
      if (!userDetails) {
        error = {desc: 'User code is invalid'};
        throw error;
      }
      try {
        newPassHash = hash['sha512'](payload.Password);
      } catch (err) {
        error = {desc: err.stack || err};
        throw error;
      }

      if (!validPass.valid) {
        error = {desc: validPass.error};
        throw error;
      }
      if (newPassHash === userDetails.password) {
        error = {desc: 'Same password not allowed'};
        throw error;
      }
      const pDetails = [userDetails.userType, userDetails.orgType, userDetails.userID, userDetails.firstName, userDetails.lastName];
      for (const item of pDetails) {
        const index = payload.Password.toLocaleLowerCase().match(new RegExp(item.toLocaleLowerCase(), 'ig'));
        if (index && index.length) {
          error = {desc: 'Personal details not allowed'};
          throw error;
        }
      }
      for (const item of validPass.unAcceptedKeywords) {
        const index = payload.Password.toLocaleLowerCase().match(new RegExp(item.toLocaleLowerCase(), 'ig'));
        if (index && index.length) {
          error = {desc: 'Common words not allowed'};
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
        userRepo.findOneAndUpdate({_id: userDetails._id}, userPass)
      ];
      return Promise.all(promises);
    });
}

function resetPassword(payload, msg, template) {
  // console.log(payload, 'PAYLOAD');
  // console.log(msg, 'MSG');
  console.log(validator.schemas.user.resetPassword, 'VAL');
  let userDetails;
  return validator.validate(payload, validator.schemas.user.resetPassword)
    .then(() => {
      return userRepo.findOneWithPass({userID: payload.userID, email: payload.email});
    })
    .then((user) => {
     
      if (!user) {
        const error = { message: 'Invalid userID or password' };
        throw error;
      }
      let currtimestamp = dates.newDate();

      console.log(`time elapsed since reset password ${currtimestamp - user.lastResetTime}`)

      if ((currtimestamp - user.lastResetTime)/1000 < 300){
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
      console.log('generatedLInk',link)
      emailTemplateRepo.findOne({templateType: template}).then(async (template) => {
        const [templateObject] = template;
        console.log(templateObject, 'TEMP');
        let transporter = nodemailer.createTransport({
          host: config.get('email.host'),
          port: config.get('email.port'),
          secure: config.get('email.ssl'), // use TLS
          auth: {
            user: config.get('email.address'),
            pass: config.get('email.authPassword')//
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        console.log(userDetails.email);
        console.log(msg, 'MSG');
        let dataForTemplate = {
          firstName: userDetails.firstName,
          link: link.uri
        }
        let info = await transporter.sendMail({
          from: config.get('email.address'), // sender address
          to: userDetails.email,  // list of receivers
          subject: templateObject.subjectEng,    // Subject line
          html: `${replaceEmailText(templateObject.templateTextEng, dataForTemplate)}`

        });
        console.log('Message sent: %s', info.messageId);

        const userObj = {
          passwordReset: link.passwordToken,
          updatedAt: dates.newDate(),
          updatedBy: userDetails._id,
          lastResetTime: userDetails.lastResetTime
        };
        return userRepo.findOneAndUpdate({_id: userDetails._id}, userObj);
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
          userRepo.findOneWithPass({_id: payload.userId})
        ])
      } else {
        let now = new Date();
        const token = crypto.decryptEx(payload.passwordToken);
        if (token.createdAt + (config.get('tokenlifetime', 1) * 24 * 3600 * 1000) < now) {
          error = {
            desc: 'Token has expired!!'
          };
          throw error;
        }

        if (!token) {
          error = {desc: 'Invalid passwordToken'};
          throw error;
        }
        return Promise.all([
          commonHelper.validPassoword(payload.newPassword),
          userRepo.findOneWithPass({_id: token._id, passwordReset: payload.passwordToken})
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
            error = {desc: 'Invalid Old Password'};
            throw error;
          }
        }
      } else {
        error = {desc: 'Link has expired!!'};
        throw error;
      }
      newPassHash = hash[userDetails.passwordHashType](payload.newPassword);

      if (!validPass.valid) {
        error = {desc: validPass.error};
        throw error;
      }
      if (newPassHash === userDetails.password) {
        error = {desc: 'Same current password'};
        throw error;
      }
      return passwordHistoryRepo.findByUserId(userDetails._id);
    })
    .then((histories) => {
      for (const history of histories) {
        if (history.password === newPassHash) {
          error = {desc: 'You have used this password recently'};
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
        userRepo.findOneAndUpdate({_id: userDetails._id}, userPass)
      ];
      return Promise.all(promises);
    });
}

function getBasicDetail(payload) {
  return userRepo.findForBasicDetail({_id: payload.id})
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
        error = {desc: 'User code is invalid'};
        throw error;
      }
      if (user.isActive === payload.isActive) {
        const activeMsg = payload.isActive ? 'active' : 'inactive';
        error = {desc: `User already ${activeMsg}`};
        throw error;
      }
      const userObj = {
        isActive: payload.isActive,
        updatedAt: dates.newDate(),
        updatedBy: payload.userID
      };
      user.isActive = payload.isActive;
      return userRepo.update({userID: payload.userCode}, userObj)
        .then(() => user);
    });
}

function isAvailable(payload) {
  return validator.errorValidate(payload, validator.schemas.user.isAvailable)
    .then(() => {
      return userRepo.findOne({userID: payload.userCode});
    });
}

function ssoResetPassword(payload, msg) {
  let userDetails;
  let newPassHash;
  return validator.errorValidate(payload, validator.schemas.user.ssoResetPassword)
    .then(() => {
      return Promise.all([
        commonHelper.validPassoword(payload.password),
        userRepo.findOneWithPass({userID: payload.userCode})
      ]);
    })
    .then((res) => {
      let error = {};
      const validPass = res[0];
      userDetails = res[1];
      if (!userDetails) {
        const error = {userCode: 'User code is invalid'};
        throw error;
      }
      try {
        newPassHash = hash['sha512'](payload.password);
      } catch (err) {
        error = {error: err.stack || err};
        throw error;
      }
      if (payload.password !== payload.confirmPassword) {
        error = {password: 'New and confirm passwords are not matched'};
        throw error;
      }
      if (!validPass.valid) {
        error = {password: validPass.error};
        throw error;
      }
      if (newPassHash === userDetails.password) {
        error = {password: 'Same password not allowed'};
        throw error;
      }
      const pDetails = [userDetails.userType, userDetails.orgType, userDetails.userID, userDetails.firstName, userDetails.lastName];
      for (const item of pDetails) {
        const index = payload.password.toLocaleLowerCase().match(new RegExp(item.toLocaleLowerCase(), 'ig'));
        if (index && index.length) {
          error = {password: 'Personal details not allowed'};
          throw error;
        }
      }
      for (const item of validPass.unAcceptedKeywords) {
        const index = payload.password.toLocaleLowerCase().match(new RegExp(item.toLocaleLowerCase(), 'ig'));
        if (index && index.length) {
          error = {password: 'Common words not allowed'};
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
        userRepo.findOneAndUpdate({_id: userDetails._id}, userPass)
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
        users = _.filter(users, (user) => _.findIndex(_.get(user, 'groups', []), {name: payload.role}) >= 0);
      }
      return users;
    });
}
