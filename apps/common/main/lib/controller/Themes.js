/**
 * Created by Maxim.Kadushkin on 2/5/2021.
 */

define([
    'core'
], function () {
    'use strict';

    Common.UI.Themes = new (function() {
        var sdk_themes_relation = {
            'theme-light': 'flat',
            'theme-dark': 'flatDark'
        };

        sdk_themes_relation.contains = function (name) {
            return !!this[name];
        }

        return {
            init: function (api) {
                var me = this;
                $(window).on('storage', function (e) {
                    if ( e.key == 'ui-theme' ) {
                        me.setTheme(e.originalEvent.newValue);
                    }
                })

                this.api = api;
                api.asc_setSkin(sdk_themes_relation[Common.localStorage.getItem('ui-theme', 'theme-light')]);

                // app.eventbus.addListeners({
                //    'FileMenu': {
                //         'settings:apply': function (menu) {
                //         }
                //     }
                // }, {id: 'Themes'});

                // getComputedStyle(document.documentElement).getPropertyValue('--background-normal');
            },

            current: function () {
                return Common.localStorage.getItem('ui-theme', 'theme-light');
            },

            setTheme: function (name) {
                if ( sdk_themes_relation.contains(name) ) {
                    var classname = document.documentElement.className.replace(/theme-\w+\s?/, '');
                    document.documentElement.className = classname;

                    this.api.asc_setSkin(sdk_themes_relation[name]);
                    $(':root').addClass(name);
                    Common.localStorage.setItem('ui-theme', name);
                }
            },

            toggleTheme: function () {
                this.setTheme(this.current() == 'theme-dark' ? 'theme-light' : 'theme-dark');
            }
        }
    })();
});