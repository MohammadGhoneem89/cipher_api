'use strict';
const _ = require("lodash");
const uuid = require("uuid").v4();
const moment = require("moment");
const rp = require('request-promise');
const fetch = require('node-fetch');
var CryptoJS = require('crypto-js');
const EndpointDefination = require('../../../../../lib/models/EndpointDefination');
const eventLog = require('../../../../../core/api/eventLog');
const Stopwatch = require('statman-stopwatch');


let Endpoint;
let sw = new Stopwatch();
let delta;

const resolveCase = async (payload, UUIDKey, route, callback, JWToken) => {

  if (payload.body.mode == "RESOLUTION_MATRIX"){
    resolutionMatrix(payload, UUIDKey, route, callback, JWToken)
  }else if (payload.body.mode == "RESOLVE"){
    resolve(payload, UUIDKey, route, callback, JWToken)
  }else if(payload.body.mode == "REVIEW"){
    review(payload, UUIDKey, route, callback, JWToken)
  }

};



const  resolutionMatrix = async (payload, UUIDKey, route, callback, JWToken) => {

  console.log("------------------------------------------------>>>>> pre req script");

  //==============Fetch EndPoint===================
  let query = {};
  query["name"] = "GetResolutionToolkit";

  try {
    Endpoint = await EndpointDefination
      .find(query)
      .lean(true)
      .exec();

    console.log("--------*****************&&&&&&&&&&&&&&>>>>>>> Mongo Endpoint : ", JSON.stringify(Endpoint, null, 2));

  } catch (error) {
    console.log("-------->>>>>>>>>>>>>>>>>>>>>ERROR: ", error.stack);
  }
  //==============End===================



  //==============Pre Request Script===================

  function generateAuthHeader(dataToSign) {
    var hash = CryptoJS.HmacSHA256(dataToSign, Endpoint[0].apiSecret);
    return hash.toString(CryptoJS.enc.Base64);
  }


  var date = new Date().toGMTString();

  var dataToSign = "(request-target): get " + Endpoint[0].gatewayUrl + "groups/" + Endpoint[0].groupId + "/resolutionToolkit\n" +
    "host: " + Endpoint[0].gatewayHost + "\n" +
    "date: " + date;
  var hmac = generateAuthHeader(dataToSign);
  var authorisation = "Signature keyId=\"" + Endpoint[0].apiKey + "\",algorithm=\"hmac-sha256\",headers=\"(request-target) host date\",signature=\"" + hmac + "\"";


  console.log("---------->>>>> date: ", date);
  console.log("---------->>>>> hmac: ", hmac);
  console.log("---------->>>>> authorisation: ", authorisation);

  //==============End===================


  //==============Call Endpoint===================
  let externalApi = {
    method: 'GET',
    uri: Endpoint[0].address,
    headers: {
      'Date': date,
      'Authorization': authorisation,
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
    },

    json: true
  };

  console.log("------------------------------------------------>>>>>>>>> externalApi:  ", JSON.stringify(externalApi, null, 2));

  sw.reset();
  try {
    sw.start();
    let response = await rp(externalApi)
    delta = sw.read();
    sw.reset();
    console.log("------------------------------------------------>>>>>>>>> respons :   ", JSON.stringify(response, null, 2))

    const finalResponse = {
      "messageStatus": "OK",
      "messageId": uuid,
      "errorDescription": "Processed OK!",
      "errorCode": 200,
      "timestamp": moment().format("DD/MM/YYY hh:mm:ss.SSS"),
      ...response
    };
    eventLog(UUIDKey, 'RESOLUTION_MATRIX', {}, response, delta);
    return callback(finalResponse)

  } catch (err) {
    console.log('errorrrrrrrrrrrrrrr ------->>>>>>', err)
    const finalResponse = {
      "messageStatus": "Error",
      "messageId": uuid,
<<<<<<< HEAD
      "errorDescription": err.message,
=======
      "errorDescription": err,
>>>>>>> c35dcc01ce248aef90c281608d27ddc98424009a
      "errorCode": 201,
      "timestamp": moment().format("DD/MM/YYY hh:mm:ss.SSS"),
    };
    eventLog(UUIDKey, 'RESOLUTION_MATRIX', {}, finalResponse, delta, err);
    return callback(finalResponse)
  }
  //==============End===================


};



