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
        let response = {
            "addNotificationRules": {
                "action": "notificationRulesList"
            }
        };
        callback(response);
    } catch(error) {
        callback({error});
    }
};



exports.addNotificationRules = addNotificationRules;