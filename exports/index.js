'use strict';

const fs = require('fs');
const exportConfig = require('./exportConfig.json');
const functionPath = require('./query/functionPath.json');
const config = require('../config');
const moment = require('moment');
const currentDate = moment().format('MMMM Do YYYY, h:mm:ss a');
const images = require('./commonTemplates/images');

function renderExport(type, gridType, query, jsReport, JWToken, res) {
  let basePath = config.get('URLRestInterface');
  let body = '';
  let header = '';
  let footer = '';
  let resData;

  const func = require(functionPath[gridType]);
  let recipe = 'chrome-pdf';
  if (type === 'excel') {
    recipe = 'html-to-xlsx';
    basePath = '';
  }
  if (type === 'XML') {
    recipe = 'text';
  }

  func(query, JWToken)
    .then((data) => {
      resData = data || [];
      return Promise.all([
        readHTMLTemplate(exportConfig.exportConfiguration[gridType].body),
        readHTMLTemplate(exportConfig.exportConfiguration[gridType].header),
        readHTMLTemplate(exportConfig.exportConfiguration[gridType].footer)
      ]);
    })
    .then((res) => {
      body = res[0];
      header = res[1];
      footer = res[2];
      return jsReport.render({
        template: {
          content: body,
          engine: 'jsrender',
          recipe: recipe,
          phantom: {
            format: exportConfig.exportConfiguration[gridType].pageType ? exportConfig.exportConfiguration[gridType].pageType : 'A3',
            margin: exportConfig.exportConfiguration[gridType].margin ? exportConfig.exportConfiguration[gridType].margin : { 'top': '1cm', 'left': '0cm', 'right': '0cm', 'bottom': '1cm' },
            header: header,
            headerHeight: (header !== '') ? '3cm' : '0cm',
            orientation: exportConfig.exportConfiguration[gridType].orientation,
            footer: footer
          }
        },
        data: { searchResult: resData, basePath: basePath, currentDate: currentDate, images: images }
      });
    })
    .then((out) => {
      let ext = '.pdf';
      if (type === 'excel') {
        ext = '.xlsx';
      }
      if (type === 'XML') {
        ext = '.xml';
      }
      const filename = exportConfig.exportConfiguration[gridType].exportTitle + ext;
      res.set({
        'Content-Type': out.headers['Content-Type'],
        'Content-Disposition': 'attachment; filename=' + filename
      });
      out.stream.pipe(res);
    })
    .catch((err) => {
      err = err.stack || err || 'Something has went wrong, please contact admin.';
      res.send(err);
      res.end();
    });
}

function readHTMLTemplate(filePath) {
  return new Promise((resolve, reject) => {
    if (filePath === '') {
      resolve('');
    }
    fs.readFile(filePath, function(err, html) {
      if (err) {
        reject(err);
      }
      else {
        resolve(html.toString());
      }
    });
  });
}

module.exports = renderExport;
