'use strict';

const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid/v1');
const db = require('./database/db')(); // eslint-disable-line
const jsReport = require('jsreport');
const url = require('url');
const clientIp = require('client-ip');
const cors = require('cors');
const rp = require('request-promise');
const renderExport = require('./exports');
const generateReports = require('./reports');
let app = express();
const expressWs = require('express-ws')(app);
const crypto = require('./lib/helpers/crypto');
const RestController = require('./Controller/RestController.js');
const MQ = require('./MQListener.js');
const mongoDB = require('./api/bootstrap/mongoDB');
const fileUpload = require('express-fileupload');
const imageUpload = require('./validation/imageUpload');
const fileUploadValid = require('./validation/fileUpload');
const permissions = require('./lib/middleware/permissions');
const docPermissions = require('./lib/middleware/docPermission');
const requestLog = require('./lib/middleware/requesLog');
const authUser = require('./lib/auth/user');

const logger = require('./api/bootstrap/logger').app;

const serverStats = require('./lib/services/serverStats');
const couchViews = require('./CreateCouchViews.js');
const chrono = require('./background/app.js');

couchViews.Sync(config.get('couch.host') + ':' + config.get('couch.port'), config.get('couch.channel'));

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

serverStats.upsert();

app.options('*', cors());

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static('public'));
app.use(express.static('exports'));
app.use('/reporting', express());

jsReport({
  express: {app: app, server: appServer},
  appPath: '/reporting'
}).init()
  .catch(function (e) {
    logger.error(e, 'JS report error');
  });

MQ.start(ReadIncomingMessage);

app.use(bodyParser.json({limit: 10000000}));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(requestLog);

let ConnMQ = {};

MQ
  .startSend()
  .then((ch) => {
    ConnMQ = ch;
    logger.info({fs: 'app.js', func: 'startSend'}, 'MQ Connection Loaded Successfully!!!');
  }).catch((err) => {
  logger.error({error: err, fs: 'app.js', func: 'startSend'}, 'MQ Connection Loaded Error!!!');
});

function passOnCall(msg, uri) {

  const options = {
    method: 'POST',
    uri: uri + '/passOn',
    body: {
      password: 'abc',
      msg: msg
    },
    json: true // Automatically stringifies the body to JSON
  };

  rp(options)
    .then(function (parsedBody) {
      logger.info({fs: 'app.js', func: 'passOnCall'}, parsedBody, 'Broadcasted to other server');
    })
    .catch(function (err) {
      // POST failed...
      logger.error({fs: 'app.js', func: 'passOnCall'}, err, 'Broadcasted to other server');

    });

}

function ReadIncomingMessage(msg) {

  let userId = '';
  if (msg.body) {
    if (msg.body.userID) {
      userId = msg.body.userID;
    }
  }
  if (msg.header) {
    if (msg.header.userID) {
      userId = msg.header.userID;
    }
    if (msg.header.subscriberId) {
      userId = msg.header.subscriberId;
    }
  }

  if (!socketKey[userId]) {
    serverStats.find().then((data) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].ip !== config.get('URLRestInterface')) {
          passOnCall(msg, data[i].ip);
        }
      }
    });
  }

}

// /////////////////////////////////////////////////////////////////////////////
// /////////////////////// REST ENDPOINTS START HERE ///////////////////////////
// //////////////////////////////////

function subscribe(msg) {

  const msg2 = MQ.getNewMessageForSubscription(msg.pageName, msg.userID, msg.data);
  MQ.MQOut(ConnMQ, '', msg2);
  logger.info({fs: 'app.js', func: 'subscribe'}, msg2, 'sent subscription message');
}

function unsubscribe(eventname, subscriptionId, params) {
  const msg2 = MQ.getNewMessageForUnsubscription(eventname, subscriptionId, params);
  MQ.MQOut(ConnMQ, '', msg2);
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
      logger.error({fs: 'app.js', func: 'Socket'}, 'Token doesnt have user ID' + JSON.stringify(msg2));
    }
    logger.info({fs: 'app.js', func: 'Socket'}, msg2, 'GOT Web socket END ');
  });

});

