import React, {Component, useEffect} from 'react';
import {View,Page,Navbar,NavRight,Link,Popup,Popover,Icon,ListItem,List} from 'framework7-react';
import { withTranslation } from 'react-i18next';
import {f7} from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device'


const SettingsView = props => {
    const {t} = props;
    const _t = t('ViewSettings', {returnObjects: true});
    const navbar = <Navbar title={t('ViewSettings.textSettings')}>
                    {!props.inPopover  && <NavRight><Link popupClose=".settings-popup">{t('ViewSettings.textDone')}</Link></NavRight>}
                    </Navbar>;

    const onoptionclick = page => {
        if ( props.onOptionClick )
            props.onOptionClick(page)
    };

    return (
        <View style={props.style}>
            <Page>
                {navbar}
                <List>
                    <ListItem title={_t.textFindAndReplace}>
                        <Icon slot="media" icon="icon-search"></Icon>
                    </ListItem>
                    <ListItem title={_t.textDocumentSettings} link="/document-settings/" onClick={onoptionclick.bind(this, '/document-settings/')}>
                        <Icon slot="media" icon="icon-doc-setup"></Icon>
                    </ListItem>
                    <ListItem title={_t.textApplicationSettings} link="#">
                        <Icon slot="media" icon="icon-app-settings"></Icon>
                    </ListItem>
                    <ListItem title={_t.textDownload} link="#">
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
    )
};

const TSettingsView = withTranslation()(SettingsView);

class SettingsPopup extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Popup className="settings-popup" onPopupClosed={() => this.props.onclosed()}>
                <TSettingsView />
            </Popup>
        )
    }
}

class SettingsPopover extends Component {
    constructor(props) {
        super(props)

        this.onoptionclick = this.onoptionclick.bind(this);
    }

    onoptionclick(page){
        this.$f7.views.current.router.navigate(page);
    }

    render() {
        return (
            <Popover className="settings__popover" onPopoverClosed={() => this.props.onclosed()}>
                <TSettingsView inPopover={true} onOptionClick={this.onoptionclick} style={{height: '430px', width: '360px'}} />
            </Popover>
        )
    }
}

const Settings = props => {
    useEffect(() => {
        if ( Device.phone )
            f7.popup.open('.settings-popup');
        else f7.popover.open('.settings__popover', '#btn-settings');

        return () => {
            // component will unmount
        }
    });


    const onviewclosed = () => {
        if ( props.onclosed )
            props.onclosed();
    };

    if ( Device.phone ) {
        return <SettingsPopup onclosed={onviewclosed} />
    }

    return <SettingsPopover onclosed={onviewclosed} />
};

export default Settings;
