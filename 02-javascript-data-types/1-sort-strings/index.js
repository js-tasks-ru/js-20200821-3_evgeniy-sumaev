/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    const getIdx = item => {
        const ltr = item[0];
        const smallLtr = item[0].toLowerCase();
        let idx = item[0].toLowerCase().codePointAt();
        if (idx === 1105) {
            idx = 1077.5;
        }
        if (ltr !== smallLtr) {
            idx -= 0.1;
        }

        return idx;
    }
    
    const tempArr = [...arr].sort((a, b) => getIdx(a) - getIdx(b));
    if (param === 'desc') {
        tempArr.reverse();
    }

    return tempArr;
}
