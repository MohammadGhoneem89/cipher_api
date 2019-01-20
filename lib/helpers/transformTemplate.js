const model = require('../models/APITemplates');
let Handlebars = require('handlebars');

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