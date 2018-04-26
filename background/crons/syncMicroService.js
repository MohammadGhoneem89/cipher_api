'use strict';

const rp = require('request-promise');
const _ = require('lodash');
const config = require('../../config');
const syncConfig = require('../config/syncMicroService');
const configRepo = require('../../lib/repositories/config');
const dates = require('../../lib/helpers/dates');
const cipherBaseURL = config.get('sync.cipher');
const dubaiPayBaseURL = config.get('sync.dubaiPay');
const basicAuth = require('../../lib/auth/basic')(syncConfig.info.username, syncConfig.info.password);

module.exports = {
  init
};

function init() {
  checkMicroServices();
}

function checkMicroServices() {
  let startDate = 0;
  let endDate = 0;
  configRepo.findOneByName(syncConfig.info.name)
    .then((config) => {
      if (!config) {
        return {
          data: {
            startDate: dates.subHours(dates.newDate(), 144)
          }
        };
      }
      return config;
    })
    .then((config) => {
      const d1 = dates.subHours(dates.newDate(), syncConfig.info.startInterval);
      const d2 = dates.addHours(config.data.startDate, syncConfig.info.endInterval);

      endDate = d1 < d2 ? d1 : d2;
      startDate = config.data.startDate;
      if (endDate < startDate) {
        return Promise.reject('syncMicroService not executed');
      }
      return Promise.all([
        syncCheck(startDate, endDate),
        cipherSyncCheck(startDate, endDate)
      ]);
    })
    .then((res) => {
      const cipher = _.get(res, '[1]', {});
      const dubaiPay = _.get(res, '[0]', {});

      if (cipher.ResultData.value.TransactionSum === dubaiPay.totalAmount && cipher.ResultData.value.Count === dubaiPay.totalCount) {
        return Promise.resolve([]);
      }

      return Promise.all([
        checkDetails(startDate, endDate),
        cipherCheckDetails(startDate, endDate)
      ]);
    })
    .then((res) => {

      const dubaiPayTrans = _.get(res, '[0].body', []);
      const cipherTrans = _.get(res, '[1].ResultData.value', []);
      const modifiedEpayTrans = [];
      const ePayRefList = [];
      for (const tran of cipherTrans) {
        modifiedEpayTrans.push({
          ePayRefNumber: tran.ePayRef,
          transactionAmount: tran.amount,
          transactionStatus: tran.status
        });
      }

      const diffData = _(dubaiPayTrans)
        .differenceBy(modifiedEpayTrans, 'ePayRefNumber', 'transactionAmount')
        .map(_.partial(_.pick, _, 'ePayRefNumber', 'transactionAmount'))
        .value();

      for (let j = 0; j < diffData.length; j += 1) {
        ePayRefList.push({
          ePayRefNumber: diffData[j].ePayRefNumber
        });
      }
      return repostData(startDate, endDate, ePayRefList);
    })
    .then(() => {
      const payload = {
        query: { name: syncConfig.info.name },
        params: { data: { startDate: endDate } },
        options: { upsert: true }
      };
      return configRepo.findOneAndUpdate(payload.query, payload.params, payload.options);
    })
    .catch((err) => {
      console.log('ERROR ', JSON.stringify(err)); // eslint-disable-line no-console
    });

}

function syncCheck(startDate, endDate) {
  const payload = {
    requestURl: dubaiPayBaseURL + syncConfig.info.dubaiPaySummary,
    basicAuth: basicAuth,
    body: {
      startDate: dates.unixToDubaiEpayFormat(startDate),
      endDate: dates.unixToDubaiEpayFormat(endDate)
    }
  };
  return requestPromise(payload);
}

function cipherSyncCheck(startDate, endDate) {
  const payload = {
    requestURl: cipherBaseURL + syncConfig.info.cipherSyncCheck,
    body: {
      fromDate: (startDate / 1000).toString(),
      toDate: (endDate / 1000).toString()
    }
  };
  return requestPromise(payload);
}

function cipherCheckDetails(startDate, endDate) {
  const payload = {
    requestURl: cipherBaseURL + syncConfig.info.cipherCheckDetails,
    body: {
      fromDate: (startDate / 1000).toString(),
      toDate: (endDate / 1000).toString()
    }
  };
  return requestPromise(payload);
}

function checkDetails(startDate, endDate) {
  const payload = {
    requestURl: dubaiPayBaseURL + syncConfig.info.dubaiPayDetails,
    basicAuth: basicAuth,
    body: {
      startDate: dates.unixToDubaiEpayFormat(startDate),
      endDate: dates.unixToDubaiEpayFormat(endDate)
    }
  };
  return requestPromise(payload);
}

function repostData(startDate, endDate, ePayRefList) {
  const payload = {
    requestURl: dubaiPayBaseURL + syncConfig.info.dubaiPayResubmit,
    basicAuth: basicAuth,
    body: {
      startDate: dates.unixToDubaiEpayFormat(startDate),
      endDate: dates.unixToDubaiEpayFormat(endDate),
      ePayRefList: ePayRefList
    }
  };
  return requestPromise(payload);
}

function requestPromise(payload) {
  const options = {
    method: 'POST',
    uri: payload.requestURl,
    body: {
      header: payload.header || {},
      body: payload.body || {}
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': payload.basicAuth || ''
    },
    json: true
  };
  return rp(options);
}
