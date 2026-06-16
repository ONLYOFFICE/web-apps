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

import React, { useContext } from 'react';
import { inject, observer } from 'mobx-react';
import {List, ListItem, Icon} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { MainContext } from '../../page/main';
import { Device } from "../../../../../common/mobile/utils/device";
import SvgIcon from "../../../../../common/mobile/lib/component/SvgIcon";
import IconDraw from "../../../../../common/mobile/resources/icons/draw.svg";
import IconInsertCommentIos from '@common-ios-icons/icon-insert-comment.svg?ios';
import IconInsertCommentAndroid from '@common-android-icons/icon-insert-comment.svg';
import IconInsimageIos from '@ios-icons/icon-insimage.svg?ios';
import IconInsimageAndroid from '@android-icons/icon-insimage.svg';
import IconSort from '@icons/icon-sort.svg';
import IconLinkIos from '@common-ios-icons/icon-link.svg?ios';
import IconLinkAndroid from '@common-android-icons/icon-link.svg';

const AddOther = inject("storeFocusObjects", "storeAppOptions")(observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const storeFocusObjects = props.storeFocusObjects;
    const storeAppOptions = props.storeAppOptions;
    const canModifyFilter = storeAppOptions.canModifyFilter;
    const canComments = storeAppOptions.canComments;
    const isHyperLink = storeFocusObjects.selections.indexOf('hyperlink') > -1;
    const hideAddComment = props.hideAddComment();
    const mainContext = useContext(MainContext);
    const wsProps = mainContext.wsProps;

    return (
        <List>
            <ListItem title={_t.textImage} className={wsProps.Objects && 'disabled'} link={'/add-image/'}>
                {Device.ios ? 
                    <SvgIcon slot="media" symbolId={IconInsimageIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media" symbolId={IconInsimageAndroid.id} className={'icon icon-svg'} />
                }
            </ListItem>
            {(!hideAddComment && canComments && !wsProps.Objects) && <ListItem title={_t.textComment} onClick={() => {
                props.closeModal();
                Common.Notifications.trigger('addcomment');
            }}>
                {Device.ios ? 
                    <SvgIcon slot="media" symbolId={IconInsertCommentIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media" symbolId={IconInsertCommentAndroid.id} className={'icon icon-svg'} />
                }
            </ListItem>}
            <ListItem title={_t.textSortAndFilter} className={wsProps.Sort || !canModifyFilter ? 'disabled' : ''} link={'/add-sort-and-filter/'}>
                <SvgIcon slot="media" symbolId={IconSort.id} className={'icon icon-svg'} />
            </ListItem>
            <ListItem title={_t.textLink} className={wsProps.InsertHyperlinks && 'disabled'} link={isHyperLink ? '/edit-link/' : '/add-link/'} routeProps={{
                isNavigate: true
            }}>
                {Device.ios ? 
                    <SvgIcon slot="media" symbolId={IconLinkIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media" symbolId={IconLinkAndroid.id} className={'icon icon-svg'} />
                }
            </ListItem>
            <ListItem key='drawing' title={_t.textDrawing} onClick={() => {
              props.closeModal();
              Common.Notifications.trigger('draw:start');
            }}>
              <SvgIcon slot='media' symbolId={IconDraw.id} className='icon icon-svg'/>
            </ListItem>
        </List>
    )
}));

export {AddOther};
