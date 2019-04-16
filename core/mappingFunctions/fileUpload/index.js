
'use strict';
const path = require('path');
const mime = require('mime');
const fs = require('fs');

let upload = function (payload, UUIDKey, route, callback, JWToken) {

  if (!payload.files || Object.keys(payload.files).length == 0) {

    let resp = {
      "messageStatus": "ERROR",
      "cipherMessageId": UUIDKey,
      "errorDescription": "Please Attach files",
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
    "name": "mock.jpg",
    "type": "IPFS",
    "hash": "b933d03e1b877de6128ad78ab5f9658",
    "path": "/ipfs/ b933d03e1b877de6128ad78ab5f9658 b933d03e1b877de6128ad78ab5f9658",
    "fileReference": "XXXXXXXX-1233-MY-Token"
  };
  return callback(resp);
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
  };

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