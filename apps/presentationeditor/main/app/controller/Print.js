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

    PE.Controllers.Print = Backbone.Controller.extend(_.extend({
        views: [
            'PrintWithPreview'
        ],

        initialize: function() {
            this.adjPrintParams = new Asc.asc_CAdjustPrint();

            this._state = {
                isLockedSlideHeaderAppyToAll: false
            };
            this._paperSize = undefined;
            this._navigationPreview = {
                pageCount: false,
                currentPage: 0,
                currentPreviewPage: 0
            };

            this._isPreviewVisible = false;

            this.addListeners({
                'PrintWithPreview': {
                    'show': _.bind(this.onShowMainSettingsPrint, this),
                    'render:after': _.bind(this.onAfterRender, this),
                    'openheader': _.bind(this.onOpenHeaderSettings, this)
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
                        return true;
                    }
                }

                return me.txtPrintRangeInvalid;
            };
            this.printSettings.cmbPaperSize.on('selected', _.bind(this.onPaperSizeSelect, this));
            this._paperSize = this.printSettings.cmbPaperSize.getSelectedRecord().size;

            Common.NotificationCenter.on('window:resize', _.bind(function () {
                if (this._isPreviewVisible) {
                    this.api.asc_drawPrintPreview(this._navigationPreview.currentPreviewPage, this._paperSize);
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
            this.api.asc_registerCallback('asc_onCountPages',   _.bind(this.onCountPages, this));
            this.api.asc_registerCallback('asc_onCurrentPage',  _.bind(this.onCurrentPage, this));
            this.api.asc_registerCallback('asc_onLockSlideHdrFtrApplyToAll', _.bind(this.onLockSlideHdrFtrApplyToAll, this, true));
            this.api.asc_registerCallback('asc_onUnLockSlideHdrFtrApplyToAll', _.bind(this.onLockSlideHdrFtrApplyToAll, this, false));

            return this;
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

            if (this.printSettings && this.printSettings.isVisible()) {
                this.printSettings.$previewBox.toggleClass('hidden', !this._navigationPreview.pageCount);
                this.printSettings.$previewEmpty.toggleClass('hidden', !!this._navigationPreview.pageCount);
            }
            if (!!this._navigationPreview.pageCount) {
                if (this._navigationPreview.currentPreviewPage > count - 1)
                    this._navigationPreview.currentPreviewPage = Math.max(0, count - 1);
                if (this.printSettings && this.printSettings.isVisible()) {
                    this.api.asc_drawPrintPreview(this._navigationPreview.currentPreviewPage, this._paperSize);
                    this.updateNavigationButtons(this._navigationPreview.currentPreviewPage, count);
                }
            }
        },

        onCurrentPage: function(number) {
            this._navigationPreview.currentPreviewPage = number;
            if (this.printSettings && this.printSettings.isVisible()) {
                this.api.asc_drawPrintPreview(this._navigationPreview.currentPreviewPage, this._paperSize);
                this.updateNavigationButtons(this._navigationPreview.currentPreviewPage, this._navigationPreview.pageCount);
            }
        },

        onLockSlideHdrFtrApplyToAll: function(isLocked) {
            this._state.isLockedSlideHeaderAppyToAll = isLocked;
        },

        onShowMainSettingsPrint: function() {
            var me = this;
            this.printSettings.$previewBox.removeClass('hidden');

            var opts = new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86);
            opts.asc_setAdvancedOptions(this.adjPrintParams);
            this.api.asc_initPrintPreview('print-preview', opts);

            this.printSettings.$previewBox.toggleClass('hidden', !this._navigationPreview.pageCount);
            this.printSettings.$previewEmpty.toggleClass('hidden', !!this._navigationPreview.pageCount);
            if (!!this._navigationPreview.pageCount) {
                this._navigationPreview.currentPreviewPage = this._navigationPreview.currentPage = this.api.getCurrentPage();
                this.api.asc_drawPrintPreview(this._navigationPreview.currentPreviewPage, this._paperSize);
                this.updateNavigationButtons(this._navigationPreview.currentPreviewPage, this._navigationPreview.pageCount);
                this.SetDisabled();
            }
            this._isPreviewVisible = true;
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
            if (this._navigationPreview.pageCount<1)
                return;

            var rec = this.printSettings.cmbPaperSize.getSelectedRecord();
            this.adjPrintParams.asc_setNativeOptions({
                pages: this.printSettings.cmbRange.getValue()===-1 ? this.printSettings.inputPages.getValue() : this.printSettings.cmbRange.getValue(),
                paperSize: {
                    w: rec ? rec.size[0] : undefined,
                    h: rec ? rec.size[1] : undefined,
                    preset: rec ? rec.caption : undefined
                },
                copies: this.printSettings.spnCopies.getNumberValue() || 1,
                sides: this.printSettings.cmbSides.getValue()
            });

            if ( print ) {
                var opts = new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86);
                opts.asc_setAdvancedOptions(this.adjPrintParams);
                this.api.asc_Print(opts);
            } else {
                var opts = new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF);
                opts.asc_setAdvancedOptions(this.adjPrintParams);
                this.api.asc_DownloadAs(opts);
            }
            this.printSettings.menu.hide();
        },

        inputPagesChanging: function (input, value) {
            this.isInputFirstChange && this.printSettings.inputPages.showError();
            this.isInputFirstChange = false;

            if (value.length<1)
                this.printSettings.cmbRange.setValue('all');
            else if (this.printSettings.cmbRange.getValue()!==-1)
                this.printSettings.cmbRange.setValue(-1);
        },

        onPaperSizeSelect: function(combo, record) {
            if (record) {
                this._paperSize = record.size;
                this.api.asc_drawPrintPreview(this._navigationPreview.currentPreviewPage, this._paperSize);
            }
        },

        onOpenHeaderSettings: function () {
            var me = this;
            (new PE.Views.HeaderFooterDialog({
                api: this.api,
                lang: this.api.asc_getDefaultLanguage(),
                props: this.api.asc_getHeaderFooterProperties(),
                type: this._state.isLockedSlideHeaderAppyToAll ? 0 : 1,
                isLockedApplyToAll: this._state.isLockedSlideHeaderAppyToAll, 
                handler: function(result, value) {
                    if (result == 'ok' || result == 'all') {
                        if (me.api) {
                            me.api.asc_setHeaderFooterProperties(value, result == 'all');
                        }
                    }
                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                }
            })).show();
        },

        SetDisabled: function() {
            if (this.printSettings && this.printSettings.isVisible()) {
                var disable = !this.mode.isEdit;
            }
        },

        txtPrintRangeInvalid: 'Invalid print range',
        txtPrintRangeSingleRange: 'Enter either a single slide number or a single slide range (for example, 5-12). Or you can Print to PDF.'
    }, PE.Controllers.Print || {}));
});