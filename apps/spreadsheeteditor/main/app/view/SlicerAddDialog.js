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
 *  SlicerAddDialog.js
 *
 *  Created on 10.04.2020
 *
 */

define([], function () {
    'use strict';

    SSE.Views.SlicerAddDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 250,
            style: 'min-width: 230px;',
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function (options) {
            _.extend(this.options, {
                title: this.txtTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div class="input-row">',
                        '<label class="font-weight-bold">' + this.textColumns + '</label>',
                    '</div>',
                    '<div id="add-slicers-dlg-columns" class="" style="width: 100%; height: 162px; overflow: hidden;"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.props = this.options.props;
            this.handler =   this.options.handler;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);

            this.columnsList = new Common.UI.ListView({
                el: $('#add-slicers-dlg-columns', this.$window),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                scrollAlwaysVisible: true,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div>',
                    '<label class="checkbox-indeterminate" style="position:absolute;">',
                    '<input id="rdcheckbox-<%= id %>" type="checkbox" class="button__checkbox">',
                    '<label for="rdcheckbox-<%= id %>" class="checkbox__shape" ></label>',
                    '</label>',
                    '<div id="<%= id %>" class="list-item margin-left-20" style="pointer-events:none; display: flex;">',
                    '<div style="flex-grow: 1;"><%= Common.Utils.String.htmlEncode(value) %></div>',
                    '</div>',
                    '</div>'
                ].join('')),
                tabindex: 1
            });
            this.columnsList.on({
                'item:change': this.onItemChanged.bind(this),
                'item:add': this.onItemChanged.bind(this),
                'item:select': this.onCellCheck.bind(this)
            });
            this.columnsList.onKeyDown = _.bind(this.onListKeyDown, this);
            this.columnsList.on('entervalue', _.bind(this.onPrimary, this));

            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.columnsList].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.columnsList;
        },

        updateColumnsList: function(props) {
            var arr = [];
            if (props && props.length>0) {
                this.props.forEach(function (item, index) {
                    arr.push(new Common.UI.DataViewModel({
                        id              : index,
                        selected        : false,
                        allowSelected   : true,
                        value           : item,
                        check           : false
                    }));
                });

                this.columnsList.store.reset(arr);
                this.columnsList.scroller.update({minScrollbarLength  : this.columnsList.minScrollbarLength, alwaysVisibleY: true, suppressScrollX: true});
            }
        },

        onItemChanged: function (view, record) {
            var state = record.model.get('check');
            if ( state == 'indeterminate' )
                $('input[type=checkbox]', record.$el).prop('indeterminate', true);
            else $('input[type=checkbox]', record.$el).prop({checked: state, indeterminate: false});
        },

        onCellCheck: function (listView, itemView, record) {
            if (this.checkCellTrigerBlock)
                return;

            var target = '', isLabel = false, bound = null;

            var event = window.event ? window.event : window._event;
            if (event) {
                target = $(event.currentTarget).find('.list-item');

                if (target.length) {
                    bound = target.get(0).getBoundingClientRect();
                    var _clientX = event.clientX*Common.Utils.zoom(),
                        _clientY = event.clientY*Common.Utils.zoom();
                    if (bound.left < _clientX && _clientX < bound.right &&
                        bound.top < _clientY && _clientY < bound.bottom) {
                        isLabel = true;
                    }
                }

                if (isLabel || event.target.className.match('checkbox') && event.target.localName!=='input') {
                    this.updateCellCheck(listView, record);

                    _.delay(function () {
                        listView.focus();
                    }, 100, this);
                }
            }
        },

        onListKeyDown: function (e, data) {
            var record = null, listView = this.columnsList;

            if (listView.disabled) return;
            if (_.isUndefined(undefined)) data = e;

            if (data.keyCode == Common.UI.Keys.SPACE) {
                data.preventDefault();
                data.stopPropagation();

                this.updateCellCheck(listView, listView.getSelectedRec());

            } else {
                Common.UI.DataView.prototype.onKeyDown.call(this.columnsList, e, data);
            }
        },

        updateCellCheck: function (listView, record) {
            if (record && listView) {
                    record.set('check', !record.get('check'));
                // listView.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true, suppressScrollX: true});
            }
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            if (props) {
                this.updateColumnsList(props);
            }

            var me = this;
            _.delay(function () {
                me.columnsList.focus();
            }, 100, this);
        },

        getSettings: function () {
            var store = this.columnsList.store,
                props = [];
            store.each(function(item, index) {
                item.get('check') && (props.push(item.get('value')));
            });
            return props;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onDblClickFormat: function () {
            this._handleInput('ok');
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, state, (state == 'ok') ? this.getSettings() : this.props);
            }

            this.close();
        },

        //
        txtTitle: 'Insert Slicers',
        textColumns: 'Columns'

    }, SSE.Views.SlicerAddDialog || {}));
});