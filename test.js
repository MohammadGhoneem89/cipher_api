'use strict';
let customFunctions = require('./core/Common/customFunctions.js');
let constants = require('./core/Common/constants_en.js');
let validationFunctions = require('./core/Common/validationFunctions.js');
let flatten = require('flat');
let unflatten = require('flat').unflatten;
let validator = require('validator');
let typeOf = require('typeof');
let casting = require('casting');
const _ = require('lodash');
const rp = require('request-promise');
let td = {
  "ETEMP_placeHolders": [
    "$customerName",
    "$entityName",
    ""
  ],
  "ETEMP_templateTypes": [
    null,
    null
  ],
  "CTEMP_cardTypes": [
    "VISA",
    "MASTER",
    "Credit Card",
    "-"
  ],
  "CTEMP_feeTypes": [
    "Percentage",
    "Flat"
  ],
  "internalFields": [
    "card",
    "DGNo",
    "transDate",
    "amount",
    "balance",
    "status",
    "SE_Name",
    "debitAmount",
    "creditAmount",
    "paymentMethod",
    "spCode",
    "shortCode",
    "serviceCode",
    "refundAmount",
    "merchantID",
    "merchantName",
    "accountNumber",
    "cardNumber",
    "authCode",
    "commission",
    "PGRefNo",
    "ePayNo",
    "SPTRN"
  ],
  "fileTypes": [
    "CSV",
    "XLS",
    "XML",
    "JSON"
  ],
  "special": [
    "take12If14OrFull",
    "VALID_WHEN"
  ],
  "columnNos": [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30"
  ],
  "fileTemplateNames": [
    "59e4e74061d9558ada71732f",
    "59e4ef1261d9558ada71754b",
    "59e5aed29431b3a5d352f2a5",
    "59e5af4b9431b3a5d352f2c7"
  ],
  "CTEMP_categoryTypes": [
    "Credit Card-VISA",
    "Card-MasterCard",
    "Card-UPI",
    "Card-AMEX",
    "DirectDebit-ENBD",
    "DirectDebit-CBD",
    "DirectDebit-ADIB",
    "DirectDebit-EI",
    "Wallet-Naqoodi",
    "Edirham-Edirham",
    "Edirham-EDirhamG2",
    "Other-OneclickPay"
  ],
  "Audit_Events": [
    "UPDATE",
    "INSERT",
    "DELETE",
    "LOGININ",
    "LOGOUT",
    "INVALIDLOGIN"
  ],
  "Collections": [
    "Accounts",
    "Acquirer",
    "BackOfficeEntities",
    "CardType",
    "CommissionTemplate",
    "Documents",
    "Email Templates",
    "Group",
    "ImageUpload",
    "LogTransaction",
    "Notifications",
    "PasswordPolicy",
    "ReconAudit",
    "SettlementBank",
    "SettlementSetup",
    "TypeData",
    "User",
    "WorkingCalendar"
  ],
  "CommissionReason": [
    "Exceution as per SLA",
    "Commission Processed",
    "Comments1"
  ],
  "Tran_Status": [
    "Recieved",
    "Initiated",
    "Authorized",
    "Reconciled",
    "Failed"
  ],
  "Refund_Reasons": [
    "IT",
    "FD",
    "BT"
  ],
  "Payment_Method": [
    "99999",
    "10010",
    "10000",
    "10007",
    "10020",
    "10012",
    "10008"
  ],
  "Report_Format": [
    "Excel",
    "PDF",
    "WORD"
  ],
  "Payment_Gateway": [
    "200000",
    "200001",
    "99999",
    "200008",
    "200010",
    "200011",
    "200009",
    "200012",
    "200086",
    "200013",
    "200090",
    "200147",
    "200150",
    "200164"
  ],
  "Tran_Status_Filters": [
    "Reconciled",
    "Not Reconciled"
  ],
  "Exception_Type_Filters": [
    "SP-SDG",
    "DEG-PP",
    "SP-SDG-PP"
  ],
  "Payment_Channel": [
    "500",
    "104",
    "100",
    "101",
    "102",
    "103",
    "999"
  ],
  "Card_Type": [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "30",
    "31",
    "32",
    "37",
    "38"
  ],
  "RECON_STATUS": [
    "All",
    "Complete Match",
    "Match With Bank",
    "Match With SP",
    "REFUNDED"
  ],
  "PAYMENT_STATUS": [
    "All",
    "SUCCESS",
    "FAILED",
    "REFUNDED"
  ],
  "SETTLEMENT_STATUS": [
    "All",
    "Initiated",
    "Approved",
    "Posted",
    "Debit",
    "Disbursed"
  ],
  "COMMISSION_STATUS": [
    "All",
    "Initiated",
    "Approved",
    "Posted",
    "Debit",
    "Disbursed"
  ],
  "DISPUTE_STATUS": [
    "All",
    "Initiated",
    "Approved",
    "Rejected",
    "Forwaded"
  ],
  "Cipher_blockchainType": [
    "Quorum",
    "Ethereum",
    "Hyperledger Fabric",
    "Stellar",
    "Ripple",
    "Corda R3",
    "Iroha",
    "Sawtooth Lake"
  ],
  "reconDataTypes": [
    "string",
    "date",
    "datetime",
    "number",
    "decimal"
  ],
  "declarationType": [
    "0",
    "1"
  ],
  "countryList": [
    "UAE",
    "UK",
    "KSA",
    "USA"
  ],
  "exportDeclarationStatus": [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5"
  ],
  "modeOfPayment": [
    "Guarantee",
    "Cheque"
  ],
  "hsCode": [
    "01012110",
    "14049090",
    "17025000",
    "12024200",
    "04039010"
  ],
  "Cipher_smartContactStatus": [
    null,
    null
  ],
  "ORG_TYPES": [
    "OG1",
    "OG2"
  ],
  "EAU_OPERATOR": [
    "==",
    ">=",
    "<=",
    ">",
    "<"
  ],
  "DSR_TYPE": [
    "string",
    "integer",
    "integer",
    "boolean"
  ],
  "DFM_DATATYPE": [
    "string",
    "number",
    "number",
    "boolean",
    "array",
    "object"
  ],
  "DFM_FROMATTYPE": [
    "REQUEST",
    "RESPONSE"
  ],
  "DFM_REQFIELDTYPE": [
    "HCV",
    "UUID",
    "execFunctionOnData",
    "data"
  ],
  "DFM_RESFIELDTYPE": [
    "HCV",
    "UUID",
    "execFunctionOnData",
    "data"
  ],
  "API_Authtypes": [
    "JWT Auth",
    "Basic Auth"
  ],
  "API_ComMode": [
    "QUEUE",
    "REST"
  ],
  "API_ResponseMapping": [
    "WASL Response"
  ],
  "API_simulatorResponse": [
    "object"
  ],
  "KYCCheck": [
    "001",
    "002",
    "003",
    "004",
    "005"
  ],
  "InstrumentType": [
    "001 ",
    "002"
  ]
};
let request = {
  "body": { "EIDA": 'UAE', "EIDU": 'UK' },
  "searchCriteria": {
    "test": "testchar"
  },
  "body.EIDU": "USA",
  "page": {
    "pageSize": 10,
    "currentPageNo": 1,
    "sortData": "createdBy"
  }
};
let mapping = [
  {
    "Sequence": 3,
    "IN_FIELD": "body.EIDA",
    "IN_FIELDVALUE": "",
    "IN_FIELDTYPE": "data",
    "IN_FIELDDT": "string",
    "IN_FIELDFUNCTION": "STUB",
    "IN_FIELDVALIDATION": "bypass",
    "IN_FIELDDESCRIPTION": "EIDA token from WASL",
    "IN_ISREQUIRED": "Y",
    "MAP_FIELD": "EIDA",
    "MAP_FIELDDT": "string",
    "IN_FIELDTYPEDATA": "countryList"
  },
  {
    "Sequence": 3,
    "IN_FIELD": "body.EIDU",
    "IN_FIELDVALUE": "",
    "IN_FIELDTYPE": "data",
    "IN_FIELDDT": "string",
    "IN_FIELDFUNCTION": "STUB",
    "IN_FIELDVALIDATION": "bypass",
    "IN_FIELDDESCRIPTION": "EIDA token from WASL",
    "IN_ISREQUIRED": "Y",
    "MAP_FIELD": "EIDU",
    "MAP_FIELDDT": "string",
    "IN_FIELDTYPEDATA": "countryList"
  }
];

