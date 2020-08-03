'use strict';

const common = require('./common');

const createPasswordObject = {
    properties:{
        action:common.action,
        minimumPasswordLength:{
            required:true,
            type:'number',
            messages:{
                required:'minimumPasswordLength is required',
                type:'minimumPasswordLength must be number'
            }
        },
        maximumPasswordLength :{
        required:true,
            type:'number',
            messages:{
            required:'maximumPasswordLength is required',
                type:'maximumPasswordLength must be number'
            }
        },
        minimumAlphabetCount : {
            required:true,
            type:'number',
            messages:{
                required:'minimumAlphabetCount is required',
                type:'minimumAlphabetCount must be number'
            }
        },
        maximumAlphabetCount : {
            required:true,
            type:'number',
            messages:{
                required:'maximumAlphabetCount is required',
                type:'maximumAlphabetCount must be number'
            }
        },
        minimumDigitCount :  {
            required:true,
            type:'number',
            messages:{
                required:'minimumDigitCount is required',
                type:'minimumDigitCount must be number'
            }
        },
        maximumDigitCount : {
            required:true,
            type:'number',
            messages:{
                required:'maximumDigitCount is required',
                type:'maximumDigitCount must be number'
            }
        },
        allowIncorrectLoginAttempts : {
            required:true,
            type:'number',
            messages:{
                required:'allowIncorrectLoginAttempts is required',
                type:'allowIncorrectLoginAttempts must be number'
            }
        },
        minimumUpperCase : {
            required:true,
            type:'number',
            messages:{
                required:'minimumUpperCase is required',
                type:'minimumUpperCase must be number'
            }
        },
        minimumLowerCase : {
            required:true,
            type:'number',
            messages:{
                required:'minimumLowerCase is required',
                type:'minimumLowerCase must be number'
            }
        },
        unAcceptedKeywords : {
            required:true,
            type:'array',
            minItems:1,
            items:{
                type:'string',
                messages:{
                    type:"unAcceptedKeywords must be of string"
                },
            },
            messages:{
                required: 'unAcceptedKeywords is missing',
                type: 'unAcceptedKeywords must be of array type',
                minItems: 'unAcceptedKeywords must have at least one item'
            },
        },
        changePeriodDays : {
            required:true,
            type:'number',
            messages:{
                required:'changePeriodDays is required',
                type:'changePeriodDays must be number'
            }
        },
        lockTimeInMinutes : {
            required:true,
            type:'number',
            messages:{
                required:'lockTimeInMinutes is required',
                type:'lockTimeInMinutes must be number'
            }
        },
        errorMessage : {
            required:true,
            type:'string',
            messages:{
                required:'errorMessage is required',
                type:'errorMessage must be string'
            }
        }
    }

};


const updatePasswordObject = {
    properties:{
        id:{
            required:true,
            type:'string',
            pattern:'^[0-9a-fA-F]{24}$',
            messages:{
                required:'id is required',
                type:'id must be number',
                pattern:'insert a valid object id'
            }
        },
        action:common.action,
        minimumPasswordLength:{
            required:true,
            type:'number',
            messages:{
                required:'minimumPasswordLength is required',
                type:'minimumPasswordLength must be number'
            }
        },
        maximumPasswordLength :{
            required:true,
            type:'number',
            messages:{
                required:'maximumPasswordLength is required',
                type:'maximumPasswordLength must be number'
            }
        },
        minimumAlphabetCount : {
            required:true,
            type:'number',
            messages:{
                required:'minimumAlphabetCount is required',
                type:'minimumAlphabetCount must be number'
            }
        },
        maximumAlphabetCount : {
            required:true,
            type:'number',
            messages:{
                required:'maximumAlphabetCount is required',
                type:'maximumAlphabetCount must be number'
            }
        },
        minimumDigitCount :  {
            required:true,
            type:'number',
            messages:{
                required:'minimumDigitCount is required',
                type:'minimumDigitCount must be number'
            }
        },
        maximumDigitCount : {
            required:true,
            type:'number',
            messages:{
                required:'maximumDigitCount is required',
                type:'maximumDigitCount must be number'
            }
        },
        allowIncorrectLoginAttempts : {
            required:true,
            type:'number',
            messages:{
                required:'allowIncorrectLoginAttempts is required',
                type:'allowIncorrectLoginAttempts must be number'
            }
        },
        minimumUpperCase : {
            required:true,
            type:'number',
            messages:{
                required:'minimumUpperCase is required',
                type:'minimumUpperCase must be number'
            }
        },
        minimumLowerCase : {
            required:true,
            type:'number',
            messages:{
                required:'minimumLowerCase is required',
                type:'minimumLowerCase must be number'
            }
        },
        unAcceptedKeywords : {
            required:true,
            type:'array',
            minItems:1,
            items:{
                type:'string',
                messages:{
                    type:"unAcceptedKeywords must be of string"
                },
            },
            messages:{
                required: 'unAcceptedKeywords is missing',
                type: 'unAcceptedKeywords must be of array type',
                minItems: 'unAcceptedKeywords must have at least one item'
            },
        },
        changePeriodDays : {
            required:true,
            type:'number',
            messages:{
                required:'changePeriodDays is required',
                type:'changePeriodDays must be number'
            }
        },
        lockTimeInMinutes : {
            required:true,
            type:'number',
            messages:{
                required:'lockTimeInMinutes is required',
                type:'lockTimeInMinutes must be number'
            }
        },
        errorMessage : {
            required:true,
            type:'string',
            messages:{
                required:'errorMessage is required',
                type:'errorMessage must be string'
            }
        }



    }

};



const fetchAllObject = {
  properties:{
      action:common.action,
      page: common.page
  }
};


module.exports = {
    createPasswordObject,
    updatePasswordObject,
    fetchAllObject

};