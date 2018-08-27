'use strict';
var config = require('../../../api/connectors/smiles.json')
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const category = ["None", "New Offers", "Trending Offers", "Shopping Offers", "Dining Offers", "Entertainment Offers", "Wellness Offers", "Travel Offers", "Etisalat Services", "Financial", "Other", "Shopping"];
const subcategory = {"3c":{"31s":"Malls & Hypermarkets","32s":"Fashion & Jewellery","33s":"Home & Lifestyle","34s":"Services","35s":"Gifts","36s":"Services"},"4c":{"41s":"Cafes","42s":"Family & Casual","43s":"Fine Dining"},"5c":{"51s":"SEE","52s":"DO","53s":"Family & Casual","54s":"Sports and Leisure","55s":"Theme Parks"},"6c":{"61s":"Health","62s":"Grooming","63s":"Beauty","64s":"Training","65s":"Charity","66s":"Learning"},"7c":{"71s":"Airlines","72s":"Hotels","73s":"Holidays","74s":"Car Hire","75s":"Hotel"},"8c":{"81s":"Voice Package","82s":"Data Package","83s":"Roaming Package","86s":"SMS Package","87s":"Free Credit","88s":"Free Minutes","90s":"Recharge Credit","91s":"Etisalat Bundle","92s":"Smiles Offer","93s":"Data Offer","94s":"International Minutes","95s":"Local Minutes","96s":"Combo Pack","97s":"Local/International Minutes","98s":"SMS Offer Object","99s":"Free International Minutes","100s":"Free SMS Offer","101s":"Data Deal","102s":"Minutes Deal","103s":"SMS Deal","104s":"Combo Offer","105s":"National Minutes","106s":"Internet Calling Plan"},"11c":{"111s":"Fashion & Jewellery"}};

function format(data) {
    const categoryID = data.data.CATEGORY_ID.toString();
    data.data.CATEGORY_ID = category[categoryID] || "Not Defined";
    if (categoryID) {
        data.data.SUB_CATEGORY_ID = ((subcategory[categoryID+'c'])[data.data.SUB_CATEGORY_ID+'s']) || "Not Defined";
    }


    return {
        action: 'viewItem',
        viewItem: data
    }
}

exports.viewItem = function (payload, UUIDKey, route, callback, JWToken) {
    let URL = config['host'] + '/item';
    var options = {
        method: 'POST',
        uri: URL,
        body: payload,
        json: true // Automatically stringifies the body to JSON
    };
    logger.info("The notification going is as follows" + JSON.stringify(payload))

    rp(options)
        .then(function (parsedBody) {
            logger.debug(JSON.stringify(parsedBody));
            logger.debug('==================== Sent Successfully==================');
            let formattedData = format(parsedBody);
            callback(formattedData);
        })
        .catch(function (err) {
            // POST failed...
            logger.debug('==================== Request Failed==================' + err);
        });
}




