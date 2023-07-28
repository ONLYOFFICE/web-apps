import React, { useState } from 'react';
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Toggle, NavRight, f7, Link, ListInput, Icon, Block } from "framework7-react";
import { useTranslation } from "react-i18next";

const ProtectionView = inject("storeAppOptions")(observer(props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const appOptions = props.storeAppOptions;
    const isProtected = appOptions.isProtected;

    return (
        <Page>
            <Navbar title={t('Settings.textProtection')} backLink={_t.textBack} />
            <List>
                <ListItem title={isProtected ? t('Settings.textUnprotect') : t('Settings.textProtectDocument')} onClick={() => props.onProtectClick()} link="#">
                    <Icon slot="media" icon="icon-protect-document" />
                </ListItem>
                <ListItem title={t('Settings.textEncryptFile')} link="/encrypt">
                    <Icon slot="media" icon="icon-encrypt-file" />
                </ListItem>
            </List>
        </Page>
    )
}));

export default ProtectionView;