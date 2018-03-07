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
define([
    'core',
    'spreadsheeteditor/main/app/view/FileMenuPanels',
    'spreadsheeteditor/main/app/view/PrintSettings'
], function () {
    'use strict';

    SSE.Controllers.Print = Backbone.Controller.extend(_.extend({
        views: [
            'MainSettingsPrint'
        ],

        initialize: function() {
            var value = Common.localStorage.getItem("sse-print-settings-range");
            value = (value!==null) ? parseInt(value) : Asc.c_oAscPrintType.ActiveSheets;

            this.adjPrintParams = new Asc.asc_CAdjustPrint();
            this.adjPrintParams.asc_setPrintType(value);

            this._changedProps = null;

            this.addListeners({
                'MainSettingsPrint': {
                    'show': _.bind(this.onShowMainSettingsPrint, this),
                    'render:after': _.bind(this.onAfterRender, this)
                },
                'PrintSettings': {
                    'changerange': _.bind(this.onChangeRange,this)
                }
            });
        },

        onLaunch: function() {
            this.printSettings = this.createView('MainSettingsPrint');
        },

        onAfterRender: function(view) {
            this.printSettings.cmbSheet.on('selected', _.bind(this.comboSheetsChange, this, this.printSettings));
            this.printSettings.btnOk.on('click', _.bind(this.querySavePrintSettings, this));
            Common.NotificationCenter.on('print', _.bind(this.openPrintSettings, this));
            this.registerControlEvents(this.printSettings);
        },

        setApi: function(o) {
            this.api = o;
            this.api.asc_registerCallback('asc_onSheetsChanged', _.bind(this.updateSheetsInfo, this));
        },

        updateSheetsInfo: function() {
            if (this.printSettings.isVisible()) {
                this.updateSettings(this.printSettings);
            } else {
                this.isFillSheets = false;
            }
        },
        
        updateSettings: function(panel) {
            var wc = this.api.asc_getWorksheetsCount(), i = -1;
            var items = [];

            while (++i < wc) {
                if (!this.api.asc_isWorksheetHidden(i)) {
                    items.push({
                        displayValue:this.api.asc_getWorksheetName(i),
                        value: i
                    });
                }
            }

            panel.cmbSheet.store.reset(items);
            var item = panel.cmbSheet.store.findWhere({value: panel.cmbSheet.getValue()}) ||
                       panel.cmbSheet.store.findWhere({value: this.api.asc_getActiveWorksheetIndex()});
            if (item) {
                panel.cmbSheet.setValue(item.get('value'));
            }
        },

        comboSheetsChange: function(panel, combo, record) {
            this.fillPageOptions(panel, this._changedProps[record.value] ? this._changedProps[record.value] : this.api.asc_getPageOptions(record.value));
        },

        fillPageOptions: function(panel, props) {
            var opt = props.asc_getPageSetup();

            var item = panel.cmbPaperOrientation.store.findWhere({value: opt.asc_getOrientation()});
            if (item) panel.cmbPaperOrientation.setValue(item.get('value'));

            var w = opt.asc_getWidth();
            var h = opt.asc_getHeight();

            item = panel.cmbPaperSize.store.findWhere({value: w+'|'+h});
            if (item)
                panel.cmbPaperSize.setValue(item.get('value'));
            else
                panel.cmbPaperSize.setValue('Custom (' + w +' x ' + h);

            var fitwidth = opt.asc_getFitToWidth(),
                fitheight = opt.asc_getFitToHeight();
            if (!fitwidth && !fitheight) panel.cmbLayout.setValue(0);
            else if (fitwidth && fitheight) panel.cmbLayout.setValue(1);
            else if (fitwidth && !fitheight) panel.cmbLayout.setValue(2);
            else panel.cmbLayout.setValue(3);

            item = panel.cmbPaperOrientation.store.findWhere({value: opt.asc_getOrientation()});
            if (item) panel.cmbPaperOrientation.setValue(item.get('value'));

            opt = props.asc_getPageMargins();
            panel.spnMarginLeft.setValue(Common.Utils.Metric.fnRecalcFromMM(opt.asc_getLeft()), true);
            panel.spnMarginTop.setValue(Common.Utils.Metric.fnRecalcFromMM(opt.asc_getTop()), true);
            panel.spnMarginRight.setValue(Common.Utils.Metric.fnRecalcFromMM(opt.asc_getRight()), true);
            panel.spnMarginBottom.setValue(Common.Utils.Metric.fnRecalcFromMM(opt.asc_getBottom()), true);

            panel.chPrintGrid.setValue(props.asc_getGridLines(), true);
            panel.chPrintRows.setValue(props.asc_getHeadings(), true);
        },

        fillPrintOptions: function(props) {
            this.printSettingsDlg.setRange(props.asc_getPrintType());
            this.onChangeRange();
        },

        onChangeRange: function() {
            var printtype = this.printSettingsDlg.getRange(),
                store = this.printSettingsDlg.cmbSheet.store,
                item = (printtype !== Asc.c_oAscPrintType.EntireWorkbook) ? store.findWhere({value: this.api.asc_getActiveWorksheetIndex()}) : store.at(0);
            if (item) {
                this.printSettingsDlg.cmbSheet.setValue(item.get('value'));
                this.comboSheetsChange(this.printSettingsDlg, this.printSettingsDlg.cmbSheet, item.toJSON());
            }
            this.printSettingsDlg.cmbSheet.setDisabled(printtype !== Asc.c_oAscPrintType.EntireWorkbook);
        },

        getPageOptions: function(panel) {
            var props = new Asc.asc_CPageOptions();
            props.asc_setGridLines(panel.chPrintGrid.getValue() == 'indeterminate' ? undefined : panel.chPrintGrid.getValue()=='checked'?1:0);
            props.asc_setHeadings(panel.chPrintRows.getValue() == 'indeterminate' ? undefined : panel.chPrintRows.getValue()=='checked'?1:0);

            var opt = new Asc.asc_CPageSetup();
            opt.asc_setOrientation(panel.cmbPaperOrientation.getValue() == '-' ? undefined : panel.cmbPaperOrientation.getValue());

            var pagew = /^\d{3}\.?\d*/.exec(panel.cmbPaperSize.getValue());
            var pageh = /\d{3}\.?\d*$/.exec(panel.cmbPaperSize.getValue());

            opt.asc_setWidth(!pagew ? undefined : parseFloat(pagew[0]));
            opt.asc_setHeight(!pageh? undefined : parseFloat(pageh[0]));


            var value = panel.cmbLayout.getValue();
            opt.asc_setFitToWidth(value==1 || value==2);
            opt.asc_setFitToHeight(value==1 || value==3);

            props.asc_setPageSetup(opt);

            opt = new Asc.asc_CPageMargins();
            opt.asc_setLeft(panel.spnMarginLeft.getValue() == '-' ? undefined : Common.Utils.Metric.fnRecalcToMM(panel.spnMarginLeft.getNumberValue()));    // because 1.91*10=19.0999999...
            opt.asc_setTop(panel.spnMarginTop.getValue() == '-' ? undefined : Common.Utils.Metric.fnRecalcToMM(panel.spnMarginTop.getNumberValue()));
            opt.asc_setRight(panel.spnMarginRight.getValue() == '-' ? undefined : Common.Utils.Metric.fnRecalcToMM(panel.spnMarginRight.getNumberValue()));
            opt.asc_setBottom(panel.spnMarginBottom.getValue() == '-' ? undefined : Common.Utils.Metric.fnRecalcToMM(panel.spnMarginBottom.getNumberValue()));

            props.asc_setPageMargins(opt);

            return props;
        },

        savePageOptions: function(panel) {
            var wc = this.api.asc_getWorksheetsCount(),
                index = -1;

            while (++index < wc) {
                if (this._changedProps[index])
                    this.api.asc_setPageOptions(this._changedProps[index], index);
            }
        },

        onShowMainSettingsPrint: function() {
            this._changedProps = [];

            if (!this.isFillSheets) {
                this.isFillSheets = true;
                this.updateSettings(this.printSettings);
            }

            var item = this.printSettings.cmbSheet.store.findWhere({value: this.api.asc_getActiveWorksheetIndex()});
            if (item) {
                this.printSettings.cmbSheet.setValue(item.get('value'));
                this.comboSheetsChange(this.printSettings, this.printSettings.cmbSheet, item.toJSON());
            }
        },

        openPrintSettings: function(btn) {
            if (this.api) {
                this.printSettingsDlg = (new SSE.Views.PrintSettings({
                    handler: _.bind(this.resultPrintSettings,this),
                    afterrender: _.bind(function() {
                        this._changedProps = [];
                        this.updateSettings(this.printSettingsDlg);
                        this.printSettingsDlg.cmbSheet.on('selected', _.bind(this.comboSheetsChange, this, this.printSettingsDlg));
                        this.fillPrintOptions(this.adjPrintParams);
                        this.registerControlEvents(this.printSettingsDlg);
                    },this)
                }));
                this.printSettingsDlg.show();
            }
        },

        resultPrintSettings: function(result, value) {
            var view = SSE.getController('Toolbar').getView('Toolbar');
            if (result == 'ok') {
                if ( this.checkMargins(this.printSettingsDlg) ) {
                    this.savePageOptions(this.printSettingsDlg);

                    var printtype = this.printSettingsDlg.getRange();
                    this.adjPrintParams.asc_setPrintType(printtype);
                    Common.localStorage.setItem("sse-print-settings-range", printtype);

                    this.api.asc_Print(this.adjPrintParams, Common.Utils.isChrome || Common.Utils.isSafari || Common.Utils.isOpera);

                    Common.component.Analytics.trackEvent('Print');
                    Common.component.Analytics.trackEvent('ToolBar', 'Print');
                    Common.NotificationCenter.trigger('edit:complete', view);
                } else
                    return true;
            } else
                Common.NotificationCenter.trigger('edit:complete', view);
        },

        querySavePrintSettings: function() {
            if ( this.checkMargins(this.printSettings) ) {
                this.savePageOptions(this.printSettings);
                this.printSettings.applySettings();
            }
        },

        checkMargins: function(panel) {
            if (panel.cmbPaperOrientation.getValue() == Asc.c_oAscPageOrientation.PagePortrait) {
                var pagewidth = /^\d{3}\.?\d*/.exec(panel.cmbPaperSize.getValue());
                var pageheight = /\d{3}\.?\d*$/.exec(panel.cmbPaperSize.getValue());
            } else {
                pageheight = /^\d{3}\.?\d*/.exec(panel.cmbPaperSize.getValue());
                pagewidth = /\d{3}\.?\d*$/.exec(panel.cmbPaperSize.getValue());
            }
            pagewidth = parseFloat(pagewidth[0]);
            pageheight = parseFloat(pageheight[0]);

            var ml = Common.Utils.Metric.fnRecalcToMM(panel.spnMarginLeft.getNumberValue());
            var mr = Common.Utils.Metric.fnRecalcToMM(panel.spnMarginRight.getNumberValue());
            var mt = Common.Utils.Metric.fnRecalcToMM(panel.spnMarginTop.getNumberValue());
            var mb = Common.Utils.Metric.fnRecalcToMM(panel.spnMarginBottom.getNumberValue());

            var result = false;
            if (ml > pagewidth) result = 'left'; else
            if (mr > pagewidth-ml) result = 'right'; else
            if (mt > pageheight) result = 'top'; else
            if (mb > pageheight-mt) result = 'bottom';

            if (result) {
                Common.UI.warning({
                    title: this.textWarning,
                    msg: this.warnCheckMargings,
                    callback: function(btn,text) {
                        switch(result) {
                            case 'left':    panel.spnMarginLeft.$el.focus(); return;
                            case 'right':   panel.spnMarginRight.$el.focus(); return;
                            case 'top':     panel.spnMarginTop.$el.focus(); return;
                            case 'bottom':  panel.spnMarginBottom.$el.focus(); return;
                        }
                    }
                });

                return false;
            }

            return true;
        },

        registerControlEvents: function(panel) {
            panel.cmbPaperSize.on('selected', _.bind(this.propertyChange, this, panel));
            panel.cmbPaperOrientation.on('selected', _.bind(this.propertyChange, this, panel));
            panel.cmbLayout.on('selected', _.bind(this.propertyChange, this, panel));
            panel.spnMarginTop.on('change', _.bind(this.propertyChange, this, panel));
            panel.spnMarginBottom.on('change', _.bind(this.propertyChange, this, panel));
            panel.spnMarginLeft.on('change', _.bind(this.propertyChange, this, panel));
            panel.spnMarginRight.on('change', _.bind(this.propertyChange, this, panel));
            panel.chPrintGrid.on('change', _.bind(this.propertyChange, this, panel));
            panel.chPrintRows.on('change', _.bind(this.propertyChange, this, panel));
        },

        propertyChange: function(panel) {
            if (this._changedProps) {
                this._changedProps[panel.cmbSheet.getValue()] = this.getPageOptions(panel);
            }
        },
        
        warnCheckMargings:      'Margins are incorrect',
        strAllSheets:           'All Sheets',
        textWarning: 'Warning'
    }, SSE.Controllers.Print || {}));
});