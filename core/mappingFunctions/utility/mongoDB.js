'use strict';
const _ = require('lodash');
var mongoose = require('mongoose')
const mongoDB = require('../../api/connectors/mongoDB');
const crypto = require("crypto");
const { result } = require('lodash');
const sha512 = require('../../../lib/hash/sha512');
let source_connection, destination_connection;
const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;
const clientOption = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    reconnectTries: 30000,
    poolSize: 50,
    useNewUrlParser: true,
    autoIndex: false,
    connectWithNoPrimary: true
};

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

async function get_db_collection(db_conn, collection_name, profile_id = "") {

    console.log(profile_id)
    let collection = await db_conn.db.collection(collection_name);
    if (profile_id == "")
        return await collection.find({}).toArray();
    else
        return await collection.find({ _id: new ObjectID(profile_id) }).toArray();
}

async function upsert(db_conn, collection_name, document) {

    let collection = await db_conn.db.collection(collection_name),
        id = new ObjectID(document._id);

    delete document._id;

    return await collection.update({ _id: id }, document, { upsert: true })
}

async function copyCollection(source_conn, dest_conn, collection_name) {

    let dest_collection = await dest_conn.db.collection(collection_name),
        source_collection = await source_conn.db.collection(collection_name)

    return await source_collection.find().forEach(function (doc) {
        dest_collection.insert(doc); // start to replace
    });

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
            type: "", // new updated
            new_documents: {
                count: 0,
                data: []
            },
            updated_documents: {
                count: 0,
                data: []
            },
            deleted_documents: {
                count: 0,
                data: []
            }
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
                result.map(function (other) {
                    if (other.modelName == modelName) {
                        other.type = "updated"
                        let update_doc = {
                            source: s_document,
                            destination: d_document[0]
                        }
                        other.updated_documents.count += 1
                        other.updated_documents.data.push(update_doc)
                    }
                })
            }
        } else {
            // new in source
            result.map(function (other) {

                if (other.modelName == modelName) {
                    other.type = "updated"
                    other.new_documents.count += 1
                    other.new_documents.data.push(s_document)
                }
            })
        }

    })

    return Promise.all(s_data);
}

async function getChanges(payload, UUIDKey, route, callback, JWToken) {
    try {



        console.log(payload.data)
        let errors = {}, is_missing = false;
        // if (!payload.body.hasOwnProperty('source_db_url')) {
        //     errors.source_db_url = "Missing required field."
        //     is_missing = true;
        // }
        // if (!payload.body.hasOwnProperty('destination_db_url')) {
        //     is_missing = true;
        //     errors.destination_db_url = "Missing required field."
        // }

        if (!payload.data.data.hasOwnProperty('destination_url')) {
            is_missing = true;
            errors.destination_db_url = "Missing required field."
        }
        if (!payload.data.data.hasOwnProperty('db_profiles')) {
            is_missing = true;
            errors.db_profiles = "Missing required field."
        }

        if (is_missing) {
            callback(errorResponse(errors));
            return;
        }

        // let source = crypto.decrypt(_.trim(payload.body.source_db_url)),
        //     destination = crypto.decrypt(_.trim(payload.body.destination_db_url));

        let source = "mongodb://23.97.138.116:10050/master",// _.trim(payload.body.source_db_url),
            destination = _.trim(payload.data.data.destination_url),
            profile = _.trim(payload.data.data.db_profiles);

        let response = {
            "message": "API declared",
            "source": source,
            "destination": destination,
            "profile": profile
        }


        // let source_connection = await mongoDB.connection(source);
        // let destination_connection = await mongoDB.connection(destination);

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

        let db_profile = await get_db_collection(source_connection, "schemaProfiles", profile)

        if (source_data.length != dest_data.length && source_data.length > dest_data.length) {
            let missing_tables = await source_data.filter(comparer_byName(dest_data));
            missing_tables.forEach(table => {
                let index = 0
                result.map(row => {
                    if (row.modelName == table.name) {
                        row.type = "new" // New collection to be added in destination
                        row.new_documents.count = row.count
                        get_db_collection(source_connection, table.name, "").then((docs) => {
                            row.new_documents.data = docs
                        })
                        source_data[index].collection_type = "new"
                        console.log(source_data[index])
                        return row;
                    }
                    index += 1
                });
            });

        } else if (source_data.length != dest_data.length && source_data.length < dest_data.length) {
            response.message = "Collections to be deleted are found from source";
            // No need of this case of as now
        }

        let exempted_collections = ["TokenLookup",
            "User_Interm",
            "Notifications",
            "PasswordHistory",
            "ErrorCodes",
            "Document",
            "DocumentType",
            "AuditLog",
            "Audit",
            "ImageUpload",
            "SharedDocument",
            "Documents"];
        // Filter out collections which have either updated/new/deleted records 
        let s_data = source_data.map(async s_collection => {

            if (!s_collection.hasOwnProperty("collection_type")) {
                let s_collection_data = await get_db_collection(source_connection, s_collection.name),
                    d_collection_data = await get_db_collection(destination_connection, s_collection.name);

                if (db_profile[0].collections.indexOf(s_collection.name) > 0) {
                    find_updated_records(s_collection_data, d_collection_data, result, s_collection.name);
                }
            }

        });

        await Promise.all(s_data);
        response.data = result.filter(function (element) {
            return element.type != ""
        });
        // maybe in future will add source & destination URL as well in response. As per frontend need.

        response.count = response.data.length;
        response.message = "Success";
        callback(
            {
                "mongodbSchemaChanges": response
            });
        return;

    } catch (err) {
        console.log(err)
        callback(errorResponse(err));
        return;
    }
}

