import React from 'react';
import { observer, inject } from "mobx-react";
import { f7, Page, Navbar, List, ListItem, BlockTitle, ListButton } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageEncoding = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const storeEncoding = props.storeEncoding;
    const valueEncoding= storeEncoding.valueEncoding;
    const nameEncoding = storeEncoding.nameEncoding;
    const formatOptions = storeEncoding.formatOptions;
    
    return (
        <Page>
            <Navbar title={_t.textChooseTxtOptions} backLink={_t.textBack} />
            <BlockTitle>{_t.textEncoding}</BlockTitle>
            <List>
                <ListItem title={nameEncoding} href="/encoding-list/"></ListItem>
            </List>
            <List className="buttons-list">
                <ListButton className='button-fill button-raised' title={_t.textDownload} onClick={() => props.onSaveFormat(formatOptions, valueEncoding)}></ListButton>
            </List>
        </Page>
    )
}

const PageEncodingList = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const storeEncoding = props.storeEncoding;
    const valueEncoding = storeEncoding.valueEncoding;
    const pages = storeEncoding.pages;
    const pagesName = storeEncoding.pagesName;
    
    return (
        <Page>
            <Navbar title={_t.txtDownloadTxt} backLink={_t.textBack} />
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

const Encoding = inject("storeEncoding")(observer(PageEncoding));
const EncodingList = inject("storeEncoding")(observer(PageEncodingList));

export {EncodingList, Encoding}