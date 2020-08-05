import React, {Component} from 'react';
import {
    View,
    Page,
    Navbar,
    NavRight,
    Link,
    Popup,
    Icon,
    ListItem,
    List
} from 'framework7-react';

export default class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            popupOpened: false,
        };
    }
    render() {
        const textSettings = "Settings";
        const textDone = "Done";
        const textFindAndReplace = "Find and Replace";
        const textDocumentSettings = "Document Settings";
        const textApplicationSettings = "Application Settings";
        const textDownload = "Download";
        const textPrint = "Print";
        const textDocumentInfo = "Document Info";
        const textHelp = "Help";
        const textAbout = "About";

        return (
            <Popup className="settings-popup" opened={this.state.popupOpened} onPopupClosed={() => this.setState({popupOpened : false})}>
                <View>
                <Page>
                    <Navbar title={textSettings}>
                        <NavRight>
                            <Link popupClose=".settings-popup">{textDone}</Link>
                        </NavRight>
                    </Navbar>
                    <List>
                        <ListItem title={textFindAndReplace}>
                            <Icon slot="media" icon="icon-search"></Icon>
                        </ListItem>
                        <ListItem title={textDocumentSettings} link="/document-settings/">
                            <Icon slot="media" icon="icon-doc-setup"></Icon>
                        </ListItem>
                        <ListItem title={textApplicationSettings} link="#">
                            <Icon slot="media" icon="icon-app-settings"></Icon>
                        </ListItem>
                        <ListItem title={textDownload} link="#">
                            <Icon slot="media" icon="icon-download"></Icon>
                        </ListItem>
                        <ListItem title={textPrint}>
                            <Icon slot="media" icon="icon-print"></Icon>
                        </ListItem>
                        <ListItem title={textDocumentInfo} link="#">
                            <Icon slot="media" icon="icon-info"></Icon>
                        </ListItem>
                        <ListItem title={textHelp} link="#">
                            <Icon slot="media" icon="icon-help"></Icon>
                        </ListItem>
                        <ListItem title={textAbout} link="#">
                            <Icon slot="media" icon="icon-about"></Icon>
                        </ListItem>
                    </List>
                </Page>
                </View>
            </Popup>
        )
    }
};