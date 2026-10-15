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

import React, {useEffect} from 'react';
import ViewSharingSettings from "../view/SharingSettings";
import {observer, inject} from "mobx-react";

const SharingSettingsController = props => {
    const appOptions = props.storeAppOptions;
    const canRequestSharingSettings = appOptions.canRequestSharingSettings;
    const sharingSettingsUrl = appOptions.sharingSettingsUrl;

    const changeAccessRights = () => {
        if (canRequestSharingSettings) {
            Common.Gateway.requestSharingSettings();
        }
    };

    const setSharingSettings = data => {
        if (data) {
            Common.Notifications.trigger('collaboration:sharingupdate', data.sharingSettings);
        }
    }

    const onMessage = msg => {
        if(msg) {
            const msgData = JSON.parse(msg.data);

            if (msgData && msgData?.Referer == "onlyoffice") {
                if (msgData?.needUpdate) {
                    setSharingSettings(msgData.sharingSettings);
                }
                props.f7router.back();
            }
        }
    };

    const bindWindowEvents = () => {
        if (window.addEventListener) {
            window.addEventListener("message", onMessage, false);
        } else if (window.attachEvent) {
            window.attachEvent("onmessage", onMessage);
        }
    };

    const unbindWindowEvents = () => {
        if (window.removeEventListener) {
            window.removeEventListener("message", onMessage);
        } else if (window.detachEvent) {
            window.detachEvent("onmessage", onMessage);
        }
    };

    useEffect(() => {
        bindWindowEvents();
        Common.Notifications.on('collaboration:sharing', changeAccessRights);

        if (!!sharingSettingsUrl && sharingSettingsUrl.length || canRequestSharingSettings) {
            Common.Gateway.on('showsharingsettings', changeAccessRights);
            Common.Gateway.on('setsharingsettings', setSharingSettings);
        }

        return () => {
            unbindWindowEvents();
        }
    }, []);

    return (
        <ViewSharingSettings sharingSettingsUrl={sharingSettingsUrl} />
    );
};

export default inject('storeAppOptions')(observer(SharingSettingsController));
