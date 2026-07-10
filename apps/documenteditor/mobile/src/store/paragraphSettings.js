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

export class storeParagraphSettings {
    constructor() {
        makeObservable(this, {
            styles: observable,
            styleThumbSize: observable,
            styleName: observable,
            backColor: observable,
            initEditorStyles: action,
            paragraphStyles: computed,
            changeParaStyleName: action,
            setBackColor: action,
            getBackgroundColor: action
        });
    }

    styles = [];
    styleThumbSize = null;
    styleName = undefined;

    initEditorStyles (styles) {
        this.styles = styles.get_MergedStyles();
        this.styleThumbSize = {
            width   : styles.STYLE_THUMBNAIL_WIDTH,
            height  : styles.STYLE_THUMBNAIL_HEIGHT
        };
    }

    get paragraphStyles () {
        let _styles = [];
        for (let style of this.styles) {
            _styles.push({
                image   : style.asc_getImage(),
                name    : style.get_Name()
            });
        }
        return _styles;
    }

    changeParaStyleName (name) {
        this.styleName = name;
    }

    backColor = undefined;

    setBackColor (color) {
        this.backColor = color;
    }

    getBackgroundColor (paragraphObject) {
        const shade = paragraphObject.get_Shade();
        let backColor = 'transparent';

        if (!!shade && shade.get_Value() === Asc.c_oAscShdClear) {
            const color = shade.get_Color();
            if (color) {
                if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                    backColor = {
                        color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()),
                        effectValue: color.get_value()
                    };
                } else {
                    backColor = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                }
            }
        }
        
        this.backColor = backColor;
        return backColor;
    }
}
