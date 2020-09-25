import React, {Component} from 'react';
import { connect } from 'react-redux';
import {
    Page,
    Navbar,
    List,
    ListItem,
    BlockTitle
} from 'framework7-react';

const DocumentSettings = props => {
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
                <ListItem radio title={textPortrait} name="orientation-checkbox" checked={props.isPortrait} onClick={e => props.onPageOrientation('portrait')}></ListItem>
                <ListItem radio title={textLandscape} name="orientation-checkbox" checked={!props.isPortrait} onClick={e => props.onPageOrientation('landscape')}></ListItem>
            </List>
            <BlockTitle>{textFormat}</BlockTitle>
            <List mediaList>
                <ListItem title={format} subtitle={formatSize} link="/document-formats/"></ListItem>
                <ListItem checkbox title={textMargins} link="/margins/"></ListItem>
            </List>
        </Page>
     )
};

const mapStateToProps = (state) => {
    return state.settings;
};

export default connect(mapStateToProps)(DocumentSettings);
