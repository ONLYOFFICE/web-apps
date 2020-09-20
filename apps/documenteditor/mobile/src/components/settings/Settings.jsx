import React, { Component } from 'react';
import { View, Page, Navbar, NavRight, Link, Popup, Icon, ListItem, List } from 'framework7-react';
import { withTranslation } from 'react-i18next';
import {changePageOrient} from "../../store/actions/actions";

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            popupOpened: false,
        };
    }
    render() {
        const { t } = this.props;
        const _trarr = t('ViewSettings', {returnObjects: true});

        return (
            <Popup className="settings-popup" opened={this.state.popupOpened} onPopupClosed={() => this.setState({popupOpened : false})}>
                <View>
                <Page>
                    <Navbar title={t('ViewSettings.textSettings')}>
                        <NavRight>
                            <Link popupClose=".settings-popup">{t('ViewSettings.textDone')}</Link>
                        </NavRight>
                    </Navbar>
                    <List>
                        <ListItem title={_trarr.textFindAndReplace}>
                            <Icon slot="media" icon="icon-search"></Icon>
                        </ListItem>
                        <ListItem title={_trarr.textDocumentSettings} link="/document-settings/">
                            <Icon slot="media" icon="icon-doc-setup"></Icon>
                        </ListItem>
                        <ListItem title={_trarr.textApplicationSettings} link="#">
                            <Icon slot="media" icon="icon-app-settings"></Icon>
                        </ListItem>
                        <ListItem title={_trarr.textDownload} link="#">
                            <Icon slot="media" icon="icon-download"></Icon>
                        </ListItem>
                        <ListItem title={t('ViewSettings.textPrint')}>
                            <Icon slot="media" icon="icon-print"></Icon>
                        </ListItem>
                        <ListItem title={t('ViewSettings.textDocumentInfo')} link="#">
                            <Icon slot="media" icon="icon-info"></Icon>
                        </ListItem>
                        <ListItem title={t('ViewSettings.textHelp')} link="#">
                            <Icon slot="media" icon="icon-help"></Icon>
                        </ListItem>
                        <ListItem title={t('ViewSettings.textAbout')} link="#">
                            <Icon slot="media" icon="icon-about"></Icon>
                        </ListItem>
                    </List>
                </Page>
                </View>
            </Popup>
        )
    }
};

export default withTranslation()(Settings);