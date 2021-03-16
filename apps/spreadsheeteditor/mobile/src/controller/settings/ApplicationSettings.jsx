import React, { Component } from "react";
import { ApplicationSettings } from "../../view/settings/ApplicationSettings";
import {observer, inject} from "mobx-react";

class ApplicationSettingsController extends Component {
    constructor(props) {
        super(props);
        this.onFormulaLangChange = this.onFormulaLangChange.bind(this);
        this.onRegSettings = this.onRegSettings.bind(this);
        this.initRegSettings = this.initRegSettings.bind(this);
        this.props.storeApplicationSettings.initRegData();
        this.initRegSettings();
    }

    initRegSettings() {
        this.props.storeApplicationSettings.getRegCode();

        const info = new Asc.asc_CFormatCellsInfo();
        const api = Common.EditorApi.get();
        const regCode = this.props.storeApplicationSettings.regCode;

        info.asc_setType(Asc.c_oAscNumFormatType.None);
        info.asc_setSymbol(regCode);

        const arr = api.asc_getFormatCells(info);
        const text4 = api.asc_getLocaleExample(arr[4], 1000.01, regCode),
              text5 = api.asc_getLocaleExample(arr[5], Asc.cDate().getExcelDateWithTime(), regCode),
              text6 = api.asc_getLocaleExample(arr[6], Asc.cDate().getExcelDateWithTime(), regCode);

        this.props.storeApplicationSettings.setRegExample(`${text4} ${text5} ${text6}`);
    }

    onChangeDisplayComments(displayComments) {
        const api = Common.EditorApi.get();

        if (!displayComments) {
            api.asc_hideComments();
            Common.localStorage.setBool("sse-settings-resolvedcomment", false);
        } else {
            let resolved = Common.localStorage.getBool("sse-settings-resolvedcomment");
            api.asc_showComments(resolved);
        }

        Common.localStorage.setBool("sse-mobile-settings-livecomment", displayComments);
    }

    onChangeDisplayResolved(value) {
        const api = Common.EditorApi.get();
        let displayComments = Common.localStorage.getBool("sse-mobile-settings-livecomment");

        if (displayComments) {
            api.asc_showComments(value);
            Common.localStorage.setBool("sse-settings-resolvedcomment", value);
        }
    }

    clickR1C1Style(checked) {
        const api = Common.EditorApi.get();
        Common.localStorage.setBool('sse-settings-r1c1', checked);
        api.asc_setR1C1Mode(checked);
    }

    unitMeasurementChange(value) {
        value = value ? +value : Common.Utils.Metric.getDefaultMetric();
        Common.Utils.Metric.setCurrentMetric(value);
        Common.localStorage.setItem("se-mobile-settings-unit", value);
    }

    onChangeMacrosSettings(value) {
        Common.Utils.InternalSettings.set("sse-mobile-macros-mode", +value);
        Common.localStorage.setItem("sse-mobile-macros-mode", +value);
    }

    onFormulaLangChange(value) {
        Common.localStorage.setItem("sse-settings-func-lang", value);
        this.initRegSettings();
        // SSE.getController('AddFunction').onDocumentReady();
    }

    onRegSettings(regCode) {
        const api = Common.EditorApi.get();
        Common.localStorage.setItem("sse-settings-regional", regCode);
        this.initRegSettings();
        if (regCode!==null) api.asc_setLocale(+regCode);
    }

    render() {
        return (
            <ApplicationSettings 
                initRegSettings={this.initRegSettings}
                unitMeasurementChange={this.unitMeasurementChange}
                textRegSettingsExample={this.textRegSettingsExample}
                onChangeDisplayComments={this.onChangeDisplayComments}
                onChangeDisplayResolved={this.onChangeDisplayResolved}
                clickR1C1Style={this.clickR1C1Style}
                onChangeMacrosSettings={this.onChangeMacrosSettings}  
                onFormulaLangChange={this.onFormulaLangChange}     
                onRegSettings={this.onRegSettings}
            />
        )
    }
}


export default inject("storeApplicationSettings")(observer(ApplicationSettingsController));