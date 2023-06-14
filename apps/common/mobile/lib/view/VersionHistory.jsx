import React, { Fragment } from 'react';
import { Page, Navbar, BlockTitle, List, ListItem, Icon } from "framework7-react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";

const VersionHistoryView = inject('storeVersionHistory')(observer(props => {
    const { t } = useTranslation();
    const historyStore = props.storeVersionHistory;
    const arrVersions = historyStore.arrVersions;
    const _t = t("Settings", { returnObjects: true });

    return (
        <Page className='page-version-history'>
            <Navbar title={t('Settings.textVersionHistory')} backLink={_t.textBack} />
            {arrVersions.map((version, index) => {
                return (
                    <div className='version-history-block' key={index} onClick={() => props.onSelectRevision(version)}>
                        <BlockTitle className='version-history-block__title'>{`${t('Settings.textVersion')} ${version.revision}`}</BlockTitle>
                        <List className='version-history-block__list' dividersIos mediaList outlineIos strongIos>
                            <ListItem link='#' title={version.created} subtitle={version.username} >
                                <Icon slot='media' icon='icon-doc-history' />
                            </ListItem>
                        </List>
                    </div>
                )
            })}
        </Page>
    )
}));

export default VersionHistoryView;