const resolve = async (payload, UUIDKey, route, callback, JWToken) => {

  console.log("------------------------------------------------>>>>> Resolve Case ");

  //==============Fetch EndPoint===================
  let query = {};
  query["name"] = "resolve";

  try {
    Endpoint = await EndpointDefination
      .find(query)
      .lean(true)
      .exec();

    console.log("--------*****************&&&&&&&&&&&&&&>>>>>>> Mongo Endpoint : ", JSON.stringify(Endpoint, null, 2));

  } catch (error) {
    console.log("-------->>>>>>>>>>>>>>>>>>>>>ERROR: \n", error.stack);
  }
  //==============End===================




  //==============Resolve API Request===================


  const request = {
    "resultIds": payload.body.resultGroup[0].resultId,
    "statusId": payload.body.resultGroup[0].resolveResults.statusId,
    "riskId": payload.body.resultGroup[0].resolveResults.riskId,
    "reasonId": payload.body.resultGroup[0].resolveResults.reasonId,
    "resolutionRemark": payload.body.resultGroup[0].resolveResults.resolutionRemarks
  };




  //==============Pre Request Script===================

  function generateAuthHeader(dataToSign) {
    var hash = CryptoJS.HmacSHA256(dataToSign, Endpoint[0].apiSecret);
    return hash.toString(CryptoJS.enc.Base64);
  }

  var date = new Date().toGMTString();


  var contentLength = unescape(encodeURIComponent(JSON.stringify(request))).length;


  var dataToSign = "(request-target): put " + Endpoint[0].gatewayUrl + "cases/" + Endpoint[0].caseSystemId + "/results/resolution" + "\n" +
    "host: " + Endpoint[0].gatewayHost + "\n" +
    "date: " + date + "\n" +
    "content-type: " + "application/json" + "\n" +
    "content-length: " + contentLength + "\n" +
    JSON.stringify(request);


  console.log("---------->>>>> dataToSign: ", dataToSign);

  var hmac = generateAuthHeader(dataToSign);
  var authorisation = "Signature keyId=\"" + Endpoint[0].apiKey + "\",algorithm=\"hmac-sha256\",headers=\"(request-target) host date content-type content-length\",signature=\"" + hmac + "\"";



  console.log("---------->>>>> date: ", date);
  console.log("---------->>>>> hmac: ", hmac);
  console.log("---------->>>>> authorisation: ", authorisation);
  console.log("---------->>>>> contentLength: ", contentLength);

  //==============End===================


  //==============Call Endpoint===================
  let externalApi = {
    method: 'PUT',
    uri: Endpoint[0].address,

    headers: {
      'Date': date,
      'Authorization': authorisation,
      'Content-Type': 'application/json',
      'Content-Length': contentLength,
    },
    body: request,
    redirect: 'follow',

    json: true
  };

  console.log("------------------------------------------------>>>>>>>>> externalApi:  ", JSON.stringify(externalApi, null, 2));
  sw.reset();
  try {
    sw.start();
    let response = await rp(externalApi)
    delta = sw.read();
    sw.reset();
    console.log("------------------------------------------------>>>>>>>>> respons :   ", JSON.stringify(response, null, 2))


    const finalResponse = {
      "messageStatus": "OK",
      "messageId": uuid,
      "errorDescription": "Processed OK!",
      "errorCode": 200,
      "timestamp": moment().format("DD/MM/YYY hh:mm:ss.SSS"),
      // "caseId": response.caseId,
      // "WCOCaseId": "!!!!!!!!!!!!!!!!",
      // "creationDate": response.creationDate,
      // "outStandingActions": response.outStandingActions,
      // "result": response.results
      ...response
    };
    eventLog(UUIDKey, 'RESOLVE', {}, response, delta);
    return callback(finalResponse)

  } catch (err) {
    console.log('errorrrrrrrrrrrrrrr ------->>>>>>', err)
    const finalResponse = {
      "messageStatus": "Error",
      "messageId": uuid,
<<<<<<< HEAD
      "errorDescription": err.message,
=======
      "errorDescription": err,
>>>>>>> c35dcc01ce248aef90c281608d27ddc98424009a
      "errorCode": 201,
      "timestamp": moment().format("DD/MM/YYY hh:mm:ss.SSS"),
    };
    eventLog(UUIDKey, 'RESOLVE', {}, finalResponse, delta, err);
    return callback(finalResponse)
  }
  //==============End===================


};



