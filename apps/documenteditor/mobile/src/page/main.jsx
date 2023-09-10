import React, { createContext, useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { f7, Icon, Page, View, Navbar, Subnavbar, Fab } from 'framework7-react';
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
import EditView from '../view/edit/Edit';
import VersionHistoryController from '../../../../common/mobile/lib/controller/VersionHistory';
import FormsToolbarController from '../controller/FormsToolbar';

export const MainContext = createContext();
export const FormsMainContext = createContext();

const MainPage = inject('storeVersionHistory', 'storeToolbarSettings')(observer(props => {
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
    const storeVersionHistory = props.storeVersionHistory;
    const isVersionHistoryMode = storeVersionHistory.isVersionHistoryMode;
    const storeDocumentInfo = props.storeDocumentInfo;
    const docExt = storeDocumentInfo.dataDoc ? storeDocumentInfo.dataDoc.fileType : '';
    const isAvailableExt = docExt && docExt !== 'djvu' && docExt !== 'pdf' && docExt !== 'xps' && docExt !== 'oform';
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
    const isShowPlaceholder = !appOptions.isDocReady && (!config.customization || !(config.customization.loaderName || config.customization.loaderLogo));

    let isHideLogo = true,
        isCustomization = true,
        isBranding = true;

    if(!appOptions.isDisconnected && config?.customization) {
        isCustomization = !!(config.customization && (config.customization.loaderName || config.customization.loaderLogo));
        isBranding = appOptions.canBranding || appOptions.canBrandingExt;

        if(!Object.keys(config).length) {
            isCustomization = !/&(?:logo)=/.test(window.location.search);
        }

        isHideLogo = isCustomization && isBranding; 
    }

    useEffect(() => {
        if($$('.skl-container').length) {
            $$('.skl-container').remove();
        }
    }, []);

    const handleClickToOpenOptions = (opts, showOpts) => {
        f7.popover.close('.document-menu.modal-in', false);

        let opened = false;
        const newState = {...state};

        if(opts === 'edit') {
            newState.editOptionsVisible && (opened = true);
            newState.editOptionsVisible = true;
            newState.isOpenModal = true;
        } else if(opts === 'add') {
            newState.addOptionsVisible && (opened = true);
            newState.addOptionsVisible = true;
            newState.addShowOptions = showOpts;
            newState.isOpenModal = true;
        } else if(opts === 'settings') {
            newState.settingsVisible && (opened = true);
            newState.settingsVisible = true;
            newState.isOpenModal = true;
        } else if(opts === 'coauth') {
            newState.collaborationVisible && (opened = true);
            newState.collaborationVisible = true;
            newState.isOpenModal = true;
        } else if(opts === 'navigation') {
            newState.navigationVisible && (opened = true);
            newState.navigationVisible = true;
        } else if(opts === 'add-link') {
            newState.addLinkSettingsVisible && (opened = true);
            newState.addLinkSettingsVisible = true;
        } else if(opts === 'edit-link') {
            newState.editLinkSettingsVisible && (opened = true);
            newState.editLinkSettingsVisible = true;
        } else if(opts === 'snackbar') {
            newState.snackbarVisible = true;
        } else if(opts === 'fab') {
            newState.fabVisible = true;
        } else if(opts === 'history') {
            newState.historyVisible = true;
        }

        if(!opened) {
            setState(newState);

            if((opts === 'edit' || opts === 'coauth') && Device.phone) {
                f7.navbar.hide('.main-navbar');
            }
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
        <MainContext.Provider value={{
            openOptions: handleClickToOpenOptions,
            closeOptions: handleOptionsViewClosed,
            showPanels: state.addShowOptions,
        }}>
            <Page name="home" className={`editor${!isHideLogo ? ' page-with-logo' : ''}`}>
                <Navbar id='editor-navbar' className={`main-navbar${!isHideLogo ? ' navbar-with-logo' : ''}`}>
                    {!isHideLogo &&
                        <div className="main-logo" onClick={() => {
                            window.open(`${__PUBLISHER_URL__}`, "_blank");
                        }}>
                            <Icon icon="icon-logo"></Icon>
                        </div>
                    }
                    <Subnavbar>
                        <ToolbarController 
                            openOptions={handleClickToOpenOptions} 
                            closeOptions={handleOptionsViewClosed}
                            isOpenModal={state.isOpenModal}
                        />
                        <Search useSuspense={false}/>
                    </Subnavbar>
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
    )
}));

const FormsMainPage = props => {
    const appOptions = props.storeAppOptions;
    const isMobileView = appOptions.isMobileView;
    const config = appOptions.config;
    const { t } = useTranslation();
    const [state, setState] = useState({
        settingsVisible: false,
        snackbarVisible: false,
        isOpenModal: false
    });
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

    const handleClickToOpenOptions = (opts, showOpts) => {
        f7.popover.close('.document-menu.modal-in', false);

        let opened = false;
        const newState = {...state};

        if(opts === 'settings') {
            newState.settingsVisible && (opened = true);
            newState.settingsVisible = true;
            newState.isOpenModal = true;
        } else if(opts === 'snackbar') {
            newState.snackbarVisible = true;
        }

        if(!opened) {
            setState(newState);

            if((opts === 'edit' || opts === 'coauth') && Device.phone) {
                f7.navbar.hide('.main-navbar');
            }
        }
    };

    const handleOptionsViewClosed = opts => {
        setState(prevState => {
            if(opts === 'settings') {
                return {
                    ...prevState,
                    settingsVisible: false, 
                    isOpenModal: false
                };
            } else if(opts === 'snackbar') {
                return {
                    ...prevState, 
                    snackbarVisible: false
                }
            }
        });

        if((opts === 'edit' || opts === 'coauth') && Device.phone) {
            f7.navbar.show('.main-navbar');
        }
    };

    return (
        <FormsMainContext.Provider value={{
            openOptions: handleClickToOpenOptions,
            closeOptions: handleOptionsViewClosed
        }}>
            <Page name="home" className={`editor${!isHideLogo ? ' page-with-logo' : ''}`}>
                <Navbar id='editor-navbar' className={`main-navbar${!isHideLogo ? ' navbar-with-logo' : ''}`}>
                    {!isHideLogo &&
                        <div className="main-logo" onClick={() => {
                            window.open(`${__PUBLISHER_URL__}`, "_blank");
                        }}>
                            <Icon icon="icon-logo"></Icon>
                        </div>
                    }
                    <Subnavbar>
                        <FormsToolbarController
                            openOptions={handleClickToOpenOptions} 
                            closeOptions={handleOptionsViewClosed}
                            isOpenModal={state.isOpenModal}
                        />
                        <Search useSuspense={false}/>
                    </Subnavbar>
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
                {!state.settingsVisible ? null : <SettingsController />}
                <SearchSettings useSuspense={false} />
                {appOptions.isDocReady && 
                    <ContextMenu openOptions={handleClickToOpenOptions} />
                }
            </Page>
        </FormsMainContext.Provider>
    )
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
  
    componentDidCatch(error, errorInfo) {
        console.error(error, errorInfo);
    }
  
    render() {
        if(this.state.hasError) {
            return <h1>Что-то пошло не так.</h1>;
        }
  
        return this.props.children; 
    }
}

const withConditionalRendering = (MainPage, FormsMainPage) => {
    return inject('storeDocumentInfo', 'users', 'storeAppOptions')(observer(props => {
        const [isForm, setIsForm] = useState(null);
        const storeDocumentInfo = props.storeDocumentInfo;
        const docExt = storeDocumentInfo.dataDoc ? storeDocumentInfo.dataDoc.fileType : '';

        useEffect(() => {
            setIsForm(docExt === 'oform');
        }, []);

        return ( 
            isForm ?
                <ErrorBoundary key="formsMainPage">
                    <FormsMainPage {...props} />
                </ErrorBoundary>
            :
                <ErrorBoundary key="mainPage">
                    <MainPage {...props} />
                </ErrorBoundary>
        )
    }));
};

const ConditionalMainPage = withConditionalRendering(MainPage, FormsMainPage);
export default ConditionalMainPage;