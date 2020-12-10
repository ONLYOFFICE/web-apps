import React, {Component} from 'React';
import {PresentationSettings} from '../../view/settings/PresentationSettings';

class PresentationSettingsController extends Component {
    constructor(props) {
        super(props);
        // this.onSlideSize = this.onSlideSize.bind(this);
    }

    onSlideSize(value, slideSizeArr) {
        const api = Common.EditorApi.get();
        api.changeSlideSize(slideSizeArr[value][0], slideSizeArr[value][1]);
    }

    render() {
        return (
            <PresentationSettings 
                onSlideSize={this.onSlideSize}
            />
        )
    }
}

export default PresentationSettingsController;