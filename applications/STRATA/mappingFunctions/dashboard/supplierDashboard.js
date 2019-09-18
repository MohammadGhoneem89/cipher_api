'use strict';
const pg = require('../../../../core/api/connectors/postgress');

function getStatusLabel(status) {
    let label;
    switch (status) {

        case "001": { label = "Order Received"; return label; };
        case "002": { label = "Purchase Order"; return label; };
        case "003": { label = "Component Manufacturing"; return label; };
        case "004": { label = "Part Identification"; return label; };
        case "005": { label = "Part Inspection"; return label; };
        case "006": { label = "Final Inspection and Identification"; return label; };
        case "007": { label = "Part Testing"; return label; };
        case "008": { label = "Assembly"; return label; };
        case "009": { label = "Paint/Finish"; return label; };
        case "010": { label = "Dispatched"; return label; };
        case "011": { label = "Received"; return label; };
        case "012": { label = "Inspected"; return label; };
        case "013": { label = "Accepted"; return label; };
        case "014": { label = "Rejected"; return label; };
        case "015": { label = "Reviewed"; return label; };
        case "016": { label = "Concession"; return label; };
        case "017": { label = "Scrapped"; return label; };
        case "018": { label = "Payment Order"; return label; };
        case "019": { label = "Paid"; return label; };
        default: { label = label }
    }
}
function getTilesData(customerID) {
    let queryPendingOrder, queryCompletedOrders, payable, totalPaid,
        countPendingOrders, countCompletedOrders, payableOrders, totalPaidOrders;
    let pAmount = 0, paidOrder = 0;

    if (customerID && customerID != "ALL") {
        queryPendingOrder = `select COUNT(1) FROM  orders WHERE "tranxData" ->> 'customerID' ='${customerID}' And "tranxData" ->> 'status' NOT IN ('019');`;
        queryCompletedOrders = `select COUNT(1) from  orders  WHERE "tranxData" ->> 'customerID' ='${customerID}' And "tranxData" ->> 'status' = '019' ;`;
        payable = `select "tranxData" ->> 'toPayAmount' AS "amount",
        "tranxData" ->> 'creditNoteAmount' AS "creditNoteAmount",
        "tranxData" ->> 'totalDiscount' AS "totalDiscount"
          from accountings WHERE "tranxData" ->> 'customerID' ='${customerID}';`
        totalPaid = `select "tranxData" ->> 'paidAmount' AS "paidAmount" from accountings WHERE "tranxData" ->> 'customerID' ='${customerID}'`;
    }
    else {
        queryPendingOrder = `select COUNT(1) FROM  orders WHERE "tranxData" ->> 'status' NOT IN ('019');`;
        queryCompletedOrders = `select count(1) from orders where "tranxData"->>'status' = '019'`;
        payable = `select "tranxData" ->> 'toPayAmount' AS "amount",
        "tranxData" ->> 'creditNoteAmount' AS "creditNoteAmount",
        "tranxData" ->> 'totalDiscount' AS "totalDiscount" from accountings;`
        totalPaid = `select "tranxData" ->> 'paidAmount' AS "paidAmount" from accountings;`
    }
    return pg.connection().then((conn) => {
        return Promise.all([
            conn.query(queryPendingOrder, []),
            conn.query(queryCompletedOrders, []),
            conn.query(payable, []),
            conn.query(totalPaid, [])])
            .then((data) => {
                // console.log(data[2].rows, "!!! data[2].rows\n\n\n ---->>>>")
                // console.log(data[1].rows, "!!! data[1].rows\n\n\n ---->>>>")
                countPendingOrders = data[0].rows[0].count
                countCompletedOrders = data[1].rows[0].count
                payableOrders = data[2].rows
                totalPaidOrders = data[3].rows

                for (let i in payableOrders) { pAmount += payableOrders[i].amount - payableOrders[i].creditNoteAmount - payableOrders[i].totalDiscount; }
                for (let i in totalPaidOrders) { paidOrder += totalPaidOrders[i].paidAmount; }

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
                            "value": pAmount,
                            "actionURI": "",
                            "overDue": "0",
                            "fontClass": "green-meadow"
                        },
                        {
                            "id": 1,
                            "title": "Total Paid",
                            "percentage": "100",
                            "value": paidOrder,
                            "actionURI": "",
                            "overDue": "0",
                            "fontClass": "green-jungle"
                        }

                    ],
                }
                return result;
            })
    }).catch((error) => { console.log(error, " <<<<< Some error occurred while working on tiles data!"); return [0, 0, 0, 0] });
}

