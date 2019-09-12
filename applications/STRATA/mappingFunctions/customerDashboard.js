'use strict';
const pg = require('../../../core/api/connectors/postgress');
const connector = require('../../../core/api/client');
const _ = require('lodash');

function getTilesData(supplierID) {
    let queryPendingOrder, queryCompletedOrders, payable, totalPaid,
        countPendingOrders, countCompletedOrders, payableOrders, totalPaidOrders;

    if (supplierID && supplierID != "ALL") {
        queryPendingOrder = `select COUNT(1) FROM  orders WHERE "tranxData" ->> 'customerID' ='${supplierID}' And "tranxData" ->> 'status' NOT IN ('019');`;
        queryCompletedOrders = `select COUNT(1) from  orders  WHERE "tranxData" ->> 'customerID' ='${supplierID}' And "tranxData" ->> 'status' = '019' ;`;
        payable = `select "tranxData" ->> 'toPayAmount' AS "amount" from accountings WHERE "tranxData" ->> 'customerID' ='${supplierID}';`
        totalPaid = `select "tranxData" ->> 'paidAmount' AS "paidAmount" from accountings WHERE "tranxData" ->> 'customerID' ='${supplierID}'`;
    }
    else {
        queryPendingOrder = `select COUNT(1) FROM  orders WHERE "tranxData" ->> 'status' NOT IN ('019');`;
        queryCompletedOrders = `select COUNT(1) from  orders  WHERE "tranxData" ->> 'status' = '019' ;`;
        payable = `select "tranxData" ->> 'toPayAmount' AS "amount" from accountings;`
        totalPaid = `select "tranxData" ->> 'paidAmount' AS "paidAmount" from accountings;`
    }
    return pg.connection().then((conn) => {
        return Promise.all([
            conn.query(queryPendingOrder, []),
            conn.query(queryCompletedOrders, []),
            conn.query(payable, []),
            conn.query(totalPaid, [])])
            .then((data) => {

                countPendingOrders = data[0].rows[0].count
                countCompletedOrders = data[1].rows[0].count
                payableOrders = data[2].rows[0].amount
                totalPaidOrders = data[3].rows[0].paidAmount

                let result = {
                    dashboardTiles: [
                        {
                            "id": 1,
                            "title": "Pending Orders",
                            "percentage": 100,
                            "value": countPendingOrders,
                            "actionURI": "",
                            "overDue": "5",
                            "fontClass": "green-steel"
                        },
                        {
                            "id": 1,
                            "title": "Completed Orders",
                            "percentage": 100,
                            "value": countCompletedOrders,
                            "actionURI": "",
                            "overDue": "5",
                            "fontClass": "green-steel"
                        },
                        {
                            "id": 1,
                            "title": "Payable",
                            "percentage": "100",
                            "value": payableOrders,
                            "actionURI": "",
                            "overDue": "0",
                            "fontClass": "green-meadow"
                        },
                        {
                            "id": 1,
                            "title": "Total Paid",
                            "percentage": "100",
                            "value": totalPaidOrders,
                            "actionURI": "",
                            "overDue": "0",
                            "fontClass": "green-jungle"
                        }

                    ],
                }
                return result;
            })
    }).catch((error) => { console.log(error, " <<<<< Some error occurred!"); return [0, 0, 0, 0] });
}
async function getPendingOrder(payloadDashboardData, supplierID) {
    try {
        let getPendingOrder = "";

        const pg = await connector.createClient('pg',
            'postgresql://Admin:avanza123@23.97.138.116:5432/strata?idleTimeoutMillis=3000000');

        if (!!supplierID && supplierID != "ALL") {
            getPendingOrder = `select  "tranxData"  from  orders WHERE 
            "tranxData" ->> 'status' NOT IN ('Paid')
            AND "tranxData" ->> 'customerID' ='${supplierID}'`;
        }
        else if (supplierID == "ALL" || !supplierID) {
            getPendingOrder = `select  "tranxData"  from  orders WHERE 
            "tranxData" ->> 'status' NOT IN ('Paid')`;
        }


        if (payloadDashboardData.pageData) {
            getPendingOrder += ` limit ${payloadDashboardData.pageData.pageSize}
            OFFSET ${
                payloadDashboardData.pageData.pageSize *
                (payloadDashboardData.pageData.currentPageNo - 1)
                } `;
        }
        let queryResult = await pg.query(getPendingOrder);
        let queryCnt = "";
        if (!!supplierID && supplierID != "ALL") {
            queryCnt = `SELECT count(*) FROM orders WHERE
            "tranxData" ->> 'status' NOT IN('Paid')
            And "tranxData" ->> ''customerID'' ='${supplierID}'`;
        }
        else if (supplierID == "ALL" || !supplierID) {
            queryCnt = `SELECT count(*) FROM orders WHERE
                       "tranxData" ->> 'status' NOT IN('Paid')`;
        }


        let totRecords = await pg.query(queryCnt);
        // console.log(totRecords.rows[0].count, "---->>>>>>>>>>>>>>>>>>>>>ROWSCOUNT")
        let totRecordCount = totRecords.rows[0].count;
        let supplierIDtest = "";


        if (!!supplierID && supplierID != "ALL") {
            supplierIDtest = `select * from
            orders where
            orders."tranxData" ->> 'customerID'=
            '${supplierID}'
            AND   orders."tranxData" ->> 'status' NOT IN('PAID')
             `;
        }
        else if (supplierID == "ALL" || !supplierID) {
            supplierIDtest = `select * from
            orders where
            orders."tranxData" ->> 'customerID'=
            '${supplierID}'
            AND   orders."tranxData" ->> 'status' NOT IN('PAID')
             `;
        }

        if (payloadDashboardData.pageData) {
            supplierIDtest += ` limit ${payloadDashboardData.pageData.pageSize}
            OFFSET ${
                payloadDashboardData.pageData.pageSize *
                (payloadDashboardData.pageData.currentPageNo - 1)
                } `;
        }

        let queryResult2 = await pg.query(supplierIDtest);

        // console.log("@@@@@@@@@@@@@@", queryResult2.rows, "@@@@@@@@@@@@@@2")
        let supplierDetails = queryResult2.rows;


        let details = [];
        if (supplierDetails != undefined) {
            supplierDetails.map((item) => {
                let detail = {
                    "supplierName": {
                        "name": item.tranxData.supplierName,
                        "image": item.tranxData.logo
                    }
                }
                details.push(detail);

            })
        }
        // console.log(details, "#########################")
        let PendingOrders = queryResult.rows;
        let pendingOrdersArray = [];
        if (PendingOrders.length !== 0) {
            let response = {}

            for (let i = 0; i < PendingOrders.length; i++) {
                // if(PendingOrders[i].tranxData.sla){
                //     console.log("!!!!!!!!!!!!!!!!!!------------SLAAAAAAAAAAAAA----------!!!!!!!!!!!!!!!")
                // }
                response = {
                    "orderID": PendingOrders[i].tranxData.orderID,
                    "sla": PendingOrders[i].tranxData.sla ? PendingOrders[i].tranxData.sla : [],
                    "status": PendingOrders[i].tranxData.status,
                    "amount": PendingOrders[i].tranxData.orderAmount,
                    "dateCreated": PendingOrders[i].tranxData.dateCreated * 1000,
                    "expectedDate": PendingOrders[i].tranxData.dateCreated * 1000,
                    "supplierName": details[i] ? details[i].supplierName.name : "",

                    "actions": [
                        {
                            "actionType": "componentAction",
                            "iconName": "fa fa-eye",
                            "label": "View",
                            "URI": [
                                "/viewOrder"
                            ]
                        }
                    ]
                }
                pendingOrdersArray.push(response);
            }
            // });
            //  console.log(pendingOrdersArray, "<<<<PENDING ORDER ARRAY >>>");
            return [pendingOrdersArray, totRecordCount]
        }

        else {
            // console.log(PendingOrders, " =====PendingOrders is empty")
            return [];
        };
    }
    catch (err) {
        console.log(err)
    }
}

