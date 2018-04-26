'use strict';

const validator = require('../validator');
const slaEventRepo = require('../repositories/slaEvent');

module.exports = {
  create
};

function create(payload) {
  return validator.errorValidate(payload, validator.schemas.slaEvent.create)
    .then(() => {
      payload.data.createdBy = payload.createdBy;
      return slaEventRepo.create(payload.data);
    });
}
