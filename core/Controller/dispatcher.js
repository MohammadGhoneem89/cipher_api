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
    this.configdata = configData;
    this.simucases = configData.simucases || [];
    this.UUID = UUID;
    this.typeList = typeList;
    this.JWT = JWTtoken;
    if (configData.isBlockchain === true) {
      let isMatched = false;
      let rules = _.get(configData, 'rules', []);
      let channelName = "";
      let networkName = "";
      let smartContractName = "";
      let smartContractFunc = "";
      let tranCode = "0002";
      rules.forEach((elem) => {
        let flags = [];
        elem.ruleList.forEach((element) => {
            console.log(">>>>>>>>ROUTING MATCH RULE<<<<<<<<<")
            console.log(element.field)
            console.log(element.value)
          if (element.field != "*") {
            let extValue = _.get(OriginalRequest, element.field, null);

            if (!extValue) {
              throw new Error(`blockchain routing error | ${element.field} must be defined`);
            }
            let litmus = false;
            if (element.value == '*') {
              litmus = true;
            }
            else if (extValue == element.value) {
              litmus = true;
            }
            else {
              litmus = false;
            }
            flags.push(litmus);
          }
          else {
            flags.push(true);
          }

        });
        let flagRuleApproved = true;
        flags.forEach((e) => {
          if (e === false) {
            flagRuleApproved = false;
          }
        });
        if (isMatched === false && flagRuleApproved === true) {
          channelName = elem.channel.channelName;
          networkName = elem.channel.networkName;
          smartContractName = elem.smartcontract;
          smartContractFunc = elem.smartcontractFunc;
          tranCode = elem.type;
          isMatched = true;
        }
      });
      if (isMatched === false) {
        throw new Error(`blockchain routing error | matching rule not found!!!`);
      }
      else {
        let userID = JWTtoken && JWTtoken.userID ? JWTtoken.userID : "admin";
        _.set(MappeedRequest, 'Header.tranCode', tranCode || "0002");
        _.set(MappeedRequest, 'Header.userID', userID);
        _.set(MappeedRequest, 'Header.network', networkName);
        _.set(MappeedRequest, 'BCData.channelName', channelName);
        _.set(MappeedRequest, 'BCData.smartContractName', smartContractName);
        _.set(MappeedRequest, 'Body.fcnName', smartContractFunc);

      }
    }
    this.request = MappeedRequest;
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
      } else if (this.configdata.isCustomMapping === true) {
        this.executeCustomFunction().then((data) => {
          resolve(data);
        }).catch((ex) => {
          reject(ex);
        });
      } else if (this.configdata.communicationMode === 'REST') {
        this.connectRestService().then((data) => {
          resolve(data);
        }).catch((ex) => {
          reject(ex);
        });
      } else if (this.configdata.communicationMode === 'QUEUE') {
        this.connectQueueService().then((data) => {
          console.log(data);
          resolve(data);
        }).catch((ex) => {
          reject(ex);
        });
      } else {
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
      let functionName = this.configdata.MappingfunctionName;
      fs.exists(fileLoc, function (exists) {
        if (exists) {
          let mappingFunctions = require(fileLoc);
          mappingFunctions[functionName](Orequest, UUID, route, resolve, JWT, null, null);
        } else {
          generalResponse.error = true;
          generalResponse.message = `mapping file does not exist ${fileLoc}`;
        }
      });
    });
  }

  connectRestService() {
    let today = new Date();
    _.set(this.request, 'Header.tranType', "0200");
    _.set(this.request, 'Header.UUID', this.UUID);
    _.set(this.request, 'Header.timeStamp', today.toISOString());
    let rpOptions = {
      method: 'POST',
      url: this.configdata.ServiceURL,
      body: this.request,
      headers: this.configdata.ServiceHeaders,
      timeout: 10000, //  configurable
      json: true
    };

    console.log(JSON.stringify(rpOptions, null, 2))
    return rp(rpOptions).then((data) => {
      let generalResponse = {
        "error": true,
        "message": "Failed to get response"
      };
      if (data) {
        if (data.success === false) {
          throw new Error(data.message);
        }
        return data;
      }

      return generalResponse;
    });
  }

  connectQueueService(responseQueue) {
    return amq.start()
      .then((ch) => {
        return ch.assertQueue(this.configdata.requestServiceQueue, {
          durable: false
        })
          .then(() => {
            let generalResponse = {
              "error": false,
              "message": "Processed OK!"
            };
            let responseQueue = [];
            let today = new Date();
            responseQueue.push(this.configdata.responseQueue);
            _.set(this.request, 'Header.tranType', "0200");
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