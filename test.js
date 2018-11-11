'use strict';
const objectMapper = require('object-mapper');
let customFunctions = require('./core/Common/customFunctions.js');
let validationFunctions = require('./core/Common/validationFunctions.js');
let flatten = require('flat');
let unflatten = require('flat').unflatten;
let Schema = require('validate');
function test(value) {
  return new Promise((resolve,reject) => {
    console.log(value)
    return resolve(value + "_foo");
  }); 
}
function foo() {
  let map = {
    "foo.bar": [
      {
        key: "foo.a.a",
        transform: (value) => {
          return test(value);
        }
      },
      {
        key: "baz",
        transform: function (value) {
          return value + "_baz";
        }
      }
    ],
    "bar": "bar"
  };

  let src = {
    foo: { bar: 'blah' },
    bar: 'something'
  };

  let srcd = {
    "foo.bar": { bar: 'blah' },
    bar: 'something'
  };

  
  let dest = objectMapper(src, map);

  let data2=unflatten(srcd);

  let data=flatten(src);
  console.log(JSON.stringify(data2));
  console.log(JSON.stringify(data));
  
}

foo();
