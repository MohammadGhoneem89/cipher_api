'use strict';
let fields: [{
            "Sequence": 1,
            "IN_FIELD": "body.orgCode",
            "IN_FIELDVALUE": "",
            "IN_FIELDTYPE": "OrgIdentifier",
            "IN_FIELDDT": "string",
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
        }
        console.log(JSON.stringify(data), "fieldssssssssss");

        fs.readFile('structTemplate.txt', 'utf8', function (err, fileData) {
                if (err) {
                    return console.log(err);
                }
                console.log(fileData, "fileDATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

                let ifileData = replaceAll(fileData, '<<structName>>', payload.searchCriteria.mappingName);
                // let ifileData = fileData.replaceAll('<<structName>>', payload.searchCriteria.mappingName);
                console.log(ifileData, "iiiiiiiiiiiiiiiifffffffffffffffffffffffffffff");

                function findIndex(fileData) {
                    let startIndex = fileData.search("<<field1>>");
                    let endIndex = fileData.search("structEnd}");
                    let GetfileData = fileData.substring(startIndex, endIndex);
                    return GetfileData;
                }

                function findnReplaceStruct(fileData, data) {
                    let mgenerateStruct = "";
                    let GetfileData = findIndex(fileData);
                    console.log(GetfileData, "FileDataaaaaaaaaaaaaSUBSTRING");
                    for (let i = 0; i < data[0][0].fields.length; i++) {

                        let getSlicedFieldName = data[0][0].fields[i].IN_FIELD.split(".");
                        let mSlicedFieldName = getSlicedFieldName[1];

                        let mfileData = GetfileData.replace('<<field1>>', mSlicedFieldName.charAt(0).toUpperCase() + mSlicedFieldName.slice(1));
                        mfileData = mfileData.replaceAll('<<fieldType>>', data[0][0].fields[i].IN_FIELDDT);
                        mfileData = mfileData.replace('<<field1JSON>>', mSlicedFieldName);
                        mgenerateStruct += mfileData;
                    }
                    return mgenerateStruct;
                }

                let GetfileData = findIndex(fileData);
                ifileData = ifileData.replace(GetfileData, findnReplaceStruct(fileData, data));

                fs.writeFile('struct.go', ifileData, 'utf8', function (err) {
                    if (err) return console.log(err);
                    console.log("========================fileData written\n\n\n", ifileData);
                });
                // callback(ifileData, (responseCallback) => {

                //   responseCallback.set({
                //     'Content-Type': 'application/octet-stream',
                //     'Content-Disposition': 'attachment; filename=' + "Struct.go",
                //   });
                // });