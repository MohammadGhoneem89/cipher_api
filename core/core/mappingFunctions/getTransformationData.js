'use strict';
const model = require('../../lib/models/APITemplates');

exports.getTransformationData = async function (payload, UUIDKey, route, callback, JWToken) {
    let response = {
        getTransformationData: {
            action: 'getTransformationData',
            data: undefined,
            err: undefined
        }
    }
    try {
        let data = await model.find();
        response.getTransformationData.data = data;
    } catch (err) {
        response.getTransformationData.err = err;
    }
    callback(response);
}
