'use strict';
const log4js = require('log4js');
const logger = log4js.getLogger('getTranxByID');

const getContractByID = function(payload, UUIDKey, route, callback, JWToken) {
  logger.debug(' [getContractByID] PAYLOAD : ' + JSON.stringify(payload, null, 2));

  const req = {
    'data': {
      'degRefNo': payload.transactionID
    }
  };
  getContractDetail(req,callback, JWToken);
};

function getContractDetail(req, responseCallback, JWToken) {
  const unAuthorizedResonse = {
    'responseMessage': {
      'action': 'ResponseMessage',
      'data': {
        'message': {
          'status': 'UNAUTHORIZED',
          'errorDescription': 'You are not authorized to view this transaction',
          'newPageURL': '/transactionList',
          'displayToUser': true
        }
      }
    }
  }
  console.log('================Request Received==============' + JSON.stringify(unAuthorizedResonse));
  responseCallback(unAuthorizedResonse);
  }





function getDisputeData(JWToken, resObject) {

  return new Promise(function(resolve, reject) {
    if (resObject.transactionDetailData.data.DisputeRef != '') {

      const disputeRequest = {
        'currentPageNo': 1,
        'pageSize': 1,
        'data': {
          'DisputeRef': resObject.transactionDetailData.data.DisputeRef
        },
        'type': 'disputeSearchList'
      };
      return disputeSearchListFunc(disputeRequest, JWToken)
        .then((resp) => {
          resp = resp || {};
          const data = resp.data || {};
          const totalRecords = resp.count;
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.');
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.' + totalRecords);
          console.log('>>>>>>>>>>>>>>>>>Dispute Data>>>>>>>>>>>>>>>>.' + JSON.stringify(data));
          resolve(data);

        }).catch((err) => {
          console.log('Error occurred while finding the dispute detail', err);
          resolve(null);
        });
    }
    resolve(null);
  });

}

function getStatusPG(ISATHR, ISAUTH) {

  /* if(ISATHR===true&&ISAUTH===true){
		return "SUCCESS";
	}else
	{
		return "Not Reconciled";
	}*/

  return '';
}
function getStatusACQ(ISAUTH, ISATHR, TotalBillAmount, AuthorizedAmount) {
  if (ISAUTH === true && ISATHR === true && TotalBillAmount == AuthorizedAmount) {
    return 'Yes';
  }

  return 'No';

}
function getStatusDEG(One, Two) {
  if (One === true && Two === true) {
    return 'SUCCESS';
  }

  return 'Not Reconciled';

}
function getStatusSPR(ISINIT, ISRECN, ISRECV, EntityBillAmount, TotalBillAmount) {
  if ((ISINIT == true || ISRECN == true) && ISRECV && EntityBillAmount == TotalBillAmount) {
    return 'Yes';
  }

  return 'No';

}

function getEntityConflictStatus(ConflictCode, ISINIT, ISRECN) {
  if (ConflictCode.IsEntityConflictAmount || ISINIT == false || ISRECN == false) {return 'No';}
  return 'Yes';
}
function getBankConflictStatus(ConflictCode, ISAUTH) {
  if (ConflictCode.IsAcquirerConflictAmount || ConflictCode.IsStatusConflict || ISAUTH == false) {return 'No';}
  return 'Yes';
}
function getEntityConflictBarStatus(ConflictCode) {
  if (ConflictCode.IsEntityConflictAmount) {return 'No';}
  return 'Yes';
}
function getBankConflictBarStatus(ConflictCode) {
  if (ConflictCode.IsAcquirerConflictAmount || ConflictCode.IsStatusConflict) {return 'No';}
  return 'Yes';
}
function getBankConflictDescription(ConflictCode, ISDECL) {
  if (ISDECL) {return 'Transaction Decline';}
  if (ConflictCode.IsAcquirerConflictAmount && ConflictCode.IsStatusConflict) {return 'Status And Amount Mismatch With Bank';}
  else if (ConflictCode.IsAcquirerConflictAmount) {return 'Amount Mismatch With Bank';}
  else if (ConflictCode.IsStatusConflict) {return 'Status conflict';}
  return '';
}
function getEntityConflictDescription(ConflictCode) {
  if (ConflictCode.IsEntityConflictAmount) {return 'Amount Mismatch With Entity';}
  return '';
}

