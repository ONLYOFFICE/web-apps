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

import React, {Fragment, useState} from 'react';
import {Page, Navbar, BlockTitle, List, ListItem, ListInput, ListButton, Icon} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../../common/mobile/utils/device';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconImageLibraryIos from '@common-ios-icons/icon-image-library.svg?ios';
import IconImageLibraryAndroid from '@common-android-icons/icon-image-library.svg';
import IconLinkIos from '@common-ios-icons/icon-link.svg?ios';
import IconLinkAndroid from '@common-android-icons/icon-link.svg';

const AddImageList = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    return (
        <List>
            <ListItem title={_t.textPictureFromLibrary} onClick={() => {props.onInsertByFile()}}>
                {Device.ios ? 
                    <SvgIcon slot="media" symbolId={IconImageLibraryIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media" symbolId={IconImageLibraryAndroid.id} className={'icon icon-svg'} />
                }
            </ListItem>
            <ListItem title={_t.textPictureFromURL} link={'/add-image-from-url/'} routeProps={{
                onInsertByUrl: props.onInsertByUrl
            }}>
                {Device.ios ?
                    <SvgIcon slot="media" symbolId={IconLinkIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media" symbolId={IconLinkAndroid.id} className={'icon icon-svg'} />
                }
            </ListItem>
        </List>
    )
};

const PageLinkSettings = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const [stateValue, setValue] = useState('');
    return (
        <Page>
            <Navbar title={t('View.Add.textPasteImageUrl')} backLink={_t.textBack}></Navbar>
            <BlockTitle>{_t.textAddress}</BlockTitle>
            <List className='add-image'>
                <ListInput
                    type='text'
                    placeholder={_t.textImageURL}
                    value={stateValue}
                    onChange={(event) => {setValue(event.target.value)}}
                >
                </ListInput>
            </List>
            <List className="buttons-list">
                <ListButton className={'button-fill button-raised' + (stateValue.length < 1 ? ' disabled' : '')}
                            title={_t.textInsertImage}
                            onClick={() => {props.onInsertByUrl(stateValue)}}></ListButton>
            </List>
        </Page>
    )
};

const AddImage = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    return (
        props.inTabs ?
            <AddImageList onInsertByFile={props.onInsertByFile} onInsertByUrl={ props.onInsertByUrl} /> :
            <Page>
                <Navbar title={_t.textImage} backLink={_t.textBack}/>
                <AddImageList onInsertByFile={props.onInsertByFile} onInsertByUrl={ props.onInsertByUrl} />
            </Page>
        )
};

export {AddImage, PageLinkSettings as PageImageLinkSettings};
