import React, {Component, useEffect} from 'react';
import {View,Page,Navbar,NavRight,Link,Popup,Popover,Icon,ListItem,List} from 'framework7-react';
import { withTranslation } from 'react-i18next';
import {f7} from 'framework7-react';
import { observer, inject } from "mobx-react";
import {Device} from '../../../../../common/mobile/utils/device';

import DocumentSettingsController from "../../controller/settings/DocumentSettings";
import DocumentInfoController from "../../controller/settings/DocumentInfo";
import { DownloadController } from "../../controller/settings/Download";
import ApplicationSettingsController from "../../controller/settings/ApplicationSettings";
import { DocumentFormats, DocumentMargins, DocumentColorSchemes } from "./DocumentSettings";
import { MacrosSettings } from "./ApplicationSettings";

const routes = [
    {
        path: '/',
        component: 'TSettingsView'
    },
    {
        path: '/document-settings/',
        component: DocumentSettingsController,
    },
    {
        path: '/margins/',
        component: DocumentMargins,
    },
    {
        path: '/document-formats/',
        component: DocumentFormats,
    },
    {
        path: "/document-info/",
        component: DocumentInfoController,
    },
    {
        path: '/application-settings/',
        component: ApplicationSettingsController
    },
    {
        path: '/macros-settings/',
        component: MacrosSettings
    },
    {
        path: '/download/',
        component: DownloadController
    },
    {
        path: '/color-schemes/',
        component: DocumentColorSchemes
    }
];


const SettingsList = inject("storeAppOptions")( observer( withTranslation()( props => {
    const {t} = props;
    const _t = t('Settings', {returnObjects: true});
    const navbar = <Navbar title={_t.textSettings}>
                    {!props.inPopover  && <NavRight><Link popupClose=".settings-popup">{_t.textDone}</Link></NavRight>}
                    </Navbar>;

    const onoptionclick = page => {
        if ( props.onOptionClick )
            props.onOptionClick(page)
    };

    useEffect(() => {
    });

    // set mode
    const appOptions = props.storeAppOptions;
    let _isEdit = false,
        _canDownload = false,
        _canDownloadOrigin = false,
        _canReader = false,
        _canAbout = true,
        _canHelp = true,
        _canPrint = false;
    if (appOptions.isDisconnected) {
        _isEdit = false;
        if (!appOptions.enableDownload)
            _canPrint = _canDownload = _canDownloadOrigin = false;
    } else {
        _isEdit = appOptions.isEdit;
        _canReader = !appOptions.isEdit && !appOptions.isRestrictedEdit && appOptions.canReader;
        _canDownload = appOptions.canDownload;
        _canDownloadOrigin = appOptions.canDownloadOrigin;
        _canPrint = appOptions.canPrint;
        if (appOptions.customization && appOptions.canBrandingExt) {
            _canAbout = (appOptions.customization.about!==false);
        }
        if (appOptions.customization) {
            _canHelp = (appOptions.customization.help!==false);
        }
    }

    return (
        <View style={props.style} stackPages={true} routes={routes}>
            <Page>
                {navbar}
                <List>
                    {!props.inPopover &&
                        <ListItem title={!_isEdit ? _t.textFind : _t.textFindAndReplace}>
                            <Icon slot="media" icon="icon-search"></Icon>
                        </ListItem>
                    }
                    {_canReader &&
                        <ListItem title={_t.textReaderMode}> {/*ToDo*/}
                            <Icon slot="media" icon="icon-reader"></Icon>
                            <Toggle checked={false} onToggleChange={() => {}}/>
                        </ListItem>
                    }
                    {/*ToDo: settings-orthography*/}
                    {_isEdit &&
                        <ListItem link="#" title={_t.textDocumentSettings} onClick={onoptionclick.bind(this, '/document-settings/')}>
                            <Icon slot="media" icon="icon-doc-setup"></Icon>
                        </ListItem>
                    }
                    <ListItem title={_t.textApplicationSettings} link="#" onClick={onoptionclick.bind(this, "/application-settings/")}>
                        <Icon slot="media" icon="icon-app-settings"></Icon>
                    </ListItem>
                    {_canDownload &&
                        <ListItem title={_t.textDownload} link="#" onClick={onoptionclick.bind(this, "/download/")}>
                            <Icon slot="media" icon="icon-download"></Icon>
                        </ListItem>
                    }
                    {_canDownloadOrigin &&
                    <ListItem title={_t.textDownload} link="#" onClick={() => {}}> {/*ToDo*/}
                        <Icon slot="media" icon="icon-download"></Icon>
                    </ListItem>
                    }
                    {_canPrint &&
                        <ListItem title={_t.textPrint}>
                            <Icon slot="media" icon="icon-print"></Icon>
                        </ListItem>
                    }
                    <ListItem title={_t.textDocumentInfo} link="#" onClick={onoptionclick.bind(this, "/document-info/")}>
                        <Icon slot="media" icon="icon-info"></Icon>
                    </ListItem>
                    {_canHelp &&
                        <ListItem title={_t.textHelp} link="#">
                            <Icon slot="media" icon="icon-help"></Icon>
                        </ListItem>
                    }
                    {_canAbout &&
                        <ListItem title={_t.textAbout} link="#">
                            <Icon slot="media" icon="icon-about"></Icon>
                        </ListItem>
                    }
                </List>
            </Page>
        </View>
    )
})));

class SettingsView extends Component {
    constructor(props) {
        super(props)

        this.onoptionclick = this.onoptionclick.bind(this);
    }

    onoptionclick(page){
        this.$f7.views.current.router.navigate(page);
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
            // component will unmount
        }
    });


    const onviewclosed = () => {
        if ( props.onclosed )
            props.onclosed();
    };

    // if ( Device.phone ) {
    //     return <SettingsPopup onclosed={onviewclosed} />
    // }

    return <SettingsView usePopover={!Device.phone} onclosed={onviewclosed} />
};

export default Settings;
