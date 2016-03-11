if (Common === undefined) {
    var Common = {};
}

Common.Locale = new(function() {
    var l10n = {};

    var _createXMLHTTPObject = function() {
        var xmlhttp;
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } 
        catch (e) {
            try {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } 
            catch (E) {
                xmlhttp = false;
            }
        }
        if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
            xmlhttp = new XMLHttpRequest();
        }
        return xmlhttp;
    };

    var _applyLocalization = function() {
        try {
            for (var prop in l10n) {
                var p = prop.split('.');
                if (p && p.length > 2) {

                    var obj = window;
                    for (var i = 0; i < p.length - 1; ++i) {
                        if (obj[p[i]] === undefined) {
                            obj[p[i]] = new Object();
                        }
                        obj = obj[p[i]];
                    }

                    if (obj) {
                        obj[p[p.length - 1]] = l10n[prop];
                    }
                }
            }
        }
        catch (e) {
        }
    };

    var _get = function(prop, scope) {
        var res = '';
        if (scope && scope.name) {
            res = l10n[scope.name + '.' + prop];
        }

        return res || (scope ? eval(scope.name).prototype[prop] : '');
    };

    var _getUrlParameterByName = function(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    try {
        var langParam = _getUrlParameterByName('lang');
        var xhrObj = _createXMLHTTPObject();
        if (xhrObj && langParam) {
            var lang = langParam.split("-")[0];
            xhrObj.open('GET', 'locale/' + lang + '.json', false);
            xhrObj.send('');
            l10n = eval("(" + xhrObj.responseText + ")");
        }
    }
    catch (e) {        
    }

    return {
        apply: _applyLocalization,
        get: _get
    };
    
})();


