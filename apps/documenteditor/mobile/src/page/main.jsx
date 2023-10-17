import React, { Component, createContext } from 'react';
import { CSSTransition } from 'react-transition-group';
import { f7, Icon, Page, View, Navbar, Subnavbar, Fab } from 'framework7-react';
import { observer, inject } from "mobx-react";
import { withTranslation } from 'react-i18next';
import AddOptions from '../view/add/Add';
import SettingsController from '../controller/settings/Settings';
import CollaborationView from '../../../../common/mobile/lib/view/collaboration/Collaboration.jsx'
import { Device } from '../../../../common/mobile/utils/device'
import { Search, SearchSettings } from '../controller/Search';
import ContextMenu from '../controller/ContextMenu';
import { Toolbar } from "../controller/Toolbar";
import NavigationController from '../controller/settings/Navigation';
import { AddLinkController } from '../controller/add/AddLink';
import EditHyperlink from '../controller/edit/EditHyperlink';
import Snackbar from '../components/Snackbar/Snackbar';
import EditView from '../view/edit/Edit';
import VersionHistoryController from '../../../../common/mobile/lib/controller/VersionHistory';

export const MainContext = createContext();

class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editOptionsVisible: false,
            addOptionsVisible: false,
            addShowOptions: null,
            settingsVisible: false,
            collaborationVisible: false,
            navigationVisible: false,
            addLinkSettingsVisible: false,
            editLinkSettingsVisible: false,
            snackbarVisible: false,
            fabVisible: true,
            isOpenModal: false
        };
    }

    componentDidMount() {
        if ( $$('.skl-container').length ) {
            $$('.skl-container').remove();
        }
    }

    handleClickToOpenOptions = (opts, showOpts) => {
        f7.popover.close('.document-menu.modal-in', false);
    
        let opened = false;
        const newState = {};

        if (opts === 'edit') {
            this.state.editOptionsVisible && (opened = true);
            newState.editOptionsVisible = true;
            newState.isOpenModal = true;
        } else if (opts === 'add') {
            this.state.addOptionsVisible && (opened = true);
            newState.addOptionsVisible = true;
            newState.addShowOptions = showOpts;
            newState.isOpenModal = true;
        } else if (opts === 'settings') {
            this.state.settingsVisible && (opened = true);
            newState.settingsVisible = true;
            newState.isOpenModal = true;
        } else if (opts === 'coauth') {
            this.state.collaborationVisible && (opened = true);
            newState.collaborationVisible = true;
            newState.isOpenModal = true;
        } else if (opts === 'navigation') {
            this.state.navigationVisible && (opened = true);
            newState.navigationVisible = true;
        } else if (opts === 'add-link') {
            this.state.addLinkSettingsVisible && (opened = true);
            newState.addLinkSettingsVisible = true;
        } else if (opts === 'edit-link') {
            this.state.editLinkSettingsVisible && (opened = true);
            newState.editLinkSettingsVisible = true;
        } else if (opts === 'snackbar') {
            newState.snackbarVisible = true;
        } else if (opts === 'fab') {
            newState.fabVisible = true;
        } else if (opts === 'history') {
            newState.historyVisible = true;
        }

        if (!opened) {
            this.setState(newState);
            if ((opts === 'edit' || opts === 'coauth') && Device.phone) {
                f7.navbar.hide('.main-navbar');
            }
        }
    };

    handleOptionsViewClosed = opts => {
        this.setState(state => {
            if (opts === 'edit')
                return {editOptionsVisible: false, isOpenModal: false};
            else if (opts === 'add')
                return {addOptionsVisible: false, addShowOptions: null, isOpenModal: false};
            else if (opts === 'settings')
                return {settingsVisible: false, isOpenModal: false};
            else if (opts === 'coauth')
                return {collaborationVisible: false, isOpenModal: false};
            else if (opts === 'navigation')
                return {navigationVisible: false};
            else if (opts === 'add-link') 
                return {addLinkSettingsVisible: false};
            else if (opts === 'edit-link') 
                return {editLinkSettingsVisible: false};
            else if (opts === 'snackbar')
                return {snackbarVisible: false}
            else if (opts === 'fab')
                return {fabVisible: false}
            else if (opts === 'history')
                return {historyVisible: false}
        });

        if ((opts === 'edit' || opts === 'coauth') && Device.phone) {
            f7.navbar.show('.main-navbar');
        }
    };

    turnOffViewerMode() {
        const api = Common.EditorApi.get();
        const appOptions = this.props.storeAppOptions;

        f7.popover.close('.document-menu.modal-in', false);
        f7.navbar.show('.main-navbar', false);

        appOptions.changeViewerMode(false);
        api.asc_removeRestriction(Asc.c_oAscRestrictionType.View)
        api.asc_addRestriction(Asc.c_oAscRestrictionType.None);
    };

    render() {
        const { t } = this.props;
        const appOptions = this.props.storeAppOptions;
        const storeVersionHistory = this.props.storeVersionHistory;
        const isVersionHistoryMode = storeVersionHistory.isVersionHistoryMode;
        const storeDocumentInfo = this.props.storeDocumentInfo;
        const docExt = storeDocumentInfo.dataDoc ? storeDocumentInfo.dataDoc.fileType : '';
        const isAvailableExt = docExt && docExt !== 'djvu' && docExt !== 'pdf' && docExt !== 'xps' && docExt !== 'oform';
        const storeToolbarSettings = this.props.storeToolbarSettings;
        const isDisconnected = this.props.users.isDisconnected;
        const isViewer = appOptions.isViewer;
        const isEdit = appOptions.isEdit;
        const isMobileView = appOptions.isMobileView;
        const disabledControls = storeToolbarSettings.disabledControls;
        const disabledSettings = storeToolbarSettings.disabledSettings;
        const isProtected = appOptions.isProtected;
        const typeProtection = appOptions.typeProtection;
        const isFabShow = isViewer && !disabledSettings && !disabledControls && !isDisconnected && isAvailableExt && isEdit && (!isProtected || typeProtection === Asc.c_oAscEDocProtect.TrackedChanges);
        const config = appOptions.config;
        const isShowPlaceholder = !appOptions.isDocReady && (!config.customization || !(config.customization.loaderName || config.customization.loaderLogo));

        let isHideLogo = true,
            isCustomization = true,
            isBranding = true;

        if (!appOptions.isDisconnected && config?.customization) {
            isCustomization = !!(config.customization && (config.customization.loaderName || config.customization.loaderLogo));
            isBranding = appOptions.canBranding || appOptions.canBrandingExt;

            if (!Object.keys(config).length) {
                isCustomization = !/&(?:logo)=/.test(window.location.search);
            }

            isHideLogo = isCustomization && isBranding; 
        }
        
        return (
            <MainContext.Provider value={{
                openOptions: this.handleClickToOpenOptions.bind(this),
                closeOptions: this.handleOptionsViewClosed.bind(this),
                showPanels: this.state.addShowOptions,
                // isOpenModal: this.state.isOpenModal
            }}>
                <Page name="home" className={`editor${!isHideLogo ? ' page-with-logo' : ''}`}>
                    {/* Top Navbar */}
                    <Navbar id='editor-navbar' className={`main-navbar${!isHideLogo ? ' navbar-with-logo' : ''}`}>
                        {!isHideLogo &&
                            <div className="main-logo" onClick={() => {
                                window.open(`${__PUBLISHER_URL__}`, "_blank");
                            }}>
                                <Icon icon="icon-logo"></Icon>
                            </div>
                        }
                        <Subnavbar>
                            <Toolbar 
                                openOptions={this.handleClickToOpenOptions} 
                                closeOptions={this.handleOptionsViewClosed}
                                isOpenModal={this.state.isOpenModal}
                            />
                            <Search useSuspense={false}/>
                        </Subnavbar>
                    </Navbar>

                    {/* Page content */}

                    <View id="editor_sdk">
                    </View>

                    {isShowPlaceholder ?
                        <div className="doc-placeholder-container">
                            <div className="doc-placeholder">
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                            </div>
                        </div> : null
                    }

                    {/* {
                        Device.phone ? null : <SearchSettings />
                    } */}

                    <Snackbar 
                        isShowSnackbar={this.state.snackbarVisible} 
                        closeCallback={() => this.handleOptionsViewClosed('snackbar')}
                        message={isMobileView ? t("Toolbar.textSwitchedMobileView") : t("Toolbar.textSwitchedStandardView")} 
                    />
                    <SearchSettings useSuspense={false} />
                    {!this.state.editOptionsVisible ? null : <EditView />}
                    {!this.state.addOptionsVisible ? null : <AddOptions />}
                    {!this.state.addLinkSettingsVisible ? null :
                        <AddLinkController 
                            closeOptions={this.handleOptionsViewClosed.bind(this)} 
                        />
                    }
                    {!this.state.editLinkSettingsVisible ? null :
                        <EditHyperlink 
                            closeOptions={this.handleOptionsViewClosed.bind(this)}
                        />
                    }
                    {!this.state.settingsVisible ? null : <SettingsController />}
                    {!this.state.collaborationVisible ? null : 
                        <CollaborationView 
                            closeOptions={this.handleOptionsViewClosed.bind(this)} 
                        />
                    }
                    {!this.state.navigationVisible ? null : <NavigationController />}
                    {!this.state.historyVisible ? null :
                        <VersionHistoryController onclosed={this.handleOptionsViewClosed.bind(this, 'history')} />
                    }
                    {(isFabShow && !isVersionHistoryMode) &&
                        <CSSTransition
                            in={this.state.fabVisible}
                            timeout={500}
                            classNames="fab"
                            mountOnEnter
                            unmountOnExit
                        >
                            <div className="fab fab-right-bottom" onClick={() => this.turnOffViewerMode()}>
                                <a href="#"><i className="icon icon-edit-mode"></i></a>
                            </div>
                        </CSSTransition>
                    }
                    {appOptions.isDocReady && 
                        <ContextMenu openOptions={this.handleClickToOpenOptions.bind(this)} />
                    }
                </Page>
            </MainContext.Provider>
        )
    }
}

export default withTranslation()(inject("storeAppOptions", "storeToolbarSettings", "users", "storeDocumentInfo", "storeVersionHistory")(observer(MainPage)));