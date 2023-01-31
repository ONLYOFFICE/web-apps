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
import { MacrosSettings, Direction } from "./ApplicationSettings";
import About from '../../../../../common/mobile/lib/view/About';
import NavigationController from '../../controller/settings/Navigation';
import SharingSettings from "../../../../../common/mobile/lib/view/SharingSettings";

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
    },

    // Navigation

    {
        path: '/navigation/',
        component: NavigationController
    },

    // Direction 

    {
        path: '/direction/',
        component: Direction
    },

    // Sharing Settings

    {
        path: '/sharing-settings/',
        component: SharingSettings
    }
];


const SettingsList = inject("storeAppOptions", "storeReview")(observer(props => {
    const { t } = useTranslation();
    const _t = t('Settings', {returnObjects: true});
    const appOptions = props.storeAppOptions;
    const storeReview = props.storeReview;
    const displayMode = storeReview.displayMode;
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

    const onOpenCollaboration = () => {
        closeModal();
        props.openOptions('coauth');
    }

    const onOpenNavigation = () => {
        closeModal();
        props.openOptions('navigation');
    }

    // set mode
    const isViewer = appOptions.isViewer;
    const isMobileView = appOptions.isMobileView;

    let _isEdit = false,
        _canDownload = false,
        _canDownloadOrigin = false,
        _canAbout = true,
        _canHelp = true,
        _canPrint = false;
    if (appOptions.isDisconnected) {
        _isEdit = false;
        if (!appOptions.enableDownload)
            _canPrint = _canDownload = _canDownloadOrigin = false;
    } else {
        _isEdit = appOptions.isEdit;
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
                        <ListItem title={!_isEdit || isViewer ? _t.textFind : _t.textFindAndReplace} link='#' searchbarEnable='.searchbar' onClick={closeModal} className='no-indicator'>
                            <Icon slot="media" icon="icon-search"></Icon>
                        </ListItem>
                    }
                    <ListItem title={t('Settings.textNavigation')} link='#' onClick={() => {
                        if(Device.phone) {
                            onOpenNavigation();
                        } else {
                            onoptionclick.bind(this, "/navigation/")();
                        }}}>
                        <Icon slot="media" icon="icon-navigation"></Icon>
                    </ListItem>
                    {window.matchMedia("(max-width: 359px)").matches ?
                        <ListItem title={_t.textCollaboration} link="#" onClick={onOpenCollaboration} className='no-indicator'>
                            <Icon slot="media" icon="icon-collaboration"></Icon>
                        </ListItem> 
                    : null}
                    {Device.sailfish && _isEdit &&
                        <ListItem title={_t.textSpellcheck} onClick={() => {props.onOrthographyCheck()}} className='no-indicator' link="#">
                            <Icon slot="media" icon="icon-spellcheck"></Icon>
                        </ListItem>
                    }
                    {!isViewer && Device.phone &&
                        <ListItem title={t('Settings.textMobileView')}>
                            <Icon slot="media" icon="icon-mobile-view"></Icon>
                            <Toggle checked={isMobileView} onToggleChange={() => {
                                closeModal();
                                props.onChangeMobileView();
                                props.openOptions('snackbar');
                            }} />
                        </ListItem>
                    }
                    {(_isEdit && !isViewer) &&
                        <ListItem link="#" title={_t.textDocumentSettings} disabled={displayMode !== 'markup'} 
                            onClick={onoptionclick.bind(this, '/document-settings/')}>
                            <Icon slot="media" icon="icon-doc-setup"></Icon>
                        </ListItem>
                    }
                    <ListItem title={_t.textApplicationSettings} link="#"
                              onClick={onoptionclick.bind(this, "/application-settings/")}>
                        <Icon slot="media" icon="icon-app-settings"></Icon>
                    </ListItem>
                    {_canDownload &&
                        <ListItem title={_t.textDownload} link="#" onClick={onoptionclick.bind(this, "/download/")}>
                            <Icon slot="media" icon="icon-download"></Icon>
                        </ListItem>
                    }
                    {_canDownloadOrigin &&
                        <ListItem title={_t.textDownload} link="#" onClick={props.onDownloadOrigin} className='no-indicator'>
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
                        <ListItem title={_t.textHelp} link="#" className='no-indicator' onClick={props.showHelp}>
                            <Icon slot="media" icon="icon-help"></Icon>
                        </ListItem>
                    }
                    {_canAbout &&
                        <ListItem title={_t.textAbout} link="#" onClick={onoptionclick.bind(this, "/about/")}>
                            <Icon slot="media" icon="icon-about"></Icon>
                        </ListItem>
                    }
                    <ListItem title={t('Settings.textFeedback')} link="#" className='no-indicator' onClick={props.showFeedback}>
                            <Icon slot="media" icon="icon-feedback"></Icon>
                    </ListItem>
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
                <Popover id="settings-popover" closeByOutsideClick={false} className="popover__titled" onPopoverClosed={() => this.props.closeOptions('settings')}>
                    <SettingsList inPopover={true} onOptionClick={this.onoptionclick} closeOptions={this.props.closeOptions} openOptions={this.props.openOptions} style={{height: '410px'}} onChangeMobileView={this.props.onChangeMobileView} onPrint={this.props.onPrint} showHelp={this.props.showHelp} showFeedback={this.props.showFeedback} onOrthographyCheck={this.props.onOrthographyCheck} onDownloadOrigin={this.props.onDownloadOrigin}/>
                </Popover> :
                <Popup className="settings-popup" onPopupClosed={() => this.props.closeOptions('settings')}>
                    <SettingsList onOptionClick={this.onoptionclick} closeOptions={this.props.closeOptions} openOptions={this.props.openOptions} onChangeMobileView={this.props.onChangeMobileView} onPrint={this.props.onPrint} showHelp={this.props.showHelp} showFeedback={this.props.showFeedback} onOrthographyCheck={this.props.onOrthographyCheck} onDownloadOrigin={this.props.onDownloadOrigin}/>
                </Popup>
        )
    }
}

export default SettingsView;
