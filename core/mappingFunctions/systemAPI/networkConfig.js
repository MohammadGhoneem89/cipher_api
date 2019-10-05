'use strict';
const networkConfig = require('../../../lib/repositories/networkConfig');
const orgTypeData = require('../org/orgTypeData');
const _ = require('lodash');
function getNetworkConfig(payload, UUIDKey, route, callback, JWToken) {
  networkConfig.findPageAndCount(payload).then((data) => {
    let actions = [
      {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/editNetwork/"
        ]
      }];
    data[0].forEach((element) => {
      element.actions = actions;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });
    let response = {
      "NetworkList": {
        "action": "NetworkList",
        "pageData": {
          "pageSize": payload.page.pageSize,
          "currentPageNo": payload.page.currentPageNo,
          "totalRecords": data[1]
        },
        "data": {
          "searchResult": data[0]
        }
      }
    };
    callback(response);
  }).catch((err) => {
    console.log(JSON.stringify(err));
    let response = {
      "NetworkList": {
        "action": "NetworkList",
        "pageData": {
          "pageSize": payload.page.pageSize,
          "currentPageNo": payload.page.currentPageNo,
          "totalRecords": 0
        },
        "data": {
          "searchResult": []
        }
      }
    };
    callback(response);
  });
}
function getNetworkConfigByID(payload, UUIDKey, route, callback, JWToken) {
  Promise.all([
    networkConfig.findById(payload)
  ]).then((data) => {
    let response = {
      "AddUpdateNetwork": {
        "action": "AddUpdateNetwork",
        "data": {
          "NetworkConfig": data[0]
        }
      }
    };
    callback(response);
  }).catch((err) => {
    callback(err);
  });
}
function updateNetworkConfig(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;
  let resp = {
    "responseMessage": {
      "action": "updateNetworkConfig",
      "data": {
        "message": {
          "status": "ERROR",
          "errorDescription": "Some Error Occured during operation!!, Please Contact Support",
          "displayToUser": true,
          "newPageURL": ""
        }
      }
    }
  };

  if (true) {
    networkConfig.update(payload).then((data) => {
      resp.responseMessage.data.message.status = "OK";
      resp.responseMessage.data.message.errorDescription = "Record Updated Success!!";
      resp.responseMessage.data.message.newPageURL = "/NetworkList";
      callback(resp);
    });
  }
  else {
    resp.responseMessage.data.message.status = "ERROR";
    resp.responseMessage.data.message.errorDescription = "id is required!";
    resp.responseMessage.data.message.newPageURL = "";
    return callback(resp);
  }
}

function getServiceList(payload, UUIDKey, route, callback, JWToken) {
  orgTypeData((data) => {
    let resp = {
      "NetworkTypeData": {
        "action": "NetworkTypeData",
        "data": {
          networks: [],
          orgList: data || []
        }
      }
    };
    Promise.all([
      networkConfig.getList(payload)
    ]).then((data) => {
      data[0].forEach((key) => {
        let obj = {
          "label": key.networkName,
          "value": key._id
        };
        resp.NetworkTypeData.data.networks.push(obj);
      });
      callback(resp);
    }).catch((err) => {
      callback(err);
    });
  });
}

function getPeerList(payload, UUIDKey, route, callback, JWToken) {
  let resp = {
    "NetworkPeerList": {
      "action": "NetworkPeerList",
      "data": {
        peers: []
      }
    }
  };
  Promise.all([
    networkConfig.findById(payload)
  ]).then((data) => {
    data[0].peerList.forEach((elem) => {
      elem.actions = [{
        "label": "Join Channel",
        "iconName": "fa fa-chain",
        "actionType": "COMPONENT_FUNCTION"
      }];
    });
    resp.NetworkPeerList.data.peers = data[0].peerList;
    callback(resp);
  }).catch((err) => {
    callback(err);
  });
}