function getGraphData(customerID) {
    console.log(customerID, "customerID")

    let getGridData, purchaseOrder, orderReceived, componentManufacturing, dispatched, received,
        accepted, rejected, reviewed, scrapped, concession, inspected, paymentOrder, paid;


    if (customerID && customerID != "ALL") {
        console.log("ALLLL")
        getGridData = `SELECT count(orders.key), orders."tranxData" ->> 'status' as "status",orders."tranxData" ->> 'customerID' as "customerID"
                FROM orders WHERE orders."tranxData" ->> 'customerID'= '${customerID}'
              GROUP BY  orders."tranxData" ->> 'status',orders."tranxData" ->>'customerID';`;
    } else {
        console.log("CUSTOMERID")
        getGridData = `SELECT count(orders.key), orders."tranxData" ->> 'status' as "status",orders."tranxData" ->> 'customerID' as "customerID"
        FROM orders
      GROUP BY  orders."tranxData" ->> 'status',orders."tranxData" ->>'customerID';`;
    }
    return pg.connection().then((conn) => {
        return Promise.all([
            conn.query(getGridData, [])
        ]).then((data) => {
            console.log(data[0].rows, "rows")

            purchaseOrder = data[0].rows.filter(obj => obj.status === "001");
            orderReceived = data[0].rows.filter(obj => obj.status === "002");
            componentManufacturing = data[0].rows.filter(obj =>
                obj.status === "003" ||
                obj.status === "004" ||
                obj.status === "005" ||
                obj.status === "006" ||
                obj.status === "007" ||
                obj.status === "008" ||
                obj.status === "009");
            dispatched = data[0].rows.filter(obj => obj.status === "010");
            inspected = data[0].rows.filter(obj => obj.status === "012");
            accepted = data[0].rows.filter(obj => obj.status === "013");
            rejected = data[0].rows.filter(obj => obj.status === "014");
            reviewed = data[0].rows.filter(obj => obj.status === "015");
            concession = data[0].rows.filter(obj => obj.status === "016");
            scrapped = data[0].rows.filter(obj => obj.status === "017");
            paymentOrder = data[0].rows.filter(obj => obj.status === "018");
            received = data[0].rows.filter(obj => obj.status === "011");
            paid = data[0].rows.filter(obj => obj.status === "019");
            //console.log(purchaseOrder,orderReceived,componentManufacturing,paid, "rows")

            function calculateCount(arr) {
                let counter = 0;
                console.log(arr, "arr")

                for (let i in arr) { counter += Number(arr[i].count) }
                return counter;
            }
            let result = {

                purchaseOrder: purchaseOrder ? calculateCount(purchaseOrder) : 0,
                orderReceived: orderReceived ? calculateCount(orderReceived) : 0,
                componentManufacturing: componentManufacturing ? calculateCount(componentManufacturing) : 0,
                dispatched: dispatched ? calculateCount(dispatched) : 0,
                received: received ? calculateCount(received) : 0,
                inspected: inspected ? calculateCount(inspected) : 0,
                accepted: accepted ? calculateCount(accepted) : 0,
                rejected: rejected ? calculateCount(rejected) : 0,
                reviewed: reviewed ? calculateCount(reviewed) : 0,
                concession: concession ? calculateCount(concession) : 0,
                scrapped: scrapped ? calculateCount(scrapped) : 0,
                paymentOrder: paymentOrder ? calculateCount(paymentOrder) : 0,
                paid: paid ? calculateCount(paid) : 0
            }

            console.log(result, "result")
            return result;
        })
    }).catch((e) => { console.log(e, "<<< Some error occurred while working on graphData"); return e; })

}


