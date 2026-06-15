/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
        const theme = window.mobileUiTheme;
        const editorConfig = window.native?.editorConfig;

        storeThemes.setConfigSelectTheme(editorConfig?.theme?.select != false);
        storeThemes.setContentThemeDark(LocalStorage.getItem('content-theme') === 'dark');
        setUITheme(theme ? theme.type : editorConfig?.theme?.type);

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

    const getCurrentTheme = () => storeThemes.systemColorTheme || storeThemes.colorTheme || themes.light;

    const isDarkTheme = () => getCurrentTheme().type === 'dark';

    const getCurrentThemeColors = colors => {
        let outObject = {};
        const style = getComputedStyle(document.body);

        colors.forEach(item => {
            outObject[item] = style.getPropertyValue('--' + item).trim()
        });

        return outObject;
    }

    const applyContentTheme = () => {
        const isContentThemeDark = isDarkTheme() && storeThemes.isContentThemeDark;
        const $body = $$('body');
        const api = Common.EditorApi ? Common.EditorApi.get() : undefined;

        if (isContentThemeDark) {
            $body.addClass('content-theme-dark');
        } else {
            $body.removeClass('content-theme-dark');
        }

        if (api && api.asc_setContentDarkMode) {
            api.asc_setContentDarkMode(isContentThemeDark);
        }
    }

    const changeTheme = key => {
        const theme = themes[key];
        const type = theme.type;

        LocalStorage.setItem("ui-theme-client", JSON.stringify(theme));
        storeThemes.setColorTheme(theme);

        if(type !== "system") {
            storeThemes.resetSystemColorTheme();
        } else {
            setSystemTheme();
        }

        applyTheme();
    }

    const changeContentTheme = isDark => {
        storeThemes.setContentThemeDark(isDark);
        LocalStorage.setItem('content-theme', isDark ? 'dark' : 'light');
        applyContentTheme();
    }

    const applyTheme = () => {
        const $body = $$('body');
        const theme = getCurrentTheme();

        $body.attr('class') && $body.attr('class', $body.attr('class').replace(/\s?theme-type-(?:dark|light)/, ''));
        $body.addClass(`theme-type-${theme.type}`);
        applyContentTheme();

        const onEngineCreated = api => {
            let obj = getCurrentThemeColors(nameColors);
            obj.type = theme.type;
            obj.name = theme.id;

            api.asc_setSkin(obj);
            applyContentTheme();
        };

        const api = Common.EditorApi ? Common.EditorApi.get() : undefined;
        if(!api) Common.Notifications.on('engineCreated', onEngineCreated);
        else onEngineCreated(api);
    }

    return (
        <ThemesContext.Provider value={{
            changeTheme,
            changeContentTheme,
            isDarkTheme: isDarkTheme(),
            isContentThemeDark: storeThemes.isContentThemeDark
        }}>
            {props.children}
        </ThemesContext.Provider>
    )
}

const themes = inject('storeThemes')(observer(ThemesProvider));
export {themes as Themes}
