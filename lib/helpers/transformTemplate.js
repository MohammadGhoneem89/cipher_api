const model = require('../models/APITemplates');
const Handlebars = require('handlebars');
const dates = require('./dates')
/**
 * Allows to bind payload data to templates
 * @param {String} id : _id of the API template mongo record
 * @param {JSON} payload : The payload to be passed for binding
 * @returns {JSON} {err: Error, data: ParsedData}
 */

Handlebars.registerHelper('EpochToHuman', function(value){
  value = parseInt(value)||0;
  value *= 1000;
  return dates.MSddMMyyyy(value);
});

async function transformTemplate(id, payload, customFunction) {

  const toReturn = {
    err: undefined,
    data: undefined
  };
  if(customFunction!==undefined){
    customFunction.map((item)=>{
      Handlebars.registerHelper(item.name, item.function);
    })
  }

  try {
    let source = await model.findOne({name: id});
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