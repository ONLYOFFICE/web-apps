import React from 'react';
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Icon } from "framework7-react";
import { useTranslation } from "react-i18next";
import SvgIcon from '@common/lib/component/SvgIcon';
import SvgPdf from '@common-icons/formats/pdf.svg';
import SvgPdfa from '@common-icons/formats/pdfa.svg';
import SvgDocx from '@icons/formats/docx.svg';
import SvgDotx from '@icons/formats/dotx.svg';
import SvgEpub from '@icons/formats/epub.svg';
import SvgFb2 from '@icons/formats/fb2.svg';
import SvgHtml from '@icons/formats/html.svg';
import SvgOdt from '@icons/formats/odt.svg';
import SvgOtt from '@icons/formats/ott.svg';
import SvgRtf from '@icons/formats/rtf.svg';
import SvgTxt from '@icons/formats/txt.svg';
import SvgDjvu from '@icons/formats/djvu.svg';

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
                        <SvgIcon slot="media" symbolId={SvgDocx.id} className={'icon icon-svg '} />
                    </ListItem>
                }
                <ListItem title="PDF" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDF)}>
                    <SvgIcon slot="media" symbolId={SvgPdf.id} className={'icon icon-svg '} />
                </ListItem>
                {isDjvuFormat &&
                    <ListItem title="DJVU" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.DJVU)}>
                        <SvgIcon slot="media" symbolId={SvgDjvu.id} className={'icon icon-svg '} />
                    </ListItem>
                }
                {!isEditableForms && !isDjvuFormat ? [
                    <ListItem title="PDF/A" key="PDF/A" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDFA)}>
                        <SvgIcon slot="media" symbolId={SvgPdfa.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="TXT" key="TXT" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.TXT)}>
                        <SvgIcon slot="media" symbolId={SvgTxt.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="RTF" key="RTF" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.RTF)}>
                        <SvgIcon slot="media" symbolId={SvgRtf.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="ODT" key="ODT" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.ODT)}>
                        <SvgIcon slot="media" symbolId={SvgOdt.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="HTML" key="HTML" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.HTML)}>
                        <SvgIcon slot="media" symbolId={SvgHtml.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="DOTX" key="DOTX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.DOTX)}>
                        <SvgIcon slot="media" symbolId={SvgDotx.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="OTT" key="OTT" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.OTT)}>
                        <SvgIcon slot="media" symbolId={SvgOtt.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="FB2" key="FB2" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.FB2)}>
                        <SvgIcon slot="media" symbolId={SvgFb2.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="EPUB" key="EPUB" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.EPUB)}>
                        <SvgIcon slot="media" symbolId={SvgEpub.id} className={'icon icon-svg '} />
                    </ListItem>,
                    ]
                : null}
            </List>
        </Page>
    )
}

export default inject('storeDocumentInfo', 'storeAppOptions')(observer(Download));