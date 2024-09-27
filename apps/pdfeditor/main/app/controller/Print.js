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
define([
    'core'
], function () {
    'use strict';

    PDFE.Controllers.Print = Backbone.Controller.extend(_.extend({
        views: [
            'PrintWithPreview'
        ],

        initialize: function() {
            this.adjPrintParams = new Asc.asc_CAdjustPrint();
            this._state = {
                lock_doc: false,
                firstPrintPage: 0
            };

            this._navigationPreview = {
                pageCount: false,
                currentPage: 0,
                currentPreviewPage: 0
            };

            this._isPreviewVisible = false;

            this.addListeners({
                'PrintWithPreview': {
                    'show': _.bind(this.onShowMainSettingsPrint, this),
                    'render:after': _.bind(this.onAfterRender, this)
                }
            });
            Common.NotificationCenter.on('script:loaded', _.bind(this.onPostLoadComplete, this));
        },

        onLaunch: function() {
        },

        onPostLoadComplete: function() {
            this.views = this.getApplication().getClasseRefs('view', ['PrintWithPreview']);
            this.printSettings = this.createView('PrintWithPreview');
            this.setMode(this.mode);
        },

        onAfterRender: function(view) {
            var me = this;
            this.printSettings.menu.on('menu:hide', _.bind(this.onHidePrintMenu, this));
            this.printSettings.btnPrint.on('click', _.bind(this.onBtnPrint, this, true));
            this.printSettings.btnPrintPdf.on('click', _.bind(this.onBtnPrint, this, false));
            this.printSettings.btnPrevPage.on('click', _.bind(this.onChangePreviewPage, this, false));
            this.printSettings.btnNextPage.on('click', _.bind(this.onChangePreviewPage, this, true));
            this.printSettings.txtNumberPage.on({
                'keypress:after':  _.bind(this.onKeypressPageNumber, this),
                'keyup:after': _.bind(this.onKeyupPageNumber, this)
            });
            this.printSettings.txtNumberPage.cmpEl.find('input').on('blur', _.bind(this.onBlurPageNumber, this));
            this.printSettings.cmbPaperSize.on('selected', _.bind(this.onPaperSizeSelect, this));
            this.printSettings.cmbPaperOrientation.on('selected', _.bind(this.onPaperOrientSelect, this));
            this.printSettings.cmbPaperMargins.on('selected', _.bind(this.onPaperMarginsSelect, this));
            this.printSettings.cmbRange.on('selected', _.bind(this.comboRangeChange, this));
            this.printSettings.inputPages.on('changing', _.bind(this.inputPagesChanging, this));
            this.printSettings.inputPages.validation = function(value) {
                if (!_.isEmpty(value) && /[0-9,\-]/.test(value)) {
                    var res = [],
                        arr = value.split(',');
                    if (me._isPrint && arr.length>1)
                        return me.txtPrintRangeSingleRange;

                    for (var i=0; i<arr.length; i++) {
                        var item = arr[i];
                        if (!item) // empty
                            return me.txtPrintRangeInvalid;
                        var str = item.match(/\-/g);
                        if (str && str.length>1) // more than 1 symbol '-'
                            return me.txtPrintRangeInvalid;
                        if (!str) {// one number
                            var num = parseInt(item)-1;
                            (num>=0) && res.push(num);
                        } else { // range
                            var pages = item.split('-'),
                                start = (pages[0] ? parseInt(pages[0])-1 : 0),
                                end = (pages[1] ? parseInt(pages[1])-1 : me._navigationPreview.pageCount-1);
                            if (start>end) {
                                var num = start;
                                start = end;
                                end = num;
                            }
                            for (var j=start; j<=end; j++) {
                                (j>=0) && res.push(j);
                            }
                        }
                    }
                    if (res.length>0) {
                        me._state.firstPrintPage = res[0];
                        return true;
                    }
                }

                return me.txtPrintRangeInvalid;
            };

            Common.NotificationCenter.on('window:resize', _.bind(function () {
                if (this._isPreviewVisible) {
                    this.api.asc_drawPrintPreview(this._navigationPreview.currentPreviewPage);
                }
            }, this));
            Common.NotificationCenter.on('margins:update', _.bind(this.onUpdateLastCustomMargins, this));

            var eventname = (/Firefox/i.test(navigator.userAgent))? 'DOMMouseScroll' : 'mousewheel';
            this.printSettings.$previewBox.on(eventname, _.bind(this.onPreviewWheel, this));
        },

        setMode: function (mode) {
            this.mode = mode;
            this.printSettings && this.printSettings.setMode(mode);
        },

        setApi: function(o) {
            this.api = o;
            this.api.asc_registerCallback('asc_onDocSize', _.bind(this.onApiPageSize, this));
            this.api.asc_registerCallback('asc_onPageOrient', _.bind(this.onApiPageOrient, this));
            this.api.asc_registerCallback('asc_onSectionProps', _.bind(this.onSectionProps, this));
            this.api.asc_registerCallback('asc_onCountPages',   _.bind(this.onCountPages, this));
            this.api.asc_registerCallback('asc_onCurrentPage',  _.bind(this.onCurrentPage, this));
            this.api.asc_registerCallback('asc_onLockDocumentProps', _.bind(this.onApiLockDocumentProps, this));
            this.api.asc_registerCallback('asc_onUnLockDocumentProps', _.bind(this.onApiUnLockDocumentProps, this));

            return this;
        },

        findPagePreset: function(w, h) {
            var width = (w<h) ? w : h,
                height = (w<h) ? h : w;
            var panel = this.printSettings;
            var store = panel.cmbPaperSize.store,
                item = null;
            for (var i=0; i<store.length-1; i++) {
                var rec = store.at(i),
                    size = rec.get('size'),
                    pagewidth = size[0],
                    pageheight = size[1];
                if (Math.abs(pagewidth - width) < 0.1 && Math.abs(pageheight - height) < 0.1) {
                    item = rec;
                    break;
                }
            }
            return item ? item.get('caption') : undefined;
        },

        onApiPageSize: function(w, h) {
            this._state.pgsize = [w, h];
            if (this.printSettings && this.printSettings.isVisible()) {
                var width = this._state.pgorient ? w : h,
                    height = this._state.pgorient ? h : w;
                var panel = this.printSettings;
                var store = panel.cmbPaperSize.store,
                    item = null;
                for (var i=0; i<store.length-1; i++) {
                    var rec = store.at(i),
                        size = rec.get('size'),
                        pagewidth = size[0],
                        pageheight = size[1];
                    if (Math.abs(pagewidth - width) < 0.1 && Math.abs(pageheight - height) < 0.1) {
                        item = rec;
                        break;
                    }
                }
                if (item)
                    panel.cmbPaperSize.setValue(item.get('value'));
                else {
                    if (panel.$el.prop('id') === 'panel-print') {
                        panel.cmbPaperSize.setValue(undefined, [this.txtCustom,
                            parseFloat(Common.Utils.Metric.fnRecalcFromMM(width).toFixed(2)),
                            parseFloat(Common.Utils.Metric.fnRecalcFromMM(height).toFixed(2)),
                            Common.Utils.Metric.getCurrentMetricName()]);
                    } else {
                        panel.cmbPaperSize.setValue(this.txtCustom + ' (' + parseFloat(Common.Utils.Metric.fnRecalcFromMM(width).toFixed(2)) + Common.Utils.Metric.getCurrentMetricName() + ' x ' +
                            parseFloat(Common.Utils.Metric.fnRecalcFromMM(height).toFixed(2)) + Common.Utils.Metric.getCurrentMetricName() + ')');
                    }
                }
            } else {
                this.isFillProps = false;
            }
        },

        onApiPageOrient: function(isportrait) {
            this._state.pgorient = !!isportrait;
            if (this.printSettings && this.printSettings.isVisible()) {
                var item = this.printSettings.cmbPaperOrientation.store.findWhere({value: this._state.pgorient ? Asc.c_oAscPageOrientation.PagePortrait : Asc.c_oAscPageOrientation.PageLandscape});
                if (item) this.printSettings.cmbPaperOrientation.setValue(item.get('value'));
            }
        },

        onSectionProps: function(props) {
            if (!props) return;

            this._state.sectionprops = props;
            if (this.printSettings && this.printSettings.isVisible()) {
                var left = props.get_LeftMargin(),
                    top = props.get_TopMargin(),
                    right = props.get_RightMargin(),
                    bottom = props.get_BottomMargin();

                this._state.pgmargins = [top, left, bottom, right];
                var store = this.printSettings.cmbPaperMargins.store,
                    item = null;
                for (var i=0; i<store.length-1; i++) {
                    var rec = store.at(i),
                        size = rec.get('size');
                    if (typeof(size) == 'object' &&
                        Math.abs(size[0] - top) < 0.1 && Math.abs(size[1] - left) < 0.1 &&
                        Math.abs(size[2] - bottom) < 0.1 && Math.abs(size[3] - right) < 0.1) {
                        item = rec;
                    }
                }
                if (item)
                    this.printSettings.cmbPaperMargins.setValue(item.get('value'));
                else
                    this.printSettings.cmbPaperMargins.setValue(this.txtCustom);

            }
        },

        comboRangeChange: function(combo, record) {
            if (record.value === -1) {
                var me = this;
                setTimeout(function(){
                    me.printSettings.inputPages.focus();
                }, 50);
            } else {
                this.printSettings.inputPages.setValue('');
            }
            this.printSettings.inputPages.showError();
        },

        onCountPages: function(count) {
            this._navigationPreview.pageCount = count;
            if (this._navigationPreview.currentPreviewPage > count - 1) {
                this._navigationPreview.currentPreviewPage = Math.max(0, count - 1);
                if (this.printSettings && this.printSettings.isVisible()) {
                    this.api.asc_drawPrintPreview(this._navigationPreview.currentPreviewPage);
                    this.updateNavigationButtons(this._navigationPreview.currentPreviewPage, count);
                }
            }
        },

        onCurrentPage: function(number) {
            this._navigationPreview.currentPreviewPage = number;
            if (this.printSettings && this.printSettings.isVisible()) {
                this.api.asc_drawPrintPreview(this._navigationPreview.currentPreviewPage);
                this.updateNavigationButtons(this._navigationPreview.currentPreviewPage, this._navigationPreview.pageCount);
            }
        },

        onShowMainSettingsPrint: function() {
            var me = this;
            this.printSettings.$previewBox.removeClass('hidden');

            this.onUpdateLastCustomMargins(this._state.lastmargins);
            this._state.pgsize && this.onApiPageSize(this._state.pgsize[0], this._state.pgsize[1]);
            this.onApiPageOrient(this._state.pgorient);
            this._state.sectionprops && this.onSectionProps(this._state.sectionprops);

            var opts = new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86);
            opts.asc_setAdvancedOptions(this.adjPrintParams);
            this.api.asc_initPrintPreview('print-preview', opts);

            this._navigationPreview.currentPreviewPage = this._navigationPreview.currentPage = this.api.getCurrentPage();
            this.api.asc_drawPrintPreview(this._navigationPreview.currentPreviewPage);
            this.updateNavigationButtons(this._navigationPreview.currentPreviewPage, this._navigationPreview.pageCount);
            this.SetDisabled();
            this._isPreviewVisible = true;
        },

        onPaperSizeSelect: function(combo, record) {
            this._state.pgsize = [0, 0];
            if (record.value !== -1) {
                if (this.checkPageSize(record.size[0], record.size[1])) {
                    var section = this.api.asc_GetSectionProps();
                    this.onApiPageSize(section.get_W(), section.get_H());
                    return;
                } else
                    this.api.change_DocSize(record.size[0], record.size[1]);
            } else {
                var win, props,
                    me = this;
                win = new DE.Views.PageSizeDialog({
                    checkPageSize: _.bind(this.checkPageSize, this),
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            props = dlg.getSettings();
                            me.api.change_DocSize(props[0], props[1]);
                            Common.NotificationCenter.trigger('edit:complete');
                        }
                    }
                });
                win.show();
                win.setSettings(me.api.asc_GetSectionProps());
            }

            Common.NotificationCenter.trigger('edit:complete');
        },

        onPaperMarginsSelect: function(combo, record) {
            this._state.pgmargins = undefined;
            if (record.value !== -1) {
                if (this.checkPageSize(undefined, undefined, record.size[1], record.size[3], record.size[0], record.size[2])) {
                    this.onSectionProps(this.api.asc_GetSectionProps());
                    return;
                } else {
                    var props = new Asc.CDocumentSectionProps();
                    props.put_TopMargin(record.size[0]);
                    props.put_LeftMargin(record.size[1]);
                    props.put_BottomMargin(record.size[2]);
                    props.put_RightMargin(record.size[3]);
                    this.api.asc_SetSectionProps(props);
                }
            } else {
                var win, props,
                    me = this;
                win = new DE.Views.PageMarginsDialog({
                    api: me.api,
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            props = dlg.getSettings();
                            Common.localStorage.setItem("pdfe-pgmargins-top", props.get_TopMargin());
                            Common.localStorage.setItem("pdfe-pgmargins-left", props.get_LeftMargin());
                            Common.localStorage.setItem("pdfe-pgmargins-bottom", props.get_BottomMargin());
                            Common.localStorage.setItem("pdfe-pgmargins-right", props.get_RightMargin());
                            Common.NotificationCenter.trigger('margins:update', props);

                            me.api.asc_SetSectionProps(props);
                            Common.NotificationCenter.trigger('edit:complete');
                        }
                    }
                });
                win.show();
                win.setSettings(me.api.asc_GetSectionProps());
            }

            Common.NotificationCenter.trigger('edit:complete');
        },

        onUpdateLastCustomMargins: function(props) {
            this._state.lastmargins = props;
            if (this.printSettings && this.printSettings.isVisible()) {
                var top = props ? props.get_TopMargin() : Common.localStorage.getItem("pdfe-pgmargins-top"),
                    left = props ? props.get_LeftMargin() : Common.localStorage.getItem("pdfe-pgmargins-left"),
                    bottom = props ? props.get_BottomMargin() : Common.localStorage.getItem("pdfe-pgmargins-bottom"),
                    right = props ? props.get_RightMargin() : Common.localStorage.getItem("pdfe-pgmargins-right");
                if ( top!==null && left!==null && bottom!==null && right!==null ) {
                    var rec = this.printSettings.cmbPaperMargins.store.at(0);
                    if (rec.get('value')===-2)
                        rec.set('size', [parseFloat(top), parseFloat(left), parseFloat(bottom), parseFloat(right)]);
                    else
                        this.printSettings.cmbPaperMargins.store.unshift({ value: -2, displayValue: this.textMarginsLast, size: [parseFloat(top), parseFloat(left), parseFloat(bottom), parseFloat(right)]});
                    this.printSettings.cmbPaperMargins.onResetItems();
                }
            }
        },

        onPaperOrientSelect: function(combo, record) {
            this._state.pgorient = undefined;
            if (this.api) {
                this.api.change_PageOrient(record.value === Asc.c_oAscPageOrientation.PagePortrait);
            }

            Common.NotificationCenter.trigger('edit:complete');
        },

        checkPageSize: function(width, height, left, right, top, bottom) {
            var section = this.api.asc_GetSectionProps();
            (width===undefined) && (width = parseFloat(section.get_W().toFixed(4)));
            (height===undefined) && (height = parseFloat(section.get_H().toFixed(4)));
            (left===undefined) && (left = parseFloat(section.get_LeftMargin().toFixed(4)));
            (right===undefined) && (right = parseFloat(section.get_RightMargin().toFixed(4)));
            (top===undefined) && (top = parseFloat(section.get_TopMargin().toFixed(4)));
            (bottom===undefined) && (bottom = parseFloat(section.get_BottomMargin().toFixed(4)));
            var gutterLeft = section.get_GutterAtTop() ? 0 : parseFloat(section.get_Gutter().toFixed(4)),
                gutterTop = section.get_GutterAtTop() ? parseFloat(section.get_Gutter().toFixed(4)) : 0;

            var errmsg = null;
            if (left + right + gutterLeft > width-12.7 )
                errmsg = this.txtMarginsW;
            else if (top + bottom + gutterTop > height-2.6 )
                errmsg = this.txtMarginsH;
            if (errmsg) {
                Common.UI.warning({
                    title: this.notcriticalErrorTitle,
                    msg  : errmsg,
                    callback: function() {
                        Common.NotificationCenter.trigger('edit:complete');
                    }
                });
                return true;
            }
        },

        getPrintParams: function() {
            return this.adjPrintParams;
        },

        onHidePrintMenu: function () {
            if (this._isPreviewVisible) {
                this.api.asc_closePrintPreview && this.api.asc_closePrintPreview();
                this._isPreviewVisible = false;
            }
        },

        onChangePreviewPage: function (next) {
            var index = this._navigationPreview.currentPreviewPage;
            if (next) {
                index++;
                index = Math.min(index, this._navigationPreview.pageCount - 1);
            } else {
                index--;
                index = Math.max(index, 0);
            }
            this.api.goToPage(index);
        },

        onKeypressPageNumber: function (input, e) {
            if (e.keyCode === Common.UI.Keys.RETURN) {
                var box = this.printSettings.$el.find('#print-number-page'),
                    edit = box.find('input[type=text]'), page = parseInt(edit.val());
                if (!page || page > this._navigationPreview.pageCount || page < 0) {
                    edit.select();
                    this.printSettings.txtNumberPage.setValue(this._navigationPreview.currentPreviewPage + 1);
                    this.printSettings.txtNumberPage.checkValidate();
                    return false;
                }

                box.focus(); // for IE

                this.api.goToPage(page-1);
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
            if (this.printSettings.txtNumberPage.getValue() != this._navigationPreview.currentPreviewPage + 1) {
                this.printSettings.txtNumberPage.setValue(this._navigationPreview.currentPreviewPage + 1);
                this.printSettings.txtNumberPage.checkValidate();
            }
        },

        onPreviewWheel: function (e) {
            if (e.ctrlKey) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
            var forward = (e.deltaY || (e.detail && -e.detail) || e.wheelDelta) < 0;
            this.onChangePreviewPage(forward);
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

        onBtnPrint: function(print) {
            this._isPrint = print;
            if (this.printSettings.cmbRange.getValue()===-1 && this.printSettings.inputPages.checkValidate() !== true)  {
                this.printSettings.inputPages.focus();
                this.isInputFirstChange = true;
                return;
            }
            if (this.printSettings.cmbRange.getValue()==='all')
                this._state.firstPrintPage = 0;
            else if (this.printSettings.cmbRange.getValue()==='current')
                this._state.firstPrintPage = this._navigationPreview.currentPage;

            var size = this.api.asc_getPageSize(this._state.firstPrintPage);
            this.adjPrintParams.asc_setNativeOptions({
                pages: this.printSettings.cmbRange.getValue()===-1 ? this.printSettings.inputPages.getValue() : this.printSettings.cmbRange.getValue(),
                paperSize: {
                    w: size ? size['W'] : undefined,
                    h: size ? size['H'] : undefined,
                    preset: size ? this.findPagePreset(size['W'], size['H']) : undefined
                },
                paperOrientation: size ? (size['H'] > size['W'] ? 'portrait' : 'landscape') : null,
                copies: this.printSettings.spnCopies.getNumberValue() || 1,
                sides: this.printSettings.cmbSides.getValue()
            });

            this.printSettings.menu.hide();
            if ( print ) {
                var opts = new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86);
                opts.asc_setAdvancedOptions(this.adjPrintParams);
                this.api.asc_Print(opts);
            } else {
                var opts = new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF);
                opts.asc_setAdvancedOptions(this.adjPrintParams);
                this.api.asc_DownloadAs(opts);
            }
        },

        inputPagesChanging: function (input, value) {
            this.isInputFirstChange && this.printSettings.inputPages.showError();
            this.isInputFirstChange = false;

            if (value.length<1)
                this.printSettings.cmbRange.setValue('all');
            else if (this.printSettings.cmbRange.getValue()!==-1)
                this.printSettings.cmbRange.setValue(-1);
        },

        onApiLockDocumentProps: function() {
            this._state.lock_doc = true;
            this.SetDisabled();
        },

        onApiUnLockDocumentProps: function() {
            this._state.lock_doc = false;
            this.SetDisabled();
        },

        SetDisabled: function() {
            if (this.printSettings && this.printSettings.isVisible()) {
                // var disable = !this.mode.isEdit || this._state.lock_doc;
                var disable = true;
                this.printSettings.cmbPaperSize.setDisabled(disable);
                this.printSettings.cmbPaperMargins.setDisabled(disable);
                this.printSettings.cmbPaperOrientation.setDisabled(disable);
            }
        },

        txtCustom: 'Custom',
        txtPrintRangeInvalid: 'Invalid print range',
        textMarginsLast: 'Last Custom',
        txtPrintRangeSingleRange: 'Enter either a single page number or a single page range (for example, 5-12). Or you can Print to PDF.'
    }, PDFE.Controllers.Print || {}));
});