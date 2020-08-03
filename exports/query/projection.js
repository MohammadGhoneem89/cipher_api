'use strict';

const mongoCriteria = {
  entity: {
    'entityName': 1,
    'arabicName': 1,
    'spCode': 1,
    'isActive': 1,
    'status.value': 1
  },
  acquirer: {
    'acquirerName': 1,
    'arabicName': 1,
    'shortCode': 1,
    'isActive': 1,
    'status.value': 1
  },
  reconAuditTrail: {
    'orgType': 1,
    'serviceCode': 1,
    'reqType': 1,
    'reconType': 1,
    'shortCode': 1,
    'fileName': 1,
    'IP': 1,
    'createdBy': 1,
    'createdAt': 1
  },
  reconAuditDetail: {
    'transactions.PGRefNo': 1,
    'transactions.transDate': 1,
    'transactions.ePayNo': 1,
    'transactions.BLADescription': 1,
    'transactions.BLA_status': 1,
    'transactions.FPS_status': 1,
    'transactions.amount': 1,
    'transactions.SPTRN': 1
  },
  auditLogs: {
    'collectionName': 1,
    'ipAddress': 1,
    'event': 1,
    'createdBy': 1,
    'createdAt': 1
  }
};

const mangoCriteria = {
  transaction: [
    'data.PayRef',
    'data.Status',
    'data.SPCode',
    'data.ServiceCode',
    'data.TotalBillAmount',
    'data.BillerRefNo',
    'data.TransactionCaptureDate',
    'data.AcquirerId',
    'data.PGRefNumber'
  ],
  exception: [
    'data.SPCode',
    'data.AcquirerId',
    'data.PayRef',
    'data.BillerRefNo',
    'data.PGRefNumber',
    'data.ServiceCode',
    'data.TransactionCaptureDate',
    'data.ISException',
    'data.TotalBillAmount',
    'data.ISATHR',
    'data.ISAUTH',
    'data.ISFAIL',
    'data.ISINIT',
    'data.ISRECN',
    'data.ISRECV'
  ]
};

module.exports = {
  mongoCriteria: mongoCriteria,
  mangoCriteria: mangoCriteria
};
