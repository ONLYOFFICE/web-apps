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

/**
 *  SlideMasterTab.js
 *
 *  Created on 01.06.2025
 *
 */

define([
    'core',
    'presentationeditor/main/app/view/SlideMasterTab',
    'presentationeditor/main/app/view/HandoutMasterTab',
    'presentationeditor/main/app/view/NotesMasterTab',
], function () {
    'use strict';

    PE.Controllers.SlideMasterTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'SlideMasterTab',
            'HandoutMasterTab',
            'NotesMasterTab'
        ],
        sdkViewName : '#id_main',

        initialize: function () {
            var me = this;

             this.checkInsertAutoshape = function(e) {
                var cmp = $(e.target),
                    cmp_sdk = cmp.closest('#editor_sdk'),
                    btn_id = cmp.closest('button').attr('id');
                if (btn_id===undefined)
                    btn_id = cmp.closest('.btn-group').attr('id');
                if (btn_id===undefined)
                    btn_id = cmp.closest('.combo-dataview').attr('id');

                if (cmp.attr('id') != 'editor_sdk' && cmp_sdk.length<=0) {
                    if (me.view.btnInsertPlaceholder.pressed && me.view.btnInsertPlaceholder.id !== btn_id)
                    {
                        me._isAddingShape = false;
                        me._addAutoshape(false);
                        me.view.btnInsertPlaceholder.toggle(false, true);
                        Common.NotificationCenter.trigger('edit:complete', me.view);
                    }
                }
            };
        },
        onLaunch: function () {
            this._state = {
                slideMasterMode: false,
                handoutMasterMode: false,
                notesMasterMode: false
            };
            Common.NotificationCenter.on('document:ready', _.bind(this.onDocumentReady, this));
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onChangeViewMode', _.bind(this.onApiChangeViewMode, this));
                this.api.asc_registerCallback('asc_onTitle', _.bind(this.onApiTitle, this));
                this.api.asc_registerCallback('asc_onFooter', _.bind(this.onApiFooter, this));
                this.api.asc_registerCallback('asc_onHeader', _.bind(this.onApiHeader, this));
                this.api.asc_registerCallback('asc_onDate', _.bind(this.onApiDate, this));
                this.api.asc_registerCallback('asc_onSlideImage', _.bind(this.onApiSlideImage, this));
                this.api.asc_registerCallback('asc_onPageNumber', _.bind(this.onApiPageNumber, this));
                this.api.asc_registerCallback('asc_onBody', _.bind(this.onApiBody, this));
                this.api.asc_registerCallback('asc_onFocusObject', _.bind(this.onApiFocusObject, this));
                this.api.asc_registerCallback('asc_onEndAddShape', _.bind(this.onApiEndAddShape, this));
            }
            return this;
        },

        onApiBody: function (status) {
            if ((this.notesMaster.chBody.getValue() === 'checked') !== status)
                this.notesMaster.chBody.setValue(status, true);
        },

        onApiPageNumber: function (status) {
            if (this.api.asc_IsHandoutMasterMode()) {
                if ((this.handoutMaster.chPageNumber.getValue() === 'checked') !== status)
                this.handoutMaster.chPageNumber.setValue(status, true);
            } else if (this.api.asc_IsNotesMasterMode()) {
                if ((this.notesMaster.chPageNumber.getValue() === 'checked') !== status)
                this.notesMaster.chPageNumber.setValue(status, true);
            }
        },

        onApiSlideImage: function (status) {
            if ((this.notesMaster.chSlideImage.getValue() === 'checked') !== status)
                this.notesMaster.chSlideImage.setValue(status, true);
        },

        onApiHeader: function (status) {
            if (this.api.asc_IsHandoutMasterMode()) {
                if ((this.handoutMaster.chHeader.getValue() === 'checked') !== status)
                this.handoutMaster.chHeader.setValue(status, true);
            } else if (this.api.asc_IsNotesMasterMode()) {
                if ((this.notesMaster.chHeader.getValue() === 'checked') !== status)
                this.notesMaster.chHeader.setValue(status, true);
            }
        },

        onApiDate: function (status) {
            if (this.api.asc_IsHandoutMasterMode()) {
                if ((this.handoutMaster.chDate.getValue() === 'checked') !== status)
                this.handoutMaster.chDate.setValue(status, true);
            } else if (this.api.asc_IsNotesMasterMode()) {
                if ((this.notesMaster.chDate.getValue() === 'checked') !== status)
                this.notesMaster.chDate.setValue(status, true);
            }
        },

        setConfig: function(config) {
            var mode = config.mode;
            this.toolbar = config.toolbar;
            this.view = this.createView('SlideMasterTab', {
                toolbar: this.toolbar.toolbar,
                mode: mode,
                compactToolbar: this.toolbar.toolbar.isCompactView
            });
            this.handoutMaster = this.createView('HandoutMasterTab', {
                toolbar: this.toolbar.toolbar,
                mode: mode,
                compactToolbar: this.toolbar.toolbar.isCompactView
            });
            this.notesMaster = this.createView('NotesMasterTab', {
                toolbar: this.toolbar.toolbar,
                mode: mode,
                compactToolbar: this.toolbar.toolbar.isCompactView
            });
            this.addListeners({
                'SlideMasterTab': {
                    'mode:normal': _.bind(this.onChangeViewMode, this, 'normal'),
                    'insert:layout': _.bind(this.onInsertLayout, this),
                    'title:hide': _.bind(this.onTitleHide, this),
                    'footers:hide': _.bind(this.onFootersHide, this),
                    'insert:slide-master': _.bind(this.onInsertSlideMaster, this),
                    'insert:placeholder-btn': _.bind(this.onBtnInsertPlaceholder, this),
                    'insert:placeholder-menu': _.bind(this.onMenuInsertPlaceholder, this),
                },
                'HandoutMasterTab': {
                    'mode:normal': _.bind(this.onChangeViewMode, this, 'normal'),
                    'handout:orientation': _.bind(this.onChangeHandoutOrientation, this),
                    'handout:slides': _.bind(this.onSlidesPerPage, this),
                    'handout:headerchange': _.bind(this.onHeaderChange, this),
                    'handout:footerchange': _.bind(this.onFooterChange, this),
                    'handout:datechange': _.bind(this.onDateChange, this),
                    'handout:pagenumchange': _.bind(this.onPageNumChange, this),
                },
                'NotesMasterTab': {
                    'mode:normal': _.bind(this.onChangeViewMode, this, 'normal'),
                    'notes:orientation': _.bind(this.onChangeNotesOrientation, this),
                    'notes:headerchange': _.bind(this.onHeaderChange, this),
                    'notes:footerchange': _.bind(this.onFooterChange, this),
                    'notes:datechange': _.bind(this.onDateChange, this),
                    'notes:pagenumchange': _.bind(this.onPageNumChange, this),
                    'notes:imagechange': _.bind(this.onSlideImageChange, this),
                    'notes:bodychange': _.bind(this.onBodyChange, this),
                },
            });
        },

        onSlideImageChange: function (value) {
            this.api.asc_setSlideImage(value);
        },

        onBodyChange: function (value) {
            this.api.asc_setBody(value);
        },

        onChangeNotesOrientation: function (value) {
            if (value === 'portrait') this.api.asc_setPageOrientation(Asc.c_oAscPageOrientation.PagePortrait)
            else this.api.asc_setPageOrientation(Asc.c_oAscPageOrientation.PageLandscape)
        },

        onDateChange: function (value) {
            this.api.asc_setDate(value);
        },

        onPageNumChange: function (value) {
            this.api.asc_setPageNumber(value);
        },

        onFooterChange: function (value) {
            this.api.asc_setFooter(value);
        },

        onHeaderChange: function (value) {
            this.api.asc_setTitle(value);
        },

        onSlidesPerPage: function (value) {
            if (value < 10) this.api.asc_setHandoutPageCount(value)
        },

        onChangeHandoutOrientation: function (value) {
            if (value === 'portrait') this.api.asc_setPageOrientation(Asc.c_oAscPageOrientation.PagePortrait)
            else this.api.asc_setPageOrientation(Asc.c_oAscPageOrientation.PageLandscape)
        },

        _addAutoshape:  function(isstart, type) {
            if (this.api) {
                if (isstart) {
                    this.api.StartAddShape(type, true);
                    $(document.body).on('mouseup', this.checkInsertAutoshape);
                } else {
                    this.api.StartAddShape('', false);
                    $(document.body).off('mouseup', this.checkInsertAutoshape);
                }
            }
        },

        onApiFocusObject: function(selectedObjects) {
            var in_slide_master = false;
            var i = -1, type, pr;
            while (++i < selectedObjects.length) {
                type = selectedObjects[i].get_ObjectType();
                pr   = selectedObjects[i].get_ObjectValue();
                if (type == Asc.c_oAscTypeSelectElement.Slide) {
                    in_slide_master = pr.get_IsMasterSelected();
                }
            }
            Common.Utils.lockControls(Common.enumLock.inSlideMaster, in_slide_master, {
                array: [
                    this.view.btnInsertPlaceholder,
                    this.view.chTitle,
                    this.view.chFooters
                ]
            });
        },

        onApiEndAddShape: function() {
            if (this.view.btnInsertPlaceholder && this.view.btnInsertPlaceholder.pressed)
                this.view.btnInsertPlaceholder.toggle(false, true);
        },

        SetDisabled: function(state) {
            this.view && this.view.SetDisabled(state);
        },

        createToolbarPanel: function(name) {
            if (name === 'handout') {
                return this.handoutMaster.getPanel();
            } else if (name === 'notes') {
                return this.notesMaster.getPanel();
            }
            return this.view.getPanel();
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true);
        },

        onDocumentReady: function() {
            this.view && this.view.lockedControls
            ? Common.Utils.lockControls(Common.enumLock.disableOnStart, false, {array: this.view.lockedControls})
            : null;
        },

        onInsertSlideMaster: function () {
            this.api.asc_AddMasterSlide();
        },

        onApiTitle: function (status) {
            const currentValue = this.view.chTitle.getValue();

            if (currentValue !== status) {
                this.view.chTitle.setValue(status, true);
            }
        },

        onApiFooter: function (status) {
            if (this.api.asc_IsMasterSlideMode()) {
                if ((this.view.chFooters.getValue() === 'checked') !== status)
                this.view.chFooters.setValue(status, true);
            } else if (this.api.asc_IsHandoutMasterMode()) {
                if ((this.handoutMaster.chFooter.getValue() === 'checked') !== status)
                this.handoutMaster.chFooter.setValue(status, true);
            } else if (this.api.asc_IsNotesMasterMode()) {
                if ((this.notesMaster.chFooter.getValue() === 'checked') !== status)
                this.notesMaster.chFooter.setValue(status, true);
            }
        },

        onInsertLayout: function () {
            this.api.asc_AddSlideLayout();
        },

        onTitleHide: function (view, status) {
            this.api.asc_setTitle(status);
        },

        onFootersHide: function (view, status) {
            this.api.asc_setFooter(status);
        },

        onBtnInsertPlaceholder: function (btn, e) {
            btn.menu.getItems(true).forEach(function(item) {
                if(item.value == btn.options.currentType)
                    item.setChecked(true);
            });
            if(!btn.pressed) {
                btn.menu.clearAll(true);
            }
            this.onInsertPlaceholder(btn.options.currentType, btn, e);
        },

        _addPlaceHolder: function (isstart, type, isVertical) {
            if (this.api) {
                if (isstart) {
                    this.api.asc_StartAddPlaceholder(type, isVertical, true);
                    $(document.body).on('mouseup', this.checkInsertAutoshape);
                } else {
                    this.api.asc_StartAddPlaceholder('', undefined, false);
                    $(document.body).off('mouseup', this.checkInsertAutoshape);
                }
            }
        },

        onMenuInsertPlaceholder: function (btn, e) {
            var oldType = btn.options.currentType;
            var newType = e.value;

            if(newType != oldType){
                btn.updateHint([e.options.hintForMainBtn, this.view.tipInsertPlaceholder]);
                btn.changeIcon({
                    next: e.options.iconClsForMainBtn,
                    curr: btn.menu.getItems(true).filter(function(item){return item.value == oldType})[0].options.iconClsForMainBtn
                });
                btn.options.currentType = newType;
            }
            this.onInsertPlaceholder(newType, btn, e);
        },

        onInsertPlaceholder: function (type, btn, e) {
            var value,
                isVertical;
            switch (type) {
                case 1:
                    value = null;
                    break;
                case 2:
                    value = null;
                    isVertical = true;
                    break;
                case 3:
                    value = AscFormat.phType_body;
                    break;
                case 4:
                    value = AscFormat.phType_body;
                    isVertical = true;
                    break;
                case 5:
                    value = AscFormat.phType_pic;
                    break;
                case 6:
                    value = AscFormat.phType_chart;
                    break;
                case 7:
                    value = AscFormat.phType_tbl;
                    break;
                case 8:
                    value = AscFormat.phType_dgm;
                    break;
            }

            this._addPlaceHolder(btn.pressed, value, isVertical);

            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        changeViewMode: function (mode) {
            var isMaster = mode === 'master';
            var isHandout = mode === 'handout';
            var isNotes = mode === 'notes';
            if (this._state.slideMasterMode !== isMaster) {
                this._state.slideMasterMode = isMaster;
                this.view.fireEvent('viewmode:change', [isMaster ? 'master' : 'normal']);
                this.api.asc_changePresentationViewMode(isMaster ? Asc.c_oAscPresentationViewMode.masterSlide : Asc.c_oAscPresentationViewMode.normal);
            }
            if (this._state.handoutMasterMode !== isHandout) {
                this._state.handoutMasterMode = isHandout;
                this.view.fireEvent('viewmode:change', [isHandout ? 'handout' : 'normal']);
                this.api.asc_changePresentationViewMode(isHandout ? Asc.c_oAscPresentationViewMode.handoutMaster : Asc.c_oAscPresentationViewMode.normal);
            }
            if (this._state.notesMasterMode !== isNotes) {
                this._state.notesMasterMode = isNotes;
                this.view.fireEvent('viewmode:change', [isNotes ? 'notes' : 'normal']);
                this.api.asc_changePresentationViewMode(isNotes ? Asc.c_oAscPresentationViewMode.notesMaster : Asc.c_oAscPresentationViewMode.normal);
            }
        },

        onApiChangeViewMode: function (mode) {
            var isMaster = mode === Asc.c_oAscPresentationViewMode.masterSlide;
            var isHandout = mode === Asc.c_oAscPresentationViewMode.handoutMaster;
            var isNotes = mode === Asc.c_oAscPresentationViewMode.notesMaster;
            this.changeViewMode(isMaster ? 'master' : isHandout ? 'handout' : isNotes ? 'notes' : 'normal');
        },

        onChangeViewMode: function (mode) {
            this.changeViewMode(mode);
        },

    }, PE.Controllers.SlideMasterTab || {}));
});
