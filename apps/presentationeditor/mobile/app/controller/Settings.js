/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 *  Settings.js
 *  Presentation Editor
 *
 *  Created by Alexander Yuzhin on 11/22/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'presentationeditor/mobile/app/view/Settings'
], function (core, $, _, Backbone) {
    'use strict';

    PE.Controllers.Settings = Backbone.Controller.extend(_.extend((function() {
        // private
        var rootView,
            inProgress,
            infoObj,
            modalView,
            _licInfo;

        var _slideSizeArr = [
            [254, 190.5], [254, 143]
        ];

        return {
            models: [],
            collections: [],
            views: [
                'Settings'
            ],

            initialize: function () {
                Common.SharedSettings.set('readerMode', false);
                Common.NotificationCenter.on('settingscontainer:show', _.bind(this.initEvents, this));

                this.addListeners({
                    'Settings': {
                        'page:show' : this.onPageShow
                    }
                });
            },

            setApi: function (api) {
                this.api = api;

                this.api.asc_registerCallback('asc_onPresentationSize', _.bind(this.onApiPageSize, this));
            },

            onLaunch: function () {
                this.createView('Settings').render();
            },

            setMode: function (mode) {
                this.getView('Settings').setMode(mode);
                if (mode.canBranding)
                    _licInfo = mode.customization;
            },

            initEvents: function () {
            },

            rootView : function() {
                return rootView;
            },

            showModal: function() {
                uiApp.closeModal();

                if (Common.SharedSettings.get('phone')) {
                    modalView = uiApp.popup(
                        '<div class="popup settings container-settings">' +
                            '<div class="content-block">' +
                                '<div class="view settings-root-view navbar-through">' +
                                    this.getView('Settings').rootLayout() +
                                '</div>' +
                            '</div>' +
                        '</div>'
                    );
                } else {
                    modalView = uiApp.popover(
                        '<div class="popover settings container-settings">' +
                            '<div class="popover-angle"></div>' +
                            '<div class="popover-inner">' +
                                '<div class="content-block">' +
                                    '<div class="view popover-view settings-root-view navbar-through">' +
                                        this.getView('Settings').rootLayout() +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>',
                        $$('#toolbar-settings')
                    );
                }

                if (Framework7.prototype.device.android === true) {
                    $$('.view.settings-root-view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
                    $$('.view.settings-root-view .navbar').prependTo('.view.settings-root-view > .pages > .page');
                }

                rootView = uiApp.addView('.settings-root-view', {
                    dynamicNavbar: true
                });

                Common.NotificationCenter.trigger('settingscontainer:show');
                this.onPageShow(this.getView('Settings'));
            },

            hideModal: function() {
                if (modalView) {
                    uiApp.closeModal(modalView);
                }
            },

            onPageShow: function(view, pageId) {
                var me = this;
                $('#settings-search').single('click',                       _.bind(me._onSearch, me));
                $('#settings-readermode input:checkbox').single('change',   _.bind(me._onReaderMode, me));
                $(modalView).find('.formats a').single('click',             _.bind(me._onSaveFormat, me));
                $('#page-settings-setup-view li').single('click',           _.bind(me._onSlideSize, me));

                me.initSettings(pageId);
            },

            initSettings: function (pageId) {
                var me = this;
                if (pageId == '#settings-setup-view') {
                    me.onApiPageSize(me.api.get_PresentationWidth(), me.api.get_PresentationHeight());
                } else if (pageId == '#settings-about-view') {
                    // About
                    me.setLicInfo(_licInfo);
                }
            },

            setLicInfo: function(data){
                if (data && typeof data == 'object' && typeof(data.customer)=='object') {
                    $('.page[data-page=settings-about-view] .logo').hide();
                    $('#settings-about-tel').parent().hide();
                    $('#settings-about-licensor').show();

                    var customer = data.customer,
                        value = customer.name;
                    value && value.length ?
                        $('#settings-about-name').text(value) :
                        $('#settings-about-name').hide();

                    value = customer.address;
                    value && value.length ?
                        $('#settings-about-address').text(value) :
                        $('#settings-about-address').parent().hide();

                    (value = customer.mail) && value.length ?
                        $('#settings-about-email').attr('href', "mailto:"+value).text(value) :
                        $('#settings-about-email').parent().hide();

                    if ((value = customer.www) && value.length) {
                        var http = !/^https?:\/{2}/i.test(value) ? "http:\/\/" : '';
                        $('#settings-about-url').attr('href', http+value).text(value);
                    } else
                        $('#settings-about-url').hide();

                    if ((value = customer.info) && value.length) {
                        $('#settings-about-info').show().text(value);
                    }

                    if ( (value = customer.logo) && value.length ) {
                        $('#settings-about-logo').show().html('<img src="'+value+'" style="max-width:216px; max-height: 35px;" />');
                    }
                }
            },

            // API handlers

            onApiPageSize: function(width, height) {
                for (var i = 0; i < _slideSizeArr.length; i++) {
                    if (Math.abs(_slideSizeArr[i][0] - width) < 0.001 && Math.abs(_slideSizeArr[i][1] - height) < 0.001) {
                        $('#page-settings-setup-view input').val([i]);
                        break;
                    }
                }
            },

            _onApiDocumentName: function(name) {
                $('#settings-presentation-title').html(name ? name : '-');
            },

            _onSearch: function (e) {
                var toolbarView = PE.getController('Toolbar').getView('Toolbar');

                if (toolbarView) {
                    toolbarView.showSearch();
                }

                this.hideModal();
            },

            _onReaderMode: function (e) {
                var me = this;

                Common.SharedSettings.set('readerMode', !Common.SharedSettings.get('readerMode'));

                me.api && me.api.ChangeReaderMode();

                if (Common.SharedSettings.get('phone')) {
                    _.defer(function () {
                        me.hideModal();
                    }, 1000);
                }

                Common.NotificationCenter.trigger('readermode:change', Common.SharedSettings.get('readerMode'));
            },

            _onSaveFormat: function(e) {
                var me = this,
                    format = $(e.currentTarget).data('format');

                if (format) {
                    _.defer(function () {
                        me.api.asc_DownloadAs(format);
                    });
                }

                me.hideModal();
            },

            _onSlideSize: function(e) {
                var $target = $(e.currentTarget).find('input');
                if ($target && this.api) {
                    var value = parseFloat($target.prop('value'));
                    this.api.changeSlideSize(_slideSizeArr[value][0], _slideSizeArr[value][1]);
                }
            },

            txtLoading              : 'Loading...',
            notcriticalErrorTitle   : 'Warning'
        }
    })(), PE.Controllers.Settings || {}))
});