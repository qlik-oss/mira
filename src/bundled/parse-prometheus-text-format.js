// parse-prometheus-text-format is bundled from https://github.com/yunyu/parse-prometheus-text-format awaiting a fix (https://github.com/yunyu/parse-prometheus-text-format/pull/9)


const shallowEqual = require('shallow-equal');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function');
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true,
    },
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === 'undefined' || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === 'function') return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], () => {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      const a = [null];
      a.push.apply(a, args);
      const Constructor = Function.bind.apply(Parent, a);
      const instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf('[native code]') !== -1;
}

function _wrapNativeSuper(Class) {
  const _cache = typeof Map === 'function' ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== 'function') {
      throw new TypeError('Super expression must either be null or a function');
    }

    if (typeof _cache !== 'undefined') {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true,
      },
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === 'object' || typeof call === 'function')) {
    return call;
  }

  return _assertThisInitialized(self);
}

const InvalidLineError =
/* #__PURE__ */
(function (_Error) {
  _inherits(InvalidLineError, _Error);

  function InvalidLineError(message) {
    _classCallCheck(this, InvalidLineError);

    return _possibleConstructorReturn(this, _getPrototypeOf(InvalidLineError).call(this, `Encountered invalid line: ${message}`));
  }

  return InvalidLineError;
}(_wrapNativeSuper(Error)));

Object.defineProperty(InvalidLineError.prototype, 'name', {
  value: InvalidLineError.name,
});

const STATE_NAME = 0;
const STATE_STARTOFLABELNAME = 1;
const STATE_ENDOFNAME = 2;
const STATE_VALUE = 3;
const STATE_ENDOFLABELS = 4;
const STATE_LABELNAME = 5;
const STATE_LABELVALUEQUOTE = 6;
const STATE_LABELVALUEEQUALS = 7;
const STATE_LABELVALUE = 8;
const STATE_LABELVALUESLASH = 9;
const STATE_NEXTLABEL = 10;
const STATE_TIMESTAMP = 11;
function parseSampleLine(line) {
  let name = '';
  let labelname = '';
  let labelvalue = '';
  let value = '';
  let timestamp = '';
  let labels;
  let state = STATE_NAME;

  for (let c = 0; c < line.length; ++c) {
    const _char = line.charAt(c);

    if (state === STATE_NAME) {
      if (_char === '{') {
        state = STATE_STARTOFLABELNAME;
      } else if (_char === ' ' || _char === '\t') {
        state = STATE_ENDOFNAME;
      } else {
        name += _char;
      }
    } else if (state === STATE_ENDOFNAME) {
      if (_char === ' ' || _char === '\t') ; else if (_char === '{') {
        state = STATE_STARTOFLABELNAME;
      } else {
        value += _char;
        state = STATE_VALUE;
      }
    } else if (state === STATE_STARTOFLABELNAME) {
      if (_char === ' ' || _char === '\t') ; else if (_char === '}') {
        state = STATE_ENDOFLABELS;
      } else {
        labelname += _char;
        state = STATE_LABELNAME;
      }
    } else if (state === STATE_LABELNAME) {
      if (_char === '=') {
        state = STATE_LABELVALUEQUOTE;
      } else if (_char === '}') {
        state = STATE_ENDOFLABELS;
      } else if (_char === ' ' || _char === '\t') {
        state = STATE_LABELVALUEEQUALS;
      } else {
        labelname += _char;
      }
    } else if (state === STATE_LABELVALUEEQUALS) {
      if (_char === '=') {
        state = STATE_LABELVALUEQUOTE;
      } else if (_char === ' ' || _char === '\t') ; else {
        throw new InvalidLineError(line);
      }
    } else if (state === STATE_LABELVALUEQUOTE) {
      if (_char === '"') {
        state = STATE_LABELVALUE;
      } else if (_char === ' ' || _char === '\t') ; else {
        throw new InvalidLineError(line);
      }
    } else if (state === STATE_LABELVALUE) {
      if (_char === '\\') {
        state = STATE_LABELVALUESLASH;
      } else if (_char === '"') {
        if (!labels) {
          labels = {};
        }

        labels[labelname] = labelvalue;
        labelname = '';
        labelvalue = '';
        state = STATE_NEXTLABEL;
      } else {
        labelvalue += _char;
      }
    } else if (state === STATE_LABELVALUESLASH) {
      state = STATE_LABELVALUE;

      if (_char === '\\') {
        labelvalue += '\\';
      } else if (_char === 'n') {
        labelvalue += '\n';
      } else if (_char === '"') {
        labelvalue += '"';
      } else {
        labelvalue += '\\'.concat(_char);
      }
    } else if (state === STATE_NEXTLABEL) {
      if (_char === ',') {
        state = STATE_LABELNAME;
      } else if (_char === '}') {
        state = STATE_ENDOFLABELS;
      } else if (_char === ' ' || _char === '\t') ; else {
        throw new InvalidLineError(line);
      }
    } else if (state === STATE_ENDOFLABELS) {
      if (_char === ' ' || _char === '\t') ; else {
        value += _char;
        state = STATE_VALUE;
      }
    } else if (state === STATE_VALUE) {
      if (_char === ' ' || _char === '\t') {
        state = STATE_TIMESTAMP;
      } else {
        value += _char;
      }
    } else if (state === STATE_TIMESTAMP) {
      if (_char === ' ' || _char === '\t') ; else {
        timestamp += _char;
      }
    }
  }

  const ret = {
    name,
    value,
  };

  if (labels) {
    ret.labels = labels;
  }

  if (timestamp) {
    ret.timestamp_ms = timestamp;
  }

  return ret;
}

