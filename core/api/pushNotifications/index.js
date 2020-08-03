const group = require('../../../lib/models/Group');
const users = require('../../../lib/models/User');
const notification = require('../../../lib/models/Notifications');
const nodemailer = require('nodemailer');
const _ = require('lodash');
const config = require('../../../config/index');
const configDiscovery = require('../../../config/config.json');
const list = require('../../mappingFunctions/notification/list');
const emailTemplateRepo = require('../../../lib/repositories/emailTemplate');

async function pushByGroupName(groupName, handler, text, type, template = 'default', data = {}, isEmailNotification, URI) {

    // fetch all users in group
    let UserEmailList = []
    let uListGloabal = [];
    let gList = await group.find({ name: groupName });
    for (let element of gList) {
        let uList = await users.find({ "groups": { "$in": ["5ea5269c155e2736fe06cd33"] } });
        uList.forEach(elem => {
            UserEmailList.push(elem.email);
            uListGloabal.push(elem)
        });
    }

    if (isEmailNotification) {
        emailTemplateRepo.findAndFormat(template, data).then((format) => {
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

            let mailOptions = {
                from: config.get('email.address'), // sender address
                to: UserEmailList.toString(), // list of receivers
                subject: format.subjectEng, // Subject line
                html: `<p>${format.templateTextEng}</p>`// plain text body
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    return callback({ success: false, message: err.response });
                }
                console.log(info);
                return callback({ success: true });

            });
        }).catch((exp) => {
            console.log(exp);
        });
    }
    let labeltype = 'label label-sm label-info'
    if (type == "ERROR") {
        labeltype = 'label label-sm label-danger'
    }
    if (type == "OK") {
        labeltype = 'label label-sm label-success'
    }
    if (type == "WARN") {
        labeltype = 'label label-sm label-warning'
    }

    uListGloabal.forEach(async element => {
        let notData = {
            "text": text,
            "action": URI,
            "type": type,
            "labelClass": labeltype,
            "userId": element._id,
            "userID": element._id,
            "data": JSON.stringify(data),
            "handler": handler,
            "isRead": false
        };
        await notification.create(notData);
        // push to vault/discovery and disburese to all clients
        if (global.discoveryws.readyState == 1) {
            global.discoveryws.send(JSON.stringify({ type: 155, env: configDiscovery.keyVault.env, svc: 'cipher-api', header: configDiscovery.keyVault.header, data: notData }));
        }
    });
    return;
}



global.discoveryws.on('message', async function incoming(data) {
    let incData = JSON.parse(data);
    console.log('Recieved from broadcast!', JSON.stringify(incData))
    if (incData.type == 155) {
        console.log('5a07439653f81de88ccdd0bc', incData.data.userID)
        let wsConnect = _.get(global.WSRegistery, incData.data.userID, {});
        if (wsConnect.readyState)
            console.log(wsConnect.readyState);
        if (wsConnect && wsConnect.readyState && wsConnect.readyState == 1) {
            console.log('Socket Found!!', JSON.stringify(incData.data.userID))

            list.listByUserID({
                action: "notificationList",
                "page": {
                    "currentPageNo": 1, "pageSize": 8
                },
                "sortBy": { "createdAt": -1 },
                userID: incData.data.userID,
                isRead: false
            }, undefined, 'listByUserID', function (data) {
                console.log(JSON.stringify(data))
                wsConnect.send(JSON.stringify(data))
                wsConnect.on('error', function exp(err) {
                    console.log(err)
                });
            }, {});


        } else {
            console.log('Socket not Alive :(')
        }
    }
});


exports.pushByGroupName = pushByGroupName;
