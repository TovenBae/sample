var Prototype = {
  Version: '1.6.1',

  Browser: (function(){
    var ua = navigator.userAgent;
    var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
    return {
      IE:             !!window.attachEvent && !isOpera,
      Opera:          isOpera,
      WebKit:         ua.indexOf('AppleWebKit/') > -1,
      Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
      MobileSafari:   /Apple.*Mobile.*Safari/.test(ua)
    }
  })(),

  BrowserFeatures: {
    XPath: !!document.evaluate,
    SelectorsAPI: !!document.querySelector,
    ElementExtensions: (function() {
      var constructor = window.Element || window.HTMLElement;
      return !!(constructor && constructor.prototype);
    })(),
    SpecificElementExtensions: (function() {
      if (typeof window.HTMLDivElement !== 'undefined')
        return true;

      var div = document.createElement('div');
      var form = document.createElement('form');
      var isSupported = false;

      if (div['__proto__'] && (div['__proto__'] !== form['__proto__'])) {
        isSupported = true;
      }

      div = form = null;

      return isSupported;
    })()
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },
  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;


var Abstract = { };


var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

/* Based on Alex Arnell's inheritance implementation. */

var Class = (function() {
  function subclass() {};
  function create() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0; i < properties.length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = Object.keys(source);

    if (!Object.keys({ toString: true }).length) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames().first() == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
})();
(function() {

  var _toString = Object.prototype.toString;

  function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  }

  function inspect(object) {
    try {
      if (isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  }

  function toJSON(object) {
    var type = typeof object;
    switch (type) {
      case 'undefined':
      case 'function':
      case 'unknown': return;
      case 'boolean': return object.toString();
    }

    if (object === null) return 'null';
    if (object.toJSON) return object.toJSON();
    if (isElement(object)) return;

    var results = [];
    for (var property in object) {
      var value = toJSON(object[property]);
      if (!isUndefined(value))
        results.push(property.toJSON() + ': ' + value);
    }

    return '{' + results.join(', ') + '}';
  }

  function toQueryString(object) {
    return $H(object).toQueryString();
  }

  function toHTML(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  }

  function keys(object) {
    var results = [];
    for (var property in object)
      results.push(property);
    return results;
  }

  function values(object) {
    var results = [];
    for (var property in object)
      results.push(object[property]);
    return results;
  }

  function clone(object) {
    return extend({ }, object);
  }

  function isElement(object) {
    return !!(object && object.nodeType == 1);
  }

  function isArray(object) {
    return _toString.call(object) == "[object Array]";
  }


  function isHash(object) {
    return object instanceof Hash;
  }

  function isFunction(object) {
    return typeof object === "function";
  }

  function isString(object) {
    return _toString.call(object) == "[object String]";
  }

  function isNumber(object) {
    return _toString.call(object) == "[object Number]";
  }

  function isUndefined(object) {
    return typeof object === "undefined";
  }

  extend(Object, {
    extend:        extend,
    inspect:       inspect,
    toJSON:        toJSON,
    toQueryString: toQueryString,
    toHTML:        toHTML,
    keys:          keys,
    values:        values,
    clone:         clone,
    isElement:     isElement,
    isArray:       isArray,
    isHash:        isHash,
    isFunction:    isFunction,
    isString:      isString,
    isNumber:      isNumber,
    isUndefined:   isUndefined
  });
})();
Object.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  function bind(context) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = slice.call(arguments, 1);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(context, a);
    }
  }

  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    return function(event) {
      var a = update([event || window.event], args);
      return __method.apply(context, a);
    }
  }

  function curry() {
    if (!arguments.length) return this;
    var __method = this, args = slice.call(arguments, 0);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(this, a);
    }
  }

  function delay(timeout) {
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  }

  function defer() {
    var args = update([0.01], arguments);
    return this.delay.apply(this, args);
  }

  function wrap(wrapper) {
    var __method = this;
    return function() {
      var a = update([__method.bind(this)], arguments);
      return wrapper.apply(this, a);
    }
  }

  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      var a = update([this], arguments);
      return __method.apply(null, a);
    };
  }

  return {
    argumentNames:       argumentNames,
    bind:                bind,
    bindAsEventListener: bindAsEventListener,
    curry:               curry,
    delay:               delay,
    defer:               defer,
    wrap:                wrap,
    methodize:           methodize
  }
})());


Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + '-' +
    (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
    this.getUTCDate().toPaddedString(2) + 'T' +
    this.getUTCHours().toPaddedString(2) + ':' +
    this.getUTCMinutes().toPaddedString(2) + ':' +
    this.getUTCSeconds().toPaddedString(2) + 'Z"';
};


RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};
var PeriodicalExecuter = Class.create({
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
        this.currentlyExecuting = false;
      } catch(e) {
        this.currentlyExecuting = false;
        throw e;
      }
    }
  }
});
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, (function() {

  function prepareReplacement(replacement) {
    if (Object.isFunction(replacement)) return replacement;
    var template = new Template(replacement);
    return function(match) { return template.evaluate(match) };
  }

  function gsub(pattern, replacement) {
    var result = '', source = this, match;
    replacement = prepareReplacement(replacement);

    if (Object.isString(pattern))
      pattern = RegExp.escape(pattern);

    if (!(pattern.length || pattern.source)) {
      replacement = replacement('');
      return replacement + source.split('').join(replacement) + replacement;
    }

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  }

  function sub(pattern, replacement, count) {
    replacement = prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  }

  function scan(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  }

  function truncate(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  }

  function strip() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  }

  function stripTags() {
    return this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
  }

  function stripScripts() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  }

  function extractScripts() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
    var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  }

  function evalScripts() {
    return this.extractScripts().map(function(script) { return eval(script) });
  }

  function escapeHTML() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function unescapeHTML() {
    return this.stripTags().replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  }


  function toQueryParams(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift());
        var value = pair.length > 1 ? pair.join('=') : pair[0];
        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  }

  function toArray() {
    return this.split('');
  }

  function succ() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  }

  function times(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  }

  function camelize() {
    var parts = this.split('-'), len = parts.length;
    if (len == 1) return parts[0];

    var camelized = this.charAt(0) == '-'
      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
      : parts[0];

    for (var i = 1; i < len; i++)
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

    return camelized;
  }

  function capitalize() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  }

  function underscore() {
    return this.replace(/::/g, '/')
               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
               .replace(/-/g, '_')
               .toLowerCase();
  }

  function dasherize() {
    return this.replace(/_/g, '-');
  }

  function inspect(useDoubleQuotes) {
    var escapedString = this.replace(/[\x00-\x1f\\]/g, function(character) {
      if (character in String.specialChar) {
        return String.specialChar[character];
      }
      return '\\u00' + character.charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  }

  function toJSON() {
    return this.inspect(true);
  }

  function unfilterJSON(filter) {
    return this.replace(filter || Prototype.JSONFilter, '$1');
  }

  function isJSON() {
    var str = this;
    if (str.blank()) return false;
    str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
  }

  function evalJSON(sanitize) {
    var json = this.unfilterJSON();
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  }

  function include(pattern) {
    return this.indexOf(pattern) > -1;
  }

  function startsWith(pattern) {
    return this.indexOf(pattern) === 0;
  }

  function endsWith(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
  }

  function empty() {
    return this == '';
  }

  function blank() {
    return /^\s*$/.test(this);
  }

  function interpolate(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }

  return {
    gsub:           gsub,
    sub:            sub,
    scan:           scan,
    truncate:       truncate,
    strip:          String.prototype.trim ? String.prototype.trim : strip,
    stripTags:      stripTags,
    stripScripts:   stripScripts,
    extractScripts: extractScripts,
    evalScripts:    evalScripts,
    escapeHTML:     escapeHTML,
    unescapeHTML:   unescapeHTML,
    toQueryParams:  toQueryParams,
    parseQuery:     toQueryParams,
    toArray:        toArray,
    succ:           succ,
    times:          times,
    camelize:       camelize,
    capitalize:     capitalize,
    underscore:     underscore,
    dasherize:      dasherize,
    inspect:        inspect,
    toJSON:         toJSON,
    unfilterJSON:   unfilterJSON,
    isJSON:         isJSON,
    evalJSON:       evalJSON,
    include:        include,
    startsWith:     startsWith,
    endsWith:       endsWith,
    empty:          empty,
    blank:          blank,
    interpolate:    interpolate
  };
})());

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if (object && Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return (match[1] + '');

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3];
      var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = (function() {
  function each(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  }

  function eachSlice(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1) return array;
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  }

  function all(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if (!result) throw $break;
    });
    return result;
  }

  function any(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index))
        throw $break;
    });
    return result;
  }

  function collect(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function detect(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  }

  function findAll(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function grep(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(RegExp.escape(filter));

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function include(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  }

  function inGroupsOf(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  }

  function inject(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index);
    });
    return memo;
  }

  function invoke(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  }

  function max(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  }

  function min(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  }

  function partition(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  }

  function pluck(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  }

  function reject(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function sortBy(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  }

  function toArray() {
    return this.map();
  }

  function zip() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  }

  function size() {
    return this.toArray().length;
  }

  function inspect() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }









  return {
    each:       each,
    eachSlice:  eachSlice,
    all:        all,
    every:      all,
    any:        any,
    some:       any,
    collect:    collect,
    map:        collect,
    detect:     detect,
    findAll:    findAll,
    select:     findAll,
    filter:     findAll,
    grep:       grep,
    include:    include,
    member:     include,
    inGroupsOf: inGroupsOf,
    inject:     inject,
    invoke:     invoke,
    max:        max,
    min:        min,
    partition:  partition,
    pluck:      pluck,
    reject:     reject,
    sortBy:     sortBy,
    toArray:    toArray,
    entries:    toArray,
    zip:        zip,
    size:       size,
    inspect:    inspect,
    find:       detect
  };
})();
function $A(iterable) {
  if (!iterable) return [];
  if ('toArray' in Object(iterable)) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

Array.from = $A;


(function() {
  var arrayProto = Array.prototype,
      slice = arrayProto.slice,
      _each = arrayProto.forEach; // use native browser JS 1.6 implementation if available

  function each(iterator) {
    for (var i = 0, length = this.length; i < length; i++)
      iterator(this[i]);
  }
  if (!_each) _each = each;

  function clear() {
    this.length = 0;
    return this;
  }

  function first() {
    return this[0];
  }

  function last() {
    return this[this.length - 1];
  }

  function compact() {
    return this.select(function(value) {
      return value != null;
    });
  }

  function flatten() {
    return this.inject([], function(array, value) {
      if (Object.isArray(value))
        return array.concat(value.flatten());
      array.push(value);
      return array;
    });
  }

  function without() {
    var values = slice.call(arguments, 0);
    return this.select(function(value) {
      return !values.include(value);
    });
  }

  function reverse(inline) {
    return (inline !== false ? this : this.toArray())._reverse();
  }

  function uniq(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  }

  function intersect(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  }


  function clone() {
    return slice.call(this, 0);
  }

  function size() {
    return this.length;
  }

  function inspect() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  }

  function toJSON() {
    var results = [];
    this.each(function(object) {
      var value = Object.toJSON(object);
      if (!Object.isUndefined(value)) results.push(value);
    });
    return '[' + results.join(', ') + ']';
  }

  function indexOf(item, i) {
    i || (i = 0);
    var length = this.length;
    if (i < 0) i = length + i;
    for (; i < length; i++)
      if (this[i] === item) return i;
    return -1;
  }

  function lastIndexOf(item, i) {
    i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
    var n = this.slice(0, i).reverse().indexOf(item);
    return (n < 0) ? n : i - n - 1;
  }

  function concat() {
    var array = slice.call(this, 0), item;
    for (var i = 0, length = arguments.length; i < length; i++) {
      item = arguments[i];
      if (Object.isArray(item) && !('callee' in item)) {
        for (var j = 0, arrayLength = item.length; j < arrayLength; j++)
          array.push(item[j]);
      } else {
        array.push(item);
      }
    }
    return array;
  }

  Object.extend(arrayProto, Enumerable);

  if (!arrayProto._reverse)
    arrayProto._reverse = arrayProto.reverse;

  Object.extend(arrayProto, {
    _each:     _each,
    clear:     clear,
    first:     first,
    last:      last,
    compact:   compact,
    flatten:   flatten,
    without:   without,
    reverse:   reverse,
    uniq:      uniq,
    intersect: intersect,
    clone:     clone,
    toArray:   clone,
    size:      size,
    inspect:   inspect,
    toJSON:    toJSON
  });

  var CONCAT_ARGUMENTS_BUGGY = (function() {
    return [].concat(arguments)[0][0] !== 1;
  })(1,2)

  if (CONCAT_ARGUMENTS_BUGGY) arrayProto.concat = concat;

  if (!arrayProto.indexOf) arrayProto.indexOf = indexOf;
  if (!arrayProto.lastIndexOf) arrayProto.lastIndexOf = lastIndexOf;
})();
function $H(object) {
  return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {
  function initialize(object) {
    this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
  }

  function _each(iterator) {
    for (var key in this._object) {
      var value = this._object[key], pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator(pair);
    }
  }

  function set(key, value) {
    return this._object[key] = value;
  }

  function get(key) {
    if (this._object[key] !== Object.prototype[key])
      return this._object[key];
  }

  function unset(key) {
    var value = this._object[key];
    delete this._object[key];
    return value;
  }

  function toObject() {
    return Object.clone(this._object);
  }

  function keys() {
    return this.pluck('key');
  }

  function values() {
    return this.pluck('value');
  }

  function index(value) {
    var match = this.detect(function(pair) {
      return pair.value === value;
    });
    return match && match.key;
  }

  function merge(object) {
    return this.clone().update(object);
  }

  function update(object) {
    return new Hash(object).inject(this, function(result, pair) {
      result.set(pair.key, pair.value);
      return result;
    });
  }

  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  function toQueryString() {
    return this.inject([], function(results, pair) {
      var key = encodeURIComponent(pair.key), values = pair.value;

      if (values && typeof values == 'object') {
        if (Object.isArray(values))
          return results.concat(values.map(toQueryPair.curry(key)));
      } else results.push(toQueryPair(key, values));
      return results;
    }).join('&');
  }

  function inspect() {
    return '#<Hash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  }

  function toJSON() {
    return Object.toJSON(this.toObject());
  }

  function clone() {
    return new Hash(this);
  }

  return {
    initialize:             initialize,
    _each:                  _each,
    set:                    set,
    get:                    get,
    unset:                  unset,
    toObject:               toObject,
    toTemplateReplacements: toObject,
    keys:                   keys,
    values:                 values,
    index:                  index,
    merge:                  merge,
    update:                 update,
    toQueryString:          toQueryString,
    inspect:                inspect,
    toJSON:                 toJSON,
    clone:                  clone
  };
})());

Hash.from = $H;
Object.extend(Number.prototype, (function() {
  function toColorPart() {
    return this.toPaddedString(2, 16);
  }

  function succ() {
    return this + 1;
  }

  function times(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
  }

  function toPaddedString(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  }

  function toJSON() {
    return isFinite(this) ? this.toString() : 'null';
  }

  function abs() {
    return Math.abs(this);
  }

  function round() {
    return Math.round(this);
  }

  function ceil() {
    return Math.ceil(this);
  }

  function floor() {
    return Math.floor(this);
  }

  return {
    toColorPart:    toColorPart,
    succ:           succ,
    times:          times,
    toPaddedString: toPaddedString,
    toJSON:         toJSON,
    abs:            abs,
    round:          round,
    ceil:           ceil,
    floor:          floor
  };
})());

function $R(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
}

var ObjectRange = Class.create(Enumerable, (function() {
  function initialize(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  }

  function _each(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  }

  function include(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }

  return {
    initialize: initialize,
    _each:      _each,
    include:    include
  };
})());



