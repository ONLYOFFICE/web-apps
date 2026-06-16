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


define([
], function () {
    const launchController = function () {
        let _all_scripts_loaded = false;

        const init = function (api) {
            this.api = api;
            Common.NotificationCenter.on('app:ready', on_app_ready.bind(this));
            Common.NotificationCenter.on('app:face', on_hide_loader.bind(this));
            Common.NotificationCenter.on('app-pack:loaded', on_app_pack_loaded.bind(this));
        }

        const load_scripts = function () {
            const me = this;

            const app = window.DE || window.PE || window.SSE || window.PDFE || window.VE;
            !app.postLaunchScripts && (app.postLaunchScripts = []);
            // console.log('on_app_ready', app.postLaunchScripts);

            require({waitSeconds: 0}, app.postLaunchScripts, () => {
                if (!!Common.UI.ScreenReaderFocusManager) {
                    Common.UI.ScreenReaderFocusManager.init(me.api);
                }

                if ( !!window.less ) {                                      // detect development mode
                    _all_scripts_loaded = true;
                    Common.NotificationCenter.trigger('script:loaded');
                }
            });
        }

        const on_app_pack_loaded = function (config) {
            _all_scripts_loaded = true;
            Common.NotificationCenter.trigger('script:loaded');
        }

        const on_app_ready = function (config) {
            load_scripts.call(this);
        }

        const on_hide_loader = function (config) {}

        const is_script_loaded = function () {
            return _all_scripts_loaded;
        }

        return {
            init: init,
            isScriptLoaded: is_script_loaded
        };
    }

    !Common.Controllers && (Common.Controllers = {});
    Common.Controllers.LaunchController = new launchController();
});