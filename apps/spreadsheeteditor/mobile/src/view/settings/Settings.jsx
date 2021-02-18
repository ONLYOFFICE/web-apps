import React, {Component, useEffect} from 'react';
import {View,Page,Navbar,NavRight,Link,Popup,Popover,Icon,ListItem,List} from 'framework7-react';
import { withTranslation } from 'react-i18next';
import {f7} from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import SpreadsheetSettingsController from '../../controller/settings/SpreadsheetSettings.jsx';
import {SpreadsheetColorSchemes, SpreadsheetFormats, SpreadsheetMargins} from './SpreadsheetSettings.jsx';

const routes = [
    {
        path: '/',
        component: 'TSettingsView'
    },
    {
        path: '/spreadsheet-settings/',
        component: SpreadsheetSettingsController,
    },
    {
        path: "/color-schemes/",
        component: SpreadsheetColorSchemes
    },
    {
        path: '/spreadsheet-formats/',
        component: SpreadsheetFormats
    },
    {
        path: '/margins/',
        component: SpreadsheetMargins
    }
];


const SettingsList = withTranslation()(props => {
    const {t} = props;
    const _t = t('View.Settings', {returnObjects: true});
    const navbar = <Navbar title={_t.textSettings}>
        {!props.inPopover  && <NavRight><Link popupClose=".settings-popup">{_t.textDone}</Link></NavRight>}
    </Navbar>;

    const onoptionclick = page => {
        if ( props.onOptionClick )
            props.onOptionClick(page)
    };

    return (
        <View style={props.style} stackPages={true} routes={routes}>
            <Page>
                {navbar}
                <List>
                    {!props.inPopover &&
                        <ListItem title={_t.textFindAndReplace}>
                            <Icon slot="media" icon="icon-search"></Icon>
                        </ListItem>
                    }
                    <ListItem link="#" title={_t.textSpreadsheetSettings} onClick={onoptionclick.bind(this, '/spreadsheet-settings/')}>
                        <Icon slot="media" icon="icon-table-settings"></Icon>
                    </ListItem>
                    <ListItem title={_t.textApplicationSettings} link="#">
                        <Icon slot="media" icon="icon-app-settings"></Icon>
                    </ListItem>
                    <ListItem title={_t.textDownload} link="#">
                        <Icon slot="media" icon="icon-download"></Icon>
                    </ListItem>
                    <ListItem title={_t.textPrint}>
                        <Icon slot="media" icon="icon-print"></Icon>
                    </ListItem>
                    <ListItem title={_t.textSpreadsheetInfo} link="#" onClick={onoptionclick.bind(this, "/spreadsheet-info/")}>
                        <Icon slot="media" icon="icon-info"></Icon>
                    </ListItem>
                    <ListItem title={_t.textHelp} link="#">
                        <Icon slot="media" icon="icon-help"></Icon>
                    </ListItem>
                    <ListItem title={_t.textAbout} link="#">
                        <Icon slot="media" icon="icon-about"></Icon>
                    </ListItem>
                </List>
            </Page>
        </View>
    )
});

class SettingsView extends Component {
    constructor(props) {
        super(props);

        this.onoptionclick = this.onoptionclick.bind(this);
    }

    onoptionclick(page){
        f7.views.current.router.navigate(page);
    }

    render() {
        const show_popover = this.props.usePopover;
        return (
            show_popover ?
                <Popover id="settings-popover" className="popover__titled" onPopoverClosed={() => this.props.onclosed()}>
                    <SettingsList inPopover={true} onOptionClick={this.onoptionclick} style={{height: '410px'}} />
                </Popover> :
                <Popup className="settings-popup" onPopupClosed={() => this.props.onclosed()}>
                    <SettingsList onOptionClick={this.onoptionclick} />
                </Popup>
        )
    }
}

const Settings = props => {
    useEffect(() => {
        if ( Device.phone )
            f7.popup.open('.settings-popup');
        else f7.popover.open('#settings-popover', '#btn-settings');

        return () => {
        }
    });


    const onviewclosed = () => {
        if ( props.onclosed )
            props.onclosed();
    };

    return <SettingsView usePopover={!Device.phone} onclosed={onviewclosed} />
};

export default Settings;