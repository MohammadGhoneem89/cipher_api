const data = {
    id: 6,
    tranxData:
    {
        documentName: 'qDoc',
        key: '0x78710B5E412a49e29e08578f2A0791E640c418Ed',
        name: '123',
        version: '12',
        t3: {
            test: '123'
        }
    },
    version: '12',
    name: '123',
    block_num: '1931',
    txnid: '0x13578365abaa8a5d62f1d8e6eabaa19fdef15d5f4b384313b95432d873c06891',
    status: 'ACTIVE',
    key: '0x78710B5E412a49e29e08578f2A0791E640c418Ed'
}

function flatten(data, acc){
    for(let key in data){
        acc.push(key)
        if(typeof data[key]==='object'&&!Array.isArray(data[key])){
            let extra  = flatten(data[key],[]);
            extra = extra.map(label=>{
                if(label.includes('->>')){
                    return key+'->'+label;
                } else {
                    return key+'->>\''+label+'\'';
                }
            })
            acc = acc.concat(extra);
        }
    }
    return acc;
}

console.log(flatten(data, []))