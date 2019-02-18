var validType = require("./validationType");


var entityValidation = {
    "/entityName" : validType.onlyRequired,
    "/arabicName" : validType.onlyRequired,
    "/spCode" : validType.requiredAndAlphanumeric
};

var acquirerValidation = {
    "/acquirerName" : validType.onlyRequired,
    "/arabicName" : validType.onlyRequired,
    "/shortCode" : validType.requiredAndAlphanumeric
};

var fileTemplateValidation = {
    '/templateName' : validType.onlyRequired
};

module.exports = {
    "entityValidation" : entityValidation,
    "acquirerValidation" : acquirerValidation,
    "fileTemplateValidation" : fileTemplateValidation
};