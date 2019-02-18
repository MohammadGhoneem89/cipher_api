let log4js = require('log4js');
let logger = log4js.getLogger('CipherRESTInterface');

let message = require("./errorMessage");

let permissionCheck = function (UserID, URI, permissionCheckCB) {

  logger.debug(" [ Permission Check ] req user ID : " + UserID);

  let response = {
    "message": "",
    "success": "ERROR"
  };

  global.db.select("User", {
    "UserID": UserID
  }, "", function (err, userData) {
    if (err) {
      logger.debug(" [ Permission Check ] user data ERROR : " + err);
      response["message"] = message.raise(meossage.errorType.Error, message.errorReasons.user_error, "", true);
      permissionCheckCB(response);
    }
    else if (userData.length === 0) {
      logger.debug(" [ Permission Check ] User data is empty : " + userData.length);
      response["message"] = message.raise(message.errorType.Error, message.errorReasons.user_data_error, "", true);
      permissionCheckCB(response);
    }
    else {
      userData = userData[0];

      let groups = userData["UserGroups"];

      global.db.select("UserGroup", {
        id: {
          $in: groups
        },
        Permissions: {
          $elemMatch: {
            pages: {
              $elemMatch: {
                URL: URI
              }
            }
          }
        }
      }, "", function (err, groupData) {
        if (err) {
          logger.debug(" [ Permission Check ] group data ERROR : " + err);
          response["message"] = message.raise(message.errorType.Error, message.errorReasons.group_error, "", true);
          permissionCheckCB(response);
        }
        else if (groupData.length === 0) {
          logger.debug(" [ Permission Check ] group data is empty  : " + groupData.length);
          response["message"] = message.raise(message.errorType.Error, message.errorReasons.group_data_error, "", true);
          permissionCheckCB(response);
        }
        else {
          response["message"] = message.raise(message.errorType.ok, message.errorReasons.permission_granted, "", true);
          response["success"] = true;
          permissionCheckCB(response);
        }
      });
    }
  });
};

module.exports = permissionCheck;
