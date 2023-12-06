import React, { createContext, useEffect } from 'react';
import { LocalStorage } from "../../utils/LocalStorage.mjs";
import { inject, observer } from "mobx-react";
import { useTranslation } from 'react-i18next';

export const ThemesContext = createContext();
export const ThemesProvider = props => {
    const { t, ready } = useTranslation();
    const storeThemes = props.storeThemes;
    const themes = storeThemes.themes;
    const nameColors = storeThemes.nameColors;

    useEffect(() => {
        initTheme();
    }, []);

    useEffect(() => {
        if (ready) {
            const translations = getTranslationsThemes();
            storeThemes.setTranslationsThemes(translations);
        }
    }, [ready]);

    const getTranslationsThemes = () => {
        const translations = Object.keys(themes).reduce((acc, theme) => {
            acc[theme] = t(`Common.Themes.${theme}`);
            return acc;
        }, {});

        return translations;
    }

    const initTheme = () => {
        const clientTheme = LocalStorage.getItem("ui-theme");
        const editorConfig = window.native?.editorConfig;

        storeThemes.setConfigSelectTheme(editorConfig?.theme?.select != false);
        setUITheme(clientTheme ? JSON.parse(clientTheme).type : editorConfig?.theme?.type);

        applyTheme();
    }

    const setUITheme = type => {
        if(type && type !== 'system') {
            const theme = themes[type];
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

        LocalStorage.setItem("ui-theme", JSON.stringify(theme));
        storeThemes.setColorTheme(theme);

        if(type !== "system") {
            storeThemes.resetSystemColorTheme();
        } else {
            setSystemTheme();
        }

        applyTheme();
    }

    const applyTheme = () => {
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
        <ThemesContext.Provider value={{ changeTheme }}>
            {props.children}
        </ThemesContext.Provider>
    )
}

const themes = inject('storeThemes')(observer(ThemesProvider));
export {themes as Themes}