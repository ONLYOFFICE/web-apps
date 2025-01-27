import React, { useContext } from 'react';
import { Page, Navbar, NavRight, Link, Icon, ListItem, List, f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../../common/mobile/utils/device';
import { observer, inject } from "mobx-react";
import { MainContext } from '../../page/main';
import { SettingsContext } from '../../controller/settings/Settings';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconSearch from '@common-icons/icon-search.svg';
import IconCollaboration from '@common-icons/icon-collaboration.svg';
import IconAppSettings from '@common-icons/icon-app-settings.svg';
import IconVersionHistory from '@common-icons/icon-version-history.svg';
import IconDownload from '@common-icons/icon-download.svg';
import IconPrint from '@common-icons/icon-print.svg';
import IconInfo from '@common-icons/icon-info.svg';
import IconHelp from '@common-icons/icon-help.svg';
import IconAbout from '@common-icons/icon-about.svg';
import IconFeedbackIos from '@common-ios-icons/icon-feedback.svg?ios';
import IconFeedbackAndroid from '@common-android-icons/icon-feedback.svg';
import IconTableSettings from '@icons/icon-table-settings.svg';

const SettingsPage = inject('storeAppOptions', 'storeSpreadsheetInfo')(observer(props => {
    const { t } = useTranslation();
    const appOptions = props.storeAppOptions;
    const storeSpreadsheetInfo = props.storeSpreadsheetInfo;
    const canUseHistory = appOptions.canUseHistory;
    const {openOptions, isBranding} = useContext(MainContext);
    const settingsContext = useContext(SettingsContext);
    const _t = t('View.Settings', {returnObjects: true});
    const docTitle = storeSpreadsheetInfo.dataDoc?.title ?? '';
    const canCloseEditor = appOptions.canCloseEditor;
    const closeButtonText = canCloseEditor && appOptions.customization.close.text;
    const navbar = 
        <Navbar>
            <div className="title" onClick={settingsContext.changeTitleHandler}>{docTitle}</div>
            {Device.phone && 
                <NavRight><Link popupClose=".settings-popup">{_t.textDone}</Link></NavRight>
            }
        </Navbar>;

    const onOpenOptions = name => {
        settingsContext.closeModal();
        openOptions(name);
    }

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
                {!props.inPopover &&
                    <ListItem disabled={appOptions.readerMode ? true : false} title={!_isEdit ? _t.textFind : _t.textFindAndReplace} link="#" searchbarEnable='.searchbar' onClick={settingsContext.closeModal} className='no-indicator'>
                        <SvgIcon slot="media" symbolId={IconSearch.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {window.matchMedia("(max-width: 359px)").matches ?
                    <ListItem title={_t.textCollaboration} link="#" onClick={() => onOpenOptions('coauth')} className='no-indicator'>
                        <SvgIcon slot="media" symbolId={IconCollaboration.id} className={'icon icon-svg'} />
                    </ListItem> 
                : null}
                {_isEdit && 
                    <ListItem link="/spreadsheet-settings/" title={_t.textSpreadsheetSettings}>
                        <SvgIcon slot="media" symbolId={IconTableSettings.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                <ListItem title={_t.textApplicationSettings} link="/application-settings/">
                    <SvgIcon slot="media" symbolId={IconAppSettings.id} className={'icon icon-svg'} />
                </ListItem>
                {_isEdit && canUseHistory &&
                    <ListItem title={t('View.Settings.textVersionHistory')} link={!Device.phone ? "/version-history" : ""} onClick={() => {
                        if(Device.phone) {
                            onOpenOptions('history');
                        }
                    }}>
                        <SvgIcon slot="media" symbolId={IconVersionHistory.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {_canDownload &&
                    <ListItem title={_t.textDownload} link="/download/">
                        <SvgIcon slot="media" symbolId={IconDownload.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {_canDownloadOrigin &&
                    <ListItem title={_t.textDownload} link="#" onClick={settingsContext.onDownloadOrigin} className='no-indicator'>
                        <SvgIcon slot="media" symbolId={IconDownload.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {_canPrint &&
                    <ListItem title={_t.textPrint} onClick={settingsContext.onPrint}>
                        <SvgIcon slot="media" symbolId={IconPrint.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {!(!_canDisplayInfo && isBranding) &&
                    <ListItem title={_t.textSpreadsheetInfo} link="/spreadsheet-info/">
                        <SvgIcon slot="media" symbolId={IconInfo .id} className={'icon icon-svg'} />
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
                    <ListItem title={t('View.Settings.textFeedback')} link="#" className='no-indicator' onClick={settingsContext.showFeedback}>
                        {Device.ios ? 
                            <SvgIcon slot="media" symbolId={IconFeedbackIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon slot="media" symbolId={IconFeedbackAndroid.id} className={'icon icon-svg'} />
                        }
                    </ListItem>
                }
                {canCloseEditor &&
                    <ListItem title={closeButtonText ?? t('View.Settings.textClose')} link="#" className='close-editor-btn no-indicator' onClick={() => Common.Notifications.trigger('close')}></ListItem>
                }
            </List>
        </Page>
    )
}));

export default SettingsPage;