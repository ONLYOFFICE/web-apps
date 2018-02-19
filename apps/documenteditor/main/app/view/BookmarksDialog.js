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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
            contentWidth: 300,
            height: 340
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
                                        '<div id="bookmarks-list" style="width:100%; height: 130px;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<button type="button" class="btn btn-text-default" id="bookmarks-btn-goto" style="margin-right: 10px;">', me.textGoto,'</button>',
                                            '<button type="button" class="btn btn-text-default" id="bookmarks-btn-delete" style="">', me.textDelete,'</button>',
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

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.txtName = new Common.UI.InputField({
                el          : $('#bookmarks-txt-name'),
                allowBlank  : true,
                validateOnChange: true,
                validateOnBlur: false,
                style       : 'width: 195px;',
                value       : ''
            }).on ('changing', function (input, value) {
            });

            this.radioName = new Common.UI.RadioBox({
                el: $('#bookmarks-radio-name'),
                labelText: this.textName,
                name: 'asc-radio-bookmark-sort',
                checked: true
            });
            // this.radioName.on('change', _.bind(this.onRadioNameChange, this));

            this.radioLocation = new Common.UI.RadioBox({
                el: $('#bookmarks-radio-location'),
                labelText: this.textLocation,
                name: 'asc-radio-bookmark-sort'
            });
            // this.radioName.on('change', _.bind(this.onRadioNameChange, this));

            this.bookmarksList = new Common.UI.ListView({
                el: $('#bookmarks-list', this.$window),
                store: new Common.UI.DataViewStore()
            });
            this.bookmarksList.store.comparator = function(rec) {
                return (me.radioName.getValue() ? rec.get("name") : rec.get("location"));
            };
            // this.bookmarksList.on('item:dblclick', _.bind(this.onDblClickFunction, this));
            // this.bookmarksList.on('entervalue', _.bind(this.onPrimary, this));
            // this.bookmarksList.on('item:select', _.bind(this.onSelectBookmark, this));

            this.btnAdd = new Common.UI.Button({
                el: $('#bookmarks-btn-add')
            });
            this.$window.find('#bookmarks-btn-add').on('click', _.bind(this.onDlgBtnClick, this));

            this.btnGoto = new Common.UI.Button({
                el: $('#bookmarks-btn-goto')
            });

            this.btnDelete = new Common.UI.Button({
                el: $('#bookmarks-btn-delete')
            });

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        _setDefaults: function (props) {
            if (props) {
            }
        },

        getSettings: function () {
            return {};
        },

        onDlgBtnClick: function(event) {
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'add') {
                this.handler && this.handler.call(this, state,  (state == 'add') ? this.getSettings() : undefined);
            }

            this.close();
        },

        onPrimary: function() {
            return true;
        },

        textTitle:    'Bookmarks',
        textLocation: 'Location',
        textBookmarkName: 'Bookmark name',
        textSort: 'Sort by',
        textName: 'Name',
        textAdd: 'Add',
        textGoto: 'Go to',
        textDelete: 'Delete',
        textClose: 'Close'

    }, DE.Views.BookmarksDialog || {}))
});