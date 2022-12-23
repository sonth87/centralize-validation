/**
 * 
 *  validate theo 
 * 
 * type : "string" | "number" | "phone" | "email" | "url" | "date"
 * min, max, length, match : [rule, error_message]
 * require : true | false
 * date format (nếu là string, nếu là objectdate thì bỏ qua)
 * 
 * Ex: 
 * 
 * Form fields : var field = { name: "sonth", email: "sonth@abc.abc" };
 * 
 * Rule : 
 * var rule = { 
 * 		name: {require: true, type: "string", min: [5, "Tên quá ngắn"], max: [15, "Tên quá dài"], 
 * 		emal: {type: "email"}
 * }
 * 
 */


var REGEX = {
  email: /^[a-z][a-z0-9_.]{5,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$/,
  phone: /^(0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/,
  empty: /^\s*$/,
};

(function() {
  "use strict";

  var validate = function(formFields, rules) {
    // options = v.extend({}, v.options, options);
    console.log('start test with : ', formFields, rules);

    _.test(formFields, rules);
  };
  var _ = validate;


  _.extend = function(obj) {
    [].slice.call(arguments, 1).forEach(function(source) {
      for (var attr in source) {
        obj[attr] = source[attr];
      }
    });
    return obj;
  };

  _.extend(validate, {
    exposeModule: function(validate, root) {
      root.validate = validate;
    },
  });

  _.extend(validate, {
    test: function(formFields, rules) {
      for (var fieldname in rules) {
        console.log('rule for field : ', fieldname, formFields);

        var value = _.getFieldValue(formFields, fieldname);

        
      }
    },

    getFieldValue: function(formFields, fieldname) {
      if (!_.isObject(formFields) || !_.isString(fieldname)) return undefined;

      if(formFields.hasOwnProperty(fieldname)) return formFields[fieldname];
      return undefined;
    },


  });


  // Check object is a valid type
  _.extend(validate, {
    isObject: function(obj) {
      return obj === Object(obj);
    },

    isString: function(value) {
      return typeof value === 'string';
    },

    isNumber: function(value) {
      return typeof value === 'number' && !isNaN(value);
    },

    isInteger: function(value) {
      return v.isNumber(value) && value % 1 === 0;
    },

    isFunction: function(value) {
      return typeof value === 'function';
    },

    isBoolean: function(value) {
      return typeof value === 'boolean';
    },

    isDate: function(value) {
      return value instanceof Date;
    },

    isEmpty: function(value) {
      var attr;

      // If NULL | Undefined
      if (value === null || value === undefined) return true;

      // If not a function
      if (this.isFunction(value)) return false;

      // string with space only
      if (this.isString(value)) return REGEX.empty.test(value);

      // array without length
      if (this.isArray(value)) return value.length === 0;

      // Dates have no attributes but aren't empty
      if (this.isDate(value)) return false;

      return false;
    },
  });

  validate.exposeModule(validate, this);
}).call(this);

///////////////////////////////////////////////////////////////
var field = { name: "sonth", email: "sonth@abc.abc" };
var rule = {
  name: {
    require: true,
    min: [5, "Tên quá ngắn"],
    max: [15, "Tên quá dài"],
    type: "string",
  },
  email: {
  	type: "email"
  },
  phone: {
    length: [10, "Số điện thoại không hợp lệ"],
    type: "phone"
  },
  text: {
  	type: "string",
  	match: [/[0-9a-zA-Z]/, ]
  }
};
validate(field, rule)