async function getCompletedOrder(payloadDashboardData, supplierID) {
    try {
        const pg = await connector.createClient('pg',
            'postgresql://Admin:avanza123@23.97.138.116:5432/strata?idleTimeoutMillis=3000000');

        let getCompletedOrder = "";
        if (!!supplierID && supplierID != "ALL") {
            getCompletedOrder = `select  "tranxData"  from  orders
            WHERE "tranxData" ->> 'status' = 'PAID'
            AND "tranxData" ->> 'customerID' ='${supplierID}'`;
        }
        else if (supplierID == "ALL" || !supplierID) {
            getCompletedOrder = `select  "tranxData"  from  orders
                WHERE "tranxData" ->> 'status' = 'PAID'`;
        }

        if (payloadDashboardData.pageData) {
            getCompletedOrder += ` limit ${payloadDashboardData.pageData.pageSize}
            OFFSET ${
                payloadDashboardData.pageData.pageSize *
                (payloadDashboardData.pageData.currentPageNo - 1)
                } `;
        }
        let queryResult = await pg.query(getCompletedOrder);


        let queryCnt = "";
        if (!!supplierID && supplierID != "ALL") {
            queryCnt = `SELECT count(*) FROM orders  WHERE "tranxData" ->> 'status' = 'Paid'
            And "tranxData" ->> 'customerID' ='${supplierID}'`;
        }
        else if (supplierID == "ALL" || !supplierID) {
            queryCnt = `SELECT count(*) FROM orders  WHERE "tranxData" ->> 'status' = 'Paid'`;
        }


        let totRecords = await pg.query(queryCnt);
        // console.log(totRecords.rows[0].count, "---->>>>>>>>>>>>>>>>>>>>>ROWSCOUNT")
        let totRecordCount = totRecords.rows[0].count;


        let supplierIDtest = "";
        if (!!supplierID && supplierID != "ALL") {
            supplierIDtest = `select * from
            orders WHERE orders."tranxData" ->> 'customerID' ='${supplierID}'
            AND orders."tranxData" ->> 'status' = 'PAID'
            `;
        }
        else if (supplierID == "ALL" || !supplierID) {
            supplierIDtest = `select * from
            orders WHERE orders."tranxData" ->> 'customerID' ='${supplierID}'
            AND orders."tranxData" ->> 'status' = 'PAID'`;
        }

        if (payloadDashboardData.pageData) {
            supplierIDtest += ` limit ${payloadDashboardData.pageData.pageSize}
            OFFSET ${
                payloadDashboardData.pageData.pageSize *
                (payloadDashboardData.pageData.currentPageNo - 1)
                } `;
        }

        let queryResult2 = await pg.query(supplierIDtest);

        let supplierDetails = queryResult2.rows;


        let details = [];
        supplierDetails.map((item) => {
            let detail = {
                "supplierName": {
                    "name": item.tranxData.supplierName,
                    "image": item.tranxData.logo
                }
            }
            details.push(detail);

        })

        let CompletedOrder = queryResult.rows;
        let completeOrderArray = [];
        if (CompletedOrder.length !== 0) {

            for (let i = 0; i < CompletedOrder.length; i++) {
                let response = {
                    "orderID": CompletedOrder[i].tranxData.orderID,
                    "customerID": CompletedOrder[i].tranxData.customerID,
                    "status": CompletedOrder[i].tranxData.status,
                    "sla": CompletedOrder[i].tranxData.sla ? CompletedOrder[i].tranxData.sla : [],
                    "amount": CompletedOrder[i].tranxData.orderAmount,
                    "dateCreated": CompletedOrder[i].tranxData.dateCreated * 1000,
                    "expectedDate": CompletedOrder[i].tranxData.dateCreated * 1000,
                    "supplierName": details[i] ? details[i].supplierName.name : "",
                    "actions": [
                        {
                            "actionType": "componentAction",
                            "iconName": "fa fa-eye",
                            "label": "View",
                            "URI": [
                                "/viewOrder"
                            ]
                        }
                    ]
                }
                completeOrderArray.push(response);
            }
            // console.log(completeOrderArray, ">>>>>>>>> CompletedOrder ");
            return [completeOrderArray, totRecordCount];
        }
        else {
            // console.log(" =======CompletedOrder is empty");
            return [];
        }
    }
    catch (err) {
        console.log(err)
    }
}


