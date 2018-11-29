'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  value: {
    type: String,
    require: true
  },
  useCase: {
    type: String
  },
  label: {
    type: String
  },
  iconName: {
    type: String
  },
  type: {
    type: String
  },
  order: {
    type: Number
  },
  children: [
    {
      value: {
        type: String,
        require: true
      },
      labelName: {
        type: String
      },
      label: {
        type: String
      },
      displayMenu: {
        type: Boolean
      },
      type: {
        type: String
      },
      URI: [String],
      pageURI: {
        type: String
      },
      children: [
        {
          value: {
            type: String,
            require: true
          },
          labelName: {
            type: String
          },
          type: {
            type: String
          },
          label: {
            type: String
          },
          children: [
            {
              value: {
                type: String,
                require: true
              },
              type: {
                type: String
              },
              label: {
                type: String
              },
              labelName: {
                type: String
              },
              actionType: {
                type: String
              },
              iconName: {
                type: String
              },
              params: {
                type: String
              },
              URI: [String]
            }
          ]
        }
      ]
    }
  ]
});

schema.index({ useCase: 1, route: 1 }, { unique: true });
const Permission = mongoose.model('Permission', schema, 'Permission');

module.exports = Permission;
