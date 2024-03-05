import React, { Fragment, useContext } from 'react';
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
    const {openOptions, isBranding} = useContext(MainContext);
    const appOptions = props.storeAppOptions;
    const canProtect = appOptions.canProtect;
    const storeReview = props.storeReview;
    const displayMode = storeReview.displayMode;
    const docInfo = props.storeDocumentInfo;
    const docTitle = docInfo.dataDoc.title;
    const docExt = docInfo.dataDoc ? docInfo.dataDoc.fileType : '';
    const isForm = appOptions.isForm;
    const isHistoryDisabled = docExt && (docExt === 'xps' || docExt === 'djvu' || docExt === 'pdf');
    const navbar =
        <Navbar>
            <div className="title" onClick={settingsContext.changeTitleHandler}>{docTitle}</div>
            {Device.phone && <NavRight><Link popupClose=".settings-popup">{_t.textDone}</Link></NavRight>}
        </Navbar>;

    const onOpenOptions = name => {
        openOptions(name);
        settingsContext.closeModal(); 
    }

    // set mode
    const isViewer = appOptions.isViewer;
    const isMobileView = appOptions.isMobileView;
    const isFavorite = appOptions.isFavorite;
    const canFillForms = appOptions.canFillForms;
    const isEditableForms = isForm && canFillForms;
    const canSubmitForms = appOptions.canSubmitForms;
    const canCloseEditor = appOptions.canCloseEditor;
    const closeButtonText = canCloseEditor && appOptions.customization.close.text;
    const canUseHistory = appOptions.canUseHistory;

    let _isEdit = false,
        _canDownload = false,
        _canDownloadOrigin = false,
        _canAbout = true,
        _canHelp = true,
        _canPrint = false,
        _canFeedback = true,
        _canDisplayInfo = true;

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
            _canDisplayInfo = appOptions.customization.info !== false;
        }
    }
    
    return (
        <Page>
            {navbar}
            <List>
                {isEditableForms ? [
                    (isFavorite !== undefined && isFavorite !== null ?
                        <ListItem key='add-to-favorites-link' title={isFavorite ? t('Settings.textRemoveFromFavorites') : t('Settings.textAddToFavorites')} link='#' className='no-indicator' onClick={settingsContext.toggleFavorite}>
                            <Icon slot="media" icon={isFavorite ? "icon-remove-favorites" : "icon-add-favorites"}></Icon>
                        </ListItem>
                    : ''),
                    (canFillForms && canSubmitForms ?   
                        <ListItem key='submit-form-link' title={t('Settings.textSubmit')} link='#' className='no-indicator' onClick={settingsContext.submitForm}>
                            <Icon slot="media" icon="icon-save-form"></Icon>
                        </ListItem> 
                    : ''),
                    (_canDownload && canFillForms && !canSubmitForms ? 
                        <ListItem key='save-form-link' title={t('Settings.textSave')} link='#' className='no-indicator' onClick={settingsContext.saveAsPdf}>
                            <Icon slot="media" icon="icon-save-form"></Icon>
                        </ListItem>
                    : ''),
                    <ListItem key='clear-all-fields-link' title={t('Settings.textClearAllFields')} link='#' className='no-indicator' onClick={settingsContext.clearAllFields}>
                        <Icon slot="media" icon="icon-clear-fields"></Icon>
                    </ListItem>
                ] : null}
                {(Device.phone || isEditableForms) &&
                    <ListItem title={!_isEdit || isViewer ? _t.textFind : _t.textFindAndReplace} link='#' searchbarEnable='.searchbar' onClick={settingsContext.closeModal} className='no-indicator'>
                        <Icon slot="media" icon="icon-search"></Icon>
                    </ListItem>
                }
                {(_isEdit && canProtect) &&
                    <ListItem title={t('Settings.textProtection')} link="/protection">
                        <Icon slot="media" icon="icon-protection" />
                    </ListItem>
                }
                {_isEdit && !isHistoryDisabled && canUseHistory &&
                    <ListItem title={t('Settings.textVersionHistory')} link={!Device.phone ? "/version-history" : ""} onClick={() => {
                        if(Device.phone) {
                            onOpenOptions('history');
                        }
                    }}>
                        <Icon slot="media" icon="icon-version-history"></Icon>
                    </ListItem>
                }
                {!isEditableForms ? 
                    <ListItem title={t('Settings.textNavigation')} link={!Device.phone ? '/navigation' : '#'} onClick={() => {
                        if(Device.phone) {
                            onOpenOptions('navigation');
                        } 
                    }}>
                        <Icon slot="media" icon="icon-navigation"></Icon>
                    </ListItem>
                : null}
                {window.matchMedia("(max-width: 359px)").matches ?
                    <ListItem title={_t.textCollaboration} link="#" onClick={() => {
                        onOpenOptions('coauth');
                    }} className='no-indicator'>
                        <Icon slot="media" icon="icon-collaboration"></Icon>
                    </ListItem>
                : null}
                {Device.sailfish && _isEdit &&
                    <ListItem title={_t.textSpellcheck} onClick={() => settingsContext.onOrthographyCheck()} className='no-indicator' link="#">
                        <Icon slot="media" icon="icon-spellcheck"></Icon>
                    </ListItem>
                }
                {((!isViewer && Device.phone) || isEditableForms) &&
                    <ListItem title={t('Settings.textMobileView')}>
                        <Icon slot="media" icon="icon-mobile-view"></Icon>
                        <Toggle checked={isMobileView} onToggleChange={() => {
                            onOpenOptions('snackbar');
                            settingsContext.onChangeMobileView();
                        }} />
                    </ListItem>
                }
                {(_isEdit && !isViewer) &&
                    <ListItem title={_t.textDocumentSettings} disabled={displayMode !== 'markup'} link='/document-settings/'>
                        <Icon slot="media" icon="icon-doc-setup"></Icon>
                    </ListItem>
                }
                <ListItem title={_t.textApplicationSettings} link="/application-settings/">
                    <Icon slot="media" icon="icon-app-settings"></Icon>
                </ListItem>
                {_canDownload &&
                    <ListItem title={isEditableForms ? t('Settings.textExport') : _t.textDownload} link="/download/">
                        <Icon slot="media" icon={isEditableForms ? "icon-export" : "icon-download"}></Icon>
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
                {!(!_canDisplayInfo && isBranding) &&
                    <ListItem title={_t.textDocumentInfo} link="/document-info/">
                        <Icon slot="media" icon="icon-info"></Icon>
                    </ListItem>
                }
                {_canHelp &&
                    <ListItem title={_t.textHelp} link="#" className='no-indicator' onClick={settingsContext.showHelp}>
                        <Icon slot="media" icon="icon-help"></Icon>
                    </ListItem>
                }
                {_canAbout &&
                    <ListItem title={_t.textAbout} link="/about/">
                        <Icon slot="media" icon="icon-about"></Icon>
                    </ListItem>
                }
                {_canFeedback &&
                    <ListItem title={t('Settings.textFeedback')} link="#" className='no-indicator' onClick={settingsContext.showFeedback}>
                        <Icon slot="media" icon="icon-feedback"></Icon>
                    </ListItem>
                }
                {canCloseEditor &&
                    <ListItem title={closeButtonText ?? t('Settings.textClose')} link="#" className='close-editor-btn no-indicator' onClick={() => Common.Notifications.trigger('close')}></ListItem>
                }
            </List>
        </Page>
    )
}));

export default SettingsPage;