class ObjectMapper {
  constructor(req, mappingConfig, typeData, UUID) {
    this.request = req;
    this.flattenRequest = flatten(req);
    this.mappingConfig = mappingConfig;
    this.typeData = typeData;
    this.error = [];
    this.UUID = UUID;
  }
  DataTypeMatchCheck(type, value) {
    if (typeOf(value) === type) {
      return true;
    }
    return false;
  }
  validate(element) {
    return new Promise((resolve, reject) => {
      let value = _.get(this.request, element.IN_FIELD, null);
      if (!value && element.IN_ISREQUIRED == "Y") {
        reject(`${element.IN_FIELD} is Required!`);
      }
      else if (value) {
        let isTypeMatch = this.DataTypeMatchCheck(element.IN_FIELDDT, value);
        if (isTypeMatch === false) {
          reject(`${element.IN_FIELD} type should be ${element.IN_FIELDDT}!`);
        }

        if (element.IN_FIELDTYPEDATA) {
          let tdObj = _.get(this.typeData, element.IN_FIELDTYPEDATA, null);
          if (tdObj) {
            tdObj.indexOf(value) === -1 ? reject(`${element.IN_FIELD} must only be a part of following set [${tdObj}] !`) : null;
          }
          else {
            reject(`${element.IN_FIELD} for field Enumeration not found Enum ID [${element.IN_FIELDTYPEDATA}] !`);
          }
        }
      }
      this.CustomValidationCheck(element.IN_FIELDVALIDATION, element).then((result) => {
        if (result && result.error === true) {
          if (result.message) {
            reject(result.message);
          }
          else {
            reject(`${element.IN_FIELD} Custom validation Failed!`);
          }
        }
        return result;
      }).then((data) => {
        try {
          if (value !== false && !value) {
            return undefined;
          }
          let CastedValue = casting.cast(element.MAP_FIELDDT, value);
          if (element.MAP_FIELDDT === 'number' && isNaN(CastedValue)) {
            reject(`${element.IN_FIELD} unable to cast field to ${element.MAP_FIELDDT}!`);
          }
          else {
            return CastedValue;
          }
        }
        catch (ex) {
          reject(`${element.IN_FIELD} unable to cast field to ${element.MAP_FIELDDT}!`);
        }
      }).then((data) => {
        return this.CustomFunctionsExecution(data, this.request, element)
      }).then((data) => {
        resolve(data);
      }).catch((exp) => {
        console.log(`Custom Validation Failed for Field ${element.IN_FIELD}`);
        console.log(`ERROR: ${exp}`);
        reject(exp);
      });
    });
  }
  CustomFunctionsExecution(data, payload, config) {
    return Promise.resolve(data);
  }
  CustomValidationCheck(functionName, data) {
    let response = { 'error': false };
    return Promise.resolve(response);
  }
  getUUID() {
    return new Promise((resolve, reject) => {
      resolve(this.UUID);
    });
  }
  getHCV(tupple) {
    return new Promise((resolve, reject) => {
      resolve(tupple.IN_FIELDVALUE);
    });
  }
  start() {
    let promiseList = [];
    this.mappingConfig.forEach((element) => {
      if (element.IN_FIELDTYPE === 'data' || element.IN_FIELDTYPE === 'execFunctionOnData') {
        promiseList.push(this.validate(element));
      }
      else if (element.IN_FIELDTYPE === 'UUID') {
        promiseList.push(this.getUUID());
      }
      else if (element.IN_FIELDTYPE === 'HCV') {
        promiseList.push(this.getHCV(element));
      }
    });
    return Promise.all(promiseList).then((data) => {
      let fwdMessage = {};
      this.mappingConfig.forEach((element, index) => {
        _.set(fwdMessage, element.MAP_FIELD, data[index]);
      });
      return fwdMessage;
    });
  }
}
class Simulator {
  constructor(req, simuData) {
    this.request = req;
    this.sumudata = simuData;
  }
  getResponse() {
    return new Promise((resolve, reject) => {
      let generalResponse = {
        "error": true,
        "message": "general response not defined"
      };
      let CaseResponse;
      this.sumudata.forEach((obj) => {
        let value = _.get(this.request, obj.SimuField, null);
        if (!value && obj.SimuField.trim() === '*') {
          generalResponse = JSON.parse(obj.SimulatorResponse);
        }
        else if (String(value) === String(obj.SimuValue)) {
          CaseResponse = JSON.parse(obj.SimulatorResponse);
        }
      });
      if (CaseResponse) {
        resolve(CaseResponse);
      }
      else {
        resolve(generalResponse);
      }
    });
  }
}
let simudata = [
  {
    "SimulatorResponse": "{\n    \"result\":\"Yahoo!!\"\n}",
    "SimuValue": "UAE",
    "SimuField": "body.EIDA",
    "RuleName": "Success",
    "actions": [
      {
        "label": "Delete",
        "iconName": "fa fa-trash",
        "actionType": "COMPONENT_FUNCTION"
      },
      {
        "label": "Edit",
        "iconName": "fa fa-edit",
        "actionType": "COMPONENT_FUNCTION"
      }
    ]
  },
  {
    "SimulatorResponse": "{\n      \"field\":\"yahoo!!!\"\n}",
    "SimuValue": "*",
    "SimuField": "*",
    "RuleName": "General",
    "actions": [
      {
        "label": "Delete",
        "iconName": "fa fa-trash",
        "actionType": "COMPONENT_FUNCTION"
      },
      {
        "label": "Edit",
        "iconName": "fa fa-edit",
        "actionType": "COMPONENT_FUNCTION"
      }
    ]
  },
  {
    "SimulatorResponse": "{\n    \"result\":\"Oh Snap!!!\"\n}",
    "SimuValue": "USA",
    "SimuField": "body.EIDU",
    "RuleName": "Failure",
    "actions": [
      {
        "label": "Delete",
        "iconName": "fa fa-trash",
        "actionType": "COMPONENT_FUNCTION"
      },
      {
        "label": "Edit",
        "iconName": "fa fa-edit",
        "actionType": "COMPONENT_FUNCTION"
      }
    ]
  }];
