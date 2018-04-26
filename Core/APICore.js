'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('APICore');
var config = require('../config.json');
var helper = require('../IntegrationLayer/helper.js');
var channels = require('../IntegrationLayer/create-channel.js');
var join = require('../IntegrationLayer/join-channel.js');
var install = require('../IntegrationLayer/install-chaincode.js');
var instantiate = require('../IntegrationLayer/instantiate-chaincode.js');
var invoke = require('../IntegrationLayer/invoke-transaction.js');
var query = require('../IntegrationLayer/query.js');

var getErrorMessage = function (field) {
  var response = {
    success: false,
    message: field + ' field is missing or Invalid in the request'
  };
  return response;
}

var getChannels = function (Responsecallback, GRPCCallback, trnxPayLoad) {

  logger.debug('================ GET CHANNELS ======================');
  logger.debug('peer: ' + peerName);
  var username = trnxPayLoad.Header.UserID;
  var orgname = trnxPayLoad.Header.Org;
  var peer = trnxPayLoad.Body.peerID;
  var error = '';
  if (!peer) {
    error += '\'peer\' ';
  }

  if (!username) {
    error += '\'username\' ';
  }

  if (!orgname) {
    error += '\'orgname\' ';
  }

  if (error !== '') {
    var result = getErrorMessage(error);
    Responsecallback(trnxPayLoad, result, GRPCCallback);
    return false;
  }
  query.getChannels(peer, username, orgname)
    .then(function (message) {
      Responsecallback(trnxPayLoad, message, GRPCCallback);
    });

}

var getInstalledChaincodes = function (Responsecallback, GRPCCallback, trnxPayLoad) {
  var username = trnxPayLoad.Header.UserID;
  var orgname = trnxPayLoad.Header.Org;
  var peer = trnxPayLoad.Body.peerID;
  var installType = trnxPayLoad.Body.queryType;
  var error = '';
  if (installType === 'installed') {
    logger.debug('================ GET INSTALLED CHAINCODES ======================');
  } else {
    logger.debug('================ GET INSTANTIATED CHAINCODES ======================');
  }

  if (!installType) {
    error += '\'installType\' ';
  }
  if (!peer) {
    error += '\'peer\' ';
  }
  if (!username) {
    error += '\'username\' ';
  }

  if (!orgname) {
    error += '\'orgname\' ';
  }
  if (error !== '') {
    var result = getErrorMessage(error);
    Responsecallback(trnxPayLoad, result, GRPCCallback);
    return false;
  }
  query.getInstalledChaincodes(peer, installType, username, orgname)
    .then(function (message) {
      Responsecallback(trnxPayLoad, message, GRPCCallback);
    });
}

var getChainInfo = function (Responsecallback, GRPCCallback, trnxPayLoad) {

  logger.debug('================ GET CHANNEL INFORMATION ======================');
  logger.debug('channelName : ' + req.params.channelName);
  var username = trnxPayLoad.Header.UserID;
  var orgname = trnxPayLoad.Header.Org;
  let peer = trnxPayLoad.Body.peerID;

  var error = '';
  if (!peer) {
    error += '\'peer\' ';
  }

  if (!username) {
    error += '\'orgname\' ';
  }

  if (!orgname) {
    error += '\'orgname\' ';
  }

  if (error !== '') {
    var result = getErrorMessage(error);
    Responsecallback(trnxPayLoad, result, GRPCCallback);
    return false;
  }
  query.getChainInfo(peer, username, orgname).then(
    function (message) {
      Responsecallback(trnxPayLoad, message, GRPCCallback);
    });
}

var getBlockByHash = function (Responsecallback, GRPCCallback, trnxPayLoad) {

  logger.debug('================ GET BLOCK BY HASH ======================');
  logger.debug('channelName : ' + req.params.channelName);
  var username = trnxPayLoad.Header.UserID;
  var orgname = trnxPayLoad.Header.Org;
  let hash = trnxPayLoad.Body.hashstring;
  let peer = trnxPayLoad.Body.peerID;
  var error = '';
  if (!hash) {
    error += '\'hash\' ';
  }
  if (!peer) {
    error += '\'Peer ID\' ';
  }
  if (!username) {
    error += '\'username\' ';
  }

  if (!orgname) {
    error += '\'orgname\' ';
  }

  if (error !== '') {
    var result = getErrorMessage(error);
    Responsecallback(trnxPayLoad, result, GRPCCallback);
    return false;
  }

  query.getBlockByHash(peer, hash, username, orgname).then(
    function (message) {
      Responsecallback(trnxPayLoad, message, GRPCCallback);
    });
}

