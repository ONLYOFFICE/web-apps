import React, {Fragment} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageDocumentInfo = (props) => {
  const { t } = useTranslation();
  const _t = t("Settings", { returnObjects: true });
  const storeInfo = props.storeDocumentInfo;
  const dataApp = props.getAppProps();
  const dataModified = props.getModified();
  const dataModifiedBy = props.getModifiedBy();
  const {
    pageCount,
    paragraphCount,
    symbolsCount,
    symbolsWSCount,
    wordsCount,
  } = storeInfo.infoObj;
  const dataDoc = JSON.parse(JSON.stringify(storeInfo.dataDoc));
  const isLoaded = storeInfo.isLoaded;
  console.log(pageCount, paragraphCount, symbolsCount, symbolsWSCount, wordsCount);
  
  return (
        <Page>
            <Navbar title={_t.textDocumentInfo} backLink={_t.textBack} />
            <BlockTitle>{_t.textDocumentTitle}</BlockTitle>
            <List>
                <ListItem title={dataDoc.title}></ListItem>
            </List>
            <BlockTitle>{_t.textOwner}</BlockTitle>
            <List>
                <ListItem title={dataDoc.info.author}></ListItem>
            </List>
            <BlockTitle>{_t.textUploaded}</BlockTitle>
            <List>
                <ListItem title={dataDoc.info.created}></ListItem>
            </List>
            <BlockTitle>{_t.textStatistic}</BlockTitle>
            <List> 
                <ListItem title="Pages" after={isLoaded ? pageCount : _t.textLoading}></ListItem>
                <ListItem title="Paragraphs" after={isLoaded ? paragraphCount : _t.textLoading}></ListItem>
                <ListItem title="Words" after={isLoaded ? wordsCount : _t.textLoading}></ListItem>
                <ListItem title="Symbols" after={isLoaded ? symbolsCount : _t.textLoading}></ListItem>
                <ListItem title="Spaces" after={isLoaded ? symbolsWSCount : _t.textLoading}></ListItem>
            </List>
            {dataModified && dataModifiedBy ? (
                <Fragment>
                    <BlockTitle>{_t.textLastModified}</BlockTitle>
                    <List>
                        <ListItem title={dataModified}></ListItem>
                    </List>
                    <BlockTitle>{_t.textLastModifiedBy}</BlockTitle>
                    <List>
                        <ListItem title={dataModifiedBy}></ListItem>
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
        </Page>
    );
};

const DocumentInfo = inject("storeDocumentInfo")(observer(PageDocumentInfo));

export default DocumentInfo;