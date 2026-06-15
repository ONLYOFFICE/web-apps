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
