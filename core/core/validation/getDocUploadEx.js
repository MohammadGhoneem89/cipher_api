let logger = require('../../lib/helpers/logger')().app;
let fs = require('fs');

let getDocUploadEx = function (UUID, res, getUpload_CB) {

  let response = {
    "status": "ERROR",
    "message": "Download file failed"
  };

  logger.debug({ fs: 'getUpload.js', func: 'getUpload' }, " [ Get Upload ] UUID : " + UUID);

  global.db.select("Documents", {
    "UUID": UUID
  }, "", function (err, data) {
    if (err) {
      logger.error({ fs: 'getUpload.js', func: 'getUpload' }, " [ Get Upload ] ERROR : " + err);
      getUpload_CB(response);
    }
    else if (data.length === 0) {
      logger.error({ fs: 'getUpload.js', func: 'getUpload' }, " [ Get Upload ] Data is Empty : " + data.length);
      getUpload_CB(response);
    }
    else {
      data = data[0];
      fs.exists(data["path"], function (exists) {
        if (exists) {
          res.download(data["path"], data["name"]);
        }
        else {
          res.send(response);
          res.end();
        }
      });
    }
  });
};

module.exports = getDocUploadEx;
