function flatten(data, acc) {
    for (let key in data) {
        acc.push(key)
        if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
            let extra = flatten(data[key], []);
            extra = extra.map(label => {
                return key + '.' + label;
            })
            acc = acc.concat(extra);
        }
    }
    return acc;
}

module.exports = async (instance, payload) => {
    const response = [];
    const query = {
        text: `select * from  "${payload.object}" limit 1;`,
        values: []
    };
    let data = await instance.query(query);
    if (data.rows.length > 0) {
        data = data.rows[0];
        data = flatten(data, []);
        for (let i = 0; i < data.length; i++) {
            response.push({
                _id: data[i],
                label: data[i],
                name: data[i]
            });
        }
    } else {
        const query = {
            text: `select * from  "${payload.object}" where false;`,
            values: []
        };
        const data = await instance.query(query);
        for (let i = 0; i < data.fields.length; i++) {
            const element = data.fields[i];
            response.push({
                _id: element.name,
                label: element.name,
                name: element.name
            });
        }
    }
    return response;
}