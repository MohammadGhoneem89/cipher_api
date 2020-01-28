'use strict';

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

    const replicator_table = sequelize.define(tableName, {
        // attributes
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        tranxData: {
            type: Sequelize.JSON,
            allowNull: false
        },
        block_num: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        txnid: {
            type: Sequelize.STRING,
            allowNull: false
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false
        },
        key: {
            type: Sequelize.STRING,
            allowNull: true
        },
        createdAt: {
            type: Sequelize.TIME,
            allowNull: true
        },
        updatedAt: {
            type: Sequelize.TIME,
            allowNull: true
        }

    }, {
        // options
    });
    return replicator_table
}

module.exports = {
    makeModel
}