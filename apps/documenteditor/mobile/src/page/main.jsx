import React, { createContext, useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { f7, Icon, Page, View, Navbar, Subnavbar } from 'framework7-react';
import { observer, inject } from "mobx-react";
import { useTranslation } from 'react-i18next';
import AddOptions from '../view/add/Add';
import SettingsController from '../controller/settings/Settings';
import CollaborationView from '../../../../common/mobile/lib/view/collaboration/Collaboration.jsx'
import { Device } from '../../../../common/mobile/utils/device'
import { Search, SearchSettings } from '../controller/Search';
import ContextMenu from '../controller/ContextMenu';
import ToolbarController from "../controller/Toolbar";
import NavigationController from '../controller/settings/Navigation';
import { AddLinkController } from '../controller/add/AddLink';
import EditHyperlink from '../controller/edit/EditHyperlink';
import Snackbar from '../components/Snackbar/Snackbar';
import { Themes } from '../../../../common/mobile/lib/controller/Themes';
import EditView from '../view/edit/Edit';
import VersionHistoryController from '../../../../common/mobile/lib/controller/VersionHistory';

export const MainContext = createContext();

const MainPage = inject('storeDocumentInfo', 'users', 'storeAppOptions', 'storeVersionHistory', 'storeToolbarSettings', 'storeThemes')(observer(props => {
    const { t } = useTranslation();
    const [state, setState] = useState({
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
    });
    const appOptions = props.storeAppOptions;
    const storeThemes = props.storeThemes;
    const colorTheme = storeThemes.colorTheme;
    const storeVersionHistory = props.storeVersionHistory;
    const isVersionHistoryMode = storeVersionHistory.isVersionHistoryMode;
    const storeDocumentInfo = props.storeDocumentInfo;
    const dataDoc = storeDocumentInfo.dataDoc;
    const docExt = dataDoc?.fileType || '';
    const isAvailableExt = docExt && docExt !== 'djvu' && docExt !== 'pdf' && docExt !== 'xps';
    const storeToolbarSettings = props.storeToolbarSettings;
    const isDisconnected = props.users.isDisconnected;
    const isViewer = appOptions.isViewer;
    const isEdit = appOptions.isEdit;
    const isMobileView = appOptions.isMobileView;
    const disabledControls = storeToolbarSettings.disabledControls;
    const disabledSettings = storeToolbarSettings.disabledSettings;
    const isProtected = appOptions.isProtected;
    const typeProtection = appOptions.typeProtection;
    const isFabShow = isViewer && !disabledSettings && !disabledControls && !isDisconnected && isAvailableExt && isEdit && (!isProtected || typeProtection === Asc.c_oAscEDocProtect.TrackedChanges);
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

            if(logo.image || logo.imageDark) {
                customLogoImage = colorTheme.type === 'dark' ? logo.imageDark ?? logo.image : logo.image ?? logo.imageDark;
                customLogoUrl = logo.url;
            }
        } else {
            isHideLogo = false;
        }
    }

    const touchMoveHandler = (e) => {
        if (e.touches.length > 1 && !e.target.closest('#editor_sdk')) {
            e.preventDefault();
        }
    }

    const gesturePreventHandler = e => {
        e.preventDefault();
    }

    useEffect(() => {
        if ($$('.skl-container').length) {
            $$('.skl-container').remove();
        }

        document.addEventListener('touchmove', touchMoveHandler);

        if (Device.ios) {
            document.addEventListener('gesturestart', gesturePreventHandler);
            document.addEventListener('gesturechange', gesturePreventHandler);
            document.addEventListener('gestureend', gesturePreventHandler);
        }
       
        return () => {
            document.removeEventListener('touchmove', touchMoveHandler);

            if (Device.ios) {
                document.removeEventListener('gesturestart', gesturePreventHandler);
                document.removeEventListener('gesturechange', gesturePreventHandler);
                document.removeEventListener('gestureend', gesturePreventHandler);
            }
        }
    }, []);


    const handleClickToOpenOptions = (opts, showOpts) => {
        f7.popover.close('.document-menu.modal-in', false);

        setState(prevState => {
            if(opts === 'edit') {
                return {
                    ...prevState,
                    editOptionsVisible: true,
                    isOpenModal: true
                }
            } else if(opts === 'add') {
                return {
                    ...prevState,
                    addOptionsVisible: true,
                    addShowOptions: showOpts,
                    isOpenModal: true
                }
            } else if(opts === 'settings') {
                return {
                    ...prevState,
                    settingsVisible: true,
                    isOpenModal: true
                }
            } else if(opts === 'coauth') {
                return {
                    ...prevState,
                    collaborationVisible: true,
                    isOpenModal: true
                }
            } else if(opts === 'navigation') {
                return {
                    ...prevState,
                    navigationVisible: true
                }
            } else if(opts === 'add-link') {
                return {
                    ...prevState,
                    addLinkSettingsVisible: true
                }
            } else if(opts === 'edit-link') {
                return {
                    ...prevState,
                    editLinkSettingsVisible: true
                }
            } else if(opts === 'snackbar') {
                return {
                    ...prevState,
                    snackbarVisible: true
                }
            } else if(opts === 'fab') {
                return {
                    ...prevState,
                    fabVisible: true
                }
            } else if(opts === 'history') {
                return {
                    ...prevState,
                    historyVisible: true
                }
            }
        })
           
        if((opts === 'edit' || opts === 'coauth') && Device.phone) {
            f7.navbar.hide('.main-navbar');
        }
    };

    const handleOptionsViewClosed = opts => {
        setState(prevState => {
            if(opts === 'edit') {
                return {
                    ...prevState,
                    editOptionsVisible: false, 
                    isOpenModal: false
                };
            } else if(opts === 'add') {
                return {
                    ...prevState,
                    addOptionsVisible: false, 
                    addShowOptions: null, 
                    isOpenModal: false
                };
            } else if(opts === 'settings') {
                return {
                    ...prevState,
                    settingsVisible: false, 
                    isOpenModal: false
                };
            } else if(opts === 'coauth') {
                return {
                    ...prevState, 
                    collaborationVisible: false, 
                    isOpenModal: false
                };
            } else if(opts === 'navigation') {
                return {
                    ...prevState,
                    navigationVisible: false
                };
            } else if(opts === 'add-link') {
                return {
                    ...prevState,
                    addLinkSettingsVisible: false
                };
            } else if(opts === 'edit-link') {
                return {
                    ...prevState,
                    editLinkSettingsVisible: false
                };
            } else if(opts === 'snackbar') {
                return {
                    ...prevState, 
                    snackbarVisible: false
                }
            } else if(opts === 'fab') {
                return {
                    ...prevState, 
                    fabVisible: false
                }
            } else if(opts === 'history') {
                return {
                    ...prevState, 
                    historyVisible: false
                }
            }
        });

        if((opts === 'edit' || opts === 'coauth') && Device.phone) {
            f7.navbar.show('.main-navbar');
        }
    };

    const turnOffViewerMode = () => {
        const api = Common.EditorApi.get();

        f7.popover.close('.document-menu.modal-in', false);
        f7.navbar.show('.main-navbar', false);

        appOptions.changeViewerMode(false);
        api.asc_removeRestriction(Asc.c_oAscRestrictionType.View)
        api.asc_addRestriction(Asc.c_oAscRestrictionType.None);
    };

    return (
        <Themes fileType={docExt}>
            <MainContext.Provider value={{
                openOptions: handleClickToOpenOptions,
                closeOptions: handleOptionsViewClosed,
                showPanels: state.addShowOptions,
                isBranding,
                isViewer,
            }}>
                <Page name="home" className={`editor${!isHideLogo ? ' page-with-logo' : ''}`}>
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
                        {dataDoc &&
                            <Subnavbar>
                                <ToolbarController 
                                    openOptions={handleClickToOpenOptions} 
                                    closeOptions={handleOptionsViewClosed}
                                    isOpenModal={state.isOpenModal}
                                />
                                <Search useSuspense={false}/>
                            </Subnavbar>
                        }
                    </Navbar>
                    <View id="editor_sdk"></View>
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
                        </div> 
                    : null}
                    <Snackbar 
                        isShowSnackbar={state.snackbarVisible} 
                        closeCallback={() => handleOptionsViewClosed('snackbar')}
                        message={isMobileView ? t("Toolbar.textSwitchedMobileView") : t("Toolbar.textSwitchedStandardView")} 
                    />
                    <SearchSettings useSuspense={false} />
                    {!state.editOptionsVisible ? null : <EditView />}
                    {!state.addOptionsVisible ? null : <AddOptions />}
                    {!state.addLinkSettingsVisible ? null :
                        <AddLinkController 
                            closeOptions={handleOptionsViewClosed} 
                        />
                    }
                    {!state.editLinkSettingsVisible ? null :
                        <EditHyperlink 
                            closeOptions={handleOptionsViewClosed}
                        />
                    }
                    {!state.settingsVisible ? null : <SettingsController />}
                    {!state.collaborationVisible ? null : 
                        <CollaborationView 
                            closeOptions={handleOptionsViewClosed} 
                        />
                    }
                    {!state.navigationVisible ? null : <NavigationController />}
                    {!state.historyVisible ? null :
                        <VersionHistoryController onclosed={() => handleOptionsViewClosed('history')} />
                    }
                    {(isFabShow && !isVersionHistoryMode) &&
                        <CSSTransition
                            in={state.fabVisible}
                            timeout={500}
                            classNames="fab"
                            mountOnEnter
                            unmountOnExit
                        >
                            <div className="fab fab-right-bottom" onClick={() => turnOffViewerMode()}>
                                <a href="#">
                                    <i className="icon icon-edit-mode"></i>
                                </a>
                            </div>
                        </CSSTransition>
                    }
                    {appOptions.isDocReady && 
                        <ContextMenu openOptions={handleClickToOpenOptions} />
                    }
                </Page>
            </MainContext.Provider>
        </Themes>
    )
}));

export default MainPage;