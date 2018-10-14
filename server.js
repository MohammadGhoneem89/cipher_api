'use strict';

const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid/v1');
const db = require('./core/database/db')(); // eslint-disable-line
const jsReport = require('jsreport');
const url = require('url');
const cors = require('cors');
const rp = require('request-promise');
const renderExport = require('./exports');
// const generateReports = require('./reports');
let app = express();
const expressWs = require('express-ws')(app);
const crypto = require('./lib/helpers/crypto');
const RestController = require('./core/Controller/RestController.js');
const MQ = require('./MQListener.js');
const mongoDB = require('./core/api/connectors/mongoDB');
const fileUpload = require('express-fileupload');
const imageUpload = require('./core/validation/imageUpload');
const fileUploadValid = require('./core/validation/fileUpload');
const permissions = require('./lib/middleware/permissions');
const docPermissions = require('./lib/middleware/docPermission');
const requestLog = require('./lib/middleware/requesLog');
const authUser = require('./lib/auth/user');

const logger = require('./core/api/connectors/logger').app;

const serverStats = require('./lib/services/serverStats');
const notification = require('./core/mappingFunctions/notification/list');

process.on('uncaughtException', (err) => {
  logger.error({fs: 'app.js', func: 'uncaughtException', error: err, stack: err.stack}, 'uncaught exception');
});

process.on('unhandledRejection', function (err) {
  logger.error({fs: 'app.js', func: 'unhandledRejection', error: err, stack: err.stack}, 'unhandled Rejection');
});

const pagesKey = {};
const socketKey = [];
const lastSubscription = [];

global.appDir = __dirname;

mongoDB.connection(config.get('mongodb.url'));

app = expressWs.app;

const appServer = app.listen(config.get('port'), function () {
  logger.info({
    fs: 'app.js ',
    func: 'index'
  }, 'server running at http://%s:%s\n', appServer.address().address, appServer.address().port);
  console.log('server running at http://%s:%s\n', appServer.address().address, appServer.address().port);
});

// let HealthCheckHelper = require('./core/utils/health.js');
// let heathService = new HealthCheckHelper("REST", 10000, crypto.decrypt(config.get('amqp.url')));

serverStats.upsert();
// soapChannel.listen();

app.options('*', cors());

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static('public'));
app.use(express.static('exports'));
app.use('/reporting', express());

if (config.get('enableMQRead') == '1') {
  MQ.start(ReadIncomingMessage);
}

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(requestLog);


function unsubscribeOnClosedConnection(subscriberId) {
  try {
    if (lastSubscription[subscriberId].page) {
      unsubscribe(lastSubscription[subscriberId].page, subscriberId, '');
    }
  }
  catch (err) {
    logger.error(err, 'some error in unsubscription');
  }
}

function SendLater(msg, newmsg) {
  try {
    console.log("message came here in send later");
    socketKey[msg.header.userID].send(JSON.stringify(newmsg));
  }
  catch (err) {
    logger.error({fs: 'app.js', func: 'SendLater'}, err, 'cannot send message to socket as socket is closed');
  }

}

function handleRealTimeEvents(msg) {

  if (msg.header.subscriberId) {
    try {
      if (socketKey[msg.header.subscriberId]) {
        if (lastSubscription[msg.header.subscriberId]) {
          if (JSON.stringify(msg.header.params) === JSON.stringify(lastSubscription[msg.header.subscriberId].params) && msg.header.page === lastSubscription[msg.header.subscriberId].page) {
            logger.info({fs: 'app.js', func: 'handleRealTimeEvents'}, msg, 'Incoming Message Received');
            socketKey[msg.header.subscriberId].send(JSON.stringify(msg.body));
          }
        }
        else {
          socketKey[msg.header.subscriberId].send(JSON.stringify(msg.body));
        }
      }

    }
    catch (err) {
      logger.error({fs: 'app.js', func: 'handleRealTimeEvents'}, err, 'connection is closed unsubscribing');
      unsubscribeOnClosedConnection(msg.header.subscriberId);
    }
  }
}

