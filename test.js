var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('big_file.txt');

lr.on('error', function (err) {
    // 'err' contains error object
});

lr.on('line', function (line) {
    // pause emitting of lines...
    console.log(`insert into "replicatorQueues" (key,status,block_num,txid,"eventName",isprocessed,"createdAt","updatedAt") values ('{"key":"${line.trim()}","Collection":"LUXC_DHL_Order"}','VALID',1000,'VALID','STUB',false,now(),now());`)  
});


lr.on('end', function () {
    // All lines are read, file is closed now.
});