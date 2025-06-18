import React from 'react';
import { Page, Navbar, List, ListItem, BlockTitle, Icon } from "framework7-react";
import { useTranslation } from "react-i18next";
import SvgIcon from '@common/lib/component/SvgIcon';
import IconFormatXlsx from '@icons/formats/icon-format-xlsx.svg';
import IconFormatPdf from '@common-icons/formats/pdf.svg'; 
import IconFormatPdfa from '@common-icons/formats/pdfa.svg';
import IconFormatOds from '@icons/formats/icon-format-ods.svg';
import IconFormatCsv from '@icons/formats/icon-format-csv.svg';
import IconFormatXltx from '@icons/formats/icon-format-xltx.svg';
import IconFormatOts from '@icons/formats/icon-format-ots.svg';

const Download = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });

    return (
        <Page>
            <Navbar title={_t.textDownload} backLink={_t.textBack} />
            <BlockTitle>{_t.textDownloadAs}</BlockTitle>
            <List>
                <ListItem title="XLSX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.XLSX)}>
                    <SvgIcon slot="media" symbolId={IconFormatXlsx.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="PDF" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDF)}>
                    <SvgIcon slot="media" symbolId={IconFormatPdf.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="PDF/A" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDFA)}>
                    <SvgIcon slot="media" symbolId={IconFormatPdfa.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="ODS" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.ODS)}>
                    <SvgIcon slot="media" symbolId={IconFormatOds.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="CSV" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.CSV)}>
                    <SvgIcon slot="media" symbolId={IconFormatCsv.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="XLTX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.XLTX)}>
                    <SvgIcon slot="media" symbolId={IconFormatXltx.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="OTS" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.OTS)}>
                    <SvgIcon slot="media" symbolId={IconFormatOts.id} className={'icon icon-svg'} />
                </ListItem>
            </List>
        </Page>
    )
}

export default Download;