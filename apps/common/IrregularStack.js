if (Common === undefined)
    var Common = {};

Common.IrregularStack = function(config) {

    var _stack = [];

    var _compare = function(obj1, obj2){
        if (typeof obj1 === 'object' && typeof obj2 === 'object' && window.JSON)
            return window.JSON.stringify(obj1) === window.JSON.stringify(obj2);
        return obj1 === obj2;
    }

    config = config || {};
    var _strongCompare = config.strongCompare || _compare;
    var _weakCompare = config.weakCompare || _compare;

    var _indexOf = function(obj, compare) {
        for (var i = _stack.length - 1; i >= 0; i--) {
            if (compare(_stack[i], obj))
                return i;
        }
        return -1;
    }

    var _push = function(obj) {
        _stack.push(obj);
    }

    var _pop = function(obj) {
        var index = _indexOf(obj, _strongCompare);
        if (index != -1) {
            var removed = _stack.splice(index, 1);
            return removed[0];
        }
        return undefined;
    }

    var _get = function(obj) {
        var index = _indexOf(obj, _weakCompare);
        if (index != -1) 
            return _stack[index];
        return undefined;
    }

    var _exist = function(obj) {
        return !(_indexOf(obj, _strongCompare) < 0);
    }

    return {
        push: _push,
        pop: _pop,
        get: _get,
        exist: _exist
    }
};