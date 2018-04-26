'use strict';

module.exports = {
  notification: {
    email: false,
    inbox: false
  },
  info: {
    name: 'syncMicroService',
    dubaiPaySummary: '/summary',
    dubaiPayDetails: '/details',
    dubaiPayResubmit: '/resubmit',
    cipherSyncCheck: '/getAllTransactionsCountSum',
    cipherCheckDetails: '/getAllTransactionsSync',
    startInterval: 5, // hours
    endInterval: 2, // hours
    username: 'avanza_dubaipay_usr',
    password: 'q3Kw9pE2Ru'
  }
};

