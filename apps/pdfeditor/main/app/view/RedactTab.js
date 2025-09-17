/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
                me.btnMarkForRedact.on('click', function (btn) {
                    me.fireEvent('redact:start', [btn.pressed ? true : false]);
                });
                me.btnApplyRedactions.on('click', function (menu, item, e) {
                    me.fireEvent('redact:apply', [item.value]);
                });
            },

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;
                this.appConfig = options.mode;

                this.lockedControls = [];

                var me = this;
                var _set = Common.enumLock;

                this.btnMarkForRedact = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-redact-text',
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
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small',
                });
                me.lockedControls.push(this.btnFindRedact);
                this.btnFindRedact.on('click', _.bind(this.onOpenPanel, this));

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

            onOpenPanel: function () {
                this.fireEvent('search:showredact', [true, '']);
            },
        }
    }()), PDFE.Views.RedactTab || {}));
});