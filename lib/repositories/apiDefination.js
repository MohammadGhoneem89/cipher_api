'use strict';

const models = require('../models');
const _ = require('lodash');
const commonConst = require('../constants/common');
const dates = require('../helpers/dates');
const fs = require('fs');
const APIDefination = models.APIDefination;
const User = models.User;
const Group = models.Group;

module.exports = {
  create,
  find,
  update,
  findPageAndCount,
  findPageAndCount2,
  findById,
  getServiceList,
  getActiveAPIList,
  getAPIConfig,
  getActiveAPIsData,
  deleteAndInsert,
  getActiveAPIListForDocumentation,
  getActiveAPIForSmartConract
};
function getAPIConfig(payload) {
  const query = {};
  return APIDefination
    .find(query)
    .populate({ path: 'endpointName', 'populate': { path: 'auth.endpoint' } })
    .populate({ path: 'rules.channel' })
    .populate({ path: 'rules.smartcontractid' })
    .populate({ path: 'RequestMapping' })
    .populate({ path: 'ResponseMapping' })
    .lean(true)
    .exec();
}
function find(payload) {
  const query = {};
  return APIDefination
    .find(query)
    .lean(true)
    .exec();
}

function getActiveAPIList(payload) {
  let query = {}
  if (payload.useCase) {
    query = {
      useCase: payload.useCase,
      route: payload.route
    };
  } else if (payload.smartcontract) {
    query = {
      useCase: payload.useCase,
      route: payload.route
    };
  }

  payload.useCase ? query.useCase = payload.useCase : false;
  payload.route ? query.route = payload.route : false;
  console.log(JSON.stringify(query));
  let gte = {};
  let lte = {};
  return APIDefination
    .find(query)
    .select("-__v -_id")
    .sort('useCase')
    .populate({ path: 'RequestMapping', select: '-__v -_id -createdBy' })
    .populate({ path: 'ResponseMapping', select: '-__v -_id -createdBy' })
    .lean(true)
    .exec();
}


function getActiveAPIForSmartConract(payload) {
  console.log(JSON.stringify(payload));
  return APIDefination
    .find(payload)
    .select("-__v -_id")
    .sort('useCase')
    .populate({ path: 'RequestMapping', select: '-__v -_id -createdBy' })
    .populate({ path: 'ResponseMapping', select: '-__v -_id -createdBy' })
    .lean(true)
    .exec();
}

async function getActiveAPIListForDocumentation(payload) {
  const query = {
    isActive: true
  };

  payload.useCase ? query.useCase = payload.useCase : false;
  payload.route ? query.route = payload.route : false;
  // payload.orgTypes ? query.MSP = payload.orgTypes : false;


  let groups, userGroups = [], groupPermissions;
  let APIDefinition = (query) => {
    return APIDefination
      .find(query)
      .select("-__v -_id")
      .sort('useCase')
      .populate({ path: 'RequestMapping', select: '-__v -_id -createdBy' })
      .populate({ path: 'ResponseMapping', select: '-__v -_id -createdBy' })
      .lean(true)
      .exec();
  };


  try {
    if (payload.orgTypes) {
      groups = await User.find({ orgType: payload.orgTypes }).select('-_id').lean(true).exec();
      for (let item of groups) {
        userGroups.push(item['groups']);
      }
      groups = [].concat(...userGroups);
      // userGroups = [];
      // for (let grp of groups) {
      //   // !userGroups.includes(grp) ? userGroups.push(grp) : false;
      //   for (let iGrp of userGroups) {
      //     if (grp.toString() !== iGrp.toString()) {
      //       userGroups.push(grp);
      //     }
      //   }
      // }
      // userGroups = await userGroups.filter((v, i, a) => a.indexOf(v) === i);


      //$in:routes
      groupPermissions = await Group.find({ _id: { $in: groups } }).select('-_id permissions').lean(false).exec();
      let permissions = [];
      for (let item of groupPermissions) {
        permissions.push(item['permissions']);
      }
      groupPermissions = [].concat(...permissions);
      let groupRoutes = [];
      const recursive = (object, resultObject, treeKey, dataKey) => {
        iterator(object[treeKey], resultObject, treeKey, dataKey);
      };
      /*Function to find the URIs from nth level of Object named children*/
      const iterator = (object, resultObject, treeKey, dataKey) => {
        for (let obj of object) {
          let hasData = obj[dataKey];
          if (hasData) {
            resultObject.push(hasData);
          }
          if (obj[treeKey]) {
            iterator(obj[treeKey], resultObject, treeKey, dataKey)
          }
        }
      };

      /*Fetching Routes from Permissions DB Table*/
      for (let perm of groupPermissions) {
        recursive(perm, groupRoutes, 'children', 'URI');
      }
      groupRoutes = [].concat(...groupRoutes);
      let finalRoutesFromUserGroup = [];
      for (let route of groupRoutes) {
        if (~route.indexOf('/')) {
          let routeArray = [];
          routeArray = route.split('/');
          let size = routeArray.length - 1;
          finalRoutesFromUserGroup.push(routeArray[size] === '' ? routeArray[size - 1] : routeArray[size]);
        } else {
          finalRoutesFromUserGroup.push(route)
        }
      }
      if (finalRoutesFromUserGroup && finalRoutesFromUserGroup.length) {
        query.route = {
          $in: finalRoutesFromUserGroup
        };
        return APIDefinition(query);
      }
      return APIDefinition(query);
    }
    let gte = {};
    let lte = {};
    return APIDefinition(query);
  } catch (error) {
    console.error(error.stack || error);
  }
}

