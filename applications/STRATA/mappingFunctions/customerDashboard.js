'use strict';
const connector = require('../../../core/api/client');
const _ = require('lodash');


async function getTilesData(supplierID) {
    try {
        let queryPendingOrder = "";
        let queryCompletedOrders = "";
        // let invoicedOrders = "";
        let payable = "";
        let totalPaid = "";

        const pg = await connector.createClient('pg',
            'postgresql://Admin:avanza123@23.97.138.116:5432/strata?idleTimeoutMillis=3000000');
        console.log(pg, "||||| pg")

        if (!!supplierID && supplierID != "ALL") {
            console.log("<<<<<=======IN PENDING ", supplierID, "=========>>>>>")
            queryPendingOrder = `select COUNT(1) FROM  orders  
        WHERE "tranxData" ->> 'customerID' ='${supplierID}' 
        And "tranxData" ->> 'status' NOT IN ('PAID');`;
        }
        else if (supplierID == "ALL" || !supplierID) {
            queryPendingOrder = `select COUNT(1) FROM  orders   
        WHERE "tranxData" ->> 'status' NOT IN ('PAID');`;
        }

        let queryResult = await pg.query(queryPendingOrder);
        let countPendingOrders = queryResult.rows[0].count;
        console.log(countPendingOrders, "||||| PendingOrders")

        if (!!supplierID && supplierID != "ALL") {
            queryCompletedOrders = `select COUNT(1) from  orders  
        WHERE "tranxData" ->> 'customerID' ='${supplierID}' And 
        "tranxData" ->> 'status' = 'PAID' ;`;
        }
        else if (supplierID == "ALL" || !supplierID) {
            queryCompletedOrders = `select COUNT(1) from  orders  
        WHERE "tranxData" ->> 'status' = 'PAID' ;`;
        }


        let queryResult2 = await pg.query(queryCompletedOrders);
        let countCompletedOrders = queryResult2.rows[0].count;

        console.log(countCompletedOrders, "|||||| CompletedOrders");

        // if (supplierID) {
        //     invoicedOrders = `select COUNT(1) from  orders  
        // WHERE "tranxData" ->> 'supplierID' ='${supplierID}' And 
        // "tranxData" ->> 'status' = 'INVOICED'` ;
        // }
        // else {
        //     invoicedOrders = `select COUNT(1) from  orders  
        // WHERE "tranxData" ->> 'status' = 'INVOICED'` ;
        // }

        // let invQueryResult = await pg.query(invoicedOrders);
        // let countInvoicesOrders = invQueryResult.rows[0].count;
        // console.log(countInvoicesOrders, "|||||| InvoicesOrders");

        if (!!supplierID && supplierID != "ALL") {
            payable = `select "tranxData" ->> 'amount' AS "amount" from accountings
        WHERE "tranxData" ->> 'customerID' ='${supplierID}' ;`;
        }
        else if (supplierID == "ALL" || !supplierID) {
            payable = `select "tranxData" ->> 'amount' AS "amount" from accountings;`
        }

        let queryResult3 = await pg.query(payable);
        // console.log(queryResult3.rows, "|||||| payable");
        let payableOrders = queryResult3.rows[0] !== undefined ? queryResult3.rows[0].amount : 0;
        console.log(payableOrders, "|||||| payable");


        if (!!supplierID && supplierID != "ALL") {
            totalPaid = `select "tranxData" ->> 'paidAmount' AS "paidAmount" from accountings
        WHERE "tranxData" ->> 'customerID' ='${supplierID}'`;

        } else if (supplierID == "ALL" || !supplierID) {
            totalPaid = `select "tranxData" ->> 'paidAmount' AS "paidAmount" from accountings;`
        }
        let queryResult4 = await pg.query(totalPaid);
        // let totalPaidOrders = queryResult4.rows[0].count;
        let totalPaidOrders = queryResult4.rows[0] !== undefined ? queryResult4.rows[0].paidAmount : 0;
        console.log(totalPaidOrders, "|||||| totalPaid");

        return [countPendingOrders, countCompletedOrders, payableOrders, totalPaidOrders]
    }
    catch (err) {
        console.log(err)
        return [0, 0, 0, 0, 0]
    }

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
            console.log(pendingOrdersArray, "<<<<PENDING ORDER ARRAY >>>");
            return [pendingOrdersArray, totRecordCount]
        }

        else {
            console.log(PendingOrders, " =====PendingOrders is empty")
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
            console.log(completeOrderArray, ">>>>>>>>> CompletedOrder ");
            return [completeOrderArray, totRecordCount];
        }
        else {
            console.log(" =======CompletedOrder is empty");
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
            console.log(SettlementsArray, "++++++++=settlements ");
            return [SettlementsArray, totRecordCount]
        }
        else {
            console.log("++++++++=settlements  is empty");
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
            console.log(">>>>>>>>> supplierWiseSettlement ");
            return supplierWiseSettlementArray
        }
        else {
            console.log(supplierWiseSettlementArray, " =======supplierWiseSettlement is empty");
            return [];
        }


    }
    catch (err) {
        console.log(err)
    }
}

