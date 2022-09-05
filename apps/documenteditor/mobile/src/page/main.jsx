
import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group';
import { f7, Link, Fab, Icon, FabButtons, FabButton, Page, View, Navbar, Subnavbar } from 'framework7-react';
import { observer, inject } from "mobx-react";
import { withTranslation } from 'react-i18next';
import EditOptions from '../view/edit/Edit';
import AddOptions from '../view/add/Add';
import Settings from '../controller/settings/Settings';
import Collaboration from '../../../../common/mobile/lib/view/collaboration/Collaboration.jsx'
import { Device } from '../../../../common/mobile/utils/device'
import { Search, SearchSettings } from '../controller/Search';
import ContextMenu from '../controller/ContextMenu';
import { Toolbar } from "../controller/Toolbar";
import NavigationController from '../controller/settings/Navigation';
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
            snackbarVisible: false
        };
    }

    handleClickToOpenOptions = (opts, showOpts) => {
        f7.popover.close('.document-menu.modal-in', false);

        setTimeout(() => {
            let opened = false;
            const newState = {};
            if ( opts === 'edit' ) {
                this.state.editOptionsVisible && (opened = true);
                newState.editOptionsVisible = true;
            } else if ( opts === 'add' ) {
                this.state.addOptionsVisible && (opened = true);
                newState.addOptionsVisible = true;
                newState.addShowOptions = showOpts;
            } else if ( opts === 'settings' ) {
                this.state.settingsVisible && (opened = true);
                newState.settingsVisible = true;
            } else if ( opts === 'coauth' ) {
                this.state.collaborationVisible && (opened = true);
                newState.collaborationVisible = true;
            } else if( opts === 'navigation') {
                this.state.navigationVisible && (opened = true);
                newState.navigationVisible = true;
            } else if( opts === 'snackbar') {
                this.state.snackbarVisible && (opened = true);
                newState.snackbarVisible = true;
            }

            for (let key in this.state) {
                if (this.state[key] && !opened) {
                    setTimeout(() => {
                        this.handleClickToOpenOptions(opts, showOpts);
                    }, 10);
                    return;
                }
            }

            if (!opened) {
                this.setState(newState);
                if ((opts === 'edit' || opts === 'coauth') && Device.phone) {
                    f7.navbar.hide('.main-navbar');
                }
            }
        }, 10);
    };

    handleOptionsViewClosed = opts => {
        setTimeout(() => {
            this.setState(state => {
                if ( opts == 'edit' )
                    return {editOptionsVisible: false};
                else if ( opts == 'add' )
                    return {addOptionsVisible: false, addShowOptions: null};
                else if ( opts == 'settings' )
                    return {settingsVisible: false};
                else if ( opts == 'coauth' )
                    return {collaborationVisible: false};
                else if( opts == 'navigation') 
                    return {navigationVisible: false}
                else if( opts == 'snackbar')
                    return {snackbarVisible: false}
            });
            if ((opts === 'edit' || opts === 'coauth') && Device.phone) {
                f7.navbar.show('.main-navbar');
            }
        }, 1);

    };

    turnOffViewerMode() {
        const api = Common.EditorApi.get();
        const appOptions = this.props.storeAppOptions;

        appOptions.changeViewerMode();
        api.asc_removeRestriction(Asc.c_oAscRestrictionType.View)
        api.asc_addRestriction(Asc.c_oAscRestrictionType.None);
    };

    render() {
        const { t } = this.props;
        const appOptions = this.props.storeAppOptions;
        const storeDocumentInfo = this.props.storeDocumentInfo;
        const docExt = storeDocumentInfo.dataDoc ? storeDocumentInfo.dataDoc.fileType : '';
        const isAvailableExt = docExt && docExt !== 'djvu' && docExt !== 'pdf' && docExt !== 'xps';
        const storeToolbarSettings = this.props.storeToolbarSettings;
        const isDisconnected = this.props.users.isDisconnected;
        const isViewer = appOptions.isViewer;
        const isEdit = appOptions.isEdit;
        const isMobileView = appOptions.isMobileView;
        const disabledControls = storeToolbarSettings.disabledControls;
        const disabledSettings = storeToolbarSettings.disabledSettings;
        const config = appOptions.config;

        let showLogo = !(appOptions.canBrandingExt && (config.customization && (config.customization.loaderName || config.customization.loaderLogo)));
        if (!Object.keys(config).length) {
            showLogo = !/&(?:logo)=/.test(window.location.search);
        }

        const showPlaceholder = !appOptions.isDocReady && (!config.customization || !(config.customization.loaderName || config.customization.loaderLogo));
        if ($$('.skl-container').length) {
            $$('.skl-container').remove();
        }

        return (
            <Page name="home" className={`editor${showLogo ? ' page-with-logo' : ''}`}>
                {/* Top Navbar */}
                <Navbar id='editor-navbar' className={`main-navbar${showLogo ? ' navbar-with-logo' : ''}`}>
                    {showLogo && appOptions.canBranding !== undefined && <div className="main-logo" onClick={() => {
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
                <SearchSettings useSuspense={false}/>
                {
                    !this.state.editOptionsVisible ? null :
                        <EditOptions onclosed={this.handleOptionsViewClosed.bind(this, 'edit')}/>
                }
                {
                    !this.state.addOptionsVisible ? null :
                        <AddOptions onclosed={this.handleOptionsViewClosed.bind(this, 'add')}
                                    showOptions={this.state.addShowOptions}/>
                }
                {/*onclosed={this.handleOptionsViewClosed.bind(this, 'settings')}*/}
                {
                    !this.state.settingsVisible ? null :
                        <Settings openOptions={this.handleClickToOpenOptions.bind(this)}
                                  closeOptions={this.handleOptionsViewClosed.bind(this)}/>
                }
                {
                    !this.state.collaborationVisible ? null :
                        <Collaboration onclosed={this.handleOptionsViewClosed.bind(this, 'coauth')}
                                       page={this.state.collaborationPage}/>
                }
                {
                    !this.state.navigationVisible ? null :
                        <NavigationController onclosed={this.handleOptionsViewClosed.bind(this, 'navigation')}/>
                }
                {
                    <CSSTransition
                        in={this.state.snackbarVisible}
                        timeout={500}
                        classNames="snackbar"
                        mountOnEnter
                        unmountOnExit
                    >
                        <Snackbar
                            text={isMobileView ? t("Toolbar.textSwitchedMobileView") : t("Toolbar.textSwitchedStandardView")}/>
                    </CSSTransition>
                }
                {isViewer && !disabledSettings && !disabledControls && !isDisconnected && isAvailableExt && isEdit &&
                    <Fab position="right-bottom" slot="fixed" onClick={() => this.turnOffViewerMode()}>
                        <Icon icon="icon-edit-mode"/>
                    </Fab>

                }
                {appOptions.isDocReady && <ContextMenu openOptions={this.handleClickToOpenOptions.bind(this)}/>}
            </Page>
        )
    }
}

export default withTranslation()(inject("storeAppOptions", "storeToolbarSettings", "users", "storeDocumentInfo")(observer(MainPage)));