import React, { Component } from "react";
import { ApplicationSettings } from "../../view/settings/ApplicationSettings";
import {observer, inject} from "mobx-react";
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage.mjs';
import { withTranslation } from 'react-i18next';
// import {FunctionGroups} from '../../controller/add/AddFunction';

class ApplicationSettingsController extends Component {
    constructor(props) {
        super(props);
        this.nameColors = [
            "canvas-background",
            "canvas-content-background",
            "canvas-page-border",

            "canvas-ruler-background",
            "canvas-ruler-border",
            "canvas-ruler-margins-background",
            "canvas-ruler-mark",
            "canvas-ruler-handle-border",
            "canvas-ruler-handle-border-disabled",

            "canvas-high-contrast",
            "canvas-high-contrast-disabled",

            "canvas-cell-border",
            "canvas-cell-title-border",
            "canvas-cell-title-border-hover",
            "canvas-cell-title-border-selected",
            "canvas-cell-title-hover",
            "canvas-cell-title-selected",

            "canvas-dark-cell-title",
            "canvas-dark-cell-title-hover",
            "canvas-dark-cell-title-selected",
            "canvas-dark-cell-title-border",
            "canvas-dark-cell-title-border-hover",
            "canvas-dark-cell-title-border-selected",
            "canvas-dark-content-background",
            "canvas-dark-page-border",

            "canvas-scroll-thumb",
            "canvas-scroll-thumb-hover",
            "canvas-scroll-thumb-pressed",
            "canvas-scroll-thumb-border",
            "canvas-scroll-thumb-border-hover",
            "canvas-scroll-thumb-border-pressed",
            "canvas-scroll-arrow",
            "canvas-scroll-arrow-hover",
            "canvas-scroll-arrow-pressed",
            "canvas-scroll-thumb-target",
            "canvas-scroll-thumb-target-hover",
            "canvas-scroll-thumb-target-pressed",
        ];

        this.onFormulaLangChange = this.onFormulaLangChange.bind(this);
        this.onChangeDisplayComments = this.onChangeDisplayComments.bind(this);
        this.onRegSettings = this.onRegSettings.bind(this);
        this.initRegSettings = this.initRegSettings.bind(this);
        this.initFormulaLangsCollection = this.initFormulaLangsCollection.bind(this);

        this.props.storeApplicationSettings.initRegData();
        this.initRegSettings();
        this.props.storeApplicationSettings.changeUnitMeasurement(Common.Utils.Metric.getCurrentMetric());
        this.props.storeApplicationSettings.setFormulaLangsCollection(this.initFormulaLangsCollection());
        this.changeColorTheme = this.changeColorTheme.bind(this);
    }

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

    changeDirection(value) {
        LocalStorage.setItem('mode-direction', value);
    }

    checkSystemDarkTheme() {
        if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return true;
        }

        return false;
    }

    get_current_theme_colors(colors) {
        let out_object = {};
        const style = getComputedStyle(document.body);
        colors.forEach((item, index) => {
            out_object[item] = style.getPropertyValue('--' + item).trim()
        })

        return out_object;
    }

    changeColorTheme(type) {
        const appOptions = this.props.storeAppOptions;
        const themesMap = appOptions.themesMap;
        let theme = themesMap.light;

        if(type !== "system") {
            theme = themesMap[type];

            LocalStorage.setItem("ui-theme", JSON.stringify(theme));
            appOptions.setColorTheme(theme);
        } else {
            const isSystemDarkTheme = this.checkSystemDarkTheme();
            if(isSystemDarkTheme) theme = themesMap.dark;

            LocalStorage.setItem("ui-theme", JSON.stringify(themesMap["system"]));
            appOptions.setColorTheme(themesMap["system"]);
        }

        const $body = $$('body');
        $body.attr('class') && $body.attr('class',  $body.attr('class').replace(/\s?theme-type-(?:dark|light)/, ''));
        $body.addClass(`theme-type-${theme.type}`);

        const on_engine_created = api => {
            let obj = this.get_current_theme_colors(this.nameColors);
            obj.type = theme.type;
            obj.name = theme.id;

            api.asc_setSkin(obj);
        };

        const api = Common.EditorApi ? Common.EditorApi.get() : undefined;
        if(!api) Common.Notifications.on('engineCreated', on_engine_created);
        else on_engine_created(api);
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
                changeDirection={this.changeDirection}
                changeColorTheme={this.changeColorTheme}
            />
        )
    }
}


export default inject("storeApplicationSettings", "storeAppOptions")(observer(withTranslation()(ApplicationSettingsController)));