var getTransactionByID = function (Responsecallback, GRPCCallback, trnxPayLoad) {

  logger.debug('================ GET TRANSACTION BY TRANSACTION_ID ======================');
  var username = trnxPayLoad.Header.UserID;
  var orgname = trnxPayLoad.Header.Org;
  let trxnId = trnxPayLoad.Body.txID;
  let peer = trnxPayLoad.Body.peerID;
  var error = '';
  if (!trxnId) {
    error += '\'trxnId\' ';
  }
  if (!peer) {
    error += '\'Peer ID \' ';
  }
  if (!username) {
    error += '\'username\' ';
  }

  if (!orgname) {
    error += '\'orgname\' ';
  }

  if (error !== '') {
    var result = getErrorMessage(error);
    Responsecallback(trnxPayLoad, result, GRPCCallback);
    return false;
  }

  query.getTransactionByID(peer, trxnId, username, orgname)
    .then(function (message) {
      Responsecallback(trnxPayLoad, message, GRPCCallback);
    });
}

var getBlockByNumber = function (Responsecallback, GRPCCallback, trnxPayLoad) {

  logger.debug('==================== GET BLOCK BY NUMBER ==================');
  var username = trnxPayLoad.Header.UserID;
  var orgname = trnxPayLoad.Header.Org;
  let blockId = trnxPayLoad.Body.blkID;
  let peer = trnxPayLoad.Body.peerID;
  logger.debug('channelName : ' + cName);
  logger.debug('BlockID : ' + blockId);
  logger.debug('Peer : ' + peer);
  var error = '';
  if (!blockId) {
    error += '\'blockId\' ';
  }
  if (!peer) {
    error += '\'peer\' ';
  }
  if (!username) {
    error += '\'username\' ';
  }
  if (!orgname) {
    error += '\'orgname\' ';
  }

  if (error !== '') {
    var result = getErrorMessage(error);
    Responsecallback(trnxPayLoad, result, GRPCCallback);
    return false;
  }

  query.getBlockByNumber(peer, blockId, username, orgname)
    .then(function (message) {
      Responsecallback(trnxPayLoad, message, GRPCCallback);
    });
}

var queryChaincode = function (Responsecallback, GRPCCallback, trnxPayLoad) {

  logger.debug('==================== QUERY BY CHAINCODE ==================');
  var username = trnxPayLoad.Header.UserID;
  var orgname = trnxPayLoad.Header.Org;
  var channelName = trnxPayLoad.Body.channelName;
  var chaincodeName = trnxPayLoad.Body.SmartContractName;
  let args = trnxPayLoad.Body.arguments;
  let fcn = trnxPayLoad.Body.fcnName;
  let peer = trnxPayLoad.Body.peerListQuery;

  logger.debug('channelName : ' + channelName);
  logger.debug('chaincodeName : ' + chaincodeName);
  logger.debug('fcn : ' + fcn);
  logger.debug('args : ' + args);
  var error = '';
  if (!chaincodeName) {
    error += '\'chaincodeName\' ';
  }
  if (!channelName) {
    error += '\'channelName\' ';
  }
  if (!fcn) {
    error += '\'fcn\' ';
  }
  if (!args) {
    error += '\'args\' ';
  }
  if (!username) {
    error += '\'username\' ';
  }

  if (!orgname) {
    error += '\'orgname\' ';
  }

  if (error !== '') {
    var result = getErrorMessage(error);
    Responsecallback(trnxPayLoad, result, GRPCCallback);
    return false;
  }

  //args = args.replace(/'/g, '"');
  //args = JSON.parse(args);
  //logger.debug(args);

  query.queryChaincode(peer, channelName, chaincodeName, args, fcn, username, orgname)
    .then(function (message) {
      Responsecallback(trnxPayLoad, message, GRPCCallback);
    });


}