async function getSettlements(payloadDashboardData, supplierID) {
    try {
        const pg = await connector.createClient('pg',
            'postgresql://Admin:avanza123@23.97.138.116:5432/strata?idleTimeoutMillis=3000000');


        let getSettlements = "";
        if (!!supplierID && supplierID != "ALL") {
            getSettlements = `select "tranxData" from  orders
            where "tranxData" ->> 'status' = 'Dispatched'
            AND "tranxData" ->> 'customerID' ='${supplierID}'`;
        }
        else
            if (supplierID == "ALL" || !supplierID) {
                getSettlements = `select "tranxData" from  orders
            where "tranxData" ->> 'status' = 'Dispatched'`;
            }

        if (payloadDashboardData.pageData) {
            getSettlements += ` limit ${payloadDashboardData.pageData.pageSize}
            OFFSET ${
                payloadDashboardData.pageData.pageSize *
                (payloadDashboardData.pageData.currentPageNo - 1)
                } `
        }

        let queryCnt = "";
        if (!!supplierID && supplierID != "ALL") {
            queryCnt = `SELECT count(*) FROM orders
            where "tranxData" ->> 'status' = 'INVOICED'
            And "tranxData" ->> 'customerID' ='${supplierID}'`;
        }
        else
            if (supplierID == "ALL" || !supplierID) {
                queryCnt = `SELECT count(*) FROM orders
        where "tranxData" ->> 'status' = 'Dispatched'`;
            }

        let totRecords = await pg.query(queryCnt);
        // console.log(totRecords.rows[0].count, "---->>>>>>>>>>>>>>>>>>>>>ROWSCOUNT")
        let totRecordCount = totRecords.rows[0].count;

        let queryResult = await pg.query(getSettlements);

        let Settlements = queryResult.rows;
        let supplierIDtest = "";
        if (!!supplierID && supplierID != "ALL") {
            supplierIDtest = `select * from
    orders WHERE
    orders."tranxData" ->> 'customerID'= '${supplierID}'
    AND orders."tranxData" ->> 'status' = 'Dispatched'`;
        }
        else if (supplierID == "ALL" || !supplierID) {
            supplierIDtest = `select * from
            orders WHERE
            orders."tranxData" ->> 'customerID'= '${supplierID}'
            AND orders."tranxData" ->> 'status' = 'Dispatched'`;
        }


        if (payloadDashboardData.pageData) {
            supplierIDtest += ` limit ${payloadDashboardData.pageData.pageSize}
            OFFSET ${
                payloadDashboardData.pageData.pageSize *
                (payloadDashboardData.pageData.currentPageNo - 1)
                } `;
        }
        let queryResult2 = await pg.query(supplierIDtest);
        // console.log("@@@@@@@@@@@@@@", queryResult2.rows, "@@@@@@@@@@@@@@2")

        let supplierDetails = queryResult2.rows;
        let details = [];
        supplierDetails.map((item) => {
            let detail = {
                "supplierName": {
                    "name": item.tranxData.supplierName,
                    "image": item.tranxData.logo
                }
            }
            details.push(detail);

        })
        let SettlementsArray = [];
        if (Settlements.length !== 0) {
            // console.log(details, "DETAILSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS")
            for (let i = 0; i < Settlements.length; i++) {
                let response = {
                    "orderID": Settlements[i].tranxData.orderID,
                    "customerID": Settlements[i].tranxData.customerID,
                    "status": Settlements[i].tranxData.status,
                    "SLA": Settlements[i].tranxData.sla ? Settlements[i].tranxData.sla : [],
                    "amount": Settlements[i].tranxData.orderAmount,
                    "dateCreated": Settlements[i].tranxData.dateCreated * 1000,
                    "expectedDate": Settlements[i].tranxData.dateCreated * 1000,
                    "supplierName": details[i] ? details[i].supplierName.name : "",
                    "actions": [
                        {
                            "actionType": "componentAction",
                            "iconName": "fa fa-eye",
                            "label": "Settle",
                            "URI": [
                                "/viewOrder"
                            ]
                        }
                    ]
                }
                SettlementsArray.push(response);
            }
            // console.logconsole.log(SettlementsArray, "++++++++=settlements ");
            return [SettlementsArray, totRecordCount]
        }
        else {
            // console.log("++++++++=settlements  is empty");
            return [];
        }
    }
    catch (err) {
        console.log(err)
    }
}

