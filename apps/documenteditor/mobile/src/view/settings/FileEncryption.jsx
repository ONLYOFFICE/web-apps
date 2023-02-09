import React, { useState } from 'react';
import { observer, inject } from "mobx-react";
import { Device } from '../../../../../common/mobile/utils/device';
import { Page, Navbar, List, ListItem, BlockTitle, Toggle, NavRight, f7, Link, ListInput, Icon, Block } from "framework7-react";
import { useTranslation } from "react-i18next";

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
            {(isFileEncrypted && isRequiredPassword || !isFileEncrypted) &&
                <>
                    <BlockTitle>{t('Settings.textChangePassword')}</BlockTitle>
                    <List inlineLabels className="inputs-list">
                        <ListInput 
                            label={t('Settings.textPassword')}
                            type="password"
                            placeholder={t('Settings.textRequired')}
                            value={password}
                            onInput={e => changePassword(e.target.value)}
                            className={isIos ? 'list-input-right' : ''}
                        />
                        <ListInput 
                            label={t('Settings.textVerify')}
                            type="password"
                            placeholder={t('Settings.textRequired')}
                            value={passwordRepeat}
                            onInput={e => repeatPassword(e.target.value)}
                            className={isIos ? 'list-input-right' : ''}
                        />
                    </List>
                    <Block>
                        <p>If the password is forgotten or lost, it cannot be recovered.</p>
                    </Block>
                </>
            }
        </Page>
    )
}));

export default EncryptionView;