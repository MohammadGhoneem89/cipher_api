'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  value: {
    type: String,
    require: true
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

const Permission = mongoose.model('Permission', schema, 'Permission');

module.exports = Permission;
