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
 *  SlideMasterTab.js
 *
 *  Created on 01.06.2025
 *
 */

define([
    'core',
    'presentationeditor/main/app/view/SlideMasterTab',
], function () {
    'use strict';

    PE.Controllers.SlideMasterTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'SlideMasterTab'
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
            };
            Common.NotificationCenter.on('document:ready', _.bind(this.onDocumentReady, this));
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onChangeViewMode', _.bind(this.onApiChangeViewMode, this));
                this.api.asc_registerCallback('asc_onLayoutTitle', _.bind(this.onApiLayoutTitle, this));
                this.api.asc_registerCallback('asc_onLayoutFooter', _.bind(this.onApiLayoutFooter, this));
                this.api.asc_registerCallback('asc_onFocusObject', _.bind(this.onApiFocusObject, this));
                this.api.asc_registerCallback('asc_onEndAddShape', _.bind(this.onApiEndAddShape, this));
            }
            return this;
        },

        setConfig: function(config) {
            var mode = config.mode;
            this.toolbar = config.toolbar;
            this.view = this.createView('SlideMasterTab', {
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
            });
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

        createToolbarPanel: function() {
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

        onApiLayoutTitle: function (status) {
            const currentValue = this.view.chTitle.getValue();

            if (currentValue !== status) {
                this.view.chTitle.setValue(status, true);
            }
        },

        onApiLayoutFooter: function (status) {
            if ((this.view.chFooters.getValue() === 'checked') !== status)
                this.view.chFooters.setValue(status, true);
        },

        onInsertLayout: function () {
            this.api.asc_AddSlideLayout();
        },

        onTitleHide: function (view, status) {
            this.api.asc_setLayoutTitle(status);
        },

        onFootersHide: function (view, status) {
            this.api.asc_setLayoutFooter(status);
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
            Common.component.Analytics.trackEvent('SlideMasterTab', 'Add Placeholder');
        },

        changeViewMode: function (mode) {
            var isMaster = mode === 'master';

            if (this._state.slideMasterMode !== isMaster) {
                this._state.slideMasterMode = isMaster;
                this.view.fireEvent('viewmode:change', [isMaster ? 'master' : 'normal']);
                this.api.asc_changePresentationViewMode(isMaster ? Asc.c_oAscPresentationViewMode.masterSlide : Asc.c_oAscPresentationViewMode.normal);
            }
        },

        onApiChangeViewMode: function (mode) {
            var isMaster = mode === Asc.c_oAscPresentationViewMode.masterSlide;
            this.changeViewMode(isMaster ? 'master' : 'normal');
        },

        onChangeViewMode: function (mode) {
            this.changeViewMode(mode);
        },

    }, PE.Controllers.SlideMasterTab || {}));
});
