'use strict';

const logger = require('../../../lib/helpers/logger')();
const projection = require('../projection');
const _ = require('lodash');
let getActiveAPIList = require('../../../core/mappingFunctions/systemAPI/APIDefination');

function apiList(payload) {

    return new Promise(function(resolve, reject) {

       getActiveAPIList.getActiveAPIList(payload, "", "", function(err,data){
           if(err){
               reject(err);
           }
           else{
               let RouteList = formatData(data);
               let finalData = getDocumentation(RouteList);
               resolve(finalData);
           }
       }, "")
    });
}

function formatData(data) {

    let routemap = data || {};
    if (data) {

        let reqSample=undefined;
        for (let useCase in routemap) {
            for (let route in routemap[useCase]) {
                let request = {}
                let requestPG = {}
                let response = {}

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
                    response = JSON.parse(routemap[useCase][route].simulatorResponse);
                }
                reqSample = routemap[useCase][route].sampleRequest
                _.set(routemap, `${useCase}.${route}.requestSchema`, request)
                _.set(routemap, `${useCase}.${route}.responseSchema`, response)

            }
        }
        return routemap;
    }

}

function getDocumentation(RouteList) {
    let resp = {};
    for (let useCase in RouteList) {
        for (let route in RouteList[useCase]) {
            resp.useCase = useCase;
            resp.route = route;
            let request = this.state.request;
            if (!this.state.request)
                request = _.get(this.state.RouteList, `${useCase}.${route}.requestSchema`, null);

            let response = this.state.response;
            if (!this.state.response)
                response = _.get(this.state.RouteList, `${useCase}.${route}.responseSchema`, null);
            resp.request = request;
            resp.response = response;
            resp.initialValues = RouteList[useCase][route]

            }
    }
    return (resp);
}

module.exports = apiList;

