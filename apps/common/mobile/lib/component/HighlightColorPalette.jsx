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

import React from 'react';
import { f7, ListItem, List, Icon, Page } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../utils/device';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconCancellation from '@common-icons/icon-cancellation.svg';

const HighlightColorPalette = ({changeColor, curColor}) => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const highlightColors = [
        ['ffff00', '00ff00', '00ffff', 'ff00ff', '0000ff', 'ff0000', '00008b', '008b8b'],
        ['006400', '800080', '8b0000', '808000', 'ffffff', 'd3d3d3', 'a9a9a9', '000000']
    ];

    return (
        <List>
            <ListItem>
                <div className='highlight-palette'>
                    {highlightColors.map((row, index) => (
                        <div key={index} className="row">
                            {row.map((effect, index) => {
                                return (
                                    <a key={index} className={(curColor && (curColor.color === effect  || curColor === effect)) ? 'highlight-color highlight-color_active' : 'highlight-color'} style={{ background: `#${effect}`}} onClick={() => {changeColor(effect)}}></a>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </ListItem>
            <ListItem radio checked={(curColor && curColor === 'transparent')} onClick={() => changeColor('transparent')} title={t('Common.HighlightColorPalette.textNoFill')}>
                {!isAndroid && 
                    <SvgIcon slot="media" symbolId={IconCancellation.id} className={'icon icon-svg'} />
                }
            </ListItem>
        </List>
    )
};

export default HighlightColorPalette;
