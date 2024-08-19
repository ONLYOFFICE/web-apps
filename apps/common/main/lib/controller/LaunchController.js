/*
 * (c) Copyright Ascensio System SIA 2010-2024
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */


define([
], function () {
    const launchController = function () {
        let _all_scripts_loaded = false;

        const init = function (api) {
            this.api = api;
            Common.NotificationCenter.on('app:ready', on_app_ready.bind(this));
            Common.NotificationCenter.on('app:face', on_hide_loader.bind(this));
        }

        const load_scripts = function () {
            const me = this;

            const app = window.DE || window.PE || window.SSE || window.PDFE;
            !app.postLaunchScripts && (app.postLaunchScripts = []);
            // console.log('on_app_ready', app.postLaunchScripts);

            require(app.postLaunchScripts, function () {
                if (!!Common.UI.ScreenReaderFocusManager) {
                    Common.UI.ScreenReaderFocusManager.init(me.api);
                }
                _all_scripts_loaded = true;

                if ( !!window.less ) {                                      // detect development mode
                    Common.NotificationCenter.trigger('script:loaded');
                }
            });
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