/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
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
            this.adjPrintParams = new Asc.CAscPresentationPrintOptions();

            this._state = {
                isLockedSlideHeaderAppyToAll: false,
                shouldUpdateCmbPrinter: false, 
                currentPrinter: null,
                printersList: []
            };
            this._changedProps = {};
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
            this.printSettings.btnPrintSystemDialog.on('click', _.bind(this.onBtnPrint, this, true, true));
            this.printSettings.btnPrint.on('click', _.bind(this.onBtnPrint, this, true, false));
            this.printSettings.btnPrintPdf.on('click', _.bind(this.onBtnPrint, this, false, false));
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

            this.printSettings.cmbSlidesOnPage.on('change:type', this.onChangeSlidesOnPageType.bind(this));
            this.printSettings.cmbSlidesOnPage.on('change:option', this.onChangeSlidesOnPageOption.bind(this));
            let selectRecord = this.printSettings.cmbSlidesOnPage.getSelectedRecord();
            this._changedProps.slidesOnPage = {
                slidesCount: selectRecord && selectRecord.slidesCount,
                arrangmentType: selectRecord && selectRecord.arrangmentType,
                printType: selectRecord && selectRecord.printType,
                options: this.printSettings.cmbSlidesOnPage.getCheckedState(),
            };

            this.printSettings.cmbPaperOrientation.on('selected', _.bind(this.onPaperOrientSelect, this));

            this.printSettings.chSlideBackground.on('change', this.onChangeSlideBackground.bind(this));
            this.printSettings.chHiddenSlides.on('change', this.onChangeHiddenSlides.bind(this));
            this._changedProps.slidePrintOptions = {
                isPrintSlideBackground: this.printSettings.chSlideBackground.getValue() == 'checked',
                isPrintHiddenSlides: this.printSettings.chHiddenSlides.getValue() == 'checked'
            };

            const sizeRec = this.printSettings.cmbPaperSize.getSelectedRecord();
            this.printSettings.cmbPaperSize.on('selected', _.bind(this.onPaperSizeSelect, this));
            this._changedProps.paperSize = sizeRec.size;
            this.api.asc_setNoteSizesByPrinter(sizeRec.size[0], sizeRec.size[1]);

            if(!this.printSettings.cmbPrinter) {
                this.printSettings.setCmbPaperSizeOptions();
            }

            Common.NotificationCenter.on('window:resize', _.bind(function () {
                if (this._isPreviewVisible) {
                    this.drawPrintPreview();
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
            this.api.asc_registerCallback('asc_onLockSlideHdrFtrApplyToAll', _.bind(this.onLockSlideHdrFtrApplyToAll, this, true));
            this.api.asc_registerCallback('asc_onUnLockSlideHdrFtrApplyToAll', _.bind(this.onLockSlideHdrFtrApplyToAll, this, false));
            this.api.asc_registerCallback('asc_onUpdatePreview', _.bind(this.onUpdatePreview, this));
            this.api.asc_registerCallback('asc_onNotePageOrientation', _.bind(this.onNotePageOrientation, this));
            this.api.asc_registerCallback('asc_onLockDocumentNoteProps', _.bind(this.onLockDocumentNoteProps, this, true));
            this.api.asc_registerCallback('asc_onUnLockDocumentNoteProps', _.bind(this.onLockDocumentNoteProps, this, false));

            return this;
        },

        onChangeSlidesOnPageType: function(combo, record) {
            if (record) {
                this._changedProps.slidesOnPage.slidesCount = record.slidesCount;
                this._changedProps.slidesOnPage.arrangmentType = record.arrangmentType;
                this._changedProps.slidesOnPage.printType = record.printType;
                this.updatePreview();
            }
        },

        onChangeSlidesOnPageOption: function(combo, record) {
            if (record) {
                this._changedProps.slidesOnPage.options[record.value] = record.checked;
                this.updatePreview();
            }
        },

        onPaperOrientSelect: function(combo, record) {
            if (record && this.api) {
                this.api.asc_setNotePageOrientation(record.value);
            }
        },

        onChangeSlideBackground: function(chb, value) {
            if (value) {
                this._changedProps.slidePrintOptions.isPrintSlideBackground = value == 'checked';
                this.updatePreview();
            }
        },

        onChangeHiddenSlides: function(chb, value) {
            if (value) {
                this._changedProps.slidePrintOptions.isPrintHiddenSlides = value == 'checked';
                this.updatePreview();
            }
        },
        
        setCmbRangeValue: function(value) {
            this.printSettings.cmbRange.setValue(value);
            this.comboRangeChange(this.printSettings.cmbRange, this.printSettings.cmbRange.getSelectedRecord());
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
            this.updatePreview();
        },

        onCountPages: function(count) {
            let newPreviewPage = this._navigationPreview.currentPreviewPage;
            this._navigationPreview.pageCount = count;

            if (this.printSettings && this.printSettings.isVisible()) {
                this.printSettings.$previewBox.toggleClass('hidden', !this._navigationPreview.pageCount);
                this.printSettings.$previewEmpty.toggleClass('hidden', !!this._navigationPreview.pageCount);
            }
            if (!!this._navigationPreview.pageCount) {
                if (this._navigationPreview.currentPreviewPage > count - 1)
                    newPreviewPage = Math.max(0, count - 1);
                if (this.printSettings && this.printSettings.isVisible()) {
                    if(newPreviewPage != this._navigationPreview.currentPreviewPage) {
                        this.changeCurrentPreviewPage(newPreviewPage);
                    }
                    this.drawPrintPreview();
                    this.updateNavigationButtons(this._navigationPreview.currentPreviewPage, count);
                }
            }
        },

        onCurrentPage: function(number) {
            this._navigationPreview.currentPreviewPage = number;
            if (this.printSettings && this.printSettings.isVisible()) {
                this.drawPrintPreview();
                this.updateNavigationButtons(this._navigationPreview.currentPreviewPage, this._navigationPreview.pageCount);
            }
        },

        onLockSlideHdrFtrApplyToAll: function(isLocked) {
            this._state.isLockedSlideHeaderAppyToAll = isLocked;
        },

        onUpdatePreview: function() {
            if (this.printSettings && this.printSettings.isVisible()) {
                this.updatePreview();
            }
        },

        onNotePageOrientation: function(orient) {
            if(!this.printSettings || !this.printSettings.cmbPaperOrientation) return;

            const record = this.printSettings.cmbPaperOrientation.store.findWhere({value:orient});
            record && this.printSettings.cmbPaperOrientation.selectRecord(record);
            this._changedProps.pageOrientation = orient;
            this.updatePreview();
        },

        onLockDocumentNoteProps: function(lock) {
            if(!this.printSettings) return;

            Common.Utils.lockControls(Common.enumLock.docNotePropsLock,lock,
                {array: [this.printSettings.cmbPaperOrientation, this.printSettings.cmbPaperSize]}
            );
        },

        onShowMainSettingsPrint: function() {
            this.printSettings.$previewBox.removeClass('hidden');

            var opts = new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86);
            opts.asc_setAdvancedOptions(this.adjPrintParams);
            const pageCount = this.api.asc_initPrintPreview('print-preview', opts);

            this.printSettings.$previewBox.toggleClass('hidden', !pageCount);
            this.printSettings.$previewEmpty.toggleClass('hidden', !!pageCount);
            if (!!pageCount) {
                this.changeCurrentPreviewPage(0);
                this.updateNavigationButtons(this._navigationPreview.currentPreviewPage, pageCount);
                this.SetDisabled();
            }

            this._isPreviewVisible = true;
            !!pageCount && this.updatePreview();

            if(this._state.shouldUpdateCmbPrinter) {
                this.updateCmbPrinter();      
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
            if(index != this._navigationPreview.currentPreviewPage) {
                this.changeCurrentPreviewPage(index);
                this.updateNavigationButtons(this._navigationPreview.currentPreviewPage, this._navigationPreview.pageCount);
            }
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

                this.changeCurrentPreviewPage(page - 1);
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

        updatePrintOptions: function(adjPrintParams) {
            if(!adjPrintParams) return;
            
            const isPortait = this._changedProps.pageOrientation == Asc.c_oAscPageOrientation.PagePortrait;
            const pageOptions = adjPrintParams.asc_getPageOptions();
            pageOptions.asc_setWidth(this._changedProps.paperSize[isPortait ? 0 : 1]);
            pageOptions.asc_setHeight(this._changedProps.paperSize[isPortait ? 1 : 0]);
            
            const slidesOnPagePrintOptions = adjPrintParams.asc_getSlidesOnPagePrintOptions();
            slidesOnPagePrintOptions.asc_setArrangementType(this._changedProps.slidesOnPage.arrangmentType);
            slidesOnPagePrintOptions.asc_setPrintType(this._changedProps.slidesOnPage.printType);
            slidesOnPagePrintOptions.asc_setSlidesCount(this._changedProps.slidesOnPage.slidesCount);
        
            const slidesOnPageOptions = adjPrintParams.asc_getSlidesOnPageOptions(); 
            slidesOnPageOptions.asc_setIsPrintSlideNumbersOnHandouts(
                this._changedProps.slidesOnPage.options.isPrintSlideNumbersOnHandouts
            );
            slidesOnPageOptions.asc_setIsFrameSlides(this._changedProps.slidesOnPage.options.isFrameSlides);
            slidesOnPageOptions.asc_setIsScaleToFitPaper(this._changedProps.slidesOnPage.options.isScaleToFitPaper);
            slidesOnPageOptions.asc_setIsPrintComments(this._changedProps.slidesOnPage.options.isPrintComments);

            const slidePrintOptions = adjPrintParams.asc_getSlidePrintOptions();
            slidePrintOptions.asc_setIsPrintSlideBackground(this._changedProps.slidePrintOptions.isPrintSlideBackground);
            slidePrintOptions.asc_setIsPrintHiddenSlides(this._changedProps.slidePrintOptions.isPrintHiddenSlides);

            const rangeType = this.printSettings.cmbRange.getValue();
            if(rangeType) {
                const rangeOptions = adjPrintParams.asc_getRangeOptions();
                const rangeValue = this.printSettings.inputPages.getValue();
                rangeOptions.asc_setRangeType(rangeType);
                if(rangeType === Asc.c_oAscPresentationRangeType.CustomRange) {
                    rangeOptions.asc_setCustomRange(rangeValue);
                } else if (rangeType === Asc.c_oAscPresentationRangeType.AllSlides) {
                    rangeOptions.asc_setCustomRange('');
                } else if (rangeType === Asc.c_oAscPresentationRangeType.ActiveSlide) {
                    rangeOptions.asc_setCustomRange(String(this._navigationPreview.currentPreviewPage + 1));
                }
            }
        },

        updatePreview: function (needUpdate) {
            if (this._isPreviewVisible) {
                this.printSettings.$previewBox.removeClass('hidden');

                this.updatePrintOptions(this.adjPrintParams);

                var opts = new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86);
                opts.asc_setAdvancedOptions(this.adjPrintParams);

                let pageCount = this.api.asc_updatePrintPreview(opts);
                this.printSettings.$previewBox.toggleClass('hidden', !pageCount);
                this.printSettings.$previewEmpty.toggleClass('hidden', !!pageCount);

                let newPage;
                if (this._currentPrintSlidesCount !== this._changedProps.slidesOnPage.slidesCount) {
                    newPage = 0;
                    this._currentPrintSlidesCount = this._changedProps.slidesOnPage.slidesCount;
                } else if (this._navigationPreview.currentPreviewPage > pageCount - 1) {
                    newPage = Math.max(0, pageCount - 1);
                } else {
                    newPage = this._navigationPreview.currentPreviewPage;
                }

                this.updateNavigationButtons(newPage, pageCount);
                this.drawPrintPreview();
                this.printSettings.printScroller && this.printSettings.printScroller.update();
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

        changeCurrentPreviewPage: function(page) {
            this._navigationPreview.currentPreviewPage = page;
            this.drawPrintPreview();
        },        

        drawPrintPreview: function() {
            this.api.asc_drawPrintPreview(this._navigationPreview.currentPreviewPage);
        },

        setPrintersInfo: function(currentPrinter, list, isWaitingForPrinters) {
            this._state.currentPrinter = currentPrinter || this._state.currentPrinter;
            this._state.printersList = _.uniq(_.union(this._state.printersList, list), function(option) {
                return option.name;
            });
            this._state.isWaitingForPrinters = !!isWaitingForPrinters;
            this._state.shouldUpdateCmbPrinter = true;

            if(this.printSettings && this.printSettings.isVisible() && this._state.shouldUpdateCmbPrinter) {
                this.updateCmbPrinter();
            }
        },

        updateCmbPrinter: function() {
            this.printSettings.updateCmbPrinter(this._state.currentPrinter, this._state.printersList, this._state.isWaitingForPrinters);
            this._state.shouldUpdateCmbPrinter = false;
        },

        updateNavigationButtons: function (page, count) {
            this._navigationPreview.currentPreviewPage = page;
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
            var curPage = this._navigationPreview.currentPreviewPage,
                pageCount = this._navigationPreview.pageCount;
            this.printSettings.btnPrevPage.setDisabled(curPage < 1);
            this.printSettings.btnNextPage.setDisabled(curPage > pageCount - 2);
        },

        onBtnPrint: function(print, useSystemDialog) {
            this._isPrint = print;
            if (this.printSettings.cmbRange.getValue()===-1 && this.printSettings.inputPages.checkValidate() !== true)  {
                this.printSettings.inputPages.focus();
                this.isInputFirstChange = true;
                return;
            }
            if (this._navigationPreview.pageCount<1)
                return;

            const adjPrintParams = new Asc.CAscPresentationPrintOptions();
            this.updatePrintOptions(adjPrintParams);
            var rec = this.printSettings.cmbPaperSize.getSelectedRecord();
            const printerOption = (this.printSettings.cmbPrinter ? this.printSettings.cmbPrinter.getSelectedRecord() : null);
            const colorPrintingValue = this.printSettings.cmbColorPrinting
                ? this.printSettings.cmbColorPrinting.getValue()
                : null;
            var size = rec ? rec.size : this._changedProps.paperSize; 
            adjPrintParams.asc_setNativeOptions({
                usesystemdialog: useSystemDialog,
                printer: printerOption ? printerOption.value : null,
                colorMode: colorPrintingValue === 'color',
                pages: 'all',   //Stub property. The pages range settings are configured in CAscPresentationPrintOptions.asc_getRangeOptions
                paperSize: {
                    w: size ? size[0] : undefined,
                    h: size ? size[1] : undefined,
                    preset: rec ? rec.caption : undefined
                },
                copies: this.printSettings.spnCopies ? this.printSettings.spnCopies.getNumberValue() || 1 : 1,
                sides: this.printSettings.cmbSides ? this.printSettings.cmbSides.getValue() : 'one'
            });

            if ( print ) {
                var opts = new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86);
                opts.asc_setAdvancedOptions(adjPrintParams);
                this.api.asc_Print(opts);
            } else {
                var opts = new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF);
                opts.asc_setAdvancedOptions(adjPrintParams);
                this.api.asc_DownloadAs(opts);
            }
            this.printSettings.menu.hide();
        },

        inputPagesChanging: function (input, value) {
            this.isInputFirstChange && this.printSettings.inputPages.showError();
            this.isInputFirstChange = false;

            if (value.length<1)
                this.printSettings.cmbRange.setValue(Asc.c_oAscPresentationRangeType.AllSlides);
            else if (this.printSettings.cmbRange.getValue()!==-1)
                this.printSettings.cmbRange.setValue(Asc.c_oAscPresentationRangeType.CustomRange);
            this.updatePreview();
        },

        onPaperSizeSelect: function(combo, record) {
            if (record) {
                this._changedProps.paperSize = record.size;
                this.printSettings.setOriginalPageSize(record.size[0], record.size[1]);
                this.api.asc_setNoteSizesByPrinter(record.size[0], record.size[1]);
                this.updatePreview();
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

        txtPrintRangeInvalid: 'Invalid print range'
    }, PE.Controllers.Print || {}));
});