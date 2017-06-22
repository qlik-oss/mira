/**
 * TODO
 */
class JSONUtils {
  /**
   * TODO
   * @param {*} object
   * @param {*} prefix
   * @param {*} output
   */
  static flatten(object, prefix, output) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in object) {
      const value = object[key];
      if (value instanceof Object && !Array.isArray(value)) {
        JSONUtils.flatten(value, `${key}.`, output);
      } else {
        // eslint-disable-next-line no-param-reassign
        output[prefix + key] = value;
      }
    }
  }
}

module.exports = JSONUtils;
