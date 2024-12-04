import React, { useContext } from 'react';
import { Page, Navbar, NavRight, Link, Icon, ListItem, List, f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../../common/mobile/utils/device';
import { observer, inject } from "mobx-react";
import { MainContext } from '../../page/main';
import { SettingsContext } from '../../controller/settings/Settings';

const SettingsPage = inject('storeAppOptions', 'storeVisioInfo')(observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Settings', {returnObjects: true});
    const {openOptions, isBranding} = useContext(MainContext);
    const settingsContext = useContext(SettingsContext);
    const appOptions = props.storeAppOptions;
    const storeVisioInfo = props.storeVisioInfo;
    const docTitle = storeVisioInfo.dataDoc ? storeVisioInfo.dataDoc.title : '';
    const canCloseEditor = appOptions.canCloseEditor;
    const closeButtonText = canCloseEditor && appOptions.customization.close.text;
    const navbar =
        <Navbar>
            <div className="title" onClick={settingsContext.changeTitleHandler}>{docTitle}</div>
            {Device.phone && <NavRight><Link popupClose=".settings-popup">{_t.textDone}</Link></NavRight>}
        </Navbar>;

    const onOpenOptions = name => {
        settingsContext.closeModal();
        openOptions(name);
    }

    let _canDownload = false,
        _canDownloadOrigin = false,
        _canAbout = true,
        _canHelp = true,
        _canPrint = false,
        _canFeedback = true,
        _canDisplayInfo = true;

    if (appOptions.isDisconnected) {
        if (!appOptions.enableDownload)
            _canPrint = _canDownload = _canDownloadOrigin = false;
    } else {
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
                <ListItem title={_t.textApplicationSettings} link="/application-settings/">
                    <Icon slot="media" icon="icon-app-settings"></Icon>
                </ListItem>
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
                    <ListItem title={_t.textPrint} onClick={settingsContext.onPrint}>
                        <Icon slot="media" icon="icon-print"></Icon>
                    </ListItem>
                }
                {!(!_canDisplayInfo && isBranding) &&
                    <ListItem title={_t.textVisioInfo} link="/visio-info/">
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
                    <ListItem title={t('View.Settings.textFeedback')} link="#" className='no-indicator' onClick={settingsContext.showFeedback}>
                        <Icon slot="media" icon="icon-feedback"></Icon>
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