app.post('/TestingSocket', function (req, res) {
  logger.debug({fs: 'app.js', func: 'TestingSocket'}, 'Handle Transaction on Cipher ');
  const messageJson = {
    'responseMessage': {
      'action': 'Connection Error',
      'data': {
        'message': {
          'status': 'ERROR',
          'errorDescription': req.body.m,
          'routeTo': 'success',
          'displayToUser': true
        }
      }
    }
  };
  res.send(JSON.stringify(messageJson));

  expressWs.getWss().clients.forEach(function (client) {
    logger.info({fs: 'app.js', func: 'TestingSocket'}, messageJson, 'Sending the message ');
    client.send(JSON.stringify(messageJson));
  });

});

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
          newPageURL: '/blockchain',
          displayToUser: true
        },
        success: true,
        token: '',
        firstScreen: ''
      }
    }
  };
  authUser(payload)
    .then((user) => {
      response.loginResponse.data.token = user.token;
      response.loginResponse.data.firstScreen = user.firstScreen;
      res.send(response);
    })
    .catch((err) => {
      console.log(err);
      response.loginResponse.data.message.status = 'ERROR';
      response.loginResponse.data.message.errorDescription = err.desc || err.stack || err;
      response.loginResponse.data.success = false;
      res.send(response);
    });
});

app.post('/uploadFile', docPermissions, function (req, res) {
  const JWToken = req.get('token');
  const decoded = crypto.decrypt(JWToken);
  const file = req.files.file;
  const fileName = file.name;
  const arr = fileName.split('.');
  const ext = arr[1];
  const userID = decoded.userID;
  const UUID = uuid();
  const source = req.body.source;
  const params = req.body.type;
  const context = req.body.context;

  if (!file) {
    logger.error({
      fs: 'app.js',
      func: 'uploadFile'
    }, ' [ File Upload Service ] File is not exist in req : ' + req.file);
    res.send('File dose not exist');
  }
  else {
    fileUploadValid(file, UUID, ext, params, userID, source, context, function (data) {
      res.send(data);
    });
  }
});

