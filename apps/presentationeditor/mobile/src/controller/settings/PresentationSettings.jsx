import React, {Component} from 'React';
import { observer, inject } from "mobx-react";
import {PresentationSettings} from '../../view/settings/PresentationSettings';

class PresentationSettingsController extends Component {
    constructor(props) {
        super(props);
        this.initSlideSize = this.initSlideSize.bind(this);
    }

    initSlideSize() {
        if (!this.init) {
            const api = Common.EditorApi.get();
            this.props.storePresentationSettings.changeSizeIndex(api.get_PresentationWidth(), api.get_PresentationHeight());
            this.init = true;
        }
    }

    onSlideSize(slideSizeArr) {
        const api = Common.EditorApi.get();
        api.changeSlideSize(slideSizeArr[0], slideSizeArr[1]);
    }

    // Color Schemes

    initPageColorSchemes() {
        const api = Common.EditorApi.get();
        return api.asc_GetCurrentColorSchemeIndex();
    }

    onColorSchemeChange(newScheme) {
        const api = Common.EditorApi.get();
        api.asc_ChangeColorSchemeByIdx(newScheme);
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

export default inject("storePresentationSettings")(observer(PresentationSettingsController));