function getEntityAcquirerDetails(Name) {
  const Req = {
    'filter': Name == '' ? 'N/A' : Name,
    'type': 'Entity'
  };

  return EA.entityAcquirerList(Req).then((data) => {

    console.log('==========================================');
    console.log('==========================================');
    console.log(JSON.stringify(data));

    return data;
  }).catch((data) => {
    console.log(JSON.stringify(data));
  });

}

function TranStatus(ISATHR, ISAUTH, ISFAIL, ISINIT, ISRECN, ISRECV) {

  if (ISINIT === true && ISRECV === true && ISATHR === true && ISAUTH === true && ISRECN === true) {
    return 'Reconcile';

  }
  else if (ISINIT === true && ISRECV === true && ISATHR === false && ISAUTH === true && ISFAIL === false) {
    return 'Authorized';
  }
  else if (ISFAIL === true) {
    return 'Failed';
  }
  else if (ISINIT === true && ISRECV === true && ISATHR === true && ISAUTH === true && ISRECN === false) {
    return 'Auth Received';
  }
  else if (ISINIT === true && ISRECV === true) {
    return 'Received';
  }

  return 'Initiated';

}

function errorResponse(exp, UUIDKey) {
  const response = {
    success: false,
    message: 'Error: ' + exp,
    UUID: UUIDKey
  };
  return response;
}
function GetPaymentStatus(EPayStatusAuthRecv, EPayStatusRecv, ISRFND, ISRFAP, ISRFIN) {

  const paymentStatus = EPayStatusAuthRecv != '' ? EPayStatusAuthRecv : EPayStatusRecv;
  if (ISRFND) {return paymentStatus + ' (Refund Processed)';}
  else if (ISRFAP) {return paymentStatus + ' (Refund Approved)';}
  else if (ISRFIN) {return paymentStatus + ' (Refund Initiated)';}
  return paymentStatus;

}
function GetRefundDate(RFINTimestamp, RFAPTimestamp, RFNDTimestamp) {
  if (RFAPTimestamp && RFAPTimestamp != '' && RFAPTimestamp != 0) {return UNIXConvertToDate(RFAPTimestamp);}
  else if (RFINTimestamp && RFINTimestamp != '' && RFINTimestamp != 0) {return UNIXConvertToDate(RFINTimestamp);}
  else if (RFNDTimestamp && RFNDTimestamp != '' && RFNDTimestamp != 0) {return UNIXConvertToDate(RFNDTimestamp);}
  return '';
}
function GetDisputeDate(DSPINTimestamp, DSPFWTimestamp, DSPTDTimestamp) {
  if (DSPTDTimestamp && DSPTDTimestamp != '' && DSPTDTimestamp != 0) {return UNIXConvertToDate(DSPTDTimestamp);}
  else if (DSPFWTimestamp && DSPFWTimestamp != '' && DSPFWTimestamp != 0) {return UNIXConvertToDate(DSPFWTimestamp);}
  else if (DSPINTimestamp && DSPINTimestamp != '' && DSPINTimestamp != 0) {return UNIXConvertToDate(DSPINTimestamp);}
  return '';
}

function GetRefundStatus(ISRFND, ISRFIN, ISRFAP) {
  if (ISRFND) {return 'Processed';}
  else if (ISRFAP) {return 'Approved';}
  else if (ISRFIN) {return 'Initiated';}
  return '';

}
function GetDisputeStatus(ISDSPTD, ISDSPIN, ISDSPFW) {
  if (ISDSPTD) {return 'Approved';}
  else if (ISDSPFW) {return 'Forwarded';}
  else if (ISDSPIN) {return 'Initiated';}
  return '';

}

exports.getContractByID = getContractByID;
