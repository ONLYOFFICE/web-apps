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

import {action, observable, computed, makeObservable} from 'mobx';

export class storeSlideSettings {
    constructor() {
        makeObservable(this, {
            arrayLayouts: observable,
            slideLayoutIndex: observable,
            fillColor: observable,
            arrayThemes: observable,
            slideThemeIndex: observable,
            getFillColor: action,
            changeFillColor: action,
            addArrayLayouts: action,
            slideLayouts: computed,
            changeSlideLayoutIndex: action,
            addArrayThemes: action,
            changeSlideThemeIndex: action,
        });
    }

    arrayLayouts;
    slideLayoutIndex = -1;
    fillColor = undefined;
    arrayThemes;
    slideThemeIndex;
    
    getFillColor (slideObject) {
        let color = 'transparent';
        let fill = slideObject.get_background(),
            fillType = fill.get_type();
        let sdkColor;

        if (fillType == Asc.c_oAscFill.FILL_TYPE_SOLID) {
            fill = fill.get_fill();
            sdkColor = fill.get_color();

            if (sdkColor) {
                if (sdkColor.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                    color = {color: Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b()), effectValue: sdkColor.get_value()};
                } else {
                    color = Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b());
                }
            }
        }

        this.fillColor = color;
        return color;
    }

    changeFillColor (color) {
        this.fillColor = color;
    }

    addArrayLayouts(array) {
        this.arrayLayouts = array;
    }

    get slideLayouts () {
        const layouts = [];
        const columns = 2;
        let row = -1;
        this.arrayLayouts.forEach((item, index)=>{
            if (0 == index % columns) {
                layouts.push([]);
                row++
            }
            layouts[row].push({
                type: item.getIndex(),
                image: item.get_Image(),
                width: item.get_Width(),
                height: item.get_Height()
            });
        });
        return layouts;
    }

    changeSlideLayoutIndex(index) {
        this.slideLayoutIndex = index;
    }

    addArrayThemes(array) {
        this.arrayThemes = array;
    }

    changeSlideThemeIndex(index) {
        this.slideThemeIndex = index;
    }
}