// async function getGridData(supplierID) {
//     try {
//         let getGridData = "";
//         const pg = await connector.createClient('pg',
//             'postgresql://Admin:avanza123@23.97.138.116:5432/strata?idleTimeoutMillis=3000000');

//         if (!!supplierID && supplierID != "ALL") {
//             getGridData = `SELECT count(orders.key),
//                 orders."tranxData" ->> 'status' as "status",
//                     FROM orders
//             WHERE
//             orders."tranxData" ->> 'customerID'= '${supplierID}'
//             GROUP BY orders."tranxData" ->> 'status', 'customerID';`;
//         }

//         else if (supplierID == "ALL" || !supplierID) {
//             getGridData = `SELECT count(orders.key),
//             orders."tranxData" ->> 'status' as "status",
//                 FROM orders
//         WHERE
//         orders."tranxData" ->> 'customerID'= '${supplierID}'
//         GROUP BY orders."tranxData" ->> 'status', 'customerID';`
//         }
//         let queryResult = await pg.query(getGridData);
//         console.log(queryResult.rows, " =======getGridData")


//         let gridData = queryResult.rows;
//         let INVOICED = [];
//         let PAID = [];
//         let PROD = [];
//         let QC = [];
//         let SHIPPED = [];
//         let SUBORDER = [];
//         let ACK_SUBORDER = [];
//         let RECEIVED_BY_EMIRATES = [];
//         let RECEIVED_BY_SUPPLIER = [];
//         let ACK = [];
//         let PO = [];
//         for (let i = 0; i < gridData.length; i++) {
//             if (gridData[i].status == 'INVOICED') {
//                 console.log(gridData[i].count, "---------------------INVOICEDDDDDDDDDD")
//                 gridData[i].count == undefined ? 0 : (INVOICED.push(gridData[i].count) && RECEIVED_BY_EMIRATES.push(gridData[i].count))
//             }
//             else if (gridData[i].status == 'PO') {
//                 gridData[i].count == undefined ? 0 : PO.push(gridData[i].count)
//             }
//             else if (gridData[i].status == 'PROD') {
//                 gridData[i].count == undefined ? 0 : PROD.push(gridData[i].count)

//             }
//             else if (gridData[i].status == 'SHIPPED') {
//                 gridData[i].count == undefined ? 0 : SHIPPED.push(gridData[i].count)

//             }
//             else if (gridData[i].status == 'QC') {
//                 gridData[i].count == undefined ? 0 : QC.push(gridData[i].count)

//             }
//             else if (gridData[i].status == 'ACK-SUBORDER') {
//                 gridData[i].count == undefined ? 0 : ACK_SUBORDER.push(gridData[i].count)

//             }
//             else if (gridData[i].status == 'SUBORDER') {
//                 gridData[i].count == undefined ? 0 : SUBORDER.push(gridData[i].count)

//             }
//             else if (gridData[i].status == 'PAID') {
//                 gridData[i].count == undefined ? 0 : PAID.push(gridData[i].count)