async function getSupplierWiseSettlement(payloadDashboardData, supplierID) {
    try {
        let getSupplierWiseSettlement = "";
        const pg = await connector.createClient('pg',
            'postgresql://Admin:avanza123@23.97.138.116:5432/strata?idleTimeoutMillis=3000000');
        if (!!supplierID && supplierID != "ALL") {
            getSupplierWiseSettlement = `select "tranxData" from  accountings where
            accountings."tranxData" ->> 'customerID'= '${supplierID}'`;
        }
        else if (supplierID == "ALL" || !supplierID) {
            getSupplierWiseSettlement = `select "tranxData" from  accountings`;
        }
        if (payloadDashboardData.pageData) {
            getSupplierWiseSettlement += ` limit ${payloadDashboardData.pageData.pageSize}
            OFFSET ${
                payloadDashboardData.pageData.pageSize *
                (payloadDashboardData.pageData.currentPageNo - 1)
                } `;
        }
        let queryResult = await pg.query(getSupplierWiseSettlement);


        let supplierWiseSettlement = queryResult.rows;

        let supplierIDtest = "";
        // if (!!supplierID && supplierID != "ALL") {
        //     supplierIDtest = `select "tranxData" ->> 'supplierName' AS "supplierName" from
        //     suppliers where "tranxData" ->> 'supplierID'= '${supplierID}' `;
        // }
        // else if(supplierID == "ALL" || !supplierID) {
        //     supplierIDtest = `select "tranxData" ->> 'supplierName' AS "supplierName" from
        //     suppliers`;
        // }
        // if (payloadDashboardData.pageData) {
        //     supplierIDtest += ` limit ${payloadDashboardData.pageData.pageSize}
        //     OFFSET ${
        //         payloadDashboardData.pageData.pageSize *
        //         (payloadDashboardData.pageData.currentPageNo - 1)
        //         } `;
        // }
        //let queryResult2 = await pg.query(supplierIDtest);

        let supplierWiseSettlementArray = [];
        if (supplierWiseSettlement.length !== 0) {

            for (let i = 0; i < supplierWiseSettlement.length; i++) {
                //if (queryResult2.rows[0].supplierName) {
                let response = {

                    "toPay": supplierWiseSettlement[i].tranxData.amount,
                    "totalPaid": supplierWiseSettlement[i].tranxData.paidAmount,
                    "name": 'Etihad'
                }
                supplierWiseSettlementArray.push(response);
                // }

            }
            // console.log(">>>>>>>>> supplierWiseSettlement ");
            return supplierWiseSettlementArray
        }
        else {
            // console.log(supplierWiseSettlementArray, " =======supplierWiseSettlement is empty");
            return [];
        }


    }
    catch (err) {
        console.log(err)
    }
}

