/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
