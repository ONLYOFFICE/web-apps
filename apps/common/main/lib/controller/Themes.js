/**
 * Created by Maxim.Kadushkin on 2/5/2021.
 */

define([
    'core'
], function () {
    'use strict';

    Common.UI.Themes = new (function() {
        var sdk_themes_alias = {
            'theme-light': 'flat',
            'theme-dark': 'flatDark'
        };

        sdk_themes_alias.contains = function (name) {
            return !!this[name];
        }

        var refresh_sdk_colors = function () {
            var style = getComputedStyle(document.body);
            if ( !!window.DE ) {
                var color_background_normal = style.getPropertyValue('--background-normal');
                this.api.asc_setSkin({
                    "RulerOutline": style.getPropertyValue('--border-toolbar'),
                    "RulerMarkersFillColor": color_background_normal,
                    "RulerMarkersFillColorOld": color_background_normal,
                    "RulerTableColor1": color_background_normal,
                    "RulerLight": style.getPropertyValue("--canvas-ruler-background"),
                    "RulerDark": style.getPropertyValue("--canvas-ruler-margins-background"),
                    "RulerTextColor": style.getPropertyValue("--canvas-ruler-mark"),
                    "RulerTableColor2": style.getPropertyValue("--canvas-ruler-handle-border"),
                    "RulerTableColor2Old": style.getPropertyValue("--canvas-ruler-handle-border-disabled"),
                    "RulerTabsColor": style.getPropertyValue("--canvas-high-contrast"),
                    "RulerTabsColorOld": style.getPropertyValue("--canvas-high-contrast-disabled"),
                });
            }
        }
        return {
            THEME_LIGHT_ID: 'theme-light',
            THEME_DARK_ID: 'theme-dark',

            init: function (api) {
                var me = this;
                refresh_sdk_colors = refresh_sdk_colors.bind(this);

                $(window).on('storage', function (e) {
                    if ( e.key == 'ui-theme' ) {
                        me.setTheme(e.originalEvent.newValue);
                    }
                })

                this.api = api;
                var theme_name = Common.localStorage.getItem('ui-theme', 'theme-light');
                api.asc_setSkin(sdk_themes_alias[theme_name]);

                if ( !$('body').hasClass(theme_name) ) {
                    $('body').addClass(theme_name);
                }

                refresh_sdk_colors();

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
                return Common.localStorage.getItem('ui-theme') || 'theme-light';
            },

            isDarkTheme: function () {
                return this.current() == 'theme-dark';
            },

            setTheme: function (name) {
                if ( sdk_themes_alias.contains(name) ) {
                    var classname = document.documentElement.className.replace(/theme-\w+\s?/, '');
                    document.body.className = classname;

                    $('body').addClass(name);
                    this.api.asc_setSkin(sdk_themes_alias[name]);
                    refresh_sdk_colors();

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