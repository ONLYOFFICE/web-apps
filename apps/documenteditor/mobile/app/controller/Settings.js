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
 *  Document Editor
 *
 *  Created by Alexander Yuzhin on 10/7/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'documenteditor/mobile/app/view/Settings',
    'common/mobile/lib/controller/Collaboration'
], function (core, $, _, Backbone) {
    'use strict';

    DE.Controllers.Settings = Backbone.Controller.extend(_.extend((function() {
        // private
        var rootView,
            inProgress,
            infoObj,
            modalView,
            _isPortrait = false,
            _pageSizesIndex = 0,
            _pageSizesCurrent = [0, 0],
            txtCm = Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.cm),
            _pageSizes = [
                { caption: 'US Letter',             subtitle: Common.Utils.String.format('21,59{0} x 27,94{0}', txtCm),  value: [215.9, 279.4] },
                { caption: 'US Legal',              subtitle: Common.Utils.String.format('21,59{0} x 35,56{0}', txtCm),  value: [215.9, 355.6] },
                { caption: 'A4',                    subtitle: Common.Utils.String.format('21{0} x 29,7{0}', txtCm),      value: [210, 297] },
                { caption: 'A5',                    subtitle: Common.Utils.String.format('14,8{0} x 21{0}', txtCm),  value: [148, 210] },
                { caption: 'B5',                    subtitle: Common.Utils.String.format('17,6{0} x 25{0}', txtCm),   value: [176, 250] },
                { caption: 'Envelope #10',          subtitle: Common.Utils.String.format('10,48{0} x 24,13{0}', txtCm),  value: [104.8, 241.3] },
                { caption: 'Envelope DL',           subtitle: Common.Utils.String.format('11{0} x 22{0}', txtCm),  value: [110, 220] },
                { caption: 'Tabloid',               subtitle: Common.Utils.String.format('27,94{0} x 43,18{0}', txtCm),  value: [279.4, 431.8] },
                { caption: 'A3',                    subtitle: Common.Utils.String.format('29,7{0} x 42{0}', txtCm),   value: [297, 420] },
                { caption: 'Tabloid Oversize',      subtitle: Common.Utils.String.format('30,48{0} x 45,71{0}', txtCm),  value: [304.8, 457.1] },
                { caption: 'ROC 16K',               subtitle: Common.Utils.String.format('19,68{0} x 27,3{0}', txtCm),   value: [196.8, 273] },
                { caption: 'Envelope Choukei 3',    subtitle: Common.Utils.String.format('11,99{0} x 23,49{0}', txtCm),  value: [119.9, 234.9] },
                { caption: 'Super B/A3',            subtitle: Common.Utils.String.format('33,02{0} x 48,25{0}', txtCm),  value: [330.2, 482.5] },
                { caption: 'A0',                    subtitle: Common.Utils.String.format('84,1{0} x 118,9{0}', txtCm),   value: [841, 1189] },
                { caption: 'A1',                    subtitle: Common.Utils.String.format('59,4{0} x 84,1{0}', txtCm),    value: [594, 841] },
                { caption: 'A2',                    subtitle: Common.Utils.String.format('42{0} x 59,4{0}', txtCm),      value: [420, 594] },
                { caption: 'A6',                    subtitle: Common.Utils.String.format('10,5{0} x 14,8{0}', txtCm),    value: [105, 148] }
            ],
            _licInfo,
            _canReview = false,
            _isReviewOnly = false,
            _fileKey,
            _metricText = Common.Utils.Metric.getCurrentMetricName(),
            _isEdit,
            _lang;

        var mm2Cm = function(mm) {
            return parseFloat((mm/10.).toFixed(2));
        };

        var cm2Mm = function(cm) {
            return cm * 10.;
        };

        return {
            models: [],
            collections: [],
            views: [
                'Settings'
            ],

            initialize: function () {
                var me = this;

                Common.SharedSettings.set('readerMode', false);
                Common.NotificationCenter.on('settingscontainer:show', _.bind(this.initEvents, this));

                me.maxMarginsW = me.maxMarginsH = 0;
                me.localSectionProps = null;
                
                me.addListeners({
                    'Settings': {
                        'page:show' : me.onPageShow
                    }
                });

                uiApp.onPageAfterBack('margin-view', function (page) {
                    me.applyPageMarginsIfNeed()
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                me.api.asc_registerCallback('asc_onGetDocInfoStart',    _.bind(me.onApiGetDocInfoStart, me));
                me.api.asc_registerCallback('asc_onGetDocInfoStop',     _.bind(me.onApiGetDocInfoEnd, me));
                me.api.asc_registerCallback('asc_onDocInfo',            _.bind(me.onApiDocInfo, me));
                me.api.asc_registerCallback('asc_onGetDocInfoEnd',      _.bind(me.onApiGetDocInfoEnd, me));
                me.api.asc_registerCallback('asc_onDocumentName',       _.bind(me.onApiDocumentName, me));
                me.api.asc_registerCallback('asc_onDocSize',            _.bind(me.onApiPageSize, me));
                me.api.asc_registerCallback('asc_onPageOrient',         _.bind(me.onApiPageOrient, me));
                me.api.asc_registerCallback('asc_onSendThemeColorSchemes', _.bind(me.onSendThemeColorSchemes, me));
            },

            onLaunch: function () {
                this.createView('Settings').render();
            },

            setMode: function (mode) {
                this.getView('Settings').setMode(mode);
                if (mode.isDisconnected) {
                    _canReview = _isReviewOnly = _isEdit = false;
                } else {
                    if (mode.canBranding)
                        _licInfo = mode.customization;
                    _canReview = mode.canReview;
                    _isReviewOnly = mode.isReviewOnly;
                    _fileKey = mode.fileKey;
                    _isEdit = mode.isEdit;
                    _lang = mode.lang;
                }
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

                if ('#settings-document-view' == pageId) {
                    me.initPageDocumentSettings();
                    Common.Utils.addScrollIfNeed('.page[data-page=settings-document-view]', '.page[data-page=settings-document-view] .page-content');
                } else if ('#settings-document-formats-view' == pageId) {
                    me.getView('Settings').renderPageSizes(_pageSizes, _pageSizesIndex);
                    $('.page[data-page=settings-document-formats-view] input:radio[name=document-format]').single('change', _.bind(me.onFormatChange, me));
                    Common.Utils.addScrollIfNeed('.page[data-page=settings-document-formats-view]', '.page[data-page=settings-document-formats-view] .page-content');
                } else if ('#settings-download-view' == pageId) {
                    $(modalView).find('.formats a').single('click', _.bind(me.onSaveFormat, me));
                    Common.Utils.addScrollIfNeed('.page[data-page=settings-download-view]', '.page[data-page=settings-download-view] .page-content');
                } else if ('#settings-info-view' == pageId) {
                    me.initPageInfo();
                    Common.Utils.addScrollIfNeed('.page[data-page=settings-info-view]', '.page[data-page=settings-info-view] .page-content');
                } else if ('#settings-about-view' == pageId) {
                    // About
                    me.setLicInfo(_licInfo);
                    Common.Utils.addScrollIfNeed('.page[data-page=settings-about-view]', '.page[data-page=settings-about-view] .page-content');
                } else if ('#settings-advanced-view' == pageId) {
                    me.initPageAdvancedSettings();
                    $('#settings-spellcheck input:checkbox').attr('checked', Common.Utils.InternalSettings.get("de-mobile-spellcheck"));
                    $('#settings-spellcheck input:checkbox').single('change',   _.bind(me.onSpellcheck, me));
                    $('#settings-no-characters input:checkbox').attr('checked', Common.localStorage.getItem("de-mobile-no-characters") === 'true');
                    $('#settings-no-characters input:checkbox').single('change',   _.bind(me.onNoCharacters, me));
                    var value = Common.localStorage.getItem("de-mobile-hidden-borders");
                    $('#settings-hidden-borders input:checkbox').attr('checked', value===null || value==='true');
                    $('#settings-hidden-borders input:checkbox').single('change',   _.bind(me.onShowTableEmptyLine, me));
                    $('#settings-orthography').single('click',                  _.bind(me.onOrthographyCheck, me));
                    var displayComments = Common.localStorage.getBool("de-mobile-settings-livecomment", true);
                    $('#settings-display-comments input:checkbox').attr('checked', displayComments);
                    $('#settings-display-comments input:checkbox').single('change',   _.bind(me.onChangeDisplayComments, me));
                    var displayResolved = Common.localStorage.getBool("de-settings-resolvedcomment", true);
                    if (!displayComments) {
                        $("#settings-display-resolved").addClass("disabled");
                        displayResolved = false;
                    }
                    $('#settings-display-resolved input:checkbox').attr('checked', displayResolved);
                    $('#settings-display-resolved input:checkbox').single('change',   _.bind(me.onChangeDisplayResolved, me));
                    Common.Utils.addScrollIfNeed('.page[data-page=settings-advanced-view]', '.page[data-page=settings-advanced-view] .page-content');
                } else if ('#color-schemes-view' == pageId) {
                    me.initPageColorSchemes();
                    Common.Utils.addScrollIfNeed('.page[data-page=color-schemes-view]', '.page[data-page=color-schemes-view] .page-content');
                } else if ('#margins-view' == pageId) {
                    me.initPageMargin();
                    Common.Utils.addScrollIfNeed('.page[data-page=margin-view]', '.page[data-page=margin-view] .page-content');
                } else if ('#macros-settings-view' == pageId) {
                    me.initPageMacrosSettings();
                    Common.Utils.addScrollIfNeed('.page[data-page=macros-settings-view]', '.page[data-page=macros-settings-view] .page-content');
                } else {
                    $('#settings-readermode input:checkbox').attr('checked', Common.SharedSettings.get('readerMode'));
                    $('#settings-search').single('click',                       _.bind(me.onSearch, me));
                    $('#settings-readermode input:checkbox').single('change',   _.bind(me.onReaderMode, me));
                    $('#settings-help').single('click',                         _.bind(me.onShowHelp, me));
                    $('#settings-download').single('click',                     _.bind(me.onDownloadOrigin, me));
                    $('#settings-print').single('click',                        _.bind(me.onPrint, me));
                    $('#settings-collaboration').single('click',                _.bind(me.clickCollaboration, me));
                    var _stateDisplayMode = DE.getController('Common.Controllers.Collaboration').getDisplayMode();
                    if(_stateDisplayMode == "final" || _stateDisplayMode == "original") {
                        $('#settings-document').addClass('disabled');
                    }
                    DE.getController('Toolbar').getDisplayCollaboration() && $('#settings-collaboration').show();
                }
            },

            initPageMacrosSettings: function() {
                var me = this,
                    $pageMacrosSettings = $('.page[data-page="macros-settings-view"] input:radio[name=macros-settings]'),
                    value = Common.Utils.InternalSettings.get("de-mobile-macros-mode") || 0;
                $pageMacrosSettings.single('change', _.bind(me.onChangeMacrosSettings, me));
                $pageMacrosSettings.val([value]);
            },

            onChangeMacrosSettings: function(e) {
                var value = parseInt($(e.currentTarget).val());
                Common.Utils.InternalSettings.set("de-mobile-macros-mode", value);
                Common.localStorage.setItem("de-mobile-macros-mode", value);
            },

            onChangeDisplayComments: function(e) {
                var displayComments = $(e.currentTarget).is(':checked');
                if (!displayComments) {
                    this.api.asc_hideComments();
                    $("#settings-display-resolved input").prop( "checked", false );
                    Common.localStorage.setBool("de-settings-resolvedcomment", false);
                    $("#settings-display-resolved").addClass("disabled");
                } else {
                    var resolved = Common.localStorage.getBool("de-settings-resolvedcomment");
                    this.api.asc_showComments(resolved);
                    $("#settings-display-resolved").removeClass("disabled");
                }
                Common.localStorage.setBool("de-mobile-settings-livecomment", displayComments);
            },

            onChangeDisplayResolved: function(e) {
                var displayComments = Common.localStorage.getBool("de-mobile-settings-livecomment");
                if (displayComments) {
                    var resolved = $(e.currentTarget).is(':checked');
                    if (this.api) {
                        this.api.asc_showComments(resolved);
                    }
                    Common.localStorage.setBool("de-settings-resolvedcomment", resolved);
                }
            },

            clickCollaboration: function() {
                DE.getController('Common.Controllers.Collaboration').showModal();
            },

            onNoCharacters: function(e) {
                var me = this;
                var $checkbox = $(e.currentTarget),
                    state = $checkbox.is(':checked');
                Common.localStorage.setItem("de-mobile-no-characters", state);
                me.api.put_ShowParaMarks(state);
            },

            onShowTableEmptyLine: function(e) {
                var me = this,
                    $checkbox = $(e.currentTarget),
                    state = $checkbox.is(':checked');
                Common.localStorage.setItem("de-mobile-hidden-borders", state);
                me.api.put_ShowTableEmptyLine(state);
            },

            initPageMargin: function() {
                var me = this;
                _metricText = Common.Utils.Metric.getMetricName(Common.Utils.Metric.getCurrentMetric());

                // Init page margins
                me.localSectionProps = me.api.asc_GetSectionProps();

                if (me.localSectionProps) {
                    me.maxMarginsH = me.localSectionProps.get_H() - 2.6;
                    me.maxMarginsW = me.localSectionProps.get_W() - 12.7;

                    var top = parseFloat(Common.Utils.Metric.fnRecalcFromMM(me.localSectionProps.get_TopMargin()).toFixed(2)),
                        bottom = parseFloat(Common.Utils.Metric.fnRecalcFromMM(me.localSectionProps.get_BottomMargin()).toFixed(2)),
                        left = parseFloat(Common.Utils.Metric.fnRecalcFromMM(me.localSectionProps.get_LeftMargin()).toFixed(2)),
                        right = parseFloat(Common.Utils.Metric.fnRecalcFromMM(me.localSectionProps.get_RightMargin()).toFixed(2));

                    $('#document-margin-top .item-after label').text(top + ' ' + _metricText);
                    $('#document-margin-bottom .item-after label').text(bottom + ' ' + _metricText);
                    $('#document-margin-left .item-after label').text(left + ' ' + _metricText);
                    $('#document-margin-right .item-after label').text(right + ' ' + _metricText);
                }

                _.each(["top", "left", "bottom", "right"], function(align) {
                    $(Common.Utils.String.format('#document-margin-{0} .button', align)).single('click', _.bind(me.onPageMarginsChange, me, align));
                })
            },

            initPageColorSchemes: function() {
                this.curSchemas = (this.api) ? this.api.asc_GetCurrentColorSchemeIndex() : 0;
                this.getView('Settings').renderSchemaSettings(this.curSchemas, this.schemas);
                $('.page[data-page=color-schemes-view] input:radio[name=color-schema]').single('change', _.bind(this.onColorSchemaChange, this));
                Common.Utils.addScrollIfNeed('.page[data-page=color-schemes-view', '.page[data-page=color-schemes-view] .page-content');
            },

            onSendThemeColorSchemes: function (schemas) {
                this.schemas = schemas;
            },

            onColorSchemaChange: function(event) {
                if (this.api) {
                    var ind = $(event.currentTarget).val();
                    if (this.curSchemas !== ind)
                        this.api.asc_ChangeColorSchemeByIdx(parseInt(ind));
                }
            },

            initPageAdvancedSettings: function() {
                var me = this,
                    $unitMeasurement = $('.page[data-page=settings-advanced-view] input:radio[name=unit-of-measurement]');
                $unitMeasurement.single('change', _.bind(me.unitMeasurementChange, me));
                var value = Common.Utils.Metric.getCurrentMetric();
                $unitMeasurement.val([value]);
                var _stateDisplayMode = DE.getController('Common.Controllers.Collaboration').getDisplayMode();
                if(_stateDisplayMode == "final" || _stateDisplayMode == "original") {
                    $('#settings-no-characters').addClass('disabled');
                    $('#settings-hidden-borders').addClass('disabled');
                }
                if (!_isEdit) {
                    $('.page[data-page=settings-advanced-view] .page-content > :not(.display-view)').hide();
                }
            },

            initPageDocumentSettings: function () {
                var me = this,
                    $pageOrientation = $('.page[data-page=settings-document-view] input:radio[name=doc-orientation]'),
                    $pageSize = $('#settings-document-format'),
                    curMetricName = Common.Utils.Metric.getMetricName(Common.Utils.Metric.getCurrentMetric()),
                    sizeW,
                    sizeH;

                // Init orientation
                $pageOrientation.val([_isPortrait]);
                $pageOrientation.single('change', _.bind(me.onOrientationChange, me));

                // Init format
                if (_pageSizesIndex === -1) {
                    $pageSize.find('.item-title').text(me.textCustomSize);
                    sizeW = parseFloat(Common.Utils.Metric.fnRecalcFromMM(_pageSizesCurrent[0]).toFixed(2));
                    sizeH = parseFloat(Common.Utils.Metric.fnRecalcFromMM(_pageSizesCurrent[1]).toFixed(2));
                } else {
                    $pageSize.find('.item-title').text(_pageSizes[_pageSizesIndex]['caption']);
                    sizeW = parseFloat(Common.Utils.Metric.fnRecalcFromMM(_pageSizes[_pageSizesIndex]['value'][0]).toFixed(2));
                    sizeH = parseFloat(Common.Utils.Metric.fnRecalcFromMM(_pageSizes[_pageSizesIndex]['value'][1]).toFixed(2));
                }
                var pageSizeTxt = sizeW + ' ' + curMetricName + ' x ' + sizeH + ' ' + curMetricName;
                $pageSize.find('.item-subtitle').text(pageSizeTxt);
            },

            initPageInfo: function () {
                var me = this;

                if (me.api) {
                    me.api.startGetDocInfo();

                    var document = Common.SharedSettings.get('document') || {},
                        info = document.info || {};

                    document.title ? $('#settings-document-title').html(document.title) : $('.display-document-title').remove();
                    var value = info.owner || info.author;
                    value ? $('#settings-document-owner').html(value) : $('.display-owner').remove();
                    value = info.uploaded || info.created;
                    value ? $('#settings-doc-uploaded').html(value) : $('.display-uploaded').remove();
                    info.folder ? $('#settings-doc-location').html(info.folder) : $('.display-location').remove();

                    var appProps = (this.api) ? this.api.asc_getAppProps() : null;
                    if (appProps) {
                        var appName = (appProps.asc_getApplication() || '') + (appProps.asc_getAppVersion() ? ' ' : '') + (appProps.asc_getAppVersion() || '');
                        appName ? $('#settings-doc-application').html(appName) : $('.display-application').remove();
                    }
                    var props = (this.api) ? this.api.asc_getCoreProps() : null;
                    if (props) {
                        value = props.asc_getTitle();
                        value ? $('#settings-doc-title').html(value) : $('.display-title').remove();
                        value = props.asc_getSubject();
                        value ? $('#settings-doc-subject').html(value) : $('.display-subject').remove();
                        value = props.asc_getDescription();
                        value ? $('#settings-doc-comment').html(value) : $('.display-comment').remove();
                        value = props.asc_getModified();
                        value ? $('#settings-doc-last-mod').html(value.toLocaleString(_lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleTimeString(_lang, {timeStyle: 'short'})) : $('.display-last-mode').remove();
                        value = props.asc_getLastModifiedBy();
                        value ? $('#settings-doc-mod-by').html(Common.Utils.UserInfoParser.getParsedName(value)) : $('.display-mode-by').remove();
                        value = props.asc_getCreated();
                        value ? $('#settings-doc-date').html(value.toLocaleString(_lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleTimeString(_lang, {timeStyle: 'short'})) : $('.display-created-date').remove();
                        value = props.asc_getCreator();
                        var templateCreator = "";
                        value && value.split(/\s*[,;]\s*/).forEach(function(item) {
                            templateCreator = templateCreator + "<li class='item-content'><div class='item-inner'><div class='item-title'>" + item + "</div></div></li>";
                        });
                        templateCreator ? $('#list-creator').html(templateCreator) : $('.display-author').remove();
                    }
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

            // Utils

            applyPageMarginsIfNeed: function() {
                var me = this,
                    originalMarginsProps = me.api.asc_GetSectionProps(),
                    originalMarginsChecksum = _.reduce([
                        originalMarginsProps.get_TopMargin(),
                        originalMarginsProps.get_LeftMargin(),
                        originalMarginsProps.get_RightMargin(),
                        originalMarginsProps.get_BottomMargin()
                    ], function(memo, num){ return memo + num; }, 0),
                    localMarginsChecksum = _.reduce([
                        me.localSectionProps.get_TopMargin(),
                        me.localSectionProps.get_LeftMargin(),
                        me.localSectionProps.get_RightMargin(),
                        me.localSectionProps.get_BottomMargin()
                    ], function(memo, num){ return memo + num; }, 0);

                if (Math.abs(originalMarginsChecksum - localMarginsChecksum) > 0.01) {
                    me.api.asc_SetSectionProps(me.localSectionProps);
                }
            },

            // Handlers

            onSearch: function (e) {
                var toolbarView = DE.getController('Toolbar').getView('Toolbar');

                if (toolbarView) {
                    toolbarView.showSearch();
                }

                this.hideModal();
            },

            onReaderMode: function (e) {
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

            onSpellcheck: function (e) {
                var $checkbox = $(e.currentTarget),
                    state = $checkbox.is(':checked');
                Common.localStorage.setItem("de-mobile-spellcheck", state ? 1 : 0);
                Common.Utils.InternalSettings.set("de-mobile-spellcheck", state);
                this.api && this.api.asc_setSpellCheck(state);
            },

            onOrthographyCheck: function (e) {
                this.hideModal();

                this.api && this.api.asc_pluginRun("asc.{B631E142-E40B-4B4C-90B9-2D00222A286E}", 0);
            },

            onShowHelp: function () {
                var url = '{{HELP_URL}}';
                if (url.charAt(url.length-1) !== '/') {
                    url += '/';
                }
                if (Common.SharedSettings.get('sailfish')) {
                    url+='mobile-applications/documents/mobile-web-editors/android/index.aspx';
                } else if (Common.SharedSettings.get('android')) {
                    url+='mobile-applications/documents/mobile-web-editors/android/index.aspx';
                } else {
                    url+='mobile-applications/documents/mobile-web-editors/ios/index.aspx';
                }
                window.open(url, "_blank");
                this.hideModal();
            },

            onSaveFormat: function(e) {
                var me = this,
                    format = $(e.currentTarget).data('format');

                if (format) {
                    if (format == Asc.c_oAscFileType.TXT || format == Asc.c_oAscFileType.RTF) {
                        _.defer(function () {
                            uiApp.confirm(
                                (format === Asc.c_oAscFileType.TXT) ? me.warnDownloadAs : me.warnDownloadAsRTF,
                                me.notcriticalErrorTitle,
                                function () {
                                    if (format == Asc.c_oAscFileType.TXT)
                                        Common.NotificationCenter.trigger('download:advanced', Asc.c_oAscAdvancedOptionsID.TXT, me.api.asc_getAdvancedOptions(), 2, new Asc.asc_CDownloadOptions(format));
                                    else
                                        me.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
                                }
                            );
                        });
                    } else {
                        _.delay(function () {
                            me.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
                        }, 300);
                    }

                    me.hideModal();
                }
            },

            onDownloadOrigin: function(e) {
                var me = this;

                _.defer(function () {
                    me.api.asc_DownloadOrigin();
                });
                me.hideModal();
            },

            onPrint: function(e) {
                var me = this;

                _.delay(function () {
                    me.api.asc_Print();
                }, 300);
                me.hideModal();
            },

            onFormatChange: function (e) {
                var me = this,
                    rawValue = $(e.currentTarget).val(),
                    value = rawValue.split(',');

                _.delay(function () {
                    me.api.change_DocSize(parseFloat(value[0]), parseFloat(value[1]));
                }, 300);
            },

            onOrientationChange: function (e) {
                var me = this,
                    value = $(e.currentTarget).val();

                _.delay(function () {
                    me.api.change_PageOrient(value === 'true');
                }, 300);
            },

            unitMeasurementChange: function (e) {
                var value = $(e.currentTarget).val();
                value = (value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
                Common.Utils.Metric.setCurrentMetric(value);
                Common.localStorage.setItem("de-mobile-settings-unit", value);
                this.api.asc_SetDocumentUnits((value==Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value==Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));
            },

            onPageMarginsChange: function (align, e) {
                var me = this,
                    $button = $(e.currentTarget),
                    step,
                    txtCm = Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.cm),
                    marginValue = null;
                if(Common.Utils.Metric.getCurrentMetric() == Common.Utils.Metric.c_MetricUnits.pt) {
                    step = 1;
                } else {
                    step = 0.1;
                }
                step = Common.Utils.Metric.fnRecalcToMM(step);

                switch (align) {
                    case 'left': marginValue = me.localSectionProps.get_LeftMargin(); break;
                    case 'top': marginValue = me.localSectionProps.get_TopMargin(); break;
                    case 'right': marginValue = me.localSectionProps.get_RightMargin(); break;
                    case 'bottom': marginValue = me.localSectionProps.get_BottomMargin(); break;
                }

                if ($button.hasClass('decrement')) {
                    marginValue = Math.max(0, marginValue - step);
                } else {
                    marginValue = Math.min((align == 'left' || align == 'right') ? me.maxMarginsW : me.maxMarginsH, marginValue + step);
                }

                switch (align) {
                    case 'left': me.localSectionProps.put_LeftMargin(marginValue); break;
                    case 'top': me.localSectionProps.put_TopMargin(marginValue); break;
                    case 'right': me.localSectionProps.put_RightMargin(marginValue); break;
                    case 'bottom': me.localSectionProps.put_BottomMargin(marginValue); break;
                }

                var valueCurrentMetric = parseFloat(Common.Utils.Metric.fnRecalcFromMM(marginValue).toFixed(2));
                $(Common.Utils.String.format('#document-margin-{0} .item-after label', align)).text(valueCurrentMetric + ' ' + _metricText);

                me.applyPageMarginsIfNeed()
            },

            // API handlers

            onApiGetDocInfoStart: function () {
                var me = this;
                inProgress = true;
                infoObj = {
                    PageCount       : 0,
                    WordsCount      : 0,
                    ParagraphCount  : 0,
                    SymbolsCount    : 0,
                    SymbolsWSCount  : 0
                };

                _.defer(function(){
                    if (!inProgress)
                        return;

                    $('#statistic-pages').html(me.txtLoading);
                    $('#statistic-words').html(me.txtLoading);
                    $('#statistic-paragraphs').html(me.txtLoading);
                    $('#statistic-symbols').html(me.txtLoading);
                    $('#statistic-spaces').html(me.txtLoading);
                });
            },

            onApiGetDocInfoEnd: function() {
                inProgress = false;

                $('#statistic-pages').html(infoObj.PageCount);
                $('#statistic-words').html(infoObj.WordsCount);
                $('#statistic-paragraphs').html(infoObj.ParagraphCount);
                $('#statistic-symbols').html(infoObj.SymbolsCount);
                $('#statistic-spaces').html(infoObj.SymbolsWSCount);
            },

            onApiDocInfo: function(obj) {
                if (obj) {
                    if (obj.get_PageCount() > -1)
                        infoObj.PageCount = obj.get_PageCount();
                    if (obj.get_WordsCount() > -1)
                        infoObj.WordsCount = obj.get_WordsCount();
                    if (obj.get_ParagraphCount() > -1)
                        infoObj.ParagraphCount = obj.get_ParagraphCount();
                    if (obj.get_SymbolsCount() > -1)
                        infoObj.SymbolsCount = obj.get_SymbolsCount();
                    if (obj.get_SymbolsWSCount() > -1)
                        infoObj.SymbolsWSCount = obj.get_SymbolsWSCount();
                }
            },

            onApiDocumentName: function(name) {
                $('#settings-document-title').html(name ? name : '-');
            },

            onApiPageSize: function(w, h) {
                if (!_isPortrait) {
                    var tempW = w; w = h; h = tempW;
                }

                if (Math.abs(_pageSizesCurrent[0] - w) > 0.1 ||
                    Math.abs(_pageSizesCurrent[1] - h) > 0.1) {
                    _pageSizesCurrent = [w, h];
                    var ind = -1;
                    _.find(_pageSizes, function(size, index) {
                        if (Math.abs(size.value[0] - w) < 0.1 && Math.abs(size.value[1] - h) < 0.1) {
                            _pageSizesIndex = index;
                            ind = index;
                        }
                    }, this);
                    if (ind === -1) {
                        _pageSizesIndex = -1;
                    }
                }

                this.initPageDocumentSettings();
            },

            onApiPageOrient: function(isPortrait) {
                _isPortrait = isPortrait;
            },

            unknownText: 'Unknown',
            txtLoading              : 'Loading...',
            notcriticalErrorTitle   : 'Warning',
            warnDownloadAs          : 'If you continue saving in this format all features except the text will be lost.<br>Are you sure you want to continue?',
            warnDownloadAsRTF       : 'If you continue saving in this format some of the formatting might be lost.<br>Are you sure you want to continue?',
            textCustomSize          : 'Custom Size'
        }
    })(), DE.Controllers.Settings || {}))
});