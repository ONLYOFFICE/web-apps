import React from "react";
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

  if (!isLoaded) {
    console.log(
      pageCount,
      paragraphCount,
      symbolsCount,
      symbolsWSCount,
      wordsCount
    );
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
          <ListItem title="Pages" after={pageCount}></ListItem>
          <ListItem title="Paragraphs" after={paragraphCount}></ListItem>
          <ListItem title="Words" after={wordsCount}></ListItem>
          <ListItem title="Symbols" after={symbolsCount}></ListItem>
          <ListItem title="Spaces" after={symbolsWSCount}></ListItem>
        </List>
        {dataModified && dataModifiedBy ? (
          <Block>
            <BlockTitle>{_t.textLastModified}</BlockTitle>
            <List>
              <ListItem title="11/19/2020 1:13 PM"></ListItem>
            </List>
            <BlockTitle>{_t.textLastModifiedBy}</BlockTitle>
            <List>
              <ListItem title="John Smith"></ListItem>
            </List>
          </Block>
        ) : null}
        {dataApp ? (
          <Block>
            <BlockTitle>{_t.textApplication}</BlockTitle>
            <List>
              <ListItem title="ONLYOFFICE/6.0.2.5"></ListItem>
            </List>
          </Block>
        ) : null}
      </Page>
    );
  }
};

const DocumentInfo = inject("storeDocumentInfo")(observer(PageDocumentInfo));

export default DocumentInfo;