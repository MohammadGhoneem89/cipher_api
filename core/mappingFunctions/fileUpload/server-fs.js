'use strict';
const path = require('path');
const fs = require('fs');
const config = require('../../../config/index');

class ServerFS {
  constructor(type) {
    this.type = type;
  }

  upload(file, fileHash) {
    const today = new Date();
    const dirName = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const basePath = String(config.get('basePath'));
    const completeBasePath = path.normalize(path.join(basePath, dirName));
    !fs.existsSync(completeBasePath) ? fs.mkdirSync(completeBasePath, { mode: 777, recursive: true }) : null;
    const completePath = path.normalize(path.join(completeBasePath, fileHash + '.' + file.name.split('.').pop()));
    file.mv(completePath);
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