function handleTokenVerification(req, res, callback, action) {
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

function sendMessageForFileProcessing(userInfo, args, res, action, req) {
  let respMsg = '';
  let msg = {};
  let newPageURL = '';

  let userIP = '';
  if (req.connection) {
    userIP = req.connection.remoteAddress;
  }
  let objId = '';
  if (req.body && req.body.objectID) {
    objId = req.body.objectID;
  }

  if (userInfo.userID) {
    const UUID = uuid();
    if (action === 'FPS_PROCESS_REQUEST') {
      msg = MQ.getNewMessageForReconProcess(userInfo.userID, userInfo.orgCode, UUID, userIP, action, args, 'UI');
      respMsg = 'Recon file successfully confirmed';
      newPageURL = 'reconAuditDetail/' + objId;
    }

    if (action === 'FPS_VALIDATE') {

      msg = MQ.getNewMessageForReconValidate(userInfo.userID, userInfo.orgCode, UUID, userIP, action, args, 'UI');
      respMsg = 'Recon file successfully uploaded';
      newPageURL = 'manualReconStats' + '/' + args.orgType + '/' + args.orgCode + '/' + objId;

    }

    const respMessage = {
      'responseMessage': {
        'action': 'manualReconStats',
        'data': {
          'message': {
            'status': 'OK',
            'errorDescription': respMsg,
            'newPageURL': '/' + newPageURL,
            'displayToUser': true
          }
        }
      }
    };
    logger.info({fs: 'app.js', func: 'sendMessageForFileProcessing'}, msg, ' message sent to the queue');

    MQ.MQOut(ConnMQ, 'FPS_Input_Queue', msg);
    res.send(respMessage);

  }

}

app.post('/manualReconUpload', function (req, res) {

  const UUID = uuid();
  logger.debug({fs: 'app.js', func: 'manualReconUpload'}, 'UUID:  ' + UUID);

  handleTokenVerification(req, res, sendMessageForFileProcessing, 'FPS_VALIDATE');

});

app.post('/manualReconConfirm', function (req, res) {

  const UUID = uuid();
  logger.debug({fs: 'app.js', func: 'manualReconConfirm'}, 'UUID:  ' + UUID);

  handleTokenVerification(req, res, sendMessageForFileProcessing, 'FPS_PROCESS_REQUEST');

});

app.post('/uploadImg', function (req, res) {

  const data = req.body.data;
  const UUID = uuid();

  const userID = 'Admin';
  const source = 'profileImage';
  const params = 'Image';
  const context = '8a6008e6-7d1e-8cd2-1631-c3bddf902f80';

  if (!data) {
    logger.debug({
      fs: 'app.js',
      func: 'uploadImg'
    }, ' [ File Upload Service ] File is not exist in req : ' + req.file);
    res.send('Image dose not exist');
  }
  else {
    imageUpload(data, UUID, params, userID, source, context, function (imageUploadResponse) {
      res.send(imageUploadResponse);
    });
  }
});

const getUpload = require('./validation/getUpload.js');

app.get('/getUploadedFile/:id', docPermissions, function (req, res) {
  const UUID = req.params.id;

  logger.debug({fs: 'app.js', func: 'getUploadedFile'}, ' [ getUploadedFile ]   : ' + UUID);
  getUpload(UUID, res, function (data) {
    res.send(data);
  });

});

const getDocUpload = require('./validation/getDocUpload.js');

app.get('/getDocUpload/:id', docPermissions, function (req, res) {
  const id = req.params.id;
  const JWToken = req.get('token');
  const decoded = crypto.decrypt(JWToken);
  const source = req.params.source || 'R/D';
  const ePayRefNo = req.params.ePayRefNo || '00000001518700';
  const data = {
    id: id,
    source: source,
    ePayRefNo: ePayRefNo,
    JWToken: decoded
  };

  data.JWToken.orgType = 'Entity';

  getDocUpload(data)
    .then((fileData) => {
      res.download(fileData.path, fileData.name);
    })
    .catch((err) => {
      const response = {
        'status': 'ERROR',
        'message': 'Failed to download',
        err: err.stack || err
      };
      res.send(response);
      res.end();
    });

});

app.post('/APII/:channel/:action', permissions, function (req, res) {
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

  RestController.handleExternalRequest(payload, channel, action, UUID, res, '', ConnMQ);

});

app.post('/API/:channel/:action', permissions, function (req, res) {
  let payload = req.body;
  let JWToken = '';
  if (payload.JWToken) {
    JWToken = payload.JWToken;
  }
  else {
    JWToken = req.get('token');
  }
  const action = req.params.action;
  const channel = req.params.channel;
  logger.info({fs: 'app.js', func: 'API'}, 'Handle Transaction on Cipher ' + action + ' ' + channel);
  payload = Object.assign(payload, {action: action, channel: channel, ipAddress: clientIp(req)});
  logger.info('calling handleExternalRequest ');
  const UUID = uuid();
  logger.info({fs: 'app.js', func: 'API'}, 'UUID:  ' + UUID);
  logger.info({fs: 'app.js', func: 'API'}, 'JWToken :  ' + JWToken);

  const decoded = crypto.decrypt(JWToken);
  logger.info({fs: 'app.js', func: 'API'}, decoded, 'decoded.userID:');
  RestController.handleExternalRequest(payload, channel, action, UUID, res, decoded, ConnMQ);

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

app.get('/export', function (req, res) {
  const url_parts = url.parse(req.url, true);
  const type = url_parts.query.type;
  const gridType = url_parts.query.gridType;
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
    query = query ? JSON.parse(new Buffer(query, 'base64')) : '';
  }
  catch (e) {
    res.send(e);
    res.end();
  }

  renderExport(type, gridType, query, jsReport, decoded, res);

});

const searchCriteriaOrgType = require('./lib/helpers/searchCriteriaOrgType');
app.get('/reports', function (req, res) {
  const url_parts = url.parse(req.url, true);
  const id = url_parts.query.id;
  const type = url_parts.query.reportFormat;
  const JWToken = url_parts.query.JWT;
  let language = url_parts.query.language;
  let query = url_parts.query.searchCriteria || '';
  query = query ? JSON.parse(new Buffer(query, 'base64')) : {};
  language = language ? JSON.parse(new Buffer(language, 'base64')) : {};
  let decoded;
  try {
    decoded = crypto.decrypt(JWToken);
  }
  catch (err) {
    return sendError(req, res);
  }
  if (!decoded || !JWToken) {
    return sendError(req, res);
  }
  query = searchCriteriaOrgType(query, decoded);

  const payload = {
    filters: query,
    reportsCriteriaId: id,
    JWT: JWToken,
    nationalization: language
  };
  try {
    generateReports(jsReport, payload, res, type);
  }
  catch (e) {
    res.send(e);
    return res.end();
  }
});

app.post('/passOn', function (req, res) {
  const password = req.body.password;

  ReadIncomingMessage_Processing(req.body.msg);

});

const getFilterData = require('./reports/getFilterData');
app.post('/getFilter', function (req, res) {
  const id = req.body.id;
  getFilterData(id)
    .then((data) => {
      res.send(data);
    })
    .catch((e) => {
      const error = e.stack || e;
      res.send(error);
      return res.end();
    });
});

const couchQuery = require('./lib/couch/selectWithProjection');
app.post('/couchQuery', function (req, res) {

  req.body.channel = req.body.channel || 'transactions';

  couchQuery(req.body.channel, req.body.query, req.body.projection)
    .then((queryResult) => {
      const result = [];
      queryResult.map((item) => {
        result.push(item.data);
      });
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
      return res.end();
    });
});

app.post('/websocketNotifications', function (req, res) {
  res.send({hello: 'world'});
});
