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
 *  Created on 8 April 2014
 *
 */

define([
    'core',
    'presentationeditor/main/app/view/Statusbar',
    'common/main/lib/util/LanguageInfo'
], function () {
    'use strict';

    PE.Controllers.Statusbar = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [],
        views: [
            'Statusbar'
        ],

        initialize: function() {
            var me = this;
            this.addListeners({
                'Statusbar': {
                    'langchanged': this.onLangMenu
                },
                'ViewTab': {
                    'statusbar:hide': _.bind(me.onChangeCompactView, me),
                    'viewmode:change': _.bind(me.onChangeViewMode, me)
                }
            });
            this._state = {
                zoom_type: undefined,
                zoom_percent: undefined,
                slideMasterMode: false
            };
            this._isZoomRecord = (Common.localStorage.getItem("pe-settings-zoom") != -3);
        },

        events: function() {
            return {
                'click #btn-zoom-down': _.bind(this.zoomDocument,this,'down'),
                'click #btn-zoom-up': _.bind(this.zoomDocument,this,'up')
            };
        },

        onLaunch: function() {
            this.statusbar = this.createView('Statusbar', {}).render();
            this.statusbar.$el.css('z-index', 1);

            this.bindViewEvents(this.statusbar, this.events);

            var lblzoom = $('#status-label-zoom');
            lblzoom.css('min-width', 80);
            lblzoom.text(Common.Utils.String.format(this.zoomText, 100));

            this.statusbar.btnZoomToPage.on('click', _.bind(this.onBtnZoomTo, this, 'topage'));
            this.statusbar.btnZoomToWidth.on('click', _.bind(this.onBtnZoomTo, this, 'towidth'));
            this.statusbar.zoomMenu.on('item:click', _.bind(this.menuZoomClick, this));
            this.statusbar.btnPreview.on('click', _.bind(this.onPreviewBtnClick, this));
            this.statusbar.btnPreview.menu.on('item:click', _.bind(this.onPreviewItemClick, this));

            var me = this;
            Common.NotificationCenter.on('app:face', function (cfg) {
                if ( cfg.isEdit ) {
                    var review = me.getApplication().getController('Common.Controllers.ReviewChanges').getView();
                    me.btnSpelling = review.getButton('spelling', 'statusbar');
                    me.btnSpelling.render( me.statusbar.$el.find('#btn-doc-spell') );
                    me.btnDocLang = review.getButton('doclang', 'statusbar');
                    me.btnDocLang.render( me.statusbar.$el.find('#btn-doc-lang') );

                    var isVisible = (Common.UI.LayoutManager.isElementVisible('statusBar-textLang') || Common.UI.LayoutManager.isElementVisible('statusBar-docLang'))
                                    && Common.UI.FeaturesManager.canChange('spellcheck');
                    me.btnDocLang.$el.find('+.separator.space')[isVisible?'show':'hide']();
                    isVisible = Common.UI.LayoutManager.isElementVisible('statusBar-textLang') || Common.UI.LayoutManager.isElementVisible('statusBar-docLang')
                                || Common.UI.FeaturesManager.canChange('spellcheck');
                    me.statusbar.$el.find('.el-lang')[isVisible?'show':'hide']();
                } else {
                    me.statusbar.$el.find('.el-edit, .el-review').hide();
                }
            });
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onZoomChange',   _.bind(this._onZoomChange, this));
            this.api.asc_registerCallback('asc_onTextLanguage', _.bind(this._onTextLanguage, this));
            this.api.asc_registerCallback('asc_onDocumentContentReady', _.bind(function (){this._isZoomRecord = true;}, this));
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

        zoomDocument: function(d, e) {
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

        onPreview: function(slidenum, presenter) {
            var slideNum = this._state.slideMasterMode ? 0 : (_.isNumber(slidenum) ? slidenum : 0);
            Common.NotificationCenter.trigger('preview:start', slideNum, presenter);
        },

        onPreviewBtnClick: function(btn, e) {
            this.onPreview(this.api.getCurrentPage());
        },

        onPreviewItemClick: function(menu, item) {
            switch (item.value) {
                case 0:
                    this.onPreview(0);
                    break;
                case 1:
                    this.onPreview(this.api.getCurrentPage());
                    break;
                case 2:
                    this.onPreview(0, true);
                    break;
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
                 $('#status-label-zoom').text(Common.Utils.String.format(this.zoomText, percent));
                 this._state.zoom_percent = percent;
                 if(!this._isZoomRecord ) return;
                 var value = this._state.zoom_type !== undefined ? this._state.zoom_type == 2 ? -1 : (this._state.zoom_type == 1 ? -2 : percent) : percent;
                 Common.localStorage.setItem('pe-last-zoom', value);
                 Common.Utils.InternalSettings.set('pe-last-zoom', value);
             }
        },

        _onTextLanguage: function(langId) {
            var info = Common.util.LanguageInfo.getLocalLanguageName(langId);
            this.statusbar.setLanguage({
                value:    info[0],
                displayValue:  info[1],
                code:   langId
            });
        },

        setLanguages: function(langs) {
            this.langs = langs;
            this.statusbar.reloadLanguages(langs);
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
        },

        onLangMenu: function(obj, langid, title) {
            this.api.put_TextPrLang(langid);
        },

        onChangeCompactView: function (view, status) {
            this.statusbar.setVisible(!status);
            Common.localStorage.setBool('pe-hidden-status', status);

            if (view.$el.closest('.btn-slot').prop('id') === 'slot-btn-options') {
                this.statusbar.fireEvent('view:hide', [this, status]);
            }

            Common.NotificationCenter.trigger('layout:changed', 'status');
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        showDisconnectTip: function () {
            var me = this;
            if (!this.disconnectTip) {
                var target = this.statusbar.getStatusLabel();
                target = target.is(':visible') ? target.parent() : this.statusbar.isVisible() ? this.statusbar.$el : $(document.body);
                this.disconnectTip = new Common.UI.SynchronizeTip({
                    target  : target,
                    text    : this.textDisconnect,
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
            }
            this.disconnectTip.show();
        },

        hideDisconnectTip: function() {
            this.disconnectTip && this.disconnectTip.hide();
            this.disconnectTip = null;
        },

        onChangeViewMode: function (mode) {
             var isSlideMaster = mode === 'master';
             this._state.slideMasterMode = isSlideMaster;
             this.statusbar.showSlideMasterStatus(isSlideMaster);
        },

        zoomText        : 'Zoom {0}%',
        textDisconnect: '<b>Connection is lost</b><br>Trying to connect. Please check connection settings.'

    }, PE.Controllers.Statusbar || {}));
});