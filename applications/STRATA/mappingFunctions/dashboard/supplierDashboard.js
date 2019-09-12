'use strict';
const connector = require('../../../../core/api/client');
const _ = require('lodash');


async function getTilesData(JWToken) {
    try {

        let supplierID = JWToken.orgCode;
        console.log(JWToken.orgCode, "!!!!!-------TILESSSSSSS---------!!!!!!1")
        const pg = await connector.createClient('pg',
            'postgresql://Admin:avanza123@23.97.138.116:5432/emiratespoc');

        let queryPendingOrder = `select COUNT(1) FROM  orders  
        WHERE "tranxData" ->> 'supplierID' ='${supplierID}' 
        And "tranxData" ->> 'status' NOT IN ('PAID');`;

        // if (JWToken.orgCode) {
        //     let supplierID = JWToken.orgCode;
        //     queryPendingOrder += `And "tranxData" ->> 'supplierID' ='${supplierID}'`;
        // }

        let queryResult = await pg.query(queryPendingOrder);
        let countPendingOrders = queryResult.rows[0].count;
        // console.log(countPendingOrders, "||||| PendingOrders")


        let queryCompletedOrders = `select COUNT(1) from  orders  
        WHERE "tranxData" ->> 'supplierID' ='${supplierID}' And 
        "tranxData" ->> 'status' = 'PAID' ;`;

        // if (JWToken.orgCode) {
        //     let supplierID = JWToken.orgCode;
        //     queryCompletedOrders += ` AND "tranxData" ->> 'supplierID' ='${supplierID}'`;
        // }
        let queryResult2 = await pg.query(queryCompletedOrders);

        let countCompletedOrders = queryResult2.rows[0].count;

        // console.log(countCompletedOrders, "|||||| CompletedOrders");


        let payable = `select "tranxData" ->> 'amount' AS "amount" from accountings
        WHERE "tranxData" ->> 'supplierID' ='${supplierID}' ;`;

        // if (JWToken.orgCode) {
        //     let supplierID = JWToken.orgCode;
        //     payable += ` AND "tranxData" ->> 'supplierID' ='${supplierID}'`;
        // }
        let queryResult3 = await pg.query(payable);
        let payableOrders = queryResult3.rows[0] !== undefined ? queryResult3.rows[0].amount : 0;

        let totalPaid = `select "tranxData" ->> 'paidAmount' AS "paidAmount" from accountings
        WHERE "tranxData" ->> 'supplierID' ='${supplierID}'`;

        // if (JWToken.orgCode) {
        //     let supplierID = JWToken.orgCode;
        //     totalPaid += ` AND "tranxData" ->> 'supplierID' ='${supplierID}'`;
        // }
        let queryResult4 = await pg.query(totalPaid);
        // let totalPaidOrders = queryResult4.rows[0].count;
        let totalPaidOrders = queryResult4.rows[0] !== undefined ? queryResult4.rows[0].paidAmount : 0;
        // console.log(totalPaidOrders, "|||||| totalPaid");

        return [countPendingOrders, countCompletedOrders, payableOrders, totalPaidOrders]
    }
    catch (err) {
        console.log(err)
    }

}