function getPendingOrder(payloadDashboardData, customerID) {

    let pendingOrderData, countPendingOrders, pendingOrderDataArray = [], totPendingOrders, POdate = 0;

    if (customerID && customerID != "ALL") {
        pendingOrderData = `select  "tranxData"->> 'orderID' AS "ORDERID",
        "tranxData"->> 'dateCreated' AS "PODATE",
        "tranxData" ->> 'customerID' AS "CUSTOMERID",
        "tranxData"->> 'orderAmount' AS "AMOUNT",
        "tranxData"->> 'orderType' AS "ORDERTYPE",
        "tranxData"->> 'sla' AS "sla",
        "tranxData"->> 'activities' AS "activities",
        "tranxData"->> 'status' AS "STATUS"
        from  orders WHERE  "tranxData" ->> 'status'  NOT IN ('019') AND 
		"tranxData" ->> 'customerID' = '${customerID}'`
        countPendingOrders = `SELECT count(*) FROM orders WHERE "tranxData" ->> 'status' NOT IN ('019') And "tranxData" ->> 'customerID' = '${customerID}'`
    } else {
        pendingOrderData = `select  "tranxData"->> 'dateCreated' AS "PODATE",
        "tranxData" ->> 'customerID' AS "CUSTOMERID",
        "tranxData"->> 'orderAmount' AS "AMOUNT",
        "tranxData"->> 'sla' AS "sla",
        "tranxData"->> 'activities' AS "activities",
        "tranxData"->> 'orderType' AS "ORDERTYPE",
        "tranxData"->> 'status' AS "STATUS"  from  orders WHERE "tranxData" ->> 'status' NOT IN ('019')`;
        countPendingOrders = `SELECT count(*) FROM orders WHERE  "tranxData" ->> 'status' NOT IN('019')`;
    }


    if (payloadDashboardData.pageData && payloadDashboardData.pageData.pageSize && payloadDashboardData.pageData.currentPageNo) {
        pendingOrderData += ` limit ${payloadDashboardData.pageData.pageSize}
            OFFSET ${ payloadDashboardData.pageData.pageSize * (payloadDashboardData.pageData.currentPageNo - 1)} `;
    }

    return pg.connection().then((conn) => {
        return Promise.all([
            conn.query(pendingOrderData, []),
            conn.query(countPendingOrders, [])
        ])
            .then((data) => {
                pendingOrderData = data[0].rows
                totPendingOrders = data[1].rows[0].count;

                for (let i in pendingOrderData) {
                    let PO_DATE = 0;

                    let pendingOrderActivities = JSON.parse(pendingOrderData[i].activities);
                    for (let j in pendingOrderActivities) {
                        if (pendingOrderActivities[j].toStage === "002") {
                            PO_DATE = pendingOrderActivities[j].date
                        }
                    }
                    // console.log(PO_DATE, " ???? PO_DATE")

                    let response = {
                        "orderID": pendingOrderData[i].ORDERID,
                        "customerID": pendingOrderData[i].CUSTOMERID,
                        "status": getStatusLabel(pendingOrderData[i].STATUS),
                        "amount": pendingOrderData[i].AMOUNT,
                        "dateCreated": PO_DATE,
                        "orderType": pendingOrderData[i].ORDERTYPE,
                        "sla": pendingOrderData[i].sla,
                        "actions": [
                            {
                                "actionType": "componentAction",
                                "iconName": "fa fa-eye",
                                "label": "View",
                                "URI": [
                                    "/strata/viewOrder"
                                ]
                            }
                        ]
                    }
                    // console.log(response.dateCreated, "response.dateCreated")
                    pendingOrderDataArray.push(response);
                }
                let result = {
                    dashboardPendingGridData: {
                        "pageData": {
                            "pageSize": payloadDashboardData.pageData.pageSize,
                            "currentPageNo": payloadDashboardData.pageData.currentPageNo,
                            "totalRecords": totPendingOrders
                        },

                        pendingOrderRows: pendingOrderDataArray
                    }
                }

                return result;

            })
    }).catch((error) => {
        console.log(error, " <<<<< Some error occurred while working on pending order data!");
        return [];
    });
}

