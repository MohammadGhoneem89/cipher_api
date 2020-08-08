'use strict';
const _ = require('lodash');
var mongoose = require('mongoose')
const mongoDB = require('../../api/connectors/mongoDB');
const crypto = require("crypto");
const { result } = require('lodash');
const sha512 = require('../../../lib/hash/sha512');
var hash = require('object-hash');
let source_connection, destination_connection;

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

async function get_db_collections(db_conn) {

    return db_conn.db.listCollections().toArray();

    // let docs = await db_conn.listCollections().toArray();
    // docs = docs.map(async doc => {
    //     doc.count = await db.collection(doc.name).count();
    //     return doc;
    // });
    // return Promise.all(docs);

}

async function get_db_collection(db_conn, collection_name) {

    let collection = await db_conn.db.collection(collection_name);
    return await collection.find({}).toArray();
}

function comparer_byName(otherArray) {
    return function (current) {
        return otherArray.filter(function (other) {
            return other.name == current.name
        }).length == 0;
    }
}

function comparer_byID(otherArray) {
    return function (current) {
        return JSON.stringify(otherArray._id) == JSON.stringify(current._id)
    }
}

async function get_resultant(db_conn, result) {
    result = result.map(async doc => {
        let new_doc = {
            type: "",
            new_documents: [],
            updated_documents: [],
            deleted_documents: []
        }
        new_doc.count = await db_conn.db.collection(doc.name).count();
        new_doc.modelName = doc.name;

        return new_doc;
    });
    return Promise.all(result);
}

async function find_updated_records(s_collection_data, d_collection_data, result, modelName) {
    const secret = 'sagp';
    console.log(modelName)
    let s_data = s_collection_data.map(async s_document => {

        let d_document = await d_collection_data.filter(comparer_byID(s_document));
        if (d_document.length > 0) {

            let s = JSON.stringify(s_document), d = JSON.stringify(d_document[0])
            // take hash of both and confirm if same otherwise report for change
            let s_hash = crypto.createHmac("sha512", secret).update(s).digest("hex"),
                d_hash = crypto.createHmac("sha512", secret).update(d).digest("hex");
            if (s_hash != d_hash) {
                // updated document
                console.log(s_document)
                result.map(function (other) {
                    if (other.modelName == modelName) {
                        other.type = "updated"
                        let update_doc = {
                            source: s_document,
                            destination: d_document
                        }
                        other.updated_documents.push(update_doc)
                    }
                })
            }
        } else {
            // deleted in destination
            result.map(function (other) {
                
                if (other.modelName == modelName) {
                    other.type = "updated"
                    other.new_documents.push(s_document)
                }
            })
        }

    })

    return Promise.all(s_data);
}

async function getChanges(payload, UUIDKey, route, callback, JWToken) {
    try {

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

        source_connection = mongoose.createConnection(source, clientOption);
        destination_connection = mongoose.createConnection(destination, clientOption);

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

        let source_data = await get_db_collections(source_connection);
        let dest_data = await get_db_collections(destination_connection);

        // Compose resultant array
        let result = await get_resultant(source_connection, source_data);

        console.log("collections in source:", source_data.length);
        console.log("collections in destination:", dest_data.length);

        if (source_data.length != dest_data.length && source_data.length > dest_data.length) {
            let missing_tables = await source_data.filter(comparer_byName(dest_data));
            missing_tables.forEach(table => {
                result.map(row => {
                    if (row.modelName == table.name) {
                        row.type = "new" // New collection to be added in destination
                        return row;
                    }
                });
            });

        } else if (source_data.length != dest_data.length && source_data.length < dest_data.length) {
            response.message = "Collections to be deleted are found from source";
            // No need of this case of as now
        }

        // Filter out collections which have either updated/new/deleted records 
        let s_data = source_data.map(async s_collection => {

            let s_collection_data = await get_db_collection(source_connection, s_collection.name),
                d_collection_data = await get_db_collection(destination_connection, s_collection.name);

            find_updated_records(s_collection_data, d_collection_data, result, s_collection.name);

        });

        await Promise.all(s_data);

        response.data = result.filter(function (element) {
            return element.type != ""
        });

        response.count = response.data.length;
        response.message = "Success";
        callback(response);
        return;

    } catch (err) {
        console.log(err)
        callback(errorResponse(err));
        return;
    }
}

exports.syncData = syncData;
exports.getChanges = getChanges;

