const model = require('../models/APITemplates');
let Handlebars = require('handlebars');

/**
 * Allows to bind payload data to templates
 * @param {String} id : _id of the API template mongo record
 * @param {JSON} payload : The payload to be passed for binding
 * @returns {JSON} {err: Error, data: ParsedData}
 */
async function transformTemplate(id, payload) {
  const toReturn = {
    err: undefined,
    data: undefined
  };

  try {
    let source = await model.findById(id);
    source = source.data;
    let template = Handlebars.compile(JSON.stringify(source));
    toReturn.data = template(payload);
  } catch (err) {
    toReturn.err = err;
  }
  return toReturn;
}

module.exports = transformTemplate;