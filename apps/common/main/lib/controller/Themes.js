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

        var themes_map = {
            'theme-light': 'light',
            'theme-dark': 'dark'
        }

        sdk_themes_alias.contains = function (name) {
            return !!this[name];
        }

        themes_map.contains = function (name) {
            return !!this[name];
        }

        var name_colors = [
            "background-normal",
            "background-toolbar",
            "background-toolbar-additional",
            "background-primary-dialog-button",
            "background-tab-underline",
            "background-notification-popover",
            "background-notification-badge",
            "background-scrim",
            "background-loader",

            "highlight-button-hover",
            "highlight-button-pressed",
            "highlight-button-pressed-hover",
            "highlight-primary-dialog-button-hover",
            "highlight-header-button-hover",
            "highlight-header-button-pressed",
            "highlight-toolbar-tab-underline",
            "highlight-text-select",

            "border-toolbar",
            "border-divider",
            "border-regular-control",
            "border-toolbar-button-hover",
            "border-preview-hover",
            "border-preview-select",
            "border-control-focus",
            "border-color-shading",
            "border-error",

            "text-normal",
            "text-normal-pressed",
            "text-secondary",
            "text-tertiary",
            "text-link",
            "text-inverse",
            "text-toolbar-header",
            "text-contrast-background",

            "icon-normal",
            "icon-normal-pressed",
            "icon-inverse",
            "icon-toolbar-header",
            "icon-notification-badge",
            "icon-contrast-popover",
            "icon-success",

            "canvas-background",
            "canvas-content-background",
            "canvas-page-border",

            "canvas-ruler-background",
            "canvas-ruler-margins-background",
            "canvas-ruler-mark",
            "canvas-ruler-handle-border",
            "canvas-ruler-handle-border-disabled",

            "canvas-high-contrast",
            "canvas-high-contrast-disabled",

            "canvas-cell-border",
            "canvas-cell-title-border",
            "canvas-cell-title-border-hover",
            "canvas-cell-title-border-selected",
            "canvas-cell-title-hover",
            "canvas-cell-title-selected",

            "canvas-dark-cell-title",
            "canvas-dark-cell-title-hover",
            "canvas-dark-cell-title-selected",
            "canvas-dark-cell-title-border",
            "canvas-dark-cell-title-border-hover",
            "canvas-dark-cell-title-border-selected",

            "canvas-scroll-thumb",
            "canvas-scroll-thumb-hover",
            "canvas-scroll-thumb-pressed",
            "canvas-scroll-thumb-border",
            "canvas-scroll-thumb-border-hover",
            "canvas-scroll-thumb-border-pressed",
            "canvas-scroll-arrow",
            "canvas-scroll-arrow-hover",
            "canvas-scroll-arrow-pressed",
            "canvas-scroll-thumb-target",
            "canvas-scroll-thumb-target-hover",
            "canvas-scroll-thumb-target-pressed"
        ];

        var get_current_theme_colors = function (colors) {
            var out_object = {};
            if ( !(Common.Utils.isIE10 || Common.Utils.isIE11) ) {
                var style = getComputedStyle(document.body);
                colors.forEach(function (item, index) {
                    out_object[item] = style.getPropertyValue('--' + item).trim()
                })
            }

            return out_object;
        }

        return {
            THEME_LIGHT_ID: 'theme-light',
            THEME_DARK_ID: 'theme-dark',

            init: function (api) {
                var me = this;

                $(window).on('storage', function (e) {
                    if ( e.key == 'ui-theme' ) {
                        me.setTheme(e.originalEvent.newValue);
                    }
                })

                this.api = api;
                var theme_name = Common.localStorage.getItem('ui-theme', 'theme-light');

                if ( !$('body').hasClass(theme_name) ) {
                    $('body').addClass(theme_name);
                }

                var obj = get_current_theme_colors(name_colors);
                obj.type = themes_map[theme_name];
                obj.name = theme_name;
                api.asc_setSkin(obj);

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
                return themes_map[this.current()] == 'dark';
            },

            setTheme: function (name) {
                if ( themes_map.contains(name) ) {
                    var classname = document.documentElement.className.replace(/theme-\w+\s?/, '');
                    document.body.className = classname;

                    $('body').addClass(name);

                    var obj = get_current_theme_colors(name_colors);
                    obj.type = themes_map[name];
                    obj.name = name;

                    this.api.asc_setSkin(obj);

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
