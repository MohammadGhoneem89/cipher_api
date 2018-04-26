
var util = require('util');
var fs = require('fs');
var path = require('path');
var config = require('../config.json');
var helper = require('./helper.js');
var logger = helper.getLogger('Create-Channel');
//Attempt to send a request to the orderer with the sendCreateChain method
var createChannel = function(channelName, channelConfigPath, username, orgName) {
	logger.debug('\n====== Creating Channel \'' + channelName + '\' ======\n');
	
	
	var client = helper.getClientForOrg(orgName);
	var channel = helper.getChannelForOrg(orgName);
	logger.debug('orgName \'' + orgName );
	// read in the envelope for the channel config raw bytes
	logger.debug('Fetching channel config from '+channelConfigPath);
	var envelope = fs.readFileSync(path.join(__dirname, channelConfigPath));
	logger.debug('loaded channel config in envelope!!!');
	// extract the channel config bytes from the envelope to be signed
	var channelConfig = client.extractChannelConfig(envelope);

	//Acting as a client in the given organization provided with "orgName" param
	return helper.getOrgAdmin(orgName).then((admin) => {
		logger.debug(util.format('Successfully acquired admin user for the organization "%s"', orgName));
		// sign the channel config bytes as "endorsement", this is required by
		// the orderer's channel creation policy
		let signature = client.signChannelConfig(channelConfig);
		//logger.debug(client);
		//logger.debug(channel);
		//logger.debug(signature);
		//logger.debug(channelConfig);
		//logger.debug(channel.getOrderers()[0]);
		//logger.debug(client.newTransactionID());
		let request = {
			config: channelConfig,
			signatures: [signature],
			name: channelName,
			orderer: channel.getOrderers()[0],
			txId: client.newTransactionID()
		};

		// send to orderer
		return client.createChannel(request);
	}, (err) => {
		logger.error('Failed to enroll user \''+username+'\'. Error: ' + err);
		
		let response = {
				success: false,
				message: 'Failed to enroll user \''+username+'\'' + err
			};
		return response;
	}).then((response) => {
		logger.debug(' response ::%j', response);
		if (response && response.status === 'SUCCESS') {
			logger.debug('Successfully created the channel.');
			let resp = {
				success: true,
				message: 'Channel \'' + channelName + '\' created Successfully'
			};
		  return resp;
		} else {
			logger.error('\n!!!!!!!!! Failed to create the channel \'' + channelName +
				'\' !!!!!!!!!\n\n');
				
				
			let resp = {
				success: false,
				message: 'Failed to create the channel \'' + channelName + '\''
			};
		return resp;
			
		}
	}, (err) => {
		logger.error('Failed to initialize the channel: ' + err.stack ? err.stack :
			err);
			let resp = {
				success: false,
				message: 'Failed to initialize the channel: ' + err.stack ? err.stack : err
			};
		return resp;
	});
};

exports.createChannel = createChannel;
