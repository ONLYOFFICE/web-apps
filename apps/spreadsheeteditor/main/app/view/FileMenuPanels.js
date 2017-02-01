/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
define([
    'common/main/lib/view/DocumentAccessDialog'
], function () {
    'use strict';

    !SSE.Views.FileMenuPanels && (SSE.Views.FileMenuPanels = {});

    SSE.Views.FileMenuPanels.ViewSaveAs = Common.UI.BaseView.extend({
        el: '#panel-saveas',
        menu: undefined,

        formats: [[
            {name: 'XLSX', imgCls: 'xlsx', type: Asc.c_oAscFileType.XLSX},
            {name: 'PDF',  imgCls: 'pdf',  type: Asc.c_oAscFileType.PDF},
            {name: 'ODS',  imgCls: 'ods',  type: Asc.c_oAscFileType.ODS},
            {name: 'CSV',  imgCls: 'csv',  type: Asc.c_oAscFileType.CSV}
        ]
//        ,[
//            {name: 'HTML', imgCls: 'html', type: Asc.c_oAscFileType.HTML}
//        ]
    ],


        template: _.template([
            '<table><tbody>',
                '<% _.each(rows, function(row) { %>',
                    '<tr>',
                        '<% _.each(row, function(item) { %>',
                            '<td><span class="btn-doc-format <%= item.imgCls %>" /></td>',
                        '<% }) %>',
                    '</tr>',
                '<% }) %>',
            '</tbody></table>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
        },

        render: function() {
            $(this.el).html(this.template({rows:this.formats}));
            $('.btn-doc-format',this.el).on('click', _.bind(this.onFormatClick,this));

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el),
                    suppressScrollX: true
                });
            }

            this.flatFormats = _.flatten(this.formats);
            return this;
        },

        onFormatClick: function(e) {
            var format = /\s(\w+)/.exec(e.currentTarget.className);
            if (format) {
                format = format[1];
                var item = _.findWhere(this.flatFormats, {imgCls: format});

                if (item && this.menu) {
                    this.menu.fireEvent('saveas:format', [this.menu, item.type]);
                }
            }
        }
    });

    SSE.Views.FileMenuPanels.Settings = Common.UI.BaseView.extend(_.extend({
        el: '#panel-settings',
        menu: undefined,

        template: _.template([
            '<div style="width:100%; height:100%; position: relative;">',
                '<div id="id-settings-menu" style="position: absolute; width:200px; top: 0; bottom: 0;" class="no-padding"></div>',
                '<div id="id-settings-content" style="position: absolute; left: 200px; top: 0; right: 0; bottom: 0;" class="no-padding">',
                    '<div id="panel-settings-general" style="width:100%; height:100%;" class="no-padding main-settings-panel active"></div>',
                    '<div id="panel-settings-print" style="width:100%; height:100%;" class="no-padding main-settings-panel"></div>',
                '</div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
        },

        render: function() {
            $(this.el).html(this.template());

            this.generalSettings = new SSE.Views.FileMenuPanels.MainSettingsGeneral({menu: this.menu});
            this.generalSettings.options = {alias:'MainSettingsGeneral'};
            this.generalSettings.render();

            this.printSettings = SSE.getController('Print').getView('MainSettingsPrint');
            this.printSettings.menu = this.menu;
            this.printSettings.render($('#panel-settings-print'));

            this.viewSettingsPicker = new Common.UI.DataView({
                el: $('#id-settings-menu'),
                store: new Common.UI.DataViewStore([
                    {name: this.txtGeneral, panel: this.generalSettings, iconCls:'mnu-settings-general', selected: true},
                    {name: this.txtPageSettings, panel: this.printSettings, iconCls:'mnu-print'}
                ]),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="settings-item-wrap">',
                        '<div class="settings-icon <%= iconCls %>" style="display: inline-block;" >',
                        '</div><%= name %>',
                    '</div>'
                ].join(''))
            });
            this.viewSettingsPicker.on('item:select', _.bind(function(dataview, itemview, record) {
                var panel = record.get('panel');
                $('#id-settings-content > div').removeClass('active');
                panel.$el.addClass('active');
                panel.show();
            }, this));

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            var item = this.viewSettingsPicker.getSelectedRec();
            if (item[0]) {
                item[0].get('panel').show();
            }
        },

        setMode: function(mode) {
            this.mode = mode;
            if (!this.mode.canPrint)
                this.viewSettingsPicker.store.pop();
            this.generalSettings && this.generalSettings.setMode(this.mode);
        },

        setApi: function(api) {
            this.generalSettings && this.generalSettings.setApi(api);
        },

        txtGeneral: 'General',
        txtPageSettings: 'Page Settings'
    }, SSE.Views.FileMenuPanels.Settings || {}));

    SSE.Views.MainSettingsPrint = Common.UI.BaseView.extend(_.extend({
        menu: undefined,

        template: _.template([
            '<table class="main"><tbody>',
                '<tr>',
                    '<td class="left"><label><%= scope.textSettings %></label></td>',
                    '<td class="right"><div id="advsettings-print-combo-sheets" class="input-group-nr" /></td>',
                '</tr>','<tr class="divider"></tr>','<tr class="divider"></tr>',
                '<tr>',
                    '<td class="left"><label><%= scope.textPageSize %></label></td>',
                    '<td class="right"><div id="advsettings-print-combo-pages" class="input-group-nr" /></td>',
                '</tr>','<tr class="divider"></tr>',
                '<tr>',
                    '<td class="left"><label><%= scope.textPageOrientation %></label></td>',
                    '<td class="right"><span id="advsettings-print-combo-orient" /></td>',
                '</tr>','<tr class="divider"></tr>',
                '<tr>',
                    '<td class="left"><label><%= scope.textPageScaling %></label></td>',
                    '<td class="right"><span id="advsettings-print-combo-layout" /></td>',
                '</tr>','<tr class="divider"></tr>',
                '<tr>',
                    '<td class="left" style="vertical-align: top;"><label><%= scope.strMargins %></label></td>',
                    '<td class="right" style="vertical-align: top;"><div id="advsettings-margins">',
                        '<table cols="2" class="no-padding">',
                            '<tr>',
                                '<td><label><%= scope.strTop %></label></td>',
                                '<td><label><%= scope.strBottom %></label></td>',
                            '</tr>',
                            '<tr>',
                                '<td><div id="advsettings-spin-margin-top"></div></td>',
                                '<td><div id="advsettings-spin-margin-bottom"></div></td>',
                            '</tr>',
                            '<tr>',
                                '<td><label><%= scope.strLeft %></label></td>',
                                '<td><label><%= scope.strRight %></label></td>',
                            '</tr>',
                            '<tr>',
                                '<td><div id="advsettings-spin-margin-left"></div></td>',
                                '<td><div id="advsettings-spin-margin-right"></div></td>',
                            '</tr>',
                        '</table>',
                    '</div></td>',
                '</tr>','<tr class="divider"></tr>',
                '<tr>',
                '<td class="left" style="vertical-align: top;"><label><%= scope.strPrint %></label></td>',
                '<td class="right" style="vertical-align: top;"><div id="advsettings-print">',
                    '<div id="advsettings-print-chb-grid" style="margin-bottom: 10px;"/>',
                    '<div id="advsettings-print-chb-rows"/>',
                '</div></td>',
                '</tr>','<tr class="divider"></tr>','<tr class="divider"></tr>',
                '<tr>',
                '<td class="left"></td>',
                '<td class="right"><button id="advsettings-print-button-save" class="btn normal dlg-btn primary"><%= scope.okButtonText %></button></td>',
                '</tr>',
            '</tbody></table>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
            this.spinners = [];
            this._initSettings = true;
        },

        render: function(parentEl) {
            if (parentEl)
                this.setElement(parentEl, false);
            $(this.el).html(this.template({scope: this}));

            this.cmbSheet = new Common.UI.ComboBox({
                el          : $('#advsettings-print-combo-sheets'),
                style       : 'width: 242px;',
                menuStyle   : 'min-width: 242px;max-height: 280px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : []
            });

            this.cmbPaperSize = new Common.UI.ComboBox({
                el          : $('#advsettings-print-combo-pages'),
                style       : 'width: 242px;',
                menuStyle   : 'max-height: 280px; min-width: 242px;',
                editable    : false,
                cls         : 'input-group-nr',
                data : [
                    {value:'215.9|279.4',    displayValue:'US Letter (21,59cm x 27,94cm)', caption: 'US Letter'},
                    {value:'215.9|355.6',    displayValue:'US Legal (21,59cm x 35,56cm)', caption: 'US Legal'},
                    {value:'210|297',        displayValue:'A4 (21cm x 29,7cm)', caption: 'A4'},
                    {value:'148.1|209.9',    displayValue:'A5 (14,81cm x 20,99cm)', caption: 'A5'},
                    {value:'176|250.1',      displayValue:'B5 (17,6cm x 25,01cm)', caption: 'B5'},
                    {value:'104.8|241.3',    displayValue:'Envelope #10 (10,48cm x 24,13cm)', caption: 'Envelope #10'},
                    {value:'110.1|220.1',    displayValue:'Envelope DL (11,01cm x 22,01cm)', caption: 'Envelope DL'},
                    {value:'279.4|431.7',    displayValue:'Tabloid (27,94cm x 43,17cm)', caption: 'Tabloid'},
                    {value:'297|420.1',      displayValue:'A3 (29,7cm x 42,01cm)', caption: 'A3'},
                    {value:'304.8|457.1',    displayValue:'Tabloid Oversize (30,48cm x 45,71cm)', caption: 'Tabloid Oversize'},
                    {value:'196.8|273',      displayValue:'ROC 16K (19,68cm x 27,3cm)', caption: 'ROC 16K'},
                    {value:'119.9|234.9',    displayValue:'Envelope Choukei 3 (11,99cm x 23,49cm)', caption: 'Envelope Choukei 3'},
                    {value:'330.2|482.5',    displayValue:'Super B/A3 (33,02cm x 48,25cm)', caption: 'Super B/A3'}
                ]
            });

            this.cmbPaperOrientation = new Common.UI.ComboBox({
                el          : $('#advsettings-print-combo-orient'),
                style       : 'width: 132px;',
                menuStyle   : 'min-width: 132px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: Asc.c_oAscPageOrientation.PagePortrait, displayValue: this.strPortrait },
                    { value: Asc.c_oAscPageOrientation.PageLandscape, displayValue: this.strLandscape }
                ]
            });

            this.cmbLayout = new Common.UI.ComboBox({
                el          : $('#advsettings-print-combo-layout'),
                style       : 'width: 242px;',
                menuStyle   : 'min-width: 242px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: this.textActualSize },
                    { value: 1, displayValue: this.textFitPage },
                    { value: 2, displayValue: this.textFitCols },
                    { value: 3, displayValue: this.textFitRows }
                ]
            });

            this.chPrintGrid = new Common.UI.CheckBox({
                el: $('#advsettings-print-chb-grid'),
                labelText: this.textPrintGrid
            });

            this.chPrintRows = new Common.UI.CheckBox({
                el: $('#advsettings-print-chb-rows'),
                labelText: this.textPrintHeadings
            });

            this.spnMarginTop = new Common.UI.MetricSpinner({
                el: $('#advsettings-spin-margin-top'),
                step: .1,
                width: 110,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 48.25,
                minValue: 0
            });
            this.spinners.push(this.spnMarginTop);

            this.spnMarginBottom = new Common.UI.MetricSpinner({
                el: $('#advsettings-spin-margin-bottom'),
                step: .1,
                width: 110,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 48.25,
                minValue: 0
            });
            this.spinners.push(this.spnMarginBottom);

            this.spnMarginLeft = new Common.UI.MetricSpinner({
                el: $('#advsettings-spin-margin-left'),
                step: .1,
                width: 110,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 48.25,
                minValue: 0
            });
            this.spinners.push(this.spnMarginLeft);

            this.spnMarginRight = new Common.UI.MetricSpinner({
                el: $('#advsettings-spin-margin-right'),
                step: .1,
                width: 110,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 48.25,
                minValue: 0
            });
            this.spinners.push(this.spnMarginRight);

            this.btnOk = new Common.UI.Button({
                el: '#advsettings-print-button-save'
            });

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el),
                    suppressScrollX: true
                });
            }

            this.fireEvent('render:after', this);

            return this;
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                    spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
                }
            }
            var store = this.cmbPaperSize.store;
            for (var i=0; i<store.length; i++) {
                var item = store.at(i),
                    value = item.get('value'),
                    pagewidth = /^\d{3}\.?\d*/.exec(value),
                    pageheight = /\d{3}\.?\d*$/.exec(value);

                item.set('displayValue', item.get('caption') + ' (' + parseFloat(Common.Utils.Metric.fnRecalcFromMM(pagewidth).toFixed(2)) + Common.Utils.Metric.getCurrentMetricName() + ' x ' +
                        parseFloat(Common.Utils.Metric.fnRecalcFromMM(pageheight).toFixed(2)) + Common.Utils.Metric.getCurrentMetricName() + ')');
            }
            this.cmbPaperSize.onResetItems();
        },

        applySettings: function() {
            if (this.menu) {
                this.menu.fireEvent('settings:apply', [this.menu]);
            }
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            if (this._initSettings) {
                this.updateMetricUnit();
                this._initSettings = false;
            }
            this.fireEvent('show', this);
        },

        okButtonText:           'Save',
        strPortrait:            'Portrait',
        strLandscape:           'Landscape',
        textPrintGrid:          'Print Gridlines',
        textPrintHeadings:      'Print Rows and Columns Headings',
        strLeft:                'Left',
        strRight:               'Right',
        strTop:                 'Top',
        strBottom:              'Bottom',
        strMargins:             'Margins',
        textPageSize:           'Page Size',
        textPageOrientation:    'Page Orientation',
        strPrint:               'Print',
        textSettings:           'Settings for',
        textPageScaling:        'Scaling',
        textActualSize:         'Actual Size',
        textFitPage:            'Fit Sheet on One Page',
        textFitCols:            'Fit All Columns on One Page',
        textFitRows:            'Fit All Rows on One Page'
    }, SSE.Views.MainSettingsPrint || {}));

    SSE.Views.FileMenuPanels.MainSettingsGeneral = Common.UI.BaseView.extend(_.extend({
        el: '#panel-settings-general',
        menu: undefined,

        template: _.template([
            '<table class="main"><tbody>',
                /** coauthoring begin **/
                '<tr class="coauth">',
                    '<td class="left"><label><%= scope.txtLiveComment %></label></td>',
                    '<td class="right"><div id="fms-chb-live-comment"/></td>',
                '</tr>','<tr class="divider coauth"></tr>',
                '<tr class="autosave">',
                    '<td class="left"><label id="fms-lbl-autosave"><%= scope.textAutoSave %></label></td>',
                    '<td class="right"><span id="fms-chb-autosave" /></td>',
                '</tr>','<tr class="divider autosave"></tr>',
                '<tr class="coauth changes">',
                    '<td class="left"><label><%= scope.strCoAuthMode %></label></td>',
                    '<td class="right">',
                        '<div><div id="fms-cmb-coauth-mode" style="display: inline-block; margin-right: 15px;"/>',
                        '<label id="fms-lbl-coauth-mode" style="vertical-align: middle;"><%= scope.strCoAuthModeDescFast %></label></div></td>',
                '</tr>','<tr class="divider coauth changes"></tr>',
                /** coauthoring end **/
                '<tr>',
                    '<td class="left"><label><%= scope.strZoom %></label></td>',
                    '<td class="right"><div id="fms-cmb-zoom" class="input-group-nr" /></td>',
                '</tr>','<tr class="divider"></tr>',
                '<tr>',
                    '<td class="left"><label><%= scope.strFontRender %></label></td>',
                    '<td class="right"><span id="fms-cmb-font-render" /></td>',
                '</tr>','<tr class="divider"></tr>',
                '<tr class="edit">',
                    '<td class="left"><label><%= scope.strUnit %></label></td>',
                    '<td class="right"><span id="fms-cmb-unit" /></td>',
                '</tr>','<tr class="divider edit"></tr>',
                '<tr class="edit">',
                    '<td class="left"><label><%= scope.strFuncLocale %></label></td>',
                    '<td class="right">',
                        '<div><div id="fms-cmb-func-locale" style="display: inline-block; margin-right: 15px;"/>',
                        '<label id="fms-lbl-func-locale" style="vertical-align: middle;"><%= scope.strFuncLocaleEx %></label></div></td>',
                '</tr>','<tr class="divider edit"></tr>',
                '<tr>',
                    '<td class="left"><label><%= scope.strRegSettings %></label></td>',
                    '<td class="right">',
                        '<div><div id="fms-cmb-reg-settings" style="display: inline-block; margin-right: 15px;"/>',
                        '<label id="fms-lbl-reg-settings" style="vertical-align: middle;"></label></div></td>',
                '</tr>','<tr class="divider"></tr>',
                '<tr>',
                    '<td class="left"></td>',
                    '<td class="right"><button id="fms-btn-apply" class="btn normal dlg-btn primary"><%= scope.okButtonText %></button></td>',
                '</tr>',
            '</tbody></table>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
        },

        render: function() {
            $(this.el).html(this.template({scope: this}));

            /** coauthoring begin **/
            this.chLiveComment = new Common.UI.CheckBox({
                el: $('#fms-chb-live-comment'),
                labelText: this.strLiveComment
            });

            this.cmbCoAuthMode = new Common.UI.ComboBox({
                el          : $('#fms-cmb-coauth-mode'),
                style       : 'width: 160px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: 1, displayValue: this.strFast, descValue: this.strCoAuthModeDescFast},
                    { value: 0, displayValue: this.strStrict, descValue: this.strCoAuthModeDescStrict }
                ]
            }).on('selected', _.bind(function(combo, record) {
                if (record.value == 1 && (this.chAutosave.getValue()!=='checked'))
                    this.chAutosave.setValue(1);
                this.lblCoAuthMode.text(record.descValue);
            }, this));

            this.lblCoAuthMode = $('#fms-lbl-coauth-mode');
            /** coauthoring end **/

            this.cmbZoom = new Common.UI.ComboBox({
                el          : $('#fms-cmb-zoom'),
                style       : 'width: 160px;',
                editable    : false,
                cls         : 'input-group-nr',
                menuStyle   : 'max-height: 210px;',
                data        : [
                    { value: 50, displayValue: "50%" },
                    { value: 60, displayValue: "60%" },
                    { value: 70, displayValue: "70%" },
                    { value: 80, displayValue: "80%" },
                    { value: 90, displayValue: "90%" },
                    { value: 100, displayValue: "100%" },
                    { value: 110, displayValue: "110%" },
                    { value: 120, displayValue: "120%" },
                    { value: 150, displayValue: "150%" },
                    { value: 175, displayValue: "175%" },
                    { value: 200, displayValue: "200%" }
                ]
            });

            this.cmbFontRender = new Common.UI.ComboBox({
                el          : $('#fms-cmb-font-render'),
                style       : 'width: 160px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: Asc.c_oAscFontRenderingModeType.hintingAndSubpixeling, displayValue: this.txtWin },
                    { value: Asc.c_oAscFontRenderingModeType.noHinting, displayValue: this.txtMac },
                    { value: Asc.c_oAscFontRenderingModeType.hinting, displayValue: this.txtNative }
                ]
            });

            this.chAutosave = new Common.UI.CheckBox({
                el: $('#fms-chb-autosave'),
                labelText: this.strAutosave
            }).on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (field.getValue()!=='checked' && this.cmbCoAuthMode.getValue()) {
                    this.cmbCoAuthMode.setValue(0);
                    this.lblCoAuthMode.text(this.strCoAuthModeDescStrict);
                }
            }, this));
            this.lblAutosave = $('#fms-lbl-autosave');
            
            this.cmbUnit = new Common.UI.ComboBox({
                el          : $('#fms-cmb-unit'),
                style       : 'width: 160px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: Common.Utils.Metric.c_MetricUnits['cm'], displayValue: this.txtCm },
                    { value: Common.Utils.Metric.c_MetricUnits['pt'], displayValue: this.txtPt },
                    { value: Common.Utils.Metric.c_MetricUnits['inch'], displayValue: this.txtInch }
                ]
            });

            this.cmbFuncLocale = new Common.UI.ComboBox({
                el          : $('#fms-cmb-func-locale'),
                style       : 'width: 160px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: 'en', displayValue: this.txtEn, exampleValue: this.txtExampleEn },
                    { value: 'de', displayValue: this.txtDe, exampleValue: this.txtExampleDe },
                    { value: 'ru', displayValue: this.txtRu, exampleValue: this.txtExampleRu }
                ]
            }).on('selected', _.bind(function(combo, record) {
                this.updateFuncExample(record.exampleValue);
            }, this));

            this.cmbRegSettings = new Common.UI.ComboBox({
                el          : $('#fms-cmb-reg-settings'),
                style       : 'width: 160px;',
                menuStyle: 'max-height: 185px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0x042C, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x042C)[1] },
                    { value: 0x0405, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0405)[1] },
                    { value: 0x0407, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0407)[1] },
                    { value: 0x0408, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0408)[1] },
                    { value: 0x0C09, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0C09)[1] },
                    { value: 0x0809, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0809)[1] },
                    { value: 0x0409, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0409)[1] },
                    { value: 0x0C0A, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0C0A)[1] },
                    { value: 0x040B, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x040B)[1] },
                    { value: 0x040C, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x040C)[1] },
                    { value: 0x0410, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0410)[1] },
                    { value: 0x0411, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0411)[1] },
                    { value: 0x0412, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0412)[1] },
                    { value: 0x0426, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0426)[1] },
                    { value: 0x0415, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0415)[1] },
                    { value: 0x0416, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0416)[1] },
                    { value: 0x0816, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0816)[1] },
                    { value: 0x0419, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0419)[1] },
                    { value: 0x0424, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0424)[1] },
                    { value: 0x041F, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x041F)[1] },
                    { value: 0x0422, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0422)[1] },
                    { value: 0x042A, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x042A)[1] },
                    { value: 0x0804, displayValue: Common.util.LanguageInfo.getLocalLanguageName(0x0804)[1] }
                ]
            }).on('selected', _.bind(function(combo, record) {
                this.updateRegionalExample(record.value);
            }, this));

            this.btnApply = new Common.UI.Button({
                el: '#fms-btn-apply'
            });

            this.btnApply.on('click', _.bind(this.applySettings, this));

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el),
                    suppressScrollX: true
                });
            }

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);

            this.updateSettings();
        },

        setMode: function(mode) {
            this.mode = mode;
            $('tr.autosave', this.el)[mode.isEdit ? 'show' : 'hide']();
            if (this.mode.isDesktopApp && this.mode.isOffline) {
                this.chAutosave.setCaption(this.strAutoRecover);
                this.lblAutosave.text(this.textAutoRecover);
            }
            $('tr.coauth', this.el)[mode.canCoAuthoring && mode.isEdit ? 'show' : 'hide']();
            $('tr.coauth.changes', this.el)[mode.isEdit && !mode.isOffline && mode.canCoAuthoring? 'show' : 'hide']();
        },

        setApi: function(api) {
            this.api = api;
        },

        updateSettings: function() {
            var value = Common.localStorage.getItem("sse-settings-zoom");
            value = (value!==null) ? parseInt(value) : (this.mode.customization && this.mode.customization.zoom ? parseInt(this.mode.customization.zoom) : 100);
            var item = this.cmbZoom.store.findWhere({value: value});
            this.cmbZoom.setValue(item ? parseInt(item.get('value')) : (value>0 ? value+'%' : 100));

            /** coauthoring begin **/
            value = Common.localStorage.getItem("sse-settings-livecomment");
            this.chLiveComment.setValue(!(value!==null && parseInt(value) == 0));

            value = Common.localStorage.getItem("sse-settings-coauthmode");
            if (value===null && Common.localStorage.getItem("sse-settings-autosave")===null &&
                this.mode.customization && this.mode.customization.autosave===false)
                value = 0; // use customization.autosave only when sse-settings-coauthmode and sse-settings-autosave are null
            var fast_coauth = (value===null || parseInt(value) == 1) && !(this.mode.isDesktopApp && this.mode.isOffline) && this.mode.canCoAuthoring;

            item = this.cmbCoAuthMode.store.findWhere({value: parseInt(value)});
            this.cmbCoAuthMode.setValue(item ? item.get('value') : 1);
            this.lblCoAuthMode.text(item ? item.get('descValue') : this.strCoAuthModeDescFast);
            /** coauthoring end **/

            value = Common.localStorage.getItem("sse-settings-fontrender");
            item = this.cmbFontRender.store.findWhere({value: parseInt(value)});
            this.cmbFontRender.setValue(item ? item.get('value') : (window.devicePixelRatio > 1 ? Asc.c_oAscFontRenderingModeType.noHinting : Asc.c_oAscFontRenderingModeType.hintingAndSubpixeling));

            value = Common.localStorage.getItem("sse-settings-unit");
            item = this.cmbUnit.store.findWhere({value: parseInt(value)});
            this.cmbUnit.setValue(item ? parseInt(item.get('value')) : Common.Utils.Metric.getDefaultMetric());
            this._oldUnits = this.cmbUnit.getValue();

            value = Common.localStorage.getItem("sse-settings-autosave");
            if (value===null && this.mode.customization && this.mode.customization.autosave===false)
                value = 0;
            this.chAutosave.setValue(fast_coauth || (value===null ? this.mode.canCoAuthoring : parseInt(value) == 1));

            value = Common.localStorage.getItem("sse-settings-func-locale");
            if (value===null)
                value = ((this.mode.lang) ? this.mode.lang : 'en').toLowerCase();
            item = this.cmbFuncLocale.store.findWhere({value: value});
            if (!item)
                item = this.cmbFuncLocale.store.findWhere({value: value.split("-")[0]});
            this.cmbFuncLocale.setValue(item ? item.get('value') : 'en');
            this.updateFuncExample(item ? item.get('exampleValue') : this.txtExampleEn);

            value = Common.localStorage.getItem("sse-settings-reg-settings");
            if (value!==null) {
                item = this.cmbRegSettings.store.findWhere({value: parseInt(value)});
                this.cmbRegSettings.setValue(item ? item.get('value') : 0x0409);
            } else {
                if (this.mode.lang) {
                    var lang = this.mode.lang.toLowerCase(),
                        langshort = lang.split("-")[0].toLowerCase(),
                        code = Common.util.LanguageInfo.getLocalLanguageCode(lang),
                        codefull, codeshort;
                    this.cmbRegSettings.store.each(function(model){
                        var val = model.get('value'),
                            langname = Common.util.LanguageInfo.getLocalLanguageName(val)[0].toLowerCase();
                        if ( langname == lang )
                            codefull = val;
                        if ( langname.indexOf(langshort)==0 )
                            codeshort = val;
                    });
                    code = (codefull) ? codefull : ((codeshort) ? codeshort : ((code) ? Common.util.LanguageInfo.getLocalLanguageName(code)[1] : 0x0409));
                    this.cmbRegSettings.setValue(code);
                } else
                    this.cmbRegSettings.setValue(0x0409);
            }
            this.updateRegionalExample(this.cmbRegSettings.getValue());
        },

        applySettings: function() {
            Common.localStorage.setItem("sse-settings-zoom", this.cmbZoom.getValue());
            /** coauthoring begin **/
            Common.localStorage.setItem("sse-settings-livecomment", this.chLiveComment.isChecked() ? 1 : 0);
            if (this.mode.isEdit && !this.mode.isOffline && this.mode.canCoAuthoring)
                Common.localStorage.setItem("sse-settings-coauthmode", this.cmbCoAuthMode.getValue());
            /** coauthoring end **/
            Common.localStorage.setItem("sse-settings-fontrender", this.cmbFontRender.getValue());
            Common.localStorage.setItem("sse-settings-unit", this.cmbUnit.getValue());
            Common.localStorage.setItem("sse-settings-autosave", this.chAutosave.isChecked() ? 1 : 0);
            Common.localStorage.setItem("sse-settings-func-locale", this.cmbFuncLocale.getValue());
            if (this.cmbRegSettings.getSelectedRecord())
                Common.localStorage.setItem("sse-settings-reg-settings", this.cmbRegSettings.getValue());

            Common.localStorage.save();
            if (this.menu) {
                this.menu.fireEvent('settings:apply', [this.menu]);

                if (this._oldUnits !== this.cmbUnit.getValue())
                    Common.NotificationCenter.trigger('settings:unitschanged', this);
            }
        },

        updateRegionalExample: function(landId) {
            if (this.api) {
                var text = '';
                if (landId) {
                    var info = new Asc.asc_CFormatCellsInfo();
                    info.asc_setType(Asc.c_oAscNumFormatType.None);
                    info.asc_setSymbol(landId);
                    var arr = this.api.asc_getFormatCells(info); // all formats
                    text = this.api.asc_getLocaleExample(arr[4], 1000.01, landId);
                    text = text + ' ' + this.api.asc_getLocaleExample(arr[5], (new Date()).getExcelDateWithTime(), landId);
                    text = text + ' ' + this.api.asc_getLocaleExample(arr[6], (new Date()).getExcelDateWithTime(), landId);
                }
                $('#fms-lbl-reg-settings').text(_.isEmpty(text) ? '' : this.strRegSettingsEx + text);
            }
        },
        
        updateFuncExample: function(text) {
            $('#fms-lbl-func-locale').text(_.isEmpty(text) ? '' : this.strRegSettingsEx + text);
        },

        strLiveComment: 'Turn on option',
        strZoom: 'Default Zoom Value',
        okButtonText: 'Apply',
        /** coauthoring begin **/
        txtLiveComment: 'Live Commenting',
        /** coauthoring end **/
        txtWin: 'as Windows',
        txtMac: 'as OS X',
        txtNative: 'Native',
        strFontRender: 'Font Hinting',
        strUnit: 'Unit of Measurement',
        txtCm: 'Centimeter',
        txtPt: 'Point',
        strAutosave: 'Turn on autosave',
        textAutoSave: 'Autosave',
        txtEn: 'English',
        txtDe: 'Deutsch',
        txtRu: 'Russian',
        txtExampleEn: ' SUM; MIN; MAX; COUNT',
        txtExampleDe: ' SUMME; MIN; MAX; ANZAHL',
        txtExampleRu: ' СУММ; МИН; МАКС; СЧЁТ',
        strFuncLocale: 'Formula Language',
        strFuncLocaleEx: 'Example: SUM; MIN; MAX; COUNT',
        strRegSettings: 'Regional Settings',
        strRegSettingsEx: 'Example: ',
        strCoAuthMode: 'Co-editing mode',
        strCoAuthModeDescFast: 'Other users will see your changes at once',
        strCoAuthModeDescStrict: 'You will need to accept changes before you can see them',
        strFast: 'Fast',
        strStrict: 'Strict',
        textAutoRecover: 'Autorecover',
        strAutoRecover: 'Turn on autorecover',
        txtInch: 'Inch'
    }, SSE.Views.FileMenuPanels.MainSettingsGeneral || {}));

    SSE.Views.FileMenuPanels.RecentFiles = Common.UI.BaseView.extend({
        el: '#panel-recentfiles',
        menu: undefined,

        template: _.template([
            '<div id="id-recent-view" style="margin: 20px 0;"></div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
            this.recent = options.recent;
        },

        render: function() {
            $(this.el).html(this.template());

            this.viewRecentPicker = new Common.UI.DataView({
                el: $('#id-recent-view'),
                store: new Common.UI.DataViewStore(this.recent),
                itemTemplate: _.template([
                    '<div class="recent-wrap">',
                        '<div class="recent-icon"></div>',
                        '<div class="file-name"><%= Common.Utils.String.htmlEncode(title) %></div>',
                        '<div class="file-info"><%= Common.Utils.String.htmlEncode(folder) %></div>',
                    '</div>'
                ].join(''))
            });

            this.viewRecentPicker.on('item:click', _.bind(this.onRecentFileClick, this));

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el),
                    suppressScrollX: true
                });
            }

            return this;
        },

        onRecentFileClick: function(view, itemview, record){
            if ( this.menu )
                this.menu.fireEvent('recent:open', [this.menu, record.get('url')]);
        }
    });

    SSE.Views.FileMenuPanels.CreateNew = Common.UI.BaseView.extend(_.extend({
        el: '#panel-createnew',
        menu: undefined,

        events: function() {
            return {
                'click .blank-document-btn':_.bind(this._onBlankDocument, this),
                'click .thumb-list .thumb-wrap': _.bind(this._onDocumentTemplate, this)
            };
        },

        template: _.template([
            '<h3 style="margin-top: 20px;"><%= scope.fromBlankText %></h3><hr noshade />',
            '<div class="blank-document">',
                '<div class="blank-document-btn"></div>',
                '<div class="blank-document-info">',
                    '<h3><%= scope.newDocumentText %></h3>',
                    '<%= scope.newDescriptionText %>',
                '</div>',
            '</div>',
            '<h3><%= scope.fromTemplateText %></h3><hr noshade />',
            '<div class="thumb-list">',
                '<% _.each(docs, function(item) { %>',
                    '<div class="thumb-wrap" template="<%= item.url %>">',
                        '<div class="thumb"<% if (!_.isEmpty(item.icon)) { %> style="background-image: url(<%= item.icon %>);" <% } %> />',
                        '<div class="title"><%= item.name %></div>',
                    '</div>',
                '<% }) %>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
        },

        render: function() {
            $(this.el).html(this.template({
                scope: this,
                docs: this.options[0].docs
            }));

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el),
                    suppressScrollX: true
                });
            }

            return this;
        },

        _onBlankDocument: function() {
            if ( this.menu )
                this.menu.fireEvent('create:new', [this.menu, 'blank']);
        },

        _onDocumentTemplate: function(e) {
            if ( this.menu )
                this.menu.fireEvent('create:new', [this.menu, e.currentTarget.attributes['template'].value]);
        },

        fromBlankText       : 'From Blank',
        newDocumentText     : 'New Spreadsheet',
        newDescriptionText  : 'Create a new blank text document which you will be able to style and format after it is created during the editing. Or choose one of the templates to start a document of a certain type or purpose where some styles have already been pre-applied.',
        fromTemplateText    : 'From Template'
    }, SSE.Views.FileMenuPanels.CreateNew || {}));

    SSE.Views.FileMenuPanels.DocumentInfo = Common.UI.BaseView.extend(_.extend({
        el: '#panel-info',
        menu: undefined,

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);
            this.rendered = false;

            this.template = _.template([
                '<table class="main">',
                    '<tr>',
                        '<td class="left"><label>' + this.txtTitle + '</label></td>',
                        '<td class="right"><label id="id-info-title">-</label></td>',
                    '</tr>',
                    '<tr class="author">',
                        '<td class="left"><label>' + this.txtAuthor + '</label></td>',
                        '<td class="right"><span class="userLink" id="id-info-author">-</span></td>',
                    '</tr>',
                    '<tr class="placement">',
                        '<td class="left"><label>' + this.txtPlacement + '</label></td>',
                        '<td class="right"><label id="id-info-placement">-</label></td>',
                    '</tr>',
                    '<tr class="date">',
                        '<td class="left"><label>' + this.txtDate + '</label></td>',
                        '<td class="right"><label id="id-info-date">-</label></td>',
                    '</tr>',
                    '<tr class="divider date"></tr>',
                '</table>'
            ].join(''));

            this.menu = options.menu;
        },

        render: function() {
            $(this.el).html(this.template());

            this.lblTitle = $('#id-info-title');
            this.lblPlacement = $('#id-info-placement');
            this.lblDate = $('#id-info-date');
            this.lblAuthor = $('#id-info-author');

            this.rendered = true;

            this.updateInfo(this.doc);

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el),
                    suppressScrollX: true
                });
            }

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
        },

        hide: function() {
            Common.UI.BaseView.prototype.hide.call(this,arguments);
        },

        updateInfo: function(doc) {
            this.doc = doc;
            if (!this.rendered)
                return;

            doc = doc || {};
            this.lblTitle.text((doc.title) ? doc.title : '-');

            if (doc.info) {
                if (doc.info.author)
                    this.lblAuthor.text(doc.info.author);
                this._ShowHideInfoItem('author', doc.info.author!==undefined && doc.info.author!==null);
                if (doc.info.created )
                    this.lblDate.text( doc.info.created );
                this._ShowHideInfoItem('date', doc.info.created!==undefined && doc.info.created!==null);
                if (doc.info.folder )
                    this.lblPlacement.text( doc.info.folder );
                this._ShowHideInfoItem('placement', doc.info.folder!==undefined && doc.info.folder!==null);
            } else
                this._ShowHideDocInfo(false);
        },

        _ShowHideInfoItem: function(cls, visible) {
            $('tr.'+cls, this.el)[visible?'show':'hide']();
        },

        _ShowHideDocInfo: function(visible) {
            this._ShowHideInfoItem('date', visible);
            this._ShowHideInfoItem('placement', visible);
            this._ShowHideInfoItem('author', visible);
        },

        setMode: function(mode) {
            return this;
        },

        txtTitle: 'Document Title',
        txtAuthor: 'Author',
        txtPlacement: 'Placement',
        txtDate: 'Creation Date'
    }, SSE.Views.FileMenuPanels.DocumentInfo || {}));

    SSE.Views.FileMenuPanels.DocumentRights = Common.UI.BaseView.extend(_.extend({
        el: '#panel-rights',
        menu: undefined,

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);
            this.rendered = false;

            this.template = _.template([
                '<table class="main">',
                    '<tr class="rights">',
                        '<td class="left" style="vertical-align: top;"><label>' + this.txtRights + '</label></td>',
                        '<td class="right"><div id="id-info-rights"></div></td>',
                    '</tr>',
                    '<tr class="edit-rights">',
                        '<td class="left"></td><td class="right"><button id="id-info-btn-edit" class="btn normal dlg-btn primary custom" style="margin-right: 10px;">' + this.txtBtnAccessRights + '</button></td>',
                    '</tr>',
                '</table>'
            ].join(''));

            this.templateRights = _.template([
                '<table>',
                    '<% _.each(users, function(item) { %>',
                    '<tr>',
                        '<td><span class="userLink <% if (item.isLink) { %>sharedLink<% } %>"></span><span><%= Common.Utils.String.htmlEncode(item.user) %></span></td>',
                        '<td><%= Common.Utils.String.htmlEncode(item.permissions) %></td>',
                    '</tr>',
                    '<% }); %>',
                '</table>'
            ].join(''));

            this.menu = options.menu;
        },

        render: function() {
            $(this.el).html(this.template());

            this.cntRights = $('#id-info-rights');
            this.btnEditRights = new Common.UI.Button({
                el: '#id-info-btn-edit'
            });
            this.btnEditRights.on('click', _.bind(this.changeAccessRights, this));

            this.rendered = true;

            this.updateInfo(this.doc);

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el),
                    suppressScrollX: true
                });
            }

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
        },

        hide: function() {
            Common.UI.BaseView.prototype.hide.call(this,arguments);
        },

        updateInfo: function(doc) {
            this.doc = doc;
            if (!this.rendered)
                return;

            doc = doc || {};
            if (doc.info) {
                if (doc.info.sharingSettings)
                    this.cntRights.html(this.templateRights({users: doc.info.sharingSettings}));
                this._ShowHideInfoItem('rights', doc.info.sharingSettings!==undefined && doc.info.sharingSettings!==null && doc.info.sharingSettings.length>0);
                this._ShowHideInfoItem('edit-rights', !!this.sharingSettingsUrl && this.sharingSettingsUrl.length && this._readonlyRights!==true);
            } else
                this._ShowHideDocInfo(false);
        },

        _ShowHideInfoItem: function(cls, visible) {
            $('tr.'+cls, this.el)[visible?'show':'hide']();
        },

        _ShowHideDocInfo: function(visible) {
            this._ShowHideInfoItem('rights', visible);
            this._ShowHideInfoItem('edit-rights', visible);
        },

        setMode: function(mode) {
            this.sharingSettingsUrl = mode.sharingSettingsUrl;
            return this;
        },

        changeAccessRights: function(btn,event,opts) {
            if (this._docAccessDlg) return;

            var me = this;
            me._docAccessDlg = new Common.Views.DocumentAccessDialog({
                settingsurl: this.sharingSettingsUrl
            });
            me._docAccessDlg.on('accessrights', function(obj, rights){
                me.doc.info.sharingSettings = rights;
                me._ShowHideInfoItem('rights', me.doc.info.sharingSettings!==undefined && me.doc.info.sharingSettings!==null && me.doc.info.sharingSettings.length>0);
                me.cntRights.html(me.templateRights({users: me.doc.info.sharingSettings}));
            }).on('close', function(obj){
                me._docAccessDlg = undefined;
            });

            me._docAccessDlg.show();
        },

        onLostEditRights: function() {
            this._readonlyRights = true;
            if (!this.rendered)
                return;

            this._ShowHideInfoItem('edit-rights', false);
        },

        txtRights: 'Persons who have rights',
        txtBtnAccessRights: 'Change access rights'
    }, SSE.Views.FileMenuPanels.DocumentRights || {}));

    SSE.Views.FileMenuPanels.Help = Common.UI.BaseView.extend({
        el: '#panel-help',
        menu: undefined,

        template: _.template([
            '<div style="width:100%; height:100%; position: relative;">',
                '<div id="id-help-contents" style="position: absolute; width:200px; top: 0; bottom: 0;" class="no-padding"></div>',
                '<div id="id-help-frame" style="position: absolute; left: 200px; top: 0; right: 0; bottom: 0;" class="no-padding"></div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
            this.urlPref = 'resources/help/en/';

            this.en_data = [
                {src: "UsageInstructions/OpenCreateNew.htm", name: "Create a new spreadsheet or open an existing one", headername: "Usage Instructions", selected: true},
                {src: "UsageInstructions/ManageSheets.htm", name: "Manage sheets"},
                {src: "UsageInstructions/InsertDeleteCells.htm", name: "Insert or delete cells, rows, and columns"},
                {src: "UsageInstructions/CopyPasteData.htm", name: "Copy and paste data"},
                {src: "UsageInstructions/FontTypeSizeStyle.htm", name: "Set font type, size, style, and colors"},
                {src: "UsageInstructions/AlignText.htm", name: "Align data in cells"},
                {src: "UsageInstructions/AddBorders.htm", name: "Add borders"},
                {src: "UsageInstructions/MergeCells.htm", name: "Merge cells"},
                {src: "UsageInstructions/ClearFormatting.htm", name: "Clear text, format in a cell"},
                {src: "UsageInstructions/SortData.htm", name: "Sort data"},
                {src: "UsageInstructions/InsertFunction.htm", name: "Insert function"},
                {src: "UsageInstructions/ChangeNumberFormat.htm", name: "Change number format"},
                {src: "UsageInstructions/UndoRedo.htm", name: "Undo/redo your actions"},
                {src: "UsageInstructions/ViewDocInfo.htm", name: "View file information"},
                {src: "UsageInstructions/SavePrintDownload.htm", name: "Save/print/download your spreadsheet"},
                {src: "HelpfulHints/About.htm", name: "About ONLYOFFICE Spreadsheet Editor", headername: "Helpful Hints"},
                {src: "HelpfulHints/SupportedFormats.htm", name: "Supported Formats of Spreadsheets"},
                {src: "HelpfulHints/Navigation.htm", name: "Navigation through Your Spreadsheet"},
                {src: "HelpfulHints/Search.htm", name: "Search Function"},
                {src: "HelpfulHints/KeyboardShortcuts.htm", name: "Keyboard Shortcuts"}
            ];

            if (Common.Utils.isIE) {
                window.onhelp = function () { return false; }
            }
        },

        render: function() {
            var me = this;
            $(this.el).html(this.template());

            this.viewHelpPicker = new Common.UI.DataView({
                el: $('#id-help-contents'),
                store: new Common.UI.DataViewStore([]),
                keyMoveDirection: 'vertical',
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="help-item-wrap">',
                        '<div class="caption"><%= name %></div>',
                    '</div>'
                ].join(''))
            });
            this.viewHelpPicker.on('item:add', function(dataview, itemview, record) {
                if (record.has('headername')) {
                    $(itemview.el).before('<div class="header-name">' + record.get('headername') + '</div>');
                }
            });

            this.viewHelpPicker.on('item:select', function(dataview, itemview, record) {
                me.iFrame.src = me.urlPref + record.get('src');
            });

            this.iFrame = document.createElement('iframe');

            this.iFrame.src = "";
            this.iFrame.align = "top";
            this.iFrame.frameBorder = "0";
            this.iFrame.width = "100%";
            this.iFrame.height = "100%";
            Common.Gateway.on('internalcommand', function(data) {
                if (data.type == 'help:hyperlink') {
                    var src = data.data;
                    var rec = me.viewHelpPicker.store.find(function(record){
                        return (src.indexOf(record.get('src'))>0);
                    });
                    if (rec) {
                        me.viewHelpPicker.selectRecord(rec, true);
                        me.viewHelpPicker.scrollToRecord(rec);
                    }
                }
            });
            
            $('#id-help-frame').append(this.iFrame);

            return this;
        },

        setLangConfig: function(lang) {
            var me = this;
            var store = this.viewHelpPicker.store;
            if (lang) {
                lang = lang.split("-")[0];
                var config = {
                    dataType: 'json',
                    error: function () {
                        if ( me.urlPref.indexOf('resources/help/en/')<0 ) {
                            me.urlPref = 'resources/help/en/';
                            store.url = 'resources/help/en/Contents.json';
                            store.fetch(config);
                        } else {
                            me.urlPref = 'resources/help/en/';
                            store.reset(me.en_data);
                        }
                    },
                    success: function () {
                        var rec = store.at(0);
                        me.viewHelpPicker.selectRecord(rec);
                        me.iFrame.src = me.urlPref + rec.get('src');
                    }
                };
                store.url = 'resources/help/' + lang + '/Contents.json';
                store.fetch(config);
                this.urlPref = 'resources/help/' + lang + '/';
            }
        },

        show: function () {
            Common.UI.BaseView.prototype.show.call(this);
            if (!this._scrollerInited) {
                this.viewHelpPicker.scroller.update();
                this._scrollerInited = true;
            }
        }
    });
});
