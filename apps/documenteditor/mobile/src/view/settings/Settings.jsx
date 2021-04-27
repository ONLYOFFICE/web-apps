import React, {Component, useEffect} from 'react';
import {View, Page, Navbar, NavRight, Link, Popup, Popover, Icon,ListItem, List, Toggle} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {f7} from 'framework7-react';
import { observer, inject } from "mobx-react";
import {Device} from '../../../../../common/mobile/utils/device';

import DocumentSettingsController from "../../controller/settings/DocumentSettings";
import DocumentInfoController from "../../controller/settings/DocumentInfo";
import { DownloadController } from "../../controller/settings/Download";
import ApplicationSettingsController from "../../controller/settings/ApplicationSettings";
import { DocumentFormats, DocumentMargins, DocumentColorSchemes } from "./DocumentSettings";
import { MacrosSettings } from "./ApplicationSettings";
import About from '../../../../../common/mobile/lib/view/About';

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
    },
    {
        path: '/about/',
        component: About
    }
];


const SettingsList = inject("storeAppOptions")(observer(props => {
    const { t } = useTranslation();
    const _t = t('Settings', {returnObjects: true});
    const navbar = <Navbar title={_t.textSettings}>
                    {!props.inPopover  && <NavRight><Link popupClose=".settings-popup">{_t.textDone}</Link></NavRight>}
                    </Navbar>;

    const onoptionclick = page => {
        if ( props.onOptionClick )
            props.onOptionClick(page)
    };

    const closeModal = () => {
        if (Device.phone) {
            f7.sheet.close('.settings-popup', false);
        } else {
            f7.popover.close('#settings-popover', false);
        }
    };

    const onOpenCollaboration = async () => {
        await closeModal();
        await props.openOptions('coauth');
    }

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
                        <ListItem title={!_isEdit ? _t.textFind : _t.textFindAndReplace} link='#' searchbarEnable='.searchbar' onClick={closeModal} className='no-indicator'>
                            <Icon slot="media" icon="icon-search"></Icon>
                        </ListItem>
                    }
                    {window.matchMedia("(max-width: 389px)").matches ? 
                        <ListItem title={_t.textCollaboration} link="#" onClick={onOpenCollaboration}>
                            <Icon slot="media" icon="icon-collaboration"></Icon>
                        </ListItem> 
                    : null}
                    {_canReader &&
                        <ListItem title={_t.textReaderMode}> {/*ToDo*/}
                            <Icon slot="media" icon="icon-reader"></Icon>
                            <Toggle checked={appOptions.readerMode} onChange={() => {props.onReaderMode()}}/>
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
                        <ListItem title={_t.textPrint} onClick={props.onPrint} link='#' className='no-indicator'>
                            <Icon slot="media" icon="icon-print"></Icon>
                        </ListItem>
                    }
                    <ListItem title={_t.textDocumentInfo} link="#" onClick={onoptionclick.bind(this, "/document-info/")}>
                        <Icon slot="media" icon="icon-info"></Icon>
                    </ListItem>
                    {_canHelp &&
                        <ListItem title={_t.textHelp} link="#" onClick={props.showHelp}>
                            <Icon slot="media" icon="icon-help"></Icon>
                        </ListItem>
                    }
                    {_canAbout &&
                        <ListItem title={_t.textAbout} link="#" onClick={onoptionclick.bind(this, "/about/")}>
                            <Icon slot="media" icon="icon-about"></Icon>
                        </ListItem>
                    }
                </List>
            </Page>
        </View>
    )
}));

class SettingsView extends Component {
    constructor(props) {
        super(props)

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
                    <SettingsList inPopover={true} onOptionClick={this.onoptionclick} openOptions={this.props.openOptions} style={{height: '410px'}} onReaderMode={this.props.onReaderMode} onPrint={this.props.onPrint} showHelp={this.props.showHelp}/>
                </Popover> :
                <Popup className="settings-popup" onPopupClosed={() => this.props.onclosed()}>
                    <SettingsList onOptionClick={this.onoptionclick} openOptions={this.props.openOptions} onReaderMode={this.props.onReaderMode} onPrint={this.props.onPrint} showHelp={this.props.showHelp}/>
                </Popup>
        )
    }
}

export default SettingsView;