function handleRealTimeNotification(msg) {

  if (socketKey[msg.body.userID] && socketKey[msg.body.userID].readyState == 1) {
    const messageJson = {
      'responseMessage': {
        'action': 'Notification',
        'data': {
          'message': {
            'status': msg.body.MessageType,
            'errorDescription': msg.body.MessageText,
            'routeTo': 'success',
            'displayToUser': true
          }
        }
      }
    };

    try {
      socketKey[msg.body.userID].send(JSON.stringify(messageJson));

      const param = {
        'page': {'currentPageNo': 1, 'pageSize': 5},
        'sortBy': {'createdAt': -1},
        'userID': msg.body.userID,
        'action': 'notificationList'
      };
      notification.listByUserID(param, '', '', function (response) {
        socketKey[msg.body.userID].send(JSON.stringify(response));
      });

    }
    catch (err) {
      logger.error({
        fs: 'app.js',
        func: 'handleRealTimeEvents'
      }, err, 'Cannot send notifications as the socket is closed');
    }

  }

}

function passOnCall(msg, uri) {

  const options = {
    method: 'POST',
    uri: uri + "passOn",
    body: {
      password: config.get('passOnPassword'),
      msg: msg
    },
    json: true // Automatically stringifies the body to JSON
  };

  rp(options)
    .then(function (parsedBody) {
      logger.info({
        fs: 'app.js',
        func: 'passOnCall'
      }, parsedBody, 'Broadcasted to other server from Server ' + config.get('URLRestInterface'));
    })
    .catch(function (err) {
      // POST failed...
      logger.error({fs: 'app.js', func: 'passOnCall'}, err, 'Broadcasted to other server');

    });

}

function ReadIncomingMessage_Processing(msg) {

  if (msg.header && (msg.header.action === 'FPS_VALIDATE' || msg.header.action === 'FPS_PROCESS_REQUEST_UPDATE' || msg.header.action === 'FPS_VALIDATE_ERROR')) {
    console.log("Inside FPS_VALIDATE");
    handleFileMessage(msg);
  }
  else if (msg.header && msg.header.action === 'NOTIFICATION') {
    handleRealTimeNotification(msg);
  }
  else if (msg.header && msg.header.subscriberId) {
    handleRealTimeEvents(msg);
  }
  else {
    logger.info({fs: 'app.js', func: 'ReadIncomingMessage_Processing'}, msg, 'Ignoring Message');
  }
}

function ReadIncomingMessage(msg) {

  let userId = "";
  if (msg.body) {
    if (msg.body.userID) {
      userId = msg.body.userID
    }
  }
  if (msg.header) {
    if (msg.header.userID) {
      userId = msg.header.userID
    }
    if (msg.header.subscriberId) {
      userId = msg.header.subscriberId
    }
  }

  console.log("Message is read from the queue" + JSON.stringify(msg));
  serverStats.find().then((data) => {
    for (var i = 0; i < data.length; i++) {
      if (data[i].ip.indexOf("127.0.0.1") == -1) {
        if (data[i].ip != config.get('URLRestInterface')) {
          passOnCall(msg, data[i].ip);
        }
      }
    }
  });
  ReadIncomingMessage_Processing(msg);
}

// /////////////////////////////////////////////////////////////////////////////
// /////////////////////// REST ENDPOINTS START HERE ///////////////////////////
// //////////////////////////////////

function subscribe(msg) {

  const msg2 = MQ.getNewMessageForSubscription(msg.pageName, msg.userID, msg.data);
  MQ.MQOut(null, '', msg2);
  logger.info({fs: 'app.js', func: 'subscribe'}, msg2, 'sent subscription message');
}

function unsubscribe(eventname, subscriptionId, params) {
  const msg2 = MQ.getNewMessageForUnsubscription(eventname, subscriptionId, params);
  MQ.MQOut(null, '', msg2);
  logger.info({fs: 'app.js', func: 'unsubscribe'}, msg2, 'sent unsubscription  message');
}

function sendMessage(msg) {
  expressWs.getWss().clients.forEach(function (client) {
    logger.info('Sending the message ');
    try {
      client.send(JSON.stringify(msg));
    }
    catch (err) {
      logger.error({fs: 'app.js', func: 'sendMessage'}, err, 'client socket not found');
    }
  });

}

