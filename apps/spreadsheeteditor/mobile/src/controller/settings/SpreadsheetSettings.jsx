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


import React, {Component} from 'react';
import {SpreadsheetSettings} from '../../view/settings/SpreadsheetSettings';
import {observer, inject} from "mobx-react";

class SpreadsheetSettingsController extends Component {
    constructor (props) {
        super (props);
        this.initSpreadsheetMargins = this.initSpreadsheetMargins.bind(this);
        this.onFormatChange = this.onFormatChange.bind(this);
        this.onPageMarginsChange = this.onPageMarginsChange.bind(this); 
        this.initSpreadsheetSettings();
    }

    initSpreadsheetSettings() {
        const api = Common.EditorApi.get();
        const params = api.asc_getSheetViewSettings();
        const currentSheet = api.asc_getActiveWorksheetIndex();
        const propsSheet = api.asc_getPageOptions(currentSheet);
        const opt = propsSheet.asc_getPageSetup();
        
        this.props.storeSpreadsheetSettings.changeHideHeadings(!params.asc_getShowRowColHeaders());
        this.props.storeSpreadsheetSettings.changeHideGridlines(!params.asc_getShowGridLines());
        this.props.storeSpreadsheetSettings.resetPortrait(opt.asc_getOrientation() === Asc.c_oAscPageOrientation.PagePortrait ? true : false);
        this.props.storeSpreadsheetSettings.changeDocSize(opt.asc_getWidth(), opt.asc_getHeight());
        this.props.storeSpreadsheetSettings.changeSheetRtl(params.asc_getRightToLeft());
    }

    initSpreadsheetMargins() {
        const api = Common.EditorApi.get();

        // Init page margins

        let currentSheet = api.asc_getActiveWorksheetIndex(),
            props = api.asc_getPageOptions(currentSheet);

        this.localMarginProps = props.asc_getPageMargins();

        let left = this.localMarginProps.asc_getLeft(),
            top = this.localMarginProps.asc_getTop(),
            right = this.localMarginProps.asc_getRight(),
            bottom = this.localMarginProps.asc_getBottom();

        return {left, top, right, bottom};
    }

    onPageMarginsChange(align, marginValue) {
        const api = Common.EditorApi.get();
        let changeProps = new Asc.asc_CPageMargins();

        changeProps.asc_setTop(this.localMarginProps.asc_getTop());
        changeProps.asc_setBottom(this.localMarginProps.asc_getBottom());
        changeProps.asc_setLeft(this.localMarginProps.asc_getLeft());
        changeProps.asc_setRight(this.localMarginProps.asc_getRight());
        
        switch (align) {
            case 'left': changeProps.asc_setLeft(marginValue); break;
            case 'top': changeProps.asc_setTop(marginValue); break;
            case 'right': changeProps.asc_setRight(marginValue); break;
            case 'bottom': changeProps.asc_setBottom(marginValue); break;
        }

        api.asc_changePageMargins(changeProps, undefined, undefined, undefined, undefined, api.asc_getActiveWorksheetIndex());
    }

    onOrientationChange(value) {
        const api = Common.EditorApi.get();
        api.asc_changePageOrient(+value === Asc.c_oAscPageOrientation.PagePortrait, api.asc_getActiveWorksheetIndex());
    }

    clickCheckboxHideHeadings(value) {
        const api = Common.EditorApi.get();
        api.asc_setDisplayHeadings(!value);
    }

    clickCheckboxHideGridlines(value) {
        const api = Common.EditorApi.get();
        api.asc_setDisplayGridlines(!value);
    }

    initPageColorSchemes() {
        const api = Common.EditorApi.get();
        return api.asc_GetCurrentColorSchemeIndex();
    }

    onColorSchemeChange(index) {
        const api = Common.EditorApi.get();
        api.asc_ChangeColorSchemeByIdx(+index); 
    }

    onFormatChange(value) {
        const api = Common.EditorApi.get();
        api.asc_changeDocSize(parseFloat(value[0]), parseFloat(value[1]), api.asc_getActiveWorksheetIndex());
        this.initSpreadsheetSettings();
    }

    onRtlSheetClick(value) {
        const api = Common.EditorApi.get();
        api.asc_setRightToLeft(value);
    }

    render () {
        return (
            <SpreadsheetSettings 
                isPortrait={this.isPortrait}
                isHideHeadings={this.isHideHeadings}
                isHideGridlines={this.isHideGridlines}
                onOrientationChange={this.onOrientationChange}
                clickCheckboxHideHeadings={this.clickCheckboxHideHeadings}
                clickCheckboxHideGridlines={this.clickCheckboxHideGridlines}
                initPageColorSchemes={this.initPageColorSchemes}
                onColorSchemeChange={this.onColorSchemeChange}
                onFormatChange={this.onFormatChange}
                onRtlSheetClick={this.onRtlSheetClick}
                initSpreadsheetMargins={this.initSpreadsheetMargins}
                onPageMarginsChange={this.onPageMarginsChange}
            />
        )
    }
}

export default inject("storeSpreadsheetSettings")(observer(SpreadsheetSettingsController));
