import React, {Component} from 'react';
import {
    Page,
    Navbar
} from 'framework7-react';

export default class DocumentFormats extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const textDocumentFormats = "Document Formats";
        const textBack = "Back";

        return (
            <Page>
                <Navbar title={textDocumentFormats} backLink={textBack} />
                <div>{textDocumentFormats}</div>
            </Page>
        )
    }
};