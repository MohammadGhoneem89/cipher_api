'use strict';
const _ = require("lodash");
const uuid = require("uuid").v4();
const moment = require("moment");
const rp = require('request-promise');
const fetch = require('node-fetch');
var CryptoJS = require('crypto-js');
const EndpointDefination = require('../../../../../lib/models/EndpointDefination');






let Endpoint;

const getResolutionForGroup = async (payload, UUIDKey, route, callback, JWToken) => {

  console.log("------------------------------------------------>>>>> pre req script");

  //==============Fetch EndPoint===================
  let query = {};
  query["name"] = "GetResolutionToolkit";
  
  try {
    Endpoint = await EndpointDefination
      .find(query)
      .lean(true)
      .exec();

      console.log("--------*****************&&&&&&&&&&&&&&>>>>>>> Mongo Endpoint : ",JSON.stringify(Endpoint,null,2));
    
  } catch (error) {
    console.log("-------->>>>>>>>>>>>>>>>>>>>>ERROR: ",error.stack);
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

  try {
    let response = await rp(externalApi)
    console.log("------------------------------------------------>>>>>>>>> respons :   ", JSON.stringify(response, null, 2))

    const finalResponse = {
      "messageStatus": "OK",
      "messageId": uuid,
      "errorDescription": "Processed OK!",
      "errorCode": 200,
      "timestamp": moment().format("DD/MM/YYY hh:mm:ss.SSS"),
      ...response
    };
    return callback(finalResponse)

  } catch (err) {
    console.log('errorrrrrrrrrrrrrrr ------->>>>>>', err)
    const finalResponse = {
      "messageStatus": "Error",
      "messageId": uuid,
      "errorDescription": err,
      "errorCode": 201,
      "timestamp": moment().format("DD/MM/YYY hh:mm:ss.SSS"),
    };
    return callback(finalResponse)
  }
  //==============End===================


};

module.exports = {
  getResolutionForGroup
};

