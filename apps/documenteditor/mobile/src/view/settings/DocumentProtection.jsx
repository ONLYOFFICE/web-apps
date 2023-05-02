import React, { useState } from 'react';
import { observer, inject } from "mobx-react";
import { Device } from '../../../../../common/mobile/utils/device';
import { Page, Navbar, List, ListItem, BlockTitle, Toggle, NavRight, f7, Link, ListInput, Icon, Block } from "framework7-react";
import { useTranslation } from "react-i18next";
import PasswordField from '../../components/PasswordField/PasswordField';

const ProtectionDocumentView = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const isIos = Device.ios;
    const [stateTypeProtection, setStateTypeProtection] = useState(Asc.c_oAscEDocProtect.ReadOnly);
    const [isRequirePassword, setRequirePassword] = useState(false);
    const [password, changePassword] = useState('');
    const [passwordRepeat, changeRepeationPassword] = useState('');
    const isDisabledProtection = isRequirePassword ? ((!password.length || !passwordRepeat.length) || stateTypeProtection === null) : stateTypeProtection === null;

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
        if(isRequirePassword && password !== passwordRepeat) {
            showErrorDialog();
        } else {
            props.onProtectDocument(stateTypeProtection, password);
        }
    }

    return (
        <Page>
            <Navbar title={t('Settings.textProtectDocument')} backLink={_t.textBack}>
                <NavRight>
                    <Link text={isIos && t('Settings.textSave')} className={isDisabledProtection && 'disabled'} onClick={changeHanlder}>
                        {Device.android && <Icon icon='icon-check'/>}
                    </Link>
                </NavRight>
            </Navbar>
            <List>
                <ListItem title={t('Settings.textSetPassword')}>
                    <Toggle checked={isRequirePassword} onToggleChange={() => {
                        setRequirePassword(!isRequirePassword);
                        changePassword('');
                        changeRepeationPassword('');
                    }} />
                </ListItem>
            </List>
            {isRequirePassword &&
                <>
                    <div className='inputs-list list inline-labels'>
                        <ul>
                            <PasswordField label={t('Settings.textPassword')} placeholder={t('Settings.textRequired')} value={password} handlerChange={changePassword} maxLength={15} />
                            <PasswordField label={t('Settings.textVerify')} placeholder={t('Settings.textRequired')} value={passwordRepeat} handlerChange={changeRepeationPassword} maxLength={15} />
                        </ul>
                    </div>
                    <Block>
                        <p>If the password is forgotten or lost, it cannot be recovered.</p>
                    </Block>
                </>
            }
            <BlockTitle>{t('Settings.textTypeEditing')}</BlockTitle>
            <List>
                <ListItem radio checked={stateTypeProtection === Asc.c_oAscEDocProtect.ReadOnly} title={t('Settings.textNoChanges')} onClick={() => {
                    setStateTypeProtection(Asc.c_oAscEDocProtect.ReadOnly);
                }}></ListItem>
                <ListItem radio checked={stateTypeProtection === Asc.c_oAscEDocProtect.Forms} title={t('Settings.textFillingForms')} onClick={() => {
                    setStateTypeProtection(Asc.c_oAscEDocProtect.Forms);
                }}></ListItem>
                <ListItem radio checked={stateTypeProtection === Asc.c_oAscEDocProtect.TrackedChanges} title={t('Settings.textTrackedChanges')} onClick={() => {
                    setStateTypeProtection(Asc.c_oAscEDocProtect.TrackedChanges);
                }}></ListItem>
                <ListItem radio checked={stateTypeProtection === Asc.c_oAscEDocProtect.Comments} title={t('Settings.textComments')} onClick={() => {
                    setStateTypeProtection(Asc.c_oAscEDocProtect.Comments);
                }}></ListItem>
            </List>
            <Block>
                <p>Allow only this type of editing in the document.</p>
            </Block>
        </Page>
    )
};

export default ProtectionDocumentView;