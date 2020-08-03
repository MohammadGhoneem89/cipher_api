const Sequelize = require('sequelize');
const crypto = require('crypto');
const config = require('../../../config')
var SQExistingList = {};

const cryptoDec = require('../../../lib/helpers/crypto');
module.exports = async function (connection, issecure = false) {
  let connectionURL = connection || cryptoDec.decrypt(config.get('postgres.url')) || cryptoDec.decrypt(config.get('mssqlConfig'));
  let litmusSSL = connection ? issecure : config.get('sslForDatabase', issecure)
  const hash = crypto.createHash('md5').update(connectionURL).digest("hex");
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
        encrypt: true,
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