'use strict';
const consortium = require('../../../lib/services/consortium');
const logger = require('../../../lib/helpers/logger')().app;

function smartContractDeploy(payload, UUIDKey, route, callback, JWToken) {
  logger.debug(' [ Smart Contact Deployment ] Payload : ' + JSON.stringify(payload));
  payload.deployedBy = JWToken.userID;
  consortium.smartContractDeploy(payload)
    .then((response) => {
      response.consortiumDetail.data.message = {
        status: 'OK',
        errorDescription: 'Template Deployed Successfully',
        displayToUser: true
      }
      callback(response);
    }).catch((err) => {
      logger.debug(' [ Smart Contact Deployment ] Error : ' + err);
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'ERROR',
              errorDescription: 'Smartcontract not deployed',
              displayToUser: true
            },
            error: err
          }
        }
      };
      callback(response);
    });
}

exports.smartContractDeploy = smartContractDeploy;