async function getPendingOrder(payloadDashboardData, JWToken) {
    try {
        let supplierID = JWToken.orgCode;
        // console.log("++++++++++++++++++++PO+++++++++++++++++++++++++++++")
        const pg = await connector.createClient('pg',
            'postgresql://Admin:avanza123@23.97.138.116:5432/emiratespoc');

        let getPendingOrder = `select  "tranxData"  from  orders WHERE 
        "tranxData" ->> 'status' NOT IN ('PAID','INVOICED','RECEIVED2')
        AND "tranxData" ->> 'supplierID' ='${supplierID}'`;

        // if (JWToken.orgCode) {
        //     let supplierID = JWToken.orgCode;
        //     getPendingOrder += ` AND "tranxData" ->> 'supplierID' ='${supplierID}'`;
        // }

        if (payloadDashboardData.pageData) {
            getPendingOrder += ` limit ${payloadDashboardData.pageData.pageSize}
         OFFSET ${payloadDashboardData.pageData.pageSize *
                (payloadDashboardData.pageData.currentPageNo - 1)}`;
        }
        let queryResult = await pg.query(getPendingOrder);


        let queryCnt = `select count(*) FROM orders WHERE 
        "tranxData" ->> 'status' NOT IN ('PAID','INVOICED','RECEIVED2')
        And "tranxData" ->> 'supplierID' ='${supplierID}'`;


        let totRecords = await pg.query(queryCnt);
        // console.log(totRecords.rows[0].count, "---->>>>>>>>>>>>>>>>>>>>>ROWSCOUNT")
        let totRecordCount = totRecords.rows[0].count;




        // console.log(queryResult.rows.length, "====================================");
        let supplierIDtest = `select * from
        orders inner join suppliers on  
        orders."tranxData" ->>'supplierID'=suppliers."tranxData" ->>'supplierID'
         WHERE   orders."tranxData" ->> 'status' NOT IN ('PAID','INVOICED','RECEIVED2')
         AND suppliers."tranxData" ->> 'supplierID' ='${supplierID}' `;

        // if (JWToken.orgCode) {
        //     let supplierID = JWToken.orgCode;
        //     supplierIDtest += ` AND "tranxData" ->> 'supplierID' ='${supplierID}'`;
        // }

        if (payloadDashboardData.pageData) {
            supplierIDtest += ` limit ${payloadDashboardData.pageData.pageSize}
         OFFSET ${payloadDashboardData.pageData.pageSize *
                (payloadDashboardData.pageData.currentPageNo - 1)}`;
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
            //
            for (let i = 0; i < PendingOrders.length; i++) {

                response = {
                    "orderID": PendingOrders[i].tranxData.orderID,
                    "sla": PendingOrders[i].tranxData.sla ? PendingOrders[i].tranxData.sla : [],
                    "status": PendingOrders[i].tranxData.status,
                    "amount": PendingOrders[i].tranxData.orderAmount,
                    "dateCreated": PendingOrders[i].tranxData.dateCreated * 1000,

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
            // console.log(pendingOrdersArray, "<<<<PENDING ORDER ARRAY >>>");
            return [pendingOrdersArray, totRecordCount]
        }

        else {
            console.log(PendingOrders, " =====PendingOrders is empty")
            return [pendingOrdersArray, totRecordCount]
        };
    }
    catch (err) {
        console.log(err)
    }
}

async function getCompletedOrder(payloadDashboardData, JWToken) {
    try {
        let supplierID = JWToken.orgCode;
        const pg = await connector.createClient('pg',
            'postgresql://Admin:avanza123@23.97.138.116:5432/emiratespoc');

        let getCompletedOrder = `select  "tranxData"  from  orders 
        WHERE "tranxData" ->> 'status' = 'PAID'
		AND "tranxData" ->> 'supplierID' ='${supplierID}'`;
        // let queryResult = await pg.query(getCompletedOrder);


        // if (JWToken.orgCode) {
        //     let supplierID = JWToken.orgCode;
        //     getCompletedOrder += ` AND "tranxData" ->> 'supplierID' ='${supplierID}'`;
        // }


        if (payloadDashboardData.pageData) {
            getCompletedOrder += ` limit ${payloadDashboardData.pageData.pageSize}
         OFFSET ${payloadDashboardData.pageData.pageSize *
                (payloadDashboardData.pageData.currentPageNo - 1)}`;
        }
        let queryResult = await pg.query(getCompletedOrder);


        let queryCnt = `SELECT count(*) FROM orders  WHERE "tranxData" ->> 'status' = 'PAID'
        And "tranxData" ->> 'supplierID' ='${supplierID}'`;


        let totRecords = await pg.query(queryCnt);
        // console.log(totRecords.rows[0].count, "---->>>>>>>>>>>>>>>>>>>>>ROWSCOUNT")
        let totRecordCount = totRecords.rows[0].count;


        let supplierIDtest = `select * from
        orders inner join suppliers on 
         orders."tranxData" ->>'supplierID'=suppliers."tranxData" ->>'supplierID' 
         WHERE orders."tranxData" ->> 'status' = 'PAID'
         AND suppliers."tranxData" ->> 'supplierID' ='${supplierID}'`;


        // if (JWToken.orgCode) {
        //     let supplierID = JWToken.orgCode;
        //     supplierIDtest += ` AND "tranxData" ->> 'supplierID' ='${supplierID}'`;
        // }
        if (payloadDashboardData.pageData) {
            supplierIDtest += ` limit ${payloadDashboardData.pageData.pageSize}
         OFFSET ${payloadDashboardData.pageData.pageSize *
                (payloadDashboardData.pageData.currentPageNo - 1)}`;
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
            console.log(completeOrderArray, " =======CompletedOrder is empty");
            return [completeOrderArray, totRecordCount];
        }
    }
    catch (err) {
        console.log(err)
    }
}

// async function getSupplierWiseSettlement(supplierID, JWToken) {
async function getSupplierWiseSettlement(payloadDashboardData,JWToken) {
    try {
        let supplierID = JWToken.orgCode;
        const pg = await connector.createClient('pg',
            'postgresql://Admin:avanza123@23.97.138.116:5432/emiratespoc');

        let getSupplierWiseSettlement = `select "tranxData" from  accountings where 
        accountings."tranxData" ->> 'supplierID'= '${supplierID}'`;

        // if (JWToken.orgCode) {
        //     let supplierID = JWToken.orgCode;
        //     getSupplierWiseSettlement += ` AND "tranxData" ->> 'supplierID' ='${supplierID}'`;
        // }
        if (payloadDashboardData.pageData) {
            getSupplierWiseSettlement += ` limit ${payloadDashboardData.pageData.pageSize}
            OFFSET ${
                payloadDashboardData.pageData.pageSize *
                (payloadDashboardData.pageData.currentPageNo - 1)
                } `;
        }

        let queryResult = await pg.query(getSupplierWiseSettlement);
        // console.log(queryResult.rows, " =======queryResult");
        let supplierWiseSettlement = queryResult.rows;

        let supplierIDtest = `select "tranxData" ->>'supplierName' AS "supplierName" from
       suppliers where "tranxData" ->>'supplierID'= '${supplierID}' `;
       if (payloadDashboardData.pageData) {
        supplierIDtest += ` limit ${payloadDashboardData.pageData.pageSize}
        OFFSET ${
            payloadDashboardData.pageData.pageSize *
            (payloadDashboardData.pageData.currentPageNo - 1)
            } `;
    }


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
            // console.log(supplierWiseSettlement, ">>>>>>>>> supplierWiseSettlement ");
            return supplierWiseSettlementArray
        }
        else {
            console.log(supplierWiseSettlementArray, " =======supplierWiseSettlement is empty");
            return supplierWiseSettlementArray;
        }


    }
    catch (err) {
        console.log(err)
    }
}

async function getGridData(JWToken) {
    try {
         let supplierID = JWToken.orgCode;
        const pg = await connector.createClient('pg',
            'postgresql://Admin:avanza123@23.97.138.116:5432/emiratespoc');

            let getGridData = `SELECT count(orders.key),
            orders."tranxData"->>'status' as "status",
            suppliers."tranxData"->>'supplierName' as "suppliername" FROM orders 
            inner join suppliers  on  
            orders."tranxData" ->>'supplierID'= suppliers."tranxData" ->>'supplierID'
            where suppliers."tranxData" ->>'supplierID'= '${supplierID}'
     GROUP BY orders."tranxData"->>'status' ,suppliers."tranxData"->>'supplierName';`;


        // if (JWToken.orgCode) {
        //     let supplierID = JWToken.orgCode;
        //     getGridData += ` AND "tranxData" ->> 'supplierID' ='${supplierID}'`;
        // }
        let queryResult = await pg.query(getGridData);
         console.log(queryResult.rows, " =======queryResult")
         let gridData = queryResult.rows;
         let INVOICED = [];
         let PAID = [];
         let PROD = [];
         let QC = [];
         let SHIPPED = [];
         let SUBORDER = [];
         let ACK_SUBORDER = [];
         let RECEIVED_BY_EMIRATES = [];
         let RECEIVED_BY_SUPPLIER = [];
         let ACK = [];
         let PO = [];
         for (let i = 0; i < gridData.length; i++) {
             if (gridData[i].status == 'INVOICED') {
                 gridData[i].count == undefined ? 0 : (INVOICED.push(gridData[i].count) && RECEIVED_BY_EMIRATES.push(gridData[i].count))
             }
             else if (gridData[i].status == 'PO') {
                 gridData[i].count == undefined ? 0 : PO.push(gridData[i].count)
             }
             else if (gridData[i].status == 'PROD') {
                 gridData[i].count == undefined ? 0 : PROD.push(gridData[i].count)
                
             }
             else if (gridData[i].status == 'SHIPPED') {
                 gridData[i].count == undefined ? 0 : SHIPPED.push(gridData[i].count)
                
             }
             else if (gridData[i].status == 'QC') {
                 gridData[i].count == undefined ? 0 : QC.push(gridData[i].count)
                
             }
             else if (gridData[i].status == 'ACK-SUBORDER') {
                 gridData[i].count == undefined ? 0 : ACK_SUBORDER.push(gridData[i].count)
                
             }
             else if (gridData[i].status == 'SUBORDER') {
                 gridData[i].count == undefined ? 0 : SUBORDER.push(gridData[i].count)
                
             }
             else if (gridData[i].status == 'PAID') {
                 gridData[i].count == undefined ? 0 : PAID.push(gridData[i].count)
 
                 // PAID[0] == undefined ? 0 : PAID.push(PAID[0].count);
             } else if (gridData[i].status == 'ACK') {
                 gridData[i].count == undefined ? 0 : ACK.push(gridData[i].count)
             } else if (gridData[i].status == 'RECEIVED1') {
                 gridData[i].count == undefined ? 0 : RECEIVED_BY_SUPPLIER.push(gridData[i].count)
             }
             // else if (gridData[i].status == 'RECEIVED1') {
             //     gridData[i].count == undefined ? 0 : RECEIVED_BY_EMIRATES.push(gridData[i].count)
             // }
         }
 
         // console.log(INVOICED, "IAM INVOICED ",
         //     PAID, " IAM PAID ", 
         //     ACK, "IAM ACK  ", RECEIVED1,
         //      "I AM RECEIVED1", RECEIVED2, 
         //      " IAM RECEIVED2")
         // return [PO,PROD,SHIPPED,QC,ACK_SUBORDER,SUBORDER, PAID, ACK, RECEIVED1, RECEIVED2];
         return [PO, ACK, SUBORDER, ACK_SUBORDER, PROD, QC, SHIPPED, RECEIVED_BY_SUPPLIER,
              INVOICED, PAID];
    }
    catch (err) {
        console.log(err);
        return[]
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
// async function dataM() {
//     let settlementsRows = await getSettlements(payload.dashboardPendingGridData);
//     console.log("CALLLLLLLL", settlementsRows);
// }
// dataM();


exports.supDashboardData = async function (payload, UUIDKey, route, callback, JWToken) {
    try {
        console.log(" !!!!------JWTOKEN------->>>>", JWToken.orgCode, " !!!!!------<<<-------JWTOKEN------->>>>")
        console.log("<<<<<<<<<<<<<<-----------------------INTERVAL STARTED ----------------------->>>>>>>>>")
        let tilesData = await getTilesData(JWToken);
        let pendingOrderRows = await getPendingOrder(payload.dashboardPendingGridData, JWToken);
        let completedOrderRows = await getCompletedOrder(payload.dashboardCompletedGridData, JWToken);

        // let supplierWiseSettlementRows = await getSupplierWiseSettlement(supplierID, JWToken);
        let supplierWiseSettlementRows = await getSupplierWiseSettlement(payload.dashboardSupplierSettlement,JWToken);
        let gridDataArray = await getGridData(JWToken);

        let supDashboardData = {
            "supDashboardData": {
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
                                gridDataArray[0] != undefined ? (Number(gridDataArray[0])) : 0,
                                gridDataArray[1] != undefined ? (Number(gridDataArray[1])) : 0,
                                gridDataArray[2] != undefined ? (Number(gridDataArray[2])) : 0,
                                gridDataArray[3] != undefined ? (Number(gridDataArray[3])) : 0,
                                gridDataArray[4] != undefined ? (Number(gridDataArray[4])) : 0,
                                gridDataArray[5] != undefined ? (Number(gridDataArray[5])) : 0,

                                gridDataArray[6] != undefined ? (Number(gridDataArray[6])) : 0,
                                gridDataArray[7] != undefined ? (Number(gridDataArray[7])) : 0,
                                // gridDataArray[8] != undefined ? (Number(gridDataArray[8])) : 0,
                                gridDataArray[9] != undefined ? (Number(gridDataArray[9])) : 0,
                                gridDataArray[10] != undefined ? (Number(gridDataArray[10])) : 0,
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
                            "Place Suborder",
                            "Suborder Acknowledge",
                            "Production",
                            "Quality Check",
                            "Shipped",
                            "Received By Supplier",
                            "Received By Emirates",
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
                            "title": "Receivable",
                            "percentage": "100",
                            "value": tilesData != undefined ? tilesData[2] : 0,
                            "actionURI": "",
                            "overDue": "0",
                            "fontClass": "green-meadow"
                        },
                        {
                            "id": 1,
                            "title": "Total Received",
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
        return callback(supDashboardData);
    }
    catch (err) {
        return callback(err);
    }

}



