'use strict';

module.exports = {
  user: {
    email: 'Please fill a valid email address',
    userID: 'userID is required',
    userType: 'userType is required',
    passwordPolicy: 'passwordPolicy is required',
    password: 'password is required',
    passwordHashType: 'passwordHashType is required',
    firstName: 'firstName is required',
    orgType: 'orgType is required'
  },
  commissionTemplate: {
    'templateName': 'template name is required'
  },
  auditLog: {
    event: 'event is required',
    current: 'current is required',
    collectionName: 'collection is required'
  },
  reset: {
    subject: 'Password Reset',
    para: 'Please follow the link to reset password'
  },
  set: {
    subject: 'Password Set',
    para: 'Please follow the link to set password'
  }
};