var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
};

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) { }
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate:   function() { Ajax.activeRequestCount++ },
  onComplete: function() { Ajax.activeRequestCount-- }
});
Ajax.Base = Class.create({
  initialize: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    Object.extend(this.options, options || { });

    this.options.method = this.options.method.toLowerCase();

    if (Object.isString(this.options.parameters))
      this.options.parameters = this.options.parameters.toQueryParams();
    else if (Object.isHash(this.options.parameters))
      this.options.parameters = this.options.parameters.toObject();
  }
});
Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      params['_method'] = this.method;
      this.method = 'post';
    }

    this.parameters = params;

    if (params = Object.toQueryString(params)) {
      if (this.method == 'get')
        this.url += (this.url.include('?') ? '&' : '?') + params;
      else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
        params += '&_=';
    }

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300);
  },

  getStatus: function() {
    try {
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {
      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null; }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];








Ajax.Response = Class.create({
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if(readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  status:      0,

  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  getHeader: Ajax.Request.prototype.getHeader,

  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});

Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = D$(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});



function D$(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push(D$(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, D$(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!window.Node) var Node = { };

if (!Node.ELEMENT_NODE) {
  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}


(function(global) {

  var SETATTRIBUTE_IGNORES_NAME = (function(){
    var elForm = document.createElement("form");
    var elInput = document.createElement("input");
    var root = document.documentElement;
    elInput.setAttribute("name", "test");
    elForm.appendChild(elInput);
    root.appendChild(elForm);
    var isBuggy = elForm.elements
      ? (typeof elForm.elements.test == "undefined")
      : null;
    root.removeChild(elForm);
    elForm = elInput = null;
    return isBuggy;
  })();

  var element = global.Element;
  global.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;
    if (SETATTRIBUTE_IGNORES_NAME && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }
    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));
    return Element.writeAttribute(cache[tagName].cloneNode(false), attributes);
  };
  Object.extend(global.Element, element || { });
  if (element) global.Element.prototype = element.prototype;
})(this);

Element.cache = { };
Element.idCounter = 1;

Element.Methods = {
  visible: function(element) {
    return D$(element).style.display != 'none';
  },

  toggle: function(element) {
    element = D$(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },


  hide: function(element) {
    element = D$(element);
    element.style.display = 'none';
    return element;
  },

  show: function(element) {
    element = D$(element);
    element.style.display = '';
    return element;
  },

  remove: function(element) {
    element = D$(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: (function(){

    var SELECT_ELEMENT_INNERHTML_BUGGY = (function(){
      var el = document.createElement("select"),
          isBuggy = true;
      el.innerHTML = "<option value=\"test\">test</option>";
      if (el.options && el.options[0]) {
        isBuggy = el.options[0].nodeName.toUpperCase() !== "OPTION";
      }
      el = null;
      return isBuggy;
    })();

    var TABLE_ELEMENT_INNERHTML_BUGGY = (function(){
      try {
        var el = document.createElement("table");
        if (el && el.tBodies) {
          el.innerHTML = "<tbody><tr><td>test</td></tr></tbody>";
          var isBuggy = typeof el.tBodies[0] == "undefined";
          el = null;
          return isBuggy;
        }
      } catch (e) {
        return true;
      }
    })();

    var SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING = (function () {
      var s = document.createElement("script"),
          isBuggy = false;
      try {
        s.appendChild(document.createTextNode(""));
        isBuggy = !s.firstChild ||
          s.firstChild && s.firstChild.nodeType !== 3;
      } catch (e) {
        isBuggy = true;
      }
      s = null;
      return isBuggy;
    })();

    function update(element, content) {
      element = D$(element);

      if (content && content.toElement)
        content = content.toElement();

      if (Object.isElement(content))
        return element.update().insert(content);

      content = Object.toHTML(content);

      var tagName = element.tagName.toUpperCase();

      if (tagName === 'SCRIPT' && SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING) {
        element.text = content;
        return element;
      }

      if (SELECT_ELEMENT_INNERHTML_BUGGY || TABLE_ELEMENT_INNERHTML_BUGGY) {
        if (tagName in Element._insertionTranslations.tags) {
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          Element._getContentFromAnonymousElement(tagName, content.stripScripts())
            .each(function(node) {
              element.appendChild(node)
            });
        }
        else {
          element.innerHTML = content.stripScripts();
        }
      }
      else {
        element.innerHTML = content.stripScripts();
      }

      content.evalScripts.bind(content).defer();
      return element;
    }

    return update;
  })(),

  replace: function(element, content) {
    element = D$(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },

  insert: function(element, insertions) {
    element = D$(element);

    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};

    var content, insert, tagName, childNodes;

    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }

      content = Object.toHTML(content);

      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();

      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));

      content.evalScripts.bind(content).defer();
    }

    return element;
  },

  wrap: function(element, wrapper, attributes) {
    element = D$(element);
    if (Object.isElement(wrapper))
      D$(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },

  inspect: function(element) {
    element = D$(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(), attribute = pair.last();
      var value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  recursivelyCollect: function(element, property) {
    element = D$(element);
    var elements = [];
    while (element = element[property])
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
    return elements;
  },

  ancestors: function(element) {
    return Element.recursivelyCollect(element, 'parentNode');
  },

  descendants: function(element) {
    return Element.select(element, "*");
  },

  firstDescendant: function(element) {
    element = D$(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return D$(element);
  },

  immediateDescendants: function(element) {
    if (!(element = D$(element).firstChild)) return [];
    while (element && element.nodeType != 1) element = element.nextSibling;
    if (element) return [element].concat(D$(element).nextSiblings());
    return [];
  },

  previousSiblings: function(element) {
    return Element.recursivelyCollect(element, 'previousSibling');
  },

  nextSiblings: function(element) {
    return Element.recursivelyCollect(element, 'nextSibling');
  },

  siblings: function(element) {
    element = D$(element);
    return Element.previousSiblings(element).reverse()
      .concat(Element.nextSiblings(element));
  },

  match: function(element, selector) {
    if (Object.isString(selector))
      selector = new Selector(selector);
    return selector.match(D$(element));
  },

  up: function(element, expression, index) {
    element = D$(element);
    if (arguments.length == 1) return D$(element.parentNode);
    var ancestors = Element.ancestors(element);
    return Object.isNumber(expression) ? ancestors[expression] :
      Selector.findElement(ancestors, expression, index);
  },

  down: function(element, expression, index) {
    element = D$(element);
    if (arguments.length == 1) return Element.firstDescendant(element);
    return Object.isNumber(expression) ? Element.descendants(element)[expression] :
      Element.select(element, expression)[index || 0];
  },

  previous: function(element, expression, index) {
    element = D$(element);
    if (arguments.length == 1) return D$(Selector.handlers.previousElementSibling(element));
    var previousSiblings = Element.previousSiblings(element);
    return Object.isNumber(expression) ? previousSiblings[expression] :
      Selector.findElement(previousSiblings, expression, index);
  },

  next: function(element, expression, index) {
    element = D$(element);
    if (arguments.length == 1) return D$(Selector.handlers.nextElementSibling(element));
    var nextSiblings = Element.nextSiblings(element);
    return Object.isNumber(expression) ? nextSiblings[expression] :
      Selector.findElement(nextSiblings, expression, index);
  },


  select: function(element) {
    var args = Array.prototype.slice.call(arguments, 1);
    return Selector.findChildElements(element, args);
  },

  adjacent: function(element) {
    var args = Array.prototype.slice.call(arguments, 1);
    return Selector.findChildElements(element.parentNode, args).without(element);
  },

  identify: function(element) {
    element = D$(element);
    var id = Element.readAttribute(element, 'id');
    if (id) return id;
    do { id = 'anonymous_element_' + Element.idCounter++ } while (D$(id));
    Element.writeAttribute(element, 'id', id);
    return id;
  },

  readAttribute: function(element, name) {
    element = D$(element);
    if (Prototype.Browser.IE) {
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name]) name = t.names[name];
      if (name.include(':')) {
        return (!element.attributes || !element.attributes[name]) ? null :
         element.attributes[name].value;
      }
    }
    return element.getAttribute(name);
  },

  writeAttribute: function(element, name, value) {
    element = D$(element);
    var attributes = { }, t = Element._attributeTranslations.write;

    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;

    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },

  getHeight: function(element) {
    return Element.getDimensions(element).height;
  },

  getWidth: function(element) {
    return Element.getDimensions(element).width;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = D$(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = D$(element))) return;
    if (!Element.hasClassName(element, className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = D$(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = D$(element))) return;
    return Element[Element.hasClassName(element, className) ?
      'removeClassName' : 'addClassName'](element, className);
  },

  cleanWhitespace: function(element) {
    element = D$(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

  empty: function(element) {
    return D$(element).innerHTML.blank();
  },

  descendantOf: function(element, ancestor) {
    element = D$(element), ancestor = D$(ancestor);

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;

    if (ancestor.contains)
      return ancestor.contains(element) && ancestor !== element;

    while (element = element.parentNode)
      if (element == ancestor) return true;

    return false;
  },

  scrollTo: function(element) {
    element = D$(element);
    var pos = Element.cumulativeOffset(element);
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  getStyle: function(element, style) {
    element = D$(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  getOpacity: function(element) {
    return D$(element).getStyle('opacity');
  },

  setStyle: function(element, styles) {
    element = D$(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property]);
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
            property] = styles[property];

    return element;
  },

  setOpacity: function(element, value) {
    element = D$(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  getDimensions: function(element) {
    element = D$(element);
    var display = Element.getStyle(element, 'display');
    if (display != 'none' && display != null) // Safari bug
      return {width: element.offsetWidth, height: element.offsetHeight};

    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    if (originalPosition != 'fixed') // Switching fixed to absolute causes issues in Safari
      els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
  },

  makePositioned: function(element) {
    element = D$(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      if (Prototype.Browser.Opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
    return element;
  },

  undoPositioned: function(element) {
    element = D$(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
    return element;
  },

  makeClipping: function(element) {
    element = D$(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = D$(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  cumulativeOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  positionedOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (element.tagName.toUpperCase() == 'BODY') break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  absolutize: function(element) {
    element = D$(element);
    if (Element.getStyle(element, 'position') == 'absolute') return element;

    var offsets = Element.positionedOffset(element);
    var top     = offsets[1];
    var left    = offsets[0];
    var width   = element.clientWidth;
    var height  = element.clientHeight;

    element._originalLeft   = left - parseFloat(element.style.left  || 0);
    element._originalTop    = top  - parseFloat(element.style.top || 0);
    element._originalWidth  = element.style.width;
    element._originalHeight = element.style.height;

    element.style.position = 'absolute';
    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.width  = width + 'px';
    element.style.height = height + 'px';
    return element;
  },

  relativize: function(element) {
    element = D$(element);
    if (Element.getStyle(element, 'position') == 'relative') return element;

    element.style.position = 'relative';
    var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width  = element._originalWidth;
    return element;
  },

  cumulativeScrollOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  getOffsetParent: function(element) {
    if (element.offsetParent) return D$(element.offsetParent);
    if (element == document.body) return D$(element);

    while ((element = element.parentNode) && element != document.body)
      if (Element.getStyle(element, 'position') != 'static')
        return D$(element);

    return D$(document.body);
  },

  viewportOffset: function(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;

      if (element.offsetParent == document.body &&
        Element.getStyle(element, 'position') == 'absolute') break;

    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (!Prototype.Browser.Opera || (element.tagName && (element.tagName.toUpperCase() == 'BODY'))) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);

    return Element._returnOffset(valueL, valueT);
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });

    source = D$(source);
    var p = Element.viewportOffset(source);

    element = D$(element);
    var delta = [0, 0];
    var parent = null;
    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = Element.getOffsetParent(element);
      delta = Element.viewportOffset(parent);
    }

    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }

    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Object.extend(Element.Methods, {
  getElementsBySelector: Element.Methods.select,

  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'
    },
    values: { }
  }
};

if (Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(
    function(proceed, element, style) {
      switch (style) {
        case 'left': case 'top': case 'right': case 'bottom':
          if (proceed(element, 'position') === 'static') return null;
        case 'height': case 'width':
          if (!Element.visible(element)) return null;

          var dim = parseInt(proceed(element, style), 10);

          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';

          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];
          }
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);
          }) + 'px';
        default: return proceed(element, style);
      }
    }
  );

  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );
}

else if (Prototype.Browser.IE) {
  Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(
    function(proceed, element) {
      element = D$(element);
      try { element.offsetParent }
      catch(e) { return D$(document.body) }
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);
      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    }
  );

  $w('positionedOffset viewportOffset').each(function(method) {
    Element.Methods[method] = Element.Methods[method].wrap(
      function(proceed, element) {
        element = D$(element);
        try { element.offsetParent }
        catch(e) { return Element._returnOffset(0,0) }
        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);
        var offsetParent = element.getOffsetParent();
        if (offsetParent && offsetParent.getStyle('position') === 'fixed')
          offsetParent.setStyle({ zoom: 1 });
        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );
  });

  Element.Methods.cumulativeOffset = Element.Methods.cumulativeOffset.wrap(
    function(proceed, element) {
      try { element.offsetParent }
      catch(e) { return Element._returnOffset(0,0) }
      return proceed(element);
    }
  );

  Element.Methods.getStyle = function(element, style) {
    element = D$(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  Element.Methods.setOpacity = function(element, value) {
    function stripAlpha(filter){
      return filter.replace(/alpha\([^\)]*\)/gi,'');
    }
    element = D$(element);
    var currentStyle = element.currentStyle;
    if ((currentStyle && !currentStyle.hasLayout) ||
      (!currentStyle && element.style.zoom == 'normal'))
        element.style.zoom = 1;

    var filter = element.getStyle('filter'), style = element.style;
    if (value == 1 || value === '') {
      (filter = stripAlpha(filter)) ?
        style.filter = filter : style.removeAttribute('filter');
      return element;
    } else if (value < 0.00001) value = 0;
    style.filter = stripAlpha(filter) +
      'alpha(opacity=' + (value * 100) + ')';
    return element;
  };

  Element._attributeTranslations = (function(){

    var classProp = 'className';
    var forProp = 'for';

    var el = document.createElement('div');

    el.setAttribute(classProp, 'x');

    if (el.className !== 'x') {
      el.setAttribute('class', 'x');
      if (el.className === 'x') {
        classProp = 'class';
      }
    }
    el = null;

    el = document.createElement('label');
    el.setAttribute(forProp, 'x');
    if (el.htmlFor !== 'x') {
      el.setAttribute('htmlFor', 'x');
      if (el.htmlFor === 'x') {
        forProp = 'htmlFor';
      }
    }
    el = null;

    return {
      read: {
        names: {
          'class':      classProp,
          'className':  classProp,
          'for':        forProp,
          'htmlFor':    forProp
        },
        values: {
          _getAttr: function(element, attribute) {
            return element.getAttribute(attribute);
          },
          _getAttr2: function(element, attribute) {
            return element.getAttribute(attribute, 2);
          },
          _getAttrNode: function(element, attribute) {
            var node = element.getAttributeNode(attribute);
            return node ? node.value : "";
          },
          _getEv: (function(){

            var el = document.createElement('div');
            el.onclick = Prototype.emptyFunction;
            var value = el.getAttribute('onclick');
            var f;

            if (String(value).indexOf('{') > -1) {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                attribute = attribute.toString();
                attribute = attribute.split('{')[1];
                attribute = attribute.split('}')[0];
                return attribute.strip();
              };
            }
            else if (value === '') {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                return attribute.strip();
              };
            }
            el = null;
            return f;
          })(),
          _flag: function(element, attribute) {
            return D$(element).hasAttribute(attribute) ? attribute : null;
          },
          style: function(element) {
            return element.style.cssText.toLowerCase();
          },
          title: function(element) {
            return element.title;
          }
        }
      }
    }
  })();

  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },

      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };

  Element._attributeTranslations.has = {};

  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });

  (function(v) {
    Object.extend(v, {
      href:        v._getAttr2,
      src:         v._getAttr2,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);

  if (Prototype.BrowserFeatures.ElementExtensions) {
    (function() {
      function _descendants(element) {
        var nodes = element.getElementsByTagName('*'), results = [];
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName !== "!") // Filter out comment nodes.
            results.push(node);
        return results;
      }

      Element.Methods.down = function(element, expression, index) {
        element = D$(element);
        if (arguments.length == 1) return element.firstDescendant();
        return Object.isNumber(expression) ? _descendants(element)[expression] :
          Element.select(element, expression)[index || 0];
      }
    })();
  }

}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = D$(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = D$(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;

    if (value == 1)
      if(element.tagName.toUpperCase() == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };

  Element.Methods.cumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == document.body)
        if (Element.getStyle(element, 'position') == 'absolute') break;

      element = element.offsetParent;
    } while (element);

    return Element._returnOffset(valueL, valueT);
  };
}

if ('outerHTML' in document.documentElement) {
  Element.Methods.replace = function(element, content) {
    element = D$(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next();
      var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html) {
  var div = new Element('div'), t = Element._insertionTranslations.tags[tagName];
  if (t) {
    div.innerHTML = t[0] + html + t[1];
    t[2].times(function() { div = div.firstChild });
  } else div.innerHTML = html;
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  var tags = Element._insertionTranslations.tags;
  Object.extend(tags, {
    THEAD: tags.TBODY,
    TFOOT: tags.TBODY,
    TH:    tags.TD
  });
})();

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = D$(element).getAttributeNode(attribute);
    return !!(node && node.specified);
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

(function(div) {

  if (!Prototype.BrowserFeatures.ElementExtensions && div['__proto__']) {
    window.HTMLElement = { };
    window.HTMLElement.prototype = div['__proto__'];
    Prototype.BrowserFeatures.ElementExtensions = true;
  }

  div = null;

})(document.createElement('div'))

Element.extend = (function() {

  function checkDeficiency(tagName) {
    if (typeof window.Element != 'undefined') {
      var proto = window.Element.prototype;
      if (proto) {
        var id = '_' + (Math.random()+'').slice(2);
        var el = document.createElement(tagName);
        proto[id] = 'x';
        var isBuggy = (el[id] !== 'x');
        delete proto[id];
        el = null;
        return isBuggy;
      }
    }
    return false;
  }

  function extendElementWith(element, methods) {
    for (var property in methods) {
      var value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }
  }

  var HTMLOBJECTELEMENT_PROTOTYPE_BUGGY = checkDeficiency('object');

  if (Prototype.BrowserFeatures.SpecificElementExtensions) {
    if (HTMLOBJECTELEMENT_PROTOTYPE_BUGGY) {
      return function(element) {
        if (element && typeof element._extendedByPrototype == 'undefined') {
          var t = element.tagName;
          if (t && (/^(?:object|applet|embed)$/i.test(t))) {
            extendElementWith(element, Element.Methods);
            extendElementWith(element, Element.Methods.Simulated);
            extendElementWith(element, Element.Methods.ByTag[t.toUpperCase()]);
          }
        }
        return element;
      }
    }
    return Prototype.K;
  }

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    if (!element || typeof element._extendedByPrototype != 'undefined' ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
        tagName = element.tagName.toUpperCase();

    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    extendElementWith(element, methods);

    element._extendedByPrototype = Prototype.emptyFunction;
    return element;

  }, {
    refresh: function() {
      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });

  extend.refresh();
  return extend;
})();

Element.hasAttribute = function(element, attribute) {
  if (element.hasAttribute) return element.hasAttribute(attribute);
  return Element.Methods.Simulated.hasAttribute(element, attribute);
};

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || { });
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    var element = document.createElement(tagName);
    var proto = element['__proto__'] || element.constructor.prototype;
    element = null;
    return proto;
  }

  var elementPrototype = window.HTMLElement ? HTMLElement.prototype :
   Element.prototype;

  if (F.ElementExtensions) {
    copy(Element.Methods, elementPrototype);
    copy(Element.Methods.Simulated, elementPrototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;

  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};


document.viewport = {

  getDimensions: function() {
    return { width: this.getWidth(), height: this.getHeight() };
  },

  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop);
  }
};

(function(viewport) {
  var B = Prototype.Browser, doc = document, element, property = {};

  function getRootElement() {
    if (B.WebKit && !doc.evaluate)
      return document;

    if (B.Opera && window.parseFloat(window.opera.version()) < 9.5)
      return document.body;

    return document.documentElement;
  }

  function define(D) {
    if (!element) element = getRootElement();

    property[D] = 'client' + D;

    viewport['get' + D] = function() { return element[property[D]] };
    return viewport['get' + D]();
  }

  viewport.getWidth  = define.curry('Width');

  viewport.getHeight = define.curry('Height');
})(document.viewport);


Element.Storage = {
  UID: 1
};

Element.addMethods({
  getStorage: function(element) {
    if (!(element = D$(element))) return;

    var uid;
    if (element === window) {
      uid = 0;
    } else {
      if (typeof element._prototypeUID === "undefined")
        element._prototypeUID = [Element.Storage.UID++];
      uid = element._prototypeUID[0];
    }

    if (!Element.Storage[uid])
      Element.Storage[uid] = $H();

    return Element.Storage[uid];
  },

  store: function(element, key, value) {
    if (!(element = D$(element))) return;

    if (arguments.length === 2) {
      Element.getStorage(element).update(key);
    } else {
      Element.getStorage(element).set(key, value);
    }

    return element;
  },

  retrieve: function(element, key, defaultValue) {
    if (!(element = D$(element))) return;
    var hash = Element.getStorage(element), value = hash.get(key);

    if (Object.isUndefined(value)) {
      hash.set(key, defaultValue);
      value = defaultValue;
    }

    return value;
  },

  clone: function(element, deep) {
    if (!(element = D$(element))) return;
    var clone = element.cloneNode(deep);
    clone._prototypeUID = void 0;
    if (deep) {
      var descendants = Element.select(clone, '*'),
          i = descendants.length;
      while (i--) {
        descendants[i]._prototypeUID = void 0;
      }
    }
    return Element.extend(clone);
  }
});
/* Portions of the Selector class are derived from Jack Slocum's DomQuery,
 * part of YUI-Ext version 0.40, distributed under the terms of an MIT-style
 * license.  Please see http://www.yui-ext.com/ for more information. */

