/* eslint-disable eqeqeq */
/* eslint-disable no-console */
'use strict';

const _ = require('lodash');
const moment = require('moment');
const dates = require('../../../lib/helpers/dates');
const org = require('../../mappingFunctions/org/orgList');
const user = require('../../../lib/repositories/user');
const getOrderTranxID = require('../../../applications/STRATA/mappingFunctions/getOrderList/getTransactionID');

module.exports = {
    getOrgDetail,
    jsonParseNoError: (data, payload, jwt) => {
        try {
            return JSON.parse(data);
        } catch (ex) {
            console.log(ex);
            return {};
        }
    },
    validateInstrument: (data, payload, jwt) => {
        if (!(data instanceof Array)) {
            throw new Error("Instrumentation Field(s) missing");
        }
        data.forEach((element, index) => {
            if (!element.bankCode || !element.paymentMethod || !element.date || !element.amount) {
                throw new Error(`Mandotary Field(s) missing from array on index ${index}`);
            }
            element.date = dates.ddMMyyyyslash(element.date);
            element.amount = parseFloat(element.amount) || 0;
            element.providerMetaData = element.providerMetaData ? JSON.stringify(element.providerMetaData) : undefined;
            element.bankMetaData = element.bankMetaData ? JSON.stringify(element.bankMetaData) : undefined;
            element.beneficiaryData = element.beneficiaryData ? JSON.stringify(element.beneficiaryData) : undefined;
        });

        data = _.orderBy(data, ['date'], ['asc']);
        return data;
    },
    validateInstrumentObject: (data, payload, jwt) => {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>." + JSON.stringify(data));
        data.forEach((element, index) => {
            element.date = dates.ddMMyyyyslash(element.date);
            element.amount = parseFloat(element.amount) || 0;
            element.providerMetaData = element.providerMetaData ? JSON.stringify(element.providerMetaData) : undefined;
            element.bankMetaData = element.bankMetaData ? JSON.stringify(element.bankMetaData) : undefined;
            element.beneficiaryData = element.beneficiaryData ? JSON.stringify(element.beneficiaryData) : undefined;
        });
        return data;
    },
    translateInstrumentArray: (data, payload, jwt) => {
        try {
            let result = JSON.parse(data);
            let startDate = _.get(result, "contractStartDate", undefined);
            let EndDate = _.get(result, "contractEndDate", undefined);
            result.contractStartDate = startDate >= 0 ? dates.MSddMMyyyy(startDate) : undefined;
            result.contractEndDate = EndDate >= 0 ? dates.MSddMMyyyy(EndDate) : undefined;
            result.paymentInstruments.forEach((element, index) => {
                element.date = dates.MSddMMyyyy(element.date);
                element.amount = String(element.amount) || "0";
                element.providerMetaData = element.providerMetaData ? JSON.parse(element.providerMetaData) : undefined;
                element.bankMetaData = element.bankMetaData ? JSON.parse(element.bankMetaData) : undefined;
                element.beneficiaryData = element.beneficiaryData ? JSON.parse(element.beneficiaryData) : undefined;
            });
            return result;
        } catch (ex) {
            console.log(ex);
            return jsonParseNoError(data, payload, jwt);
        }
    },
    ParseContractDataForPM: (data, payload, jwt) => {
        try {
            let result = JSON.parse(data);
            let startDate = _.get(result, "contractStartDate", undefined);
            let EndDate = _.get(result, "contractEndDate", undefined);
            result.contractStartDate = startDate >= 0 ? dates.MSddMMyyyy(startDate) : undefined;
            result.contractEndDate = EndDate >= 0 ? dates.MSddMMyyyy(EndDate) : undefined;

            result.paymentInstruments.forEach((element, index) => {
                element.date = dates.MSddMMyyyy(element.date);
                element.amount = String(element.amount) || "0";
                element.providerMetaData = element.providerMetaData ? JSON.parse(element.providerMetaData) : undefined;
                element.bankMetaData = element.bankMetaData ? JSON.parse(element.bankMetaData) : undefined;
                element.beneficiaryData = element.beneficiaryData ? JSON.parse(element.beneficiaryData) : undefined;

                _.set(element, 'contractID', undefined);
                _.set(element, 'documentName', undefined);
                _.set(element, 'key', undefined);
                _.set(element, 'failureReason', undefined);
            });

            _.set(result, 'documentName', undefined);
            _.set(result, 'key', undefined);
            _.set(result, 'EIDA', undefined);
            _.set(result, 'instrumentList', undefined);
            _.set(result, 'instrumentDetail', undefined);
            _.set(result, 'checkKYCStatus', undefined);
            _.set(result, 'contractSignedHash', undefined);
            _.set(result, 'ejariData.contractID', undefined);
            _.set(result, 'terminationDate', undefined);
            _.set(result, 'terminationReason', undefined);
            _.set(result, 'tranDate', undefined);

            _.set(result, 'businessPartnerNo', _.get(result, "businessPartnerNumber", undefined));
            _.set(result, 'businessPartnerNumber', undefined);

            return result;

        } catch (ex) {
            console.log(ex);
            return jsonParseNoError(data, payload, jwt);
        }
    },

    ParseContractDataForBank: async(data, payload, jwt) => {
        try {
            let result = JSON.parse(data);

            let activities = _.get(result, "activities", []);
            let orderDate = _.get(result, "orderDate", undefined);
            let receivedDate = _.get(result, "receivedDate", undefined);
            let txnID = await getTxnID(result.orderID);
            result.tranxID = txnID;
            let subOrder = _.get(result, "subOrder", undefined);
            result.activities = activities.map(activity => {
                activity.date = dates.MSddMMyyyyHHmmSS(validateEpoch(activity.date));
                return activity;
            })
            result.orderDate = orderDate && orderDate >= 0 ? dates.MSddMMyyyyHHmmSS(orderDate) : undefined;

            result.receivedDate = receivedDate && receivedDate >= 0 ? dates.MSddMMyyyyHHmmSS(validateEpoch(receivedDate)) : undefined;
            delete result.documentName;
            delete result.key;

            let invoice = _.get(result, "invoice", undefined);
            result.invoice = invoice;

            let creditNotes = _.get(result, "creditNotes", undefined);
            result.creditNotes = creditNotes;

            result.statusList = getStatusList(result.status, result.activities)[0];
            let optionalstatus = getStatusList(result.status, result.activities)[1];
            result.actionButtons = getActionButtons(result.status, jwt.orgType, optionalstatus);

            let promisesList = [getOrgDetail(result.customerID, jwt), user.findOne({
                userID: result.raisedBy
            })]
            let promisesResult = await Promise.all(promisesList);

            let entity = _.get(promisesResult[0], "entityList.data.searchResult", undefined)
            if (entity && entity.length) {
                let entityData = entity[0] || undefined;
                if (entityData && !_.isEmpty(entityData)) {
                    result.entityName = _.get(entityData, "entityName.name", "");
                    result.entityLogo = _.get(entityData, "entityLogo.sizeSmall", "");
                }
            }

            let userData = promisesResult[1] || undefined;

            if (userData && !_.isEmpty(userData)) {

                result.raisedByName = _.get(userData, "firstName", "") + ' ' + _.get(userData, "lastName", "");
                result.raisedByPic = _.get(userData, "profilePic", "");
            }

            if (jwt.orgType === "CUSTOMER") {
                delete result.subOrder
            }

            return result;
        } catch (ex) {
            console.log(ex);
            return jsonParseNoError(data, payload, jwt);
        }
    },

    ParseContractDataForEjari: (data, payload, jwt) => {
        let result = JSON.parse(data);
        let contract = {};
        let startDate = _.get(result, "contractStartDate", undefined);
        let EndDate = _.get(result, "contractEndDate", undefined);
        result.contractStartDate = startDate >= 0 ? dates.MSddMMyyyy(startDate) : undefined;
        result.contractEndDate = EndDate >= 0 ? dates.MSddMMyyyy(EndDate) : undefined;
        _.set(contract, 'contractID', result.contractID || "");
        _.set(contract, 'contractAmount', result.contractAmount || "");
        _.set(contract, 'contractStartDate', result.contractStartDate || "");
        _.set(contract, 'contractEndDate', result.contractEndDate || "");
        _.set(contract, 'oldEjariNumber', result.oldEjariNumber || "");
        _.set(contract, 'paymentCount', result.paymentCount || "");
        _.set(contract, 'userReferenceNo', result.userReferenceNo || "");

        return contract;

    },

    ParseKYCDetailGDRFA: (data, payload, jwt) => {
        console.log("THIS IS MY VALUE---------->", data);

        try {
            let result = data;

            let dateOfBirth = _.get(result, "dateOfBirth", undefined);
            let natIdExpDate = _.get(result, "natIdExpDate", undefined);
            let passportIssueDate = _.get(result, "passport.passportIssueDate", undefined);
            let passportExpiryDate = _.get(result, "passport.passportExpiryDate", undefined);
            let visaIssueDate = _.get(result, "visaIssueDate", undefined);
            let visaExpiryDate = _.get(result, "visaExpiryDate", undefined);
            let lastSyncDate = _.get(result, "lastSyncDate", undefined);

            _.get(result, "dateOfBirth", dateOfBirth >= 0 ? dates.MSddMMyyyy(dateOfBirth) : undefined);
            _.get(result, "natIdExpDate", natIdExpDate >= 0 ? dates.MSddMMyyyy(natIdExpDate) : undefined);
            _.get(result, "passport.passportIssueDate", passportIssueDate >= 0 ? dates.MSddMMyyyy(passportIssueDate) : undefined);
            _.get(result, "passport.passportExpiryDate", passportExpiryDate >= 0 ? dates.MSddMMyyyy(passportExpiryDate) : undefined);
            _.get(result, "visaIssueDate", visaIssueDate >= 0 ? dates.MSddMMyyyy(visaIssueDate) : undefined);
            _.get(result, "visaExpiryDate", visaExpiryDate >= 0 ? dates.MSddMMyyyy(visaExpiryDate) : undefined);
            _.get(result, "lastSyncDate", lastSyncDate >= 0 ? dates.MSddMMyyyy(lastSyncDate) : undefined);

            _.set(result, 'emiratesIDExpiryDate', undefined);
            _.set(result, 'phoneNo', _.get(result, "phoneNO", undefined));
            _.set(result, 'phoneNO', undefined);

            _.set(result, 'natId', _.get(result, "natID", undefined));
            _.set(result, 'natID', undefined);

            _.set(result, 'natIdExpDate', _.get(result, "natIDExpDate", undefined));
            _.set(result, 'natIDExpDate', undefined);

            return result;

        } catch (ex) {
            console.log(ex);
            return jsonParseNoError(data, payload, jwt);
        }
    },

    ParseKYCDetailSDG: (data, payload, jwt) => {
        try {
            let result = data;
            let sdgVisaExpiryDate = _.get(result, "visaExpiryDate", undefined);
            _.set(result, "visaExpiryDate", sdgVisaExpiryDate >= 0 ? dates.MSddMMyyyy(sdgVisaExpiryDate) : undefined);
            return result;

        } catch (ex) {
            console.log(ex);
            return jsonParseNoError(data, payload, jwt);
        }
    },
    ValidateItems: (items, payload, jwt) => {
        console.log(">>>>>>>>>>>items\n", items);
        try {
            if (items == undefined || items.length == 0) {
                throw new Error("Atleast one item is required to place the order!!!");
            }

            items.forEach((element) => {
                if (element.itemCode == undefined || !element.itemCode.trim().length) {
                    throw new Error("item code is required !!");

                }
                if (!element.quantity || element.quantity <= 0) {
                    throw new Error("item quantity is required and should be greater than zero!!");
                }
                if (element.color == undefined || element.color.length == 0) {
                    throw new Error("item color is required!!");
                }
            });

            return items;
        } catch (ex) {
            console.log(ex);
            return {};
        }
    }
};

