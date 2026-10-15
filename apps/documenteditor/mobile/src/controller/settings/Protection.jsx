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

import React, { useEffect, useState } from 'react';
import { observer, inject } from "mobx-react";
import ProtectionView from '../../view/settings/Protection';
import { useTranslation } from 'react-i18next';
import { f7 } from "framework7-react";
import { Device } from '../../../../../common/mobile/utils/device';
import Snackbar from '../../components/Snackbar/Snackbar';

const ProtectionController = props => {
    const { t } = useTranslation();
    const [isSnackbarVisible, setSnackbarVisible] = useState(false);

    const onProtectClick = () => {
        const api = Common.EditorApi.get();
        const appOptions = props.storeAppOptions;
        const isViewer = appOptions.isViewer;
        const isProtected = appOptions.isProtected;
        let propsProtection = api.asc_getDocumentProtection();
        const isPassword = propsProtection?.asc_getIsPassword();

        if(isProtected) {
            if(propsProtection && isPassword) {
                f7.dialog.create({
                    title: t('Settings.titleDialogUnprotect'),
                    text: t('Settings.textDialogUnprotect'),
                    content: Device.ios ?
                        '<div class="input-field modal-password"><input type="password" maxlength="15" class="modal-text-input" name="protection-password" placeholder="' + t('Settings.advDRMPassword') + '" id="protection-password"><i class="modal-password__icon icon icon-show-password"></i></div>' : '<div class="input-field modal-password"><div class="inputs-list list inline-labels"><ul><li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap"><input type="password" name="protection-password" maxlength="15" id="protection-password" placeholder=' + t('Settings.advDRMPassword') + '><i class="modal-password__icon icon icon-show-password"></i></div></div></div></li></ul></div></div>',
                    cssClass: 'dlg-adv-options',
                    on: {
                        opened: () => {
                            const passwordIcon = document.querySelector('.modal-password__icon');
                            const passwordField = document.querySelector('#protection-password');
                            const btnUnprotect = document.querySelector('.btn-unprotect');

                            passwordField.addEventListener('input', () => {
                                if(passwordField.value) {
                                    btnUnprotect.classList.remove('disabled');
                                } else {
                                    btnUnprotect.classList.add('disabled');
                                }
                            });
            
                            passwordIcon.addEventListener('click', () => {
                                passwordIcon.classList.toggle('icon-show-password');
                                passwordIcon.classList.toggle('icon-hide-password');
                                passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
                            });
                        },
                    },
                    buttons: [
                        {
                            text: t('Settings.textCancel')
                        },
                        {
                            text: t('Settings.textOk'),
                            cssClass: 'btn-unprotect disabled',
                            onClick: () => {
                                const passwordField = document.querySelector('#protection-password');
                                const passwordValue = passwordField?.value;
                               
                                if(passwordValue) {
                                    propsProtection.asc_setEditType(Asc.c_oAscEDocProtect.None);
                                    propsProtection.asc_setPassword(passwordValue);
                                    const isUnprotected = api.asc_setDocumentProtection(propsProtection);

                                    if(isUnprotected && !isViewer) {
                                        api.asc_removeRestriction(Asc.c_oAscRestrictionType.View)
                                        api.asc_addRestriction(Asc.c_oAscRestrictionType.None);
                                    } 
                                }
                            }
                        }
                    ]
                }).open();
            } else {
                if (!propsProtection) 
                    propsProtection = new AscCommonWord.CDocProtect();

                appOptions.setTypeProtection(null);
                propsProtection.asc_setEditType(Asc.c_oAscEDocProtect.None);
                const isUnprotected = api.asc_setDocumentProtection(propsProtection);

                if(isUnprotected) {
                    if(!isViewer) {
                        api.asc_removeRestriction(Asc.c_oAscRestrictionType.View)
                        api.asc_addRestriction(Asc.c_oAscRestrictionType.None);
                    } 

                    setSnackbarVisible(true);
                }
            }
        } else {
            f7.views.current.router.navigate('/protect');
        }
    }

    return (
        <>
            <ProtectionView onProtectClick={onProtectClick} />
            <Snackbar isShowSnackbar={isSnackbarVisible} message={t('Settings.textProtectTurnOff')} closeCallback={() => setSnackbarVisible(false)} />
        </>
    );
   
}

export default inject('storeAppOptions')(observer(ProtectionController));
