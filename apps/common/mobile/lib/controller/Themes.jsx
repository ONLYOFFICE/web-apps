import React from 'react';
import { LocalStorage } from "../../utils/LocalStorage.mjs";
import { inject, observer } from "mobx-react";

class ThemesController extends React.Component {
    constructor(props) {
        super(props);
        this.themes_map = {
            dark : {
                id: 'theme-dark',
                type:'dark'
            },
            light: {
                id: 'theme-light',
                type: 'light'
            }};

        this.name_colors = [
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
            "canvas-scroll-thumb-target-pressed",
        ];
    }

    turnOffViewerMode() {
        const appOptions = this.props.storeAppOptions;
        const api = Common.EditorApi.get();

        appOptions.changeViewerMode(false);
        api.asc_addRestriction(Asc.c_oAscRestrictionType.None);
    }

    init() {
        const appOptions = this.props.storeAppOptions;
        const editorConfig = window.native?.editorConfig;
        const editorType = window.editorType;
        const obj = LocalStorage.getItem("ui-theme");
        
        let theme = this.themes_map.light;
        
        if(editorConfig) {
            const isForceEdit = editorConfig.forceedit;
            const themeConfig = editorConfig.theme;
            const typeTheme = themeConfig ? theme.type : null;
            const isSelectTheme = themeConfig ? theme.select : null;

            if(isForceEdit && editorType === 'de') {
                this.turnOffViewerMode();
            } 

            if(isSelectTheme) {
                if(!!obj) {
                    const type = JSON.parse(obj).type;

                    if(type !== 'system') {
                        theme = this.themes_map[JSON.parse(obj).type];
                    } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        theme = this.themes_map['dark'];
                        LocalStorage.setItem("ui-theme", JSON.stringify(theme));
                    }
                } else if(typeTheme && typeTheme !== 'system') {
                    theme = this.themes_map[typeTheme];
                } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    theme = this.themes_map['dark'];
                    LocalStorage.setItem("ui-theme", JSON.stringify(theme));
                }
            } else {
                if(typeTheme && typeTheme !== 'system') { 
                    theme = this.themes_map[typeTheme];
                } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    theme = this.themes_map['dark'];
                    LocalStorage.setItem("ui-theme", JSON.stringify(theme));
                }
            }
        } else {
            if (!!obj) {
                const type = JSON.parse(obj).type;

                if(type !== 'system') {
                    theme = this.themes_map[JSON.parse(obj).type];
                } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    theme = this.themes_map['dark'];
                    LocalStorage.setItem("ui-theme", JSON.stringify(theme));
                }
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                theme = this.themes_map['dark'];
                LocalStorage.setItem("ui-theme", JSON.stringify(theme));
            }
        }  

        appOptions.setColorTheme(theme);
        this.switchDarkTheme(theme, true);

        $$(window).on('storage', e => {
            if ( e.key == LocalStorage.prefix + 'ui-theme' ) {
                if ( !!e.newValue ) {
                    this.switchDarkTheme(JSON.parse(e.newValue), true);
                }
            }
        });
    }

    // get isCurrentDark() {
    //     const obj = LocalStorage.getItem("ui-theme");
    //     return !!obj ? JSON.parse(obj).type === 'dark' : false;
    // }

    get_current_theme_colors(colors) {
        let out_object = {};
        const style = getComputedStyle(document.body);
        colors.forEach((item, index) => {
            out_object[item] = style.getPropertyValue('--' + item).trim()
        })

        return out_object;
    }

    switchDarkTheme(dark) {
        const theme = typeof dark == 'object' ? dark : this.themes_map[dark ? 'dark' : 'light'];
        const refresh_only = !!arguments[1];

        if ( !refresh_only )
            LocalStorage.setItem("ui-theme", JSON.stringify(theme));

        const $body = $$('body');
        $body.attr('class') && $body.attr('class',  $body.attr('class').replace(/\s?theme-type-(?:dark|light)/, ''));
        $body.addClass(`theme-type-${theme.type}`);

        const on_engine_created = api => {
            let obj = this.get_current_theme_colors(this.name_colors);
            obj.type = theme.type;
            obj.name = theme.id;

            api.asc_setSkin(obj);
        };

        const api = Common.EditorApi ? Common.EditorApi.get() : undefined;
        if(!api) Common.Notifications.on('engineCreated', on_engine_created);
        else on_engine_created(api);
    }

    componentDidMount() {
        Common.Notifications.on('engineCreated', (api) => { 
            this.init();
        });
    }

    render() {
        return null;
    }
}

const themes = inject('storeAppOptions')(observer(ThemesController));
export {themes as Themes}