function jsonParseNoError(data, payload, jwt) {
    try {
        return JSON.parse(data);
    } catch (ex) {
        // console.log(ex);
        return {};
    }
}

function validateEpoch(val) {
    return val * 1000
}

function getStatusList(status, activities) {

    let optionalstatus = true;
    // for (let i = 0; i < activities.length; i++) {
    //     if (activities[i].status == '007') {
    //         optionalstatus = false;
    //         break;
    //     }
    // }
    let orderReceived = "001",
        purchaseOrder = "002",
        componentManufacturing = "003",
        partIdentification = "004",
        partInspection = "005",
        finalInspectionAndIdentification = "006",
        partTested = "007",
        assembly = "008",
        paintOrFinish = "009",
        dispatched = "010",
        received = "011",
        inspected = "012",
        accepted = "013",
        rejected = "014",
        reviewed = "015",
        concession = "016",
        scrapped = "017",
        paymentOrder = "018",
        paid = "019";

    let statusList = [{
            label: "Order Received",
            status: false
        },
        {
            label: "Purchase Order",
            status: false
        },
        {
            label: "Manufacturing Status",
            status: false
        },
        {
            label: "Dispatched",
            status: false
        },
        {
            label: "Received",
            status: false
        },
        {
            label: "Inspected",
            status: false
        },
        {
            label: "Accepted/Rejected",
            status: false
        },
        {
            label: "Payment Order",
            status: false
        },
        {
            label: "Paid",
            status: false
        }
    ];

    if (status === orderReceived) {
        statusList[0].status = true;
    } else if (status === purchaseOrder) {
        statusList[0].status = true;
        statusList[1].status = true;
    } else if (status === componentManufacturing) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].label = "Component Manufacturing";
        statusList[2].text = "20%";
    } else if (status === partIdentification) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].label = "Part Identification";
        statusList[2].text = "40%";
    } else if (status === partInspection) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].label = "Part Inspection";
        statusList[2].text = "60%";
    } else if (status === finalInspectionAndIdentification) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].label = "Final Inspection";
        statusList[2].text = "80%";
    } else if (status === partTested) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].label = "Part Tested";
        statusList[2].text = "85%";
        // true for any option selected
        statusList[2].status = true;
    } else if (status === assembly) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].label = "Assembly";
        statusList[2].text = "95%";
        // true for any option selected
        statusList[2].status = true;
    } else if (status === paintOrFinish) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].label = "Paint/Finish";
        // true for any option selected
        statusList[2].status = true;
    } else if (status === dispatched) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].status = true;
        statusList[3].status = true;
    } else if (status === received) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].status = true;
        statusList[3].status = true;
        statusList[4].status = true;
    } else if (status === inspected) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].status = true;
        statusList[3].status = true;
        statusList[4].status = true;
        statusList[5].status = true;
    } else if (status === accepted) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].status = true;
        statusList[3].status = true;
        statusList[4].status = true;
        statusList[5].status = true;
        statusList[6].status = true;
        statusList[6].label = "Accepted";
    } else if (status === rejected) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].status = true;
        statusList[3].status = true;
        statusList[4].status = true;
        statusList[5].status = true;
        statusList[6].status = true;
        statusList[6].label = "Rejected";
    } else if (status === reviewed) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].status = true;
        statusList[3].status = true;
        statusList[4].status = true;
        statusList[5].status = true;
        statusList[6].status = true;
        statusList[6].label = "Reviewed";
    } else if (status === concession) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].status = true;
        statusList[3].status = true;
        statusList[4].status = true;
        statusList[5].status = true;
        statusList[6].status = true;
        statusList[6].label = "Concession";
    } else if (status === scrapped) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].status = true;
        statusList[3].status = true;
        statusList[4].status = true;
        statusList[5].status = true;
        statusList[6].status = true;
        statusList[6].label = "Scrapped";
    } else if (status === paymentOrder) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].status = true;
        statusList[3].status = true;
        statusList[4].status = true;
        statusList[5].status = true;
        statusList[6].status = true;
        statusList[6].label = getStagePriorToPaymentOrder(activities) == inspected ? "Accepted" : "Concession";
        statusList[7].status = true;
    } else if (status === paid) {
        statusList[0].status = true;
        statusList[1].status = true;
        statusList[2].status = true;
        statusList[3].status = true;
        statusList[4].status = true;
        statusList[5].status = true;
        statusList[6].status = true;
        statusList[6].label = getStagePriorToPaymentOrder(activities) == inspected ? "Accepted" : "Concession";
        statusList[7].status = true;
        statusList[8].status = true;
    }
    return [statusList, optionalstatus];
}

