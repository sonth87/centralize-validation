/**
 * VBI validator
 * version: 0.0.1
 * 
 *  validate by 
 * 
 * type : "string" | "number" | "phone" | "email" | "url" | "date" | "password"
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
 *    name: name: {
        rule: {
          require: {
            value: true,
            message: "Trường không được để trống"
          },
          min: {
            value: 5,
          },
          max: {
            value: 15,
            message: "Tên quá dài (15)"
          },
        },
        type: "string",
        label: "Họ tên",
      },
 *    emal: {type: "email"}
 * }
 * 
 */


/** 
 * Format date: dd-MM-YYYY hoặc 
                dd.MM.YYYY hoặc
                dd/MM/YYYY

  Password: Bao gồm cả chữ hoa, chữ thường, số, ký tự đặc biệt và ít nhất 4 kỹ tự
  CCCD - HC: 9 số với CMND, 12 số với CCCD, 1 ký tự và 7,8 chữ số với Hộ chiếu
*/
var REGEX = {
  email: /^[a-z][a-z0-9_.]{4,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$/gi,
  phone: /^(0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-9]|9[0-4|6-9])[0-9]{7}$/g,
  url: /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)/g,
  date: /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{4})$/g,
  password: /(?=(.*[0-9]))(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,.\/?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{4,}/g,
  cccd_hc: /^(([a-z][0-9]{7,8})|([0-9]{9})|([0-9]{10,12}))$/gi,
  empty: /^\s*$/,
};