const review = async (payload, UUIDKey, route, callback, JWToken) => {

  console.log("------------------------------------------------>>>>> Review Case ");

  //==============Fetch EndPoint===================
  let query = {};
  query["name"] = "review";

  try {
    Endpoint = await EndpointDefination
      .find(query)
      .lean(true)
      .exec();

    console.log("--------*****************&&&&&&&&&&&&&&>>>>>>> Mongo Endpoint : ", JSON.stringify(Endpoint, null, 2));

  } catch (error) {
    console.log("-------->>>>>>>>>>>>>>>>>>>>>ERROR: \n", error.stack);
  }
  //==============End===================



  

  //==============Resolve API Request===================

  

  const request = {
    "resultIds": payload.body.resultGroup[0].resultId,
    "resolutionRemark": payload.body.resultGroup[0].resolveResults.resolutionRemarks
  };



  //==============Pre Request Script===================

  function generateAuthHeader(dataToSign) {
    var hash = CryptoJS.HmacSHA256(dataToSign, Endpoint[0].apiSecret);
    return hash.toString(CryptoJS.enc.Base64);
  }

  var date = new Date().toGMTString();


  var contentLength = unescape(encodeURIComponent(JSON.stringify(request))).length;


  var dataToSign = "(request-target): put " + Endpoint[0].gatewayUrl + "cases/" + Endpoint[0].caseSystemId + "/results/review" + "\n" +
    "host: " + Endpoint[0].gatewayHost + "\n" +
    "date: " + date + "\n" +
    "content-type: " + "application/json" + "\n" +
    "content-length: " + contentLength + "\n" +
    JSON.stringify(request);



  console.log("---------->>>>> dataToSign: ", dataToSign);

  var hmac = generateAuthHeader(dataToSign);
  var authorisation = "Signature keyId=\"" + Endpoint[0].apiKey + "\",algorithm=\"hmac-sha256\",headers=\"(request-target) host date content-type content-length\",signature=\"" + hmac + "\"";


  console.log("---------->>>>> date: ", date);
  console.log("---------->>>>> hmac: ", hmac);
  console.log("---------->>>>> authorisation: ", authorisation);
  console.log("---------->>>>> contentLength: ", contentLength);

  //==============End===================


  //==============Call Endpoint===================
  let externalApi = {
    method: 'PUT',
    uri: Endpoint[0].address,

    headers: {
      'Date': date,
      'Authorization': authorisation,
      'Content-Type': 'application/json',
      'Content-Length': contentLength,
    },
    body: request,
    redirect: 'follow',

    json: true
  };

  console.log("------------------------------------------------>>>>>>>>> externalApi:  ", JSON.stringify(externalApi, null, 2));
  sw.reset();
  try {
    sw.start();
    let response = await rp(externalApi)
    delta = sw.read();
    sw.reset();
    console.log("------------------------------------------------>>>>>>>>> respons :   ", JSON.stringify(response, null, 2))


    const finalResponse = {
      "messageStatus": "OK",
      "messageId": uuid,
      "errorDescription": "Processed OK!",
      "errorCode": 200,
      "timestamp": moment().format("DD/MM/YYY hh:mm:ss.SSS"),
      // "caseId": response.caseId,
      // "WCOCaseId": "!!!!!!!!!!!!!!!!",
      // "creationDate": response.creationDate,
      // "outStandingActions": response.outStandingActions,
      // "result": response.results
      ...response
    };
    eventLog(UUIDKey, 'REVIEW', {}, response, delta);
    return callback(finalResponse)

  } catch (err) {
    console.log('errorrrrrrrrrrrrrrr ------->>>>>>', err)
    const finalResponse = {
      "messageStatus": "Error",
      "messageId": uuid,
<<<<<<< HEAD
      "errorDescription": err.message,
=======
      "errorDescription": err,
>>>>>>> c35dcc01ce248aef90c281608d27ddc98424009a
      "errorCode": 201,
      "timestamp": moment().format("DD/MM/YYY hh:mm:ss.SSS"),
    };
    eventLog(UUIDKey, 'REVIEW', {}, finalResponse, delta, err);
    return callback(finalResponse)
  }
  //==============End===================


};


module.exports = {
  resolveCase
};

