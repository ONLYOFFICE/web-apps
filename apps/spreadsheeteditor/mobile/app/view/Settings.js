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
    'text!spreadsheeteditor/mobile/app/template/Settings.template',
    'jquery',
    'underscore',
    'backbone'
], function (settingsTemplate, $, _, Backbone) {
    'use strict';

    SSE.Views.Settings = Backbone.View.extend(_.extend((function() {
        // private
        var isEdit,
            canEdit = false,
            canDownload = false,
            canAbout = true,
            canHelp = true,
            canPrint = false;

        return {
            // el: '.view-main',

            template: _.template(settingsTemplate),

            events: {
                //
            },

            initialize: function() {
                Common.NotificationCenter.on('settingscontainer:show', _.bind(this.initEvents, this));

                Common.Gateway.on('opendocument', _.bind(this.loadDocument, this));
            },

            initEvents: function () {
                var me = this;

                $('#settings-document-info').single('click',    _.bind(me.showDocumentInfo, me));
                $('#settings-download').single('click',         _.bind(me.showDownload, me));
                $('#settings-history').single('click',          _.bind(me.showHistory, me));
                $('#settings-help').single('click',             _.bind(me.showHelp, me));
                $('#settings-about').single('click',            _.bind(me.showAbout, me));
                $('#settings-application').single('click', _.bind(me.showSetApp, me));
                $('#settings-spreadsheet').single('click', _.bind(me.showSetSpreadsheet, me));

                Common.Utils.addScrollIfNeed('.view[data-page=settings-root-view] .pages', '.view[data-page=settings-root-view] .page');
                me.initControls();
            },

            // Render layout
            render: function() {
                this.layout = $('<div/>').append(this.template({
                    android : Common.SharedSettings.get('android'),
                    phone   : Common.SharedSettings.get('phone'),
                    scope   : this
                    , saveas: {
                        xlsx: Asc.c_oAscFileType.XLSX,
                        pdf: Asc.c_oAscFileType.PDF,
                        pdfa: Asc.c_oAscFileType.PDFA,
                        ods: Asc.c_oAscFileType.ODS,
                        csv: Asc.c_oAscFileType.CSV,
                        xltx: Asc.c_oAscFileType.XLTX,
                        ots: Asc.c_oAscFileType.OTS
                    },
                        width   : $(window).width(),
                    prodversion: '{{PRODUCT_VERSION}}',
                    publishername: '{{PUBLISHER_NAME}}',
                    publisheraddr: '{{PUBLISHER_ADDRESS}}',
                    publisherurl: '{{PUBLISHER_URL}}',
                    printed_url: ("{{PUBLISHER_URL}}").replace(/https?:\/{2}/, "").replace(/\/$/,""),
                    supportemail: '{{SUPPORT_EMAIL}}',
                    phonenum: '{{PUBLISHER_PHONE}}'
                }));

                return this;
            },

            setMode: function (mode) {
                isEdit = mode.isEdit;
                canEdit = !mode.isEdit && mode.canEdit && mode.canRequestEditRights;
                canDownload = mode.canDownload || mode.canDownloadOrigin;
                canPrint = mode.canPrint;

                if (mode.customization && mode.canBrandingExt) {
                    canAbout = (mode.customization.about!==false);
                }

                if (mode.customization) {
                    canHelp = (mode.customization.help!==false);
                }
            },

            rootLayout: function () {
                if (this.layout) {
                    var $layout = this.layout.find('#settings-root-view'),
                        isPhone = Common.SharedSettings.get('phone');

                    if (isEdit) {
                        $layout.find('#settings-search .item-title').text(this.textFindAndReplace)
                    } else {
                        $layout.find('#settings-spreadsheet').hide();
                    }
                    if (!canDownload) $layout.find('#settings-download').hide();
                    if (!canAbout) $layout.find('#settings-about').hide();
                    if (!canHelp) $layout.find('#settings-help').hide();
                    if (!canPrint) $layout.find('#settings-print').hide();

                    return $layout.html();
                }

                return '';
            },

            initControls: function() {
                //
            },

            showPage: function(templateId) {
                var rootView = SSE.getController('Settings').rootView();

                if (rootView && this.layout) {
                    var $content = this.layout.find(templateId);

                    // Android fix for navigation
                    if (Framework7.prototype.device.android) {
                        $content.find('.page').append($content.find('.navbar'));
                    }

                    rootView.router.load({
                        content: $content.html()
                    });

                    this.fireEvent('page:show', [this, templateId]);
                }
            },

            showSetApp: function() {
                this.showPage('#settings-application-view');
                $('#language-formula').single('click', _.bind(this.showFormulaLanguage, this));
                $('#regional-settings').single('click', _.bind(this.showRegionalSettings, this));
                if (!isEdit) {
                    $('.page[data-page=settings-application-view] .page-content > :not(.display-view)').hide();
                }
            },

            showFormulaLanguage: function () {
                this.showPage('#language-formula-view');
            },

            showColorSchemes: function () {
                this.showPage('#color-schemes-view');
            },

            showRegionalSettings: function () {
                this.showPage('#regional-settings-view');
            },

            showSetSpreadsheet: function () {
                this.showPage('#settings-spreadsheet-view');
                $('#color-schemes').single('click', _.bind(this.showColorSchemes, this));
                $('#settings-spreadsheet-format').single('click', _.bind(this.showPageSize, this));
                $('#margin-settings').single('click', _.bind(this.showMargins, this));
            },

            showPageSize: function() {
                this.showPage('#settings-page-size-view');
            },

            showMargins: function() {
                this.showPage('#margins-view');
            },

            showDocumentInfo: function() {
                this.showPage('#settings-info-view');
            },

            showDownload: function () {
                this.showPage('#settings-download-view');
                Common.Utils.addScrollIfNeed('.page[data-page=settings-download-view]', '.page[data-page=settings-download-view] .page-content');
            },

            showHistory: function () {
                this.showPage('#settings-history-view');
            },

            showHelp: function () {
                this.fireEvent('settings:showhelp');
            },

            showAbout: function () {
                this.showPage('#settings-about-view');
                Common.Utils.addScrollIfNeed('.page[data-page=settings-about-view]', '.page[data-page=settings-about-view] .page-content');
            },

            loadDocument: function(data) {
                var permissions = {};

                if (data.doc) {
                    permissions = _.extend(permissions, data.doc.permissions);

                    if (permissions.edit === false) {
                    }
                }
            },

            renderPageSizes: function(sizes, selectIndex) {
                var $pageFormats = $('.page[data-page=settings-page-size-view]'),
                    $list = $pageFormats.find('ul'),
                    items = [];

                _.each(sizes, function (size, index) {
                    items.push(_.template([
                        '<li>',
                        '<label class="label-radio item-content">',
                        '<input type="radio" name="spreadsheet-format" value="<%= item.value %>" <% if (index == selectIndex) { %>checked="checked"<% } %> >',
                        '<% if (android) { %><div class="item-media"><i class="icon icon-form-radio"></i></div><% } %>',
                        '<div class="item-inner">',
                        '<div class="item-title-row">',
                        '<div class="item-title"><%= item.caption %></div>',
                        '</div>',
                        '<div class="item-subtitle"><%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(item.value[0]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %> x <%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(item.value[1]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></div>',
                        '</div>',
                        '</label>',
                        '</li>'
                    ].join(''))({
                        android: Framework7.prototype.device.android,
                        item: size,
                        index: index,
                        selectIndex: selectIndex
                    }));
                });

                $list.html(items.join(''));
            },

            renderFormLang: function(indexLang, languages) {
                var $pageLang = $('.page[data-page=language-formula-view]'),
                    $list = $pageLang.find('ul'),
                    items = [],
                    textEx = this.textExample;

                _.each(languages, function (lang, index) {
                    items.push(_.template([
                        '<li>',
                        '<label class="label-radio item-content">',
                        '<input type="radio" name="language-formula" value="<%= item.value %>" <% if (index == selectIndex) { %>checked="checked"<% } %> >',
                        '<% if (android) { %><div class="item-media"><i class="icon icon-form-radio"></i></div><% } %>',
                        '<div class="item-inner">',
                        '<div class="item-title-row">',
                        '<div class="item-title"><%= item.displayValue %></div>',
                        '</div>',
                        '<div class="item-subtitle"><%= textExamp + ": "%> <%= item.exampleValue %></div>',
                        '</div>',
                        '</label>',
                        '</li>'
                    ].join(''))({
                        android: Framework7.prototype.device.android,
                        item: lang,
                        index: index,
                        selectIndex: indexLang,
                        textExamp: textEx
                    }));
                });

                $list.html(items.join(''));
            },

            renderRegSettings: function(regCode, regions) {
                var $pageLang = $('.page[data-page=regional-settings-view]'),
                    $list = $pageLang.find('ul'),
                    items = [];

                _.each(regions, function (reg) {
                    var itemTemplate = [
                        '<li>',
                        '<label class="label-radio item-content">',
                        '<input type="radio" name="region-settings" value="<%= item.code %>" <% if (item.code == selectReg) { %>checked="checked"<% } %> >',
                        '<% if (android) { %><div class="item-media"><i class="icon icon-form-radio"></i></div><% } %>',
                        '<div class="item-inner">',
                        '<div class="item-title-row">',
                        '<i class="icon lang-flag <%= item.langName%>"></i>',
                        '<div class="item-title"><%= item.displayName %></div>',
                        '</div>',
                        '</div>',
                        '</label>',
                        '</li>'
                    ].join('');
                    items.push(_.template(itemTemplate)({
                        android: Framework7.prototype.device.android,
                        item: reg,
                        selectReg: regCode,
                    }));
                });

                $list.html(items);

            },

            unknownText: 'Unknown',
            textFindAndReplace: 'Find and Replace',
            textSettings: 'Settings',
            textDone: 'Done',
            textFind: 'Find',
            textEditDoc: 'Edit Document',
            textDownload: 'Download',
            textDocInfo: 'Document Info',
            textHelp: 'Help',
            textAbout: 'About',
            textBack: 'Back',
            textDocTitle: 'Document title',
            textLoading: 'Loading...',
            textAuthor: 'Author',
            textCreateDate: 'Create date',
            textDownloadAs: 'Download As...',
            textVersion: 'Version',
            textAddress: 'address',
            textEmail: 'email',
            textTel: 'tel',
            textPoweredBy: 'Powered by',
            textPrint: 'Print',
            textApplicationSettings: 'Application Settings',
            textUnitOfMeasurement: 'Unit of Measurement',
            textCentimeter: 'Centimeter',
            textPoint: 'Point',
            textInch: 'Inch',
            textSpreadsheetSettings: 'Spreadsheet Settings',
            textColorSchemes: 'Color Schemes',
            textHideHeadings: 'Hide Headings',
            textHideGridlines: 'Hide Gridlines',
            textOrientation: 'Orientation',
            textPortrait: 'Portrait',
            textLandscape: 'Landscape',
            textFormat: 'Format',
            textSpreadsheetFormats: 'Spreadsheet Formats',
            textCustom: 'Custom',
            textCustomSize: 'Custom Size',
            textMargins: 'Margins',
            textTop: 'Top',
            textLeft: 'Left',
            textBottom: 'Bottom',
            textRight: 'Right',
            textCollaboration: 'Collaboration',
            textFormulaLanguage: 'Formula Language',
            textExample: 'Example',
            textR1C1Style: 'R1C1 Reference Style',
            textRegionalSettings: 'Regional Settings',
            textCommentingDisplay: 'Commenting Display',
            textDisplayComments: 'Comments',
            textDisplayResolvedComments: 'Resolved Comments',
            textSubject: 'Subject',
            textTitle: 'Title',
            textComment: 'Comment',
            textOwner: 'Owner',
            textApplication : 'Application',
            textCreated: 'Created',
            textLastModified: 'Last Modified',
            textLastModifiedBy: 'Last Modified By',
            textUploaded: 'Uploaded',
            textLocation: 'Location'
    }
    })(), SSE.Views.Settings || {}))
});