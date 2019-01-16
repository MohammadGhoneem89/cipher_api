module.exports = (data) => {
    let fields = '{';
    let whereFields = '{';
    data.conditions.forEach(element => {
        if (whereFields.length > 1) {
            whereFields += " , ";
        }
        whereFields += `"${element.name}::${element.type}":`;
        switch (element.operator) {
            case '=':
                whereFields += `payload.${element.value}`;
                break;
            case '<':
                whereFields += `{ $lt: payload.${element.value}}`;
                break;
            case '>':
                whereFields += `{ $gt: payload.${element.value}}`;
                break;
            case '<>':
                whereFields += `{ $ne: payload.${element.value}}`;
                break;
            case '<=':
                whereFields += `{ $lte: payload.${element.value}}`;
                break;
            case '>=':
                whereFields += `{ $gte: payload.${element.value}}`;
                break;
        }
        if (element.name.includes('.')) {
            const field = element.name.split('.');
            if (fields.length > 1) {
                fields += ',';
            }
            fields += `${field[0]} : Sequelize.JSONB`;
        }
    });
    whereFields += '}';

    let attributes = [];
    data.fields.forEach(element => {
        attributes.push([element.name, element.as]);
        if (element.name.includes('.')) {
            const field = element.name.split('.');
            if (fields.length > 1) {
                fields += ',';
            }
            fields += `${field[0]} : Sequelize.JSONB`;
        }
    });
    fields += '}';


    const queryOptions = {
        raw: true,
        attributes: attributes
    };

    let toEmit = `
    const dbConfig = await keyVaultRepo.getDBConfig('postgres', '${data.adaptor}');           
  const instance = await client.createClient('sequelize', dbConfig.connection);
  const Model = instance.define("${data.object.toLowerCase()}", ${fields});
  let queryOptions = ${JSON.stringify(queryOptions)};
  queryOptions['attributes'] = queryOptions['attributes'].map(element=>{
    if(element[0].includes('.')){
        element[0] =instance.json(element[0]);
    }
    return element;
  });
  `

    if (data.enablePaging) {
        toEmit += `\nqueryOptions["limit"] = parseInt(payload.page.pageSize);
    const offset = (parseInt(payload.page.currentPageNo) - 1) * queryOptions["limit"];
    if (offset < 0) {
      offset = 0;
    }
    queryOptions["offset"] = offset;`
    }
    toEmit += `
  queryOptions["where"] = ${whereFields};
  let response = await Model.findAll(queryOptions)
  `;
    return toEmit;
}
