module.exports = function (payload) {
    let fields = '';
    for (let i = 0; i < payload.fields.length; i++) {
        if (fields.length !== 0) {
            fields += ' ,'
        }
        const names = payload.fields[i].name.split('->');
        let fieldName = "";
        for (let i = 0; i < names.length; i++) {
            if (i === 0) {
                fieldName = "\"" + names[i] + "\"";
            } else if (i === names.length - 1) {
                fieldName += '->>' + "'" + names[i] + "'";
            } else {
                fieldName += '->' + "'" + names[i] + "'";
            }
        }
        fields += ` ${fieldName} as ${payload.fields[i].as}`;
    }
    let pagingData = '';
    if (payload.enablePaging) {
        pagingData = 'LIMIT ${payload.page.pageSize},${payload.page.toSkip}'
    }
    let valuesString = '';
    let queryString = '';
    if (payload.objectType === 'table') {
        let conditions = '';
        for (let i = 0; i < payload.conditions.length; i++) {
            if (conditions.length !== 0) {
                conditions += ' AND'
            }
            const names = payload.conditions[i].name.split('->');
            let fieldName = "";
            for (let i = 0; i < names.length; i++) {
                if (i === 0) {
                    fieldName = "\"" + names[i] + "\"";
                } else if (i === names.length - 1) {
                    fieldName += '->>' + "'" + names[i] + "'";
                } else {
                    fieldName += '->' + "'" + names[i] + "'";
                }
            }
            conditions += ` ${fieldName} ${payload.conditions[i].operator || "="} $${i + 1}`;
            if (valuesString.length > 0) {
                valuesString += ',';
            }
            valuesString += 'payload.' + payload.conditions[i].value;
        }
        queryString = `select ${fields} from "${payload.object}" where ${conditions} ${pagingData};`

    } else {
        let argString = '';
        for (let i = 0; i < payload.conditions.length; i++) {
            if (argString.length > 0) {
                argString += ',';
            }
            argString += '${payload.' + payload.conditions[i].value + "}";
        }
        queryString = `select ${fields} from ${payload.object}(${argString}) ${pagingData};`
    }
    file = `     
        let instance = await client.createClient('pg', dbConfig.connection);
        const query = {
            text: \`${queryString}\`,
            values: [${valuesString}]
        }
        let response = await instance.query(query);
        response = response.rows;`
    return file;
}