function getCompletedOrder(payloadDashboardData, customerID) {
    let completedOrderData, countCompletedOrders, completedOrderDataArray = [], totCompletedOrder;

    if (customerID && customerID != "ALL") {
        completedOrderData = `select  "tranxData"->> 'orderID' AS "ORDERID",
            "tranxData"->> 'dateCreated' AS "PODATE",
            "tranxData" ->> 'customerID' AS "CUSTOMERID",
            "tranxData"->> 'orderAmount' AS "AMOUNT",
            "tranxData"->> 'orderType' AS "ORDERTYPE",
            "tranxData"->> 'sla' AS "sla",
            "tranxData"->> 'activities' AS "activities",
            "tranxData"->> 'status' AS "STATUS"
            from  orders WHERE  "tranxData" ->> 'status' = '019' AND 
            "tranxData" ->> 'customerID' = '${customerID}'`
        countCompletedOrders = `SELECT count(*) FROM orders WHERE "tranxData" ->> 'status' = '019' And "tranxData" ->> 'customerID' = '${customerID}'`

    } else {
        completedOrderData = `select  "tranxData"->> 'dateCreated' AS "PODATE",
            "tranxData" ->> 'customerID' AS "CUSTOMERID",
            "tranxData"->> 'orderAmount' AS "AMOUNT",
            "tranxData"->> 'sla' AS "sla",
            "tranxData"->> 'activities' AS "activities",
            "tranxData"->> 'orderType' AS "ORDERTYPE",
            "tranxData"->> 'status' AS "STATUS"  from  orders WHERE "tranxData" ->> 'status' = '019'`;
        countCompletedOrders = `SELECT count(*) FROM orders WHERE  "tranxData" ->> 'status' = '019'`;
    }


    if (payloadDashboardData.pageData && payloadDashboardData.pageData.pageSize && payloadDashboardData.pageData.currentPageNo) {
        completedOrderData += ` limit ${payloadDashboardData.pageData.pageSize}
                OFFSET ${ payloadDashboardData.pageData.pageSize * (payloadDashboardData.pageData.currentPageNo - 1)} `;
    }

    return pg.connection().then((conn) => {
        return Promise.all([
            conn.query(completedOrderData, []),
            conn.query(countCompletedOrders, [])
        ])
            .then((data) => {
                completedOrderData = data[0].rows
                totCompletedOrder = data[1].rows[0].count;
                // console.log(data[1].rows, "<<<<getCompletedOrder  data[1].rows[0].count");
                for (let i in completedOrderData) {

                    let PO_DATE = 0;

                    let completedOrderDataActivities = JSON.parse(completedOrderData[i].activities);
                    for (let j in completedOrderDataActivities) {
                        if (completedOrderDataActivities[j].toStage === "002") {
                            PO_DATE = completedOrderDataActivities[j].date
                        }
                    }
                    // console.log(PO_DATE, " ???? PO_DATE")
                    let response = {
                        "orderID": completedOrderData[i].ORDERID,
                        "customerID": completedOrderData[i].CUSTOMERID,
                        "status": getStatusLabel(completedOrderData[i].STATUS),
                        "amount": completedOrderData[i].AMOUNT,
                        "dateCreated": PO_DATE,
                        "orderType": completedOrderData[i].ORDERTYPE,
                        "sla": completedOrderData[i].sla,
                        "actions": [
                            {
                                "actionType": "componentAction",
                                "iconName": "fa fa-eye",
                                "label": "View",
                                "URI": [
                                    "/strata/viewOrder"
                                ]
                            }
                        ]
                    }
                    completedOrderDataArray.push(response);
                }
                let result = {
                    "dashboardCompletedGridData": {
                        "pageData": {
                            "pageSize": payloadDashboardData.pageData.pageSize,
                            "currentPageNo": payloadDashboardData.pageData.currentPageNo,
                            "totalRecords": totCompletedOrder
                        },
                        completedOrderRows: completedOrderDataArray
                    }
                }


                return result;
            })
    }).catch((error) => {
        console.log(error, " <<<<< Some error occurred while working on completed order data!");
        return [];
    });
}


