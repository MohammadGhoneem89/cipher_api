'use strict';

const { create, findDocument } = require('../repositories/documents');

  async function createDocument (payload) {
    try {
      return await create(payload)
    } catch (error) {
      return error;
    }
  }
async function findDocuments (payload) {
  try {
    return await findDocument(payload)
  } catch (error) {
    return error;
  }
}

module.exports = {
  create: createDocument,
  findDocument: findDocuments
};
