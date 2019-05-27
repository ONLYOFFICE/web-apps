/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
/**
 * Controller wraps up interaction with desktop app
 *
 * Created by Maxim.Kadushkin on 2/16/2018.
 */

define([
    'core'
], function () {
    'use strict';

    var Desktop = function () {
        var config = {};
        var app = window.AscDesktopEditor;

        if ( !!app ) {
            window.on_native_message = function (cmd, param) {
                if (/^style:change/.test(cmd)) {
                    var obj = JSON.parse(param);

                    if ( obj.element == 'toolbar' ) {
                        if ( obj.action == 'off' && obj.style == 'native-color' ) {
                            $('.toolbar').removeClass('editor-native-color');
                        }
                    } else
                    if ( obj.element == 'body' ) {
                        if ( obj.action == 'merge' ) {
                            var style = document.createElement('style');
                            style.innerHTML = obj.style;
                            document.body.appendChild(style);
                        }
                    }
                } else
                if (/window:features/.test(cmd)) {
                    var obj = JSON.parse(param);

                    if ( obj.canUndock == 'true' ) {
                        if ( !config.canUndock ) {
                            config.canUndock = true;

                            if ( !_.isEmpty(config) )
                                Common.NotificationCenter.trigger('app:config', {canUndock:true});
                        }
                    }
                } else
                if (/window:status/.test(cmd)) {
                    var obj = JSON.parse(param);

                    if ( obj.action == 'undocking' ) {
                        Common.NotificationCenter.trigger('undock:status', {status:obj.status=='undocked'?'undocked':'docked'});
                    }
                } else
                if (/editor:config/.test(cmd)) {
                    if ( param == 'request' )
                        app.execCommand('editor:config', JSON.stringify({user: config.user, 'extraleft': $('#box-document-title #slot-btn-dt-save').parent().width()}));
                }
            };

            app.execCommand('webapps:events', 'loading');
            app.execCommand('window:features', 'request');
        }

        return {
            init: function (opts) {
                _.extend(config, opts);

                if ( config.isDesktopApp ) {
                    Common.NotificationCenter.on('app:ready', function (opts) {
                        _.extend(config, opts);
                        !!app && app.execCommand('doc:onready', '');

                        $('.toolbar').addClass('editor-native-color');
                    });

                    Common.NotificationCenter.on('action:undocking', function (opts) {
                        app.execCommand('editor:event', JSON.stringify({action:'undocking', state: opts == 'dock' ? 'dock' : 'undock'}));
                    });

                    Common.NotificationCenter.on('app:face', function (mode) {
                        if ( config.canUndock ) {
                            Common.NotificationCenter.trigger('app:config', {canUndock: true});
                        }
                    });
                }
            },
            process: function (opts) {
                if ( config.isDesktopApp && !!app ) {
                    if ( opts == 'goback' ) {
                        app.execCommand('go:folder',
                            config.isOffline ? 'offline' : config.customization.goback.url);
                        return true;
                    } else
                    if ( opts == 'preloader:hide' ) {
                        app.execCommand('editor:onready', '');
                        return true;
                    }
                }

                return false;
            },
            requestClose: function () {
                if ( config.isDesktopApp && !!app ) {
                    app.execCommand('editor:event', JSON.stringify({action:'close', url: config.customization.goback.url}));
                }
            }
        };
    };

    Common.Controllers.Desktop = new Desktop();
});