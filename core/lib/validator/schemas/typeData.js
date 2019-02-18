'use strict';

const common = require('./common');

const userTypeCodeEnum = ['SDG', 'Settlement', 'Entity', 'Acquirer'];

const userSubtypes = {
  properties: {
    action: common.action,
    userTypeCode: {
      required: true,
      type: 'string',
      enum: userTypeCodeEnum,
      messages: {
        required: 'userTypeCode is missing',
        type: 'Please choose a valid User type',
        enum: 'Please choose a valid User type'
      }
    }
  }
};


const typeName = {
    properties: {
        action: common.action,
        page: common.page,
        searchCriteria: {
            type: 'object',
            required: true,
            properties: {
                typeName: {
                    required: false,
                    type: 'string',
                    messages: {
                        required: 'typeName is missing',
                        type: 'typeName must be of string type'
                    }
                }
            },
            messages: {
                required: 'searchCriteria is missing',
                type: 'searchCriteria must be of object type'
            }
        }

    }
};


const ObjectData = {
    properties: {
        action: common.action,
        typeDataId: {
            type: 'string',
            required: true,
            messages: {
                required: 'typeDataId is missing',
                type: 'typeDataId must be of string type'
            }
        }

    }
};


const  insertData = {

    properties:{
        action:common.action,
        typeName:{
            required:true,
            type:'string',
            messages:{
                required:"typeName is required",
                type:"typeName must be string"
            }
        },
        typeNameDetails:{
            required:true,
            type: 'array',
            minItems: 1,
            messages: {
                required: 'typeNameDetails is missing',
                type: 'typeNameDetails must be of array type'
            }
        }

    }

};



const updateData = {
    properties:{
        action:common.action,
        id:{
            required:true,
            type:"string",
            messages:{
                required:"id is required",
                type:"id must be string"
            }
        },
        typeName:{
            required:true,
            type:'string',
            messages:{
                required:"typeName is required",
                type:"typeName must be string"
            }
        },
        typeNameDetails:{
            required: true,
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                properties: {
                    label: {
                        type: 'string',
                        required: true,
                        messages: {
                            required: 'label is missing',
                            type: 'label must be of string type'
                        }
                    },
                    value: {
                        type: 'string',
                        required: true,
                        messages: {
                            required: 'value is missing',
                            type: 'value must be of string type'
                        }
                    },
                    messages: {
                        type: 'items must be of object type'
                    }
                }
            },
            messages: {
                required: 'typeNameDetails is missing',
                type: 'typeNameDetails must be of array type',
                minItems: 'typeNameDetails must have at least one item'
            }
        }
    }
};


module.exports = {
    userSubtypes,
    typeName,
    ObjectData,
    insertData,
    updateData
};
