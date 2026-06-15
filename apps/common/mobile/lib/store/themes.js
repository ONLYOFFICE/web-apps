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

import {action, observable, makeObservable} from 'mobx';

export class storeThemes {
    constructor() {
        makeObservable(this, {
			isConfigSelectTheme: observable,
			setConfigSelectTheme: action,
			colorTheme: observable,
			setColorTheme: action,
            systemColorTheme: observable,
            setSystemColorTheme: action,
            resetSystemColorTheme: action,
            setTranslationsThemes: action,
            isContentThemeDark: observable,
            setContentThemeDark: action,
        });
    }

    themes = {
		dark: {
			id: 'theme-dark',
			type: 'dark',
		},
		light: {
			id: 'theme-light',
			type: 'light',
		},
		system: {
			id: 'theme-system',
			type: 'system',
		}
	}

    nameColors = [
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

		"canvas-cell-title-border",
		"canvas-cell-title-border-hover",
		"canvas-cell-title-border-selected",
		"canvas-cell-title-hover",
		"canvas-cell-title-text",
		"canvas-cell-title-background",
		"canvas-cell-title-background-selected",

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

	isConfigSelectTheme = true;
    setConfigSelectTheme(value) {
        this.isConfigSelectTheme = value;
    }

    isContentThemeDark = false;
    setContentThemeDark(value) {
        this.isContentThemeDark = value;
    }

    colorTheme;
    setColorTheme(theme) {
        this.colorTheme = theme;
    }

    systemColorTheme;
    setSystemColorTheme(theme) {
        this.systemColorTheme = theme;
    }

    resetSystemColorTheme() {
        this.systemColorTheme = null;
    }

    setTranslationsThemes(translations) {
        for(let key in this.themes) {
            this.themes[key].text = translations[key];
        }
    }
}
