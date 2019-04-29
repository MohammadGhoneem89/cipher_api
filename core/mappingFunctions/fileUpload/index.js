
'use strict';
const path = require('path');
const mime = require('mime');
const fs = require('fs');
const config = require('../../../config/index');
const sha512 = require('../../../lib/hash/sha512');
const { create, findDocument } = require('../../../lib/services/documents');

let upload = async function (payload, UUIDKey, route, callback, JWToken) {
  const today = new Date();
  const dirName = `${today.getFullYear()}-${today.getMonth() +1}-${today.getDate()}`;

  function getExtension(filename) {
    return filename.split('.').pop();
  }

  let userID, fileReference, type, source;
  if (JWToken.userID) {
    userID = JWToken.userID;
  }
  if (payload.queryParams && payload.queryParams['fileReference'] || payload.headersParams.fileReference) {
    fileReference = payload.queryParams.fileReference || payload.headersParams.fileReference;
  }
  if (payload.queryParams.source || payload.headersParams.source) {
    source = payload.queryParams.source || payload.headersParams.source;
  } else {
    source = 'API'
  }
  if (payload.queryParams.type || payload.headersParams.type) {
    type = payload.queryParams.type || payload.headersParams.type;
  } else {
    type = 'FILE'
  }

  const allowedExtensions = config.get('fileTypes');
  let basePath = config.get('basePath');
  basePath = String(basePath);

  if (!payload.files || Object.keys(payload.files).length == 0) {
    let resp = {
      "messageStatus": "ERROR",
      "cipherMessageId": UUIDKey,
      "errorDescription": "Please Attach a file.",
      "errorCode": 201,
      "timestamp": new Date()
    };
    return callback(resp);
  }
  if (payload.files && payload.files.files.length > 1) {
    let resp = {
      "messageStatus": "ERROR",
      "cipherMessageId": UUIDKey,
      "errorDescription": "Please Attach only one file at a time.",
      "errorCode": 201,
      "timestamp": new Date()
    };
    return callback(resp);
  }
  const fileName = payload.files.files.name;
  const fileHash = sha512(fileName + new Date());

  const fileExtension = getExtension(fileName);
  let completeBasePath = path.normalize(path.join('.', basePath, dirName));
  let completeFileName = path.normalize(path.join(completeBasePath,  fileHash + '.' + fileExtension));

  if (!allowedExtensions.includes(fileExtension.toUpperCase())) {
       let resp = {
        "messageStatus": "ERROR",
        "cipherMessageId": UUIDKey,
        "errorDescription": "Please upload only following file types " + allowedExtensions,
        "errorCode": 201,
        "timestamp": new Date()
      };
      return callback(resp);
    }
     let resp = {
      "messageStatus": "OK",
      "cipherMessageId": UUIDKey,
      "errorDescription": "Processed OK!",
      "errorCode": 200,
      "timestamp": new Date(),
      "name": fileName,
      "type": type,
      "hash": fileHash,
      "path": completeFileName,
      "fileReference": fileReference
    };
     try {
       !fs.existsSync(completeBasePath) ?
         fs.mkdirSync(completeBasePath, {mode: 777, recursive: true}):
         null;
       await payload.files.files.mv(completeFileName);
       await create({
         "path": completeFileName,
         "ext": fileExtension.toUpperCase(),
         "name": fileName,
         "type": type,
         "userId": JWToken._id,
         "source": source,
         "UUID": UUIDKey,
         "hash": fileHash,
         "context": "",
         "contentType": payload.files.files.mimetype,
         "fileReference": fileReference
       }).catch(err => {
         callback(err);
       });
       return callback(resp);
     } catch (e) {
       return callback(e);
     }
};

  let download = async function (payload, UUIDKey, route, callback, JWToken, res) {
    let resp = {
      "messageStatus": "ERROR",
      "cipherMessageId": UUIDKey,
      "errorDescription": "",
      "errorCode": 201,
      "timestamp": new Date()
    };
    if (!payload.queryParams.path) {
      resp.errorDescription = `File reference Hash is required!`;
      return callback(resp);
    }
    let userId;
    // if (JWToken.userID) {
    //   userId = JWToken._id;
    // } else {
    //   resp.errorDescription = `You don't have permission to download this file`;
    //   return callback(resp);
    // }
    try {
      let document = await findDocument({
        hash: payload.queryParams.path || payload.headersParams.path
      });
      if (document) {
        if (fs.existsSync(path.normalize(document.path))) {
          let file = path.normalize(document.path);
          let mimeType = mime.lookup(file);

          res.set({
            'httpResponse': true,
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename=${document.name}`
          });
          let fileStream = await fs.createReadStream(file);
          return fileStream.pipe(res);
        } else {
          resp.errorDescription = `There is no file found with provided hash please try another`;
          callback(resp);
        }
      } else {
        resp.errorDescription = `There is no file found with provided hash please try another`;
        callback(resp);
      }
    } catch (error) {
      callback(error.stack);
    }
  };

  exports.upload = upload;
  exports.download = download;