//                 // PAID[0] == undefined ? 0 : PAID.push(PAID[0].count);
//             } else if (gridData[i].status == 'ACK') {
//                 gridData[i].count == undefined ? 0 : ACK.push(gridData[i].count)
//             } else if (gridData[i].status == 'RECEIVED') {
//                 gridData[i].count == undefined ? 0 : RECEIVED_BY_SUPPLIER.push(gridData[i].count)
//             }
//             // else if (gridData[i].status == 'RECEIVED1') {
//             //     gridData[i].count == undefined ? 0 : RECEIVED_BY_EMIRATES.push(gridData[i].count)
//             // }
//         }

//         // console.log(INVOICED, "IAM INVOICED ",
//         //     PAID, " IAM PAID ", 
//         //     ACK, "IAM ACK  ", RECEIVED1,
//         //      "I AM RECEIVED1", RECEIVED2, 
//         //      " IAM RECEIVED2")
//         // return [PO,PROD,SHIPPED,QC,ACK_SUBORDER,SUBORDER, PAID, ACK, RECEIVED1, RECEIVED2];
//         return [PO, ACK, SUBORDER, ACK_SUBORDER, PROD, QC, SHIPPED, RECEIVED_BY_SUPPLIER,
//             INVOICED, PAID];
//     }
//     catch (err) {
//         console.log(err)
//     }
// }


// async function dataM() {
//     let settlementsRows = await getSettlements(payload.dashboardPendingGridData);
//     console.log("CALLLLLLLL", settlementsRows);
// }
// dataM();


exports.cusDashboardData = async function (payload, UUIDKey, route, callback, JWToken) {
    try {
        // let supplierID = ""
        // if (JWToken.orgCode == "8314891") {
        //     supplierID = JWToken.supplierID;

        // }
        console.log(payload.dashboardPendingGridData.supplierID, "---------SUPPLIER ID ++++++++++++++++++++++")
        console.log("<<<<<<<<<<<<<<-----------------------INTERVAL STARTED ----------------------->>>>>>>>>")
        let tilesData = await getTilesData(payload.dashboardPendingGridData.supplierID);
        let pendingOrderRows = await getPendingOrder(payload.dashboardPendingGridData, payload.dashboardPendingGridData.supplierID);
        let completedOrderRows = await getCompletedOrder(payload.dashboardCompletedGridData, payload.dashboardCompletedGridData.supplierID);
        let settlementsRows = await getSettlements(payload.dashboardSettlementGridData, payload.dashboardSettlementGridData.supplierID);
        let supplierWiseSettlementRows = await getSupplierWiseSettlement(payload.dashboardSupplierSettlement, payload.dashboardSupplierSettlement.supplierID);
        //  let gridDataArray = await getGridData(payload.dashboardPendingGridData.supplierID);

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
                            "firstBar":
                                [
                                    0,
                                    6,
                                    7, 10, 30, 13, 5, 9, 10, 40
                                ],
                            // [
                            //     gridDataArray[0] != undefined ? (Number(gridDataArray[0])) : 0,
                            //     gridDataArray[1] != undefined ? (Number(gridDataArray[1])) : 0,
                            //     gridDataArray[2] != undefined ? (Number(gridDataArray[2])) : 0,
                            //     gridDataArray[3] != undefined ? (Number(gridDataArray[3])) : 0,
                            //     gridDataArray[4] != undefined ? (Number(gridDataArray[4])) : 0,
                            //     gridDataArray[5] != undefined ? (Number(gridDataArray[5])) : 0,

                            //     gridDataArray[6] != undefined ? (Number(gridDataArray[6])) : 0,
                            //     gridDataArray[7] != undefined ? (Number(gridDataArray[7])) : 0,
                            //     // gridDataArray[8] != undefined ? (Number(gridDataArray[8])) : 0,
                            //     gridDataArray[9] != undefined ? (Number(gridDataArray[9])) : 0,
                            //     gridDataArray[10] != undefined ? (Number(gridDataArray[10])) : 0,
                            // ],
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



