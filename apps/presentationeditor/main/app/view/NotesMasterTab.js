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
 *  NotesMasterTab.js
 *
 *  Created on 05.06.2026
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    PE.Views.NotesMasterTab = Common.UI.BaseView.extend(_.extend((function(){
        var template =
            '<section class="panel" data-tab="notesMaster" role="tabpanel" aria-labelledby="view">' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge" id="id-toolbar-btn-notes-page-orientation"></span>' +
                '</div>' +
                '<div class="group small">' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="id-slot-chk-header"></span>' +
                    '</div>' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="id-slot-chk-date"></span>' +
                    '</div>' +
                '</div>' +
                '<div class="group small">' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="id-slot-chk-footer"></span>' +
                    '</div>' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="id-slot-chk-body"></span>' +
                    '</div>' +
                '</div>' +
                '<div class="group small">' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="id-slot-chk-slide-image"></span>' +
                    '</div>' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="id-slot-chk-page-number"></span>' +
                    '</div>' +
                '</div>' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge" id="slot-btn-closenotesmaster"></span>' +
                '</div>' +
            '</section>';
        return {
            options: {},

            setEvents: function () {
                var me = this;
                me.btnCloseNotesMaster && me.btnCloseNotesMaster.on('click', _.bind(function(btn, state) {
                    me.fireEvent('mode:normal', [state]);
                }));
                me.btnNotesPageOrientation && me.btnNotesPageOrientation.menu.on('item:click', _.bind(function (menu, item) {
                    me.fireEvent('notes:orientation', [item.value]);
                }));
                me.chHeader && me.chHeader.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('notes:headerchange', [state === 'checked']);
                }, me));
                me.chDate && me.chDate.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('notes:datechange', [state === 'checked']);
                }, me));
                me.chFooter && me.chFooter.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('notes:footerchange', [state === 'checked']);
                }, me));
                me.chPageNumber && me.chPageNumber.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('notes:pagenumchange', [state === 'checked']);
                }, me));
                me.chSlideImage && me.chSlideImage.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('notes:imagechange', [state === 'checked']);
                }, me));
                me.chBody && me.chBody.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('notes:bodychange', [state === 'checked']);
                }, me));
            },

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.appConfig = options.mode;
                var _set = Common.enumLock;
                this.lockedControls = [];

                var me = this;

                if (this.appConfig.isEdit) {
                    this.btnNotesPageOrientation = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-notes-orient',
                        caption: this.capNotesPageOrientation,
                        lock: [_set.menuFileOpen, _set.lostConnect, _set.disableOnStart],
                        menu: new Common.UI.Menu({
                            items: [
                                {value: 'portrait', caption: me.textPortrait, checkable: true, toggleGroup: 'notesorientation'},
                                {value: 'landscape', caption: me.textLandscape, checkable: true, toggleGroup: 'notesorientation'}
                            ]
                        }),
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    })
                    this.lockedControls.push(this.btnNotesPageOrientation);

                    this.chHeader = new Common.UI.CheckBox({
                        // lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart, _set.inSlideMaster],
                        labelText: this.textHeader,
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chHeader);

                    this.chDate = new Common.UI.CheckBox({
                        // lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart, _set.inSlideMaster],
                        labelText: this.textDate,
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chDate);

                    this.chFooter = new Common.UI.CheckBox({
                        // lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart, _set.inSlideMaster],
                        labelText: this.textFooter,
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chFooter);

                    this.chPageNumber = new Common.UI.CheckBox({
                        // lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart, _set.inSlideMaster],
                        labelText: this.textPageNumber,
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chPageNumber);

                    this.chSlideImage = new Common.UI.CheckBox({
                        // lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart, _set.inSlideMaster],
                        labelText: this.textSlideImage,
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chSlideImage);

                    this.chBody = new Common.UI.CheckBox({
                        // lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart, _set.inSlideMaster],
                        labelText: this.textBody,
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chBody);

                    this.btnCloseNotesMaster = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-close-tab',
                        lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart],
                        caption: me.capCloseMaster,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.btnCloseNotesMaster);
                }

                Common.UI.LayoutManager.addControls(this.lockedControls);
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                if ( el ) el.html( this.getPanel() );

                return this;
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));
                var $host = this.$el;
                this.setEvents();

                this.btnNotesPageOrientation && this.btnNotesPageOrientation.render($host.find('#id-toolbar-btn-notes-page-orientation'));
                this.chHeader && this.chHeader.render($host.find('#id-slot-chk-header'));
                this.chDate && this.chDate.render($host.find('#id-slot-chk-date'));
                this.chFooter && this.chFooter.render($host.find('#id-slot-chk-footer'));
                this.chPageNumber && this.chPageNumber.render($host.find('#id-slot-chk-page-number'));
                this.chSlideImage && this.chSlideImage.render($host.find('#id-slot-chk-slide-image'));
                this.chBody && this.chBody.render($host.find('#id-slot-chk-body'));
                this.btnCloseNotesMaster && this.btnCloseNotesMaster.render($host.find('#slot-btn-closenotesmaster'));

                this.btnCloseNotesMaster && this.btnCloseNotesMaster.updateHint(this.tipCloseMaster);
                this.btnNotesPageOrientation && this.btnNotesPageOrientation.updateHint(this.tipNotesPageOrientation);
                return this.$el;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function () {
                });
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
    }()), PE.Views.NotesMasterTab || {}));
});