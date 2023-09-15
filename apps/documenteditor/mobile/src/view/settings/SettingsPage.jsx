import React, { useContext } from 'react';
import { Page, Navbar, NavRight, Link, Icon, ListItem, List, Toggle } from 'framework7-react';
import { Device } from "../../../../../common/mobile/utils/device";
import { observer, inject } from "mobx-react";
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../../controller/settings/Settings';
import { MainContext } from '../../page/main';

const SettingsPage = inject("storeAppOptions", "storeReview", "storeDocumentInfo")(observer(props => {
    const { t } = useTranslation();
    const _t = t('Settings', {returnObjects: true});
    const settingsContext = useContext(SettingsContext);
    const mainContext = useContext(MainContext);
    const appOptions = props.storeAppOptions;
    const canProtect = appOptions.canProtect;
    const storeReview = props.storeReview;
    const displayMode = storeReview.displayMode;
    const docInfo = props.storeDocumentInfo;
    const docTitle = docInfo.dataDoc.title;
    const docExt = docInfo.dataDoc ? docInfo.dataDoc.fileType : '';
    const isNotForm = docExt && docExt !== 'oform';
    const isHistoryDisabled = docExt && (docExt === 'xps' || docExt === 'djvu' || docExt === 'pdf');
    const navbar =
        <Navbar>
            <div className="title" onClick={settingsContext.changeTitleHandler}>{docTitle}</div>
            {Device.phone && <NavRight><Link popupClose=".settings-popup">{_t.textDone}</Link></NavRight>}
        </Navbar>;

    const onOpenOptions = name => {
        settingsContext.closeModal();
        mainContext.openOptions(name);
    }

    // set mode
    const isViewer = appOptions.isViewer;
    const isMobileView = appOptions.isMobileView;
  
    let _isEdit = false,
        _canDownload = false,
        _canDownloadOrigin = false,
        _canAbout = true,
        _canHelp = true,
        _canPrint = false,
        _canFeedback = true;

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
            _canAbout = appOptions.customization.about !== false;
        }

        if (appOptions.customization) {
            _canHelp = appOptions.customization.help !== false;
            _canFeedback = appOptions.customization.feedback !== false;
        }
    }

    return (
        <Page>
            {navbar}
            <List>
                {Device.phone &&
                    <ListItem title={!_isEdit || isViewer ? _t.textFind : _t.textFindAndReplace} link='#' searchbarEnable='.searchbar' onClick={settingsContext.closeModal} className='no-indicator'>
                        <Icon slot="media" icon="icon-search"></Icon>
                    </ListItem>
                }
                {(_isEdit && canProtect) &&
                    <ListItem title={t('Settings.textProtection')} link="/protection">
                        <Icon slot="media" icon="icon-protection" />
                    </ListItem>
                }
                {!isHistoryDisabled &&
                    <ListItem title={t('Settings.textVersionHistory')} link={!Device.phone ? "/version-history" : ""} onClick={() => {
                        if(Device.phone) {
                            onOpenOptions('history');
                        }
                    }}>
                        <Icon slot="media" icon="icon-version-history"></Icon>
                    </ListItem>
                }
                <ListItem title={t('Settings.textNavigation')} link={!Device.phone ? '/navigation' : '#'} onClick={() => {
                    if(Device.phone) {
                        onOpenOptions('navigation');
                    } 
                }}>
                    <Icon slot="media" icon="icon-navigation"></Icon>
                </ListItem>
                {window.matchMedia("(max-width: 359px)").matches ?
                    <ListItem title={_t.textCollaboration} link="#" onClick={() => {
                        onOpenOptions('coauth');
                    }} className='no-indicator'>
                        <Icon slot="media" icon="icon-collaboration"></Icon>
                    </ListItem>
                    : null}
                {Device.sailfish && _isEdit &&
                    <ListItem title={_t.textSpellcheck} onClick={() => {settingsContext.onOrthographyCheck()}} className='no-indicator' link="#">
                        <Icon slot="media" icon="icon-spellcheck"></Icon>
                    </ListItem>
                }
                {!isViewer && Device.phone &&
                    <ListItem title={t('Settings.textMobileView')}>
                        <Icon slot="media" icon="icon-mobile-view"></Icon>
                        <Toggle checked={isMobileView} onToggleChange={() => {
                            settingsContext.onChangeMobileView();
                            onOpenOptions('snackbar');
                        }} />
                    </ListItem>
                }
                {(_isEdit && !isViewer) &&
                    <ListItem title={_t.textDocumentSettings} disabled={displayMode !== 'markup'} link='/document-settings/'>
                        <Icon slot="media" icon="icon-doc-setup"></Icon>
                    </ListItem>
                }
                {isNotForm &&
                    <ListItem title={_t.textApplicationSettings} link="/application-settings/">
                        <Icon slot="media" icon="icon-app-settings"></Icon>
                    </ListItem>
                }
                {_canDownload &&
                    <ListItem title={_t.textDownload} link="/download/">
                        <Icon slot="media" icon="icon-download"></Icon>
                    </ListItem>
                }
                {_canDownloadOrigin &&
                    <ListItem title={_t.textDownload} link="#" onClick={settingsContext.onDownloadOrigin} className='no-indicator'>
                        <Icon slot="media" icon="icon-download"></Icon>
                    </ListItem>
                }
                {_canPrint &&
                    <ListItem title={_t.textPrint} onClick={settingsContext.onPrint} link='#' className='no-indicator'>
                        <Icon slot="media" icon="icon-print"></Icon>
                    </ListItem>
                }
                <ListItem title={_t.textDocumentInfo} link="/document-info/">
                    <Icon slot="media" icon="icon-info"></Icon>
                </ListItem>
                {_canHelp &&
                    <ListItem title={_t.textHelp} link="#" className='no-indicator' onClick={settingsContext.showHelp}>
                        <Icon slot="media" icon="icon-help"></Icon>
                    </ListItem>
                }
                {(_canAbout && isNotForm) &&
                    <ListItem title={_t.textAbout} link="/about/">
                        <Icon slot="media" icon="icon-about"></Icon>
                    </ListItem>
                }
                {_canFeedback &&
                    <ListItem title={t('Settings.textFeedback')} link="#" className='no-indicator' onClick={settingsContext.showFeedback}>
                        <Icon slot="media" icon="icon-feedback"></Icon>
                    </ListItem>
                }
            </List>
        </Page>
    )
}));

export default SettingsPage;