import React, {Component} from 'React';
import {PresentationSettings} from '../../view/settings/PresentationSettings';

class PresentationSettingsController extends Component {
    constructor(props) {
        super(props);
    }

    onSlideSize(slideSizeArr) {
        const api = Common.EditorApi.get();
        // api.changeSlideSize(slideSizeArr[value][0], slideSizeArr[value][1]);
        api.changeSlideSize(slideSizeArr[0], slideSizeArr[1]);
    }

    // Color Schemes

    initPageColorSchemes() {
        const api = Common.EditorApi.get();
        return api.asc_GetCurrentColorSchemeIndex();
    }

    onColorSchemeChange(newScheme) {
        const api = Common.EditorApi.get();
        api.asc_ChangeColorSchemeByIdx(+newScheme);
    }


    render() {
        return (
            <PresentationSettings 
                onSlideSize={this.onSlideSize}
                onColorSchemeChange={this.onColorSchemeChange}
                initPageColorSchemes={this.initPageColorSchemes}
            />
        )
    }
}

export default PresentationSettingsController;