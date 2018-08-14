module.exports = {
    isFunc(func) {
        return typeof func === 'function';
    },
    getRandomStr() {
        return Date.now().toString(36) + Math.random().toString(36).slice(9);
    },
    removeEmptyVal(obj) {
        for(let key in obj) {
            if(
                obj[key] == undefined
                || obj[key] == null
            ) {
                delete obj[key];
            }
        }
        return obj;
    }
}