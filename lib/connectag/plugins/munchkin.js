(function() {
  var Munchkin;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Munchkin = (function() {
    __extends(Munchkin, ConnecTag.classes.Plugin);
    Munchkin.id = "Munchkin";
    function Munchkin() {
      this.initialized = false;
    }
    Munchkin.prototype.initialize = function(settings, callback) {
      return this.helpers.getScript("" + window.location.protocol + "//munchkin.marketo.net/munchkin.js", callback);
    };
    Munchkin.prototype.track = function(settings, instances) {
      var instance;
      if (!this.initialized) {
        this.initialize(settings, __bind(function() {
          this.initialized = true;
          return this.track(settings, instances);
        }, this));
        return;
      }
      instance = instances[0];
      return this.executeCommands(instance.commands, instance.id);
    };
    Munchkin.prototype.methods = {
      init: function(accountId) {
        return window.Munchkin.init(accountId);
      }
    };
    return Munchkin;
  })();
  ConnecTag.classes.plugins.Munchkin = Munchkin;
}).call(this);