var Selector = Class.create({
  initialize: function(expression) {
    this.expression = expression.strip();

    if (this.shouldUseSelectorsAPI()) {
      this.mode = 'selectorsAPI';
    } else if (this.shouldUseXPath()) {
      this.mode = 'xpath';
      this.compileXPathMatcher();
    } else {
      this.mode = "normal";
      this.compileMatcher();
    }

  },

  shouldUseXPath: (function() {

    var IS_DESCENDANT_SELECTOR_BUGGY = (function(){
      var isBuggy = false;
      if (document.evaluate && window.XPathResult) {
        var el = document.createElement('div');
        el.innerHTML = '<ul><li></li></ul><div><ul><li></li></ul></div>';

        var xpath = ".//*[local-name()='ul' or local-name()='UL']" +
          "//*[local-name()='li' or local-name()='LI']";

        var result = document.evaluate(xpath, el, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        isBuggy = (result.snapshotLength !== 2);
        el = null;
      }
      return isBuggy;
    })();

    return function() {
      if (!Prototype.BrowserFeatures.XPath) return false;

      var e = this.expression;

      if (Prototype.Browser.WebKit &&
       (e.include("-of-type") || e.include(":empty")))
        return false;

      if ((/(\[[\w-]*?:|:checked)/).test(e))
        return false;

      if (IS_DESCENDANT_SELECTOR_BUGGY) return false;

      return true;
    }

  })(),

  shouldUseSelectorsAPI: function() {
    if (!Prototype.BrowserFeatures.SelectorsAPI) return false;

    if (Selector.CASE_INSENSITIVE_CLASS_NAMES) return false;

    if (!Selector._div) Selector._div = new Element('div');

    try {
      Selector._div.querySelector(this.expression);
    } catch(e) {
      return false;
    }

    return true;
  },

  compileMatcher: function() {
    var e = this.expression, ps = Selector.patterns, h = Selector.handlers,
        c = Selector.criteria, le, p, m, len = ps.length, name;

    if (Selector._cache[e]) {
      this.matcher = Selector._cache[e];
      return;
    }

    this.matcher = ["this.matcher = function(root) {",
                    "var r = root, h = Selector.handlers, c = false, n;"];

    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i = 0; i<len; i++) {
        p = ps[i].re;
        name = ps[i].name;
        if (m = e.match(p)) {
          this.matcher.push(Object.isFunction(c[name]) ? c[name](m) :
            new Template(c[name]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.matcher.push("return h.unique(n);\n}");
    eval(this.matcher.join('\n'));
    Selector._cache[this.expression] = this.matcher;
  },

  compileXPathMatcher: function() {
    var e = this.expression, ps = Selector.patterns,
        x = Selector.xpath, le, m, len = ps.length, name;

    if (Selector._cache[e]) {
      this.xpath = Selector._cache[e]; return;
    }

    this.matcher = ['.//*'];
    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i = 0; i<len; i++) {
        name = ps[i].name;
        if (m = e.match(ps[i].re)) {
          this.matcher.push(Object.isFunction(x[name]) ? x[name](m) :
            new Template(x[name]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.xpath = this.matcher.join('');
    Selector._cache[this.expression] = this.xpath;
  },

  findElements: function(root) {
    root = root || document;
    var e = this.expression, results;

    switch (this.mode) {
      case 'selectorsAPI':
        if (root !== document) {
          var oldId = root.id, id = D$(root).identify();
          id = id.replace(/([\.:])/g, "\\$1");
          e = "#" + id + " " + e;
        }

        results = $A(root.querySelectorAll(e)).map(Element.extend);
        root.id = oldId;

        return results;
      case 'xpath':
        return document._getElementsByXPath(this.xpath, root);
      default:
       return this.matcher(root);
    }
  },

  match: function(element) {
    this.tokens = [];

    var e = this.expression, ps = Selector.patterns, as = Selector.assertions;
    var le, p, m, len = ps.length, name;

    while (e && le !== e && (/\S/).test(e)) {
      le = e;
      for (var i = 0; i<len; i++) {
        p = ps[i].re;
        name = ps[i].name;
        if (m = e.match(p)) {
          if (as[name]) {
            this.tokens.push([name, Object.clone(m)]);
            e = e.replace(m[0], '');
          } else {
            return this.findElements(document).include(element);
          }
        }
      }
    }

    var match = true, name, matches;
    for (var i = 0, token; token = this.tokens[i]; i++) {
      name = token[0], matches = token[1];
      if (!Selector.assertions[name](element, matches)) {
        match = false; break;
      }
    }

    return match;
  },

  toString: function() {
    return this.expression;
  },

  inspect: function() {
    return "#<Selector:" + this.expression.inspect() + ">";
  }
});

if (Prototype.BrowserFeatures.SelectorsAPI &&
 document.compatMode === 'BackCompat') {
  Selector.CASE_INSENSITIVE_CLASS_NAMES = (function(){
    var div = document.createElement('div'),
     span = document.createElement('span');

    div.id = "prototype_test_id";
    span.className = 'Test';
    div.appendChild(span);
    var isIgnored = (div.querySelector('#prototype_test_id .test') !== null);
    div = span = null;
    return isIgnored;
  })();
}

Object.extend(Selector, {
  _cache: { },

  xpath: {
    descendant:   "//*",
    child:        "/*",
    adjacent:     "/following-sibling::*[1]",
    laterSibling: '/following-sibling::*',
    tagName:      function(m) {
      if (m[1] == '*') return '';
      return "[local-name()='" + m[1].toLowerCase() +
             "' or local-name()='" + m[1].toUpperCase() + "']";
    },
    className:    "[contains(concat(' ', @class, ' '), ' #{1} ')]",
    id:           "[@id='#{1}']",
    attrPresence: function(m) {
      m[1] = m[1].toLowerCase();
      return new Template("[@#{1}]").evaluate(m);
    },
    attr: function(m) {
      m[1] = m[1].toLowerCase();
      m[3] = m[5] || m[6];
      return new Template(Selector.xpath.operators[m[2]]).evaluate(m);
    },
    pseudo: function(m) {
      var h = Selector.xpath.pseudos[m[1]];
      if (!h) return '';
      if (Object.isFunction(h)) return h(m);
      return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m);
    },
    operators: {
      '=':  "[@#{1}='#{3}']",
      '!=': "[@#{1}!='#{3}']",
      '^=': "[starts-with(@#{1}, '#{3}')]",
      '$=': "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
      '*=': "[contains(@#{1}, '#{3}')]",
      '~=': "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
      '|=': "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
    },
    pseudos: {
      'first-child': '[not(preceding-sibling::*)]',
      'last-child':  '[not(following-sibling::*)]',
      'only-child':  '[not(preceding-sibling::* or following-sibling::*)]',
      'empty':       "[count(*) = 0 and (count(text()) = 0)]",
      'checked':     "[@checked]",
      'disabled':    "[(@disabled) and (@type!='hidden')]",
      'enabled':     "[not(@disabled) and (@type!='hidden')]",
      'not': function(m) {
        var e = m[6], p = Selector.patterns,
            x = Selector.xpath, le, v, len = p.length, name;

        var exclusion = [];
        while (e && le != e && (/\S/).test(e)) {
          le = e;
          for (var i = 0; i<len; i++) {
            name = p[i].name
            if (m = e.match(p[i].re)) {
              v = Object.isFunction(x[name]) ? x[name](m) : new Template(x[name]).evaluate(m);
              exclusion.push("(" + v.substring(1, v.length - 1) + ")");
              e = e.replace(m[0], '');
              break;
            }
          }
        }
        return "[not(" + exclusion.join(" and ") + ")]";
      },
      'nth-child':      function(m) {
        return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m);
      },
      'nth-last-child': function(m) {
        return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m);
      },
      'nth-of-type':    function(m) {
        return Selector.xpath.pseudos.nth("position() ", m);
      },
      'nth-last-of-type': function(m) {
        return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m);
      },
      'first-of-type':  function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-of-type'](m);
      },
      'last-of-type':   function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-last-of-type'](m);
      },
      'only-of-type':   function(m) {
        var p = Selector.xpath.pseudos; return p['first-of-type'](m) + p['last-of-type'](m);
      },
      nth: function(fragment, m) {
        var mm, formula = m[6], predicate;
        if (formula == 'even') formula = '2n+0';
        if (formula == 'odd')  formula = '2n+1';
        if (mm = formula.match(/^(\d+)$/)) // digit only
          return '[' + fragment + "= " + mm[1] + ']';
        if (mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
          if (mm[1] == "-") mm[1] = -1;
          var a = mm[1] ? Number(mm[1]) : 1;
          var b = mm[2] ? Number(mm[2]) : 0;
          predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " +
          "((#{fragment} - #{b}) div #{a} >= 0)]";
          return new Template(predicate).evaluate({
            fragment: fragment, a: a, b: b });
        }
      }
    }
  },

  criteria: {
    tagName:      'n = h.tagName(n, r, "#{1}", c);      c = false;',
    className:    'n = h.className(n, r, "#{1}", c);    c = false;',
    id:           'n = h.id(n, r, "#{1}", c);           c = false;',
    attrPresence: 'n = h.attrPresence(n, r, "#{1}", c); c = false;',
    attr: function(m) {
      m[3] = (m[5] || m[6]);
      return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}", c); c = false;').evaluate(m);
    },
    pseudo: function(m) {
      if (m[6]) m[6] = m[6].replace(/"/g, '\\"');
      return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m);
    },
    descendant:   'c = "descendant";',
    child:        'c = "child";',
    adjacent:     'c = "adjacent";',
    laterSibling: 'c = "laterSibling";'
  },

  patterns: [
    { name: 'laterSibling', re: /^\s*~\s*/ },
    { name: 'child',        re: /^\s*>\s*/ },
    { name: 'adjacent',     re: /^\s*\+\s*/ },
    { name: 'descendant',   re: /^\s/ },

    { name: 'tagName',      re: /^\s*(\*|[\w\-]+)(\b|$)?/ },
    { name: 'id',           re: /^#([\w\-\*]+)(\b|$)/ },
    { name: 'className',    re: /^\.([\w\-\*]+)(\b|$)/ },
    { name: 'pseudo',       re: /^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|(?=\s|[:+~>]))/ },
    { name: 'attrPresence', re: /^\[((?:[\w-]+:)?[\w-]+)\]/ },
    { name: 'attr',         re: /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\4]*?)\4|([^'"][^\]]*?)))?\]/ }
  ],

  assertions: {
    tagName: function(element, matches) {
      return matches[1].toUpperCase() == element.tagName.toUpperCase();
    },

    className: function(element, matches) {
      return Element.hasClassName(element, matches[1]);
    },

    id: function(element, matches) {
      return element.id === matches[1];
    },

    attrPresence: function(element, matches) {
      return Element.hasAttribute(element, matches[1]);
    },

    attr: function(element, matches) {
      var nodeValue = Element.readAttribute(element, matches[1]);
      return nodeValue && Selector.operators[matches[2]](nodeValue, matches[5] || matches[6]);
    }
  },

  handlers: {
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        a.push(node);
      return a;
    },

    mark: function(nodes) {
      var _true = Prototype.emptyFunction;
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = _true;
      return nodes;
    },

    unmark: (function(){

      var PROPERTIES_ATTRIBUTES_MAP = (function(){
        var el = document.createElement('div'),
            isBuggy = false,
            propName = '_countedByPrototype',
            value = 'x'
        el[propName] = value;
        isBuggy = (el.getAttribute(propName) === value);
        el = null;
        return isBuggy;
      })();

      return PROPERTIES_ATTRIBUTES_MAP ?
        function(nodes) {
          for (var i = 0, node; node = nodes[i]; i++)
            node.removeAttribute('_countedByPrototype');
          return nodes;
        } :
        function(nodes) {
          for (var i = 0, node; node = nodes[i]; i++)
            node._countedByPrototype = void 0;
          return nodes;
        }
    })(),

    index: function(parentNode, reverse, ofType) {
      parentNode._countedByPrototype = Prototype.emptyFunction;
      if (reverse) {
        for (var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {
          var node = nodes[i];
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
        }
      } else {
        for (var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++)
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
      }
    },

    unique: function(nodes) {
      if (nodes.length == 0) return nodes;
      var results = [], n;
      for (var i = 0, l = nodes.length; i < l; i++)
        if (typeof (n = nodes[i])._countedByPrototype == 'undefined') {
          n._countedByPrototype = Prototype.emptyFunction;
          results.push(Element.extend(n));
        }
      return Selector.handlers.unmark(results);
    },

    descendant: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, node.getElementsByTagName('*'));
      return results;
    },

    child: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        for (var j = 0, child; child = node.childNodes[j]; j++)
          if (child.nodeType == 1 && child.tagName != '!') results.push(child);
      }
      return results;
    },

    adjacent: function(nodes) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        var next = this.nextElementSibling(node);
        if (next) results.push(next);
      }
      return results;
    },

    laterSibling: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, Element.nextSiblings(node));
      return results;
    },

    nextElementSibling: function(node) {
      while (node = node.nextSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    previousElementSibling: function(node) {
      while (node = node.previousSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    tagName: function(nodes, root, tagName, combinator) {
      var uTagName = tagName.toUpperCase();
      var results = [], h = Selector.handlers;
      if (nodes) {
        if (combinator) {
          if (combinator == "descendant") {
            for (var i = 0, node; node = nodes[i]; i++)
              h.concat(results, node.getElementsByTagName(tagName));
            return results;
          } else nodes = this[combinator](nodes);
          if (tagName == "*") return nodes;
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName.toUpperCase() === uTagName) results.push(node);
        return results;
      } else return root.getElementsByTagName(tagName);
    },

    id: function(nodes, root, id, combinator) {
      var targetNode = D$(id), h = Selector.handlers;

      if (root == document) {
        if (!targetNode) return [];
        if (!nodes) return [targetNode];
      } else {
        if (!root.sourceIndex || root.sourceIndex < 1) {
          var nodes = root.getElementsByTagName('*');
          for (var j = 0, node; node = nodes[j]; j++) {
            if (node.id === id) return [node];
          }
        }
      }

      if (nodes) {
        if (combinator) {
          if (combinator == 'child') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (targetNode.parentNode == node) return [targetNode];
          } else if (combinator == 'descendant') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Element.descendantOf(targetNode, node)) return [targetNode];
          } else if (combinator == 'adjacent') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Selector.handlers.previousElementSibling(targetNode) == node)
                return [targetNode];
          } else nodes = h[combinator](nodes);
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node == targetNode) return [targetNode];
        return [];
      }
      return (targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : [];
    },

    className: function(nodes, root, className, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      return Selector.handlers.byClassName(nodes, root, className);
    },

    byClassName: function(nodes, root, className) {
      if (!nodes) nodes = Selector.handlers.descendant([root]);
      var needle = ' ' + className + ' ';
      for (var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {
        nodeClassName = node.className;
        if (nodeClassName.length == 0) continue;
        if (nodeClassName == className || (' ' + nodeClassName + ' ').include(needle))
          results.push(node);
      }
      return results;
    },

    attrPresence: function(nodes, root, attr, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var results = [];
      for (var i = 0, node; node = nodes[i]; i++)
        if (Element.hasAttribute(node, attr)) results.push(node);
      return results;
    },

    attr: function(nodes, root, attr, value, operator, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var handler = Selector.operators[operator], results = [];
      for (var i = 0, node; node = nodes[i]; i++) {
        var nodeValue = Element.readAttribute(node, attr);
        if (nodeValue === null) continue;
        if (handler(nodeValue, value)) results.push(node);
      }
      return results;
    },

    pseudo: function(nodes, name, value, root, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      if (!nodes) nodes = root.getElementsByTagName("*");
      return Selector.pseudos[name](nodes, value, root);
    }
  },

  pseudos: {
    'first-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.previousElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'last-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.nextElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'only-child': function(nodes, value, root) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!h.previousElementSibling(node) && !h.nextElementSibling(node))
          results.push(node);
      return results;
    },
    'nth-child':        function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root);
    },
    'nth-last-child':   function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true);
    },
    'nth-of-type':      function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, false, true);
    },
    'nth-last-of-type': function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true, true);
    },
    'first-of-type':    function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, false, true);
    },
    'last-of-type':     function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, true, true);
    },
    'only-of-type':     function(nodes, formula, root) {
      var p = Selector.pseudos;
      return p['last-of-type'](p['first-of-type'](nodes, formula, root), formula, root);
    },

    getIndices: function(a, b, total) {
      if (a == 0) return b > 0 ? [b] : [];
      return $R(1, total).inject([], function(memo, i) {
        if (0 == (i - b) % a && (i - b) / a >= 0) memo.push(i);
        return memo;
      });
    },

    nth: function(nodes, formula, root, reverse, ofType) {
      if (nodes.length == 0) return [];
      if (formula == 'even') formula = '2n+0';
      if (formula == 'odd')  formula = '2n+1';
      var h = Selector.handlers, results = [], indexed = [], m;
      h.mark(nodes);
      for (var i = 0, node; node = nodes[i]; i++) {
        if (!node.parentNode._countedByPrototype) {
          h.index(node.parentNode, reverse, ofType);
          indexed.push(node.parentNode);
        }
      }
      if (formula.match(/^\d+$/)) { // just a number
        formula = Number(formula);
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.nodeIndex == formula) results.push(node);
      } else if (m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
        if (m[1] == "-") m[1] = -1;
        var a = m[1] ? Number(m[1]) : 1;
        var b = m[2] ? Number(m[2]) : 0;
        var indices = Selector.pseudos.getIndices(a, b, nodes.length);
        for (var i = 0, node, l = indices.length; node = nodes[i]; i++) {
          for (var j = 0; j < l; j++)
            if (node.nodeIndex == indices[j]) results.push(node);
        }
      }
      h.unmark(nodes);
      h.unmark(indexed);
      return results;
    },

    'empty': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (node.tagName == '!' || node.firstChild) continue;
        results.push(node);
      }
      return results;
    },

    'not': function(nodes, selector, root) {
      var h = Selector.handlers, selectorType, m;
      var exclusions = new Selector(selector).findElements(root);
      h.mark(exclusions);
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node._countedByPrototype) results.push(node);
      h.unmark(exclusions);
      return results;
    },

    'enabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node.disabled && (!node.type || node.type !== 'hidden'))
          results.push(node);
      return results;
    },

    'disabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.disabled) results.push(node);
      return results;
    },

    'checked': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.checked) results.push(node);
      return results;
    }
  },

  operators: {
    '=':  function(nv, v) { return nv == v; },
    '!=': function(nv, v) { return nv != v; },
    '^=': function(nv, v) { return nv == v || nv && nv.startsWith(v); },
    '$=': function(nv, v) { return nv == v || nv && nv.endsWith(v); },
    '*=': function(nv, v) { return nv == v || nv && nv.include(v); },
    '~=': function(nv, v) { return (' ' + nv + ' ').include(' ' + v + ' '); },
    '|=': function(nv, v) { return ('-' + (nv || "").toUpperCase() +
     '-').include('-' + (v || "").toUpperCase() + '-'); }
  },

  split: function(expression) {
    var expressions = [];
    expression.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(m) {
      expressions.push(m[1].strip());
    });
    return expressions;
  },

  matchElements: function(elements, expression) {
    var matches = D$$(expression), h = Selector.handlers;
    h.mark(matches);
    for (var i = 0, results = [], element; element = elements[i]; i++)
      if (element._countedByPrototype) results.push(element);
    h.unmark(matches);
    return results;
  },

  findElement: function(elements, expression, index) {
    if (Object.isNumber(expression)) {
      index = expression; expression = false;
    }
    return Selector.matchElements(elements, expression || '*')[index || 0];
  },

  findChildElements: function(element, expressions) {
    expressions = Selector.split(expressions.join(','));
    var results = [], h = Selector.handlers;
    for (var i = 0, l = expressions.length, selector; i < l; i++) {
      selector = new Selector(expressions[i].strip());
      h.concat(results, selector.findElements(element));
    }
    return (l > 1) ? h.unique(results) : results;
  }
});

if (Prototype.Browser.IE) {
  Object.extend(Selector.handlers, {
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        if (node.tagName !== "!") a.push(node);
      return a;
    }
  });
}

function D$$() {
  return Selector.findChildElements(document, $A(arguments));
}

var Form = {
  reset: function(form) {
    form = D$(form);
    form.reset();
    return form;
  },

  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit;

    var data = elements.inject({ }, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = D$(element).getValue();
        if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          if (key in result) {
            if (!Object.isArray(result[key])) result[key] = [result[key]];
            result[key].push(value);
          }
          else result[key] = value;
        }
      }
      return result;
    });

    return options.hash ? data : Object.toQueryString(data);
  }
};

