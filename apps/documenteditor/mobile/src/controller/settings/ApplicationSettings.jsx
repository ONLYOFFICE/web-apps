import React, { Component } from "react";
import { ApplicationSettings } from "../../view/settings/ApplicationSettings";

class ApplicationSettingsController extends Component {
    constructor(props) {
        super(props);
        this.switchDisplayComments = this.switchDisplayComments.bind(this);
    }

    setUnitMeasurement(value) {
        const api = Common.EditorApi.get();
        value = (value !== null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
        Common.Utils.Metric.setCurrentMetric(value);
        // Common.localStorage.setItem("de-mobile-settings-unit", value);
        api.asc_SetDocumentUnits((value == Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value == Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));
    }

    switchSpellCheck(value) {
        const api = Common.EditorApi.get();
        // let state = value === '1' ? true : false;
        // Common.localStorage.setItem("de-mobile-spellcheck", value ? 1 : 0);
        api.asc_setSpellCheck(value);
    }

    switchNoCharacters(value) {
        const api = Common.EditorApi.get();
        // Common.localStorage.setItem("de-mobile-no-characters", value);
        api.put_ShowParaMarks(value);
    }

    switchShowTableEmptyLine(value) {
        const api = Common.EditorApi.get();
        // Common.localStorage.setItem("de-mobile-hidden-borders", state);
        api.put_ShowTableEmptyLine(value);
    }

    switchDisplayComments(value) {
        const api = Common.EditorApi.get();
        if (!value) {
            api.asc_hideComments();
            this.switchDisplayResolved(value);
            // Common.localStorage.setBool("de-settings-resolvedcomment", false);
        } else {
            // let resolved = Common.localStorage.getBool("de-settings-resolvedcomment");
            api.asc_showComments(value);
        }
        // Common.localStorage.setBool("de-mobile-settings-livecomment", value);
    }

    switchDisplayResolved(value) {
        const api = Common.EditorApi.get();
        // let displayComments = Common.localStorage.getBool("de-mobile-settings-livecomment");
        if (value) {
            api.asc_showComments(value);
        }
        // Common.localStorage.setBool("de-settings-resolvedcomment", value);
    }

    setMacrosSettings(value) {
        // Common.Utils.InternalSettings.set("de-mobile-macros-mode", +value);
        // Common.localStorage.setItem("de-mobile-macros-mode", +value);
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
            />
        )
    }
}


export default ApplicationSettingsController;