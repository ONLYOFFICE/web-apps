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

import React, { createContext } from 'react';
import { Device } from '../../../../../common/mobile/utils/device';
import SettingsView from '../../view/settings/Settings';
import { f7 } from 'framework7-react';
import { observer, inject } from "mobx-react";
import { useTranslation } from 'react-i18next';

export const SettingsContext = createContext();

const SettingsController = props => {
    const appOptions = props.storeAppOptions;
    const storeVisioInfo = props.storeVisioInfo;
    const docExt = storeVisioInfo.dataDoc.fileType;
    const { t } = useTranslation();

    const closeModal = () => {
        if (Device.phone) {
            f7.sheet.close('.settings-popup', false);
        } else {
            f7.popover.close('#settings-popover', false);
        }
    };

    const onPrint = () => {
        const api = Common.EditorApi.get();

        closeModal();
        setTimeout(() => {
            api.asc_Print();
        }, 400);
    };

    const showHelp = () => {
        // let url = '{{HELP_URL}}';
        let url = __HELP_URL__;
        // let url = 'https://helpcenter.onlyoffice.com';

        if (url.charAt(url.length-1) !== '/') {
            url += '/';
        }

        if (Device.sailfish || Device.android) {
            url+='mobile-applications/documents/mobile-web-editors/android/index.aspx';
        } 
        else {
            url+='mobile-applications/documents/mobile-web-editors/ios/index.aspx';
        }

        closeModal();
        window.open(url, "_blank");
    };

    const showFeedback = () => {
        let config = props.storeAppOptions.config;

        closeModal();
        if(!!config?.customization?.feedback?.url) {
            window.open(config.customization.feedback.url, "_blank");
        } else window.open(__SUPPORT_URL__, "_blank");
    };

    const onDownloadOrigin = () => {
        closeModal();
        setTimeout(() => {
            Common.EditorApi.get().asc_DownloadOrigin();
        }, 0);
    };

    const changeTitleHandler = () => {
        if(!appOptions.canRename) return;

        const docTitle = storeVisioInfo.dataDoc?.title ?? '';
        const api = Common.EditorApi.get();
        api.asc_enableKeyEvents(true);

        f7.dialog.create({
            title: t('Toolbar.textRenameFile'),
            text : t('Toolbar.textEnterNewFileName'),
            content: Device.ios ?
            '<div class="input-field"><input type="text" class="modal-text-input" name="modal-title" id="modal-title"></div>' : '<div class="input-field modal-title"><div class="inputs-list list inline-labels"><ul><li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap"><input type="text" name="modal-title" id="modal-title"></div></div></div></li></ul></div></div>',
            cssClass: 'dlg-adv-options',
            buttons: [
                {
                    text: t('View.Edit.textCancel')
                },
                {
                    text: t('View.Edit.textOk'),
                    cssClass: 'btn-change-title',
                    bold: true,
                    close: false,
                    onClick: () => {
                        const titleFieldValue = document.querySelector('#modal-title').value;

                        if(titleFieldValue.trim().length) {
                            changeTitle(titleFieldValue);
                            f7.dialog.close();
                        }
                    }
                }
            ],
            on: {
                opened: () => {
                    const nameDoc = docTitle.slice(0, docTitle.lastIndexOf("."));
                    const titleField = document.querySelector('#modal-title');
                    const btnChangeTitle = document.querySelector('.btn-change-title');

                    titleField.value = nameDoc;
                    titleField.focus();
                    titleField.select();

                    titleField.addEventListener('input', () => {
                        if(titleField.value.trim().length) {
                            btnChangeTitle.classList.remove('disabled');
                        } else {
                            btnChangeTitle.classList.add('disabled');
                        }
                    });
                }
            }
        }).open();
    };

    const cutDocName = name => {
        if(name.length <= docExt.length) return name;
        const idx = name.length - docExt.length;

        return name.substring(idx) == docExt ? name.substring(0, idx) : name;
    };

    const changeTitle = (name) => {
        const api = Common.EditorApi.get();
        const currentTitle = `${name}.${docExt}`;
        let formatName = name.trim();

        if(formatName.length > 0 && cutDocName(currentTitle) !== formatName) {
            if(/[\t*\+:\"<>?|\\\\/]/gim.test(formatName)) {
                f7.dialog.create({
                    title: t('View.Edit.notcriticalErrorTitle'),
                    text: t('View.Edit.textInvalidName') + '*+:\"<>?|\/',
                    buttons: [
                        {
                            text: t('View.Edit.textOk'),
                            close: true
                        }
                    ]
                }).open();
            } else {
                const wopi = appOptions.wopi;
                formatName = cutDocName(formatName);

                if(wopi) {
                    api.asc_wopi_renameFile(formatName);
                } else {
                    Common.Gateway.requestRename(formatName);
                }

                const newTitle = `${formatName}.${docExt}`;
                storeVisioInfo.changeTitle(newTitle);
            }
        }
    }

    return (
        <SettingsContext.Provider value={{
            onPrint,
            showHelp,
            showFeedback,
            onDownloadOrigin,
            closeModal,
            changeTitleHandler
        }}>
            <SettingsView />
        </SettingsContext.Provider>
    );
};

export default inject("storeAppOptions", "storeVisioInfo")(observer(SettingsController));
