'use strict';
var config = require('../../../api/bootstrap/smiles.json')
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;
const category = ["None", "New Offers", "Trending Offers", "Shopping Offers", "Dining Offers", "Entertainment Offers", "Wellness Offers", "Travel Offers", "Etisalat Services", "Financial", "Other", "Shopping"];
const subcategory = { "3": { "31": "Malls & Hypermarkets", "32": "Fashion & Jewellery", "33": "Home & Lifestyle", "34": "Services", "35": "Gifts", "36": "Services" }, "4": { "41": "Cafes", "42": "Family & Casual", "43": "Fine Dining" }, "5": { "51": "SEE", "52": "DO", "53": "Family & Casual", "54": "Sports and Leisure", "55": "Theme Parks" }, "6": { "61": "Health", "62": "Grooming", "63": "Beauty", "64": "Training", "65": "Charity", "66": "Learning" }, "7": { "71": "Airlines", "72": "Hotels", "73": "Holidays", "74": "Car Hire", "75": "Hotel" }, "8": { "81": "Voice Package", "82": "Data Package", "83": "Roaming Package", "86": "SMS Package", "87": "Free Credit", "88": "Free Minutes", "90": "Recharge Credit", "91": "Etisalat Bundle", "92": "Smiles Offer", "93": "Data Offer", "94": "International Minutes", "95": "Local Minutes", "96": "Combo Pack", "97": "Local/International Minutes", "98": "SMS Offer Object", "99": "Free International Minutes", "100": "Free SMS Offer", "101": "Data Deal", "102": "Minutes Deal", "103": "SMS Deal", "104": "Combo Offer", "105": "National Minutes", "106": "Internet Calling Plan" }, "11": { "111": "Fashion & Jewellery" } };


function format(data) {
    const categoryID = data.data.CATEGORY_ID;
    data.data.CATEGORY_ID = category[categoryID] || "Not Defined";
    if (categoryID && subcategory[categoryID]) {
        console.log(categoryID, subcategory[categoryID])
        data.data.SUB_CATEGORY_ID = ((subcategory[data.data.CATEGORY_ID])[data.data.SUB_CATEGORY_ID]) || "Not Defined";
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
            const formattedData = format(parsedBody);
            callback(formattedData);
        })
        .catch(function (err) {
            // POST failed...
            logger.debug('==================== Request Failed==================' + err);
        });
}




