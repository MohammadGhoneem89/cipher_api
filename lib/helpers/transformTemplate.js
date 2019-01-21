const model = require('../models/APITemplates');
const Handlebars = require('handlebars');
const moment = require('moment');
/**
 * Allows to bind payload data to templates
 * @param {String} id : _id of the API template mongo record
 * @param {JSON} payload : The payload to be passed for binding
 * @returns {JSON} {err: Error, data: ParsedData}
 */

Handlebars.registerHelper('EpochToHuman', function(value){
  value = parseInt(value);
  value *= 1000;
  let date = moment(value);
  return date.format('DD/MM/YYYY');
});

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

  try {
    toReturn.data = JSON.parse(toReturn.data);
  } catch(err){
    console.log('JSON conversion err', err);
  }

  return toReturn;
}

module.exports = transformTemplate;