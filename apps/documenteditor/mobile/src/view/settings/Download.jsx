import React from 'react';
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Icon } from "framework7-react";
import { useTranslation } from "react-i18next";

const Download = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const storeDocumentInfo = props.storeDocumentInfo;
    const dataDoc = storeDocumentInfo.dataDoc;
    const isDjvuFormat = dataDoc.fileType === 'djvu';
    const isForm = props.isForm;
    const canFillForms = props.canFillForms;
    const isEditableForms = isForm && canFillForms;

    return (
        <Page>
            <Navbar title={isEditableForms ? t('Settings.textExport') : _t.textDownload} backLink={_t.textBack} />
            <BlockTitle>{isEditableForms ? t('Settings.textExportAs') : _t.textDownloadAs}</BlockTitle>
            <List>
                {!isDjvuFormat &&
                    <ListItem title="DOCX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.DOCX)}>
                        <Icon slot="media" icon="icon-format-docx"></Icon>
                    </ListItem>
                }
                <ListItem title="PDF" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDF)}>
                    <Icon slot="media" icon="icon-format-pdf"></Icon>
                </ListItem>
                {isDjvuFormat &&
                    <ListItem title="DJVU" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.DJVU)}>
                        <Icon slot="media" icon="icon-format-djvu"></Icon>
                    </ListItem>
                }
                {!isEditableForms && !isDjvuFormat ? [
                    <ListItem title="PDF/A" key="PDF/A" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDFA)}>
                        <Icon slot="media" icon="icon-format-pdfa"></Icon>
                    </ListItem>,
                    <ListItem title="TXT" key="TXT" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.TXT)}>
                        <Icon slot="media" icon="icon-format-txt"></Icon>
                    </ListItem>,
                    <ListItem title="RTF" key="RTF" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.RTF)}>
                        <Icon slot="media" icon="icon-format-rtf"></Icon>
                    </ListItem>,
                    <ListItem title="ODT" key="ODT" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.ODT)}>
                        <Icon slot="media" icon="icon-format-odt"></Icon>
                    </ListItem>,
                    <ListItem title="HTML" key="HTML" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.HTML)}>
                        <Icon slot="media" icon="icon-format-html"></Icon>
                    </ListItem>,
                    <ListItem title="DOTX" key="DOTX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.DOTX)}>
                        <Icon slot="media" icon="icon-format-dotx"></Icon>
                    </ListItem>,
                    <ListItem title="OTT" key="OTT" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.OTT)}>
                        <Icon slot="media" icon="icon-format-ott"></Icon>
                    </ListItem>,
                    <ListItem title="FB2" key="FB2" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.FB2)}>
                        <Icon slot="media" icon="icon-format-fb2"></Icon>
                    </ListItem>,
                    <ListItem title="EPUB" key="EPUB" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.EPUB)}>
                        <Icon slot="media" icon="icon-format-epub"></Icon>
                    </ListItem>,
                    ]
                : null}
            </List>
        </Page>
    )
}

export default inject('storeDocumentInfo', 'storeAppOptions')(observer(Download));