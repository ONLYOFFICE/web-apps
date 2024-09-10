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
 *  PrintSettings.js
 *
 *  Created on 4/03/14
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/PrintSettings.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) {
    'use strict';

    SSE.Views.PrintSettings = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'PrintSettings',
            contentWidth: 280,
            contentHeight: 468,
            buttons: null
        },

        initialize : function(options) {
            this.type = options.type || 'print';
            var txtBtn = (this.type == 'print') ? this.btnPrint :
                (this.type == 'export') ? this.btnExport : this.btnDownload;
            _.extend(this.options, {
                title: (this.type == 'print') ? this.textTitle : this.textTitlePDF,
                template: [
                    '<div class="box">',
                        '<div class="menu-panel" style="overflow: hidden;">',
                            '<div style="height: 84px; line-height: 42px;" class="div-category">' + ((this.type == 'print') ? this.textPrintRange : this.textRange)+ '</div>',
                            '<div style="height: 52px; line-height: 66px;" class="div-category">' + this.textSettings + '</div>',
                            '<div style="height: 38px; line-height: 38px;" class="div-category">' + this.textPageSize + '</div>',
                            '<div style="height: 38px; line-height: 38px;" class="div-category">' + this.textPageOrientation + '</div>',
                            '<div style="height: 38px; line-height: 38px;" class="div-category">' + this.textPageScaling + '</div>',
                            '<div style="height: 98px; line-height: 33px;" class="div-category">' + this.strPrintTitles + '</div>',
                            '<div style="height: 41px; line-height: 41px;" class="div-category">' + this.strMargins + '</div>',
                            '<div style="height: 58px; line-height: 44px;" class="div-category">' + ((this.type == 'print') ? this.strPrint : this.strShow) + '</div>',
                        '</div>',
                        '<div class="content-panel">' + _.template(contentTemplate)({scope: this}) + '</div>',
                    '</div>',
                    '<div class="separator horizontal"></div>',
                    '<div class="footer justify">',
                        '<button id="printadv-dlg-btn-hide" class="btn btn-text-default" style="min-width: 100px;width: auto;">' + this.textHideDetails + '</button>',
                        '<button class="btn normal dlg-btn float-right" result="cancel" style="width: 86px;">' + this.cancelButtonText + '</button>',
                        '<button class="btn normal dlg-btn primary float-right margin-left-10" result="ok" style="min-width: 150px;width: auto;">' + txtBtn + '</button>',
                    '</div>'
                ].join('')
            }, options);
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            this.cmbRange = new Common.UI.ComboBox({
                el          : $('#printadv-dlg-combo-range'),
                style       : 'width: 242px;',
                menuStyle   : 'min-width: 100%;max-height: 280px;',
                editable    : false,
                takeFocusOnClose: true,
                cls         : 'input-group-nr',
                 data        : [
                    { value: Asc.c_oAscPrintType.ActiveSheets, displayValue: this.textActiveSheets },
                    { value: Asc.c_oAscPrintType.EntireWorkbook, displayValue: this.textAllSheets },
                    { value: Asc.c_oAscPrintType.Selection, displayValue: this.textSelection }
                ]
            });
            this.cmbRange.on('selected', _.bind(this.comboRangeChange, this));

            this.chIgnorePrintArea = new Common.UI.CheckBox({
                el: $('#printadv-dlg-chb-ignore'),
                labelText: this.textIgnore
            });

            this.spnPagesFrom = new Common.UI.MetricSpinner({
                el: $('#printadv-dlg-spin-pages-from'),
                step: 1,
                width: 60,
                defaultUnit : '',
                value: '',
                maxValue: 1000000,
                minValue: 1,
                allowDecimal: false,
                allowBlank: true,
                maskExp: /[0-9]/
            });

            this.spnPagesTo = new Common.UI.MetricSpinner({
                el: $('#printadv-dlg-spin-pages-to'),
                step: 1,
                width: 60,
                defaultUnit : '',
                value: '',
                maxValue: 1000000,
                minValue: 1,
                allowDecimal: false,
                allowBlank: true,
                maskExp: /[0-9]/
            });

            this.cmbSheet = new Common.UI.ComboBox({
                el          : $('#printadv-dlg-combo-sheets'),
                style       : 'width: 242px;',
                menuStyle   : 'min-width: 242px;max-height: 280px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [],
                takeFocusOnClose: true
            });

            this.cmbPaperSize = new Common.UI.ComboBox({
                el          : $('#printadv-dlg-combo-pages'),
                style       : 'width: 242px;',
                menuStyle   : 'max-height: 280px; min-width: 242px;',
                editable    : false,
                takeFocusOnClose: true,
                cls         : 'input-group-nr',
                data : [
                    {value:'215.9|279.4',    displayValue:'US Letter (21,59 cm x 27,94 cm)', caption: 'US Letter'},
                    {value:'215.9|355.6',    displayValue:'US Legal (21,59 cm x 35,56 cm)', caption: 'US Legal'},
                    {value:'210|297',        displayValue:'A4 (21 cm x 29,7 cm)', caption: 'A4'},
                    {value:'148|210',        displayValue:'A5 (14,8 cm x 21 cm)', caption: 'A5'},
                    {value:'176|250',        displayValue:'B5 (17,6 cm x 25 cm)', caption: 'B5'},
                    {value:'104.8|241.3',    displayValue:'Envelope #10 (10,48 cm x 24,13 cm)', caption: 'Envelope #10'},
                    {value:'110|220',        displayValue:'Envelope DL (11 cm x 22 cm)', caption: 'Envelope DL'},
                    {value:'279.4|431.8',    displayValue:'Tabloid (27,94 cm x 43,18 cm)', caption: 'Tabloid'},
                    {value:'297|420',        displayValue:'A3 (29,7 cm x 42 cm)', caption: 'A3'},
                    {value:'296.9|457.2',    displayValue:'Tabloid Oversize (29,69 cm x 45,72 cm)', caption: 'Tabloid Oversize'},
                    {value:'196.8|273',      displayValue:'ROC 16K (19,68 cm x 27,3 cm)', caption: 'ROC 16K'},
                    {value:'120|235',    displayValue:'Envelope Choukei 3 (12 cm x 23,5 cm)', caption: 'Envelope Choukei 3'},
                    {value:'305|487',    displayValue:'Super B/A3 (30,5 cm x 48,7 cm)', caption: 'Super B/A3'}
                ]
            });

            this.cmbPaperOrientation = new Common.UI.ComboBox({
                el          : $('#printadv-dlg-combo-orient'),
                style       : 'width: 132px;',
                menuStyle   : 'min-width: 132px;',
                editable    : false,
                takeFocusOnClose: true,
                cls         : 'input-group-nr',
                data        : [
                    { value: Asc.c_oAscPageOrientation.PagePortrait, displayValue: this.strPortrait },
                    { value: Asc.c_oAscPageOrientation.PageLandscape, displayValue: this.strLandscape }
                ]
            });

            this.chPrintGrid = new Common.UI.CheckBox({
                el: $('#printadv-dlg-chb-grid'),
                labelText: (this.type == 'print') ? this.textPrintGrid : this.textShowGrid
            });

            this.chPrintRows = new Common.UI.CheckBox({
                el: $('#printadv-dlg-chb-rows'),
                labelText: (this.type == 'print') ? this.textPrintHeadings : this.textShowHeadings
            });

            this.cmbPaperMargins = new Common.UI.ComboBox({
                el: $('#printadv-dlg-combo-margins'),
                style: 'width: 242px;',
                menuStyle: 'max-height: 280px; min-width: 242px;',
                editable: false,
                takeFocusOnClose: true,
                cls: 'input-group-nr',
                data: [
                    { value: 0, displayValue: this.textMarginsNormal, size: [19.1, 17.8, 19.1, 17.8]},
                    { value: 1, displayValue: this.textMarginsNarrow, size: [19.1, 6.4, 19.1, 6.4]},
                    { value: 2, displayValue: this.textMarginsWide, size: [25.4, 25.4, 25.4, 25.4]},
                    { value: -1, displayValue: this.textCustom, size: null}
                ],
                itemsTemplate: _.template([
                    '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%- item.value %>"><a tabindex="-1" type="menuitem">',
                        '<div><b><%= scope.getDisplayValue(item) %></b></div>',
                        '<% if (item.size !== null) { %><div style="display: inline-block;margin-right: 20px;min-width: 80px;">' +
                        '<label style="display: block;">' + this.strTop + ': <%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(item.size[0]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label>' +
                        '<label style="display: block;">' + this.strLeft + ': <%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(item.size[1]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label></div><div style="display: inline-block;">' +
                        '<label style="display: block;">' + this.strBottom + ': <%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(item.size[2]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label>' +
                        '<label style="display: block;">' + this.strRight + ': <%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(item.size[3]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label></div>' +
                        '<% } %>',
                    '<% }); %>'
                ].join(''))
            });

            var itemsTemplate =
                _.template([
                    '<% _.each(items, function(item) { %>',
                    '<li id="<%= item.id %>" data-value="<%= item.value %>" <% if (item.value === "customoptions") { %> class="border-top" style="margin-top: 5px;" <% } %> ><a tabindex="-1" type="menuitem">',
                    '<%= scope.getDisplayValue(item) %>',
                    '</a></li>',
                    '<% }); %>'
                ].join(''));
            this.cmbLayout = new Common.UI.ComboBox({
                el          : $('#printadv-dlg-combo-layout'),
                style       : 'width: 242px;',
                menuStyle   : 'min-width: 242px;',
                editable    : false,
                takeFocusOnClose: true,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: this.textActualSize },
                    { value: 1, displayValue: this.textFitPage },
                    { value: 2, displayValue: this.textFitCols },
                    { value: 3, displayValue: this.textFitRows },
                    { value: 'customoptions', displayValue: this.textCustomOptions }
                ],
                itemsTemplate: itemsTemplate
            });

            this.txtRangeTop = new Common.UI.InputFieldBtn({
                el          : $('#printadv-dlg-txt-top'),
                style       : 'width: 137px;',
                allowBlank  : true,
                validateOnChange: true
            });

            this.btnPresetsTop = new Common.UI.Button({
                parentEl: $('#printadv-dlg-presets-top'),
                cls: 'btn-text-menu-default',
                caption: this.textRepeat,
                style: 'width: 95px;',
                menu: true,
                takeFocusOnClose: true
            });

            this.txtRangeLeft = new Common.UI.InputFieldBtn({
                el          : $('#printadv-dlg-txt-left'),
                style       : 'width: 137px;',
                allowBlank  : true,
                validateOnChange: true
            });

            this.btnPresetsLeft = new Common.UI.Button({
                parentEl: $('#printadv-dlg-presets-left'),
                cls: 'btn-text-menu-default',
                caption: this.textRepeat,
                style: 'width: 95px;',
                menu: true,
                takeFocusOnClose: true
            });

            this.btnHide = new Common.UI.Button({
                el: $('#printadv-dlg-btn-hide')
            });
            this.btnHide.on('click', _.bind(this.handlerShowDetails, this));

            this.panelDetails = $('#printadv-dlg-content-to-hide');
            this.updateMetricUnit();
            this.options.afterrender && this.options.afterrender.call(this);

            var value = Common.localStorage.getItem("sse-hide-print-settings");
            this.extended = (value!==null && parseInt(value)==0);
            this.handlerShowDetails(this.btnHide);
        },

        getFocusedComponents: function() {
            return [this.cmbRange, this.chIgnorePrintArea, this.spnPagesFrom, this.spnPagesTo, this.cmbSheet, this.cmbPaperSize, this.cmbPaperOrientation, this.cmbLayout,
                    this.txtRangeTop, this.btnPresetsTop, this.txtRangeLeft, this.btnPresetsLeft,
                    this.cmbPaperMargins, this.chPrintGrid, this.chPrintRows, this.btnHide].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            if (this._alreadyRendered) return; // focus only at first show
            this._alreadyRendered = true;
            return this.cmbRange;
        },

        addCustomScale: function (add) {
            if (add) {
                this.cmbLayout.setData([
                    { value: 0, displayValue: this.textActualSize },
                    { value: 1, displayValue: this.textFitPage },
                    { value: 2, displayValue: this.textFitCols },
                    { value: 3, displayValue: this.textFitRows },
                    { value: 4, displayValue: this.textCustom },
                    { value: 'customoptions', displayValue: this.textCustomOptions }
                ]);
            } else {
                this.cmbLayout.setData([
                    { value: 0, displayValue: this.textActualSize },
                    { value: 1, displayValue: this.textFitPage },
                    { value: 2, displayValue: this.textFitCols },
                    { value: 3, displayValue: this.textFitRows },
                    { value: 'customoptions', displayValue: this.textCustomOptions }
                ]);
            }
        },

        setRange: function(value) {
            this.cmbRange.setValue(value);
        },

        getRange: function() {
            return this.cmbRange.getValue();
        },

        setIgnorePrintArea: function(value) {
            this.chIgnorePrintArea.setValue(value);
        },

        getIgnorePrintArea: function() {
            return (this.chIgnorePrintArea.getValue()=='checked');
        },

        getPagesFrom: function () {
            return this.spnPagesFrom.getNumberValue();
        },

        getPagesTo: function () {
            return this.spnPagesTo.getNumberValue();
        },

        comboRangeChange: function(combo, record) {
            this.fireEvent('changerange', this);
        },

        updateMetricUnit: function() {
            var store = this.cmbPaperSize.store;
            for (var i=0; i<store.length; i++) {
                var item = store.at(i),
                    value = item.get('value'),
                    pagewidth = /^\d{3}\.?\d*/.exec(value),
                    pageheight = /\d{3}\.?\d*$/.exec(value);

                item.set('displayValue', item.get('caption') + ' (' + parseFloat(Common.Utils.Metric.fnRecalcFromMM(pagewidth).toFixed(2)) + ' ' + Common.Utils.Metric.getCurrentMetricName() + ' x ' +
                        parseFloat(Common.Utils.Metric.fnRecalcFromMM(pageheight).toFixed(2)) + ' ' + Common.Utils.Metric.getCurrentMetricName() + ')');
            }
            this.cmbPaperSize.onResetItems();
            this.cmbPaperMargins.onResetItems();
        },

        handlerShowDetails: function(btn) {
            if (!this.extended) {
                this.extended = true;
                this.panelDetails.css({'display': 'none'});
                this.setInnerHeight(259);
                btn.setCaption(this.textShowDetails);
                Common.localStorage.setItem("sse-hide-print-settings", 1);
            } else {
                this.extended = false;
                this.panelDetails.css({'display': 'block'});
                this.setInnerHeight(468);
                btn.setCaption(this.textHideDetails);
                Common.localStorage.setItem("sse-hide-print-settings", 0);
            }
        },

        textTitle:              'Print Settings',
        strLeft:                'Left',
        strRight:               'Right',
        strTop:                 'Top',
        strBottom:              'Bottom',
        strPortrait:            'Portrait',
        strLandscape:           'Landscape',
        textPrintGrid:          'Print Gridlines',
        textPrintHeadings:      'Print Rows and Columns Headings',
        textPageSize:           'Page Size',
        textPageOrientation:    'Page Orientation',
        strMargins:             'Margins',
        strPrint:               'Print',
        btnPrint:               'Save & Print',
        textPrintRange:         'Print Range',
        textLayout:             'Layout',
        textCurrentSheet:       'Current Sheet',
        textActiveSheets:       'Active Sheets',
        textAllSheets:          'All Sheets',
        textSelection:          'Selection',
        textActualSize:         'Actual Size',
        textFitPage:            'Fit Sheet on One Page',
        textFitCols:            'Fit All Columns on One Page',
        textFitRows:            'Fit All Rows on One Page',
        textShowDetails:        'Show Details',
        textHideDetails:        'Hide Details',
        textPageScaling:        'Scaling',
        textSettings:           'Sheet Settings',
        textTitlePDF:           'PDF Settings',
        textShowGrid:           'Show Gridlines',
        textShowHeadings:       'Show Rows and Columns Headings',
        strShow:                'Show',
        btnDownload:            'Save & Download',
        textRange:              'Range',
        textIgnore:             'Ignore Print Area',
        textCustomOptions:      'Custom Options',
        textCustom:             'Custom',
        strPrintTitles:         'Print Titles',
        textRepeatTop:          'Repeat rows at top',
        textRepeatLeft:         'Repeat columns at left',
        textRepeat:             'Repeat...',
        textPages:              'Pages:',
        textTo:                 'to',
        textMarginsNormal:      'Normal',
        textMarginsNarrow:      'Narrow',
        textMarginsWide:        'Wide',
        txtMarginsLast:         'Last Custom',
        btnExport:              'Save & Export'

    }, SSE.Views.PrintSettings || {}));
});