
import React, {Component} from 'react';
import {SpreadsheetSettings} from '../../view/settings/SpreadsheetSettings';
import {observer, inject} from "mobx-react";

class SpreadsheetSettingsController extends Component {
    constructor (props) {
        super (props);
        this.initSpreadsheetMargins = this.initSpreadsheetMargins.bind(this);
        this.onFormatChange = this.onFormatChange.bind(this);
        this.onPageMarginsChange = this.onPageMarginsChange.bind(this); 
        this.initSpreadsheetSettings();
    }

    initSpreadsheetSettings() {
        const api = Common.EditorApi.get();
        const params = api.asc_getSheetViewSettings();
        const currentSheet = api.asc_getActiveWorksheetIndex();
        const propsSheet = api.asc_getPageOptions(currentSheet);
        const opt = propsSheet.asc_getPageSetup();
        
        this.props.storeSpreadsheetSettings.changeHideHeadings(!params.asc_getShowRowColHeaders());
        this.props.storeSpreadsheetSettings.changeHideGridlines(!params.asc_getShowGridLines());
        this.props.storeSpreadsheetSettings.resetPortrait(opt.asc_getOrientation() === Asc.c_oAscPageOrientation.PagePortrait ? true : false);
        this.props.storeSpreadsheetSettings.changeDocSize(opt.asc_getWidth(), opt.asc_getHeight());
    }

    initSpreadsheetMargins() {
        const api = Common.EditorApi.get();

        // Init page margins

        let currentSheet = api.asc_getActiveWorksheetIndex(),
            props = api.asc_getPageOptions(currentSheet);

        this.localMarginProps = props.asc_getPageMargins();

        let left = this.localMarginProps.asc_getLeft(),
            top = this.localMarginProps.asc_getTop(),
            right = this.localMarginProps.asc_getRight(),
            bottom = this.localMarginProps.asc_getBottom();

        return {left, top, right, bottom};
    }

    onPageMarginsChange(align, marginValue) {
        const api = Common.EditorApi.get();
        let changeProps = new Asc.asc_CPageMargins();

        changeProps.asc_setTop(this.localMarginProps.asc_getTop());
        changeProps.asc_setBottom(this.localMarginProps.asc_getBottom());
        changeProps.asc_setLeft(this.localMarginProps.asc_getLeft());
        changeProps.asc_setRight(this.localMarginProps.asc_getRight());
        
        switch (align) {
            case 'left': changeProps.asc_setLeft(marginValue); break;
            case 'top': changeProps.asc_setTop(marginValue); break;
            case 'right': changeProps.asc_setRight(marginValue); break;
            case 'bottom': changeProps.asc_setBottom(marginValue); break;
        }

        api.asc_changePageMargins(changeProps, undefined, undefined, undefined, undefined, api.asc_getActiveWorksheetIndex());
    }

    onOrientationChange(value) {
        const api = Common.EditorApi.get();
        api.asc_changePageOrient(+value === Asc.c_oAscPageOrientation.PagePortrait, api.asc_getActiveWorksheetIndex());
    }

    clickCheckboxHideHeadings(value) {
        const api = Common.EditorApi.get();
        api.asc_setDisplayHeadings(!value);
    }

    clickCheckboxHideGridlines(value) {
        const api = Common.EditorApi.get();
        api.asc_setDisplayGridlines(!value);
    }

    initPageColorSchemes() {
        const api = Common.EditorApi.get();
        return api.asc_GetCurrentColorSchemeIndex();
    }

    onColorSchemeChange(index) {
        const api = Common.EditorApi.get();
        api.asc_ChangeColorSchemeByIdx(+index); 
    }

    onFormatChange(value) {
        const api = Common.EditorApi.get();
        api.asc_changeDocSize(parseFloat(value[0]), parseFloat(value[1]), api.asc_getActiveWorksheetIndex());
        this.initSpreadsheetSettings();
    }

    render () {
        return (
            <SpreadsheetSettings 
                isPortrait={this.isPortrait}
                isHideHeadings={this.isHideHeadings}
                isHideGridlines={this.isHideGridlines}
                onOrientationChange={this.onOrientationChange}
                clickCheckboxHideHeadings={this.clickCheckboxHideHeadings}
                clickCheckboxHideGridlines={this.clickCheckboxHideGridlines}
                initPageColorSchemes={this.initPageColorSchemes}
                onColorSchemeChange={this.onColorSchemeChange}
                onFormatChange={this.onFormatChange}
                initSpreadsheetMargins={this.initSpreadsheetMargins}
                onPageMarginsChange={this.onPageMarginsChange}
            />
        )
    }
}

export default inject("storeSpreadsheetSettings")(observer(SpreadsheetSettingsController));