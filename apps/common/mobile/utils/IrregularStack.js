
export default class IrregularStack {
    constructor (config) {
        this._stack = [];

        const _config = config || {};
        this._strongCompare = _config.strongCompare || this._compare;
        this._weakCompare = _config.weakCompare || this._compare;
    }

    _compare (obj1, obj2) {
        if (typeof obj1 === 'object' && typeof obj2 === 'object' && window.JSON)
            return window.JSON.stringify(obj1) === window.JSON.stringify(obj2);
        return obj1 === obj2;
    };

    _indexOf (obj, compare) {
        for (let i = this._stack.length - 1; i >= 0; i--) {
            if (compare(this._stack[i], obj))
                return i;
        }
        return -1;
    }

    push (obj) {
        this._stack.push(obj);
    }

    pop (obj) {
        const index = this._indexOf(obj, this._strongCompare);
        if (index !== -1) {
            const removed = this._stack.splice(index, 1);
            return removed[0];
        }
        return undefined;
    }

    get (obj) {
        const index = this._indexOf(obj, this._weakCompare);
        if (index !== -1) {
            return this._stack[index];
        }
        return undefined;
    }

    exist (obj) {
        return !(this._indexOf(obj, this._strongCompare) < 0);
    }

}