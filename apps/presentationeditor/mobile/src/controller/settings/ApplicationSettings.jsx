import React, { Component } from "react";
import { ApplicationSettings } from "../../view/settings/ApplicationSettings";
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage';
import {observer, inject} from "mobx-react";

class ApplicationSettingsController extends Component {
    constructor(props) {
        super(props);

        const valueUnitMeasurement = LocalStorage.getItem("pe-mobile-settings-unit");
        const valueSpellCheck = LocalStorage.getBool("pe-mobile-spellcheck");
        const valueMacrosMode = LocalStorage.getItem("pe-mobile-macros-mode");

        typeof valueUnitMeasurement !== 'undefined' && this.props.storeApplicationSettings.changeUnitMeasurement(valueUnitMeasurement);
        typeof valueSpellCheck !== 'undefined' && this.props.storeApplicationSettings.changeSpellCheck(valueSpellCheck);
        typeof valueMacrosMode !== 'undefined' && this.props.storeApplicationSettings.changeMacrosSettings(valueMacrosMode);
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