Form.Methods = {
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  getElements: function(form) {
    var elements = D$(form).getElementsByTagName('*'),
        element,
        arr = [ ],
        serializers = Form.Element.Serializers;
    for (var i = 0; element = elements[i]; i++) {
      arr.push(element);
    }
    return arr.inject([], function(elements, child) {
      if (serializers[child.tagName.toLowerCase()])
        elements.push(Element.extend(child));
      return elements;
    })
  },

  getInputs: function(form, typeName, name) {
    form = D$(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  disable: function(form) {
    form = D$(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  enable: function(form) {
    form = D$(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  findFirstElement: function(form) {
    var elements = D$(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return /^(?:input|select|textarea)$/i.test(element.tagName);
    });
  },

  focusFirstElement: function(form) {
    form = D$(form);
    form.findFirstElement().activate();
    return form;
  },

  request: function(form, options) {
    form = D$(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);

    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/


Form.Element = {
  focus: function(element) {
    D$(element).focus();
    return element;
  },

  select: function(element) {
    D$(element).select();
    return element;
  }
};

Form.Element.Methods = {

  serialize: function(element) {
    element = D$(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },

  getValue: function(element) {
    element = D$(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  setValue: function(element, value) {
    element = D$(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  clear: function(element) {
    D$(element).value = '';
    return element;
  },

  present: function(element) {
    return D$(element).value != '';
  },

  activate: function(element) {
    element = D$(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !(/^(?:button|reset|submit)$/i.test(element.type))))
        element.select();
    } catch (e) { }
    return element;
  },

  disable: function(element) {
    element = D$(element);
    element.disabled = true;
    return element;
  },

  enable: function(element) {
    element = D$(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;

var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = {
  input: function(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return Form.Element.Serializers.inputSelector(element, value);
      default:
        return Form.Element.Serializers.textarea(element, value);
    }
  },

  inputSelector: function(element, value) {
    if (Object.isUndefined(value)) return element.checked ? element.value : null;
    else element.checked = !!value;
  },

  textarea: function(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  },

  select: function(element, value) {
    if (Object.isUndefined(value))
      return this[element.type == 'select-one' ?
        'selectOne' : 'selectMany'](element);
    else {
      var opt, currentValue, single = !Object.isArray(value);
      for (var i = 0, length = element.length; i < length; i++) {
        opt = element.options[i];
        currentValue = this.optionValue(opt);
        if (single) {
          if (currentValue == value) {
            opt.selected = true;
            return;
          }
        }
        else opt.selected = value.include(currentValue);
      }
    }
  },

  selectOne: function(element) {
    var index = element.selectedIndex;
    return index >= 0 ? this.optionValue(element.options[index]) : null;
  },

  selectMany: function(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(this.optionValue(opt));
    }
    return values;
  },

  optionValue: function(opt) {
    return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;
  }
};

/*--------------------------------------------------------------------------*/


Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = D$(element);
    this.lastValue = this.getValue();
  },

  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
  initialize: function(element, callback) {
    this.element  = D$(element);
    this.callback = callback;

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
(function() {

  var Event = {
    KEY_BACKSPACE: 8,
    KEY_TAB:       9,
    KEY_RETURN:   13,
    KEY_ESC:      27,
    KEY_LEFT:     37,
    KEY_UP:       38,
    KEY_RIGHT:    39,
    KEY_DOWN:     40,
    KEY_DELETE:   46,
    KEY_HOME:     36,
    KEY_END:      35,
    KEY_PAGEUP:   33,
    KEY_PAGEDOWN: 34,
    KEY_INSERT:   45,

    cache: {}
  };

  var docEl = document.documentElement;
  var MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED = 'onmouseenter' in docEl
    && 'onmouseleave' in docEl;

  var _isButton;
  if (Prototype.Browser.IE) {
    var buttonMap = { 0: 1, 1: 4, 2: 2 };
    _isButton = function(event, code) {
      return event.button === buttonMap[code];
    };
  } else if (Prototype.Browser.WebKit) {
    _isButton = function(event, code) {
      switch (code) {
        case 0: return event.which == 1 && !event.metaKey;
        case 1: return event.which == 1 && event.metaKey;
        default: return false;
      }
    };
  } else {
    _isButton = function(event, code) {
      return event.which ? (event.which === code + 1) : (event.button === code);
    };
  }

  function isLeftClick(event)   { return _isButton(event, 0) }

  function isMiddleClick(event) { return _isButton(event, 1) }

  function isRightClick(event)  { return _isButton(event, 2) }

  function element(event) {
    event = Event.extend(event);

    var node = event.target, type = event.type,
     currentTarget = event.currentTarget;

    if (currentTarget && currentTarget.tagName) {
      if (type === 'load' || type === 'error' ||
        (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
          && currentTarget.type === 'radio'))
            node = currentTarget;
    }

    if (node.nodeType == Node.TEXT_NODE)
      node = node.parentNode;

    return Element.extend(node);
  }

  function findElement(event, expression) {
    var element = Event.element(event);
    if (!expression) return element;
    var elements = [element].concat(element.ancestors());
    return Selector.findElement(elements, expression, 0);
  }

  function pointer(event) {
    return { x: pointerX(event), y: pointerY(event) };
  }

  function pointerX(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollLeft: 0 };

    return event.pageX || (event.clientX +
      (docElement.scrollLeft || body.scrollLeft) -
      (docElement.clientLeft || 0));
  }

  function pointerY(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollTop: 0 };

    return  event.pageY || (event.clientY +
       (docElement.scrollTop || body.scrollTop) -
       (docElement.clientTop || 0));
  }


  function stop(event) {
    Event.extend(event);
    event.preventDefault();
    event.stopPropagation();

    event.stopped = true;
  }

  Event.Methods = {
    isLeftClick: isLeftClick,
    isMiddleClick: isMiddleClick,
    isRightClick: isRightClick,

    element: element,
    findElement: findElement,

    pointer: pointer,
    pointerX: pointerX,
    pointerY: pointerY,

    stop: stop
  };


  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (Prototype.Browser.IE) {
    function _relatedTarget(event) {
      var element;
      switch (event.type) {
        case 'mouseover': element = event.fromElement; break;
        case 'mouseout':  element = event.toElement;   break;
        default: return null;
      }
      return Element.extend(element);
    }

    Object.extend(methods, {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return '[object Event]' }
    });

    Event.extend = function(event, element) {
      if (!event) return false;
      if (event._extendedByPrototype) return event;

      event._extendedByPrototype = Prototype.emptyFunction;
      var pointer = Event.pointer(event);

      Object.extend(event, {
        target: event.srcElement || element,
        relatedTarget: _relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });

      return Object.extend(event, methods);
    };
  } else {
    Event.prototype = window.Event.prototype || document.createEvent('HTMLEvents').__proto__;
    Object.extend(Event.prototype, methods);
    Event.extend = Prototype.K;
  }

  function _createResponder(element, eventName, handler) {
    var registry = Element.retrieve(element, 'prototype_event_registry');

    if (Object.isUndefined(registry)) {
      CACHE.push(element);
      registry = Element.retrieve(element, 'prototype_event_registry', $H());
    }

    var respondersForEvent = registry.get(eventName);
    if (Object.isUndefined(respondersForEvent)) {
      respondersForEvent = [];
      registry.set(eventName, respondersForEvent);
    }

    if (respondersForEvent.pluck('handler').include(handler)) return false;

    var responder;
    if (eventName.include(":")) {
      responder = function(event) {
        if (Object.isUndefined(event.eventName))
          return false;

        if (event.eventName !== eventName)
          return false;

        Event.extend(event, element);
        handler.call(element, event);
      };
    } else {
      if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED &&
       (eventName === "mouseenter" || eventName === "mouseleave")) {
        if (eventName === "mouseenter" || eventName === "mouseleave") {
          responder = function(event) {
            Event.extend(event, element);

            var parent = event.relatedTarget;
            while (parent && parent !== element) {
              try { parent = parent.parentNode; }
              catch(e) { parent = element; }
            }

            if (parent === element) return;

            handler.call(element, event);
          };
        }
      } else {
        responder = function(event) {
          Event.extend(event, element);
          handler.call(element, event);
        };
      }
    }

    responder.handler = handler;
    respondersForEvent.push(responder);
    return responder;
  }

  function _destroyCache() {
    for (var i = 0, length = CACHE.length; i < length; i++) {
      Event.stopObserving(CACHE[i]);
      CACHE[i] = null;
    }
  }

  var CACHE = [];

  if (Prototype.Browser.IE)
    window.attachEvent('onunload', _destroyCache);

  if (Prototype.Browser.WebKit)
    window.addEventListener('unload', Prototype.emptyFunction, false);


  var _getDOMEventName = Prototype.K;

  if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED) {
    _getDOMEventName = function(eventName) {
      var translations = { mouseenter: "mouseover", mouseleave: "mouseout" };
      return eventName in translations ? translations[eventName] : eventName;
    };
  }

  function observe(element, eventName, handler) {
    element = D$(element);

    var responder = _createResponder(element, eventName, handler);

    if (!responder) return element;

    if (eventName.include(':')) {
      if (element.addEventListener)
        element.addEventListener("dataavailable", responder, false);
      else {
        element.attachEvent("ondataavailable", responder);
        element.attachEvent("onfilterchange", responder);
      }
    } else {
      var actualEventName = _getDOMEventName(eventName);

      if (element.addEventListener)
        element.addEventListener(actualEventName, responder, false);
      else
        element.attachEvent("on" + actualEventName, responder);
    }

    return element;
  }

  function stopObserving(element, eventName, handler) {
    element = D$(element);

    var registry = Element.retrieve(element, 'prototype_event_registry');

    if (Object.isUndefined(registry)) return element;

    if (eventName && !handler) {
      var responders = registry.get(eventName);

      if (Object.isUndefined(responders)) return element;

      responders.each( function(r) {
        Element.stopObserving(element, eventName, r.handler);
      });
      return element;
    } else if (!eventName) {
      registry.each( function(pair) {
        var eventName = pair.key, responders = pair.value;

        responders.each( function(r) {
          Element.stopObserving(element, eventName, r.handler);
        });
      });
      return element;
    }

    var responders = registry.get(eventName);

    if (!responders) return;

    var responder = responders.find( function(r) { return r.handler === handler; });
    if (!responder) return element;

    var actualEventName = _getDOMEventName(eventName);

    if (eventName.include(':')) {
      if (element.removeEventListener)
        element.removeEventListener("dataavailable", responder, false);
      else {
        element.detachEvent("ondataavailable", responder);
        element.detachEvent("onfilterchange",  responder);
      }
    } else {
      if (element.removeEventListener)
        element.removeEventListener(actualEventName, responder, false);
      else
        element.detachEvent('on' + actualEventName, responder);
    }

    registry.set(eventName, responders.without(responder));

    return element;
  }

  function fire(element, eventName, memo, bubble) {
    element = D$(element);

    if (Object.isUndefined(bubble))
      bubble = true;

    if (element == document && document.createEvent && !element.dispatchEvent)
      element = document.documentElement;

    var event;
    if (document.createEvent) {
      event = document.createEvent('HTMLEvents');
      event.initEvent('dataavailable', true, true);
    } else {
      event = document.createEventObject();
      event.eventType = bubble ? 'ondataavailable' : 'onfilterchange';
    }

    event.eventName = eventName;
    event.memo = memo || { };

    if (document.createEvent)
      element.dispatchEvent(event);
    else
      element.fireEvent(event.eventType, event);

    return Event.extend(event);
  }


  Object.extend(Event, Event.Methods);

  Object.extend(Event, {
    fire:          fire,
    observe:       observe,
    stopObserving: stopObserving
  });

  Element.addMethods({
    fire:          fire,

    observe:       observe,

    stopObserving: stopObserving
  });

  Object.extend(document, {
    fire:          fire.methodize(),

    observe:       observe.methodize(),

    stopObserving: stopObserving.methodize(),

    loaded:        false
  });

  if (window.Event) Object.extend(window.Event, Event);
  else window.Event = Event;
})();

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards, John Resig, and Diego Perini. */

  var timer;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (timer) window.clearTimeout(timer);
    document.loaded = true;
    document.fire('dom:loaded');
  }

  function checkReadyState() {
    if (document.readyState === 'complete') {
      document.stopObserving('readystatechange', checkReadyState);
      fireContentLoadedEvent();
    }
  }

  function pollDoScroll() {
    try { document.documentElement.doScroll('left'); }
    catch(e) {
      timer = pollDoScroll.defer();
      return;
    }
    fireContentLoadedEvent();
  }

  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
  } else {
    document.observe('readystatechange', checkReadyState);
    if (window == top)
      timer = pollDoScroll.defer();
  }

  Event.observe(window, 'load', fireContentLoadedEvent);
})();

Element.addMethods();

/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
  Before: function(element, content) {
    return Element.insert(element, {before:content});
  },

  Top: function(element, content) {
    return Element.insert(element, {top:content});
  },

  Bottom: function(element, content) {
    return Element.insert(element, {bottom:content});
  },

  After: function(element, content) {
    return Element.insert(element, {after:content});
  }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');

var Position = {
  includeScrollOffsets: false,

  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },

  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },

  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },


  cumulativeOffset: Element.Methods.cumulativeOffset,

  positionedOffset: Element.Methods.positionedOffset,

  absolutize: function(element) {
    Position.prepare();
    return Element.absolutize(element);
  },

  relativize: function(element) {
    Position.prepare();
    return Element.relativize(element);
  },

  realOffset: Element.Methods.cumulativeScrollOffset,

  offsetParent: Element.Methods.getOffsetParent,

  page: Element.Methods.viewportOffset,

  clone: function(source, target, options) {
    options = options || { };
    return Element.clonePosition(target, source, options);
  }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
  function iter(name) {
    return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
  }

  instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
  function(element, className) {
    className = className.toString().strip();
    var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
    return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
  } : function(element, className) {
    className = className.toString().strip();
    var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
    if (!classNames && !className) return elements;

    var nodes = D$(element).getElementsByTagName('*');
    className = ' ' + className + ' ';

    for (var i = 0, child, cn; child = nodes[i]; i++) {
      if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
          (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
        elements.push(Element.extend(child));
    }
    return elements;
  };

  return function(className, parentElement) {
    return D$(parentElement || document.body).getElementsByClassName(className);
  };
}(Element.Methods);

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = D$(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

  set: function(className) {
    this.element.className = className;
  },

  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);

/*--------------------------------------------------------------------------
 *  attatched from devon ui
 *--------------------------------------------------------------------------*/

dui = new Object();
/**
 * Cross Browsing을 위한 라이브러리
 */
dui.CB = new Object();

/* 브라우저 정보 알아내기(Browser Sniffing) */
// convert all characters to lowercase to simplify testing
dui.CB.Browser = new Object();
dui.CB.Browser.agent          = navigator.userAgent.toLowerCase();
// *** BROWSER VERSION ***
// Note: On IE5, these return 4, so use isIE5up to detect IE5.
dui.CB.Browser.majorVersion   = parseInt(navigator.appVersion);
dui.CB.Browser.minorVersion   = parseFloat(navigator.appVersion);
// Note: Opera and WebTV spoof Navigator
dui.CB.Browser.isNav          = ((dui.CB.Browser.agent.indexOf('mozilla')!=-1) &&
	(dui.CB.Browser.agent.indexOf('spoofer')==-1) && 
	(dui.CB.Browser.agent.indexOf('compatible') == -1) && (dui.CB.Browser.agent.indexOf('opera')==-1) && 
	(dui.CB.Browser.agent.indexOf('webtv')==-1) && (dui.CB.Browser.agent.indexOf('hotjava')==-1));
dui.CB.Browser.isNav2         = (dui.CB.Browser.isNav && (dui.CB.Browser.majorVersion == 2));
dui.CB.Browser.isNav3         = (dui.CB.Browser.isNav && (dui.CB.Browser.majorVersion == 3));
dui.CB.Browser.isNav4         = (dui.CB.Browser.isNav && (dui.CB.Browser.majorVersion == 4));
dui.CB.Browser.isNav4up       = (dui.CB.Browser.isNav && (dui.CB.Browser.majorVersion >= 4));
dui.CB.Browser.isNavOnly      = (dui.CB.Browser.isNav && ((dui.CB.Browser.agent.indexOf(";nav") != -1) || (dui.CB.Browser.agent.indexOf("; nav") != -1)) );
dui.CB.Browser.isNav6         = (dui.CB.Browser.isNav && (dui.CB.Browser.majorVersion == 5));
dui.CB.Browser.isNav6up       = (dui.CB.Browser.isNav && (dui.CB.Browser.majorVersion >= 5));
dui.CB.Browser.isGecko        = (dui.CB.Browser.agent.indexOf('gecko') != -1);
dui.CB.Browser.isIE           = ((dui.CB.Browser.agent.indexOf("msie") != -1) && (dui.CB.Browser.agent.indexOf("opera") == -1));
dui.CB.Browser.isIE3          = (dui.CB.Browser.isIE && (dui.CB.Browser.majorVersion < 4));
dui.CB.Browser.isIE4          = (dui.CB.Browser.isIE && (dui.CB.Browser.majorVersion == 4) && (dui.CB.Browser.agent.indexOf("msie 4")!=-1) );
dui.CB.Browser.isIE4up        = (dui.CB.Browser.isIE && (dui.CB.Browser.majorVersion >= 4));
dui.CB.Browser.isIE5          = (dui.CB.Browser.isIE && (dui.CB.Browser.majorVersion == 4) && (dui.CB.Browser.agent.indexOf("msie5.0")!=-1) );
dui.CB.Browser.isIE5_5        = (dui.CB.Browser.isIE && (dui.CB.Browser.majorVersion == 4) && (dui.CB.Browser.agent.indexOf("msie5.5") !=-1));
dui.CB.Browser.isIE5up        = (dui.CB.Browser.isIE && !dui.CB.Browser.isIE3 && !dui.CB.Browser.isIE4);
dui.CB.Browser.isIE5_5up      = (dui.CB.Browser.isIE && !dui.CB.Browser.isIE3 && !dui.CB.Browser.isIE4 && !dui.CB.Browser.isIE5);
dui.CB.Browser.isIE6          = (dui.CB.Browser.isIE && (dui.CB.Browser.majorVersion == 4) && (dui.CB.Browser.agent.indexOf("msie 6.")!=-1) && (dui.CB.Browser.agent.indexOf("msie 7")==-1));
dui.CB.Browser.isIE6up        = (dui.CB.Browser.isIE && !dui.CB.Browser.isIE3 && !dui.CB.Browser.isIE4 && !dui.CB.Browser.isIE5 && !dui.CB.Browser.isIE5_5);
dui.CB.Browser.isIE7          = (dui.CB.Browser.isIE && (dui.CB.Browser.majorVersion == 4) && (dui.CB.Browser.agent.indexOf("msie 7.")!=-1));
dui.CB.Browser.isIE7up        = (dui.CB.Browser.isIE && !dui.CB.Browser.isIE3 && !dui.CB.Browser.isIE4 && !dui.CB.Browser.isIE5 && !dui.CB.Browser.isIE5_5 && !dui.CB.Browser.isIE6);
// KNOWN BUG: On AOL4, returns false if IE3 is embedded browser
dui.CB.Browser.isAOL          = (dui.CB.Browser.agent.indexOf("aol") != -1);
dui.CB.Browser.isAOL3         = (dui.CB.Browser.isAOL && dui.CB.Browser.isIE3);
dui.CB.Browser.isAOL4         = (dui.CB.Browser.isAOL && dui.CB.Browser.isIE4);
dui.CB.Browser.isAOL5         = (dui.CB.Browser.agent.indexOf("aol 5") != -1);
dui.CB.Browser.isAOL6         = (dui.CB.Browser.agent.indexOf("aol 6") != -1);
dui.CB.Browser.isOpera        = (dui.CB.Browser.agent.indexOf("opera") != -1);
dui.CB.Browser.isOpera2       = (dui.CB.Browser.agent.indexOf("opera 2") != -1 || dui.CB.Browser.agent.indexOf("opera/2") != -1);
dui.CB.Browser.isOpera3       = (dui.CB.Browser.agent.indexOf("opera 3") != -1 || dui.CB.Browser.agent.indexOf("opera/3") != -1);
dui.CB.Browser.isOpera4       = (dui.CB.Browser.agent.indexOf("opera 4") != -1 || dui.CB.Browser.agent.indexOf("opera/4") != -1);
dui.CB.Browser.isOpera5       = (dui.CB.Browser.agent.indexOf("opera 5") != -1 || dui.CB.Browser.agent.indexOf("opera/5") != -1);
dui.CB.Browser.isOpera5up     = (dui.CB.Browser.isOpera && !dui.CB.Browser.isOpera2 && !dui.CB.Browser.isOpera3 && !dui.CB.Browser.isOpera4);
dui.CB.Browser.isWebtv       = (dui.CB.Browser.agent.indexOf("webtv") != -1);
dui.CB.Browser.isTVNavigator = ((dui.CB.Browser.agent.indexOf("navio") != -1) || (dui.CB.Browser.agent.indexOf("navio_aoltv") != -1));
dui.CB.Browser.isAOLTV        = dui.CB.Browser.isTVNavigator;
dui.CB.Browser.isHotJava      = (dui.CB.Browser.agent.indexOf("hotjava") != -1);
dui.CB.Browser.isHotJava3     = (dui.CB.Browser.isHotJava && (dui.CB.Browser.majorVersion == 3));
dui.CB.Browser.isHotJava3up   = (dui.CB.Browser.isHotJava && (dui.CB.Browser.majorVersion >= 3));

dui.CB.Browser.isQuirkIE = dui.CB.Browser.isIE && document.compatMode == "BackCompat";

/* 이벤트 관련 */
dui.CB.addEventHandler = function (oTarget, sEventType, fnHandler) {
    if (oTarget.addEventListener) {
        oTarget.addEventListener(sEventType, fnHandler, false);
    } else if (oTarget.attachEvent) {
        oTarget.attachEvent("on" + sEventType, fnHandler);
    } else {
        oTarget["on" + sEventType] = fnHandler;
    }
};
        
dui.CB.removeEventHandler = function (oTarget, sEventType, fnHandler) {
    if (oTarget.removeEventListener) {
        oTarget.removeEventListener(sEventType, fnHandler, false);
    } else if (oTarget.detachEvent) {
        oTarget.detachEvent("on" + sEventType, fnHandler);
    } else { 
        oTarget["on" + sEventType] = null;
    }
};

dui.CB.getEvent = function(aEvent) {
	if (!aEvent) return window.event;
	return aEvent;
};
dui.CB.stopPropagation = function(aEvent) {
	aEvent = dui.CB.getEvent(aEvent);
	if (aEvent.eventPhase) aEvent.stopPropagation();
	else aEvent.cancelBubble = true;
};

/* get window inner size */
dui.CB.getWindowRect = function (doc) {
	doc = doc || document;
	var rect = new Object();
	var width, height;
	if (self.innerHeight) { // IE 외 모든 브라우저
		width = self.innerWidth;
		height = self.innerHeight;
	}
	else if (doc.documentElement &&	doc.documentElement.clientHeight) { // Explorer 6 Strict 모드
		width = doc.documentElement.clientWidth;
		height = doc.documentElement.clientHeight;
	}
	else if (doc.body) { // 다른 IE 브라우저
		width = doc.body.clientWidth;
		height = doc.body.clientHeight;
	}
	
	rect.width = width;
	rect.height = height;
	return rect;
}

dui.CB.getInnerWidth = function () {
	return dui.CB.getWindowRect().width;
}

dui.CB.getInnerHeight = function () {
	return dui.CB.getWindowRect().height;
}

dui.CB.getMousePosition = function (aEvent, doc) {
	doc = doc || document;
	var posx = 0;
	var posy = 0;
	aEvent = dui.CB.getEvent(aEvent);
	
	if (aEvent.pageX || aEvent.pageY) { // pageX/Y 표준 검사
		posx = aEvent.pageX;
		posy = aEvent.pageY;
	}
	else if (aEvent.clientX || aEvent.clientY) { //clientX/Y 표준 검사 Opera
		posx = aEvent.clientX;
		posy = aEvent.clientY;
		if (dui.CB.Browser.isIE) { // IE 여부 검사
			posx += doc.body.scrollLeft;
			posy += doc.body.scrollTop;
		}
	}
}

/**
 * 유용한 Element Prototype을 위한 라이브러리
 */
// Element insert
if (typeof HTMLElement!="undefined" && !HTMLElement.prototype.insertAdjacentElement) { // IE 이외 브라우저
	HTMLElement.prototype.insertAfter = function(newElement, targetElement) {
		var parent = targetElement.parentNode;
		if (parent.lastChild == targetElement) {
			parent.appendChild(newElement);
		} else {
			parent.insertBefore(newElement, this.nextSibling);
		}
	}
	HTMLElement.prototype.insertAdjacentElement = function(where,parsedNode){ 
			switch (where){ 
					case 'beforeBegin': 
							this.parentNode.insertBefore(parsedNode,this) 
							break; 
					case 'afterBegin': 
							this.insertBefore(parsedNode,this.firstChild); 
							break; 
					case 'beforeEnd': 
							this.appendChild(parsedNode); 
							break; 
					case 'afterEnd': 
							if (this.nextSibling) this.parentNode.insertBefore(parsedNode,this.nextSibling); 
							else this.parentNode.appendChild(parsedNode); 
							break; 
			} 
	} 
	HTMLElement.prototype.insertAdjacentHTML = function(where,htmlStr) { 
			var r = this.ownerDocument.createRange(); 
			r.setStartBefore(this); 
			var parsedHTML = r.createContextualFragment(htmlStr); 
			this.insertAdjacentElement(where,parsedHTML) 
	}     
	HTMLElement.prototype.insertAdjacentText = function(where,txtStr){ 
			var parsedText = document.createTextNode(txtStr) 
			this.insertAdjacentElement(where,parsedText) 
	} 
}
window.addOnload = function (func) {
	var oldOnload = window.onload;
	if (typeof window.onload != "function") {
		window.onload = func;
	} else {
		window.onload = function() {
			oldOnload();
			func();
		}
	}
}
/**
 * Element(Prototype.js) 확장
 */
