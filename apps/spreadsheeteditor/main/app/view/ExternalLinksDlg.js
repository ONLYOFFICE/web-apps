/*
 *
 * (c) Copyright Ascensio System SIA 2010-2022
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
 *  ExternalLinksDlg.js
 *
 *  Created by Julia.Radzhabova on 26.07.22
 *  Copyright (c) 2022 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/ListView'
], function () {
    'use strict';

    SSE.Views = SSE.Views || {};

    SSE.Views.ExternalLinksDlg =  Common.Views.AdvancedSettingsWindow.extend(_.extend({

        options: {
            alias: 'ExternalLinksDlg',
            contentWidth: 450,
            height: 294,
            buttons: null
        },

        initialize: function (options) {
            var me = this;
            _.extend(this.options, {
                title: this.txtTitle,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                        '<div class="content-panel" style="padding: 0;"><div class="inner-content">',
                            '<div class="settings-panel active">',
                                '<table cols="1" style="width: 100%;">',
                                    '<tr>',
                                        '<td class="padding-large">',
                                            '<div id="external-links-btn-update" style="display: inline-block;margin-right: 5px;"></div>',
                                            '<div id="external-links-btn-delete" style="display: inline-block;margin-right: 5px;"></div>',
                                            // '<button type="button" class="btn btn-text-default auto sort-dialog-btn-text" id="external-links-btn-open">', me.textOpen ,'</button>',
                                            // '<button type="button" class="btn btn-text-default auto sort-dialog-btn-text" id="external-links-btn-change">', me.textChange ,'</button>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<label class="header">', me.textSource,'</label>',
                                            '<div id="external-links-list" class="range-tableview" style="width:100%; height: 148px;"></div>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            '</div></div>',
                        '</div>',
                    '</div>',
                    '<div class="footer center">',
                        '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + this.closeButtonText + '</button>',
                    '</div>'
                ].join('')
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.linksList = new Common.UI.ListView({
                el: $('#external-links-list', this.$window),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                tabindex: 1
            });

            this.btnUpdate = new Common.UI.Button({
                parentEl: $('#external-links-btn-update', this.$window),
                cls: 'btn-text-split-default auto',
                caption: this.textUpdate,
                split: true,
                menu        : new Common.UI.Menu({
                    style: 'min-width:100px;',
                    items: [
                        {
                            caption: this.textUpdate,
                            value: 0
                        },
                        {
                            caption:  this.textUpdateAll,
                            value: 1
                        }]
                })
            });
            $(this.btnUpdate.cmpEl.find('button')[0]).css('min-width', '87px');
            this.btnUpdate.on('click', _.bind(this.onUpdate, this));
            this.btnUpdate.menu.on('item:click', _.bind(this.onUpdateMenu, this));

            this.btnDelete = new Common.UI.Button({
                parentEl: $('#external-links-btn-delete', this.$window),
                cls: 'btn-text-split-default auto',
                caption: this.textDelete,
                split: true,
                menu        : new Common.UI.Menu({
                    style: 'min-width:100px;',
                    items: [
                        {
                            caption: this.textDelete,
                            value: 0
                        },
                        {
                            caption:  this.textDeleteAll,
                            value: 1
                        }]
                })
            });
            $(this.btnDelete.cmpEl.find('button')[0]).css('min-width', '87px');
            this.btnDelete.on('click', _.bind(this.onDelete, this));
            this.btnDelete.menu.on('item:click', _.bind(this.onDeleteMenu, this));

            this.btnOpen = new Common.UI.Button({
                el: $('#external-links-btn-open', this.$window)
            });
            this.btnOpen.on('click', _.bind(this.onOpen, this));

            this.btnChange = new Common.UI.Button({
                el: $('#external-links-btn-change', this.$window)
            });
            this.btnChange.on('click', _.bind(this.onChange, this));

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults();
        },

        getFocusedComponents: function() {
            return [ this.btnUpdate, this.btnDelete, this.btnOpen, this.btnChange, this.linksList ];
        },

        getDefaultFocusableComponent: function () {
            return this.linksList;
        },

        _setDefaults: function (props) {
            this.refreshList();
        },

        refreshList: function() {
            var arr = [];
            var links = this.api.asc_getExternalReferences();
            if (links) {
                for (var i=0; i<links.length; i++) {
                    arr.push({
                        value: links[i].asc_getSource(),
                        idx: i,
                        externalRef: links[i]
                    });
                }
            }
            this.linksList.store.reset(arr);
            (this.linksList.store.length>0) && this.linksList.selectByIndex(0);
            this.btnUpdate.setDisabled(this.linksList.store.length<1 || !this.linksList.getSelectedRec());
            this.btnDelete.setDisabled(this.linksList.store.length<1 || !this.linksList.getSelectedRec());
            this.btnOpen.setDisabled(this.linksList.store.length<1 || !this.linksList.getSelectedRec());
            this.btnChange.setDisabled(this.linksList.store.length<1 || !this.linksList.getSelectedRec());
        },

        onUpdate: function() {
            var rec = this.linksList.getSelectedRec();
            rec && this.api.asc_updateExternalReferences([rec.get('externalRef')]);
        },

        onUpdateMenu: function(menu, item) {
            if (item.value == 1) {
                var arr = [];
                this.linksList.store.each(function(item){
                    arr.push(item.get('externalRef'));
                }, this);
                (arr.length>0) && this.api.asc_updateExternalReferences(arr);
            } else
                this.onUpdate();
        },

        onDelete: function() {
            var rec = this.linksList.getSelectedRec();
            rec && this.api.asc_removeExternalReferences([rec.get('externalRef')]);
            this.refreshList();
        },

        onDeleteMenu: function(menu, item) {
            if (item.value == 1) {
                var arr = [];
                this.linksList.store.each(function(item){
                    arr.push(item.get('externalRef'));
                }, this);
                (arr.length>0) && this.api.asc_removeExternalReferences(arr);
                this.refreshList();
            } else
                this.onDelete();
        },

        onOpen: function() {

        },

        onChange: function() {

        },

        txtTitle: 'External Links',
        textUpdate: 'Update Values',
        textUpdateAll: 'Update All',
        textSource: 'Source',
        closeButtonText: 'Close',
        textDelete: 'Break Links',
        textDeleteAll: 'Break All Links',
        textOpen: 'Open Source',
        textChange: 'Change Source'

    }, SSE.Views.ExternalLinksDlg || {}));
});