class Dispatcher {
  constructor(req, configData, UUID, typeList) {
    this.request = req;
    this.configdata = configData;
    this.simucases = configData.simucases || [];
    this.UUID = UUID;
    this.typeList = typeList;
  }
  SendGetRequest() {
    return new Promise((resolve, reject) => {
      //  if simulated return response
      let getResponse;
      if (this.configdata.isSimulated && this.configdata.isSimulated === true) {
        let simu = new Simulator(request, simudata);
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
      resolve(generalResponse);
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

  connectQueueService(requestServiceQueue, responseQueue) {
    //  this.configdata.requestServiceQueue
    //  , this.responseQueue
    let generalResponse = {
      "error": false,
      "message": "Processed OK!"
    };
    return Promise.resolve(generalResponse);
  }

}

let configdata = {
  "CustomMappingFile": "",
  "MappingfunctionName": "",
  "RequestMapping": [
    {
      "Sequence": 3,
      "IN_FIELD": "body.EIDA",
      "IN_FIELDVALUE": "",
      "IN_FIELDTYPE": "data",
      "IN_FIELDDT": "string",
      "IN_FIELDFUNCTION": "STUB",
      "IN_FIELDVALIDATION": "bypass",
      "IN_FIELDDESCRIPTION": "EIDA token from WASL",
      "IN_ISREQUIRED": "Y",
      "MAP_FIELD": "EIDA",
      "MAP_FIELDDT": "string"
    },
    {
      "Sequence": 4,
      "IN_FIELD": "body.EIDU",
      "IN_FIELDVALUE": "",
      "IN_FIELDTYPE": "data",
      "IN_FIELDDT": "string",
      "IN_FIELDFUNCTION": "STUB",
      "IN_FIELDVALIDATION": "bypass",
      "IN_FIELDDESCRIPTION": "Contract ID token from WASL",
      "IN_ISREQUIRED": "Y",
      "MAP_FIELD": "contractId",
      "MAP_FIELDDT": "string"
    }
  ],
  "ResponseMapping": [
    {
      "Sequence": 1,
      "IN_FIELD": "__cipherUIErrorStatus",
      "IN_FIELDVALUE": "OK",
      "IN_FIELDTYPE": "data",
      "IN_FIELDDT": "string",
      "IN_FIELDFUNCTION": "STUB",
      "IN_FIELDVALIDATION": "bypass",
      "IN_FIELDDESCRIPTION": "",
      "IN_ISREQUIRED": "N",
      "MAP_FIELD": "messageStatus",
      "MAP_FIELDDT": "string"
    },
    {
      "Sequence": 2,
      "IN_FIELD": "__cipherExternalErrorStatus",
      "IN_FIELDVALUE": "",
      "IN_FIELDTYPE": "data",
      "IN_FIELDDT": "number",
      "IN_FIELDFUNCTION": "STUB",
      "IN_FIELDVALIDATION": "bypass",
      "IN_FIELDDESCRIPTION": "",
      "IN_ISREQUIRED": "N",
      "MAP_FIELD": "errorCode",
      "MAP_FIELDDT": "number"
    },
    {
      "Sequence": 3,
      "IN_FIELD": "__cipherMessage",
      "IN_FIELDVALUE": "",
      "IN_FIELDTYPE": "data",
      "IN_FIELDDT": "string",
      "IN_FIELDFUNCTION": "STUB",
      "IN_FIELDVALIDATION": "bypass",
      "IN_FIELDDESCRIPTION": "",
      "IN_ISREQUIRED": "N",
      "MAP_FIELD": "errorDescription",
      "MAP_FIELDDT": "string"
    },
    {
      "Sequence": 4,
      "IN_FIELD": "",
      "IN_FIELDVALUE": "",
      "IN_FIELDTYPE": "UUID",
      "IN_FIELDDT": "string",
      "IN_FIELDFUNCTION": "STUB",
      "IN_FIELDVALIDATION": "bypass",
      "IN_FIELDDESCRIPTION": "",
      "IN_ISREQUIRED": "N",
      "MAP_FIELD": "cipherMessageId",
      "MAP_FIELDDT": "string"
    },
    {
      "Sequence": 5,
      "IN_FIELD": "RouteList.data.WASL.RenewContract.description",
      "IN_FIELDVALUE": "",
      "IN_FIELDTYPE": "execFunctionOnData",
      "IN_FIELDDT": "string",
      "IN_FIELDFUNCTION": "getDate",
      "IN_FIELDVALIDATION": "bypass",
      "IN_FIELDDESCRIPTION": "",
      "IN_ISREQUIRED": "N",
      "MAP_FIELD": "timestamp",
      "MAP_FIELDDT": "string"
    }
  ],
  "ServiceURL": "http://104.211.155.19:10055/API/core/getActiveAPIList",
  "ServicePort": "",
  "authorization": "Basic Auth",
  "communicationMode": "REST",
  "createdBy": "5a07439653f81de88ccdd0bc",
  "description": "The Rest API can be used to add a renewal of the tenancy contract on the Blockchain along with installments, payment method and selected bank",
  "documentPath": "",
  "fieldName": "",
  "isActive": true,
  "isAsync": false,
  "isCustomMapping": false,
  "isRouteOveride": false,
  "isSimulated": false,
  "isValBypass": false,
  "isResValBypass": false,
  "requestServiceQueue": "BLA_Input_Queue",
  "responseQueue": "UI_Input_Queue",
  "simulatorResponse": "{\n                    \"messageStatus\": \"OK\",\n                    \"errorCode\": 200,\n                    \"errorDescription\": \"\",\n                    \"cipherMessageId\": \"c0a43490-df3f-11e7-a27c-4beb2ae22916\",\n                    \"timestamp\": \"22/09/2018 22:24:16.000\"\n}",
  "simucases": [
    {
      "SimulatorResponse": "{\n    \"result\":\"Yahoo!!\"\n}",
      "SimuValue": "2",
      "SimuField": "body.contractID",
      "RuleName": "Success",
      "actions": [
        {
          "label": "Delete",
          "iconName": "fa fa-trash",
          "actionType": "COMPONENT_FUNCTION"
        },
        {
          "label": "Edit",
          "iconName": "fa fa-edit",
          "actionType": "COMPONENT_FUNCTION"
        }
      ]
    },
    {
      "SimulatorResponse": "{\n      \"field\":\"yahoo!!!\"\n}",
      "SimuValue": "*",
      "SimuField": "*",
      "RuleName": "General",
      "actions": [
        {
          "label": "Delete",
          "iconName": "fa fa-trash",
          "actionType": "COMPONENT_FUNCTION"
        },
        {
          "label": "Edit",
          "iconName": "fa fa-edit",
          "actionType": "COMPONENT_FUNCTION"
        }
      ]
    },
    {
      "SimulatorResponse": "{\n    \"result\":\"Oh Snap!!!\"\n}",
      "SimuValue": "3",
      "SimuField": "body.contractID",
      "RuleName": "Failure",
      "actions": [
        {
          "label": "Delete",
          "iconName": "fa fa-trash",
          "actionType": "COMPONENT_FUNCTION"
        },
        {
          "label": "Edit",
          "iconName": "fa fa-edit",
          "actionType": "COMPONENT_FUNCTION"
        }
      ]
    }
  ]
};

class GeneralRequestProcessor {
  constructor(req, configdata, typeData, UUID, JWTokenData) {
    this.request = req;
    this.configdata = configdata;
    this.typeData = typeData;
    this.UUID = UUID;
    this.JWTokenData;
  }
  processIncommingMessage() {
    return new Promise((resolve, reject) => {
      let promiseList = [];
      let objMapper = new ObjectMapper(this.request, this.configdata.RequestMapping, this.typeData, this.UUID, this.JWTokenData);
      promiseList.push(objMapper.start());
      Promise.all(promiseList).then((data) => {
        let message;
        if (data.length > 0) {
          message = data[0];
          message.CipherJWT = this.JWTokenData;
        }
        else {
          message = request;
          message.CipherJWT = this.JWTokenData;
        }
        let controller = new Dispatcher(message, configdata, this.UUID, this.typeData, this.JWTokenData);
        return controller.SendGetRequest().then((response) => {
          resolve(response);
        });
      }).catch((ex) => {
        let successStatus = false;
        let responseObj = {
          __cipherSuccessStatus: successStatus,
          __cipherMessage: ex.message || ex,
          __cipherUIErrorStatus: constants.cipherUIFailure,
          __cipherExternalErrorStatus: constants.cipherExternalFailure,
          __cipherMetaData: constants.errRequestParsing
        };
        resolve(responseObj);
        console.log("ERROR_API: " + ex);
        console.log("ERROR_API: " + ex.stack);
      });
    });
  }
}
function main() {
  let millisecondsstart = (new Date()).getTime();
  let Cipher = new GeneralRequestProcessor(request, configdata, "UUID", td, "JWTokenData");
  Cipher.processIncommingMessage().then((response) => {
    if (configdata.isResValBypass === false) {
      let successStatus = true;
      if (!response.__cipherMessage) {
        _.set(response, '__cipherSuccessStatus', successStatus);
        _.set(response, '__cipherMessage', constants.cipherGeneralSuccess);
        _.set(response, '__cipherUIErrorStatus', constants.cipherUISuccess);
        _.set(response, '__cipherExternalErrorStatus', constants.cipherExternalSuccess)
      };
      let objMapper = new ObjectMapper(response, configdata.ResponseMapping, td, "UUID");
      return objMapper.start().then((mappedData) => {
        return mappedData;
      }).catch((ex) => {
        let errResponse = {};
        _.set(errResponse, '__cipherSuccessStatus', successStatus);
        _.set(errResponse, '__cipherMessage', ex);
        _.set(errResponse, '__cipherMetaData', constants.errResponseParsing);
        return errResponse;
      });
    }
    return response;
  }).then((data) => {
    let millisecondsend = (new Date()).getTime();
    console.log(`Message Processed In:  ${(millisecondsend - millisecondsstart)} ms`);
    console.log("Response Recieved: " + JSON.stringify(data));
  });

}
main();
