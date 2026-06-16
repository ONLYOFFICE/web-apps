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

import React, { useContext, useEffect } from 'react';
import { f7, Page, Navbar, NavRight, NavTitle, Link, Icon, Tabs, Tab } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { observer, inject } from "mobx-react";
import { Device } from '../../../../../common/mobile/utils/device';
import { AddTableController } from "../../controller/add/AddTable";
import AddShapeController from "../../controller/add/AddShape";
import { AddOtherController } from "../../controller/add/AddOther";
import { MainContext } from '../../page/main';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconAddShapeIos from '@common-ios-icons/icon-add-shape.svg?ios';
import IconAddShapeAndroid from '@common-android-icons/icon-add-shape.svg';
import IconAddOtherIos from '@common-ios-icons/icon-add-other.svg?ios';
import IconAddOtherAndroid from '@common-android-icons/icon-add-other.svg';
import IconAddTableIos from '@common-ios-icons/icon-add-table.svg?ios';
import IconAddTableAndroid from '@common-android-icons/icon-add-table.svg';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';

const AddLayoutNavbar = ({ tabs, storeTableSettings }) => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});

    const getTableStylesPreviews = () => {
        if(!storeTableSettings.arrayStylesDefault.length) {
            const api = Common.EditorApi.get();
            setTimeout(() => storeTableSettings.setStyles(api.asc_getTableStylesPreviews(true), 'default'), 1);
        }
    };

    return (
        <Navbar>
            {tabs.length > 1 ?
                <div className='tab-buttons tabbar'>
                    {tabs.map((item, index) =>
                        <Link key={"de-link-" + item.id} onClick={() => getTableStylesPreviews()} tabLink={"#" + item.id} tabLinkActive={index === 0}>
                            <SvgIcon slot="media" symbolId={item.icon} className={'icon icon-svg'} />
                        </Link>)}
                    {isAndroid && <span className='tab-link-highlight' style={{width: 100 / tabs.lenght + '%'}}></span>}
                </div> :
                <NavTitle>{ tabs[0].caption }</NavTitle>
            }
            {Device.phone && <NavRight><Link popupClose=".add-popup">
            {Device.ios ? 
                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
            }</Link></NavRight>}
        </Navbar>
    )
};

const AddLayoutContent = ({ tabs }) => {
    return (
        <Tabs animated>
            {tabs.map((item, index) =>
                <Tab key={"de-tab-" + item.id} id={item.id} className="page-content" tabActive={index === 0}>
                    {item.component}
                </Tab>
            )}
        </Tabs>
    )
};

const AddingPage = inject("storeFocusObjects", "storeTableSettings", "storeApplicationSettings")(observer(props => {
    const mainContext = useContext(MainContext);
    const showPanels = mainContext.showPanels;
    const storeApplicationSettings = props.storeApplicationSettings;
    const directionMode = storeApplicationSettings.directionMode;
    const storeFocusObjects = props.storeFocusObjects;
    const storeTableSettings = props.storeTableSettings;
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});
    const api = Common.EditorApi.get();
    const tabs = [];
    const options = storeFocusObjects.settings;
    const paragraphObj = storeFocusObjects.paragraphObject;

    useEffect(() => {
        f7.tab.show('#add-other', false);
    }, []);

    useEffect(() => {
        if(directionMode === 'rtl') {
            tabs.reverse();
        }
    }, [directionMode])

    let needDisable = false,
        canAddTable = true,
        canAddImage = true,
        paragraphLocked = false,
        inFootnote = false,
        inControl = false,
        controlProps = false,
        lockType = false,
        controlPlain = false,
        contentLocked = false,
        richDelLock = false,
        richEditLock = false,
        plainDelLock = false,
        plainEditLock = false;

    if(paragraphObj) {
        canAddTable = paragraphObj.get_CanAddTable();
        canAddImage = paragraphObj.get_CanAddImage();
        paragraphLocked = paragraphObj.get_Locked();

        inFootnote = api.asc_IsCursorInFootnote() || api.asc_IsCursorInEndnote();
        inControl = api.asc_IsContentControl();

        controlProps = inControl ? api.asc_GetContentControlProperties() : null;
        lockType = (inControl && controlProps) ? controlProps.get_Lock() : Asc.c_oAscSdtLockType.Unlocked;
        controlPlain = (inControl && controlProps) ? (controlProps.get_ContentControlType() == Asc.c_oAscSdtLevelType.Inline) : false;
        contentLocked = lockType == Asc.c_oAscSdtLockType.SdtContentLocked || lockType == Asc.c_oAscSdtLockType.ContentLocked;

        richDelLock = paragraphObj ? !paragraphObj.can_DeleteBlockContentControl() : false;
        richEditLock = paragraphObj ? !paragraphObj.can_EditBlockContentControl() : false;
        plainDelLock = paragraphObj ? !paragraphObj.can_DeleteInlineContentControl() : false;
        plainEditLock = paragraphObj ? !paragraphObj.can_EditInlineContentControl() : false;
    }

    if (!showPanels && options.indexOf('text') > -1) {
        needDisable = !canAddTable || controlPlain || richEditLock || plainEditLock || richDelLock || plainDelLock;

        if(!needDisable) {
            tabs.push({
                caption: _t.textTable,
                id: 'add-table',
                icon: Device.ios ? IconAddTableIos.id : IconAddTableAndroid.id,
                component: <AddTableController/>
            });
        }
    }
    if(!showPanels) {
        needDisable = paragraphLocked || controlPlain || contentLocked || inFootnote;

        if(!needDisable) {
            tabs.push({
                caption: _t.textShape,
                id: 'add-shape',
                icon: Device.ios ? IconAddShapeIos.id : IconAddShapeAndroid.id,
                component: <AddShapeController/>
            });
        }
    }

    if(!showPanels) {
        tabs.push({
            caption: _t.textOther,
            id: 'add-other',
            icon:  Device.ios ? IconAddOtherIos.id : IconAddOtherAndroid.id,
            component: 
                <AddOtherController 
                    inFootnote={inFootnote} 
                    inControl={inControl} 
                    paragraphLocked={paragraphLocked} 
                    controlPlain={controlPlain}
                    richDelLock={richDelLock}
                    richEditLock={richEditLock}
                    plainDelLock={plainDelLock}
                    plainEditLock={plainEditLock}
                />
        });
    }

    return (
        <Page pageContent={false}>
            <AddLayoutNavbar tabs={tabs} storeTableSettings={storeTableSettings} />
            <AddLayoutContent tabs={tabs} />
        </Page>
    )
}));


export default AddingPage;


