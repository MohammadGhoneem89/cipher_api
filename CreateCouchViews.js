'use strict';

var rp = require('request-promise');
var fs = require("fs");
const config = require('../cipher-api/config');
const crypto = require('./lib/helpers/crypto');
const logger = require('./lib/helpers/logger')().app;

let couchEndPointQuery = "" ;
const baseFolder = "./CouchViews";

const pass = crypto.decrypt(config.get('couch.password'));
const username =  config.get('couch.username');


var Sync = function(couchIP,couchChannel){

  couchEndPointQuery =  "http://" + username + ":" + pass + "@" + couchIP + "/" + couchChannel+ "/_design";
  
  fs.readdir(baseFolder , function(err, items) {
       for (var i=0; i<items.length; i++) {
           CreateView(items[i]);
       }
  });
};


function TakeAction(viewname,parsedBody){
   
   fs.writeFile(baseFolder + "/" + viewname + ".json", JSON.stringify(parsedBody), function(err) {
    if(err) {
        return logger.error("Error in saving latest copy of view " + viewname+ " error:" + err);
    }
   });

}

function PutViewOnServer(viewname,json){
  
  
  const options = {
    method: 'PUT',
    uri: couchEndPointQuery  + "/" + viewname,
    body: json,
    json: true // Automatically stringifies the body to JSON
  };

  rp(options)
    .then(function(parsedBody) {
	    logger.info('Put Call Successfull');
    })
    .catch(function(err) {
       // POST failed...
	    logger.error('Put Call not successfull with error ' + err);
     
    });



}

function PutToServer(viewname,err){
   if (err == "StatusCodeError: 404 - {\"error\":\"not_found\",\"reason\":\"missing\"}" || err == "StatusCodeError: 404 - {\"error\":\"not_found\",\"reason\":\"deleted\"}" ){
       let json = require(baseFolder + "/" + viewname + ".json");

       if (json._id){
          delete json._rev;
          PutViewOnServer(viewname,json)
       }
       else {
	       logger.info("No view found on the server or client for " + viewname);
       }
      
   }

}

function CreateView(value) {

  let arr = value.split(".");
  let viewname = arr[0];

  
  const options = {
    method: 'GET',
    uri: couchEndPointQuery  + "/" + viewname,
    body: {

    },
    json: true // Automatically stringifies the body to JSON
  };

  rp(options)
    .then(function(parsedBody) {
        TakeAction(viewname,parsedBody);
    })
    .catch(function(err) {
       // POST failed...
	    logger.info('Get Call Failed for view ' + viewname + " with error " + err);
       PutToServer(viewname,err)

    });
}


exports.Sync = Sync;
