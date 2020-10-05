var http = require("http");

console.log("---------->>>>>> process.argv[2]",process.argv[2]);
console.log("---------->>>>>> process.argv[3]",process.argv[3]);
console.log("---------->>>>>> process.argv[4]",process.argv[4]);
console.log("---------->>>>>> process.argv[5]",process.argv[5]);
var options = {  
    host : process.argv[2],
    port : Number(process.argv[3]),
    timeout : Number(process.argv[4]),
    path: process.argv[5],
    method: 'GET'
};

var request = http.request(options, (res) => {  

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
      });


    res.on('end', () => {
        jsonData=JSON.parse(data);

        if (jsonData.state == "healthy") {
            console.log("healthy exit")
            process.exit(0);
        }
        else {
            console.log("Unhealthy exit")
            process.exit(1);
        }
      });

});

request.on('error', function(err) {  
    console.log('ERROR'+ err);
    process.exit(1);
});

request.end();