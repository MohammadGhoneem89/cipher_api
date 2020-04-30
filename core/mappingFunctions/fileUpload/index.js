'use strict';
const config = require('../../../config/index');
const sha512 = require('../../../lib/hash/sha512');
const mime = require('mime');
const { create, findDocument } = require('../../../lib/services/documents');

const Ipfs = require('./ipfs');
const ServerFS = require('./server-fs');

let upload = async function(payload, UUIDKey, route, callback, JWToken) {
  if (!payload.files || Object.keys(payload.files).length == 0) {
    const resp = {
      messageStatus: 'ERROR',
      cipherMessageId: UUIDKey,
      errorDescription: 'Please Attach a file.',
      errorCode: 201,
      timestamp: new Date()
    };
    return callback(resp);
  }

  if (payload.files && payload.files.file.length > 1) {
    const resp = {
      messageStatus: 'ERROR',
      cipherMessageId: UUIDKey,
      errorDescription: 'Please Attach only one file at a time.',
      errorCode: 201,
      timestamp: new Date()
    };
    return callback(resp);
  }

  let userID, fileReference, type, source;
  if (JWToken.userID) {
    userID = JWToken.userID;
  }
  if ((payload.queryParams && payload.queryParams['fileReference']) || payload.headersParams.fileReference) {
    fileReference = payload.queryParams.fileReference || payload.headersParams.fileReference;
  }
  if (payload.queryParams.source || payload.headersParams.source) {
    source = payload.queryParams.source || payload.headersParams.source;
  } else {
    source = 'API';
  }
  if (payload.queryParams.type || payload.headersParams.type) {
    type = payload.queryParams.type || payload.headersParams.type;
  } else {
    type = 'FILE';
  }

  const allowedExtensions = config.get('fileTypes');
  const fileName = payload.files.file.name;
  const fileExtension = fileName.split('.').pop();
  if (!allowedExtensions.includes(fileExtension.toUpperCase())) {
    const resp = {
      messageStatus: 'ERROR',
      cipherMessageId: UUIDKey,
      errorDescription: 'Please upload only following file types ' + allowedExtensions,
      errorCode: 201,
      timestamp: new Date()
    };
    return callback(resp);
  }

  let fsObject;
  switch (type) {
    case 'FILE':
      fsObject = new ServerFS();
      break;
    case 'IPFS':
      fsObject = new Ipfs();
      break;
    default:
      const resp = {
        messageStatus: 'ERROR',
        cipherMessageId: UUIDKey,
        errorDescription: '',
        errorCode: 201,
        timestamp: new Date()
      };
      resp.errorDescription = 'Invalid type kindly provide correct type';
      return callback(resp);
  }

  try {
    const fileHash = sha512(payload.files.file.data);

    const filePath = await fsObject.upload(payload.files.file, fileHash);

    create({
      path: filePath,
      ext: fileExtension.toUpperCase(),
      name: fileName,
      type: type,
      userId: JWToken._id,
      source: source,
      UUID: UUIDKey,
      hash: fileHash,
      context: '',
      contentType: payload.files.file.mimetype,
      fileReference: fileReference
    }).catch(err => {
      return callback(err);
    });

    const resp = {
      messageStatus: 'OK',
      cipherMessageId: UUIDKey,
      errorDescription: 'Processed OK!',
      errorCode: 200,
      timestamp: new Date(),
      name: fileName,
      type: type,
      hash: fileHash,
      path: filePath,
      downloadPath: `/API/core/download?type=${type}&path=${fileHash}`,
      fileReference: fileReference
    };
    return callback(resp);
  } catch (err) {
    return callback(err);
  }
};

let download = async function(payload, UUIDKey, route, callback, JWToken, res) {
  let resp = {
    messageStatus: 'ERROR',
    cipherMessageId: UUIDKey,
    errorDescription: '',
    errorCode: 201,
    timestamp: new Date()
  };

  if (!payload.queryParams.path) {
    resp.errorDescription = 'File reference Hash is required!';
    return callback(resp);
  }

  let userId;
  // if (JWToken.userID) {
  //   userId = JWToken._id;
  // } else {
  //   resp.errorDescription = "You don't have permission to download this file";
  //   return callback(resp);
  // }

  try {
    const document = await findDocument({
      hash: payload.queryParams.path || payload.headersParams.path
    });
    console.log(document);
    console.log(payload.queryParams.type);
    if (document) {
      const type = payload.queryParams.type;

      let fsObject;
      switch (type === 'IMAGE' ? document.type : type) {
        case 'FILE':
          fsObject = new ServerFS(type);
          break;
        case 'IPFS':
          fsObject = new Ipfs(type);
          break;
        default:
          resp.errorDescription = 'Invalid type kindly provide correct type';
          return callback(resp);
      }

      let result;
      try {
        result = await fsObject.download(document);
      } catch (err) {
        resp.errorDescription = 'There is no file found with provided hash please try another';
        return callback(resp);
      }

      if (type && type === 'IMAGE') {
        res.set({
          httpResponse: true,
          'Content-Type': document.contentType,
          'Content-Disposition': `filename=${document.name}`
        });
        if (document.type === 'FILE') {
          return res.sendFile(result);
        }
        return res.send(result);
      } else {
        res.set({
          httpResponse: true,
          'Content-Type': document.contentType,
          'Content-Disposition': `attachment; filename=${document.name}`
        });
        return result.pipe(res);
      }
    } else {
      resp.errorDescription = 'There is no file found with provided hash please try another';
      return callback(resp);
    }
  } catch (error) {
    return callback(error.stack);
  }
};


