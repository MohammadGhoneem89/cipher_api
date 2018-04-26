'use strict';

const validator = require('revalidator');
const schemas = require('./schemas');

const validate = (payload, schema) => {
  const result = validator.validate(payload, schema);
  if (!result.valid) {
    const error = {
      responseMessage: {
        action: payload.action,
        data: {
          message: []
        }
      }
    };

    for (const err of result.errors) {
      error.responseMessage.data.message.push(err.message);
    }
    error.responseMessage.data.message = error.responseMessage.data.message.length ? error.responseMessage.data.message : result.errors;
    return Promise.reject(error);
  }
  return Promise.resolve(payload);
};

const errorValidate = (payload, schema) => {
  const result = validator.validate(payload, schema);
  if (!result.valid) {
    const errRes = { };
    for (const err of result.errors) {
      err.property = err.property.replace('data.', ''); // TODO remove after frontend fixes
      errRes[err.property] = err.message;
    }
    return Promise.reject(errRes);
  }
  return Promise.resolve(payload);
};

module.exports = {
  validate: validate,
  errorValidate: errorValidate,
  schemas: schemas
};
