
'use strict';
var path = require('path');
var fs = require('fs');
var util = require('util');
var config = require('../config.json');
var helper = require('./helper.js');
var logger = helper.getLogger('install-chaincode');
var tx_id = null;
//function installChaincode(org) {
var installChaincode = function(peers, chaincodeName, chaincodePath,
	chaincodeVersion, username, org) {
	logger.debug(
		'\n============ Install chaincode on organizations ============\n');
	helper.setupChaincodeDeploy();
	var channel = helper.getChannelForOrg(org);
	var client = helper.getClientForOrg(org);

	return helper.getOrgAdmin(org).then((user) => {
		var request = {
			targets: helper.newPeers(peers),
			chaincodePath: chaincodePath,
			chaincodeId: chaincodeName,
			chaincodeVersion: chaincodeVersion
		};
		return client.installChaincode(request);
	}, (err) => {
		logger.error('Failed to enroll user \'' + username + '\'. ' + err);
		
		let resp = {
				success: true,
				message: 'Failed to enroll user \'' + username + '\'. ' + err
			};
			return resp;
	}).then((results) => {
		var proposalResponses = results[0];
		var proposal = results[1];
		var all_good = true;
		for (var i in proposalResponses) {
			let one_good = false;
			if (proposalResponses && proposalResponses[0].response &&
				proposalResponses[0].response.status === 200) {
				one_good = true;
				logger.info('install proposal was good');
			} else {
				logger.error('install proposal was bad');
			}
			all_good = all_good & one_good;
		}
		if (all_good) {
			logger.info(util.format(
				'Successfully sent install Proposal and received ProposalResponse: Status - %s',
				proposalResponses[0].response.status));
			logger.debug('\nSuccessfully Installed chaincode on organization ' + org +
				'\n');
				
			let resp = {
				success: true,
				message: 'Successfully Installed chaincode on organization ' + org
			};
			return resp;	
				
		} else {
			logger.error(
				'Failed to send install Proposal or receive valid response. Response null or status is not 200. exiting...'
			);
			let resp = {
				success: true,
				message: 'Failed to send install Proposal or receive valid response. Response null or status is not 200. exiting...'
			};
			return resp;
			
		}
	}, (err) => {
		logger.error('Failed to send install proposal due to error: ' + err.stack ?
			err.stack : err);
			let resp = {
				success: true,
				message: 'Failed to send install proposal due to error: ' + err.stack ?	err.stack : err
			};
			return resp;
		
	});
};
exports.installChaincode = installChaincode;
