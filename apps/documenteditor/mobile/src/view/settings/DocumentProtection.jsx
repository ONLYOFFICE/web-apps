import React, { useState } from 'react';
import { observer, inject } from "mobx-react";
import { Device } from '../../../../../common/mobile/utils/device';
import { Page, Navbar, List, ListItem, BlockTitle, Toggle, NavRight, f7, Link, ListInput, Icon, Block } from "framework7-react";
import { useTranslation } from "react-i18next";

const ProtectionDocumentView = inject("storeAppOptions")(observer(props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const isIos = Device.ios;
    const appOptions = props.storeAppOptions;
    const typeProtection = appOptions.typeProtection;
    const [isPassword, setPassword] = useState(false);
    const [password, changePassword] = useState('');
    const [passwordRepeat, repeatPassword] = useState('');
    const isDisabledProtection = isPassword && (!password.length || !passwordRepeat.length);

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

    return (
        <Page>
            <Navbar title={t('Settings.textProtectDocument')} backLink={_t.textBack}>
                <NavRight>
                    <Link text={isIos && t('Settings.textSave')} className={isDisabledProtection && 'disabled'} onClick={() => {
                        if(password !== passwordRepeat) {
                            showErrorDialog();
                        } else {
                            props.onProtectDocument(typeProtection, password);
                        }
                    }}>
                        {Device.android && <Icon icon='icon-check'/>}
                    </Link>
                </NavRight>
            </Navbar>
            <List>
                <ListItem title={t('Settings.textSetPassword')}>
                    <Toggle checked={isPassword} onToggleChange={() => {
                        setPassword(!isPassword);
                    }} />
                </ListItem>
            </List>
            {isPassword &&
                <>
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
            <BlockTitle>{t('Settings.textTypeEditing')}</BlockTitle>
            <List>
                <ListItem radio checked={typeProtection === Asc.c_oAscEDocProtect.ReadOnly} title={t('Settings.textNoChanges')} onClick={() => {
                    appOptions.setTypeProtection(Asc.c_oAscEDocProtect.ReadOnly);
                }}></ListItem>
                <ListItem radio checked={typeProtection === Asc.c_oAscEDocProtect.Forms} title={t('Settings.textFillingForms')} onClick={() => {
                    appOptions.setTypeProtection(Asc.c_oAscEDocProtect.Forms);
                }}></ListItem>
                <ListItem radio checked={typeProtection === Asc.c_oAscEDocProtect.TrackedChanges} title={t('Settings.textTrackedChanges')} onClick={() => {
                    appOptions.setTypeProtection(Asc.c_oAscEDocProtect.TrackedChanges);
                }}></ListItem>
                <ListItem radio checked={typeProtection === Asc.c_oAscEDocProtect.Comments} title={t('Settings.textComments')} onClick={() => {
                    appOptions.setTypeProtection(Asc.c_oAscEDocProtect.Comments);
                }}></ListItem>
            </List>
            <Block>
                <p>Allow only this type of editing in the document.</p>
            </Block>
        </Page>
    )
}));

export default ProtectionDocumentView;