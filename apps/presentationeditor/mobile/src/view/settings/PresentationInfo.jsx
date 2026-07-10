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

import React, { Fragment, useContext } from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle } from "framework7-react";
import { useTranslation } from "react-i18next";
import { SettingsContext } from "../../controller/settings/Settings";

const PagePresentationInfo = (props) => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeInfo = props.storePresentationInfo;
    const dataApp = props.getAppProps();
    const dataDoc = JSON.parse(JSON.stringify(storeInfo.dataDoc));
    const settingsContext = useContext(SettingsContext);
    
    return (
        <Page>
            <Navbar title={_t.textPresentationInfo} backLink={_t.textBack} />
            {dataDoc?.title ? (
                <Fragment>
                    <BlockTitle>{_t.textPresentationTitle}</BlockTitle>
                    <List>
                        <ListItem href="#" title={dataDoc.title} onClick={settingsContext.changeTitleHandler}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {dataDoc?.info?.author || dataDoc?.info?.owner ? (
                <Fragment>
                    <BlockTitle>{_t.textOwner}</BlockTitle>
                    <List>
                        <ListItem title={dataDoc.info.author || dataDoc.info.owner}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {dataDoc?.info?.folder ? (
                <Fragment>  
                    <BlockTitle>{_t.textLocation}</BlockTitle>
                    <List>
                        <ListItem title={dataDoc.info.folder}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {dataDoc?.info?.uploaded || dataDoc?.info?.created ? (
                <Fragment>
                    <BlockTitle>{_t.textUploaded}</BlockTitle>
                    <List>
                        <ListItem title={dataDoc.info.uploaded || dataDoc.info.created}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {props.title ? (
                <Fragment>
                    <BlockTitle>{_t.textTitle}</BlockTitle>
                    <List>
                        <ListItem title={props.title}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {props.subject ? (
                <Fragment>
                    <BlockTitle>{_t.textSubject}</BlockTitle>
                    <List>
                        <ListItem title={props.subject}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {props.description ? (
                <Fragment>
                    <BlockTitle>{_t.textComment}</BlockTitle>
                    <List>
                        <ListItem title={props.description}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {props.modified ? (
                <Fragment>
                    <BlockTitle>{_t.textLastModified}</BlockTitle>
                    <List>
                        <ListItem title={props.modified}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {props.modifiedBy ? (
                <Fragment>
                    <BlockTitle>{_t.textLastModifiedBy}</BlockTitle>
                    <List>
                        <ListItem title={props.modifiedBy}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {props.created ? (
                <Fragment>
                    <BlockTitle>{_t.textCreated}</BlockTitle>
                    <List>
                        <ListItem title={props.created}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {dataApp ? (
                <Fragment>
                    <BlockTitle>{_t.textApplication}</BlockTitle>
                    <List>
                        <ListItem title={dataApp}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {props.creators ? (
                <Fragment>
                    <BlockTitle>{_t.textAuthor}</BlockTitle>
                    <List>
                        {
                            props.creators.split(/\s*[,;]\s*/).map(item => {
                                return <ListItem title={item}></ListItem>
                            })
                        }
                    </List>
                </Fragment>
            ) : null}
        </Page>
    );
};

const PresentationInfo = inject("storePresentationInfo")(observer(PagePresentationInfo));

export default PresentationInfo;
