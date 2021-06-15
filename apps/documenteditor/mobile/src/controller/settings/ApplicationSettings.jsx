import React, { Component } from "react";
import { ApplicationSettings } from "../../view/settings/ApplicationSettings";
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage';
import {observer, inject} from "mobx-react";

class ApplicationSettingsController extends Component {
    constructor(props) {
        super(props);
        this.switchDisplayComments = this.switchDisplayComments.bind(this);
        this.props.storeApplicationSettings.changeUnitMeasurement(Common.Utils.Metric.getCurrentMetric());
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
            api.asc_hideComments();
            this.switchDisplayResolved(value);
            LocalStorage.setBool("de-settings-resolvedcomment", false);
        } else {
            const resolved = LocalStorage.getBool("de-settings-resolvedcomment");
            api.asc_showComments(resolved);
        }

        LocalStorage.setBool("de-mobile-settings-livecomment", value);
    }

    switchDisplayResolved(value) {
        const displayComments = LocalStorage.getBool("de-mobile-settings-livecomment");
        if (displayComments) {
            Common.EditorApi.get().asc_showComments(value);
            LocalStorage.setBool("de-settings-resolvedcomment", value);
        }
    }

    setMacrosSettings(value) {
        LocalStorage.setItem("de-mobile-macros-mode", value);
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


export default inject("storeAppOptions", "storeApplicationSettings")(observer(ApplicationSettingsController));