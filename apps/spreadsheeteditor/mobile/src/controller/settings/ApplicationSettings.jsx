import React, { Component } from "react";
import { ApplicationSettings } from "../../view/settings/ApplicationSettings";
import {observer, inject} from "mobx-react";
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage';
import {FunctionGroups} from '../../controller/add/AddFunction';

class ApplicationSettingsController extends Component {
    constructor(props) {
        super(props);
        this.onFormulaLangChange = this.onFormulaLangChange.bind(this);
        this.onChangeDisplayComments = this.onChangeDisplayComments.bind(this);
        this.onRegSettings = this.onRegSettings.bind(this);
        this.initRegSettings = this.initRegSettings.bind(this);
        this.props.storeApplicationSettings.initRegData();
        this.initRegSettings();
        this.props.storeApplicationSettings.changeUnitMeasurement(Common.Utils.Metric.getCurrentMetric());
    }

    initRegSettings() {
        const info = new Asc.asc_CFormatCellsInfo();
        const api = Common.EditorApi.get();
        const regCode = this.props.storeApplicationSettings.getRegCode();

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

    onFormulaLangChange(value) {
        LocalStorage.setItem("sse-settings-func-lang", value);
        this.initRegSettings();
        Common.Notifications.trigger('changeFuncLang');
    }

    onRegSettings(regCode) {
        const api = Common.EditorApi.get();
        LocalStorage.setItem("sse-settings-regional", regCode);
        this.initRegSettings();
        if (regCode!==null) api.asc_setLocale(+regCode);
        Common.Notifications.trigger('changeRegSettings');
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


export default inject("storeApplicationSettings", "storeAppOptions")(observer(ApplicationSettingsController));