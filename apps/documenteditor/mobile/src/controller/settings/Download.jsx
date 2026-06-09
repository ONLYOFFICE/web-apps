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
import Download from "../../view/settings/Download";
import { Device } from '../../../../../common/mobile/utils/device';
import { f7 } from 'framework7-react';
import { withTranslation } from 'react-i18next';
import { observer, inject } from "mobx-react";

class DownloadController extends Component {
    constructor(props) {
        super(props);
        this.onSaveFormat = this.onSaveFormat.bind(this);
        this.appOptions = this.props.storeAppOptions;
    }

    closeModal() {
        if (Device.phone) {
            f7.sheet.close('.settings-popup', false);
        } else {
            f7.popover.close('#settings-popover');
        }
    }

    onSaveFormat(format) {
        const { t } = this.props;
        const _t = t("Settings", { returnObjects: true });
        const api = Common.EditorApi.get();
        const storeDocumentInfo = this.props.storeDocumentInfo;
        const dataDoc = storeDocumentInfo.dataDoc;
        const fileType = dataDoc.fileType;
        const isNeedDownload = !!format;
        const options = new Asc.asc_CDownloadOptions(format);
        options.asc_setIsSaveAs(isNeedDownload);
        const isPdfLike = /^pdf|xps|oxps|djvu$/.test(fileType);

        if(isPdfLike) 
            this.closeModal();

        if (format === Asc.c_oAscFileType.DJVU && isPdfLike) { 
            api.asc_DownloadOrigin(options);
        } else if(format === Asc.c_oAscFileType.PDF || format === Asc.c_oAscFileType.PDFA || format === Asc.c_oAscFileType.JPG || format === Asc.c_oAscFileType.PNG) {
            api.asc_DownloadAs(options);
        } else if (format === Asc.c_oAscFileType.TXT || format === Asc.c_oAscFileType.RTF) {
            if(isPdfLike) 
                options.asc_setTextParams(new AscCommon.asc_CTextParams(Asc.c_oAscTextAssociation.PlainLine));

            f7.dialog.create({
                title: _t.notcriticalErrorTitle,
                text: (format === Asc.c_oAscFileType.TXT) ? _t.textDownloadTxt : _t.textDownloadRtf,
                buttons: [
                    {
                        text: _t.textCancel
                    },
                    {
                        text: _t.textOk,
                        onClick: () => {
                            if (format === Asc.c_oAscFileType.TXT) {
                                const advOptions = api.asc_getAdvancedOptions();
                                Common.Notifications.trigger('openEncoding', Asc.c_oAscAdvancedOptionsID.TXT, advOptions, 2, options);
                            } else {
                                api.asc_DownloadAs(options);
                            }
                        }
                    }
                ],
            }).open();
        } else if(isPdfLike) {
            f7.dialog.create({
                title: _t.notcriticalErrorTitle,
                text: t('Main.warnDownloadAsPdf').replaceAll('{0}', fileType.toUpperCase()), 
                buttons: [
                    {
                        text: _t.textCancel
                    },
                    {
                        text: _t.textOk,
                        onClick: () => {
                            options.asc_setTextParams(new AscCommon.asc_CTextParams(Asc.c_oAscTextAssociation.PlainLine));
                            api.asc_DownloadAs(options);
                        }
                    }
                ],
            }).open();
        } else
            api.asc_DownloadAs(options);

    }

    render() {
        return (
            <Download 
                onSaveFormat={this.onSaveFormat} 
                isForm={this.appOptions.isForm}
                canFillForms={this.appOptions.canFillForms}
            />
        );
    }
}

const DownloadWithTranslation = inject("storeAppOptions", "storeDocumentInfo")(observer(withTranslation()(DownloadController)));

const onAdvancedOptions = (type, _t, isDocReady, canRequestClose, isDRM) => {
    if ($$('.dlg-adv-options.modal-in').length > 0) return;

    const api = Common.EditorApi.get();

    Common.Notifications.trigger('preloader:close');
    Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], -256, true);

    const buttons = [{
        text: _t.textOk,
        bold: true,
        onClick: function () {
            const password = document.getElementById('modal-password').value;
            api.asc_setAdvancedOptions(type, new Asc.asc_CDRMAdvancedOptions(password));
            if (!isDocReady) {
                Common.Notifications.trigger('preloader:beginAction', Asc.c_oAscAsyncActionType['BlockInteraction'], -256);
            }
        }
    }];

    if(isDRM) {
        f7.dialog.create({
            text: _t.txtIncorrectPwd,
            buttons : [{
                text: _t.textOk,
                bold: true,
            }]
        }).open();
    }

    if (canRequestClose) {
        buttons.push({
            text: _t.closeButtonText,
            onClick: function () {
                Common.Gateway.requestClose();
            }
        });
    }

    f7.dialog.create({
        title: _t.advDRMOptions,
        text: _t.textOpenFile,
        content: Device.ios ?
        '<div class="input-field modal-password"><input type="password" class="modal-text-input" name="modal-password" placeholder="' + _t.advDRMPassword + '" id="modal-password"><i class="modal-password__icon icon icon-show-password"></i></div>' : '<div class="input-field modal-password"><div class="inputs-list list inline-labels"><ul><li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap"><input type="password" name="modal-password" id="modal-password" placeholder=' + _t.advDRMPassword + '><i class="modal-password__icon icon icon-show-password"></i></div></div></div></li></ul></div></div>',
        buttons: buttons,
        cssClass: 'dlg-adv-options',
        on: {
            opened: () => {
                const passwordIcon = document.querySelector('.modal-password__icon');
                const passwordField = document.querySelector('#modal-password');

                passwordIcon.addEventListener('click', () => {
                    passwordIcon.classList.toggle('icon-show-password');
                    passwordIcon.classList.toggle('icon-hide-password');
                    passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
                });

                passwordField.addEventListener('keyup', (e) => {
                    if (e.key === 'Enter') {
                        buttons[0].onClick();
                        f7.dialog.close();
                    }
                });
            },
        }
    }).open();
};


export {
    DownloadWithTranslation as DownloadController,
    onAdvancedOptions
};
