/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 *  BookmarksDialog.js.js
 *
 *  Created by Julia Radzhabova on 15.02.2018
 *  Copyright (c) 2017 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/ListView',
    'common/main/lib/component/InputField',
    'common/main/lib/component/Button',
    'common/main/lib/component/RadioBox',
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    DE.Views.BookmarksDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 310,
            height: 360
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                        '<div class="content-panel" style="padding: 0 5px;"><div class="inner-content">',
                            '<div class="settings-panel active">',
                                '<table cols="1" style="width: 100%;">',
                                    '<tr>',
                                        '<td class="padding-extra-small">',
                                        '<label class="input-label">', me.textBookmarkName, '</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-large">',
                                            '<div id="bookmarks-txt-name" style="display:inline-block;vertical-align: top;margin-right: 10px;"></div>',
                                            '<button type="button" result="add" class="btn btn-text-default" id="bookmarks-btn-add" style="vertical-align: top;">', me.textAdd,'</button>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-extra-small">',
                                            '<label class="header" style="margin-right: 10px;">', me.textSort,'</label>',
                                            '<div id="bookmarks-radio-name" style="display: inline-block; margin-right: 10px;"></div>',
                                            '<div id="bookmarks-radio-location" style="display: inline-block;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                        '<div id="bookmarks-list" style="width:290px; height: 130px;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-large">',
                                            '<button type="button" class="btn btn-text-default" id="bookmarks-btn-goto" style="margin-right: 5px;">', me.textGoto,'</button>',
                                            '<div style="display: inline-block; position: relative;">',
                                                '<button type="button" class="btn btn-text-default auto dropdown-toggle" id="bookmarks-btn-link" style="min-width: 75px;" data-toggle="dropdown">', me.textGetLink,'</button>',
                                                '<div id="id-clip-copy-box" class="dropdown-menu" style="width: 291px; left: -80px; padding: 10px;">',
                                                    '<div id="id-dlg-clip-copy"></div>',
                                                    '<button id="id-dlg-copy-btn" class="btn btn-text-default" style="margin-left: 5px; width: 86px;">' + me.textCopy + '</button>',
                                                '</div>',
                                            '</div>',
                                            '<button type="button" class="btn btn-text-default" id="bookmarks-btn-delete" style="float: right;">', me.textDelete,'</button>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td>',
                                            '<div id="bookmarks-checkbox-hidden"></div>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            '</div></div>',
                        '</div>',
                    '</div>',
                    '<div class="footer right">',
                    '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + me.textClose + '</button>',
                    '</div>'
                ].join('')
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
                style       : 'width: 205px;',
                value       : '',
                maxLength: 40,
                validation  : function(value) {
                    var check = me.props.asc_CheckNewBookmarkName(value);
                    me.btnAdd.setDisabled(!check);
                    return (check || _.isEmpty(value)) ? true : me.txtInvalidName;
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
                itemTemplate: _.template('<div id="<%= id %>" class="list-item" style="pointer-events:none;overflow: hidden; text-overflow: ellipsis;"><%= value %></div>')
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
                var inputCopy = new Common.UI.InputField({
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
                            inputCopy._input.select().focus();
                        },100);
                    },
                    'hide.bs.dropdown': function () {
                        me.txtName._input.select().focus();
                    }
                });
                copyBox.find('button').on('click', function() {
                    inputCopy._input.select();
                    document.execCommand("copy");
                });

                Common.Gateway.on('setactionlink', function (url) {
                    inputCopy.setValue(url);
                });
            }

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.props);
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
            this.bookmarksList.scrollToRecord(this.bookmarksList.selectByIndex(0));
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
            var value = record.get('value');
            this.txtName.setValue(value);
            this.btnAdd.setDisabled(false);
            this.btnGoto.setDisabled(false);
            this.btnDelete.setDisabled(false);
            this.btnGetLink.setDisabled(false);
        },

        gotoBookmark: function(btn, eOpts){
            var rec = this.bookmarksList.getSelectedRec();
            if (rec.length>0) {
                this.props.asc_SelectBookmark(rec[0].get('value'));
            }
        },

        addBookmark: function(btn, eOpts){
            this.props.asc_AddBookmark(this.txtName.getValue());
            this.refreshBookmarks();
            var rec = this.bookmarksList.store.findWhere({value: this.txtName.getValue()});
            this.bookmarksList.selectRecord(rec);
            this.bookmarksList.scrollToRecord(rec);
        },

        onDblClickBookmark: function(listView, itemView, record) {
            this.props.asc_SelectBookmark(record.get('value'));
        },

        deleteBookmark: function(btn, eOpts){
            var rec = this.bookmarksList.getSelectedRec();
            if (rec.length>0) {
                this.props.asc_RemoveBookmark(rec[0].get('value'));
                var store = this.bookmarksList.store;
                var idx = _.indexOf(store.models, rec[0]);
                store.remove(rec[0]);
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
            if (rec.length>0) {
                Common.Gateway.requestMakeActionLink({
                                                        action: {
                                                            type: "bookmark", data: rec[0].get('value')
                                                        }
                                                    });
            }
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