let uploadDocument = async function(payload, UUIDKey, route, callback, JWToken) {

 
 if (!(payload.body && payload.body.file && payload.body.file.value)) {
    const resp = {
      messageStatus: 'ERROR',
      cipherMessageId: UUIDKey,
      errorDescription: 'Please Attach a file.',
      errorCode: 201,
      timestamp: new Date()
    };
    return callback(resp);
  }

    let userID, fileReference, type, source;
  if (JWToken.userID) {
    userID = JWToken.userID;
  }
  if ((payload.queryParams && payload.queryParams['fileReference']) || payload.headersParams.fileReference) {
    fileReference = payload.queryParams.fileReference || payload.headersParams.fileReference;
  }
  if (payload.queryParams.source || payload.headersParams.source) {
    source = payload.queryParams.source || payload.headersParams.source;
  } else {
    source = 'API';
  }
  if (payload.body.type || payload.headersParams.type) {
    type = payload.queryParams.type || payload.headersParams.type;
  } else {
    type = 'FILE';
  }



  const allowedExtensions = config.get('fileTypes');
  const fileName = payload.body.file.options.filename;
  const fileExtension = fileName.split('.').pop();
  if (!allowedExtensions.includes(fileExtension.toUpperCase())) {
    const resp = {
      messageStatus: 'ERROR',
      cipherMessageId: UUIDKey,
      errorDescription: 'Please upload only following file types ' + allowedExtensions,
      errorCode: 201,
      timestamp: new Date()
    };
    return callback(resp);
  }

  type = 'FILE';

  let fsObject;
  switch (type) {
    case 'FILE':
      fsObject = new ServerFS();
      break;
    case 'IPFS':
      fsObject = new Ipfs();
      break;
    default:
      const resp = {
        messageStatus: 'ERROR',
        cipherMessageId: UUIDKey,
        errorDescription: '',
        errorCode: 201,
        timestamp: new Date()
      };
      resp.errorDescription = 'Invalid type kindly provide correct type';
      return callback(resp);
  }

  try {
    const fileHash = sha512(payload.body.file.value);

    const filePath = await fsObject.uploadDocument(payload.body.file.value,payload.body.file.options.filename, fileHash);


    create({
      path: filePath,
      ext: fileExtension.toUpperCase(),
      name: fileName,
      type: type,
      userId: JWToken._id,
      source: 'IPFS',
      UUID: UUIDKey,
      hash: fileHash,
      context: '',
      contentType: '',
      fileReference: fileReference
    }).catch(err => {
      return callback(err);
    });

    const resp = {
      messageStatus: 'OK',
      cipherMessageId: UUIDKey,
      errorDescription: 'Processed OK!',
      errorCode: 200,
      timestamp: new Date(),
      name: fileName,
      type: 'IPFS',
      hash: fileHash,
      path: filePath,
      fileReference: fileReference
    };
    return callback(resp);
  } catch (err) {
    return callback(err);
  }
}
let downloadDocument = async function(payload, UUIDKey, route, callback, JWToken, res) {
  let resp = {
    messageStatus: 'ERROR',
    cipherMessageId: UUIDKey,
    errorDescription: '',
    errorCode: 201,
    timestamp: new Date()
  };

  console.log('=========================' ,payload)

  if (!payload.queryParams.path) {
    resp.errorDescription = 'File reference Hash is required!';
    return callback(resp);
  }

  try {
    const document = await findDocument({
      hash: payload.queryParams.path || payload.headersParams.path
    });
    if (document) {
      const type = 'FILE';

      let fsObject;
      switch (type === 'IMAGE' ? document.type : type) {
        case 'FILE':
          fsObject = new ServerFS(type);
          break;
        case 'IPFS':
          fsObject = new Ipfs(type);
          break;
        default:
          resp.errorDescription = 'Invalid type kindly provide correct type';
          return callback(resp);
      }

      let result;
      try {
        result = await fsObject.download(document);
      } catch (err) {
        resp.errorDescription = 'There is no file found with provided hash please try another';
        return callback(resp);
      }

      if (type && type === 'IMAGE') {
        res.set({
          httpResponse: true,
          'Content-Type': document.contentType,
          'Content-Disposition': `filename=${document.name}`
        });
        if (document.type === 'FILE') {
          return res.sendFile(result);
        }
        return res.send(result);
      } else {
        res.set({
          httpResponse: true,
          'Content-Type': document.contentType,
          'Content-Disposition': `attachment; filename=${document.name}`
        });
        return result.pipe(res);
      }
    } else {
      resp.errorDescription = 'There is no file found with provided hash please try another';
      return callback(resp);
    }
  } catch (error) {
    return callback(error.stack);
  }
};

exports.upload = upload;
exports.download = download;
exports.uploadDocument = uploadDocument;
exports.downloadDocument = downloadDocument;
