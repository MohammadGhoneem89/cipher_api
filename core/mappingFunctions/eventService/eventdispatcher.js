const eventDispatcher = require('../../../lib/repositories/eventDispatcher');

function getEventDispatcher(payload, UUIDKey, route, callback, JWToken) {
  eventDispatcher.findPageAndCount(payload).then((data) => {
    callback(data);
  }).catch((err) => {
    callback(err)
  })
}


function getEventDispatcherList(payload, UUIDKey, route, callback, JWToken) {
  eventDispatcher.getList().then((data) => {
    callback(data);
  }).catch((err) => {
    callback(err)
  })
}

function getEventDispatcherByID(payload, UUIDKey, route, callback, JWToken) {
  eventDispatcher.findById(payload).then((data) => {
    callback(data);
  }).catch((err) => {
    callback(err)
  })
}

function upsertEventDispatcher(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;
  if (payload.dispatcherName) {
    eventDispatcher.update({dispatcherName: payload.dispatcherName}, payload).then((data) => {
      let response = {
        msg: data
      }
      callback(response);
    }).catch((err) => {
      let response = {
        msg: "errornous insert" + err
      }
      callback(response);
    })
  } else {
    let response = {
      msg: "dispatcherName is required"
    };
    callback(response);
  }
}

exports.getEventDispatcherList = getEventDispatcherList;
exports.getEventDispatcher = getEventDispatcher;
exports.getEventDispatcherByID = getEventDispatcherByID;
exports.upsertEventDispatcher = upsertEventDispatcher;