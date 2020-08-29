/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size = Infinity) {
  const store = {
    counter: 1,
    prevLtr: '',
    resultStr: '',
    
    ltrChecker(ltr) {
      if (ltr === this.prevLtr) {
        this.counter += 1;
      } else {
        this.counter = 1;
      }

      if (this.counter <= size) {
        this.resultStr += ltr;
      }
      
      this.prevLtr = ltr;
    }
  }

  for (let i = 0; i < string.length; i += 1) {
    store.ltrChecker(string[i]);
  }

  return store.resultStr;
}
