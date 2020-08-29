/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const keys = path.split('.');


  function getter(obj) {
    // let value = {...obj};
    // let i = 0;

    // while (typeof value === 'object') {
    //   value = value[keys[i]]
    //   i += 1;
    // }

    const value = keys.reduce((result, key) => {
      if (typeof result === 'object') {
        return result[key];
      } else {
        return undefined;
      }
    }, {...obj})

    return value;
  }
  
  return getter;
}
