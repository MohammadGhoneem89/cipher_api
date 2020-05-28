'use strict';
const _ = require("lodash");
const uuid = require("uuid").v4();
const moment = require("moment");
const rp = require('request-promise');
const fetch = require('node-fetch');
var CryptoJS = require('crypto-js');
const EndpointDefination = require('../../../../../lib/models/EndpointDefination');






let Endpoint;

const screenCase = async (payload, UUIDKey, route, callback, JWToken) => {

  console.log("------------------------------------------------>>>>> Payload: \n", JSON.stringify(payload,null,2));

  //==============Fetch EndPoint===================
  let query = {};
  query["name"] = "screenCase";

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




  //==============Screen API Request===================

  const request = {
    "groupId": Endpoint[0].groupId,
    "entityType": "INDIVIDUAL",
    "providerTypes": ["WATCHLIST"],
    "name": payload.body.WCOscreeningFields.firstName + " " + payload.body.WCOscreeningFields.lastName,
    "nameTransposition": false,
    "secondaryFields": [
      {
          "typeId": "SFCT_1",
          "value": payload.body.WCOscreeningFields.gender
      },
      {
          "typeId": "SFCT_2",
          "dateTimeValue": {
              "timelinePrecision": "ON",
              "pointInTimePrecision": "DAY",
              "utcDateTime": 316310400000,
              "timeZone": null
          }
      },
      {
          "typeId": "SFCT_3",
          "value": payload.body.Id.GCC.cardCountry
      },
      {
          "typeId": "SFCT_4",
          "value": payload.body.WCOscreeningFields.placeOfBirth
      },
      {
          "typeId": "SFCT_5",
          "value": "ABW"
      }
  ]
  };





  //==============Pre Request Script===================

  function generateAuthHeader(dataToSign) {
    var hash = CryptoJS.HmacSHA256(dataToSign, Endpoint[0].apiSecret);
    return hash.toString(CryptoJS.enc.Base64);
  }

  var groupId = Endpoint[0].groupId;
  var customField1 = "--REQUIRED-VALUE-MISSING--";
  var customField2 = "--REQUIRED-VALUE-MISSING--";
  var customField3 = "--REQUIRED-VALUE-MISSING--";

  var date = new Date().toGMTString();
  var content = request;
  // content = content.replace("{{group-id}}", groupId);
  // content = content.replace("{{custom-field-1}}", customField1);
  // content = content.replace("{{custom-field-2}}", customField2);
  // content = content.replace("{{custom-field-3}}", customField3);

  

  var contentLength = unescape(encodeURIComponent(request)).length;

  var dataToSign = "(request-target): post " + Endpoint[0].gatewayUrl + "cases/screeningRequest\n" +
    "host: " + Endpoint[0].gatewayHost + "\n" +
    "date: " + date + "\n" +
    "content-type: " + "application/json" + "\n" +
    "content-length: 815" + "\n" +
    request;

  var hmac = generateAuthHeader(dataToSign);
  var authorisation = "Signature keyId=\"" + Endpoint[0].apiKey + "\",algorithm=\"hmac-sha256\",headers=\"(request-target) host date content-type content-length\",signature=\"" + hmac + "\"";


  console.log("---------->>>>> date: ", date);
  console.log("---------->>>>> hmac: ", hmac);
  console.log("---------->>>>> authorisation: ", authorisation);
  console.log("---------->>>>> contentLength: ", contentLength);

  //==============End===================


  //==============Call Endpoint===================
  let externalApi = {
    method: 'POST',
    uri: Endpoint[0].address,
    headers: {
      'Date': date,
      'Authorization': authorisation,
      
      'Content-Type': 'application/json',
     
    },
    body:request,
    redirect: 'follow',

    json: true
  };

  console.log("------------------------------------------------>>>>>>>>> externalApi:  ", JSON.stringify(externalApi, null, 2));

  try {
    let response = await rp(externalApi)
    console.log("------------------------------------------------>>>>>>>>>11111111111 respons :   ", JSON.stringify(response, null, 2))

    const finalResponse = {
  
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
  screenCase
};

// "messageStatus": "OK",
//       "messageId": uuid,
//       "errorDescription": "Processed OK!",
//       "errorCode": 200,
//       "timestamp": moment().format("DD/MM/YYY hh:mm:ss.SSS"),