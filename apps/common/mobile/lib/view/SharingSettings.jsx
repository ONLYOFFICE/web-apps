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

import React, { useEffect, useRef } from 'react';
import { Navbar, Page } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../utils/device';

const frameStyle = {
    width: '100%',
    height: '100%',
    minHeight: 380
}

const ViewSharingSettings = props => {
    const { t } = useTranslation();
    const sharingSettingsUrl = props.sharingSettingsUrl;
    const _t = t('Common.Collaboration', {returnObjects: true});
    const ref = useRef(null);

    useEffect(() => {
        const coauthSheetElem = ref.current.closest('.coauth__sheet');

        if(Device.phone) {
            coauthSheetElem.style.height = '100%';
            coauthSheetElem.style.maxHeight = '100%';
        }

        return () => {
            if(Device.phone) {
                coauthSheetElem.style.height = null;
                coauthSheetElem.style.maxHeight = '65%';
            }
        }
    }, []);

    return (
        <Page>
            <Navbar title={t('Common.Collaboration.textSharingSettings')} backLink={_t.textBack} />
            <div id="sharing-placeholder" className="sharing-placeholder" ref={ref}>
                <iframe style={frameStyle} frameBorder={0} scrolling="0" align="top" src={sharingSettingsUrl}></iframe>
            </div>
        </Page>
    )
};

export default ViewSharingSettings;
