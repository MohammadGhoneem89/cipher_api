const validator = require('../../../../lib/validator');
const schemas = require('./schemas');


module.exports = {
  validate: validator.validate,
  errorValidate: validator.errorValidate,
  schemas: schemas
};