const types = {
    postgress: {
        string: 'text',
        number: 'bigint',
        object: 'json'
    }
}

function flatten(table, data, acc) {
    for (let key in data) {
        let typeData = typeof data[key];
        let temp = {
            "type": types[table][typeData],
            "name": key,
            "label": key
        };
        acc.push(temp);
        if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
            let extra = flatten(table, data[key], []);
            extra = extra.map(fields => {
                fields.label = key + '.' + fields.label;
                fields.name = key + '.' + fields.name;
                return fields;
            });
            acc = acc.concat(extra);
        }
    }
    return acc;
}

function process(table, type, name, adaptor, data, acc) {
    let returnedValue = flatten(table, data, acc);

    let newForm = {
        "name": name,
        "adaptor": adaptor,
        "type": type,
        "outputs": [],
        "fields": returnedValue,
    }
    if(type!=='stored_procedure'){
        newForm.outputs = returnedValue
    }
    return newForm;
}

const nData = {
    id: 66,
    tranxData:
    {
        InstallmentNumber: 4,
        amount: 20000,
        bankCode: 'ENBD',
        bankMetaData: '',
        beneficiaryData: '',
        cancellationReason: '',
        contractID: 'KIRC104',
        date: 1538352000000,
        documentName: 'PaymentInstrument',
        failureDescription: '',
        failureReason: '',
        instrumentID: '',
        internalInstrumentID: '4582ef40-14d1-11e9-82aa-ffdc2d0a5927-3',
        key: 'P_KIRC104_4582ef40-14d1-11e9-82aa-ffdc2d0a5927-3',
        newInstrumentRefNo: '',
        oldInstrumentRefNo: '',
        paymentMethod: '001',
        providerMetaData: '{"initiator":"WASLInitiator4","initiatorID":"WASLProperty4"}',
        replacementReason: '',
        status: '001',
        eventName: 'RenewContract'
    },
    block_num: '1537',
    txnid: 'bc75ba1eddc4b774e75bc479cf765b42e4d33e78cd70d089479eb95c21b35781',
    status: '001',
    key: 'P_KIRC104_4582ef40-14d1-11e9-82aa-ffdc2d0a5927-3',
    createdAt: "2019-01-10T12:14:28.860Z",
    updatedAt: "2019-01-10T12:14:28.860Z"
}

console.log(process('postgress', 'table', 'PaymentInstrument', 'adaptor6', nData, []))




