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
            _licInfo,
            templateInsert;

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
                this.api.asc_registerCallback('asc_onSendThemeColorSchemes', _.bind(this.onSendThemeColorSchemes, this));
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
                    dynamicNavbar: true,
                    domCache: true
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
                $('#settings-spellcheck input:checkbox').attr('checked', Common.localStorage.getBool("pe-mobile-spellcheck", false));
                $('#settings-search').single('click',                       _.bind(me._onSearch, me));
                $('#settings-readermode input:checkbox').single('change',   _.bind(me._onReaderMode, me));
                $('#settings-spellcheck input:checkbox').single('change',   _.bind(me._onSpellcheck, me));
                $(modalView).find('.formats a').single('click',             _.bind(me._onSaveFormat, me));
                $('#page-settings-view #slide-size-block li').single('click',           _.bind(me._onSlideSize, me));
                $('#settings-print').single('click',                        _.bind(me._onPrint, me));
                $('#settings-collaboration').single('click',                _.bind(me.onCollaboration, me));

                var _userCount = PE.getController('Main').returnUserCount();
                if (_userCount > 0) {
                    $('#settings-collaboration').show();
                }

                Common.Utils.addScrollIfNeed('.page[data-page=settings-setup-view]', '.page[data-page=settings-setup-view] .page-content');
                Common.Utils.addScrollIfNeed('.page[data-page=settings-download-view]', '.page[data-page=settings-download-view] .page-content');
                Common.Utils.addScrollIfNeed('.page[data-page=settings-info-view]', '.page[data-page=settings-info-view] .page-content');
                Common.Utils.addScrollIfNeed('.page[data-page=settings-about-view]', '.page[data-page=settings-about-view] .page-content');
                Common.Utils.addScrollIfNeed('.page[data-page=color-schemes-view]', '.page[data-page=color-schemes-view] .page-content');

                me.initSettings(pageId);
            },

            initSettings: function (pageId) {
                var me = this;
                if (pageId == '#settings-setup-view') {
                    me.onApiPageSize(me.api.get_PresentationWidth(), me.api.get_PresentationHeight());
                } else if (pageId == '#settings-about-view') {
                    // About
                    me.setLicInfo(_licInfo);
                } else if ('#settings-application-view' == pageId) {
                    me.initPageApplicationSettings();
                } else if ('#color-schemes-view' == pageId) {
                    me.initPageColorSchemes();
                } else if ('#settings-info-view' == pageId) {
                    me.initPageInfo();
                }
            },

            initPageInfo: function() {
                var document = Common.SharedSettings.get('document') || {},
                    info = document.info || {};

                document.title ? $('#settings-presentation-title').html(document.title) : $('.display-presentation-title').remove();
                var value = info.owner || info.author;
                value ? $('#settings-pe-owner').html(value) : $('.display-owner').remove();
                value = info.uploaded || info.created;
                value ? $('#settings-pe-uploaded').html(value) : $('.display-uploaded').remove();
                info.folder ? $('#settings-pe-location').html(info.folder) : $('.display-location').remove();

                var appProps = (this.api) ? this.api.asc_getAppProps() : null;
                if (appProps) {
                    var appName = (appProps.asc_getApplication() || '') + ' ' + (appProps.asc_getAppVersion() || '');
                    appName ? $('#settings-pe-application').html(appName) : $('.display-application').remove();
                }

                var props = (this.api) ? this.api.asc_getCoreProps() : null;
                if (props) {
                    value = props.asc_getTitle();
                    value ? $('#settings-pe-title').html(value) : $('.display-title').remove();
                    value = props.asc_getSubject();
                    value ? $('#settings-pe-subject').html(value) : $('.display-subject').remove();
                    value = props.asc_getDescription();
                    value ? $('#settings-pe-comment').html(value) : $('.display-comment').remove();
                    value = props.asc_getModified();
                    value ? $('#settings-pe-last-mod').html(value.toLocaleString()) : $('.display-last-mode').remove();
                    value = props.asc_getLastModifiedBy();
                    value ? $('#settings-pe-mod-by').html(value) : $('.display-mode-by').remove();
                    value = props.asc_getCreated();
                    value ? $('#settings-pe-date').html(value.toLocaleString()) : $('.display-created-date').remove();
                    value = props.asc_getCreator();
                    var templateCreator = "";
                    value && value.split(/\s*[,;]\s*/).forEach(function(item) {
                        templateCreator = templateCreator + "<li class='item-content'><div class='item-inner'><div class='item-title'>" + item + "</div></div></li>";
                    });
                    templateCreator ? $('#list-creator').html(templateCreator) : $('.display-author').remove();
                }

            },

            onCollaboration: function() {
                PE.getController('Common.Controllers.Collaboration').showModal();
            },

            initPageColorSchemes: function () {
                $('#color-schemes-content').html(templateInsert);
                $('.color-schemes-menu').on('click', _.bind(this.onColorSchemaClick, this));
            },

            onSendThemeColorSchemes: function (schemas) {
                templateInsert = "";
                _.each(schemas, function (schema, index) {
                    var colors = schema.get_colors();//schema.colors;
                    templateInsert = templateInsert + "<a class='color-schemes-menu item-link no-indicator'><input type='hidden' value='" + index + "'><div class='item-content'><div class='item-inner'><span class='color-schema-block'>";
                    for (var j = 2; j < 7; j++) {
                        var clr = '#' + Common.Utils.ThemeColor.getHexColor(colors[j].get_r(), colors[j].get_g(), colors[j].get_b());
                        templateInsert =  templateInsert + "<span class='color' style='background: " + clr + ";'></span>"
                    }
                    templateInsert =  templateInsert + "</span><span class='text'>" + schema.get_name() + "</span></div></div></a>";
                }, this);
            },

            onColorSchemaClick: function (event) {
                if (this.api) {
                    var ind = $(event.currentTarget).children('input').val();
                    this.api.ChangeColorScheme(ind);
                }
            },

            initPageApplicationSettings: function () {
                var me = this,
                    $unitMeasurement = $('.page[data-page=settings-application-view] input:radio[name=unit-of-measurement]');
                $unitMeasurement.single('change', _.bind(me.unitMeasurementChange, me));
                var value = Common.localStorage.getItem('pe-mobile-settings-unit');
                value = (value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
                $unitMeasurement.val([value]);
            },

            unitMeasurementChange: function (e) {
                var value = $(e.currentTarget).val();
                value = (value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
                Common.Utils.Metric.setCurrentMetric(value);
                Common.localStorage.setItem("pe-mobile-settings-unit", value);
                this.api.asc_SetDocumentUnits((value==Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value==Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));
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

            _onPrint: function(e) {
                var me = this;

                _.defer(function () {
                    me.api.asc_Print();
                });
                me.hideModal();
            },

            _onSpellcheck: function (e) {
                var $checkbox = $(e.currentTarget),
                    state = $checkbox.is(':checked');
                Common.localStorage.setItem("pe-mobile-spellcheck", state ? 1 : 0);
                this.api && this.api.asc_setSpellCheck(state);
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
                        me.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
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