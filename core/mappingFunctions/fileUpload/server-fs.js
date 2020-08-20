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
    // const dirName = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const basePath = String(config.get('basePath'));
    // const completeBasePath = path.normalize(path.join(basePath, dirName));
    const completeBasePath = path.normalize(basePath);

    !fs.existsSync(completeBasePath) ? fs.mkdirSync(completeBasePath, {
      mode: 777,
      recursive: true
    }) : null;
    const completePath = path.normalize(path.join(completeBasePath, fileHash + '.' + filename.split('.').pop()));


    const getMimeType = (type) => {
      switch (type.toUpperCase()) {
        case 'PDF':
          return "data:application/pdf;"
          break;
        case 'BMP':
          return "data:image/bmp;"
          break;
        case 'JPEG':
          return "data:image/jpeg;"
          break;
        case 'TIF':
          return "data:image/tiff;"
          break;
        case 'TIFF':
          return "data:image/tiff;"
          break;
        case 'PNG':
          return "data:image/png;"
          break;
        case 'JPG':
          return "data:image/jpg;"
          break;
        default:
          return null
          break;
      }
    }
    let [ nameOfFile , extOfFile ] = filename.split('.');

   let mimeType =  getMimeType(extOfFile);

    if (!mimeType) {
      throw new Error('Cannot upload this file type, please upload file with valid extension');
    }

    console.log("Mine Type selected is" , mimeType);


    var matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

    if (!matches) {
      let baseMatches = matches = file.match(/base64,(.+)$/)
      if (!baseMatches) {
        file = mimeType + "base64,"+ file;
      } else {
        file = mimeType + file;
      }
      matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    }

    if (matches.length !== 3) {
      throw new Error('Invalid input string');
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