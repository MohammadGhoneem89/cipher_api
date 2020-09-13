const Sequelize = require('sequelize');
const crypto = require('crypto');
const config = require('../../../config')
var SQExistingList = {};

const cryptoDec = require('../../../lib/helpers/crypto');
module.exports = async function (connection, issecure = false) {
  let connectionURL = connection || cryptoDec.decrypt(config.get('postgres.url')) || cryptoDec.decrypt(config.get('mssqlConfig'));
  let litmusSSL = connection ? issecure : config.get('sslForDatabase', issecure)
  const hash = crypto.createHash('md5').update(connectionURL).digest("hex");
  // console.log(parsedObj.port);

  // let parsedObj = url2obj(connectionURL);

  // console.log(parsedObj.port);
  // if (parsedObj.port)
  //   parsedObj.port = parseInt(parsedObj.port)
  const createNewInstance = async () => {
    const sequelize = new Sequelize(connectionURL, {
      define: {
        freezeTableName: true
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: true,
      ssl: litmusSSL,
      dialectOptions: {
        options: {
          encrypt: true,
        },
        ssl: litmusSSL ? {
          rejectUnauthorized: false
        } : undefined,
      }
    });
    await sequelize.authenticate();
    SQExistingList[hash] = sequelize;
  };

  if (SQExistingList[hash]) {
    console.log('Returning an existing SQ instance');
  } else {
    console.log('Creating a SQ instance');
    await createNewInstance();
  }
  return SQExistingList[hash];
};

function url2obj(url) {
  var pattern = /^(?:([^:\/?#\s]+):\/{2})?(?:([^@\/?#\s]+)@)?([^\/?#\s]+)?(?:\/([^?#\s]*))?(?:[?]([^#\s]+))?\S*$/;
  var matches = url.match(pattern);
  var params = {};
  if (matches[5] != undefined) {
    matches[5].split('&').map(function (x) {
      var a = x.split('=');
      params[a[0]] = a[1];
    });
  }

  return {
    protocol: matches[1],
    user: matches[2] != undefined ? matches[2].split(':')[0] : undefined,
    password: matches[2] != undefined ? matches[2].split(':')[1] : undefined,
    host: matches[3],
    hostname: matches[3] != undefined ? matches[3].split(/:(?=\d+$)/)[0] : undefined,
    port: matches[3] != undefined ? matches[3].split(/:(?=\d+$)/)[1] : undefined,
    segments: matches[4] != undefined ? matches[4].split('/') : undefined,
    params: params
  };
}
/*'use strict';

const _ = require('lodash');
const fs = require('fs');
const { resolve, basename, dirname } = require('path');
const events = require('events').EventEmitter;
const emitter = new events.EventEmitter();
const skipBottomLines = 0;
const skipLines = 1;
const Sequelize = require('sequelize');
var filename = "";
const { Op } = require("sequelize");

function makeModel(tableName) {
    let reconnectOptions = {
        max_retries: 999,
        onRetry: function (count) {
            console.log("connection lost, trying to reconnect (" + count + ")");
        }
    };
    const sequelize = new Sequelize('smiles', 'Admin', 'avanza123', {
        dialect: 'postgres',
        host: '23.97.138.116',
        port: '5432',
        reconnect: reconnectOptions || true,
        pool: {
            max: 20,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            freezeTableName: false,
            timestamps: false
        }
    });

    sequelize
        .authenticate()
        .then(() => {
            console.log('Connection has been established successfully.');
        })
        .catch(err => {
            console.error('Unable to connect to the database:', err);
        });



        postgresql://Admin:avanza123@23.97.138.116:5432/smiles?idleTimeoutMillis=3000000&max=1&connectionTimeoutMillis=0



        */