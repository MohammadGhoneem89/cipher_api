const appConfig = global.config;
const logger = require('../../lib/helpers/logger')().app;
const pointer = require('json-pointer');
const rp = require('request-promise');

const config = require('../config');
const getURL = config.get('blockChainURL') + '/APII/ePay/InsertCommissionPolicy';
var database = require('../database/db');
database();


function GetPolicyForParty(commissionData, orgType, orgCode) {
    let policy = {
        "TemplateName": "",
        "CommissionType": "",
        "DiscountFrequencyPerBatch": 0,
        "Code": "",
        "Rules": []
    };

    let commissionRules = {
        "FeeType": "",
        "Category": "",
        "SubCategory": "",
        "StartDate": 0,
        "EndDate": 0,
        "MinValue": 0,
        "MaxValue": 0,
        "Rate": 0,
        "FlatValue": 0
    };

    let newObj = Object.assign({}, policy);

    newObj.TemplateName = commissionData.templateName
    newObj.DiscountFrequencyPerBatch = commissionData.discount
    newObj.CommissionType = orgType;
    newObj.Code = orgCode;

    for (let i = 0; i < commissionData.commissionDetails.length; i++) {
        let splitCom = commissionData.commissionDetails[i].categoryType.split('-');
        let newComRule = Object.assign({}, commissionRules);
        newComRule.FeeType = commissionData.commissionDetails[i].feeType.toUpperCase();
        newComRule.Category = splitCom[0];
        if (splitCom[1]) {
            newComRule.SubCategory = splitCom[1];
        }
        else {
            newComRule.SubCategory = splitCom[0];
        }
        newComRule.StartDate = new Date(commissionData.commissionDetails[i].startDate).getTime() / 1000;
        newComRule.EndDate = new Date(commissionData.commissionDetails[i].endDate).getTime() / 1000;
        newComRule.MinValue = parseInt(commissionData.commissionDetails[i].minVal);
        newComRule.MaxValue = parseInt(commissionData.commissionDetails[i].maxVal);
        newComRule.Rate = parseFloat(commissionData.commissionDetails[i].percentageRate);
        newComRule.FlatValue = parseFloat(commissionData.commissionDetails[i].flatRate);
        newObj.Rules.push(newComRule)
    }


    return newObj;


}


var getCommissionPolicy = function (commissionID) {
    return new Promise(function (resolve, reject) {
        logger.debug(" [ commissionPolicy ] commissionID : " + commissionID);


        let response = {
            policyData: []
        };

        if (commissionID.length > 0) {
            global.db.select('CommissionTemplate', {
                id: commissionID
            }, "", function (err, commissionData) {
                //console.log(JSON.stringify(commissionData) + "      COMMSISSION DATA > >  " + err, "==================================>YAHOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
                if (err) {
                    logger.debug(" [ commissionPolicy ] Error CommissionDATA : " + commissionID);
                    reject(response);
                }
                else {
                    commissionData = commissionData[0];
                    global.db.select("Entity", {
                        "commissionTemplate": commissionID
                    }, {
                        spCode: 1
                    }, function (err, entityData) {
                        if (err) {
                            logger.error(" [ commissionPolicy ] Error : " + err);
                        }
                        global.db.select("Acquirer", {
                            "commissionTemplate": commissionID
                        }, {
                            shortCode: 1
                        }, function (err, acquirerData) {
                            if (err) {
                                if (!entityData) {
                                    reject(response);
                                }
                                logger.error(" [ commissionPolicy ] Error : " + err);

                                for (let k = 0; k < entityData.length; k++) {
                                    let partyPolicy = GetPolicyForParty(commissionData, 'E', entityData[k].spCode)
                                    response.policyData.push(partyPolicy);
                                }


                            }
                            else {

                                for (let k = 0; k < entityData.length; k++) {
                                    let partyPolicy = GetPolicyForParty(commissionData, 'E', entityData[k].spCode)
                                    response.policyData.push(partyPolicy);
                                }
                                for (let l = 0; l < acquirerData.length; l++) {
                                    let partyPolicy = GetPolicyForParty(commissionData, 'A', acquirerData[l].shortCode)
                                    response.policyData.push(partyPolicy);
                                }


                                resolve(response)
                            }
                        });

                    });


                }
            })
        }
        else {
            logger.error(" [ commissionPolicy ] commissionID is not define : " + commissionID);
            reject(response);
        }
    });


}


function SendToBlockchain(body) {

console.log("Preparing the request for commission policy")
    var options = {
        method: 'POST',
        uri: getURL,
        body: Object.assign(body, {header: appConfig.authentications.avanzaISC}),
        json: true // Automatically stringifies the body to JSON
    };

console.log("Commission policy prepared successfully")

    rp(options)
        .then(function (parsedBody) {
            logger.info('==================== Blockchain call Successfully==================' + parsedBody);
        })
        .catch(function (err) {
            // POST failed...
            logger.error('==================== Blockchain call failed==================' + err);

        });

}


function findPolicy(commissionTemplateID) {
    getCommissionPolicy(commissionTemplateID)
        .then((res) => {
            let newData = {policyData: JSON.stringify(res.policyData)}
            SendToBlockchain(newData);
        })
        .catch((err) => {
            logger.error(JSON.stringify(err) + " > > > > > > ERROR");
        })
}

module.exports = {
    findPolicy: findPolicy,
    getCommissionPolicy: getCommissionPolicy
}

exports.getCommissionPolicy = getCommissionPolicy;
