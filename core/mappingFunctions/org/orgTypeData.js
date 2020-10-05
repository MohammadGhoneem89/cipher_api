'use strict';
const logger = require('../../../lib/helpers/logger')().app;
const config = require('../../../config')
function getEntityTypeData(getEntityTypeData_CB, tdList, ownerFlag) {

  if (ownerFlag) {
    global.db.aggregate("Entity", {
      labelAR: "$arabicName",
      label: "$entityName",
      value: "$spCode",
      orgType: "$orgType",
      img: "$entityLogo.sizeSmall",
      _id: "$_id"
    }, function (err, data) {
      if (err) {
        logger.error(err);
      }
      else {
        getEntityTypeData_CB(data);
      }
    });
  } else {
    console.log(">>***", JSON.stringify(tdList))
    let outVal = [];
    tdList.forEach(element => {
      outVal.push({
        labelAR: element.arabicName,
        label: element.entityName,
        value: element.spCode,
        orgType: element.orgType,
        _id: element._id
      })
    });
    getEntityTypeData_CB(outVal);
  }
}

module.exports = getEntityTypeData;
//
//

