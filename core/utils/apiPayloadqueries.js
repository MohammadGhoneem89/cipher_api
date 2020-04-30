const { formateWhereClause } = require('./commonUtils');
module.exports = {
  getAPIPayloadListQuery: function(pageSize, offset, channel = null, action = null, msgId = null, fromDate = null, toDate = null, payloadField = null, payloadFieldValue = null) {
    let filtersToApply = [];
    if (channel) {
      filtersToApply.push(`channel LIKE '${channel}'`);
    }
    if (action) {
      filtersToApply.push(`action  LIKE '%${action}%'`);
    }
    if (msgId) {
      filtersToApply.push(`uuid LIKE '%${msgId}%'`);
    }
    if (payloadField && payloadFieldValue) {
      let payloadFields = [];
      payloadFields = payloadField.split('.');

      //N level support
      //let itr;
      //let payloadfieldElements = '"payload"->';

      /* for (itr =0; itr < payloadFields.length-1; itr ++)
      {
          //filtersToApply.push(`"payload" -> '${payloadFields[0]}' ->> '${payloadFields[1]}' LIKE '%${payloadFieldValue}%'`);
          payloadfieldElements = payloadfieldElements + '${payloadFields[0]}' ->>
      } */
      //end
      if (payloadFields.length == 2) {
        filtersToApply.push(`"payload" -> '${payloadFields[0]}' ->> '${payloadFields[1]}' LIKE '%${payloadFieldValue}%'`);
      } else if (payloadFields.length == 3) {
        filtersToApply.push(`"payload" -> '${payloadFields[0]}'-> '${payloadFields[1]}' ->> '${payloadFields[2]}' LIKE '%${payloadFieldValue}%'`);
      } else {
        filtersToApply.push(`"payload" ->> '${payloadField}' LIKE '%${payloadFieldValue}%'`);
      }
    }

    if (fromDate && toDate) {
      filtersToApply.push(`
            (
            TO_CHAR(createdat :: DATE, 'dd/mm/yyyy') >= '${fromDate}'
                AND 
                TO_CHAR(createdat :: DATE, 'dd/mm/yyyy') <  '${toDate}'
            )`);
    } else if (fromDate && !toDate) {
      //let currentDateTime = Math.round(new Date().getTime() / 1000);
      let currentDateTime = new Date();

      if (fromDate > currentDateTime) {
        filtersToApply.push(`
            (
                
                createdat >= now()
                
                AND
                TO_CHAR(createdat :: DATE, 'dd/mm/yyyy') <  '${fromDate}'
            )`);
      } else {
        filtersToApply.push(`
            (
                TO_CHAR(createdat :: DATE, 'dd/mm/yyyy') >= '${fromDate}'
                AND
                TO_CHAR(createdat :: DATE, 'dd/mm/yyyy') <  '${currentDateTime}'
            )`);
      }
    } else if (!fromDate && toDate) {
      //const currentDateTime = Math.round(new Date().getTime() / 1000);
      const currentDateTime = new Date();

      if (toDate > currentDateTime) {
        filtersToApply.push(`
            (
                createdat >= now()
                AND
                TO_CHAR(createdat :: DATE, 'dd/mm/yyyy') <  '${toDate}'
            )`);
      } else {
        filtersToApply.push(`
            (
                TO_CHAR(createdat :: DATE, 'dd/mm/yyyy') >= '${toDate}'
                AND
                createdat <  now()
            )`);
      }
    }

    const whereFilter = formateWhereClause(filtersToApply) || '';
    const query = `
            SELECT
            uuid as "_id",
            uuid,
            channel,
            action,
            createdat as "createdAt",
            payload            
            FROM apipayload
            ${whereFilter}
            ORDER BY createdat DESC LIMIT ${pageSize} OFFSET ${offset}
          `;

    const countQuery = `
          SELECT
          count(*) as "numberOfRecords"
          FROM apipayload
          ${whereFilter}`;

    return [query, countQuery];
  },

  getAPIPayloadDetailQuery: function(uuid = null) {
    let query = `SELECT 
    uuid as "_id",
    uuid,
    channel,
    action,
    createdat as "createdAt",
    payload,
    0 as "__v"      
    FROM apipayload      
     WHERE UUID = '${uuid}'`;

    return query;
  }
};