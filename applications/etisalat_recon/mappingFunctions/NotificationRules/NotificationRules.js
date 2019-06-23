'use strict';

const pg = require('../../../../core/api/connectors/postgress');

const addNotificationRules = async (payload, UUIDKey, route, callback, JWToken) => {
    // console.log(payload, 'payload');
    try {
        const conn = await pg.connection();
        let querySearchId = `Select * from public."NotificationsRule" WHERE "ruleId"='${payload.body.ruleId}';`;
        let query = `INSERT INTO public."NotificationsRule"(
        "ruleType", "ruleId", stream, "isActive", description, location, "executionType", scheduled, "time", "parameter", "workOndata", "uimessage", "condition")
        VALUES ('${payload.body.ruleType}', '${payload.body.ruleId}', '${payload.body.stream}', ${payload.body.isActive}, '${payload.body.description}',
             '${payload.body.location}', '${payload.body.executionType}', '${payload.body.scheduled}', '${payload.body.time}', '${JSON.stringify(payload.body.ruleParameters)}',
              '${JSON.stringify(payload.body.workOnData)}', '${payload.body.uimessage}', '${JSON.stringify(payload.body.ruleConditions)}');`
              const execQuerySearchId = await conn.query(querySearchId);
              console.log('query', query, execQuerySearchId)
        if (execQuerySearchId && execQuerySearchId['rows'] && execQuerySearchId['rows'].length) {
            const response = {
                listNotificationRules: {
                    action: 'addNotificationRules',
                    data: {
                        message: {
                            status: 'OK',
                            errorDescription: 'Notification Rule Already exist with same Rule ID.',
                            displayToUser: true
                        },
                        searchResult: []
                    }
                }
            };
            return callback(response);
        }
        const execQuery = await conn.query(query);
        if (execQuery) {
            const response = {
                listNotificationRules: {
                    action: 'addNotificationRules',
                    data: {
                        message: {
                            status: 'OK',
                            errorDescription: 'Notification Rule Added Successfully.',
                            displayToUser: true,
                            newPageURL: "/etisalat/notificationRulesList"
                        },
                        searchResult: []
                    }
                }
            };
            callback(response);
        }
    } catch (error) {
        const response = {
            listNotificationRules: {
                action: 'addNotificationRules',
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

const listNotificationRules = async (payload, UUIDKey, route, callback, JWToken) => {
    let body = payload.body;
    let searchCriteria = false;
    if (Object.keys(body.searchCriteria).length && Object.keys(body.searchCriteria).length > 0) {
        searchCriteria = true
        console.log('searchCriteria', searchCriteria, Object.keys(body.searchCriteria).length && Object.keys(body.searchCriteria).length > 0)
    }
    try {
        const conn = await pg.connection()
        let sizing = ` ORDER BY "ruleId" DESC LIMIT ${body.pageSize} OFFSET ${body.pageNumber};`
        let totalRecords = `Select * from public."NotificationsRule"`;
        let query = `Select * from public."NotificationsRule"`;
        if (searchCriteria) {
            if (body.searchCriteria.stream && body.searchCriteria.ruleId) {
                query += ` WHERE "stream" like '%${body.searchCriteria.stream}%' 
                and "ruleId" LIKE '%${body.searchCriteria.ruleId}%' ${sizing}`;
                totalRecords += ` WHERE "stream" like '%${body.searchCriteria.stream}%' 
                and "ruleId" LIKE '%${body.searchCriteria.ruleId}%'`;
            } else
                if (body.searchCriteria.stream) {
                    query += ` WHERE "stream" like '%${body.searchCriteria.stream}%' ${sizing}`;
                    totalRecords += ` WHERE "stream" like '%${body.searchCriteria.stream}%'`;
                } else
                    if (body.searchCriteria.ruleId) {
                        query += ` WHERE "ruleId" like '%${body.searchCriteria.ruleId}%' ${sizing}`;
                        totalRecords += ` WHERE "ruleId" LIKE '%${body.searchCriteria.ruleId}%'`;
                    }

        } else {
            query += sizing
        }

        console.log('query', query, totalRecords)
        const execQuery = await conn.query(query);
        const execQueryTotalRecords = await conn.query(totalRecords);
        let TotalRocoreds = 0;
        if (execQueryTotalRecords && execQueryTotalRecords['rows'] && execQueryTotalRecords['rows'].length) {
            TotalRocoreds = execQueryTotalRecords['rows'].length;
        }
        const response = {
            listNotificationRules: {
                action: 'listNotificationRules',
                data: {
                    message: {
                        status: 'OK',
                        errorDescription: 'List of Notification Rules',
                        displayToUser: false
                    },
                    TotalRocoreds,
                    searchResult: []
                }
            }
        };
        if (execQuery && execQuery['rows']) {
            for (let record of execQuery['rows']) {
                record.actions = [{
                    "value": "1003",
                    "type": "componentAction",
                    "label": "View",
                    "params": "",
                    "iconName": "icon-docs",
                    "URI": ["/etisalat/addNotificationRule"]
                }];
                response.listNotificationRules.data.searchResult.push(record);
            }
        }
        console.dir(conn)
        callback(response);
    } catch (error) {
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

const getSingleNotificationRule = async (payload, UUIDKey, route, callback, JWToken) => {
    let query = `Select * from public."NotificationsRule"`;
    if (payload.body.ruleId) {
        query += ` WHERE "ruleId"='${payload.body.ruleId}'`;
    }
    const response = {
        listNotificationRules: {
            action: 'getSingleNotificationRule',
            data: {
                message: {
                    status: 'OK',
                    errorDescription: 'Notification Rule by Rule ID',
                    displayToUser: false
                },
                searchResult: []
            }
        }
    }
    try {
        const conn = await pg.connection();
        const execQuery = await conn.query(query);
        if (execQuery && execQuery['rows']) {
            response.listNotificationRules.data.searchResult = execQuery['rows'];
        }
        callback(response);
    } catch (error) {
        const response = {
            listNotificationRules: {
                action: 'getSingleNotificationRule',
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
}

const updateNotificationRule = async (payload, UUIDKey, route, callback, JWToken) => {
    let query = `UPDATE public."NotificationsRule"
    SET "ruleType"='${payload.body.ruleType}', stream='${payload.body.stream}', "isActive"=${payload.body.isActive}, description='${payload.body.description}',
     location='${payload.body.location}', "executionType"='${payload.body.executionType}', scheduled='${payload.body.scheduled}', "time"='${payload.body.time}',
      parameter='${JSON.stringify(payload.body.ruleParameters)}', "workOndata"='${JSON.stringify(payload.body.workOnData)}',
       uimessage='${payload.body.uimessage}', condition='${JSON.stringify(payload.body.ruleConditions)}'
	WHERE "ruleId"='${payload.body.ruleId}'`;
    const response = {
        listNotificationRules: {
            action: 'updateNotificationRule',
            data: {
                message: {
                    status: 'OK',
                    errorDescription: 'Notification Rule update Successfully',
                    displayToUser: false,
                    newPageURL: "/etisalat/notificationRulesList"
                },
                searchResult: []
            }
        }
    }
    try {
        const conn = await pg.connection();
        const execQuery = await conn.query(query);
        callback(response);
    } catch (error) {
        const response = {
            listNotificationRules: {
                action: 'getSingleNotificationRule',
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
}



exports.addNotificationRules = addNotificationRules;
exports.listNotificationRules = listNotificationRules;
exports.getSingleNotificationRule = getSingleNotificationRule;
exports.updateNotificationRule = updateNotificationRule;