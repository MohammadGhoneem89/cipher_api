'use strict';
var validator = require("validator");
var pointer = require("json-pointer");

module.exports = {
  "formValidate": function (data, rules, callback) {
    var errorData = {};
    var flag = true;
    data = data || {};
    rules = rules || {};

    function capitalize(str) {
      return str.substr(0, 1).toUpperCase() + str.substr(1);
    }

    for (var x in rules) {

      var val = "";
      var n = x.indexOf("[]");
      if (n == -1) {
        val = pointer.get(data, x);
        var ret = validateSingle(rules, data, x, val, -1);
        if (ret != "") {
          pointer.set(data, x, ret);
          pointer.set(errorData, x, pointer.get(data, x));
        }

      }
      else {
        var a = x.substr(0, n);
        val = pointer.get(data, a);
        for (var j = 0; j < val.length; j++) {
          var x1 = x.replace("[]", "/" + j + "");
          val = pointer.get(data, x1);
          var ret = validateSingle(rules, data, x, val, j);
          if (ret != "") {
            pointer.set(data, x1, ret);
            pointer.set(errorData, x1, pointer.get(data, x1));
          }

        }
      }

    }

    callback(errorData);
  }
}

function validateSingle(rules, data, x, val) {
  var error = ""
  let regex='';
  if (rules[x]["required"] && (typeof val == "undefined" || val == null || val == "")) {
    error += "Value is Required,";
  }

  if (rules[x]["email"]) {
    regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (val != "") {
      if (!regex.test(val)) {
        error += "Invalid Email";
      }
    }
  }
  if (rules[x]["name"]) {
    regex = /^([a-zA-Z0-9_-]){2,50}$/;
    if (!regex.test(val)) {
      error += "Value must be AlphaNumeric min character 2";
    }
  }
  if (rules[x]["IP"]) {
    regex = /^(([0-9][0-9]?|[0-1][0-9][0-9]|[2][0-4][0-9]|[2][5][0-5])\\.){3}([0-9][0-9]?|[0-1][0-9][0-9]|[2][0-4][0-9]|[2][5][0-5])$/;
    if (!regex.test(val)) {
      error += "IP is not Valid";
    }

  }
  if (rules[x]["port"]) {
    regex = /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;
    if (!regex.test(val)) {
      error += "Port is not Valid";
    }
  }
  if (rules[x]["minLength"] && !validator.isLength(val, rules[x]["minLength"])) {
    error += "Minimum length must be " + rules[x]["minLength"];
  }
  if (rules[x]["maxLength"] && !validator.isLength(val, 0, rules[x]["maxLength"])) {
    error += "Minimum length must be " + rules[x]["maxLength"];
  }
  if (rules[x]["number"] && !parseFloat(val)) {
    error += "Value must be number";
  }

  return error ? error : "";
}
