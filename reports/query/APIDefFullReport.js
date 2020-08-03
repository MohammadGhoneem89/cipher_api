'use strict';

const APIDefinition = require('../../lib/repositories/apiDefination');
const dates = require('../../lib/helpers/dates');
const _ = require('lodash');

function APIDefFullReport(payload) {
    let criteria = {};
    if(!_.isEmpty(payload.query)){
        if(!_.isEmpty(payload.query.useCase)){
            criteria.useCase = _.get(payload.query,'useCase.$in[0]','');
        }
    }

    return APIDefinition.getActiveAPIsData(criteria)
        .then((data) => {
            let resp = {};
            data.forEach((data) => {
                let dest = data.useCase + "." + data.route;
                let reqMap = [];
                data.RequestMapping.fields.forEach((field) => {
                    if (field.IN_FIELDTYPE === "data" || field.IN_FIELDTYPE === "execFunctionOnData") {
                        reqMap.push(field);
                    }
                });
                let resMap = [];
                data.ResponseMapping.fields.forEach((field) => {
                    resMap.push(field);
                });
                data.ResponseMapping = resMap;
                data.RequestMapping = reqMap;
                let groupedRoute = _.omit(data, 'route', 'useCase');
                _.set(resp, dest, groupedRoute);
            });
            let finalData = getMappingField(resp);
            finalData = formating(finalData);

            return {
                totalTransactions: 0,
                criteria: payload.criteria,
                couchData: finalData,
                content: payload.content
            };

        }).catch((err) => {
            return err;
        });

}

function getMappingField(APIData){
    let routemap = APIData;
    let reqSample = undefined;
    for (let useCase in routemap) {
        for (let route in routemap[useCase]) {
            let request = {};
            let requestPG = {};
            let response = {};

            if (routemap[useCase][route].isValBypass === false) {
                routemap[useCase][route].RequestMapping.forEach(element => {
                    _.set(request, element.IN_FIELD, `${element.IN_FIELDDT}`);
                    _.set(requestPG, element.IN_FIELD, `${element.IN_FIELDDT}`);
                });
                routemap[useCase][route].ResponseMapping.forEach(element => {
                    _.set(response, element.MAP_FIELD, `${element.MAP_FIELDDT}`);
                });
            } else {
                routemap[useCase][route].ResponseMapping = [];
                routemap[useCase][route].RequestMapping = []
            }

            if (routemap[useCase][route].isSimulated === true) {
                response = routemap[useCase][route].simulatorResponse;
            }
            reqSample = routemap[useCase][route].sampleRequest;
            _.set(routemap, `${useCase}.${route}.requestSchema`, request);
            _.set(routemap, `${useCase}.${route}.responseSchema`, response);
        }

    }
    return routemap;
}

function formating(APIsData){
    let finalData = [];
    for(let useCase in APIsData){
        for(let route in APIsData[useCase]){
            let formatedData = {};
            formatedData.route = route;
            formatedData.description = APIsData[useCase][route].description;
            formatedData.authorization = APIsData[useCase][route].authorization;
            formatedData.url =  useCase + "/" + route;
            formatedData.RequestMapping = APIsData[useCase][route].RequestMapping;
            formatedData.ResponseMapping = APIsData[useCase][route].ResponseMapping;
            formatedData.simucases = APIsData[useCase][route].simucases;
            for (let simus of formatedData.simucases) {
                if(_.isString(simus.SimulatorResponse)){
                    simus.SimulatorResponse = JSON.parse(simus.SimulatorResponse);
                }
                simus.SimulatorResponse = JSON.stringify(simus.SimulatorResponse,null, ' ');
            }
            formatedData.simulatorResponse= APIsData[useCase][route].simulatorResponse;
            formatedData.requestSchema= JSON.stringify(APIsData[useCase][route].requestSchema,null, ' ');
            if(_.isString(APIsData[useCase][route].requestSchema)){
                formatedData.requestSchema= APIsData[useCase][route].requestSchema;
            }else{
                formatedData.requestSchema= JSON.stringify(APIsData[useCase][route].requestSchema,null, ' ');
            }
            if(_.isString(APIsData[useCase][route].responseSchema)){
                formatedData.responseSchema= APIsData[useCase][route].responseSchema;
            }else{
                formatedData.responseSchema= JSON.stringify(APIsData[useCase][route].responseSchema,null, ' ');
            }

            finalData.push(formatedData);
        }
    }

    return finalData;
}

module.exports = APIDefFullReport;

