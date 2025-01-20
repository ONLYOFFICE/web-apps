import React from 'react';
import { Page, Navbar, List, ListItem, BlockTitle, Icon } from "framework7-react";
import { useTranslation } from "react-i18next";
import SvgIcon from '@common/lib/component/SvgIcon';
import IconFormatPptx from '@icons/formats/icon-format-pptx.svg';
import IconFormatPdf from '@common-icons/formats/pdf.svg'; 
import IconFormatPdfa from '@common-icons/formats/pdfa.svg';
import IconFormatOdp from '@icons/formats/icon-format-odp.svg';
import IconFormatPotx from '@icons/formats/icon-format-potx.svg';
import IconFormatOtp from '@icons/formats/icon-format-otp.svg';

const Download = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });

    return (
        <Page>
            <Navbar title={_t.textDownload} backLink={_t.textBack} />
            <BlockTitle>{_t.textDownloadAs}</BlockTitle>
            <List>
                <ListItem title="PPTX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PPTX)}>
                      <SvgIcon symbolId={IconFormatPptx.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="PDF" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDF)}>
                     <SvgIcon symbolId={IconFormatPdf.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="PDF/A" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDFA)}>
                     <SvgIcon symbolId={IconFormatPdfa.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="ODP" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.ODP)}>
                     <SvgIcon symbolId={IconFormatOdp.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="POTX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.POTX)}>
                     <SvgIcon symbolId={IconFormatPotx.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="OTP" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.OTP)}>
                    <SvgIcon symbolId={IconFormatOtp.id} className={'icon icon-svg'} />
                </ListItem>
            </List>
        </Page>
    )
}

export default Download;