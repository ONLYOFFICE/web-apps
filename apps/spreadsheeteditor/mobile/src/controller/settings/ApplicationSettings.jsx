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
import {observer, inject} from "mobx-react";
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage.mjs';
import { withTranslation } from 'react-i18next';
import { ThemesContext } from "../../../../../common/mobile/lib/controller/Themes";
import { f7 } from "framework7-react";

class ApplicationSettingsController extends Component {
    constructor(props) {
        super(props);

        this.onChangeDisplayComments = this.onChangeDisplayComments.bind(this);
        this.changeDirectionMode = this.changeDirectionMode.bind(this);
        this.props.storeApplicationSettings.changeUnitMeasurement(Common.Utils.Metric.getCurrentMetric());
    }

    static contextType = ThemesContext;

    onChangeDisplayComments(displayComments) {
        const api = Common.EditorApi.get();
        this.props.storeAppOptions.changeCanViewComments(displayComments);

        if (!displayComments) {
            api.asc_hideComments();
            LocalStorage.setBool("sse-settings-resolvedcomment", false);
        } else {
            let resolved = LocalStorage.getBool("sse-settings-resolvedcomment");
            api.asc_showComments(resolved);
        }

        LocalStorage.setBool("sse-mobile-settings-livecomment", displayComments);
    }

    onChangeDisplayResolved(value) {
        const api = Common.EditorApi.get();
        let displayComments = LocalStorage.getBool("sse-mobile-settings-livecomment",true);

        if (displayComments) {
            api.asc_showComments(value);
            LocalStorage.setBool("sse-settings-resolvedcomment", value);
        }
    }

    clickR1C1Style(checked) {
        const api = Common.EditorApi.get();
        LocalStorage.setBool('sse-settings-r1c1', checked);
        api.asc_setR1C1Mode(checked);
    }

    unitMeasurementChange(value) {
        value = value ? +value : Common.Utils.Metric.getDefaultMetric();
        Common.Utils.Metric.setCurrentMetric(value);
        LocalStorage.setItem("sse-mobile-settings-unit", value);
    }

    onChangeMacrosSettings(value) {
        Common.Utils.InternalSettings.set("sse-mobile-macros-mode", +value);
        LocalStorage.setItem("sse-mobile-macros-mode", +value);
    }

    changeDirectionMode(direction) {
        const { t } = this.props;
        const _t = t("View.Settings", { returnObjects: true });

        this.props.storeApplicationSettings.changeDirectionMode(direction);
        LocalStorage.setItem('mode-direction', direction);

        f7.dialog.create({
            title: _t.notcriticalErrorTitle,
            text: t('View.Settings.textRestartApplication'),
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
                unitMeasurementChange={this.unitMeasurementChange}
                onChangeDisplayComments={this.onChangeDisplayComments}
                onChangeDisplayResolved={this.onChangeDisplayResolved}
                clickR1C1Style={this.clickR1C1Style}
                onChangeMacrosSettings={this.onChangeMacrosSettings}
                changeDirectionMode={this.changeDirectionMode}
                changeTheme={this.context.changeTheme}
            />
        )
    }
}


export default inject("storeApplicationSettings", "storeAppOptions")(observer(withTranslation()(ApplicationSettingsController)));
