var PdfTable = require('voilab-pdf-table');
var PdfDocument = require('pdfkit');
var fs = require("fs");



var createPDF = function (createPDF_CB) {

    global.db.select("Entity", {}, {
        "entityName": 1,
        "arabicName": 1,
        "spCode": 1,
        "shortCode": 1,
        "legacyCode": 1
    }, function (err, data) {
        if (err) {
            console.log(err);
        }
        else {

            var path = global.appDir + "/services/fileServices/jsonToPdf/abc.pdf";
            var doc = new PdfDocument();
            var write = fs.createWriteStream(path);
            doc.pipe(write);

            var doc = new PdfDocument({
                    autoFirstPage: false
                }),
                table = new PdfTable(doc, {
                    bottomMargin: 20
                });


            let obj = {
                id: 'description',
                header: 'Product',
                align: 'left',
                width : 50
            }

            let key = getTemplate("entityGrid");
            if(key.length == 0){
                for (var i in data[0]) {
                    let obj2 = Object.assign({},obj);
                    obj2.id = i;
                    obj2.header = i;
                    key.push(obj2);
                }
            }

            table.addPlugin(new (require('voilab-pdf-table/plugins/fitcolumn'))({
                column: 'description'
            }))
                .setColumnsDefaults({
                    headerBorder: 'LTBR',
                    align: 'center'
                })
                .addColumns(key).onPageAdded(function (tb) {
                    tb.addHeader();
                });
            doc.addPage();

            table.addBody(data);

            createPDF_CB(doc);

        }
    });

}



function getTemplate(gridName){
    try{
        var data = require("../../pdfTemplates/" + gridName + ".json");
        return data;
    }
    catch(err){
        return [];
    }
}

module.exports = createPDF;



