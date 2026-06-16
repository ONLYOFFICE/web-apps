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

import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';

import { EditText } from '../../view/edit/EditText';

class EditTextController extends Component {
    constructor (props) {
        super(props);
    }

    toggleBold(value) {
        const api = Common.EditorApi.get();
        api.asc_setCellBold(value);
    };

    toggleItalic(value) {
        const api = Common.EditorApi.get();
        api.asc_setCellItalic(value);
    };

    toggleUnderline(value) {
        const api = Common.EditorApi.get();
        api.asc_setCellUnderline(value);
    };

    toggleStrikethrough(value) {
        const api = Common.EditorApi.get();
        api.asc_setCellStrikeout(value);
    }

    // Additional

    onAdditionalStrikethrough(type, value) {
        const api = Common.EditorApi.get();
        const properties = new Asc.asc_CParagraphProperty();
        
        if (api) {          
            if ('strikeout' === type) {
                properties.put_Strikeout(value);
            } else {
                properties.put_DStrikeout(value);
            }
            api.asc_setGraphicObjectProps(properties);
        }
    }

    onAdditionalCaps(type, value) {
        const api = Common.EditorApi.get();
        if (api) {
            const properties = new Asc.asc_CParagraphProperty();
            
            if ('small' === type) {
                properties.put_AllCaps(false);
                properties.put_SmallCaps(value);
            } else {
                properties.put_AllCaps(value);
                properties.put_SmallCaps(false);
            }
            api.asc_setGraphicObjectProps(properties);
        }
    }

    onAdditionalScript(type, value) {
        const api = Common.EditorApi.get();
        if (api) {
            if ('superscript' === type) {
                api.asc_setCellSuperscript(value);
            } else {
                api.asc_setCellSubscript(value);
            }
        }
    }

    changeLetterSpacing(curSpacing, isDecrement) {
        const api = Common.EditorApi.get();
        const step = Common.Utils.Metric.getCurrentMetric() === Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.01;
        const maxValue = Common.Utils.Metric.fnRecalcFromMM(558.7);
        const minValue = Common.Utils.Metric.fnRecalcFromMM(-558.7);
        const newValue = isDecrement
            ? Math.max(minValue, curSpacing - step)
            : Math.min(maxValue, curSpacing + step);
        const convertedValue = Common.Utils.Metric.fnRecalcToMM(newValue);
        if (api) {
            const properties = new Asc.asc_CParagraphProperty();
            properties.put_TextSpacing(convertedValue);
            api.asc_setGraphicObjectProps(properties);
        }
    }

    onParagraphAlign(type) {
        const api = Common.EditorApi.get();
        let value = AscCommon.align_Left;
        
        switch (type) {
            case 'justify':
                value = AscCommon.align_Justify;
                break;
            case 'right':
                value = AscCommon.align_Right;
                break;
            case 'center':
                value = AscCommon.align_Center;
                break;
        }

        api.asc_setCellAlign(value);
    };

    onParagraphValign(type) {
        const api = Common.EditorApi.get();
        let value;

        switch(type) {
            case 'top':
                value = Asc.c_oAscVAlign.Top;
                break;
            case 'center':
                value = Asc.c_oAscVAlign.Center;
                break;
            case 'bottom':
                value = Asc.c_oAscVAlign.Bottom;
                break;
        }

        api.asc_setCellVertAlign(value);
    };

    changeFontSize(curSize, isDecrement) {
        const api = Common.EditorApi.get();
        let size = curSize;

        if (isDecrement) {
            typeof size === 'undefined' ? api.asc_decreaseFontSize() : size = Math.max(1, --size);
        } else {
            typeof size === 'undefined' ? api.asc_increaseFontSize() : size = Math.min(409, ++size);
        }

        if (typeof size !== 'undefined') {
            api.asc_setCellFontSize(size);
        }
    };

    changeFontFamily(name) {
        const api = Common.EditorApi.get();
        if (name) {
            api.asc_setCellFontName(name);
        }
    }

    onTextColor(color) {
        const api = Common.EditorApi.get();
        api.asc_setCellTextColor(Common.Utils.ThemeColor.getRgbColor(color));
    }

    setOrientationTextShape(direction) {
        const api = Common.EditorApi.get();
        const properties = new Asc.asc_CImgProperty();

        properties.asc_putVert(direction);
        api.asc_setGraphicObjectProps(properties);
    }

    setRtlTextdDirection(direction) {
        const api = Common.EditorApi.get();        
        api.asc_setCellReadingOrder(direction);
    }

    render () {
        return (
            <EditText 
                toggleBold={this.toggleBold}
                toggleItalic={this.toggleItalic}
                toggleUnderline={this.toggleUnderline}
                toggleStrikethrough={this.toggleStrikethrough}
                onParagraphAlign={this.onParagraphAlign}
                onParagraphValign={this.onParagraphValign}
                changeFontSize={this.changeFontSize}
                changeFontFamily={this.changeFontFamily}
                onTextColor={this.onTextColor}
                setOrientationTextShape={this.setOrientationTextShape}
                onAdditionalStrikethrough={this.onAdditionalStrikethrough}
                onAdditionalCaps={this.onAdditionalCaps}
                onAdditionalScript={this.onAdditionalScript}
                changeLetterSpacing={this.changeLetterSpacing}
                setRtlTextdDirection={this.setRtlTextdDirection}
            />
        )
    }
}

export default EditTextController;