function getGraphData(supplierID) {
    console.log(supplierID, "SUPPLIERID")

    let getGridData, purchaseOrder, orderReceived, componentManufacturing, dispatched, received,
        accepted_rejected, inspected, paymentOrder, paid;


    if (supplierID && supplierID != "ALL") {
        getGridData = `SELECT count(orders.key), orders."tranxData" ->> 'status' as "status",orders."tranxData" ->> 'customerID' as "customerID"
                FROM orders WHERE orders."tranxData" ->> 'customerID'= '${supplierID}'
              GROUP BY  orders."tranxData" ->> 'status',orders."tranxData" ->>'customerID';`;
    }
    return pg.connection().then((conn) => {
        return Promise.all([
            conn.query(getGridData, [])
        ]).then((data) => {
            console.log(data[0].rows, "rows")

            purchaseOrder = data[0].rows.filter(obj => obj.status === "001");
            orderReceived = data[0].rows.filter(obj => obj.status === "002");
            componentManufacturing = data[0].rows.filter(obj => obj.status === "003");
            dispatched = data[0].rows.filter(obj => obj.status === "010");
            inspected = data[0].rows.filter(obj => obj.status === "012");
            accepted_rejected = data[0].rows.filter(obj => obj.status === "013" || obj.status === "013");
            paymentOrder = data[0].rows.filter(obj => obj.status === "018");
            received = data[0].rows.filter(obj => obj.status === "011");
            paid = data[0].rows.filter(obj => obj.status === "019");


            let result = {
                purchaseOrder: purchaseOrder[0] ? purchaseOrder[0].count : 0,
                orderReceived: orderReceived[0] ? orderReceived[0].count : 0,
                componentManufacturing: componentManufacturing[0] ? componentManufacturing[0].count : 0,
                dispatched: dispatched[0] ? dispatched[0].count : 0,
                received: received[0] ? received[0].count : 0,
                inspected: inspected[0] ? inspected[0].count : 0,
                accepted_rejected: accepted_rejected[0] ? accepted_rejected[0].count : 0,
                paymentOrder: paymentOrder[0] ? paymentOrder[0].count : 0,
                paid: paid[0] ? paid[0].count : 0
            }
            return result;
        })
    }).catch((e) => { console.log(e, "<<< Some error occurred while working on graphData"); return e; })

}

