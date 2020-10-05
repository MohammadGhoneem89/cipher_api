'use strict'

const rp = require('request-promise');

async function uploadTask(payload, UUIDKey, route, callback, JWToken){
    console.log("====================aliakber=================");

    console.log(payload.body);
    let options = {
        method: 'POST',
        uri: 'https://jsonplaceholder.typicode.com/todos/1',
        body: {
            body: payload
        },
        json: true
    }
    rp(options)
    .then((res)=>{
        console.log(res);
    })
    .catch((err)=>{
        console.log(err);
    })
    console.log(payload);
    callback(payload.body);
}

exports.uploadTask = uploadTask