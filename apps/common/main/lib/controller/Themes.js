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
                var theme_name = Common.localStorage.getItem('ui-theme', 'theme-light');
                api.asc_setSkin(sdk_themes_relation[theme_name]);

                if ( !$('body').hasClass(theme_name) ) {
                    $('body').addClass(theme_name);
                }

                // app.eventbus.addListeners({
                //    'FileMenu': {
                //         'settings:apply': function (menu) {
                //         }
                //     }
                // }, {id: 'Themes'});

                // getComputedStyle(document.documentElement).getPropertyValue('--background-normal');
            },

            available: function () {
                return !Common.Utils.isIE;
            },

            current: function () {
                return Common.localStorage.getItem('ui-theme', 'theme-light');
            },

            isDarkTheme: function () {
                return this.current() == 'theme-dark';
            },

            setTheme: function (name) {
                if ( sdk_themes_relation.contains(name) ) {
                    var classname = document.documentElement.className.replace(/theme-\w+\s?/, '');
                    document.body.className = classname;

                    $('body').addClass(name);
                    this.api.asc_setSkin(sdk_themes_relation[name]);

                    var style = getComputedStyle(document.body);
                    if ( !!window.DE ) {
                        var color_background_normal = style.getPropertyValue('--background-normal');
                        this.api.asc_setSkin({
                            "RulerOutline": style.getPropertyValue('--border-toolbar')
                            , "RulerMarkersFillColor": color_background_normal
                            , "RulerMarkersFillColorOld": color_background_normal
                            , "RulerTableColor1": color_background_normal
                        });
                    }

                    Common.localStorage.setItem('ui-theme', name);
                    Common.NotificationCenter.trigger('uitheme:changed', name);
                }
            },

            toggleTheme: function () {
                this.setTheme(this.current() == 'theme-dark' ? 'theme-light' : 'theme-dark');
            }
        }
    })();
});