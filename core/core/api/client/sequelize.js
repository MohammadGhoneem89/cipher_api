const Sequelize = require('sequelize');
const crypto = require('crypto');

var SQExistingList = {};


module.exports = async function (connectionURL) {
    const hash = crypto.createHash('md5').update(connectionURL).digest("hex");
    const createNewInstance = async () => {
        const sequelize = new Sequelize(connectionURL, {
            define: {
                //prevent sequelize from pluralizing table names
                freezeTableName: true
            },
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            logging: true,
            dialectOptions: {
                encrypt: true
            }
        });
        await sequelize.authenticate();
        SQExistingList[hash] = sequelize;
    };

    if (SQExistingList[hash]) {
        console.log('Returning an existing SQ instance');
    } else {
        console.log('Creating a SQ instance');
        await createNewInstance();
    }
    return SQExistingList[hash];
};