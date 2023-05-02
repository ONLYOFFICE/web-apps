import React, { useState } from 'react';
import { observer, inject } from "mobx-react";
import { Device } from '../../../../../common/mobile/utils/device';
import { Page, Navbar, List, ListItem, BlockTitle, Toggle, NavRight, f7, Link, ListInput, Icon, Block } from "framework7-react";
import { useTranslation } from "react-i18next";
import PasswordField from '../../components/PasswordField/PasswordField';

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
                        {Device.android && <Icon icon='icon-check'/>}
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
                        <p>If the password is forgotten or lost, it cannot be recovered.</p>
                    </Block>
                </>
            }
        </Page>
    )
}));

export default EncryptionView;