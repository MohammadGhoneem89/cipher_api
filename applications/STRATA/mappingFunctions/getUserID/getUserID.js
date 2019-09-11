/* eslint-disable eol-last */
/* eslint-disable no-console */
'use strict';
// //userlist
// //payload mai orgCode ayege
// // orgCode === userlist.orgCode give user.id
// //pass userid to customerAassociaions and get details

const getUserList = require('../../../../core/mappingFunctions/user/list');
const getUserDetails = require('../customerAssociation/index.js');

function getUserID(payload, UUIDKey, route, callback, JWToken) {
  // console.log(JWToken,"JWTOKEN");
  let users = getUserList.userListOut(payload, {}, {}, {}, JWToken);
  console.log(users, "users");

  // let _payld = {
  //     data: {
  //         userId: ""
  //     }
  // }
  // getUserDetails.getCustomerAssociationDetail(payload, UUIDKey, route, callback, JWToken){

  // }

  return callback({
    "success": users
  });
}
exports.getUserID = getUserID;