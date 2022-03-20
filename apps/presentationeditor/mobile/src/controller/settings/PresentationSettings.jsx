import React, {Component} from 'react';
import { observer, inject } from "mobx-react";
import {PresentationSettings} from '../../view/settings/PresentationSettings';

class PresentationSettingsController extends Component {
    constructor(props) {
        super(props);
        this.initSlideSize = this.initSlideSize.bind(this);
        this.onSlideSize = this.onSlideSize.bind(this);
        this.onColorSchemeChange = this.onColorSchemeChange.bind(this);
        this.initSlideSize();
    }

    initSlideSize() {
        if (!this.init) {
            const api = Common.EditorApi.get();
            const slideSizes = [
                [9144000, 6858000, Asc.c_oAscSlideSZType.SzScreen4x3], 
                [12192000, 6858000, Asc.c_oAscSlideSZType.SzCustom]
            ];

            this.props.storePresentationSettings.initSlideSizes(slideSizes);
            this.props.storePresentationSettings.changeSizeIndex(api.get_PresentationWidth(), api.get_PresentationHeight());
            this.init = true;
        }
    }

    onSlideSize(slideSizeArr) {
        const api = Common.EditorApi.get();

        let ratio = slideSizeArr[1] / slideSizeArr[0];
        let currentHeight = this.props.storePresentationSettings.currentPageSize.height;
        let currentPageSize = {
            width: ((currentHeight || slideSizeArr[1]) / ratio),
            height: currentHeight
        };
        // api.changeSlideSize(slideSizeArr[0], slideSizeArr[1], slideSizeArr[2]);
        api.changeSlideSize(currentPageSize.width, currentPageSize.height, slideSizeArr[2]);
    }

    // Color Schemes

    initPageColorSchemes() {
        const api = Common.EditorApi.get();
        return api.asc_GetCurrentColorSchemeIndex();
    }

    onColorSchemeChange(newScheme) {
        const api = Common.EditorApi.get();
        api.asc_ChangeColorSchemeByIdx(newScheme);
        this.props.storeTableSettings.setStyles([], 'default');
    }


    render() {
        return (
            <PresentationSettings
                initSlideSize={this.initSlideSize}
                onSlideSize={this.onSlideSize}
                onColorSchemeChange={this.onColorSchemeChange}
                initPageColorSchemes={this.initPageColorSchemes}
            />
        )
    }
}

export default inject("storePresentationSettings", "storeTableSettings")(observer(PresentationSettingsController));