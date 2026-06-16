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
import { Page, Navbar, NavTitle, NavRight, Link, Icon, Tabs, Tab, f7 } from 'framework7-react';
import { observer, inject } from "mobx-react";
import { useTranslation } from 'react-i18next';
import { AddChartController } from "../../controller/add/AddChart";
import { AddFunctionController } from "../../controller/add/AddFunction";
import AddShapeController from "../../controller/add/AddShape";
import { AddOtherController } from "../../controller/add/AddOther";
import { Device } from "../../../../../common/mobile/utils/device";
import { MainContext } from '../../page/main';
import { AddingContext } from '../../controller/add/Add';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconAddShapeIos from '@common-ios-icons/icon-add-shape.svg?ios';
import IconAddShapeAndroid from '@common-android-icons/icon-add-shape.svg';
import IconAddOtherIos from '@common-ios-icons/icon-add-other.svg?ios';
import IconAddOtherAndroid from '@common-android-icons/icon-add-other.svg';
import IconAddChartIos from '@ios-icons/icon-add-chart.svg?ios';
import IconAddChartAndroid from '@android-icons/icon-add-chart.svg';
import IconAddFormulaIos from '@ios-icons/icon-add-formula.svg?ios';
import IconAddFormulaAndroid from '@android-icons/icon-add-formula.svg';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';

const AddLayoutNavbar = ({ tabs }) => {
    const isAndroid = Device.android;
    if(!tabs.length) return null;

    return (
        <Navbar>
            {tabs.length > 1 ?
                <div className='tab-buttons tabbar'>
                    {tabs.map((item, index) =>
                        <Link key={"sse-link-" + item.id} tabLink={"#" + item.id} tabLinkActive={index === 0}>
                            <SvgIcon symbolId={item.icon} className={'icon icon-svg'} />
                        </Link>)}
                    {isAndroid && <span className='tab-link-highlight' style={{width: 100 / tabs.lenght + '%'}}></span>}
                </div> : <NavTitle>{tabs[0].caption}</NavTitle>
            }
            {Device.phone && <NavRight><Link popupClose=".add-popup">
                {Device.ios ? 
                    <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                }</Link></NavRight> }
        </Navbar>
    )
};

const AddLayoutContent = ({ tabs }) => {
    if(!tabs.length) return null;

    return (
        <Tabs animated>
            {tabs.map((item, index) =>
                <Tab key={"sse-tab-" + item.id} id={item.id} className="page-content" tabActive={index === 0}>
                    {item.component}
                </Tab>
            )}
        </Tabs>
    )
};

const AddingPage = inject("storeApplicationSettings")(observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const mainContext = useContext(MainContext);
    const addingContext = useContext(AddingContext);
    const storeApplicationSettings = props.storeApplicationSettings;
    const directionMode = storeApplicationSettings.directionMode;
    // const wsLock = mainContext.wsLock;
    const wsProps = mainContext.wsProps;
    const showPanels = addingContext.showPanels;
    const tabs = [];

    useEffect(() => {
        if(directionMode === 'rtl') {
            tabs.reverse();
        }
    }, [directionMode])
    
    if(!wsProps.Objects) {
        if(!showPanels) {
            tabs.push({
                caption: _t.textChart,
                id: 'add-chart',
                icon: Device.ios ? IconAddChartIos.id : IconAddChartAndroid.id,
                component: <AddChartController />
            });
        }

        if(!showPanels || showPanels === 'function') {
            tabs.push({
                caption: _t.textFunction,
                id: 'add-function',
                icon: Device.ios ? IconAddFormulaIos.id : IconAddFormulaAndroid.id,
                component: <AddFunctionController />
            });
        }

        if(!showPanels || showPanels.indexOf('shape') > 0) {
            tabs.push({
                caption: _t.textShape,
                id: 'add-shape',
                icon: Device.ios ? IconAddShapeIos.id : IconAddShapeAndroid.id,
                component: <AddShapeController />
            });
        }

        // if (showPanels && showPanels.indexOf('image') !== -1) {
        //     tabs.push({
        //         caption: _t.textImage,
        //         id: 'add-image',
        //         icon: 'icon-add-image',
        //         component: <AddImageController inTabs={true}/>
        //     });
        // }
    }

    if (!showPanels && (!wsProps.InsertHyperlinks || !wsProps.Objects || !wsProps.Sort)) {
        tabs.push({
            caption: _t.textOther,
            id: 'add-other',
            icon: Device.ios ? IconAddOtherIos.id : IconAddOtherAndroid.id,
            component: <AddOtherController />
        });
    }
    
    // if (((showPanels && showPanels === 'hyperlink') || props.isAddShapeHyperlink) && !wsProps.InsertHyperlinks) {
    //     tabs.push({
    //         caption: _t.textAddLink,
    //         id: 'add-link',
    //         icon: 'icon-link',
    //         component: <AddLinkController/>
    //     });
    // }

    if(!tabs.length) {
        if (Device.phone) {
            f7.popup.close('.add-popup', false);
        } else {
            f7.popover.close('#add-popover', false);
        }

        return null;
    }

    return (
        <Page pageContent={false}>
            <AddLayoutNavbar tabs={tabs} />
            <AddLayoutContent tabs={tabs} />
        </Page>
    )
}));

export default AddingPage;
