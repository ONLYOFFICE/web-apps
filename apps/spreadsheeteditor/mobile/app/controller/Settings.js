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
 *
 *  Created by Maxim Kadushkin on 12/05/2016
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'spreadsheeteditor/mobile/app/view/Settings'
], function (core) {
    'use strict';

    SSE.Controllers.Settings =  Backbone.Controller.extend(_.extend((function() {
        // private
        var rootView,
            inProgress,
            infoObj,
            modalView,
            _licInfo,
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
            _metricText = Common.Utils.Metric.getMetricName(Common.Utils.Metric.getCurrentMetric()),
            _indexLang = 0,
            _regDataCode = [{ value: 0x042C }, { value: 0x0402 }, { value: 0x0405 }, { value: 0x0407 },  {value: 0x0807}, { value: 0x0408 }, { value: 0x0C09 }, { value: 0x0809 }, { value: 0x0409 }, { value: 0x0C0A }, { value: 0x080A },
            { value: 0x040B }, { value: 0x040C }, { value: 0x0410 }, { value: 0x0411 }, { value: 0x0412 }, { value: 0x0426 }, { value: 0x0413 }, { value: 0x0415 }, { value: 0x0416 },
            { value: 0x0816 }, { value: 0x0419 }, { value: 0x041B }, { value: 0x0424 }, { value: 0x081D }, { value: 0x041D }, { value: 0x041F }, { value: 0x0422 }, { value: 0x042A }, { value: 0x0804 }],
            _regdata = [],
            _lang;


        var mm2Cm = function(mm) {
            return parseFloat((mm/10.).toFixed(2));
        };


        return {
            models: [],
            collections: [],
            views: [
                'Settings'
            ],

            initialize: function () {
                Common.NotificationCenter.on('settingscontainer:show', _.bind(this.initEvents, this));

                this.addListeners({
                    'Settings': {
                        'page:show' : this.onPageShow
                        , 'settings:showhelp': function(e) {
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
                        }
                    }
                });

                this.localMarginProps = null;
                _regDataCode.forEach(function(item) {
                    var langinfo = Common.util.LanguageInfo.getLocalLanguageName(item.value);
                    _regdata.push({code: item.value, displayName: langinfo[1], langName: langinfo[0]});
                });

                this._dataLang = [
                    { value: 'en', displayValue: this.txtEn, exampleValue: ' SUM; MIN; MAX; COUNT' },
                    { value: 'de', displayValue: this.txtDe, exampleValue: ' SUMME; MIN; MAX; ANZAHL' },
                    { value: 'es', displayValue: this.txtEs, exampleValue: ' SUMA; MIN; MAX; CALCULAR' },
                    { value: 'fr', displayValue: this.txtFr, exampleValue: ' SOMME; MIN; MAX; NB' },
                    { value: 'it', displayValue: this.txtIt, exampleValue: ' SOMMA; MIN; MAX; CONTA.NUMERI' },
                    { value: 'ru', displayValue: this.txtRu, exampleValue: ' СУММ; МИН; МАКС; СЧЁТ' },
                    { value: 'pl', displayValue: this.txtPl, exampleValue: ' SUMA; MIN; MAX; ILE.LICZB' }
                ];
            },

            setApi: function (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onSendThemeColorSchemes', _.bind(this.onSendThemeColorSchemes, this));
            },

            onLaunch: function () {
                this.createView('Settings').render();
            },

            setMode: function (mode) {
                this.getView('Settings').setMode(mode);
                if (mode.canBranding)
                    _licInfo = mode.customization;
                _lang = mode.lang;
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

                if (!Common.SharedSettings.get('phone')) {
                    this.picker = $$(modalView);
                    var $overlay = $('.modal-overlay');

                    $$(this.picker).on('opened', function () {
                        $overlay.on('removeClass', function () {
                            if (!$overlay.hasClass('modal-overlay-visible')) {
                                $overlay.addClass('modal-overlay-visible')
                            }
                        });
                    }).on('close', function () {
                        $overlay.off('removeClass');
                        $overlay.removeClass('modal-overlay-visible');
                    });
                }

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
                $(modalView).find('.formats a').single('click',             _.bind(me._onSaveFormat, me));
                $('#settings-print').single('click',                        _.bind(me._onPrint, me));
                $('#settings-collaboration').single('click',                _.bind(me.onCollaboration, me));
                me.initSettings(pageId);
            },

            initSettings: function (pageId) {
                var me = this;
                if (pageId == '#settings-about-view') {
                    // About
                    me.setLicInfo(_licInfo);
                } else if ('#settings-application-view' == pageId) {
                    me.initPageApplicationSettings();
                    Common.Utils.addScrollIfNeed('.page[data-page=settings-application-view]', '.page[data-page=settings-application-view] .page-content');
                } else if ('#color-schemes-view' == pageId) {
                    me.initPageColorSchemes();
                    Common.Utils.addScrollIfNeed('.page[data-page=color-schemes-view]', '.page[data-page=color-schemes-view] .page-content');
                } else if ('#settings-spreadsheet-view' == pageId) {
                    me.initSpreadsheetSettings();
                } else if ('#settings-page-size-view' == pageId) {
                    me.initSpreadsheetPageSize();
                } else if ('#margins-view' == pageId) {
                    me.initSpreadsheetMargins();
                } else if ('#language-formula-view' == pageId) {
                    me.initFormulaLang();
                } else if ('#regional-settings-view' == pageId) {
                    me.initRegSettings();
                } else if ('#settings-info-view' == pageId) {
                    me.initPageInfo();
                } else if ('#settings-macros-view' == pageId) {
                    me.initPageMacrosSettings();
                } else {
                    SSE.getController('Toolbar').getDisplayCollaboration() && $('#settings-collaboration').show();
                }
            },

            initPageMacrosSettings: function() {
                var me = this,
                    $pageMacrosSettings = $('.page[data-page="settings-macros-view"] input:radio[name=macros-settings]'),
                    value = Common.Utils.InternalSettings.get("sse-mobile-macros-mode") || 0;
                $pageMacrosSettings.single('change', _.bind(me.onChangeMacrosSettings, me));
                $pageMacrosSettings.val([value]);
            },

            onChangeMacrosSettings: function(e) {
                var value = parseInt($(e.currentTarget).val());
                Common.Utils.InternalSettings.set("sse-mobile-macros-mode", value);
                Common.localStorage.setItem("sse-mobile-macros-mode", value);
            },

            initPageInfo: function() {
                var document = Common.SharedSettings.get('document') || {},
                    info = document.info || {};

                document.title ? $('#settings-spreadsheet-title').html(document.title) : $('.display-spreadsheet-title').remove();
                var value = info.owner || info.author;
                value ? $('#settings-sse-owner').html(value) : $('.display-owner').remove();
                value = info.uploaded || info.created;
                value ? $('#settings-sse-uploaded').html(value) : $('.display-uploaded').remove();
                info.folder ? $('#settings-sse-location').html(info.folder) : $('.display-location').remove();

                var appProps = (this.api) ? this.api.asc_getAppProps() : null;
                if (appProps) {
                    var appName = (appProps.asc_getApplication() || '') + (appProps.asc_getAppVersion() ? ' ' : '') + (appProps.asc_getAppVersion() || '');
                    appName ? $('#settings-sse-application').html(appName) : $('.display-application').remove();
                }

                var props = (this.api) ? this.api.asc_getCoreProps() : null;
                if (props) {
                    value = props.asc_getTitle();
                    value ? $('#settings-sse-title').html(value) : $('.display-title').remove();
                    value = props.asc_getSubject();
                    value ? $('#settings-sse-subject').html(value) : $('.display-subject').remove();
                    value = props.asc_getDescription();
                    value ? $('#settings-sse-comment').html(value) : $('.display-comment').remove();
                    value = props.asc_getModified();
                    value ? $('#settings-sse-last-mod').html(value.toLocaleString(_lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleTimeString(_lang, {timeStyle: 'short'})) : $('.display-last-mode').remove();
                    value = props.asc_getLastModifiedBy();
                    value ? $('#settings-sse-mod-by').html(Common.Utils.UserInfoParser.getParsedName(value)) : $('.display-mode-by').remove();
                    value = props.asc_getCreated();
                    value ? $('#settings-sse-date').html(value.toLocaleString(_lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleTimeString(_lang, {timeStyle: 'short'})) : $('.display-created-date').remove();
                    value = props.asc_getCreator();
                    var templateCreator = "";
                    value && value.split(/\s*[,;]\s*/).forEach(function(item) {
                        templateCreator = templateCreator + "<li class='item-content'><div class='item-inner'><div class='item-title'>" + item + "</div></div></li>";
                    });
                    templateCreator ? $('#list-creator').html(templateCreator) : $('.display-author').remove();
                }

            },

            initRegSettings: function() {
                var value = Number(Common.localStorage.getItem('sse-settings-regional'));
                this.getView('Settings').renderRegSettings(value ? value : 0x0409, _regdata);
                $('.page[data-page=regional-settings-view] input:radio[name=region-settings]').single('change', _.bind(this.onRegSettings, this));
                Common.Utils.addScrollIfNeed('.page[data-page=regional-settings-view]', '.page[data-page=regional-settings-view] .page-content');
            },

            onRegSettings: function(e) {
                var regCode = $(e.currentTarget).val();
                Common.localStorage.setItem("sse-settings-regional", regCode);
                this.initPageApplicationSettings();
                if (regCode!==null) this.api.asc_setLocale(parseInt(regCode));
            },

            initFormulaLang: function() {
                var value = Common.localStorage.getItem('sse-settings-func-lang');
                var item = _.findWhere(this._dataLang, {value: value});
                this.getView('Settings').renderFormLang(item ? this._dataLang.indexOf(item) : 0, this._dataLang);
                $('.page[data-page=language-formula-view] input:radio[name=language-formula]').single('change', _.bind(this.onFormulaLangChange, this));
                Common.Utils.addScrollIfNeed('.page[data-page=language-formula-view]', '.page[data-page=language-formula-view] .page-content');
            },

            onFormulaLangChange: function(e) {
                var langValue = $(e.currentTarget).val();
                Common.localStorage.setItem("sse-settings-func-lang", langValue);
                this.initPageApplicationSettings();
                SSE.getController('AddFunction').onDocumentReady();
            },

            onCollaboration: function() {
                SSE.getController('Common.Controllers.Collaboration').showModal();
            },

            initSpreadsheetSettings: function() {
                var me = this,
                    $pageSpreadsheetSettings = $('.page[data-page=settings-spreadsheet-view]'),
                    $switchHideHeadings = $pageSpreadsheetSettings.find('#hide-headings input'),
                    $switchHideGridlines = $pageSpreadsheetSettings.find('#hide-gridlines input'),
                    $pageOrientation = $('.page[data-page=settings-spreadsheet-view] input:radio[name=table-orientation]');

                $switchHideHeadings.single('change',    _.bind(me.clickCheckboxHideHeadings, me));
                $switchHideGridlines.single('change',    _.bind(me.clickCheckboxHideGridlines, me));

                var params = me.api.asc_getSheetViewSettings();
                $switchHideHeadings.prop('checked',!params.asc_getShowRowColHeaders());
                $switchHideGridlines.prop('checked',!params.asc_getShowGridLines());

                // Init orientation
                var currentSheet = this.api.asc_getActiveWorksheetIndex(),
                    props = this.api.asc_getPageOptions(currentSheet),
                    opt = props.asc_getPageSetup();
                if(opt.asc_getOrientation() === Asc.c_oAscPageOrientation.PagePortrait) {
                    $('.page[data-page=settings-spreadsheet-view] input:radio[name=table-orientation][value="0"]').prop( "checked", true );
                } else {
                    $('.page[data-page=settings-spreadsheet-view] input:radio[name=table-orientation][value="1"]').prop( "checked", true );
                }
                $pageOrientation.single('change', _.bind(me.onOrientationChange, me));

                //Init format
                var $pageSize = $('#settings-spreadsheet-format');
                this.changeCurrentPageSize(opt.asc_getWidth(), opt.asc_getHeight());
                $pageSize.find('.item-title').text(_pageSizes[_pageSizesIndex]['caption']);

                var curMetricName = Common.Utils.Metric.getMetricName(Common.Utils.Metric.getCurrentMetric()),
                    sizeW = parseFloat(Common.Utils.Metric.fnRecalcFromMM(_pageSizes[_pageSizesIndex]['value'][0]).toFixed(2)),
                    sizeH = parseFloat(Common.Utils.Metric.fnRecalcFromMM(_pageSizes[_pageSizesIndex]['value'][1]).toFixed(2));

                var pageSizeTxt = sizeW + ' ' + curMetricName + ' x ' + sizeH + ' ' + curMetricName;
                $pageSize.find('.item-subtitle').text(pageSizeTxt);
            },

            changeCurrentPageSize: function(w, h) {
                if (Math.abs(_pageSizesCurrent[0] - w) > 0.1 ||
                    Math.abs(_pageSizesCurrent[1] - h) > 0.1) {
                    _pageSizesCurrent = [w, h];

                    _.find(_pageSizes, function(size, index) {
                        if (Math.abs(size.value[0] - w) < 0.1 && Math.abs(size.value[1] - h) < 0.1) {
                            _pageSizesIndex = index;
                        }
                    }, this);
                }
            },

            initSpreadsheetPageSize: function() {
                this.getView('Settings').renderPageSizes(_pageSizes, _pageSizesIndex);
                $('.page[data-page=settings-page-size-view] input:radio[name=spreadsheet-format]').single('change', _.bind(this.onFormatChange, this));
                Common.Utils.addScrollIfNeed('.page[data-page=settings-page-size-view]', '.page[data-page=settings-page-size-view] .page-content');
            },

            onFormatChange: function(e) {
                var rawValue = $(e.currentTarget).val(),
                    value = rawValue.split(',');
                this.api.asc_changeDocSize(parseFloat(value[0]), parseFloat(value[1]), this.api.asc_getActiveWorksheetIndex());
                this.initSpreadsheetSettings();
            },

            initSpreadsheetMargins: function() {
                var me = this;
                // Init page margins
                var currentSheet = me.api.asc_getActiveWorksheetIndex(),
                    props = me.api.asc_getPageOptions(currentSheet);
                me.localMarginProps = props.asc_getPageMargins();

                _metricText = Common.Utils.Metric.getMetricName(Common.Utils.Metric.getCurrentMetric());

                var left =  parseFloat(Common.Utils.Metric.fnRecalcFromMM(me.localMarginProps.asc_getLeft()).toFixed(2)),
                    top =  parseFloat(Common.Utils.Metric.fnRecalcFromMM(me.localMarginProps.asc_getTop()).toFixed(2)),
                    right =  parseFloat(Common.Utils.Metric.fnRecalcFromMM(me.localMarginProps.asc_getRight()).toFixed(2)),
                    bottom =  parseFloat(Common.Utils.Metric.fnRecalcFromMM(me.localMarginProps.asc_getBottom()).toFixed(2));

                if (me.localMarginProps) {

                    $('#spreadsheet-margin-top .item-after label').text(top + ' ' + _metricText);
                    $('#spreadsheet-margin-bottom .item-after label').text(bottom + ' ' + _metricText);
                    $('#spreadsheet-margin-left .item-after label').text(left + ' ' + _metricText);
                    $('#spreadsheet-margin-right .item-after label').text(right + ' ' + _metricText);
                }

                _.each(["top", "left", "bottom", "right"], function(align) {
                    $(Common.Utils.String.format('#spreadsheet-margin-{0} .button', align)).single('click', _.bind(me.onPageMarginsChange, me, align));
                })
            },

            onPageMarginsChange: function (align, e) {
                var me = this,
                    $button = $(e.currentTarget),
                    step = 1, // mm
                    txtCm = Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.cm),
                    marginValue = null;

                var maxMarginsH = 482.5,
                    maxMarginsW = 482.5;

                if(Common.Utils.Metric.getCurrentMetric() == Common.Utils.Metric.c_MetricUnits.pt) {
                    step = 1;
                } else {
                    step = 0.1;
                }
                step = Common.Utils.Metric.fnRecalcToMM(step);

                switch (align) {
                    case 'left': marginValue = me.localMarginProps.asc_getLeft(); break;
                    case 'top': marginValue = me.localMarginProps.asc_getTop(); break;
                    case 'right': marginValue = me.localMarginProps.asc_getRight(); break;
                    case 'bottom': marginValue = me.localMarginProps.asc_getBottom(); break;
                }

                var changeProps = new Asc.asc_CPageMargins();
                changeProps.asc_setTop(me.localMarginProps.asc_getTop());
                changeProps.asc_setBottom(me.localMarginProps.asc_getBottom());
                changeProps.asc_setLeft(me.localMarginProps.asc_getLeft());
                changeProps.asc_setRight(me.localMarginProps.asc_getRight());

                if ($button.hasClass('decrement')) {
                    marginValue = Math.max(0, marginValue - step);
                } else {
                    marginValue = Math.min((align == 'left' || align == 'right') ? maxMarginsW : maxMarginsH, marginValue + step);
                }

                switch (align) {
                    case 'left': changeProps.asc_setLeft(marginValue); break;
                    case 'top': changeProps.asc_setTop(marginValue); break;
                    case 'right': changeProps.asc_setRight(marginValue); break;
                    case 'bottom': changeProps.asc_setBottom(marginValue); break;
                }

                $(Common.Utils.String.format('#document-margin-{0} .item-after label', align)).text(parseFloat(Common.Utils.Metric.fnRecalcFromMM(marginValue)).toFixed(2) + ' ' + _metricText);

                me.api.asc_changePageMargins(changeProps.asc_getLeft(), changeProps.asc_getRight(), changeProps.asc_getTop(), changeProps.asc_getBottom(), me.api.asc_getActiveWorksheetIndex());
                me.initSpreadsheetMargins();
            },


            onOrientationChange: function(e) {
                var value = $(e.currentTarget).attr('value');
                this.api.asc_changePageOrient(Number(value) === Asc.c_oAscPageOrientation.PagePortrait, this.api.asc_getActiveWorksheetIndex());
            },

            clickCheckboxHideHeadings: function(e) {
                var $target = $(e.currentTarget),
                    checked = $target.prop('checked');
                this.api.asc_setDisplayHeadings(!checked);
            },

            clickCheckboxHideGridlines: function(e) {
                var $target = $(e.currentTarget),
                    checked = $target.prop('checked');
                this.api.asc_setDisplayGridlines(!checked);
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

            initPageApplicationSettings: function() {
                var me = this,
                    $unitMeasurement = $('.page[data-page=settings-application-view] input:radio[name=unit-of-measurement]');
                $unitMeasurement.single('change', _.bind(me.unitMeasurementChange, me));
                var value = Common.Utils.Metric.getCurrentMetric();
                $unitMeasurement.val([value]);

                //init formula language
                value = Common.localStorage.getItem('sse-settings-func-lang');
                var item = _.findWhere(me._dataLang, {value: value});
                if(!item) {
                    item = me._dataLang[0];
                }
                var $pageLang = $('#language-formula');
                $pageLang.find('.item-title').text(item.displayValue);
                $pageLang.find('.item-example').text(item.exampleValue);

                //init regional settings
                value = Number(Common.localStorage.getItem('sse-settings-regional'));
                var item = _.findWhere(_regdata, {code: value});
                if(!item) {
                    item = _.findWhere(_regdata, {code: 0x0409});
                }
                var $regSettings = $('#regional-settings');
                $regSettings.find('.item-title').text(item.displayName);
                var info = new Asc.asc_CFormatCellsInfo();
                info.asc_setType(Asc.c_oAscNumFormatType.None);
                info.asc_setSymbol(value);
                var arr = this.api.asc_getFormatCells(info);
                var text = this.api.asc_getLocaleExample(arr[4], 1000.01, value);
                text = text + ' ' + this.api.asc_getLocaleExample(arr[5], Asc.cDate().getExcelDateWithTime(), value);
                text = text + ' ' + this.api.asc_getLocaleExample(arr[6], Asc.cDate().getExcelDateWithTime(), value);
                $regSettings.find('.item-example').text(text);

                //init r1c1 reference
                value = Common.localStorage.getBool('sse-settings-r1c1');
                var $r1c1Style = $('.page[data-page=settings-application-view] #r1-c1-style input');
                $r1c1Style.prop('checked',value);
                $r1c1Style.single('change',    _.bind(me.clickR1C1Style, me));

                //init Commenting Display
                var displayComments = Common.localStorage.getBool("sse-mobile-settings-livecomment", true);
                $('#settings-display-comments input:checkbox').attr('checked', displayComments);
                $('#settings-display-comments input:checkbox').single('change',   _.bind(me.onChangeDisplayComments, me));
                var displayResolved = Common.localStorage.getBool("sse-settings-resolvedcomment", true);
                if (!displayComments) {
                    $("#settings-display-resolved").addClass("disabled");
                    displayResolved = false;
                }
                $('#settings-display-resolved input:checkbox').attr('checked', displayResolved);
                $('#settings-display-resolved input:checkbox').single('change',   _.bind(me.onChangeDisplayResolved, me));
            },

            onChangeDisplayComments: function(e) {
                var displayComments = $(e.currentTarget).is(':checked');
                if (!displayComments) {
                    this.api.asc_hideComments();
                    $("#settings-display-resolved input").prop( "checked", false );
                    Common.localStorage.setBool("sse-settings-resolvedcomment", false);
                    $("#settings-display-resolved").addClass("disabled");
                } else {
                    var resolved = Common.localStorage.getBool("sse-settings-resolvedcomment");
                    this.api.asc_showComments(resolved);
                    $("#settings-display-resolved").removeClass("disabled");
                }
                Common.localStorage.setBool("sse-mobile-settings-livecomment", displayComments);
            },

            onChangeDisplayResolved: function(e) {
                var displayComments = Common.localStorage.getBool("sse-mobile-settings-livecomment");
                if (displayComments) {
                    var resolved = $(e.currentTarget).is(':checked');
                    if (this.api) {
                        this.api.asc_showComments(resolved);
                    }
                    Common.localStorage.setBool("sse-settings-resolvedcomment", resolved);
                }
            },

            clickR1C1Style: function(e) {
                var $target = $(e.currentTarget),
                    checked = $target.prop('checked');
                Common.localStorage.setBool('sse-settings-r1c1', checked);
                this.api.asc_setR1C1Mode(checked);
            },

            unitMeasurementChange: function (e) {
                var value = $(e.currentTarget).val();
                value = (value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
                Common.Utils.Metric.setCurrentMetric(value);
                Common.localStorage.setItem("se-mobile-settings-unit", value);
            },

            // API handlers

            _onSearch: function (e) {
                var toolbarView = SSE.getController('Toolbar').getView('Toolbar');

                if (toolbarView) {
                    toolbarView.showSearch();
                }

                this.hideModal();
            },

            _onPrint: function(e) {
                var me = this;

                _.delay(function () {
                    me.api.asc_Print();
                }, 300);
                me.hideModal();
            },

            _onSaveFormat: function(e) {
                var me = this,
                    format = $(e.currentTarget).data('format');

                me.hideModal();

                if (format) {
                    if (format == Asc.c_oAscFileType.CSV) {
                        setTimeout(function () {
                            uiApp.confirm(
                                me.warnDownloadAs,
                                me.notcriticalErrorTitle,
                                function () {
                                    Common.NotificationCenter.trigger('download:advanced', Asc.c_oAscAdvancedOptionsID.CSV, me.api.asc_getAdvancedOptions(), 2, new Asc.asc_CDownloadOptions(format));
                                }
                            );
                        }, 50);
                    } else {
                        _.delay(function () {
                            me.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
                        }, 300);
                    }
                }
            },

            notcriticalErrorTitle   : 'Warning',
            warnDownloadAs          : 'If you continue saving in this format all features except the text will be lost.<br>Are you sure you want to continue?',
            txtEn: 'English',
            txtDe: 'Deutsch',
            txtRu: 'Russian',
            txtPl: 'Polish',
            txtEs: 'Spanish',
            txtFr: 'French',
            txtIt: 'Italian'
        }
    })(), SSE.Controllers.Settings || {}))
});