app.ws('/Socket', function (ws, req) {
  logger.info({fs: 'app.js', func: 'Socket'}, 'Web socket Handshake Recieved');
  ws.on('message', function (msg) {
    logger.info('Web socket Handshake Recieved');
    const msg2 = JSON.parse(msg);
    logger.info({fs: 'app.js', func: 'Socket'}, msg2, 'this is request');

    const decoded = crypto.decrypt(msg2.token);

    if (decoded.userID) {
      socketKey[decoded.userID] = ws;

      pagesKey[decoded.userID] = msg2.pageName;
      msg2.userID = decoded.userID;
      if (msg2.action) {
        if (msg2.action === 'subscribe') {
          if (lastSubscription[decoded.userID]) {
            unsubscribe(lastSubscription[decoded.userID].page, decoded.userID, '');
          }
          lastSubscription[decoded.userID] = {'page': msg2.pageName, 'params': msg2.data};
          logger.info({fs: 'app.js', func: 'Socket'}, msg2, 'The subscription parameters');
          subscribe(msg2);
        }
      }
    }
    else {
      logger.error({fs: 'app.js', func: 'Socket'}, "Token doesnt have user ID" + JSON.stringify(msg2));
    }
    logger.info({fs: 'app.js', func: 'Socket'}, msg2, 'GOT Web socket END ');
  });

});

function contains(input, checkval) {
  return (input.indexOf(checkval) !== -1);
}

function checkbadinput(req) {
  const payload = req.body;
  console.log("checking for illeagal characters.");
  const requestString = JSON.stringify(payload);
  if (contains(requestString, "$")) {
    console.log("illeagal characters Found Sending Error!!");
    logger.error({fs: 'app.js', func: 'login', error: err.stack || err}, 'illeagal characters Found Sending Error!!');
    return true;
  }
  console.log("request OK!.");
  return false;
}

app.post('/login', function (req, res) {
  const payload = req.body;
  payload.action = '/login';
  payload.remoteAddress = req.connection.remoteAddress;
  const response = {
    loginResponse: {
      action: 'login',
      data: {
        message: {
          status: 'OK',
          errorDescription: 'logged in successfully !!!',
          routeTo: '',
          displayToUser: true
        },
        success: true,
        token: '',
        firstScreen: ''
      }
    }
  };
  if (checkbadinput(req)) {
    let err = {desc: 'invalid userId or password'};
    response.loginResponse.data.message.status = 'ERROR';
    response.loginResponse.data.message.errorDescription = err.desc || err.stack || err;
    response.loginResponse.data.success = false;
    res.send(response);
    return;
  }

  authUser(payload)
    .then((user) => {
      response.loginResponse.data.token = user.token;
      response.loginResponse.data.firstScreen = user.firstScreen;
      res.send(response);
    })
    .catch((err) => {
      logger.error({fs: 'app.js', func: 'login', error: err.stack || err}, 'login failed');
      response.loginResponse.data.message.status = 'ERROR';
      response.loginResponse.data.message.errorDescription = err.desc || err.stack || err;
      response.loginResponse.data.success = false;
      res.send(response);
    });
});

app.post('/uploadFile/:action', permissions, function (req, res) {
  if (checkbadinput(req)) {
    let resperr = {'error': "illeagal character found in request"}
    res.send(resperr);
    return;
  }
  let org = config.get('downloadAPIDetail.organization');
  if (org === 'Entity' || org === 'Acquirer') {
    console.log('=============Calling GSB==============');

    let options = {
      method: 'POST',
      uri: config.get('downloadAPIDetail.gsbURLs.upload'),
      formData: {
        name: 'files',
        file: {
          value: req.files.file.data,
          options: {
            filename: req.files.file.name,
            contentType: req.files.file.mimetype
          }
        }
      },
      headers: {
        'content-type': 'multipart/form-data',
        source: req.body.source || '',
        type: req.body.type,
        context: req.body.context,
        username: config.get('downloadAPIDetail.credentials.username'),
        password: config.get('downloadAPIDetail.credentials.password')
      }
    };
    rp(options)
      .then((responses) => {
        res.send(JSON.parse(responses));
      })
      .catch(function (err) {
        let response = {
          "status": "ERROR",
          "message": "Failed to connect GSB",
          err: err.stack || err
        };
        res.send(response);
        res.end();
      });
  }
  else {
    console.log('=============Organization is not entity==============');
    const JWToken = req.get('token');
    const decoded = crypto.decrypt(JWToken);
    const file = req.files.file;
    const fileName = file.name;
    const arr = fileName.split('.');
    const ext = arr[1];
    const userID = decoded.userID;

    const UUID = uuid();
    const source = req.headers.source || req.body.source;
    const params = req.headers.type || req.body.type;
    const context = req.headers.context || req.body.context;

    if (!file) {
      logger.error({
        fs: 'app.js',
        func: 'uploadFile'
      }, ' [ File Upload Service ] File is not exist in req : ' + req.file);
      res.send('File does not exist');
    }
    else {
      fileUploadValid(file, UUID, ext, params, userID, source, context, function (data) {
        res.send(data);
      });
    }

  }
});

