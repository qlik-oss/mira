/* eslint no-param-reassign: [ "error", { "props": true, "ignorePropertyModificationsFor": ["output"] }] */

/**
 * Helper function to {@link JSONUtils#flatten}, taking a prefix parameter that determines
 * the prefix that shall be appended to the flattened keys.
 */
function flattenWithPrefix(object, prefix, output) {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in object) {
    if (!(key in output)) {
      const value = object[key];
      if (value instanceof Object && !Array.isArray(value)) {
        flattenWithPrefix(value, `${key}.`, output);
      } else {
        output[prefix + key] = value;
      }
    }
  }
}

/**
 * Class providing JSON manipulation utilities.
 */
class JSONUtils {
  /**
   * Flattens a JSON object structure so that all keys are primitive values or arrays.
   * Objects inside arrays are not flattened.
   * Already existing keys in the output object are not modified or flattened.
   * @param {object} object - The object to flatten.
   * @param {object} output - The output object to which the flattened keys are added.
   */
  static flatten(object, output) {
    flattenWithPrefix(object, '', output);
  }
}

module.exports = JSONUtils;
