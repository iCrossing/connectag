(function() {
  var I2A;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  I2A = (function() {
    __extends(I2A, ConnecTag.classes.Plugin);
    I2A.id = "I2A";
    function I2A() {
      this.initialized = false;
    }
    I2A.prototype.track = function(settings, instances) {
      var instance;
      instance = instances[0];
      this.executeCommands(instance.commands, instance.id);
      if (typeof pixel !== "function") {
        return this.helpers.getScript(settings.path);
      }
    };
    I2A.prototype.methods = (function() {
      var getPropertyHandler, m, properties, property, _i, _len;
      m = {};
      properties = ['pageAction', 'price', 'sku', 'order_code', 'user_defined1', 'user_defined2', 'user_defined3', 'user_defined4', 'currency_id', 'ic_bu', 'ic_bc', 'ic_ch', 'ic_nso', 'altid', 'ic_cat', 'ic_type', 'client_id', 'domain_id', 'campaign_id'];
      getPropertyHandler = function(property) {
        return function(value) {
          if (typeof value === "string") {
            value = "'" + value + "'";
          }
          return new Function("" + property + " = " + value)();
        };
      };
      for (_i = 0, _len = properties.length; _i < _len; _i++) {
        property = properties[_i];
        m[property] = getPropertyHandler(property);
      }
      m.pixel_conversion = function(pageAction) {
        return window.pixel_conversion(pageAction);
      };
      return m;
    })();
    return I2A;
  })();
  ConnecTag.classes.plugins.I2A = I2A;
}).call(this);
