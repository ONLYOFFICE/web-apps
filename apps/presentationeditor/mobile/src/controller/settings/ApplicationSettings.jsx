import React, { Component } from "react";
import { ApplicationSettings } from "../../view/settings/ApplicationSettings";
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage';
import {observer, inject} from "mobx-react";

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

    switchDarkTheme(value) {
        const theme = value ? {id:'theme-dark', type:'dark'} : {id:'theme-light', type:'light'};
        LocalStorage.setItem("ui-theme", JSON.stringify(theme));

        const $body = $$('body');
        $body.attr('class') && $body.attr('class',  $body.attr('class').replace(/\s?theme-type-(?:dark|light)/, ''));
        $body.addClass(`theme-type-${theme.type}`);
    }

    isThemeDark() {
        const obj = LocalStorage.getItem("ui-theme");
        return !!obj ? JSON.parse(obj).type === 'dark' : false;
    }


    render() {
        return (
            <ApplicationSettings 
                setUnitMeasurement={this.setUnitMeasurement}
                switchSpellCheck={this.switchSpellCheck} 
                setMacrosSettings={this.setMacrosSettings}   
                isThemeDark={this.isThemeDark}    
                switchDarkTheme={this.switchDarkTheme}        
            />
        )
    }
}


export default inject("storeApplicationSettings")(observer(ApplicationSettingsController));