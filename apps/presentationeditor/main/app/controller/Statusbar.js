/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 *  Statusbar.js
 *
 *  Statusbar controller
 *
 *  Created by Maxim Kadushkin on 8 April 2014
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'presentationeditor/main/app/view/Statusbar',
    'common/main/lib/util/LanguageInfo',
    'common/main/lib/view/LanguageDialog'
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
                'FileMenu': {
                    'settings:apply': _.bind(this.applySettings, this)
                },
                'Statusbar': {
                    'langchanged': this.onLangMenu
                },
                'Common.Views.Header': {
                    'statusbar:hide': function (view, status) {
                        me.statusbar.setVisible(!status);
                        Common.localStorage.setBool('pe-hidden-status', status);

                        Common.NotificationCenter.trigger('layout:changed', 'status');
                        Common.NotificationCenter.trigger('edit:complete', this.statusbar);
                    }
                }
            });
            this._state = {
                zoom_type: undefined,
                zoom_percent: undefined
            };
        },

        events: function() {
            return {
                'click #btn-zoom-down': _.bind(this.zoomDocument,this,'down'),
                'click #btn-zoom-up': _.bind(this.zoomDocument,this,'up'),
                'click #btn-doc-lang':_.bind(this.onBtnLanguage,this)
            };
        },

        onLaunch: function() {
            this.statusbar = this.createView('Statusbar', {}).render();
            this.statusbar.$el.css('z-index', 1);

            this.bindViewEvents(this.statusbar, this.events);

            $('#status-label-zoom').css('min-width', 80);

            this.statusbar.btnZoomToPage.on('click', _.bind(this.onBtnZoomTo, this, 'topage'));
            this.statusbar.btnZoomToWidth.on('click', _.bind(this.onBtnZoomTo, this, 'towidth'));
            this.statusbar.zoomMenu.on('item:click', _.bind(this.menuZoomClick, this));
            this.statusbar.btnPreview.on('click', _.bind(this.onPreviewBtnClick, this));
            this.statusbar.btnPreview.menu.on('item:click', _.bind(this.onPreviewItemClick, this));
            this.statusbar.btnSetSpelling.on('click', _.bind(this.onBtnSpelling, this));
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onZoomChange',   _.bind(this._onZoomChange, this));
            this.api.asc_registerCallback('asc_onTextLanguage', _.bind(this._onTextLanguage, this));

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
            Common.NotificationCenter.trigger('preview:start', _.isNumber(slidenum) ? slidenum : 0, presenter);
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

        setStatusCaption: function(text, force, delay) {
            if (this.timerCaption && ( ((new Date()) < this.timerCaption) || text.length==0 ) && !force )
                return;

            this.timerCaption = undefined;
            if (text.length) {
                this.statusbar.showStatusMessage(text);
                if (delay>0)
                    this.timerCaption = (new Date()).getTime() + delay;
            } else
                this.statusbar.clearStatusMessage();
        },

        createDelayedElements: function() {
            this.statusbar.btnSetSpelling.toggle(Common.localStorage.getBool("pe-settings-spellcheck", true), true);
            this.statusbar.$el.css('z-index', '');
        },

        onBtnLanguage: function() {
            var me = this;
            (new Common.Views.LanguageDialog({
                languages: me.langs,
                current: me.api.asc_getDefaultLanguage(),
                handler: function(result, value) {
                    if (result=='ok') {
                        var record = _.findWhere(me.langs, {'value':value});
                        record && me.api.asc_setDefaultLanguage(record.code);
                    }
                }
            })).show();
        },

        onLangMenu: function(obj, langid, title) {
            this.api.put_TextPrLang(langid);
        },

        onBtnSpelling: function(d, b, e) {
            Common.localStorage.setItem("pe-settings-spellcheck", d.pressed ? 1 : 0);
            Common.Utils.InternalSettings.set("pe-settings-spellcheck", d.pressed);
            this.api.asc_setSpellCheck(d.pressed);
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        applySettings: function(menu) {
            this.statusbar.btnSetSpelling.toggle(Common.localStorage.getBool("pe-settings-spellcheck", true), true);
        },

        zoomText        : 'Zoom {0}%'
    }, PE.Controllers.Statusbar || {}));
});