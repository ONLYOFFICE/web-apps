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

        const THEME_TYPE_LIGHT = 'light';
        const THEME_TYPE_DARK = 'dark';
        const THEME_TYPE_SYSTEM = 'system';
        var themes_map = {
            'theme-system': {
                text: locale.txtThemeSystem || 'Same as system',
                type: THEME_TYPE_SYSTEM,
                source: 'static',
            },
            'theme-light': {
                text: locale.txtThemeLight || 'Light',
                type: 'light',
                source: 'static',
            },
            'theme-classic-light': {
                text: locale.txtThemeClassicLight || 'Classic Light',
                type: 'light',
                source: 'static',
            },
            'theme-dark': {
                text: locale.txtThemeDark || 'Dark',
                type: 'dark',
                source: 'static',
            },
            'theme-contrast-dark': {
                text: locale.txtThemeContrastDark || 'Dark Contrast',
                type: 'dark',
                source: 'static',
            },
        }

        if ( !!window.currentLoaderTheme ) {
            if ( !themes_map[currentLoaderTheme.id] )
                themes_map[currentLoaderTheme.id] = currentLoaderTheme;
            window.currentLoaderTheme = undefined;
        }

        var is_dark_mode_allowed = true;
        var id_default_light_theme = 'theme-classic-light',
            id_default_dark_theme = 'theme-dark';

        var name_colors = [
            "toolbar-header-document",
            "toolbar-header-spreadsheet",
            "toolbar-header-presentation",

            "text-toolbar-header-on-background-document",
            "text-toolbar-header-on-background-spreadsheet",
            "text-toolbar-header-on-background-presentation",

            "background-normal",
            "background-toolbar",
            "background-toolbar-additional",
            "background-primary-dialog-button",
            "background-tab-underline",
            "background-notification-popover",
            "background-notification-badge",
            "background-scrim",
            "background-loader",
            "background-accent-button",
            "background-contrast-popover",
            "shadow-contrast-popover",

            "highlight-button-hover",
            "highlight-button-pressed",
            "highlight-button-pressed-hover",
            "highlight-primary-dialog-button-hover",
            "highlight-header-button-hover",
            "highlight-header-button-pressed",
            "highlight-toolbar-tab-underline",
            "highlight-text-select",
            "highlight-accent-button-hover",
            "highlight-accent-button-pressed",

            "border-toolbar",
            "border-divider",
            "border-regular-control",
            "border-toolbar-button-hover",
            "border-preview-hover",
            "border-preview-select",
            "border-control-focus",
            "border-color-shading",
            "border-error",
            "border-contrast-popover",

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
            "text-alt-key-hint",

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
            "canvas-ruler-border",
            "canvas-ruler-margins-background",
            "canvas-ruler-mark",
            "canvas-ruler-handle-border",
            "canvas-ruler-handle-border-disabled",

            "canvas-high-contrast",
            "canvas-high-contrast-disabled",

            "canvas-cell-border",
            "canvas-cell-title",
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
            "canvas-dark-content-background",
            "canvas-dark-page-border",

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
            var curr_lang = Common.Locale.getCurrentLanguage(),
                theme_label;
            if ( !!obj.themes && obj.themes instanceof Array ) {
                obj.themes.forEach(function (item) {
                    if ( !!item.id ) {
                        theme_label = !item.l10n || !item.l10n[curr_lang] ? item.name : item.l10n[curr_lang];
                        themes_map[item.id] = {text: theme_label, type: item.type};
                        write_theme_css(create_colors_css(item.id, item.colors));
                    } else
                    if ( typeof item == 'string' ) {
                        get_themes_config(item)
                    }
                });
            } else
            if ( obj.id ) {
                theme_label = !obj.l10n || !obj.l10n[curr_lang] ? obj.name : obj.l10n[curr_lang];
                themes_map[obj.id] = {text: theme_label, type: obj.type};
                write_theme_css( create_colors_css(obj.id, obj.colors) );
            }

            Common.NotificationCenter.trigger('uitheme:countchanged');
        }

        var get_themes_config = function (url) {
            Common.Utils.loadConfig(url,
                function ( obj ) {
                    if ( obj != 'error' ) {
                        parse_themes_object(obj);
                    } else {
                        console.warn('failed to load/parse themes.json');
                    }
                }
            );
            // fetch(url, {
            //     method: 'get',
            //     headers: {
            //         'Accept': 'application/json',
            //     },
            // }).then(function(response) {
            //     if (!response.ok) {
            //         throw new Error('server error');
            //     }
            //     return response.json();
            // }).then(function(response) {
            //     if ( response.then ) {
            //         // return response.json();
            //     } else {
            //         parse_themes_object(response);
            //
            //         /* to break promises chain */
            //         throw new Error('loaded');
            //     }
            // }).catch(function(e) {
            //     if ( e.message == 'loaded' ) {
            //     } else console.log('fetch error: ' + e);
            // });
        }

        var on_document_ready = function (el) {
            // get_themes_config('../../common/main/resources/themes/themes.json');
            if ( !Common.Controllers.Desktop.isActive() || !Common.Controllers.Desktop.isOffline() )
                get_themes_config('../../../../themes.json');
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

        var on_document_open = function (data) {
            if ( !!this.api.asc_setContentDarkMode && this.isDarkTheme() ) {
                this.api.asc_setContentDarkMode(this.isContentThemeDark());
            }
        };

        const is_theme_type_system = function (id) { return themes_map[id].type == THEME_TYPE_SYSTEM; }
        const get_system_theme_type = function () {
            if ( Common.Controllers.Desktop && Common.Controllers.Desktop.isActive() )
                return Common.Controllers.Desktop.systemThemeType();

            return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME_TYPE_DARK : THEME_TYPE_LIGHT;
        }
        const get_system_default_theme = function () {
            const id = get_system_theme_type() == THEME_TYPE_DARK ?
                id_default_dark_theme : id_default_light_theme;

            return {id: id, info: themes_map[id]};
        };

        const on_system_theme_dark = function (mql) {
            if (Common.localStorage.getBool('ui-theme-use-system', false)) {
                this.setTheme('theme-system');
            }
        };

        return {
            init: function (api) {
                var me = this;

                Common.Gateway.on('opendocument', on_document_open.bind(this));
                $(window).on('storage', function (e) {
                    if ( e.key == 'ui-theme' || e.key == 'ui-theme-id' ) {
                        if ( !!e.originalEvent.newValue ) {
                            if (Common.localStorage.getBool('ui-theme-use-system', false)) {
                                me.setTheme('theme-system');
                            } else me.setTheme(e.originalEvent.newValue, true);
                        }
                    } else
                    if ( e.key == 'content-theme' ) {
                        me.setContentTheme(e.originalEvent.newValue, true);
                        console.log('changed content', e.originalEvent.newValue);
                    }
                })

                this.api = api;
                var theme_name = get_ui_theme_name(Common.localStorage.getItem('ui-theme'));
                if ( !theme_name ) {
                    if ( !(Common.Utils.isIE10 || Common.Utils.isIE11) )
                        document.body.classList.forEach(function (classname, i, o) {
                            if ( !theme_name && classname.startsWith('theme-') &&
                                !classname.startsWith('theme-type-') && themes_map[classname] )
                            {
                                theme_name = classname;
                                var theme_obj = {
                                    id: theme_name,
                                    type: themes_map[theme_name].type
                                };

                                Common.localStorage.setItem('ui-theme', JSON.stringify(theme_obj));
                            }
                        });
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

                if ( !(Common.Utils.isIE10 || Common.Utils.isIE11) )
                    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', on_system_theme_dark.bind(this));
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
                if ( Common.localStorage.getBool('ui-theme-use-system', false) )
                    return 'theme-system';

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

            isDarkTheme: function (id) {
                !id && (id = this.currentThemeId());
                return (is_theme_type_system(id) ? get_system_default_theme().info.type : themes_map[id].type) == THEME_TYPE_DARK;
            },

            isContentThemeDark: function () {
                return Common.localStorage.getItem("content-theme") == 'dark';
            },

            setContentTheme: function (mode, force) {
                var set_dark = mode == 'dark';
                if ( set_dark && !this.isDarkTheme() )
                    return;

                if ( set_dark != this.isContentThemeDark() || force ) {
                    if ( this.api.asc_setContentDarkMode )
                        this.api.asc_setContentDarkMode(set_dark);

                    if ( Common.localStorage.getItem('content-theme') != mode )
                        Common.localStorage.setItem('content-theme', mode);

                    Common.NotificationCenter.trigger('contenttheme:dark', set_dark);
                }
            },

            toggleContentTheme: function () {
                var is_current_dark = this.isContentThemeDark();
                is_current_dark ? Common.localStorage.setItem('content-theme', 'light') : Common.localStorage.setItem('content-theme', 'dark');

                if ( this.api.asc_setContentDarkMode )
                    this.api.asc_setContentDarkMode(!is_current_dark);

                Common.NotificationCenter.trigger('contenttheme:dark', !is_current_dark);
            },

            setTheme: function (obj) {
                if ( !obj ) return;

                var id = get_ui_theme_name(obj),
                    refresh_only = arguments[1];

                if ( !refresh_only && is_theme_type_system(this.currentThemeId()) ) {
                    // TODO: need refactoring. for bug 58801
                    if ( get_system_default_theme().id == id ) {
                        Common.localStorage.setBool('ui-theme-use-system', false);
                        Common.localStorage.setItem('ui-theme-id', '');
                        Common.localStorage.setItem('ui-theme-id', id);
                        Common.NotificationCenter.trigger('uitheme:changed', id);
                        return;
                    }
                }

                if ( is_theme_type_system(id) ) {
                    if ( get_system_default_theme().id == this.currentThemeId() ) {
                        Common.localStorage.setBool('ui-theme-use-system', true);
                        Common.localStorage.setItem('ui-theme-id', '');
                        Common.localStorage.setItem('ui-theme-id', id);
                        Common.NotificationCenter.trigger('uitheme:changed', id);
                        return;
                    }

                    Common.localStorage.setBool('ui-theme-use-system', true);
                    id = get_system_default_theme().id;
                } else {
                    Common.localStorage.setBool('ui-theme-use-system', false);
                }

                if ( (this.currentThemeId() != id || refresh_only) && !!themes_map[id] ) {
                    document.body.className = document.body.className.replace(/theme-[\w-]+\s?/gi, '').trim();
                    document.body.classList.add(id, 'theme-type-' + themes_map[id].type);

                    if ( this.api ) {
                        if ( this.api.asc_setContentDarkMode && is_dark_mode_allowed )
                            if ( themes_map[id].type == 'light' ) {
                                this.api.asc_setContentDarkMode(false);
                            } else {
                                this.api.asc_setContentDarkMode(this.isContentThemeDark());
                                Common.NotificationCenter.trigger('contenttheme:dark', this.isContentThemeDark());
                            }

                        var obj = get_current_theme_colors(name_colors);
                        obj.type = themes_map[id].type;
                        obj.name = id;

                        this.api.asc_setSkin(obj);
                    }

                    if ( !(Common.Utils.isIE10 || Common.Utils.isIE11) ) {
                        var theme_obj = {
                            id: id,
                            type: obj.type,
                            text: themes_map[id].text,
                        };

                        if ( themes_map[id].source != 'static' ) {
                            theme_obj.colors = obj;
                        }

                        if ( !refresh_only )
                            Common.localStorage.setItem('ui-theme', JSON.stringify(theme_obj));
                    }

                    if ( !refresh_only )
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
