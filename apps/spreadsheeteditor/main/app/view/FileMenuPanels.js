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
define([
    'common/main/lib/view/DocumentAccessDialog',
    'common/main/lib/view/AutoCorrectDialog'
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
        ],[
            {name: 'XLTX', imgCls: 'xltx', type: Asc.c_oAscFileType.XLTX},
            {name: 'PDFA', imgCls: 'pdfa', type: Asc.c_oAscFileType.PDFA},
            {name: 'OTS',  imgCls: 'ots',  type: Asc.c_oAscFileType.OTS}
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
                            '<td><div><svg class="btn-doc-format" format="<%= item.type %>">',
                                '<use xlink:href="#svg-format-<%= item.imgCls %>"></use>',
                            '</svg></div></td>',
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
            this.$el.html(this.template({rows:this.formats}));
            $('.btn-doc-format',this.el).on('click', _.bind(this.onFormatClick,this));

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.$el,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.scroller && this.scroller.update();
        },

        onFormatClick: function(e) {
            var type = e.currentTarget.attributes['format'];
            if (!_.isUndefined(type) && this.menu) {
                this.menu.fireEvent('saveas:format', [this.menu, parseInt(type.value)]);
            }
        }
    });

    SSE.Views.FileMenuPanels.ViewSaveCopy = Common.UI.BaseView.extend({
        el: '#panel-savecopy',
        menu: undefined,

        formats: [[
            {name: 'XLSX', imgCls: 'xlsx', type: Asc.c_oAscFileType.XLSX,  ext: '.xlsx'},
            {name: 'PDF',  imgCls: 'pdf',  type: Asc.c_oAscFileType.PDF,   ext: '.pdf'},
            {name: 'ODS',  imgCls: 'ods',  type: Asc.c_oAscFileType.ODS,   ext: '.ods'},
            {name: 'CSV',  imgCls: 'csv',  type: Asc.c_oAscFileType.CSV,   ext: '.csv'}
        ],[
            {name: 'XLTX', imgCls: 'xltx', type: Asc.c_oAscFileType.XLTX,   ext: '.xltx'},
            {name: 'PDFA', imgCls: 'pdfa', type: Asc.c_oAscFileType.PDFA,  ext: '.pdf'},
            {name: 'OTS',  imgCls: 'ots',  type: Asc.c_oAscFileType.OTS,    ext: '.ots'}
        ]
//        ,[
//            {name: 'HTML', imgCls: 'html', type: Asc.c_oAscFileType.HTML,  ext: '.html'}
//        ]
        ],

        template: _.template([
            '<table><tbody>',
                '<% _.each(rows, function(row) { %>',
                    '<tr>',
                        '<% _.each(row, function(item) { %>',
                            '<td><div><svg class="btn-doc-format" format="<%= item.type %>", format-ext="<%= item.ext %>">',
                                '<use xlink:href="#svg-format-<%= item.imgCls %>"></use>',
                            '</svg></div></td>',
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
            this.$el.html(this.template({rows:this.formats}));
            $('.btn-doc-format',this.el).on('click', _.bind(this.onFormatClick,this));

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.$el,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.scroller && this.scroller.update();
        },

        onFormatClick: function(e) {
            var type = e.currentTarget.attributes['format'],
                ext = e.currentTarget.attributes['format-ext'];
            if (!_.isUndefined(type) && !_.isUndefined(ext) && this.menu) {
                this.menu.fireEvent('savecopy:format', [this.menu, parseInt(type.value), ext.value]);
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
                    '<div id="panel-settings-general" style="width:100%; height:100%;position:relative;" class="no-padding main-settings-panel active"></div>',
                    '<div id="panel-settings-print" style="width:100%; height:100%;position:relative;" class="no-padding main-settings-panel"></div>',
                    '<div id="panel-settings-spellcheck" style="width:100%; height:100%;position:relative;" class="no-padding main-settings-panel"></div>',
                '</div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
        },

        render: function(node) {
            var $markup = $(this.template({scope: this}));

            this.generalSettings = new SSE.Views.FileMenuPanels.MainSettingsGeneral({menu: this.menu});
            this.generalSettings.options = {alias:'MainSettingsGeneral'};
            this.generalSettings.render($markup.findById('#panel-settings-general'));

            this.printSettings = SSE.getController('Print').getView('MainSettingsPrint');
            this.printSettings.menu = this.menu;
            this.printSettings.render($markup.findById('#panel-settings-print'));

            this.spellcheckSettings = new SSE.Views.FileMenuPanels.MainSpellCheckSettings({menu: this.menu});
            this.spellcheckSettings.render($markup.findById('#panel-settings-spellcheck'));

            this.viewSettingsPicker = new Common.UI.DataView({
                el: $markup.findById('#id-settings-menu'),
                store: new Common.UI.DataViewStore([
                    {name: this.txtGeneral, panel: this.generalSettings, iconCls:'toolbar__icon btn-settings', selected: true},
                    {name: this.txtPageSettings, panel: this.printSettings, iconCls:'toolbar__icon btn-print'},
                    {name: this.txtSpellChecking, panel: this.spellcheckSettings, iconCls:'toolbar__icon btn-ic-docspell'}
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

            this.$el = $(node).html($markup);
            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            var item = this.viewSettingsPicker.getSelectedRec();
            item && item.get('panel').show();
        },

        setMode: function(mode) {
            this.mode = mode;
            if (!this.mode.canPrint) {
                $(this.viewSettingsPicker.dataViewItems[1].el).hide();
                if (this.printSettings && this.printSettings.$el && this.printSettings.$el.hasClass('active'))
                    this.viewSettingsPicker.selectByIndex(0);
            }
            this.generalSettings && this.generalSettings.setMode(this.mode);
            this.spellcheckSettings && this.spellcheckSettings.setMode(this.mode);
            if (!this.mode.isEdit) {
                $(this.viewSettingsPicker.dataViewItems[2].el).hide();
                if (this.spellcheckSettings && this.spellcheckSettings.$el && this.spellcheckSettings.$el.hasClass('active'))
                    this.viewSettingsPicker.selectByIndex(0);
            }
        },

        setApi: function(api) {
            this.generalSettings && this.generalSettings.setApi(api);
            this.spellcheckSettings && this.spellcheckSettings.setApi(api);
        },

        disableEditing: function(disabled) {
            if ( disabled ) {
                $(this.viewSettingsPicker.dataViewItems[1].el).hide();
                $(this.viewSettingsPicker.dataViewItems[2].el).hide();
            } else {
                if ( this.mode.canPrint )
                    $(this.viewSettingsPicker.dataViewItems[1].el).show();

                if ( this.mode.isEdit ) {
                    $(this.viewSettingsPicker.dataViewItems[2].el).show();
                }
            }
        },

        txtGeneral: 'General',
        txtPageSettings: 'Page Settings',
        txtSpellChecking: 'Spell checking'
    }, SSE.Views.FileMenuPanels.Settings || {}));

    SSE.Views.MainSettingsPrint = Common.UI.BaseView.extend(_.extend({
        menu: undefined,

        template: _.template([
            '<div>',
            '<div class="flex-settings">',
            '<table class="main" style="margin: 30px 0 0;"><tbody>',
                '<tr>',
                    '<td class="left"><label><%= scope.textSettings %></label></td>',
                    '<td class="right"><div id="advsettings-print-combo-sheets" class="input-group-nr"></div></td>',
                '</tr>','<tr class="divider"></tr>','<tr class="divider"></tr>',
                '<tr>',
                    '<td class="left"><label><%= scope.textPageSize %></label></td>',
                    '<td class="right"><div id="advsettings-print-combo-pages" class="input-group-nr"></div></td>',
                '</tr>','<tr class="divider"></tr>',
                '<tr>',
                    '<td class="left"><label><%= scope.textPageOrientation %></label></td>',
                    '<td class="right"><span id="advsettings-print-combo-orient"></span></td>',
                '</tr>','<tr class="divider"></tr>',
                '<tr>',
                    '<td class="left"><label><%= scope.textPageScaling %></label></td>',
                    '<td class="right"><span id="advsettings-print-combo-layout"></span></td>',
                '</tr>','<tr class="divider"></tr>',
                '<tr>',
                    '<td class="left" style="vertical-align: top;"><label><%= scope.strPrintTitles %></label></td>',
                    '<td class="right" style="vertical-align: top;"><div id="advsettings-print-titles">',
                        '<table cols="2" class="no-padding">',
                            '<tr>',
                                '<td colspan="2" ><label><%= scope.textRepeatTop %></label></td>',
                            '</tr>',
                            '<tr>',
                                '<td class="padding-small" style="padding-right: 10px;"><div id="advsettings-txt-top"></div></td>',
                                '<td class="padding-small"><div id="advsettings-presets-top"></div></td>',
                            '</tr>',
                            '<tr>',
                                '<td colspan="2" ><label><%= scope.textRepeatLeft %></label></td>',
                            '</tr>',
                            '<tr>',
                                '<td class="padding-small" style="padding-right: 10px;"><div id="advsettings-txt-left"></div></td>',
                                '<td class="padding-small"><div id="advsettings-presets-left"></div></td>',
                            '</tr>',
                        '</table>',
                    '</div></td>',
                '</tr>',
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
                '</tr>',
                '<tr>',
                '<td class="left" style="vertical-align: top;"><label><%= scope.strPrint %></label></td>',
                '<td class="right" style="vertical-align: top;"><div id="advsettings-print">',
                    '<div id="advsettings-print-chb-grid" style="margin-bottom: 10px;"></div>',
                    '<div id="advsettings-print-chb-rows"></div>',
                '</div></td>',
                '</tr>','<tr class="divider"></tr>',
            '</tbody></table>',
        '</div>',
        '<div>',
            '<table class="main" style="margin: 10px 0;"><tbody>',
                '<tr>',
                '<td class="left"></td>',
                '<td class="right"><button id="advsettings-print-button-save" class="btn normal dlg-btn primary"><%= scope.okButtonText %></button></td>',
                '</tr>',
            '</tbody></table>',
        '</div>',
        '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
            this.spinners = [];
            this._initSettings = true;
        },

        render: function(parentEl) {
            var $markup = $(this.template({scope: this}));

            this.cmbSheet = new Common.UI.ComboBox({
                el          : $markup.findById('#advsettings-print-combo-sheets'),
                style       : 'width: 242px;',
                menuStyle   : 'min-width: 242px;max-height: 280px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : []
            });

            this.cmbPaperSize = new Common.UI.ComboBox({
                el          : $markup.findById('#advsettings-print-combo-pages'),
                style       : 'width: 242px;',
                menuStyle   : 'max-height: 280px; min-width: 242px;',
                editable    : false,
                cls         : 'input-group-nr',
                data : [
                    {value:'215.9|279.4',    displayValue:'US Letter (21,59cm x 27,94cm)', caption: 'US Letter'},
                    {value:'215.9|355.6',    displayValue:'US Legal (21,59cm x 35,56cm)', caption: 'US Legal'},
                    {value:'210|297',        displayValue:'A4 (21cm x 29,7cm)', caption: 'A4'},
                    {value:'148|210',        displayValue:'A5 (14,8cm x 21cm)', caption: 'A5'},
                    {value:'176|250',        displayValue:'B5 (17,6cm x 25cm)', caption: 'B5'},
                    {value:'104.8|241.3',    displayValue:'Envelope #10 (10,48cm x 24,13cm)', caption: 'Envelope #10'},
                    {value:'110|220',        displayValue:'Envelope DL (11cm x 22cm)', caption: 'Envelope DL'},
                    {value:'279.4|431.8',    displayValue:'Tabloid (27,94cm x 43,178m)', caption: 'Tabloid'},
                    {value:'297|420',        displayValue:'A3 (29,7cm x 42cm)', caption: 'A3'},
                    {value:'304.8|457.1',    displayValue:'Tabloid Oversize (30,48cm x 45,71cm)', caption: 'Tabloid Oversize'},
                    {value:'196.8|273',      displayValue:'ROC 16K (19,68cm x 27,3cm)', caption: 'ROC 16K'},
                    {value:'119.9|234.9',    displayValue:'Envelope Choukei 3 (11,99cm x 23,49cm)', caption: 'Envelope Choukei 3'},
                    {value:'330.2|482.5',    displayValue:'Super B/A3 (33,02cm x 48,25cm)', caption: 'Super B/A3'}
                ]
            });

            this.cmbPaperOrientation = new Common.UI.ComboBox({
                el          : $markup.findById('#advsettings-print-combo-orient'),
                style       : 'width: 132px;',
                menuStyle   : 'min-width: 132px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: Asc.c_oAscPageOrientation.PagePortrait, displayValue: this.strPortrait },
                    { value: Asc.c_oAscPageOrientation.PageLandscape, displayValue: this.strLandscape }
                ]
            });

            var itemsTemplate =
                _.template([
                    '<% _.each(items, function(item) { %>',
                    '<li id="<%= item.id %>" data-value="<%= item.value %>" <% if (item.value === "customoptions") { %> style="border-top: 1px solid #e5e5e5;margin-top: 5px;" <% } %> ><a tabindex="-1" type="menuitem">',
                    '<%= scope.getDisplayValue(item) %>',
                    '</a></li>',
                    '<% }); %>'
                ].join(''));
            this.cmbLayout = new Common.UI.ComboBox({
                el          : $markup.findById('#advsettings-print-combo-layout'),
                style       : 'width: 242px;',
                menuStyle   : 'min-width: 242px;',
                editable    : false,
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

            this.chPrintGrid = new Common.UI.CheckBox({
                el: $markup.findById('#advsettings-print-chb-grid'),
                labelText: this.textPrintGrid
            });

            this.chPrintRows = new Common.UI.CheckBox({
                el: $markup.findById('#advsettings-print-chb-rows'),
                labelText: this.textPrintHeadings
            });

            this.spnMarginTop = new Common.UI.MetricSpinner({
                el: $markup.findById('#advsettings-spin-margin-top'),
                step: .1,
                width: 110,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 48.25,
                minValue: 0
            });
            this.spinners.push(this.spnMarginTop);

            this.spnMarginBottom = new Common.UI.MetricSpinner({
                el: $markup.findById('#advsettings-spin-margin-bottom'),
                step: .1,
                width: 110,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 48.25,
                minValue: 0
            });
            this.spinners.push(this.spnMarginBottom);

            this.spnMarginLeft = new Common.UI.MetricSpinner({
                el: $markup.findById('#advsettings-spin-margin-left'),
                step: .1,
                width: 110,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 48.25,
                minValue: 0
            });
            this.spinners.push(this.spnMarginLeft);

            this.spnMarginRight = new Common.UI.MetricSpinner({
                el: $markup.findById('#advsettings-spin-margin-right'),
                step: .1,
                width: 110,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 48.25,
                minValue: 0
            });
            this.spinners.push(this.spnMarginRight);

            this.txtRangeTop = new Common.UI.InputField({
                el          : $markup.findById('#advsettings-txt-top'),
                style       : 'width: 147px',
                allowBlank  : true,
                validateOnChange: true
            });

            this.btnPresetsTop = new Common.UI.Button({
                parentEl: $markup.findById('#advsettings-presets-top'),
                cls: 'btn-text-menu-default',
                caption: this.textRepeat,
                style: 'width: 85px;',
                menu: true
            });

            this.txtRangeLeft = new Common.UI.InputField({
                el          : $markup.findById('#advsettings-txt-left'),
                style       : 'width: 147px',
                allowBlank  : true,
                validateOnChange: true
            });

            this.btnPresetsLeft = new Common.UI.Button({
                parentEl: $markup.findById('#advsettings-presets-left'),
                cls: 'btn-text-menu-default',
                caption: this.textRepeat,
                style: 'width: 85px;',
                menu: true
            });

            this.btnOk = new Common.UI.Button({
                el: $markup.findById('#advsettings-print-button-save')
            });

            this.pnlSettings = $markup.find('.flex-settings').addBack().filter('.flex-settings');

            // if (parentEl)
            //     this.setElement(parentEl, false);
            this.$el = $(parentEl).html($markup);

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.pnlSettings,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            var me = this;
            Common.NotificationCenter.on({
                'window:resize': function() {
                    me.isVisible() && me.updateScroller();
                }
            });

            this.fireEvent('render:after', this);
            return this;
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
            this.updateScroller();
            this.fireEvent('show', this);
        },

        isVisible: function() {
            return (this.$el || $(this.el)).is(":visible");
        },

        updateScroller: function() {
            if (this.scroller) {
                this.scroller.update();
                this.pnlSettings.toggleClass('bordered', this.scroller.isVisible());
            }
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
        textFitRows:            'Fit All Rows on One Page',
        textCustomOptions:      'Custom Options',
        textCustom:             'Custom',
        strPrintTitles:         'Print Titles',
        textRepeatTop:          'Repeat rows at top',
        textRepeatLeft:         'Repeat columns at left',
        textRepeat:             'Repeat...'
    }, SSE.Views.MainSettingsPrint || {}));

    SSE.Views.FileMenuPanels.MainSettingsGeneral = Common.UI.BaseView.extend(_.extend({
        el: '#panel-settings-general',
        menu: undefined,

        template: _.template([
        '<div>',
        '<div class="flex-settings">',
            '<table class="main" style="margin: 30px 0 0;"><tbody>',
                /** coauthoring begin **/
                '<tr class="comments">',
                    '<td class="left"><label><%= scope.txtLiveComment %></label></td>',
                    '<td class="right"><div id="fms-chb-live-comment"></div></td>',
                '</tr>','<tr class="divider comments"></tr>',
                '<tr class="comments">',
                    '<td class="left"></td>',
                    '<td class="right"><div id="fms-chb-resolved-comment"></div></td>',
                '</tr>','<tr class="divider comments"></tr>',
                '<tr class="autosave">',
                    '<td class="left"><label id="fms-lbl-autosave"><%= scope.textAutoSave %></label></td>',
                    '<td class="right"><span id="fms-chb-autosave"></span></td>',
                '</tr>','<tr class="divider autosave"></tr>',
                '<tr class="forcesave">',
                    '<td class="left"><label id="fms-lbl-forcesave"><%= scope.textForceSave %></label></td>',
                    '<td class="right"><span id="fms-chb-forcesave"></span></td>',
                '</tr>','<tr class="divider forcesave"></tr>',
                '<tr>',
                    '<td class="left"><label><%= scope.textRefStyle %></label></td>',
                    '<td class="right"><div id="fms-chb-r1c1-style"></div></td>',
                '</tr>','<tr class="divider"></tr>',
                '<tr class="coauth changes">',
                    '<td class="left"><label><%= scope.strCoAuthMode %></label></td>',
                    '<td class="right">',
                        '<div><div id="fms-cmb-coauth-mode" style="display: inline-block; margin-right: 15px;vertical-align: middle;"></div>',
                        '<label id="fms-lbl-coauth-mode" style="vertical-align: middle;"><%= scope.strCoAuthModeDescFast %></label></div></td>',
                '</tr>','<tr class="divider coauth changes"></tr>',
                /** coauthoring end **/
                '<tr class="themes">',
                    '<td class="left"><label><%= scope.strTheme %></label></td>',
                    '<td class="right"><span id="fms-cmb-theme"></span></td>',
                '</tr>','<tr class="divider"></tr>',
                '<tr>',
                    '<td class="left"><label><%= scope.strZoom %></label></td>',
                    '<td class="right"><div id="fms-cmb-zoom" class="input-group-nr"></div></td>',
                '</tr>','<tr class="divider"></tr>',
                '<tr>',
                    '<td class="left"><label><%= scope.strFontRender %></label></td>',
                    '<td class="right"><span id="fms-cmb-font-render"></span></td>',
                '</tr>','<tr class="divider"></tr>',
                '<tr>',
                    '<td class="left"><label><%= scope.strUnit %></label></td>',
                    '<td class="right"><span id="fms-cmb-unit"></span></td>',
                '</tr>','<tr class="divider"></tr>',
                '<tr class="edit">',
                    '<td class="left"><label><%= scope.strFuncLocale %></label></td>',
                    '<td class="right">',
                        '<div><div id="fms-cmb-func-locale" style="display: inline-block; margin-right: 15px;vertical-align: middle;"></div>',
                        '<label id="fms-lbl-func-locale" style="vertical-align: middle;"><%= scope.strFuncLocaleEx %></label></div></td>',
                '</tr>','<tr class="divider edit"></tr>',
                '<tr class="edit">',
                    '<td class="left"><label><%= scope.strRegSettings %></label></td>',
                    '<td class="right">',
                        '<div><div id="fms-cmb-reg-settings" style="display: inline-block; margin-right: 15px;vertical-align: middle;"></div>',
                        '<label id="fms-lbl-reg-settings" style="vertical-align: middle;"></label></div></td>',
                '</tr>','<tr class="divider edit"></tr>',
                '<tr class="edit">',
                    '<td class="left"><label><%= scope.strSeparator %></label></td>',
                    '<td class="right"><div id="fms-chb-separator-settings"></div></td>',
                '</tr>',
                '<tr class="edit">',
                    '<td class="left"></td>',
                    '<td class="right"><div id="fms-decimal-separator"></div><label class="label-separator" style="margin-left: 10px; padding-top: 4px;"><%= scope.strDecimalSeparator %></label></td>',
                '</tr>',
                '<tr class="edit">',
                    '<td class="left"></td>',
                    '<td class="right"><div id="fms-thousands-separator"></div><label class="label-separator" style="margin-left: 10px; padding-top: 4px;"><%= scope.strThousandsSeparator %></label></td>',
                '</tr>','<tr class="divider edit"></tr>',
                '<tr class="edit">',
                    '<td class="left"><label><%= scope.strPaste %></label></td>',
                    '<td class="right"><div id="fms-chb-paste-settings"></div></td>',
                '</tr>','<tr class="divider edit"></tr>',
                '<tr class="macros">',
                    '<td class="left"><label><%= scope.strMacrosSettings %></label></td>',
                    '<td class="right">',
                        '<div><div id="fms-cmb-macros" style="display: inline-block; margin-right: 15px;vertical-align: middle;"></div>',
                        '<label id="fms-lbl-macros" style="vertical-align: middle;"><%= scope.txtWarnMacrosDesc %></label></div></td>',
                '</tr>','<tr class="divider macros"></tr>',
                '<tr class="fms-btn-apply">',
                    '<td class="left"></td>',
                    '<td class="right" style="padding-top:15px; padding-bottom: 15px;"><button class="btn normal dlg-btn primary"><%= scope.okButtonText %></button></td>',
                '</tr>',
            '</tbody></table>',
        '</div>',
        '<div class="fms-flex-apply hidden">',
            '<table class="main" style="margin: 10px 0;"><tbody>',
                '<tr>',
                    '<td class="left"></td>',
                    '<td class="right"><button class="btn normal dlg-btn primary"><%= scope.okButtonText %></button></td>',
                '</tr>',
            '</tbody></table>',
        '</div>',
        '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
        },

        render: function(node) {
            var me = this;
            var $markup = $(this.template({scope: this}));

            /** coauthoring begin **/
            this.chLiveComment = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-live-comment'),
                labelText: this.strLiveComment
            }).on('change', function(field, newValue, oldValue, eOpts){
                me.chResolvedComment.setDisabled(field.getValue()!=='checked');
            });

            this.chResolvedComment = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-resolved-comment'),
                labelText: this.strResolvedComment
            });

            this.chR1C1Style = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-r1c1-style'),
                labelText: this.strR1C1
            });

            this.cmbCoAuthMode = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-coauth-mode'),
                style       : 'width: 160px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: 1, displayValue: this.strFast, descValue: this.strCoAuthModeDescFast},
                    { value: 0, displayValue: this.strStrict, descValue: this.strCoAuthModeDescStrict }
                ]
            }).on('selected', function(combo, record) {
                if (record.value == 1 && (me.chAutosave.getValue()!=='checked'))
                    me.chAutosave.setValue(1);
                me.lblCoAuthMode.text(record.descValue);
            });

            this.lblCoAuthMode = $markup.findById('#fms-lbl-coauth-mode');
            /** coauthoring end **/

            this.cmbZoom = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-zoom'),
                style       : 'width: 160px;',
                editable    : false,
                cls         : 'input-group-nr',
                menuStyle   : 'max-height: 157px;',
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

            var itemsTemplate =
                _.template([
                    '<% _.each(items, function(item) { %>',
                    '<li id="<%= item.id %>" data-value="<%= item.value %>" <% if (item.value === "custom") { %> style="border-top: 1px solid #e5e5e5;margin-top: 5px;" <% } %> ><a tabindex="-1" type="menuitem" <% if (typeof(item.checked) !== "undefined" && item.checked) { %> class="checked" <% } %> ><%= scope.getDisplayValue(item) %></a></li>',
                    '<% }); %>'
                ].join(''));
            this.cmbFontRender = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-font-render'),
                style       : 'width: 160px;',
                editable    : false,
                cls         : 'input-group-nr',
                itemsTemplate: itemsTemplate,
                data        : [
                    { value: Asc.c_oAscFontRenderingModeType.hintingAndSubpixeling, displayValue: this.txtWin },
                    { value: Asc.c_oAscFontRenderingModeType.noHinting, displayValue: this.txtMac },
                    { value: Asc.c_oAscFontRenderingModeType.hinting, displayValue: this.txtNative },
                    { value: 'custom', displayValue: this.txtCacheMode }
                ]
            });
            this.cmbFontRender.on('selected', _.bind(this.onFontRenderSelected, this));

            this.chAutosave = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-autosave'),
                labelText: this.strAutosave
            }).on('change', function(field, newValue, oldValue, eOpts){
                if (field.getValue()!=='checked' && me.cmbCoAuthMode.getValue()) {
                    me.cmbCoAuthMode.setValue(0);
                    me.lblCoAuthMode.text(me.strCoAuthModeDescStrict);
                }
            });
            this.lblAutosave = $markup.findById('#fms-lbl-autosave');

            this.chForcesave = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-forcesave'),
                labelText: this.strForcesave
            });

            this.cmbUnit = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-unit'),
                style       : 'width: 160px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: Common.Utils.Metric.c_MetricUnits['cm'], displayValue: this.txtCm },
                    { value: Common.Utils.Metric.c_MetricUnits['pt'], displayValue: this.txtPt },
                    { value: Common.Utils.Metric.c_MetricUnits['inch'], displayValue: this.txtInch }
                ]
            });

            var formula_arr = [
                { value: 'en', displayValue: this.txtEn, exampleValue: this.txtExampleEn },
                { value: 'be', displayValue: this.txtBe, exampleValue: this.txtExampleBe },
                { value: 'bg', displayValue: this.txtBg, exampleValue: this.txtExampleEn },
                { value: 'ca', displayValue: this.txtCa, exampleValue: this.txtExampleCa },
                { value: 'zh', displayValue: this.txtZh, exampleValue: this.txtExampleEn },
                { value: 'cs', displayValue: this.txtCs, exampleValue: this.txtExampleCs },
                { value: 'da', displayValue: this.txtDa, exampleValue: this.txtExampleDa },
                { value: 'nl', displayValue: this.txtNl, exampleValue: this.txtExampleNl },
                { value: 'fi', displayValue: this.txtFi, exampleValue: this.txtExampleFi },
                { value: 'fr', displayValue: this.txtFr, exampleValue: this.txtExampleFr },
                { value: 'de', displayValue: this.txtDe, exampleValue: this.txtExampleDe },
                { value: 'el', displayValue: this.txtEl, exampleValue: this.txtExampleEn },
                { value: 'hu', displayValue: this.txtHu, exampleValue: this.txtExampleHu },
                { value: 'id', displayValue: this.txtId, exampleValue: this.txtExampleEn },
                { value: 'it', displayValue: this.txtIt, exampleValue: this.txtExampleIt },
                { value: 'ja', displayValue: this.txtJa, exampleValue: this.txtExampleEn },
                { value: 'ko', displayValue: this.txtKo, exampleValue: this.txtExampleEn },
                { value: 'lv', displayValue: this.txtLv, exampleValue: this.txtExampleEn },
                { value: 'lo', displayValue: this.txtLo, exampleValue: this.txtExampleEn },
                { value: 'nb', displayValue: this.txtNb, exampleValue: this.txtExampleNb },
                { value: 'pl', displayValue: this.txtPl, exampleValue: this.txtExamplePl },
                { value: 'pt', displayValue: this.txtPtlang, exampleValue: this.txtExamplePt },
                { value: 'ro', displayValue: this.txtRo, exampleValue: this.txtExampleEn },
                { value: 'ru', displayValue: this.txtRu, exampleValue: this.txtExampleRu },
                { value: 'sk', displayValue: this.txtSk, exampleValue: this.txtExampleEn },
                { value: 'sl', displayValue: this.txtSl, exampleValue: this.txtExampleEn },
                { value: 'sv', displayValue: this.txtSv, exampleValue: this.txtExampleSv },
                { value: 'es', displayValue: this.txtEs, exampleValue: this.txtExampleEs },
                { value: 'tr', displayValue: this.txtTr, exampleValue: this.txtExampleTr },
                { value: 'uk', displayValue: this.txtUk, exampleValue: this.txtExampleEn },
                { value: 'vi', displayValue: this.txtVi, exampleValue: this.txtExampleEn }
            ];
            formula_arr.sort(function(a, b){
                if (a.displayValue < b.displayValue) return -1;
                if (a.displayValue > b.displayValue) return 1;
                return 0;
            });

            this.cmbFuncLocale = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-func-locale'),
                style       : 'width: 160px;',
                menuStyle: 'max-height: 185px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : formula_arr
            }).on('selected', function(combo, record) {
                me.updateFuncExample(record.exampleValue);
            });

            var regdata = [{ value: 0x042C }, { value: 0x0402 }, { value: 0x0405 }, { value: 0x0C07 }, { value: 0x0407 },  {value: 0x0807}, { value: 0x0408 }, { value: 0x0C09 }, { value: 0x0809 }, { value: 0x0409 }, { value: 0x0C0A }, { value: 0x080A },
                            { value: 0x040B }, { value: 0x040C }, { value: 0x0410 }, { value: 0x0411 }, { value: 0x0412 }, { value: 0x0426 }, { value: 0x040E }, { value: 0x0413 }, { value: 0x0415 }, { value: 0x0416 },
                            { value: 0x0816 }, { value: 0x0419 }, { value: 0x041B }, { value: 0x0424 }, { value: 0x081D }, { value: 0x041D }, { value: 0x041F }, { value: 0x0422 }, { value: 0x042A }, { value: 0x0804 }];
            regdata.forEach(function(item) {
                var langinfo = Common.util.LanguageInfo.getLocalLanguageName(item.value);
                item.displayValue = langinfo[1];
                item.langName = langinfo[0];
            });

            this.cmbRegSettings = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-reg-settings'),
                style       : 'width: 160px;',
                menuStyle: 'max-height: 185px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : regdata,
                template: _.template([
                    '<span class="input-group combobox <%= cls %> combo-langs" id="<%= id %>" style="<%= style %>">',
                    '<input type="text" class="form-control" style="padding-left: 25px !important;">',
                    '<span class="icon input-icon lang-flag"></span>',
                        '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">',
                            '<span class="caret" />',
                        '</button>',
                        '<ul class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
                            '<% _.each(items, function(item) { %>',
                                '<li id="<%= item.id %>" data-value="<%= item.value %>">',
                                    '<a tabindex="-1" type="menuitem" style="padding-left: 26px !important;">',
                                        '<i class="icon lang-flag <%= item.langName %>" style="position: absolute;margin-left:-21px;"></i>',
                                        '<%= scope.getDisplayValue(item) %>',
                                    '</a>',
                                '</li>',
                            '<% }); %>',
                        '</ul>',
                    '</span>'].join(''))
            }).on('selected', function(combo, record) {
                me.updateRegionalExample(record.value);
                var isBaseSettings = me.chSeparator.getValue();
                if (isBaseSettings === 'checked') {
                    me.inputDecimalSeparator.setValue(me.api.asc_getDecimalSeparator(record.value), true);
                    me.inputThousandsSeparator.setValue(me.api.asc_getGroupSeparator(record.value), true);
                }
            });
            if (this.cmbRegSettings.scroller) this.cmbRegSettings.scroller.update({alwaysVisibleY: true});

            this.chSeparator = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-separator-settings'),
                labelText: this.strUseSeparatorsBasedOnRegionalSettings
            }).on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = field.getValue() === 'checked';
                if (checked) {
                    var lang = this.cmbRegSettings.getValue(),
                        decimal = this.api.asc_getDecimalSeparator(_.isNumber(lang) ? lang : undefined),
                        group = this.api.asc_getGroupSeparator(_.isNumber(lang) ? lang : undefined);
                    this.inputDecimalSeparator.setValue(decimal);
                    this.inputThousandsSeparator.setValue(group);
                }
                this.inputDecimalSeparator.setDisabled(checked);
                this.inputThousandsSeparator.setDisabled(checked);
                if (checked) {
                    this.$el.find('.label-separator').addClass('disabled');
                } else {
                    this.$el.find('.label-separator').removeClass('disabled');
                }
            }, this));

            var keyDown = function(event){
                var key = event.key,
                    value = event.target.value;
                if (key !== 'ArrowLeft' && key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'ArrowRight' &&
                    key !== 'Home' && key !== 'End' && key !== 'Backspace' && key !== 'Delete' && value.length > 0 &&
                    event.target.selectionEnd - event.target.selectionStart === 0) {
                    event.preventDefault();
                }
            };

            this.inputDecimalSeparator = new Common.UI.InputField({
                el: $markup.findById('#fms-decimal-separator'),
                style: 'width: 35px;',
                validateOnBlur: false
            });
            var $decimalSeparatorInput = this.inputDecimalSeparator.$el.find('input');
            $decimalSeparatorInput.on('keydown', keyDown);

            this.inputThousandsSeparator = new Common.UI.InputField({
                el: $markup.findById('#fms-thousands-separator'),
                style: 'width: 35px;',
                validateOnBlur: false
            });
            var $thousandsSeparatorInput = this.inputThousandsSeparator.$el.find('input');
            $thousandsSeparatorInput.on('keydown', keyDown);

            this.cmbMacros = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-macros'),
                style       : 'width: 160px;',
                editable    : false,
                menuCls     : 'menu-aligned',
                cls         : 'input-group-nr',
                data        : [
                    { value: 2, displayValue: this.txtStopMacros, descValue: this.txtStopMacrosDesc },
                    { value: 0, displayValue: this.txtWarnMacros, descValue: this.txtWarnMacrosDesc },
                    { value: 1, displayValue: this.txtRunMacros, descValue: this.txtRunMacrosDesc }
                ]
            }).on('selected', function(combo, record) {
                me.lblMacrosDesc.text(record.descValue);
            });
            this.lblMacrosDesc = $markup.findById('#fms-lbl-macros');

            this.chPaste = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-paste-settings'),
                labelText: this.strPasteButton
            });

            this.cmbTheme = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-theme'),
                style       : 'width: 160px;',
                editable    : false,
                cls         : 'input-group-nr',
            });

            $markup.find('.btn.primary').each(function(index, el){
                (new Common.UI.Button({
                    el: $(el)
                })).on('click', _.bind(me.applySettings, me));
            });

            this.pnlSettings = $markup.find('.flex-settings').addBack().filter('.flex-settings');
            this.pnlApply = $markup.find('.fms-flex-apply').addBack().filter('.fms-flex-apply');
            this.pnlTable = this.pnlSettings.find('table');
            this.trApply = $markup.find('.fms-btn-apply');

            this.$el = $(node).html($markup);

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.pnlSettings,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            Common.NotificationCenter.on({
                'window:resize': function() {
                    me.isVisible() && me.updateScroller();
                }
            });

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);

            this.updateSettings();
            this.updateScroller();
        },

        isVisible: function() {
            return (this.$el || $(this.el)).is(":visible");
        },

        updateScroller: function() {
            if (this.scroller) {
                Common.UI.Menu.Manager.hideAll();
                var scrolled = this.$el.height()< this.pnlTable.height() + 25 + this.pnlApply.height();
                this.pnlApply.toggleClass('hidden', !scrolled);
                this.trApply.toggleClass('hidden', scrolled);
                this.pnlSettings.css('overflow', scrolled ? 'hidden' : 'visible');
                this.scroller.update();
                this.pnlSettings.toggleClass('bordered', this.scroller.isVisible());
            }
        },

        setMode: function(mode) {
            this.mode = mode;

            var fast_coauth = Common.Utils.InternalSettings.get("sse-settings-coauthmode");

            $('tr.edit', this.el)[mode.isEdit ? 'show' : 'hide']();
            $('tr.autosave', this.el)[mode.isEdit && (mode.canChangeCoAuthoring || !fast_coauth) ? 'show' : 'hide']();
            if (this.mode.isDesktopApp && this.mode.isOffline) {
                this.chAutosave.setCaption(this.strAutoRecover);
                this.lblAutosave.text(this.textAutoRecover);
            }
            $('tr.forcesave', this.el)[mode.canForcesave ? 'show' : 'hide']();
            $('tr.comments', this.el)[mode.canCoAuthoring ? 'show' : 'hide']();
            $('tr.coauth.changes', this.el)[mode.isEdit && !mode.isOffline && mode.canCoAuthoring && mode.canChangeCoAuthoring ? 'show' : 'hide']();
            $('tr.macros', this.el)[(mode.customization && mode.customization.macros===false) ? 'hide' : 'show']();

            if ( !Common.UI.Themes.available() ) {
                $('tr.themes, tr.themes + tr.divider', this.el).hide();
            }
        },

        setApi: function(api) {
            this.api = api;
        },

        updateSettings: function() {
            var value = Common.Utils.InternalSettings.get("sse-settings-zoom");
            value = (value!==null) ? parseInt(value) : (this.mode.customization && this.mode.customization.zoom ? parseInt(this.mode.customization.zoom) : 100);
            var item = this.cmbZoom.store.findWhere({value: value});
            this.cmbZoom.setValue(item ? parseInt(item.get('value')) : (value>0 ? value+'%' : 100));

            /** coauthoring begin **/
            this.chLiveComment.setValue(Common.Utils.InternalSettings.get("sse-settings-livecomment"));
            this.chResolvedComment.setValue(Common.Utils.InternalSettings.get("sse-settings-resolvedcomment"));
            this.chR1C1Style.setValue(Common.Utils.InternalSettings.get("sse-settings-r1c1"));

            var fast_coauth = Common.Utils.InternalSettings.get("sse-settings-coauthmode");
            item = this.cmbCoAuthMode.store.findWhere({value: fast_coauth ? 1 : 0});
            this.cmbCoAuthMode.setValue(item ? item.get('value') : 1);
            this.lblCoAuthMode.text(item ? item.get('descValue') : this.strCoAuthModeDescFast);
            /** coauthoring end **/

            value = Common.Utils.InternalSettings.get("sse-settings-fontrender");
            item = this.cmbFontRender.store.findWhere({value: parseInt(value)});
            this.cmbFontRender.setValue(item ? item.get('value') : Asc.c_oAscFontRenderingModeType.hintingAndSubpixeling);
            this._fontRender = this.cmbFontRender.getValue();

            value = Common.Utils.InternalSettings.get("sse-settings-cachemode");
            item = this.cmbFontRender.store.findWhere({value: 'custom'});
            item && value && item.set('checked', !!value);
            item && value && this.cmbFontRender.cmpEl.find('#' + item.get('id') + ' a').addClass('checked');

            value = Common.Utils.InternalSettings.get("sse-settings-unit");
            item = this.cmbUnit.store.findWhere({value: value});
            this.cmbUnit.setValue(item ? parseInt(item.get('value')) : Common.Utils.Metric.getDefaultMetric());
            this._oldUnits = this.cmbUnit.getValue();

            value = Common.Utils.InternalSettings.get("sse-settings-autosave");
            this.chAutosave.setValue(value == 1);

            if (this.mode.canForcesave) {
                this.chForcesave.setValue(Common.Utils.InternalSettings.get("sse-settings-forcesave"));
            }

            value = Common.Utils.InternalSettings.get("sse-settings-func-locale");
            item = this.cmbFuncLocale.store.findWhere({value: value});
            if (!item && value)
                item = this.cmbFuncLocale.store.findWhere({value: value.split(/[\-\_]/)[0]});
            this.cmbFuncLocale.setValue(item ? item.get('value') : 'en');
            this.updateFuncExample(item ? item.get('exampleValue') : this.txtExampleEn);

            value = this.api.asc_getLocale();
            if (value) {
                item = this.cmbRegSettings.store.findWhere({value: value});
                this.cmbRegSettings.setValue(item ? item.get('value') : Common.util.LanguageInfo.getLocalLanguageName(value)[1]);
                item && (value = this.cmbRegSettings.getValue());
            } else {
                value = this.mode.lang ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(this.mode.lang)) : 0x0409;
                this.cmbRegSettings.setValue(Common.util.LanguageInfo.getLocalLanguageName(value)[1]);
            }
            this.updateRegionalExample(value);

            var isBaseSettings = Common.Utils.InternalSettings.get("sse-settings-use-base-separator");
            this.chSeparator.setValue(isBaseSettings, true);
            var decimal,
                group;
            if (!isBaseSettings) {
                decimal = Common.Utils.InternalSettings.get("sse-settings-decimal-separator") || this.api.asc_getDecimalSeparator();
                group = Common.Utils.InternalSettings.get("sse-settings-group-separator") || this.api.asc_getGroupSeparator();
            } else {
                var lang = this.cmbRegSettings.getValue();
                decimal = this.api.asc_getDecimalSeparator(_.isNumber(lang) ? lang : undefined);
                group = this.api.asc_getGroupSeparator(_.isNumber(lang) ? lang : undefined);
            }
            this.inputDecimalSeparator.setValue(decimal);
            this.inputThousandsSeparator.setValue(group);
            this.inputDecimalSeparator.setDisabled(isBaseSettings);
            this.inputThousandsSeparator.setDisabled(isBaseSettings);
            if (isBaseSettings) {
                this.$el.find('.label-separator').addClass('disabled');
            } else {
                this.$el.find('.label-separator').removeClass('disabled');
            }

            item = this.cmbMacros.store.findWhere({value: Common.Utils.InternalSettings.get("sse-macros-mode")});
            this.cmbMacros.setValue(item ? item.get('value') : 0);
            this.lblMacrosDesc.text(item ? item.get('descValue') : this.txtWarnMacrosDesc);

            this.chPaste.setValue(Common.Utils.InternalSettings.get("sse-settings-paste-button"));

            var data = [];
            for (var t in Common.UI.Themes.map()) {
                data.push({value: t, displayValue: Common.UI.Themes.get(t).text});
            }

            if ( data.length ) {
                this.cmbTheme.setData(data);
                item = this.cmbTheme.store.findWhere({value: Common.UI.Themes.currentThemeId()});
                this.cmbTheme.setValue(item ? item.get('value') : Common.UI.Themes.defaultThemeId());
            }
        },

        applySettings: function() {
            Common.UI.Themes.setTheme(this.cmbTheme.getValue());
            Common.localStorage.setItem("sse-settings-zoom", this.cmbZoom.getValue());
            Common.Utils.InternalSettings.set("sse-settings-zoom", Common.localStorage.getItem("sse-settings-zoom"));
            /** coauthoring begin **/
            Common.localStorage.setItem("sse-settings-livecomment", this.chLiveComment.isChecked() ? 1 : 0);
            Common.localStorage.setItem("sse-settings-resolvedcomment", this.chResolvedComment.isChecked() ? 1 : 0);
            if (this.mode.isEdit && !this.mode.isOffline && this.mode.canCoAuthoring && this.mode.canChangeCoAuthoring)
                Common.localStorage.setItem("sse-settings-coauthmode", this.cmbCoAuthMode.getValue());
            /** coauthoring end **/
            Common.localStorage.setItem("sse-settings-r1c1", this.chR1C1Style.isChecked() ? 1 : 0);
            Common.localStorage.setItem("sse-settings-fontrender", this.cmbFontRender.getValue());
            var item = this.cmbFontRender.store.findWhere({value: 'custom'});
            Common.localStorage.setItem("sse-settings-cachemode", item && !item.get('checked') ? 0 : 1);
            Common.localStorage.setItem("sse-settings-unit", this.cmbUnit.getValue());
            if (this.mode.canChangeCoAuthoring || !Common.Utils.InternalSettings.get("sse-settings-coauthmode"))
                Common.localStorage.setItem("sse-settings-autosave", this.chAutosave.isChecked() ? 1 : 0);
            if (this.mode.canForcesave)
                Common.localStorage.setItem("sse-settings-forcesave", this.chForcesave.isChecked() ? 1 : 0);
            Common.localStorage.setItem("sse-settings-func-locale", this.cmbFuncLocale.getValue());
            if (this.cmbRegSettings.getSelectedRecord())
                Common.localStorage.setItem("sse-settings-reg-settings", this.cmbRegSettings.getValue());

            var value,
                isChecked = this.chSeparator.isChecked();
            if (!isChecked) {
                value = this.inputDecimalSeparator.getValue();
                if (value.length > 0) {
                    Common.localStorage.setItem("sse-settings-decimal-separator", value);
                    Common.Utils.InternalSettings.set("sse-settings-decimal-separator", value);
                }
                value = this.inputThousandsSeparator.getValue();
                if (value.length > 0) {
                    Common.localStorage.setItem("sse-settings-group-separator", value);
                    Common.Utils.InternalSettings.set("sse-settings-group-separator", value);
                }
            }
            Common.localStorage.setBool("sse-settings-use-base-separator", isChecked);
            Common.Utils.InternalSettings.set("sse-settings-use-base-separator", isChecked);

            Common.localStorage.setItem("sse-macros-mode", this.cmbMacros.getValue());
            Common.Utils.InternalSettings.set("sse-macros-mode", this.cmbMacros.getValue());

            Common.localStorage.setItem("sse-settings-paste-button", this.chPaste.isChecked() ? 1 : 0);

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
                    text = text + ' ' + this.api.asc_getLocaleExample(arr[5], Asc.cDate().getExcelDateWithTime(), landId);
                    text = text + ' ' + this.api.asc_getLocaleExample(arr[6], Asc.cDate().getExcelDateWithTime(), landId);
                }
                $('#fms-lbl-reg-settings').text(_.isEmpty(text) ? '' : this.strRegSettingsEx + text);
            }
            var icon    = this.cmbRegSettings.$el.find('.input-icon'),
                plang   = icon.attr('lang'),
                langName = Common.util.LanguageInfo.getLocalLanguageName(landId)[0];
            if (plang) icon.removeClass(plang);
            icon.addClass(langName).attr('lang',langName);
        },
        
        updateFuncExample: function(text) {
            $('#fms-lbl-func-locale').text(_.isEmpty(text) ? '' : this.strRegSettingsEx + ' ' + text);
        },

        onFontRenderSelected: function(combo, record) {
            if (record.value == 'custom') {
                var item = combo.store.findWhere({value: 'custom'});
                item && item.set('checked', !record.checked);
                combo.cmpEl.find('#' + record.id + ' a').toggleClass('checked', !record.checked);
                combo.setValue(this._fontRender);
            }
            this._fontRender = combo.getValue();
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
        txtPl: 'Polish',
        txtEs: 'Spanish',
        txtFr: 'French',
        txtIt: 'Italian',
        txtExampleEn: 'SUM; MIN; MAX; COUNT',
        txtExampleDe: 'SUMME; MIN; MAX; ANZAHL',
        txtExampleRu: 'СУММ; МИН; МАКС; СЧЁТ',
        txtExamplePl: 'SUMA; MIN; MAX; ILE.LICZB',
        txtExampleEs: 'SUMA; MIN; MAX; CALCULAR',
        txtExampleFr: 'SOMME; MIN; MAX; NB',
        txtExampleIt: 'SOMMA; MIN; MAX; CONTA.NUMERI',
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
        txtInch: 'Inch',
        textForceSave: 'Save to Server',
        strForcesave: 'Always save to server (otherwise save to server on document close)',
        strResolvedComment: 'Turn on display of the resolved comments',
        textRefStyle: 'Reference Style',
        strR1C1: 'Turn on R1C1 style',
        strSeparator: 'Separator',
        strUseSeparatorsBasedOnRegionalSettings: 'Use separators based on regional settings',
        strDecimalSeparator: 'Decimal separator',
        strThousandsSeparator: 'Thousands separator',
        txtCacheMode: 'Default cache mode',
        strMacrosSettings: 'Macros Settings',
        txtWarnMacros: 'Show Notification',
        txtRunMacros: 'Enable All',
        txtStopMacros: 'Disable All',
        txtWarnMacrosDesc: 'Disable all macros with notification',
        txtRunMacrosDesc: 'Enable all macros without notification',
        txtStopMacrosDesc: 'Disable all macros without notification',
        strPaste: 'Cut, copy and paste',
        strTheme: 'Theme',
        txtThemeLight: 'Light',
        txtThemeDark: 'Dark',
        strPasteButton: 'Show Paste Options button when content is pasted',
        txtBe: 'Belarusian',
        txtBg: 'Bulgarian',
        txtCa: 'Catalan',
        txtZh: 'Chinese',
        txtCs: 'Czech',
        txtDa: 'Danish',
        txtNl: 'Dutch',
        txtFi: 'Finnish',
        txtEl: 'Greek',
        txtHu: 'Hungarian',
        txtId: 'Indonesian',
        txtJa: 'Japanese',
        txtKo: 'Korean',
        txtLv: 'Latvian',
        txtLo: 'Lao',
        txtNb: 'Norwegian',
        txtPtlang: 'Portuguese',
        txtRo: 'Romanian',
        txtSk: 'Slovak',
        txtSl: 'Slovenian',
        txtSv: 'Swedish',
        txtTr: 'Turkish',
        txtUk: 'Ukrainian',
        txtVi: 'Vietnamese',
        txtExampleBe: 'СУММ; МИН; МАКС; СЧЁТ',
        txtExampleCa: 'SUMA; MIN; MAX; COMPT',
        txtExampleCs: 'SUMA; MIN; MAX; POČET',
        txtExampleDa: 'SUM; MIN; MAKS; TÆL',
        txtExampleNl: 'SOM; MIN; MAX; AANTAL',
        txtExampleFi: 'SUMMA; MIN; MAKS; LASKE',
        txtExampleHu: 'SZUM; MIN; MAX; DARAB',
        txtExampleNb: 'SUMMER; MIN; STØRST; ANTALL',
        txtExamplePt: 'SOMA; MÍNIMO; MÁXIMO; CONTAR',
        txtExampleSv: 'SUMMA; MIN; MAX; ANTAL',
        txtExampleTr: 'TOPLA; MİN; MAK; BAĞ_DEĞ_SAY'

}, SSE.Views.FileMenuPanels.MainSettingsGeneral || {}));

    SSE.Views.FileMenuPanels.MainSpellCheckSettings = Common.UI.BaseView.extend(_.extend({
        el: '#panel-settings-spellcheck',
        menu: undefined,

        template: _.template([
            '<table class="main" style="margin: 30px 0;"><tbody>',
            '<tr>',
                '<td class="left" style="padding-bottom: 8px;"><label><%= scope.strDictionaryLanguage %></label></td>',
                '<td class="right" style="padding-bottom: 8px;"><span id="fms-cmb-dictionary-language"></span></td>',
            '</tr>',
            '<tr>',
                '<td class="left" style="padding-bottom: 8px;"></td>',
                '<td class="right" style="padding-bottom: 8px;"><span id="fms-chb-ignore-uppercase-words"></span></td>',
            '</tr>',
            '<tr>',
                '<td class="left"></td>',
                '<td class="right"><span id="fms-chb-ignore-numbers-words"></span></td>',
            '</tr>','<tr class="divider"></tr>',
            '<tr>',
                '<td class="left"><label><%= scope.txtProofing %></label></td>',
                '<td class="right"><button type="button" class="btn btn-text-default" id="fms-btn-auto-correct" style="width:auto; display: inline-block;padding-right: 10px;padding-left: 10px;"><%= scope.txtAutoCorrect %></button></div></td>',
            '</tr>','<tr class="divider"></tr>',
            '<tr>',
                '<td class="left"></td>',
                '<td class="right"><button id="fms-spellcheck-btn-apply" class="btn normal dlg-btn primary"><%= scope.okButtonText %></button></td>',
            '</tr>',
            '</tbody></table>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
        },

        render: function(node) {
            var me = this;
            var $markup = $(this.template({scope: this}));

            this.chIgnoreUppercase = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-ignore-uppercase-words'),
                labelText: this.strIgnoreWordsInUPPERCASE
            });

            this.chIgnoreNumbers = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-ignore-numbers-words'),
                labelText: this.strIgnoreWordsWithNumbers
            });

            this.cmbDictionaryLanguage = new Common.UI.ComboBox({
                el:  $markup.findById('#fms-cmb-dictionary-language'),
                cls: 'input-group-nr',
                style: 'width: 267px;',
                editable: false,
                menuStyle: 'min-width: 267px; max-height: 209px;'
            });

            this.btnAutoCorrect = new Common.UI.Button({
                el: $markup.findById('#fms-btn-auto-correct')
            });
            this.btnAutoCorrect.on('click', _.bind(this.autoCorrect, this));

            this.btnApply = new Common.UI.Button({
                el: $markup.findById('#fms-spellcheck-btn-apply')
            });

            this.btnApply.on('click', _.bind(this.applySettings, this));

            this.$el = $(node).html($markup);

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.$el,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);

            this.updateSettings();
            this.scroller && this.scroller.update();
        },

        setMode: function(mode) {
            this.mode = mode;
        },

        setApi: function(api) {
            this.api = api;
        },

        updateSettings: function() {
            var arrLang = SSE.getController('Spellcheck').loadLanguages(),
                allLangs = arrLang[0],
                langs = arrLang[1],
                change = arrLang[2];
            var sessionValue = Common.Utils.InternalSettings.get("sse-spellcheck-locale"),
                value;
            if (sessionValue)
                value = parseInt(sessionValue);
            else
                value = this.mode.lang ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(this.mode.lang)) : 0x0409;
            if (langs && langs.length > 0) {
                if (this.cmbDictionaryLanguage.store.length === 0 || change) {
                    this.cmbDictionaryLanguage.setData(langs);
                }
                var item = this.cmbDictionaryLanguage.store.findWhere({value: value});
                if (!item && allLangs[value]) {
                    value = allLangs[value][0].split(/[\-\_]/)[0];
                    item = this.cmbDictionaryLanguage.store.find(function(model){
                        return model.get('shortName').indexOf(value)==0;
                    });
                }
                this.cmbDictionaryLanguage.setValue(item ? item.get('value') : langs[0].value);
                value = this.cmbDictionaryLanguage.getValue();
                if (value !== parseInt(sessionValue)) {
                    Common.Utils.InternalSettings.set("sse-spellcheck-locale", value);
                }
            } else {
                this.cmbDictionaryLanguage.setValue(Common.util.LanguageInfo.getLocalLanguageName(value)[1]);
                this.cmbDictionaryLanguage.setDisabled(true);
            }

            this.chIgnoreUppercase.setValue(Common.Utils.InternalSettings.get("sse-spellcheck-ignore-uppercase-words"));
            this.chIgnoreNumbers.setValue(Common.Utils.InternalSettings.get("sse-spellcheck-ignore-numbers-words"));
        },

        applySettings: function() {
            var value = this.chIgnoreUppercase.isChecked();
            Common.localStorage.setBool("sse-spellcheck-ignore-uppercase-words", value);
            Common.Utils.InternalSettings.set("sse-spellcheck-ignore-uppercase-words", value);
            value = this.chIgnoreNumbers.isChecked();
            Common.localStorage.setBool("sse-spellcheck-ignore-numbers-words", value);
            Common.Utils.InternalSettings.set("sse-spellcheck-ignore-numbers-words", value);

            if (!this.cmbDictionaryLanguage.isDisabled()) {
                value = this.cmbDictionaryLanguage.getValue();
                Common.localStorage.setItem("sse-spellcheck-locale", value);
                Common.Utils.InternalSettings.set("sse-spellcheck-locale", value);
            }

            Common.localStorage.save();
            if (this.menu) {
                this.menu.fireEvent('spellcheck:apply', [this.menu]);
            }
        },

        autoCorrect: function() {
            if (this.dlgAutoCorrect && this.dlgAutoCorrect.isVisible()) return;
            this.dlgAutoCorrect = new Common.Views.AutoCorrectDialog({
                api: this.api
            });
            this.dlgAutoCorrect.show();
        },

        strIgnoreWordsInUPPERCASE: 'Ignore words in UPPERCASE',
        strIgnoreWordsWithNumbers: 'Ignore words with numbers',
        strDictionaryLanguage: 'Dictionary language',
        okButtonText: 'Apply',
        txtProofing: 'Proofing',
        txtAutoCorrect: 'AutoCorrect options...'
    }, SSE.Views.FileMenuPanels.MainSpellCheckSettings || {}));

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
            this.$el.html(this.template());

            this.viewRecentPicker = new Common.UI.DataView({
                el: $('#id-recent-view'),
                store: new Common.UI.DataViewStore(this.recent),
                itemTemplate: _.template([
                    '<div class="recent-wrap">',
                        '<div class="recent-icon">',
                            '<svg>',
                                '<use xlink:href="#svg-file-recent"></use>',
                            '</svg>',
                        '</div>',
                        '<div class="file-name"><% if (typeof title !== "undefined") {%><%= Common.Utils.String.htmlEncode(title || "") %><% } %></div>',
                        '<div class="file-info"><% if (typeof folder !== "undefined") {%><%= Common.Utils.String.htmlEncode(folder || "") %><% } %></div>',
                    '</div>'
                ].join(''))
            });

            this.viewRecentPicker.on('item:click', _.bind(this.onRecentFileClick, this));

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.$el,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.scroller && this.scroller.update();
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
                '<div class="blank-document-btn">',
                    '<svg class="btn-blank-format">',
                        '<use xlink:href="#svg-format-blank"></use>',
                    '</svg>',
                '</div>',
                '<div class="blank-document-info">',
                    '<h3><%= scope.newDocumentText %></h3>',
                    '<%= scope.newDescriptionText %>',
                '</div>',
            '</div>',
            '<h3><%= scope.fromTemplateText %></h3><hr noshade />',
            '<div class="thumb-list">',
                '<% _.each(docs, function(item) { %>',
                    '<div class="thumb-wrap" template="<%= item.url %>">',
                        '<div class="thumb"',
                            '<% if (!_.isEmpty(item.image)) { %> ',
                            ' style="background-image: url(<%= item.image %>);">',
                            '<% } else { ' +
                                'print(\"><svg class=\'btn-blank-format\'><use xlink:href=\'#svg-file-template\'></use></svg>\")' +
                            ' } %>',
                        '</div>',
                        '<div class="title"><%= Common.Utils.String.htmlEncode(item.title || item.name || "") %></div>',
                    '</div>',
                '<% }) %>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
        },

        render: function() {
            this.$el.html(this.template({
                scope: this,
                docs: this.options[0].docs
            }));

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.$el,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.scroller && this.scroller.update();
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
            '<div class="flex-settings">',
                '<table class="main" style="margin: 30px 0 0;">',
                    '<tr>',
                        '<td class="left"><label>' + this.txtPlacement + '</label></td>',
                        '<td class="right"><label id="id-info-placement">-</label></td>',
                    '</tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtOwner + '</label></td>',
                        '<td class="right"><label id="id-info-owner">-</label></td>',
                    '</tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtUploaded + '</label></td>',
                        '<td class="right"><label id="id-info-uploaded">-</label></td>',
                    '</tr>',
                    '<tr class="divider general"></tr>',
                    '<tr class="divider general"></tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtTitle + '</label></td>',
                        '<td class="right"><div id="id-info-title"></div></td>',
                    '</tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtSubject + '</label></td>',
                        '<td class="right"><div id="id-info-subject"></div></td>',
                    '</tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtComment + '</label></td>',
                        '<td class="right"><div id="id-info-comment"></div></td>',
                    '</tr>',
                    '<tr class="divider"></tr>',
                    '<tr class="divider"></tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtModifyDate + '</label></td>',
                        '<td class="right"><label id="id-info-modify-date"></label></td>',
                    '</tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtModifyBy + '</label></td>',
                        '<td class="right"><label id="id-info-modify-by"></label></td>',
                    '</tr>',
                    '<tr class="divider modify">',
                    '<tr class="divider modify">',
                    '<tr>',
                        '<td class="left"><label>' + this.txtCreated + '</label></td>',
                        '<td class="right"><label id="id-info-date"></label></td>',
                    '</tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtAppName + '</label></td>',
                        '<td class="right"><label id="id-info-appname"></label></td>',
                    '</tr>',
                    '<tr>',
                        '<td class="left" style="vertical-align: top;"><label style="margin-top: 3px;">' + this.txtAuthor + '</label></td>',
                        '<td class="right" style="vertical-align: top;"><div id="id-info-author">',
                            '<table>',
                                '<tr>',
                                    '<td><div id="id-info-add-author"><input type="text" spellcheck="false" class="form-control" placeholder="' +  this.txtAddAuthor +'"></div></td>',
                                '</tr>',
                            '</table>',
                        '</div></td>',
                    '</tr>',
                '<tr style="height: 5px;"></tr>',
                '</table>',
            '</div>',
            '<div id="fms-flex-apply">',
                '<table class="main" style="margin: 10px 0;">',
                    '<tr>',
                        '<td class="left"></td>',
                        '<td class="right"><button id="fminfo-btn-apply" class="btn normal dlg-btn primary"><%= scope.okButtonText %></button></td>',
                    '</tr>',
                '</table>',
            '</div>'
            ].join(''));

            this.menu = options.menu;
            this.coreProps = null;
            this.authors = [];
            this._locked = false;
        },

        render: function(node) {
            var me = this;
            var $markup = $(me.template({scope: me}));

            // server info
            this.lblPlacement = $markup.findById('#id-info-placement');
            this.lblOwner = $markup.findById('#id-info-owner');
            this.lblUploaded = $markup.findById('#id-info-uploaded');

            // edited info
            var keyDownBefore = function(input, e){
                if (e.keyCode === Common.UI.Keys.ESC) {
                    var newVal = input._input.val(),
                        oldVal = input.getValue();
                    if (newVal !== oldVal) {
                        input.setValue(oldVal);
                        e.stopPropagation();
                    }
                }
            };

            this.inputTitle = new Common.UI.InputField({
                el          : $markup.findById('#id-info-title'),
                style       : 'width: 200px;',
                placeHolder : this.txtAddText,
                validateOnBlur: false
            }).on('keydown:before', keyDownBefore);
            this.inputSubject = new Common.UI.InputField({
                el          : $markup.findById('#id-info-subject'),
                style       : 'width: 200px;',
                placeHolder : this.txtAddText,
                validateOnBlur: false
            }).on('keydown:before', keyDownBefore);
            this.inputComment = new Common.UI.InputField({
                el          : $markup.findById('#id-info-comment'),
                style       : 'width: 200px;',
                placeHolder : this.txtAddText,
                validateOnBlur: false
            }).on('keydown:before', keyDownBefore);

            // modify info
            this.lblModifyDate = $markup.findById('#id-info-modify-date');
            this.lblModifyBy = $markup.findById('#id-info-modify-by');

            // creation info
            this.lblDate = $markup.findById('#id-info-date');
            this.lblApplication = $markup.findById('#id-info-appname');
            this.tblAuthor = $markup.findById('#id-info-author table');
            this.trAuthor = $markup.findById('#id-info-add-author').closest('tr');
            this.authorTpl = '<tr><td><div style="display: inline-block;width: 200px;"><input type="text" spellcheck="false" class="form-control" readonly="true" value="{0}" ></div><div class="close img-commonctrl"></div></td></tr>';

            this.tblAuthor.on('click', function(e) {
                var btn = $markup.find(e.target);
                if (btn.hasClass('close') && !btn.hasClass('disabled')) {
                    var el = btn.closest('tr'),
                        idx = me.tblAuthor.find('tr').index(el);
                    el.remove();
                    me.authors.splice(idx, 1);
                    me.updateScroller(true);
                }
            });

            this.inputAuthor = new Common.UI.InputField({
                el          : $markup.findById('#id-info-add-author'),
                style       : 'width: 200px;',
                validateOnBlur: false,
                placeHolder: this.txtAddAuthor
            }).on('changed:after', function(input, newValue, oldValue, e) {
                if (newValue == oldValue) return;

                var val = newValue.trim();
                if (!!val && val !== oldValue.trim()) {
                    var isFromApply = e && e.relatedTarget && (e.relatedTarget.id == 'fminfo-btn-apply');
                    val.split(/\s*[,;]\s*/).forEach(function(item){
                        var str = item.trim();
                        if (str) {
                            me.authors.push(item);
                            if (!isFromApply) {
                                var div = $(Common.Utils.String.format(me.authorTpl, Common.Utils.String.htmlEncode(str)));
                                me.trAuthor.before(div);
                                me.updateScroller();
                            }
                        }
                    });
                    !isFromApply && me.inputAuthor.setValue('');
                }
            }).on('keydown:before', keyDownBefore);

            this.btnApply = new Common.UI.Button({
                el: $markup.findById('#fminfo-btn-apply')
            });
            this.btnApply.on('click', _.bind(this.applySettings, this));

            this.pnlInfo = $markup.find('.flex-settings').addBack().filter('.flex-settings');
            this.pnlApply = $markup.findById('#fms-flex-apply');

            this.rendered = true;

            this.updateInfo(this.doc);

            this.$el = $(node).html($markup);
            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.pnlInfo,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            Common.NotificationCenter.on({
                'window:resize': function() {
                    me.isVisible() && me.updateScroller();
                }
            });

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);

            this.updateFileInfo();
            this.scroller && this.scroller.scrollTop(0);
            this.updateScroller();
        },

        hide: function() {
            Common.UI.BaseView.prototype.hide.call(this,arguments);
        },

        updateScroller: function(destroy) {
            if (this.scroller) {
                this.scroller.update(destroy ? {} : undefined);
                this.pnlInfo.toggleClass('bordered', this.scroller.isVisible());
            }
        },

        updateInfo: function(doc) {
            this.doc = doc;
            if (!this.rendered)
                return;

            var visible = false;
            doc = doc || {};
            if (doc.info) {
                // server info
                if (doc.info.folder )
                    this.lblPlacement.text( doc.info.folder );
                visible = this._ShowHideInfoItem(this.lblPlacement, doc.info.folder!==undefined && doc.info.folder!==null) || visible;
                var value = doc.info.owner;
                if (value)
                    this.lblOwner.text(value);
                visible = this._ShowHideInfoItem(this.lblOwner, !!value) || visible;
                value = doc.info.uploaded;
                if (value)
                    this.lblUploaded.text(value);
                visible = this._ShowHideInfoItem(this.lblUploaded, !!value) || visible;
            } else
                this._ShowHideDocInfo(false);
            $('tr.divider.general', this.el)[visible?'show':'hide']();

            var appname = (this.api) ? this.api.asc_getAppProps() : null;
            if (appname) {
                appname = (appname.asc_getApplication() || '') + (appname.asc_getAppVersion() ? ' ' : '') + (appname.asc_getAppVersion() || '');
                this.lblApplication.text(appname);
            }
            this._ShowHideInfoItem(this.lblApplication, !!appname);

            this.coreProps = (this.api) ? this.api.asc_getCoreProps() : null;
            if (this.coreProps) {
                var value = this.coreProps.asc_getCreated();
                if (value)
                    this.lblDate.text(value.toLocaleString(this.mode.lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleString(this.mode.lang, {timeStyle: 'short'}));
                this._ShowHideInfoItem(this.lblDate, !!value);
            }
        },

        updateFileInfo: function() {
            if (!this.rendered)
                return;

            var me = this,
                props = (this.api) ? this.api.asc_getCoreProps() : null,
                value;

            this.coreProps = props;
            // var app = (this.api) ? this.api.asc_getAppProps() : null;
            // if (app) {
            //     value = app.asc_getTotalTime();
            //     if (value)
            //         this.lblEditTime.text(value + ' ' + this.txtMinutes);
            // }
            // this._ShowHideInfoItem(this.lblEditTime, !!value);

            if (props) {
                var visible = false;
                value = props.asc_getModified();
                if (value)
                    this.lblModifyDate.text(value.toLocaleString(this.mode.lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleString(this.mode.lang, {timeStyle: 'short'}));
                visible = this._ShowHideInfoItem(this.lblModifyDate, !!value) || visible;
                value = props.asc_getLastModifiedBy();
                if (value)
                    this.lblModifyBy.text(AscCommon.UserInfoParser.getParsedName(value));
                visible = this._ShowHideInfoItem(this.lblModifyBy, !!value) || visible;
                $('tr.divider.modify', this.el)[visible?'show':'hide']();

                value = props.asc_getTitle();
                this.inputTitle.setValue(value || '');
                value = props.asc_getSubject();
                this.inputSubject.setValue(value || '');
                value = props.asc_getDescription();
                this.inputComment.setValue(value || '');

                this.inputAuthor.setValue('');
                this.tblAuthor.find('tr:not(:last-of-type)').remove();
                this.authors = [];
                value = props.asc_getCreator();//"123\"\"\"\<\>,456";
                value && value.split(/\s*[,;]\s*/).forEach(function(item) {
                    var div = $(Common.Utils.String.format(me.authorTpl, Common.Utils.String.htmlEncode(item)));
                    me.trAuthor.before(div);
                    me.authors.push(item);
                });
                this.tblAuthor.find('.close').toggleClass('hidden', !this.mode.isEdit);
                !this.mode.isEdit && this._ShowHideInfoItem(this.tblAuthor, !!this.authors.length);
            }
            this.SetDisabled();
        },

        _ShowHideInfoItem: function(el, visible) {
            el.closest('tr')[visible?'show':'hide']();
            return visible;
        },

        _ShowHideDocInfo: function(visible) {
            this._ShowHideInfoItem(this.lblPlacement, visible);
            this._ShowHideInfoItem(this.lblOwner, visible);
            this._ShowHideInfoItem(this.lblUploaded, visible);
        },

        setMode: function(mode) {
            this.mode = mode;
            this.inputAuthor.setVisible(mode.isEdit);
            this.pnlApply.toggleClass('hidden', !mode.isEdit);
            this.tblAuthor.find('.close').toggleClass('hidden', !mode.isEdit);
            if (!mode.isEdit) {
                this.inputTitle._input.attr('placeholder', '');
                this.inputSubject._input.attr('placeholder', '');
                this.inputComment._input.attr('placeholder', '');
                this.inputAuthor._input.attr('placeholder', '');
            }
            this.SetDisabled();
            return this;
        },

        setApi: function(o) {
            this.api = o;
            this.api.asc_registerCallback('asc_onLockCore',  _.bind(this.onLockCore, this));
            this.updateInfo(this.doc);
            return this;
        },

        onLockCore: function(lock) {
            this._locked = lock;
            this.updateFileInfo();
        },

        SetDisabled: function() {
            var disable = !this.mode.isEdit || this._locked;
            this.inputTitle.setDisabled(disable);
            this.inputSubject.setDisabled(disable);
            this.inputComment.setDisabled(disable);
            this.inputAuthor.setDisabled(disable);
            this.tblAuthor.find('.close').toggleClass('disabled', this._locked);
            this.tblAuthor.toggleClass('disabled', disable);
            this.btnApply.setDisabled(this._locked);
        },

        applySettings: function() {
            if (this.coreProps && this.api) {
                this.coreProps.asc_putTitle(this.inputTitle.getValue());
                this.coreProps.asc_putSubject(this.inputSubject.getValue());
                this.coreProps.asc_putDescription(this.inputComment.getValue());
                this.coreProps.asc_putCreator(this.authors.join(';'));
                this.api.asc_setCoreProps(this.coreProps);
            }
            this.menu.hide();
        },

        txtPlacement: 'Location',
        txtOwner: 'Owner',
        txtUploaded: 'Uploaded',
        txtAppName: 'Application',
        txtTitle: 'Title',
        txtSubject: 'Subject',
        txtComment: 'Comment',
        txtModifyDate: 'Last Modified',
        txtModifyBy: 'Last Modified By',
        txtCreated: 'Created',
        txtAuthor: 'Author',
        txtAddAuthor: 'Add Author',
        txtAddText: 'Add Text',
        txtMinutes: 'min',
        okButtonText: 'Apply'
    }, SSE.Views.FileMenuPanels.DocumentInfo || {}));

    SSE.Views.FileMenuPanels.DocumentRights = Common.UI.BaseView.extend(_.extend({
        el: '#panel-rights',
        menu: undefined,

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);
            this.rendered = false;

            this.template = _.template([
                '<table class="main" style="margin: 30px 0;">',
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

        render: function(node) {
            var $markup = $(this.template());

            this.cntRights = $markup.findById('#id-info-rights');
            this.btnEditRights = new Common.UI.Button({
                el: $markup.findById('#id-info-btn-edit')
            });
            this.btnEditRights.on('click', _.bind(this.changeAccessRights, this));

            this.rendered = true;

            this.updateInfo(this.doc);

            this.$el = $(node).html($markup);
            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.$el,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            Common.NotificationCenter.on('collaboration:sharingupdate', this.updateSharingSettings.bind(this));
            Common.NotificationCenter.on('collaboration:sharingdeny', this.onLostEditRights.bind(this));

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.scroller && this.scroller.update();
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
                this._ShowHideInfoItem('edit-rights', (!!this.sharingSettingsUrl && this.sharingSettingsUrl.length || this.mode.canRequestSharingSettings) && this._readonlyRights!==true);
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
            this.mode = mode;
            this.sharingSettingsUrl = mode.sharingSettingsUrl;
            return this;
        },

        changeAccessRights: function(btn,event,opts) {
            Common.NotificationCenter.trigger('collaboration:sharing');
        },

        updateSharingSettings: function(rights) {
            this._ShowHideInfoItem('rights', this.doc.info.sharingSettings!==undefined && this.doc.info.sharingSettings!==null && this.doc.info.sharingSettings.length>0);
            this.cntRights.html(this.templateRights({users: this.doc.info.sharingSettings}));
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
                '<div id="id-help-contents" style="position: absolute; width:220px; top: 0; bottom: 0;" class="no-padding"></div>',
                '<div id="id-help-frame" style="position: absolute; left: 220px; top: 0; right: 0; bottom: 0;" class="no-padding"></div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
            this.urlPref = 'resources/help/{{DEFAULT_LANG}}/';

            this.en_data = [
                {"src": "ProgramInterface/ProgramInterface.htm", "name": "Introducing Spreadsheet Editor user interface", "headername": "Program Interface"},
                {"src": "ProgramInterface/FileTab.htm", "name": "File tab"},
                {"src": "ProgramInterface/HomeTab.htm", "name": "Home Tab"},
                {"src": "ProgramInterface/InsertTab.htm", "name": "Insert tab"},
                {"src": "ProgramInterface/PluginsTab.htm", "name": "Plugins tab"},
                {"src": "UsageInstructions/OpenCreateNew.htm", "name": "Create a new spreadsheet or open an existing one", "headername": "Basic operations" },
                {"src": "UsageInstructions/CopyPasteData.htm", "name": "Cut/copy/paste data" },
                {"src": "UsageInstructions/UndoRedo.htm", "name": "Undo/redo your actions"},
                {"src": "UsageInstructions/ManageSheets.htm", "name": "Manage sheets", "headername": "Operations with sheets"},
                {"src": "UsageInstructions/FontTypeSizeStyle.htm", "name": "Set font type, size, style, and colors", "headername": "Cell text formatting" },
                {"src": "UsageInstructions/AddHyperlinks.htm", "name": "Add hyperlinks" },
                {"src": "UsageInstructions/ClearFormatting.htm", "name": "Clear text, format in a cell, copy cell format"},
                {"src": "UsageInstructions/AddBorders.htm", "name": "Add borders", "headername": "Editing cell properties"},
                {"src": "UsageInstructions/AlignText.htm", "name": "Align data in cells"},
                {"src": "UsageInstructions/MergeCells.htm", "name": "Merge cells" },
                {"src": "UsageInstructions/ChangeNumberFormat.htm", "name": "Change number format" },
                {"src": "UsageInstructions/InsertDeleteCells.htm", "name": "Manage cells, rows, and columns", "headername": "Editing rows/columns" },
                {"src": "UsageInstructions/SortData.htm", "name": "Sort and filter data" },
                {"src": "UsageInstructions/InsertFunction.htm", "name": "Insert function", "headername": "Work with functions"},
                {"src": "UsageInstructions/UseNamedRanges.htm", "name": "Use named ranges"},
                {"src": "UsageInstructions/InsertImages.htm", "name": "Insert images", "headername": "Operations on objects"},
                {"src": "UsageInstructions/InsertChart.htm", "name": "Insert chart"},
                {"src": "UsageInstructions/InsertAutoshapes.htm", "name": "Insert and format autoshapes" },
                {"src": "UsageInstructions/InsertTextObjects.htm", "name": "Insert text objects" },
                {"src": "UsageInstructions/ManipulateObjects.htm", "name": "Manipulate objects" },
                {"src": "UsageInstructions/InsertEquation.htm", "name": "Insert equations", "headername": "Math equations"},
                {"src": "HelpfulHints/CollaborativeEditing.htm", "name": "Collaborative spreadsheet editing", "headername": "Spreadsheet co-editing"},
                {"src": "UsageInstructions/ViewDocInfo.htm", "name": "View file information", "headername": "Tools and settings"},
                {"src": "UsageInstructions/SavePrintDownload.htm", "name": "Save/print/download your spreadsheet"},
                {"src": "HelpfulHints/AdvancedSettings.htm", "name": "Advanced settings of Spreadsheet Editor"},
                {"src": "HelpfulHints/Navigation.htm", "name": "View settings and navigation tools"},
                {"src": "HelpfulHints/Search.htm", "name": "Search and replace functions"},
                {"src": "HelpfulHints/About.htm", "name": "About Spreadsheet Editor", "headername": "Helpful hints"},
                {"src": "HelpfulHints/SupportedFormats.htm", "name": "Supported formats of spreadsheets"},
                {"src": "HelpfulHints/KeyboardShortcuts.htm", "name": "Keyboard shortcuts"}
            ];

            if (Common.Utils.isIE) {
                window.onhelp = function () { return false; }
            }
        },

        render: function() {
            var me = this;
            this.$el.html(this.template());

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
                lang = lang.split(/[\-\_]/)[0];
                var config = {
                    dataType: 'json',
                    error: function () {
                        if ( me.urlPref.indexOf('resources/help/{{DEFAULT_LANG}}/')<0 ) {
                            me.urlPref = 'resources/help/{{DEFAULT_LANG}}/';
                            store.url = 'resources/help/{{DEFAULT_LANG}}/Contents.json';
                            store.fetch(config);
                        } else {
                            me.urlPref = 'resources/help/{{DEFAULT_LANG}}/';
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

    SSE.Views.FileMenuPanels.ProtectDoc = Common.UI.BaseView.extend(_.extend({
        el: '#panel-protect',
        menu: undefined,

        template: _.template([
            '<label id="id-fms-lbl-protect-header" style="font-size: 18px;"><%= scope.strProtect %></label>',
            '<div id="id-fms-password">',
                '<label class="header"><%= scope.strEncrypt %></label>',
                '<div id="fms-btn-add-pwd" style="width:190px;"></div>',
                '<table id="id-fms-view-pwd" cols="2" width="300">',
                    '<tr>',
                        '<td colspan="2"><label style="cursor: default;"><%= scope.txtEncrypted %></label></td>',
                    '</tr>',
                    '<tr>',
                        '<td><div id="fms-btn-change-pwd" style="width:190px;"></div></td>',
                        '<td align="right"><div id="fms-btn-delete-pwd" style="width:190px; margin-left:20px;"></div></td>',
                    '</tr>',
                '</table>',
            '</div>',
            '<div id="id-fms-signature">',
                '<label class="header"><%= scope.strSignature %></label>',
                '<div id="fms-btn-invisible-sign" style="width:190px; margin-bottom: 20px;"></div>',
                '<div id="id-fms-signature-view"></div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;

            var me = this;
            this.templateSignature = _.template([
                '<table cols="2" width="300" class="<% if (!hasRequested && !hasSigned) { %>hidden<% } %>"">',
                    '<tr>',
                        '<td colspan="2"><label style="cursor: default;"><%= tipText %></label></td>',
                    '</tr>',
                    '<tr>',
                        '<td><label class="link signature-view-link">' + me.txtView + '</label></td>',
                        '<td align="right"><label class="link signature-edit-link <% if (!hasSigned) { %>hidden<% } %>">' + me.txtEdit + '</label></td>',
                    '</tr>',
                '</table>'
            ].join(''));
        },

        render: function() {
            this.$el.html(this.template({scope: this}));

            var protection = SSE.getController('Common.Controllers.Protection').getView();

            this.btnAddPwd = protection.getButton('add-password');
            this.btnAddPwd.render(this.$el.find('#fms-btn-add-pwd'));
            this.btnAddPwd.on('click', _.bind(this.closeMenu, this));

            this.btnChangePwd = protection.getButton('change-password');
            this.btnChangePwd.render(this.$el.find('#fms-btn-change-pwd'));
            this.btnChangePwd.on('click', _.bind(this.closeMenu, this));

            this.btnDeletePwd = protection.getButton('del-password');
            this.btnDeletePwd.render(this.$el.find('#fms-btn-delete-pwd'));
            this.btnDeletePwd.on('click', _.bind(this.closeMenu, this));

            this.cntPassword = $('#id-fms-password');
            this.cntPasswordView = $('#id-fms-view-pwd');

            this.btnAddInvisibleSign = protection.getButton('signature');
            this.btnAddInvisibleSign.render(this.$el.find('#fms-btn-invisible-sign'));
            this.btnAddInvisibleSign.on('click', _.bind(this.closeMenu, this));

            this.cntSignature = $('#id-fms-signature');
            this.cntSignatureView = $('#id-fms-signature-view');
            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.$el,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            this.$el.on('click', '.signature-edit-link', _.bind(this.onEdit, this));
            this.$el.on('click', '.signature-view-link', _.bind(this.onView, this));

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.updateSignatures();
            this.updateEncrypt();
            this.scroller && this.scroller.update();
        },

        setMode: function(mode) {
            this.mode = mode;
            this.cntSignature.toggleClass('hidden', !this.mode.isSignatureSupport);
            this.cntPassword.toggleClass('hidden', !this.mode.isPasswordSupport);
        },

        setApi: function(o) {
            this.api = o;
            return this;
        },

        closeMenu: function() {
            this.menu && this.menu.hide();
        },

        onEdit: function() {
            this.menu && this.menu.hide();

            var me = this;
            Common.UI.warning({
                title: this.notcriticalErrorTitle,
                msg: this.txtEditWarning,
                buttons: ['ok', 'cancel'],
                primary: 'ok',
                callback: function(btn) {
                    if (btn == 'ok') {
                        me.api.asc_RemoveAllSignatures();
                    }
                }
            });

        },

        onView: function() {
            this.menu && this.menu.hide();
            SSE.getController('RightMenu').rightmenu.SetActivePane(Common.Utils.documentSettingsType.Signature, true);
        },

        updateSignatures: function(){
            var requested = this.api.asc_getRequestSignatures(),
                valid = this.api.asc_getSignatures(),
                hasRequested = requested && requested.length>0,
                hasValid = false,
                hasInvalid = false;

            _.each(valid, function(item, index){
                if (item.asc_getValid()==0)
                    hasValid = true;
                else
                    hasInvalid = true;
            });

            // hasRequested = true;
            // hasValid = true;
            // hasInvalid = true;

            var tipText = (hasInvalid) ? this.txtSignedInvalid : (hasValid ? this.txtSigned : "");
            if (hasRequested)
                tipText = this.txtRequestedSignatures + (tipText!="" ? "<br><br>" : "")+ tipText;

            this.cntSignatureView.html(this.templateSignature({tipText: tipText, hasSigned: (hasValid || hasInvalid), hasRequested: hasRequested}));
        },

        updateEncrypt: function() {
            this.cntPasswordView.toggleClass('hidden', this.btnAddPwd.isVisible());
        },

        strProtect: 'Protect Workbook',
        strSignature: 'With Signature',
        txtView: 'View signatures',
        txtEdit: 'Edit workbook',
        txtSigned: 'Valid signatures has been added to the workbook. The workbook is protected from editing.',
        txtSignedInvalid: 'Some of the digital signatures in workbook are invalid or could not be verified. The workbook is protected from editing.',
        txtRequestedSignatures: 'This workbook needs to be signed.',
        notcriticalErrorTitle: 'Warning',
        txtEditWarning: 'Editing will remove the signatures from the workbook.<br>Are you sure you want to continue?',
        strEncrypt: 'With Password',
        txtEncrypted: 'This workbook has been protected by password'

    }, SSE.Views.FileMenuPanels.ProtectDoc || {}));

});
