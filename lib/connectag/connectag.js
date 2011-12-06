(function() {
  /**
  # ConnecTag
  # Copyright 2010 iCrossing, Inc
  # Released under the LGPL license, see COPYING, COPYING.LESSER and LICENSE
  # 
  # ConnecTag is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License or any later version.
  # ConnecTag is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTIBILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
  # You have received a copy of the GNU Lesser General Public License along with ConnecTag or see http://www.gnu.org/licenses/.
  # You are not required to accept this license since you have not signed it.  However, nothing else grants you permission to modify or distribute ConnecTag or its derivative works.  These actions are prohibited by law if you do not accept this license.  Therefore, by modifying or distributing ConnecTag (or any work based on ConnecTag), you indicate your acceptance of this license to do so, and all its terms and conditions for copying, distributing or modifying ConnecTag or works based on it.
  # 
  # Version 0.9.4
  */
  var ConnecTag, Plugin, buildCommands, buildMatchData, clone, extend, has, isArray, isCloneable, isNull, isPlainObject, loadPlugins, match, modifyCommands, pluginLoaded, toRegExp, toString, typeOf;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty;
  has = function(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  toString = function(object) {
    return Object.prototype.toString.call(object);
  };
  /**
  # Identify an object as safe for recursive cloning
  # @param object Object to test
  # @return {boolean}
  */
  isCloneable = function(object) {
    return isPlainObject(object) || isArray(object);
  };
  /**
  # Identify null (using identity comparison)
  # @param object Object to test
  # @return {boolean}
  */
  isNull = function(object) {
    return object === null;
  };
  /**
  # Identify an array (using toString or native isArray)
  # @param object Object to test
  # @return {boolean}
  */
  isArray = function(object) {
    if (Array.isArray) {
      return Array.isArray(object);
    } else {
      return toString(object) === "[object Array]";
    }
  };
  /**
  # Identify a plain object (not an html element, window, or a non-object)
  # @param object Object to test
  # @return {boolean}
  */
  isPlainObject = function(object) {
    var key;
    if (typeOf(object) !== "object" || (object.nodeType != null) || object === window) {
      return false;
    }
    if (object.constructor && has(object, "constructor") && has(object.constructor.prototype, "isPrototypeOf")) {
      return false;
    }
    for (key in object) {
      key;
    }
    return key === void 0 || has(object, key);
  };
  /**
  # Native typeof with "corrected" values for array and null
  # @param object Object to test
  # @return {string}
  */
  typeOf = function(object) {
    if (isArray(object)) {
      return "array";
    } else {
      if (isNull(object)) {
        return "null";
      } else {
        return typeof object;
      }
    }
  };
  /**
  # Extend an object or array with properties of the others, recursive/clones if deep is true
  # @param {boolean} [deep]
  # @param {object|array} target
  # @param {object|array} source
  # @return {object|array}
  */
  extend = function() {
    var args, deep, prop, source, target, value, _i, _len;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    deep = typeOf(args[0]) === "boolean" ? args.shift() : false;
    target = args.shift();
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      source = args[_i];
      if (isCloneable(source)) {
        for (prop in source) {
          value = source[prop];
          if (deep && isCloneable(value)) {
            if (typeOf(target[prop]) === typeOf(value)) {
              target[prop] = extend(true, target[prop], value);
            } else {
              target[prop] = clone(value);
            }
          } else {
            target[prop] = value;
          }
        }
      }
    }
    return target;
  };
  /**
  # Recursively clone an object or array
  # @param object
  # @return {object|array}
  */
  clone = function(object) {
    var target;
    if (isCloneable(object)) {
      target = isArray(object) ? [] : {};
      return extend(true, target, object);
    } else {
      return object;
    }
  };
  /**
  # Convert a string or array of string|numbers to a RegExp
  # @param {array|string|number} patterns
  # @return {RegExp}
  */
  toRegExp = function(patterns) {
    var regex, _ref;
    regex = /$.+^/;
    patterns = isArray(patterns) ? patterns.join("|") : patterns;
    if ((_ref = typeOf(patterns)) === "number" || _ref === "string") {
      try {
        regex = new RegExp(patterns);
      } catch (_e) {}
    }
    return regex;
  };
  /**
  # Build a matchData object from specified matchers/matcher data
  # @private
  # @param {array} matchers
  # @return {object}
  */
  buildMatchData = function(matchers) {
    var key, matchData, matcher, _i, _len, _ref;
    matchData = {};
    if (matchers.length === 0) {
      _ref = ConnecTag.matchers;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        matchData[key] = void 0;
      }
    } else if (matchers.length > 0) {
      for (_i = 0, _len = matchers.length; _i < _len; _i++) {
        matcher = matchers[_i];
        if (typeOf(matcher) === "string") {
          matchData[matcher] = void 0;
        } else if (typeOf(matcher) === "object") {
          for (key in matcher) {
            if (!__hasProp.call(matcher, key)) continue;
            matchData[key] = matcher[key];
          }
        }
      }
    }
    return matchData;
  };
  /**
  # Recursivly process matching nested instances
  # @param {array} commands Array of command objects
  # @param {object} matchData MatchData object from buildMatchData
  # @param {object} instance Tag instance
  # @return {array}
  */
  buildCommands = function(commands, matchData, instance) {
    var inst, _i, _len, _ref;
    if (match(instance.match, matchData)) {
      commands = modifyCommands(commands, instance.commands);
      if (instance.instances) {
        _ref = instance.instances;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          inst = _ref[_i];
          commands = buildCommands(commands, matchData, inst);
        }
      }
    }
    return commands;
  };
  /**
  # Alter the given commands array by applying modifier methods and data to it
  # @param {array} commands Array of command objects
  # @param {object} modifiers Command modifier object
  # @return {array}
  */
  modifyCommands = function(commands, modifiers) {
    var data, modifier;
    if (isArray(modifiers)) {
      return modifiers;
    }
    for (modifier in modifiers) {
      if (!__hasProp.call(modifiers, modifier)) continue;
      data = modifiers[modifier];
      if (ConnecTag.modifiers[modifier]) {
        commands = ConnecTag.modifiers[modifier](commands, data);
      }
    }
    return commands;
  };
  /**
  # Execute matchers against matchPatterns and matchData
  # @private
  # @param {object} matchPatterns
  # @param {object} matchData
  # @return {boolean}
  */
  match = function(patterns, data) {
    var key, matcher;
    for (key in data) {
      if (!__hasProp.call(data, key)) continue;
      matcher = ConnecTag.matchers[key];
      if (matcher && matcher(patterns[key], data[key])) {
        return true;
      }
    }
    return false;
  };
  /**
  # Check if plugin has been loaded
  # @private
  # @param {String} id
  # @return {Boolean}
  */
  pluginLoaded = function(id) {
    return (ConnecTag.plugins[id] != null) || (ConnecTag.classes.plugins[id] != null);
  };
  /**
  # Load plugins and execute callback when complete
  # @private
  # @param {Function} callback
  */
  loadPlugins = function(callback) {
    var callbackHandler, count, tag, tags, _i, _len, _results;
    if (callback == null) {
      callback = function() {};
    }
    tags = ConnecTag.data.tags;
    count = tags.length;
    callbackHandler = function() {
      if (--count === 0) {
        return callback();
      }
    };
    _results = [];
    for (_i = 0, _len = tags.length; _i < _len; _i++) {
      tag = tags[_i];
      _results.push(pluginLoaded(tag.plugin.id) ? callbackHandler() : ConnecTag.helpers.getScript(tag.plugin.path, callbackHandler));
    }
    return _results;
  };
  ConnecTag = {
    /**
        # @param {object} params
        # @param {string} [params.json] Path to configuration JSON or JSONP
        # @param {string} [params.script] Path to configuration script
        # @param {string} [params.data] Configuration object
        # @param {boolean} [params.replaceDocWrite] Replace document.write?
        # @param {function} [params.callback] Callback function executed when initialize is complete
        */
    initialize: function(params) {
      var callback, settings;
      settings = extend({
        data: null,
        script: null,
        json: null,
        replaceDocWrite: true,
        callback: function() {}
      }, params);
      if (settings.replaceDocWrite) {
        window.document.write = ConnecTag.helpers.documentWrite;
      }
      callback = settings.callback;
      settings.callback = function() {
        return loadPlugins(callback);
      };
      if (settings.data) {
        ConnecTag.data = settings.data;
        settings.callback();
      } else if (settings.json) {
        ConnecTag.helpers.getJson(settings.json, function(data) {
          ConnecTag.data = data;
          return settings.callback();
        });
      } else if (settings.script) {
        ConnecTag.data = {};
        ConnecTag.helpers.getScript(settings.script, function() {
          return settings.callback();
        });
      }
    },
    /**
    # Call initialize and then call track all when complete
    # @param {object} params Params is passed to initialize (with the exception of callback)
    */
    connect: function(params) {
      if (params == null) {
        params = {};
      }
      params.callback = ConnecTag.track;
      return ConnecTag.initialize(params);
    },
    /**
    # Track against specified matchers
    # @param {string|object} Any number of these
    */
    track: function() {
      var args, getPluginHandler, i, instance, instances, j, matchData, tag, _len, _len2, _ref, _ref2, _ref3, _results;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      instances = [];
      matchData = buildMatchData(args);
      getPluginHandler = function(tag) {
        return function() {
          var id, plugin;
          id = tag.plugin.id;
          if (ConnecTag.plugins[id] != null) {
            plugin = ConnecTag.plugins[id];
          } else if (ConnecTag.classes.plugins[id] != null) {
            plugin = ConnecTag.plugins[id] = new ConnecTag.classes.plugins[id]();
          } else {
            return;
          }
          if (plugin) {
            return plugin.track(tag.settings, tag.instances);
          } else {
            return setTimeout(getPluginHandler(tag), 500);
          }
        };
      };
      _ref = ConnecTag.data.tags;
      _results = [];
      for (i = 0, _len = _ref.length; i < _len; i++) {
        tag = _ref[i];
        tag = clone(tag);
        if ((_ref2 = tag.settings) == null) {
          tag.settings = {};
        }
        instances = [];
        _ref3 = tag.instances;
        for (j = 0, _len2 = _ref3.length; j < _len2; j++) {
          instance = _ref3[j];
          instance.id = "T" + i + "I" + j;
          if (match(instance.match, matchData)) {
            instance.commands = buildCommands(instance.commands, matchData, instance);
            instances.push(instance);
          }
        }
        tag.instances = instances;
        _results.push(tag.instances.length ? pluginLoaded(tag.plugin.id) ? getPluginHandler(tag)() : ConnecTag.helpers.getScript(tag.plugin.path, getPluginHandler(tag)) : void 0);
      }
      return _results;
    },
    /**
    # Set up a callback/timeout for exit links
    # @param {string|object} object
    # @param {number} delay
    # @return {object}
    */
    exit: function(object, delay) {
      var callback, url, _ref;
      if (delay == null) {
        delay = 500;
      }
      if (object) {
        if (typeOf(object) === "string") {
          url = object;
        } else if ((_ref = object.target) != null ? _ref.href : void 0) {
          url = object.target.href;
        } else if (object.href) {
          url = object.href;
        }
      }
      callback = url ? function() {
        return window.location = url;
      } : function() {};
      return {
        track: function() {
          ConnecTag.track.apply(ConnecTag, arguments);
          window.setTimeout(callback, delay);
          return false;
        }
      };
    },
    /**
    # Configuration data
    # @type {object}
    */
    data: {},
    /**
    # Object to store vendor plugin instances
    # @type {object}
    */
    plugins: {},
    /**
    # Object to store ConnecTag classes
    # @type {object}
    */
    classes: {
      plugins: {}
    },
    /**
    # Object to store dynamic variables set on the page
    # @type {object}
    */
    values: {},
    /**
    # Modifier namespace for functions that modify a commands array
    # @namespace
    */
    modifiers: (function() {
      var insert, xable;
      xable = function(action, commands, data) {
        var command, id, _i, _j, _len, _len2;
        data = isArray(data) ? data : [data];
        for (_i = 0, _len = commands.length; _i < _len; _i++) {
          command = commands[_i];
          for (_j = 0, _len2 = data.length; _j < _len2; _j++) {
            id = data[_j];
            if (command.id === id) {
              command.disabled = action === "disable";
            }
          }
        }
        return commands;
      };
      insert = function(position, commands, data) {
        var command, i, id, offset, payload, _len;
        offset = position === "before" ? 0 : 1;
        for (id in data) {
          if (!__hasProp.call(data, id)) continue;
          payload = data[id];
          payload = isArray(payload) ? payload : [payload];
          for (i = 0, _len = commands.length; i < _len; i++) {
            command = commands[i];
            if (command.id === id) {
              commands = commands.slice(0, i + offset).concat(payload, commands.slice(i + offset));
              break;
            }
          }
        }
        return commands;
      };
      return {
        disable: function(commands, data) {
          return xable("disable", commands, data);
        },
        enable: function(commands, data) {
          return xable("enable", commands, data);
        },
        before: function(commands, data) {
          return insert("before", commands, data);
        },
        after: function(commands, data) {
          return insert("after", commands, data);
        },
        append: function(commands, data) {
          return commands.concat(isArray(data) ? data : [data]);
        },
        prepend: function(commands, data) {
          return (isArray(data) ? data : [data]).concat(commands);
        }
      };
    })(),
    /**
    # Helpers namespace for helper functions
    # The helper functions can be overridden in the snippet if you have a more efficient or better implementation... and you probably do.
    # For example, you could replace getScript with a wrapper around jQuery's getScript or replace parseJson with a wrapper around Crockford's JSON.parse.
    # @namespace
    */
    helpers: {
      /**
      # Parse a string template
      # @param {string} template
      # @param {object} context
      */
      parseTemplate: function(template, context) {
        var match, matches, name, pattern, regExact, regGlobal, _i, _len;
        pattern = '\\$\\{[^\\}]+\\}';
        regGlobal = new RegExp(pattern, 'g');
        regExact = new RegExp('^' + pattern + '$');
        if (typeOf(template) === "string") {
          matches = template.match(regGlobal);
          if (matches) {
            for (_i = 0, _len = matches.length; _i < _len; _i++) {
              match = matches[_i];
              name = match.replace(/^\$\{|\}$/g, '');
              if (regExact.test(template)) {
                template = context[name];
                break;
              } else {
                template = template.replace(match, context[name]);
              }
            }
          }
        }
        return template;
      },
      /**
      # Load a script
      # @param {string} url
      # @param {function} [callback]
      */
      getScript: function(url, callback) {
        var body, complete, script;
        if (callback == null) {
          callback = function() {};
        }
        body = window.document.getElementsByTagName('body')[0];
        script = window.document.createElement('script');
        script.type = "text/javascript";
        script.src = url;
        complete = function() {
          callback();
          return body.removeChild(script);
        };
        body.appendChild(script);
        if (script.readyState && (script.onload != null)) {
          return script.onreadystatechange = function() {
            if (script.readyState === "loaded" || script.readyState === "completed") {
              complete();
              return script.onreadystatechange = null;
            }
          };
        } else {
          return script.onload = function() {
            complete();
          };
        }
      },
      /**
      # Get an instance of XMLHttpRequest or ActiveXObject
      # @return {XMLHttpRequest|ActiveXObject}
      */
      getXMLHttpRequest: function() {
        var msxml, msxmls, xhr, _i, _len;
        msxmls = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP"];
        if (window.XMLHttpRequest) {
          xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
          for (_i = 0, _len = msxmls.length; _i < _len; _i++) {
            msxml = msxmls[_i];
            try {
              xhr = new ActiveXObject(msxml);
            } catch (_e) {}
          }
        }
        return xhr;
      },
      /**
      # document.write replacement
      # If you would like to preserve document.write functionality override this helper with document.write
      # before calling ConnecTag.initialize/connect. We replace document.write because we're changing the
      # conditions under which vendor tags are loading and there's a possibility that they may call
      # document.write.
      */
      documentWrite: function() {},
      /**
      # Load JSON
      # @param {string} url
      # @param {function} callback
      */
      getJson: function(url, callback) {
        var jsonpFn, jsonpUrl, request;
        if (callback == null) {
          callback = function() {};
        }
        jsonpFn = "jsonp_" + (new Date().getTime());
        jsonpUrl = url.replace(/([^\&\?]*=)(\?)/, "$1" + jsonpFn);
        if (url !== jsonpUrl) {
          window[jsonpFn] = callback;
          return ConnecTag.helpers.getScript(jsonpUrl, function() {
            window[jsonpFn] = null;
            try {
              return delete window[jsonpFn];
            } catch (_e) {}
          });
        } else {
          request = ConnecTag.helpers.getXMLHttpRequest();
          request.open("GET", url, true);
          request.onreadystatechange = function() {
            if (request.readyState === 4 && request.status === 200) {
              return callback(ConnecTag.helpers.parseJson(request.responseText));
            }
          };
          return request.send(null);
        }
      },
      /**
      # Parse a json string to an object
      # @param {string} jsonString
      # @return {object|array}
      */
      parseJson: function(jsonString) {
        if (window.JSON && window.JSON.parse) {
          return JSON.parse(jsonString);
        } else if (!/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(jsonString.replace(/"(\\.|[^"\\])*"/g, ''))) {
          return eval('(' + jsonString + ')');
        } else {
          throw new SyntaxError('JSON syntax error');
        }
      }
    },
    /**
    # Matchers namespace for functions that check whether a tag instance or transformer executes
    # @namespace
    */
    matchers: (function() {
      var getLocationHandler, loc, locations, matchers, _i, _len;
      locations = ['hash', 'host', 'hostname', 'href', 'pathname', 'search', 'protocol', 'port'];
      getLocationHandler = function(property) {
        return function(pattern, values) {
          var value, _i, _len;
          pattern = toRegExp(pattern);
          values || (values = window.location[property]);
          values = isArray(values) ? values : [values];
          for (_i = 0, _len = values.length; _i < _len; _i++) {
            value = values[_i];
            if (pattern.test(value)) {
              return true;
            }
          }
          return false;
        };
      };
      matchers = {
        /**
            # Match against an event or array of event
            # @param {string} pattern
            # @param {string|array} values
            # @return {boolean}
            */
        event: function(pattern, values) {
          var value, _i, _len;
          pattern = toRegExp(pattern);
          values = isArray(values) ? values : [values];
          for (_i = 0, _len = values.length; _i < _len; _i++) {
            value = values[_i];
            if (pattern.test(value)) {
              return true;
            }
          }
          return false;
        },
        /**
        # Match against a pageId
        # @param {string} pattern
        # @param {string|array} values
        # @return {boolean}
        */
        pageId: function(pattern, values) {
          var value, _i, _len;
          pattern = toRegExp(pattern);
          values || (values = ConnecTag.values.pageId);
          values = isArray(values) ? values : [values];
          for (_i = 0, _len = values.length; _i < _len; _i++) {
            value = values[_i];
            if (pattern.test(value)) {
              return true;
            }
          }
          return false;
        }
      };
      for (_i = 0, _len = locations.length; _i < _len; _i++) {
        loc = locations[_i];
        matchers[loc] = getLocationHandler(loc);
      }
      matchers.location = matchers.href;
      return matchers;
    })(),
    /**
    # Namespace for utility methods
    # @namespace
    */
    util: {
      typeOf: typeOf,
      isArray: isArray,
      isNull: isNull,
      isPlainObject: isPlainObject,
      isCloneable: isCloneable,
      extend: extend,
      clone: clone,
      toRegExp: toRegExp
    }
    /**
    # Plugin class
    # @constructor
    */
  };
  ConnecTag.classes.Plugin = Plugin = (function() {
    function Plugin(params) {
      this.initialized = false;
      this.methods = {};
      this.initialize = function() {};
      this.track = function(settings, tag) {};
    }
    /**
    # Execute a command object
    # @param {object} command
    # @param {string} instanceId
    */
    Plugin.prototype.executeCommand = function(command, instanceId) {
      var i, method, param, parameters, _len;
      if (command.disabled) {
        return "";
      }
      method = command.method;
      parameters = command.parameters;
      if (instanceId != null) {
        parameters.push(instanceId);
      }
      for (i = 0, _len = parameters.length; i < _len; i++) {
        param = parameters[i];
        if (param !== instanceId) {
          if (typeOf(param) === "object" && (param.method != null)) {
            parameters[i] = this.executeCommand(param, instanceId);
          } else if (typeOf(param) === "string") {
            parameters[i] = ConnecTag.helpers.parseTemplate(param, ConnecTag.values);
          }
        }
      }
      return this.methods[method].apply(this, parameters);
    };
    /**
    # Iterate over commands array and execute each
    # @param {array} commands
    # @param {string} instanceId
    */
    Plugin.prototype.executeCommands = function(commands, instanceId) {
      var command, _i, _len;
      for (_i = 0, _len = commands.length; _i < _len; _i++) {
        command = commands[_i];
        this.executeCommand(command, instanceId);
      }
    };
    Plugin.prototype.helpers = ConnecTag.helpers;
    return Plugin;
  })();
  window.ConnecTag = ConnecTag;
}).call(this);
