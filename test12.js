const rp = require('request-promise');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://40.68.19.116:31000';

// API URL
const api = '';

// Database Name
const dbName = 'customs';

function main() {
    let offset = 0;
    let limit = 10;

    MongoClient.connect(url, function (err, client) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        const collection = db.collection('APIPayload');
        // Find some documents 
        collection.find({}, { limit: limit, skip: offset }).toArray(function (err, docs) {
            if (docs && docs.length > 0) {
                console.log("Found the following records offset-> ", offset);
                console.log(docs);
                docs.forEach((elem) => {
                    send(elem.payload.body).then(function (parsedBody) {
                        console.log(" Cipher message ", parsedBody);
                    }).catch(function (err) {
                        console.log(" general err ", err);
                    });
                });
            };
        });
        client.close();
    });
    setTimeout(main() , 5000);
}

function send(body) {
    var options = {
        method: 'POST',
        uri: api,
        body: {
            header: 'payload',
            body: body
        },
        json: true // Automatically stringifies the body to JSON
    };
    return rp(options)
}

main();