function handleTokenVerification(req, res, callback, action) {
  if (checkbadinput(req)) {
    let resperr = {'error': "illeagal character found in request"}
    res.send(resperr);
    return;
  }
  logger.info({fs: 'app.js', func: 'handleTokenVerification'}, 'Handle Transaction on Cipher ');
  const payload = req.body;
  let JWToken = '';
  if (payload.JWToken) {
    JWToken = payload.JWToken;
  }
  else {
    JWToken = req.get('token');
  }

  logger.info({fs: 'app.js', func: 'handleTokenVerification'}, JWToken, 'JWToken : ');

  const decoded = crypto.decrypt(JWToken);
  if (decoded) {
    logger.info({fs: 'app.js', func: 'handleTokenVerification'}, decoded, 'decoded.userID:  ');
    return callback(decoded, req.body, res, action, req);
  }

  const messageJson = {
    'responseMessage': {
      'action': 'Connection Error',
      'data': {
        'message': {
          'status': 'ERROR',
          'errorDescription': 'Access Denied',
          'routeTo': 'success',
          'displayToUser': true
        }
      }
    }
  };
  res.send(messageJson);
  return callback({}, {}, res, '', req);
}

app.post('/uploadImg', function (req, res) {
  if (checkbadinput(req)) {
    let resperr = {'error': "illeagal character found in request"}
    res.send(resperr);
    return;
  }
  const JWToken = req.get('token');
  const decoded = crypto.decrypt(JWToken);
  const data = req.body.data;
  const UUID = uuid();

  const userID = decoded.userID;
  const source = req.body.source || 'profileImage';
  const params = req.body.type || 'Image';
  const context = req.body.context;

  if (!data) {
    logger.debug({fs: 'app.js', func: 'uploadImg'}, ' [ File Upload Service ] File is not exist in req : ' + req.file);
    res.send('Image dose not exist');
  }
  else {
    imageUpload(data, UUID, params, userID, source, context, function (imageUploadResponse) {
      res.send(imageUploadResponse);
    });
  }
});

const getUpload = require('./core/validation/getDocUploadEx.js');

app.get('/getUploadedFile/:action/:id', permissions, function (req, res) {
  if (checkbadinput(req)) {
    let resperr = {'error': "illeagal character found in request"}
    res.send(resperr);
    return;
  }
  console.log('Taking it from local');
  const UUID = req.params.id;
  console.log('==============UUID of downloaded file============' + UUID);
  logger.debug({fs: 'app.js', func: 'getUploadedFile'}, ' [ getUploadedFile ]   : ' + UUID);
  getUpload(UUID, res, function (data) {
    console.log('==============Sending file in return========================' + UUID);
    res.send(data, 'binary');
  });
});

const getDocUpload = require('./core/validation/getDocUpload.js');

app.post('/upload/:action', permissions, function (req, res) {
  let id = req.params.id;
  const JWToken = req.get("token");
  const decoded = crypto.decrypt(JWToken);
  let source = req.query.source;
  let ePayRefNo = req.query.ePayRefNo;
  let data = {
    id: id,
    source: source,
    ePayRefNo: ePayRefNo,
    JWToken: decoded
  };

  getDocUpload(data)
    .then((fileData) => {
      res.download(fileData.path, fileData.name);
    })
    .catch((err) => {
      let response = {
        "status": "ERROR",
        "message": "Failed to download",
        err: err.stack || err
      };
      res.send(response);
      res.end();
    });

});

