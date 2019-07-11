'use strict';



exports.getDashboardData = function (payload, UUIDKey, route, callback, JWToken) {
    let response = { "getDashboardData": { "action": "getDashboardData", "data": { "summary": { "couriers": 1, "orders": 50, "returns": 1 }, "orderTracking": { "finalized": 17, "hawbCreated": 26, "exportCleared": 30, "delivered": 19, "returnByCustomer": 35, "undelivered": 30, "importCleared": 27, "partialReturn": 30, "fullReturn": 20 }, "filterCriteria": "HS Codes", "topStats": [{ "label": "HS Code 1", "expAuth": 22 }, { "label": "HS Code 2", "expAuth": 15 }, { "label": "HS Code 3", "expAuth": 13 }, { "label": "HS Code 4", "expAuth": 8 }, { "label": "HS Code 5", "expAuth": 6 }], "analysisByValue": { "return": 5, "delivered": 1 }, "courierByValue": [{ "name": "Courier 1", "value": 5 }, { "name": "Courier 2", "value": 2 }, { "name": "Courier 3", "value": 1 }] } } }
    return callback(response);

};