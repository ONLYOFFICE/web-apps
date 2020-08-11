import React, {Component} from 'react';
import {
    Page,
    Navbar
} from 'framework7-react';

export default class Margins extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const textMargins = "Margins";
        const textBack = "Back";

        return (
            <Page>
                <Navbar title={textMargins} backLink={textBack} />
                <div>{textMargins}</div>
            </Page>
        )
    }
};