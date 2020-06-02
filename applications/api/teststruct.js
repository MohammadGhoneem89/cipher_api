'use strict';
let fs = require('fs');
let data = [
  [
    {
      route: 'GetContractDataTemp',
      RequestMapping: {
        id: "1",
        fields: [
          { Sequence: 1,
            IN_FIELD: 'body.orgCode',
            IN_FIELDVALUE: '',
            IN_FIELDTYPE: 'data',
            IN_FIELDDT: 'string',
            IN_FIELDFUNCTION: 'STUB',
            IN_FIELDVALIDATION: 'bypass',
            IN_FIELDDESCRIPTION: '',
            IN_ISREQUIRED: 'N',
            MAP_FIELD: 'orgCode',
            MAP_FIELDDT: 'string',
            IN_FIELDTYPEDATA: '' },
          { Sequence: 2,
            IN_FIELD: 'body.EIDA',
            IN_FIELDVALUE: '',
            IN_FIELDTYPE: 'data',
            IN_FIELDDT: 'string',
            IN_FIELDFUNCTION: 'STUB',
            IN_FIELDVALIDATION: 'bypass',
            IN_FIELDDESCRIPTION: '',
            IN_ISREQUIRED: 'Y',
            MAP_FIELD: 'EIDA',
            MAP_FIELDDT: 'string',
            IN_FIELDTYPEDATA: '' },
          { Sequence: 3,
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
            IN_FIELDTYPEDATA: '' },
          { Sequence: 4,
            IN_FIELD: 'body.contractID',
            IN_FIELDVALUE: '',
            IN_FIELDTYPE: 'data',
            IN_FIELDDT: 'string',
            IN_FIELDFUNCTION: 'STUB',
            IN_FIELDVALIDATION: 'bypass',
            IN_FIELDDESCRIPTION: 'Contract ID in WASL’s system',
            IN_ISREQUIRED: 'Y',
            MAP_FIELD: 'contractID',
            MAP_FIELDDT: 'string',
            IN_FIELDTYPEDATA: '' }
        ]
      }
    },
    {
      route: 'GetContract',
      RequestMapping: {
        id: "2",
        fields: [{ Sequence: 1,
          IN_FIELD: 'body.IIIIIIIIIIIIIIIIIIIIIIIIIIII',
          IN_FIELDVALUE: '',
          IN_FIELDTYPE: 'OrgIdentifier',
          IN_FIELDDT: 'string',
          IN_FIELDFUNCTION: 'STUB',
          IN_FIELDVALIDATION: 'bypass',
          IN_FIELDDESCRIPTION: '',
          IN_ISREQUIRED: 'Y',
          MAP_FIELD: 'IIIIIIIIIIIIIIIIIIIIIIIIIIII',
          MAP_FIELDDT: 'array',
          IN_FIELDTYPEDATA: '' },
        { Sequence: 2,
          IN_FIELD: 'body.',
          IN_FIELDVALUE: '',
          IN_FIELDTYPE: 'data',
          IN_FIELDDT: 'string',
          IN_FIELDFUNCTION: 'STUB',
          IN_FIELDVALIDATION: 'bypass',
          IN_FIELDDESCRIPTION: '',
          IN_ISREQUIRED: 'Y',
          MAP_FIELD: 'EEEEEEEEEEEEEEEEEEEEEE',
          MAP_FIELDDT: 'array',
          IN_FIELDTYPEDATA: '' },
        { Sequence: 3,
          IN_FIELD: 'body.authToken',
          IN_FIELDVALUE: '',
          IN_FIELDTYPE: 'data',
          IN_FIELDDT: 'string',
          IN_FIELDFUNCTION: 'STUB',
          IN_FIELDVALIDATION: 'bypass',
          IN_FIELDDESCRIPTION: 'UAE Pass auth token to validate it from Blockchain',
          IN_ISREQUIRED: 'Y',
          MAP_FIELD: 'GGGGGGGGGGGGGGGGGG',
          MAP_FIELDDT: 'array',
          IN_FIELDTYPEDATA: '' },
        { Sequence: 4,
          IN_FIELD: 'body.contractID',
          IN_FIELDVALUE: '',
          IN_FIELDTYPE: 'data',
          IN_FIELDDT: 'string',
          IN_FIELDFUNCTION: 'STUB',
          IN_FIELDVALIDATION: 'bypass',
          IN_FIELDDESCRIPTION: 'Contract ID in WASL’s system',
          IN_ISREQUIRED: 'Y',
          MAP_FIELD: 'OOOOOOOOOOOOOOOOOOOOOO',
          MAP_FIELDDT: 'array',
          IN_FIELDTYPEDATA: '' },
        { Sequence: 6,
          IN_FIELD: '__JWTORG',
          IN_FIELDVALUE: '',
          IN_FIELDTYPE: 'data',
          IN_FIELDDT: 'string',
          IN_FIELDFUNCTION: 'STUB',
          IN_FIELDVALIDATION: 'bypass',
          IN_FIELDDESCRIPTION: '',
          IN_ISREQUIRED: 'N',
          MAP_FIELD: 'RRRRRRRRRRRRRRRRRRRRR',
          MAP_FIELDDT: 'array',
          IN_FIELDTYPEDATA: '' }
        ]
      }
    }
  ]

];
fs.readFile('structTemplate.txt', 'utf8', function (err, fileData) {
  if (err) {
    return console.log(err);
  }
  let mfileData = ""; let gData = "";
  function findIn(ifileData) {
    let startIndex = ifileData.search("<<field1>>");
    let endIndex = ifileData.search(" }");
    let GetData = ifileData.substring(startIndex, endIndex);
    //
    return GetData;
  }

  function findIndex(ifileData) {
    let startIndex = ifileData.search("<<field>>");
    let endIndex = ifileData.search("  }");
    let GetData = ifileData.substring(startIndex, endIndex);
    //
    return GetData;
  }


  // console.log("kkkkkkkkkkkkkkkkkkkkkkk", findIndex(fileData), "kkkkkkkkkkkkkkkkkkkkkkk");
  function replaceM(fileData) {
    let yData = "";
    let iData = findIn(fileData);
    let tData = findIndex(fileData);
    let ufileData = ""; let comData = ""; let fData = "";
    for (let i = 0; i < data[0].length; i++) {

      // console.log(i, "iiiiiiiiiiiiiiiiii");
      // console.log(data[0][i].route);
      ufileData = fileData.replace('<<structName>>', data[0][i].route);
      // console.log(ufileData);
      gData = "";
      for (let j = 0; j < data[0][i].RequestMapping.fields.length; j++) {
        mfileData = iData.replace('<<field1>>', data[0][i].RequestMapping.fields[j].MAP_FIELD.charAt(0).toUpperCase() + data[0][i].RequestMapping.fields[j].MAP_FIELD.slice(1)); /* .charAt(0).toUpperCase() + mSlicedFieldName.slice(1)*/
        mfileData = mfileData.replace('<<fieldType>>', data[0][i].RequestMapping.fields[j].IN_FIELDDT);
        mfileData = mfileData.replace('<<field1JSON>>', data[0][i].RequestMapping.fields[j].MAP_FIELD);

        gData += mfileData + "\n";
      }
      ufileData = ufileData.replace(iData, gData);
      ufileData = ufileData.replace(/<<structName>>/g, data[0][i].route);
      // comData += ufileData;
      // ufileData = ufileData.replace(tData, repAgain(fileData));
      for (let j = 0; j < data[0][i].RequestMapping.fields.length; j++) {

        let hData = tData.replace('<<field>>', data[0][i].RequestMapping.fields[j].MAP_FIELD.charAt(0).toUpperCase() + data[0][i].RequestMapping.fields[j].MAP_FIELD.slice(1));
        hData = hData.replace(/<<fieldType>>/g, data[0][i].RequestMapping.fields[j].IN_FIELDDT);
        hData = hData.replace('<<currentNo>>', j);
        fData += hData + "\n";
        if (j === data[0][i].RequestMapping.fields.length - 1) {
          yData = fData;
          console.log(fData);
          fData = "";
        }
      }
      ufileData = ufileData.replace(tData, yData);
      comData += ufileData;
    }
    return comData;
  }

  // console.log(repAgain(fileData));
  let readf = replaceM(fileData);

  fs.writeFile('struct.go', readf, 'utf8', function (err) {
    if (err) return console.log(err);
    console.log("========================fileData written\n", readf);
  });

});

