import React, {Component, useEffect} from 'react';
import {View,Page,Navbar,NavRight,Link,Popup,Icon,ListItem,List} from 'framework7-react';
import { withTranslation } from 'react-i18next';
import { f7 } from 'framework7-react';

class SettingsPopup extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { t } = this.props;
        const _trarr = t('ViewSettings', {returnObjects: true});

        return (
            <Popup className="settings-popup" onPopupClosed={() => this.props.onclosed()}>
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
}

const HOCSettingsPopup = withTranslation()(SettingsPopup);

const Settings = props => {
    useEffect(() => {
        f7.popup.open('.settings-popup');

        return () => {
            // component will unmount
        }
    });


    const onviewclosed = () => {
        if ( props.onclosed )
            props.onclosed();
    };

    return <HOCSettingsPopup onclosed={onviewclosed} />
};

export default Settings;
