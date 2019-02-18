'use strict';
const _ = require('lodash');

module.exports = class Simulator {
  constructor(req, simuData) {
    this.request = req;
    this.sumudata = simuData;
  }
  getResponse() {
    return new Promise((resolve, reject) => {
      let generalResponse = {
        "error": true,
        "message": "general response not defined"
      };
      let CaseResponse;
      this.sumudata.forEach((obj) => {
        let value = _.get(this.request, obj.SimuField, null);
        if (!value && obj.SimuField.trim() === '*') {
          generalResponse = JSON.parse(obj.SimulatorResponse);
        }
        else if (String(value) === String(obj.SimuValue)) {
          CaseResponse = JSON.parse(obj.SimulatorResponse);
        }
      });
      if (CaseResponse) {
        resolve(CaseResponse);
      }
      else {
        resolve(generalResponse);
      }
    });
  }
}
