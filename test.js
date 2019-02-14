var zip = new require('node-zip')();
zip.file('test.file', 'hello there');
var data = zip.generate({base64:false,compression:'DEFLATE'});
console.log(data);

var fs = require('fs'),
    path = require('path'),    
    filePath = path.join(__dirname, './Chaincode/ChaincodeTemplate.txt');

fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
    if (!err) {
        console.log('received data: ' + data);
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    } else {
        console.log(err);
    }
});