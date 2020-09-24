
import React, {Component} from 'react';
import DocumentSettings from '../document-settings/DocumentSettings'


class DocumentSettingsController extends Component {
    constructor(props) {
        super(props);

        console.log('controller created');
    }

    onPageOrientation(value){
        console.log(`changed page orientation: ${value}`);
    }

    render() {
        return (
            <DocumentSettings onPageOrientation={this.onPageOrientation} />
        )
    }
}

export default DocumentSettingsController;