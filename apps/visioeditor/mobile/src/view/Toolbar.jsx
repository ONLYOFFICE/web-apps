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

import React, {Fragment, useEffect } from 'react';
import {NavLeft, NavRight, Link} from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import { useTranslation } from 'react-i18next';
import SvgIcon from '@common/lib/component/SvgIcon'
import IconSwitchToDesktop from '@common/resources/icons/switch-desktop.svg'
import IconReturnIos from '@common-ios-icons/icon-return.svg?ios';
import IconReturnAndroid from '@common-android-icons/icon-return.svg';
import IconSettingsIos from '@common-ios-icons/icon-settings.svg?ios';
import IconSettingsAndroid from '@common-android-icons/icon-settings.svg';

const ToolbarView = props => {
    const { t } = useTranslation();
    const isDisconnected = props.isDisconnected;
    const docTitle = props.docTitle;
    const isOpenModal = props.isOpenModal;

    useEffect(() => {

        return () => {
        }
    }, []);

    return (
        <Fragment>
            <NavLeft>
                {(props.isShowBack) && <Link iconOnly className={`btn-doc-back${(props.disabledControls || isOpenModal) && ' disabled'}`} onClick={() => Common.Notifications.trigger('goback')}>
                {Device.ios ? 
                    <SvgIcon slot="media" symbolId={IconReturnIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media" symbolId={IconReturnAndroid.id} className={'icon icon-svg'} />
                }</Link>}
            </NavLeft>
            {(!Device.phone  && !props.isHiddenFileName) &&
                <div className='title' onClick={() => props.changeTitleHandler()} style={{width: '71%'}}>
                    {docTitle}
                </div>
            }
            <NavRight>
                {!Device.phone && <Link key='desktop-link' iconOnly href={false}
                                       className={isOpenModal || props.disabledControls ? 'disabled' : ''}
                                       onClick={() => props.forceDesktopMode()}>
                                        <SvgIcon symbolId={IconSwitchToDesktop.id}
                                             className={'icon icon-svg'} />
                    </Link>}
                <Link iconOnly className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-settings' href={false} onClick={() => props.openOptions('settings')}>
                {Device.ios ? 
                    <SvgIcon symbolId={IconSettingsIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon symbolId={IconSettingsAndroid.id} className={'icon icon-svg'} />
                }</Link>
            </NavRight>
        </Fragment>
    )
};

export default ToolbarView;