function getStagePriorToPaymentOrder(activities) {
    let stage = _.result(_.find(activities, (activity) => {
        return activity.toStage === "018";
    }), 'fromStage');
    return stage;
}

function getActionButtons(status, orgType, optionalstatus) {
    if (status === "001" && (orgType === "CUSTOMER")) { // Todo: To be applied for customer
        return [actionButtonObj(1, "Purchase Order", "002", "CUSTOMER")]
    } else if (status === "002" && (orgType === "SUPPLIER")) {
        return [actionButtonObj(1, "Component Manufacture", "003", orgType)]
    } else if (status === "003" && (orgType === "SUPPLIER")) {
        return [actionButtonObj(1, "Part Identification", "004", orgType)]
    } else if (status === "004" && (orgType === "SUPPLIER")) {
        return [actionButtonObj(1, "Part Inspection", "005", orgType)]
    } else if (status === "005" && (orgType === "SUPPLIER")) {
        return [actionButtonObj(1, "Final Inspection and Indentification", "006", orgType)]
    } else if ((status === "006" || status === "007" || status === "008" || status === "009") && (orgType === "SUPPLIER")) {
        return [actionButtonObj(2, "Manufacturing Sub-Status", "007", orgType),
                actionButtonObj(1, "Dispatched", "010", orgType)
            ]
            // if (optionalstatus) {
            //     return [actionButtonObj(2, "Manufacturing Sub-Status", "007", orgType),
            //         actionButtonObj(1, "Dispatched", "010", orgType)
            //     ]
            // } else return [actionButtonObj(1, "Dispatched", "010", orgType)]

    } else if (status === "010" && (orgType === "CUSTOMER")) {
        return [actionButtonObj(3, "Received", "011",orgType )]
    } else if (status === "011" && (orgType === "CUSTOMER")) {
        return [actionButtonObj(1, "Inspected", "012", orgType)]
    } else if (status === "012" && (orgType === "CUSTOMER")) {
        return [actionButtonObj(1, "Accepted", "013", orgType), actionButtonObj(1, "Rejected", "014", orgType)]
    } else if (status === "014" && (orgType === "CUSTOMER")) {
        return [actionButtonObj(1, "Reviewed", "015", orgType)]
    } else if (status === "015" && (orgType === "CUSTOMER")) {
        return [actionButtonObj(1, "Concession", "016", orgType), actionButtonObj(1, "Scrapped", "017", orgType)]
    } else if (status === "018" && (orgType === "SUPPLIER")) {
        return [actionButtonObj(1, "Paid", "019", orgType)]
    } else return []
}

function actionButtonObj(type, label, status, processor) {
    return {
        type,
        label,
        status,
        processor
    };
}

function getOrgDetail(customerID, jwt) {
    return new Promise((resolve, reject) => {
        org.entityListOut({
            action: "entityList",
            page: {
                currentPageNo: 1,
                pageSize: 10
            },
            searchCriteria: {
                spCode: customerID
            }
        }, undefined, undefined, res => {
            resolve(res)
        }, jwt);
    })
}


function getTxnID(orderID) {
    const transactionID = getOrderTranxID.getOrderTranxID(orderID);
    return transactionID
        .then((txnID) => {
            return txnID.txnid;
        })
        .catch((err) => {
            return err;
        });
}