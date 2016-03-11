define([
], function () {
    'use strict';

    SSE.Views = SSE.Views || {};

    SSE.Views.FormulaLang = new(function() {
        var langJson = {};

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

        var _get = function(lang) {
            if (!lang) return '';
            lang = lang.toLowerCase() ;

            if (langJson[lang])
                return langJson[lang];
            else if (lang == 'en')
                return undefined;
            else {
                try {
                    var xhrObj = _createXMLHTTPObject();
                    if (xhrObj && lang) {
                        xhrObj.open('GET', 'resources/formula-lang/' + lang + '.json', false);
                        xhrObj.send('');
                        langJson[lang] = eval("(" + xhrObj.responseText + ")");
                        return langJson[lang];
                    }
                }
                catch (e) {
                }
            }

            return null;
        };
        return {
            get: _get
        };
    })();
});
