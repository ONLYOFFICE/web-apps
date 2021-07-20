import React from 'react';
import { observer, inject } from "mobx-react";
import { f7, Page, Navbar, List, ListItem, BlockTitle, ListButton } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageEncoding = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeEncoding = props.storeEncoding;
    const valueEncoding = storeEncoding.valueEncoding;
    const nameDelimeter = storeEncoding.nameDelimeter;
    const valueDelimeter = storeEncoding.valueDelimeter;
    const nameEncoding = storeEncoding.nameEncoding;
    const mode = storeEncoding.mode;

    return (
        <Page>
            <Navbar title={_t.textChooseCsvOptions} backLink={mode === 2 ? _t.textBack : ''} />
            <BlockTitle>{_t.textDelimeter}</BlockTitle>
            <List>
                <ListItem title={nameDelimeter} href="/delimeter-list/"></ListItem>
            </List>
            <BlockTitle>{_t.textEncoding}</BlockTitle>
            <List>
                <ListItem title={nameEncoding} href="/encoding-list/"></ListItem>
            </List>
            <List className="buttons-list">
                <ListButton className='button-fill button-raised' title={mode === 2 ?_t.textDownload : _t.txtOk} onClick={() => props.onSaveFormat(mode, valueEncoding, valueDelimeter)}></ListButton>
            </List>
        </Page>
    )
}

const PageEncodingList = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeEncoding = props.storeEncoding;
    const valueEncoding = storeEncoding.valueEncoding;
    const pages = storeEncoding.pages;
    const pagesName = storeEncoding.pagesName;
    
    return (
        <Page>
            <Navbar title={_t.txtDownloadCsv} backLink={_t.textBack} />
            <BlockTitle>{_t.textChooseEncoding}</BlockTitle>
            <List>
                {pagesName.map((name, index) => {
                    return (
                        <ListItem radio checked={valueEncoding === pages[index]} title={name} key={index} value={pages[index]} onChange={() => {
                            storeEncoding.changeEncoding(pages[index]);
                            f7.views.current.router.back();
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageDelimeterList = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeEncoding = props.storeEncoding;
    const valueDelimeter = storeEncoding.valueDelimeter;
    const namesDelimeter = storeEncoding.namesDelimeter;
    const valuesDelimeter = storeEncoding.valuesDelimeter;
    
    return (
        <Page>
            <Navbar title={_t.txtDownloadCsv} backLink={_t.textBack} />
            <BlockTitle>{_t.textChooseDelimeter}</BlockTitle>
            <List>
                {namesDelimeter.map((name, index) => {
                    return (
                        <ListItem radio checked={valueDelimeter === valuesDelimeter[index]} title={name} key={index} value={valuesDelimeter[index]} onChange={() => {
                            storeEncoding.changeDelimeter(valuesDelimeter[index]);
                            f7.views.current.router.back();
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const Encoding = inject("storeEncoding")(observer(PageEncoding));
const EncodingList = inject("storeEncoding")(observer(PageEncodingList));
const DelimeterList = inject("storeEncoding")(observer(PageDelimeterList));

export {EncodingList, Encoding, DelimeterList}