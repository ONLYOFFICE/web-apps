import React, { Fragment, useContext } from 'react';
import { Page, Navbar, NavRight, Link, Icon, ListItem, List, Toggle } from 'framework7-react';
import { Device } from "../../../../../common/mobile/utils/device";
import { observer, inject } from "mobx-react";
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../../controller/settings/Settings';
import { MainContext } from '../../page/main';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconAddFavorites from '@icons/icon-add-favorites.svg';
import IconRemoveFavorites from '@icons/icon-remove-favorites.svg';
import IconClearFields from '@icons/icon-clear-fields.svg';
import IconSearch from '@common-icons/icon-search.svg';
import IconProtection from '@icons/icon-protection.svg';
import IconVersionHistory from '@common-icons/icon-version-history.svg';
import IconNavigation from '@icons/icon-navigation.svg';
import IconCollaboration from '@common-icons/icon-collaboration.svg';
import IconMobileView from '@icons/icon-mobile-view.svg';
import IconSpellcheck from '@common-icons/icon-spellcheck.svg';
import IconDocSetup from '@icons/icon-doc-setup.svg';
import IconDownload from '@common-icons/icon-download.svg';
import IconAppSettings from '@common-icons/icon-app-settings.svg';
import IconExport from '@common-icons/icon-export.svg';
import IconPrint from '@common-icons/icon-print.svg';
import IconInfo from '@common-icons/icon-info.svg';
import IconHelp from '@common-icons/icon-help.svg';
import IconAbout from '@common-icons/icon-about.svg';
import IconFeedbackForIos from '@common-ios-icons/icon-feedback.svg?ios';
import IconFeedbackForAndroid from '@common-android-icons/icon-feedback.svg';
import IconDraw from '../../../../../common/mobile/resources/icons/draw.svg'

const SettingsPage = inject("storeAppOptions", "storeReview", "storeDocumentInfo",  "storeToolbarSettings")(observer(props => {
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
    const isSignatureForm = props.storeToolbarSettings.isSignatureForm; 

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
            _canDisplayInfo = appOptions.customization.mobile?.info !== false;
        }
    }
    
    return (
        <Page>
            {navbar}
            <List>
                {isEditableForms ? [
                    (isFavorite !== undefined && isFavorite !== null ?
                        <ListItem key='add-to-favorites-link' title={isFavorite ? t('Settings.textRemoveFromFavorites') : t('Settings.textAddToFavorites')} link='#' className='no-indicator' onClick={settingsContext.toggleFavorite}>
                            {isFavorite ?
                                <SvgIcon slot="media" symbolId={IconRemoveFavorites.id} className={'icon icon-svg'} />
                            :
                                <SvgIcon slot="media" symbolId={IconAddFavorites.id} className={'icon icon-svg'} />
                            }
                        </ListItem>
                    : ''),
                    <ListItem key='clear-all-fields-link' title={t('Settings.textClearAllFields')} link='#' className='no-indicator' onClick={settingsContext.clearAllFields}  disabled={isSignatureForm}>
                        <SvgIcon slot="media" symbolId={IconClearFields.id} className={'icon icon-svg'} />
                    </ListItem>
                ] : null}
                {(Device.phone || isEditableForms) &&
                    <ListItem title={!_isEdit || isViewer ? _t.textFind : _t.textFindAndReplace} link='#' searchbarEnable='.searchbar' onClick={settingsContext.closeModal} className='no-indicator'>
                        <SvgIcon slot="media" symbolId={IconSearch.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {(_isEdit && canProtect) &&
                    <ListItem title={t('Settings.textProtection')} link="/protection">
                        <SvgIcon slot="media" symbolId={IconProtection.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {_isEdit && !isHistoryDisabled && canUseHistory &&
                    <ListItem title={t('Settings.textVersionHistory')} link={!Device.phone ? "/version-history" : ""} onClick={() => {
                        if(Device.phone) {
                            onOpenOptions('history');
                        }
                    }}>
                        <SvgIcon slot="media" symbolId={IconVersionHistory.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {!isEditableForms ?
                    <ListItem title={t('Settings.textNavigation')} link={!Device.phone ? '/navigation' : '#'} onClick={() => {
                        if(Device.phone) {
                            onOpenOptions('navigation');
                        } 
                    }}>
                        <SvgIcon slot="media" symbolId={IconNavigation.id} className={'icon icon-svg'} />
                    </ListItem>
                : null}
                {window.matchMedia("(max-width: 359px)").matches ?
                    <ListItem title={_t.textCollaboration} link="#" onClick={() => {
                        onOpenOptions('coauth');
                    }} className='no-indicator'>
                        <SvgIcon slot="media" symbolId={IconCollaboration.id} className={'icon icon-svg '} />
                    </ListItem>
                : null}
                {Device.sailfish && _isEdit &&
                    <ListItem title={_t.textSpellcheck} onClick={() => settingsContext.onOrthographyCheck()} className='no-indicator' link="#">
                        <SvgIcon slot="media" symbolId={IconSpellcheck.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {(appOptions.isMobileViewAvailable  && ((Device.phone && !isViewer) || isEditableForms)) &&
                    <ListItem title={t('Settings.textMobileView')}>
                         <SvgIcon slot="media" symbolId={IconMobileView.id} className={'icon icon-svg'} />
                        <Toggle checked={isMobileView} onToggleChange={() => {
                            onOpenOptions('snackbar');
                            settingsContext.onChangeMobileView();
                        }} />
                    </ListItem>
                }
                {(_isEdit && !isViewer) &&
                    <ListItem title={_t.textDocumentSettings} disabled={displayMode !== 'markup'} link='/document-settings/'>
                       <SvgIcon slot="media" symbolId={IconDocSetup.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                <ListItem title={_t.textApplicationSettings} link="/application-settings/">
                    <SvgIcon slot="media" symbolId={IconAppSettings.id} className={'icon icon-svg'} />
                </ListItem>
                {_canDownload &&
                    <ListItem title={isEditableForms ? t('Settings.textExport') : _t.textDownload} link="/download/">
                        {isEditableForms ?
                            <SvgIcon slot="media" symbolId={IconExport.id} className={'icon icon-svg'} /> :
                            <SvgIcon slot="media" symbolId={IconDownload.id} className={'icon icon-svg'} />
                        }
                    </ListItem>
                }
                {_canDownloadOrigin &&
                    <ListItem title={_t.textDownload} link="#" onClick={settingsContext.onDownloadOrigin} className='no-indicator'>
                        <SvgIcon slot="media" symbolId={IconDownload.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {_canPrint &&
                    <ListItem title={_t.textPrint} onClick={settingsContext.onPrint} link='#' className='no-indicator'>
                        <SvgIcon slot="media" symbolId={IconPrint.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {!(!_canDisplayInfo && isBranding) &&
                    <ListItem title={_t.textDocumentInfo} link="/document-info/">
                        <SvgIcon slot="media" symbolId={IconInfo.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {_canHelp &&
                    <ListItem title={_t.textHelp} link="#" className='no-indicator' onClick={settingsContext.showHelp}>
                        <SvgIcon slot="media" symbolId={IconHelp.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {_canAbout &&
                    <ListItem title={_t.textAbout} link="/about/">
                         <SvgIcon slot="media" symbolId={IconAbout.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {_canFeedback &&
                    <ListItem title={t('Settings.textFeedback')} link="#" className='no-indicator' onClick={settingsContext.showFeedback}>
                        {Device.ios ? 
                            <SvgIcon slot="media" symbolId={IconFeedbackForIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon slot="media" symbolId={IconFeedbackForAndroid.id} className={'icon icon-svg'} />
                        }
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