/*
Notes:
* Empty line handling is slightly looser than the original implementation.
* Everything else should be similarly strict.
*/

const SUMMARY_TYPE = 'SUMMARY';
const HISTOGRAM_TYPE = 'HISTOGRAM';
function parsePrometheusTextFormat(metrics) {
  const lines = metrics.split('\n'); // Prometheus format defines LF endings

  const converted = [];
  let metric;
  let help;
  let type;
  let samples = [];

  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i].trim();
    let lineMetric = null;
    let lineHelp = null;
    let lineType = null;
    let lineSample = null;

    if (line.length === 0) ; else if (line.startsWith('# ')) {
      // process metadata lines
      let lineData = line.substring(2);
      let instr = null;

      if (lineData.startsWith('HELP ')) {
        instr = 1;
      } else if (lineData.startsWith('TYPE ')) {
        instr = 2;
      }

      if (instr) {
        lineData = lineData.substring(5);
        const spaceIndex = lineData.indexOf(' ');

        if (spaceIndex !== -1) {
          // expect another token
          lineMetric = lineData.substring(0, spaceIndex);
          const remain = lineData.substring(spaceIndex + 1);

          if (instr === 1) {
            // HELP
            lineHelp = unescapeHelp(remain); // remain could be empty
          } else {
            // TYPE
            if (remain.includes(' ')) {
              throw new InvalidLineError(line);
            }

            lineType = remain.toUpperCase();
          }
        } else {
          throw new InvalidLineError(line);
        }
      } // 100% pure comment line, ignore
    } else {
      // process sample lines
      lineSample = parseSampleLine(line);
      lineMetric = lineSample.name;
    }

    if (lineMetric === metric) {
      // metadata always has same name
      if (!help && lineHelp) {
        help = lineHelp;
      } else if (!type && lineType) {
        type = lineType;
      }
    } // different types allow different suffixes


    const suffixedCount = ''.concat(metric, '_count');
    const suffixedSum = ''.concat(metric, '_sum');
    const suffixedBucket = ''.concat(metric, '_bucket');
    const allowedNames = [metric];

    if (type === SUMMARY_TYPE || type === HISTOGRAM_TYPE) {
      allowedNames.push(suffixedCount);
      allowedNames.push(suffixedSum);
    }

    if (type === HISTOGRAM_TYPE) {
      allowedNames.push(suffixedBucket);
    } // encountered new metric family or end of input


    if (i + 1 === lines.length || lineMetric && !allowedNames.includes(lineMetric)) {
      // write current
      if (metric) {
        if (type === SUMMARY_TYPE) {
          samples = flattenMetrics(samples, 'quantiles', 'quantile', 'value');
        } else if (type === HISTOGRAM_TYPE) {
          samples = flattenMetrics(samples, 'buckets', 'le', 'bucket');
        }

        converted.push({
          name: metric,
          help: help || '',
          type: type || 'UNTYPED',
          metrics: samples,
        });
      } // reset for new metric family


      metric = lineMetric;
      help = lineHelp || null;
      type = lineType || null;
      samples = [];
    }

    if (lineSample) {
      // key is not called value in official implementation if suffixed count, sum, or bucket
      if (lineSample.name !== metric) {
        if (type === SUMMARY_TYPE || type === HISTOGRAM_TYPE) {
          if (lineSample.name === suffixedCount) {
            lineSample.count = lineSample.value;
          } else if (lineSample.name === suffixedSum) {
            lineSample.sum = lineSample.value;
          }
        }

        if (type === HISTOGRAM_TYPE && lineSample.name === suffixedBucket) {
          lineSample.bucket = lineSample.value;
        }

        delete lineSample.value;
      }

      delete lineSample.name; // merge into existing sample if labels are deep equal

      const samplesLen = samples.length;
      const lastSample = samplesLen === 0 ? null : samples[samplesLen - 1];

      if (lastSample && shallowEqual.shallowEqualObjects(lineSample.labels, lastSample.labels)) {
        delete lineSample.labels;

        for (const key in lineSample) {
          lastSample[key] = lineSample[key];
        }
      } else {
        samples.push(lineSample);
      }
    }
  }

  return converted;
}

function flattenMetrics(metrics, groupName, keyName, valueName) {
  let flattened = null;

  for (let i = 0; i < metrics.length; ++i) {
    const sample = metrics[i];

    if (sample.labels && sample.labels[keyName] && sample[valueName]) {
      if (!flattened) {
        flattened = {};
      }
      if (!flattened[groupName]) {
        flattened[groupName] = {};
      }

      flattened[groupName][sample.labels[keyName]] = sample[valueName];
    } else if (!sample.labels) {
      if (!flattened) {
        flattened = {};
      }

      if (sample.count !== undefined) {
        flattened.count = sample.count;
      }

      if (sample.sum !== undefined) {
        flattened.sum = sample.sum;
      }
    }
  }

  if (flattened) {
    return [flattened];
  }
  return metrics;
} // adapted from https://github.com/prometheus/client_python/blob/0.0.19/prometheus_client/parser.py


function unescapeHelp(line) {
  let result = '';
  let slash = false;

  for (let c = 0; c < line.length; ++c) {
    const _char = line.charAt(c);

    if (slash) {
      if (_char === '\\') {
        result += '\\';
      } else if (_char === 'n') {
        result += '\n';
      } else {
        result += '\\'.concat(_char);
      }

      slash = false;
    } else if (_char === '\\') {
      slash = true;
    } else {
      result += _char;
    }
  }

  if (slash) {
    result += '\\';
  }

  return result;
}

module.exports = parsePrometheusTextFormat;
