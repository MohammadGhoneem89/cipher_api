const fs = require('fs');
const path = require('path')
module.exports = function (useCase, route, file, isActions, componentActions, callback) {
    const name = useCase + "_" + route;
    let actions = '';
    componentActions = componentActions.map(component => {
        if(component.URI[0]){

        }
        return component;
    });
    if (isActions) {
        actions = `
        const actions = ${JSON.stringify(componentActions)};
        let regexp = /%[a-zA-Z0-9]{0,100}%/ig;
        for(let i=0;i<response.length;i++){
            response[i]['actions'] = [];
            const item = response[i];
            for(let j=0;j<actions.length;j++){
                let newAction = JSON.stringify(actions[j]);
                let toBeReplaced = newAction.match(regexp);
                if(toBeReplaced.length>0){
                    let field = toBeReplaced[0].replace('%','').replace('%','');
                    let toReplace = item[field]
                    newAction = newAction.replace(toBeReplaced,toReplace);
                }
                response[i]['actions'].push(JSON.parse(newAction))
            }
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