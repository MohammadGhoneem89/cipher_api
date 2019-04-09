'use strict';
const connector = require('../../../core/api/client');
const _ = require('lodash');


async function getTilesData() {
    try {
        const pg = await connector.createClient('pg',
            'postgresql://Admin:avanza123@23.97.138.116:5432/emiratespoc');
        console.log(pg, "||||| pg")
        let queryPendingOrder = `select COUNT(1) FROM  orders WHERE  1=1 And "tranxData" ->> 'status' NOT IN ('PAID','RECEIVED2','INVOICED');`;
        let queryResult = await pg.query(queryPendingOrder);
        let countPendingOrders = queryResult.rows[0].count;
        console.log(countPendingOrders, "||||| PendingOrders")


        let queryCompletedOrders = `select COUNT(1) from  orders WHERE  1=1 And "tranxData" ->> 'status' = 'PAID' ;`;
        let queryResult2 = await pg.query(queryCompletedOrders);
        let countCompletedOrders = queryResult2.rows[0].count;

        console.log(countCompletedOrders, "|||||| CompletedOrders");


        let payable = `select "tranxData" ->> 'amount' AS "amount" from accountings;`;
        let queryResult3 = await pg.query(payable);
        //  let payableOrders = queryResult3.rows[0].count;
        let payableOrders = queryResult3.rows[0].amount
        console.log(payableOrders, "|||||| payable");



        let totalPaid = `select "tranxData" ->> 'paidAmount' AS "paidAmount" from accountings`;
        let queryResult4 = await pg.query(totalPaid);
        // let totalPaidOrders = queryResult4.rows[0].count;
        let totalPaidOrders = queryResult4.rows[0].paidAmount;
        console.log(totalPaidOrders, "|||||| totalPaid");

        return [countPendingOrders, countCompletedOrders, payableOrders, totalPaidOrders]
    }
    catch (err) {
        console.log(err)
    }

}


