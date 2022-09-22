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
 *    SearchBar.js
 *
 *    Created by Julia Svinareva on 03.02.2022
 *    Copyright (c) 2022 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/Button'
], function () {
    'use strict';

    Common.UI.SearchBar = Common.UI.Window.extend(_.extend({
        options: {
            modal: false,
            width: 328,
            height: 54,
            header: false,
            cls: 'search-bar',
            alias: 'SearchBar',
            showOpenPanel: true,
            toolclose: 'hide'
        },

        initialize : function(options) {
            _.extend(this.options, options || {});

            this.template = [
                '<div class="box">',
                    '<input type="text" id="search-bar-text" class="input-field form-control" maxlength="255" placeholder="'+this.textFind+'" autocomplete="off">',
                    '<div class="tools">',
                        '<div id="search-bar-back"></div>',
                        '<div id="search-bar-next"></div>',
                        this.options.showOpenPanel ? '<div id="search-bar-open-panel"></div>' : '',
                        '<div id="search-bar-close"></div>',
                    '</div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.iconType = this.options.iconType;

            Common.UI.Window.prototype.initialize.call(this, this.options);

            Common.NotificationCenter.on('layout:changed', _.bind(this.onLayoutChanged, this));
            $(window).on('resize', _.bind(this.onLayoutChanged, this));
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.inputSearch = this.$window.find('#search-bar-text');
            this.inputSearch.on('input', _.bind(function () {
                this.disableNavButtons();
                this.fireEvent('search:input', [this.inputSearch.val()]);
            }, this)).on('keydown', _.bind(function (e) {
                this.fireEvent('search:keydown', [this.inputSearch.val(), e]);
            }, this));

            this.btnBack = new Common.UI.Button({
                parentEl: $('#search-bar-back'),
                cls: 'btn-toolbar',
                iconCls: this.iconType === 'svg' ? 'svg-icon search-arrow-up' : 'toolbar__icon btn-arrow-up',
                hint: this.tipPreviousResult
            });
            this.btnBack.on('click', _.bind(this.onBtnNextClick, this, 'back'));

            this.btnNext = new Common.UI.Button({
                parentEl: $('#search-bar-next'),
                cls: 'btn-toolbar',
                iconCls: this.iconType === 'svg' ? 'svg-icon search-arrow-down' : 'toolbar__icon btn-arrow-down',
                hint: this.tipNextResult
            });
            this.btnNext.on('click', _.bind(this.onBtnNextClick, this, 'next'));

            if (this.options.showOpenPanel) {
                this.btnOpenPanel = new Common.UI.Button({
                    parentEl: $('#search-bar-open-panel'),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon more-vertical',
                    hint: this.tipOpenAdvancedSettings
                });
                this.btnOpenPanel.on('click', _.bind(this.onOpenPanel, this));
            }

            this.btnClose = new Common.UI.Button({
                parentEl: $('#search-bar-close'),
                cls: 'btn-toolbar',
                iconCls: this.iconType === 'svg' ? 'svg-icon search-close' : 'toolbar__icon btn-close',
                hint: this.tipCloseSearch
            });
            this.btnClose.on('click', _.bind(function () {
                this.hide();
            }, this))

            this.on('animate:before', _.bind(this.focus, this));

            Common.NotificationCenter.on('search:updateresults', _.bind(this.disableNavButtons, this));

            return this;
        },

        show: function(text) {
            var top = ($('#app-title').length > 0 ? $('#app-title').height() : 0) + $('#toolbar').height() + 2,
                left = Common.Utils.innerWidth() - ($('#right-menu').is(':visible') ? $('#right-menu').width() : 0) - this.options.width - 32;
            Common.UI.Window.prototype.show.call(this, left, top);

            this.disableNavButtons();
            if (text) {
                this.inputSearch.val(text);
                this.fireEvent('search:input', [text]);
            } else {
                this.inputSearch.val('');
                window.SSE && this.fireEvent('search:input', ['', true]);
            }

            this.focus();
        },

        focus: function() {
            var me  = this;
            setTimeout(function(){
                me.inputSearch.focus();
                me.inputSearch.select();
            }, 10);
        },

        setText: function (text) {
            this.inputSearch.val(text);
            this.fireEvent('search:input', [text]);
        },

        getSettings: function() {
            return {

            };
        },

        onLayoutChanged: function () {
            var top = $('#app-title').height() + $('#toolbar').height() + 2,
                left = Common.Utils.innerWidth() - ($('#right-menu').is(':visible') ? $('#right-menu').width() : 0) - this.options.width - 32;
            this.$window.css({left: left, top: top});
        },

        onBtnNextClick: function(action) {
            this.fireEvent('search:'+action, [this.inputSearch.val(), false]);
        },

        onOpenPanel: function () {
            this.hide();
            this.fireEvent('search:show', [true, this.inputSearch.val()]);
        },

        disableNavButtons: function (resultNumber, allResults) {
            var disable = (this.inputSearch.val() === '' && !window.SSE) || !allResults;
            this.btnBack.setDisabled(disable);
            this.btnNext.setDisabled(disable);
        },

        textFind: 'Find',
        tipPreviousResult: 'Previous result',
        tipNextResult: 'Next result',
        tipOpenAdvancedSettings: 'Open advanced settings',
        tipCloseSearch: 'Close search'

    }, Common.UI.SearchBar || {}));
});