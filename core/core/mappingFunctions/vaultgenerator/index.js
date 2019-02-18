'use strict';
const _ = require('lodash');
const apiTemplate = require('../../../lib/repositories/apiTemplate');
const crypto = require('../../../lib/helpers/crypto');
const transformTemplate = require('../../../lib/helpers/transformTemplate');
const ConfigMaker = require('../../../lib/models/ConfigMaker');
function generateConfig(payload, UUIDKey, route, callback, JWToken) {

  let request = {
    id: payload.templateName
  };
  let list = [];
  apiTemplate.findOne(request).then((data) => {
    transformTemplate(data.data, payload).then((data) => {
      let response = {
        "ElementList": { "action": "ElementList", "response": data }
      };
      return callback(response);
    });
  });

}

function getElementList(payload, UUIDKey, route, callback, JWToken) {
  let request = {
    id: payload.id
  };
  let list = [];
  let requestConfigMaker = {
    templateId: payload.id
  };
  Promise.all([
    apiTemplate.findOne(request),
    ConfigMaker.findOne(requestConfigMaker)
  ]).then((data) => {
    let re = /{{[{]?(.*?)[}]?}}/g;
    let s = JSON.stringify(data[0].data);
    let m;
    do {
      m = re.exec(s);
      if (m) {
        list.push(m[1].replace("encrypt ", ""));
      }
    } while (m);

    let ElementList = Array.from(new Set(list));
    let newList = [];
    ElementList.forEach((element) => {
      let elem = { attributeDefaultValue: "", displayName: undefined };


      data[1] && data[1].templateDetails.forEach((obj) => {
        if (obj.attributeName == element) {
          elem = obj;
          console.log("MAtched");
        }
      });

      console.log(JSON.stringify(elem, null, 2));

      newList.push({
        "attributeName": element,
        "attributeDefaultValue": elem.attributeDefaultValue || "",
        "displayName": elem.displayName || element
      });
    });
    let response = {
      "ElementList": { "action": "ElementList", "data": newList }
    };
    console.log(JSON.stringify(response, null, 2));
    return callback(response);
  });
}
exports.getElementList = getElementList;
exports.generateConfig = generateConfig;