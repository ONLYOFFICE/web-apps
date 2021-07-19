/*
 *
 * (c) Copyright Ascensio System SIA 2010-2020
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
 *
 *  ViewManagerDlg.js
 *
 *  Created by Julia.Radzhabova on 09.07.2020
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/view/EditNameDialog',
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/ListView',
    'common/main/lib/component/InputField'
], function () {
    'use strict';

    SSE.Views = SSE.Views || {};

    SSE.Views.ViewManagerDlg =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'ViewManagerDlg',
            contentWidth: 460,
            height: 330,
            buttons: null
        },

        initialize: function (options) {
            var me = this;
            _.extend(this.options, {
                title: this.txtTitle,
                template: [
                    '<div class="box" style="height:' + (this.options.height-85) + 'px;">',
                        '<div class="content-panel" style="padding: 0;">',
                        '<div class="settings-panel active">',
                        '<div class="inner-content">',
                            '<table cols="1" style="width: 100%;">',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<label class="header">' + this.textViews + '</label>',
                                        '<div id="view-manager-list" class="range-tableview" style="width:440px; height: 166px;"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-large">',
                                        '<button type="button" class="btn btn-text-default auto" id="view-manager-btn-new" style="min-width: 80px;margin-right:5px;">' + this.textNew + '</button>',
                                        '<button type="button" class="btn btn-text-default auto" id="view-manager-btn-rename" style="min-width: 80px;margin-right:5px;">' + this.textRename + '</button>',
                                        '<button type="button" class="btn btn-text-default auto" id="view-manager-btn-duplicate" style="min-width: 80px;">' + this.textDuplicate + '</button>',
                                        '<button type="button" class="btn btn-text-default auto" id="view-manager-btn-delete" style="min-width: 80px;float: right;">' + this.textDelete + '</button>',
                                    '</td>',
                                '</tr>',
                            '</table>',
                        '</div>',
                        '</div>',
                        '</div>',
                    '</div>',
                    '<div class="separator horizontal"></div>',
                    '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="min-width: 86px;width: auto;">' + this.textGoTo + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + this.closeButtonText + '</button>',
                    '</div>'
                ].join('')
            }, options);

            this.api       = options.api;
            this.views     = options.views || [];
            this.userTooltip = true;
            this.currentView = undefined;

            this.wrapEvents = {
                onRefreshNamedSheetViewList: _.bind(this.onRefreshNamedSheetViewList, this)
            };
            
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.viewList = new Common.UI.ListView({
                el: $('#view-manager-list', this.$window),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                emptyText: this.textEmpty,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                        '<div id="<%= id %>" class="list-item" style="width: 100%;height: 20px;display:inline-block;<% if (!lock) { %>pointer-events:none;<% } %>">',
                            '<div style="width:100%;"><%= Common.Utils.String.htmlEncode(name) %></div>',
                            '<% if (lock) { %>',
                                '<div class="lock-user"><%=lockuser%></div>',
                            '<% } %>',
                        '</div>'
                ].join(''))
            });
            this.viewList.on('item:select', _.bind(this.onSelectItem, this))
                         .on('item:keydown', _.bind(this.onKeyDown, this))
                         .on('item:dblclick', _.bind(this.onDblClickItem, this))
                         .on('entervalue', _.bind(this.onDblClickItem, this));

            this.btnNew = new Common.UI.Button({
                el: $('#view-manager-btn-new')
            });
            this.btnNew.on('click', _.bind(this.onNew, this, false));

            this.btnRename = new Common.UI.Button({
                el: $('#view-manager-btn-rename')
            });
            this.btnRename.on('click', _.bind(this.onRename, this));
            
            this.btnDuplicate = new Common.UI.Button({
                el: $('#view-manager-btn-duplicate')
            });
            this.btnDuplicate.on('click', _.bind(this.onNew, this, true));

            this.btnDelete = new Common.UI.Button({
                el: $('#view-manager-btn-delete')
            });
            this.btnDelete.on('click', _.bind(this.onDelete, this));

            this.btnOk = new Common.UI.Button({
                el: this.$window.find('.primary'),
                disabled: true
            });
            
            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults();
        },

        _setDefaults: function (props) {
            this.refreshList(this.views);
            this.api.asc_registerCallback('asc_onRefreshNamedSheetViewList', this.wrapEvents.onRefreshNamedSheetViewList);
        },

        onRefreshNamedSheetViewList: function() {
            this.refreshList(this.api.asc_getNamedSheetViews(), this.currentView);
        },

        refreshList: function(views, selectedItem) {
            var active = 0;
            if (views) {
                this.views = views;
                var arr = [];
                for (var i=0; i<this.views.length; i++) {
                    var view = this.views[i],
                        id = view.asc_getIsLock();
                    arr.push({
                        name: view.asc_getName(true),
                        active: view.asc_getIsActive(),
                        view: view,
                        lock: (id!==null && id!==undefined),
                        lockuser: (id) ? this.getUserName(id) : this.guestText
                    });
                    view.asc_getIsActive() && (active = i);
                }
                this.viewList.store.reset(arr);
            }

            var val = this.viewList.store.length;
            this.btnRename.setDisabled(!val);
            this.btnDuplicate.setDisabled(!val);
            this.btnDelete.setDisabled(!val);
            this.btnOk.setDisabled(!val);
            if (val>0) {
                if (selectedItem===undefined || selectedItem===null) selectedItem = active;
                if (_.isNumber(selectedItem)) {
                    if (selectedItem>val-1) selectedItem = val-1;
                    this.viewList.selectByIndex(selectedItem);
                    setTimeout(function() {
                        me.viewList.scrollToRecord(me.viewList.store.at(selectedItem));
                    }, 50);

                }
                if (this.userTooltip===true && this.viewList.cmpEl.find('.lock-user').length>0)
                    this.viewList.cmpEl.on('mouseover',  _.bind(this.onMouseOverLock, this)).on('mouseout',  _.bind(this.onMouseOutLock, this));
            }

            var me = this;
            _.delay(function () {
                me.viewList.cmpEl.find('.listview').focus();
                me.viewList.scroller.update({alwaysVisibleY: true});
            }, 100, this);
        },

        onMouseOverLock: function (evt, el, opt) {
            if (this.userTooltip===true && $(evt.target).hasClass('lock-user')) {
                var me = this,
                    tipdata = $(evt.target).tooltip({title: this.tipIsLocked,trigger:'manual'}).data('bs.tooltip');

                this.userTooltip = tipdata.tip();
                this.userTooltip.css('z-index', parseInt(this.$window.css('z-index')) + 10);
                tipdata.show();

                setTimeout(function() { me.userTipHide(); }, 5000);
            }
        },

        userTipHide: function () {
            if (typeof this.userTooltip == 'object') {
                this.userTooltip.remove();
                this.userTooltip = undefined;
                this.viewList.cmpEl.off('mouseover').off('mouseout');
            }
        },

        onMouseOutLock: function (evt, el, opt) {
            if (typeof this.userTooltip == 'object') this.userTipHide();
        },

        onNew: function (duplicate) {
            var rec = duplicate ? this.viewList.getSelectedRec().get('view') : undefined;
            this.currentView = this.viewList.store.length;
            this.api.asc_addNamedSheetView(rec);
        },

        onDelete: function () {
            var me = this,
                rec = this.viewList.getSelectedRec(),
                res;
            if (rec) {
                if (rec.get('active')) {
                    Common.UI.warning({
                        msg: this.warnDeleteView.replace('%1', rec.get('name')),
                        buttons: ['yes', 'no'],
                        primary: 'yes',
                        callback: function(btn) {
                            if (btn == 'yes') {
                                me.api.asc_deleteNamedSheetViews([rec.get('view')]);
                            }
                        }
                    });
                } else {
                    this.api.asc_deleteNamedSheetViews([rec.get('view')]);
                }
            }
        },

        onRename: function () {
            var rec = this.viewList.getSelectedRec();
            if (rec) {
                var me = this;
                (new Common.Views.EditNameDialog({
                    label: this.textRenameLabel,
                    error: this.textRenameError,
                    value: rec.get('name'),
                    validation: function(value) {
                        return value.length<128 ? true : me.textLongName;
                    },
                    handler: function(result, value) {
                        if (result == 'ok') {
                            rec.get('view').asc_setName(value);
                        }
                    }
                })).show();
            }
        },

        getSettings: function() {
            var rec = this.viewList.getSelectedRec();
            return rec ? rec.get('name') : null;
        },

        getUserName: function(id){
            var usersStore = SSE.getCollection('Common.Collections.Users');
            if (usersStore){
                var rec = usersStore.findUser(id);
                if (rec)
                    return Common.Utils.UserInfoParser.getParsedName(rec.get('username'));
            }
            return this.guestText;
        },

        onSelectItem: function(lisvView, itemView, record) {
            if (!record) return;

            this.userTipHide();
            var rawData = {},
                isViewSelect = _.isFunction(record.toJSON);

            if (isViewSelect){
                if (record.get('selected')) {
                    rawData = record.toJSON();
                } else {// record deselected
                    return;
                }
                this.currentView = _.indexOf(this.viewList.store.models, record);
                this.btnRename.setDisabled(rawData.lock);
                this.btnDelete.setDisabled(rawData.lock);
            }
        },

        close: function () {
            this.userTipHide();
            this.api.asc_unregisterCallback('asc_onRefreshNamedSheetViewList', this.wrapEvents.onRefreshNamedSheetViewList);

            Common.Views.AdvancedSettingsWindow.prototype.close.call(this);
        },

        onKeyDown: function (lisvView, record, e) {
            if (e.keyCode==Common.UI.Keys.DELETE && !this.btnDelete.isDisabled())
                this.onDelete();
        },

        onDblClickItem: function (lisvView, record, e) {
            this.onPrimary();
        },

        onPrimary: function() {
            if (this.btnOk.isDisabled()) return false;

            if ( this.handler && this.handler.call(this, 'ok', this.getSettings()) )
                return;

            this.close();
            return false;
        },

        txtTitle: 'Sheet View Manager',
        textViews: 'Sheet views',
        closeButtonText : 'Close',
        textNew: 'New',
        textRename: 'Rename',
        textDuplicate: 'Duplicate',
        textDelete: 'Delete',
        textGoTo: 'Go to view',
        textEmpty: 'No views have been created yet.',
        guestText: 'Guest',
        tipIsLocked: 'This element is being edited by another user.',
        textRenameLabel: 'Rename view',
        textRenameError: 'View name must not be empty.',
        warnDeleteView: "You are trying to delete the currently enabled view '%1'.<br>Close this view and delete it?",
        textLongName: 'Enter a name that is less than 128 characters.'

    }, SSE.Views.ViewManagerDlg || {}));
});