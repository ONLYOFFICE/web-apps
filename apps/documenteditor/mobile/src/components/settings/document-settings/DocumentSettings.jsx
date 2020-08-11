import React, {Component} from 'react';
import {
    Page,
    Navbar,
    List,
    ListItem,
    BlockTitle
} from 'framework7-react';

export default class DocumentSettings extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const textDocumentSettings = "Document Settings";
        const textBack = "Back";
        const textOrientation = "Orientation";
        const textPortrait = "Portrait";
        const textLandscape = "Landscape";
        const textFormat = "Format";
        const textMargins = "Margins";

        const format = "A4";
        const formatSize = "21 cm x 29.7 cm";

        return (
            <Page>
                <Navbar title={textDocumentSettings} backLink={textBack} />
                <BlockTitle>{textOrientation}</BlockTitle>
                <List>
                    <ListItem checkbox title={textPortrait} name="orientation-checkbox" defaultChecked></ListItem>
                    <ListItem checkbox title={textLandscape} name="orientation-checkbox"></ListItem>
                </List>
                <BlockTitle>{textFormat}</BlockTitle>
                <List mediaList>
                    <ListItem title={format} subtitle={formatSize} link="/document-formats/"></ListItem>
                    <ListItem checkbox title={textMargins} link="/margins/"></ListItem>
                </List>
            </Page>
        )
    }
};