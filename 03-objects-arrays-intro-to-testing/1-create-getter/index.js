/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const keys = path.split('.');

  function getter(obj) {
    const value = keys.reduce((result, key) => {
      if (typeof result === 'object') {
        return result[key];
      }
    }, {...obj})

    return value;
  }
  
  return getter;
}
