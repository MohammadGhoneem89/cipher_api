const rp = require('request-promise');

module.exports = async (url, data) => {
    const timeout = 300000; // 5minutes
    const options = {
        method: 'POST',
        timeout: timeout,
        uri: url,
        body: {
            data: data
        },
        json: true // Automatically stringifies the body to JSON
    };

    let result = await rp(options);
    return result; 
}