exports.cusDashboardData = async function (payload, UUIDKey, route, callback, JWToken) {
    try {
        console.log(payload.dashboardPendingGridData.supplierID, "payload.dashboardPendingGridData.supplierID")
        console.log("<<<<<<<<<<<<<<-----------------------DASHBOARD STARTED ----------------------->>>>>>>>>")
        let tilesData = await getTilesData(payload.dashboardPendingGridData.supplierID);

        let pendingOrderRows = await getPendingOrder(payload.dashboardPendingGridData, payload.dashboardPendingGridData.supplierID);
        let completedOrderRows = await getCompletedOrder(payload.dashboardCompletedGridData, payload.dashboardCompletedGridData.supplierID);
        let settlementsRows = await getSettlements(payload.dashboardSettlementGridData, payload.dashboardSettlementGridData.supplierID);
        let supplierWiseSettlementRows = await getSupplierWiseSettlement(payload.dashboardSupplierSettlement, payload.dashboardSupplierSettlement.supplierID);
        let graphData = await getGraphData(payload.dashboardPendingGridData.supplierID);
        console.log(graphData, "graphData")
        let customerDashboardData = {
            "customerDashboardData": {
                "data": {
                    "graphData": {
                        "graphSummary": {
                            "id": 1,
                            "title": "",
                            "percentage": "",
                            "value": "99",
                            "overDue": "5",
                            "URI": ""
                        },
                        "legends": [
                            "ETIHAD",
                        ],
                        "chartData": {
                            "firstBar": [
                                    graphData.purchaseOrder,
                                    graphData.orderReceived,
                                    graphData.componentManufacturing,
                                    graphData.dispatched,
                                    graphData.received,
                                    graphData.inspected,
                                    graphData.accepted_rejected,
                                    graphData.payableOrders,
                                    graphData.paid,
                                ],
                            "secondBar": [
                                8,
                                5,
                                10,
                                3,
                                20,
                                11
                            ]
                        },
                        "labels": [
                            "Order Received", "Purchase Order",
                            "Component Manufacturing", "Dispatched",
                            "Received", "Inspected",
                            "Accepted/Rejected", "Payment Order",
                            "Paid"

                        ]
                    },
                    "dashboardTiles": tilesData.dashboardTiles,
                    "dashboardPendingGridData": {
                        "pageData": {
                            "pageSize": payload.dashboardPendingGridData.pageData.pageSize,
                            "currentPageNo": payload.dashboardPendingGridData.pageData.currentPageNo,
                            "totalRecords": pendingOrderRows !== undefined ? pendingOrderRows[1] : []
                        },
                        pendingOrderRows: pendingOrderRows !== undefined ? pendingOrderRows[0] : []
                    },
                    "dashboardCompletedGridData": {
                        "pageData": {
                            "pageSize": payload.dashboardCompletedGridData.pageData.pageSize,
                            "currentPageNo": payload.dashboardCompletedGridData.pageData.currentPageNo,
                            "totalRecords": completedOrderRows !== undefined ? completedOrderRows[1] : []
                        },
                        completedOrderRows: completedOrderRows !== undefined ? completedOrderRows[0] : []
                    },
                    "dashboardSettlementGridData": {
                        "pageData": {
                            "pageSize": payload.dashboardSettlementGridData.pageData.pageSize,
                            "currentPageNo": payload.dashboardSettlementGridData.pageData.currentPageNo,
                            "totalRecords": settlementsRows !== undefined ? settlementsRows[1] : []
                        },
                        settlementsRows: settlementsRows !== undefined ? settlementsRows[0] : []

                    },
                    "dashboardSupplierSettlement": {
                        "pageData": {
                            "pageSize": payload.dashboardSupplierSettlement.pageData.pageSize,
                            "currentPageNo": payload.dashboardSupplierSettlement.pageData.currentPageNo,
                            "totalRecords": supplierWiseSettlementRows !== undefined ? supplierWiseSettlementRows.length : []
                        },
                        supplierWiseSettlementRows: supplierWiseSettlementRows !== undefined ? supplierWiseSettlementRows : []
                    }
                }
            }
        }
        return callback(customerDashboardData);
    }
    catch (err) {
        return callback(err);
    }
}



