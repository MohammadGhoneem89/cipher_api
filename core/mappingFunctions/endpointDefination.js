'use strict';

const endpointDefination = require('../../lib/repositories/endpointDefination');
const _ = require('lodash');

function upsert(payload, UUIDKey, route, callback, JWToken) {
  _upsert(payload, callback);
}

function findOne(payload, UUIDKey, route, callback, JWToken) {
  _findOne(payload, callback);
}

function list(payload, UUIDKey, route, callback, JWToken) {
  _list(payload, callback);
}

function _upsert(payload, callback) {
  if (!payload.auth.endpoint) {
    _.set(payload, 'auth.endpoint', undefined);
  }
  let addr = _.get(payload, 'address', '')
  if (addr.indexOf('---masked---') > -1) {
    delete payload.address;
  }
  console.log(JSON.stringify(payload))
  endpointDefination.upsert(payload)
    .then((user) => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'OK',
              errorDescription: 'Endpoint updated successfully',
              displayToUser: true,
              newPageURL: '/endpoint'
            }
          }
        }
      };
      if (!user) {
        response.responseMessage.data.message = {
          status: 'ERROR',
          errorDescription: 'Endpoint not found',
          displayToUser: true
        };
      }
      callback(response);
    })
    .catch((err) => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'ERROR',
              errorDescription: 'Endpoint not updated',
              displayToUser: true
            },
            error: err
          }
        }
      };
      callback(response);
    });
}

function _findOne(payload, callback) {
  endpointDefination.findOne(payload)
    .then((user) => {

      if (user.address.indexOf('@') > -1) {
        let startIndex = user.address.indexOf('//');
        let endIndex = user.address.indexOf('@');
        if (startIndex > -1 && endIndex > -1) {
          user.address = `${user.address.substr(0, startIndex + 2)}---masked---${user.address.substr(endIndex, user.address.length)}`
        }
      }
      const response = {};
      response[payload.action] = {
        action: payload.action,
        data: user
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

function ListView(payload, UUIDKey, route, callback, JWToken) {
  endpointDefination.findAll(payload)
    .then((res) => {
      let result = []
      res.forEach((element) => {
        let Elem = {};
        Elem.text = element.name;
        Elem.value = element._id;
        result.push(Elem);
      });

      const response = {
        getEndpointListView: {
          action: payload.action,
          data: result
        }
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

function TemplatesListView(payload, UUIDKey, route, callback, JWToken) {
  endpointDefination.findAllTemplates(payload)
    .then((res) => {
      let result = []
      res.forEach((element) => {
        let Elem = {};
        Elem.text = element.name;
        Elem.value = element._id;
        result.push(Elem);
      });

      const response = {
        getTemplatesListView: {
          action: payload.action,
          data: result
        }
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

function _list(payload, callback) {
  endpointDefination.findPageAndCount(payload)
    .then((res) => {

      res[0].forEach((elem) => {
        if (elem.address.indexOf('@') > -1) {
          let startIndex = elem.address.indexOf('//');
          let endIndex = elem.address.indexOf('@');
          if (startIndex > -1 && endIndex > -1) {
            elem.address = `${elem.address.substr(0, startIndex + 2)}---masked---${elem.address.substr(endIndex, elem.address.length)}`
          }
        }
      });

      const response = {
        [payload.action]: {
          action: payload.action,
          pageData: {
            pageSize: payload.page.pageSize,
            currentPageNo: payload.page.currentPageNo,
            totalRecords: res[1]
          },
          data: res[0]
        }
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

function findByName(payload) {
  return endpointDefination.findByName({name: payload.name})
    .then((res) => {
      return {endpoint: res, data: payload.data};
    });
}

//
// findByName({name: 'name4', data: {hello: 'world !!!'}})
//   .then((res) => {
//     console.log(res);
//   });
/*
* response
* { endpoint: { _id: 5c3dae875693ce58190769f1,
 address: 'http://127.0.0.1:3000/endpoint/5c3dae875693ce58190769f1',
 status: true,
 protocol: { nonSecure: true, secure: false, custom: false },
 attachCert: true,
 certPhrase: 'kashan mirnza',
 authType: 'noAuth',
 requestType: 'rest',
 name: 'name4',
 __v: 0 },
 data: { hello: 'world !!!' } }
 * */
exports.TemplatesListView = TemplatesListView;
exports.ListView = ListView;
exports.list = list;
exports.findOne = findOne;
exports.upsert = upsert;
exports.findByName = findByName;