var invokeChaincode = function (Responsecallback, GRPCCallback, trnxPayLoad) {

  logger.debug('==================== INVOKE ON CHAINCODE ==================');
  var username = trnxPayLoad.Header.UserID;
  var orgname = trnxPayLoad.Header.Org;
  var peers = trnxPayLoad.Body.peerListInvoke;
  var chaincodeName = trnxPayLoad.Body.SmartContractName;
  var channelName = trnxPayLoad.Body.channelName;
  var fcn = trnxPayLoad.Body.fcnName;
  var args = trnxPayLoad.Body.arguments;
  logger.debug('channelName  : ' + channelName);
  logger.debug('chaincodeName : ' + chaincodeName);
  logger.debug('fcn  : ' + fcn);
  logger.debug('args  : ' + args);
  var error = '';
  if (!peers || peers.length == 0) {
    error += '\'peers\' ';
  }
  if (!chaincodeName) {
    error += '\'chaincodeName\' ';
  }
  if (!channelName) {
    error += '\'channelName\' ';
  }
  if (!fcn) {
    error += '\'fcn\' ';
  }
  if (!args) {
    error += '\'args\' ';
  }
  if (!username) {
    error += '\'username\' ';
  }

  if (!orgname) {
    error += '\'orgname\' ';
  }


  if (error !== '') {
    var result = getErrorMessage(error);
    Responsecallback(trnxPayLoad, result, GRPCCallback);
    return false;
  }

  invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, username, orgname)
    .then(function (message) {
      Responsecallback(trnxPayLoad, message, GRPCCallback);
    });
}

var instantiateChaincode = function (Responsecallback, GRPCCallback, trnxPayLoad) {

  logger.debug('==================== INSTANTIATE CHAINCODE ==================');
  var username = trnxPayLoad.Header.UserID;
  var orgname = trnxPayLoad.Header.Org;
  var chaincodeName = trnxPayLoad.Body.SmartContractName;
  var chaincodeVersion = trnxPayLoad.Body.SmartContractVersion;
  var channelName = trnxPayLoad.Body.channelName;
  var functionName = trnxPayLoad.Body.fcnName;
  var args = trnxPayLoad.Body.arguments;
  logger.debug('channelName  : ' + channelName);
  logger.debug('chaincodeName : ' + chaincodeName);
  logger.debug('chaincodeVersion  : ' + chaincodeVersion);
  logger.debug('functionName  : ' + functionName);
  logger.debug('args  : ' + args);
  var error = '';
  if (!chaincodeName) {
    error += '\'chaincodeName\' ';
  }
  if (!chaincodeVersion) {
    error += '\'chaincodeVersion\' ';
  }
  if (!channelName) {
    error += '\'channelName\' ';
  }
  if (!functionName) {
    error += '\'functionName\' ';
  }
  if (!args) {
    error += '\'args\' ';
  }
  if (!username) {
    error += '\'username\' ';
  }

  if (!orgname) {
    error += '\'orgname\' ';
  }

  if (error !== '') {
    var result = getErrorMessage(error);
    Responsecallback(trnxPayLoad, result, GRPCCallback);
    return false;
  }

  instantiate.instantiateChaincode(channelName, chaincodeName, chaincodeVersion, functionName, args, username, orgname)
    .then(function (message) {
      Responsecallback(trnxPayLoad, message, GRPCCallback);
    });


}

