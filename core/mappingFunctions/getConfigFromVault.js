const config = require('../../config');


async function getConfig(payload, UUIDKey, route, callback, JWToken) {
    let configuration = config.get(payload.body.key);
    callback({
      getChannelConfig: {
        error: false,
        message: "Channel List",
        response: configuration
      }
    })
  
  }


  exports.getConfig = getConfig;