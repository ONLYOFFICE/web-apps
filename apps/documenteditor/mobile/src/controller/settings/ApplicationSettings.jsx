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
import { ApplicationSettings } from "../../view/settings/ApplicationSettings";
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage.mjs';
import {observer, inject} from "mobx-react";
import { ThemesContext } from "../../../../../common/mobile/lib/controller/Themes";
import { withTranslation } from 'react-i18next';
import { f7 } from "framework7-react";

class ApplicationSettingsController extends Component {
    constructor(props) {
        super(props);
        this.switchDisplayComments = this.switchDisplayComments.bind(this);
        this.props.storeApplicationSettings.changeUnitMeasurement(Common.Utils.Metric.getCurrentMetric());
        this.changeDirectionMode = this.changeDirectionMode.bind(this);
    }

    static contextType = ThemesContext;

    setUnitMeasurement(value) {
        value = (value !== null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
        Common.Utils.Metric.setCurrentMetric(value);
        LocalStorage.setItem("de-mobile-settings-unit", value);

        const api = Common.EditorApi.get();
        api.asc_SetDocumentUnits((value == Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value == Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));
    }

    switchSpellCheck(value) {
        LocalStorage.setBool("de-mobile-spellcheck", value);
        Common.EditorApi.get().asc_setSpellCheck(value);
    }

    switchNoCharacters(value) {
        LocalStorage.setBool("de-mobile-no-characters", value);
        Common.EditorApi.get().put_ShowParaMarks(value);
    }

    switchShowTableEmptyLine(value) {
        LocalStorage.setBool("de-mobile-hidden-borders", value);
        Common.EditorApi.get().put_ShowTableEmptyLine(value);
    }

    switchDisplayComments(value) {
        const api = Common.EditorApi.get();
        this.props.storeAppOptions.changeCanViewComments(value);

        if (!value) {
            this.switchDisplayResolved(value);
            api.asc_hideComments();
            LocalStorage.setBool("de-settings-resolvedcomment", false);
        } else {
            const resolved = LocalStorage.getBool("de-settings-resolvedcomment");
            api.asc_showComments(resolved);
        }

        LocalStorage.setBool("de-mobile-settings-livecomment", value);
    }

    switchDisplayResolved(value) {
        const displayComments = LocalStorage.getBool("de-mobile-settings-livecomment",true);
        if (displayComments) {
            Common.EditorApi.get().asc_showComments(value);
            LocalStorage.setBool("de-settings-resolvedcomment", value);
        }
    }

    setMacrosSettings(value) {
        LocalStorage.setItem("de-mobile-macros-mode", value);
    }

    changeDirectionMode(direction) {
        const { t } = this.props;
        const _t = t("Settings", { returnObjects: true });

        this.props.storeApplicationSettings.changeDirectionMode(direction);
        LocalStorage.setItem('mode-direction', direction);

        f7.dialog.create({
            title: _t.notcriticalErrorTitle,
            text: t('Settings.textRestartApplication'),
            buttons: [
                {
                    text: _t.textOk
                }
            ]
        }).open();
    }

   
    render() {
        return (
            <ApplicationSettings 
                setUnitMeasurement={this.setUnitMeasurement}
                switchSpellCheck={this.switchSpellCheck}
                switchNoCharacters={this.switchNoCharacters}
                switchShowTableEmptyLine={this.switchShowTableEmptyLine}
                switchDisplayComments={this.switchDisplayComments}
                switchDisplayResolved={this.switchDisplayResolved}  
                setMacrosSettings={this.setMacrosSettings}  
                changeDirectionMode={this.changeDirectionMode}      
                changeTheme={this.context.changeTheme}
            />
        )
    }
}


export default inject("storeAppOptions", "storeApplicationSettings")(observer(withTranslation()(ApplicationSettingsController)));
