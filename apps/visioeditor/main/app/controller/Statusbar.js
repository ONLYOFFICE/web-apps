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
 *  Statusbar.js
 *
 *  Statusbar controller
 *
 *  Created on 11/07/24
 *
 */

define([
    'core',
    'visioeditor/main/app/view/Statusbar',
    'common/main/lib/util/LanguageInfo',
    'common/main/lib/component/InputField'
], function () {
    'use strict';

    VE.Controllers.Statusbar = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [],
        views: [
            'Statusbar'
        ],

        initialize: function() {
            var me = this;
            this.addListeners({
                'Statusbar': {
                    'show:tab': _.bind(this.showTab, this)
                },
                'ViewTab': {
                    'statusbar:hide': _.bind(me.onChangeCompactView, me),
                    'statusbar:setcompact': _.bind(me.onChangeViewMode, me)
                }
            });
            this._state = {
                zoom_type: undefined,
                zoom_percent: undefined
            };
        },

        events: function() {
            return {
                'click #status-btn-zoomdown': _.bind(this.zoomDocument,this,'down'),
                'click #status-btn-zoomup': _.bind(this.zoomDocument,this,'up'),
                'click .cnt-zoom': _.bind(this.onZoomShow, this)
            };
        },


        onLaunch: function() {
            this.statusbar = this.createView('Statusbar').render();
            this.statusbar.$el.css('z-index', 10);
            this.statusbar.labelZoom.css('min-width', 80);
            this.statusbar.labelZoom.text(Common.Utils.String.format(this.zoomText, 100));
            this.statusbar.btnZoomToPage.on('click', _.bind(this.onBtnZoomTo, this, 'topage'));
            this.statusbar.btnZoomToWidth.on('click', _.bind(this.onBtnZoomTo, this, 'towidth'));
            this.statusbar.zoomMenu.on('item:click', _.bind(this.menuZoomClick, this));

            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
        },

        onAppReady: function (config) {
            var me = this;
            me._isDocReady = true;
            (new Promise(function(resolve) {
                resolve();
            })).then(function () {
                me.bindViewEvents(me.statusbar, me.events);
                me.statusbar.update();
            });
        },

        onChangeCompactView: function (view, status) {
            this.statusbar.setVisible(!status);
            Common.localStorage.setBool('ve-hidden-status', status);

            if (view.$el.closest('.btn-slot').prop('id') === 'slot-btn-options') {
                this.statusbar.fireEvent('view:hide', [this, status]);
            }

            Common.NotificationCenter.trigger('layout:changed', 'status');
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onZoomChange',   _.bind(this._onZoomChange, this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiDisconnect, this));
            Common.NotificationCenter.on('api:disconnect',               _.bind(this.onApiDisconnect, this));
            this.api.asc_registerCallback('asc_onCurrentPage',  _.bind(this.onCurrentPage, this));

            this.statusbar.setApi(api);
        },

        onBtnZoomTo: function(d, b, e) {
            this._state.zoom_type = undefined;
            this._state.zoom_percent = undefined;
            if (!b.pressed)
                this.api.zoomCustomMode(); else
                this.api[d=='topage'?'zoomFitToPage':'zoomFitToWidth']();
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        zoomDocument: function(d,e) {
            this._state.zoom_type = undefined;
            this._state.zoom_percent = undefined;
            switch (d) {
                case 'up':      this.api.zoomIn(); break;
                case 'down':    this.api.zoomOut(); break;
            }
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        menuZoomClick: function(menu, item) {
            this._state.zoom_type = undefined;
            this._state.zoom_percent = undefined;
            this.api.zoom(item.value);
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        onZoomShow: function(e){
            if (e.target.classList.contains('disabled')) {
                return false;
            }
        },

        /*
        *   api events
        * */

        _onZoomChange: function(percent, type) {
            if (this._state.zoom_type !== type) {
                this.statusbar.btnZoomToPage.toggle(type == 2, true);
                this.statusbar.btnZoomToWidth.toggle(type == 1, true);
                this._state.zoom_type = type;
            }
            if (this._state.zoom_percent !== percent) {
                this.statusbar.labelZoom.text(Common.Utils.String.format(this.zoomText, percent));
                this._state.zoom_percent = percent;
                if(!this._isDocReady ) return;
                var value = this._state.zoom_type !== undefined ? this._state.zoom_type == 2 ? -1 : (this._state.zoom_type == 1 ? -2 : percent) : percent;
                Common.localStorage.setItem('ve-last-zoom', value);
                Common.Utils.InternalSettings.set('ve-last-zoom', value);
            }
        },

        setStatusCaption: function(text, force, delay, callback) {
            if (this.timerCaption && ( ((new Date()) < this.timerCaption) || text.length==0 ) && !force )
                return;

            this.timerCaption = undefined;
            if (text.length) {
                this.statusbar.showStatusMessage(text);
                callback && callback();
                if (delay>0)
                    this.timerCaption = (new Date()).getTime() + delay;
            } else
                this.statusbar.clearStatusMessage();
        },

        createDelayedElements: function() {
            this.statusbar.$el.css('z-index', '');
            if (!Common.UI.LayoutManager.isElementVisible('statusBar-actionStatus')) {
                this.statusbar.boxAction.addClass('hide');
            }

            Common.NotificationCenter.on('window:resize', _.bind(this.onWindowResize, this));
        },

        onWindowResize: function(area) {
            this.statusbar.updateTabbarBorders();
            this.statusbar.onTabInvisible(undefined, this.statusbar.tabbar.checkInvisible(true));
        },

        showTab: function (sheetIndex) {
            if (this.api && this._state.pageCurrent !== sheetIndex) {
                this.api.goToPage(sheetIndex);
            }
            var me = this;
            setTimeout(function(){
                me.statusbar.sheetListMenu.hide();
            }, 1);
        },

        showDisconnectTip: function (text) {
            var me = this;
            text = text || this.textDisconnect;
            if (!this.disconnectTip) {
                var target = this.statusbar.getStatusLabel();
                target = target.is(':visible') ? target.parent() : this.statusbar.isVisible() ? this.statusbar.$el : $(document.body);
                this.disconnectTip = new Common.UI.SynchronizeTip({
                    target  : target,
                    text    : text,
                    placement: 'top',
                    position: this.statusbar.isVisible() ? undefined : {bottom: 0},
                    showLink: false,
                    style: 'max-width: 310px;'
                });
                this.disconnectTip.on({
                    'closeclick': function() {
                        me.disconnectTip.hide();
                        me.disconnectTip = null;
                    }
                });
            } else {
                this.disconnectTip.setText(text);
            }
            this.disconnectTip.show();
        },
        
        hideDisconnectTip: function() {
            this.disconnectTip && this.disconnectTip.hide();
            this.disconnectTip = null;
        },

        onApiDisconnect: function() {
            this.SetDisabled(true);
        },

        SetDisabled: function(state) {
            this.statusbar.setMode({isDisconnected: state});
            this.statusbar.update();
        },

        onCurrentPage: function (index) {
            this.statusbar.sheetListMenu.hide();
            if (this.statusbar.sheetListMenu.items[index]) {
                this.statusbar.sheetListMenu.clearAll();
                this.statusbar.sheetListMenu.items[index].setChecked(true);
            }
            var tab = _.findWhere(this.statusbar.tabbar.tabs, {sheetindex: index});
            if (tab) {
                this.statusbar.tabbar.setActive(tab);
            }
        },

        onChangeViewMode: function(item, compact, suppressEvent) {
            this.statusbar.fireEvent('view:compact', [this.statusbar, compact]);
            !suppressEvent && Common.localStorage.setBool('ve-compact-statusbar', compact);
            Common.NotificationCenter.trigger('layout:changed', 'status');
            this.statusbar.onChangeCompact(compact);

            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        zoomText        : 'Zoom {0}%',
        textDisconnect: '<b>Connection is lost</b><br>Trying to connect. Please check connection settings.'
    }, VE.Controllers.Statusbar || {}));
});