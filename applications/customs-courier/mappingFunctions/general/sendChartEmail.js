'use strict';
const uuid = require('uuid/v1');
// const Widgets = require('../../../../lib/models/widget.js');
const nodemailer = require('nodemailer');
// const config = require('../../config/index');

async function sendChartEmail(payload, UUIDKey, route, callback, JWToken, res) {
    // console.log(payload);
    
    let transporter = nodemailer.createTransport({
        // host: config.get('email.host'),
        // port: config.get('email.port'),
        // secure: config.get('email.ssl'),
        "address" : "zain.jawwad@avanzainnovations.com",
        "host" : "smtp.gmail.com",
        "port" : 465,
        "ssl" : false,
        "authPassword" : "Aisitaisi4696",
        auth: {
            user: 'zain.jawwad@avanzainnovations.com',
            pass: 'Aisitaisi4696'
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });
// const ewsClient = () => {

//     const passwordPlainText = _decrypt(config.get('email.authPassword'));
//     const ntHashedPassword = httpntlm.ntlm.create_NT_hashed_password(passwordPlainText);
//     const lmHashedPassword = httpntlm.ntlm.create_LM_hashed_password(passwordPlainText);

//     const ewsConfig = {
//         username: config.get('email.authEmail'),
//         nt_password: ntHashedPassword,
//         lm_password: lmHashedPassword,
//         host: config.get('email.host'),
//         auth: 'NTLM'
//     };
//     return new EWS(ewsConfig);
// }

// const emailClient = {
//     ewsClient,
//     smtpClient
// }

// module.exports = (params) => {
//     return new Promise((resolve, reject) => {
//         params = params || {};
//         if (!config.get('email.isEWS')) {
//             console.log('SMTP client')
//             let transporter = emailClient.smtpClient();
            let attachment = payload.attachment.split("base64,")[1]

             transporter.sendMail({
                from: 'zain.jawwad@avanzainnovations.com',
                to: 'zain.jawwad@avanzainnovations.com',
                subject: payload.subject,
                html: '',
                text: payload.text,
                // attachments: payload.attachment || []
                attachments: [
                    {   // encoded string as an attachment
                      filename: 'chart-pdf.pdf',
                      content: attachment,
                      encoding: 'base64'
                    }
                  ]
            }, function (error, info) {
                if (error) {
                    console.log("error is " + error);
                    // resolve(error);
                }
                else {
                    console.log('Email sent: %s', info.messageId);
                    console.log('Email sent: ' + info.response);
                    // resolve(info.response);
                }
            });
        }


exports.sendChartEmail = sendChartEmail;

