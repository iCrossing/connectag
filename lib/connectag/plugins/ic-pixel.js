(function() {
  var ICPixel;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  ICPixel = (function() {
    __extends(ICPixel, ConnecTag.classes.Plugin);
    ICPixel.id = "ICPixel";
    function ICPixel() {
      this.initialized = false;
    }
    ICPixel.prototype.track = function(settings, instances) {
      var instance, protocol, scriptUrl;
      instance = instances[0];
      protocol = window.location.protocol;
      if (window.IC == null) {
        window.IC = {};
      }
      if (settings.host != null) {
        scriptUrl = "" + protocol + "//" + settings.host + "/" + settings.path;
      } else {
        scriptUrl = settings.path;
      }
      this.executeCommands(instance.commands, instance.id);
      if (!this.initialized) {
        return this.helpers.getScript(scriptUrl, __bind(function() {
          return this.initialized = true;
        }, this));
      }
    };
    ICPixel.prototype.methods = (function() {
      var getPropertyHandler, m, properties, property, _i, _len;
      m = {};
      properties = ['pageAction', 'sale', 'price', 'sku', 'order_code', 'user_defined1', 'user_defined2', 'user_defined3', 'user_defined4', 'currency_id', 'ic_ch', 'client_id', 'domain_id'];
      getPropertyHandler = function(property) {
        return function(value) {
          return window.IC[property] = value;
        };
      };
      for (_i = 0, _len = properties.length; _i < _len; _i++) {
        property = properties[_i];
        m[property] = getPropertyHandler(property);
      }
      m.pixel = function() {
        return window.IC.pixel();
      };
      return m;
    })();
    return ICPixel;
  })();
  ConnecTag.classes.plugins.ICPixel = ICPixel;
}).call(this);
