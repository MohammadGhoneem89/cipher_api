'use strict';

const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '../../public/pdf-sample-min.pdf')); // eslint-disable-line no-sync

module.exports = {
  getForCTS
};

function getForCTS(payload) {
  return Promise.resolve([{
    data: source.toString('base64'),
    filename: 'pdf-sample-min',
    format: 'pdf'
  }]);
}
