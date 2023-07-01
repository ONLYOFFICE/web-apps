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
import ProtectionDocumentController from '../../controller/settings/DocumentProtection';
import ProtectionController from '../../controller/settings/Protection';
import FileEncryptionController from '../../controller/settings/FileEncryption';
import SettingsPage from './SettingsPage'

const routes = [
    {
        path: '/settingspage/',
        component: SettingsPage
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
    },

    // Protection
    {
        path: '/protection',
        component: ProtectionController
    },
    {
        path: '/protect',
        component: ProtectionDocumentController
    },

    // Encryption
    {
        path: '/encrypt',
        component: FileEncryptionController
    }
];

routes.forEach(route => {
    route.options = {
        ...route.options,
        transition: 'f7-push'
    };
});

class SettingsView extends Component {
    constructor(props) {
        super(props)

        this.onoptionclick = this.onoptionclick.bind(this);
    }

    onoptionclick(page){
        // f7.views.current.router.navigate(page);
    }

    render() {
        const show_popover = this.props.usePopover;

        return (
            show_popover ?
                <Popover id="settings-popover" closeByOutsideClick={false} className="popover__titled" onPopoverClosed={() => this.props.closeOptions('settings')}>
                    <View style={{height: '410px'}} url="/settingspage/" routes={routes}>
                        <SettingsPage inPopover={true}
                                      // onOptionClick={this.onoptionclick}
                                      closeOptions={this.props.closeOptions}
                                      openOptions={this.props.openOptions}
                                      onChangeMobileView={this.props.onChangeMobileView}
                                      onPrint={this.props.onPrint}
                                      showHelp={this.props.showHelp}
                                      showFeedback={this.props.showFeedback}
                                      onOrthographyCheck={this.props.onOrthographyCheck}
                                      onDownloadOrigin={this.props.onDownloadOrigin}
                                      changeTitleHandler={this.props.changeTitleHandler} />
                    </View>
                </Popover> :
                <Popup className="settings-popup" onPopupClosed={() => this.props.closeOptions('settings')}>
                    <View routes={routes} url="/settingspage/">
                        <SettingsPage
                                    // onOptionClick={this.onoptionclick}
                                      closeOptions={this.props.closeOptions}
                                      openOptions={this.props.openOptions}
                                      onChangeMobileView={this.props.onChangeMobileView}
                                      onPrint={this.props.onPrint}
                                      showHelp={this.props.showHelp}
                                      showFeedback={this.props.showFeedback}
                                      onOrthographyCheck={this.props.onOrthographyCheck}
                                      onDownloadOrigin={this.props.onDownloadOrigin}
                                      changeTitleHandler={this.props.changeTitleHandler} />
                    </View>
                </Popup>
        )
    }
}

export default SettingsView;
