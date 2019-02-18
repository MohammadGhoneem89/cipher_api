const blockchainAccountServices = require('../../lib/services').blockchainAccount;
const logger = require('../../../../lib/helpers/logger')().app;
const config = require('../../../../config/index');
const crypto = require('../../../../lib/helpers/crypto');

function GetAccountList(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  get(payload, callback);
}

async function get(payload, callback) {
  try {
    let pg = crypto.decrypt(config.get('postgressqlConfig.url'));
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
}

exports.GetAccountList = GetAccountList;
