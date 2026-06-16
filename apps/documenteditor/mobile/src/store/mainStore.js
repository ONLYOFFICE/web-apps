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

import {storeDocumentSettings} from './documentSettings';
import {storeFocusObjects} from "./focusObjects";
import {storeUsers} from '../../../../common/mobile/lib/store/users';
import {storeTextSettings} from "./textSettings";
import {storeParagraphSettings} from "./paragraphSettings";
import {storeShapeSettings} from "./shapeSettings";
import {storeImageSettings} from "./imageSettings";
import {storeTableSettings} from "./tableSettings";
import {storeChartSettings} from "./chartSettings";
import {storeDocumentInfo} from "./documentInfo";
import {storeLinkSettings} from './linkSettings';
import {storeApplicationSettings} from './applicationSettings';
import {storeAppOptions} from "./appOptions";
import {storeReview} from '../../../../common/mobile/lib/store/review';
import {storeComments} from "../../../../common/mobile/lib/store/comments";
import {storeToolbarSettings} from "./toolbar";
import { storeNavigation } from './navigation';
import { storeThemes } from '../../../../common/mobile/lib/store/themes';
import { storeVersionHistory } from '../../../../common/mobile/lib/store/versionHistory';
import { storePalette } from "./palette";

export const stores = {
    storeAppOptions: new storeAppOptions(),
    storeFocusObjects: new storeFocusObjects(),
    storeDocumentSettings: new storeDocumentSettings(),
    users: new storeUsers(),
    storeTextSettings: new storeTextSettings(),
    storeLinkSettings: new storeLinkSettings(),
    storeParagraphSettings: new storeParagraphSettings(),
    storeShapeSettings: new storeShapeSettings(),
    storeChartSettings: new storeChartSettings(),
    storeImageSettings: new storeImageSettings(),
    storeTableSettings: new storeTableSettings(),
    storeDocumentInfo: new storeDocumentInfo(),
    storeApplicationSettings: new storeApplicationSettings(),
    storePalette: new storePalette(),
    storeReview: new storeReview(),
    storeComments: new storeComments(),
    storeToolbarSettings: new storeToolbarSettings(),
    storeNavigation: new storeNavigation(),
    storeThemes: new storeThemes(),
    storeVersionHistory: new storeVersionHistory()
};

