'use strict';
let fs = require('fs');
let payload = {
  searchCriteria: {
    mappingName: "AddTenant"
  }
};
let data = [
  [{
    route: 'GetContractDataTemp',
    RequestMapping: {
      id: "1",
      fields: [{
        Sequence: 1,
        IN_FIELD: 'body.orgCode',
        IN_FIELDVALUE: '',
        IN_FIELDTYPE: 'data',
        IN_FIELDDT: 'string',
        IN_FIELDFUNCTION: 'STUB',
        IN_FIELDVALIDATION: 'bypass',
        IN_FIELDDESCRIPTION: '',
        IN_ISREQUIRED: 'Y',
        MAP_FIELD: 'orgCode',
        MAP_FIELDDT: 'string',
        IN_FIELDTYPEDATA: ''
      },
      {
        Sequence: 2,
        IN_FIELD: 'body.contractID',
        IN_FIELDVALUE: '',
        IN_FIELDTYPE: 'data',
        IN_FIELDDT: 'string',
        IN_FIELDFUNCTION: 'STUB',
        IN_FIELDVALIDATION: 'bypass',
        IN_FIELDDESCRIPTION: '',
        IN_ISREQUIRED: 'Y',
        MAP_FIELD: 'contractID',
        MAP_FIELDDT: 'string',
        IN_FIELDTYPEDATA: ''
      }
      ]
    }
  },
  {
    route: 'AddTenant',
    RequestMapping: {
      id: "2",
      fields: [{
        Sequence: 1,
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
        MAP_FIELD: 'EIDA',
        MAP_FIELDDT: 'string',
        IN_FIELDTYPEDATA: ''
      }
      ]
    }
  }
  ]

];

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function findIndex(fileData) {
  let startIndex = fileData.search("<<field1>>");
  let endIndex = fileData.search(" }");
  let GetfileData = fileData.substring(startIndex, endIndex);
  return GetfileData;
}

function findIn(ifileData) {
  let startIndex = ifileData.search("<<field1>>");
  let endIndex = ifileData.search("  }");
  let GetData = ifileData.substring(startIndex, endIndex);
  //
  return GetData;
}

function createStruct(data) {

  function checkDataType(i) {
    // console.log(i, "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    if (data[0][0].RequestMapping.fields[i].IN_FIELDDT === "number") {
      data[0][0].RequestMapping.fields[i].IN_FIELDDT = "int64";
      // console.log(data[0][0].fields[i].IN_FIELDDT);
      return data[0][0].RequestMapping.fields[i].IN_FIELDDT;
    }
    if (data[0][0].RequestMapping.fields[i].IN_FIELDDT === "boolean") {
      data[0][0].RequestMapping.fields[i].IN_FIELDDT = "bool";
      return data[0][0].RequestMapping.fields[i].IN_FIELDDT;
    }

    return data[0][0].RequestMapping.fields[i].IN_FIELDDT;

  }

  function findnReplaceStruct(fileData, data) {
    let mgenerateStruct = "";
    let GetfileData = findIndex(fileData);
    // console.log(GetfileData, "FileDataaaaaaaaaaaaaSUBSTRING");
    for (let j = 0; j < data[0].length; j++) {
      for (let i = 0; i < data[0][j].RequestMapping.fields.length; i++) {

        let getSlicedFieldName = data[0][j].RequestMapping.fields[i].IN_FIELD.split(".");
        let mSlicedFieldName = getSlicedFieldName[1];
        let mfileData = replaceAll(GetfileData, '<<field1>>', mSlicedFieldName /* .charAt(0).toUpperCase() + mSlicedFieldName.slice(1)*/);
        mfileData = replaceAll(mfileData, '<<fieldType>>', checkDataType(i));
        mfileData = mfileData.replace('<<field1JSON>>', mSlicedFieldName);
        mgenerateStruct += mfileData + "\n";
      }
    }
    return mgenerateStruct;
  }

  function fillStruct(ifileData, data) {
    let GetfileData = findIn(ifileData);
    // console.log("findIndex", findIndex(ifileData), "oooooo");
    // console.log("getfiledata", GetfileData, "ttttttttttt");
    let imgenerateStruct = "";
    for (let j = 0; j < data[0].length; j++) {
      for (let i = 0; i < data[0][j].RequestMapping.fields.length; i++) {

        // console.log(data[0][0].fields.length, "dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        let getSlicedFieldName = data[0][j].RequestMapping.fields[i].IN_FIELD.split(".");
        let mSlicedFieldName = getSlicedFieldName[1];
        // console.log(checkDataType(i) + "datatypeeeeeeeeeeeeeeeeeeee");
        // cDDT = checkDataType(i);

        let iData = replaceAll(GetfileData, '<<field1>>', mSlicedFieldName /* .charAt(0).toUpperCase() + mSlicedFieldName.slice(1)*/);

        iData = replaceAll(iData, '<<fieldType>>', data[0][j].RequestMapping.fields[i].IN_FIELDDT);
        iData = iData.replace('<<currentNo>>', i);
        imgenerateStruct += iData + "\n";
      }
    }
    return imgenerateStruct;
  }

  fs.readFile('structTemplate.txt', 'utf8', function (err, fileData) {
    if (err) {
      return console.log(err);
    }
    let ifileData = "";
    let iData = "";
    for (let j = 0; j < data[0].length; j++) {
      ifileData = replaceAll(fileData, '<<structName>>', data[0][j].route);
      ifileData = ifileData.replace(findIndex(fileData), findnReplaceStruct(fileData, data));
      ifileData = ifileData.replace(findIn(ifileData), fillStruct(ifileData, data));

      iData += ifileData;

    }

    fs.writeFile('struct.go', iData, 'utf8', function (err) {
      if (err) return console.log(err);
      console.log("========================fileData written\n\n\n", iData);
    });
    // }

  });

}

createStruct(data);
