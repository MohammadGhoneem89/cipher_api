'use strict';
const _ = require('lodash');
const Simulator = require('./simulator');
const Endpoint = require('./endpoint');
const rp = require('request-promise');
const path = require('path');
const fs = require('fs');
const amq = require('../../core/api/connectors/queue');
const eventLog = require('../../core/api/eventLog');
const billing = require('../../lib/models/billing');
const dates = require('../../lib/helpers/dates');
const PROTO_PATH = __dirname + '/rest.proto';
const grpc = require('grpc');
const relayProto = grpc.load(PROTO_PATH).RELAY;
const config = require('../../config');
const crypto = require("crypto");
const Stopwatch = require('statman-stopwatch');
module.exports = class Dispatcher {
  constructor(OriginalRequest, MappeedRequest, configData, UUID, typeList, JWTtoken) {
    this.oRequest = OriginalRequest;
    this.configdata = configData;
    this.simucases = configData.simucases || [];
    this.UUID = UUID;
    this.typeList = typeList;
    this.count = 0;
    this.JWT = JWTtoken;
    this.sw = new Stopwatch();
    this.sw.reset();

    if (configData.isHMAC === true) {
      let retrievedSignature = _.get(OriginalRequest, "headersParams.x-signature", undefined);
      if (!retrievedSignature) {
        throw new Error("signature required!")
      }
      console.log(OriginalRequest.query)
      console.log(">>>>>>>>>>>>>>", JWTtoken);

      console.log(OriginalRequest.rawBody);
      let computedSignature = crypto.createHmac("sha512", JWTtoken.clientKey).update(OriginalRequest.rawBody).digest("hex");
      let verified = this.getSignatureVerifyResult(computedSignature, JWTtoken.HmacPvtKey, retrievedSignature);
      if (!verified) {
        throw new Error("invalid signature!")
      }
    }

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
            } else {
              console.log("Final Matching Value Picked from Request " + extValue);
            }
            let litmus = false;
            if (element.value == '*') {
              litmus = true;
            } else if (extValue == element.value) {
              litmus = true;
            } else {
              litmus = false;
            }
            flags.push(litmus);
          } else {
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
          } else {
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
      } else {

        _.set(MappeedRequest, 'Header.tranCode', tranCode || "0002");
        _.set(MappeedRequest, 'Header.userID', userID);
        _.set(MappeedRequest, 'Header.network', networkName);
        _.set(MappeedRequest, 'BCData.channelName', channelName);
        _.set(MappeedRequest, 'BCData.smartContractName', smartContractName);
        let userIDJWT = _.get(this.JWT, 'userID', '');
        let orgType = _.get(this.JWT, 'orgType', '');
        let orgCode = _.get(this.JWT, 'orgCode', '');
        _.set(MappeedRequest, 'BCData.generalArgs', [userIDJWT, orgType, orgCode, UUID]);
        _.set(MappeedRequest, 'Body.fcnName', smartContractFunc);
        //  Quorrum details
        _.set(MappeedRequest, 'BCData.privateFor', endorsementPolicy);
        _.set(MappeedRequest, 'BCData.abi', abi);
        _.set(MappeedRequest, 'BCData.contractAddress', contractAddress);
      }
    }
    this.request = MappeedRequest;
  }

  SendGetRequest(_res = undefined, _rej = undefined) {
    return new Promise((resolve, reject) => {
      let getResponse;
      let bypassSimu = _.get(this.oRequest, 'bypassSimu', false);
      if (this.configdata.isSimulated && this.configdata.isSimulated === true && bypassSimu === false) {
        let simu = new Simulator(this.oRequest, this.simucases);
        simu.getResponse().then((data) => {
          let generalResponse = {
            "error": false,
            "message": "Processed OK!",
            ...data
          };
          resolve(generalResponse);
        }).catch((ex) => {
          reject(ex);
        });
      } else if (this.configdata.isCustomMapping === true) {
        this.executeCustomFunction().then((data) => {
          resolve(data);
        }).catch((ex) => {
          reject(ex);
        });
      } else if (this.configdata.communicationMode === 'GRPC Relay') {

        let relNet = global.relayNetConfig;
        let orgCode = _.get(this.request, '__RELAY', '');

        let netSelected = _.get(this.configdata, 'RelayNet', '')
        let invokeNet = _.get(relNet, `${netSelected}.CLIENT.${orgCode}`, undefined);

        if (!invokeNet) {
          return reject(new Error("Relay network not found!!"));
        }
        let keyList = Object.keys(invokeNet);
        let peerExt = _.get(invokeNet, keyList[0], undefined);
        if (!peerExt) {
          return reject(new Error("Relay network not found!!"));
        }
        return this.connectGRPCService(this.configdata, peerExt).then((data) => {
          return resolve(data);
        });
      } else if (this.configdata.communicationMode === 'REST') {
        let isBLK = _.get(this.configdata, 'isBlockchain', false);
        let tranCode = _.get(this.request, 'Header.tranCode', "0002")
        let fcname = _.get(this.request, 'Body.fcnName', "0002")
        let count = 0;
        if (isBLK && tranCode == "0001" && fcname == "GetContractData") {
          if (this.count > 2) {
            console.log("HURRAY!!!")
            return _rej(new Error("data not found in blockchain!!"))
          } else {
            this.connectRestService(this.configdata).then((data) => {
              return _res(data);
            }).catch((ex) => {
              this.count++;
              console.log("RETRYING ", this.count)
              if (_rej && _res)
                setTimeout(this.SendGetRequest.bind(this, _res, _rej), 2000)
              else
                setTimeout(this.SendGetRequest.bind(this, resolve, reject), 2000)
            });
          }
        } else {
          this.connectRestService(this.configdata).then((data) => {
            resolve(data);
          }).catch((ex) => {
            reject(ex);
          });
        }


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

  getSignatureVerifyResult(hmac, publix, signatureSignedByPrivateKey) {
    let pem = Buffer.from(publix)
    let publicKey = pem.toString('ascii');
    const verifier = crypto.createVerify('RSA-SHA512');
    verifier.update(hmac, 'ascii');
    const publicKeyBuf = new Buffer(publicKey, 'ascii')
    const signatureBuf = new Buffer(signatureSignedByPrivateKey, 'hex')
    const result = verifier.verify(publicKeyBuf, signatureBuf)
    return result;
  };

  executeCustomFunction() {

    return new Promise((resolve, reject) => {
      let generalResponse = {
        "error": false,
        "message": "Processed OK!"
      };
      let fileLoc = path.resolve(__dirname, `../mappingFunctions/${this.configdata.CustomMappingFile}`);
      let Orequest = {};
      if (this.configdata.isBlockchain) {
        Orequest = this.request;
      } else {
        Orequest = this.oRequest
      }
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

  connectRestService(configdata) {
    this.sw.start();
    let isBLK = _.get(configdata, 'isBlockchain', false);
    let today = new Date();
    if (isBLK === true) {
      _.set(this.request, 'Header.tranType', "0200");
      _.set(this.request, 'Header.UUID', this.UUID);
      _.set(this.request, 'Header.timeStamp', today.toISOString());
    }
    let req = _.cloneDeep(this.request);
    let _endpoint = new Endpoint(req);
    let ServiceURL = _.get(this.configdata, 'ServiceURL', "");
    return _endpoint.executeEndpoint(this.configdata.endpointName, ServiceURL).then((resp) => {
      if (resp) {
        // if (resp.success === false || resp.error === true) {
        //   throw new Error(resp.message);
        // }
        let delta = this.sw.read();
        this.sw.reset();
        eventLog(this.UUID, `connectRestService[${this.configdata.endpointName.address}${ServiceURL}}]`, req, resp.data, delta);
        return resp.data;
      }
      return resp;
    }).catch((ex) => {
      console.log(ex);
      let delta = this.sw.read();
      this.sw.reset();
      eventLog(this.UUID, `connectRestService[${this.configdata.endpointName.address}${ServiceURL}}]`, req, {}, delta, ex);
      throw new Error(ex.message);
    });
  }

  connectGRPCService(configdata, endpoint) {
    this.sw.start();
    let isRelay = _.get(configdata, 'isRelay', false);
    let remoteAPI = _.get(configdata, 'RemoteAPI', '');
    let network = _.get(configdata, 'RelayNet', '');
    let relayReq = {};
    let today = new Date();
    let req = _.cloneDeep(this.request);

    _.set(relayReq, 'Header.UUID', this.UUID);
    _.set(relayReq, 'Header.timeStamp', today.toISOString());
    _.set(relayReq, 'Header.network', network);
    _.set(relayReq, 'Header.remoteAPI', remoteAPI);
    _.set(relayReq, 'Body.payload', JSON.stringify(req));

    const credentials = grpc.credentials.createSsl(
      Buffer.from(endpoint.cacertificate),
      Buffer.from(endpoint.privatekey),
      Buffer.from(endpoint.chaincertificate)
    );

    let client = new relayProto.Communicator(
      endpoint.requests,
      credentials
    );
    console.log(`Request for GRPC processing dialng ${endpoint.requests} >> `, JSON.stringify(relayReq, null, 2))
    return new Promise((res, rej) => {
      client.Query(relayReq, (err, response) => {
        if (err !== null) {
          console.log("***************>>>  ", err)
          return res({
            "error": true,
            "message": err.message
          });
          let delta = this.sw.read();
          this.sw.reset();
          eventLog(this.UUID, `connectRestService[${this.configdata.endpointName.address}${ServiceURL}}]`, req, {}, delta, err.message);
        } else {
          if (response.Body.success === true) {
            let result;

            try {
              result = JSON.parse(response.Body.payload);
              let delta = this.sw.read();
              this.sw.reset();
              eventLog(this.UUID, `connectGRPCService[${endpoint.requests}]`, relayReq, result, delta);
            } catch (e) {
              console.log(e);
            }
            return res({
              "error": false,
              "message": "Processed OK!",
              result
            });
          } else {
            return res({
              "error": false,
              "message": response.Body.errorMessage
            });
          }
        }
      });
    })
  }

  connectQueueService(responseQueue) {

    this.sw.start();
    return amq.start()
      .then((ch) => {
        ch.assertQueue(this.configdata.requestServiceQueue, {
          durable: false
        })

        let generalResponse = {
          "success": true,
          "error": false,
          "message": "Processed OK!",
          // "result":{errorCode:202}
        };
        let responseQueue = [];

        let today = new Date();
        responseQueue.push(this.configdata.responseQueue);
        _.set(this.request, 'Header.tranType', "0200");
        _.set(this.request, 'Header.UUID', this.UUID);
        _.set(this.request, 'Header.ResponseMQ', responseQueue);
        _.set(this.request, 'Header.timeStamp', today.toISOString());
        console.log(JSON.stringify(this.request, null, 2))

        ch.sendToQueue(this.configdata.requestServiceQueue, new Buffer(JSON.stringify(this.request)))
        let delta = this.sw.read();
        this.sw.reset();
        eventLog(this.UUID, 'connectQueueService', this.request, generalResponse, delta);

        return generalResponse;

      });

  };
};