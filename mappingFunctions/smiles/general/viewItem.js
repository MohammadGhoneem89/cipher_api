'use strict';
var config = require('../../../api/bootstrap/smiles.json')
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;
const category = [ "None", "New Offers", "Trending Offers", "Shopping Offers", "Dining Offers", "Entertainment Offers", "Wellness Offers", "Travel Offers", "Etisalat Services", "Financial", "Other", "Shopping" ];
const subcategory = ["Free Credit", "Free Minutes", "Recharge Credit", "Etisalat Bundle", "Smiles Offer", "Data Offer", "International Minutes", "Local Minutes", "Combo Pack", "Local/International Minutes", "SMS Offer Object", "Free International Minutes", "Free SMS Offer", "Services", "Malls & Hypermarkets", "Fashion & Jewellery", "Home & Lifestyle", "Cafes", "Family & Casual", "SEE", "DO", "Health", "Grooming", "Airlines", "Hotels", "Holidays", "Voice Package", "Data Package", "Roaming Package", "Beauty", "Minutes Deal", "Data Deal", "Car Hire", "Fine Dining", "SMS Deal", "Internet Calling Plan", "SMS Package", "National Minutes", "Training", "Combo Offer", "Hotel", "Gifts", "Family & Casual", "Charity", "Services", "Theme Parks", "Sports and Leisure", "Learning", "Fashion & Jewellery"];
function format(data) {
    data.data.CATEGORY_ID = category[data.data.CATEGORY_ID]||"Not Defined";
    data.data.SUB_CATEGORY_ID = category[data.data.SUB_CATEGORY_ID+31]||"Not Defined";

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
            const formattedData = format(parsedBody);
            callback(formattedData);
        })
        .catch(function (err) {
            // POST failed...
            logger.debug('==================== Request Failed==================' + err);
        });
}




