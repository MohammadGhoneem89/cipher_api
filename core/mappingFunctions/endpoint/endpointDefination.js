'use strict';

const _ = require('lodash');
const models = require('../../../lib/models');

const EndpointDefination = models.EndpointDefination;

function findDBEndpoints() {
  return Promise.all([
    EndpointDefination.find({'requestType': 'dbConnection'})
  ])
}

function DBListView(payload, UUIDKey, route, callback, JWToken) {
  findDBEndpoints()
    .then((res) => {
      console.log("res--->", res)
      let result = []
      res[0].forEach((element) => {
        let Elem = {};
        Elem.label = element.name;
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


exports.DBListView = DBListView;

