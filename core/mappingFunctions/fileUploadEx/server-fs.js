'use strict';
const path = require('path');
const fs = require('fs');
const mime = require('mime');
const config = require('../../../config/index');

class ServerFS {
  constructor(type) {
    this.type = type;
  }

  upload(file, fileHash) {
    const today = new Date();
    // const dirName = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const basePath = String(config.get('basePath'));
    // const completeBasePath = path.normalize(path.join(basePath, dirName));
    const completeBasePath = path.normalize(path.join(basePath));
    !fs.existsSync(completeBasePath) ? fs.mkdirSync(completeBasePath, {
      mode: 777,
      recursive: true
    }) : null;
    const completePath = path.normalize(path.join(completeBasePath, fileHash + '.' + file.name.split('.').pop()));
    file.mv(completePath);
    return completePath;
  }
  uploadDocument(file, filename, fileHash) {
    const today = new Date();
    const dirName = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const basePath = String(config.get('basePath'));
    const completeBasePath = path.normalize(path.join(basePath, dirName));
    !fs.existsSync(completeBasePath) ? fs.mkdirSync(completeBasePath, {
      mode: 777,
      recursive: true
    }) : null;
    const completePath = path.normalize(path.join(completeBasePath, fileHash + '.' + filename.split('.').pop()));

    //let buff = new Buffer(file, 'base64');
    //fs.writeFileSync(completePath, file,'base64');

    var matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      response = {};

    if (matches.length !== 3) {
      return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    var decodedImg = response;
    var imageBuffer = decodedImg.data;
    fs.writeFileSync(completePath, imageBuffer, 'utf8');
    return completePath;
  }

  download(document) {
    if (fs.existsSync(path.normalize(document.path))) {
      const file = path.normalize(document.path);
      if (this.type && this.type === 'IMAGE') {
        return path.resolve(file);
      }
      return fs.createReadStream(file);
    }
    throw new Error();
  }
}

module.exports = ServerFS;