Element.addMethods({
	getContentDimensions : function (element) {
		element = D$(element); 

	  // prototype.js의 getDimensions()와 같지만 offset -> client로 바꿨음 
		var dimensions;
		var display = D$(element).getStyle('display');
    if (display != 'none' && display != null) // Safari bug
      dimensions = {width: element.clientWidth, height: element.clientHeight};
		else {
	    var els = element.style;
	    var originalVisibility = els.visibility;
	    var originalPosition = els.position;
	    var originalDisplay = els.display;
	    els.visibility = 'hidden';
	    els.position = 'absolute';
	    els.display = 'block';
	    var originalWidth = element.clientWidth;
	    var originalHeight = element.clientHeight;
	    els.display = originalDisplay;
	    els.position = originalPosition;
	    els.visibility = originalVisibility;
			dimensions = {width: originalWidth, height: originalHeight};
		}

		// padding을 제한다. 단, ie의 경우를 대비해 padding은 px로만 줄 것
		var left = parseInt(element.getStyle("padding-left"));
		var right = parseInt(element.getStyle("padding-right"));
		var top = parseInt(element.getStyle("padding-top"));
		var bottom = parseInt(element.getStyle("padding-bottom"));
		var padding = {
			left : isNaN(left) ? 0 : left,
			right : isNaN(right) ? 0 : right,
			top : isNaN(top) ? 0 : top,
			bottom : isNaN(bottom) ? 0 : bottom
		}

		dimensions.width -= padding.left + padding.right;
		dimensions.height -= padding.top + padding.bottom;
		return dimensions;
	},

  getContentHeight: function(element) {
    return D$(element).getContentDimensions().height;
  },

  getContentWidth: function(element) {
    return D$(element).getContentDimensions().width;
  }
});

/**
 * dui.Common
 */

dui.getLeft = function (obj){
	var left = 0;
	if (obj.offsetParent){
		while(obj.offsetParent){
			left += obj.offsetLeft;
			obj = obj.offsetParent;
		}
	}	else if(obj.x) left = obj.x;
	 
	return left;
};
dui.getTop = function (obj){
	var top = 0;
	if(obj.offsetParent){
		while(obj.offsetParent){
			top += obj.offsetTop;
			obj = obj.offsetParent;
		}
	} else if(obj.y) top = obj.y;
	
	return top;
};
dui.alertInfo = function (message) {
	alert("[DevOn UI Info] "+message);
}
dui.alertWarning = function (message) {
	alert("[DevOn UI Warning] "+message);
}
dui.alertError = function (message) {
	alert("[DevOn UI Error] "+message);
}

