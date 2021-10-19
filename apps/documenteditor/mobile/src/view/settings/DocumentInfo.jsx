import React, {Fragment} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageDocumentInfo = (props) => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const storeInfo = props.storeDocumentInfo;
    const dataApp = props.getAppProps();
    
    const {
        pageCount,
        paragraphCount,
        symbolsCount,
        symbolsWSCount,
        wordsCount,
    } = storeInfo.infoObj;

    const dataDoc = JSON.parse(JSON.stringify(storeInfo.dataDoc));
    const isLoaded = storeInfo.isLoaded;
  
    return (
        <Page>
            <Navbar title={_t.textDocumentInfo} backLink={_t.textBack} />
            {dataDoc.title ? (
                <Fragment>
                    <BlockTitle>{_t.textDocumentTitle}</BlockTitle>
                    <List>
                        <ListItem title={dataDoc.title}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {dataDoc.info.author || dataDoc.info.owner ? (
                <Fragment>
                    <BlockTitle>{_t.textOwner}</BlockTitle>
                    <List>
                        <ListItem title={dataDoc.info.author || dataDoc.info.owner}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {dataDoc.info.folder ? (
                <Fragment>  
                    <BlockTitle>{_t.textLocation}</BlockTitle>
                    <List>
                        <ListItem title={dataDoc.info.folder}></ListItem>
                    </List>
                </Fragment>
            ) : null}
            {dataDoc.info.uploaded || dataDoc.info.created ? (  
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
            </List>
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

const DocumentInfo = inject("storeDocumentInfo")(observer(PageDocumentInfo));

export default DocumentInfo;