function getActiveAPIsData(payload) {
  const query = {
    isActive: true,
    useCase: payload.useCase || false
  };

  return APIDefination
    .find(query)
    .select("-__v -_id")
    .sort('useCase')
    .populate({ path: 'RequestMapping', select: '-__v -_id -createdBy' })
    .populate({ path: 'ResponseMapping', select: '-__v -_id -createdBy' })
    .lean(true)
    .exec();
}

function getServiceList() {
  const query = {
  };
  let gte = {};
  let lte = {};
  return APIDefination
    .find(query)
    .select('useCase route')
    .lean(true)
    .exec();
}

function create(payload) {
  return new APIDefination(payload).save();
}

function findById(payload) {
  return Promise.all([
    APIDefination.findOne({ route: payload.route, useCase: payload.useCase }).lean(true).select("-__v -_id")
  ])
    .then((res) => {
      return res[0];
    });
}
// let payload = {
//   searchCriteria: { useCase: 'PR' }
// }
//  findPageAndCount2(payload)

async function findPageAndCount2(payload) {
  let routesArray, useCaseRoutes = [];
  let groupIDPermissions = [{ '_id:': "", 'permissions': "" }];
  let query = {};
  let APIDefinition = (query) => { }
  try {
    if (payload.searchCriteria.useCase) {
      routesArray = await APIDefination.find({ useCase: payload.searchCriteria.useCase }).select('route').lean(true).exec();
      query.useCase = { $regex: new RegExp(payload.searchCriteria.useCase, 'gi'), $options: 'si' };
      groupIDPermissions = await Group.find({}).select('_id permissions').lean(false).exec();
      // console.log(groupIDPermissions, "PERMISSIONS AND IDS");


      let groupURIs = [];

      for (let j = 0; j < groupIDPermissions.length; j++) {
        // console.log(groupIDPermissions[j]._id, "ID FROM groupIDPermissions[j]")
        groupURIs[j] = {}
        groupURIs[j]._id = groupIDPermissions[j]._id
        groupURIs[j].URI = []
        for (let i = 0; i < groupIDPermissions[j].permissions.length; i++) {
          for (let k = 0; k < groupIDPermissions[j].permissions[i].children.length; k++) {
            for (let l = 0; l < groupIDPermissions[j].permissions[i].children[k].URI.length; l++) {

              groupURIs[j].URI.push(groupIDPermissions[j].permissions[i].children[k].URI[l])
            }
          }
        }
      }
      // console.log(groupURIs, "FINAL GROUP ID AND URI -----")

      for (let j = 0; j < groupURIs.length; j++) {
        for (let i = 0; i < groupURIs[j].URI.length; i++) {
          let uri = groupURIs[j].URI[i];
          let getIndex = uri.lastIndexOf('/');
          groupURIs[j].URI[i] = uri.substr(getIndex + 1, uri.length - 1);

        }
      }
      // console.log(groupURIs, "------>>>>>>>>>>>>   ROUTE FROM URI ---")

      for (let k = 0; k < routesArray.length; k++) {
        for (let i = 0; i < groupURIs.length; i++) {
          for (let j = 0; j < groupURIs[i].URI.length; j++) {
            if (routesArray[k].route == groupURIs[i].URI[j])
              routesArray[k].groupID = groupURIs[i]._id
          }
        }
      }
      // console.log(routesArray, "----ROUTE ARRAY ====");

      let newRoutes = [];
      newRoutes = routesArray;
      // console.log(newRoutes, "~~~~~~~~~~~ NEWROUTES");

      for (let i = 0; i < routesArray.length; i++) {
        routesArray[i].RoutesArray = [];
        for (let j = 0; j < newRoutes.length; j++) {
          if (routesArray[i].groupID == newRoutes[j].groupID) {
            routesArray[i].RoutesArray.push(newRoutes[j].route);
          }
        }
      }

      newRoutes = routesArray;
      // console.log(newRoutes, "~~~~~~~~~~~ NEWROUTES");

      routesArray = removeDuplicates(routesArray, 'groupID');
      // console.log(test.length, "remove please");

      function removeDuplicates(myArr, prop) {
        return myArr.filter((obj, pos, arr) => {
          return arr.map(mapObj =>
            mapObj[prop]).indexOf(obj[prop]) === pos;
        });
      }
      let UsersID; let UniqueUsers = [];

      UsersID = await User.find({}).select('_id groups orgType').lean(true).exec();

      for (let i = 0; i < routesArray.length; i++) {
        routesArray[i].orgType = [];
        delete routesArray[i].route;
        for (let j = 0; j < UsersID.length; j++) {
          if (routesArray[i].groupID && UsersID[j].groups[0]) {
            if (routesArray[i].groupID.toString() == UsersID[j].groups[0].toString()) {
              routesArray[i].orgType.push(UsersID[j].orgType);
            }
          }
        }
      }


      // for (let j = 0; j < routesArray.length; j++) {
      //   routesArray[j].orgType.filter((item, index) => {

      //     return (routesArray[j].orgType.indexOf(item) === index);
      //   });
      // }

      return Promise.all([
        APIDefination
          .find(query)
          .populate({ path: 'RequestMapping' })
          .lean(true)
          .exec(),
      ])
        .then((res) => {
          for (let i = 0; i < res[0].length; i++) {
            for (let j = 0; j < routesArray.length; j++) {
              for (let k = 0; k < routesArray[j].RoutesArray.length; k++) {
                // console.log(res[0][i]._id, "__________RESPONSE")
                if (res[0][i].route == routesArray[j].RoutesArray[k]) {
                  res[0][i].orgType = routesArray[j].orgType[0];
                }
              }
            }
          }
          // console.log(res,"----->>>>>>. RESPONSE")
          return res

        })

    }

  } catch (error) {
    console.error(error.stack || error);
  }
}
function findPageAndCount(payload) {
  let query = {};
  let gte = {};
  let lte = {};
  let groups = {};
  if (payload.searchCriteria.route) {
    query.route = { $regex: new RegExp(payload.searchCriteria.route, 'gi'), $options: 'si' };
    // query = _.merge({}, query, { 'route': payload.searchCriteria.route });
  }
  if (payload.searchCriteria.useCase) {
    query.useCase = { $regex: new RegExp(payload.searchCriteria.useCase, 'gi'), $options: 'si' };
    // query = _.merge({}, query, { 'useCase': payload.searchCriteria.useCase });
  }
  if (payload.searchCriteria.authorization) {
    query['dispatcher.authorization'] = { $regex: new RegExp(payload.searchCriteria.authorization, 'gi'), $options: 'si' };
    // query = _.merge({}, query, { 'dipatcher.authorization': payload.searchCriteria.authorization });
  }
  if (payload.searchCriteria.fromDate) {
    gte = { $gte: dates.ddMMyyyyMS(payload.searchCriteria.fromDate) };
  }
  if (payload.searchCriteria.toDate) {
    lte = { $lte: dates.ddMMyyyyMS(payload.searchCriteria.toDate) };
  }
  query.createdAt = Object.assign(gte, lte);
  if (_.isEmpty(query.createdAt)) {
    delete query.createdAt;
  }

  console.log(query, "-----------------------")
  return Promise.all([
    APIDefination
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      //  .select('useCase  route documentPath RequestMapping isActive isSimulated createdBy createdAt isSmartContract MSP description')
      .populate({ path: 'RequestMapping' })
      .populate({ path: 'createdBy' })
      // .sort(payload.page.sortData)
      .lean(true)
      .exec(),

    APIDefination.count(query)
  ]);

}
function deleteAndInsert(query, set) {
  return APIDefination.findOne(query).then((data) => {
    let queryUpsert = {}
    if (data && data._id) {
      queryUpsert = { _id: data._id };
    } else {
      queryUpsert = query;
    }
    return APIDefination.update(queryUpsert, { $set: set }, { upsert: true }).then((dataupsert) => {
      if (dataupsert && dataupsert.upserted) {
        return dataupsert.upserted[0];
      }
      return { _id: data._id };
    });
  });
}
function update(query, set) {
  console.log(JSON.stringify(set));
  return APIDefination.update(query, { $set: set }, { upsert: true });
}
