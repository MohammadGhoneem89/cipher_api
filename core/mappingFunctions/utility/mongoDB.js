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

async function source_collection(source_connection) {

    return source_connection.db.listCollections().toArray();

}
async function destination_collection(destination_connection) {


    return destination_connection.db.listCollections().toArray();
}

function comparer(otherArray) {
    return function (current) {
        return otherArray.filter(function (other) {
            return other.name == current.name
        }).length == 0;
    }
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

        let source_data = await source_collection(source_connection);
        let dest_data = await destination_collection(destination_connection);

        console.log("collections in source:", source_data.length);
        console.log("collections in destination:", dest_data.length);

        if (source_data.length != dest_data.length && source_data.length > dest_data.length) {
            response.message = "Missing collections are found in destination";
            let missing_tables = await source_data.filter(comparer(dest_data));
            response.missing_tables = missing_tables;

        } else if (source_data.length != dest_data.length && source_data.length < dest_data.length) {
            response.message = "Collections to be deleted are found from source";
            // No need of this case of as now
        }
        source_data.forEach(source => {

            source_connection.db.collection(source.name, function (err, collection) {
                collection.find({}).toArray().then((data)=> {
                    console.log(data)
                })
            });

        });

        callback(response);
        return;


    } catch (err) {
        console.log(err)
        callback(errorResponse(err));
    }

}

exports.syncData = syncData;
exports.getChanges = getChanges;

