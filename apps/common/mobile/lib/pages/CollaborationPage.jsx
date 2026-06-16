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
import { List, ListItem, Navbar, NavRight, Page, Icon, Link } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from "../../utils/device";
import SvgIcon from '@common/lib/component/SvgIcon';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';
import IconReviewIos from '@common-ios-icons/icon-review.svg?ios';
import IconReviewAndroid from '@common-android-icons/icon-review.svg';
import IconSharingSettings from '@common-icons/icon-sharing-settings.svg';
import IconInsertCommentIos from '@common-ios-icons/icon-insert-comment.svg?ios';
import IconInsertCommentAndroid from '@common-android-icons/icon-insert-comment.svg';
import IconUsers from '@common-icons/icon-users.svg';

const CollaborationPage = props => {
    const { t } = useTranslation();
    const _t = t('Common.Collaboration', {returnObjects: true});
    const appOptions = props.storeAppOptions;
    const isForm = appOptions.isForm;
    const sharingSettingsUrl = appOptions.sharingSettingsUrl;
    const isViewer = appOptions.isViewer;

    return (
        <Page name="collab__main">
            <Navbar title={_t.textCollaboration}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose=".coauth__sheet">
                            {Device.ios ? 
                                <SvgIcon slot="media" symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon slot="media" symbolId={IconExpandDownAndroid.id} className={'icon icon-svg down'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {(sharingSettingsUrl && !isForm) &&
                    <ListItem title={t('Common.Collaboration.textSharingSettings')} link="/sharing-settings/">
                        <SvgIcon slot="media" symbolId={IconSharingSettings.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {props.users.editUsers.length > 0 &&
                    <ListItem link={'/users/'} title={_t.textUsers}>
                            <SvgIcon slot="media" symbolId={IconUsers.id} className={'icon icon-svg'} />
                    </ListItem>
                }
                {appOptions.canViewComments &&
                    <ListItem link='/comments/' title={_t.textComments}>
                        {Device.ios ? 
                            <SvgIcon slot="media" symbolId={IconInsertCommentIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon slot="media" symbolId={IconInsertCommentAndroid.id} className={'icon icon-svg'} />
                        }
                    </ListItem>
                }
                {(window.editorType === 'de' && (appOptions.canReview || appOptions.canViewReview) && !isViewer) &&
                    <ListItem link={'/review/'} title={_t.textReview}>
                        {Device.ios ? 
                            <SvgIcon slot="media" symbolId={IconReviewIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon slot="media" symbolId={IconReviewAndroid.id} className={'icon icon-svg'} />
                        }
                    </ListItem>
                }
            </List>
        </Page>
    )
};

let storeInfo;

switch (window.asceditor) {
    case 'word':
        storeInfo = 'storeDocumentInfo';
        break;
    case 'slide':
        storeInfo = 'storePresentationInfo';
        break;
    case 'cell':
        storeInfo = 'storeSpreadsheetInfo';
        break;
    case 'visio':
        storeInfo = 'storeVisioInfo';
        break;
}

const Collaboration = inject('storeAppOptions', 'users', storeInfo)(observer(CollaborationPage));

export { Collaboration as CollaborationPage };