async function getPendingOrder(payloadDashboardData) {
    try {

        console.log(payloadDashboardData,"----->>>>PAYLOAD.PENDINGDASHBOARD");
        const pg = await connector.createClient('pg',
        'postgresql://Admin:avanza123@23.97.138.116:5432/emiratespoc');

        let getPendingOrder = `select  "tranxData"  from  orders WHERE 
        "tranxData" ->> 'status' NOT IN ('PAID','RECEIVED2','INVOICED')`;
        
        // if (payloadDashboardData.pageData) { 
        //     getPendingOrder += ` limit ${payloadDashboardData.pageData.pageSize}
        //  OFFSET ${payloadDashboardData.pageData.pageSize * 
        //     (payloadDashboardData.pageData.currentPageNo - 1)}`; 
        // }
        let queryResult = await pg.query(getPendingOrder);
        console.log(queryResult);

        let supplierIDtest = `select * from
        orders inner join suppliers on  
        orders."tranxData" ->>'supplierID'=suppliers."tranxData" ->>'supplierID'
         WHERE   orders."tranxData" ->> 'status' NOT IN ('PAID','RECEIVED2','INVOICED')`;
 

        // if (payloadDashboardData.pageData) { 
        //     supplierIDtest += ` limit ${payloadDashboardData.pageData.pageSize}
        //  OFFSET ${payloadDashboardData.pageData.pageSize * 
        //     (payloadDashboardData.pageData.currentPageNo - 1)}`; 
        // }

        let queryResult2 = await pg.query(supplierIDtest);
        console.log(queryResult2);
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
         console.log(details, "#########################");
         
        let PendingOrders = queryResult.rows;

        let pendingOrdersArray = [];
        if (PendingOrders) {
            let response = {}
            //
            for (let i = 0; i < PendingOrders.length; i++) {

                response = {
                    "orderID": PendingOrders[i].tranxData.orderID,
                    "customerID": PendingOrders[i].tranxData.customerID,
                    "status": PendingOrders[i].tranxData.status,
                    "amount": PendingOrders[i].tranxData.orderAmount,
                    "dateCreated": PendingOrders[i].tranxData.dateCreated * 1000,

                    "supplierName" :details[i] ? details[i].supplierName.name : "",
                    
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
            console.log(pendingOrdersArray, "<<<<PENDING ORDER ARRAY >>>");
            return pendingOrdersArray;
        }

        else {
            console.log(PendingOrders, " =====PendingOrders is empty")
            return pendingOrdersArray
        };
    }
    catch (err) {
        console.log(err)
    }
}

async function getCompletedOrder() {
    try {
        const pg = await connector.createClient('pg',
            'postgresql://Admin:avanza123@23.97.138.116:5432/emiratespoc');

        let getCompletedOrder = `select  "tranxData"  from  orders WHERE "tranxData" ->> 'status' = 'PAID'`;
        let queryResult = await pg.query(getCompletedOrder);


        let supplierIDtest = `select * from
        orders inner join suppliers on  orders."tranxData" ->>'supplierID'=suppliers."tranxData" ->>'supplierID' WHERE orders."tranxData" ->> 'status' = 'PAID'`;

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

        let CompletedOrder = queryResult.rows;
        let completeOrderArray = [];
        if (CompletedOrder.length !== 0) {

            for (let i = 0; i < CompletedOrder.length; i++) {
                let response = {
                    "orderID": CompletedOrder[i].tranxData.orderID,
                    "customerID": CompletedOrder[i].tranxData.customerID,
                    "status": CompletedOrder[i].tranxData.status,
                    "amount": CompletedOrder[i].tranxData.orderAmount,
                    "dateCreated": CompletedOrder[i].tranxData.dateCreated * 1000,
                    "supplierName" :details[i] ? details[i].supplierName.name : "",
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
            console.log(completeOrderArray, ">>>>>>>>> CompletedOrder ");
            return completeOrderArray;
        }
        else {
            console.log(completeOrderArray, " =======CompletedOrder is empty");
            return completeOrderArray;
        }
    }
    catch (err) {
        console.log(err)
    }
}


async function getSettlements() {
    try {
        const pg = await connector.createClient('pg',
            'postgresql://Admin:avanza123@23.97.138.116:5432/emiratespoc');


        let getSettlements = `select "tranxData" from  orders where "tranxData" ->> 'status' = 'INVOICED';`
        let queryResult = await pg.query(getSettlements);
        let Settlements = queryResult.rows;

        let supplierIDtest = `select * from
        orders inner join suppliers on  orders."tranxData" ->>'supplierID'=suppliers."tranxData" ->>'supplierID' WHERE orders."tranxData" ->> 'status' = 'INVOICED'`;

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
            console.log(details, "DETAILSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS")
            for (let i = 0; i < Settlements.length; i++) {
                let response = {
                    "orderID": Settlements[i].tranxData.orderID,
                    "customerID": Settlements[i].tranxData.customerID,
                    "status": Settlements[i].tranxData.status,
                    "amount": Settlements[i].tranxData.orderAmount,
                    "dateCreated": Settlements[i].tranxData.dateCreated * 1000,
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
                SettlementsArray.push(response);
            }
            console.log(SettlementsArray, ">>>>>>>>> Settlements ");
            return SettlementsArray;
        }
        else {
            console.log(SettlementsArray, "++++++++=settlements  is empty");
            return SettlementsArray;
        }
    }
    catch (err) {
        console.log(err)
    }
}

async function getSupplierWiseSettlement(supplierID) {
    try {
        const pg = await connector.createClient('pg',
            'postgresql://Admin:avanza123@23.97.138.116:5432/emiratespoc');

        let getSupplierWiseSettlement = `select "tranxData" from  accountings where 
        accountings."tranxData" ->> 'supplierID'= '${supplierID}'`;
        let queryResult = await pg.query(getSupplierWiseSettlement);
        console.log(queryResult.rows, " =======queryResult");
        let supplierWiseSettlement = queryResult.rows;

        let supplierIDtest = `select "tranxData" ->>'supplierName' AS "supplierName" from
       suppliers where "tranxData" ->>'supplierID'= '${supplierID}' `;

        let queryResult2 = await pg.query(supplierIDtest);
        // console.log(queryResult2.rows[0].supplierName,"+++++++++++++++++SUPPLIER NAME")

        // let supplierWiseSettlement = queryResult.rows;
        let supplierWiseSettlementArray = [];
        if (supplierWiseSettlement.length !== 0) {

            for (let i = 0; i < supplierWiseSettlement.length; i++) {
                if (queryResult2.rows[0].supplierName) {
                    let response = {

                        "receivable": supplierWiseSettlement[i].tranxData.amount,
                        "totalReceived": supplierWiseSettlement[i].tranxData.paidAmount,
                        "name": queryResult2.rows[0].supplierName
                    }
                    supplierWiseSettlementArray.push(response);
                }

            }
            console.log(supplierWiseSettlement, ">>>>>>>>> supplierWiseSettlement ");
            return supplierWiseSettlementArray
        }
        else {
            console.log(supplierWiseSettlementArray, " =======supplierWiseSettlement is empty");
            // return supplierWiseSettlement;
        }


    }
    catch (err) {
        console.log(err)
    }
}

async function getGridData() {
    try {
        const pg = await connector.createClient('pg',
            'postgresql://Admin:avanza123@23.97.138.116:5432/emiratespoc');

        let getSupplierWiseSettlement = `SELECT count(orders.key),
        orders."tranxData"->>'status' as "status",suppliers."tranxData"->>'supplierName' as "suppliername" FROM orders 
        inner join suppliers on  orders."tranxData" ->>'supplierID'=suppliers."tranxData" ->>'supplierID'
 GROUP BY orders."tranxData"->>'status' ,suppliers."tranxData"->>'supplierName' ;`;

        let queryResult = await pg.query(getSupplierWiseSettlement);
        // console.log(queryResult.rows, " =======queryResult")


        let gridData = queryResult.rows;
        let INVOICED = [];
        let PAID = [];
        let RECEIVED1 = [];
        let RECEIVED2 = [];
        let ACK = [];
        let PO = [];
        for (let i = 0; i < gridData.length; i++) {
            if (gridData[i].status == 'INVOICED') {
                gridData[i].count == undefined ? 0 : INVOICED.push(gridData[i].count)
                // INVOICED[0] == undefined ? 0 : INVOICED.push(INVOICED[0].count);
            }
            else if (gridData[i].status == 'PO') {
                gridData[i].count == undefined ? 0 : PO.push(gridData[i].count)
                // INVOICED[0] == undefined ? 0 : INVOICED.push(INVOICED[0].count);
            }
            else if (gridData[i].status == 'PAID') {
                gridData[i].count == undefined ? 0 : PAID.push(gridData[i].count)

                // PAID[0] == undefined ? 0 : PAID.push(PAID[0].count);
            } else if (gridData[i].status == 'ACK') {
                gridData[i].count == undefined ? 0 : ACK.push(gridData[i].count)
            } else if (gridData[i].status == 'RECEIVED1') {
                gridData[i].count == undefined ? 0 : RECEIVED1.push(gridData[i].count)
            }
            else if (gridData[i].status == 'RECEIVED2') {
                gridData[i].count == undefined ? 0 : RECEIVED2.push(gridData[i].count)
            }
        }

        // console.log(INVOICED, "IAM INVOICED ",
        //     PAID, " IAM PAID ", 
        //     ACK, "IAM ACK  ", RECEIVED1,
        //      "I AM RECEIVED1", RECEIVED2, 
        //      " IAM RECEIVED2")
        return [INVOICED, PO, PAID, ACK, RECEIVED1, RECEIVED2];
    }
    catch (err) {
        console.log(err)
    }
}
// let payload = {
//     dashboardPendingGridData: {
//         pageData: {
//             currentPageNo: 1,
//             pageSize: 10
//         }
//     }
// }

// async function dataM(payload) {
//     let pendingOrderRowsI = await getPendingOrder(payload.dashboardPendingGridData);
//     console.log("CALLLLLLLL", pendingOrderRowsI);
// }
// dataM(payload);


exports.cusDashboardData = async function (payload, UUIDKey, route, callback, JWToken) {
    try {

         let tilesData = await getTilesData();
        let pendingOrderRows = await getPendingOrder(payload.dashboardPendingGridData);
        let completedOrderRows = await getCompletedOrder();
        let settlementsRows = await getSettlements();
        let supplierWiseSettlementRows = await getSupplierWiseSettlement("8314891");
        let gridDataArray = await getGridData();
        //   console.log("++++++++++++++++++++",gridDataArray[1],gridDataArray[3],gridDataArray[4],
        //   gridDataArray[5],gridDataArray[0],gridDataArray[2])

        // function data(payload) {


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
                            "APPAREL FZCO",

                        ],
                        "chartData": {
                            "firstBar": [
                                Number(gridDataArray[1]),
                                Number(gridDataArray[3]),
                                Number(gridDataArray[4]),
                                Number(gridDataArray[5]),
                                Number(gridDataArray[0]),
                                Number(gridDataArray[2]),
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
                            "Purchase Order",
                            "Acknowledge",
                            "Received By Supplier",
                            "Received By Emirates",
                            "Invoiced",
                            "Paid"
                        ]
                    },
                    "dashboardTiles": [
                        {
                            "id": 1,
                            "title": "Pending Orders",
                            "percentage": 100,
                            "value": tilesData != undefined ? tilesData[0] : 0,
                            "actionURI": "",
                            "overDue": "5",
                            "fontClass": "green-steel"
                        },
                        {
                            "id": 1,
                            "title": "Completed Orders",
                            "percentage": 100,
                            "value": tilesData != undefined ? tilesData[1] : 0,
                            "actionURI": "",
                            "overDue": "5",
                            "fontClass": "green-steel"
                        },
                        {
                            "id": 1,
                            "title": "Payable",
                            "percentage": "100",
                            "value": tilesData != undefined ? tilesData[2] : 0,
                            "actionURI": "",
                            "overDue": "0",
                            "fontClass": "green-meadow"
                        },
                        {
                            "id": 1,
                            "title": "Total Paid",
                            "percentage": "100",
                            "value": tilesData != undefined ? tilesData[3] : 0,
                            "actionURI": "",
                            "overDue": "0",
                            "fontClass": "green-jungle"
                        }

                    ],
                    "dashboardPendingGridData": {
                        "pageData": {
                            "pageSize": payload.dashboardPendingGridData.pageData.pageSize,
                            "currentPageNo": payload.dashboardPendingGridData.pageData.currentPageNo,
                            "totalRecords": pendingOrderRows !== undefined ? pendingOrderRows.length : []
                        },
                        pendingOrderRows
                    },
                    "dashboardCompletedGridData": {
                        "pageData": {
                            "pageSize": payload.dashboardCompletedGridData.pageData.pageSize,
                            "currentPageNo": payload.dashboardCompletedGridData.pageData.currentPageNo,
                            "totalRecords": completedOrderRows !== undefined ? completedOrderRows.length : []
                        },
                        completedOrderRows
                    },
                    "dashboardSettlementGridData": {
                        "pageData": {
                            "pageSize": payload.dashboardSettlementGridData.pageData.pageSize,
                            "currentPageNo": payload.dashboardSettlementGridData.pageData.currentPageNo,
                            "totalRecords": settlementsRows !== undefined ? settlementsRows.length : []
                        },
                        settlementsRows

                    },
                    "dashboardSupplierSettlement": {
                        "pageData": {
                            "pageSize": payload.dashboardSupplierSettlement.pageData.pageSize,
                            "currentPageNo": payload.dashboardSupplierSettlement.pageData.currentPageNo,
                            "totalRecords": supplierWiseSettlementRows !== undefined ? supplierWiseSettlementRows.length : []
                        },
                        supplierWiseSettlementRows
                    }
                }
            }
        }

        // console.log("--------------RESPONSE \n", JSON.stringify(customerDashboardData))
        return callback(customerDashboardData);
    }
    catch (err) {
        return callback(err);
    }
    // let payload = {
    //     page: {
    //         currentPageNo: 1,
    //         pageSize: 10
    //     }
    // }
    // data();

}



