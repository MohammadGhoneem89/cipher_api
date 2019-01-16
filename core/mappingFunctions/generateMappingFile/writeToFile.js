const fs = require('fs');
const path = require('path')
module.exports = function (useCase, route, file, isActions, callback) {
    const name = useCase+"_"+route;
    let actions = '';
    if (isActions) {
        actions = `for(let i=0;i<response.length;i++){
            response[i]['actions']=[{
                "actionType": "COMPONENT_FUNCTION",
                "iconName": "fa fa-eye",
                "label": "View",
                "URI": [
                    "/"
                ]
            }]
        }`
    }
    let overall = `  const Sequelize = require('sequelize');\n
    const keyVaultRepo = require('../../../lib/repositories/keyVault');\n
    const client = require('../../api/client');
    \nconst execute = async function (payload, UUIDKey, route, callback, JWToken) {
        try{
            ${file}
            \n${actions}
            callback(response);
        } catch(err){
            callback({error: err})
        }
        \n}
        \nexports.execute = execute;
    `;
    fs.writeFile(path.join(__dirname, '../', 'generated', `${name}.js`), overall, function (err) {
        if (err) {
            callback({
                error: err
            })
        }
        callback({
            generateMappingFile: {
                data: {
                    uuid: name,
                    functionName: 'execute',
                    path: `/generated/${name}.js`
                },
                status: 'OK'
            }
        })
    });
}