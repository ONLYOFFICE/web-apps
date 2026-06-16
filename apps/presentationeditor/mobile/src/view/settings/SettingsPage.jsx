/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useContext } from 'react';
import { Page, Navbar, NavRight, Link, Icon, ListItem, List, f7, Toggle } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../../common/mobile/utils/device';
import { observer, inject } from "mobx-react";
import { MainContext } from '../../page/main';
import { SettingsContext } from '../../controller/settings/Settings';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconSearch from '@common-icons/icon-search.svg';
import IconCollaboration from '@common-icons/icon-collaboration.svg';
import IconSetup from '@icons/icon-setup.svg';
import IconAppSettings from '@common-icons/icon-app-settings.svg';
import IconVersionHistory from '@common-icons/icon-version-history.svg';
import IconDownload from '@common-icons/icon-download.svg';
import IconPrint from '@common-icons/icon-print.svg';
import IconInfo from '@common-icons/icon-info.svg';
import IconHelp from '@common-icons/icon-help.svg';
import IconAbout from '@common-icons/icon-about.svg';
import IconSave from '@common-icons/icon-save.svg';
import IconAutosave from '@common-icons/icon-autosave.svg';
import IconFeedbackIos from '@common-ios-icons/icon-feedback.svg?ios';
import IconFeedbackAndroid from '@common-android-icons/icon-feedback.svg';
import IconReturnIos from '@common-ios-icons/icon-return.svg?ios';
import IconReturnAndroid from '@common-android-icons/icon-return.svg';

const SettingsPage = inject('storeAppOptions', 'storeToolbarSettings', 'storePresentationInfo')(observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Settings', {returnObjects: true});
    const {openOptions, isBranding} = useContext(MainContext);
    const settingsContext = useContext(SettingsContext);
    const appOptions = props.storeAppOptions;
    const canUseHistory = appOptions.canUseHistory;
    const storeToolbarSettings = props.storeToolbarSettings;
    const disabledPreview = storeToolbarSettings.countPages <= 0;
    const storePresentationInfo = props.storePresentationInfo;
    const docTitle = storePresentationInfo.dataDoc ? storePresentationInfo.dataDoc.title : '';
    const canCloseEditor = appOptions.canCloseEditor;
    const closeButtonText = canCloseEditor && appOptions.customization.close.text;
    const gobackTitle = appOptions.customization?.goback?.text || _t.textOpenLocation;
    const isShowBack = props.storeToolbarSettings.isShowBack;
    const isAutosave = appOptions.isAutosave;
    const navbar =
        <Navbar>
            <div className="title" onClick={settingsContext.changeTitleHandler}>
                {docTitle}
                <span className="subtitle">{appOptions.savingDocStatusText}</span>
            </div>
            {Device.phone && <NavRight><Link popupClose=".settings-popup">{_t.textDone}</Link></NavRight>}
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
            _canFeedback = (
                appOptions.customization.feedback !== false && 
                appOptions.customization.feedback.visible !== false
            );
            _canDisplayInfo = appOptions.customization.mobile?.info !== false;
        }
    }
    
    return (
        <Page>
            {navbar}
            <>
                <List>
                    {isShowBack &&
                        <ListItem title={gobackTitle} link="#" className='no-indicator' onClick={() => Common.Notifications.trigger('goback')}>
                            {Device.ios ?
                                <SvgIcon slot="media" symbolId={IconReturnIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon slot="media" symbolId={IconReturnAndroid.id} className={'icon icon-svg'} />
                            }
                        </ListItem>
                    }
                    {!appOptions.canLiveView &&
                        <ListItem title={_t.textAutoSaveDocument}>
                            <SvgIcon slot="media" symbolId={IconAutosave.id} className={'icon icon-svg'} />
                            <Toggle checked={isAutosave}
                                onToggleChange={() => {
                                    appOptions.changeAutosave(!isAutosave);
                                    settingsContext.switchAutosave(!isAutosave);
                                }}
                            />
                        </ListItem>
                    }
                    {!appOptions.canLiveView &&
                        <ListItem title={_t.textSaveDocument}  className={`no-indicator${appOptions.isSaveBadgeShown ? ' notify' : ''}`} onClick={settingsContext.tryToSave}>
                            <SvgIcon slot="media" symbolId={IconSave.id} className={'icon icon-svg'} />
                        </ListItem>
                    }
                </List>
                <List>
                    {!props.inPopover &&
                        <ListItem disabled={appOptions.readerMode || disabledPreview ? true : false} title={!_isEdit ? _t.textFind : _t.textFindAndReplace} link="#" searchbarEnable='.searchbar' onClick={settingsContext.closeModal} className='no-indicator'>
                            <SvgIcon slot="media" symbolId={IconSearch.id} className={'icon icon-svg'} />
                        </ListItem>
                    }
                    {window.matchMedia("(max-width: 374px)").matches ?
                        <ListItem title={_t.textCollaboration} link="#" onClick={() => onOpenOptions('coauth')} className='no-indicator'>
                            <SvgIcon slot="media" symbolId={IconCollaboration.id} className={'icon icon-svg'} />
                        </ListItem>
                    : null}
                    {_isEdit &&
                        <ListItem link="/presentation-settings/" title={_t.textPresentationSettings}>
                            <SvgIcon slot="media" symbolId={IconSetup.id} className={'icon icon-svg'} />
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
                        <ListItem className={disabledPreview && 'disabled'} title={_t.textPrint} onClick={settingsContext.onPrint}>
                            <SvgIcon slot="media" symbolId={IconPrint.id} className={'icon icon-svg'} />
                        </ListItem>
                    }
                    {!(!_canDisplayInfo && isBranding) &&
                        <ListItem title={_t.textPresentationInfo} link="/presentation-info/">
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
            </>
        </Page>
    )
}));

export default SettingsPage;
