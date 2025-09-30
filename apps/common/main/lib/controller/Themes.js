/*
 * (c) Copyright Ascensio System SIA 2010-2024
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

/**
 * Created on 2/5/2021.
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
                skeleton: {
                    css: `.loadmask {--sk-height-toolbar-controls: 66px; --sk-layout-padding-toolbar: 0;
                                    --sk-shadow-toolbar: inset 0 -1px #cbcbcb; --sk-border-radius-toolbar: 0;
                                    --sk-background-toolbar: #f7f7f7; --sk-background-toolbar-controls: #f7f7f7;
                                    --sk-background-toolbar-header-word: #446995; --sk-background-toolbar-header-pdf: #aa5252;
                                    --sk-background-toolbar-header-slide: #BE664F; --sk-background-toolbar-header-cell: #40865c; 
                                    --sk-background-toolbar-header-visio: #444796; 
                                    --sk-background-toolbar-tab: rgba(0,0,0,.15); --sk-background-toolbar-button: #d8dadc;
                                    --sk-layout-padding-toolbar-controls: 0 7px; --sk-layout-padding-header: 0 8px;
                                    --sk-canvas-background: #eee; --sk-canvas-content-background: #fff;
                                    --sk-canvas-page-border: #dde0e5; --sk-canvas-line: rgba(0,0,0,.05);
                                    --sk-height-formula: 24px; --sk-padding-formula: 0 0 4px 0;
                                    --sk-border-style-formula: solid; --sk-gap-formula-field: 20px;
                                    --sk-border-radius-formula-field: 0px; --sk-layout-padding-placeholder: 46px auto;
                                }`
                },
            },
            'theme-classic-light': {
                text: locale.txtThemeClassicLight || 'Classic Light',
                type: 'light',
                source: 'static',
                skeleton: {
                    css: `.loadmask {--sk-height-toolbar-controls: 66px; --sk-layout-padding-toolbar: 0;
                                    --sk-shadow-toolbar: inset 0 -1px #cbcbcb; --sk-border-radius-toolbar: 0;
                                    --sk-background-toolbar-header-word: #446995; --sk-background-toolbar-header-pdf: #aa5252;
                                    --sk-background-toolbar-header-slide: #BE664F;; --sk-background-toolbar-header-cell: #40865c;
                                    --sk-background-toolbar-header-visio: #444796; 
                                    --sk-background-toolbar: #f7f7f7; --sk-background-toolbar-controls: #f1f1f1;
                                    --sk-background-toolbar-tab: rgba(255,255,255,.15); --sk-background-toolbar-button: #d8dadc;
                                    --sk-layout-padding-toolbar-controls: 0 7px; --sk-layout-padding-header: 0 8px;
                                    --sk-canvas-background: #eee; --sk-canvas-content-background: #fff;
                                    --sk-canvas-page-border: #dde0e5; --sk-canvas-line: rgba(0,0,0,.05);
                                    --sk-height-formula: 24px; --sk-padding-formula: 0 0 4px 0;
                                    --sk-border-style-formula: solid; --sk-gap-formula-field: 20px;
                                    --sk-border-radius-formula-field: 0px; --sk-layout-padding-placeholder: 46px auto;
                                }`
                },
            },
            'theme-dark': {
                text: locale.txtThemeDark || 'Dark',
                type: 'dark',
                source: 'static',
                skeleton: {
                    css: `.theme-dark .loadmask, .theme-type-dark .loadmask {
                                --sk-height-toolbar-controls: 66px; --sk-layout-padding-toolbar: 0;
                                --sk-shadow-toolbar: inset 0 -1px #616161; --sk-border-radius-toolbar: 0;
                                --sk-background-toolbar-header-word: #2a2a2a; --sk-background-toolbar-header-pdf: #2a2a2a;
                                --sk-background-toolbar-header-slide: #2a2a2a;--sk-background-toolbar-header-cell: #2a2a2a;
                                --sk-background-toolbar-header-visio: #2a2a2a; 
                                --sk-background-toolbar: #404040; --sk-background-toolbar-controls: #404040;
                                --sk-background-toolbar-tab: rgba(255,255,255,.15); --sk-background-toolbar-button: #555;
                                --sk-layout-padding-toolbar-controls: 0 7px; --sk-layout-padding-header: 0 8px;
                                --sk-canvas-background: #555; --sk-canvas-content-background: #fff;
                                --sk-canvas-page-border: #555; --sk-canvas-line: rgba(0,0,0,.05);
                                --sk-height-formula: 24px; --sk-padding-formula: 0 0 4px 0;
                                --sk-border-style-formula: solid; --sk-gap-formula-field: 20px;
                                --sk-border-radius-formula-field: 0px; --sk-layout-padding-placeholder: 46px auto;
                            }
                            .content-theme-dark {
                                --sk-canvas-content-background: #3a3a3a; --sk-canvas-page-border: #616161;
                                --sk-canvas-line: rgba(255,255,255,.05);
                            }`
                },
            },
            'theme-contrast-dark': {
                text: locale.txtThemeContrastDark || 'Dark Contrast',
                type: 'dark',
                source: 'static',
                skeleton: {
                    css: `.theme-dark .loadmask, .theme-type-dark .loadmask {
                                --sk-height-toolbar-controls: 66px; --sk-layout-padding-toolbar: 0;
                                --sk-shadow-toolbar: inset 0 -1px #616161; --sk-border-radius-toolbar: 0;
                                --sk-background-toolbar-header-word: #2a2a2a; --sk-background-toolbar-header-pdf: #2a2a2a;
                                --sk-background-toolbar-header-slide: #2a2a2a;--sk-background-toolbar-header-cell: #2a2a2a;
                                --sk-background-toolbar-header-visio: #2a2a2a; 
                                --sk-background-toolbar: #404040; --sk-background-toolbar-controls: #404040;
                                --sk-background-toolbar-tab: rgba(255,255,255,.15); --sk-background-toolbar-button: #555;
                                --sk-layout-padding-toolbar-controls: 0 7px; --sk-layout-padding-header: 0 8px;
                                --sk-canvas-background: #555; --sk-canvas-content-background: #fff;
                                --sk-canvas-page-border: #555; --sk-canvas-line: rgba(0,0,0,.05);
                                --sk-height-formula: 24px; --sk-padding-formula: 0 0 4px 0;
                                --sk-border-style-formula: solid; --sk-gap-formula-field: 20px;
                                --sk-border-radius-formula-field: 0px; --sk-layout-padding-placeholder: 46px auto;
                            }
                            .content-theme-dark {
                                --sk-canvas-content-background: #3a3a3a;
                                --sk-canvas-page-border: #616161; --sk-canvas-line: rgba(255,255,255,.05);
                            }`
                },
            },
            'theme-gray': {
                text: locale.txtThemeGray || 'Gray',
                type: 'light',
                source: 'static',
                skeleton: {
                    css: `.loadmask {--sk-height-toolbar-controls: 66px;--sk-layout-padding-toolbar: 0;
                                    --sk-shadow-toolbar: inset 0 -1px #cbcbcb; --sk-border-radius-toolbar: 0;
                                    --sk-background-toolbar-header-word: #f7f7f7; --sk-background-toolbar-header-pdf: #f7f7f7;
                                    --sk-background-toolbar-header-slide: #f7f7f7;--sk-background-toolbar-header-cell: #f7f7f7;
                                    --sk-background-toolbar-header-visio: #f7f7f7; 
                                    --sk-background-toolbar: #f7f7f7; --sk-background-toolbar-controls: #f1f1f1;
                                    --sk-background-toolbar-tab: #e0e0e0; --sk-background-toolbar-button: #e0e0e0;
                                    --sk-layout-padding-toolbar-controls: 0 7px; --sk-layout-padding-header: 0 8px;
                                    --sk-canvas-background: #eee; --sk-canvas-content-background: #fff;
                                    --sk-canvas-page-border: #ccc; --sk-canvas-line: rgba(0,0,0,.05);
                                    --sk-height-formula: 24px; --sk-padding-formula: 0 0 4px 0;
                                    --sk-border-style-formula: solid; --sk-gap-formula-field: 20px;
                                    --sk-border-radius-formula-field: 0px; --sk-layout-padding-placeholder: 46px auto;
                                }`
                },
            },
            'theme-white': {
                text: locale.txtThemeModernLight || 'White',
                type: 'light',
                source: 'static',
                icons: {
                    cls: 'mod2',
                }
            },
            'theme-night': {
                text: locale.txtThemeModernDark || 'Night',
                type: 'dark',
                source: 'static',
                icons: {
                    cls: 'mod2',
                }
            },
        }

        var name_colors = [
            "toolbar-header-document",
            "toolbar-header-spreadsheet",
            "toolbar-header-presentation",
            "toolbar-header-pdf",
            "toolbar-header-visio",

            "text-toolbar-header-on-background-document",
            "text-toolbar-header-on-background-spreadsheet",
            "text-toolbar-header-on-background-presentation",
            "text-toolbar-header-on-background-pdf",
            "text-toolbar-header-on-background-visio",

            "background-normal",
            "background-toolbar",
            "background-toolbar-additional",
            "background-primary-dialog-button",
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
            "highlight-text-select",
            "highlight-accent-button-hover",
            "highlight-accent-button-pressed",
            "highlight-toolbar-tab-underline-document",
            "highlight-toolbar-tab-underline-spreadsheet",
            "highlight-toolbar-tab-underline-presentation",
            "highlight-toolbar-tab-underline-pdf",
            "highlight-toolbar-tab-underline-visio",
            "highlight-header-tab-underline-document",
            "highlight-header-tab-underline-spreadsheet",
            "highlight-header-tab-underline-presentation",
            "highlight-header-tab-underline-pdf",
            "highlight-header-tab-underline-visio",

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
            "canvas-cell-title-background",
            "canvas-cell-title-background-hover",
            "canvas-cell-title-background-selected",
            "canvas-cell-title-border",
            "canvas-cell-title-border-hover",
            "canvas-cell-title-border-selected",
            "canvas-cell-title-text",

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
            "canvas-scroll-thumb-target-pressed",

            "canvas-sheet-view-cell-background",
            "canvas-sheet-view-cell-background-hover",
            "canvas-sheet-view-cell-background-pressed",
            "canvas-sheet-view-cell-title-label",

            "canvas-freeze-line-1px",
            "canvas-freeze-line-2px",
            "canvas-select-all-icon",

            "canvas-anim-pane-background",
            "canvas-anim-pane-item-fill-selected",
            "canvas-anim-pane-item-fill-hovered",
            "canvas-anim-pane-button-fill",
            "canvas-anim-pane-button-fill-hovered",
            "canvas-anim-pane-button-fill-disabled",
            "canvas-anim-pane-play-button-fill",
            "canvas-anim-pane-play-button-outline",
            "canvas-anim-pane-effect-bar-entrance-fill",
            "canvas-anim-pane-effect-bar-entrance-outline",
            "canvas-anim-pane-effect-bar-emphasis-fill",
            "canvas-anim-pane-effect-bar-emphasis-outline",
            "canvas-anim-pane-effect-bar-exit-fill",
            "canvas-anim-pane-effect-bar-exit-outline",
            "canvas-anim-pane-effect-bar-path-fill",
            "canvas-anim-pane-effect-bar-path-outline",
            "canvas-anim-pane-timeline-ruler-outline",
            "canvas-anim-pane-timeline-ruler-tick",

            "canvas-anim-pane-timeline-scroller-fill",
            "canvas-anim-pane-timeline-scroller-outline",
            "canvas-anim-pane-timeline-scroller-opacity",
            "canvas-anim-pane-timeline-scroller-opacity-hovered",
            "canvas-anim-pane-timeline-scroller-opacity-active",

            "toolbar-height-controls",
            "sprite-button-icons-uid",
        ];
        var theme_props = {};

        var get_current_theme_colors = function (c) {
            const colors = c || name_colors;
            var out_object = {};
            if ( !(Common.Utils.isIE10 || Common.Utils.isIE11) ) {
                var style = getComputedStyle(document.body);
                colors.forEach(function (item, index) {
                    out_object[item] = style.getPropertyValue('--' + item).trim()
                })
            }

            return out_object;
        }

        const validate_vars = function (obj) {
            if ( obj ) {
                let i = 0, count = 5;
                for (const value of Object.values(obj)) {
                    if (value != "") {
                        return true;
                    }

                    if ( ++i < count )
                        break;
                }
            }

            return false;
        }

        var create_colors_css = function (id, colors) {
            if ( !!colors && !!id ) {
                var _css_array = [':root .', id, '{'];
                for (var c in colors) {
                    if (c==='highlight-toolbar-tab-underline') {
                        _css_array.push('--', c + '-document', ':', colors[c], ';');
                        _css_array.push('--', c + '-spreadsheet', ':', colors[c], ';');
                        _css_array.push('--', c + '-presentation', ':', colors[c], ';');
                        _css_array.push('--', c + '-pdf', ':', colors[c], ';');
                        _css_array.push('--', c + '-visio', ':', colors[c], ';');
                        console.log("Obsolete: The 'highlight-toolbar-tab-underline' color for interface themes is deprecated. Please use 'highlight-toolbar-tab-underline-document', 'highlight-toolbar-tab-underline-presentation', etc. instead.");
                    } else
                        _css_array.push('--', c, ':', colors[c], ';');
                }

                _css_array.push('}');
                return _css_array.join('');
            }
        }

        var write_theme_css = function (id, css) {
            if ( !!css ) {
                var style = document.createElement('style');
                style.id = id;
                style.type = 'text/css';
                style.innerHTML = css;
                document.getElementsByTagName('head')[0].appendChild(style);
            }
        }

        const normalize_theme_icons = t => {
            if ( t.src && t.src.icons ) {
                !t.icons && (t.icons = {});

                if ( !!t.src.icons['sprite-buttons-base-url'] )
                    t.icons.basepath = t.src.icons['sprite-buttons-base-url'];

                if ( !!t.src.icons['style-class-selector'] )
                    t.icons.src = t.src.icons['style-class-selector'];
            }
        };

        var parse_themes_object = function (obj) {
            var curr_lang = Common.Locale.getCurrentLanguage(),
                theme_label;
            if ( !!obj.themes && obj.themes instanceof Array ) {
                obj.themes.forEach(function (item) {
                    if ( !!item.id ) {
                        theme_label = !item.l10n || !item.l10n[curr_lang] ? item.name : item.l10n[curr_lang];
                        themes_map[item.id] = {text: theme_label, type: item.type, src: item};
                        // write_theme_css(item.id, create_colors_css(item.id, item.colors));
                    } else
                    if ( typeof item == 'string' ) {
                        get_themes_config(item)
                    }
                });
            } else
            if ( obj.id ) {
                theme_label = !obj.l10n || !obj.l10n[curr_lang] ? obj.name : obj.l10n[curr_lang];
                themes_map[obj.id] = {text: theme_label, type: obj.type, src: obj};
                // write_theme_css( obj.id, create_colors_css(obj.id, obj.colors) );
            }

            Common.NotificationCenter.trigger('uitheme:countchanged');
        }

        const check_launched_custom_theme = function () {
            let theme_id = window.uitheme.id;
            if ( themes_map[theme_id] ) {
                if ( themes_map[theme_id].source != 'static') {
                    const m = document.body.className.match('theme-type-' + themes_map[theme_id].type);
                    if ( !m )
                        document.body.classList.add('theme-type-' + themes_map[theme_id].type);
                    else if ( m.length )
                        document.body.className = document.body.className.replace(/theme-type-(?:dark|ligth)/i, 'theme-type-' + themes_map[theme_id].type);
                }
            } else {
                theme_id = get_system_default_theme().id;

                document.body.className = document.body.className.replace(/theme-[\w-]+\s?/gi, '').trim();
                document.body.classList.add(theme_id, 'theme-type-' + themes_map[theme_id].type);
            }

            const s = Common.localStorage.getItem('ui-theme');
            if (!s || get_ui_theme_name(s) !== theme_id) {
                var theme_obj = {
                    id: theme_id,
                    type: themes_map[theme_id].type,
                    text: themes_map[theme_id].text,
                    colors: get_current_theme_colors(),
                };

                if ( themes_map[theme_id].icons )
                    theme_obj.icons = themes_map[theme_id].icons;

                Common.localStorage.setItem('ui-theme', JSON.stringify(theme_obj));
            }
        }

        var get_themes_config = function (url) {
            const me = this;

            Common.Utils.loadConfig(url,
                function ( obj ) {
                    if ( obj != 'error' ) {
                        parse_themes_object(obj);
                        check_launched_custom_theme();
                    } else {
                        console.warn('failed to load/parse themes.json');
                    }
                }
            );
        }

        var on_document_ready = function (el) {
            // get_themes_config('../../common/main/resources/themes/themes.json');
            if ( !Common.Controllers.Desktop.isActive() /*|| !Common.Controllers.Desktop.isOffline()*/ )
                get_themes_config.call(this, '../../../../themes.json');
            else
            if ( Common.Controllers.Desktop.localThemes() ) {
                parse_themes_object({'themes': Common.Controllers.Desktop.localThemes()});
                check_launched_custom_theme();
            }
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
            // if ( !!this.api.asc_setContentDarkMode && this.isDarkTheme() ) {
            //     this.api.asc_setContentDarkMode(this.isContentThemeDark());
            // }
        };

        const is_theme_type_system = function (id) { return themes_map[id].type == THEME_TYPE_SYSTEM; }
        const get_system_theme_type = function () {
            if ( Common.Controllers.Desktop && Common.Controllers.Desktop.isActive() )
                return Common.Controllers.Desktop.systemThemeType();

            return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME_TYPE_DARK : THEME_TYPE_LIGHT;
        }
        const get_system_default_theme = function () {
            const id = get_system_theme_type() == THEME_TYPE_DARK ?
                window.uitheme.DEFAULT_DARK_THEME_ID : window.uitheme.DEFAULT_LIGHT_THEME_ID;

            return {id: id, info: themes_map[id]};
        };

        const on_system_theme_dark = function (mql) {
            if ( window.uitheme.is_theme_system() ) {
                refresh_theme.call(this, true);
            }
        };

        const apply_theme = function (id) {
            window.uitheme.set_id(id);

            const theme_id = window.uitheme.relevant_theme_id();
            if ( !!themes_map[theme_id].src ) {
                let t = themes_map[theme_id];
                write_theme_css(t.src.id, create_colors_css(t.src.id, t.src.colors));
                normalize_theme_icons(t);

                delete t.src;
            }

            document.body.className = document.body.className.replace(/theme-[\w-]+\s?/gi, '').trim();
            document.body.classList.add(theme_id, 'theme-type-' + themes_map[theme_id].type);

            let icons_base_url = getComputedStyle(document.body).getPropertyValue('--sprite-button-icons-base-url');
            if ( !!themes_map[theme_id].icons ) {
                if ( !!themes_map[theme_id].icons.basepath )
                    icons_base_url = themes_map[theme_id].icons.basepath;
                else if ( icons_base_url )
                    themes_map[theme_id].icons.basepath = icons_base_url;

                if ( themes_map[theme_id].icons.cls )
                    document.body.classList.add('theme-icons-cls-' + themes_map[theme_id].icons.cls);
            }

            if ( icons_base_url && !(window.uitheme.embedicons === true) ) {
                window.uitheme.apply_icons_from_url(theme_id, icons_base_url);
            }

            if ( this.api.asc_setContentDarkMode )
                if ( themes_map[theme_id].type == 'dark' ) {
                    this.api.asc_setContentDarkMode(this.isContentThemeDark());
                    Common.NotificationCenter.trigger('contenttheme:dark', this.isContentThemeDark());
                } else {
                    this.api.asc_setContentDarkMode(false);
                }

            const colors_obj = get_current_theme_colors();
            if ( validate_vars(colors_obj) ) {
                colors_obj.type = themes_map[theme_id].type;
                colors_obj.name = theme_id;
                this.api.asc_setSkin(colors_obj);

                if ( !(Common.Utils.isIE10 || Common.Utils.isIE11) ) {
                    const theme_str = Common.localStorage.getItem("ui-theme");
                    let theme_id;
                    if ( theme_str ) {
                        const reid = /id":\s?"([\w-]+)/.exec(theme_str);
                        if ( reid[1] ) {
                            theme_id = reid[1];
                        }
                    }

                    if ( theme_id !== id ) {

                    // if ( themes_map[id].source != 'static' ) { // TODO: check writing styles
                        const theme_obj = Object.assign({id:id, colors: colors_obj},
                                                            themes_map[id]);
                        delete theme_obj.source;

                        Common.localStorage.setItem('ui-theme', JSON.stringify(theme_obj));
                    }
                }
            }
            theme_props = {};
        }

        const refresh_theme = function (force, caller) {
            if ( force || Common.localStorage.getItem('ui-theme-id') != window.uitheme.id ) {
                const theme_id = Common.localStorage.getItem('ui-theme-id');

                if ( theme_id ) {
                    apply_theme.call(this, theme_id);
                    Common.NotificationCenter.trigger('uitheme:changed', theme_id, caller);
                }
            }
        }

        return {
            init: function (api) {
                ['toolbar-header-document', 'toolbar-header-spreadsheet', 'toolbar-header-presentation', 'toolbar-header-pdf', 'toolbar-header-visio']
                    .forEach(function (i) {
                        document.documentElement.style.removeProperty('--' + i);
                    });


                Common.Gateway.on('opendocument', on_document_open.bind(this));
                $(window).on('storage', function (e) {
                    if ( e.key == 'ui-theme-id' && !Common.Controllers.Desktop.isActive() ) {
                        if ( !!e.originalEvent.newValue ) {
                            refresh_theme.call(this);
                        }
                    } else
                    if ( e.key == 'content-theme' ) {
                        this.setContentTheme(e.originalEvent.newValue, true, false);
                    }
                }.bind(this))

                this.api = api;

                const theme_id = window.uitheme.relevant_theme_id();
                if ( window.uitheme.type && themes_map[theme_id] &&
                        window.uitheme.type !== themes_map[theme_id].type )
                {
                    apply_theme.call(this, window.uitheme.id);
                }

                const obj = get_current_theme_colors(name_colors);
                obj.type = window.uitheme.type ? window.uitheme.type : themes_map[theme_id] ? themes_map[theme_id].type : THEME_TYPE_LIGHT;
                obj.name = theme_id;
                api.asc_setSkin(obj);

                const is_content_dark = themes_map[theme_id] && themes_map[theme_id].type == 'dark' && window.uitheme.iscontentdark;
                if ( api.asc_setContentDarkMode )
                    api.asc_setContentDarkMode(is_content_dark);

                if ( !document.body.classList.contains('theme-type-' + obj.type) )
                    document.body.classList.add('theme-type-' + obj.type);

                if ( !themes_map[theme_id] && window.uitheme && window.uitheme.id == theme_id ) {
                    themes_map[theme_id] = window.uitheme;
                }

                const comp_style = getComputedStyle(document.body);
                if (themes_map[theme_id] && themes_map[theme_id].icons) {
                    if ( !document.querySelector('style#' + theme_id) && !(window.uitheme.embedicons === true) ) {
                        const icons_base_url = !!themes_map[theme_id].icons.basepath ? themes_map[theme_id].icons.basepath :
                                comp_style.getPropertyValue('--sprite-button-icons-base-url');

                        if ( icons_base_url )
                            window.uitheme.apply_icons_from_url(theme_id, icons_base_url);
                    }

                    if ( themes_map[theme_id].icons.cls ) {
                        document.body.classList.add('theme-icons-cls-' + themes_map[theme_id].icons.cls);
                    }
                }

                if ( !(Common.Utils.isIE10 || Common.Utils.isIE11) && !Common.Controllers.Desktop.isActive() )
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
                if ( Common.Controllers.Desktop.isActive() && !Common.Controllers.Desktop.systemThemeSupported() ) {
                    const new_map = Object.assign({}, themes_map);
                    delete new_map['theme-system'];

                    return new_map;
                }
                return themes_map
            },

            get: function (id) {
                return themes_map[id]
            },

            currentThemeId: function () {
                return !!themes_map[window.uitheme.id] ? window.uitheme.id : window.uitheme.DEFAULT_LIGHT_THEME_ID;
            },

            currentThemeColor: function (token) {
                return getComputedStyle(document.body).getPropertyValue(token);
            },

            defaultThemeId: function (type) {
                return type == 'dark' ? window.uitheme.DEFAULT_LIGHT_THEME_ID : window.uitheme.DEFAULT_LIGHT_THEME_ID;
            },

            defaultTheme: function (type) {
                return themes_map[this.defaultThemeId(type)]
            },

            isDarkTheme: function (id) {
                !id && (id = this.currentThemeId());
                return (is_theme_type_system(id) ? get_system_default_theme().info.type : themes_map[id].type) == THEME_TYPE_DARK;
            },

            isContentThemeDark: function () {
                return window.uitheme.iscontentdark;
            },

            setContentTheme: function (mode, force, keep) {
                var set_dark = mode == 'dark';
                if ( set_dark != window.uitheme.iscontentdark || force ) {
                    window.uitheme.iscontentdark = set_dark;

                    if ( this.isDarkTheme() )
                        this.api.asc_setContentDarkMode(set_dark);

                    if ( !(keep === false) && Common.localStorage.getItem('content-theme') != mode )
                        Common.localStorage.setItem('content-theme', mode);

                    Common.NotificationCenter.trigger('contenttheme:dark', set_dark);
                }
            },

            toggleContentTheme: function () {
                window.uitheme.iscontentdark = !window.uitheme.iscontentdark;
                Common.localStorage.setItem('content-theme', window.uitheme.iscontentdark ? 'dark' : 'light');

                if ( this.isDarkTheme() )
                    this.api.asc_setContentDarkMode(window.uitheme.iscontentdark);

                Common.NotificationCenter.trigger('contenttheme:dark', window.uitheme.iscontentdark);
            },

            setTheme: function (obj, caller) {
                if ( !obj ) return;

                const id = get_ui_theme_name(obj);
                if ( themes_map[id] ) {
                    if ( !(id == window.uitheme.id) ) {
                        apply_theme.call(this, id);

                        Common.localStorage.setItem('ui-theme-id', id);
                        Common.NotificationCenter.trigger('uitheme:changed', id, caller);
                    }
                }
            },

            refreshTheme: refresh_theme,

            addTheme: function (obj) {
                parse_themes_object(obj);
            },

            toggleTheme: function () {
                // this.setTheme( this.isDarkTheme() ? id_default_light_theme : id_default_dark_theme );
            },

            getThemeColors: function() {
                const theme_id = window.uitheme.relevant_theme_id();
                const obj = get_current_theme_colors();
                obj.type = themes_map[theme_id] ? themes_map[theme_id].type : 'light';
                obj.name = theme_id;
                return obj;
            },

            getThemeProps: function(prop) {
                if (prop==='font') {
                    if (!theme_props[prop]) {
                        theme_props[prop] = {
                            size: document.documentElement.style.getPropertyValue("--font-size-base-app-custom") || window.getComputedStyle(document.body).getPropertyValue("--font-size-base") || '11px',
                            name: document.documentElement.style.getPropertyValue("--font-family-base-custom") || 'Arial, Helvetica, "Helvetica Neue", sans-serif'
                        };
                    }
                } else if (prop==='tab-style') {
                    return (Common.Utils.isIE || Common.Controllers.Desktop && Common.Controllers.Desktop.isWinXp()) ? 'fill' : window.getComputedStyle(document.body).getPropertyValue("--toolbar-preferred-tab-style") || 'line';
                } else if (prop==='small-btn-size') {
                    if (!theme_props[prop]) {
                        theme_props[prop] = window.getComputedStyle(document.body).getPropertyValue("--x-small-btn-size") || '20px';
                    }
                }
                return theme_props[prop];
            }
        }
    })(Common.UI.Themes);
});
