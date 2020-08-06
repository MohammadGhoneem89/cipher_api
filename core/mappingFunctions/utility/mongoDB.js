'use strict';
const _ = require('lodash');
var mongoose = require('mongoose')
const mongoDB = require('../../api/connectors/mongoDB');
const crypto = require('../../../lib/helpers/crypto');
const { result } = require('lodash');

//mongoDB.connection(config.get('mongodb.url'));

function errorResponse(errors) {
    let response = {
        data: {
            message: {
                status: 'ERROR',
                errorDescription: errors
            }
        }
    };
    return response;
}

async function syncData(payload, UUIDKey, route, callback, JWToken) {
    let response = {
        "message": "API declared"
    }

    let errors = {}, is_missing = false;
    if (!payload.body.hasOwnProperty('data')) {
        errors.data = "Missing required field."
        is_missing = true;
    }
    if (!payload.body.hasOwnProperty('destination_db_url')) {
        is_missing = true;
        errors.destination_db_url = "Missing required field."
    }

    if (is_missing) {
        callback(errorResponse(errors));
        return;
    }

    let destination = _.trim(payload.body.destination_db_url);

    callback(response);
    return;


}

async function getChanges(payload, UUIDKey, route, callback, JWToken) {
    let response = {
        "message": "API declared"
    }

    let errors = {}, is_missing = false;
    if (!payload.body.hasOwnProperty('source_db_url')) {
        errors.source_db_url = "Missing required field."
        is_missing = true;
    }
    if (!payload.body.hasOwnProperty('destination_db_url')) {
        is_missing = true;
        errors.destination_db_url = "Missing required field."
    }

    if (is_missing) {
        callback(errorResponse(errors));
        return;
    }

    // let source = crypto.decrypt(_.trim(payload.body.source_db_url)),
    //     destination = crypto.decrypt(_.trim(payload.body.destination_db_url));

    let source = _.trim(payload.body.source_db_url),
        destination = _.trim(payload.body.destination_db_url);

    try {

        // let source_connection = await mongoDB.connection(source);
        // let destination_connection = await mongoDB.connection(destination);

        const clientOption = {
            socketTimeoutMS: 30000,
            keepAlive: true,
            reconnectTries: 30000,
            poolSize: 50,
            useNewUrlParser: true,
            autoIndex: false,
            connectWithNoPrimary: true
        };
        const instances = [];

        let source_connection = mongoose.createConnection(source, clientOption);
        let destination_connection = mongoose.createConnection(destination, clientOption);

        instances.push(new Promise((resolve) => {
            source_connection.on('open', () => { resolve(source_connection); });
        }));
        instances.push(new Promise((resolve) => {
            destination_connection.on('open', () => { resolve(destination_connection); });
        }));

        await Promise.all(instances);

        console.log("source:", source_connection.name)
        console.log("destination:", destination_connection.name)

        // Find missing tables 
        let collections = [];

        source_connection.db.listCollections().toArray(function (err, source_items) {
            if (err) {
                console.log(err);
            } else {
                console.log(source_items);
            }
            destination_connection.db.listCollections().toArray(function (err, dest_items) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(dest_items);
                }
                function comparer(otherArray) {
                    return function (current) {
                        return otherArray.filter(function (other) {
                            return other.name == current.name 
                        }).length == 0;
                    }
                }
                console.log("source:", source_items.length)
                console.log("destination:", dest_items.length)
                if (source_items.length != dest_items.length && source_items.length > dest_items.length) {
                    console.log("Some tables are missing in destination DB")
                    // Find missing tables & add their objects in response
                    var onlyInA = source_items.filter(comparer(dest_items));
                    console.log("Missing collections:", onlyInA)
                }
            })
        })

        callback(response);
        return;


    } catch (err) {
        console.log(err)
        callback(errorResponse(err));
    }

}

exports.syncData = syncData;
exports.getChanges = getChanges;

