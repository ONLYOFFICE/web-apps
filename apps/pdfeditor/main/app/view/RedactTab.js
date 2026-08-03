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
 *  RedactTab.js
 *
 *  Created on 09.01.2025
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
], function () {
    'use strict';

    PDFE.Views.RedactTab = Common.UI.BaseView.extend(_.extend((function(){
        var template =
            '<section class="panel" data-tab="red" role="tabpanel">' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge" id="slot-btn-hiddeninfo"></span>' +
                '</div>' +
                '<div class="separator long"></div>' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge" id="slot-btn-markredact"></span>' +
                    '<span class="btn-slot text x-huge" id="slot-btn-redactpages"></span>' +
                    '<span class="btn-slot text x-huge" id="slot-btn-findredact"></span>' +
                '</div>' +
                '<div class="separator long"></div>' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge" id="slot-btn-apply-redactions"></span>' +
                '</div>' +
            '</section>';

        return {
            options: {},

            setEvents: function () {
                var me = this;
                this.btnRemoveHidden.on('click', function (btn) {
                    me.fireEvent('hiddeninfo:remove')
                });
                me.btnMarkForRedact.on('click', function (btn) {
                    me.fireEvent('redact:start', [btn.pressed ? true : false]);
                });
                me.btnApplyRedactions.on('click', function (menu, item, e) {
                    me.fireEvent('redact:apply', [item.value]);
                });
                me.btnFindRedact && me.btnFindRedact.on('click', function (btn) {
                    me.fireEvent('search:showredact', [btn.pressed])
                })
            },

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;
                this.appConfig = options.mode;

                this.lockedControls = [];

                var me = this;
                var _set = Common.enumLock;

                this.btnRemoveHidden = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-clear-metadata',
                    style: 'min-width: 45px;',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    caption: me.capRemoveHiddenInfo,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                me.lockedControls.push(this.btnRemoveHidden);

                this.btnMarkForRedact = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-big-redact-text',
                    style: 'min-width: 45px;',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    caption: me.capMarkRedact,
                    enableToggle: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                me.lockedControls.push(this.btnMarkForRedact);

                this.btnRedactPages = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-redact-pages',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    caption: me.capRedactPages,
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small',
                });
                me.lockedControls.push(this.btnRedactPages);

                this.btnFindRedact = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-find-to-redact',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    caption: me.capFindRedact,
                    enableToggle: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small',
                });
                me.lockedControls.push(this.btnFindRedact);

                this.btnApplyRedactions = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-redact-apply',
                    style: 'min-width: 45px;',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    caption: me.capApplyRedactions,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                me.lockedControls.push(this.btnApplyRedactions);

                Common.UI.LayoutManager.addControls(me.lockedControls);
                Common.Utils.lockControls(_set.disableOnStart, true, {array: this.lockedControls});
            },

            turnFindRedact: function (state) {
                this.btnFindRedact && this.btnFindRedact.toggle(state, true);
            },

            render: function (el) {
                if ( el ) el.html( this.getPanel() );

                return this;
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));
                var $host = this.$el;
                var _injectComponent = function (id, cmp) {
                    Common.Utils.injectComponent($host.find(id), cmp);
                };
                _injectComponent('#slot-btn-hiddeninfo', this.btnRemoveHidden);
                _injectComponent('#slot-btn-markredact', this.btnMarkForRedact);
                _injectComponent('#slot-btn-redactpages', this.btnRedactPages);
                _injectComponent('#slot-btn-apply-redactions', this.btnApplyRedactions);
                _injectComponent('#slot-btn-findredact', this.btnFindRedact);

                return this.$el;
            },

            onAppReady: function (config) {
                var me = this;

                me.btnRedactPages.setMenu(
                    new Common.UI.Menu({
                        items: [
                            {caption: me.txtMarkCurrentPage, value: 'current'},
                            {caption: me.txtSelectRange, value: 'range'},
                        ]
                    }).on('item:click', function (menu, item, e) {
                        if (item.value === 'current') {
                            me.fireEvent('redact:page');
                        } else {
                            me.fireEvent('redact:pages')
                        }
                    })
                );

                this.btnRemoveHidden.updateHint(this.tipRemoveHiddenInfo);
                this.btnMarkForRedact.updateHint(this.tipMarkForRedact);
                this.btnRedactPages.updateHint(this.tipRedactPages);
                this.btnApplyRedactions.updateHint(this.tipApplyRedactions);
                this.btnFindRedact.updateHint(this.tipFindRedact);
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function(type) {
                if (type===undefined)
                    return this.lockedControls;
                return [];
            },

            SetDisabled: function (state) {
                this.lockedControls && this.lockedControls.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
            },
        }
    }()), PDFE.Views.RedactTab || {}));
});