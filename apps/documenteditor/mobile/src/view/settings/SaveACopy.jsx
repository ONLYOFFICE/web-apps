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

const SaveACopy = props => {
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
            <Navbar title={_t.textSaveACopy} backLink={_t.textBack} />
            <BlockTitle>{_t.textSaveACopyAs}</BlockTitle>
            <List>
                {!isDjvuFormat &&
                    <ListItem title="DOCX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.DOCX, '.docx')}>
                        <SvgIcon slot="media" symbolId={SvgDocx.id} className={'icon icon-svg '} />
                    </ListItem>
                }
                <ListItem title="PDF" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDF, '.pdf')}>
                    <SvgIcon slot="media" symbolId={SvgPdf.id} className={'icon icon-svg '} />
                </ListItem>
                {isDjvuFormat &&
                    <ListItem title="DJVU" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.DJVU)}>
                        <SvgIcon slot="media" symbolId={SvgDjvu.id} className={'icon icon-svg '} />
                    </ListItem>
                }
                {!isEditableForms && !isDjvuFormat ? [
                    <ListItem title="PDF/A" key="PDF/A" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDFA, '.pdf')}>
                        <SvgIcon slot="media" symbolId={SvgPdfa.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="TXT" key="TXT" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.TXT, '.txt')}>
                        <SvgIcon slot="media" symbolId={SvgTxt.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="RTF" key="RTF" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.RTF, '.rtf')}>
                        <SvgIcon slot="media" symbolId={SvgRtf.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="ODT" key="ODT" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.ODT, '.odt')}>
                        <SvgIcon slot="media" symbolId={SvgOdt.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="HTML" key="HTML" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.HTML, '.html')}>
                        <SvgIcon slot="media" symbolId={SvgHtml.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="DOTX" key="DOTX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.DOTX, '.dotx')}>
                        <SvgIcon slot="media" symbolId={SvgDotx.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="OTT" key="OTT" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.OTT, '.ott')}>
                        <SvgIcon slot="media" symbolId={SvgOtt.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="FB2" key="FB2" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.FB2, '.fb2')}>
                        <SvgIcon slot="media" symbolId={SvgFb2.id} className={'icon icon-svg '} />
                    </ListItem>,
                    <ListItem title="EPUB" key="EPUB" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.EPUB, '.epub')}>
                        <SvgIcon slot="media" symbolId={SvgEpub.id} className={'icon icon-svg '} />
                    </ListItem>,
                    ]
                : null}
            </List>
        </Page>
    )
}

export default inject('storeDocumentInfo', 'storeAppOptions')(observer(SaveACopy));