var installChaincode = function (Responsecallback, GRPCCallback, trnxPayLoad) {

  logger.debug('==================== INSTALL CHAINCODE ==================');
  var username = trnxPayLoad.Header.UserID;
  var orgname = trnxPayLoad.Header.Org;
  var peers = trnxPayLoad.Body.peerListInstallSC;
  var chaincodeName = trnxPayLoad.Body.SmartContractName;
  var chaincodePath = trnxPayLoad.Body.SmartContractPath;
  var chaincodeVersion = trnxPayLoad.Body.SmartContractVersion;

  logger.debug('peers : ' + peers); // target peers list
  logger.debug('chaincodeName : ' + chaincodeName);
  logger.debug('chaincodePath  : ' + chaincodePath);
  logger.debug('chaincodeVersion  : ' + chaincodeVersion);

  var error = '';
  if (!peers || peers.length == 0) {
    error += '\'Peer List\' ';
  }
  if (!chaincodeName) {
    error += '\'chaincodeName\' ';
  }
  if (!chaincodePath) {
    error += '\'chaincodePath\' ';
  }
  if (!chaincodeVersion) {
    error += '\'chaincodeVersion\' ';
  }
  if (!username) {
    error += '\'username\' ';
  }

  if (!orgname) {
    error += '\'orgname\' ';
  }

  if (error !== '') {
    var result = getErrorMessage(error);
    Responsecallback(trnxPayLoad, result, GRPCCallback);
    return false;
  }

  install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, username, orgname)
    .then(function (message) {
      Responsecallback(trnxPayLoad, message, GRPCCallback);
    });
}

var joinChannel = function (Responsecallback, GRPCCallback, trnxPayLoad) {

  logger.info('<<<<<<<<<<<<<<<<< J O I N  C H A N N E L >>>>>>>>>>>>>>>>>');
  var username = trnxPayLoad.Header.UserID;
  var orgname = trnxPayLoad.Header.Org;
  var channelName = trnxPayLoad.Body.channelName;
  var peers = trnxPayLoad.Body.peerListJoinChannel;
  logger.debug('channelName : ' + channelName);
  logger.debug('peers : ' + peers);
  var error = '';
  if (!channelName) {
    error += '\'channelName\' ';
  }
  if (!peers || peers.length == 0) {
    error += '\'peers\' ';
  }
  if (!username) {
    error += '\'username\' ';
  }

  if (!orgname) {
    error += '\'orgname\' ';
  }

  if (error !== '') {
    var result = getErrorMessage(error);
    Responsecallback(trnxPayLoad, result, GRPCCallback);
    return false;
  }

  join.joinChannel(channelName, peers, username, orgname)
    .then(function (message) {
      Responsecallback(trnxPayLoad, message, GRPCCallback);
    });

}

var createChannel = function (Responsecallback, GRPCCallback, trnxPayLoad) {
  logger.info('<<<<<<<<<<<<<<<<< C R E A T E I N G  C H A N N E L >>>>>>>>>>>>>>>>>');
  logger.debug('End point : /channels');
  var username = trnxPayLoad.Header.UserID;
  var orgname = trnxPayLoad.Header.Org;
  var channelName = trnxPayLoad.Body.channelName;
  var channelConfigPath = trnxPayLoad.Body.channelConfigPath;
  logger.debug('Channel name : ' + channelName);
  logger.debug('channelConfigPath : ' + channelConfigPath); //../artifacts/channel/mychannel.tx

  var error = '';
  if (!channelName) {
    error += '\'channelName\' ';
  }
  if (!username) {
    error += '\'username\' ';
  }

  if (!orgname) {
    error += '\'orgname\' ';
  }
  if (!channelConfigPath) {
    error += '\'channelConfigPath\' ';
  }

  if (error !== '') {
    var result = getErrorMessage(error);
    Responsecallback(trnxPayLoad, result, GRPCCallback);
    return false;
  }

  channels.createChannel(channelName, channelConfigPath, username, orgname)
    .then(function (message) {
      Responsecallback(trnxPayLoad, message, GRPCCallback);
    });
}


exports.getErrorMessage = getErrorMessage;
exports.getChainInfo = getChainInfo;
exports.getInstalledChaincodes = getInstalledChaincodes;
exports.getChannels = getChannels;
exports.getBlockByHash = getBlockByHash;
exports.getTransactionByID = getTransactionByID;
exports.getBlockByNumber = getBlockByNumber;
exports.queryChaincode = queryChaincode;
exports.invokeChaincode = invokeChaincode;
exports.installChaincode = installChaincode;
exports.instantiateChaincode = instantiateChaincode;

exports.joinChannel = joinChannel;
exports.createChannel = createChannel;



