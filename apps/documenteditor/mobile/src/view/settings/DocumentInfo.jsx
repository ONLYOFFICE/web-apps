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