'use strict';

const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid/v1');
const db = require('./core/database/db')(); // eslint-disable-line

const url = require('url');
const cors = require('cors');
const rp = require('request-promise');
let app = express();
const expressWs = require('express-ws')(app);
const crypto = require('./lib/helpers/crypto');
const apiTemplate = require('./lib/repositories/apiTemplate');
const RestController = require('./core/Controller/RestController.js');
const mongoDB = require('./core/api/connectors/mongoDB');
const fileUpload = require('express-fileupload');
const imageUpload = require('./core/validation/imageUpload');
const fileUploadValid = require('./core/validation/fileUpload');
const permissions = require('./lib/middleware/permissions');
const requestLog = require('./lib/middleware/requesLog');
const authUser = require('./lib/auth/user');
const logger = require('./core/api/connectors/logger').app;
const _ = require('lodash');

process.on('uncaughtException', (err) => {
  logger.error({ fs: 'app.js', func: 'uncaughtException', error: err, stack: err.stack }, 'uncaught exception');
});

process.on('unhandledRejection', function (err) {
  logger.error({ fs: 'app.js', func: 'unhandledRejection', error: err, stack: err.stack }, 'unhandled Rejection');
});
global.appDir = __dirname;
mongoDB.connection(config.get('mongodb.url'));
console.log(config.get('mongodb.url'))
app = expressWs.app;

const routeData = require('./core/mappingFunctions/systemAPI/APIDefination');
let appServer;
routeData.LoadConfig().then(() => {
  console.log('Configurations Loaded For Request Processing!!');
  appServer = app.listen(config.get('port'), function () {
    logger.info({
      fs: 'app.js ',
      func: 'index'
    }, 'server running at http://%s:%s\n', appServer.address().address, appServer.address().port);
    console.log('server running at http://%s:%s\n', appServer.address().address, appServer.address().port);
  });
});

apiTemplate.find().then(templates=>{

  var templatesg={}
  templates.forEach(function(template) {
    templatesg[template.name] = template;
  });

  global.apiTemplatesg=templatesg;
})




app.options('*', cors());
app.use(cors());
app.use(fileUpload());
app.use(express.static('public'));
app.use(express.static('exports'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(requestLog);

// health Check block
let HealthCheckHelper = require('./core/utils/health.js');
app.use('/health', HealthCheckHelper.router);
//==================


function contains(input, checkval) {
  return (input.indexOf(checkval) !== -1);
}
function checkbadinput(req) {
  const payload = req.body;
  console.log("checking for illeagal characters.");
  const requestString = JSON.stringify(payload);
  if (contains(requestString, "$")) {
    console.log("illeagal characters Found Sending Error!!");
    logger.error({ fs: 'app.js', func: 'login', error: err.stack || err }, 'illeagal characters Found Sending Error!!');
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

  const apiResponse = {
    messageStatus: 'OK',
    errorCode: 200,
    errorDescription: "logged in successfully !!!",
    token: "",
    timestamp: ""
  };

  if (checkbadinput(req)) {
    let err = {
      desc: 'The username or password is incorrect'
    };
    response.loginResponse.data.message.status = 'ERROR';
    response.loginResponse.data.message.errorDescription = err.desc || err.stack || err;
    response.loginResponse.data.success = false;
    res.send(response);
    return;
  }

  authUser(payload)
    .then((user) => {
      if (user.userType == "API") {
        apiResponse.token = user.token;
        console.log("user ?????? ",user);
        res.send(apiResponse);
      } else {
        console.log("response.loginResponse.data ?????? ",response.loginResponse.data)
        response.loginResponse.data.token = user.token;
        response.loginResponse.data.firstScreen = user.firstScreen;
        res.send(response);
      }
    })
    .catch((err) => {
      logger.error({
        fs: 'app.js',
        func: 'login',
        error: err.stack || err
      }, 'login failed');
      response.loginResponse.data.message.status = 'ERROR';
      response.loginResponse.data.message.errorDescription = err.desc || err.stack || err;
      response.loginResponse.data.success = false;
      res.send(response);
    });
});

app.post('/uploadFile/:action', permissions, function (req, res) {
  if (checkbadinput(req)) {
    let resperr = { 'error': "illeagal character found in request" }
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
        console.log(data)
        res.send(data);
      });
    }

  }
});

app.post('/uploadImg', function (req, res) {
  if (checkbadinput(req)) {
    let resperr = { 'error': "illeagal character found in request" }
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
    logger.debug({ fs: 'app.js', func: 'uploadImg' }, ' [ File Upload Service ] File is not exist in req : ' + req.file);
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
    let resperr = { 'error': "illeagal character found in request" }
    res.send(resperr);
    return;
  }
  console.log('Taking it from local');
  const UUID = req.params.id;
  console.log('==============UUID of downloaded file============' + UUID);
  logger.debug({ fs: 'app.js', func: 'getUploadedFile' }, ' [ getUploadedFile ]   : ' + UUID);
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
    let resperr = { 'error': "illeagal character found in request" };
    res.send(resperr);
    return;
  }
  const payload = req.body;
  const JWToken = req.get('token');
  const action = req.params.action;
  const channel = req.params.channel;
  logger.info({ fs: 'app.js', func: 'APPI' }, 'Handle Transaction on Cipher ' + action + ' ' + channel);
  if (channel === 'Cipher') {
    logger.trace({ payload: payload }, 'Cipher APII call Payload');
  }
  logger.info({ fs: 'app.js', func: 'APPI' }, 'calling handleExternalRequest ');
  const UUID = uuid();
  logger.info({ fs: 'app.js', func: 'APPI' }, 'UUID:  ' + UUID);
  logger.info({ fs: 'app.js', func: 'APPI' }, 'JWToken :  ' + JWToken);

  RestController.handleExternalRequest(payload, channel, action, UUID, res, '');

});

app.get('/API/:channel/:action', permissions, apiCallsHandler);

app.post('/API/:channel/:action', permissions, apiCallsHandler);

function apiCallsHandler(req, res) {
  if (checkbadinput(req)) {
    let resperr = { 'error': "illeagal character found in request" };
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
  if (req.query) {
    Object.assign(payload, { queryParams: req.query });
  }

  if (req.headers) {
    Object.assign(payload, { headersParams: req.headers });
  }

  if (req.files && Object.keys(req.files).length > 0) {
    _.set(payload, 'files', req.files);
  }

  payload.token = JWToken;
  const action = req.params.action;
  const channel = req.params.channel;

  const url_parts = url.parse(req.url, true);
  const query = url_parts.query;
  logger.info({ fs: 'app.js', func: 'API' }, 'Handle Transaction on Cipher ' + action + ' ' + channel);
  payload = Object.assign(payload, { action: action, channel: channel, ipAddress: "::1", query });
  logger.info('calling handleExternalRequest ');
  const UUID = uuid();
  logger.info({ fs: 'app.js', func: 'API' }, 'UUID:  ' + UUID);
  logger.info({ fs: 'app.js', func: 'API' }, 'JWToken :  ' + JWToken);

  const decoded = crypto.decrypt(JWToken);
  logger.info({ fs: 'app.js', func: 'API' }, decoded, 'decoded.userID:');
  RestController.handleExternalRequest(payload, channel, action, UUID, res, decoded);
}


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
    let resperr = { 'error': "illeagal character found in request" }
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
