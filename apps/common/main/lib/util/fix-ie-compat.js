
if ( !window.fetch ) {
    var element = document.createElement('script');
    element['src'] = '../../../vendor/fetch/fetch.umd.js';
    document.getElementsByTagName('head')[0].appendChild(element);

    if ( !window.Promise ) {
        element = document.createElement('script');
        element['src'] = '../../../vendor/es6-promise/es6-promise.auto.min.js';
        document.getElementsByTagName('head')[0].appendChild(element);
    }

    if (typeof Object.assign != 'function') {
        Object.assign = function(target) {
            'use strict';
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            target = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var source = arguments[index];
                if (source != null) {
                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        };
    }
}
