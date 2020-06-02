'use strict';

const request = require('request');
const config = require('./config/config.json');
const WebSocket = require('ws');
const os = require("os");

function get(callback) {
  if (!config.discovery) {
    const options = {
      method: 'POST',
      url: config.keyVault.url,
      body: { env: config.keyVault.env, header: config.keyVault.header, svc: "cipher-replicator", pid: process.pid, hostname: os.hostname(), discoveryStatus: process.env.DISCOVERY },
      json: true
    };
    request(options, callback);
  } else {

    if (!global.discoveryws) {
      global.discoveryws = new WebSocket(config.keyVault.url)
    } else if (global.discoveryws.readyState != 1) {
      global.discoveryws = new WebSocket(config.keyVault.url)
    }
    getws(callback)

  }
}

function getws(callback) {

  if (global.discoveryws && global.discoveryws.readyState != 1) {
    global.discoveryws.on('open', function open() {
      console.log('Connected');
      sendRequest(1);
    });
  } else {
    sendRequest(2);
  }
  global.discoveryws.on('message', function incoming(data) {
    // implement health methods app.js
    let incData = JSON.parse(data);
    if (incData.type == 1 || incData.type == 2) {
      callback(undefined, undefined, incData);
    } else {
      switch (incData.type) {
        case 3:
          if (global.config) {
            let health = require('./core/utils/health');
            health.serverStatus((health) => {
              global.discoveryws.send(JSON.stringify({ type: 3, health: health, env: config.keyVault.env, header: config.keyVault.header }));
            })
          }
          break;
        case 4:
          if (global.config) {
            let health = require('./core/utils/health');
            health.configupdate();
          }
          break;
        case 5:
          if (global.config) {
            let health = require('./core/utils/health');
            health.exit();
          }
          break;
        default:
          console.log("Invalid OPCode from descovery!!")
          break;
      }
    }


  });

  global.discoveryws.on('close', function close() {
    console.log('disconnected');
    console.log('retrying after 5 seconds!!');
    setTimeout(get.bind(this, callback), 5000);
  });


  global.discoveryws.on('error', function exp(err) {
    console.log(err)
  });

}

function sendRequest(type) {
  let payload = { type: type, env: config.keyVault.env, header: config.keyVault.header, svc: "cipher-api", pid: process.pid, hostname: os.hostname(), discoveryStatus: process.env.DISCOVERY };
  global.discoveryws.send(JSON.stringify(payload));
}

module.exports = {
  get: get
};