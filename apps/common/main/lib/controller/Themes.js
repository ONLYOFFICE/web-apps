/**
 * Created by Maxim.Kadushkin on 2/5/2021.
 */

define([
    'core'
], function () {
    'use strict';

    !Common.UI && (Common.UI = {});
    
    Common.UI.Themes = new (function(locale) {
        !locale && (locale = {});
        var themes_map = {
            'theme-light': {
                text: locale.txtThemeLight || 'Light',
                type: 'light'
            },
            'theme-classic-light': {
                text: locale.txtThemeClassicLight || 'Classic Light',
                type: 'light'
            },
            'theme-dark': {
                text: locale.txtThemeDark || 'Dark',
                type: 'dark'
            },
        }
        var id_default_light_theme = 'theme-classic-light',
            id_default_dark_theme = 'theme-dark';

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
            "text-link-hover",
            "text-link-active",
            "text-link-visited",
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

        var create_colors_css = function (id, colors) {
            if ( !!colors && !!id ) {
                var _css_array = [':root .', id, '{'];
                for (var c in colors) {
                    _css_array.push('--', c, ':', colors[c], ';');
                }

                _css_array.push('}');
                return _css_array.join('');
            }
        }

        var write_theme_css = function (css) {
            if ( !!css ) {
                var style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = css;
                document.getElementsByTagName('head')[0].appendChild(style);
            }
        }

        var parse_themes_object = function (obj) {
            if ( !!obj.themes && obj.themes instanceof Array ) {
                obj.themes.forEach(function (item) {
                    if ( !!item.id ) {
                        themes_map[item.id] = {text: item.name, type: item.type};
                        write_theme_css(create_colors_css(item.id, item.colors));
                    } else
                    if ( typeof item == 'string' ) {
                        get_themes_config(item)
                    }
                });
            } else
            if ( obj.id ) {
                themes_map[obj.id] = {text: obj.name, type: obj.type};
                write_theme_css( create_colors_css(obj.id, obj.colors) );
            }
        }

        var get_themes_config = function (url) {
            fetch(url, {
                method: 'get',
                headers: {
                    'Accept': 'application/json',
                },
            }).then(function(response) {
                if (!response.ok) {
                    throw new Error('server error');
                }
                return response.json();
            }).then(function(response) {
                if ( response.then ) {
                    // return response.json();
                } else {
                    parse_themes_object(response);

                    /* to break promises chain */
                    throw new Error('loaded');
                }
            }).catch(function(e) {
                if ( e.message == 'loaded' ) {
                } else console.log('fetch error: ' + e);
            });
        }

        var on_document_ready = function (el) {
            // get_themes_config('../../common/main/resources/themes/themes.json')
        }

        var get_ui_theme_name = function (objtheme) {
            if ( typeof(objtheme) == 'string' &&
                    objtheme.startsWith("{") && objtheme.endsWith("}") )
            {
                objtheme = JSON.parse(objtheme);
            }

            if ( objtheme && typeof(objtheme) == 'object' )
                return objtheme.id;

            return objtheme;
        }

        return {
            init: function (api) {
                var me = this;

                $(window).on('storage', function (e) {
                    if ( e.key == 'ui-theme' || e.key == 'ui-theme-id' ) {
                        me.setTheme(e.originalEvent.newValue, true);
                    }
                })

                this.api = api;
                var theme_name = get_ui_theme_name(Common.localStorage.getItem('ui-theme'));
                if ( !theme_name ) {
                    if ( !(Common.Utils.isIE10 || Common.Utils.isIE11) )
                        for (var i of document.body.classList.entries()) {
                            if ( i[1].startsWith('theme-') && !i[1].startsWith('theme-type-') ) {
                                theme_name = i[1];
                                break;
                            }
                        }
                }

                if ( !themes_map[theme_name] )
                    theme_name = id_default_light_theme;

                if ( !$('body').hasClass(theme_name) ) {
                    $('body').addClass(theme_name);
                }

                if ( !document.body.className.match(/theme-type-/) ) {
                    document.body.classList.add('theme-type-' + themes_map[theme_name].type);
                }

                var obj = get_current_theme_colors(name_colors);
                obj.type = themes_map[theme_name].type;
                obj.name = theme_name;
                api.asc_setSkin(obj);

                Common.NotificationCenter.on('document:ready', on_document_ready.bind(this));
            },

            available: function () {
                return !Common.Utils.isIE && !this.locked;
            },

            setAvailable: function (value) {
                this.locked = !value;
            },

            map: function () {
                return themes_map
            },

            get: function (id) {
                return themes_map[id]
            },

            currentThemeId: function () {
                var t = Common.localStorage.getItem('ui-theme') || Common.localStorage.getItem('ui-theme-id');
                var id = get_ui_theme_name(t);
                return !!themes_map[id] ? id : id_default_light_theme;
            },

            defaultThemeId: function (type) {
                return type == 'dark' ? id_default_dark_theme : id_default_light_theme;
            },

            defaultTheme: function (type) {
                return themes_map[this.defaultThemeId(type)]
            },

            isDarkTheme: function () {
                return themes_map[this.currentThemeId()].type == 'dark';
            },

            setTheme: function (obj, force) {
                var id = get_ui_theme_name(obj);
                if ( (this.currentThemeId() != id || force) && !!themes_map[id] ) {
                    document.body.className = document.body.className.replace(/theme-[\w-]+\s?/gi, '').trim();
                    document.body.classList.add(id, 'theme-type-' + themes_map[id].type);

                    if ( this.api ) {
                        var obj = get_current_theme_colors(name_colors);
                        obj.type = themes_map[id].type;
                        obj.name = id;

                        this.api.asc_setSkin(obj);
                    }

                    if ( !(Common.Utils.isIE10 || Common.Utils.isIE11) ) {
                        var theme_obj = {
                            id: id,
                            type: obj.type,
                        };

                        Common.localStorage.setItem('ui-theme', JSON.stringify(theme_obj));
                    }

                    Common.localStorage.setItem('ui-theme-id', id);
                    Common.NotificationCenter.trigger('uitheme:changed', id);
                }
            },

            toggleTheme: function () {
                this.setTheme( this.isDarkTheme() ? id_default_light_theme : id_default_dark_theme );
            }
        }
    })(Common.UI.Themes);
});
