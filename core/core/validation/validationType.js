var entityValidation = {
    "onlyRequired" : {
        "required" : true
    },
    "requiredAndAlphanumeric" : {
        "required" : true,
        "name" : true
    },
    "onlyAlphanumeric" : {
        "name" : true
    },
    "requiredAndEmail" : {
        "required" : true,
        "email" : true
    },
    "onlyEmail" : {
        "email" : true
    },
    "requiredAndCode" : {
        "required" : true,
        "code" : true
    },
    "onlyCode" : {
        "code" : true
    },
    "requiredAndIP" : {
        "required" : true,
        "IP" : true
    },
    "onlyIP" : {
        "IP" : true
    },
    "requiredAndPort" : {
        "required" : true,
        "port" : true
    },
    "onlyPort" : {
        "port" : true
    },
    "requiredAndNumber" : {
        "required" : true,
        "number" : true
    },
    "onlyNumber" : {
        "number" : true
    },
    "requiredAndMaxLength" : {
        "required" : true,
        "maxLength" : true
    },
    "onlyMaxLength" : {
        "maxLength" : true
    },
    "requiredAndMinLength" : {
        "required" : true,
        "minLength" : true
    },
    "onlyMinLength" : {
        "minLength" : true
    }


}

module.exports = entityValidation;