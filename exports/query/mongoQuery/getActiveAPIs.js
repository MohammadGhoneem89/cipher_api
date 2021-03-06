'use strict';

const projection = require('../projection');
const APIDefinition = require('../../../lib/repositories/apiDefination');
const groupRepo = require('../../../lib/repositories/group');
const userRepo = require('../../../lib/repositories/user');
const dates = require('../../../lib/helpers/dates');
const _ = require('lodash');

function getActiveAPIs(body,JWT) {
    let resp = {
        "responseMessage": {
            "action": "upsertAPIDefinition",
            "data": {
                "message": {
                    "status": "ERROR",
                    "errorDescription": "UseCase or Organization must be provided!!",
                    "displayToUser": true,
                    "newPageURL": ""
                }
            }
        }
    };
    if (_.isEmpty(body.useCase)) {
        return resp;
    }
    if (_.isEmpty(body.orgTypes)) {
        return resp;
    }

    function checkGroupRoutes(response, apiDef, groups){
        if(_.isEmpty(apiDef)){
            return Promise.resolve(response);
        }
        let api = apiDef.splice(0,1);
        api = api[0] || {};
        let uri = '/'+_.get(api, 'route', '');
        let query = {
            _id: {
                $in: groups
            },
            permissions: {
                $elemMatch: {
                    children: {
                        $elemMatch: {
                            URI: uri
                        }
                    }
                }
            }
        };
        return groupRepo.find(query)
            .then((res) =>{
                if(!_.isEmpty(res)){
                    response.push(api);
                }
                return checkGroupRoutes(response, apiDef, groups);
            });
    }


    return Promise.all([
            APIDefinition.getActiveAPIsData({useCase : body.useCase}),
            userRepo.findAll({orgType : body.orgTypes})
        ])
        .then((data) => {

            let groups = _.flatMap(_.map(_.get(data, '[1]', []), 'groups'));
            let routes = _.get(data, '[0]', []);

            return checkGroupRoutes([], routes, groups)
                .then((res)=>{
                    let resp = {};
                    res.forEach((data) => {
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
                        useCaseLabel : body.useCaseLabel,
                         organization : body.orgTypes,
                         finalData : finalData,
                         entityLabel : body.entityLabel

                    };

                });


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



module.exports = getActiveAPIs;

