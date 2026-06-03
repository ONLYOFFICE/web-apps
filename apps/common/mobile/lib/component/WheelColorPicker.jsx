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

import React, { useEffect, useState, useImperativeHandle } from 'react'
import { f7 } from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import SvgIcon from '@common/lib/component/SvgIcon'
import IconPlusIos from '@common-ios-icons/icon-plus.svg?ios';
import IconPlusAndroid from '@common-android-icons/icon-plus.svg?android';

export const WheelColorPicker = ({ initialColor = '#ffffff', onSelectColor, ref }) => {
    const [color, setColor] = useState(initialColor);
    const pickerInstance = React.useRef(null);

    useImperativeHandle(ref, () => ({
        update: () => {
            if (pickerInstance.current?.modules) {
                pickerInstance.current.update();
            }
        },
        setValue: (hex) => {
            if (pickerInstance.current) {
                pickerInstance.current.setValue({ hex });
            }
        }
    }), []);

    useEffect(() => {
        const container = document.querySelector('.color-picker-container');
        if (!container || pickerInstance.current) return;

        pickerInstance.current = f7.colorPicker.create({
            containerEl: container,
            value: { hex: initialColor },
            on: {
                change: (value) => setColor(value.getValue().hex)
            }
        });

        return () => {
            pickerInstance.current?.destroy();
            pickerInstance.current = null;
        };
    }, []);

    useEffect(() => {
        if (pickerInstance.current) {
            pickerInstance.current.setValue({ hex: initialColor });
            setColor(initialColor);
        }
    }, [initialColor]);

    return (
        <div id='color-picker'>
            <div className='color-picker-container'/>
            <div className='right-block'>
                <div className='color-hsb-preview'>
                    <div className='new-color-hsb-preview' style={{ backgroundColor: color }}/>
                    <div className='current-color-hsb-preview' style={{ backgroundColor: initialColor }}/>
                </div>
                <a href='#' id='add-new-color' className='button button-round' onClick={() => onSelectColor(color)}>
                    {Device.ios ?
                        <SvgIcon slot="media" symbolId={IconPlusIos.id} className='icon icon-svg'/> :
                        <SvgIcon slot="media" symbolId={IconPlusAndroid.id} className='icon icon-svg white'/>
                    }
                </a>
            </div>
        </div>
    )
}
