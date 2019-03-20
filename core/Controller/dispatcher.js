'use strict';
const _ = require('lodash');
const Simulator = require('./simulator');
const Endpoint = require('./endpoint');
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
      let userID;
      let endorsementPolicy;
      let abi;
      let contractAddress;

      rules.forEach((elem) => {
        let flags = [];
        elem.ruleList.forEach((element) => {
          console.log(">>>>>>>>ROUTING MATCH RULE<<<<<<<<<")
          console.log(element.field)
          console.log(element.value)
          if (element.field != "*") {
            let extValue = _.get(OriginalRequest, element.field, null);
            if (!extValue) {
              extValue = _.get(OriginalRequest, '__JWTORG', null);
              console.log("Final Matching Value Picked from JWT " + extValue);
              if (!extValue) {
                throw new Error(`blockchain routing error | ${element.field} must be defined`);
              }
            }
            else {
              console.log("Final Matching Value Picked from Request " + extValue);
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

          if (elem.channel.type == "Quorrum" || elem.channel.type == "Quorum") {
            userID = JWTtoken && JWTtoken.quorrumUser ? JWTtoken.quorrumUser : "admindefault";
          }
          else {
            userID = JWTtoken && JWTtoken.hypUser ? JWTtoken.hypUser : "admindefault";
          }

          if (elem.smartcontractid) {
            endorsementPolicy = _.get(elem.smartcontractid, 'endorsementPolicy', undefined);
            abi = _.get(elem.smartcontractid, 'abi', undefined);
            contractAddress = _.get(elem.smartcontractid, 'contractAddress', undefined);
          }
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

        _.set(MappeedRequest, 'Header.tranCode', tranCode || "0002");
        _.set(MappeedRequest, 'Header.userID', userID);
        _.set(MappeedRequest, 'Header.network', networkName);
        _.set(MappeedRequest, 'BCData.channelName', channelName);
        _.set(MappeedRequest, 'BCData.smartContractName', smartContractName);
        _.set(MappeedRequest, 'Body.fcnName', smartContractFunc);
        //  Quorrum details
        _.set(MappeedRequest, 'BCData.privateFor', endorsementPolicy);
        _.set(MappeedRequest, 'BCData.abi', abi);
        _.set(MappeedRequest, 'BCData.contractAddress', contractAddress);

      }
    }
    this.request = MappeedRequest;
  }
  SendGetRequest() {
    return new Promise((resolve, reject) => {
      let getResponse;
      let bypassSimu = _.get(this.oRequest, 'bypassSimu', false);
      if (this.configdata.isSimulated && this.configdata.isSimulated === true && bypassSimu === false) {
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
      }
      else if (this.configdata.communicationMode === 'QUEUE') {
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
      console.log("SEARCHING FILE>>>>>>>>>" + fileLoc)
      fs.exists(fileLoc, function (exists) {
        if (exists) {
          console.log("<<<<<<FILE Found>>>>>>");
          let mappingFunctions = require(fileLoc);
          console.log("<<<<<<Calling>>>>>> " + functionName);
          mappingFunctions[functionName](Orequest, UUID, route, resolve, JWT, null, null);
        } else {
          generalResponse.error = true;
          generalResponse.message = `mapping file does not exist ${fileLoc}`;
          reject(generalResponse);
        }
      });
    });
  }

  connectRestService() {
    let today = new Date();
    if (this.configData.isBlockchain && this.configData.isBlockchain === true) {
      _.set(this.request, 'Header.tranType', "0200");
      _.set(this.request, 'Header.UUID', this.UUID);
      _.set(this.request, 'Header.timeStamp', today.toISOString());
    }
    console.log(JSON.stringify(this.configdata.endpointName, null, 2));
    let _endpoint = new Endpoint(this.request);
    return _endpoint.executeEndpoint(this.configdata.endpointName, this.configdata.ServiceURL).then((resp) => {
      if (resp) {
        if (resp.success === false || resp.error === true) {
          throw new Error(resp.message);
        }
        return resp.data;
      }
      return resp;
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