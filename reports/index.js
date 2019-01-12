'use strict';

const fs = require('fs');
const config = require('../config/index');
const reportData = require('./getReport');
const path = require('path');
const dates = require('../lib/helpers/dates');
const images = require('./commonTemplates/images');
function renderReports(jsReport, payload, res, type = 'pdf') {
  let basePath = config.get('URLRestInterface');
  let body = '';
  let header = '';
  let headerContent = '';
  let bodyContent = '';
  let footer = '';
  let resData;

  //type = 'xlsx';
  let recipe = 'phantom-pdf';
  if (type === 'excel') {
    recipe = 'html-to-xlsx';
    basePath = '';
  }
  else if (type == 'csv') {
    recipe = 'text';
    basePath = '';
  }
  else if (type == 'xlsx') {
    recipe = 'xlsx';
    basePath = '';

  }

  reportData(payload)
    .then((data) => {
      resData = data;
      if (payload.nationalization.lang === 'ar') {
        headerContent = data.content.header;
        bodyContent = data.content.body_arabic;
      }
      else {
        headerContent = data.content.header;
        bodyContent = data.content.body;
      }
      return Promise.all([
        readHTMLTemplate(bodyContent, type),
        readHTMLTemplate(headerContent),
        readHTMLTemplate(data.content.footer)
      ]);
    })
    .then((res) => {
      body = res[0];
      header = res[1];
      footer = res[2];
      return jsReport.render({
        template: {
          content: body,
          engine: type == 'xlsx' ? 'handlebars' : 'jsrender',
          recipe: recipe,
          phantom: {
            format: 'A3',
            margin: { 'top': '1cm', 'left': '0cm', 'right': '0cm', 'bottom': '1cm' },
            header: header,
            headerHeight: '3cm',
            orientation: resData.content.orientation,
            footer: footer
          }
        },
        data: {
          currentDate: dates.humanizeDate(),
          searchResult: resData.couchData,
          basePath: basePath,
          criteria: resData.criteria,
          total: resData.total,
          totalTransactions: resData.totalTransactions,
          nationalization: payload.nationalization,
          images: images
        }
      });
    })
    .then((out) => {

      let ext = '.pdf';
      let contentType = out.headers['Content-Type'];
      if (type == 'xlsx') {
        ext = '.xlsx';
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
      else if (type == 'csv') {
        ext = '.csv'
        contentType = 'text/csv'
      }
      else if (type == 'pdf')
        ext = '.pdf'
      else if (type == 'excel')
        ext = '.xlsx'

      let filename = resData.content.exportTitle ? resData.content.exportTitle : 'report';
      filename = `${filename} ${dates.ddMMyyYY()}${ext}`;
      res.set({
        'Content-Type': contentType,
        'Content-Disposition': 'attachment; filename=' + filename
      });

      out.stream.pipe(res);
    })
    .catch((err) => {
      const error = err.stack || err;
      const errMsg = {
        loginResponse: {
          action: 'reports',
          data: {
            message: {
              status: 'ERROR',
              errorDescription: 'An error occurred while generating the report',
              routeTo: '',
              error: error,
              displayToUser: true
            },
            success: false
          }
        }
      };
      console.log('An error occurred while generating the report: ' + error);
      res.send(errMsg);
      return res.end();
    });
}

function readHTMLTemplate(filePath, type = 'pdf') {


  if (type == 'xlsx' || type == 'csv' ) {
    let filePathArray = filePath.match(/[^\.]+/);
    filePath = filePathArray[0] + "_excel" + '.html';
  }
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(global.appDir, filePath), function (err, html) {
      if (err) {
        reject(err);
      }
      else {
        resolve(html.toString());
      }
    });
  });
}

module.exports = renderReports;
