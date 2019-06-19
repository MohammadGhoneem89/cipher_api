'use strict';

const pg = require('../../../../core/api/connectors/postgress');

const addNotificationRules = async (payload, UUIDKey, route, callback, JWToken) => {
    // console.log(payload, 'payload');
    try {
    const conn = await pg.connection()
    let query = `INSERT INTO public."NotificationsRule"(
        "ruleType", "ruleId", stream, "isActive", description, location, "executionType", scheduled, "time", "parameterOrConditions", "workOndata")
        VALUES ('${payload.body.ruleType}', '${payload.body.ruleId}', '${payload.body.stream}', ${payload.body.isActive}, '${payload.body.description}',
             '${payload.body.location}', '${payload.body.executionType}', '${payload.body.scheduled}', '${payload.body.time}', '${JSON.stringify(payload.body.ruleParametersOrCondition)}',
              '${JSON.stringify(payload.body.workOnData)}');`
             console.log('query', query)
        const execQuery = await conn.query(query)
        const response = {
            listNotificationRules: {
                action: 'addNotificationRules',
                data: {
                    message: {
                        status: 'OK',
                        errorDescription: 'Notification Rule Added Successfully.',
                        displayToUser: true
                    },
                    searchResult: []
                }
            }
        };
        callback(response);
    } catch(error) {
        callback({error});
    }
};

const listNotificationRules = async (payload, UUIDKey, route, callback, JWToken) => {
    try {
    const conn = await pg.connection()
    let query = `Select * from public."NotificationsRule";`
             console.log('query', query)
        const execQuery = await conn.query(query)
        const response = {
            listNotificationRules: {
                action: 'listNotificationRules',
                data: {
                    message: {
                        status: 'OK',
                        errorDescription: 'List of Notification Rules',
                        displayToUser: false
                    },
                    searchResult: []
                }
            }
        };
        if (execQuery && execQuery['rows']) {
            for (let record of execQuery['rows']) {
                record.actions =   [{
                    "value": "1003",
                    "type": "componentAction",
                    "label": "View",
                    "params": "",
                    "iconName": "icon-docs",
                    "URI": ["/etisalat/notificationRulesList"]
                }];
                response.listNotificationRules.data.searchResult.push(record);
            }
        }
        callback(response);
    } catch(error) {
        const response = {
            listNotificationRules: {
                action: 'listNotificationRules',
                data: {
                    message: {
                        status: 'OK',
                        errorDescription: error.message,
                        displayToUser: true
                    },
                    searchResult: []
                }
            }
        };
        callback(response);
    }
};



exports.addNotificationRules = addNotificationRules;
exports.listNotificationRules = listNotificationRules;