dui.Log = {
	isOpenning : false,
	msgBuf : new Array(),
	
	initHTML : '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
		'<html xmlns="http://www.w3.org/1999/xhtml">\n' +
		'<head>\n' +
		'<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n' +
		'<title>Logger (DevOn UI Base Logger)</title>\n' +
		'<script type="text/javascript">\n' +
		'// <![CDATA[\n' +
		'var LOG_STOP = false;\n' +
		'function showMenu() {\n' +
		'	var menuBar = document.getElementById("menuBar");\n' +
		'	if (self.pageYOffset) y = self.pageYOffset; \n' +
		'	else if (document.documentElement &&	document.documentElement.scrollTop) y = document.documentElement.scrollTop; \n' +
		'	else if (document.body) y = document.body.scrollTop; \n' +
		'	menuBar.style.top = y + "px";\n' +
		'	menuBar.style.display = "block";\n' +
		'}\n' +
		'function hideMenu() {\n' +
		'	var menuBar = document.getElementById("menuBar");\n' +
		'	menuBar.style.display = "none";\n' +
		'}\n' +
		'function stopLog() { \n' +
		'	LOG_STOP = true; \n' +
		'	var content = document.getElementById("content"); \n' +
		'	writeLog("<span style=\'color:#f55\'>log stopped.</span>"); \n' +
		'	var stopBtn = document.getElementById("stopBtn"); \n' +
		'	stopBtn.value = "시  작"; \n' +
		'	stopBtn.onclick = startLog; \n' +
		'}\n' +
		'function startLog() { \n' +
		'	LOG_STOP = false; \n' +
		'	var content = document.getElementById("content"); \n' +
		'	writeLog("<span style=\'color:#55f\'>log started.</span>"); \n' +
		'	var stopBtn = document.getElementById("stopBtn"); \n' +
		'	stopBtn.value = "중  지"; \n' +
		'	stopBtn.onclick = stopLog; \n' +
		'}\n' +
		'function clearLog() {\n' +
		'	var content = document.getElementById("content"); \n' +
		'	content.innerHTML = ""; \n' +
		'}\n' +
		'function checkMouse(e) {\n' +
		'	var aEvent = window.event ? window.event : e;\n' +
		'	if (aEvent.clientY < 25) {\n' +
		'		showMenu();\n' +
		'	//alert(Position);\n' +
		'	} else {\n' +
		'		hideMenu();\n' +
		'	}\n' +
		'}\n' +
		'function init() {\n' +
		'	document.onmousemove = checkMouse;\n' +
		'} \n' +
		'function writeLog(message) { \n' +
		'	var content = document.getElementById("content"); \n' +
		'	var pTag = document.createElement("p"); \n' +
		'	pTag.innerHTML = getTime()+message; \n' +
		'	var newLineTag = document.createElement("p"); \n' +
		'	newLineTag.innerHTML = "&nbsp;"; \n' +
		'	if (content.lastChild) content.removeChild(content.lastChild); \n' +
		'	content.appendChild(pTag); \n' +
		'	content.appendChild(newLineTag); \n' +
		'	window.scrollTo(0, document.body.clientHeight); \n' +
		'}; \n' +
		'function getTime() { \n' +
		'	var date = new Date(); \n' +
		'	var timeStr = "["+date.toLocaleTimeString()+"] ";	 \n' +
		'	return timeStr; \n' +
		'}; \n' +
		'// ]]>\n' +
		'</script>\n' +
		'<style type="text/css">\n' +
		'	* {margin:0; padding:0;}\n' +
		'	body {font:75%/1.5em Dotum,돋움,sans-serif; color:#646656;background-color:#FFFFF6;}\n' +
		'	#menuBar {display:none;position:absolute;width:100%;height:24px;text-align:right;padding-top:3px;border-bottom:1px solid #ccc;background:#fff;}\n' +
		'	#menuBar input {border: 1px outset #ccc;margin-right:5px; height:20px;}\n' +
		'</style>\n' +
		'</head>\n' +
		'<body onload="init()">\n' +
		'<div id="menuBar">\n' +
		'<input type="button" id="stopBtn" value="중&nbsp;&nbsp;지" onclick="stopLog()" /><input type="button" value="지우기" onclick="clearLog()" /> \n' +
		'</div>\n' +
		'<br />' +
		'<div id="content"></div>' +
		'</body>\n' +
		'</html>\n',
	
	println : function (message) {
		if (dui.Log.window && !dui.Log.window.closed && dui.Log.window.writeLog) {
			if (!dui.Log.window.LOG_STOP) dui.Log.window.writeLog(message);
		}	else if (dui.Log.isOpenning) { // 첫 창이 뜨기전에 로그가 순간 여러번 호출될 경우에 대비
			dui.Log.msgBuf[dui.Log.msgBuf.length] = message;
		} else {
			var callback = function(pe) {
				if (dui.Log.window.document) {
					var logWindow = dui.Log.window;
					logWindow.document.write(dui.Log.initHTML);
					logWindow.document.close();
					logWindow.writeLog(message);
					if (dui.Log.msgBuf) {
						for (var i=0, len=dui.Log.msgBuf.length;i<len;++i) {
							logWindow.writeLog(dui.Log.msgBuf[i]);
						}
						dui.Log.msgBuf = null;
					}
					pe.stop();

					dui.Log.isOpenning = false;
				}
			};
			dui.Log.isOpenning = true;
			dui.Log.window = window.open("", "DEVONUI_LOG_WINDOW", "height=400,width=400,status=yes,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
			try {
				if (!dui.Log.window) {
					dui.alertWarning("먼저 팝업창을 허용해 주세요.");
					return;
				}
				if (dui.Log.window.writeLog) // 이미 창이 떠있을 경우는 새창이 뜨면서 발생하는 시간지연이 없으므로 PE를 시작하지 않는다.
					dui.Log.window.writeLog(message);
				else {
					dui.Log.openPE = new PeriodicalExecuter(callback, 0.3);
				}
			} catch (e) {
				dui.alertWarning("다른 브라우저에서 이미 로그창을 띄웠습니다. 현재 로그창을 먼저 닫아주십시요.");
			}
		}
	}
};
dui.log = dui.Log.println;



dui.effect = {};
dui.effect.Effect = function() {}
dui.effect.Effect.prototype = {
	el : null,
	running : false,
	executer : null,
	callback : function() {},
	onChange : function() {},
	stop : function() {
		if (this.executer) {
			this.executer.stop();
			this.executer = null;
			this.running = false;
		}
	},
	run : function(elId) {
		this.el = D$(elId);
		this.runEffect();
		this.running = true;
	},
	isRunning : function () {
		return this.running;
	}
};

dui.effect.UniformData = {};
dui.effect.UniformData.getData = function (initValueA, lastValueA, initValueB, lastValueB, amount) {
	var valuesA = [initValueA];
	var distanceA = Math.abs(lastValueA-initValueA);
	var directionA = (lastValueA > initValueA) ? 1 : -1;
	var valuesB = [initValueB];
	var distanceB = Math.abs(lastValueB-initValueB);
	var directionB = (lastValueB > initValueB) ? 1 : -1;
	var valueA;
	var cnt = 0;

	while(true) {
		valueA = valuesA[cnt] + amount*directionA;
		if ( (directionA>0 && valueA>= lastValueA) ||
					(directionA<0 && valueA<= lastValueA) ) break;
		cnt++;
		valuesA[cnt] = valueA;
		valuesB[cnt] = Math.round(initValueB + Math.abs(distanceB * ((valueA-initValueA)/distanceA)) * directionB);
	}
	valuesA[cnt+1] = lastValueA;
	valuesB[cnt+1] = lastValueB;

	return {A:valuesA, B:valuesB};
}

dui.effect.AccelerationData = {};
dui.effect.AccelerationData.getData = function (initValueA, lastValueA, initValueB, lastValueB, acceleration) {
	//alert(initValueA+","+lastValueA+","+initValueB+","+lastValueB);
	if (acceleration > 0) {
		var temp = initValueA;
		initValueA = lastValueA;lastValueA = temp;
		temp = initValueB;
		initValueB = lastValueB;lastValueB = temp;
	}
	var valuesA = [initValueA];
	var distanceA = Math.abs(lastValueA-initValueA);
	var directionA = (lastValueA > initValueA) ? 1 : -1;
	var isDoubleData = (arguments.length > 3) ? true : false;
	if (isDoubleData) {
		var valuesB = [initValueB];
		var distanceB = Math.abs(lastValueB-initValueB);
		var directionB = (lastValueB > initValueB) ? 1 : -1;
	}
	var absAcceleration = Math.abs(acceleration);
	var valueA;
	var cnt = 0;
	var amount;
	while(true) {
		amount = Math.round((lastValueA-valuesA[cnt])*absAcceleration);
		if (amount == 0) amount = (directionA > 0) ? 1 : -1;
		valueA = valuesA[cnt] + amount;

		if ( (directionA>0 && valueA>= lastValueA) ||
					(directionA<0 && valueA<= lastValueA) ) break;

		cnt++;
		valuesA[cnt] = valueA;
		if (isDoubleData) valuesB[cnt] = Math.round(initValueB + Math.abs(distanceB * ((valueA-initValueA)/distanceA)) * directionB);
	}
	valuesA[cnt+1] = lastValueA;

	if (isDoubleData) {
		valuesB[cnt+1] = lastValueB;
		return {A : (acceleration > 0) ? valuesA.reverse() : valuesA, B : (acceleration > 0) ? valuesB.reverse() : valuesB};
	} else return (acceleration > 0) ? valuesA.reverse() : valuesA;
}

dui.effect.Move = Class.create();
dui.effect.Move.prototype = {
	initX : null,
	initY : null,
	destX : null,
	destY : null,
	interval : 10,
	pixel : 10,
	arrayX : new Array(),
	arrayY : new Array(),
	eventCnt : 1,
	eventNum : 0,
	acceleration : 0,
	executer : null,
	
	initialize : function (destX, destY, interval, pixel) {
		this.destX = destX;
		this.destY = destY;
		this.interval = interval ? interval : this.interval;
		this.pixel = pixel ? pixel : this.pixel;	
	},

	runEffect : function () {
		if (isNaN(this.destX)) {alert("dui.effect.Move: x"+number_input1+"-"+this.destX);return false;}
		if (isNaN(this.destY)) {alert("dui.effect.Move: y"+number_input1+"-"+this.destY);return false;}
		if (isNaN(this.interval)) {alert("dui.effect.Move: interval"+number_input2+"-"+this.interval);return false;}
		if (this.pixel && isNaN(this.pixel)) {alert("dui.effect.Move: pixel"+number_input2+"-"+this.pixel);return false;}

		
		if (this.initX == null) {
			var styleValue = parseInt(this.el.getStyle("left"));
			this.initX = isNaN(styleValue) ? 	this.el.offsetLeft : styleValue;
		} 
		if (this.initY == null) {
			var styleValue = parseInt(this.el.getStyle("top"));
			this.initY = isNaN(styleValue) ? 	this.el.offsetTop : styleValue;
		}

		var distanceH = Math.abs(this.destX-this.initX);
		var distanceV = Math.abs(this.destY-this.initY);
		var initValueA, initValueB, lastValueA, lastValueB;
		var XisMajor = distanceH >= distanceV;

		if (XisMajor)  {
			initValueA = this.initX; initValueB = this.initY
			lastValueA = this.destX; lastValueB = this.destY;
		} else {
			initValueA = this.initY; initValueB = this.initX;
			lastValueA = this.destY;	lastValueB = this.destX;
		}

		//alert(initValueA+","+lastValueA+","+initValueB+","+lastValueB)
		if (this.acceleration) 
			var values = dui.effect.AccelerationData.getData(initValueA, lastValueA, initValueB, lastValueB, this.acceleration);
		else
			var values = dui.effect.UniformData.getData(initValueA, lastValueA, initValueB, lastValueB, this.pixel);

		this.arrayX = XisMajor ? values.A : values.B;
		this.arrayY = XisMajor ? values.B : values.A;
		this.eventNum = this.arrayX.length-1;
		this.executer = new PeriodicalExecuter(this.move.bind(this), this.interval/1000); 
	},
	
	move : function(pe) {
		if (this.eventCnt > this.eventNum) {
			this.stop();
			this.callback();
		} else {
			var oldPosition = {left:parseInt(this.el.style.left), top:parseInt(this.el.style.top)};
			if (isNaN(oldPosition.left)) oldPosition.left = this.initX;
			if (isNaN(oldPosition.top)) oldPosition.top = this.initY;

			this.el.style.left = this.arrayX[this.eventCnt]+"px";
			this.el.style.top = this.arrayY[this.eventCnt]+"px";
			
			this.onChange(this.arrayX[this.eventCnt] - oldPosition.left, 
			              this.arrayY[this.eventCnt] - oldPosition.top);
		}
		this.eventCnt++;
	}
};
Object.extend(dui.effect.Move.prototype, dui.effect.Effect.prototype);


/*
 * Scale
 */
dui.effect.Scale = Class.create();
dui.effect.Scale.prototype = {
	initWidth : null,
	initHeight : null,
	amountW : null,
	amountH : null,
	interval : 10,
	pixel : 10,
	arrayW : new Array(),
	arrayH : new Array(),
	eventCnt : 1,
	eventNum : 0,
	nodisplay : false,
	acceleration : 0,

	initialize : function (amountW, amountH, interval, pixel) {
		this.amountW = amountW;
		this.amountH = amountH;
		this.interval = interval ? interval : this.interval;
		this.pixel = pixel ? pixel : this.pixel;	

	},
	
	runEffect : function() {
		if (isNaN(this.amountW)) {alert("dui.effect.Scale: width"+number_input3+"-"+this.amountW);return false;}
		if (isNaN(this.amountH)) {alert("dui.effect.Scale: height"+number_input3+"-"+this.amountH);return false;}
		if (isNaN(this.interval)) {alert("dui.effect.Scale: interval"+number_input2+"-"+this.interval);return false;}
		if (this.pixel && isNaN(this.pixel)) {alert("dui.effect.Scale: pixel"+number_input2+"-"+this.pixel);return false;}
		var dimensions = this.el.getContentDimensions();
		
		if (this.initWidth == null) {
			var styleValue = parseInt(this.el.style.width);
			this.initWidth = isNaN(styleValue) ? 	dimensions.width : styleValue;
		} 
		if (this.initHeight == null) {
			var styleValue = parseInt(this.el.style.height);
			this.initHeight = isNaN(styleValue) ? 	dimensions.height : styleValue;
		}
		
		var initValueA, initValueB, lastValueA, lastValueB;
		var widthIsMajor = Math.abs(this.amountW) >= Math.abs(this.amountH);

		if (widthIsMajor)  {
			initValueA = this.initWidth;
			initValueB = this.initHeight
			lastValueA = this.initWidth+this.amountW;
			lastValueB = this.initHeight+this.amountH;
		} else {
			initValueA = this.initHeight
			initValueB = this.initWidth;
			lastValueA = this.initHeight+this.amountH;
			lastValueB = this.initWidth+this.amountW;
		}
		if (lastValueA < 0) lastValueA = 0;
		if (lastValueB < 0) lastValueB = 0;

		//alert(initValueA+","+lastValueA+","+initValueB+","+lastValueB)
		if (this.acceleration) 
			var values = dui.effect.AccelerationData.getData(initValueA, lastValueA, initValueB, lastValueB, this.acceleration);
		else 
			var values = dui.effect.UniformData.getData(initValueA, lastValueA, initValueB, lastValueB, this.pixel);
			
		this.arrayW = widthIsMajor ? values.A : values.B;
		this.arrayH = widthIsMajor ? values.B : values.A;

		this.eventNum = this.arrayW.length-1;
		this.el.style.overflow = "hidden";
		this.executer = new PeriodicalExecuter(this.change.bind(this), this.interval/1000); 
	},

	change : function(pe) {
		if (this.eventCnt > this.eventNum) {
			this.stop();
			this.callback();
		} else {
			var oldRectangle = {width:parseInt(this.el.style.width), height:parseInt(this.el.style.height)};
			if (isNaN(oldRectangle.width)) oldRectangle.width = this.initWidth;
			if (isNaN(oldRectangle.height)) oldRectangle.height = this.initHeight;

			if (this.arrayW[this.eventCnt] <= 0 || this.arrayH[this.eventCnt] <= 0) {
				if (this.nodisplay) this.el.style.display = "none";
				this.eventCnt = this.eventNum+1; // stop effect
				return;
			}
			if (this.nodisplay && this.el.getStyle("display") == "none") this.el.style.display = "block";
			
			// width?굹 height媛? 0?씠硫? style?쓣 嫄대뱶由ъ?? ?븡?룄濡? ?븿
			if (this.amountW != 0) this.el.style.width = this.arrayW[this.eventCnt]+"px";
			if (this.amountH != 0) this.el.style.height = this.arrayH[this.eventCnt]+"px";

			this.onChange(this.arrayW[this.eventCnt] - oldRectangle.width, 
			              this.arrayH[this.eventCnt] - oldRectangle.height);
		}
		this.eventCnt++;
	}
};
Object.extend(dui.effect.Scale.prototype, dui.effect.Effect.prototype);


dui.dnd = {};

dui.dnd.Dragable = function () {};
dui.dnd.Dragable.makeDragable = function (elId) {
	var el = (typeof elId == "object") ? D$(elId) : D$(document.getElementById(elId));
	Object.extend(el, dui.dnd.Dragable.prototype);
	return el;
};
dui.dnd.Dragable.state = {
	NONE : 0,
	DRAGGING : 1
}
dui.dnd.Dragable.prototype = {
	dropZones : null,
	state : dui.dnd.Dragable.state.NONE,
	isDragable : true,
	iDiffX : null,
	iDiffY : null,
	mouseDownLock : false,
	dragged : false,
	
	beforeMouseDown : function (aEvent) {},
	afterMouseDown : function (aEvent) {},
	beforeMouseMove : function (aEvent) {}, 
	afterMouseMove : function (aEvent) {}, 
	beforeMouseUp : function (aEvent) {},
	afterMouseUp : function (aEvent) {},
	dragStarted : function (aEvent) {}, 
	dragEnded : function (aEvent) {}, 
	clicked: function (aEvent) {}, 

	onmousedown : function (aEvent) {
		aEvent = dui.CB.getEvent(aEvent);
		if (this.mouseDownLock) return false;
		this.mouseDownLock = true;
		if (this.beforeMouseDown(aEvent) == false) return false;

		document.body.onmousemove = this._mousemove.bind(this);
		document.body.onmouseup = this._mouseUp.bind(this);
		this.afterMouseDown(aEvent);
		return false;
	},

	_mousemove : function (aEvent) {
		if (this.beforeMouseMove(aEvent) == false) return false;
		if (this.state == dui.dnd.Dragable.state.NONE) {
			if (this.dragStarted(aEvent) ==  false) {
				this.cancelDrag(aEvent);
			} else {
				this.dragged = true;
				this.state = dui.dnd.Dragable.state.DRAGGING;
			}
		}
		aEvent = dui.CB.getEvent(aEvent);

		if (!this.iDiffX) this.iDiffX = aEvent.clientX - this.offsetLeft;  // offsetParent 엘리먼트의 client X좌표
		if (!this.iDiffY) this.iDiffY = aEvent.clientY - this.offsetTop;

		this.style.left = (aEvent.clientX - this.iDiffX) + "px";
		this.style.top = (aEvent.clientY - this.iDiffY) + "px";
		if(this.dropZones) this.checkDropZoneOver(aEvent);
		this.afterMouseMove(aEvent);
		return false;
	},
	
	_mouseUp : function (aEvent) { 
		this.mouseDownLock = false;
		if (this.beforeMouseUp(aEvent) == false) return false;
		this.state = dui.dnd.Dragable.state.NONE;
		this.cancelDrag(aEvent);
		if(this.dropZones) this.checkDropZoneDrop(aEvent);
		this.afterMouseUp(aEvent);

		if (this.dragged) {
			this.dragged = false;
			this.dragEnded(aEvent);
		} else {
			this.clicked(aEvent);
		}
		return false;
	},

	cancelDrag : function (aEvent) {
		this.iDiffX = this.iDiffY = null;
		document.body.onmousemove = null;
		document.body.onmouseup = null;
	},
	
	setEventSrc : function (elId) {
		var el = (typeof elId == "object") ? elId : document.getElementById(elId);
		el.onmousedown = this.onmousedown.bindAsEventListener(this);
		this.onmousedown = null;
	},
	
	registerDropZone : function (dropZone) {
		if (!this.dropZones) this.dropZones = [];
		this.dropZones.push(dropZone);
	},
	
	checkDropZoneOver : function (aEvent) {
		for (var i=0; i<this.dropZones.length; i++) {
		   	if (this.isDropZoneOver(i)) this.dropZones[i].onOver(aEvent, this);
		}
	},
	
	checkDropZoneDrop : function(aEvent) {
		for (var i = 0; i < this.dropZones.length; i++) {
			if (this.isDropZoneOver(i)) 
				this.dropZones[i].onDrop(aEvent, this);
			else 
				this.dropZones[i].onCancel(aEvent, this);
		}
	},
	
	isDropZoneOver : function(index) {
		var temp = Position.cumulativeOffset(this.dropZones[index]);
		var dzX = temp[0];
		var dzX2 = dzX + this.dropZones[index].offsetWidth;
		var dzY = temp[1];
		var dzY2 = dzY + this.dropZones[index].offsetHeight;
		temp = Position.cumulativeOffset(this);
		var drX = temp[0];
		var drX2 = drX + this.offsetWidth;
		var drY = temp[1];
		var drY2 = drY + this.offsetHeight;
		//dui.log("dzX:"+dzX+",dzX2:"+dzX2+",dzY:"+dzY+",dzY2:"+dzY2+",drX:"+drX+",drX2:"+drX2+",drY:"+drY+",drY2:"+drY2);
		if ( !( (drX < dzX && drX2 < dzX) || (drX > dzX2 && drX2 > dzX2) ||
		        (drY < dzY && drY2 < dzY) || (drY > dzY2 && drY2 > dzY2) )
		   ) return true;
		
		return false;
	}
};
dui.dnd.DropZone = function () {};
dui.dnd.DropZone.makeDropZone = function (elId) {
	var el = (typeof elId == "object") ? elId : document.getElementById(elId);
	Object.extend(el, dui.dnd.DropZone.prototype);
	return el;
};
dui.dnd.DropZone.prototype = {
	onOver : function (aEvent, dragable) {},
	onDrop : function (aEvent, dragable) {},
	onCancel : function (aEvent, dragable) {}
}


dui.tree = {};
dui.tree.Tree = Class.create();
dui.tree.Tree.prototype = {
	root : null,
	dragList : null,
	animation : true,
	pixelPerMove : 5,
	interval : 30,
	indent : "18px",
	nodeHeight : null,
	moveNode : true,
	selectedNode : null,
	imagePath : "images/",
	images : {
		openFolder : "folder_open.gif",
		closeFolder : "folder_close.gif",
		page : "page.gif",
		midPlus : "mid_plus.gif",
		midNormal : "mid_normal.gif",
		midMinus : "mid_minus.gif",
		midBlank : "mid_blank.gif",
		lastPlus : "last_plus.gif",
		lastNormal : "last_normal.gif",
		lastMinus : "last_minus.gif"
	},
	
	onChange : function (movedNode, targetNode, where) {},
	
	initialize : function() {
		this.dragList = new dui.tree.List();
		this.dragList.tree = this;
	},

	init : function (ulObj) { 
		if (typeof(ulObj) == "string") ulObj = document.getElementById(ulObj);
		if ( ulObj != null && ulObj != undefined ) {
			this.root = ulObj;
			this.initTree(ulObj);
			ulObj.style.display = "block";
			this.draw(this.root, false);
		}
	},

	initTree: function (ulObj) {
		ulObj.style.overflow = "hidden";
		var nodes = D$(ulObj).childElements();
		for (var i = 0; i<nodes.length; i++) {
			var node = this.makeNode(nodes[i]);
			if (node.hasClassName("Lcurrent")) {
				node.selected = true;
				this.openParent(node);
			}
			var childUL = node.getElementsByTagName("ul")[0];
			if (childUL) {
				this.initTree(childUL);
			}
			if (childUL || node.hasClassName("Lfolder")) {
				node.imFolder = true;
				node.imOpen = node.hasClassName("Lopen");
				node.lineImg.onclick = node.iconImg.onclick = this.toggle.bind(this, node);
			}
		}		
	},
	
	openParent : function (node) {
		var parent = node.parentNode.parentNode;
		if (parent.tagName.toUpperCase() == "LI") {
			if (!parent.imOpen) {
				parent.addClassName("Lopen");
				parent.imOpen = true;
			}
			this.openParent(parent);
		}
	},
	
	openAll : function () {
		var nodes = this.root.getElementsByTagName("li");
		for (var i = 0; i<nodes.length; i++) 
			nodes[i].imOpen = true;
		this.draw(this.root, false);
	},

	makeNode : function (liObj) {
		var node = dui.tree.Node.makeNode(liObj);
		node.tree = this;
		this.dragList.addItem(node.dragItem);
		return node;
	},

	draw : function (ul, animation) {
		var nodes = ul.childElements();
		
		for (var i=0; i<nodes.length; i++) {
			this.drawNode(nodes[i], animation);
			var childUL = nodes[i].getChildUL();
			if (childUL) this.draw(childUL, animation);
		}
		this.indentElement(ul);
	},
	
	drawNode : function (node, animation) {
		var images = this.getImages(node);
		node.lineImg.src = images.line;
		node.iconImg.src = images.icon;
		if (node.selected) this.registerSelected(node);
		if (node.imFolder && node.hasChild()) {
			if (node.imOpen) {
				this.open(node.getChildUL(), animation);
				if (node.isLast()) node.style.backgroundImage = "none";
				else node.style.background = "url("+this.imagePath + this.images.midBlank+") repeat-y left top";
			} else 
				this.close(node.getChildUL(), animation);
		}
	},
	
	getImages : function (node) {
		var lineImgSrc, iconImgSrc;
		var isLast = node.isLast();
		
		if (isLast) {
			if (node.imFolder) {
				if (node.hasChild()) {
					if (node.imOpen) lineImgSrc = this.imagePath + this.images.lastMinus;
					else lineImgSrc = this.imagePath + this.images.lastPlus;
				}
				else 
					lineImgSrc = this.imagePath + this.images.lastNormal;
			} else { 
				lineImgSrc = this.imagePath+this.images.lastNormal;
			}
		} else { 
			if (node.imFolder){
				if (node.hasChild()) {
					if (node.imOpen) lineImgSrc = this.imagePath + this.images.midMinus;
					else lineImgSrc = this.imagePath + this.images.midPlus;
				}
				else 
					lineImgSrc = this.imagePath + this.images.midNormal;
			} else {
				lineImgSrc = this.imagePath+this.images.midNormal;
			}
		}	
		
		if (node.imFolder) {
			//alert(node.getElementsByTagName("span")[2].innerHTML + node.hasChild());
			if (node.hasChild() && node.imOpen) iconImgSrc = this.imagePath + this.images.openFolder;
			else iconImgSrc = this.imagePath + this.images.closeFolder;
		} else {
			iconImgSrc = this.imagePath+this.images.page;
		}
		
		return { line:lineImgSrc, icon:iconImgSrc };
	},

	toggle : function (node, animation) {
		if (node.hasChild()) {
			node.imOpen = node.imOpen ? false : true;
			if (animation == undefined) animation = this.animation;
			this.drawNode(node, animation);
			//this.onChange();
		}
	},	

	selectNode : function (nodePath) {
		var nodeIndexes = nodePath.split(">");
		var ulObj = this.root;
		for (var i = 0; i < nodeIndexes.length; i++) {
			var selectedNode = ulObj.childElements()[nodeIndexes[i]];
			if (!selectedNode) break;
			if (selectedNode.imFolder) {
				selectedNode.imOpen = true;
				this.drawNode(selectedNode, false);
			}
			ulObj = selectedNode.getChildUL();
			if (!ulObj) break;
		}
		if (selectedNode) this.registerSelected(selectedNode);
		return selectedNode;
	},
	
	registerSelected : function(node) {
		if (this.selectedNode) {
			this.selectedNode.removeClassName("Lcurrent");
			this.selectedNode.selected = false;
		}
		this.selectedNode = node;
		node.addClassName("Lcurrent");
		node.selected = true;
	},
	
	getSelectedNode : function() {
		return this.selectedNode.dragItem;
	},
	
	getSelectedNodeName : function() {
		return this.selectedNode.getElementsByTagName("a")[0].innerHTML;
	},
	
	getSelectedNodeLink : function() {
		return this.selectedNode.getElementsByTagName("a")[0].href;
	},
	
	indentElement : function(obj) {
		obj.style.marginLeft = this.indent;
	}, 
	
	open : function(objUL, animation) {	
		var imgState = ""; 
		var isChild = false;
		var height = objUL.getHeight();
		if (animation) {
			var effect = new dui.effect.Scale(0, height, this.interval, this.pixelPerMove);
			effect.initWidth = 300;
			effect.initHeight = 0;
			effect.acceleration = -0.7;
			effect.nodisplay = true;
			effect.callback = function () {
				objUL.style.height = "";
			}
			effect.run(objUL);
		} else {
			objUL.style.display = "block";
		}
	},
	
	close : function(objUL, animation) {
		var height = (objUL.style.height) ? -parseInt(objUL.style.height) : -10000;	

		if (animation) {
			var effect = new dui.effect.Scale(0, height, this.interval, this.pixelPerMove);
			effect.acceleration = -0.7;
			effect.nodisplay = true;
			effect.callback = function () {
				objUL.style.height = "";
			}
			effect.run(objUL);
		} else {
			objUL.style.display = "none";
		}
	},

	getRoot : function () {
		return this.root;
	},
	
	enableMoveNode : function (flag) {
		this.moveNode = flag;
	}
}


/*
* dui.tree.Item
*/
dui.tree.Node = function() {};
dui.tree.Node.makeNode = function (liObj) {
	Element.extend(liObj);
	Object.extend(liObj, dui.tree.Node.prototype);
	liObj.init();
	return liObj;
};
dui.tree.Node.prototype = {
	imFolder : false,
	imOpen : false,
	icon : null,
	dragItem : null,
	lineImg : null,
	iconImg : null,
	ul : null,
	tree : null,
	html : null,

	/*
	 Node 구조
	 
	 <li>

     └ <div>  -- wrap

          └ <img>  -- line img

          └ <span>  -- dragitem
	 		
                └ <img>  -- icon img
	 			
                └ <user html>
	 			
	 */
	init : function () {
		var childElements = this.childElements();
		var userNodeElements = [];
		for (var i=0; i<childElements.length; i++) {
			if (childElements[i].tagName.toUpperCase() == "UL") break;
			userNodeElements.push(childElements[i]);
		}
		var wrap = document.createElement("div");
		this.insertAdjacentElement("afterBegin", wrap);
		wrap.style.display = "inline";
		wrap.noWrap = true;
		var lineImg = new Element("img");
		wrap.appendChild(lineImg);
		var iconImg = document.createElement("img");
		lineImg.style.verticalAlign = iconImg.style.verticalAlign = "middle";
		var dragItem = dui.tree.Item.makeItem();
		dragItem.appendChild(iconImg);
		wrap.appendChild(dragItem);
		for (var i = 0; i < userNodeElements.length; i++) {
			dragItem.appendChild(userNodeElements[i]);
		}
		dragItem.node = this;
		dragItem.adjacent = lineImg;
		this.dragItem = dragItem;
		this.lineImg = lineImg;
		this.iconImg = iconImg;
	},

	hasChild : function () {
		var childElements = this.childElements();
		var childUL = childElements[childElements.length-1];
		return childUL.tagName == "UL" && childUL.childElements().length > 0;
	}, 
	
	getChildUL : function () {
		var childElements = this.childElements();
		if (childElements[childElements.length-1].tagName == "UL") return childElements[childElements.length-1];
		else return null;
	},
	
	isLast : function () {
		return this.next() ? false : true;
	}
}
/*
* dui.tree.Item
*/
dui.tree.Item = function() {};
dui.tree.Item.makeItem = function () {
	var el = document.createElement("span");
	el.className = "LtreeDragItem";
	Element.extend(el);
	Object.extend(el, dui.tree.Item.prototype);
	el.init();
	return el;
};

Object.extend(dui.tree.Item.prototype, dui.dnd.Dragable.prototype);
Object.extend(dui.tree.Item.prototype, 
{
	boundSpace : 4,
	selected : false,
	tree : null,
	
	init : function () {
	},

	beforeMouseDownOnItem : function (aEvent) {},
	afterMouseDownOnItem : function (aEvent) {},
	beforeMouseMoveOnItem : function (aEvent) {}, 
	afterMouseMoveOnItem : function (aEvent) {}, 
	beforeMouseUpOnItem : function (aEvent) {},
	afterMouseUpOnItem : function (aEvent) {},
	dragStartedOnItem : function (aEvent) {}, 
	dragEndedOnItem : function (aEvent) {}, 
	clickedOnItem : function (aEvent) {}, 

	beforeMouseDown : function (aEvent) {
		this.beforeMouseDownOnItem(aEvent);
		dui.CB.stopPropagation(aEvent);
	},
	
	afterMouseDown : function (aEvent) {
		this.afterMouseDownOnItem(aEvent);
	},

	beforeMouseMove : function (aEvent) {
		this.beforeMouseMoveOnItem(aEvent);
	},

	afterMouseMove : function (aEvent) {
		if (!this.node.tree.moveNode) return;
		
		this.afterMouseMoveOnItem(aEvent);
		this.container.checkBound(this);
	},
	
	beforeMouseUp : function (aEvent) {
		this.beforeMouseUpOnItem(aEvent);
	},

	afterMouseUp : function(aEvent){
		this.afterMouseUpOnItem(aEvent);
	},
	
	dragStarted : function (aEvent) {
		if (!this.node.tree.moveNode) return;

		if (this.dragStartedOnItem(aEvent) == false) return false;
		this.container.dragItem(this);
	},
	
	dragEnded : function (aEvent) {
		if (!this.node.tree.moveNode) return;

		this.dragEndedOnItem(aEvent);
		this.container.releaseItem(this);
	},
	
	clicked : function (aEvent) {
		this.clickedOnItem(aEvent);
	},
	
	getBound: function (position) {
		if (!this.node.tree.nodeHeight) {
			this.node.tree.nodeHeight = this.node.lineImg.offsetHeight;
		}
		var offsets = this.cumulativeOffset();
		var x = offsets[0];
		var y = offsets[1]+this.offsetHeight-this.node.tree.nodeHeight;
		var width = this.offsetWidth;
		var height = this.node.tree.nodeHeight;

		switch (position) {
			case "middle" : return {x:x, x2:x+width, y:y+height/2-this.boundSpace/2,y2:y+height/2+this.boundSpace/2};
			case "top"    : return {x:x, x2:x+width, y:y, y2:y+this.boundSpace};
			case "bottom" : return {x:x, x2:x+width, y:y+height-this.boundSpace, y2:y+height};
		}
	}, 
	
	onclick : function (aEvent) {
		this.node.tree.registerSelected(this.node);
		dui.CB.stopPropagation(aEvent);
	}});	

/*
* dui.tree.List
*/
dui.tree.List = Class.create();
dui.tree.List.prototype = {
	items : null,
	root : null,
	insertPosition : null,
	boundLine : null,
	selectedFolder : null,
	changeListOrder : true,
	boundPosition : "middle",
	
	onMovable : function (hoverItem, nearItem) {},
	onNotMovable : function (hoverItem) {},
	
	initialize : function (el) {
		this.items = [];
		this.insertPosition = {};
	},
	
	addItem : function (item) {
		item.container = this;
		this.items.push(item);
	},
	
	setBoundPosition : function (position) {
		this.boundPosition = position;
	},
	
	checkBound: function (hoverItem) {
		if (!this.changeListOrder) return;
		
		var bound1 = hoverItem.getBound(this.boundPosition);
		var overlap = false;
		var where;
		for (var i=0; i<this.items.length; i++) {
			if (this.items[i].offsetHeight == 0 ||this.items[i] == hoverItem || this.items[i].node.descendantOf(hoverItem.node)) continue;
			if ( (this.items[i].node.next() != hoverItem.node && this.isOverlap(bound1, this.items[i].getBound(where = "bottom"))) || 
				(!this.items[i].node.previous() && this.isOverlap(bound1, this.items[i].getBound(where = "top"))) ||
				(this.items[i].node.imFolder && this.isOverlap(bound1, this.items[i].getBound(where = "middle")))
				) {
				//dui.log(this.items[i].getElementsByTagName("span")[1].innerHTML+":"+this.items[i].parentNode.previous()+":"+where)
				overlap = true;
				break;
			} 
		}
		if (overlap) {
			this.showMoveSign(this.items[i], where);
		} else {
			this.removeBoundLine();
			this.unselectFolder();
		}
	},
	
	showMoveSign : function (item, where) {
		if (where == "middle") {
			if (this.selectedFolder) {
				 if (this.selectedFolder == item) return;
				 else {
				 	this.unselectFolder();
					this.selectFolder(item);
				 }
			} else {
				this.removeBoundLine();
				this.selectFolder(item);
			}
			
		}
		else {
			if (this.isBoundLineVisible()) {
				if (item == this.insertPosition.item) {
					return;
				}
				else {
					this.removeBoundLine();
					this.showBoundLine(item, where);
				}
			} else {
				this.unselectFolder();
				this.showBoundLine(item, where);
			}
		}
	},
	
	selectFolder : function (item) {
		item.style.backgroundColor = "#3399FF";
		this.selectedFolder = item;
	},
	
	unselectFolder : function () {
		if (!this.selectedFolder) return;
		this.selectedFolder.style.backgroundColor = "";
		this.selectedFolder = null; 
	},
	
	isOverlap : function (bound1, bound2) {
		var aX = bound1.x;
		var aX2 = bound1.x2;
		var aY = bound1.y;
		var aY2 = bound1.y2;
		var bX = bound2.x;
		var bX2 = bound2.x2;
		var bY = bound2.y;
		var bY2 = bound2.y2;
		
		//dui.log(aX+","+aX2+","+aY+","+aY2+","+bX+","+bX2+","+bY+","+bY2);
		if (!((aX < bX && aX2 < bX) || (aX > bX2 && aX2 > bX2) || (aY < bY && aY2 < bY) || (aY > bY2 && aY2 > bY2)) ) {
			return true;
		}
		return false;
	},
	
	dragItem : function (item) {
		if (!item.clonedItem) {
			item.clonedItem = this.getClone(item);
		}
		item.insertAdjacentElement('afterEnd', item.clonedItem);

		this.absolutize(item);
		document.body.appendChild(item);

		item.style.zIndex = 9999;
		item.addClassName("LtreeDragged");
	},
	
	getClone : function (item) {
		var EL = document.createElement(item.tagName);
		EL.className = "LtreeClone";
		EL.style.display = "inline";
		EL.nowrap = "nowrap";
		EL.innerHTML = item.innerHTML;
		EL.imClone = true;
		return EL;
	},

	absolutize : function(item) {
		item.oldstyle = {
			position:item.style.position, 
			left:item.style.left,
			top:item.style.top,
			width:item.style.width, height:item.style.height,
			marginLeft:item.getStyle("marginLeft"),
			marginTop:item.getStyle("marginTop")
		};

		var offsets = item.cumulativeOffset();
		var top     = offsets[1];
		var left    = offsets[0];
		//var dimensions = item.getDimensions();
		//var width   = dimensions.width;
		//var height  = this.tree.nodeHeight || dimensions.height;
		//var oldHeight = item.offsetHeight;
		item.style.position = "absolute";
		item.style.left = left + "px"
		//item.style.top = top - (item.offsetHeight-oldHeight) + "px"
		item.style.top = top + "px"
		//item.style.width = width + "px";
		//item.style.height = height + "px";
		item.style.marginLeft = "0";
		item.style.marginTop = "0";
	},

	deabsolutize : function (item) {
		item.adjacent.insertAdjacentElement("afterEnd", item);
		item.style.position = item.oldstyle.position;
		item.style.left = item.oldstyle.left;
		item.style.top = item.oldstyle.top;
		item.style.width = item.oldstyle.width;
		item.style.height = item.oldstyle.height;
		item.style.marginLeft = item.oldstyle.marginLeft;
		item.style.marginTop = item.oldstyle.marginTop;
	},
	
	releaseItem : function (item) {
		if (this.isBoundLineVisible() || this.selectedFolder) {
			if (this.isBoundLineVisible()) {
				var where = this.insertPosition.where == "top" ? "beforeBegin" : "afterEnd";
				this.insertPosition.item.node.insertAdjacentElement(where, item.node);
				this.removeBoundLine();
				where = this.insertPosition.where == "top" ? "previous" : "next";
				this.tree.onChange(item.node, this.insertPosition.item.node, where);
			} else 	if (this.selectedFolder) {
				var childUL = this.selectedFolder.node.getChildUL();
				if (!childUL) {
					childUL = new Element("ul");
					this.selectedFolder.node.appendChild(childUL);
				}
				childUL.appendChild(item.node);
				this.tree.onChange(item.node, this.selectedFolder.node, "into");
				this.unselectFolder();
			}
			var nodeUL = item.node.parentNode;
			if (nodeUL.getElementsByTagName("li").length == 0) nodeUL.parentNode.removeChild(nodeUL);
			this.resetItems();
			this.tree.draw(this.tree.root, false);
		}
		this.deabsolutize(item);
		item.removeClassName("LtreeDragged");
		item.clonedItem.parentNode.removeChild(item.clonedItem);
	},
	
	resetItems : function () {
		var items = document.getElementsByClassName("LtreeDragItem");
		for (var i=0; i<items.length; i++) {
			this.items[i] = items[i];
		}
	},
	
	showBoundLine : function (item, where) {
		if (!this.boundLine) {
			var EL = new Element("div");
			EL.className = "LtreeBoundLine";
			EL.style.overflow = "hidden"
			EL.style.position = "absolute";
			EL.style.display = "none";
			document.body.appendChild(EL);
			this.boundLine = EL;
		}
		var lineImg = item.node.lineImg;
		var offsets = lineImg.cumulativeOffset();
		var left    = offsets[0]+lineImg.offsetWidth;
		var top     = where == "top" ? offsets[1] :offsets[1]+lineImg.offsetHeight-2;

		this.boundLine.style.left = left + "px"
		this.boundLine.style.top = top + "px"
		this.boundLine.style.width = item.offsetWidth + "px"
		this.boundLine.style.display = "block";
		this.insertPosition.item = item;
		this.insertPosition.where = where;
	},

	removeBoundLine : function () {
		if (this.boundLine && this.boundLine.style.display == "block") {
			this.boundLine.style.display = "none";
		}
	},
	
	isBoundLineVisible : function () {
		if (this.boundLine && this.boundLine.style.display == "block") return true;
		return false;
	},
	
	enableChangeListOrder : function (flag) {
		this.changeListOrder = flag;
	}
}


dui.hhmenu = {};
dui.hhmenu.HHMenu = function() {};
dui.hhmenu.HHMenu.prototype = {
	rootUL : null,
	menus : [],
	hoverMenu : null,
	currentMenu1 : null,
	currentMenu2 : null,
	timer : null,
	hasTimeout : false,
	
	init : function (ulObj) {
		if (typeof(ulObj) == "string") ulObj = document.getElementById(ulObj);
		this.rootUL = D$(ulObj);
		var menus = this.rootUL.childElements();
		var currentMenu1, currentMenu2;
		for (var i=0; i<menus.length; i++) {
			menus[i].childUL = D$(D$(menus[i]).getElementsByTagName("ul")[0]);
			menus[i].link = menus[i].getElementsByTagName("a")[0];
			dui.CB.addEventHandler(menus[i].link, "mouseover", this.onMouseOver.bind(this, menus[i]));
			dui.CB.addEventHandler(menus[i].link, "focus", this.onMouseOver.bind(this, menus[i]));
			dui.CB.addEventHandler(menus[i].link, "mouseout", this.onMouseOut.bind(this, menus[i]));
			menus[i].index = i;
			if (this.currentMenu1 == null && menus[i].hasClassName("Lcurrent")) currentMenu1 = i;
			if (menus[i].childUL) {
				//this.adjustPosition(menus[i].childUL);
				dui.CB.addEventHandler(menus[i].childUL, "mouseover", this.onMouseOver.bind(this, menus[i]));
				dui.CB.addEventHandler(menus[i].childUL, "mouseout", this.onMouseOut.bind(this, menus[i]));

				menus[i].childMenus = menus[i].childUL.childElements();
				for (var j = 0; j < menus[i].childMenus.length; j++) {
					if (D$(menus[i].childMenus[j]).hasClassName("Lcurrent")) currentMenu2 = j;
					menus[i].childMenus[j].index = j;
				}
			}
		}
		this.addHoverEvent();
		this.menus = menus;
		this.setCurrent(currentMenu1, currentMenu2);
		//this.showMenu(menus[this.currentMenu1]);
	},
	
	addHoverEvent : function () {
		var mouseOverHandler = function () {
			this.addClassName("Lhover");
			this.addClassName("Lhover"+this.index);
		}
		var mouseOutHandler = function () {
			this.removeClassName("Lhover");
			this.removeClassName("Lhover"+this.index);
		}
		var menus = this.rootUL.getElementsByTagName("li");
		for (var i = 0; i < menus.length; i++) {
			dui.CB.addEventHandler(menus[i], "mouseover", mouseOverHandler.bind(menus[i]));
			dui.CB.addEventHandler(menus[i], "mouseout", mouseOutHandler.bind(menus[i]));
		}
	},
	
	setCurrent : function (idx1, idx2) {
		if (this.currentMenu1 != null) {
			this.currentMenu1.removeClassName("Lcurrent");
			this.currentMenu1.removeClassName("Lcurrent" + this.currentMenu1.index);
			this.hideMenu(this.currentMenu1);
			this.currentMenu1 = null;
		}
		if (idx1 >= 0) {
			this.menus[idx1].addClassName("Lcurrent");
			this.menus[idx1].addClassName("Lcurrent"+idx1);
			//this.showMenu(this.menus[idx1]);
			this.currentMenu1 = this.menus[idx1];
		}
		
		if (this.currentMenu2 != null) {
			this.currentMenu2.removeClassName("Lcurrent");
			this.currentMenu2.removeClassName("Lcurrent" + this.currentMenu2.index);
			this.currentMenu2 = null;
		}
		if (idx2 >= 0) {
			this.menus[idx1].childMenus[idx2].addClassName("Lcurrent");
			this.menus[idx1].childMenus[idx2].addClassName("Lcurrent"+idx2);
			this.currentMenu2 = this.menus[idx1].childMenus[idx2];
		}
	},
	
	adjustPosition : function (childUL) {
		childUL.style.visibility = "hidden";
		var oldDisplay = D$(childUL).getStyle("display");
		childUL.style.display = "block";
		this.setULWidth(childUL);

		var childOffset = childUL.offsetParent == childUL.parentNode ?  childUL.offsetLeft+childUL.parentNode.offsetLeft : childUL.offsetLeft; // 원래 왼쪽에서부터의 거리
		var offset = (childUL.offsetWidth - childUL.parentNode.offsetWidth)/2;  // 왼쪽으로 이동시킬 거리
		if (offset > childOffset) offset = childOffset; // 이동시킬 거리가 왼쪽끝보다 많으면 왼쪽끝에 붙인다.
		childOffset -= offset;

		// align right
		var rightOffset = childUL.offsetWidth + childOffset - this.rootUL.offsetWidth;
		if (rightOffset > 0) offset += rightOffset;

		if (this.userOffset) offset += this.userOffset;
		childUL.style.left = childUL.offsetLeft - offset + "px";
		childUL.style.visibility = "visible";
		childUL.style.display = oldDisplay;		
	},
	
	setULWidth : function (childUL) {
		var liList = childUL.getElementsByTagName("li");
		var width = 0;
		for (var i=0; i<liList.length; i++) {
			var li = D$(liList[i]);
			width += li.offsetWidth+parseInt(li.getStyle("margin-left"))+parseInt(li.getStyle("margin-right"));
		}
		childUL.style.width = width+20+"px"; // firefox에서는 포지셔닝된 부모보다 width가 커지지 못해 아래로 떨어지므로 width를 지정해주어야 함. 20은 여유분.
	},
	
	onMouseOver : function (menu) {
		if (this.timer) clearTimeout(this.timer);
		//this.hideMenu(this.currentMenu1);
		this.hideMenu(this.hoverMenu);
		this.showMenu(menu);
		this.hoverMenu = menu;
	},
	 
	onMouseOut : function (menu) {
		if (this.hasTimeout)
			this.timer = setTimeout(this.doMouseOut.bind(this, menu), 700);
		else 		
			this.doMouseOut(menu);
	},
	
	doMouseOut : function (menu) {
		this.hideMenu(menu);
		//this.showMenu(this.currentMenu1);
	},
	
	showMenu : function (menu) {
		if (menu && menu.childUL) menu.childUL.style.display = "block";
	},
	
	hideMenu : function (menu) {
		if (menu && menu.childUL) menu.childUL.style.display = "none";
	}
}

/**
*  dui_tab.js version 1.0
*
* AUTHORS LIST       E-MAIL  
* jaehyun lim    jhylim@lgcns.com
*/
dui.Tab = function (obj) {
	this.initialize(obj);
}
dui.Tab.initPage = function () {
	var divs = document.getElementsByTagName("div");
	for (var i = 0; i < divs.length; i++) {
		if (divs[i].className.indexOf("tab_area") != -1) new dui.Tab(divs[i]);
	}
}
dui.Tab.prototype = {
	initialize : function(tabList) {
		if (typeof tabList == "string") tabList = document.getElementById(tabList);
		if (!tabList) return;
		var tabs = tabList.getElementsByTagName("li");
		for (var i=0; i<tabs.length; i++) {
			tabs[i].index = i;
			var link = tabs[i].getElementsByTagName("a")[0];
			if (!link.onclick) link.onclick = function () { return false; }
			dui.CB.addEventHandler(tabs[i], "click", function () {
				for (var k=0; k<tabs.length; k++) {
					var link = tabs[k].getElementsByTagName("a")[0];
					if (link && link.href && (linkIndex = link.href.lastIndexOf("#")) != -1 && 
						(tabarea = document.getElementById(link.href.substring(linkIndex+1)))) {
						if (k == this.index) tabarea.style.display = "block";
						else tabarea.style.display = "none";
					}
					if (k == this.index) D$(this).addClassName("Lcurrent");
					else D$(tabs[k]).removeClassName("Lcurrent");
				}
			}.bind(tabs[i]));
		}
	}
}
/*
dui.Tab = function (obj) {
	this.initialize(obj);
}
dui.Tab.initPage = function () {
	var divs = document.getElementsByTagName("div");
	for (var i = 0; i < divs.length; i++) {
		if (divs[i].className.indexOf("leftMenuTab") != -1) new dui.Tab(divs[i]);
	}
}
dui.Tab.prototype = {
	initialize : function(tabList) {
		if (typeof tabList == "string") tabList = document.getElementById(tabList);
		if (!tabList) return;
		var tabs = tabList.getElementsByTagName("li");
		for (var i=0; i<tabs.length; i++) {
			tabs[i].index = i;
			var link = tabs[i].getElementsByTagName("a")[0];
			if (!link.onclick) link.onclick = function () { return false; }
			dui.CB.addEventHandler(tabs[i], "click", function () {
				for (var k=0; k<tabs.length; k++) {
					var link = tabs[k].getElementsByTagName("a")[0];
					if (link && link.href && (linkIndex = link.href.lastIndexOf("#")) != -1 && 
						(tabarea = document.getElementById(link.href.substring(linkIndex+1)))) {
						if (k == this.index) tabarea.style.display = "block";
						else tabarea.style.display = "none";
					}
					if (k == this.index) D$(this).addClassName("Lcurrent");
					else D$(tabs[k]).removeClassName("Lcurrent");
				}
			}.bind(tabs[i]));
		}
	}
}
*/



dui.SlideMenu = {};

dui.SlideMenu = function () {};
dui.SlideMenu.makeSlideMenu = function (elId, isFrame, autoClose) {
	var el = D$(elId);
	Object.extend(el, dui.SlideMenu.prototype);
	el.isFrame = isFrame==undefined ? true : isFrame; 
	el.autoClose = autoClose==undefined ? true : autoClose; 
	el.init();
	return el;
};
dui.SlideMenu.prototype = {
	isFrame : null,
	autoClose : null,
	currLI : null,
	openLI : [],
	beforeOpen : function(menu) {},
	afterOpen : function(menu) {},
	beforeClose : function(menu) {},
	afterClose : function(menu) {},

	init : function() {
		this.setMenu(this, 0);
	},

	setMenu : function(UL, depth) { 
		var LIs = UL.childElements();
		for (var i=0; i<LIs.length; i++) {
			D$(LIs[i]).depth = depth;
			if (LIs[i].hasClassName("Lcurrent")) this.currLI = LIs[i];
			var childUL = this.getChildUL(LIs[i]);
			if (childUL) {
				LIs[i].childUL = D$(childUL);
				LIs[i].state = "closed";
				if (LIs[i].hasClassName("Lopen")) {
					LIs[i].state = "open";
					this.openLI[depth] = LIs[i]
				}
				this.setMenu(childUL, depth+1);
			} else 	LIs[i].state = "none";
			
			dui.CB.addEventHandler(LIs[i], "click", this.toggle.bind(this));
		}
	},	

	getChildUL : function(LI) { 
		var childElements = LI.childElements(); 
		if (childElements[childElements.length-1].tagName == "UL") return childElements[childElements.length-1];
		else return null;
	},
	
	toggle : function(evt) {
		var LI;
		if (evt.tagName == "LI") LI = evt;
		else {
			dui.CB.stopPropagation(evt);
			var evtSrc = evt.target ? evt.target : evt.srcElement;
			if (!this.isFrame && evtSrc.tagName == "A" && evtSrc.href.substr(evtSrc.href.length-1)!="#") return;
			LI = this.getLIFromEvtSrc(evtSrc);
			if (!LI) return;
		} 
		
		this.setCurrent(LI);
		
		if (this.autoClose) {
			if (this.openLI[LI.depth] && this.openLI[LI.depth] == LI) return;
			if (this.openLI[LI.depth]) this.close(this.openLI[LI.depth]);
			this.open(LI);
			this.openLI[LI.depth] = LI;
		} else {
			if (LI.state == "open") this.close(LI);
			else if (LI.state == "closed") this.open(LI);
		}
	},
	
	setCurrent : function (LI) {
		if (!LI.hasClassName("Lcurrent")) {
			if (this.currLI) this.currLI.removeClassName("Lcurrent");
			LI.className += " Lcurrent ";				
			this.currLI = LI;
		}
	},
	
	open : function(LI) {
		if (!LI || !LI.childUL) return;
		LI.childUL.style.display = "block";
		LI.state = "open";
		LI.addClassName("Lopen");
	},
	
	close : function(LI) {
		if (!LI || !LI.childUL) return;
		LI.childUL.style.display = "none";
		LI.state = "closed";
		LI.removeClassName("Lopen");
	},
	
	selectMenu : function(idx0, idx1, idx2) {
		if (arguments.length == 1) this.toggle(this.childElements()[idx0]);
		else if(arguments.length == 2)	 this.toggle(this.childElements()[idx0].childUL.childElements()[idx1]);
		else if(arguments.length == 3) this.toggle(this.childElements()[idx0].childUL.childElements()[idx1].childUL.childElements()[idx2]);
		
		this.init();
	},
	
	getLIFromEvtSrc : function (obj) {
		if (obj.tagName == "LI") return obj;
		if (obj.tagName == "SPAN") return obj.parentNode;
		if (obj.tagName == "A") return obj.parentNode.parentNode;
		return null;
	}
}



var PROJECT_CODE = "../../..";

try { dui } catch(e) { dui = {}; }

dui.Calendar = function (pDate, pCtrl, pFormat, index, pPosition) {
	this.Date = pDate.getDate();
	this.Month = pDate.getMonth();
	this.Year = pDate.getFullYear();
	this.Format = dui.Calendar.DefaultFormat;
	if ( index == undefined ) {
		this.Ctrl = document.getElementById(pCtrl);
	} else {
		this.Ctrl = document.getElementsByName(pCtrl)[index];
	}
	this.inputDate = null;
	this.today = new Date();
	this.position = pPosition ? pPosition : dui.Calendar.Position.DOWN;
	if ( !this.Ctrl )
		this.Ctrl = {};
	if ( !this.Ctrl.id )
		this.Ctrl.id = {};
	this.Ctrl.id = pCtrl;
			
	if (pFormat != null)
		this.Format = pFormat;
	
	this.getCalendarStyles = [this.getCalendarStyle0, this.getCalendarStyle1, this.getCalendarStyle2, this.getCalendarStyle3];
}



/******************************************************************************
* User Options
******************************************************************************/

//Change this image path into your calendar images path.
dui.Calendar.imgPath = PROJECT_CODE+"/images/";

//Change this date format into your system standard format.
dui.Calendar.DefaultFormat = "YYYY-MM-DD";

//Change calendar style. select 0/1/2/3
dui.Calendar.CalendarStyle = 2;

//Change calendar title style. Each index of this array is mapped with "dui.Calendar.CalendarStyle" value.
dui.Calendar.CalendarTitleFormat = ["YYYY. mm", "YYYY년 mm월", "YYYY. mm", "YYYY"];

//Change calendar header names
dui.Calendar.weekDayNames = [PROJECT_CODE+"/images/common/cal_day_sun.gif"
                            ,PROJECT_CODE+"/images/common/cal_day_mon.gif"
                            ,PROJECT_CODE+"/images/common/cal_day_tue.gif"
                            ,PROJECT_CODE+"/images/common/cal_day_wed.gif"
                            ,PROJECT_CODE+"/images/common/cal_day_thu.gif"
                            ,PROJECT_CODE+"/images/common/cal_day_fri.gif"
                            ,PROJECT_CODE+"/images/common/cal_day_sat.gif"];
//dui.Calendar.weekDayNames = ["일","월","화","수","목","금","토"];
//dui.Calendar.weekDayNames = ["日","月","火","水","木","金","土"];

//Change 'title' attribute value in date link. 
dui.Calendar.titleOfToday = "Today";
dui.Calendar.titleOfSelectedDay = "Selected Day";

/******************************************************************************/


dui.Calendar.Position = { DOWN:0, UP:1 , UP_LEFT_PR:2, UP_RIGHT_PR:3};

dui.Calendar.open = function (pCtrl, defCtrl, ftGbn, othFunc, pPosition, pFormat) {
	
	if (popup_calendar.clickObj) {
		var id = popup_calendar.clickObj.id;
		if (null != document.getElementById('mcalendar_pop')) {
			popup_calendar.removePopupCalendar(document.getElementById('mcalendar_pop'));
		}
		if (id == pCtrl) {
			return;
		}
	}

	if (defCtrl) {
		calendarDoubleIdOpen(pCtrl, defCtrl, ftGbn);
	} else {
		calendarSingleIdOpen(pCtrl);
	}
	
	/*try {

		if (dui.Calendar.Cal) {
			if( dui.Calendar.Cal.elem ) {

				var id = dui.Calendar.Cal.Ctrl.id;
				dui.Calendar.close();
				if( id == pCtrl ) // The user clicked the same control that opened us so and return.
					return;
			}
		}
		dui.Calendar.Cal = new dui.Calendar(new Date(), pCtrl, pFormat, null, pPosition);
		dui.Calendar.Cal.defCtrl = defCtrl;
		dui.Calendar.Cal.ftGbn = ftGbn;
		dui.Calendar.Cal.othFunc = othFunc;
		dui.Calendar.Cal.open();
		$("body").bind("click",dui.Calendar.close);
	} catch (e) {
		if (e.name == "DevOnCalendarError") {
			alert(e.message);
		}
	}*/
}

dui.Calendar.ListOpen = function (pCtrl, index, pPosition, pFormat) {
	
	try {
		if (dui.Calendar.Cal) {
			if( dui.Calendar.Cal.elem ) {
				var id = dui.Calendar.Cal.Ctrl.id;
				dui.Calendar.close();
				if( id == pCtrl ) // The user clicked the same control that opened us so and return.
					return;
			}
		}
		dui.Calendar.Cal = new dui.Calendar(new Date(), pCtrl, pFormat, index, pPosition);
		dui.Calendar.Cal.index = index;
		dui.Calendar.Cal.open();
		$("body").bind("click",dui.Calendar.close);
		
	} catch (e) {
		if (e.name == "DevOnCalendarError") {
			alert(e.message);
		}
	}
}

dui.Calendar.close = function (event) {
	
	if ( event == null || event.target.name != "" ) {
		$("body").unbind("click",dui.Calendar.close);
		dui.Calendar.Cal.close();
		delete dui.Calendar.Cal;
	}
}

dui.Calendar.prototype = {
	MonthName : ["1","2","3","4","5","6","7","8","9","10","11","12"],
	WeekDayName : ["Sun","Mon","Tue","Web","Thu","Fri","Sat"],
	//dui.Calendar.BodyOverflow = "",
	selectControls : null,
	
	open : function() {
	
		this.parseDate(this.Ctrl.value);
	
		this.render();
	
		var oSelects = document.getElementsByTagName("select");
	
		this.selectControls = new Array(oSelects.length);
	
		this.hideSelects();
	
	},
	
	close : function() {
		this.elem.parentNode.removeChild(this.elem);
		//document.body.style.overflow = dui.Calendar.BodyOverflow;
		this.showSelects();
		delete this.selectControls;
	},
	
	showSelects : function () {
		if( !this.selectControls[0] ) return;
		for(var i=0; i < this.selectControls.length && this.selectControls[i]; i++ )
		this.selectControls[i].style.visibility = "visible";
	},
	
	hideSelects : function () {
		if(!document.all ){
			this.selectControls[0] = null;
			return;
		}
		var b_version = navigator.appVersion // start testing for IE version 7 or higher
		var verels = b_version.split(';');
		for( var i = 0; i < verels.length; i++ )
			if( verels[i].indexOf("MSIE") != -1 )
				break;
		if( i != verels.length ) {
			verels = verels[i].split(" ");
			if( parseFloat(verels[2]) >= 7.0 ) // select problem with rendering over top fix in IE 7 so return
				return;
		}
		var oSelects = document.getElementsByTagName("select");
		var count = 0;
		b1t = parseInt(this.elem.style.top);
		b1h = parseInt(this.elem.offsetHeight);
		b1l = parseInt(this.elem.style.left)
		b1w = parseInt(this.elem.offsetWidth);
		for(var i=0; i < oSelects.length; i++) {
			b2t = parseInt(this.fDomOffset(oSelects[i], 'offsetTop'));
			b2h = parseInt(oSelects[i].offsetHeight);
			b2l = parseInt(this.fDomOffset(oSelects[i], 'offsetLeft'));
			b2w = parseInt(oSelects[i].offsetWidth);
			if( b1t <= b2t && (b1t + b1h) >= b2t && b1l <= (b2l + b2w) && (b1l + b1w) >= b2l ) {
				oSelects[i].style.visibility="hidden";
				this.selectControls[count++] = oSelects[i];
			}
			else
				this.selectControls[count] = null;
		}
	},
	
	parseDate : function (date) {		
		if (date == null || date == "" || date == "undefined") return;
		var format = this.Format;
		if(date.length==8) {
			format = 'YYYYMMDD';
		}
		this.inputDate = null;
		var year = parseInt(date.substr(this.Format.indexOf("YYYY"), 4),10);
		var index = format.indexOf("MM") == -1 ? format.indexOf("mm") : format.indexOf("MM");
		var month = parseInt(date.substr(index, 2),10) - 1;
		index = format.indexOf("DD") == -1 ? format.indexOf("dd") : format.indexOf("DD");
		var dateOfMonth = parseInt(date.substr(index, 2),10);

		var tmp_Year = this.Year;
		var tmp_Month = this.Month;
		var tmp_Date = this.Date;
		
		this.Year = year;
		this.Month = month;
		this.Date = dateOfMonth;
	
		if (isNaN(month)) { 
			this.Year = tmp_Year;
			this.Month = tmp_Month;
			this.Date = tmp_Date;
			throw this.getError("날짜가 정해진 형식과 일치하지 않습니다.("+this.Format+")");
		}
		
		if ( (month < 0 || month >= 12) || (dateOfMonth > this.GetMonDays() || dateOfMonth < 1) ){
			this.Year = tmp_Year;
			this.Month = tmp_Month;
			this.Date = tmp_Date;
			
			throw new Error("날짜가 잘못되었습니다.");
		}

		this.inputDate = new Date(year, month, dateOfMonth);
		
	},
	
	render : function () {
		var vCalHeader;
		var vCalData;
		var i;
		var j;
		var SelectStr;
		var vDayCount=0;
		var vFirstDay;
		var setFocus = "";
		
		//vCalHeader = dui.Calendar.CalendarStyles[dui.Calendar.CalendarStyle];
		vCalHeader = this.getCalendarStyles[dui.Calendar.CalendarStyle].call(this);

		vCalHeader += 
		    "<div class='cal_popframe_b'>" +
			"    <table class='body'>" +
			"	     <thead>" +
			"		     <tr>";

		for (i=0; i<7; i++) {
			vCalHeader += "<th class='idx"+i+"'>"+"<img src='"+dui.Calendar.weekDayNames[i]+"' alt='일' />"+"</th>";
		}
		vCalHeader += "</tr></thead>";
		
		CalDate = new Date(this.Year,this.Month);
		CalDate.setDate(1);
		vFirstDay = CalDate.getDay();
		vCalData = "<tbody><tr>";
		
		for (i=0; i<vFirstDay; i++) {
			vCalData = vCalData + this.genCell();
			vDayCount = vDayCount + 1;
		}
		
		for (j=1; j<=this.GetMonDays(); j++) {
			var strCell;
			vDayCount = vDayCount+1;
			
			if ((j == this.today.getDate()) && (this.Month == this.today.getMonth()) && (this.Year == this.today.getFullYear())) {
				strCell = this.genCell(j, "today");
				setFocus = "cal_"+j;
			}
			else {
				if (this.inputDate && j == this.Date && this.Month == this.inputDate.getMonth() && this.Year == this.inputDate.getFullYear()) {
					strCell = this.genCell(j, "inputday");
					setFocus = "cal_"+j;
				} else {
					if (vDayCount%7 == 0)
						strCell = this.genCell(j, "saturday");
					else if ((vDayCount+6)%7 == 0)
						strCell = this.genCell(j, "sunday");
					else
						strCell = this.genCell(j, "weekday");
				}
			}
			
			vCalData = vCalData+strCell;
			if((vDayCount%7 == 0) && (j < this.GetMonDays())) {
				vCalData = vCalData + "</tr><tr>";
			}
		}
		
		var vDropCalander = vCalHeader + vCalData + "</td></tr></tbody></table></div>";
		
		if ( dui.Calendar.Cal.index == undefined || dui.Calendar.Cal.index == null ) {
			var obj = document.getElementById(this.Ctrl.id);
		} else {
			var obj = document.getElementsByName(this.Ctrl.id)[dui.Calendar.Cal.index];
		}
		
		var offsets = this.getCumulativeOffset(obj);
		var leftpos = offsets.left;
		//var objPosition = dui.Calendar.getPosition(obj);
		//var leftpos = objPosition.left;
		//var bottom = objPosition.top + obj.offsetHeight;
		var Width = this.getClientWidth();
		var Height = this.getClientHeight();
		var ScrollPos = this.getScrollTop();
		var ScrollHeight = document.body.scrollHeight;
		if( this.elem == null){
			this.elem = document.createElement('div');
			this.elem.id = "LduiCalendar";
			this.elem.className = "style"+dui.Calendar.CalendarStyle;
			this.elem.style.position = "absolute";
			this.elem.style.left = leftpos + "px";
			this.elem.style.zIndex = 9999;
		}
		this.elem.innerHTML = "<div>"+vDropCalander+"</div>";
		
		/*
		if( BodyOverflow == 'auto' && ScrollHeight <= Height ) // if height of page is close to browser client height
		  document.body.style.overflow = 'hidden';              // and overflow is auto, the addition of the div could
		 document.body.appendChild(Cal.elem);                   // make the scrollbar show so lets hide it while the
		 var elemHeight = Cal.elem.offsetHeight;                // calendar is up
		*/	

		document.body.appendChild(this.elem);

		switch (this.position) {
		
			case dui.Calendar.Position.DOWN:
				this.elem.style.top = offsets.top + obj.offsetHeight + "px";
				break;
			case dui.Calendar.Position.UP:
				this.elem.style.top = offsets.top - this.elem.offsetHeight + "px";
				break;
			case dui.Calendar.Position.UP_LEFT_PR:
				this.elem.style.top = offsets.top - this.elem.offsetHeight + 22 + "px";
				this.elem.style.left = offsets.left - 100 + "px";
				break;
			case dui.Calendar.Position.UP_RIGHT_PR:
				this.elem.style.top = offsets.top - this.elem.offsetHeight + 22 + "px";
				this.elem.style.left = offsets.left + 86 + "px";
				break;
		}
		// link to jump to calendar for web Accessbility.
		if ( document.getElementById(setFocus) != null ) {
			document.getElementById(setFocus).focus();
		} else {
			document.getElementById("cal_1").focus();
		}
	
		var elemHeight = this.elem.offsetHeight;
	
		//if ( !elemHeight )
		//	elemHeight = document.getElementById('calT1').offsetHeight;
		/*
		if ( Cal.elem.offsetTop + elemHeight > (Height + ScrollPos) ) {
			if( Cal.elem.style.top )
				Cal.elem.style.top = (objPosition.top - elemHeight) + "px";
			else
				Cal.elem.setAttribute("style.top",(objPosition.top - Cal.elem.offsetHeight) + "px");
		}
	
		while( Cal.elem.offsetLeft + Cal.elem.offsetWidth > (Width) )
			var position = dui.Calendar.getPosition(Cal.elem);
			if( Cal.elem.style.left )
				Cal.elem.style.left = (objPosition.left - 1) + "px";
			else
				Cal.elem.setAttribute("style.left", (objPosition.left - 1) + "px");
		*/		
	},
	
	getCalendarStyle0 : function()	 {
		var header = 
		"<div class='toolbar'>"+
		"	<img class='pre_month' src='"+dui.Calendar.imgPath+"calendar_pre_month.gif' onclick='dui.Calendar.Cal.decreaseMonth();dui.Calendar.Cal.render();' alt='이전달'>" +
		"	<span class='title'>"+this.FormatDate(null, dui.Calendar.CalendarTitleFormat[0])+"</span>"+
		"	<img class='next_month' src='"+dui.Calendar.imgPath+"calendar_next_month.gif' onclick='dui.Calendar.Cal.increaseMonth();dui.Calendar.Cal.render();' alt='다음달'>"+
		"</div>";
		return header;
	},
	
	getCalendarStyle1 : function() {
		var header = 
		"<div class='toolbar'>"+
		"	<img class='pre_month' src='"+dui.Calendar.imgPath+"calendar_pre_month.gif' onclick='dui.Calendar.Cal.decreaseMonth();dui.Calendar.Cal.render();' alt='이전달'>" +
		"	<span class='title'>"+this.FormatDate(null, dui.Calendar.CalendarTitleFormat[1])+"</span>"+
		"	<img class='next_month' src='"+dui.Calendar.imgPath+"calendar_next_month.gif' onclick='dui.Calendar.Cal.increaseMonth();dui.Calendar.Cal.render();' alt='다음달'>"+
		"</div>";
		return header;
	},
	
	getCalendarStyle2 : function() {
		return 	"<div class='cal_popframe_t'>"+
		"	<a href=\"#\" onclick='dui.Calendar.Cal.decreaseYear();dui.Calendar.Cal.render();' ><img src='"+dui.Calendar.imgPath+"icon/ic_y_before.gif' alt='이전년도'></a>" +
		"	<a href=\"#\" onclick='dui.Calendar.Cal.decreaseMonth();dui.Calendar.Cal.render();' ><img src='"+dui.Calendar.imgPath+"icon/ic_m_before.gif' alt='이전달'></a>" +
		"	<span>"+this.FormatDate(null, dui.Calendar.CalendarTitleFormat[2])+"</span>" +
		"	<a href=\"#\" onclick='dui.Calendar.Cal.increaseMonth(); dui.Calendar.Cal.render();' ><img src='"+dui.Calendar.imgPath+"icon/ic_m_after.gif' alt='다음달'></a>" +
		"	<a href=\"#\" onclick='dui.Calendar.Cal.increaseYear();dui.Calendar.Cal.render();' ><img src='"+dui.Calendar.imgPath+"icon/ic_y_after.gif' alt='다음년도'></a>"+
		"</div>";
	},
	
	getCalendarStyle3 : function()	 {
		var header = 
		"<div class='toolbar'>"+
		"	<img class='pre_year' src='"+dui.Calendar.imgPath+"calendar_pre_year.gif' onclick='dui.Calendar.Cal.decreaseYear();dui.Calendar.Cal.render();' alt='이전해'>" +
		"	<span class='title'>"+this.FormatDate(null, dui.Calendar.CalendarTitleFormat[3])+"</span>"+
		"	<img class='next_year' src='"+dui.Calendar.imgPath+"calendar_next_year.gif' onclick='dui.Calendar.Cal.increaseYear();dui.Calendar.Cal.render();' alt='다음해'>"+
		"	<table class='monthSelect'><tr>";
		for (var i = 0; i < 12; i++) {
			header += "<td class='";
			if (i>8) header += "digit2";
			if (this.Month == i) 	header += " current";
			header += "'><a href='#' onclick='dui.Calendar.Cal.Month="+i+"; dui.Calendar.Cal.render(); return false;'>" + (i + 1) + "</a></td>";
		}
		header += "</tr></table></div>";
		return header;
	},
	
	getError : function(message){
		var err = new Error(message);
		err.name = "DevOnCalendarError";
		return err;
	},
	
	GetMonthIndex : function (shortMonthName) {
		for (i=0;i<12;i++){
			if (this.MonthName[i].substring(0,3).toUpperCase()==shortMonthName.toUpperCase()) {
				return i;
			}
		}
	},
	
	increaseYear : function IncYear() {
		this.Year++;
	},
	
	decreaseYear : function () {
		this.Year--;
	},
	
	increaseMonth : function () {
		this.Month++;
		if( this.Month == 12 ){
			this.Month = 0;
			this.Year++;
		}
	},
	
	decreaseMonth : function () {
		this.Month--;
		if( this.Month < 0 ){
			this.Month = 11;
			this.Year--;
		}
	},
	
	SwitchMth : function (intMth) {
		this.Month=intMth;
	},
	
	GetMonthName : function (IsLong, nextPrev) {
		var Month = this.MonthName[this.Month];

		if( nextPrev < 0 ){
			if( this.Month == 0 )
			Month=this.MonthName[11];
			else
			Month=this.MonthName[this.Month-1];
		}
		if( nextPrev > 0 ){
			if( this.Month == 11 )
			Month=this.MonthName[0];
			else
			Month=this.MonthName[this.Month+1];
		}
		if (IsLong)
			return Month;
		else
			return Month.substr(0,3);
	},
	
	//Get number of days in a month
	GetMonDays : function () {
		var DaysInMonth=[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		if (this.IsLeapYear()){
			DaysInMonth[1]=29;
		}
		return DaysInMonth[this.Month];
	},
	
	IsLeapYear : function () {
		if ((this.Year%4)==0){
			if ((this.Year%100==0) && (this.Year%400)!=0){
				return false;
			}
			else{
				return true;
			}
		}
		else{
			return false;
		}
	},
	
	FormatDate : function (date, format) {
		var strDate = format ? format : this.Format;
		var month =  this.Month+1;
		var month2 =  month >= 10 ? month : "0"+month;
		var date2;
		if (date) date2 = date >= 10 ? date : "0"+date;
		
		var re = /YYYY/gi;
       strDate = strDate.replace(re, this.Year);
		re = /mm/g;
       strDate = strDate.replace(re, month);
		re = /MM/g;
       strDate = strDate.replace(re, month2);
		re = /dd/g;
       strDate = strDate.replace(re, date);
		re = /DD/g;
       strDate = strDate.replace(re, date2);
		return strDate;
	},
	
	getCumulativeOffset : function (elem) {
		var left = 0, top = 0;
		while (elem != null){
		//alert(elem.tagName+":"+elem.innerHTML);
			left += elem.offsetLeft;
			top += elem.offsetTop;
			elem = elem.offsetParent;
		}
		return {left:left, top:top};
	},

	/*
	dui.Calendar.getPosition = function (elem) {
		var stylePosition = D$(elem).getStyle("position");
		elem.style.position = "relative";
		var position = { left:elem.offsetLeft, top:elem.offsetTop };
		if (stylePosition) elem.style.position = stylePosition;
		return position;
	}
	*/
	
	clicked : function (value) {
		//dui.Calendar.Cal.Ctrl.value = dui.Calendar.Cal.FormatDate(PValue);
		this.Ctrl.value = this.FormatDate(value);
		var ctrlValue = this.FormatDate(value);

		// 형식이 틀렸다는 내용이 필요함.
		// 일단 YYYY-MM-DD 를 기본으로 한 내용만 셋팅하기로한다.
		/*
		if ( defCtrl.length != 10 ) {
			alert("비교할 날짜형식이 YYYY-MM-DD이 아닙니다.");
		}
		*/
		
		var defCtrl = document.getElementById(dui.Calendar.Cal.defCtrl);
		
		var fromDate, toDate; 
		var fromDateArr, toDateArr; 
		
		if ( defCtrl != null && defCtrl.value != "" ) {

			if ( dui.Calendar.Cal.ftGbn == "to" ) {
				fromDateArr = (defCtrl.value).split("-");
				toDateArr = (ctrlValue).split("-");
				fromDate = new Date(fromDateArr[0], fromDateArr[1]-1, fromDateArr[2]) - 0;
				toDate = new Date(toDateArr[0], toDateArr[1]-1, toDateArr[2]) - 0;
				if ( fromDate > toDate ) {
					// 메시지 수정 : "하십시오" -> "해 주십시오." by seoul bms
					alert("종료일자를 시작일자 보다 이후로 입력해 주십시오.");
					return;
				}
			} else if ( dui.Calendar.Cal.ftGbn == "from" ) {
				fromDateArr = (ctrlValue).split("-");
				toDateArr = (defCtrl.value).split("-");
				fromDate = new Date(fromDateArr[0], fromDateArr[1]-1, fromDateArr[2]) - 0;
				toDate = new Date(toDateArr[0], toDateArr[1]-1, toDateArr[2]) - 0;
				if ( fromDate > toDate ) {
					// 메시지 수정 : "하십시오" -> "해 주십시오." by seoul bms
					alert("시작일자를 종료일자 보다 이전으로 입력해 주십시오.");
					return;
				}
			} else {
				//alert("비교할 구분자가 정의된 내용이 아님.");
			}
		}
		
		this.Ctrl.value = ctrlValue;
		this.Ctrl.focus();
		
		if ( dui.Calendar.Cal.othFunc != undefined ) {
			eval(dui.Calendar.Cal.othFunc);
		}
		
		dui.Calendar.close();
	},
	genCell : function (pValue, pClass) {
		var PValue;
		var PCellStr;
		var vColor;
		var vHLstr1;
		var vHlstr2;
		
		pClass = pClass ? pClass : "empty";
		PValue = (pValue == null) ? "&nbsp;" : pValue;
	
		var dq = '"';
		PCellStr = "<td class='"+pClass+"'>"+
			"<a id='cal_"+pValue+"' href='#' onmouseover='this.className=\"Lhover\"' onmouseout='this.className=\"\"'";
		if (pClass != "empty") PCellStr += " onclick=\"dui.Calendar.Cal.clicked('"+PValue+"'); return false;\"";
		if (pClass == "today") PCellStr += " title='"+dui.Calendar.titleOfToday+"'";
		else if (pClass == "inputday") PCellStr += " title='"+dui.Calendar.titleOfSelectedDay+"'";
		PCellStr += ">"+PValue+"</a></td>";
		return PCellStr;
	},
	getClientWidth : function () {
		return this.getResults (
			window.innerWidth ? window.innerWidth : 0,
			document.documentElement ? document.documentElement.clientWidth : 0,
			document.body ? document.body.clientWidth : 0
		);
	},
	getScrollTop : function () {
		return this.getResults (
			window.pageYOffset ? window.pageYOffset : 0,
			document.documentElement ? document.documentElement.scrollTop : 0,
			document.body ? document.body.scrollTop : 0
		);
	},
	getClientHeight : function () {
		return this.getResults (
			window.innerHeight ? window.innerHeight : 0,
			document.documentElement ? document.documentElement.clientHeight : 0,
			document.body ? document.body.clientHeight : 0
		);
	},
	getResults : function (n_win, n_docel, n_body) {
		var n_result = n_win ? n_win : 0;
		if (n_docel && (!n_result || (n_result > n_docel)))
			n_result = n_docel;
			
		return n_body && (!n_result || (n_result > n_body)) ? n_body : n_result;
	},
	fDomOffset : function( oObj, sProp ) {
		var iVal = 0;
		while (oObj && oObj.tagName != 'BODY'){
			eval('iVal += oObj.' + sProp + ';');
			oObj = oObj.offsetParent;
		}
		return iVal;
	}
}