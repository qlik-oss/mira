/**
 * TODO
 * @param {*} object
 * @param {*} prefix
 * @param {*} output
 */
function flattenStructureIntoProperties(object, prefix, output) {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in object) {
    const value = object[key];
    if (value instanceof Object && !Array.isArray(value)) {
      flattenStructureIntoProperties(value, `${key}.`, output);
    } else {
      // eslint-disable-next-line no-param-reassign
      output[prefix + key] = value;
    }
  }
}

module.exports = flattenStructureIntoProperties;
