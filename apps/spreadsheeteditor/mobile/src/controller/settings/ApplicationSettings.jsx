import React, { Component } from "react";
import { ApplicationSettings } from "../../view/settings/ApplicationSettings";
import {observer, inject} from "mobx-react";

class ApplicationSettingsController extends Component {
    constructor(props) {
        super(props);
        this.onFormulaLangChange = this.onFormulaLangChange.bind(this);
        this.initRegSettings();
    }

    initRegSettings() {

        // this.props.storeApplicationSettings.initRegSettings();

        const info = new Asc.asc_CFormatCellsInfo();
        const api = Common.EditorApi.get();
        const regSettings = this.props.storeApplicationSettings.reqSettings;

        info.asc_setType(Asc.c_oAscNumFormatType.None);
        info.asc_setSymbol(regSettings);

        let arr = api.asc_getFormatCells(info);
        let text = api.asc_getLocaleExample(arr[4], 1000.01, regSettings);

        text = text + ' ' + api.asc_getLocaleExample(arr[5], Asc.cDate().getExcelDateWithTime(), regSettings);
        text = text + ' ' + api.asc_getLocaleExample(arr[6], Asc.cDate().getExcelDateWithTime(), regSettings);

        this.textRegSettingsExample = text;
    }

    onChangeDisplayComments(displayComments) {
        const api = Common.EditorApi.get();

        if (!displayComments) {
            api.asc_hideComments();
            // Common.localStorage.setBool("sse-settings-resolvedcomment", false);
        } else {
            // let resolved = Common.localStorage.getBool("sse-settings-resolvedcomment");
            api.asc_showComments(displayComments);
        }

        // Common.localStorage.setBool("sse-mobile-settings-livecomment", displayComments);
    }

    onChangeDisplayResolved(value) {
        const api = Common.EditorApi.get();
        // let displayComments = Common.localStorage.getBool("sse-mobile-settings-livecomment");

        // if (displayComments) {
        api.asc_showComments(value);
        // Common.localStorage.setBool("sse-settings-resolvedcomment", resolved);
        // }
    }

    clickR1C1Style(checked) {
        const api = Common.EditorApi.get();
        // Common.localStorage.setBool('sse-settings-r1c1', checked);
        api.asc_setR1C1Mode(checked);
    }

    unitMeasurementChange(value) {
        value = value ? +value : Common.Utils.Metric.getDefaultMetric();
        Common.Utils.Metric.setCurrentMetric(value);
        // Common.localStorage.setItem("se-mobile-settings-unit", value);
    }

    onChangeMacrosSettings(value) {
        Common.Utils.InternalSettings.set("sse-mobile-macros-mode", +value);
        // Common.localStorage.setItem("sse-mobile-macros-mode", +value);
    }

    onFormulaLangChange(value) {
        // Common.localStorage.setItem("sse-settings-func-lang", value);
        this.initRegSettings();
        // SSE.getController('AddFunction').onDocumentReady();
    }

    render() {
        return (
            <ApplicationSettings 
                unitMeasurementChange={this.unitMeasurementChange}
                textRegSettingsExample={this.textRegSettingsExample}
                onChangeDisplayComments={this.onChangeDisplayComments}
                onChangeDisplayResolved={this.onChangeDisplayResolved}
                clickR1C1Style={this.clickR1C1Style}
                onChangeMacrosSettings={this.onChangeMacrosSettings}  
                onFormulaLangChange={this.onFormulaLangChange}     
            />
        )
    }
}


export default inject("storeApplicationSettings")(observer(ApplicationSettingsController));