import React from 'react';
import { Page, Navbar } from "framework7-react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";

const VersionHistoryView = inject('storeVersionHistory')(observer(props => {
    const { t } = useTranslation();
    const historyStore = props.storeVersionHistory;
    const arrVersions = historyStore.arrVersions;
    const _t = t("Settings", { returnObjects: true });

    return (
        <Page>
            <Navbar title={t('Settings.textVersionHistory')} backLink={_t.textBack} />
        </Page>
    )
}));

export default VersionHistoryView;