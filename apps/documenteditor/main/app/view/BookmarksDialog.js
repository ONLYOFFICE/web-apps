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

/**
 *  BookmarksDialog.js.js
 *
 *  Created on 15.02.2018
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';

    DE.Views.BookmarksDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 320,
            buttons: ['close'],
            separator: false,
            id: 'window-bookmarks'
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                keydowncallback: function(event) {
                    if (me.appOptions && me.appOptions.canMakeActionLink && (event.keyCode === Common.UI.Keys.ESC)) {
                        var box = me.$window.find('#id-clip-copy-box').parent();
                        if (box.hasClass('open')) {
                            box.removeClass('open')
                            me.btnGetLink.focus();
                            return true;
                        }
                    }
                },
                contentStyle: 'padding: 0 5px;',
                contentTemplate: _.template([
                    '<div class="settings-panel active">',
                        '<div class="inner-content">',
                                '<table cols="1" style="width: 100%;">',
                                    '<tr>',
                                        '<td class="padding-extra-small">',
                                        '<label class="input-label">', me.textBookmarkName, '</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-large">',
                                            '<div id="bookmarks-txt-name" class="margin-right-10" style="display:inline-block;vertical-align: top;"></div>',
                                            '<button type="button" result="add" class="btn btn-text-default" id="bookmarks-btn-add" style="vertical-align: top;">', me.textAdd,'</button>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-extra-small">',
                                            '<label class="header margin-right-10">', me.textSort,'</label>',
                                            '<div id="bookmarks-radio-name" class="margin-right-10"></div>',
                                            '<div id="bookmarks-radio-location"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                        '<div id="bookmarks-list" style="width:100%; height: 139px;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-large">',
                                            '<button type="button" class="btn btn-text-default margin-right-5" id="bookmarks-btn-goto">', me.textGoto,'</button>',
                                            '<div style="display: inline-block; position: relative;">',
                                                '<button type="button" class="btn btn-text-default auto dropdown-toggle move-focus" id="bookmarks-btn-link" style="min-width: 75px;" data-toggle="dropdown">', me.textGetLink,'</button>',
                                                '<div id="id-clip-copy-box" class="dropdown-menu" style="width: 291px; left: -80px; padding: 10px;">',
                                                    '<div id="id-dlg-clip-copy"></div>',
                                                    '<button id="id-dlg-copy-btn" class="btn btn-text-default margin-left-5" style="width: 86px;">' + me.textCopy + '</button>',
                                                '</div>',
                                            '</div>',
                                            '<button type="button" class="btn btn-text-default float-right" id="bookmarks-btn-delete">', me.textDelete,'</button>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td>',
                                            '<div id="bookmarks-checkbox-hidden"></div>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            '</div></div>'
                ].join(''))({scope: this})
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;
            this.appOptions = options.appOptions;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.txtName = new Common.UI.InputField({
                el          : $('#bookmarks-txt-name'),
                allowBlank  : true,
                validateOnChange: true,
                validateOnBlur: true,
                style       : 'width: 215px;',
                value       : '',
                maxLength: 40,
                validation  : function(value) {
                    var check = me.props.asc_CheckNewBookmarkName(value),
                        exist = me.props.asc_HaveBookmark(value);
                    me.btnAdd.setDisabled(!check && !exist);
                    return (check || _.isEmpty(value) || exist) ? true : me.txtInvalidName;
                }
            }).on ('changing', function (input, value) {
                var exist = me.props.asc_HaveBookmark(value);
                if (exist) {
                    var rec = me.bookmarksList.store.findWhere({value: value});
                    me.bookmarksList.selectRecord(rec);
                    me.bookmarksList.scrollToRecord(rec);
                } else
                    me.bookmarksList.deselectAll();
                me.btnGoto.setDisabled(!exist);
                me.btnDelete.setDisabled(!exist);
                me.btnGetLink.setDisabled(!exist);
            });

            this.radioName = new Common.UI.RadioBox({
                el: $('#bookmarks-radio-name'),
                labelText: this.textName,
                name: 'asc-radio-bookmark-sort'
            });
            this.radioName.on('change', _.bind(this.onRadioSort, this));

            this.radioLocation = new Common.UI.RadioBox({
                el: $('#bookmarks-radio-location'),
                labelText: this.textLocation,
                name: 'asc-radio-bookmark-sort'
            });
            this.radioLocation.on('change', _.bind(this.onRadioSort, this));
            Common.Utils.InternalSettings.get("de-bookmarks-sort-location") ? this.radioLocation.setValue(true, true) : this.radioName.setValue(true, true);

            this.bookmarksList = new Common.UI.ListView({
                el: $('#bookmarks-list', this.$window),
                store: new Common.UI.DataViewStore(),
                tabindex: 1,
                cls: 'dbl-clickable',
                itemTemplate: _.template('<div id="<%= id %>" class="list-item" style="overflow: hidden; text-overflow: ellipsis;"><%= Common.Utils.String.htmlEncode(value) %></div>')
            });
            this.bookmarksList.store.comparator = function(rec) {
                return (me.radioName.getValue() ? rec.get("value") : rec.get("location"));
            };
            this.bookmarksList.on('item:dblclick', _.bind(this.onDblClickBookmark, this));
            this.bookmarksList.on('entervalue', _.bind(this.onPrimary, this));
            this.bookmarksList.on('item:select', _.bind(this.onSelectBookmark, this));

            this.btnAdd = new Common.UI.Button({
                el: $('#bookmarks-btn-add'),
                disabled: true
            });
            this.btnAdd.on('click', _.bind(this.addBookmark, this));

            this.btnGoto = new Common.UI.Button({
                el: $('#bookmarks-btn-goto'),
                disabled: true
            });
            this.btnGoto.on('click', _.bind(this.gotoBookmark, this));

            this.btnDelete = new Common.UI.Button({
                el: $('#bookmarks-btn-delete'),
                disabled: true
            });
            this.btnDelete.on('click', _.bind(this.deleteBookmark, this));

            this.btnGetLink = new Common.UI.Button({
                el: $('#bookmarks-btn-link'),
                disabled: true
            });
            this.btnGetLink.on('click', _.bind(this.getBookmarkLink, this));

            this.chHidden = new Common.UI.CheckBox({
                el: $('#bookmarks-checkbox-hidden'),
                labelText: this.textHidden,
                value: Common.Utils.InternalSettings.get("de-bookmarks-hidden") || false
            });
            this.chHidden.on('change', _.bind(this.onChangeHidden, this));

            if (this.appOptions.canMakeActionLink) {
                this.inputCopy = new Common.UI.InputField({
                    el          : $('#id-dlg-clip-copy'),
                    editable    : false,
                    style       : 'width: 176px;'
                });

                var copyBox = this.$window.find('#id-clip-copy-box');
                copyBox.on('click', _.bind(function() {
                    return false;
                }, this));
                copyBox.parent().on({
                    'shown.bs.dropdown': function () {
                        _.delay(function(){
                            me.inputCopy._input.select().focus();
                        },100);
                    },
                    'hide.bs.dropdown': function () {
                        me.txtName._input.select().focus();
                    }
                });
                this.btnCopy = new Common.UI.Button({
                    el: copyBox.find('button')
                });
                this.btnCopy.on('click', function() {
                    me.inputCopy._input.select();
                    document.execCommand("copy");
                });

                Common.Gateway.on('setactionlink', function (url) {
                    me.inputCopy.setValue(url);
                });
            }

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.txtName, this.radioName, this.radioLocation, this.bookmarksList, this.btnAdd, this.btnGoto, this.btnGetLink, this.btnDelete, this.chHidden, this.inputCopy, this.btnCopy].concat(this.getFooterButtons());
        },

        afterRender: function() {
            this._setDefaults(this.props);
            var me = this;
            var onApiBookmarksUpdate = function() {
                var rec = me.bookmarksList.getSelectedRec();
                me.refreshBookmarks();
                if (rec) {
                    rec = me.bookmarksList.store.findWhere({value: rec.get('value')});
                    if (rec) {
                        me.bookmarksList.selectRecord(rec);
                        me.bookmarksList.scrollToRecord(rec);
                    } else {
                        me.txtName.setValue('');
                        me.btnAdd.setDisabled(true);
                        me.btnGoto.setDisabled(true);
                        me.btnDelete.setDisabled(true);
                        me.btnGetLink.setDisabled(true);
                    }
                }
            };
            this.api.asc_registerCallback('asc_onBookmarksUpdate', onApiBookmarksUpdate);
            this.on('close', function(obj){
                me.api.asc_unregisterCallback('asc_onBookmarksUpdate', onApiBookmarksUpdate);
            });
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);

            var me = this;
            _.delay(function(){
                $('input', me.txtName.cmpEl).select().focus();
            },100);
        },

        close: function() {
            Common.Views.AdvancedSettingsWindow.prototype.close.apply(this, arguments);
            Common.Utils.InternalSettings.set("de-bookmarks-hidden", this.chHidden.getValue()=='checked');
            Common.Utils.InternalSettings.set("de-bookmarks-sort-location", this.radioLocation.getValue())
        },

        _setDefaults: function (props) {
            this.refreshBookmarks();
            this.btnGetLink.setVisible(this.appOptions.canMakeActionLink);
        },

        getSettings: function () {
            return {};
        },

        onDlgBtnClick: function(event) {
            this.close();
        },

        onPrimary: function() {
            return true;
        },

        refreshBookmarks: function() {
            if (this.props) {
                var store = this.bookmarksList.store,
                    count = this.props.asc_GetCount(),
                    showHidden = this.chHidden.getValue()=='checked',
                    arr = [];
                for (var i=0; i<count; i++) {
                    var name = this.props.asc_GetName(i);
                    if (!this.props.asc_IsInternalUseBookmark(name) && (showHidden || !this.props.asc_IsHiddenBookmark(name))) {
                        var rec = new Common.UI.DataViewModel();
                        rec.set({
                            value: name,
                            location: i
                        });
                        arr.push(rec);
                    }
                }
                store.reset(arr, {silent: false});
            }
        },

        onSelectBookmark: function(listView, itemView, record) {
            if (!record) return;

            var value = record.get('value');
            this.txtName.setValue(value);
            this.btnAdd.setDisabled(false);
            this.btnGoto.setDisabled(false);
            this.btnDelete.setDisabled(false);
            this.btnGetLink.setDisabled(false);
        },

        gotoBookmark: function(btn, eOpts){
            var rec = this.bookmarksList.getSelectedRec();
            if (rec)
                this.props.asc_SelectBookmark(rec.get('value'));
            else if (this.txtName.getValue()!=='')
                this.props.asc_SelectBookmark(this.txtName.getValue());
        },

        addBookmark: function(btn, eOpts){
            this.props.asc_AddBookmark(this.txtName.getValue());
            this.refreshBookmarks();
            var rec = this.bookmarksList.store.findWhere({value: this.txtName.getValue()});
            this.bookmarksList.selectRecord(rec);
            this.bookmarksList.scrollToRecord(rec);
            this.txtName.focus();
        },

        onDblClickBookmark: function(listView, itemView, record) {
            this.props.asc_SelectBookmark(record.get('value'));
        },

        deleteBookmark: function(btn, eOpts){
            var rec = this.bookmarksList.getSelectedRec();
            if (rec) {
                this.props.asc_RemoveBookmark(rec.get('value'));
                var store = this.bookmarksList.store;
                var idx = _.indexOf(store.models, rec);
                store.remove(rec);
                this.txtName.setValue('');
                this.btnAdd.setDisabled(true);
                this.btnGoto.setDisabled(true);
                this.btnDelete.setDisabled(true);
                this.btnGetLink.setDisabled(true);
            }
        },

        getBookmarkLink: function(btn) {
            if (btn.cmpEl && btn.cmpEl.parent().hasClass('open')) return;

            var rec = this.bookmarksList.getSelectedRec();
            rec && Common.Gateway.requestMakeActionLink({
                                                            action: {
                                                                type: "bookmark", data: rec.get('value')
                                                            }
                                                        });
        },

        onRadioSort: function(field, newValue, eOpts) {
            if (newValue) {
                this.bookmarksList.store.sort();
                this.bookmarksList.onResetItems();
            }
        },

        onChangeHidden: function(field, newValue, oldValue, eOpts){
            this.refreshBookmarks();
        },

        textTitle:    'Bookmarks',
        textLocation: 'Location',
        textBookmarkName: 'Bookmark name',
        textSort: 'Sort by',
        textName: 'Name',
        textAdd: 'Add',
        textGoto: 'Go to',
        textDelete: 'Delete',
        textClose: 'Close',
        textHidden: 'Hidden bookmarks',
        txtInvalidName: 'Bookmark name can only contain letters, digits and underscores, and should begin with the letter',
        textGetLink: 'Get Link',
        textCopy: 'Copy'

    }, DE.Views.BookmarksDialog || {}))
});