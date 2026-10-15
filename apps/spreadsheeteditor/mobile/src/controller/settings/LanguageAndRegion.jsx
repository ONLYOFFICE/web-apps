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
import { LanguageAndRegion } from "../../view/settings/LanguageAndRegion";
import { observer, inject } from "mobx-react";
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage.mjs';
import { withTranslation } from 'react-i18next';

class LanguageAndRegionController extends Component {
    constructor(props) {
        super(props);

        this.initRegSettings = this.initRegSettings.bind(this);
        this.initFormulaLangsCollection = this.initFormulaLangsCollection.bind(this);
        this.onFormulaLangChange = this.onFormulaLangChange.bind(this);
        this.onRegSettings = this.onRegSettings.bind(this);
        this.props.storeApplicationSettings.initRegData();
        this.initRegSettings();
        this.props.storeApplicationSettings.setFormulaLangsCollection(this.initFormulaLangsCollection());
    }

    initFormulaLangsCollection() {
        const { t } = this.props;
        const _t = t("View.Settings", { returnObjects: true });
        const storeApplicationSettings = this.props.storeApplicationSettings;
        const formulaLangsExamples = storeApplicationSettings.formulaLangsExamples;
        const formulaLangs = storeApplicationSettings.formulaLangs;
        const formulaLangsCollection = formulaLangs.map(lang => {
            let str = lang.replace(/[\-_]/, '');
            str = str.charAt(0).toUpperCase() + str.substring(1, str.length);

            return {
                value: lang,
                displayValue: _t[`txt${str}lang`] ? t(`View.Settings.txt${str}lang`) : t(`View.Settings.txt${str}`), exampleValue: formulaLangsExamples[`txtExample${str}`] || formulaLangsExamples['txtExampleEn']
            }
        });

        formulaLangsCollection.sort(function(a, b) {
            if (a.displayValue < b.displayValue) return -1;
            if (a.displayValue > b.displayValue) return 1;
            return 0;
        });

        return formulaLangsCollection;
    }

    initRegSettings() {
        const info = new Asc.asc_CFormatCellsInfo();
        const api = Common.EditorApi.get();
        const regCode = this.props.storeApplicationSettings.getRegCode();

        info.asc_setType(Asc.c_oAscNumFormatType.None);
        info.asc_setSymbol(regCode);

        const arr = api.asc_getFormatCells(info);
        const text4 = api.asc_getLocaleExample(arr[4], 1000.01, regCode),
              text5 = api.asc_getLocaleExample(arr[5], Asc.cDate().getExcelDateWithTime(true), regCode),
              text6 = api.asc_getLocaleExample(arr[7], Asc.cDate().getExcelDateWithTime(true), regCode);

        this.props.storeApplicationSettings.setRegExample(`${text4} ${text5} ${text6}`);
    }

    onFormulaLangChange(value) {
        LocalStorage.setItem("sse-settings-func-lang", value);
        this.initRegSettings();
        Common.Notifications.trigger('changeFuncLang');
    }

    onRegSettings(regCode) {
        const api = Common.EditorApi.get();
        LocalStorage.setItem("sse-settings-regional", regCode);
        this.initRegSettings();
        if (regCode !== null) api.asc_setLocale(+regCode);
        Common.Notifications.trigger('changeRegSettings');
    }

    render() {
        return (
            <LanguageAndRegion
                initRegSettings={this.initRegSettings}
                onFormulaLangChange={this.onFormulaLangChange}
                onRegSettings={this.onRegSettings}
            />
        )
    }
}

export default inject("storeApplicationSettings")(observer(withTranslation()(LanguageAndRegionController)));
