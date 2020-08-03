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
      emailTemplateRepo.findAndFormat(payload.data.templateId, payload.data.templateParams).then(async (format) => {
        let senderEmail = config.get('email.address');
        let transporter = nodemailer.createTransport({
          host: config.get('email.host'),
          port: config.get('email.port'),
          secure: config.get('email.ssl'), // use TLS
          auth: {
            user: config.get('email.username'),
            pass: config.get('email.authPassword')//
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        let mailList = [];
        userList.forEach((element) => {
          mailList.push(element.email);
        });
        let flag = true;
        let mailOptions = {
          from: config.get('email.address'), // sender address
          to: mailList.toString(), // list of receivers
          subject: format.subjectEng, // Subject line
          html: `<p>${format.templateTextEng}</p>`// plain text body
        };

        await transporter.sendMail(mailOptions);
        return callback({ success: true });
      });
    }).catch((err) => {
      console.log(err)
      callback({ success: false, message: err.message });
    });
  } else {
    return callback({ success: false, message: 'Invalid Group for Email' });
  }
}

exports.dispatchEmail = dispatchEmail;
