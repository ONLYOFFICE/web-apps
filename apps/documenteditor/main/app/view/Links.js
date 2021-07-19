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
 *  Links.js
 *
 *  Created by Julia Radzhabova on 22.12.2017
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    DE.Views.Links = Common.UI.BaseView.extend(_.extend((function(){
        function setEvents() {
            var me = this;
            this.btnsContents.forEach(function(button) {
                button.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('links:contents', [item.value]);
                });
                button.on('click', function (b, e) {
                    me.fireEvent('links:contents', [0]);
                });
                button.menu.on('show:after', function (menu, e) {
                    me.fireEvent('links:contents-open', [menu]);
                });
            });
            this.contentsMenu.on('item:click', function (menu, item, e) {
                setTimeout(function(){
                    me.fireEvent('links:contents', [item.value, true]);
                }, 10);
            });
            this.contentsMenu.on('show:after', function (menu, e) {
                me.fireEvent('links:contents-open', [menu]);
            });

            this.btnContentsUpdate.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('links:update', [item.value]);
            });
            this.btnContentsUpdate.on('click', function (b, e) {
                me.fireEvent('links:update', ['all']);
            });
            this.contentsUpdateMenu.on('item:click', function (menu, item, e) {
                setTimeout(function(){
                    me.fireEvent('links:update', [item.value, true]);
                }, 10);
            });

            this.btnsNotes.forEach(function(button) {
                button.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('links:notes', [item.value]);
                });
                button.on('click', function (b, e) {
                    me.fireEvent('links:notes', ['ins_footnote']);
                });
                button.menu.items[7].menu.on('item:click', function (menu, item, e) {//convert
                    me.fireEvent('links:notes', [item.value]);
                });
            });

            this.btnsPrevNote.forEach(function(button) {
                button.on('click', function (b, e) {
                    me.fireEvent('links:notes', ['prev']);
                });
            });

            this.btnsNextNote.forEach(function(button) {
                button.on('click', function (b, e) {
                    me.fireEvent('links:notes', ['next']);
                });
            });

            this.btnsPrevEndNote.forEach(function(button) {
                button.on('click', function (b, e) {
                    me.fireEvent('links:notes', ['prev-end']);
                });
            });

            this.btnsNextEndNote.forEach(function(button) {
                button.on('click', function (b, e) {
                    me.fireEvent('links:notes', ['next-end']);
                });
            });

            this.btnsHyperlink.forEach(function(button) {
                button.on('click', function (b, e) {
                    me.fireEvent('links:hyperlink');
                });
            });

            this.btnBookmarks.on('click', function (b, e) {
                me.fireEvent('links:bookmarks');
            });

            this.btnCaption.on('click', function (b, e) {
                me.fireEvent('links:caption');
            });

            this.btnCrossRef.on('click', function (b, e) {
                me.fireEvent('links:crossref');
            });

            this.btnTableFigures.on('click', function (b, e) {
                me.fireEvent('links:tof');
            });

            this.btnTableFiguresUpdate.on('click', function (b, e) {
                me.fireEvent('links:tof-update');
            });
        }

        return {

            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;

                this.btnsPrevNote = [];
                this.btnsNextNote = [];
                this.btnsPrevEndNote = [];
                this.btnsNextEndNote = [];
                this.paragraphControls = [];

                var me = this,
                    $host = me.toolbar.$el;

                this.btnsContents = Common.Utils.injectButtons($host.find('.btn-slot.btn-contents'), '', 'toolbar__icon btn-contents', me.capBtnInsContents, undefined, true, true );
                this.btnsNotes = Common.Utils.injectButtons($host.find('.btn-slot.slot-notes'), '', 'toolbar__icon btn-notes', me.capBtnInsFootnote, undefined, true, true);
                this.btnsHyperlink = Common.Utils.injectButtons($host.find('.btn-slot.slot-inshyperlink'), '', 'toolbar__icon btn-inserthyperlink', me.capBtnInsLink);
                Array.prototype.push.apply(this.paragraphControls, this.btnsContents.concat(this.btnsNotes, this.btnsHyperlink));

                this.btnContentsUpdate = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-contents-update'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-update',
                    caption: this.capBtnContentsUpdate,
                    split: true,
                    menu: true,
                    disabled: true
                });
                this.paragraphControls.push(this.btnContentsUpdate);

                this.btnBookmarks = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-bookmarks'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-bookmarks',
                    caption: this.capBtnBookmarks,
                    disabled: true
                });
                this.paragraphControls.push(this.btnBookmarks);

                this.btnCaption = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-caption'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-caption',
                    caption: this.capBtnCaption,
                    disabled: true
                });
                this.paragraphControls.push(this.btnCaption);

                this.btnCrossRef = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-crossref'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-cross-reference',
                    caption: this.capBtnCrossRef,
                    disabled: true
                });
                this.paragraphControls.push(this.btnCrossRef);

                this.btnTableFigures = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-tof'),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-contents',
                    caption: this.capBtnTOF,
                    disabled: true
                });
                this.paragraphControls.push(this.btnTableFigures);

                this.btnTableFiguresUpdate = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-tof-update'),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-update',
                    caption: this.capBtnContentsUpdate,
                    disabled: true
                });
                this.paragraphControls.push(this.btnTableFiguresUpdate);

                this._state = {disabled: false};
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                return this;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    var contentsTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem" class="item-contents"><div id="<%= options.previewId %>"></div></a>');
                    me.btnsContents.forEach( function(btn) {
                        btn.updateHint( me.tipContents );

                        var _menu = new Common.UI.Menu({
                            cls: 'toc-menu shifted-left',
                            items: [
                                {template: contentsTemplate, offsety: 0, value: 0, previewId: 'id-toolbar-toc-0'},
                                {template: contentsTemplate, offsety: 72, value: 1, previewId: 'id-toolbar-toc-1'},
                                {caption: me.textContentsSettings, value: 'settings'},
                                {caption: me.textContentsRemove, value: 'remove'}
                            ]
                        });

                        btn.setMenu(_menu);
                    });

                    me.contentsMenu = new Common.UI.Menu({
                        cls: 'toc-menu shifted-left',
                        items: [
                            {template: contentsTemplate, offsety: 0, value: 0, previewId: 'id-toolbar-toc-menu-0'},
                            {template: contentsTemplate, offsety: 72, value: 1, previewId: 'id-toolbar-toc-menu-1'},
                            {caption: me.textContentsSettings, value: 'settings'},
                            {caption: me.textContentsRemove, value: 'remove'}
                        ]
                    });

                    me.btnContentsUpdate.updateHint([me.textUpdateAll, me.tipContentsUpdate]);
                    me.btnContentsUpdate.setMenu(new Common.UI.Menu({
                        items: [
                            {caption: me.textUpdateAll, value: 'all'},
                            {caption: me.textUpdatePages, value: 'pages'}
                        ]
                    }));

                    me.contentsUpdateMenu = new Common.UI.Menu({
                        items: [
                            {caption: me.textUpdateAll, value: 'all'},
                            {caption: me.textUpdatePages, value: 'pages'}
                        ]
                    });

                    me.btnsNotes.forEach( function(btn, index) {
                        btn.updateHint( me.tipNotes );

                        var _menu = new Common.UI.Menu({
                            items: [
                                {caption: me.mniInsFootnote, value: 'ins_footnote'},
                                {caption: me.mniInsEndnote, value: 'ins_endnote'},
                                {caption: '--'},
                                new Common.UI.MenuItem({
                                    template: _.template([
                                        '<div class="menu-zoom" style="height: 25px;" ',
                                        '<% if(!_.isUndefined(options.stopPropagation)) { %>',
                                        'data-stopPropagation="true"',
                                        '<% } %>', '>',
                                        '<label class="title">' + me.textGotoFootnote + '</label>',
                                        '<button id="id-menu-goto-footnote-next-' + index + '" type="button" style="float:right; margin: 2px 5px 0 0;" class="btn small btn-toolbar"><i class="icon menu__icon btn-nextitem">&nbsp;</i></button>',
                                        '<button id="id-menu-goto-footnote-prev-' + index + '" type="button" style="float:right; margin-top: 2px;" class="btn small btn-toolbar"><i class="icon menu__icon btn-previtem">&nbsp;</i></button>',
                                        '</div>'
                                    ].join('')),
                                    stopPropagation: true
                                }),
                                new Common.UI.MenuItem({
                                    template: _.template([
                                        '<div class="menu-zoom" style="height: 25px;" ',
                                        '<% if(!_.isUndefined(options.stopPropagation)) { %>',
                                        'data-stopPropagation="true"',
                                        '<% } %>', '>',
                                        '<label class="title">' + me.textGotoEndnote + '</label>',
                                        '<button id="id-menu-goto-endnote-next-' + index + '" type="button" style="float:right; margin: 2px 5px 0 0;" class="btn small btn-toolbar"><i class="icon menu__icon btn-nextitem">&nbsp;</i></button>',
                                        '<button id="id-menu-goto-endnote-prev-' + index + '" type="button" style="float:right; margin-top: 2px;" class="btn small btn-toolbar"><i class="icon menu__icon btn-previtem">&nbsp;</i></button>',
                                        '</div>'
                                    ].join('')),
                                    stopPropagation: true
                                }),
                                {caption: '--'},
                                {caption: me.mniDelFootnote, value: 'delele'},
                                {
                                    caption: me.mniConvertNote, value: 'convert',
                                    menu: new Common.UI.Menu({
                                        menuAlign   : 'tl-tr',
                                        items: [
                                            {caption: me.textConvertToEndnotes, value: 'to-endnotes'},
                                            {caption: me.textConvertToFootnotes, value: 'to-footnotes'},
                                            {caption: me.textSwapNotes, value: 'swap'}
                                        ]
                                    })
                                },
                                {caption: me.mniNoteSettings, value: 'settings'}
                            ]
                        });
                        btn.setMenu(_menu);

                        me.btnsPrevNote.push(new Common.UI.Button({
                            el: $('#id-menu-goto-footnote-prev-'+index),
                            cls: 'btn-toolbar'
                        }));
                        me.btnsNextNote.push(new Common.UI.Button({
                            el: $('#id-menu-goto-footnote-next-'+index),
                            cls: 'btn-toolbar'
                        }));
                        me.btnsPrevEndNote.push(new Common.UI.Button({
                            el: $('#id-menu-goto-endnote-prev-'+index),
                            cls: 'btn-toolbar'
                        }));
                        me.btnsNextEndNote.push(new Common.UI.Button({
                            el: $('#id-menu-goto-endnote-next-'+index),
                            cls: 'btn-toolbar'
                        }));
                    });

                    me.btnsHyperlink.forEach( function(btn) {
                        btn.updateHint(me.tipInsertHyperlink + Common.Utils.String.platformKey('Ctrl+K'));
                    });

                    me.btnBookmarks.updateHint(me.tipBookmarks);
                    me.btnCaption.updateHint(me.tipCaption);
                    me.btnCrossRef.updateHint(me.tipCrossRef);

                    me.btnTableFigures.updateHint(me.tipTableFigures);
                    me.btnTableFiguresUpdate.updateHint(me.tipTableFiguresUpdate);

                    setEvents.call(me);
                });
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function() {
                return this.paragraphControls;
            },

            SetDisabled: function (state) {
                this._state.disabled = state;
                this.paragraphControls.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
            },

            capBtnInsContents: 'Table of Contents',
            tipContents: 'Insert table of contents',
            textContentsSettings: 'Settings',
            textContentsRemove: 'Remove table of contents',
            capBtnContentsUpdate: 'Refresh',
            tipContentsUpdate: 'Refresh table of contents',
            textUpdateAll: 'Refresh entire table',
            textUpdatePages: 'Refresh page numbers only',
            tipNotes: 'Footnotes',
            mniInsFootnote: 'Insert Footnote',
            mniDelFootnote: 'Delete All Notes',
            mniNoteSettings: 'Notes Settings',
            textGotoFootnote: 'Go to Footnotes',
            capBtnInsFootnote: 'Footnotes',
            confirmDeleteFootnotes: 'Do you want to delete all footnotes?',
            capBtnInsLink: 'Hyperlink',
            tipInsertHyperlink: 'Add Hyperlink',
            capBtnBookmarks: 'Bookmark',
            tipBookmarks: 'Create a bookmark',
            capBtnCaption: 'Caption',
            tipCaption: 'Insert caption',
            mniConvertNote: 'Convert All Notes',
            textGotoEndnote: 'Go to Endnotes',
            mniInsEndnote: 'Insert Endnote',
            textConvertToEndnotes: 'Convert All Footnotes to Endnotes',
            textConvertToFootnotes: 'Convert All Endnotes to Footnotes',
            textSwapNotes: 'Swap Footnotes and Endnotes',
            capBtnCrossRef: 'Cross-reference',
            tipCrossRef: 'Insert cross-reference',
            capBtnTOF: 'Table of Figures',
            tipTableFiguresUpdate: 'Refresh table of figures',
            tipTableFigures: 'Insert table of figures',
            confirmReplaceTOF: 'Do you want to replace the selected table of figures?',
            titleUpdateTOF: 'Refresh Table of Figures'
        }
    }()), DE.Views.Links || {}));
});