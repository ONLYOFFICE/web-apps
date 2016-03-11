if (Common === undefined)
    var Common = {};

Common.component = Common.component || {};

Common.Analytics = Common.component.Analytics = new(function() {
    var _category;

    return {
        initialize: function(id, category) {

            if (typeof id === 'undefined')
                throw 'Analytics: invalid id.';

            if (typeof category === 'undefined' || Object.prototype.toString.apply(category) !== '[object String]')
                throw 'Analytics: invalid category type.';

            _category = category;

            $('head').append(
                '<script type="text/javascript">' +
                    'var _gaq = _gaq || [];' +
                    '_gaq.push(["_setAccount", "' + id + '"]);' +
                    '_gaq.push(["_trackPageview"]);' +
                    '(function() {' +
                    'var ga = document.createElement("script"); ga.type = "text/javascript"; ga.async = true;' +
                    'ga.src = ("https:" == document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";' +
                    'var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ga, s);' +
                    '})();' +
                    '</script>'
            );
        },

        trackEvent: function(action, label, value) {

            if (typeof action !== 'undefined' && Object.prototype.toString.apply(action) !== '[object String]')
                throw 'Analytics: invalid action type.';

            if (typeof label !== 'undefined' && Object.prototype.toString.apply(label) !== '[object String]')
                throw 'Analytics: invalid label type.';

            if (typeof value !== 'undefined' && !(Object.prototype.toString.apply(value) === '[object Number]' && isFinite(value)))
                throw 'Analytics: invalid value type.';

            if (typeof _gaq === 'undefined')
                return;

            if (_category === 'undefined')
                throw 'Analytics is not initialized.';

            _gaq.push(['_trackEvent', _category, action, label, value]);
        }
    }
})();