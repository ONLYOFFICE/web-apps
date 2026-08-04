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

import React, { Fragment, useContext } from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Toggle, Block } from "framework7-react";
import { SettingsContext } from '../../controller/settings/Settings';
import { useTranslation } from "react-i18next";
import { Device } from "../../../../../common/mobile/utils/device";
import SvgIcon from '@common/lib/component/SvgIcon';
import IconHelp from '@common-icons/icon-help.svg';
import IconFeedbackForIos from '@common-ios-icons/icon-feedback.svg?ios';
import IconFeedbackForAndroid from '@common-android-icons/icon-feedback.svg';

const PageHelpAndFeedback = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const settingsContext = useContext(SettingsContext);

    const appOptions = props.storeAppOptions;
    let _canHelp = true,
        _canFeedback = true;

    if (!appOptions.isDisconnected && appOptions.customization) {
        _canHelp = appOptions.customization.help !== false;
        _canFeedback = (
            appOptions.customization.feedback !== false && 
            appOptions.customization.feedback.visible !== false
        );
    }

    return (
        <Page>
            <Navbar title={_t.textHelpAndFeedback} backLink={_t.textBack} />
            <List>

                {_canFeedback &&
                    <ListItem title={t('Settings.textFeedback')} link="#" onClick={settingsContext.showFeedback}>
                        {Device.ios ? 
                            <SvgIcon slot="media" symbolId={IconFeedbackForIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon slot="media" symbolId={IconFeedbackForAndroid.id} className={'icon icon-svg'} />
                        }
                    </ListItem>
                }
                {_canHelp &&
                    <ListItem title={_t.textHelpCenter} link="#" onClick={settingsContext.showHelp}>
                        <SvgIcon slot="media" symbolId={IconHelp.id} className={'icon icon-svg'} />
                    </ListItem>
                }
            </List>
        </Page>
    );
};

const HelpAndFeedback = inject("storeAppOptions",)(observer(PageHelpAndFeedback));

export {HelpAndFeedback};
