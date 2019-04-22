'use strict';

const { create } = require('../repositories/documents');
const validator = require('../validator');

  async function createDocument (payload) {
    try {
      // await validator.validate(payload, validator.schemas.user.create);
      return await create(payload)
    } catch (error) {
      return error;
    }
  }

module.exports = {
  create: createDocument
};
