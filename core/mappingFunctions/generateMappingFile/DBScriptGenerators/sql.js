module.exports = (data) => {
    let fields = '{';
    let whereFields = '{';
    data.conditions.forEach(element => {
        if (whereFields.length > 1) {
            whereFields += " , ";
        }
        switch (element.operator) {
            case '=':
                whereFields += `"${element.name}": payload.${element.value}`;
                break;
            case '<':
                whereFields += `"${element.name}": { $lt: payload.${element.value}}`;
                break;
            case '>':
                whereFields += `"${element.name}": { $gt: payload.${element.value}}`;
                break;
            case '<>':
                whereFields += `"${element.name}": { $ne: payload.${element.value}}`;
                break;
            case '<=':
                whereFields += `"${element.name}": { $lte: payload.${element.value}}`;
                break;
            case '>=':
                whereFields += `"${element.name}": { $gte: payload.${element.value}}`;
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
    fields += '}';
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

    const queryOptions = {
        raw: true,
        attributes: attributes
    };

    let toEmit = `
    const dbConfig = await keyVaultRepo.getDBConfig('postgres', '${data.adaptor}');           
  const instance = await client.createClient('sequelize', dbConfig.connection);
  const Model = instance.define("${data.object}", ${fields});
  let queryOptions = ${JSON.stringify(queryOptions)};`
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
