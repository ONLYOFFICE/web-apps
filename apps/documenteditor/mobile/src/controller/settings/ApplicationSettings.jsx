import React, { Component } from "react";
import { ApplicationSettings } from "../../view/settings/ApplicationSettings";
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage.mjs';
import {observer, inject} from "mobx-react";
// import { Themes } from '../../../../../common/mobile/lib/controller/Themes';

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
        this.switchDisplayComments = this.switchDisplayComments.bind(this);
        this.props.storeApplicationSettings.changeUnitMeasurement(Common.Utils.Metric.getCurrentMetric());
        this.changeColorTheme = this.changeColorTheme.bind(this);
    }

    setUnitMeasurement(value) {
        value = (value !== null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
        Common.Utils.Metric.setCurrentMetric(value);
        LocalStorage.setItem("de-mobile-settings-unit", value);

        const api = Common.EditorApi.get();
        api.asc_SetDocumentUnits((value == Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value == Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));
    }

    switchSpellCheck(value) {
        LocalStorage.setBool("de-mobile-spellcheck", value);
        Common.EditorApi.get().asc_setSpellCheck(value);
    }

    switchNoCharacters(value) {
        LocalStorage.setBool("de-mobile-no-characters", value);
        Common.EditorApi.get().put_ShowParaMarks(value);
    }

    switchShowTableEmptyLine(value) {
        LocalStorage.setBool("de-mobile-hidden-borders", value);
        Common.EditorApi.get().put_ShowTableEmptyLine(value);
    }

    switchDisplayComments(value) {
        const api = Common.EditorApi.get();
        this.props.storeAppOptions.changeCanViewComments(value);

        if (!value) {
            this.switchDisplayResolved(value);
            api.asc_hideComments();
            LocalStorage.setBool("de-settings-resolvedcomment", false);
        } else {
            const resolved = LocalStorage.getBool("de-settings-resolvedcomment");
            api.asc_showComments(resolved);
        }

        LocalStorage.setBool("de-mobile-settings-livecomment", value);
    }

    switchDisplayResolved(value) {
        const displayComments = LocalStorage.getBool("de-mobile-settings-livecomment",true);
        if (displayComments) {
            Common.EditorApi.get().asc_showComments(value);
            LocalStorage.setBool("de-settings-resolvedcomment", value);
        }
    }

    setMacrosSettings(value) {
        LocalStorage.setItem("de-mobile-macros-mode", value);
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
        } else if(this.checkSystemDarkTheme()) {
            theme = themesMap.dark;

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
                setUnitMeasurement={this.setUnitMeasurement}
                switchSpellCheck={this.switchSpellCheck}
                switchNoCharacters={this.switchNoCharacters}
                switchShowTableEmptyLine={this.switchShowTableEmptyLine}
                switchDisplayComments={this.switchDisplayComments}
                switchDisplayResolved={this.switchDisplayResolved}  
                setMacrosSettings={this.setMacrosSettings}  
                changeDirection={this.changeDirection}      
                changeColorTheme={this.changeColorTheme}       
            />
        )
    }
}


export default inject("storeAppOptions", "storeApplicationSettings")(observer(ApplicationSettingsController));