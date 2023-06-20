import React, { useEffect } from 'react';
import { Page, Navbar, BlockTitle, List, ListItem, Icon, NavRight, Link } from "framework7-react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";
import { Device } from '../../utils/device';

const VersionHistoryView = inject('storeVersionHistory', 'users')(observer(props => {
    const { t } = useTranslation();
    const usersStore = props.users;
    const arrUsers = usersStore.editUsers;
    const historyStore = props.storeVersionHistory;
    const arrVersions = historyStore.arrVersions;
    const currentVersion = historyStore.currentVersion;
    const isNavigate = props.isNavigate;
    const _t = t("Settings", { returnObjects: true });

    return (
        <Page className='page-version-history'>
            <Navbar title={t('Settings.textVersionHistory')} backLink={!Device.phone && isNavigate ? _t.textBack : null}>
                {Device.phone ?
                    <NavRight>
                        <Link sheetClose="#version-history-sheet">
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                    : !isNavigate &&
                        <NavRight>
                            <Link popoverClose="#version-history-popover">
                                <Icon icon='icon-expand-down'/>
                            </Link>
                        </NavRight>
                }
            </Navbar>
            {arrVersions.map((version, index) => {
                return (
                    <div className={`version-history ${version.version === currentVersion.version ? 'version-history_active' : ''}`} key={index} onClick={() => props.onSelectRevision(version)}>
                        <BlockTitle className='version-history__title'>{`${version.selected ? t('Settings.textCurrent') + ' - ' : ''} ${t('Settings.textVersion')} ${version.revision}`}</BlockTitle>
                        <List className='version-history__list' dividersIos mediaList outlineIos strongIos>
                            <ListItem link='#' title={version.created} subtitle={version.username} >
                                <div slot='media' className='version-history__user' style={{backgroundColor: arrUsers.find(user => user.idOriginal === version.userid).color}}>{usersStore.getInitials(version.username)}</div>
                                {(version.version === currentVersion.version && !version.selected) &&
                                    <div slot="inner">
                                        <button type='button' className='version-history__btn' onClick={() => props.onRestoreRevision(version)}>{t('Settings.textRestore')}</button>
                                    </div>
                                }
                            </ListItem>
                        </List>
                    </div>
                )
            })}
        </Page>
    )
}));

export default VersionHistoryView;