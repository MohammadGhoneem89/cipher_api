'use strict';
const model = require('../../lib/models/APITemplates');

exports.putTransformationTemplate = async function (payload, UUIDKey, route, callback, JWToken) {
    let response = {
        putTransformationTemplate: {
            action: 'putTransformationTemplate',
            data: undefined,
            err: undefined
        }
    }
    try {
        let data = await model.create(payload)
        response.putTransformationTemplate.data = data;
    } catch (err) {
        response.putTransformationTemplate.err = err;
    }
    callback(response);
}
