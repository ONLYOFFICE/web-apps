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
import {DocumentSettings} from '../../view/settings/DocumentSettings';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { f7 } from 'framework7-react';

class DocumentSettingsController extends Component {
    constructor (props) {
        super (props);
        this.getMargins = this.getMargins.bind(this);
        this.applyMargins = this.applyMargins.bind(this);
        this.onFormatChange = this.onFormatChange.bind(this);
        this.onColorSchemeChange = this.onColorSchemeChange.bind(this);
        this.onToggleHyphenation = this.onToggleHyphenation.bind(this);
    }

    onPageOrientation (value){
        const api = Common.EditorApi.get();
        if (api) {
            api.change_PageOrient(value == 'portrait');
        }
    }

    onFormatChange (value) {
        const api = Common.EditorApi.get();
        const storeDocumentSettings = this.props.storeDocumentSettings;

        this.widthDocument = storeDocumentSettings.widthDocument;
        this.heightDocument = storeDocumentSettings.heightDocument;

        if (api) {
            api.change_DocSize(value[0], value[1]);
            this.getMargins();
        }
    }

    getMargins() {
        const api = Common.EditorApi.get();
        const { t } = this.props;
        const _t = t('Settings', {returnObjects: true});

        if (api) {
            this.localSectionProps = api.asc_GetSectionProps();
            if (this.localSectionProps) {
                this.maxMarginsH = this.localSectionProps.get_H() - 2.6;
                this.maxMarginsW = this.localSectionProps.get_W() - 12.7;
 
                const top = this.localSectionProps.get_TopMargin();
                const bottom = this.localSectionProps.get_BottomMargin();
                const left = this.localSectionProps.get_LeftMargin();
                const right = this.localSectionProps.get_RightMargin();

                let errorMsg;

                if(top + bottom > this.maxMarginsH || left + right > this.maxMarginsW) {
                    if(top + bottom > this.maxMarginsH) {
                        errorMsg = _t.textMarginsH;
                    } else {
                        errorMsg = _t.textMarginsH;
                    }

                    f7.dialog.alert(errorMsg, _t.notcriticalErrorTitle);
                    api.change_DocSize(this.widthDocument, this.heightDocument);
                    return;
                } 

                return {
                    top,
                    bottom,
                    left,
                    right,
                    maxMarginsW: this.maxMarginsW,
                    maxMarginsH: this.maxMarginsH
                }
            }
        }
    }

    applyMargins (align, value) {
        const api = Common.EditorApi.get();

        if (api) {
            switch (align) {
                case 'left':
                    this.localSectionProps.put_LeftMargin(value);
                    break;
                case 'top':
                    this.localSectionProps.put_TopMargin(value);
                    break;
                case 'right':
                    this.localSectionProps.put_RightMargin(value);
                    break;
                case 'bottom':
                    this.localSectionProps.put_BottomMargin(value);
                    break;
            }
            api.asc_SetSectionProps(this.localSectionProps);
        }
    }

    onToggleHyphenation(value) {
        const api = Common.EditorApi.get();
        const storeDocumentSettings = this.props.storeDocumentSettings;
        
        if (api) {
            api.asc_setAutoHyphenation(value);
            storeDocumentSettings.setHyphenation(value);
    }
}

    // Color Schemes

    initPageColorSchemes() {
        const api = Common.EditorApi.get();
        return api.asc_GetCurrentColorSchemeIndex();
    }

    onColorSchemeChange(newScheme) {
        const api = Common.EditorApi.get();
        api.asc_ChangeColorSchemeByIdx(+newScheme);
        this.props.storeTableSettings.setStyles([], 'default');
    }

    render () {
        return (
            <DocumentSettings onPageOrientation={this.onPageOrientation}
                              onFormatChange={this.onFormatChange}
                              getMargins={this.getMargins}
                              applyMargins={this.applyMargins}
                              onColorSchemeChange={this.onColorSchemeChange}
                              initPageColorSchemes={this.initPageColorSchemes}
                              onToggleHyphenation={this.onToggleHyphenation}
            />
        )
    }
}

export default inject("storeDocumentSettings", 'storeTableSettings')(observer(withTranslation()(DocumentSettingsController)));
