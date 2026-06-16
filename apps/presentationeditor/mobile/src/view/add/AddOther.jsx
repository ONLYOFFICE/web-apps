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

import React, {useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Page, Navbar, Icon, ListButton, ListInput, BlockTitle, SkeletonBlock, Segmented, Button} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../../../common/mobile/utils/device";
import SvgIcon from "../../../../../common/mobile/lib/component/SvgIcon";
import IconDraw from "../../../../../common/mobile/resources/icons/draw.svg";
import IconAddTableIos from '@common-ios-icons/icon-add-table.svg?ios';
import IconAddTableAndroid from '@common-android-icons/icon-add-table.svg';
import IconInsertCommentIos from '@common-ios-icons/icon-insert-comment.svg?ios';
import IconInsertCommentAndroid from '@common-android-icons/icon-insert-comment.svg';
import IconImage from '@common-icons/icon-image.svg';
import IconLinkIos from '@common-ios-icons/icon-link.svg?ios';
import IconLinkAndroid from '@common-android-icons/icon-link.svg';

const PageTable = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const storeTableSettings = props.storeTableSettings;
    const styles = storeTableSettings.arrayStylesDefault;

    return (
        <Page id={'add-table'}>
            <Navbar title={_t.textTable} backLink={_t.textBack}/>
            <div className={'table-styles dataview'}>
                <ul className="row">
                    {!styles.length ?
                        Array.from({ length: 70 }).map((item,index) => (
                        <li className='skeleton-list' key={index}>    
                            <SkeletonBlock width='70px' height='8px' effect="fade" />
                            <SkeletonBlock width='70px' height='8px' effect="fade" />
                            <SkeletonBlock width='70px' height='8px' effect="fade" />
                            <SkeletonBlock width='70px' height='8px' effect="fade" />
                            <SkeletonBlock width='70px' height='8px' effect="fade" />
                        </li>
                        )) :
                            styles.map((style, index) => {
                                return (
                                    <li key={index}
                                        onClick={() => {props.onStyleClick(style.templateId)}}>
                                        <img src={style.imageUrl}/>
                                    </li>
                                )
                            })
                    }
                </ul>
            </div>
        </Page>
    )
};

const AddOther = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const showInsertLink = props.storeLinkSettings.canAddLink && !props.storeFocusObjects.paragraphLocked;
    const hideAddComment = props.hideAddComment();
    const isHyperLink = props.storeFocusObjects.settings.indexOf('hyperlink') > -1;
    const canComments = props.storeAppOptions.canComments;

    return (
        <List>
            <ListItem title={_t.textTable} link={'/add-table/'} onClick = {() => props.onGetTableStylesPreviews()} routeProps={{
                onStyleClick: props.onStyleClick,
            }}>
                {Device.ios ? 
                    <SvgIcon slot="media"  symbolId={IconAddTableIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media" symbolId={IconAddTableAndroid.id} className={'icon icon-svg'} />
                }
            </ListItem>
            {!hideAddComment && canComments && <ListItem title={_t.textComment} onClick={() => {
                props.closeModal();
                Common.Notifications.trigger('addcomment');
            }}>
                {Device.ios ? 
                    <SvgIcon slot="media"  symbolId={IconInsertCommentIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media"  symbolId={IconInsertCommentAndroid.id} className={'icon icon-svg'} />
                }
            </ListItem>}
            <ListItem title={_t.textImage} link='/add-image/'>
                <SvgIcon slot="media" symbolId={IconImage.id} className={'icon icon-svg'} />
            </ListItem>
            {showInsertLink &&
                <ListItem title={_t.textLink} link={isHyperLink ? '/edit-link/' : '/add-link/'} routeProps={{
                    onClosed: props.onCloseLinkSettings,
                    isNavigate: true
                }}>
                    {Device.ios ? 
                        <SvgIcon slot="media"  symbolId={IconLinkIos.id} className={'icon icon-svg'} /> :
                        <SvgIcon slot="media"  symbolId={IconLinkAndroid.id} className={'icon icon-svg'} />
                    }
                </ListItem>
            }
          <ListItem key='drawing' title={_t.textDrawing} onClick={() => {
            props.closeModal();
            Common.Notifications.trigger('draw:start');
          }}>
            <SvgIcon slot='media' symbolId={IconDraw.id} className='icon icon-svg'/>
          </ListItem>
        </List>
    )
};

const PageAddTable = inject("storeTableSettings")(observer(PageTable));
const AddOtherContainer = inject("storeFocusObjects", "storeLinkSettings", "storeAppOptions")(observer(AddOther));

export {AddOtherContainer as AddOther,
        PageAddTable};
