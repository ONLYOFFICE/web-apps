import React from 'react';
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Icon } from "framework7-react";
import { useTranslation } from "react-i18next";
import SvgIcon from "../../components/svgicon";
import SvgDocx from '../../../resources/img/formats/docx.svg'
import SvgPdf from '../../../resources/img/formats/pdf.svg'
import SvgDotx from '../../../resources/img/formats/dotx.svg'

const Download = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const storeDocumentInfo = props.storeDocumentInfo;
    const dataDoc = storeDocumentInfo.dataDoc;
    const canFeatureForms = props.storeAppOptions.canFeatureForms;
    const isAvailableExt = dataDoc.fileType === 'docxf' || dataDoc.fileType === 'docx' || dataDoc.fileType === 'pdf' || dataDoc.fileType === 'pdfa';
    const isForm = props.isForm;
    const canFillForms = props.canFillForms;
    const isEditableForms = isForm && canFillForms;

    return (
        <Page>
            <Navbar title={isEditableForms ? t('Settings.textExport') : _t.textDownload} backLink={_t.textBack} />
            <BlockTitle>{isEditableForms ? t('Settings.textExportAs') : _t.textDownloadAs}</BlockTitle>
            <List>
                <ListItem title="DOCX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.DOCX)}>
                    <SvgIcon slot="media" symbolId={SvgDocx.id} className={'icon icon-svg icon-svg-format'} />
                </ListItem>
                {canFeatureForms && isAvailableExt ? [
                    <ListItem title="DOCXF" key="DOCXF" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.DOCXF)}>
                        <Icon slot="media" icon="icon-format-docxf"></Icon>
                    </ListItem>,
                ] : null}
                <ListItem title="PDF" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDF)}>
                    <SvgIcon slot="media" symbolId={SvgPdf.id} className={'icon icon-svg icon-svg-format'} />
                </ListItem>
                {!isEditableForms ? [
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
                        <SvgIcon slot="media" symbolId={SvgDotx.id} className={'icon icon-svg icon-svg-format'} />
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