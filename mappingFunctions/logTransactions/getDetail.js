
const logTransaction = require('../../lib/services/logTransaction');

function getBlockChainId(payload, UUIDKey, route, callback, JWToken) {
  payload.userID = JWToken._id;
  _getBlockChainId(payload, callback);
}

function _getBlockChainId(payload, callback) {
  logTransaction.getBlockChainId(payload)
    .then((logs) => {
      let response = {};
      response[payload.action] = {
        action: payload.action,
        data: logs
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

exports.getBlockChainId = getBlockChainId;
exports._getBlockChainId = _getBlockChainId;

