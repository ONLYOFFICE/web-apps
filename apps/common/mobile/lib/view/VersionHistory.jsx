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

import React, { useCallback, useEffect, useState } from 'react';
import { Page, Navbar, BlockTitle, List, ListItem, Icon, NavRight, Link } from "framework7-react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";
import { Device } from '../../utils/device';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';

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
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg down'} />
                            }
                        </Link>
                    </NavRight>
                    : !isNavigate &&
                        <NavRight>
                            <Link popoverClose="#version-history-popover">
                                {Device.ios ? 
                                    <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                    <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg down'} />
                                }
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
                                                <div slot='media' className='version-history__user' style={{backgroundColor: usersVersions.find(user => user.id === version.userid).color}}>{usersStore.getInitials(AscCommon.UserInfoParser.getParsedName(version.username))}</div>
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
