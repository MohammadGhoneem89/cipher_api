'use strict';
const _ = require('lodash');
const rp = require('request-promise');
const moment = require('moment');
const Base64 = require('js-base64').Base64;
let generalResponse = {
  "error": true,
  "message": "Failed to get response"
};
module.exports = class Endpoint {
  constructor(body) {
    this._requestBody = body;
  }
  executeEndpoint(endpoint, ServiceURI, ignoreBody) {
    let ServiceURL = "";
    if (endpoint.endpointName && endpoint._id) {
      ServiceURL = `${endpoint.address}${ServiceURI == '/' ? "" : ServiceURI}`;
    }
    else {
      ServiceURL = ServiceURI;
    }
    switch (endpoint.authType) {
      case "bearer":
        if (endpoint.auth.endpoint.auth.endpoint) {
          generalResponse.error = true;
          generalResponse.message = "Circualr JWT Request Cannot be Processed Please Check Endpoint!!";
          return Promise.resolve(generalResponse);
        };
        let tokenfield = _.get(endpoint, 'auth.field', undefined);
        if (!tokenfield) {
          generalResponse.error = true;
          generalResponse.message = "Token field not available Please Check Endpoint!!";
          return Promise.resolve(generalResponse);
        };
        return this.executeEndpoint(endpoint.auth.endpoint, true).then((data) => {
          console.info("-------------BEGIN Authorization Response--------------");
          console.info(JSON.stringify(data, null, 2));
          console.info("-------------END Authorization Response--------------");
          let tokenValue = _.get(endpoint, tokenfield, undefined);
          if (!tokenValue) {
            generalResponse.error = true;
            generalResponse.message = `Not able to fetch field from success authentication response | field : ${tokenfield}`;
            generalResponse.data = data;
            return Promise.resolve(generalResponse);
          }
          return this.executeBarerAuthEndpoint(endpoint, this._requestBody, ServiceURL, tokenValue).then((resp) => {
            if (resp.error === true) {
              return resp;
            }
            generalResponse.error = false;
            generalResponse.message = `Processed Ok!`;
            generalResponse.data = resp;
            return Promise.resolve(generalResponse);
          });
        }).catch((ex) => {
          console.log(ex);
          generalResponse.error = true;
          generalResponse.message = ex.message;
          return generalResponse;
        });
      case "noAuth":
        return this.executeNoAuthEndpoint(endpoint, this._requestBody, ServiceURL).then((resp) => {
          generalResponse.error = false;
          generalResponse.message = `Processed Ok!`;
          generalResponse.data = resp;
          return generalResponse;
        }).catch((ex) => {
          console.log(ex);
          generalResponse.error = true;
          generalResponse.message = ex.message;
          return generalResponse;
        });
      case "basicAuth":
        return this.executeBasicAuthEndpoint(endpoint, this._requestBody, ServiceURL).then((resp) => {
          generalResponse.error = false;
          generalResponse.message = `Processed Ok!`;
          generalResponse.data = resp;
          return generalResponse;
        }).catch((ex) => {
          console.log(ex);
          generalResponse.error = true;
          generalResponse.message = ex.message;
          return generalResponse;
        });
      default:
        break;
    }
  }
  executeNoAuthEndpoint(endpoint, body, url) {
    let header = this.computeHeaders(endpoint);
    return this.callWebService({
      serviceURL: url,
      body: body,
      headers: header
    });
  }
  executeBarerAuthEndpoint(endpoint, body, url, token) {
    let authorizationHeader;
    authorizationHeader = `Bearer ${token}`;
    let header = this.computeHeaders(endpoint);
    _.set(header, 'Authorization', authorizationHeader);
    return this.callWebService({
      serviceURL: url,
      body: body,
      headers: header
    });
  }
  executeBasicAuthEndpoint(endpoint, body, url) {
    let authorizationHeader;
    if (!endpoint.auth || endpoint.auth.username || endpoint.auth.password) {
      generalResponse.error = true;
      generalResponse.message = "Basic Authorization Credentials are required!!";
      return Promise.resolve(generalResponse);
    }
    authorizationHeader = `Basic ${Base64.encode(`${endpoint.auth.username}:${endpoint.auth.password}`)}`;
    let header = this.computeHeaders(endpoint);
    _.set(header, 'Authorization', authorizationHeader);
    return this.callWebService({
      serviceURL: url,
      body: body,
      headers: header
    });
  }
  computeHeaders(endpoint) {
    let header = {};
    let requestDate = new Date();
    if (endpoint.header) {
      endpoint.header.forEach((elem) => {
        switch (elem.headerType) {
          case "FixedValue":
            _.set(header, elem.headerKey, elem.headerPrefix);
            break;
          case "Datetime":
            let format = elem.headerPrefix || "DD/MM/YYYY hh:mm:ss";
            let datetime = moment(requestDate).format(format)
            _.set(header, elem.headerKey, `${datetime}`);
            break;
          case "DatetimeEpoch":
            _.set(header, elem.headerKey, `${elem.headerPrefix}${requestDate}`);
            break;
          case "UUID":
            _.set(header, elem.headerKey, `${elem.headerPrefix}${this._UUID}`);
            break;
          case "dynamicField":
            let dynifield = _.get(this._requestBody, elem.headerPrefix, "")
            _.set(header, elem.headerKey, `${dynifield}`);
            break;
          case "UUIDN":
            let rand = Math.floor(100000 + Math.random() * 900000);
            _.set(header, elem.headerKey, `${elem.headerPrefix}${rand}`);
            break;
          default:
            break;
        }
      });
    }
    return header;
  }
  callWebService(options) {
    let generalResponse = {
      "error": true,
      "message": "Failed to get response"
    };
    let rpOptions = {
      method: 'POST',
      url: options.serviceURL,
      body: options.body,
      // body: this.request,
      headers: options.headers,
      timeout: 10000, //  configurable
      json: true
    };
    return rp(rpOptions).then((data) => {
      if (data) {
        if (data.success === false) {
          throw new Error(data.message);
        }
        return data;
      }
      return generalResponse;
    });
  }

};