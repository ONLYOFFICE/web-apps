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
    'core',
    'spreadsheeteditor/main/app/view/FileMenuPanels',
    'spreadsheeteditor/main/app/view/PrintSettings'
], function () {
    'use strict';

    SSE.Controllers.Print = Backbone.Controller.extend(_.extend({
        views: [
            'MainSettingsPrint',
            'PrintWithPreview'
        ],

        initialize: function() {
            var value = Common.localStorage.getItem("sse-print-settings-range");
            value = (value!==null) ? parseInt(value) : Asc.c_oAscPrintType.ActiveSheets;
            this._currentPrintType = value;

            this.adjPrintParams = new Asc.asc_CAdjustPrint();
            this.adjPrintParams.asc_setPrintType(value);

            this._changedProps = null;
            this._originalPageSettings = null;

            this._navigationPreview = {
                pageCount: false,
                currentPage: 0
            };

            this._isPreviewVisible = false;

            this.addListeners({
                'PrintWithPreview': {
                    'show': _.bind(this.onShowMainSettingsPrint, this),
                    'render:after': _.bind(this.onAfterRender, this),
                    'changerange': _.bind(this.onChangeRange, this, false),
                    'openheader': _.bind(this.onOpenHeaderSettings, this),
                },
                'PrintSettings': {
                    'changerange': _.bind(this.onChangeRange, this, true)
                }
            });
            Common.NotificationCenter.on('print', _.bind(this.openPrintSettings, this, 'print'));
            Common.NotificationCenter.on('download:settings', _.bind(this.openPrintSettings, this, 'download'));
        },

        onLaunch: function() {
            this.printSettings = this.createView('PrintWithPreview');
        },

        onAfterRender: function(view) {
            var me = this;
            this.printSettings.menu.on('menu:hide', _.bind(this.onHidePrintMenu, this));
            this.printSettings.cmbSheet.on('selected', _.bind(function (combo, record) {
                this.comboSheetsChange(this.printSettings, combo, record);
                if (this._isPreviewVisible) {
                    this.notUpdateSheetSettings = true;
                    this.api.asc_drawPrintPreview(undefined, record.value);
                }
            }, this));
            this.printSettings.btnsSave.forEach(function (btn) {
                btn.on('click', _.bind(me.querySavePrintSettings, me, false));
            });
            this.printSettings.btnsPrint.forEach(function (btn) {
                btn.on('click', _.bind(me.querySavePrintSettings, me, true));
            });
            this.printSettings.btnPrevPage.on('click', _.bind(this.onChangePreviewPage, this, false));
            this.printSettings.btnNextPage.on('click', _.bind(this.onChangePreviewPage, this, true));
            this.printSettings.txtNumberPage.on({
                'keypress:after':  _.bind(this.onKeypressPageNumber, this),
                'keyup:after': _.bind(this.onKeyupPageNumber, this)
            });
            this.printSettings.txtNumberPage.cmpEl.find('input').on('blur', _.bind(this.onBlurPageNumber, this));
            this.printSettings.chIgnorePrintArea.on('change', _.bind(this.updatePreview, this, true));

            this.fillComponents(this.printSettings);
            this.registerControlEvents(this.printSettings);

            Common.NotificationCenter.on('window:resize', _.bind(function () {
                if (this._isPreviewVisible) {
                    this.notUpdateSheetSettings = true;
                    this.api.asc_drawPrintPreview(this._navigationPreview.currentPage);
                }
            }, this));

            var eventname = (/Firefox/i.test(navigator.userAgent))? 'DOMMouseScroll' : 'mousewheel';
            this.printSettings.$previewBox.on(eventname, _.bind(this.onPreviewWheel, this));
        },

        setMode: function (mode) {
            this.mode = mode;
            this.printSettings && this.printSettings.setMode(mode);
        },

        setApi: function(o) {
            this.api = o;
            this.api.asc_registerCallback('asc_onSheetsChanged', _.bind(this.updateSheetsInfo, this));
            this.api.asc_registerCallback('asc_onPrintPreviewSheetChanged', _.bind(this.onApiChangePreviewSheet, this));
            this.api.asc_registerCallback('asc_onPrintPreviewPageChanged', _.bind(this.onApiChangePreviewPage, this));
            this.api.asc_registerCallback('asc_onPrintPreviewSheetDataChanged', _.bind(this.onApiPreviewSheetDataChanged, this));

            return this;
        },

        updateSheetsInfo: function() {
            if (this.printSettings.isVisible()) {
                this.updateSettings(this.printSettings);
                this.printSettings.cmbSheet.store.each(function (item) {
                    var sheetIndex = item.get('value');
                    if (!this._changedProps[sheetIndex]) {
                        this._changedProps[sheetIndex] = this.api.asc_getPageOptions(sheetIndex, true, true);
                    }
                }, this);
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
                panel.updateActiveSheet && panel.updateActiveSheet(item.get('displayValue'));
            }
        },

        comboSheetsChange: function(panel, combo, record) {
            var currentSheet = record.value;
            this.fillPageOptions(panel, this._changedProps[currentSheet] ? this._changedProps[currentSheet] : this.api.asc_getPageOptions(currentSheet, true), currentSheet);
        },

        fillPageOptions: function(panel, props, sheet) {
            var opt = props.asc_getPageSetup();
            this._originalPageSettings = opt;

            var item = panel.cmbPaperOrientation.store.findWhere({value: opt.asc_getOrientation()});
            if (item) panel.cmbPaperOrientation.setValue(item.get('value'));

            var w = opt.asc_getWidth();
            var h = opt.asc_getHeight();

            var store = panel.cmbPaperSize.store;
            item = null;
            for (var i=0; i<store.length; i++) {
                var rec = store.at(i),
                    value = rec.get('value'),
                    pagewidth = parseFloat(/^\d{3}\.?\d*/.exec(value)),
                    pageheight = parseFloat(/\d{3}\.?\d*$/.exec(value));
                if (Math.abs(pagewidth - w) < 0.1 && Math.abs(pageheight - h) < 0.1) {
                    item = rec;
                    break;
                }
            }
            if (item)
                panel.cmbPaperSize.setValue(item.get('value'));
            else
                panel.cmbPaperSize.setValue(this.txtCustom + ' (' + parseFloat(Common.Utils.Metric.fnRecalcFromMM(w).toFixed(2)) + Common.Utils.Metric.getCurrentMetricName() + ' x ' +
                                                         parseFloat(Common.Utils.Metric.fnRecalcFromMM(h).toFixed(2)) + Common.Utils.Metric.getCurrentMetricName() + ')');

            this.fitWidth = opt.asc_getFitToWidth();
            this.fitHeight = opt.asc_getFitToHeight();
            this.fitScale = opt.asc_getScale();
            this.setScaling(panel, this.fitWidth, this.fitHeight, this.fitScale);

            item = panel.cmbPaperOrientation.store.findWhere({value: opt.asc_getOrientation()});
            if (item) panel.cmbPaperOrientation.setValue(item.get('value'));

            opt = props.asc_getPageMargins();
            panel.spnMarginLeft.setValue(Common.Utils.Metric.fnRecalcFromMM(opt.asc_getLeft()), true);
            panel.spnMarginTop.setValue(Common.Utils.Metric.fnRecalcFromMM(opt.asc_getTop()), true);
            panel.spnMarginRight.setValue(Common.Utils.Metric.fnRecalcFromMM(opt.asc_getRight()), true);
            panel.spnMarginBottom.setValue(Common.Utils.Metric.fnRecalcFromMM(opt.asc_getBottom()), true);

            panel.chPrintGrid.setValue(props.asc_getGridLines(), true);
            panel.chPrintRows.setValue(props.asc_getHeadings(), true);

            var value = props.asc_getPrintTitlesHeight();
            panel.txtRangeTop.setValue((value) ? value : '');
            this._noApply = true;
            panel.txtRangeTop.checkValidate();
            this._noApply = false;
            panel.dataRangeTop = value;

            value = props.asc_getPrintTitlesWidth();
            panel.txtRangeLeft.setValue((value) ? value : '');
            this._noApply = true;
            panel.txtRangeLeft.checkValidate();
            this._noApply = false;
            panel.dataRangeLeft = value;

            value = (this.api.asc_getActiveWorksheetIndex()==sheet);
            if (panel.btnPresetsTop.menu.items[0].value == 'select') {
                panel.btnPresetsTop.menu.items[0].setVisible(value);
                panel.txtRangeTop.setBtnDisabled && panel.txtRangeTop.setBtnDisabled(!value);
            }
            if (panel.btnPresetsLeft.menu.items[0].value == 'select') {
                panel.btnPresetsLeft.menu.items[0].setVisible(value);
                panel.txtRangeLeft.setBtnDisabled && panel.txtRangeLeft.setBtnDisabled(!value);
            }

            panel.btnPresetsTop.menu.items[panel.btnPresetsTop.menu.items[0].value == 'frozen' ? 0 : 1].setDisabled(!this.api.asc_getPrintTitlesRange(Asc.c_oAscPrintTitlesRangeType.frozen, false, sheet));
            panel.btnPresetsLeft.menu.items[panel.btnPresetsLeft.menu.items[0].value == 'frozen' ? 0 : 1].setDisabled(!this.api.asc_getPrintTitlesRange(Asc.c_oAscPrintTitlesRangeType.frozen, true, sheet));
        },

        fillPrintOptions: function(props, isDlg) {
            var menu = isDlg ? this.printSettingsDlg : this.printSettings;
            menu.setRange(props.asc_getPrintType());
            menu.setIgnorePrintArea(!!props.asc_getIgnorePrintArea());
            this.onChangeRange(isDlg);
        },

        onChangeRange: function(isDlg) {
            var menu = isDlg ? this.printSettingsDlg : this.printSettings;
            var printtype = menu.getRange(),
                store = menu.cmbSheet.store,
                item = (printtype !== Asc.c_oAscPrintType.EntireWorkbook) ? store.findWhere({value: this.api.asc_getActiveWorksheetIndex()}) : store.at(0);
            if (item) {
                menu.cmbSheet.setValue(item.get('value'));
                this.comboSheetsChange(menu, menu.cmbSheet, item.toJSON());
            }
            menu.cmbSheet.setDisabled(printtype !== Asc.c_oAscPrintType.EntireWorkbook);
            menu.chIgnorePrintArea.setDisabled(printtype == Asc.c_oAscPrintType.Selection);

            if (!isDlg) {
                this.updatePreview(true);
            }
        },

        getPageOptions: function(panel, sheet) {
            var props = this._changedProps[sheet] ? this._changedProps[sheet] : new Asc.asc_CPageOptions();
            props.asc_setGridLines(panel.chPrintGrid.getValue()==='checked');
            props.asc_setHeadings(panel.chPrintRows.getValue()==='checked');

            var opt = this._changedProps[sheet] ? this._changedProps[sheet].asc_getPageSetup() : new Asc.asc_CPageSetup();
            opt.asc_setOrientation(panel.cmbPaperOrientation.getValue() == '-' ? undefined : panel.cmbPaperOrientation.getValue());

            var pagew = /^\d{3}\.?\d*/.exec(panel.cmbPaperSize.getValue());
            var pageh = /\d{3}\.?\d*$/.exec(panel.cmbPaperSize.getValue());

            opt.asc_setWidth(pagew ? parseFloat(pagew[0]) : (this._originalPageSettings ? this._originalPageSettings.asc_getWidth() : undefined));
            opt.asc_setHeight(pageh? parseFloat(pageh[0]) : (this._originalPageSettings ? this._originalPageSettings.asc_getHeight() : undefined));

            var value = panel.cmbLayout.getValue();
            if (value !== 4) {
                var fitToWidth = (value==1 || value==2) ? 1 : 0,
                    fitToHeight = (value==1 || value==3) ? 1 : 0;
                opt.asc_setFitToWidth(fitToWidth);
                opt.asc_setFitToHeight(fitToHeight);
                !fitToWidth && !fitToHeight && opt.asc_setScale(100);
                this.setScaling(panel, fitToWidth, fitToHeight, 100);
            } else {
                opt.asc_setFitToWidth(this.fitWidth);
                opt.asc_setFitToHeight(this.fitHeight);
                opt.asc_setScale(this.fitScale);
            }
            if (!this._changedProps[sheet]) {
                props.asc_setPageSetup(opt);
            }

            opt = this._changedProps[sheet] ? this._changedProps[sheet].asc_getPageMargins() : new Asc.asc_CPageMargins();
            opt.asc_setLeft(panel.spnMarginLeft.getValue() == '-' ? undefined : Common.Utils.Metric.fnRecalcToMM(panel.spnMarginLeft.getNumberValue()));    // because 1.91*10=19.0999999...
            opt.asc_setTop(panel.spnMarginTop.getValue() == '-' ? undefined : Common.Utils.Metric.fnRecalcToMM(panel.spnMarginTop.getNumberValue()));
            opt.asc_setRight(panel.spnMarginRight.getValue() == '-' ? undefined : Common.Utils.Metric.fnRecalcToMM(panel.spnMarginRight.getNumberValue()));
            opt.asc_setBottom(panel.spnMarginBottom.getValue() == '-' ? undefined : Common.Utils.Metric.fnRecalcToMM(panel.spnMarginBottom.getNumberValue()));

            if (!this._changedProps[sheet]) {
                props.asc_setPageMargins(opt);
            }

            var check = this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.PrintTitles, panel.txtRangeTop.getValue(), false) !== Asc.c_oAscError.ID.DataRangeError;
            props.asc_setPrintTitlesHeight(check ? panel.txtRangeTop.getValue() : panel.dataRangeTop);

            check = this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.PrintTitles, panel.txtRangeLeft.getValue(), false) !== Asc.c_oAscError.ID.DataRangeError;
            props.asc_setPrintTitlesWidth(check ? panel.txtRangeLeft.getValue() : panel.dataRangeLeft);

            return props;
        },

        savePageOptions: function(panel) {
            this.api.asc_savePagePrintOptions(this._changedProps);
            Common.NotificationCenter.trigger('page:settings');
        },

        onShowMainSettingsPrint: function() {
            var me = this;
            this._changedProps = [];
            this.printSettings.$previewBox.removeClass('hidden');

            if (!this.isFillSheets) {
                this.isFillSheets = true;
                this.updateSettings(this.printSettings);
            }
            this.printSettings.cmbSheet.store.each(function (item) {
                var sheetIndex = item.get('value');
                me._changedProps[sheetIndex] = me.api.asc_getPageOptions(sheetIndex, true, true);
            }, this);
            this.adjPrintParams.asc_setPageOptionsMap(this._changedProps);

            this.fillPrintOptions(this.adjPrintParams, false);

            var opts = new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86);
            opts.asc_setAdvancedOptions(this.adjPrintParams);
            var pageCount = this.api.asc_initPrintPreview('print-preview', opts);

            this.printSettings.$previewBox.toggleClass('hidden', !pageCount);
            this.printSettings.$previewEmpty.toggleClass('hidden', !!pageCount);
            if (!!pageCount) {
                this.updateNavigationButtons(0, pageCount);
                this.printSettings.txtNumberPage.checkValidate();
            }
            this._isPreviewVisible = true;
            !!pageCount && this.updatePreview();
        },

        openPrintSettings: function(type, cmp, format, asUrl) {
            if (this.printSettingsDlg && this.printSettingsDlg.isVisible()) {
                asUrl && Common.NotificationCenter.trigger('download:cancel');
                return;
            }

            if (this.api) {
                Common.UI.Menu.Manager.hideAll();
                this.asUrl = asUrl;
                this.downloadFormat = format;
                this.printSettingsDlg = (new SSE.Views.PrintSettings({
                    type: type,
                    handler: _.bind(this.resultPrintSettings,this),
                    afterrender: _.bind(function() {
                        this._changedProps = [];
                        this.updateSettings(this.printSettingsDlg);
                        this.printSettingsDlg.cmbSheet.on('selected', _.bind(this.comboSheetsChange, this, this.printSettingsDlg));
                        this.fillComponents(this.printSettingsDlg, true);
                        this.fillPrintOptions(this.adjPrintParams, true);
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
                    this.adjPrintParams.asc_setPageOptionsMap(this._changedProps);
                    this.adjPrintParams.asc_setIgnorePrintArea(this.printSettingsDlg.getIgnorePrintArea());
                    Common.localStorage.setItem("sse-print-settings-range", printtype);

                    if ( this.printSettingsDlg.type=='print' ) {
                        var opts = new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86);
                        opts.asc_setAdvancedOptions(this.adjPrintParams);
                        this.api.asc_Print(opts);
                    } else {
                        var opts = new Asc.asc_CDownloadOptions(this.downloadFormat, this.asUrl);
                        opts.asc_setAdvancedOptions(this.adjPrintParams);
                        this.api.asc_DownloadAs(opts);
                    }
                    Common.component.Analytics.trackEvent((this.printSettingsDlg.type=='print') ? 'Print' : 'DownloadAs');
                    Common.component.Analytics.trackEvent('ToolBar', (this.printSettingsDlg.type=='print') ? 'Print' : 'DownloadAs');
                    Common.NotificationCenter.trigger('edit:complete', view);
                } else
                    return true;
            } else {
                this.asUrl && Common.NotificationCenter.trigger('download:cancel');
                Common.NotificationCenter.trigger('edit:complete', view);
            }
            this.printSettingsDlg = null;
        },

        querySavePrintSettings: function(print) {
            if ( this.checkMargins(this.printSettings) ) {
                this.savePageOptions(this.printSettings);
                this._isPrint = print;
                this.printSettings.applySettings();

                if (print) {
                    var printType = this.printSettings.getRange();
                    this.adjPrintParams.asc_setPrintType(printType);
                    this.adjPrintParams.asc_setPageOptionsMap(this._changedProps);
                    this.adjPrintParams.asc_setIgnorePrintArea(this.printSettings.getIgnorePrintArea());
                    Common.localStorage.setItem("sse-print-settings-range", printType);

                    var opts = new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86);
                    opts.asc_setAdvancedOptions(this.adjPrintParams);
                    this.api.asc_Print(opts);
                    Common.NotificationCenter.trigger('edit:complete', view);

                    this._isPrint = false;
                }
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
            pagewidth = pagewidth ? parseFloat(pagewidth[0]) : (this._originalPageSettings ? this._originalPageSettings.asc_getWidth() : 0);
            pageheight = pageheight ? parseFloat(pageheight[0]) : (this._originalPageSettings ? this._originalPageSettings.asc_getHeight() : 0);

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
            panel.cmbLayout.on('selected', _.bind(this.propertyChange, this, panel, 'scale'));
            panel.spnMarginTop.on('change', _.bind(this.propertyChange, this, panel));
            panel.spnMarginBottom.on('change', _.bind(this.propertyChange, this, panel));
            panel.spnMarginLeft.on('change', _.bind(this.propertyChange, this, panel));
            panel.spnMarginRight.on('change', _.bind(this.propertyChange, this, panel));
            panel.chPrintGrid.on('change', _.bind(this.propertyChange, this, panel));
            panel.chPrintRows.on('change', _.bind(this.propertyChange, this, panel));
            panel.txtRangeTop.on('changed:after', _.bind(this.propertyChange, this, panel));
            panel.txtRangeLeft.on('changed:after', _.bind(this.propertyChange, this, panel));
            panel.txtRangeTop.on('button:click', _.bind(this.onPresetSelect, this, panel, 'top', panel.btnPresetsTop.menu, {value: 'select'}));
            panel.txtRangeLeft.on('button:click', _.bind(this.onPresetSelect, this, panel, 'left', panel.btnPresetsLeft.menu, {value: 'select'}));
            panel.btnPresetsTop.menu.on('item:click', _.bind(this.onPresetSelect, this, panel, 'top'));
            panel.btnPresetsLeft.menu.on('item:click', _.bind(this.onPresetSelect, this, panel, 'left'));
        },

        propertyChange: function(panel, scale, combo, record) {
            if (scale === 'scale' && record.value === 'customoptions') {
                var me = this,
                    props = (me._changedProps.length > 0 && me._changedProps[panel.cmbSheet.getValue()]) ? me._changedProps[panel.cmbSheet.getValue()] : me.api.asc_getPageOptions(panel.cmbSheet.getValue(), true);
                var win = new SSE.Views.ScaleDialog({
                    api: me.api,
                    props: props,
                    handler: function(dlg, result) {
                        if (dlg == 'ok') {
                            if (me.api && result) {
                                me.fitWidth = result.width;
                                me.fitHeight = result.height;
                                me.fitScale = result.scale;
                                me.setScaling(panel, me.fitWidth, me.fitHeight, me.fitScale);
                                if (me._changedProps) {
                                    var currentSheet = panel.cmbSheet.getValue();
                                    me._changedProps[currentSheet] = me.getPageOptions(panel, currentSheet);
                                    me.updatePreview();
                                }
                            }
                        } else {
                            var opt = props.asc_getPageSetup(),
                                fitwidth = opt.asc_getFitToWidth(),
                                fitheight = opt.asc_getFitToHeight(),
                                fitscale = opt.asc_getScale();
                            me.setScaling(panel, fitwidth, fitheight, fitscale);
                        }
                        Common.NotificationCenter.trigger('edit:complete');
                    }
                });
                win.show();
                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            } else {
                if (this._changedProps) {
                    var currentSheet = panel.cmbSheet.getValue();
                    this._changedProps[currentSheet] = this.getPageOptions(panel, currentSheet);
                    this.updatePreview();
                }
            }
        },

        getPrintParams: function() {
            return this.adjPrintParams;
        },

        setScaling: function (panel, width, height, scale) {
            var value;
            if (!width && !height && scale === 100) value = 0;
            else if (width === 1 && height === 1) value = 1;
            else if (width === 1 && !height) value = 2;
            else if (!width && height === 1) value = 3;
            else value = 4;
            panel.addCustomScale(value === 4);
            panel.cmbLayout.setValue(value, true);
        },

        fillComponents: function(panel, selectdata) {
            var me = this;
            panel.txtRangeTop.validation = function(value) {
                if (_.isEmpty(value)) {
                    return true;
                }
                var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.PrintTitles, value, false);
                return (isvalid==Asc.c_oAscError.ID.DataRangeError) ? me.textInvalidRange : true;
            };
            selectdata && panel.txtRangeTop.updateBtnHint(this.textSelectRange);

            panel.txtRangeLeft.validation = function(value) {
                if (_.isEmpty(value)) {
                    return true;
                }
                var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.PrintTitles, value, false);
                return (isvalid==Asc.c_oAscError.ID.DataRangeError) ? me.textInvalidRange : true;
            };
            selectdata && panel.txtRangeLeft.updateBtnHint(this.textSelectRange);

            var data = ((selectdata) ? [{caption: this.textSelectRange + '...', value: 'select'}] : []).concat([
                {caption: this.textFrozenRows, value: 'frozen'},
                {caption: this.textFirstRow, value: 'first'},
                {caption: '--'},
                {caption: this.textNoRepeat, value: 'empty'}
            ]);
            panel.btnPresetsTop.setMenu(new Common.UI.Menu({
                style: 'min-width: 100px;',
                maxHeight: 200,
                additionalAlign: panel.menuAddAlign,
                items: data
            }));
            data = ((selectdata) ? [{caption: this.textSelectRange + '...', value: 'select'}] : []).concat([
                {caption: this.textFrozenCols, value: 'frozen'},
                {caption: this.textFirstCol, value: 'first'},
                {caption: '--'},
                {caption: this.textNoRepeat, value: 'empty'}
            ]);
            panel.btnPresetsLeft.setMenu(new Common.UI.Menu({
                style: 'min-width: 100px;',
                maxHeight: 200,
                additionalAlign: panel.menuAddAlign,
                items: data
            }));
        },

        onPresetSelect: function(panel, type, menu, item) {
            var txtRange = (type=='top') ? panel.txtRangeTop : panel.txtRangeLeft;
            if (item.value == 'select') {
                var me = this;
                if (me.api) {
                    panel.btnPresetsTop.menu.options.additionalAlign = panel.menuAddAlign;
                    panel.btnPresetsLeft.menu.options.additionalAlign = panel.menuAddAlign;

                    var handlerDlg = function(dlg, result) {
                        if (result == 'ok') {
                            var valid = dlg.getSettings();
                            if (type=='top')
                                panel.dataRangeTop = valid;
                            else
                                panel.dataRangeLeft = valid;
                            txtRange.setValue(valid);
                            txtRange.checkValidate();
                        }
                    };

                    var win = new SSE.Views.CellRangeDialog({
                        handler: handlerDlg
                    }).on('close', function() {
                        panel.show();
                        _.delay(function(){
                            txtRange.focus();
                        },1);
                    });

                    var xy = panel.$window.offset();
                    panel.hide();
                    win.show(xy.left + 160, xy.top + 125);
                    win.setSettings({
                        api     : me.api,
                        range   : (!_.isEmpty(txtRange.getValue()) && (txtRange.checkValidate()==true)) ? txtRange.getValue() : ((type=='top') ? panel.dataRangeTop : panel.dataRangeLeft),
                        type    : Asc.c_oAscSelectionDialogType.PrintTitles
                    });
                }
            } else {
                var value = '';
                if (item.value == 'frozen')
                    value = this.api.asc_getPrintTitlesRange(Asc.c_oAscPrintTitlesRangeType.frozen, type=='left', panel.cmbSheet.getValue());
                else if (item.value == 'first')
                    value = this.api.asc_getPrintTitlesRange(Asc.c_oAscPrintTitlesRangeType.first, type=='left', panel.cmbSheet.getValue());
                txtRange.setValue(value);
                txtRange.checkValidate();
                if (type=='top')
                    panel.dataRangeTop = value;
                else
                    panel.dataRangeLeft = value;
                _.delay(function(){
                    txtRange.focus();
                },1);
            }
        },

        onHidePrintMenu: function () {
            if (this._isPreviewVisible) {
                this.api.asc_closePrintPreview(this._isPrint);
                this._isPreviewVisible = false;
            }
        },

        onChangePreviewPage: function (next) {
            var index = this._navigationPreview.currentPage;
            if (next) {
                index++;
                index = Math.min(index, this._navigationPreview.pageCount - 1);
            } else {
                index--;
                index = Math.max(index, 0);
            }
            this.api.asc_drawPrintPreview(index);

            this.updateNavigationButtons(index, this._navigationPreview.pageCount);
        },

        onPreviewWheel: function (e) {
            if (e.ctrlKey) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
            this.printSettings.txtRangeTop.cmpEl.find('input:focus').blur();
            this.printSettings.txtRangeLeft.cmpEl.find('input:focus').blur();
            var forward = (e.deltaY || (e.detail && -e.detail) || e.wheelDelta) < 0;
            this.onChangePreviewPage(forward);
        },

        onKeypressPageNumber: function (input, e) {
            if (e.keyCode === Common.UI.Keys.RETURN) {
                var box = this.printSettings.$el.find('#print-number-page'),
                    edit = box.find('input[type=text]'), page = parseInt(edit.val());
                if (!page || page > this._navigationPreview.pageCount || page < 0) {
                    edit.select();
                    this.printSettings.txtNumberPage.setValue(this._navigationPreview.currentPage + 1);
                    this.printSettings.txtNumberPage.checkValidate();
                    return false;
                }

                box.focus(); // for IE

                this.api.asc_drawPrintPreview(page-1);
                this.api.asc_enableKeyEvents(true);
                this.updateNavigationButtons(page-1, this._navigationPreview.pageCount);

                return false;
            }
        },

        onKeyupPageNumber: function (input, e) {
            if (e.keyCode === Common.UI.Keys.ESC) {
                var box = this.printSettings.$el.find('#print-number-page');
                box.focus(); // for IE
                this.api.asc_enableKeyEvents(true);
                return false;
            }
        },

        onBlurPageNumber: function () {
            if (this.printSettings.txtNumberPage.getValue() != this._navigationPreview.currentPage + 1) {
                this.printSettings.txtNumberPage.setValue(this._navigationPreview.currentPage + 1);
                this.printSettings.txtNumberPage.checkValidate();
            }
        },

        updatePreview: function (needUpdate) {
            if (this._isPreviewVisible) {
                this.printSettings.$previewBox.removeClass('hidden');

                var adjPrintParams = new Asc.asc_CAdjustPrint(),
                    printType = this.printSettings.getRange();
                adjPrintParams.asc_setPrintType(printType);
                adjPrintParams.asc_setPageOptionsMap(this._changedProps);
                adjPrintParams.asc_setIgnorePrintArea(this.printSettings.getIgnorePrintArea());

                var opts = new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86);
                opts.asc_setAdvancedOptions(adjPrintParams);

                var pageCount = this.api.asc_updatePrintPreview(opts);
                this.printSettings.$previewBox.toggleClass('hidden', !pageCount);
                this.printSettings.$previewEmpty.toggleClass('hidden', !!pageCount);

                var newPage;
                if (this._currentPrintType !== printType) {
                    newPage = 0;
                    this._currentPrintType = printType;
                } else if (this._navigationPreview.currentPage > pageCount - 1) {
                    newPage = Math.max(0, pageCount - 1);
                } else {
                    newPage = this._navigationPreview.currentPage;
                }

                this.notUpdateSheetSettings = !needUpdate;
                this.api.asc_drawPrintPreview(newPage);

                this.updateNavigationButtons(newPage, pageCount);
            }
        },

        onApiChangePreviewSheet: function (index) {
            var item = this.printSettings.cmbSheet.store.findWhere({value: index});
            this.printSettings.updateActiveSheet(item.get('displayValue'));

            if (this.notUpdateSheetSettings) {
                this.notUpdateSheetSettings = false;
            } else if (item) {
                this.printSettings.cmbSheet.setValue(item.get('value'));
                this.comboSheetsChange(this.printSettings, this.printSettings.cmbSheet, item.toJSON());
            }
        },

        updateNavigationButtons: function (page, count) {
            this._navigationPreview.currentPage = page;
            this.printSettings.updateCurrentPage(page);
            this._navigationPreview.pageCount = count;
            this.printSettings.updateCountOfPages(count);
            this.disableNavButtons();
        },

        disableNavButtons: function (force) {
            if (force) {
                this.printSettings.btnPrevPage.setDisabled(true);
                this.printSettings.btnNextPage.setDisabled(true);
                return;
            }
            var curPage = this._navigationPreview.currentPage,
                pageCount = this._navigationPreview.pageCount;
            this.printSettings.btnPrevPage.setDisabled(curPage < 1);
            this.printSettings.btnNextPage.setDisabled(curPage > pageCount - 2);
        },

        onOpenHeaderSettings: function () {
            var pageSetup = this._changedProps[this.printSettings.cmbSheet.getValue()].asc_getPageSetup();
            SSE.getController('Toolbar').onEditHeaderClick(pageSetup);
        },

        onApiChangePreviewPage: function (page) {
            if (this._navigationPreview.currentPage !== page) {
                this._navigationPreview.currentPage = page;
                this.updateNavigationButtons(page, this._navigationPreview.pageCount);
                this.disableNavButtons();
            }
        },

        onApiPreviewSheetDataChanged: function (needUpdate) {
            if (needUpdate) {
                this.updatePreview();
            } else {
                this.notUpdateSheetSettings = true;
                this.api.asc_drawPrintPreview(this._navigationPreview.currentPage);
                this.updateNavigationButtons(this._navigationPreview.currentPage, this._navigationPreview.pageCount);
            }
        },

        warnCheckMargings:      'Margins are incorrect',
        strAllSheets:           'All Sheets',
        textWarning: 'Warning',
        txtCustom: 'Custom',
        textInvalidRange:   'ERROR! Invalid cells range',
        textRepeat: 'Repeat...',
        textNoRepeat: 'Not repeat',
        textSelectRange: 'Select range',
        textFrozenRows: 'Frozen rows',
        textFrozenCols: 'Frozen columns',
        textFirstRow: 'First row',
        textFirstCol: 'First column'
    }, SSE.Controllers.Print || {}));
});