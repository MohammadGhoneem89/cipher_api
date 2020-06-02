let data = [[
    {
        route: 'AddTenant',
        RequestMapping: {
            mappingName: 'AddTenant',
            fields: [{
                Sequence: 1,
                IN_FIELD: 'body.orgCode',
                IN_FIELDVALUE: '',
                IN_FIELDTYPE: 'OrgIdentifier',
                IN_FIELDDT: 'string',
                IN_FIELDFUNCTION: 'STUB',
                IN_FIELDVALIDATION: 'bypass',
                IN_FIELDDESCRIPTION: 'OrgCode of the Property Manager',
                IN_ISREQUIRED: 'Y',
                MAP_FIELD: 'Body.arguments',
                MAP_FIELDDT: 'array',
                IN_FIELDTYPEDATA: ''
            },
            {
                Sequence: 2,
                IN_FIELD: 'body.orgID',
                IN_FIELDVALUE: '',
                IN_FIELDTYPE: 'data',
                IN_FIELDDT: 'string',
                IN_FIELDFUNCTION: 'STUB',
                IN_FIELDVALIDATION: 'bypass',
                IN_FIELDDESCRIPTION: 'Organization ID provided by SDG to entities',
                IN_ISREQUIRED: 'Y',
                MAP_FIELD: 'Body.arguments',
                MAP_FIELDDT: 'array',
                IN_FIELDTYPEDATA: ''
            },
            {
                Sequence: 3,
                IN_FIELD: 'body.emiratesID',
                IN_FIELDVALUE: '',
                IN_FIELDTYPE: 'data',
                IN_FIELDDT: 'string',
                IN_FIELDFUNCTION: 'STUB',
                IN_FIELDVALIDATION: 'bypass',
                IN_FIELDDESCRIPTION:
                    'Emirates ID of the user required to perform the KYC from GDRFA',
                IN_ISREQUIRED: 'Y',
                MAP_FIELD: 'Body.arguments',
                MAP_FIELDDT: 'array',
                IN_FIELDTYPEDATA: ''
            }],
            mappingType: 'REQUEST',
            useCase: 'SDG'
        },
    },
    {
        route: 'AssociatePaymentInstruments',
        RequestMapping:
        {
            mappingName: 'AssociatePaymentInstrumentsDev1',
            fields: [{
                Sequence: 2,
                IN_FIELD: 'body.authToken',
                IN_FIELDVALUE: '',
                IN_FIELDTYPE: 'data',
                IN_FIELDDT: 'string',
                IN_FIELDFUNCTION: 'STUB',
                IN_FIELDVALIDATION: 'bypass',
                IN_FIELDDESCRIPTION: 'UAE Pass auth token to validate it from Blockchain',
                IN_ISREQUIRED: 'Y',
                MAP_FIELD: 'Body.arguments',
                MAP_FIELDDT: 'array',
                IN_FIELDTYPEDATA: ''
            },
            {
                Sequence: 2,
                IN_FIELD: 'body.EIDA',
                IN_FIELDVALUE: '',
                IN_FIELDTYPE: 'data',
                IN_FIELDDT: 'string',
                IN_FIELDFUNCTION: 'STUB',
                IN_FIELDVALIDATION: 'bypass',
                IN_FIELDDESCRIPTION: '',
                IN_ISREQUIRED: 'Y',
                MAP_FIELD: 'Body.arguments',
                MAP_FIELDDT: 'array',
                IN_FIELDTYPEDATA: ''
            }],
            mappingType: 'REQUEST',
            useCase: 'ENBD'
        },
    },
    {
        route: 'AssociatePaymentInstrumentsTemp',
        RequestMapping:
        {
            mappingName: 'AssociatePaymentInstruments',
            fields: [{
                Sequence: 2,
                IN_FIELD: 'body.authToken',
                IN_FIELDVALUE: '',
                IN_FIELDTYPE: 'data',
                IN_FIELDDT: 'string',
                IN_FIELDFUNCTION: 'STUB',
                IN_FIELDVALIDATION: 'bypass',
                IN_FIELDDESCRIPTION: 'UAE Pass auth token to validate it from Blockchain',
                IN_ISREQUIRED: 'Y',
                MAP_FIELD: 'authToken',
                MAP_FIELDDT: 'string',
                IN_FIELDTYPEDATA: ''
            },
            {
                Sequence: 4,
                IN_FIELD: 'body.contractID',
                IN_FIELDVALUE: '',
                IN_FIELDTYPE: 'OrgIdentifier',
                IN_FIELDDT: 'string',
                IN_FIELDFUNCTION: 'STUB',
                IN_FIELDVALIDATION: 'bypass',
                IN_FIELDDESCRIPTION: '',
                IN_ISREQUIRED: 'Y',
                MAP_FIELD: 'contractID',
                MAP_FIELDDT: 'string',
                IN_FIELDTYPEDATA: ''
            }],
            mappingType: 'REQUEST',
            useCase: 'ENBD'
        },
    }
]]

let responses = []
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase()};
test(data)
function test(data) {
    
//for(let i =0 ; i<data[0].length;i++){
    data[0].map((item) => {
        //if (item.isSmartContract === true && item.isActive === true) {
            responses.push({
            'route': item.route,
            'RequestMapping': item.RequestMapping
          });
       // }
      });
    //}
    //for(let i in responses)
     // console.log(responses[i].RequestMapping.fields)
      let getSlicedFieldName = responses[0].RequestMapping.fields[0].IN_FIELD.split(".");
let mSlicedFieldName = getSlicedFieldName[1];
    console.log(mSlicedFieldName.capitalizeFirstLetter());
    
}