(function() {
  "use strict";

  var MESSAGE = {
    empty: "Không được để trống",
    string_min: "%{label} phải nhiều hơn %{num} ký tự",
    string_max: "%{label} phải ít hơn %{num} ký tự",
    number_min: "%{label} phải lớn hơn %{num}",
    number_max: "%{label} phải nhỏ hơn %{num}",
    wrong_format: "%{label} không đúng định dạng",
  };

  var TYPE = ["string", "number", "phone", "email", "url", "date", "password", "cccd_hc", "age"];
  var PARAM = {
    message: "message",
    regex: "regex",
    value: "value",
    toDate: "toDate",
    type: "type"
  }

  var validate = function(formFields, rules) {
    return _.test(formFields, rules);
  };
  var _ = validate;


  _.extend = function(obj) {
    [].slice.call(arguments).forEach(function(source) {
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
    // validate all fields
    test: function(formFields, rules) {
      var testResult = { hasErrors: false, fields: {} }; // Ket qua test

      // loop in rules
      for (var fieldname in rules) {
        // init fields list in error result
        testResult.fields[fieldname] = [];

        // Field value
        var value = _.getFieldValue(formFields, fieldname);

        // List rule of this field
        var rulesOfField = rules[fieldname].hasOwnProperty("rule") ? rules[fieldname]["rule"] : undefined;

        // Test with field has value != undefined
        if (typeof value !== "undefined") {
          // is Required?
          var isRequired = _.isRequired(rulesOfField); // this field required or not

          // Field type
          var type = _.getFieldType(rules[fieldname]);

          // Field label
          var label = _.getParams(rules[fieldname]);

          var fieldContent = {
            label: label,
            type: type,

          };

          var formatTest;

          if (type) {
            switch (type) {
              case "email":
                formatTest = _.isEmail(value, rulesOfField, fieldContent);
                break;
              case "phone":
                formatTest = _.isPhone(value, rulesOfField, fieldContent);
                break;
              case "password":
                formatTest = _.isPassword(value, rulesOfField, fieldContent);
                break;
              case "url":
                formatTest = _.isUrl(value, rulesOfField, fieldContent);
                break;
              case "date":
                formatTest = _.isDate(value, rulesOfField, fieldContent);
                break;
              case "cccd_hc":
                formatTest = _.isCCCDHC(value, rulesOfField, fieldContent);
              default:
                break;
            }
          }

          if (formatTest) {
            testResult.hasErrors = true;
            testResult.fields[fieldname].push(formatTest);
          }

          if (rulesOfField) {
            Object.keys(rulesOfField).forEach(function(ruleName) {
              var ruleDetail = rulesOfField[ruleName];
              var result;

              switch (ruleName) {
                case "require":
                  result = _.validator.require(value, ruleDetail);
                  break;
                case "min":
                  result = _.validator.min(value, ruleDetail, fieldContent);
                  break;
                case "max":
                  result = _.validator.max(value, ruleDetail, fieldContent);
                  break;
                case "format":
                  result = _.validator.format(value, ruleDetail, fieldContent);
                  break;
                case "length":
                  result = _.validator.length(value, ruleDetail, fieldContent);
                  break;
                default:
                  break;
              };

              // is err if: all case with required, otherwise value not null
              if (result && (isRequired || (!isRequired && value.length > 0))) {
                testResult.hasErrors = true;
                testResult.fields[fieldname].push(result);
              }
            });
          }
        }
      }

      return testResult;
    },

    // get value from field (gia tri nhap)
    getFieldValue: function(formFields, fieldname) {
      if (!_.isObject(formFields) || !_.isString(fieldname)) return undefined;

      if (formFields.hasOwnProperty(fieldname)) return formFields[fieldname].trim(); // remove spaces
      return undefined;
    },

    // get field type (string, number, phone, email, ...)
    getFieldType: function(formFields) {
      if (!_.isObject(formFields)) return "string";

      if (formFields.hasOwnProperty("type") && TYPE.includes(formFields["type"]))
        return formFields["type"];
      return "string";
    },

    // get params of fields or rules (fields["message" | "regex" | "value"])
    getParams: function(fields, param) {
      try {
        return fields.hasOwnProperty(param) ? fields[param] : undefined;
      } catch (e) {
        return undefined;
      }
    },

    // render error message
    renderMessage: function(message, additions) {
      if (!_.isString(message)) return message;

      // find %{name} in message to replace
      var mReg = /(%?)%\{([^\}]+)\}/g;
      return message.replace(mReg, function(m0, m1, m2) {
        if (m1 === '%') return "%{" + m2 + "}";
        else return String(additions[m2] || "");
      });
    },
  });

  // validate data with rule
  _.validator = {
    // required field (value isn't empty)
    require: function(value, rule) {
      if (_.isEmpty(value)) return _.getParams(rule, PARAM.message) || MESSAGE.empty;
      return undefined;
    },

    /**
     *  value: value of field
     *  type: string | number
     */
    min: function(value, rule, field) {
      var length = _.getParams(rule, PARAM.value);
      if (!length || !_.isInteger(length) || length < 0) return undefined;

      var params = { num: length, label: _.getParams(field, "label") };

      if (field.type === "age") {
        if (!_.isAgeValid(value, rule, "min"))
          return _.renderMessage(_.getParams(rule, PARAM.message) || MESSAGE.number_min, params);
      } else if (field.type === "number") {
        if (!_.isNumber(value) || value < length)
          return _.renderMessage(_.getParams(rule, PARAM.message) || MESSAGE.number_min, params);
      } else if (field.type === "date") {
        // Date
      } else if (value && value.length < length)
        return _.renderMessage(_.getParams(rule, PARAM.message) || MESSAGE.string_min, params);

      return undefined;
    },

    /**
     *  value: value of field
     *  type: string | number | date
     */
    max: function(value, rule, field) {
      var length = _.getParams(rule, PARAM.value);
      if (!length || !_.isInteger(length) || length < 0) return undefined;

      var params = { num: length, label: _.getParams(field, "label") };

      if (field.type === "age") {
        if (!_.isAgeValid(value, rule, "max"))
          return _.renderMessage(_.getParams(rule, PARAM.message) || MESSAGE.number_min, params);
      } else if (field.type === "number") {
        if (!_.isNumber(value) || value > length)
          return _.renderMessage(_.getParams(rule, PARAM.message) || MESSAGE.number_max, params);
      } else if (field.type === "date") {
        // Date
      } else if (value && value.length > length)
        return _.renderMessage(_.getParams(rule, PARAM.message) || MESSAGE.string_max, params);
      return undefined;
    },

    length: function(value, rule, field) {
      var length = _.getParams(rule, PARAM.value);
      if (!length || !_.isInteger(length) || length < 0) return undefined;

      var params = { num: length, label: _.getParams(field, "label") };

      if (value && value.length !== length)
        return _.renderMessage(_.getParams(rule, PARAM.message) || MESSAGE.wrong_format, params);
    },

    /**
     *  value: value of field
     *  type: string | number
     */
    format: function(value, rule, field) {
      var regex = _.getParams(rule, PARAM.value) || _.getParams(rule, PARAM.regex) || undefined;
      if (!_.isString(value) || !regex) return undefined;

      var params = { label: _.getParams(field, "label") };

      var reg = new RegExp(regex);
      if (value && !reg.test(value))
        return _.renderMessage(_.getParams(rule, PARAM.message) || MESSAGE.wrong_format, params);

      return undefined;
    }
  };


  // Validate By Type
  _.extend(validate, {
    isEmail: function(value, rule, field) {
      var _rule = Object.assign(rule || {}, { regex: REGEX.email });
      return _.validator.format(value, _rule, field);
    },

    isPhone: function(value, rule, field) {
      var _rule = Object.assign(rule || {}, { regex: REGEX.phone });
      return _.validator.format(value, _rule, field);
    },

    isUrl: function(value, rule, field) {
      var _rule = Object.assign(rule || {}, { regex: REGEX.url });
      return _.validator.format(value, _rule, field);
    },

    isDate: function(value, rule, field) {
      var _rule = Object.assign(rule || {}, { regex: REGEX.date });
      return _.validator.format(value, _rule, field);
    },

    isPassword: function(value, rule, field) {
      var _rule = Object.assign(rule || {}, { regex: REGEX.password });
      return _.validator.format(value, _rule, field);
    },

    isCCCDHC: function(value, rule, field) {
      var _rule = Object.assign(rule || {}, { regex: REGEX.cccd_hc });
      return _.validator.format(value, _rule, field);
    },

    /**
     * Tính tuổi hợp lệ
     * value: input value
     * type: "min" | "max"
     */
    isAgeValid: function(value, rule, type) {
      // Get target date to check age
      const dayCompare = _.getParams(rule, PARAM.toDate);

      // Expected age
      const expect_age = _.getParams(rule, PARAM.value);

      // get type (d: day, m: month, y: year)
      const checkType = _.getParams(rule, PARAM.type);
      var actual_age = _.getAgeByDob(value, dayCompare, checkType);

      console.log(actual_age, expect_age, checkType, dayCompare);
      if (actual_age >= 0) {
        if (type === "min")
          return expect_age <= actual_age;
        else if (type === "max")
          return expect_age >= actual_age;
      }

      return false;
    },
  });


  // Check object is a valid type
  _.extend(validate, {
    isRequired: function(rule) {
      return rule && typeof rule["require"] !== "undefined" ? _.getParams(rule["require"], "value") || false : false;
    },

    isObject: function(obj) {
      return obj === Object(obj);
    },

    isString: function(value) {
      return typeof value === 'string';
    },

    isNumber: function(value) {
      return typeof value === 'number' || (!isNaN(value) && !isNaN(parseFloat(value)));
    },

    isInteger: function(value) {
      return _.isNumber(value) && value % 1 === 0;
    },

    isFunction: function(value) {
      return typeof value === 'function';
    },

    isBoolean: function(value) {
      return typeof value === 'boolean';
    },

    isDateTime: function(value) {
      var reg = new RegExp(REGEX.date);
      return value instanceof Date || reg.test(value);
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
      if (this.isDateTime(value)) return false;

      return false;
    },
  });


  /**
   * Lấy số tuổi theo ngày sinh và ngày hiệu lực theo ngày, tháng, năm
   * @param {string} day string: date Ngày sinh
   * @param {string} dayCompare string: date Ngày hiệu lực ( default = today )
   * @param {'d' | 'm' | 'y'} checkType string: d, m, y
   * @returns number of d|m|y
   */
  _.getAgeByDob = function(day, dayCompare, checkType) {
    var reg = new RegExp(REGEX.date);
    if (!day || !reg.test(day)) return null;

    checkType = checkType ? checkType : "y";

    var today = new Date();
    var datearray = day.split("/");
    var newdate = datearray[1] + '/' + datearray[0] + '/' + datearray[2];
    var newDayCompare = dayCompare ? dayCompare.split("/") : null;
    var dob = new Date(newdate);
    var ngayCheck = dayCompare ? new Date(newDayCompare[1] + '/' + newDayCompare[0] + '/' + newDayCompare[2]) : today;

    if (checkType.toLowerCase() == 'd') {
      var result = Math.floor((ngayCheck - dob) / (24 * 60 * 60 * 1000));
      return isNaN(result) ? null : result;
    }
    if (checkType.toLowerCase() == 'm') {
      var months;
      months = (ngayCheck.getFullYear() - dob.getFullYear()) * 12;
      months -= dob.getMonth();
      months += ngayCheck.getMonth();
      return isNaN(months) ? null : months;
    }
    if (checkType.toLowerCase() == 'y') {
      var result = Math.floor((ngayCheck - dob) / (365.25 * 24 * 60 * 60 * 1000));
      return isNaN(result) ? null : result;
    }

    return 0;
  };

  validate.exposeModule(validate, this);
}).call(this);