function getSettlements(payloadDashboardData, customerID) {
    let settlementOrder, countSettlementOrder, settlementOrderArray = [], totSettledOrder;

    if (customerID && customerID != "ALL") {
        settlementOrder = `select  "tranxData"->> 'orderID' AS "ORDERID",
            "tranxData"->> 'dateCreated' AS "PODATE",
            "tranxData" ->> 'customerID' AS "CUSTOMERID",
            "tranxData"->> 'orderAmount' AS "AMOUNT",
            "tranxData"->> 'orderType' AS "ORDERTYPE",
            "tranxData"->> 'activities' AS "activities",
            "tranxData"->> 'sla' AS "sla",
            "tranxData"->> 'status' AS "STATUS"
            from  orders WHERE  "tranxData" ->> 'status'   = '018' AND 
            "tranxData" ->> 'customerID' = '${customerID}'`
        countSettlementOrder = `SELECT count(*) FROM orders WHERE "tranxData" ->> 'status' = '018' And 
        "tranxData" ->> 'customerID' = '${customerID}'`
    } else {
        settlementOrder = `select  "tranxData"->> 'dateCreated' AS "PODATE",
            "tranxData" ->> 'customerID' AS "CUSTOMERID",
            "tranxData"->> 'orderAmount' AS "AMOUNT",
            "tranxData"->> 'sla' AS "sla",
            "tranxData"->> 'receivedDate' AS "EXPECTEDDATE",
            "tranxData"->> 'orderType' AS "ORDERTYPE",
            "tranxData"->> 'status' AS "STATUS"  from  orders WHERE "tranxData" ->> 'status' = '018'`;
        countSettlementOrder = `SELECT count(*) FROM orders WHERE  "tranxData" ->> 'status' = '018'`;
    }


    if (payloadDashboardData.pageData && payloadDashboardData.pageData.pageSize && payloadDashboardData.pageData.currentPageNo) {
        settlementOrder += ` limit ${payloadDashboardData.pageData.pageSize}
                OFFSET ${ payloadDashboardData.pageData.pageSize * (payloadDashboardData.pageData.currentPageNo - 1)} `;
    }
    // console.log(settlementOrder, "<<<< settlementOrder settlementOrder");
    return pg.connection().then((conn) => {
        return Promise.all([
            conn.query(settlementOrder, []),
            conn.query(countSettlementOrder, [])
        ])
            .then((data) => {
                settlementOrder = data[0].rows
                totSettledOrder = data[1].rows[0].count;
                // console.log(data[0].rows, "<<<< getSettlements data[0].rows");
                for (let i in settlementOrder) {
                    let PO_DATE = 0;
                    let settlementOrderActivities;
                    settlementOrderActivities = settlementOrder[i].activities ? JSON.parse(settlementOrder[i].activities) : [];
                    for (let j in settlementOrderActivities) {
                        if (settlementOrderActivities[j].toStage === "002") {
                            PO_DATE = settlementOrderActivities[j].date
                        }
                    }
                    // console.log(PO_DATE, " ???? PO_DATE")
                    let response = {
                        "orderID": settlementOrder[i].ORDERID,
                        "customerID": settlementOrder[i].CUSTOMERID,
                        "status": getStatusLabel(settlementOrder[i].STATUS),
                        "amount": settlementOrder[i].AMOUNT,
                        "dateCreated": PO_DATE,
                        "orderType": settlementOrder[i].ORDERTYPE,
                        "sla": settlementOrder[i].sla,
                        "actions": [
                            {
                                "actionType": "componentAction",
                                "iconName": "fa fa-eye",
                                "label": "View",
                                "URI": [
                                    "/strata/viewOrder"
                                ]
                            }
                        ]
                    }
                    settlementOrderArray.push(response);
                }
                let result = {
                    dashboardSettlementGridData: {
                        "pageData": {
                            "pageSize": payloadDashboardData.pageData.pageSize,
                            "currentPageNo": payloadDashboardData.pageData.currentPageNo,
                            "totalRecords": totSettledOrder
                        },
                        settlementsRows: settlementOrderArray

                    }
                }
                return result;
            })
    }).catch((error) => {
        console.log(error, " <<<<< Some error occurred while working on settlement order data!");
        return [];
    });
}

