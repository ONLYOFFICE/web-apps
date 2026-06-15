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

import React, { useState } from 'react';
import { observer, inject } from "mobx-react";
import { Device } from '../../../../../common/mobile/utils/device';
import { Page, Navbar, List, ListItem, BlockTitle, Toggle, NavRight, f7, Link, ListInput, Icon, Block } from "framework7-react";
import { useTranslation } from "react-i18next";
import PasswordField from '../../components/PasswordField/PasswordField';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconCheck from '@common-android-icons/icon-check.svg';

const EncryptionView = inject("storeAppOptions")(observer(props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const isIos = Device.ios;
    const appOptions = props.storeAppOptions;
    const isFileEncrypted = appOptions.isFileEncrypted;
    const [isRequiredPassword, setRequirePassword] = useState(isFileEncrypted);
    const [password, changePassword] = useState('');
    const [passwordRepeat, repeatPassword] = useState('');
    const isDisabledEncryption = isFileEncrypted && !isRequiredPassword ? false : !password.length || !passwordRepeat.length;

    const showErrorDialog = () => {
        f7.dialog.create({
            title: t('Settings.textPasswordNotMatched'),
            buttons: [
                {
                    text: t('Settings.textOk')
                }
            ]
        }).open();
    };

    const changeHanlder = () => {
        if(isFileEncrypted && !isRequiredPassword) {
            props.deletePassword();
        } else if(password !== passwordRepeat) {
            showErrorDialog();
        } else {
            props.setPassword(password);
        }
    }

    return (
        <Page>
            <Navbar title={t('Settings.textEncryptFile')} backLink={_t.textBack}>
                <NavRight>
                    <Link text={isIos && t('Settings.textSave')} className={isDisabledEncryption && 'disabled'} onClick={changeHanlder}>
                        {Device.android && 
                            <SvgIcon symbolId={IconCheck.id} className='icon icon-svg' />
                        }
                    </Link>
                </NavRight>
            </Navbar>
            {isFileEncrypted &&
                <>
                    <List>
                        <ListItem title={t('Settings.textRequirePassword')}>
                            <Toggle checked={isRequiredPassword} onToggleChange={() => {
                                setRequirePassword(!isRequiredPassword);
                            }} />
                        </ListItem>
                    </List>
                </>
            }
            {isFileEncrypted && isRequiredPassword &&
                <BlockTitle>{t('Settings.textChangePassword')}</BlockTitle>
            }
            {(isFileEncrypted && isRequiredPassword || !isFileEncrypted) &&
                <>
                    <div className='inputs-list list inline-labels'>
                        <ul>
                            <PasswordField label={t('Settings.textPassword')} placeholder={t('Settings.textRequired')} value={password} handlerChange={changePassword} />
                            <PasswordField label={t('Settings.textVerify')} placeholder={t('Settings.textRequired')} value={passwordRepeat} handlerChange={repeatPassword} />
                        </ul>
                    </div>
                    <Block>
                        <p>{t('Settings.textPasswordWarning')}</p>
                    </Block>
                </>
            }
        </Page>
    )
}));

export default EncryptionView;
