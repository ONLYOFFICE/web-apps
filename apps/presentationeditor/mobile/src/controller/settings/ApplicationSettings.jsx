import React, { Component } from "react";
import { ApplicationSettings } from "../../view/settings/ApplicationSettings";
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage.mjs';
import {observer, inject} from "mobx-react";
import { Themes } from '../../../../../common/mobile/lib/controller/Themes.js';

class ApplicationSettingsController extends Component {
    constructor(props) {
        super(props);
        this.props.storeApplicationSettings.changeUnitMeasurement(Common.Utils.Metric.getCurrentMetric());
    }

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

    render() {
        return (
            <ApplicationSettings 
                setUnitMeasurement={this.setUnitMeasurement}
                switchSpellCheck={this.switchSpellCheck} 
                setMacrosSettings={this.setMacrosSettings}
            />
        )
    }
}


export default inject("storeApplicationSettings")(observer(ApplicationSettingsController));