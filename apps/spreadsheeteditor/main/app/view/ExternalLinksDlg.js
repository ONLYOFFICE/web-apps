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
 *
 *  ExternalLinksDlg.js
 *
 *  Created on 26.07.22
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () {
    'use strict';

    SSE.Views = SSE.Views || {};

    SSE.Views.ExternalLinksDlg =  Common.Views.AdvancedSettingsWindow.extend(_.extend({

        options: {
            alias: 'ExternalLinksDlg',
            contentWidth: 510,
            separator: false,
            buttons: ['close']
        },

        initialize: function (options) {
            var me = this;
            _.extend(this.options, {
                title: this.txtTitle,
                contentStyle: 'padding: 0;',
                contentTemplate: _.template([
                        '<div class="settings-panel active">',
                            '<div class="inner-content">',
                                '<table cols="1" style="width: 100%;">',
                                    '<tr>',
                                        '<td class="padding-large">',
                                            '<div id="external-links-btn-update" class="float-left margin-right-5"></div>',
                                            '<div id="external-links-btn-change" class="float-left margin-right-5"></div>',
                                            '<div id="external-links-btn-open" class="float-left margin-right-5"></div>',
                                            '<div id="external-links-btn-delete" class="float-left"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td>',
                                            '<div id="external-links-list" class="range-tableview" style="width:100%; height: 171px;"></div>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            '</div></div>'
                ].join(''))({scope: this})
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.isUpdating = options.isUpdating || false;
            this.canRequestReferenceData = options.canRequestReferenceData || false;
            this.canRequestOpen = options.canRequestOpen || false;
            this.canRequestReferenceSource = options.canRequestReferenceSource || false;
            this.isOffline = options.isOffline || false;
            this.linkStatus = [];
            this.wrapEvents = {
                onUpdateExternalReferenceList: _.bind(this.refreshList, this)
            };
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.linksList = new Common.UI.ListView({
                el: $('#external-links-list', this.$window),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                headers: [
                    {name: me.textSource, width: 240},
                    {name: me.textStatus, width: 175}
                ],
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="width: 100%;display:inline-block;">',
                        '<div class="padding-right-5" style="width:240px;" data-toggle="tooltip"><%= value %></div>',
                        '<div style="width:175px;" data-toggle="tooltip"><%= status %></div>',
                    '</div>'
                ].join('')),
                tabindex: 1
            });
            this.linksList.on('item:add', _.bind(this.addTooltips, this));
            this.linksList.on('item:change', _.bind(this.addTooltips, this));
            this.linksList.on('reset:before', _.bind(this.resetItemsBefore, this));

            this.btnUpdate = new Common.UI.Button({
                parentEl: $('#external-links-btn-update', this.$window),
                cls: 'btn-text-split-default auto',
                caption: this.textUpdate,
                split: true,
                visible: !!this.canRequestReferenceData,
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
                }),
                takeFocusOnClose: true
            });
            var el = $(this.btnUpdate.cmpEl.find('button')[0]);
            el.css('min-width', Math.max(87, el.outerWidth()) + 'px');
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
                }),
                takeFocusOnClose: true
            });
            $(this.btnDelete.cmpEl.find('button')[0]).css('min-width', '87px');
            this.btnDelete.on('click', _.bind(this.onDelete, this));
            this.btnDelete.menu.on('item:click', _.bind(this.onDeleteMenu, this));

            this.btnOpen = new Common.UI.Button({
                parentEl: $('#external-links-btn-open', this.$window),
                cls: 'btn-text-default auto',
                caption: this.textOpen,
                visible: !!this.canRequestOpen
            });
            this.btnOpen.on('click', _.bind(this.onOpen, this));

            this.btnChange = new Common.UI.Button({
                parentEl: $('#external-links-btn-change', this.$window),
                cls: 'btn-text-default auto',
                caption: this.textChange,
                visible: !!this.canRequestReferenceSource
            });
            this.btnChange.on('click', _.bind(this.onChange, this));

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults();
            this.api.asc_registerCallback('asc_onUpdateExternalReferenceList', this.wrapEvents.onUpdateExternalReferenceList);
            this.isUpdating && this.setIsUpdating(this.isUpdating, true);
        },

        getFocusedComponents: function() {
            return [ this.btnUpdate, this.btnChange, this.btnOpen, this.btnDelete, this.linksList ].concat(this.getFooterButtons());
        },

        close: function () {
            this.api.asc_unregisterCallback('asc_onUpdateExternalReferenceList', this.wrapEvents.onUpdateExternalReferenceList);

            Common.Views.AdvancedSettingsWindow.prototype.close.call(this);
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
                        linkid: links[i].asc_getId(),
                        value: (links[i].asc_getSource() || '').replace(new RegExp("%20",'g')," "),
                        idx: i,
                        externalRef: links[i],
                        status: this.linkStatus[links[i].asc_getId()] || this.textUnknown
                    });
                }
            }
            this.linksList.store.reset(arr);
            (this.linksList.store.length>0) && this.linksList.selectByIndex(0);
            this.updateButtons();
        },

        onUpdate: function() {
            if (this.isUpdating) return;

            var rec = this.linksList.getSelectedRec();
            if (rec) {
                this.isOffline && this.setLinkStatus(rec.get('linkid'), this.textOk);
                this.api.asc_updateExternalReferences([rec.get('externalRef')]);
            }
        },

        onUpdateMenu: function(menu, item) {
            if (this.isUpdating) return;

            if (item.value == 1) {
                var arr = [],
                    me = this;
                this.linksList.store.each(function(item){
                    arr.push(item.get('externalRef'));
                    me.isOffline && me.setLinkStatus(item.get('linkid'), me.textOk);
                }, this);
                (arr.length>0) && this.api.asc_updateExternalReferences(arr);
            } else
                this.onUpdate();
        },

        onDelete: function() {
            if (this.isUpdating) return;

            var rec = this.linksList.getSelectedRec();
            rec && this.api.asc_removeExternalReferences([rec.get('externalRef')]);
            this.refreshList();
        },

        onDeleteMenu: function(menu, item) {
            if (this.isUpdating) return;

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
            var rec = this.linksList.getSelectedRec();
            if (rec) {
                var data = this.api.asc_openExternalReference(rec.get('externalRef'));
                if (data) {
                    switch (data.asc_getType()) {
                        case Asc.c_oAscExternalReferenceType.link:
                            data = {link: data.asc_getData()};
                            break;
                        case Asc.c_oAscExternalReferenceType.path:
                            data = {path: data.asc_getData()};
                            break;
                        case Asc.c_oAscExternalReferenceType.referenceData:
                            data = {
                                referenceData: data.asc_getData(),
                                path: data.asc_getPath()
                            };
                            break;
                    }
                    data.windowName = 'wname-' + Date.now();
                    window.open("", data.windowName);
                    Common.Gateway.requestOpen(data);
                }
            }
        },

        onChange: function() {
            var rec = this.linksList.getSelectedRec();
            if (rec) {
                if (this.isOffline)
                    this.api.asc_changeExternalReference(rec.get('externalRef'));
                else
                    this.fireEvent('change:source', this, rec.get('externalRef'));

            }
        },

        updateButtons: function() {
            var selected = this.linksList.store.length>0 && !!this.linksList.getSelectedRec();
            this.btnUpdate.setDisabled(!selected || this.isUpdating);
            this.btnDelete.setDisabled(!selected || this.isUpdating);
            this.btnOpen.setDisabled(!selected || this.isUpdating);
            this.btnChange.setDisabled(!selected || this.isUpdating);
        },

        setIsUpdating: function(status, immediately) {
            immediately = immediately || !status; // set timeout when start updating only
            this.isUpdating = status;
            if (!status && this.timerId) {
                clearTimeout(this.timerId);
                this.timerId = 0;
            }
            if (immediately) {
                this.updateButtons();
                this.btnUpdate.setCaption(status ? this.textUpdating : this.textUpdate);
            } else if (!this.timerId) {
                var me = this;
                me.timerId = setTimeout(function () {
                    me.updateButtons();
                    me.btnUpdate.setCaption(status ? me.textUpdating : me.textUpdate);
                },500);
            }
            !status && this.refreshList();
        },

        setLinkStatus: function(id, result) {
            if (!id) return;
            this.linkStatus[id] = result || this.textOk;
        },

        resetItemsBefore: function (dataview) {
            dataview.dataViewItems && _.each(dataview.dataViewItems, function(view) {
                if (view.tipsArray) {
                    view.tipsArray.forEach(function (item) {
                        if (item) {
                            if (item.dontShow===undefined)
                                item.dontShow = true;
                            (item.tip()).remove();
                        }
                    });
                }
            }, this);
        },

        addTooltips: function (dataview, view, record) {
            if (view.tipsArray) {
                view.tipsArray.forEach(function (item) {
                    if (item) {
                        if (item.dontShow===undefined)
                            item.dontShow = true;
                        (item.tip()).remove();
                    }
                });
            }

            var el = document.createElement('span');
            el.style.fontSize = document.documentElement.style.getPropertyValue("--font-size-base-app-custom") || '11px';
            el.style.fontFamily = document.documentElement.style.getPropertyValue("--font-family-base-custom") || 'Arial, Helvetica, "Helvetica Neue", sans-serif';
            el.style.position = "absolute";
            el.style.top = '-1000px';
            el.style.left = '-1000px';
            document.body.appendChild(el);

            var divs = $(view.el).find('.list-item > div');
            this.checkTextOfItem(el, view, $(divs[0]), record.get('value'), this.linksList.options.headers[0].width );
            this.checkTextOfItem(el, view, $(divs[1]), record.get('status'), this.linksList.options.headers[1].width );

            document.body.removeChild(el);
            view.tipsArray = [];
        },

        checkTextOfItem: function (test_el, view, div, txt, limit ) {
            test_el.innerHTML = txt;

            var dataview = this.linksList;
            if (test_el.offsetWidth > limit) {
                div.one('mouseenter', function(e){ // hide tooltip when mouse is over menu
                    var $target = $(e.target);
                    $target.tooltip({
                        title       : txt, // use actual tip, because it can be changed
                        placement   : 'cursor',
                        zIndex : dataview.tipZIndex
                    });
                    $target.mouseenter();
                    view.tipsArray.push($target.data('bs.tooltip'));
                });
            }
        },

        txtTitle: 'External Links',
        textUpdate: 'Update Values',
        textUpdateAll: 'Update All',
        textSource: 'Source',
        closeButtonText: 'Close',
        textDelete: 'Break Links',
        textDeleteAll: 'Break All Links',
        textOpen: 'Open Source',
        textChange: 'Change Source',
        textStatus: 'Status',
        textOk: 'OK',
        textUnknown: 'Unknown',
        textUpdating: 'Updating...'

    }, SSE.Views.ExternalLinksDlg || {}));
});