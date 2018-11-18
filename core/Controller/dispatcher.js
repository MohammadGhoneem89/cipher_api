'use strict';
const _ = require('lodash');
const Simulator = require('./simulator');
const rp = require('request-promise');

module.exports = class Dispatcher {
  constructor(OriginalRequest, MappeedRequest, configData, UUID, typeList) {
    this.oRequest = OriginalRequest;
    this.request = MappeedRequest;
    this.configdata = configData;
    this.simucases = configData.simucases || [];
    this.UUID = UUID;
    this.typeList = typeList;
  }
  SendGetRequest() {
    return new Promise((resolve, reject) => {
      //  if simulated return response

      let getResponse;
      if (this.configdata.isSimulated && this.configdata.isSimulated === true) {
        let simu = new Simulator(this.oRequest, this.simucases);
        simu.getResponse().then((data) => {
          resolve(data);
        }).catch((ex) => {
          reject(ex);
        });
      }
      else if (this.configdata.isCustomMapping === true) {
        this.executeCustomFunction().then((data) => {
          resolve(data);
        }).catch((ex) => {
          reject(ex);
        });
      }
      else if (this.configdata.communicationMode === 'REST') {
        this.connectRestService().then((data) => {
          resolve(data);
        }).catch((ex) => {
          reject(ex);
        });
      }
      else if (this.configdata.communicationMode === 'QUEUE') {
        this.connectQueueService().then((data) => {
          resolve(data);
        }).catch((ex) => {
          reject(ex);
        });
      }
      else {
        let generalResponse = {
          "error": true,
          "message": "CommunicationMode invalid!"
        };
        reject(generalResponse);
      }
    });
  }
  executeCustomFunction() {
    return new Promise((resolve, reject) => {
      let generalResponse = {
        "error": false,
        "message": "Processed OK!"
      };
      resolve(generalResponse);
    });
  }

  connectRestService() {
    let rpOptions = {
      method: 'POST',
      url: this.configdata.ServiceURL,
      body: this.request,
      headers: this.configdata.ServiceHeaders,
      timeout: 10000, //  configurable
      json: true
    };
    return rp(rpOptions).then((data) => {
      if (data) {
        return data;
      }
      let generalResponse = {
        "error": false,
        "message": "Processed OK!"
      };
      return generalResponse;
    });
  }

  connectQueueService(requestServiceQueue, responseQueue) {
    //  this.configdata.requestServiceQueue
    //  , this.responseQueue
    let generalResponse = {
      "error": false,
      "message": "Processed OK!"
    };
    return Promise.resolve(generalResponse);
  }

}
