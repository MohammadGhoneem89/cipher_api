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
const pg = require('../../../core/api/client/sequelize');

async function  makeModel(tableName) {
    let pgInstance= await pg();
    const replicator_table = pgInstance.define(tableName, {
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