function getNetworkConfigList(payload, UUIDKey, route, callback, JWToken) {

  networkConfig.find({ type: payload.type })
    .then((arrayList) => {
      let result = {};
      arrayList.forEach((data) => {
        console.log(JSON.stringify(data, null, 2));
        let response = {
          "users": [{
            "username": data.username,
            "secret": data.secret
          }],
          "GOPATH": "../chaincode",
          "request-timeout": 12000000,
          "orderer": {
            "url": data.orderer.url,
            "server-hostname": data.orderer.serverHostname,
            "isFile": false,
            "tls_cacerts": data.orderer.tlsCacerts
          },
          "org": {
            "name": data.mspid,
            "mspid": data.mspid,
            "ca": data.ca
          }
        };
        data.peerUser.forEach((dataPeerUser) => {
          let blockchainUsers = {
            "isFile": false,
            "key": dataPeerUser.key,
            "cert": dataPeerUser.cert
          };
          _.set(response, `org.${dataPeerUser.userName}`, blockchainUsers)
        });
        data.peerList.forEach((dataPeerList, index) => {
          let peer = {
            "isFile": false,
            "peerName": dataPeerList.peerName,
            "requests": dataPeerList.requests,
            "events": dataPeerList.events,
            "server-hostname": dataPeerList.server_hostname,
            "tls_cacerts": dataPeerList.tls_cacerts
          };
          _.set(response, `org.peer${index + 1}`, peer);
        });
        _.set(result, `${data.networkName}`, response);
      });
      callback(result);
    })
    .catch((err) => {
      console.log(err);
      // response[payload.action] = {
      //   action: payload.action,
      //   data: {},
      //   error: err
      // };
      // callback(response);
    });
}

// function getUserList(payload, UUIDKey, route, callback, JWToken) {
//   networkConfig.find({})
//     .then((arrayList) => {
//       let result = {
//         hyperledger: [],
//         quorrum: []
//       };
//       arrayList.forEach((data) => {
//         let tuppleList = [];

//         data.peerUser.forEach((elem) => {
//           let tupple = {
//             label: `${data.networkName}-${elem.userName}`,
//             value: elem.userName
//           };
//           tuppleList.push(tupple);
//         });
//         if (data.type == "Quorum") {
//           tuppleList.forEach((elem) => {
//             result.quorrum.push(elem);
//           });
//         }
//         else {
//           tuppleList.forEach((elem) => {
//             result.hyperledger.push(elem);
//           });
//         }
//       });
//       let resp = {
//         "NetworkUserTypeData": {
//           "action": "NetworkTypeData",
//           "data": result
//         }
//       };
//       callback(resp);
//     })
//     .catch((err) => {
//       console.log(err);
//       // response[payload.action] = {
//       //   action: payload.action,
//       //   data: {},
//       //   error: err
//       // };
//       // callback(response);
//     });
// }
function getUserList(payload, UUIDKey, route, callback, JWToken) {
  networkConfig.find({})
    .then((arrayList) => {
      let result = {
        hyperledger: [],
        quorrum: []
      };
      arrayList.forEach((data) => {
        let tuppleList = [];
        data.peerUser.forEach((elem) => {
          let tupple = { label: "", value: "", orgType: "" }
          tupple.orgType = data.orginizationAlias
          tupple.label = `${data.networkName}-${elem.userName}`
          tupple.value = `${data.networkName}-${elem.userName}`
          tuppleList.push(tupple);
          
        });
        if (data.type == "Quorum") {
          tuppleList.forEach((elem) => {
            result.quorrum.push(elem);
          });
        }
        else {
          tuppleList.forEach((elem) => {
            result.hyperledger.push(elem);
          });
        }
      });
      let resp = {
        "NetworkUserTypeData": {
          "action": "NetworkTypeData",
          "data": result
        }
      };
      callback(resp);
    })
    .catch((err) => {
      console.log(err);
      // response[payload.action] = {
      //   action: payload.action,
      //   data: {},
      //   error: err
      // };
      // callback(response);
    });
}
exports.getUserList = getUserList;
exports.updateNetworkConfig = updateNetworkConfig;
exports.getNetworkConfig = getNetworkConfig;
exports.getNetworkConfigByID = getNetworkConfigByID;
exports.getServiceList = getServiceList;
exports.getPeerList = getPeerList;
exports.getNetworkConfigList = getNetworkConfigList;
