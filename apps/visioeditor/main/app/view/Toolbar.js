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
/**
 *  Toolbar.js
 *
 *  Toolbar view
 *
 *  Created on 11/07/24
 *
 */
if (Common === undefined)
    var Common = {};

define([
    'jquery',
    'underscore',
    'backbone',
    'text!visioeditor/main/app/template/Toolbar.template',
    'text!visioeditor/main/app/template/ToolbarView.template',
    'common/main/lib/component/Button',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/DataView',
    'common/main/lib/component/Menu',
    'common/main/lib/component/Window',
    'common/main/lib/component/SynchronizeTip',
    'common/main/lib/component/Mixtbar'
], function ($, _, Backbone, template, template_view) {
    'use strict';

    if (!Common.enumLock)
        Common.enumLock = {};

    var enumLock = {
        cantPrint:      'cant-print',
        lostConnect:    'disconnect',
        disableOnStart: 'on-start',
        fileMenuOpened: 'file-menu-opened'
    };
    for (var key in enumLock) {
        if (enumLock.hasOwnProperty(key)) {
            Common.enumLock[key] = enumLock[key];
        }
    }

    VE.Views.Toolbar =  Common.UI.Mixtbar.extend(_.extend((function(){

        return {
            el: '#toolbar',

            // Compile our stats template
            // template: _.template(template),

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                //
            },

            initialize: function () {
                var me = this;

                /**
                 * UI Components
                 */

                this._state = {};
                Common.NotificationCenter.on('app:ready', me.onAppReady.bind(this));
                return this;
            },

            applyLayoutEdit: function(config) {
                if (!config.isEdit) return;

                var _set = Common.enumLock,
                    arr = [];

                Common.UI.LayoutManager.addControls(arr);
                return arr;
            },

            applyLayout: function (config) {
                var me = this;
                me.lockControls = [];
                var _set = Common.enumLock;
                if ( config.isEdit ) {
                } else {
                    Common.UI.Mixtbar.prototype.initialize.call(this, {
                            template: _.template(template_view),
                            tabs: [
                                {caption: me.textTabFile, action: 'file', layoutname: 'toolbar-file', haspanel:false, dataHintTitle: 'F'}
                            ]
                        }
                    );
                }
                return this;
            },

            render: function (mode) {
                var me = this;

                /**
                 * Render UI layout
                 */

                this.fireEvent('render:before', [this]);

                me.isCompactView = mode.compactview;
                if ( mode.isEdit) {
                    // me.$el.html(me.rendererComponents(me.$layout, mode));
                } else {
                    me.$layout.find('.canedit').hide();
                    me.$layout.addClass('folded');
                    me.$el.html(me.$layout);
                }

                this.fireEvent('render:after', [this]);
                Common.UI.Mixtbar.prototype.afterRender.call(this);

                Common.NotificationCenter.on({
                    'window:resize': function() {
                        Common.UI.Mixtbar.prototype.onResize.apply(me, arguments);
                    }
                });

                if ( mode.isEdit ) {
                    // me.setTab('home');
                    // me.processPanelVisible();
                    // Common.NotificationCenter.on('desktop:window', _.bind(me.onDesktopWindow, me));
                }

                if ( me.isCompactView )
                    me.setFolded(true);

                return this;
            },

            onTabClick: function (e) {
                var me = this,
                    tab = $(e.currentTarget).find('> a[data-tab]').data('tab'),
                    is_file_active = me.isTabActive('file');

                if (!me._isDocReady || tab === 'file' && !Common.Controllers.LaunchController.isScriptLoaded()) return;

                Common.UI.Mixtbar.prototype.onTabClick.apply(me, arguments);

                if ( is_file_active ) {
                    me.fireEvent('file:close');
                } else
                if ( tab == 'file' ) {
                    me.fireEvent('file:open');
                }
            },

            rendererComponentsEdit: function($host, mode) {
            },

            rendererComponentsCommon: function($host) {
            },

            rendererComponents: function (html, mode) {
                var $host = $(html);
                this.rendererComponentsCommon($host);
                if (mode.isEdit) {
                    this.rendererComponentsEdit($host, mode);
                }

                return $host;
            },

            onAppReady: function (config) {
                var me = this;
                me._isDocReady = true;
                (new Promise( function(resolve, reject) {
                    resolve();
                })).then(function () {
                });
            },

            createDelayedElementsCommon: function() {
            },

            createDelayedElementsEdit: function() {
                if (!this.mode.isEdit) return;
            },

            createDelayedElements: function () {
                this.createDelayedElementsCommon();
                if (this.mode.isEdit) {
                    this.createDelayedElementsEdit();
                }
            },

            onToolbarAfterRender: function(toolbar) {
                // DataView and pickers
            },

            setApi: function (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(this.onApiUsersChanged, this));
                this.api.asc_registerCallback('asc_onParticipantsChanged', _.bind(this.onApiUsersChanged, this));
                return this;
            },

            setMode: function (mode) {
                if (mode.isDisconnected) {
                    this.lockToolbar(Common.enumLock.lostConnect, true);
                    if (!mode.enableDownload)
                        this.toolbar.fireEvent('print:disabled', [true]);
                } else {
                    this.toolbar.fireEvent('print:disabled', [!mode.canPrint]);
                }

                this.mode = mode;
            },

            /** coauthoring begin **/
            onApiUsersChanged: function (users) {
            },

            onDesktopWindow: function() {
            },
            /** coauthoring end **/

            lockToolbar: function (causes, lock, opts) {
                Common.Utils.lockControls(causes, lock, opts, this.lockControls);
            }
        }
    })(), VE.Views.Toolbar || {}));
});
