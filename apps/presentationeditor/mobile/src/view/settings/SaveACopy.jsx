import React from 'react';
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Icon } from "framework7-react";
import { useTranslation } from "react-i18next";
import SvgIcon from '@common/lib/component/SvgIcon';
import IconFormatPptx from '@icons/formats/icon-format-pptx.svg';
import IconFormatPdf from '@common-icons/formats/pdf.svg'; 
import IconFormatPdfa from '@common-icons/formats/pdfa.svg';
import IconFormatOdp from '@icons/formats/icon-format-odp.svg';
import IconFormatPotx from '@icons/formats/icon-format-potx.svg';
import IconFormatOtp from '@icons/formats/icon-format-otp.svg';

const SaveACopy = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });

    return (
        <Page>
            <Navbar title={_t.textSaveACopy} backLink={_t.textBack} />
            <BlockTitle>{_t.textSaveACopyAs}</BlockTitle>
            <List>
                <ListItem title="PPTX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PPTX, '.pptx')}>
                        <SvgIcon slot="media" symbolId={IconFormatPptx.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="PDF" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDF, '.pdf')}>
                        <SvgIcon slot="media" symbolId={IconFormatPdf.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="PDF/A" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.PDFA, '.pdf')}>
                        <SvgIcon slot="media"symbolId={IconFormatPdfa.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="ODP" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.ODP, '.odp')}>
                        <SvgIcon slot="media" symbolId={IconFormatOdp.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="POTX" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.POTX, '.potx')}>
                        <SvgIcon slot="media"symbolId={IconFormatPotx.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title="OTP" onClick={() => props.onSaveFormat(Asc.c_oAscFileType.OTP, '.otp')}>
                    <SvgIcon slot="media" symbolId={IconFormatOtp.id} className={'icon icon-svg'} />
                </ListItem>
            </List>
        </Page>
    )
}

export default inject('storePresentationInfo', 'storeAppOptions')(observer(SaveACopy));