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

        this.onFormulaLangChange = this.onFormulaLangChange.bind(this);
        this.onChangeDisplayComments = this.onChangeDisplayComments.bind(this);
        this.onRegSettings = this.onRegSettings.bind(this);
        this.initRegSettings = this.initRegSettings.bind(this);
        this.changeDirectionMode = this.changeDirectionMode.bind(this);
        this.initFormulaLangsCollection = this.initFormulaLangsCollection.bind(this);
        this.props.storeApplicationSettings.initRegData();
        this.initRegSettings();
        this.props.storeApplicationSettings.changeUnitMeasurement(Common.Utils.Metric.getCurrentMetric());
        this.props.storeApplicationSettings.setFormulaLangsCollection(this.initFormulaLangsCollection());
    }

    static contextType = ThemesContext;

    initFormulaLangsCollection() {
        const { t } = this.props;
        const _t = t("View.Settings", { returnObjects: true });
        const storeApplicationSettings = this.props.storeApplicationSettings;
        const formulaLangsExamples = storeApplicationSettings.formulaLangsExamples;
        const formulaLangs = storeApplicationSettings.formulaLangs;
        const formulaLangsCollection = formulaLangs.map(lang => {
            let str = lang.replace(/[\-_]/, '');
            str = str.charAt(0).toUpperCase() + str.substring(1, str.length);

            return {
                value: lang, 
                displayValue: _t[`txt${str}lang`] ? t(`View.Settings.txt${str}lang`) : t(`View.Settings.txt${str}`), exampleValue: formulaLangsExamples[`txtExample${str}`] || formulaLangsExamples['txtExampleEn']
            }
        });

        formulaLangsCollection.sort(function(a, b) {
            if (a.displayValue < b.displayValue) return -1;
            if (a.displayValue > b.displayValue) return 1;
            return 0;
        });

        return formulaLangsCollection;
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
              text6 = api.asc_getLocaleExample(arr[7], Asc.cDate().getExcelDateWithTime(), regCode);

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
                initRegSettings={this.initRegSettings}
                unitMeasurementChange={this.unitMeasurementChange}
                textRegSettingsExample={this.textRegSettingsExample}
                onChangeDisplayComments={this.onChangeDisplayComments}
                onChangeDisplayResolved={this.onChangeDisplayResolved}
                clickR1C1Style={this.clickR1C1Style}
                onChangeMacrosSettings={this.onChangeMacrosSettings}  
                onFormulaLangChange={this.onFormulaLangChange}     
                onRegSettings={this.onRegSettings}   
                changeDirectionMode={this.changeDirectionMode}
                changeTheme={this.context.changeTheme}
            />
        )
    }
}


export default inject("storeApplicationSettings", "storeAppOptions")(observer(withTranslation()(ApplicationSettingsController)));