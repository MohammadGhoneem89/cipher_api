const Sequelize = require('sequelize')
module.exports = (type, data) => {
    let fields = '{';
    let whereFields;
    if (type === 'mssql') {
        whereFields = 'Sequelize.and('
    }
    else {
        whereFields = '{';
    }
    for (let i = 0; i < data.conditions.length; i++) {
        const element = data.conditions[i];
        if (i > 0) {
            whereFields += " , ";
        }
        if (type === 'mssql') {

            if (element.name.includes('.') && element.type !== 'text') {
                const index = element.name.indexOf('.');
                let column = element.name.substring(0, index);
                let other = element.name.substring(index + 1, element.name.length);
                whereFields += `Sequelize.where(Sequelize.fn('JSON_VALUE', Sequelize.col('${column}'), '$.${other}'),'${element.operator}',  payload.${element.value})`;
            } else {
                whereFields += `Sequelize.where(Sequelize.col('${element.name}'), '${element.operator}',  payload.${element.value})`;
            }
        } else {
            /*if (whereFields.length > 1) {
                whereFields += " , ";
            }*/
            if (element.name.includes('.') && element.type !== 'text') {
                whereFields += `"${element.name}::${element.type}":`;
            } else {
                whereFields += `"${element.name}":`;
            }
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
                    whereFields += `{ $gte: payload.body.${element.value}}`;
                    break;
            }
            if (element.name.includes('.')) {
                const field = element.name.split('.');
                if (fields.length > 1) {
                    fields += ',';
                }
                fields += `${field[0]} : Sequelize.JSONB`;
            }
        }

    }

    if (type === 'mssql') {
        whereFields += ')'
    }
    else {
        whereFields += '}';
    }

    let attributes = '[';
    data.fields.forEach(element => {
        if (type === 'mssql') {
            if (element.name.includes('.')) {
                const index = element.name.indexOf('.');
                let column = element.name.substring(0, index);
                let other = element.name.substring(index + 1, element.name.length);
                attributes += `[Sequelize.fn('JSON_VALUE', Sequelize.col('${column}'), '$.${other}'), '${element.as}']`;
            }
        }
        if (type !== 'mssql') {
            attributes += `['${element.name}', '${element.as}']`;
            if (element.name.includes('.')) {
                const field = element.name.split('.');
                if (fields.length > 1) {
                    fields += ',';
                }
                fields += `${field[0]} : Sequelize.JSONB`;
            }
        }
        attributes += ',';
    });
    fields += '}';
    attributes += "]";




    let toEmit = `
    const queryOptions = {
        raw: true,
        attributes: ${attributes}
    };
    const dbConfig = await keyVaultRepo.getDBConfig('${type}', '${data.adaptor}');           
    const instance = await client.createClient('sequelize', dbConfig.connection);
    const Model = instance.define("${data.object}", ${fields});`;
    if (type !== 'mssql')
        toEmit += `queryOptions['attributes'] = queryOptions['attributes'].map(element=>{
        if(element[0].includes('.')){
            element[0] =instance.json(element[0]);
        }
        return element;
    });`

    if (data.enablePaging) {
        toEmit += `\n\n
    queryOptions["limit"] = parseInt(payload.page.pageSize);
    const offset = (parseInt(payload.page.currentPageNo) - 1) * queryOptions["limit"];
    if (offset < 0) {
      offset = 0;
    }
    queryOptions["offset"] = offset;`
    }
    toEmit += `
    queryOptions["where"] = ${whereFields};
    let response = await Model.findAll(queryOptions)`;
    return toEmit;
}
