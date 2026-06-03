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

import React, { useState, useEffect, useContext, Fragment } from "react";
import { Device } from '../../../../../common/mobile/utils/device';
import {f7, List, ListItem, Page, Navbar, Sheet, NavRight, Link} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { inject, observer } from "mobx-react";
import { MainContext } from "../../page/main";
import SvgIcon from '@common/lib/component/SvgIcon';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';

const useNavigationHeaders = (props) => {
    const api = Common.EditorApi.get();
    const storeNavigation = props.storeNavigation;
    const bookmarks = storeNavigation.bookmarks;
    const navigationObject = api.asc_ShowDocumentOutline();
    const [currentPosition, setCurrentPosition] = useState(navigationObject ? navigationObject.get_CurrentPosition() : bookmarks.length ? bookmarks[0] : null);

    let arrHeaders = [];

    if (navigationObject) {
        arrHeaders = props.updateNavigation();
    } else if (bookmarks.length) {
        arrHeaders = props.updateViewerNavigation(bookmarks);
    }

    return {arrHeaders, currentPosition, setCurrentPosition};
};

const NavigationPopover = inject('storeNavigation')(observer(props => {
    const { t } = useTranslation();
    const _t = t('Settings', {returnObjects: true});
    const {arrHeaders, currentPosition, setCurrentPosition} = useNavigationHeaders(props);

    return (
        <Page>
            <Navbar title={t('Settings.textNavigation')} backLink={_t.textBack} />
            {!arrHeaders || !arrHeaders.length 
                ?
                    <div className="empty-screens">
                        <p className="empty-screens__text">{t('Settings.textEmptyScreens')}</p>
                    </div>
                :
                    <List className="navigation-list" style={!Device.phone ? { height: '352px', marginTop: 0 } : null}>
                        {arrHeaders.map(header => {
                            return (
                                <ListItem radio key={header.index} title={header.isEmptyItem ? t('Settings.textBeginningDocument') : header.name} checked={header.index === currentPosition} style={{paddingLeft: header.level * 16}} onClick={() => {
                                    setCurrentPosition(header.index);
                                    props.onSelectItem(header.index);
                                }}></ListItem>
                            )
                        })}
                    </List>
            }
        </Page>
    )
}));

const NavigationList = inject('storeNavigation')(observer(props => {
    const { t } = useTranslation();
    const {arrHeaders, currentPosition, setCurrentPosition} = useNavigationHeaders(props);

    return (
        <Fragment>
        {!arrHeaders || !arrHeaders.length 
            ?
                <div className="empty-screens">
                    <p className="empty-screens__text">{t('Settings.textEmptyScreens')}</p>
                </div>
            :
                <List className="navigation-list">
                    {arrHeaders.map(header => {
                        return (
                            <ListItem radio key={header.index} title={header.isEmptyItem ? t('Settings.textBeginningDocument') : header.name} checked={header.index === currentPosition} style={{paddingLeft: header.level * 16}} onClick={() => {
                                setCurrentPosition(header.index);
                                props.onSelectItem(header.index);
                            }}></ListItem>
                        )
                    })}
                </List>
            }
        </Fragment>
    )
}));

const NavigationSheet = inject('storeNavigation')(observer(props => {
    const mainContext = useContext(MainContext);
    const { t } = useTranslation();

    useEffect(() => {
        f7.sheet.open('#view-navigation-sheet', true);
    }, []);

    return (
        <Sheet id="view-navigation-sheet" className="navigation-sheet" backdrop={true} closeByBackdropClick={true} onSheetClosed={() => {mainContext.closeOptions('navigation')}} style={{height: '45%', opacity: '1'}}>
            <Page>
                <Navbar title={t('Settings.textNavigation')}>
                    {Device.phone &&
                        <NavRight>
                            <Link sheetClose="#view-navigation-sheet">
                                {Device.ios ? 
                                    <SvgIcon slot="media" symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                    <SvgIcon slot="media" symbolId={IconExpandDownAndroid.id} className={'icon icon-svg down'} />
                                }
                            </Link>
                        </NavRight>
                    }
                </Navbar>
                <NavigationList 
                    onSelectItem={props.onSelectItem}
                    updateNavigation={props.updateNavigation}
                    updateViewerNavigation={props.updateViewerNavigation}
                />
            </Page>
        </Sheet>
    )
}));

export {
    NavigationPopover,
    NavigationSheet
};
