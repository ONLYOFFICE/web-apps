import React, { createContext, useCallback, useEffect } from 'react';
import { LocalStorage } from "../../utils/LocalStorage.mjs";
import { inject, observer } from "mobx-react";
import { useTranslation } from 'react-i18next';

export const ThemesContext = createContext();
export const ThemesProvider = props => {
    const { t } = useTranslation();
    const storeThemes = props.storeThemes;
    const themes = storeThemes.themes;
    const nameColors = storeThemes.nameColors;
    const translationThemes = getTranslationThemes();

    useEffect(() => {
        initTheme();
    }, []);

    function getTranslationThemes() {
        return Object.keys(themes).reduce((acc, theme) => {
            acc[theme] = (t(`Common.Themes.${theme}`));
            return acc;
        }, {});
    }

    const initTheme = () => {
        // localStorage.clear();
        const editorConfig = window.native?.editorConfig;
        const obj = LocalStorage.getItem("ui-theme");
        
        let theme = themes.light;
        
        if(editorConfig) {
            const themeConfig = editorConfig.theme;
            const typeTheme = themeConfig ? themeConfig.type : null;
            const isSelectTheme = themeConfig ? themeConfig.select : null;

            if(isSelectTheme) {
                if(!!obj) {
                    theme = setClientTheme(theme, obj);
                } else {
                    theme = checkConfigTheme(theme, typeTheme);
                } 
            } else {
                theme = checkConfigTheme(theme, typeTheme);
            }
            
            storeThemes.setConfigSelectTheme(isSelectTheme);
        } else {
            if (!!obj) {
                theme = setClientTheme(theme, obj);
            } else {
                theme = checkSystemDarkTheme(theme);
            }
        }  

        changeColorTheme(theme);

        $$(window).on('storage', e => {
            if (e.key == LocalStorage.prefix + 'ui-theme') {
                if (!!e.newValue) {
                    changeColorTheme(JSON.parse(e.newValue));
                }
            }
        });
    }

    const setClientTheme = (theme, obj) => {
        const type = JSON.parse(obj).type;

        if(type !== 'system') {
            theme = themes[JSON.parse(obj).type];

            LocalStorage.setItem("ui-theme", JSON.stringify(theme));
            storeThemes.setColorTheme(theme);
        } else {
            theme = checkSystemDarkTheme(theme);
        }

        return theme;
    }

    const checkConfigTheme = (theme, typeTheme) => {
        if(typeTheme && typeTheme !== 'system') { 
            theme = themes[typeTheme];

            LocalStorage.setItem("ui-theme", JSON.stringify(theme));
            storeThemes.setColorTheme(theme);
        } else {
            theme = checkSystemDarkTheme(theme);
        }

        return theme;
    }

    const checkSystemDarkTheme = (theme) => {
        if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = themes['dark'];

            LocalStorage.setItem("ui-theme", JSON.stringify(themes["system"]));
            storeThemes.setColorTheme(themes["system"]);
        }

        return theme;
    }

    const getCurrentThemeColors = colors => {
        let out_object = {};
        const style = getComputedStyle(document.body);

        colors.forEach((item, index) => {
            out_object[item] = style.getPropertyValue('--' + item).trim()
        })

        return out_object;
    }

    const changeColorTheme = theme => {
        // let theme = themes.light;

        // if(type !== "system") {
        //     theme = themes[type];

        //     LocalStorage.setItem("ui-theme", JSON.stringify(theme));
        //     storeThemes.setColorTheme(theme);
        // } else {
        //     const isSystemDarkTheme = this.checkSystemDarkTheme();
        //     if(isSystemDarkTheme) theme = themes.dark;

        //     LocalStorage.setItem("ui-theme", JSON.stringify(themes["system"]));
        //     storeThemes.setColorTheme(themes["system"]);
        // }

        const $body = $$('body');
        $body.attr('class') && $body.attr('class', $body.attr('class').replace(/\s?theme-type-(?:dark|light)/, ''));
        $body.addClass(`theme-type-${theme.type}`);

        const onEngineCreated = api => {
            let obj = getCurrentThemeColors(nameColors);
            obj.type = theme.type;
            obj.name = theme.id;

            api.asc_setSkin(obj);
        };

        const api = Common.EditorApi ? Common.EditorApi.get() : undefined;
        if(!api) Common.Notifications.on('engineCreated', onEngineCreated);
        else onEngineCreated(api);
    }

    return (
        <ThemesContext.Provider value={{ changeColorTheme, translationThemes }}>
            {props.children}
        </ThemesContext.Provider>
    )
}

const themes = inject('storeThemes')(observer(ThemesProvider));
export {themes as Themes}