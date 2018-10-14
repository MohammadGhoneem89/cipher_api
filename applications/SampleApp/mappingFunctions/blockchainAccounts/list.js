const blockchainAccountServices = require('../../lib/services').blockchainAccount;
const logger = require('../../../../lib/helpers/logger')().app;

function GetAccountList(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  get(payload, callback);
}

async function get(payload, callback) {
  try {
    let pg = 'postgresql://Admin:avanza123@blockchain.avanza.com:5432/OLAPCipher';
    let result = await blockchainAccountServices.getAccountList({pg});
    let data = result.accountList.map((item)=>{
      return {
        accountName: item.tranxdata.Name,
        accountBalance: item.tranxdata.Value
      }
    });

    const response = {
      blockchainAccountList: {
        action: "blockchainAccountList",
        pageData: {
          currentPageNo: 1,
          pageSize: 10,
          totalRecords: 1
        },
        data: data
      }
    };
    callback(response);
  }
  catch (e) {
    console.log(e);
    logger.app.info(e)
  }
  // .catch((err) => {
  //   logger.error(' [ Consortium Details ] Error : ' + err);
  //   callback(err);
  // });
}

exports.GetAccountList = GetAccountList;
