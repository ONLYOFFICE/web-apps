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

import React, { Component } from "react";
import { NavigationPopover, NavigationSheet } from "../../view/settings/Navigation";
import { Device } from '../../../../../common/mobile/utils/device';
import { withTranslation } from 'react-i18next';

class NavigationController extends Component {
    constructor(props) {
        super(props);
        this.updateNavigation = this.updateNavigation.bind(this);
    }

    updateViewerNavigation(bookmarks) {
        let count = bookmarks.length,
            prevLevel = -1,
            headerLevel = -1,
            firstHeader = true,
            arrHeaders = [];

        for (let i = 0; i < count; i++) {
            let level = bookmarks[i].level - 1,
                hasParent = true;

            if (level > prevLevel && i > 0)
                arrHeaders[i - 1]['hasSubItems'] = true;

            if (headerLevel < 0 || level <= headerLevel) {
                if (i > 0 || firstHeader)
                    headerLevel = level;
                hasParent = false;
            }

            arrHeaders.push({
                name: bookmarks[i].description,
                level: level,
                index: i,
                hasParent: hasParent,
                isEmptyItem: !bookmarks[i].description
            });

            prevLevel = level;
        }

        if (count > 0 && !firstHeader) {
            arrHeaders[0]['hasSubItems'] = false;
            arrHeaders[0]['isNotHeader'] =  true;
            arrHeaders[0]['name'] = t('Settings.textBeginningDocument');
        }

        return arrHeaders;
    }

    updateNavigation() {
        const api = Common.EditorApi.get();
        const navigationObject = api.asc_ShowDocumentOutline();

        if (!navigationObject) return;

        const count = navigationObject.get_ElementsCount();
        const { t } = this.props;
       
        let arrHeaders = [],
            prevLevel = -1,
            headerLevel = -1,
            firstHeader = !navigationObject.isFirstItemNotHeader();

        for (let i = 0; i < count; i++) {
            let level = navigationObject.get_Level(i),
                hasParent = true;
            if (level > prevLevel && i > 0)
                arrHeaders[i - 1]['hasSubItems'] = true;
            if (headerLevel < 0 || level <= headerLevel) {
                if (i > 0 || firstHeader)
                    headerLevel = level;
                hasParent = false;
            }

            arrHeaders.push({
                name: navigationObject.get_Text(i),
                level,
                index: i,
                hasParent,
                isEmptyItem: navigationObject.isEmptyItem(i)
            });

            prevLevel = level;
        }

        if (count > 0 && !firstHeader) {
            arrHeaders[0]['hasSubItems'] = false;
            arrHeaders[0]['isNotHeader'] =  true;
            arrHeaders[0]['name'] = t('Settings.textBeginningDocument');
        }

        return arrHeaders;
    }

    onSelectItem(index) {
        const api = Common.EditorApi.get();
        const navigationObject = api.asc_ShowDocumentOutline();

        if (navigationObject) {
            navigationObject.goto(index);
        } else {
            api.asc_viewerNavigateTo(index);
        }
    };

    componentDidMount() {
        const api = Common.EditorApi.get();
        api.asc_enableKeyEvents(false);
    }

    render() {
        return (
            !Device.phone ? 
                <NavigationPopover
                    onSelectItem={this.onSelectItem} 
                    updateNavigation={this.updateNavigation}
                    updateViewerNavigation={this.updateViewerNavigation}
                />
            :
                <NavigationSheet
                    onSelectItem={this.onSelectItem} 
                    updateNavigation={this.updateNavigation}
                    updateViewerNavigation={this.updateViewerNavigation}
                /> 
        );
    }
}

export default withTranslation()(NavigationController);
