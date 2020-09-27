'use strict';
const rp = require('request-promise');
const uuid = require("uuid").v4();
const moment = require("moment");
const EndpointDefination = require('../../../lib/models/EndpointDefination');

// const transaction = require('../../lib/services/transaction');
// //const transaction = require('../../../lib/services/');

// function getTransactions(payload, UUIDKey, route, callback, JWToken) {
//   payload.userID = JWToken._id;
//   _getTransactions(payload, callback);
// }

// function _getTransactions(payload, callback) {
//   transaction.getConsolidateView(payload)
//     .then((transactions) => {
//       const response = {};
//       response[payload.action] = {
//         action: payload.action,
//         data: transactions
//       };
//       callback(response);
//     })
//     .catch((err) => {
//       callback(err);
//     });
// }




const getCollectionsList = async (payload, UUIDKey, route, callback, JWToken) => {

  console.log("------------------------------------------------>>>>> Payload: \n", JSON.stringify(payload, null, 2));



  console.log("------------------>>>>>>>>>>>>>>>> payload.endpoint : ", payload.endpoint);
  console.log("------------------>>>>>>>>>>>>>>>> payload.channelname : ", payload.channelname);
  console.log("------------------>>>>>>>>>>>>>>>> payload.smartcontract : ", payload.smartcontract);


  //==============Fetch EndPoint===================
  let query = {};
  let Endpoint;
  query["name"] = payload.endpoint;

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

  //==============Call Endpoint===================
  let externalApi = {
    method: 'GET',
    uri: Endpoint[0].address + "/_all_dbs",
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
          let readableName = ""
          readableName = response[key]
          readableName = readableName.substring(readableName.indexOf("$$") + 1)
          readableName = readableName.replace(/\$/g, '')
          let collectionOject = {
            "label": readableName,
            "value": response[key]
          }
          if (collectionOject.label.charAt(0) != 'h'){
            collectionOject.label = collectionOject.label.substring(1)
            preparedResponse.push(collectionOject)
          }
          
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
      "collectionNameList": preparedResponse
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

const getDocumentRevesions = async (payload, UUIDKey, route, callback, JWToken) => {

  console.log("------------------------------------------------>>>>> Payload: \n", JSON.stringify(payload, null, 2));



  console.log("------------------>>>>>>>>>>>>>>>> payload.endpoint : ", payload.endpoint);
  console.log("------------------>>>>>>>>>>>>>>>> payload.channelname : ", payload.channelname);
  console.log("------------------>>>>>>>>>>>>>>>> payload.smartcontract : ", payload.smartcontract);

  //http://Admin:avanza123@20.46.149.129:5984/vehiclechannel_rta_vehicle_project$$p$b$m$w_$v$c$c/_bulk_get?revs=true


  //==============Fetch EndPoint===================
  let query = {};
  let Endpoint;
  query["name"] = payload.endpoint;

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

  //==============Call Endpoint===================
  let externalApi = {
    method: 'POST',
    uri: Endpoint[0].address + "/" + payload.pvtcollection + "/_bulk_get?revs=true",
    headers: {
      //'Date': date,
      //'Authorization': authorisation,
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    body: {
      "docs": [
        {
          "id": payload.key
        }
      ]
    },

    json: true
  };

  console.log("----------------------------------------------->>>>>>>>> externalApi:  ", JSON.stringify(externalApi, null, 2));

  try {
    let response = await rp(externalApi)
    console.log("------------------------------------------------>>>>>>>>>11111111111 respons :   ", JSON.stringify(response, null, 2))

    let preparedResponse = [];
    let result = {};

    if (response && response.results && response.results[0].docs && response.results[0].docs[0].ok && response.results[0].docs && response.results[0].docs[0].ok._revisions.start) {
      console.log("=================>>>>>>>>>>>>>>>>>>>>  response.results[0].docs[0].ok._revisions.start : " , response.results[0].docs[0].ok._revisions.start)
      let start = 0
      start =  response.results[0].docs[0].ok._revisions.start
      
      let i;
      for (i = 0 ; i < response.results[0].docs[0].ok._revisions.start; i++) {
        externalApi.body.docs[0].rev  = start + "-" + response.results[0].docs[0].ok._revisions.ids[i]
        console.log("=================>>>>>>>>>>>>>>>>>>>>  response.results[0].docs[0].ok._revisions.IDs -->>"+ i + ": " , response.results[0].docs[0].ok._revisions.ids[i])
        let revResponse = await rp(externalApi)
        console.log("=================>>>>>>>>>>>>>>>>>>>>  revResponse -->>"+ start + ": " , JSON.stringify(externalApi, null, 2))
        if(i == 0){
          result["latest"] = revResponse.results[0].docs[0].ok
        }else{
          if(revResponse.results[0].docs[0].error){

          }else {
            result["rev-" + start] = revResponse.results[0].docs[0].ok
          }
          
        }
        
        start--;
      }
    }


    const finalResponse = {
      "messageStatus": "OK",
      "messageId": uuid,
      "errorDescription": "Processed OK!",
      "errorCode": 200,
      "timestamp": moment().format("DD/MM/YYY hh:mm:ss.SSS"),
      result
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

//exports.getTransactions = getTransactions;
exports.getCollectionsList = getCollectionsList;
exports.getDocumentRevesions = getDocumentRevesions;




