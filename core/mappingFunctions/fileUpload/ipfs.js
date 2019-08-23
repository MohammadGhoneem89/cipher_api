'use strict';
const ipfsClient = require('ipfs-http-client');
const config = require('../../../config/index');

class Ipfs {
  constructor(type) {
    this.ipfs = ipfsClient(config.get('ipfs.ip'), config.get('ipfs.port'), {
      protocol: config.get('ipfs.protocol')
    });
    this.type = type;
  }

  upload(file) {
    return this.ipfs.add(file.data).then((res, err) => {
      return res[0].hash;
    });
  }

  download(document) {
    return this.ipfs.cat(document.path).then((res, err) => {
      if (this.type && this.type === 'IMAGE') {
        return res; // for image type data buffer is returned directly
      }
      return this.ipfs.catReadableStream(document.path);
    });
  }
}

module.exports = Ipfs;
