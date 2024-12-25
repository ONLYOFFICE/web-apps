import React, { Component, createContext } from 'react';
import { f7, Page, View, Navbar, Subnavbar, Icon } from 'framework7-react';
import { observer, inject } from "mobx-react";
import { Device } from '../../../../common/mobile/utils/device';
import CollaborationView from '../../../../common/mobile/lib/view/collaboration/Collaboration.jsx';
import ContextMenu from '../controller/ContextMenu';
import { Toolbar } from "../controller/Toolbar";
import { Themes } from '../../../../common/mobile/lib/controller/Themes';
import SettingsController from '../controller/settings/Settings';

export const MainContext = createContext();

class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            settingsVisible: false,
            collaborationVisible: false,
            isOpenModal: false
        };
    }

    onClosePreview = () => {
        this.setState({previewVisible: false});
    }

    handleClickToOpenOptions = (opts, showOpts) => {
        f7.popover.close('.document-menu.modal-in', false);

        let opened = false;
        const newState = {};

        if ( opts === 'settings' ) {
            this.state.settingsVisible && (opened = true);
            newState.settingsVisible = true;
            newState.isOpenModal = true;
        } else if ( opts === 'coauth' ) {
            this.state.collaborationVisible && (opened = true);
            newState.collaborationVisible = true;
            newState.isOpenModal = true;
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
    };

    handleOptionsViewClosed = opts => {
        this.setState(state => {
            if ( opts == 'settings' )
                return {settingsVisible: false, isOpenModal: false};
            else if ( opts == 'coauth' )
                return {collaborationVisible: false, isOpenModal: false}
        });

        if ((opts === 'edit' || opts === 'coauth') && Device.phone) {
            f7.navbar.show('.main-navbar');
        }
    };

    touchMoveHandler (e) {
        if (e.touches.length > 1 && !e.target.closest('#editor_sdk')) {
            e.preventDefault();
        }
    }

    gesturePreventHandler (e) {
        e.preventDefault();
    }

    componentDidMount () {
        document.addEventListener('touchmove', this.touchMoveHandler);

        if (Device.ios) {
            document.addEventListener('gesturestart', this.gesturePreventHandler);
            document.addEventListener('gesturechange', this.gesturePreventHandler);
            document.addEventListener('gestureend', this.gesturePreventHandler);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('touchmove', this.touchMoveHandler);

        if (Device.ios) {
            document.removeEventListener('gesturestart', this.gesturePreventHandler);
            document.removeEventListener('gesturechange', this.gesturePreventHandler);
            document.removeEventListener('gestureend', this.gesturePreventHandler);
        }
    }

    render() {
        const appOptions = this.props.storeAppOptions;
        const storeThemes = this.props.storeThemes;
        const colorTheme = storeThemes.colorTheme;
        const config = appOptions.config;
        const { customization = {} } = config;
        const isShowPlaceholder = !appOptions.isDocReady && (!customization || !(customization.loaderName || customization.loaderLogo));
       
        let isBranding = true,
            isHideLogo = true,
            customLogoImage = '',
            customLogoUrl = '';

        if(!appOptions.isDisconnected && appOptions.isDocReady) {
            const { logo } = customization;
            isBranding = appOptions.canBranding || appOptions.canBrandingExt;
            
            if(logo && isBranding) {
                isHideLogo = logo.visible === false;

                if(logo.image || logo.imageDark || logo.imageLight) {
                    customLogoImage = colorTheme.type === 'dark' ? logo.imageDark ?? logo.image ?? logo.imageLight : logo.imageLight ?? logo.image ?? logo.imageDark;
                    customLogoUrl = logo.url;
                }
            } else {
                isHideLogo = false;
            }
        }

        return (
            <Themes>
                <MainContext.Provider value={{
                    openOptions: this.handleClickToOpenOptions.bind(this),
                    closeOptions: this.handleOptionsViewClosed.bind(this),
                    showPanels: this.state.addShowOptions,
                    isBranding
                }}>
                    {!this.state.previewVisible ? null : 
                        <Preview closeOptions={this.handleOptionsViewClosed.bind(this)} />
                    }
                    <Page name="home" className={`editor${!isHideLogo ? ' page-with-logo' : ''}`}>
                        {/* Top Navbar */}
                        <Navbar id='editor-navbar' className={`main-navbar${!isHideLogo ? ' navbar-with-logo' : ''}`}>
                            {!isHideLogo &&
                                <div className="main-logo" onClick={() => {
                                    window.open(`${customLogoImage && customLogoUrl ? customLogoUrl : __PUBLISHER_URL__}`, "_blank");
                                }}>
                                    {customLogoImage ? 
                                        <img className='custom-logo-image' src={customLogoImage} />
                                    : 
                                        <Icon icon="icon-logo"></Icon>
                                    }
                                </div>
                            }
                            <Subnavbar>
                                <Toolbar 
                                    openOptions={this.handleClickToOpenOptions}
                                    closeOptions={this.handleOptionsViewClosed}
                                    isOpenModal={this.state.isOpenModal}
                                />
                            </Subnavbar>
                        </Navbar>
                        {/* Page content */}
                        <View id="editor_sdk" />

                        {isShowPlaceholder ?
                            <div className="doc-placeholder">
                                <div className="slide-h">
                                    <div className="slide-v">
                                        <div className="slide-container">
                                        </div>
                                    </div>
                                </div>
                            </div> :
                            null
                        }

                        {!this.state.settingsVisible ? null : <SettingsController />}
                        {!this.state.collaborationVisible ? null : 
                            <CollaborationView 
                                closeOptions={this.handleOptionsViewClosed.bind(this)} 
                            />
                        }
                        {appOptions.isDocReady &&
                            <ContextMenu 
                                openOptions={this.handleClickToOpenOptions.bind(this)} 
                            />
                        }   
                    </Page>
                </MainContext.Provider>
            </Themes>
        )
    }
}

export default inject('storeAppOptions', 'storeThemes')(observer(MainPage));