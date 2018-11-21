'use strict';
const _ = require('lodash');
const Simulator = require('./simulator');
const rp = require('request-promise');
const path = require('path');
const fs = require('fs');
const amq = require('../../core/api/connectors/queue');
module.exports = class Dispatcher {
  constructor(OriginalRequest, MappeedRequest, configData, UUID, typeList, JWTtoken) {
    this.oRequest = OriginalRequest;
    this.request = MappeedRequest;
    this.configdata = configData;
    this.simucases = configData.simucases || [];
    this.UUID = UUID;
    this.typeList = typeList;
    this.JWT = JWTtoken;
  }
  SendGetRequest() {
    return new Promise((resolve, reject) => {
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
          console.log(data);
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
      let fileLoc = path.resolve(__dirname, `../mappingFunctions/${this.configdata.CustomMappingFile}`);
      let Orequest = this.request;
      let route = this.configdata.route;
      let JWT = this.JWT;
      let UUID = this.UUID;
      fs.exists(fileLoc, function (exists) {
        if (exists) {
          let mappingFunctions = require(fileLoc);
          mappingFunctions.getActiveAPIList(Orequest, UUID, route, resolve, JWT, null, null);
        }
        else {
          generalResponse.error = true;
          generalResponse.message = `mapping file does not exist ${fileLoc}`;
        }
      });
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

  connectQueueService(responseQueue) {
    return amq.start()
      .then((ch) => {
        return ch.assertQueue(this.configdata.requestServiceQueue, { durable: false })
          .then(() => {
            let generalResponse = {
              "error": false,
              "message": "Processed OK!"
            };
            let responseQueue = [];
            let today = new Date()
            responseQueue.push(this.configdata.responseQueue);
            _.set(this.request, 'Header.tranType', "0200");
            _.set(this.request, 'Header.userID', "STUB");
            _.set(this.request, 'Header.org', "STUB");
            _.set(this.request, 'Header.UUID', this.UUID);
            _.set(this.request, 'Header.ResponseMQ', responseQueue);
            _.set(this.request, 'Header.timeStamp', today.toISOString());
            console.log(JSON.stringify(this.request, null, 2))
            ch.sendToQueue(this.configdata.requestServiceQueue, new Buffer(JSON.stringify(this.request)));
            return generalResponse;
          });
      });
  };

};
