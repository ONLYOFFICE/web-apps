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
import { withTranslation, useTranslation } from 'react-i18next';
import { f7 } from 'framework7-react';
import { observer, inject } from "mobx-react";

class DownloadController extends Component {
    constructor(props) {
        super(props);
        this.onSaveFormat = this.onSaveFormat.bind(this);
    }

    closeModal() {
        if (Device.phone) {
            f7.sheet.close('.settings-popup', false);
        } else {
            f7.popover.close('#settings-popover');
        }
    }

    onSaveFormat(format) {
        const api = Common.EditorApi.get();
        const { t } = this.props;
        const _t = t("View.Settings", {returnObjects: true});

        if (format) {
            this.closeModal();
            if (format == Asc.c_oAscFileType.CSV) {
                f7.dialog.create({
                    title: _t.notcriticalErrorTitle,
                    text: _t.warnDownloadCsv,
                    buttons: [
                        {
                            text: _t.textCancel
                        },
                        {
                            text: _t.textOk,
                            onClick: () => {
                                const advOptions = api.asc_getAdvancedOptions();
                                Common.Notifications.trigger('openEncoding', Asc.c_oAscAdvancedOptionsID.CSV, advOptions, 2, new Asc.asc_CDownloadOptions(format))
                                // onAdvancedOptions(Asc.c_oAscAdvancedOptionsID.CSV, api.asc_getAdvancedOptions(), 2, new Asc.asc_CDownloadOptions(format), _t, true);
                            }
                        }
                    ]
                }).open();
            } else if (format == Asc.c_oAscFileType.ODS) {
                f7.dialog.create({
                    title: _t.notcriticalErrorTitle,
                    text: _t.warnDownloadOds,
                    buttons: [
                        {
                            text: _t.textCancel
                        },
                        {
                            text: _t.textOk,
                            onClick: () => {
                                api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
                            }
                        }
                    ]
                }).open();
            } else {
                api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
            }
        }
    }

    render() {
        return (
            <Download onSaveFormat={this.onSaveFormat} />
        );
    }
}

const DownloadWithTranslation = inject("storeAppOptions")(observer(withTranslation()(DownloadController)));

const onAdvancedOptions = (type, _t, isDocReady, canRequestClose, isDRM) => {
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

    if (canRequestClose)
        buttons.push({
            text: _t.closeButtonText,
            onClick: function () {
                Common.Gateway.requestClose();
            }
        });

    f7.dialog.create({
        title: _t.advDRMOptions,
        text: _t.textOpenFile,
        content: Device.ios ?
            '<div class="input-field"><input type="password" class="modal-text-input" name="modal-password" placeholder="' + _t.advDRMPassword + '" id="modal-password"></div>' : '<div class="input-field"><div class="inputs-list list inline-labels"><ul><li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap"><input type="password" name="modal-password" id="modal-password" placeholder=' + _t.advDRMPassword + '></div></div></div></li></ul></div></div>',
        buttons: buttons,
        on: {
            opened: () => {
                const passwordField = document.querySelector('#modal-password');
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
    DownloadWithTranslation,
    onAdvancedOptions
}
