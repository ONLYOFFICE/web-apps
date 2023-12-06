import React, { useCallback, useEffect, useState } from 'react';
import { Page, Navbar, BlockTitle, List, ListItem, Icon, NavRight, Link } from "framework7-react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";
import { Device } from '../../utils/device';

const VersionHistoryView = inject('storeVersionHistory', 'users')(observer(props => {
    const { t } = useTranslation();
    const usersStore = props.users;
    const historyStore = props.storeVersionHistory;
    const currentVersion = historyStore.currentVersion;
    const arrVersions = historyStore.arrVersions;
    const [filteredVersions, setFilteredVersions] = useState([]);
    const isNavigate = props.isNavigate;
    const usersVersions = historyStore.usersVersions;

    useEffect(() => {
        if(arrVersions.length > 0) {
            const filteredVersions = groupByVersions(arrVersions);
            setFilteredVersions(filteredVersions);
        }
    }, [arrVersions]);

    const handleClickRevision = useCallback(version => {
        if(version !== currentVersion) {
            props.onSelectRevision(version);
        }
    }, []);

    function groupByVersions(arr) {
        return arr.reduce((result, revision) => {
            const value = revision.version;
            
            const arrVersion = result.find(arr => {
                return arr[0].version === value;
            });
            
            if (arrVersion) {
                arrVersion.push(revision);
            } else {
                result.push([revision]);
            }
            
            return result;
        }, []);
    }

    return (
        <Page className='page-version-history'>
            <Navbar title={t('Common.VersionHistory.textVersionHistory')} backLink={!Device.phone && isNavigate ? t('Common.VersionHistory.textBack') : null}>
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
            {filteredVersions.length > 0 ? 
                filteredVersions.map((versions, index) => {
                    return (
                        <React.Fragment key={`block-${index}`}>
                            <BlockTitle className='version-history__title'>{`${versions.find(ver => ver.selected) ? t('Common.VersionHistory.textCurrent') + ' - ' : ''} ${t('Common.VersionHistory.textVersion')} ${versions[0].revision}`}</BlockTitle>
                                <List className='version-history__list' dividersIos mediaList outlineIos strongIos>
                                    {versions.map((version, index) => {
                                        return (
                                            <ListItem className={`version-history__item ${version === currentVersion ? 'version-history__item_active' : ''}`} key={`version-${index}`} link='#' title={version.created} subtitle={AscCommon.UserInfoParser.getParsedName(version.username)} onClick={() => handleClickRevision(version)}>
                                                <div slot='media' className='version-history__user' style={{backgroundColor: usersVersions.find(user => user.id === version.userid).color}}>{usersStore.getInitials(version.username)}</div>
                                                {(version === currentVersion && !version.selected && version.canRestore) &&
                                                    <div slot="inner">
                                                        <button type='button' className='version-history__btn' onClick={() => props.onRestoreRevision(version)}>{t('Common.VersionHistory.textRestore')}</button>
                                                    </div>
                                                }
                                            </ListItem>
                                        )
                                    })}
                                </List>
                        </React.Fragment>
                    )
                }) : null}
        </Page>
    )
}));

export default VersionHistoryView;