app.post('/APII/:channel/:action', permissions, function (req, res) {
  if (checkbadinput(req)) {
    let resperr = {'error': "illeagal character found in request"};
    res.send(resperr);
    return;
  }
  const payload = req.body;
  const JWToken = req.get('token');
  const action = req.params.action;
  const channel = req.params.channel;
  logger.info({fs: 'app.js', func: 'APPI'}, 'Handle Transaction on Cipher ' + action + ' ' + channel);
  if (channel === 'Cipher') {
    logger.trace({payload: payload}, 'Cipher APII call Payload');
  }
  logger.info({fs: 'app.js', func: 'APPI'}, 'calling handleExternalRequest ');
  const UUID = uuid();
  logger.info({fs: 'app.js', func: 'APPI'}, 'UUID:  ' + UUID);
  logger.info({fs: 'app.js', func: 'APPI'}, 'JWToken :  ' + JWToken);

  RestController.handleExternalRequest(payload, channel, action, UUID, res, '');

});

app.post('/API/:channel/:action', permissions, function (req, res) {
  if (checkbadinput(req)) {
    let resperr = {'error': "illeagal character found in request"};
    res.send(resperr);
    return;
  }
  let payload = req.body;
  let JWToken = '';
  if (payload.JWToken) {
    JWToken = payload.JWToken;
  }
  else {
    JWToken = req.get('token');
  }
  payload.token = JWToken;
  const action = req.params.action;
  const channel = req.params.channel;
  logger.info({fs: 'app.js', func: 'API'}, 'Handle Transaction on Cipher ' + action + ' ' + channel);
  payload = Object.assign(payload, {action: action, channel: channel, ipAddress: "::1"});
  logger.info('calling handleExternalRequest ');
  const UUID = uuid();
  logger.info({fs: 'app.js', func: 'API'}, 'UUID:  ' + UUID);
  logger.info({fs: 'app.js', func: 'API'}, 'JWToken :  ' + JWToken);

  const decoded = crypto.decrypt(JWToken);
  logger.info({fs: 'app.js', func: 'API'}, decoded, 'decoded.userID:');
  RestController.handleExternalRequest(payload, channel, action, UUID, res, decoded);

});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
}

app.post('/SIMU/:action', function (req, res) {
  logger.info('Handle Transaction on Cipher ');
  const action = req.params.action;
  logger.info(req.headers, 'Headers: ');
  logger.info(req.headers, 'Headers: ');
  logger.info(req.body, 'Data: ');
  const resData = require('./responseJSON/' + action + '.json');
  res.type('json');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  res.send(resData);
});

const searchCriteriaExport = require('./lib/helpers/searchCriteriaExport');

function sendError(req, res) {
  const errMsg = {
    loginResponse: {
      action: 'reports',
      data: {
        message: {
          status: 'ERROR',
          errorDescription: 'You are not allowed to access this resource',
          routeTo: '',
          displayToUser: true
        },
        success: false
      }
    }
  };
  res.status(403);
  res.json(errMsg);
  res.end();
}

app.get('/export/:channel', permissions, function (req, res) {
  if (checkbadinput(req)) {
    let resperr = {'error': "illeagal character found in request"}
    res.send(resperr);
    return;
  }
  const url_parts = url.parse(req.url, true);
  const type = url_parts.query.type;
  let gridType = url_parts.query.gridType;
  const JWToken = url_parts.query.JWT;
  let decoded;
  try {
    decoded = crypto.decrypt(JWToken);
  }
  catch (err) {
    return sendError(res, req);
  }
  if (!decoded || !JWToken) {
    return sendError(req, res);
  }
  let query = url_parts.query.searchCriteria || '';
  try {
    query = query ? JSON.parse(new Buffer(query, 'base64')) : {};
  }
  catch (e) {
    res.send(e);
    res.end();
  }
  renderExport(type, gridType, query, jsReport, decoded, res);

});

app.post('/passOn', function (req, res) {
  if (checkbadinput(req)) {
    let resperr = {'error': "illeagal character found in request"};
    res.send(resperr);
    return;
  }
  let passOnPassword = config.get('passOnPassword');

  if (passOnPassword !== req.body.password) {
    res.send(JSON.stringify({"status": "Not Authorized to access the resource"}));
    return;
  }
  ReadIncomingMessage_Processing(req.body.msg);
  res.send(JSON.stringify({"status": "Done"}));
});
