'use strict';
const Users = require('../../../lib/repositories/user');
const group = require('../../../lib/repositories/group');
const _ = require('lodash');
const typeData = require('../../../lib/repositories/typeData');
const emailTemplateRepo = require('../../../lib/repositories/emailTemplate');
const nodemailer = require('nodemailer');
const config = require('../../../config/index');

function dispatchEmail(payload, UUIDKey, route, callback, JWToken) {

  let grp = _.get(payload, 'data.groupName', null);
  if (grp) {
    group.findOneByName(grp).then((data) => {
      return Users.find({
        "groups": {
          "$in": [
            data._id
          ]
        }
      });
    }).then((userList) => {
      emailTemplateRepo.findAndFormat(payload.data.templateId, payload.data.templateParams).then((format) => {
        let senderEmail = config.get('email.address');
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: config.get('email.address'),
            pass: config.get('email.authPassword')
          }
        });
        let mailList = [];
        userList.forEach((element) => {
          mailList.push(element.email);
        });
        let flag = true;
        let mailOptions = {
          from: senderEmail, // sender address
          to: mailList.toString(), // list of receivers
          subject: format.subjectEng, // Subject line
          html: `<p>${format.templateTextEng}</p>`// plain text body
        };
        transporter.sendMail(mailOptions, function (err, info) {
          if (err) {
            return callback({success: false, message: err.response});
          }
          console.log(info);
          return callback({success: true});

        });
      });
    }).catch((err) => {
      console.log(err)
      callback({success: false, message: err.message});
    });
  } else {
    return callback({success: false, message: 'Invalid Group for Email'});
  }
}

exports.dispatchEmail = dispatchEmail;
