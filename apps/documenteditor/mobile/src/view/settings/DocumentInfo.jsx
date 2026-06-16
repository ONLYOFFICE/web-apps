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

const PageDocumentInfo = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const storeInfo = props.storeDocumentInfo;
    const fileType = storeInfo.dataDoc.fileType;
    const dataApp = props.getAppProps();
    const settingsContext = useContext(SettingsContext);
    
    const {
        pageCount,
        paragraphCount,
        symbolsCount,
        symbolsWSCount,
        wordsCount,
    } = storeInfo.infoObj;

    const {
        pageSize,
        title,
        subject,
        description,
        dateCreated,
        modifyBy,
        modifyDate,
        author,
        producer,
        version,
        tagged,
        fastWebView,
        creators
    } = props.docInfoObject;

    const dataDoc = JSON.parse(JSON.stringify(storeInfo.dataDoc));
    const isLoaded = storeInfo.isLoaded;
  
    return (
        <Page>
            <Navbar title={_t.textDocumentInfo} backLink={_t.textBack} />
            {dataDoc?.title ? (
                <Fragment>
                    <BlockTitle>{_t.textDocumentTitle}</BlockTitle>
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
            <BlockTitle>{_t.textStatistic}</BlockTitle>
            <List> 
                <ListItem title={t('Settings.textPages')} after={isLoaded ? String(pageCount) : _t.textLoading}></ListItem>
                <ListItem title={t('Settings.textParagraphs')} after={isLoaded ? String(paragraphCount) : _t.textLoading}></ListItem>
                <ListItem title={t('Settings.textWords')} after={isLoaded ? String(wordsCount) : _t.textLoading}></ListItem>
                <ListItem title={t('Settings.textSymbols')} after={isLoaded ? String(symbolsCount) : _t.textLoading}></ListItem>
                <ListItem title={t('Settings.textSpaces')} after={isLoaded ? String(symbolsWSCount) : _t.textLoading}></ListItem>
                {pageSize && <ListItem title={t('Settings.textPageSize')} after={pageSize}></ListItem>}
            </List>
            {title ? (
                <Fragment>
                    <BlockTitle>{t('Settings.textTitle')}</BlockTitle>
                    <List>
                        <ListItem title={title}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {subject ? (
                <Fragment>
                    <BlockTitle>{t('Settings.textSubject')}</BlockTitle>
                    <List>
                        <ListItem title={subject}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {description ? (
                <Fragment>
                    <BlockTitle>{t('Settings.textComment')}</BlockTitle>
                    <List>
                        <ListItem title={description}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {modifyDate ? (
                <Fragment>
                    <BlockTitle>{t('Settings.textLastModified')}</BlockTitle>
                    <List>
                        <ListItem title={modifyDate}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {modifyBy ? (
                <Fragment>
                    <BlockTitle>{t('Settings.textLastModifiedBy')}</BlockTitle>
                    <List>
                        <ListItem title={modifyBy}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {dateCreated ? (
                <Fragment>
                    <BlockTitle>{t('Settings.textCreated')}</BlockTitle>
                    <List>
                        <ListItem title={dateCreated}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {dataApp ? (
                <Fragment>
                    <BlockTitle>{t('Settings.textApplication')}</BlockTitle>
                    <List>
                        <ListItem title={dataApp}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {fileType === 'xps' && author ? (
                <Fragment>
                    <BlockTitle>{t('Settings.textAuthor')}</BlockTitle>
                    <List>
                        <ListItem title={author}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {fileType === 'pdf' && author ? (
                <Fragment>
                    <BlockTitle>{t('Settings.textAuthor')}</BlockTitle>
                    <List>
                        <ListItem title={author}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            { fileType === 'pdf' && producer ? (
                <Fragment>
                    <BlockTitle>{t('Settings.textPdfProducer')}</BlockTitle>
                    <List>
                        <ListItem title={producer}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            { fileType === 'pdf' ? (
                <List>
                    <ListItem title={t('Settings.textPdfVer')} after={version} />
                    <ListItem title={t('Settings.textPdfTagged')} after={tagged} />
                    <ListItem title={t('Settings.textFastWV')} after={fastWebView} />
                </List>
            ) : null}
            {creators ? (
                <Fragment>
                    <BlockTitle>{t('Settings.textAuthor')}</BlockTitle>
                    <List>
                        {
                            creators.split(/\s*[,;]\s*/).map(item => {
                                return <ListItem key="item" title={item}></ListItem>
                            })
                        }
                    </List>
                </Fragment>
            ) : null}
        </Page>
    );
};

const DocumentInfo = inject("storeDocumentInfo")(observer(PageDocumentInfo));

export default DocumentInfo;
