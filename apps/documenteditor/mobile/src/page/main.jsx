
import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group';
import { f7, Link, Fab, Icon, FabButtons, FabButton, Page, View, Navbar, Subnavbar } from 'framework7-react';
import { observer, inject } from "mobx-react";
import { withTranslation } from 'react-i18next';
import EditOptions from '../view/edit/Edit';
import AddOptions from '../view/add/Add';
import Settings from '../controller/settings/Settings';
import { CollaborationDocument } from '../../../../common/mobile/lib/view/collaboration/Collaboration.jsx'
import { Device } from '../../../../common/mobile/utils/device'
import { Search, SearchSettings } from '../controller/Search';
import ContextMenu from '../controller/ContextMenu';
import { Toolbar } from "../controller/Toolbar";
import NavigationController from '../controller/settings/Navigation';
import { AddLinkController } from '../controller/add/AddLink';
import EditHyperlink from '../controller/edit/EditHyperlink';
import Snackbar from "../components/Snackbar/Snackbar";

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
            fabVisible: true
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
        } else if (opts === 'add') {
            this.state.addOptionsVisible && (opened = true);
            newState.addOptionsVisible = true;
            newState.addShowOptions = showOpts;
        } else if (opts === 'settings') {
            this.state.settingsVisible && (opened = true);
            newState.settingsVisible = true;
        } else if (opts === 'coauth') {
            this.state.collaborationVisible && (opened = true);
            newState.collaborationVisible = true;
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
            if (opts == 'edit')
                return {editOptionsVisible: false};
            else if (opts == 'add')
                return {addOptionsVisible: false, addShowOptions: null};
            else if (opts == 'settings')
                return {settingsVisible: false};
            else if (opts == 'coauth')
                return {collaborationVisible: false};
            else if (opts == 'navigation')
                return {navigationVisible: false};
            else if (opts === 'add-link') 
                return {addLinkSettingsVisible: false};
            else if (opts === 'edit-link') 
                return {editLinkSettingsVisible: false};
            else if (opts == 'snackbar')
                return {snackbarVisible: false}
            else if (opts == 'fab')
                return {fabVisible: false}
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

        appOptions.changeViewerMode();
        api.asc_removeRestriction(Asc.c_oAscRestrictionType.View)
        api.asc_addRestriction(Asc.c_oAscRestrictionType.None);
    };

    render() {
        const { t } = this.props;
        const appOptions = this.props.storeAppOptions;
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
        const isFabShow = isViewer && !disabledSettings && !disabledControls && !isDisconnected && isAvailableExt && isEdit && !isProtected;
        const config = appOptions.config;

        let showLogo = !(config.customization && (config.customization.loaderName || config.customization.loaderLogo));
        if (!Object.keys(config).length) {
            showLogo = !/&(?:logo)=/.test(window.location.search);
        }

        const showPlaceholder = !appOptions.isDocReady && (!config.customization || !(config.customization.loaderName || config.customization.loaderLogo));
        const isBranding = appOptions.canBranding || appOptions.canBrandingExt;
        

        return (
            <Page name="home" className={`editor${showLogo ? ' page-with-logo' : ''}`}>
                {/* Top Navbar */}
                <Navbar id='editor-navbar'
                        className={`main-navbar${(!isBranding && showLogo) ? ' navbar-with-logo' : ''}`}>
                    {(!isBranding && showLogo) &&
                        <div className="main-logo" onClick={() => {
                            window.open(`${__PUBLISHER_URL__}`, "_blank");
                        }}><Icon icon="icon-logo"></Icon></div>}
                    <Subnavbar>
                        <Toolbar openOptions={this.handleClickToOpenOptions}
                                closeOptions={this.handleOptionsViewClosed}/>
                        <Search useSuspense={false}/>
                    </Subnavbar>
                </Navbar>

                {/* Page content */}

                <View id="editor_sdk">
                </View>

                {showPlaceholder ?
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
                <CSSTransition
                    in={this.state.snackbarVisible}
                    timeout={1500}
                    classNames="snackbar"
                    mountOnEnter
                    unmountOnExit
                    onEntered={(node, isAppearing) => {
                        if(!isAppearing) {
                            this.setState({
                                snackbarVisible: false
                            });
                        }
                    }}
                >
                    <Snackbar
                        text={isMobileView ? t("Toolbar.textSwitchedMobileView") : t("Toolbar.textSwitchedStandardView")}/>
                </CSSTransition>
                <SearchSettings useSuspense={false}/>
                {
                    !this.state.editOptionsVisible ? null :
                        <EditOptions onclosed={this.handleOptionsViewClosed.bind(this, 'edit')}/>
                }
                {
                    !this.state.addOptionsVisible ? null :
                        <AddOptions onCloseLinkSettings={this.handleOptionsViewClosed.bind(this)} onclosed={this.handleOptionsViewClosed.bind(this, 'add')} showOptions={this.state.addShowOptions} />
                }
                {
                    !this.state.addLinkSettingsVisible ? null :
                        <AddLinkController onClosed={this.handleOptionsViewClosed.bind(this)} />
                }
                {
                    !this.state.editLinkSettingsVisible ? null :
                        <EditHyperlink onClosed={this.handleOptionsViewClosed.bind(this)} />
                }
                {
                    !this.state.settingsVisible ? null :
                        <Settings openOptions={this.handleClickToOpenOptions.bind(this)}
                                  closeOptions={this.handleOptionsViewClosed.bind(this)}/>
                }
                {
                    !this.state.collaborationVisible ? null :
                        <CollaborationDocument onclosed={this.handleOptionsViewClosed.bind(this, 'coauth')} page={this.state.collaborationPage} />
                }
                {
                    !this.state.navigationVisible ? null :
                        <NavigationController onclosed={this.handleOptionsViewClosed.bind(this, 'navigation')}/>
                }
                {isFabShow &&
                    <CSSTransition
                        in={this.state.fabVisible}
                        timeout={500}
                        classNames="fab"
                        mountOnEnter
                        unmountOnExit
                    >
                        <Fab position="right-bottom" slot="fixed" onClick={() => this.turnOffViewerMode()}>
                            <Icon icon="icon-edit-mode"/>
                        </Fab>
                    </CSSTransition>
                }
                {appOptions.isDocReady && <ContextMenu openOptions={this.handleClickToOpenOptions.bind(this)}/>}
            </Page>
        )
    }
}

export default withTranslation()(inject("storeAppOptions", "storeToolbarSettings", "users", "storeDocumentInfo")(observer(MainPage)));