/**
 * Sleeps (asyncronously) for the provided number of milliseconds.
 * @param {number} ms - The number of milliseconds to sleep.
 */
async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => { resolve(); }, ms);
  });
}

module.exports = sleep;
