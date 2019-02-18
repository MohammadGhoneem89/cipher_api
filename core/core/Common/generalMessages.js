'use strict';

function createInvokeRequest(tranCode, userId, org, UUID, timeStamp, responseMQ, fcnName, args) {
  return {
    'Header': {
      'tranType': '0200',
      'tranCode': tranCode,
      'userID': userId,
      'org': org,
      'UUID': UUID,
      'timeStamp': timeStamp,
      'ResponseMQ': responseMQ
    },
    'BCData': {
      'configType': 'peerInvoke'
    },
    'Body': {
      'fcnName': fcnName,
      'arguments': args
    }
  };
}

exports.createInvokeRequest = createInvokeRequest;
