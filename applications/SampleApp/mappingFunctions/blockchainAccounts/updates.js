const blockchainAccountServices = require('../../lib/services').blockchainAccount;
const logger = require('../../../../lib/helpers/logger')().app;
const config = require('../../../../config/index');
const crypto = require('../../../../lib/helpers/crypto');


function UpdateAccountList(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  _get(payload, callback);
}

async function _get(payload, callback) {
  logger.debug(' [ Blockchain Account List ] Payload : ' + JSON.stringify(payload));
  try {
    let amqp = crypto.decrypt(config.get('amqp.url'));
    let result = await blockchainAccountServices.upsertAccount({amqp}, payload);
    const response = {
      responseMessage: {
        action: "updateAccountList",
        data: {
          result,
          message: {
            status: "OK",
            errorDescription: "Account Updated Successfully",
            displayToUser: true
          }
        }
      }
    };
    callback(response);
  }
  catch (e) {
    console.log(e);
    //   logger.error(' [ Consortium Details ] Error : ' + err);
    const response = {
      responseMessage: {
        action: "updateAccountList",
        data: {
          error: e,
          message: {
            status: "ERROR",
            errorDescription: "Account not Updated",
            displayToUser: true
          }
        }
      }
    };
    callback(response);
  }
}

exports.UpdateAccountList = UpdateAccountList;
