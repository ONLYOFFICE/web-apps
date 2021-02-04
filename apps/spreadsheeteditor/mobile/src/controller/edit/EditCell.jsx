import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';

import { EditCell } from '../../view/edit/EditCell';

class EditCellController extends Component {
    constructor (props) {
        super(props);
    }

    toggleBold(value) {
        const api = Common.EditorApi.get();
        api.asc_setCellBold(value);
    }

    toggleItalic(value) {
        const api = Common.EditorApi.get();
        api.asc_setCellItalic(value);
        
    }

    toggleUnderline(value) {
        const api = Common.EditorApi.get();
        api.asc_setCellUnderline(value);
    }

    onStyleClick(type) {
        const api = Common.EditorApi.get();
        api.asc_setCellStyle(type);
    }

    onTextColor(color) {
        const api = Common.EditorApi.get();
        api.asc_setCellTextColor(Common.Utils.ThemeColor.getRgbColor(color));
    }

    onFillColor(color) {
        const api = Common.EditorApi.get();
        api.asc_setCellBackgroundColor(color == 'transparent' ? null : Common.Utils.ThemeColor.getRgbColor(color));
    }

    render () {
        return (
            <EditCell 
                toggleBold={this.toggleBold}
                toggleItalic={this.toggleItalic}
                toggleUnderline={this.toggleUnderline}
                onStyleClick={this.onStyleClick}
                onTextColor={this.onTextColor}
                onFillColor={this.onFillColor}
            />
        )
    }
}

export default EditCellController;