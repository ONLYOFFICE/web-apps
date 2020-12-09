import React, { Component } from "react";
import { ApplicationSettings } from "../../view/settings/ApplicationSettings";

class ApplicationSettingsController extends Component {
    constructor(props) {
        super(props);
    }

    setUnitMeasurement(value) {
        const api = Common.EditorApi.get();
        value = (value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
        Common.Utils.Metric.setCurrentMetric(value);
        // Common.localStorage.setItem("pe-mobile-settings-unit", value);
        api.asc_SetDocumentUnits((value==Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value==Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));
    }

    switchSpellCheck(value) {
        const api = Common.EditorApi.get();
        // let state = value === '1' ? true : false;
        // Common.localStorage.setItem("pe-mobile-spellcheck", state ? 1 : 0);
        // Common.Utils.InternalSettings.set("pe-mobile-spellcheck", state);
        api.asc_setSpellCheck(value);
    }

    setMacrosSettings(value) {
        Common.Utils.InternalSettings.set("pe-mobile-macros-mode", value);
        // Common.localStorage.setItem("pe-mobile-macros-mode", value);
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


export default ApplicationSettingsController;