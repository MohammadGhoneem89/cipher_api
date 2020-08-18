const { formateWhereClause } = require('./commonUtils');
const config = require('../../config');
module.exports = {
  getAPIPayloadListQuery: function (pageSize, offset, channel = null, action = null, msgId = null, fromDate = null, toDate = null, payloadField = null, payloadFieldValue = null, errCode, JWToken) {
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
    let ownOrg = config.get('ownerOrgs', [])
    if (JWToken && ownOrg.indexOf(JWToken.orgCode) == -1) {
      filtersToApply.push(`orgcode='${JWToken.orgCode}'`);
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
      if (config.get('database', 'postgress') == "mssql") {
        filtersToApply.push(`"payload" LIKE '%${payloadFieldValue}%'`);
      } else {
        if (payloadFields.length == 2) {
          filtersToApply.push(`"payload" -> '${payloadFields[0]}' ->> '${payloadFields[1]}' LIKE '%${payloadFieldValue}%'`);
        } else if (payloadFields.length == 3) {
          filtersToApply.push(`"payload" -> '${payloadFields[0]}'-> '${payloadFields[1]}' ->> '${payloadFields[2]}' LIKE '%${payloadFieldValue}%'`);
        } else {
          filtersToApply.push(`"payload" ->> '${payloadField}' LIKE '%${payloadFieldValue}%'`);
        }
      }
    }

    if (fromDate && toDate) {
      filtersToApply.push(`
            (
              createdat  >= TO_TIMESTAMP('${fromDate}', 'dd/mm/yyyy')
                AND 
                createdat  < TO_TIMESTAMP('${toDate}', 'dd/mm/yyyy')
            )`);
    } else if (fromDate && !toDate) {
      //let currentDateTime = Math.round(new Date().getTime() / 1000);
      let currentDateTime = new Date();
      if (config.get('database', 'postgress') == 'mssql') {
        if (fromDate > currentDateTime) {
          filtersToApply.push(`
              (
                  createdat >= now()
                  AND
                  convert(varchar,createdat, 103) <  '${fromDate}'
              )`);
        } else {
          filtersToApply.push(`
              (
                  convert(varchar,createdat, 103) >= '${fromDate}'
                  AND
                  convert(varchar,createdat, 103) <  '${currentDateTime}'
              )`);
        }
      } else {
        if (fromDate > currentDateTime) {
          filtersToApply.push(`
              (
                  createdat >= now()
                  AND
                  createdat  < TO_TIMESTAMP('${fromDate}', 'dd/mm/yyyy')
              )`);
        } else {
          filtersToApply.push(`
              (
                  createdat  >= TO_TIMESTAMP('${fromDate}', 'dd/mm/yyyy')
                  AND
                  createdat  <  '${currentDateTime}'
              )`);
        }
      }

    } else if (!fromDate && toDate) {
      //const currentDateTime = Math.round(new Date().getTime() / 1000);
      const currentDateTime = new Date();
      if (config.get('database', 'postgress') == 'mssql') {
        if (toDate > currentDateTime) {
          filtersToApply.push(`
            (
                createdat >= now()
                AND
                convert(varchar,createdat, 103) <  '${toDate}'
            )`);
        } else {
          filtersToApply.push(`
            (
               convert(varchar,createdat, 103) >= '${toDate}'
                AND
                createdat <  now()
            )`);
        }
      } else {
        if (toDate > currentDateTime) {
          filtersToApply.push(`
            (
                createdat >= now()
                AND
                createdat  <  TO_TIMESTAMP('${fromDate}', 'dd/mm/yyyy')
            )`);
        } else {
          filtersToApply.push(`
            (
                createdat  >= TO_TIMESTAMP('${toDate}', 'dd/mm/yyyy')
                AND
                createdat <  now()
            )`);
        }
      }
    }
    if (errCode) {
      filtersToApply.push(`errcode  LIKE '%${errCode}%'`);
    }
    const whereFilter = formateWhereClause(filtersToApply) || '';
    let query = `
            SELECT
            uuid as "_id",
            uuid,
            channel,
            action,
            createdat as "createdAt",
            payload,
            username,
            orgcode,
            errcode
            FROM apipayload
            ${whereFilter}
           
          `;

    if (config.get('database', 'postgress') == 'mssql') {
      query += ` ORDER BY apipayload.createdat DESC OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`
    } else {
      query += ` ORDER BY createdat DESC LIMIT ${pageSize} OFFSET ${offset}`
    }

    const countQuery = `
          SELECT
          count(*) as "numberOfRecords"
          FROM apipayload
          ${whereFilter}`;
    console.log(query)
    return [query, countQuery];
  },

  getAPIPayloadDetailQuery: function (uuid = null) {
    let query = `SELECT 
    uuid as "_id",
    *
    FROM apipayload      
     WHERE UUID = '${uuid}'`;

    return query;
  }
};