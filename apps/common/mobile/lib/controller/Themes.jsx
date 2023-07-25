import React, { createContext, useEffect, useState } from 'react';
import { LocalStorage } from "../../utils/LocalStorage.mjs";
import { inject, observer } from "mobx-react";
import { useTranslation } from 'react-i18next';

export const ThemesContext = createContext();
export const ThemesProvider = props => {
    const { t, ready } = useTranslation();
    const storeThemes = props.storeThemes;
    const themes = storeThemes.themes;
    const nameColors = storeThemes.nameColors;
    const [translationsThemes, setTranslationsThemes] = useState({});

    useEffect(() => {
        initTheme();
    }, []);

    useEffect(() => {
        if (ready) {
            const translations = getTranslationsThemes();
            setTranslationsThemes(translations);
        }
    }, [ready, themes]);

    const getTranslationsThemes = () => {
        const translations = Object.keys(themes).reduce((acc, theme) => {
            acc[theme] = t(`Common.Themes.${theme}`);
            return acc;
        }, {});

        return translations;
    }

    const initTheme = () => {
        const editorConfig = window.native?.editorConfig;
        const obj = LocalStorage.getItem("ui-theme");
        
        if(editorConfig) {
            const themeConfig = editorConfig.theme;
            const typeTheme = themeConfig ? themeConfig.type : null;
            const isSelectTheme = themeConfig ? themeConfig.select : null;

            if(isSelectTheme) {
                if(!!obj) {
                    setClientTheme(obj);
                } else {
                    setConfigTheme(typeTheme);
                } 
            } else {
                setConfigTheme(typeTheme);
            }
            
            storeThemes.setConfigSelectTheme(isSelectTheme);
        } else {
            if (!!obj) {
                setClientTheme(obj);
            } else {
                setSystemTheme();
            }
        }  

        setTheme();
    }

    const setClientTheme = obj => {
        const type = JSON.parse(obj).type;
        let theme;

        if(type !== 'system') {
            theme = themes[JSON.parse(obj).type];

            LocalStorage.setItem("ui-theme", JSON.stringify(theme));
            storeThemes.setColorTheme(theme);
        } else {
            setSystemTheme();
        }
    }

    const setConfigTheme = typeTheme => {
        let theme;

        if(typeTheme && typeTheme !== 'system') { 
            theme = themes[typeTheme];

            storeThemes.setColorTheme(theme);
        } else {
            setSystemTheme();
        }
    }

    const setSystemTheme = () => {
        let theme = themes.light;

        if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = themes.dark;
        }

        storeThemes.setColorTheme(themes["system"]);
        storeThemes.setSystemColorTheme(theme);
    }

    const getCurrentThemeColors = colors => {
        let outObject = {};
        const style = getComputedStyle(document.body);

        colors.forEach(item => {
            outObject[item] = style.getPropertyValue('--' + item).trim()
        });

        return outObject;
    }

    const changeTheme = key => {
        const theme = themes[key];
        const type = theme.type;

        if(type !== "system") {
            LocalStorage.setItem("ui-theme", JSON.stringify(theme));
            storeThemes.resetSystemColorTheme();
            storeThemes.setColorTheme(theme);

            setTheme();
        } else {
            LocalStorage.setItem("ui-theme", JSON.stringify(themes["system"]));
            storeThemes.setColorTheme(themes["system"]);

            setSystemTheme();
            setTheme();
        }
    }

    const setTheme = () => {
        const $body = $$('body');

        let theme = storeThemes.systemColorTheme;
        if(!theme) theme = storeThemes.colorTheme;
    
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
        <ThemesContext.Provider value={{ changeTheme, translationsThemes }}>
            {props.children}
        </ThemesContext.Provider>
    )
}

const themes = inject('storeThemes')(observer(ThemesProvider));
export {themes as Themes}