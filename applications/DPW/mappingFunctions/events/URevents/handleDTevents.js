
'use strict';
let rp = require('request-promise');
const config = require('../../../../../config');

async function handleDTevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    console.log("<<<<<<<<< Request Recieved for Event >>>>>>>>")
    console.log(JSON.stringify(payload, null, 2), "========> THIS IS PAYLOAD")

    switch (payload.eventData.eventName) {

      case "EventOnNewRegistration":
        {
          if (payload.eventData) {
            console.log("<<<<  EventOnNewRegistration >>>>>> ")
            try {
              await associateAliasFromCustID(payload, createApproveRegistration(payload))
            } catch (e) {
              console.log(e);
            }
            break;
            //1-  call createApproveReg
            //2-  let globalID=reponse.globalID
          }
        }
      case "EventOnDataChange":
        {
          if (payload.eventData.status == "TERMINATED") {
            try {
              await getPromise(payload, endRegistration(payload), callback)
            } catch (e) {
              console.log(e);
            }
            break;
            //1-  call ENDREG
          }
          else {
            try {
              await getPromise(payload, updateRegistration(payload), callback)
            } catch (e) {
              console.log(e);
            }
            break;
            //call updateRegistration
          }
        }

        default:
        callback({
          error: true,
          message: "invalid case",
          request: "",
          response: "invalid case"
        })
    }
    return Promise.resolve(true);
  }
  catch (err) {
    console.log(err.message);
    callback({
      error: true,
      message: err.message,
      request: "FAILED",
      response: err
    });
    return Promise.resolve(true);
  }

}



exports.handleDTevents = handleDTevents;

function createApproveRegistration(payload) {
  console.log("PAYLOAD=====================> ",
    payload.eventData, " <=====================PAYLOAD");

  return async () => {
    console.log("OUTPUT============================OUTPUT");
    //let url = config.get('URLRestInterface') || "http://0.0.0.0/";
    let options = {
      method: 'POST',
      // url: `${url}API/PR/UpdateContractStatus`,
      url: 'http://dtdev.dubaitrade.ae/umws/ws/umService.wsdl',
      body:
      {
        header: config.get('eventService.Avanza_ISC') || {
          username: "Internal_API",
          password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
        },
        body:
          //soap request body
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sch="http://dw.com/um/schema">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <sch:CreateApprovedRegistrationRequest>\r\n         <sch:request>\r\n            <sch:msgSeqId>?</sch:msgSeqId>\r\n            <sch:cosumerSystemSecureCode>?</sch:cosumerSystemSecureCode>\r\n            <sch:companyName>?</sch:companyName>\r\n            <sch:groupName>?</sch:groupName>\r\n            <sch:emirateId>?</sch:emirateId>\r\n            <sch:state>?</sch:state>\r\n            <sch:countryId>?</sch:countryId>\r\n            <sch:website>?</sch:website>\r\n            <sch:poBox>?</sch:poBox>\r\n            <sch:address>?</sch:address>\r\n            <sch:authtitle></sch:authtitle>\r\n            <sch:authFirstName></sch:authFirstName>\r\n            <sch:authMiddleName>?</sch:authMiddleName>\r\n            <sch:authLastName></sch:authLastName>\r\n            <sch:authDesig>?</sch:authDesig>\r\n            <sch:authcountryCode></sch:authcountryCode>\r\n            <sch:authareaCode></sch:authareaCode>\r\n            <sch:authtelephoneNumber></sch:authtelephoneNumber>\r\n            <sch:authMobilecountryCode>?</sch:authMobilecountryCode>\r\n            <sch:authMobileareaCode>?</sch:authMobileareaCode>\r\n            <sch:authMobileTelephoneNumber>?</sch:authMobileTelephoneNumber>\r\n            <sch:authEmail></sch:authEmail>\r\n            <sch:adminLoginId>?</sch:adminLoginId>\r\n            <sch:adminPassword>?</sch:adminPassword>\r\n            <sch:admintitle>?</sch:admintitle>\r\n            <sch:adminFirstName>?</sch:adminFirstName>\r\n            <sch:adminMiddleName>?</sch:adminMiddleName>\r\n            <sch:adminLastName>?</sch:adminLastName>\r\n            <sch:adminDesig>?</sch:adminDesig>\r\n            <sch:adminEmail>?</sch:adminEmail>\r\n            <sch:adminCompanycountryCode>?</sch:adminCompanycountryCode>\r\n            <sch:adminCompanyareaCode>?</sch:adminCompanyareaCode>\r\n            <sch:adminCompanyTelephoneNumber>?</sch:adminCompanyTelephoneNumber>\r\n            <sch:adminDirectcountryCode>?</sch:adminDirectcountryCode>\r\n            <sch:adminDirectareaCode>?</sch:adminDirectareaCode>\r\n            <sch:adminDirectTelephoneNumber>?</sch:adminDirectTelephoneNumber>\r\n            <sch:adminMobilecountryCode>?</sch:adminMobilecountryCode>\r\n            <sch:adminMobileareaCode>?</sch:adminMobileareaCode>\r\n            <sch:adminMobiletelephoneNumber>?</sch:adminMobiletelephoneNumber>\r\n            <sch:adminFaxcountryCode>?</sch:adminFaxcountryCode>\r\n            <sch:adminFaxareaCode>?</sch:adminFaxareaCode>\r\n            <sch:adminFaxNumber>?</sch:adminFaxNumber>\r\n            <sch:hintQuestion>?</sch:hintQuestion>\r\n            <sch:hintAnswer>?</sch:hintAnswer>\r\n            <sch:maxUsers>?</sch:maxUsers>\r\n            <!--1 or more repetitions:-->\r\n            <sch:agentDetails>\r\n               <sch:unitCode>?</sch:unitCode>\r\n               <sch:agentTypeCode>?</sch:agentTypeCode>\r\n               <sch:agentCode>?</sch:agentCode>\r\n               <sch:agentName>?</sch:agentName>\r\n            </sch:agentDetails>\r\n         </sch:request>\r\n      </sch:CreateApprovedRegistrationRequest>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>'
      },
      json: true
    };
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }
}

