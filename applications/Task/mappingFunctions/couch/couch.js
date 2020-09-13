'use strict';
const _ = require("lodash");
const uuid = require("uuid").v4();
const moment = require("moment");
const rp = require('request-promise');
const fetch = require('node-fetch');
var CryptoJS = require('crypto-js');
const EndpointDefination = require('../../../../lib/models/EndpointDefination');





let Endpoint;

const couch = async (payload, UUIDKey, route, callback, JWToken) => {

  console.log("------------------------------------------------>>>>> Payload: \n", JSON.stringify(payload, null, 2));

  // //==============Fetch EndPoint===================
  // let query = {};
  // query["name"] = "CouchDB-1";

  // try {
  //   Endpoint = await EndpointDefination
  //     .find(query)
  //     .lean(true)
  //     .exec();

  //   console.log("------------------>>>>>>>>>>>>>>>> Mongo Endpoint : ", JSON.stringify(Endpoint, null, 2));

  // } catch (error) {
  //   console.log("-------->>>>>>>>>>>>>>>>>>>>>ERROR: ", error.stack);
  // }
  // //==============End===================



  console.log("------------------>>>>>>>>>>>>>>>> payload.endpoint : ", payload.endpoint);
  console.log("------------------>>>>>>>>>>>>>>>> payload.channelname : ", payload.channelname);
  console.log("------------------>>>>>>>>>>>>>>>> payload.smartcontract : ", payload.smartcontract);


  //==============Call Endpoint===================
  let externalApi = {
    method: 'GET',
    uri: "http://" + payload.endpoint + "/_all_dbs",
    headers: {
      //'Date': date,
      //'Authorization': authorisation,
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
    },

    json: true
  };

  console.log("------------------------------------------------>>>>>>>>> externalApi:  ", JSON.stringify(externalApi, null, 2));

  try {
    let response = await rp(externalApi)
    // console.log("------------------------------------------------>>>>>>>>>11111111111 respons :   ", JSON.stringify(response, null, 2))

    let preparedResponse = [];


    for (var key in response) {
      if (response.hasOwnProperty(key)) {
        //console.log(key + " -> " + response[key]);
        if (response[key].includes(payload.channelname) && response[key].includes(payload.smartcontract)) {
          let collectionOject = {
            "label":key,
            "value":response[key]
          }
          preparedResponse.push(collectionOject)
        }
      }
    }
    console.log("------------------------------------------------>>>>>>>>>11111111111 preparedResponse :   ", JSON.stringify(preparedResponse, null, 2))



    const finalResponse = {
      "messageStatus": "OK",
      "messageId": uuid,
      "errorDescription": "Processed OK!",
      "errorCode": 200,
      "timestamp": moment().format("DD/MM/YYY hh:mm:ss.SSS"),
      "collectionNameList":preparedResponse
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
  couch
};

