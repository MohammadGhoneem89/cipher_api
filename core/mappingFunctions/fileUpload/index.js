
'use strict';
const path = require('path');
const mime = require('mime');
const fs = require('fs');
const config = require('../../../config/index');
const sha512 = require('../../../lib/hash/sha512');
const { create } = require('../../../lib/services/documents');

let upload = async function (payload, UUIDKey, route, callback, JWToken) {
  function getExtension(filename) {
    return filename.split('.').pop();
  }

  let userID, fileReference, type, source;
  if (JWToken.userID) {
    userID = JWToken.userID;
  }
  if (payload.queryParams.fileReference || payload.headersParams.fileReference) {
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
  const basePath = config.get('basePath');

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
  const fileExtension = getExtension(fileName);
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
    const fileHash = sha512(fileName + new Date());
     let resp = {
      "messageStatus": "OK",
      "cipherMessageId": UUIDKey,
      "errorDescription": "Processed OK!",
      "errorCode": 200,
      "timestamp": new Date(),
      "name": fileName,
      "type": type,
      "hash": fileHash,
      "path": basePath + fileHash + '.' + fileExtension,
      "fileReference": fileReference
    };
     try {
       await payload.files.files.mv(path.normalize(basePath + '/' + fileHash + '.' + fileExtension));
       await create({
         "path": basePath + fileHash + '.' + fileExtension,
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
       throw new Error(e.stack)
     }
};

  let download = function (payload, UUIDKey, route, callback, JWToken, res) {

    if (!payload.queryParams.type && !payload.queryParams.path) {
      let resp = {
        "messageStatus": "ERROR",
        "cipherMessageId": UUIDKey,
        "errorDescription": "type and path is required!",
        "errorCode": 201,
        "timestamp": new Date()
      };
      return callback(resp);
    }

    let file = path.join(__dirname, 'mock.png');
    let filename = path.basename(file);
    let mimetype = mime.lookup(file);

    res.set({
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename=${filename}`
    });
    let filestream = fs.createReadStream(file);
    return filestream.pipe(res);
  };

  exports.upload = upload;
  exports.download = download;
