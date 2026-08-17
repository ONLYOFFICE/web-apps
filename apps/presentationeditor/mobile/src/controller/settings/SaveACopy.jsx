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

import React, { Component } from "react";
import SaveACopy from "../../view/settings/SaveACopy";
import { Device } from '../../../../../common/mobile/utils/device';
import { f7 } from 'framework7-react';
import { withTranslation } from 'react-i18next';
import { observer, inject } from "mobx-react";

class SaveACopyController extends Component {
    constructor(props) {
        super(props);
        this.onSaveFormat = this.onSaveFormat.bind(this);
        this.appOptions = this.props.storeAppOptions;
        this._state = {
            isFromGatewayRequestSaveAs: false,
            fileExt: undefined
        }
    }

    componentDidMount() {
        const api = Common.EditorApi.get();
        api.asc_registerCallback('asc_onDownloadUrl', this.onDownloadUrl.bind(this));
    }

    closeModal() {
        if (Device.phone) {
            f7.sheet.close('.settings-popup', false);
        } else {
            f7.popover.close('#settings-popover');
        }
    }

    showRenameCopyDialog(format, ext) {
        const { t } = this.props;
        const docTitle = this.props.storePresentationInfo.dataDoc.title;
        const api = Common.EditorApi.get();
        api.asc_enableKeyEvents(true);

        const idx = docTitle.lastIndexOf('.');
        const nameDoc = idx > 0 ? docTitle.substring(0, idx) : docTitle;

        f7.dialog.create({
            title: t('View.Settings.textSaveACopyHeader'),
            text: t('View.Settings.textSaveConnectedStorage'),
            content: Device.ios ?
                '<div class="input-field"><input type="text" class="modal-text-input" name="modal-title" id="modal-title"></div>' :
                '<div class="input-field modal-title"><div class="inputs-list list inline-labels"><ul><li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap"><input type="text" name="modal-title" id="modal-title"></div></div></div></li></ul></div></div>',
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
                        const newTitle = document.querySelector('#modal-title').value.trim();

                        if (!newTitle.length) return;

                        f7.dialog.close();

                        if (/[\t*\+:\"<>?|\\\\/]/gim.test(newTitle)) {
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
                            return;
                        }

                        this.proceedSaveACopy(format, ext, newTitle);
                    }
                }
            ],
            on: {
                opened: () => {
                    const titleField = document.querySelector('#modal-title');
                    const btnChangeTitle = document.querySelector('.btn-change-title');

                    titleField.value = nameDoc;
                    titleField.focus();
                    titleField.select();

                    titleField.addEventListener('input', () => {
                        if (titleField.value.trim().length) {
                            btnChangeTitle.classList.remove('disabled');
                        } else {
                            btnChangeTitle.classList.add('disabled');
                        }
                    });
                }
            }
        }).open();
    }

    proceedSaveACopy(format, ext, customTitle = null) {
        const api = Common.EditorApi.get();
        const isNeedDownload = !!ext;
        const options = new Asc.asc_CDownloadOptions(format, isNeedDownload);

        this._state.fileExt = ext;

        if (customTitle) {
            this._savedCopyName = customTitle;
        }

        options.asc_setIsSaveAs(isNeedDownload);

        const wopiPath = customTitle && (typeof ext === 'string' ? customTitle + ext : customTitle);
        wopiPath && options.asc_setWopiSaveAsPath(wopiPath);

        if (format) {
            this._state.isFromGatewayRequestSaveAs = true;
            api.asc_DownloadAs(options);
        }
    }

    onDownloadUrl (url, fileType) {
        if (this._state.isFromGatewayRequestSaveAs) {
            let docTitle = this._savedCopyName || this.props.storePresentationInfo.dataDoc.title;
            !docTitle && (docTitle = this.txtUntitled);

            if (typeof this._state.fileExt == 'string') {
                var idx = docTitle.lastIndexOf('.');
                if (idx>0)
                    docTitle = docTitle.substring(0, idx) + this._state.fileExt;
                else
                    docTitle = docTitle + this._state.fileExt;
            }

            Common.Gateway.requestSaveAs(url, docTitle, fileType);
        }

        this._state.isFromGatewayRequestSaveAs = false;
        this._savedCopyName = null;
    }

    onSaveFormat(format, ext) {
        const wopi = this.appOptions.wopi;
        this.closeModal();

        wopi ? this.showRenameCopyDialog(format, ext) : this.proceedSaveACopy(format, ext);
    }

    render() {
        return (
            <SaveACopy 
                onSaveFormat={this.onSaveFormat} 
            />
        );
    }
}

const SaveACopyWithTranslation = inject("storeAppOptions", "storePresentationInfo")(observer(withTranslation()(SaveACopyController)));

export {
    SaveACopyWithTranslation as SaveACopyController,
};