function updateRegistration(payload) {
  console.log("PAYLOAD=====================> ",
    payload.eventData, " <=====================PAYLOAD",
    payload.eventData.status, "<<<<<<<<<payload status");

  return async () => {
    //let url = config.get('URLRestInterface') || "http://0.0.0.0/";
    let options = {
      method: 'POST',
      // url: `${url}API/PR/UpdateContractStatus`,
      url: 'http://dtdev.dubaitrade.ae/umws/ws/umService.wsdl',
      body:
      {
        header: config.get('eventService.Avanza_ISC') || {
          username: "Internal_API",
          password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
        },
        body: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sch="http://dw.com/um/schema">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <sch:UpdateBusinessNameRequest>\r\n         <sch:request>\r\n            <sch:msgSeqId>?</sch:msgSeqId>\r\n            <sch:cosumerSystemSecureCode>?</sch:cosumerSystemSecureCode>\r\n            <sch:globalCustId>?</sch:globalCustId>\r\n            <sch:agentCode>?</sch:agentCode>\r\n            <sch:agentTypeCode>?</sch:agentTypeCode>\r\n            <sch:newBusinessName>?</sch:newBusinessName>\r\n         </sch:request>\r\n      </sch:UpdateBusinessNameRequest>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>'
      },
      json: true
    };
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }
}
function associateAlias(payload, globalCustId) {
  console.log("PAYLOAD=====================> ",
    payload.eventData, " <=====================PAYLOAD");

  return async () => {
    console.log("OUTPUT========================OUTPUT");
    //let url = config.get('URLRestInterface') || "http://0.0.0.0/";
    let options = {
      method: 'POST',
      // url: `${url}API/PR/associateAlias`,
      url: 'http://localhost:9082/API/UR/associateAlias',
      body:
      {
        header: config.get('eventService.Avanza_ISC') || {
          username: "Internal_API",
          password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
        },
        body: {
          "unifiedID": payload.eventData.unifiedID,
          "alias": [
            {
              "key": globalCustId,
              "type": ""
            }
          ]
        }
      },
      json: true
    };
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }
}

function endRegistration(payload) {
  console.log("PAYLOAD=====================> ",
    payload.eventData, " <=====================PAYLOAD",
    payload.eventData.status, "<<<<<<<<<payload status");

  return async () => {
    console.log("OUTPUT========================OUTPUT");
    //let url = config.get('URLRestInterface') || "http://0.0.0.0/";
    let options = {
      method: 'POST',
      // url: `${url}API/PR/UpdateContractStatus`,
      url: 'http://dtdev.dubaitrade.ae/umws/ws/umService.wsdl',
      body:
      {
        header: config.get('eventService.Avanza_ISC') || {
          username: "Internal_API",
          password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
        },
        body: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sch="http://dw.com/um/schema">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <sch:EndRegistrationRequest>\r\n         <sch:request>\r\n            <sch:msgSeqId>?</sch:msgSeqId>\r\n            <sch:cosumerSystemSecureCode>?</sch:cosumerSystemSecureCode>\r\n            <sch:agentCode>?</sch:agentCode>\r\n            <sch:agentType>?</sch:agentType>\r\n            <sch:globalCustId>?</sch:globalCustId>\r\n         </sch:request>\r\n      </sch:EndRegistrationRequest>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>'
      },
      json: true
    };
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }
}


async function associateAliasFromCustID(payload, func) {
  func().then(response => {
    if (response.globalCustId) {
      await getPromise(payload, associateAlias(payload, response.globalCustId), callback)
    }
  }).catch(err => {
    console.log("error : ", err);
  });
}
async function getPromise(payload, func, callback) {
  func().then(response => {
    if (response.globalCustId) {
      associateAlias(payload, response.globalCustId)
    }
    console.log(response, "RESPONSE");
    callback({
      error: false,
      message: payload.eventData.eventName + " Dispatched",
      response: response
    })
  }).catch(err => {
    console.log("error : ", err);
    callback({
      error: true,
      message: payload.eventData.eventName + " Failed",
      response: err
    })
  });
}


