'use strict';
const config = require('../../../config/index');
const sha512 = require('../../../lib/hash/sha512');
const { create, findDocument } = require('../../../lib/services/documents');
// const crypto = require('../')
const _ = require('lodash');
const Ipfs = require('./ipfs');
const ServerFS = require('./server-fs');
// const Database = require('./database');

let Readable = require('stream').Readable;


let upload = async function(payload, UUIDKey, route, callback, JWToken) {

  let fileSize = payload.headersParams['content-length']

  console.log("fileSize" , fileSize)

  if(fileSize > 2097152){
    const resp = {
      messageStatus: 'ERROR',
   //   cipherMessageId: UUIDKey,
      errorDescription: 'File size should not be more then 2MB',
      errorCode: 201,
      timestamp: new Date()
    };
    _.set(resp,config.get('responseMessageAttribute',"cipherMessageId"),UUIDKey)
    return callback(resp);
  }

  // console.log(payload);

  if (!payload.files || Object.keys(payload.files).length == 0) {
    const resp = {
      messageStatus: 'ERROR',
   // cipherMessageId: UUIDKey,
      errorDescription: 'Please Attach a file.',
      errorCode: 201,
      timestamp: new Date()
    };
    _.set(resp,config.get('responseMessageAttribute',"cipherMessageId"),UUIDKey)
    return callback(resp);
  }

  if (payload.files && payload.files.file.length > 1) {
    const resp = {
      messageStatus: 'ERROR',
     // cipherMessageId: UUIDKey,
      errorDescription: 'Please Attach only one file at a time.',
      errorCode: 201,
      timestamp: new Date()
    };
    _.set(resp,config.get('responseMessageAttribute',"cipherMessageId"),UUIDKey)
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
     //cipherMessageId: UUIDKey,
      errorDescription: 'Please upload only following file types ' + allowedExtensions,
      errorCode: 201,
      timestamp: new Date()
    };
    _.set(resp,config.get('responseMessageAttribute',"cipherMessageId"),UUIDKey)
    return callback(resp);
  }

  let fsObject;
  console.log("type is" , type);
  switch (type) {
    case 'FILE':
      fsObject = new ServerFS();
      break;
    case 'IPFS':
      fsObject = new Ipfs();
      break;
    // case 'DB':
    //   fsObject = new Database();
    break;
    default:
        const resp = {
          messageStatus: 'ERROR',
          //cipherMessageId: UUIDKey,
          errorDescription: '',
          errorCode: 201,
          timestamp: new Date()
        };

        _.set(resp,config.get('responseMessageAttribute',"cipherMessageId"),UUIDKey)
      resp.errorDescription = 'Invalid type kindly provide correct type';
      return callback(resp);
  }

  try {
    const fileHash = sha512(payload.files.file.data);


    let filePath = null;
    let  resp = {}
    switch (type) {
      case 'FILE':
         filePath = await fsObject.upload(payload.files.file, fileHash);


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
          fileReference: fileReference,
          policies: payload.policies || ''
        }).catch(err => {
          return callback(err);
        });
    
         resp = {
          messageStatus: 'OK',
        //  cipherMessageId: UUIDKey,
          errorDescription: 'Processed OK!',
          errorCode: 200,
          timestamp: new Date(),
          name: fileName,
          type: type,
          hash: fileHash,
          path: filePath,
          downloadPath: `/API/core/downloadEx?type=${type}&path=${fileHash}`,
          fileReference: fileReference
        };
    


        break;
      case 'IPFS':
         filePath = await fsObject.upload(payload.files.file, fileHash);


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
          fileReference: fileReference,
          policies: payload.policies || ''
        }).catch(err => {
          return callback(err);
        });
    
         resp = {
          messageStatus: 'OK',
         // cipherMessageId: UUIDKey,
          errorDescription: 'Processed OK!',
          errorCode: 200,
          timestamp: new Date(),
          name: fileName,
          type: type,
          hash: fileHash,
          path: filePath,
          downloadPath: `/API/core/downloadEx?type=${type}&path=${fileHash}`,
          fileReference: fileReference
        };
    


        break;
      case 'DB':

        let policies = payload.policies || '';
        let orgCode = JWToken.orgCode;
        let orgType = JWToken.orgType;

        if (orgType == "LAB") {
          policies = `${orgCode},MINISTRY,PUREHEALTH`
        }

      filePath = await fsObject.upload(
            payload.files.file.data, 
            fileHash,
            fileExtension.toUpperCase(),
            fileName, 
            type, 
            source, 
            UUIDKey,
            'context',
            payload.files.file.mimetype,
            fileReference,
            policies,
            orgCode
            );

            resp = {
              messageStatus: 'OK',
      //     cipherMessageId: UUIDKey,
              errorDescription: 'Processed OK!',
              errorCode: 200,
              timestamp: new Date(),
              name: fileName,
              type: type,
              hash: fileHash,
              path: filePath,
              downloadPath: `/API/core/downloadEx?type=${type}&path=${fileHash}`,
              fileReference: fileReference
            };
        

        break
    }

    _.set(resp,config.get('responseMessageAttribute',"cipherMessageId"),UUIDKey)

    return callback(resp);
  } catch (err) {
    return callback(err);
  }
};

let download = async function(payload, UUIDKey, route, callback, JWToken, res) {
  let resp = {
    messageStatus: 'ERROR',
  //cipherMessageId: UUIDKey,
    errorDescription: '',
    errorCode: 201,
    timestamp: new Date()
  };

  _.set(resp,config.get('responseMessageAttribute',"cipherMessageId"),UUIDKey)
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

    if(payload.queryParams.type == "DB"){
      try{
        let fsObject = new Database();
        let result = await fsObject.download(payload.queryParams.path)

      let { 
        fileContent,
        contentType,
        name
       } = result


       let { policies } = result, orgCode = JWToken.orgCode;
       if (policies && orgCode && !policies.toUpperCase().includes(orgCode.toUpperCase())) {
         resp.errorDescription = 'You are not authorized to download this file';
         return callback(resp);
       }

        res.set({
          'httpResponse': true,
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename=${name}`
        });
        let fileStream = new Readable();
        fileStream.push(fileContent);
        fileStream.push(null);
        return fileStream.pipe(res)

      }catch(err){
        console.log(err);
        resp.errorDescription = err;
        return callback(resp);
      }
    }


    const document = await findDocument({
      hash: payload.queryParams.path || payload.headersParams.path
    });
    if (document) {
      let { policies } = document, orgCode = JWToken.orgCode;
      if (policies && orgCode && !policies.includes(orgCode)) {
        resp.errorDescription = 'You are not authorized to download this file';
        return callback(resp);
      }

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

exports.upload = upload;
exports.download = download;
