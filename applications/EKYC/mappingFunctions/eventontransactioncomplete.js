'use strict';

let rp = require('request-promise');


function eventontransactioncomplete(response, payload) {
   
    response ;
   return async () => {
    let options = {
        method: 'POST',
        url: 'http://localhost:9089/API/SMILES/eventontransactioncomplete',
        body:
        {
            header:
            {
                "username": "Internal_API",
                "password": "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
           
            },
            "body": {
                "sourceSystem": "SMILES",
                "sourceTransactionId": "29389384938",
                "transactionDateTime": "10/10/2019 10:10:00.000",
                "transactionType": "C",
                "transactionSubType": "SMILES to OTHER",
                "status": "CONFIRMED",
                "error" :""
              }

        },
        json: true
    };
    // console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
}
    
}
exports.eventontransactioncomplete = eventontransactioncomplete;