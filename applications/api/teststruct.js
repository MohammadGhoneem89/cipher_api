'use strict';
let fs = require('fs');
let payload = {
  searchCriteria: {
    mappingName: "AddTenant"
  }
};
let data = [
  [{
    "fields": [{
      "Sequence": 1,
      "IN_FIELD": "body.orgCode",
      "IN_FIELDVALUE": "",
      "IN_FIELDTYPE": "OrgIdentifier",
      "IN_FIELDDT": "number",
      "IN_FIELDFUNCTION": "STUB",
      "IN_FIELDVALIDATION": "bypass",
      "IN_FIELDDESCRIPTION": "OrgCode of the Property Manager",
      "IN_ISREQUIRED": "Y",
      "MAP_FIELD": "Body.arguments",
      "MAP_FIELDDT": "array",
      "IN_FIELDTYPEDATA": ""
    },
    {
      "Sequence": 2,
      "IN_FIELD": "body.orgID",
      "IN_FIELDVALUE": "",
      "IN_FIELDTYPE": "data",
      "IN_FIELDDT": "string",
      "IN_FIELDFUNCTION": "STUB",
      "IN_FIELDVALIDATION": "bypass",
      "IN_FIELDDESCRIPTION": "Organization ID provided by SDG to entities",
      "IN_ISREQUIRED": "Y",
      "MAP_FIELD": "Body.arguments",
      "MAP_FIELDDT": "array",
      "IN_FIELDTYPEDATA": ""
    },
    {
      "Sequence": 3,
      "IN_FIELD": "body.emiratesID",
      "IN_FIELDVALUE": "",
      "IN_FIELDTYPE": "data",
      "IN_FIELDDT": "string",
      "IN_FIELDFUNCTION": "STUB",
      "IN_FIELDVALIDATION": "bypass",
      "IN_FIELDDESCRIPTION": "Emirates ID of the user required to perform the KYC from GDRFA",
      "IN_ISREQUIRED": "Y",
      "MAP_FIELD": "Body.arguments",
      "MAP_FIELDDT": "array",
      "IN_FIELDTYPEDATA": ""
    }
    ]
  }]
];

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}
createStruct(data);

function createStruct(data) {
  fs.readFile('structTemplate.txt', 'utf8', function (err, fileData) {
    if (err) {
      return console.log(err);
    }
    // console.log(fileData, "fileDATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    let ifileData = replaceAll(fileData, '<<structName>>', payload.searchCriteria.mappingName);
    // let ifileData = fileData.replaceAll('<<structName>>', payload.searchCriteria.mappingName);
    // console.log(ifileData, "iiiiiiiiiiiiiiiifffffffffffffffffffffffffffff");

    function findIndex(fileData) {
      let startIndex = fileData.search("<<field1>>");
      let endIndex = fileData.search(" }");
      let GetfileData = fileData.substring(startIndex, endIndex);
      return GetfileData;
    }

    function checkDataType(i) {
      // console.log(i, "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
      if (data[0][0].fields[i].IN_FIELDDT === "number") {
        data[0][0].fields[i].IN_FIELDDT = "int64";
        // console.log(data[0][0].fields[i].IN_FIELDDT);
        return data[0][0].fields[i].IN_FIELDDT;
      }
      if (data[0][0].fields[i].IN_FIELDDT === "boolean") {
        data[0][0].fields[i].IN_FIELDDT = "bool";
        return data[0][0].fields[i].IN_FIELDDT;
      }
      if (data[0][0].fields[i].IN_FIELDDT === "string") {
        // let mDDT = data[0][0].fields[i].IN_FIELDDT = "int64";
        return data[0][0].fields[i].IN_FIELDDT;
      }
    }

    function findnReplaceStruct(fileData, data) {
      let mgenerateStruct = "";
      let GetfileData = findIndex(fileData);
      // console.log(GetfileData, "FileDataaaaaaaaaaaaaSUBSTRING");
      for (let i = 0; i < data[0][0].fields.length; i++) {

        let getSlicedFieldName = data[0][0].fields[i].IN_FIELD.split(".");
        let mSlicedFieldName = getSlicedFieldName[1];
        let mfileData = replaceAll(GetfileData, '<<field1>>', mSlicedFieldName.charAt(0).toUpperCase() + mSlicedFieldName.slice(1));
        mfileData = replaceAll(mfileData, '<<fieldType>>', checkDataType(i));
        mfileData = mfileData.replace('<<field1JSON>>', mSlicedFieldName);
        mgenerateStruct += mfileData + "\n";
      }
      return mgenerateStruct;
    }

    let GetfileData = findIndex(fileData);
    ifileData = ifileData.replace(GetfileData, findnReplaceStruct(fileData, data));

    function findIn(ifileData) {
      let startIndex = ifileData.search("<<field1>>");
      let endIndex = ifileData.search("  }");
      let GetData = ifileData.substring(startIndex, endIndex);
      //
      return GetData;
    }
    function fillStruct(ifileData, data) {
      let GetfileData = findIn(ifileData);
      // console.log("findIndex", findIndex(ifileData), "oooooo");
      // console.log("getfiledata", GetfileData, "ttttttttttt");
      let imgenerateStruct = "";
      let cDDT = "";
      for (let i = 0; i < data[0][0].fields.length; i++) {

        // console.log(data[0][0].fields.length, "dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        let getSlicedFieldName = data[0][0].fields[i].IN_FIELD.split(".");
        let mSlicedFieldName = getSlicedFieldName[1];
        // console.log(checkDataType(i) + "datatypeeeeeeeeeeeeeeeeeeee");
        // cDDT = checkDataType(i);

        let iData = replaceAll(GetfileData, '<<field1>>', mSlicedFieldName.charAt(0).toUpperCase() + mSlicedFieldName.slice(1));

        iData = replaceAll(iData, '<<fieldType>>', data[0][0].fields[i].IN_FIELDDT);
        iData = iData.replace('<<currentNo>>', i);
        imgenerateStruct += iData + "\n";
      }

      return imgenerateStruct;
    }
    let wData = fillStruct(ifileData, data);
    ifileData = ifileData.replace(findIn(ifileData), wData);
    console.log("========================fileData written\n\n\n", ifileData);
    fs.writeFile('struct.go', ifileData, 'utf8', function (err) {
      if (err) return console.log(err);

    });

  });
}
