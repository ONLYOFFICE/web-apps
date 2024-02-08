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
        this.props.storeApplicationSettings.changeUnitMeasurement(Common.Utils.Metric.getCurrentMetric());
        this.changeDirectionMode = this.changeDirectionMode.bind(this);
    }

    static contextType = ThemesContext;

    setUnitMeasurement(value) {
        const api = Common.EditorApi.get();
        value = (value !== null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
        Common.Utils.Metric.setCurrentMetric(value);
        LocalStorage.setItem("pe-mobile-settings-unit", value);
        api.asc_SetDocumentUnits((value === Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value === Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));
    }

    switchSpellCheck(value) {
        LocalStorage.setBool("pe-mobile-spellcheck", value);
        Common.EditorApi.get().asc_setSpellCheck(value);
    }

    setMacrosSettings(value) {
        LocalStorage.setItem("pe-mobile-macros-mode", value);
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
                setUnitMeasurement={this.setUnitMeasurement}
                switchSpellCheck={this.switchSpellCheck} 
                setMacrosSettings={this.setMacrosSettings}
                changeTheme={this.context.changeTheme}
                changeDirectionMode={this.changeDirectionMode}
            />
        )
    }
}


export default inject("storeApplicationSettings", "storeAppOptions")(observer(withTranslation()(ApplicationSettingsController)));