async function getSchemaProfiles(payload, UUIDKey, route, callback, JWToken) {

    try {
        const url = "mongodb://23.97.138.116:10050/master"

        let db_connection = mongoose.createConnection(url, clientOption);

        await new Promise((resolve) => {
            db_connection.on('open', () => { resolve(db_connection); });
        });

        let profiles = await get_db_collection(db_connection, "schemaProfiles")
        // docs = profiles.map(doc => {
        //     doc.value = doc._id;
        //     doc.label = doc.name
        //     return doc;
        // });
        console.log("profile are loading")
        callback(
            {
                "getMongodbSchemaProfiles": {
                    "message": "success",
                    "data": profiles,
                    "count": profiles.length
                }
            });
        return;
    } catch (err) {
        console.log(err)
        callback(errorResponse(err));
        return;
    }
}
async function applyChangeInDB(payload, UUIDKey, route, callback, JWToken) {
    //payload.data.source
    //payload.data.destination
    //payload.data.modelName
    //payload.data.document
    //payload.data.type
    try {
        let source = "mongodb://23.97.138.116:10050/master",// _.trim(payload.body.source_db_url),
            destination = _.trim(payload.data.data.destination_url),
            modelName = _.trim(payload.data.data.modelName),
            type = _.trim(payload.data.data.type),
            document = payload.data.data.document;


        let source_connection, destination_connection;
        if (type == "new" && Object.keys(document).length === 0) {
            // when whole table from source is required to add in destination
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
            await destination_connection.createCollection(modelName);

            await copyCollection(source_connection, destination_connection, modelName)

        } else {
            destination_connection = mongoose.createConnection(destination, clientOption);

            await new Promise((resolve) => {
                destination_connection.on('open', () => { resolve(destination_connection); });
            });
            await upsert(destination_connection, modelName, document)
        }
        callback(
            {
                "upsertMongodbChange": {
                    "message": "success",
                    "isUpdate": true
                }
            });
    } catch (err) {
        console.log(err)
        callback(errorResponse(err));
        return;
    }


}

exports.syncData = syncData;
exports.getChanges = getChanges;
exports.getSchemaProfiles = getSchemaProfiles;
exports.applyChangeInDB = applyChangeInDB;

