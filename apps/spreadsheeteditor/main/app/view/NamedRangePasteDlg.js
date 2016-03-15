/**
 *
 *  NamedRangePasteDlg.js
 *
 *  Created by Julia.Radzhabova on 05.06.15
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/ListView'
], function () {
    'use strict';

    SSE.Views = SSE.Views || {};

    SSE.Views.NamedRangePasteDlg =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'NamedRangePasteDlg',
            contentWidth: 250,
            height: 282
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
                                        '<td class="padding-small">',
                                            '<label class="input-label">', me.textNames,'</label>',
                                            '<div id="named-range-paste-list" class="range-tableview" style="width:100%; height: 150px;"></div>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            '</div></div>',
                        '</div>',
                    '</div>',
                    '<div class="separator horizontal"></div>',
                    '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;  width: 86px;">' + me.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + me.cancelButtonText + '</button>',
                    '</div>'
                ].join('')
            }, options);

            this.handler    = options.handler;
            this.ranges     = options.ranges || [];

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.rangeList = new Common.UI.ListView({
                el: $('#named-range-paste-list', this.$window),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div style="pointer-events:none;">',
                        '<div id="<%= id %>" class="list-item" style="pointer-events:none;width: 100%;display:inline-block;">',
                            '<div class="listitem-icon <% if (isTable) {%>listitem-table<%} %>"></div>',
                            '<div style="width:186px;padding-right: 5px;"><%= name %></div>',
                        '</div>',
                    '</div>'
                ].join(''))
            });
            this.rangeList.store.comparator = function(item1, item2) {
                var n1 = item1.get('name').toLowerCase(),
                    n2 = item2.get('name').toLowerCase();
                if (n1==n2) return 0;
                return (n1<n2) ? -1 : 1;
            };
            this.rangeList.on('item:dblclick', _.bind(this.onDblClickFunction, this));
            this.rangeList.on('entervalue', _.bind(this.onPrimary, this));

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults();
        },

        _setDefaults: function () {
            if (this.ranges) {
                var me = this, arr = [], prev_name='';
                for (var i=0; i<this.ranges.length; i++) {
                    var name = this.ranges[i].asc_getName();
                    if (name !== prev_name) {
                        arr.push({
                            name: name,
                            scope: this.ranges[i].asc_getScope(),
                            range: this.ranges[i].asc_getRef(),
                            isTable: (this.ranges[i].asc_getIsTable()===true)
                        });
                    }
                    prev_name = name;
                }
                this.rangeList.store.reset(arr);
                this.rangeList.store.sort();
                if (this.rangeList.store.length>0)
                    this.rangeList.selectByIndex(0);
                this.rangeList.scroller.update({alwaysVisibleY: true});

                _.delay(function () {
                    me.rangeList.cmpEl.find('.listview').focus();
                }, 100, this);
            }
        },

        getSettings: function() {
            var rec = this.rangeList.getSelectedRec();
            return (rec.length>0) ? (new Asc.asc_CDefName(rec[0].get('name'), rec[0].get('range'), rec[0].get('scope'), rec[0].get('isTable'))) : null;
        },

        onPrimary: function() {
            this.handler && this.handler.call(this, 'ok', this.getSettings());
            this.close();
            return false;
        },

        onDlgBtnClick: function(event) {
            var state = event.currentTarget.attributes['result'].value;
            this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            this.close();
        },

        onDblClickFunction: function () {
            this.handler && this.handler.call(this, 'ok',  this.getSettings());
            this.close();
        },

        txtTitle: 'Paste Name',
        cancelButtonText : 'Cancel',
        okButtonText : 'Ok',
        textNames: 'Named Ranges'
    }, SSE.Views.NamedRangePasteDlg || {}));
});