function getCustomerWiseSettlement(payloadDashboardData, customerID) {
    let settlementOrder, countSettlementOrder, settlementOrderArray = [], totSettledOrder, paidAmount;
    if (customerID && customerID != "ALL") {
        settlementOrder = `select 
        "tranxData"->> 'customerID' AS "CUSTOMERID",
        "tranxData"->> 'paidAmount' AS "PAIDAMOUNT",
        "tranxData"->> 'toPayAmount' AS "amount" ,
        "tranxData"->> 'creditNoteAmount' AS "creditNoteAmount" ,
        "tranxData"->> 'totalDiscount' AS "totalDiscount" 
        from  accountings where 
        accountings."tranxData" ->> 'customerID'= '${customerID}'`;

        countSettlementOrder = `select 
        COUNT(1) from  accountings where 
        accountings."tranxData" ->> 'customerID'= '${customerID}'`
    }
    else {
        settlementOrder = `select 
        "tranxData"->> 'customerID' AS "CUSTOMERID",
        "tranxData"->> 'paidAmount' AS "PAIDAMOUNT",
        "tranxData"->> 'toPayAmount' AS "amount" ,
        "tranxData"->> 'creditNoteAmount' AS "creditNoteAmount" ,
        "tranxData"->> 'totalDiscount' AS "totalDiscount" 
        from  accountings`;

        countSettlementOrder = `select 
        COUNT(1) from  accountings`
    }
    if (payloadDashboardData.pageData && payloadDashboardData.pageData.pageSize && payloadDashboardData.pageData.currentPageNo) {
        settlementOrder += ` limit ${payloadDashboardData.pageData.pageSize}
                OFFSET ${ payloadDashboardData.pageData.pageSize * (payloadDashboardData.pageData.currentPageNo - 1)} `;
    }

    return pg.connection().then((conn) => {
        return Promise.all([
            conn.query(settlementOrder, []),
            conn.query(countSettlementOrder, [])
        ])
            .then((data) => {
                settlementOrder = data[0].rows
                totSettledOrder = data[1].rows[0].count;
                //console.log(settlementOrder, "getSupplierWiseSettlement <<<< settlementOrder");

                for (let i in settlementOrder) {
                    let response = {
                        "customerID": settlementOrder[i].CUSTOMERID,
                        "toPay": settlementOrder[i].amount - settlementOrder[i].creditNoteAmount - settlementOrder[i].totalDiscount,
                        "paidAmount": settlementOrder[i].PAIDAMOUNT,

                    }
                    // console.log(response, "response")
                    settlementOrderArray.push(response);
                }

                let result = {
                    dashboardCustomerSettlement: {
                        "pageData": {
                            "pageSize": payloadDashboardData.pageData.pageSize,
                            "currentPageNo": payloadDashboardData.pageData.currentPageNo,
                            "totalRecords": totSettledOrder
                        },
                        customerWiseSettlement: settlementOrderArray
                    }
                }
                return result;
            })
    }).catch((error) => {
        console.log(error, " <<<<< Some error occurred while working on supplierWise settlement order data!");
        return [];
    });
}

async function supplierDashboardData(payload, UUIDKey, route, callback, JWToken) {
    try {
        console.log(payload.dashboardPendingGridData.customerID, "payload.dashboardPendingGridData.customerID")
        console.log("\n\n<<<<<<<<<<<<<<-----------------------DASHBOARD STARTED ----------------------->>>>>>>>>")

        let tilesData = await getTilesData(payload.dashboardPendingGridData.customerID);
        let pendingOrderRows = await getPendingOrder(payload.dashboardPendingGridData, payload.dashboardPendingGridData.customerID);
        let completedOrderRows = await getCompletedOrder(payload.dashboardCompletedGridData, payload.dashboardCompletedGridData.customerID);
        let settlementsRows = await getSettlements(payload.dashboardSettlementGridData, payload.dashboardSettlementGridData.customerID);
        let customerWiseSettlement = await getCustomerWiseSettlement(payload.dashboardCustomerSettlement, payload.dashboardCustomerSettlement.customerID);
        let graphData = await getGraphData(payload.dashboardPendingGridData.customerID);

        //console.log(pendingOrderRows, "pendingOrderRows\n\n");
        // console.log(completedOrderRows, "completedOrderRows\n\n");
        // console.log(settlementsRows, "settlementsRows\n\n");
        // console.log(JSON.stringify(customerWiseSettlement), "customerWiseSettlement\n\n");
        console.log(graphData, "graphData\n\n");

        let supplierDashboardData = {
            "supplierDashboardData": {
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
                            payload.dashboardPendingGridData.customerID,
                        ],
                        "chartData": {
                            "firstBar": [
                                
                                graphData.purchaseOrder,
                                graphData.orderReceived,
                                graphData.componentManufacturing,
                                graphData.dispatched,
                                graphData.received,
                                graphData.inspected,
                                graphData.accepted,
                                graphData.rejected,
                                graphData.reviewed,
                                graphData.concession,
                                graphData.scrapped,
                                graphData.paymentOrder,
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
                            "Order Received",
                            "PO",
                            "Manufacturing",
                            "Dispatched",
                            "Received",
                            "Inspected",
                            "Accepted",
                            "Rejected",
                            "Reviewed",
                            "Scrapped",
                            "Concession",
                            "Payment Order",
                            "Paid"
                        ]
                    },
                    "dashboardTiles": tilesData.dashboardTiles,
                    "dashboardPendingGridData": pendingOrderRows.dashboardPendingGridData,
                    "dashboardCompletedGridData": completedOrderRows.dashboardCompletedGridData,
                    "dashboardSettlementGridData": settlementsRows.dashboardSettlementGridData,
                    "dashboardCustomerSettlement": customerWiseSettlement.dashboardCustomerSettlement

                }
            }

        }
        return callback(supplierDashboardData);
    }
    catch (err) {
        return callback(err);
    }
}

module.exports = { supplierDashboardData };
