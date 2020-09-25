
import React, {Component} from 'react';
import DocumentSettings from '../document-settings/DocumentSettings'


class DocumentSettingsController extends Component {
    constructor(props) {
        super(props);
    }

    onPageOrientation(value){
        const api = Common.EditorApi.get();
        api.change_PageOrient(value=='portrait');
    }

    render() {
        return (
            <DocumentSettings onPageOrientation={this.onPageOrientation} />
        )
    }
}

export default DocumentSettingsController;