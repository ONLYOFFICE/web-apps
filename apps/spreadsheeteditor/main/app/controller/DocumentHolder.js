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
/**
 *  DocumentHolder.js
 *
 *  DocumentHolder controller
 *
 *  Created by Julia Radzhabova on 3/28/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'common/main/lib/util/utils',
    'common/main/lib/util/Shortcuts',
    'common/main/lib/view/CopyWarningDialog',
    'common/main/lib/view/OpenDialog',
    'spreadsheeteditor/main/app/view/DocumentHolder',
    'spreadsheeteditor/main/app/view/HyperlinkSettingsDialog',
    'spreadsheeteditor/main/app/view/ParagraphSettingsAdvanced',
    'spreadsheeteditor/main/app/view/ImageSettingsAdvanced',
    'spreadsheeteditor/main/app/view/SetValueDialog',
    'spreadsheeteditor/main/app/view/AutoFilterDialog'
], function () {
    'use strict';

    SSE.Controllers.DocumentHolder = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [],
        views: [
            'DocumentHolder'
        ],

        initialize: function() {
            var me = this;

            me.tooltips = {
                hyperlink: {},
                /** coauthoring begin **/
                comment:{},
                /** coauthoring end **/
                coauth: {
                    ttHeight: 20
                },
                row_column: {
                    ttHeight: 20
                },
                filter: {ttHeight: 40},
                func_arg: {}
            };
            me.mouse = {};
            me.popupmenu = false;
            me.rangeSelectionMode = false;
            me.namedrange_locked = false;
            me._currentMathObj = undefined;
            me._currentParaObjDisabled = false;
            me._isDisabled = false;
            me._state = {};
            /** coauthoring begin **/
            this.wrapEvents = {
                apiHideComment: _.bind(this.onApiHideComment, this)
            };
            /** coauthoring end **/

            this.addListeners({
                'DocumentHolder': {
                    'createdelayedelements': this.onCreateDelayedElements
                }
            });

            var keymap = {};
            this.hkComments = 'alt+h';
            keymap[this.hkComments] = function() {
                me.onAddComment();
                return false;
            };
            Common.util.Shortcuts.delegateShortcuts({shortcuts:keymap});
        },

        onLaunch: function() {
            var me = this;

            me.documentHolder = this.createView('DocumentHolder');

//            me.documentHolder.on('render:after', _.bind(me.onAfterRender, me));

            me.documentHolder.render();
            me.documentHolder.el.tabIndex = -1;

            $(document).on('mousewheel',    _.bind(me.onDocumentWheel, me));
            $(document).on('mousedown',     _.bind(me.onDocumentRightDown, me));
            $(document).on('mouseup',       _.bind(me.onDocumentRightUp, me));
            $(document).on('keydown',       _.bind(me.onDocumentKeyDown, me));
            $(document).on('mousemove',     _.bind(me.onDocumentMouseMove, me));
            $(window).on('resize',          _.bind(me.onDocumentResize, me));
            var viewport = SSE.getController('Viewport').getView('Viewport');
            viewport.hlayout.on('layout:resizedrag', _.bind(me.onDocumentResize, me));

            Common.NotificationCenter.on({
                'window:show': function(e){
                    me.hideHyperlinkTip();
                },
                'modal:show': function(e){
                    me.hideCoAuthTips();
                },
                'layout:changed': function(e){
                    me.hideHyperlinkTip();
                    me.hideCoAuthTips();
                    me.onDocumentResize();
                },
                'cells:range': function(status){
                    me.onCellsRange(status);
                }
            });

            Common.Gateway.on('processmouse', _.bind(me.onProcessMouse, me));
        },

        onCreateDelayedElements: function(view) {
            var me = this;
            if (me.permissions.isEdit) {
                view.pmiCut.on('click',                             _.bind(me.onCopyPaste, me));
                view.pmiCopy.on('click',                            _.bind(me.onCopyPaste, me));
                view.pmiPaste.on('click',                           _.bind(me.onCopyPaste, me));
                view.pmiImgCut.on('click',                          _.bind(me.onCopyPaste, me));
                view.pmiImgCopy.on('click',                         _.bind(me.onCopyPaste, me));
                view.pmiImgPaste.on('click',                        _.bind(me.onCopyPaste, me));
                view.pmiTextCut.on('click',                         _.bind(me.onCopyPaste, me));
                view.pmiTextCopy.on('click',                        _.bind(me.onCopyPaste, me));
                view.pmiTextPaste.on('click',                       _.bind(me.onCopyPaste, me));
                view.pmiInsertEntire.on('click',                    _.bind(me.onInsertEntire, me));
                view.pmiDeleteEntire.on('click',                    _.bind(me.onDeleteEntire, me));
                view.pmiInsertCells.menu.on('item:click',           _.bind(me.onInsertCells, me));
                view.pmiDeleteCells.menu.on('item:click',           _.bind(me.onDeleteCells, me));
                view.pmiSparklines.menu.on('item:click',            _.bind(me.onClear, me));
                view.pmiSortCells.menu.on('item:click',             _.bind(me.onSortCells, me));
                view.pmiFilterCells.menu.on('item:click',           _.bind(me.onFilterCells, me));
                view.pmiReapply.on('click',                         _.bind(me.onReapply, me));
                view.pmiClear.menu.on('item:click',                 _.bind(me.onClear, me));
                view.pmiSelectTable.menu.on('item:click',           _.bind(me.onSelectTable, me));
                view.pmiInsertTable.menu.on('item:click',           _.bind(me.onInsertTable, me));
                view.pmiDeleteTable.menu.on('item:click',           _.bind(me.onDeleteTable, me));
                view.pmiInsFunction.on('click',                     _.bind(me.onInsFunction, me));
                view.menuAddHyperlink.on('click',                   _.bind(me.onInsHyperlink, me));
                view.menuEditHyperlink.on('click',                  _.bind(me.onInsHyperlink, me));
                view.menuRemoveHyperlink.on('click',                _.bind(me.onDelHyperlink, me));
                view.pmiRowHeight.menu.on('item:click',             _.bind(me.onSetSize, me));
                view.pmiColumnWidth.menu.on('item:click',           _.bind(me.onSetSize, me));
                view.pmiEntireHide.on('click',                      _.bind(me.onEntireHide, me));
                view.pmiEntireShow.on('click',                      _.bind(me.onEntireShow, me));
                view.pmiFreezePanes.on('click',                     _.bind(me.onFreezePanes, me));
                view.pmiEntriesList.on('click',                     _.bind(me.onEntriesList, me));
                /** coauthoring begin **/
                view.pmiAddComment.on('click',                      _.bind(me.onAddComment, me));
                /** coauthoring end **/
                view.pmiAddNamedRange.on('click',                   _.bind(me.onAddNamedRange, me));
                view.menuImageArrange.menu.on('item:click',         _.bind(me.onImgMenu, me));
                view.menuImgRotate.menu.on('item:click',            _.bind(me.onImgMenu, me));
                view.menuImgCrop.menu.on('item:click',              _.bind(me.onImgCrop, me));
                view.menuImageAlign.menu.on('item:click',           _.bind(me.onImgMenuAlign, me));
                view.menuParagraphVAlign.menu.on('item:click',      _.bind(me.onParagraphVAlign, me));
                view.menuParagraphDirection.menu.on('item:click',   _.bind(me.onParagraphDirection, me));
                view.menuParagraphBullets.menu.on('item:click',     _.bind(me.onSelectNoneBullet, me));
                view.menuAddHyperlinkShape.on('click',              _.bind(me.onInsHyperlink, me));
                view.menuEditHyperlinkShape.on('click',             _.bind(me.onInsHyperlink, me));
                view.menuRemoveHyperlinkShape.on('click',           _.bind(me.onRemoveHyperlinkShape, me));
                view.pmiTextAdvanced.on('click',                    _.bind(me.onTextAdvanced, me));
                view.mnuShapeAdvanced.on('click',                   _.bind(me.onShapeAdvanced, me));
                view.mnuChartEdit.on('click',                       _.bind(me.onChartEdit, me));
                view.mnuImgAdvanced.on('click',                     _.bind(me.onImgAdvanced, me));
                view.textInShapeMenu.on('render:after',             _.bind(me.onTextInShapeAfterRender, me));
                view.menuSignatureEditSign.on('click',              _.bind(me.onSignatureClick, me));
                view.menuSignatureEditSetup.on('click',             _.bind(me.onSignatureClick, me));
                view.menuImgOriginalSize.on('click',                _.bind(me.onOriginalSizeClick, me));
                view.menuImgReplace.menu.on('item:click',           _.bind(me.onImgReplace, me));
                view.pmiNumFormat.menu.on('item:click',             _.bind(me.onNumberFormatSelect, me));
                view.pmiNumFormat.menu.on('show:after',             _.bind(me.onNumberFormatOpenAfter, me));
                view.pmiAdvancedNumFormat.on('click',               _.bind(me.onCustomNumberFormat, me));

            } else {
                view.menuViewCopy.on('click',                       _.bind(me.onCopyPaste, me));
                view.menuViewUndo.on('click',                       _.bind(me.onUndo, me));
                view.menuViewAddComment.on('click',                 _.bind(me.onAddComment, me));
                view.menuSignatureViewSign.on('click',              _.bind(me.onSignatureClick, me));
                view.menuSignatureDetails.on('click',               _.bind(me.onSignatureClick, me));
                view.menuSignatureViewSetup.on('click',             _.bind(me.onSignatureClick, me));
                view.menuSignatureRemove.on('click',                _.bind(me.onSignatureClick, me));
            }

            var documentHolderEl = view.cmpEl;

            if (documentHolderEl) {
                documentHolderEl.on({
                    mousedown: function(e) {
                        if (e.target.localName == 'canvas' && e.button != 2) {
                            Common.UI.Menu.Manager.hideAll();
                        }
                    },
                    click: function(e) {
                        if (me.api) {
                            me.api.isTextAreaBlur = false;
                            if (e.target.localName == 'canvas' && !me.isEditFormula) {
                                documentHolderEl.focus();
                            }
                        }
                    }
                });

                //NOTE: set mouse wheel handler

                var addEvent = function( elem, type, fn ) {
                    elem.addEventListener ? elem.addEventListener( type, fn, false ) : elem.attachEvent( "on" + type, fn );
                };

                var eventname=(/Firefox/i.test(navigator.userAgent))? 'DOMMouseScroll' : 'mousewheel';
                addEvent(view.el, eventname, _.bind(this.onDocumentWheel,this));

                me.cellEditor = $('#ce-cell-content');
            }
        },

        loadConfig: function(data) {
            this.editorConfig = data.config;
        },

        setMode: function(permissions) {
            this.permissions = permissions;
            /** coauthoring begin **/
            !(this.permissions.canCoAuthoring && this.permissions.canComments)
                ? Common.util.Shortcuts.suspendEvents(this.hkComments)
                : Common.util.Shortcuts.resumeEvents(this.hkComments);
            /** coauthoring end **/
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onContextMenu',          _.bind(this.onApiContextMenu, this));
            this.api.asc_registerCallback('asc_onMouseMove',            _.bind(this.onApiMouseMove, this));
            /** coauthoring begin **/
            this.api.asc_registerCallback('asc_onHideComment',          this.wrapEvents.apiHideComment);
//            this.api.asc_registerCallback('asc_onShowComment',          this.wrapEvents.apiShowComment);
            /** coauthoring end **/
            this.api.asc_registerCallback('asc_onHyperlinkClick',       _.bind(this.onApiHyperlinkClick, this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onApiCoAuthoringDisconnect, this));
            Common.NotificationCenter.on('api:disconnect',              _.bind(this.onApiCoAuthoringDisconnect, this));
            this.api.asc_registerCallback('asc_onSelectionChanged', _.bind(this.onSelectionChanged, this));
            if (this.permissions.isEdit===true) {
                this.api.asc_registerCallback('asc_onSetAFDialog',          _.bind(this.onApiAutofilter, this));
                this.api.asc_registerCallback('asc_onEditCell', _.bind(this.onApiEditCell, this));
                this.api.asc_registerCallback('asc_onLockDefNameManager', _.bind(this.onLockDefNameManager, this));
                this.api.asc_registerCallback('asc_onEntriesListMenu', _.bind(this.onEntriesListMenu, this)); // Alt + Down
                this.api.asc_registerCallback('asc_onFormulaCompleteMenu', _.bind(this.onFormulaCompleteMenu, this));
                this.api.asc_registerCallback('asc_onShowSpecialPasteOptions', _.bind(this.onShowSpecialPasteOptions, this));
                this.api.asc_registerCallback('asc_onHideSpecialPasteOptions', _.bind(this.onHideSpecialPasteOptions, this));
                this.api.asc_registerCallback('asc_onToggleAutoCorrectOptions', _.bind(this.onToggleAutoCorrectOptions, this));
                this.api.asc_registerCallback('asc_onFormulaInfo', _.bind(this.onFormulaInfo, this));
                this.api.asc_registerCallback('asc_ChangeCropState', _.bind(this.onChangeCropState, this));
            }
            return this;
        },

        resetApi: function(api) {
            /** coauthoring begin **/
            this.api.asc_unregisterCallback('asc_onHideComment',    this.wrapEvents.apiHideComment);
//            this.api.asc_unregisterCallback('asc_onShowComment',    this.wrapEvents.apiShowComment);
            this.api.asc_registerCallback('asc_onHideComment',      this.wrapEvents.apiHideComment);
//            this.api.asc_registerCallback('asc_onShowComment',      this.wrapEvents.apiShowComment);
            /** coauthoring end **/
        },

        onCopyPaste: function(item) {
            var me = this;
            if (me.api) {
                var res =  (item.value == 'cut') ? me.api.asc_Cut() : ((item.value == 'copy') ? me.api.asc_Copy() : me.api.asc_Paste());
                if (!res) {
                    var value = Common.localStorage.getItem("sse-hide-copywarning");
                    if (!(value && parseInt(value) == 1)) {
                        (new Common.Views.CopyWarningDialog({
                            handler: function(dontshow) {
                                if (dontshow) Common.localStorage.setItem("sse-hide-copywarning", 1);
                                Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                            }
                        })).show();
                    }
                } else
                    Common.component.Analytics.trackEvent('ToolBar', 'Copy Warning');
            }
            Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
        },

        onInsertEntire: function(item) {
            if (this.api) {
                switch (this.api.asc_getCellInfo().asc_getFlags().asc_getSelectionType()) {
                    case Asc.c_oAscSelectionType.RangeRow:
                        this.api.asc_insertCells(Asc.c_oAscInsertOptions.InsertRows);
                        break;
                    case Asc.c_oAscSelectionType.RangeCol:
                        this.api.asc_insertCells(Asc.c_oAscInsertOptions.InsertColumns);
                        break;
                }

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Insert Entire');
            }
        },

        onInsertCells: function(menu, item) {
            if (this.api) {
                this.api.asc_insertCells(item.value);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Insert Cells');
            }
        },

        onDeleteEntire: function(item) {
            if (this.api) {
                switch (this.api.asc_getCellInfo().asc_getFlags().asc_getSelectionType()) {
                    case Asc.c_oAscSelectionType.RangeRow:
                        this.api.asc_deleteCells(Asc.c_oAscDeleteOptions.DeleteRows);
                        break;
                    case Asc.c_oAscSelectionType.RangeCol:
                        this.api.asc_deleteCells(Asc.c_oAscDeleteOptions.DeleteColumns);
                        break;
                }

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Delete Entire');
            }
        },

        onDeleteCells: function(menu, item) {
            if (this.api) {
                this.api.asc_deleteCells(item.value);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Delete Cells');
            }
        },

        onSortCells: function(menu, item) {
            if (this.api) {
                var res = this.api.asc_sortCellsRangeExpand();
                if (res) {
                    var config = {
                        width: 500,
                        title: this.txtSorting,
                        msg: this.txtExpandSort,
                        buttons: [  {caption: this.txtExpand, primary: true, value: 'expand'},
                                    {caption: this.txtSortSelected, primary: true, value: 'sort'},
                                    'cancel'],
                        callback: _.bind(function(btn){
                            if (btn == 'expand' || btn == 'sort') {
                                this.api.asc_sortColFilter(item.value, '', undefined, (item.value==Asc.c_oAscSortOptions.ByColorFill) ? this.documentHolder.ssMenu.cellColor : this.documentHolder.ssMenu.fontColor, btn == 'expand');
                            }
                            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                            Common.component.Analytics.trackEvent('DocumentHolder', 'Sort Cells');
                        }, this)
                    };
                    Common.UI.alert(config);
                } else {
                    this.api.asc_sortColFilter(item.value, '', undefined, (item.value==Asc.c_oAscSortOptions.ByColorFill) ? this.documentHolder.ssMenu.cellColor : this.documentHolder.ssMenu.fontColor, res !== null);

                    Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Sort Cells');
                }
            }
        },

        onFilterCells: function(menu, item) {
            if (this.api) {
                var autoFilterObject = new Asc.AutoFiltersOptions(),
                    filterObj = new Asc.AutoFilterObj();
                if (item.value>0) {
                    filterObj.asc_setFilter(new Asc.ColorFilter());
                    filterObj.asc_setType(Asc.c_oAscAutoFilterTypes.ColorFilter);

                    var colorFilter = filterObj.asc_getFilter();
                    colorFilter.asc_setCellColor((item.value==1) ? null : false);
                    colorFilter.asc_setCColor((item.value==1) ? this.documentHolder.ssMenu.cellColor : this.documentHolder.ssMenu.fontColor);
                } else {
                    filterObj.asc_setFilter(new Asc.CustomFilters());
                    filterObj.asc_setType(Asc.c_oAscAutoFilterTypes.CustomFilters);

                    var customFilter = filterObj.asc_getFilter();
                    customFilter.asc_setCustomFilters([new Asc.CustomFilter()]);
                    customFilter.asc_setAnd(true);
                    var customFilters = customFilter.asc_getCustomFilters();
                    customFilters[0].asc_setOperator(Asc.c_oAscCustomAutoFilter.equals);
//                    customFilters[0].asc_setVal('');
                }

                autoFilterObject.asc_setFilterObj(filterObj);
                this.api.asc_applyAutoFilterByType(autoFilterObject);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Filter Cells');
            }
        },

        onReapply: function() {
            this.api.asc_reapplyAutoFilter(this.documentHolder.ssMenu.formatTableName);
        },

        onClear: function(menu, item) {
            if (this.api) {
                this.api.asc_emptyCells(item.value);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Clear');
            }
        },

        onSelectTable: function(menu, item) {
            if (this.api && this.documentHolder.ssMenu.formatTableName) {
                this.api.asc_changeSelectionFormatTable(this.documentHolder.ssMenu.formatTableName, item.value);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Select Table');
            }
        },

        onInsertTable: function(menu, item) {
            if (this.api && this.documentHolder.ssMenu.formatTableName) {
                this.api.asc_insertCellsInTable(this.documentHolder.ssMenu.formatTableName, item.value);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Insert to Table');
            }
        },

        onDeleteTable: function(menu, item) {
            if (this.api && this.documentHolder.ssMenu.formatTableName) {
                this.api.asc_deleteCellsInTable(this.documentHolder.ssMenu.formatTableName, item.value);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Delete from Table');
            }
        },

        onInsFunction: function(item) {
            var controller = this.getApplication().getController('FormulaDialog');
            if (controller && this.api) {
                controller.showDialog();
            }
        },

        onInsHyperlink: function(item) {
            var me = this;
            var win,
                props;

            if (me.api) {
                var wc = me.api.asc_getWorksheetsCount(),
                    i = -1,
                    items = [];

                while (++i < wc) {
                    if (!this.api.asc_isWorksheetHidden(i)) {
                        items.push({displayValue: me.api.asc_getWorksheetName(i), value: me.api.asc_getWorksheetName(i)});
                    }
                }

                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        props = dlg.getSettings();
                        me.api.asc_insertHyperlink(props);
                    }

                    Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                };

                var cell = me.api.asc_getCellInfo();
                props = cell.asc_getHyperlink();

                win = new SSE.Views.HyperlinkSettingsDialog({
                    api: me.api,
                    handler: handlerDlg
                });

                win.show();
                win.setSettings({
                    sheets  : items,
                    currentSheet: me.api.asc_getWorksheetName(me.api.asc_getActiveWorksheetIndex()),
                    props   : props,
                    text    : cell.asc_getText(),
                    isLock  : cell.asc_getFlags().asc_getLockText(),
                    allowInternal: item.options.inCell
                });
            }

            Common.component.Analytics.trackEvent('DocumentHolder', 'Add Hyperlink');
        },

        onDelHyperlink: function(item) {
            if (this.api) {
                this.api.asc_removeHyperlink();

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Remove Hyperlink');
            }
        },

        onSetSize: function(menu, item) {
            if (item.value == 'row-height' || item.value == 'column-width') {
                var me = this;
                (new SSE.Views.SetValueDialog({
                    title: item.caption,
                    startvalue: item.value == 'row-height' ? me.api.asc_getRowHeight() : me.api.asc_getColumnWidth(),
                    maxvalue: item.value == 'row-height' ? Asc.c_oAscMaxRowHeight : Asc.c_oAscMaxColumnWidth,
                    step: item.value == 'row-height' ? 0.75 : 1,
                    rounding: (item.value == 'row-height'),
                    defaultUnit: item.value == 'row-height' ? Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.pt) : me.textSym,
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            var val = dlg.getSettings();
                            if (!isNaN(val))
                                (item.value == 'row-height') ? me.api.asc_setRowHeight(val) : me.api.asc_setColumnWidth(val);
                        }

                        Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                    }
                })).show();
            } else {
                (item.value == 'auto-row-height') ? this.api.asc_autoFitRowHeight() : this.api.asc_autoFitColumnWidth();
                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
            }
        },

        onEntireHide: function(item) {
            if (this.api)
                this.api[item.isrowmenu ? 'asc_hideRows' : 'asc_hideColumns']();
        },

        onEntireShow: function(item) {
            if (this.api)
                this.api[item.isrowmenu ? 'asc_showRows' : 'asc_showColumns']();
        },

        onFreezePanes: function(item) {
            if (this.api)
                this.api.asc_freezePane();
        },

        onEntriesList: function(item) {
            if (this.api) {
                var me = this;
                setTimeout(function() {
                    me.api.asc_showAutoComplete();
                }, 10);
            }
        },

        onAddComment: function(item) {
            if (this.api && this.permissions.canCoAuthoring && this.permissions.canComments) {

                var controller = SSE.getController('Common.Controllers.Comments'),
                    cellinfo = this.api.asc_getCellInfo();
                if (controller) {
                    var comments = cellinfo.asc_getComments();
                    if (comments.length) {
                        controller.onEditComments(comments);
                    } else if (this.permissions.canCoAuthoring || this.commentsCollection.getCommentsReplysCount()<3) {
                        controller.addDummyComment();
                    }
                }
            }
        },

        onAddNamedRange: function(item) {
            if (this.namedrange_locked) {
                Common.NotificationCenter.trigger('namedrange:locked');
                return;
            }

            var me = this,
                wc = me.api.asc_getWorksheetsCount(),
                i = -1,
                items = [];

            while (++i < wc) {
                if (!this.api.asc_isWorksheetHidden(i)) {
                    items.push({displayValue: me.api.asc_getWorksheetName(i), value: i});
                }
            }

            var handlerDlg = function(result, settings) {
                if (result == 'ok' && settings) {
                    me.api.asc_setDefinedNames(settings);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'New Named Range');
                }
                Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
            };

            (new SSE.Views.NamedRangeEditDlg({
                api: me.api,
                handler: handlerDlg,
                sheets  : items,
                currentSheet: me.api.asc_getActiveWorksheetIndex(),
                props   : me.api.asc_getDefaultDefinedName(),
                isEdit  : false
            })).show();
        },

        onImgMenu: function(menu, item) {
            if (this.api) {
                if (item.options.type == 'arrange') {
                    this.api.asc_setSelectedDrawingObjectLayer(item.value);

                    Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Arrange');
                } else if (item.options.type == 'group') {
                    this.api[(item.value == 'grouping') ? 'asc_groupGraphicsObjects' : 'asc_unGroupGraphicsObjects']();

                    Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                    Common.component.Analytics.trackEvent('DocumentHolder', (item.value == 'grouping') ? 'Grouping' : 'Ungrouping');
                } else if (item.options.type == 'rotate') {
                    var properties = new Asc.asc_CImgProperty();
                    properties.asc_putRotAdd((item.value==1 ? 90 : 270) * 3.14159265358979 / 180);
                    this.api.asc_setGraphicObjectProps(properties);

                    Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Rotate');
                } else if (item.options.type == 'flip') {
                    var properties = new Asc.asc_CImgProperty();
                    if (item.value==1)
                        properties.asc_putFlipHInvert(true);
                    else
                        properties.asc_putFlipVInvert(true);
                    this.api.asc_setGraphicObjectProps(properties);

                    Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Flip');
                }
            }
        },

        onImgCrop: function(menu, item) {
            if (this.api) {
                if (item.value == 1) {
                    this.api.asc_cropFill();
                } else if (item.value == 2) {
                    this.api.asc_cropFit();
                } else {
                    item.checked ? this.api.asc_startEditCrop() : this.api.asc_endEditCrop();
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        },

        onImgMenuAlign: function(menu, item) {
            if (this.api) {
                if (item.value>-1 && item.value < 6) {
                    this.api.asc_setSelectedDrawingObjectAlign(item.value);
                    Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Objects Align');
                } else if (item.value == 6) {
                    this.api.asc_DistributeSelectedDrawingObjectHor();
                    Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Distribute');
                } else if (item.value == 7){
                    this.api.asc_DistributeSelectedDrawingObjectVer();
                    Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Distribute');
                }
            }
        },

        onParagraphVAlign: function(menu, item) {
            if (this.api) {
                var properties = new Asc.asc_CImgProperty();
                properties.asc_putVerticalTextAlign(item.value);

                this.api.asc_setGraphicObjectProps(properties);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Paragraph Vertical Align');
            }
        },

        onParagraphDirection: function(menu, item) {
            if (this.api) {
                var properties = new Asc.asc_CImgProperty();
                properties.asc_putVert(item.options.direction);

                this.api.asc_setGraphicObjectProps(properties);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Text Direction');
            }
        },

        onSelectNoneBullet: function(menu, item) {
            if (this.api && item.options.value == -1) {
                this.api.asc_setListType(item.options.value);
                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'List Type');
            }
        },

        onSelectBullets: function(picker, itemView, record, e) {
            var rawData = {},
                isPickerSelect = _.isFunction(record.toJSON);

            if (isPickerSelect){
                if (record.get('selected')) {
                    rawData = record.toJSON();
                } else {
                    // record deselected
                    return;
                }
            } else {
                rawData = record;
            }

            if (this.api)
                this.api.asc_setListType(rawData.type, rawData.subtype);

            if (e.type !== 'click')
                this.documentHolder.textInShapeMenu.hide();

            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
            Common.component.Analytics.trackEvent('DocumentHolder', 'List Type');
        },

        onRemoveHyperlinkShape: function(item) {
            if (this.api) {
                this.api.asc_removeHyperlink();

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Remove Hyperlink');
            }
        },

        onTextAdvanced: function(item) {
            var me = this;

            (new SSE.Views.ParagraphSettingsAdvanced({
                paragraphProps  : item.textInfo,
                api             : me.api,
                handler         : function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            me.api.asc_setGraphicObjectProps(value.paragraphProps);

                            Common.component.Analytics.trackEvent('DocumentHolder', 'Apply advanced paragraph settings');
                        }
                    }
                    Common.NotificationCenter.trigger('edit:complete', me);
                }
            })).show();
        },

        onShapeAdvanced: function(item) {
            var me = this;

            (new SSE.Views.ShapeSettingsAdvanced({
                shapeProps  : item.shapeInfo,
                api             : me.api,
                handler         : function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            me.api.asc_setGraphicObjectProps(value.shapeProps);

                            Common.component.Analytics.trackEvent('DocumentHolder', 'Apply advanced shape settings');
                        }
                    }
                    Common.NotificationCenter.trigger('edit:complete', me);
                }
            })).show();
        },

        onImgAdvanced: function(item) {
            var me = this;

            (new SSE.Views.ImageSettingsAdvanced({
                imageProps  : item.imageInfo,
                api             : me.api,
                handler         : function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            me.api.asc_setGraphicObjectProps(value.imageProps);

                            Common.component.Analytics.trackEvent('DocumentHolder', 'Apply advanced image settings');
                        }
                    }
                    Common.NotificationCenter.trigger('edit:complete', me);
                }
            })).show();
        },

        onChartEdit: function(item) {
            var me = this;
            var win, props;
            if (me.api){
                props = me.api.asc_getChartObject();
                if (props) {
                    (new SSE.Views.ChartSettingsDlg(
                        {
                            chartSettings: props,
                            imageSettings: item.chartInfo,
                            isChart: true,
                            api: me.api,
                            handler: function(result, value) {
                                if (result == 'ok') {
                                    if (me.api) {
                                        me.api.asc_editChartDrawingObject(value.chartSettings);
                                        if (value.imageSettings)
                                            me.api.asc_setGraphicObjectProps(value.imageSettings);
                                    }
                                }
                                Common.NotificationCenter.trigger('edit:complete', me);
                            }
                        })).show();
                }
            }
        },

        onApiCoAuthoringDisconnect: function() {
            this.permissions.isEdit = false;
        },

        hideCoAuthTips: function() {
            if (this.tooltips.coauth.ref) {
                $(this.tooltips.coauth.ref).remove();
                this.tooltips.coauth.ref = undefined;
                this.tooltips.coauth.x_point = undefined;
                this.tooltips.coauth.y_point = undefined;
            }
        },

        hideHyperlinkTip: function() {
            if (!this.tooltips.hyperlink.isHidden && this.tooltips.hyperlink.ref) {
                this.tooltips.hyperlink.ref.hide();
                this.tooltips.hyperlink.ref = undefined;
                this.tooltips.hyperlink.text = '';
                this.tooltips.hyperlink.isHidden = true;
            }
        },

        onApiMouseMove: function(dataarray) {
            if (!this._isFullscreenMenu && dataarray.length) {
                var index_hyperlink,
                    /** coauthoring begin **/
                        index_comments,
                    /** coauthoring end **/
                        index_locked,
                        index_column, index_row,
                        index_filter;
                for (var i = dataarray.length; i > 0; i--) {
                    switch (dataarray[i-1].asc_getType()) {
                        case Asc.c_oAscMouseMoveType.Hyperlink:
                            index_hyperlink = i;
                            break;
                    /** coauthoring begin **/
                        case Asc.c_oAscMouseMoveType.Comment:
                            index_comments = i;
                            break;
                    /** coauthoring end **/
                        case Asc.c_oAscMouseMoveType.LockedObject:
                            index_locked = i;
                            break;
                        case Asc.c_oAscMouseMoveType.ResizeColumn:
                            index_column = i;
                            break;
                        case Asc.c_oAscMouseMoveType.ResizeRow:
                            index_row = i;
                            break;
                        case Asc.c_oAscMouseMoveType.Filter:
                            index_filter = i;
                            break;
                    }
                }

                var me              = this,
                    showPoint       = [0, 0],
                    /** coauthoring begin **/
                    coAuthTip       = me.tooltips.coauth,
                    commentTip      = me.tooltips.comment,
                    /** coauthoring end **/
                    hyperlinkTip    = me.tooltips.hyperlink,
                    row_columnTip   = me.tooltips.row_column,
                    filterTip       = me.tooltips.filter,
                    pos             = [
                        me.documentHolder.cmpEl.offset().left - $(window).scrollLeft(),
                        me.documentHolder.cmpEl.offset().top  - $(window).scrollTop()
                    ];

                //close all tooltips
                if (!index_hyperlink) {
                    me.hideHyperlinkTip();
                }
                if (index_column===undefined && index_row===undefined) {
                    if (!row_columnTip.isHidden && row_columnTip.ref) {
                        row_columnTip.ref.hide();
                        row_columnTip.ref = undefined;
                        row_columnTip.text = '';
                        row_columnTip.isHidden = true;
                    }
                }
                if (me.permissions.isEdit || me.permissions.canViewComments) {
                    if (!index_comments || this.popupmenu) {
                        commentTip.moveCommentId = undefined;
                        if (commentTip.viewCommentId != undefined) {
                            commentTip = {};

                            var commentsController = this.getApplication().getController('Common.Controllers.Comments');
                            if (commentsController) {
                                if (this.permissions.canCoAuthoring && this.permissions.canViewComments)
                                    setTimeout(function() {commentsController.onApiHideComment(true);}, 200);
                                else
                                    commentsController.onApiHideComment(true);
                            }
                        }
                    }
                }
                if (me.permissions.isEdit) {
                    if (!index_locked) {
                        me.hideCoAuthTips();
                    }
                }
                if (index_filter===undefined || (me.dlgFilter && me.dlgFilter.isVisible()) || (me.currentMenu && me.currentMenu.isVisible())) {
                    if (!filterTip.isHidden && filterTip.ref) {
                        filterTip.ref.hide();
                        filterTip.ref = undefined;
                        filterTip.text = '';
                        filterTip.isHidden = true;
                    }
                }

                // show tooltips
                /** coauthoring begin **/
                var getUserName = function(id){
                    var usersStore = SSE.getCollection('Common.Collections.Users');
                    if (usersStore){
                        var rec = usersStore.findUser(id);
                        if (rec)
                            return rec.get('username');
                    }
                    return me.guestText;
                };
                /** coauthoring end **/

                if (index_hyperlink) {
                    if (!hyperlinkTip.parentEl) {
                        hyperlinkTip.parentEl = $('<div id="tip-container-hyperlinktip" style="position: absolute; z-index: 10000;"></div>');
                        me.documentHolder.cmpEl.append(hyperlinkTip.parentEl);
                    }

                    var data  = dataarray[index_hyperlink-1],
                        props = data.asc_getHyperlink();

                    if (props.asc_getType() == Asc.c_oAscHyperlinkType.WebLink) {
                        var linkstr = props.asc_getTooltip();
                        if (linkstr) {
                            linkstr = Common.Utils.String.htmlEncode(linkstr) + '<br><b>' + me.textCtrlClick + '</b>';
                        } else {
                            linkstr = props.asc_getHyperlinkUrl() + '<br><b>' + me.textCtrlClick + '</b>';
                        }
                    } else {
                        linkstr = props.asc_getTooltip() || (props.asc_getLocation());
                        linkstr += '<br><b>' + me.textCtrlClick + '</b>';
                    }

                    if (hyperlinkTip.ref && hyperlinkTip.ref.isVisible()) {
                        if (hyperlinkTip.text != linkstr) {
                            hyperlinkTip.ref.hide();
                            hyperlinkTip.ref = undefined;
                            hyperlinkTip.text = '';
                            hyperlinkTip.isHidden = true;
                        }
                    }

                    if (!hyperlinkTip.ref || !hyperlinkTip.ref.isVisible()) {
                        hyperlinkTip.text = linkstr;
                        hyperlinkTip.ref = new Common.UI.Tooltip({
                            owner   : hyperlinkTip.parentEl,
                            html    : true,
                            title   : linkstr
                        });

                        hyperlinkTip.ref.show([-10000, -10000]);
                        hyperlinkTip.isHidden = false;

                        showPoint = [data.asc_getX(), data.asc_getY()];
                        showPoint[0] += (pos[0] + 6);
                        showPoint[1] += (pos[1] - 20);
                        showPoint[1] -= hyperlinkTip.ref.getBSTip().$tip.height();
                        var tipwidth = hyperlinkTip.ref.getBSTip().$tip.width();
                        if (showPoint[0] + tipwidth > me.tooltips.coauth.bodyWidth )
                            showPoint[0] = me.tooltips.coauth.bodyWidth - tipwidth;

                        hyperlinkTip.ref.getBSTip().$tip.css({
                            top : showPoint[1] + 'px',
                            left: showPoint[0] + 'px'
                        });
                    }

                }

                if (index_column!==undefined || index_row!==undefined) {
                    if (!row_columnTip.parentEl) {
                        row_columnTip.parentEl = $('<div id="tip-container-rowcolumntip" style="position: absolute; z-index: 10000;"></div>');
                        me.documentHolder.cmpEl.append(row_columnTip.parentEl);
                    }

                    var data  = dataarray[(index_column!==undefined) ? (index_column-1) : (index_row-1)];
                    var str = Common.Utils.String.format((index_column!==undefined) ? this.textChangeColumnWidth : this.textChangeRowHeight, data.asc_getSizeCCOrPt().toFixed(2), data.asc_getSizePx().toFixed());
                    if (row_columnTip.ref && row_columnTip.ref.isVisible()) {
                        if (row_columnTip.text != str) {
                            row_columnTip.text = str;
                            row_columnTip.ref.setTitle(str);
                            row_columnTip.ref.updateTitle();
                        }
                    }

                    if (!row_columnTip.ref || !row_columnTip.ref.isVisible()) {
                        row_columnTip.text = str;
                        row_columnTip.ref = new Common.UI.Tooltip({
                            owner   : row_columnTip.parentEl,
                            html    : true,
                            title   : str
                        });

                        row_columnTip.ref.show([-10000, -10000]);
                        row_columnTip.isHidden = false;

                        showPoint = [data.asc_getX(), data.asc_getY()];
                        showPoint[0] += (pos[0] + 6);
                        showPoint[1] += (pos[1] - 20 - row_columnTip.ttHeight);

                        var tipwidth = row_columnTip.ref.getBSTip().$tip.width();
                        if (showPoint[0] + tipwidth > me.tooltips.coauth.bodyWidth )
                            showPoint[0] = me.tooltips.coauth.bodyWidth - tipwidth - 20;

                        row_columnTip.ref.getBSTip().$tip.css({
                            top : showPoint[1] + 'px',
                            left: showPoint[0] + 'px'
                        });
                    }
                }

                if (me.permissions.isEdit || me.permissions.canViewComments) {
                    if (index_comments && !this.popupmenu) {
                        data = dataarray[index_comments - 1];
                        if (!commentTip.editCommentId && commentTip.moveCommentId != data.asc_getCommentIndexes()[0]) {
                            commentTip.moveCommentId = data.asc_getCommentIndexes()[0];

                            if (commentTip.moveCommentTimer) {
                                clearTimeout(commentTip.moveCommentTimer);
                            }

                            var idxs    = data.asc_getCommentIndexes(),
                                x       = data.asc_getX(),
                                y       = data.asc_getY(),
                                leftx   = data.asc_getReverseX();

                            commentTip.moveCommentTimer = setTimeout(function(){
                                if (commentTip.moveCommentId && !commentTip.editCommentId) {
                                    commentTip.viewCommentId = commentTip.moveCommentId;

                                    var commentsController = me.getApplication().getController('Common.Controllers.Comments');
                                    if (commentsController) {
                                        if (!commentsController.isSelectedComment) {
                                            commentsController.onApiShowComment(idxs, x, y, leftx, false, true);
                                        }
                                    }
                                }
                            }, 400);
                        }
                    }
                }

                if (me.permissions.isEdit) {
                    if (index_locked) {
                        data = dataarray[index_locked-1];

                        if (!coAuthTip.XY)
                            me.onDocumentResize();

                        if (coAuthTip.x_point != data.asc_getX() || coAuthTip.y_point != data.asc_getY()) {
                            me.hideCoAuthTips();

                            coAuthTip.x_point = data.asc_getX();
                            coAuthTip.y_point = data.asc_getY();

                            var src = $(document.createElement("div")),
                                is_sheet_lock = data.asc_getLockedObjectType() == Asc.c_oAscMouseMoveLockedObjectType.Sheet ||
                                    data.asc_getLockedObjectType() == Asc.c_oAscMouseMoveLockedObjectType.TableProperties;

                            coAuthTip.ref = src;

                            src.addClass('username-tip');
                            src.css({
                                height      : coAuthTip.ttHeight + 'px',
                                position    : 'absolute',
                                zIndex      : '900',
                                visibility  : 'visible'
                            });
                            $(document.body).append(src);

                            showPoint = [
                                (is_sheet_lock) ? (coAuthTip.x_point + coAuthTip.rightMenuWidth) : (coAuthTip.bodyWidth - (coAuthTip.x_point + coAuthTip.XY[0])),
                                coAuthTip.y_point + coAuthTip.XY[1]
                            ];

                            if (showPoint[1] >= coAuthTip.XY[1] &&
                                showPoint[1] + coAuthTip.ttHeight < coAuthTip.XY[1] + coAuthTip.apiHeight) {
                                src.text(getUserName(data.asc_getUserId()));
                                if (coAuthTip.bodyWidth - showPoint[0] < coAuthTip.ref.width() ) {
                                    src.css({
                                        visibility  : 'visible',
                                        left        : '0px',
                                        top         : (showPoint[1]-coAuthTip.ttHeight) + 'px'
                                    });
                                } else
                                    src.css({
                                        visibility  : 'visible',
                                        right       : showPoint[0] + 'px',
                                        top         : showPoint[1] + 'px'
                                    });
                            }
                        }
                    }
                }

                if (index_filter!==undefined && !(me.dlgFilter && me.dlgFilter.isVisible()) && !(me.currentMenu && me.currentMenu.isVisible())) {
                    if (!filterTip.parentEl) {
                        filterTip.parentEl = $('<div id="tip-container-filtertip" style="position: absolute; z-index: 10000;"></div>');
                        me.documentHolder.cmpEl.append(filterTip.parentEl);
                    }

                    var data  = dataarray[index_filter-1],
                        str = me.makeFilterTip(data.asc_getFilter());
                    if (filterTip.ref && filterTip.ref.isVisible()) {
                        if (filterTip.text != str) {
                            filterTip.text = str;
                            filterTip.ref.setTitle(str);
                            filterTip.ref.updateTitle();
                        }
                    }

                    if (!filterTip.ref || !filterTip.ref.isVisible()) {
                        filterTip.text = str;
                        filterTip.ref = new Common.UI.Tooltip({
                            owner   : filterTip.parentEl,
                            html    : true,
                            title   : str,
                            cls: 'auto-tooltip'
                        });

                        filterTip.ref.show([-10000, -10000]);
                        filterTip.isHidden = false;

                        showPoint = [data.asc_getX() + pos[0] - 10, data.asc_getY() + pos[1] + 20];

                        var tipheight = filterTip.ref.getBSTip().$tip.width();
                        if (showPoint[1] + filterTip.ttHeight > me.tooltips.coauth.bodyHeight ) {
                            showPoint[1] = me.tooltips.coauth.bodyHeight - filterTip.ttHeight - 5;
                            showPoint[0] += 20;
                        }

                        var tipwidth = filterTip.ref.getBSTip().$tip.width();
                        if (showPoint[0] + tipwidth > me.tooltips.coauth.bodyWidth )
                            showPoint[0] = me.tooltips.coauth.bodyWidth - tipwidth - 20;

                        filterTip.ref.getBSTip().$tip.css({
                            top : showPoint[1] + 'px',
                            left: showPoint[0] + 'px'
                        });
                    }
                }
            }
        },

        onApiHideComment: function() {
            this.tooltips.comment.viewCommentId =
                this.tooltips.comment.editCommentId =
                    this.tooltips.comment.moveCommentId = undefined;
        },

        onApiHyperlinkClick: function(url) {
            if (!url) {
                Common.UI.alert({
                    msg: this.errorInvalidLink,
                    title: this.notcriticalErrorTitle,
                    iconCls: 'warn',
                    buttons: ['ok'],
                    callback: _.bind(function(btn){
                        Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                    }, this)
                });
                return;
            }
            if (this.api.asc_getUrlType(url)>0) {
                var newDocumentPage = window.open(url, '_blank');
                if (newDocumentPage)
                    newDocumentPage.focus();
            }
        },

        onApiAutofilter: function(config) {
            var me = this;
            if (!me.tooltips.filter.isHidden && me.tooltips.filter.ref) {
                me.tooltips.filter.ref.hide();
                me.tooltips.filter.ref = undefined;
                me.tooltips.filter.text = '';
                me.tooltips.filter.isHidden = true;
            }
            if (me.permissions.isEdit && !me.dlgFilter) {
                me.dlgFilter = new SSE.Views.AutoFilterDialog({api: this.api}).on({
                        'close': function () {
                            if (me.api) {
                                me.api.asc_enableKeyEvents(true);
                            }
                            me.dlgFilter = undefined;
                        }
                    });

                if (me.api) {
                    me.api.asc_enableKeyEvents(false);
                }

                Common.UI.Menu.Manager.hideAll();
                me.dlgFilter.setSettings(config);
                var offset = me.documentHolder.cmpEl.offset(),
                    rect = config.asc_getCellCoord(),
                    x = rect.asc_getX() + rect.asc_getWidth() +offset.left,
                    y = rect.asc_getY() + rect.asc_getHeight() + offset.top;
                var docwidth = Common.Utils.innerWidth(),
                    docheight = Common.Utils.innerHeight();
                if (x+me.dlgFilter.options.width > docwidth)
                    x = docwidth - me.dlgFilter.options.width - 5;
                if (y+me.dlgFilter.options.height > docheight)
                    y = docheight - me.dlgFilter.options.height - 5;
                me.dlgFilter.show(x, y);
            }
        },

        makeFilterTip: function(props) {
            var filterObj = props.asc_getFilterObj(),
                filterType = filterObj.asc_getType(),
                isTextFilter = props.asc_getIsTextFilter(),
                colorsFill = props.asc_getColorsFill(),
                colorsFont = props.asc_getColorsFont(),
                str = "";

            if (filterType === Asc.c_oAscAutoFilterTypes.CustomFilters) {
                var customFilter = filterObj.asc_getFilter(),
                    customFilters = customFilter.asc_getCustomFilters();

                str = this.getFilterName(Asc.c_oAscAutoFilterTypes.CustomFilters, customFilters[0].asc_getOperator()) + " \"" + customFilters[0].asc_getVal() + "\"";
                if (customFilters.length>1) {
                    str = str + " " + (customFilter.asc_getAnd() ? this.txtAnd : this.txtOr);
                    str = str + " " + this.getFilterName(Asc.c_oAscAutoFilterTypes.CustomFilters, customFilters[1].asc_getOperator()) + " \"" + customFilters[1].asc_getVal() + "\"";
                }
            } else if (filterType === Asc.c_oAscAutoFilterTypes.ColorFilter) {
                var colorFilter = filterObj.asc_getFilter();
                if ( colorFilter.asc_getCellColor()===null ) { // cell color
                    str = this.txtEqualsToCellColor;
                } else if (colorFilter.asc_getCellColor()===false) { // font color
                    str = this.txtEqualsToFontColor;
                }
            } else if (filterType === Asc.c_oAscAutoFilterTypes.DynamicFilter) {
                str = this.getFilterName(Asc.c_oAscAutoFilterTypes.DynamicFilter, filterObj.asc_getFilter().asc_getType());
            } else if (filterType === Asc.c_oAscAutoFilterTypes.Top10) {
                var top10Filter = filterObj.asc_getFilter(),
                    percent = top10Filter.asc_getPercent();

                str = this.getFilterName(Asc.c_oAscAutoFilterTypes.Top10, top10Filter.asc_getTop());
                str += " " + top10Filter.asc_getVal() + " " + ((percent || percent===null) ? this.txtPercent : this.txtItems);
            } else if (filterType === Asc.c_oAscAutoFilterTypes.Filters) {
                var strlen = 0, visibleItems = 0, isBlankVisible = undefined,
                    values = props.asc_getValues();
                values.forEach(function (item) {
                    if (item.asc_getVisible()) {
                        visibleItems++;
                        if (strlen<100 && item.asc_getText()) {
                            str += item.asc_getText() + "; ";
                            strlen = str.length;
                        }
                    }
                    if (!item.asc_getText())
                        isBlankVisible = item.asc_getVisible();
                });
                if (visibleItems == values.length)
                    str = this.txtAll;
                else if (visibleItems==1 && isBlankVisible)
                    str = this.txtEquals + " \"" + this.txtBlanks + "\"";
                else if (visibleItems == values.length-1 && (isBlankVisible==false))
                    str = this.txtNotEquals + " \"" + this.txtBlanks + "\"";
                else {
                    isBlankVisible && (str += this.txtBlanks + "; ");
                    str = this.txtEquals + " \"" + str.substring(0, str.length-2) + "\"";
                }
            } else if (filterType === Asc.c_oAscAutoFilterTypes.None) {
                str = this.txtAll;
            }
            if (str.length>100)
                str = str.substring(0, 100) + '...';
            str = "<b>" + (props.asc_getColumnName() || '(' + this.txtColumn + ' ' + props.asc_getSheetColumnName() + ')') + ":</b><br>" + str;
            return str;
        },

        getFilterName: function(type, subtype) {
            var str = '';
            if (type == Asc.c_oAscAutoFilterTypes.CustomFilters) {
                switch (subtype) {
                    case Asc.c_oAscCustomAutoFilter.equals: str = this.txtEquals; break;
                    case Asc.c_oAscCustomAutoFilter.isGreaterThan: str = this.txtGreater; break;
                    case Asc.c_oAscCustomAutoFilter.isGreaterThanOrEqualTo: str = this.txtGreaterEquals; break;
                    case Asc.c_oAscCustomAutoFilter.isLessThan: str = this.txtLess; break;
                    case Asc.c_oAscCustomAutoFilter.isLessThanOrEqualTo: str = this.txtLessEquals; break;
                    case Asc.c_oAscCustomAutoFilter.doesNotEqual: str = this.txtNotEquals; break;
                    case Asc.c_oAscCustomAutoFilter.beginsWith: str = this.txtBegins; break;
                    case Asc.c_oAscCustomAutoFilter.doesNotBeginWith: str = this.txtNotBegins; break;
                    case Asc.c_oAscCustomAutoFilter.endsWith: str = this.txtEnds; break;
                    case Asc.c_oAscCustomAutoFilter.doesNotEndWith: str = this.txtNotEnds; break;
                    case Asc.c_oAscCustomAutoFilter.contains: str = this.txtContains; break;
                    case Asc.c_oAscCustomAutoFilter.doesNotContain: str = this.txtNotContains; break;
                }
            } else if (type == Asc.c_oAscAutoFilterTypes.DynamicFilter) {
                switch (subtype) {
                    case Asc.c_oAscDynamicAutoFilter.aboveAverage: str = this.txtAboveAve; break;
                    case Asc.c_oAscDynamicAutoFilter.belowAverage: str = this.txtBelowAve; break;
                }
            } else if (type == Asc.c_oAscAutoFilterTypes.Top10) {
                str = (subtype || subtype===null) ? this.txtFilterTop : this.txtFilterBottom;
            }
            return str;
        },

        onUndo: function() {
            if (this.api) {
                this.api.asc_Undo();
                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
            }
        },

        onApiContextMenu: function(event) {
            var me = this;
            _.delay(function(){
                me.showObjectMenu.call(me, event);
            },10);
        },

        onAfterRender: function(view){
        },

        onDocumentResize: function(e){
            var me = this;
            if (me.documentHolder) {
                me.tooltips.coauth.XY = [
                    me.documentHolder.cmpEl.offset().left - $(window).scrollLeft(),
                    me.documentHolder.cmpEl.offset().top  - $(window).scrollTop()
                ];
                me.tooltips.coauth.apiHeight = me.documentHolder.cmpEl.height();
                me.tooltips.coauth.rightMenuWidth = $('#right-menu').width();
                me.tooltips.coauth.bodyWidth = $(window).width();
                me.tooltips.coauth.bodyHeight = $(window).height();
            }
        },

        onDocumentWheel: function(e) {
            if (this.api && !this.isEditCell) {
                var delta = (_.isUndefined(e.originalEvent)) ?  e.wheelDelta : e.originalEvent.wheelDelta;
                if (_.isUndefined(delta)) {
                    delta = e.deltaY;
                }

                if ((e.ctrlKey || e.metaKey) && !e.altKey) {
                    var factor = this.api.asc_getZoom();
                    if (delta < 0) {
                        factor = Math.ceil(factor * 10)/10;
                        factor -= 0.1;
                        if (!(factor < .5)) {
                            this.api.asc_setZoom(factor);
                        }
                    } else if (delta > 0) {
                        factor = Math.floor(factor * 10)/10;
                        factor += 0.1;
                        if (factor > 0 && !(factor > 2.)) {
                            this.api.asc_setZoom(factor);
                        }
                    }

                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        },

        onDocumentKeyDown: function(event){
            if (this.api){
                var key = event.keyCode;
                if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey){
                    if (key === Common.UI.Keys.NUM_PLUS || key === Common.UI.Keys.EQUALITY || (Common.Utils.isGecko && key === Common.UI.Keys.EQUALITY_FF) || (Common.Utils.isOpera && key == 43)){
                        if (!this.api.isCellEdited) {
                            var factor = Math.floor(this.api.asc_getZoom() * 10)/10;
                            factor += .1;
                            if (factor > 0 && !(factor > 2.)) {
                                this.api.asc_setZoom(factor);
                            }

                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                    } else if (key === Common.UI.Keys.NUM_MINUS || key === Common.UI.Keys.MINUS || (Common.Utils.isGecko && key === Common.UI.Keys.MINUS_FF) || (Common.Utils.isOpera && key == 45)){
                        if (!this.api.isCellEdited) {
                            factor = Math.ceil(this.api.asc_getZoom() * 10)/10;
                            factor -= .1;
                            if (!(factor < .5)) {
                                this.api.asc_setZoom(factor);
                            }

                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                    }
                } else
                if (key == Common.UI.Keys.F10 && event.shiftKey) {
                    this.showObjectMenu(event);
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
            }
        },

        onDocumentRightDown: function(event) {
            event.button == 0 && (this.mouse.isLeftButtonDown = true);
//            event.button == 2 && (this.mouse.isRightButtonDown = true);
        },

        onDocumentRightUp: function(event) {
            event.button == 0 && (this.mouse.isLeftButtonDown = false);
        },

        onProcessMouse: function(data) {
            (data.type == 'mouseup') && (this.mouse.isLeftButtonDown = false);
        },

        onDocumentMouseMove: function(e) {
            if (e.target.localName !== 'canvas') {
                this.hideHyperlinkTip();
            }
        },

        showObjectMenu: function(event){
            if (this.api && !this.mouse.isLeftButtonDown && !this.rangeSelectionMode){
                (this.permissions.isEdit && !this._isDisabled) ? this.fillMenuProps(this.api.asc_getCellInfo(), true, event) : this.fillViewMenuProps(this.api.asc_getCellInfo(), true, event);
            }
        },

        onSelectionChanged: function(info){
            if (!this.mouse.isLeftButtonDown && !this.rangeSelectionMode &&
                this.currentMenu && this.currentMenu.isVisible()){
                (this.permissions.isEdit && !this._isDisabled) ? this.fillMenuProps(info, true) : this.fillViewMenuProps(info, true);
            }
        },

        fillMenuProps: function(cellinfo, showMenu, event){
            var iscellmenu, isrowmenu, iscolmenu, isallmenu, ischartmenu, isimagemenu, istextshapemenu, isshapemenu, istextchartmenu, isimageonly,
                documentHolder      = this.documentHolder,
                seltype             = cellinfo.asc_getFlags().asc_getSelectionType(),
                isCellLocked        = cellinfo.asc_getLocked(),
                isTableLocked       = cellinfo.asc_getLockedTable()===true,
                isObjLocked         = false,
                commentsController  = this.getApplication().getController('Common.Controllers.Comments'),
                internaleditor      = this.permissions.isEditMailMerge || this.permissions.isEditDiagram;

            switch (seltype) {
                case Asc.c_oAscSelectionType.RangeCells:    iscellmenu = true; break;
                case Asc.c_oAscSelectionType.RangeRow:      isrowmenu = true; break;
                case Asc.c_oAscSelectionType.RangeCol:      iscolmenu = true; break;
                case Asc.c_oAscSelectionType.RangeMax:      isallmenu   = true; break;
                case Asc.c_oAscSelectionType.RangeImage:    isimagemenu = !internaleditor; break;
                case Asc.c_oAscSelectionType.RangeShape:    isshapemenu = !internaleditor; break;
                case Asc.c_oAscSelectionType.RangeChart:    ischartmenu = !internaleditor; break;
                case Asc.c_oAscSelectionType.RangeChartText:istextchartmenu = !internaleditor; break;
                case Asc.c_oAscSelectionType.RangeShapeText: istextshapemenu = !internaleditor; break;
            }

            if (isimagemenu || isshapemenu || ischartmenu) {
                if (!documentHolder.imgMenu || !showMenu && !documentHolder.imgMenu.isVisible()) return;

                isimagemenu = isshapemenu = ischartmenu = false;
                documentHolder.mnuImgAdvanced.imageInfo = undefined;

                var has_chartprops = false,
                    signGuid;
                var selectedObjects = this.api.asc_getGraphicObjectProps();
                for (var i = 0; i < selectedObjects.length; i++) {
                    if (selectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                        var elValue = selectedObjects[i].asc_getObjectValue();
                        isObjLocked = isObjLocked || elValue.asc_getLocked();
                        var shapeprops = elValue.asc_getShapeProperties();
                        if (shapeprops) {
                            if (shapeprops.asc_getFromChart())
                                ischartmenu = true;
                            else if (shapeprops.asc_getFromImage())
                                isimageonly = true;
                            else {
                                documentHolder.mnuShapeAdvanced.shapeInfo = elValue;
                                isshapemenu = true;
                            }
                        } else if ( elValue.asc_getChartProperties() ) {
                            documentHolder.mnuChartEdit.chartInfo = elValue;
                            ischartmenu = true;
                            has_chartprops = true;
                        } else {
                            documentHolder.mnuImgAdvanced.imageInfo = elValue;
                            isimagemenu = true;
                        }
                        if (this.permissions.isSignatureSupport)
                            signGuid = elValue.asc_getSignatureId();
                    }
                }

                var cangroup = this.api.asc_canGroupGraphicsObjects();
                documentHolder.mnuUnGroupImg.setDisabled(isObjLocked || !this.api.asc_canUnGroupGraphicsObjects());
                documentHolder.mnuGroupImg.setDisabled(isObjLocked || !cangroup);
                documentHolder.menuImageAlign.setDisabled(isObjLocked || !cangroup);

                var objcount = this.api.asc_getSelectedDrawingObjectsCount();
                documentHolder.menuImageAlign.menu.items[7].setDisabled(objcount<3);
                documentHolder.menuImageAlign.menu.items[8].setDisabled(objcount<3);

                documentHolder.mnuShapeAdvanced.setVisible(isshapemenu && !isimagemenu && !ischartmenu);
                documentHolder.mnuShapeAdvanced.setDisabled(isObjLocked);
                documentHolder.mnuChartEdit.setVisible(ischartmenu && !isimagemenu && !isshapemenu && has_chartprops);
                documentHolder.mnuChartEdit.setDisabled(isObjLocked);
                documentHolder.pmiImgCut.setDisabled(isObjLocked);
                documentHolder.pmiImgPaste.setDisabled(isObjLocked);
                documentHolder.mnuImgAdvanced.setVisible(isimagemenu && (!isshapemenu || isimageonly) && !ischartmenu);
                documentHolder.mnuImgAdvanced.setDisabled(isObjLocked);
                documentHolder.menuImgOriginalSize.setVisible(isimagemenu && (!isshapemenu || isimageonly) && !ischartmenu);
                if (documentHolder.mnuImgAdvanced.imageInfo)
                    documentHolder.menuImgOriginalSize.setDisabled(isObjLocked || documentHolder.mnuImgAdvanced.imageInfo.get_ImageUrl()===null || documentHolder.mnuImgAdvanced.imageInfo.get_ImageUrl()===undefined);

                var pluginGuid = (documentHolder.mnuImgAdvanced.imageInfo) ? documentHolder.mnuImgAdvanced.imageInfo.asc_getPluginGuid() : null;
                documentHolder.menuImgReplace.setVisible(isimageonly && (pluginGuid===null || pluginGuid===undefined));
                documentHolder.menuImgReplace.setDisabled(isObjLocked || pluginGuid===null);
                documentHolder.menuImageArrange.setDisabled(isObjLocked);

                documentHolder.menuImgRotate.setVisible(!ischartmenu && (pluginGuid===null || pluginGuid===undefined));
                documentHolder.menuImgRotate.setDisabled(isObjLocked);

                documentHolder.menuImgCrop.setVisible(this.api.asc_canEditCrop());
                if (documentHolder.menuImgCrop.isVisible())
                    documentHolder.menuImgCrop.setDisabled(isObjLocked);

                var isInSign = !!signGuid;
                documentHolder.menuSignatureEditSign.setVisible(isInSign);
                documentHolder.menuSignatureEditSetup.setVisible(isInSign);
                documentHolder.menuEditSignSeparator.setVisible(isInSign);
                if (isInSign) {
                    documentHolder.menuSignatureEditSign.cmpEl.attr('data-value', signGuid); // sign
                    documentHolder.menuSignatureEditSetup.cmpEl.attr('data-value', signGuid); // edit signature settings
                }

                if (showMenu) this.showPopupMenu(documentHolder.imgMenu, {}, event);
                documentHolder.mnuShapeSeparator.setVisible(documentHolder.mnuShapeAdvanced.isVisible() || documentHolder.mnuChartEdit.isVisible() || documentHolder.mnuImgAdvanced.isVisible());
            } else if (istextshapemenu || istextchartmenu) {
                if (!documentHolder.textInShapeMenu || !showMenu && !documentHolder.textInShapeMenu.isVisible()) return;
                
                documentHolder.pmiTextAdvanced.textInfo = undefined;

                var selectedObjects = this.api.asc_getGraphicObjectProps(),
                    isEquation = false;

                for (var i = 0; i < selectedObjects.length; i++) {
                    var elType = selectedObjects[i].asc_getObjectType();
                    if (elType == Asc.c_oAscTypeSelectElement.Image) {
                        var value = selectedObjects[i].asc_getObjectValue(),
                            align = value.asc_getVerticalTextAlign(),
                            direct = value.asc_getVert(),
                            listtype = this.api.asc_getCurrentListType();
                        isObjLocked = isObjLocked || value.asc_getLocked();
                        documentHolder.menuParagraphTop.setChecked(align == Asc.c_oAscVAlign.Top);
                        documentHolder.menuParagraphCenter.setChecked(align == Asc.c_oAscVAlign.Center);
                        documentHolder.menuParagraphBottom.setChecked(align == Asc.c_oAscVAlign.Bottom);

                        documentHolder.menuParagraphDirectH.setChecked(direct == Asc.c_oAscVertDrawingText.normal);
                        documentHolder.menuParagraphDirect90.setChecked(direct == Asc.c_oAscVertDrawingText.vert);
                        documentHolder.menuParagraphDirect270.setChecked(direct == Asc.c_oAscVertDrawingText.vert270);

                        documentHolder.menuParagraphBulletNone.setChecked(listtype.get_ListType() == -1);
                        var rec = documentHolder.paraBulletsPicker.store.findWhere({ type: listtype.get_ListType(), subtype: listtype.get_ListSubType() });
                        documentHolder.paraBulletsPicker.selectRecord(rec, true);
                    } else if (elType == Asc.c_oAscTypeSelectElement.Paragraph) {
                        documentHolder.pmiTextAdvanced.textInfo = selectedObjects[i].asc_getObjectValue();
                        isObjLocked = isObjLocked || documentHolder.pmiTextAdvanced.textInfo.asc_getLocked();
                    } else if (elType == Asc.c_oAscTypeSelectElement.Math) {
                        this._currentMathObj = selectedObjects[i].asc_getObjectValue();
                        isEquation = true;
                    }
                }

                var hyperinfo = cellinfo.asc_getHyperlink(),
                    can_add_hyperlink = this.api.asc_canAddShapeHyperlink();

                documentHolder.menuHyperlinkShape.setVisible(istextshapemenu && can_add_hyperlink!==false && hyperinfo);
                documentHolder.menuAddHyperlinkShape.setVisible(istextshapemenu && can_add_hyperlink!==false && !hyperinfo);
                documentHolder.menuParagraphVAlign.setVisible(istextchartmenu!==true && !isEquation); // убрать после того, как заголовок можно будет растягивать по вертикали!!
                documentHolder.menuParagraphDirection.setVisible(istextchartmenu!==true && !isEquation); // убрать после того, как заголовок можно будет растягивать по вертикали!!
                documentHolder.pmiTextAdvanced.setVisible(documentHolder.pmiTextAdvanced.textInfo!==undefined);

                _.each(documentHolder.textInShapeMenu.items, function(item) {
                    item.setDisabled(isObjLocked);
                });
                documentHolder.pmiTextCopy.setDisabled(false);

                //equation menu
                var eqlen = 0;
                this._currentParaObjDisabled = isObjLocked;
                if (isEquation) {
                    eqlen = this.addEquationMenu(4);
                } else
                    this.clearEquationMenu(4);

                if (showMenu) this.showPopupMenu(documentHolder.textInShapeMenu, {}, event);
            } else if (!this.permissions.isEditMailMerge && !this.permissions.isEditDiagram || (seltype !== Asc.c_oAscSelectionType.RangeImage && seltype !== Asc.c_oAscSelectionType.RangeShape &&
            seltype !== Asc.c_oAscSelectionType.RangeChart && seltype !== Asc.c_oAscSelectionType.RangeChartText && seltype !== Asc.c_oAscSelectionType.RangeShapeText)) {
                if (!documentHolder.ssMenu || !showMenu && !documentHolder.ssMenu.isVisible()) return;
                
                var iscelledit = this.api.isCellEdited,
                    formatTableInfo = cellinfo.asc_getFormatTableInfo(),
                    isinsparkline = (cellinfo.asc_getSparklineInfo()!==null),
                    isintable = (formatTableInfo !== null),
                    ismultiselect = cellinfo.asc_getFlags().asc_getMultiselect();
                documentHolder.ssMenu.formatTableName = (isintable) ? formatTableInfo.asc_getTableName() : null;
                documentHolder.ssMenu.cellColor = cellinfo.asc_getFill().asc_getColor();
                documentHolder.ssMenu.fontColor = cellinfo.asc_getFont().asc_getColor();

                documentHolder.pmiInsertEntire.setVisible(isrowmenu||iscolmenu);
                documentHolder.pmiInsertEntire.setCaption((isrowmenu) ? this.textInsertTop : this.textInsertLeft);
                documentHolder.pmiDeleteEntire.setVisible(isrowmenu||iscolmenu);
                documentHolder.pmiInsertCells.setVisible(iscellmenu && !iscelledit && !isintable);
                documentHolder.pmiDeleteCells.setVisible(iscellmenu && !iscelledit && !isintable);
                documentHolder.pmiSelectTable.setVisible(iscellmenu && !iscelledit && isintable);
                documentHolder.pmiInsertTable.setVisible(iscellmenu && !iscelledit && isintable);
                documentHolder.pmiDeleteTable.setVisible(iscellmenu && !iscelledit && isintable);
                documentHolder.pmiSparklines.setVisible(isinsparkline);
                documentHolder.pmiSortCells.setVisible((iscellmenu||isallmenu) && !iscelledit);
                documentHolder.pmiSortCells.menu.items[2].setVisible(!internaleditor);
                documentHolder.pmiSortCells.menu.items[3].setVisible(!internaleditor);
                documentHolder.pmiFilterCells.setVisible(iscellmenu && !iscelledit && !internaleditor);
                documentHolder.pmiReapply.setVisible((iscellmenu||isallmenu) && !iscelledit && !internaleditor);
                documentHolder.ssMenu.items[12].setVisible((iscellmenu||isallmenu||isinsparkline) && !iscelledit);
                documentHolder.pmiInsFunction.setVisible(iscellmenu && !iscelledit);
                documentHolder.pmiAddNamedRange.setVisible(iscellmenu && !iscelledit && !internaleditor);

                if (isintable) {
                    documentHolder.pmiInsertTable.menu.items[0].setDisabled(!formatTableInfo.asc_getIsInsertRowAbove());
                    documentHolder.pmiInsertTable.menu.items[1].setDisabled(!formatTableInfo.asc_getIsInsertRowBelow());
                    documentHolder.pmiInsertTable.menu.items[2].setDisabled(!formatTableInfo.asc_getIsInsertColumnLeft());
                    documentHolder.pmiInsertTable.menu.items[3].setDisabled(!formatTableInfo.asc_getIsInsertColumnRight());

                    documentHolder.pmiDeleteTable.menu.items[0].setDisabled(!formatTableInfo.asc_getIsDeleteRow());
                    documentHolder.pmiDeleteTable.menu.items[1].setDisabled(!formatTableInfo.asc_getIsDeleteColumn());
                    documentHolder.pmiDeleteTable.menu.items[2].setDisabled(!formatTableInfo.asc_getIsDeleteTable());

                }

                var hyperinfo = cellinfo.asc_getHyperlink();
                documentHolder.menuHyperlink.setVisible(iscellmenu && hyperinfo && !iscelledit && !ismultiselect && !internaleditor);
                documentHolder.menuAddHyperlink.setVisible(iscellmenu && !hyperinfo && !iscelledit && !ismultiselect && !internaleditor);

                documentHolder.pmiRowHeight.setVisible(isrowmenu||isallmenu);
                documentHolder.pmiColumnWidth.setVisible(iscolmenu||isallmenu);
                documentHolder.pmiEntireHide.setVisible(iscolmenu||isrowmenu);
                documentHolder.pmiEntireShow.setVisible(iscolmenu||isrowmenu);
                documentHolder.pmiFreezePanes.setVisible(!iscelledit);
                documentHolder.pmiFreezePanes.setCaption(this.api.asc_getSheetViewSettings().asc_getIsFreezePane() ? documentHolder.textUnFreezePanes : documentHolder.textFreezePanes);

                /** coauthoring begin **/
                var count = cellinfo.asc_getComments().length;
                documentHolder.ssMenu.items[17].setVisible(iscellmenu && !iscelledit && this.permissions.canCoAuthoring && this.permissions.canComments && count < 1);
                documentHolder.pmiAddComment.setVisible(iscellmenu && !iscelledit && this.permissions.canCoAuthoring && this.permissions.canComments && count < 1);
                /** coauthoring end **/
                documentHolder.pmiCellMenuSeparator.setVisible(iscellmenu && !iscelledit || isrowmenu || iscolmenu || isallmenu);
                documentHolder.pmiEntireHide.isrowmenu = isrowmenu;
                documentHolder.pmiEntireShow.isrowmenu = isrowmenu;

                commentsController && commentsController.blockPopover(true);

                documentHolder.pmiClear.menu.items[0].setDisabled(!this.permissions.canModifyFilter);
                documentHolder.pmiClear.menu.items[1].setDisabled(iscelledit);
                documentHolder.pmiClear.menu.items[2].setDisabled(iscelledit || !this.permissions.canModifyFilter);
                documentHolder.pmiClear.menu.items[3].setDisabled(iscelledit);
                documentHolder.pmiClear.menu.items[4].setDisabled(iscelledit);

                documentHolder.pmiClear.menu.items[3].setVisible(!this.permissions.isEditDiagram);
                documentHolder.pmiClear.menu.items[4].setVisible(!this.permissions.isEditDiagram);

                var filterInfo = cellinfo.asc_getAutoFilterInfo(),
                    isApplyAutoFilter = (filterInfo) ? filterInfo.asc_getIsApplyAutoFilter() : false;
                filterInfo = (filterInfo) ? filterInfo.asc_getIsAutoFilter() : null;
                documentHolder.pmiInsertCells.menu.items[0].setDisabled(isApplyAutoFilter);
                documentHolder.pmiDeleteCells.menu.items[0].setDisabled(isApplyAutoFilter);
                documentHolder.pmiInsertCells.menu.items[1].setDisabled(isApplyAutoFilter);
                documentHolder.pmiDeleteCells.menu.items[1].setDisabled(isApplyAutoFilter);

                var inPivot = !!cellinfo.asc_getPivotTableInfo();

                documentHolder.pmiEntriesList.setVisible(!iscelledit && !inPivot);

                documentHolder.pmiNumFormat.setVisible(!iscelledit);
                documentHolder.pmiAdvancedNumFormat.options.numformatinfo = documentHolder.pmiNumFormat.menu.options.numformatinfo = cellinfo.asc_getNumFormatInfo();
                documentHolder.pmiAdvancedNumFormat.options.numformat = cellinfo.asc_getNumFormat();

                _.each(documentHolder.ssMenu.items, function(item) {
                    item.setDisabled(isCellLocked);
                });
                documentHolder.pmiCopy.setDisabled(false);
                documentHolder.pmiCut.setDisabled(isCellLocked || inPivot); // can't edit pivot cells
                documentHolder.pmiPaste.setDisabled(isCellLocked || inPivot);
                documentHolder.pmiInsertEntire.setDisabled(isCellLocked || isTableLocked);
                documentHolder.pmiInsertCells.setDisabled(isCellLocked || isTableLocked || inPivot);
                documentHolder.pmiInsertTable.setDisabled(isCellLocked || isTableLocked);
                documentHolder.pmiDeleteEntire.setDisabled(isCellLocked || isTableLocked);
                documentHolder.pmiDeleteCells.setDisabled(isCellLocked || isTableLocked || inPivot);
                documentHolder.pmiDeleteTable.setDisabled(isCellLocked || isTableLocked);
                documentHolder.pmiClear.setDisabled(isCellLocked || inPivot);
                documentHolder.pmiFilterCells.setDisabled(isCellLocked || isTableLocked|| (filterInfo==null) || inPivot || !filterInfo && !this.permissions.canModifyFilter);
                documentHolder.pmiSortCells.setDisabled(isCellLocked || isTableLocked|| (filterInfo==null) || inPivot || !this.permissions.canModifyFilter);
                documentHolder.pmiReapply.setDisabled(isCellLocked || isTableLocked|| (isApplyAutoFilter!==true));
                documentHolder.menuHyperlink.setDisabled(isCellLocked || inPivot);
                documentHolder.menuAddHyperlink.setDisabled(isCellLocked || inPivot);
                documentHolder.pmiInsFunction.setDisabled(isCellLocked || inPivot);

                if (showMenu) this.showPopupMenu(documentHolder.ssMenu, {}, event);
            } else if (this.permissions.isEditDiagram && seltype == Asc.c_oAscSelectionType.RangeChartText) {
                if (!showMenu && !documentHolder.textInShapeMenu.isVisible()) return;

                documentHolder.pmiTextAdvanced.textInfo = undefined;

                documentHolder.menuHyperlinkShape.setVisible(false);
                documentHolder.menuAddHyperlinkShape.setVisible(false);
                documentHolder.menuParagraphVAlign.setVisible(false); // убрать после того, как заголовок можно будет растягивать по вертикали!!
                documentHolder.menuParagraphDirection.setVisible(false); // убрать после того, как заголовок можно будет растягивать по вертикали!!
                documentHolder.pmiTextAdvanced.setVisible(false);
                documentHolder.textInShapeMenu.items[9].setVisible(false);
                documentHolder.pmiTextCopy.setDisabled(false);
                if (showMenu) this.showPopupMenu(documentHolder.textInShapeMenu, {}, event);
            }
        },

        fillViewMenuProps: function(cellinfo, showMenu, event){
            var documentHolder      = this.documentHolder,
                seltype             = cellinfo.asc_getFlags().asc_getSelectionType(),
                isCellLocked        = cellinfo.asc_getLocked(),
                isTableLocked       = cellinfo.asc_getLockedTable()===true,
                commentsController  = this.getApplication().getController('Common.Controllers.Comments'),
                iscellmenu = (seltype==Asc.c_oAscSelectionType.RangeCells) && !this.permissions.isEditMailMerge && !this.permissions.isEditDiagram,
                iscelledit = this.api.isCellEdited,
                isimagemenu = (seltype==Asc.c_oAscSelectionType.RangeImage) && !this.permissions.isEditMailMerge && !this.permissions.isEditDiagram,
                signGuid;

            if (!documentHolder.viewModeMenu)
                documentHolder.createDelayedElementsViewer();

            if (!documentHolder.viewModeMenu)
                documentHolder.createDelayedElementsViewer();

            if (!showMenu && !documentHolder.viewModeMenu.isVisible()) return;

            if (isimagemenu && this.permissions.isSignatureSupport) {
                var selectedObjects = this.api.asc_getGraphicObjectProps();
                for (var i = 0; i < selectedObjects.length; i++) {
                    if (selectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                        signGuid = selectedObjects[i].asc_getObjectValue().asc_getSignatureId();
                    }
                }
            }

            var signProps = (signGuid) ? this.api.asc_getSignatureSetup(signGuid) : null,
                isInSign = !!signProps && this._canProtect,
                canComment = iscellmenu && !iscelledit && this.permissions.canCoAuthoring && this.permissions.canComments && !this._isDisabled && cellinfo.asc_getComments().length < 1;

            documentHolder.menuViewUndo.setVisible(this.permissions.canCoAuthoring && this.permissions.canComments && !this._isDisabled);
            documentHolder.menuViewUndo.setDisabled(!this.api.asc_getCanUndo() && !this._isDisabled);
            documentHolder.menuViewCopySeparator.setVisible(isInSign);

            var isRequested = (signProps) ? signProps.asc_getRequested() : false;
            documentHolder.menuSignatureViewSign.setVisible(isInSign && isRequested);
            documentHolder.menuSignatureDetails.setVisible(isInSign && !isRequested);
            documentHolder.menuSignatureViewSetup.setVisible(isInSign);
            documentHolder.menuSignatureRemove.setVisible(isInSign && !isRequested);
            documentHolder.menuViewSignSeparator.setVisible(canComment);

            if (isInSign) {
                documentHolder.menuSignatureViewSign.cmpEl.attr('data-value', signGuid); // sign
                documentHolder.menuSignatureDetails.cmpEl.attr('data-value', signProps.asc_getId()); // view certificate
                documentHolder.menuSignatureViewSetup.cmpEl.attr('data-value', signGuid); // view signature settings
                documentHolder.menuSignatureRemove.cmpEl.attr('data-value', signGuid);
            }

            documentHolder.menuViewAddComment.setVisible(canComment);
            commentsController && commentsController.blockPopover(true);
            documentHolder.menuViewAddComment.setDisabled(isCellLocked || isTableLocked);
            if (showMenu) this.showPopupMenu(documentHolder.viewModeMenu, {}, event);
        },

        showPopupMenu: function(menu, value, event){
            if (!_.isUndefined(menu) && menu !== null && event){
                Common.UI.Menu.Manager.hideAll();

                var me                  = this,
                    documentHolderView  = me.documentHolder,
                    showPoint           = [event.pageX*Common.Utils.zoom() - documentHolderView.cmpEl.offset().left, event.pageY*Common.Utils.zoom() - documentHolderView.cmpEl.offset().top],
                    menuContainer       = documentHolderView.cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id));

                if (!menu.rendered) {
                    // Prepare menu container
                    if (menuContainer.length < 1) {
                        menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                        documentHolderView.cmpEl.append(menuContainer);
                    }

                    menu.render(menuContainer);
                    menu.cmpEl.attr({tabindex: "-1"});
                }

                if (/*!this.mouse.isRightButtonDown &&*/ event.button !== 2) {
                    var coord  = me.api.asc_getActiveCellCoord(),
                        offset = {left:0,top:0}/*documentHolderView.cmpEl.offset()*/;

                    showPoint[0] = coord.asc_getX() + coord.asc_getWidth() + offset.left;
                    showPoint[1] = (coord.asc_getY() < 0 ? 0 : coord.asc_getY()) + coord.asc_getHeight() + offset.top;
                }

                menuContainer.css({
                    left: showPoint[0],
                    top : showPoint[1]
                });

                if (_.isFunction(menu.options.initMenu)) {
                    menu.options.initMenu(value);
                    menu.alignPosition();
                }
                _.delay(function() {
                    menu.cmpEl.focus();
                }, 10);

                menu.show();
                me.currentMenu = menu;
            }
        },

        onEntriesListMenu: function(textarr) {
            if (textarr && textarr.length>0) {
                var me                  = this,
                    documentHolderView  = me.documentHolder,
                    menu                = documentHolderView.entriesMenu,
                    menuContainer       = documentHolderView.cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id));

                for (var i = 0; i < menu.items.length; i++) {
                    menu.removeItem(menu.items[i]);
                    i--;
                }

                _.each(textarr, function(menuItem, index) {
                    var mnu = new Common.UI.MenuItem({
                        caption     : menuItem
                    }).on('click', function(item, e) {
                        me.api.asc_insertFormula(item.caption, Asc.c_oAscPopUpSelectorType.None, false );
                    });
                    menu.addItem(mnu);
                });

                Common.UI.Menu.Manager.hideAll();

                if (!menu.rendered) {
                    // Prepare menu container
                    if (menuContainer.length < 1) {
                        menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                        documentHolderView.cmpEl.append(menuContainer);
                    }

                    menu.render(menuContainer);
                    menu.cmpEl.attr({tabindex: "-1"});
                }

                var coord  = me.api.asc_getActiveCellCoord(),
                    offset = {left:0,top:0},
                    showPoint = [coord.asc_getX() + offset.left, (coord.asc_getY() < 0 ? 0 : coord.asc_getY()) + coord.asc_getHeight() + offset.top];
                menuContainer.css({left: showPoint[0], top : showPoint[1]});

                menu.show();

                menu.alignPosition();
                _.delay(function() {
                    menu.cmpEl.focus();
                }, 10);
            } else {
                this.documentHolder.entriesMenu.hide();
                Common.UI.warning({
                    title: this.notcriticalErrorTitle,
                    maxwidth: 600,
                    msg  : this.txtNoChoices,
                    callback: _.bind(function(btn){
                        Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                    }, this)
                });
            }
        },

        onFormulaCompleteMenu: function(funcarr) {
            if (!this.documentHolder.funcMenu) return;

            if (funcarr) {
                var me                  = this,
                    documentHolderView  = me.documentHolder,
                    menu                = documentHolderView.funcMenu,
                    menuContainer       = documentHolderView.cmpEl.find('#menu-formula-selection'),
                    funcdesc = SSE.Views.FormulaLang.getDescription(Common.Utils.InternalSettings.get("sse-settings-func-locale"));

                for (var i = 0; i < menu.items.length; i++) {
                    var tip = menu.items[i].cmpEl.data('bs.tooltip');
                    if (tip)
                        tip.hide();
                    menu.removeItem(menu.items[i]);
                    i--;
                }
                funcarr.sort(function (a,b) {
                    var aname = a.asc_getName(true).toLocaleUpperCase(),
                        bname = b.asc_getName(true).toLocaleUpperCase();
                    if (aname < bname) return -1;
                    if (aname > bname) return 1;
                    return 0;
                });
                _.each(funcarr, function(menuItem, index) {
                    var type = menuItem.asc_getType(),
                        name = menuItem.asc_getName(true),
                        origname = me.api.asc_getFormulaNameByLocale(name),
                        mnu = new Common.UI.MenuItem({
                            iconCls: (type==Asc.c_oAscPopUpSelectorType.Func) ? 'mnu-popup-func': ((type==Asc.c_oAscPopUpSelectorType.Table) ? 'mnu-popup-table' : 'mnu-popup-range') ,
                            caption: name,
                            hint        : (funcdesc && funcdesc[origname]) ? funcdesc[origname].d : ''
                    }).on('click', function(item, e) {
                        setTimeout(function(){ me.api.asc_insertFormula(item.caption, type, false ); }, 10);
                    });
                    menu.addItem(mnu);
                });

                if (!menu.rendered) {
                    // Prepare menu container
                    if (menuContainer.length < 1) {
                        menuContainer = $(Common.Utils.String.format('<div id="menu-formula-selection" style="position: absolute; z-index: 10000;" class="no-stop-propagate"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>'));
                        documentHolderView.cmpEl.append(menuContainer);
                    }

                    menu.onAfterKeydownMenu = function(e) {
                        if (e.keyCode == Common.UI.Keys.RETURN && (e.ctrlKey || e.altKey)) return;
//                        Common.UI.Menu.prototype.onAfterKeydownMenu.call(menu, e);

                        var li;
                        if (arguments.length>1 && arguments[1] instanceof KeyboardEvent) // when typing in cell editor
                            e = arguments[1];
                        if (menuContainer.hasClass('open')) {
                            if (e.keyCode == Common.UI.Keys.TAB || e.keyCode == Common.UI.Keys.RETURN && !e.ctrlKey && !e.altKey)
                                li = menuContainer.find('a.focus').closest('li');
                            else if (e.keyCode == Common.UI.Keys.UP || e.keyCode == Common.UI.Keys.DOWN) {
                                var innerEl = menu.cmpEl,
                                    inner_top = innerEl.offset().top,
                                    li_focused = menuContainer.find('a.focus').closest('li');

                                var li_top = li_focused.offset().top;
                                if (li_top < inner_top || li_top+li_focused.outerHeight() > inner_top + innerEl.height()) {
                                    if (menu.scroller) {
                                        menu.scroller.scrollTop(innerEl.scrollTop() + li_top - inner_top, 0);
                                    } else {
                                        innerEl.scrollTop(innerEl.scrollTop() + li_top - inner_top);
                                    }
                                }
                            }
                        }
//                        } else if (e.keyCode == Common.UI.Keys.TAB)
//                            li = $(e.target).closest('li');

                        if (li) {
                            if (li.length>0) li.click();
                            Common.UI.Menu.Manager.hideAll();
                        }
                    };
                    menu.on('hide:after', function(){
                        for (var i = 0; i < menu.items.length; i++) {
                            var tip = menu.items[i].cmpEl.data('bs.tooltip');
                            if (tip)
                                tip.hide();
                        }
                    });

                    menu.render(menuContainer);
                    menu.cmpEl.attr({tabindex: "-1"});
                }

                var coord  = me.api.asc_getActiveCellCoord(),
                    offset = {left:0,top:0},
                    showPoint = [coord.asc_getX() + offset.left, (coord.asc_getY() < 0 ? 0 : coord.asc_getY()) + coord.asc_getHeight() + offset.top];
                menuContainer.css({left: showPoint[0], top : showPoint[1]});
                menu.alignPosition();

                var infocus = me.cellEditor.is(":focus");
                if (!menu.isVisible())
                    Common.UI.Menu.Manager.hideAll();
                _.delay(function() {
                    if (!menu.isVisible()) menu.show();
                    if (menu.scroller) {
                        menu.scroller.update({alwaysVisibleY: true});
                        menu.scroller.scrollTop(0);
                    }
                    if (infocus)
                        me.cellEditor.focus();
                    menu.cmpEl.toggleClass('from-cell-edit', infocus);
                    _.delay(function() {
                        var a = menu.cmpEl.find('li:first a');
                        a.addClass('focus');
                        var tip = a.parent().data('bs.tooltip');
                        if (tip)
                            tip.show();
                    }, 10);
                    if (!infocus)
                        _.delay(function() {
                            menu.cmpEl.focus();
                        }, 10);
                }, 1);
            } else {
                this.documentHolder.funcMenu.hide();
            }
        },

        onFormulaInfo: function(name) {
            var functip = this.tooltips.func_arg;

            if (name) {
                if (!functip.parentEl) {
                    functip.parentEl = $('<div id="tip-container-functip" style="position: absolute; z-index: 10000;"></div>');
                    this.documentHolder.cmpEl.append(functip.parentEl);
                }

                var funcdesc = SSE.Views.FormulaLang.getDescription(Common.Utils.InternalSettings.get("sse-settings-func-locale")),
                    hint = ((funcdesc && funcdesc[name]) ? (this.api.asc_getFormulaLocaleName(name) + funcdesc[name].a) : '').replace(/[,;]/g, this.api.asc_getFunctionArgumentSeparator());

                if (functip.ref && functip.ref.isVisible()) {
                    if (functip.text != hint) {
                        functip.ref.hide();
                        functip.ref = undefined;
                        functip.text = '';
                        functip.isHidden = true;
                    }
                }

                if (!hint) return;

                if (!functip.ref || !functip.ref.isVisible()) {
                    functip.text = hint;
                    functip.ref = new Common.UI.Tooltip({
                        owner   : functip.parentEl,
                        html    : true,
                        title   : hint,
                        cls: 'auto-tooltip'
                    });

                    functip.ref.show([-10000, -10000]);
                    functip.isHidden = false;
                }

                var pos = [
                        this.documentHolder.cmpEl.offset().left - $(window).scrollLeft(),
                        this.documentHolder.cmpEl.offset().top  - $(window).scrollTop()
                    ],
                    coord  = this.api.asc_getActiveCellCoord(),
                    showPoint = [coord.asc_getX() + pos[0] - 3, coord.asc_getY() + pos[1] - functip.ref.getBSTip().$tip.height() - 5];
                var tipwidth = functip.ref.getBSTip().$tip.width();
                if (showPoint[0] + tipwidth > this.tooltips.coauth.bodyWidth )
                    showPoint[0] = this.tooltips.coauth.bodyWidth - tipwidth;

                functip.ref.getBSTip().$tip.css({
                    top : showPoint[1] + 'px',
                    left: showPoint[0] + 'px'
                });
            } else {
                if (!functip.isHidden && functip.ref) {
                    functip.ref.hide();
                    functip.ref = undefined;
                    functip.text = '';
                    functip.isHidden = true;
                }
            }
        },

        onShowSpecialPasteOptions: function(specialPasteShowOptions) {
            var me                  = this,
                documentHolderView  = me.documentHolder,
                coord  = specialPasteShowOptions.asc_getCellCoord(),
                pasteContainer = documentHolderView.cmpEl.find('#special-paste-container'),
                pasteItems = specialPasteShowOptions.asc_getOptions();
            if (!pasteItems) return;

            // Prepare menu container
            if (pasteContainer.length < 1) {
                me._arrSpecialPaste = [];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.paste] = [me.txtPaste, 0];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.pasteOnlyFormula] = [me.txtPasteFormulas, 0];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.formulaNumberFormat] = [me.txtPasteFormulaNumFormat, 0];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.formulaAllFormatting] = [me.txtPasteKeepSourceFormat, 0];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.formulaWithoutBorders] = [me.txtPasteBorders, 0];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.formulaColumnWidth] = [me.txtPasteColWidths, 0];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.mergeConditionalFormating] = [me.txtPasteMerge, 0];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.transpose] = [me.txtPasteTranspose, 0];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.pasteOnlyValues] = [me.txtPasteValues, 1];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.valueNumberFormat] = [me.txtPasteValNumFormat, 1];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.valueAllFormating] = [me.txtPasteValFormat, 1];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.pasteOnlyFormating] = [me.txtPasteFormat, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.link] = [me.txtPasteLink, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.picture] = [me.txtPastePicture, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.linkedPicture] = [me.txtPasteLinkPicture, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceformatting] = [me.txtPasteSourceFormat, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormatting] = [me.txtPasteDestFormat, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = [me.txtKeepTextOnly, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.useTextImport] = [me.txtUseTextImport, 3];

                pasteContainer = $('<div id="special-paste-container" style="position: absolute;"><div id="id-document-holder-btn-special-paste"></div></div>');
                documentHolderView.cmpEl.append(pasteContainer);

                me.btnSpecialPaste = new Common.UI.Button({
                    cls         : 'btn-toolbar',
                    iconCls     : 'btn-paste',
                    menu        : new Common.UI.Menu({items: []})
                });
                me.btnSpecialPaste.render($('#id-document-holder-btn-special-paste')) ;
            }

            if (pasteItems.length>0) {
                var menu = me.btnSpecialPaste.menu;
                for (var i = 0; i < menu.items.length; i++) {
                    menu.removeItem(menu.items[i]);
                    i--;
                }
                var groups = [];
                for (var i = 0; i < 3; i++) {
                    groups[i] = [];
                }

                var importText;
                _.each(pasteItems, function(menuItem, index) {
                    if (menuItem == Asc.c_oSpecialPasteProps.useTextImport) {
                        importText = new Common.UI.MenuItem({
                            caption: me._arrSpecialPaste[menuItem][0],
                            value: menuItem,
                            checkable: true,
                            toggleGroup : 'specialPasteGroup'
                        }).on('click', function(item, e) {
                            (new Common.Views.OpenDialog({
                                title: me.txtImportWizard,
                                closable: true,
                                type: Common.Utils.importTextType.Paste,
                                preview: true,
                                api: me.api,
                                handler: function (result, encoding, delimiter, delimiterChar) {
                                    if (result == 'ok') {
                                        if (me && me.api) {
                                            var props = new Asc.SpecialPasteProps();
                                            props.asc_setProps(Asc.c_oSpecialPasteProps.useTextImport);
                                            props.asc_setAdvancedOptions(new Asc.asc_CCSVAdvancedOptions(encoding, delimiter, delimiterChar));
                                            me.api.asc_SpecialPaste(props);
                                        }
                                        me._state.lastSpecPasteChecked = item;
                                    } else {
                                        item.setChecked(false, true);
                                        me._state.lastSpecPasteChecked && me._state.lastSpecPasteChecked.setChecked(true, true);
                                    }
                                }
                            })).show();
                            setTimeout(function(){menu.hide();}, 100);
                        });
                    } else {
                        var mnu = new Common.UI.MenuItem({
                            caption: me._arrSpecialPaste[menuItem][0],
                            value: menuItem,
                            checkable: true,
                            toggleGroup : 'specialPasteGroup'
                        }).on('click', function(item, e) {
                            me._state.lastSpecPasteChecked = item;

                            var props = new Asc.SpecialPasteProps();
                            props.asc_setProps(item.value);
                            me.api.asc_SpecialPaste(props);
                            setTimeout(function(){menu.hide();}, 100);
                        });
                        groups[me._arrSpecialPaste[menuItem][1]].push(mnu);
                    }
                });
                var newgroup = false;
                for (var i = 0; i < 3; i++) {
                    if (newgroup && groups[i].length>0) {
                        menu.addItem(new Common.UI.MenuItem({ caption: '--' }));
                        newgroup = false;
                    }
                    _.each(groups[i], function(menuItem, index) {
                        menu.addItem(menuItem);
                        newgroup = true;
                    });
                }
                (menu.items.length>0) && menu.items[0].setChecked(true, true);
                me._state.lastSpecPasteChecked = (menu.items.length>0) ? menu.items[0] : null;

                if (importText) {
                    menu.addItem(new Common.UI.MenuItem({ caption: '--' }));
                    menu.addItem(importText);
                }
            }

            if ( coord[0].asc_getX()<0 || coord[0].asc_getY()<0) {
                if (pasteContainer.is(':visible')) pasteContainer.hide();
                return;
            }

            var rightBottom = coord[0],
                leftTop = coord[1],
                width = me.tooltips.coauth.bodyWidth - me.tooltips.coauth.XY[0] - me.tooltips.coauth.rightMenuWidth - 15,
                height = me.tooltips.coauth.apiHeight - 15, // height - scrollbar height
                showPoint = [],
                btnSize = [31, 20],
                right = rightBottom.asc_getX() + rightBottom.asc_getWidth() + 3 + btnSize[0],
                bottom = rightBottom.asc_getY() + rightBottom.asc_getHeight() + 3 + btnSize[1];


            if (right > width) {
                showPoint[0] = (leftTop!==undefined) ? leftTop.asc_getX() : (width-btnSize[0]-3); // leftTop is undefined when paste to text box
                if (bottom > height)
                    showPoint[0] -= (btnSize[0]+3);
                if (showPoint[0]<0) showPoint[0] = width - 3 - btnSize[0];
            } else
                showPoint[0] = right - btnSize[0];

            showPoint[1] = (bottom > height) ? height - 3 - btnSize[1] : bottom - btnSize[1];

            pasteContainer.css({left: showPoint[0], top : showPoint[1]});
            pasteContainer.show();
        },

        onHideSpecialPasteOptions: function() {
            var pasteContainer = this.documentHolder.cmpEl.find('#special-paste-container');
            if (pasteContainer.is(':visible'))
                pasteContainer.hide();
        },

        onToggleAutoCorrectOptions: function(autoCorrectOptions) {
            if (!autoCorrectOptions) {
                var pasteContainer = this.documentHolder.cmpEl.find('#autocorrect-paste-container');
                if (pasteContainer.is(':visible'))
                    pasteContainer.hide();
                return;
            }

            var me                  = this,
                documentHolderView  = me.documentHolder,
                coord  = autoCorrectOptions.asc_getCellCoord(),
                pasteContainer = documentHolderView.cmpEl.find('#autocorrect-paste-container'),
                pasteItems = autoCorrectOptions.asc_getOptions();

            // Prepare menu container
            if (pasteContainer.length < 1) {
                me._arrAutoCorrectPaste = [];
                me._arrAutoCorrectPaste[Asc.c_oAscAutoCorrectOptions.UndoTableAutoExpansion] = me.txtUndoExpansion;
                me._arrAutoCorrectPaste[Asc.c_oAscAutoCorrectOptions.RedoTableAutoExpansion] = me.txtRedoExpansion;

                pasteContainer = $('<div id="autocorrect-paste-container" style="position: absolute;"><div id="id-document-holder-btn-autocorrect-paste"></div></div>');
                documentHolderView.cmpEl.append(pasteContainer);

                me.btnAutoCorrectPaste = new Common.UI.Button({
                    cls         : 'btn-toolbar',
                    iconCls     : 'btn-paste',
                    menu        : new Common.UI.Menu({items: []})
                });
                me.btnAutoCorrectPaste.render($('#id-document-holder-btn-autocorrect-paste')) ;
            }

            if (pasteItems.length>0) {
                var menu = me.btnAutoCorrectPaste.menu;
                for (var i = 0; i < menu.items.length; i++) {
                    menu.removeItem(menu.items[i]);
                    i--;
                }

                var group_prev = -1;
                _.each(pasteItems, function(menuItem, index) {
                    var mnu = new Common.UI.MenuItem({
                        caption: me._arrAutoCorrectPaste[menuItem],
                        value: menuItem
                    }).on('click', function(item, e) {
                        me.api.asc_applyAutoCorrectOptions(item.value);
                        setTimeout(function(){menu.hide();}, 100);
                    });
                    menu.addItem(mnu);
                });
            }

            var width = me.tooltips.coauth.bodyWidth - me.tooltips.coauth.XY[0] - me.tooltips.coauth.rightMenuWidth - 15,
                height = me.tooltips.coauth.apiHeight - 15, // height - scrollbar height
                btnSize = [31, 20],
                right = coord.asc_getX() + coord.asc_getWidth() + 2 + btnSize[0],
                bottom = coord.asc_getY() + coord.asc_getHeight() + 1 + btnSize[1];
            if (right > width || bottom > height || coord.asc_getX()<0 || coord.asc_getY()<0) {
                if (pasteContainer.is(':visible')) pasteContainer.hide();
            } else {
                pasteContainer.css({left: right - btnSize[0], top : bottom - btnSize[1]});
                pasteContainer.show();
            }
        },

        onCellsRange: function(status) {
            this.rangeSelectionMode = (status != Asc.c_oAscSelectionDialogType.None);
        },

        onApiEditCell: function(state) {
            this.isEditFormula = (state == Asc.c_oAscCellEditorState.editFormula);
            this.isEditCell = (state != Asc.c_oAscCellEditorState.editEnd);
        },

        onLockDefNameManager: function(state) {
            this.namedrange_locked = (state == Asc.c_oAscDefinedNameReason.LockDefNameManager);
        },

        onChangeCropState: function(state) {
            this.documentHolder.menuImgCrop.menu.items[0].setChecked(state, true);
        },

        initEquationMenu: function() {
            if (!this._currentMathObj) return;
            var me = this,
                type = me._currentMathObj.get_Type(),
                value = me._currentMathObj,
                mnu, arr = [];

            switch (type) {
                case Asc.c_oAscMathInterfaceType.Accent:
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtRemoveAccentChar,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'remove_AccentCharacter'}
                    });
                    arr.push(mnu);
                    break;
                case Asc.c_oAscMathInterfaceType.BorderBox:
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtBorderProps,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        menu        : new Common.UI.Menu({
                            menuAlign: 'tl-tr',
                            items   : [
                                {
                                    caption: value.get_HideTop() ? me.txtAddTop : me.txtHideTop,
                                    equationProps: {type: type, callback: 'put_HideTop', value: !value.get_HideTop()}
                                },
                                {
                                    caption: value.get_HideBottom() ? me.txtAddBottom : me.txtHideBottom,
                                    equationProps: {type: type, callback: 'put_HideBottom', value: !value.get_HideBottom()}
                                },
                                {
                                    caption: value.get_HideLeft() ? me.txtAddLeft : me.txtHideLeft,
                                    equationProps: {type: type, callback: 'put_HideLeft', value: !value.get_HideLeft()}
                                },
                                {
                                    caption: value.get_HideRight() ? me.txtAddRight : me.txtHideRight,
                                    equationProps: {type: type, callback: 'put_HideRight', value: !value.get_HideRight()}
                                },
                                {
                                    caption: value.get_HideHor() ? me.txtAddHor : me.txtHideHor,
                                    equationProps: {type: type, callback: 'put_HideHor', value: !value.get_HideHor()}
                                },
                                {
                                    caption: value.get_HideVer() ? me.txtAddVer : me.txtHideVer,
                                    equationProps: {type: type, callback: 'put_HideVer', value: !value.get_HideVer()}
                                },
                                {
                                    caption: value.get_HideTopLTR() ? me.txtAddLT : me.txtHideLT,
                                    equationProps: {type: type, callback: 'put_HideTopLTR', value: !value.get_HideTopLTR()}
                                },
                                {
                                    caption: value.get_HideTopRTL() ? me.txtAddLB : me.txtHideLB,
                                    equationProps: {type: type, callback: 'put_HideTopRTL', value: !value.get_HideTopRTL()}
                                }
                            ]
                        })
                    });
                    arr.push(mnu);
                    break;
                case Asc.c_oAscMathInterfaceType.Bar:
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtRemoveBar,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'remove_Bar'}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : (value.get_Pos()==Asc.c_oAscMathInterfaceBarPos.Top) ? me.txtUnderbar : me.txtOverbar,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'put_Pos', value: (value.get_Pos()==Asc.c_oAscMathInterfaceBarPos.Top) ? Asc.c_oAscMathInterfaceBarPos.Bottom : Asc.c_oAscMathInterfaceBarPos.Top}
                    });
                    arr.push(mnu);
                    break;
                case Asc.c_oAscMathInterfaceType.Script:
                    var scripttype = value.get_ScriptType();
                    if (scripttype == Asc.c_oAscMathInterfaceScript.PreSubSup) {
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtScriptsAfter,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_ScriptType', value: Asc.c_oAscMathInterfaceScript.SubSup}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtRemScripts,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_ScriptType', value: Asc.c_oAscMathInterfaceScript.None}
                        });
                        arr.push(mnu);
                    } else {
                        if (scripttype == Asc.c_oAscMathInterfaceScript.SubSup) {
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtScriptsBefore,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_ScriptType', value: Asc.c_oAscMathInterfaceScript.PreSubSup}
                            });
                            arr.push(mnu);
                        }
                        if (scripttype == Asc.c_oAscMathInterfaceScript.SubSup || scripttype == Asc.c_oAscMathInterfaceScript.Sub ) {
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtRemSubscript,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_ScriptType', value: (scripttype == Asc.c_oAscMathInterfaceScript.SubSup) ? Asc.c_oAscMathInterfaceScript.Sup : Asc.c_oAscMathInterfaceScript.None }
                            });
                            arr.push(mnu);
                        }
                        if (scripttype == Asc.c_oAscMathInterfaceScript.SubSup || scripttype == Asc.c_oAscMathInterfaceScript.Sup ) {
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtRemSuperscript,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_ScriptType', value: (scripttype == Asc.c_oAscMathInterfaceScript.SubSup) ? Asc.c_oAscMathInterfaceScript.Sub : Asc.c_oAscMathInterfaceScript.None }
                            });
                            arr.push(mnu);
                        }
                    }
                    break;
                case Asc.c_oAscMathInterfaceType.Fraction:
                    var fraction = value.get_FractionType();
                    if (fraction==Asc.c_oAscMathInterfaceFraction.Skewed || fraction==Asc.c_oAscMathInterfaceFraction.Linear) {
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtFractionStacked,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_FractionType', value: Asc.c_oAscMathInterfaceFraction.Bar}
                        });
                        arr.push(mnu);
                    }
                    if (fraction==Asc.c_oAscMathInterfaceFraction.Bar || fraction==Asc.c_oAscMathInterfaceFraction.Linear) {
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtFractionSkewed,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_FractionType', value: Asc.c_oAscMathInterfaceFraction.Skewed}
                        });
                        arr.push(mnu);
                    }
                    if (fraction==Asc.c_oAscMathInterfaceFraction.Bar || fraction==Asc.c_oAscMathInterfaceFraction.Skewed) {
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtFractionLinear,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_FractionType', value: Asc.c_oAscMathInterfaceFraction.Linear}
                        });
                        arr.push(mnu);
                    }
                    if (fraction==Asc.c_oAscMathInterfaceFraction.Bar || fraction==Asc.c_oAscMathInterfaceFraction.NoBar) {
                        mnu = new Common.UI.MenuItem({
                            caption     : (fraction==Asc.c_oAscMathInterfaceFraction.Bar) ? me.txtRemFractionBar : me.txtAddFractionBar,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_FractionType', value: (fraction==Asc.c_oAscMathInterfaceFraction.Bar) ? Asc.c_oAscMathInterfaceFraction.NoBar : Asc.c_oAscMathInterfaceFraction.Bar}
                        });
                        arr.push(mnu);
                    }
                    break;
                case Asc.c_oAscMathInterfaceType.Limit:
                    mnu = new Common.UI.MenuItem({
                        caption     : (value.get_Pos()==Asc.c_oAscMathInterfaceLimitPos.Top) ? me.txtLimitUnder : me.txtLimitOver,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'put_Pos', value: (value.get_Pos()==Asc.c_oAscMathInterfaceLimitPos.Top) ? Asc.c_oAscMathInterfaceLimitPos.Bottom : Asc.c_oAscMathInterfaceLimitPos.Top}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtRemLimit,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'put_Pos', value: Asc.c_oAscMathInterfaceLimitPos.None}
                    });
                    arr.push(mnu);
                    break;
                case Asc.c_oAscMathInterfaceType.Matrix:
                    mnu = new Common.UI.MenuItem({
                        caption     : value.get_HidePlaceholder() ? me.txtShowPlaceholder : me.txtHidePlaceholder,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'put_HidePlaceholder', value: !value.get_HidePlaceholder()}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.insertText,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        menu        : new Common.UI.Menu({
                            menuAlign: 'tl-tr',
                            items   : [
                                {
                                    caption: me.insertRowAboveText,
                                    equationProps: {type: type, callback: 'insert_MatrixRow', value: true}
                                },
                                {
                                    caption: me.insertRowBelowText,
                                    equationProps: {type: type, callback: 'insert_MatrixRow', value: false}
                                },
                                {
                                    caption: me.insertColumnLeftText,
                                    equationProps: {type: type, callback: 'insert_MatrixColumn', value: true}
                                },
                                {
                                    caption: me.insertColumnRightText,
                                    equationProps: {type: type, callback: 'insert_MatrixColumn', value: false}
                                }
                            ]
                        })
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.deleteText,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        menu        : new Common.UI.Menu({
                            menuAlign: 'tl-tr',
                            items   : [
                                {
                                    caption: me.deleteRowText,
                                    equationProps: {type: type, callback: 'delete_MatrixRow'}
                                },
                                {
                                    caption: me.deleteColumnText,
                                    equationProps: {type: type, callback: 'delete_MatrixColumn'}
                                }
                            ]
                        })
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtMatrixAlign,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        menu        : new Common.UI.Menu({
                            menuAlign: 'tl-tr',
                            items   : [
                                {
                                    caption: me.txtTop,
                                    checkable   : true,
                                    checked     : (value.get_MatrixAlign()==Asc.c_oAscMathInterfaceMatrixMatrixAlign.Top),
                                    equationProps: {type: type, callback: 'put_MatrixAlign', value: Asc.c_oAscMathInterfaceMatrixMatrixAlign.Top}
                                },
                                {
                                    caption: me.centerText,
                                    checkable   : true,
                                    checked     : (value.get_MatrixAlign()==Asc.c_oAscMathInterfaceMatrixMatrixAlign.Center),
                                    equationProps: {type: type, callback: 'put_MatrixAlign', value: Asc.c_oAscMathInterfaceMatrixMatrixAlign.Center}
                                },
                                {
                                    caption: me.txtBottom,
                                    checkable   : true,
                                    checked     : (value.get_MatrixAlign()==Asc.c_oAscMathInterfaceMatrixMatrixAlign.Bottom),
                                    equationProps: {type: type, callback: 'put_MatrixAlign', value: Asc.c_oAscMathInterfaceMatrixMatrixAlign.Bottom}
                                }
                            ]
                        })
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtColumnAlign,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        menu        : new Common.UI.Menu({
                            menuAlign: 'tl-tr',
                            items   : [
                                {
                                    caption: me.leftText,
                                    checkable   : true,
                                    checked     : (value.get_ColumnAlign()==Asc.c_oAscMathInterfaceMatrixColumnAlign.Left),
                                    equationProps: {type: type, callback: 'put_ColumnAlign', value: Asc.c_oAscMathInterfaceMatrixColumnAlign.Left}
                                },
                                {
                                    caption: me.centerText,
                                    checkable   : true,
                                    checked     : (value.get_ColumnAlign()==Asc.c_oAscMathInterfaceMatrixColumnAlign.Center),
                                    equationProps: {type: type, callback: 'put_ColumnAlign', value: Asc.c_oAscMathInterfaceMatrixColumnAlign.Center}
                                },
                                {
                                    caption: me.rightText,
                                    checkable   : true,
                                    checked     : (value.get_ColumnAlign()==Asc.c_oAscMathInterfaceMatrixColumnAlign.Right),
                                    equationProps: {type: type, callback: 'put_ColumnAlign', value: Asc.c_oAscMathInterfaceMatrixColumnAlign.Right}
                                }
                            ]
                        })
                    });
                    arr.push(mnu);
                    break;
                case Asc.c_oAscMathInterfaceType.EqArray:
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtInsertEqBefore,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'insert_Equation', value: true}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtInsertEqAfter,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'insert_Equation', value: false}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtDeleteEq,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'delete_Equation'}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.alignmentText,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        menu        : new Common.UI.Menu({
                            menuAlign: 'tl-tr',
                            items   : [
                                {
                                    caption: me.txtTop,
                                    checkable   : true,
                                    checked     : (value.get_Align()==Asc.c_oAscMathInterfaceEqArrayAlign.Top),
                                    equationProps: {type: type, callback: 'put_Align', value: Asc.c_oAscMathInterfaceEqArrayAlign.Top}
                                },
                                {
                                    caption: me.centerText,
                                    checkable   : true,
                                    checked     : (value.get_Align()==Asc.c_oAscMathInterfaceEqArrayAlign.Center),
                                    equationProps: {type: type, callback: 'put_Align', value: Asc.c_oAscMathInterfaceEqArrayAlign.Center}
                                },
                                {
                                    caption: me.txtBottom,
                                    checkable   : true,
                                    checked     : (value.get_Align()==Asc.c_oAscMathInterfaceEqArrayAlign.Bottom),
                                    equationProps: {type: type, callback: 'put_Align', value: Asc.c_oAscMathInterfaceEqArrayAlign.Bottom}
                                }
                            ]
                        })
                    });
                    arr.push(mnu);
                    break;
                case Asc.c_oAscMathInterfaceType.LargeOperator:
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtLimitChange,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'put_LimitLocation', value: (value.get_LimitLocation() == Asc.c_oAscMathInterfaceNaryLimitLocation.UndOvr) ? Asc.c_oAscMathInterfaceNaryLimitLocation.SubSup : Asc.c_oAscMathInterfaceNaryLimitLocation.UndOvr}
                    });
                    arr.push(mnu);
                    if (value.get_HideUpper() !== undefined) {
                        mnu = new Common.UI.MenuItem({
                            caption     : value.get_HideUpper() ? me.txtShowTopLimit : me.txtHideTopLimit,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_HideUpper', value: !value.get_HideUpper()}
                        });
                        arr.push(mnu);
                    }
                    if (value.get_HideLower() !== undefined) {
                        mnu = new Common.UI.MenuItem({
                            caption     : value.get_HideLower() ? me.txtShowBottomLimit : me.txtHideBottomLimit,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_HideLower', value: !value.get_HideLower()}
                        });
                        arr.push(mnu);
                    }
                    break;
                case Asc.c_oAscMathInterfaceType.Delimiter:
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtInsertArgBefore,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'insert_DelimiterArgument', value: true}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtInsertArgAfter,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'insert_DelimiterArgument', value: false}
                    });
                    arr.push(mnu);
                    if (value.can_DeleteArgument()) {
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtDeleteArg,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'delete_DelimiterArgument'}
                        });
                        arr.push(mnu);
                    }
                    mnu = new Common.UI.MenuItem({
                        caption     : value.has_Separators() ? me.txtDeleteCharsAndSeparators : me.txtDeleteChars,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'remove_DelimiterCharacters'}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : value.get_HideOpeningBracket() ? me.txtShowOpenBracket : me.txtHideOpenBracket,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'put_HideOpeningBracket', value: !value.get_HideOpeningBracket()}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : value.get_HideClosingBracket() ? me.txtShowCloseBracket : me.txtHideCloseBracket,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'put_HideClosingBracket', value: !value.get_HideClosingBracket()}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtStretchBrackets,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        checkable   : true,
                        checked     : value.get_StretchBrackets(),
                        equationProps: {type: type, callback: 'put_StretchBrackets', value: !value.get_StretchBrackets()}
                    });
                    arr.push(mnu);
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtMatchBrackets,
                        equation    : true,
                        disabled    : (!value.get_StretchBrackets() || me._currentParaObjDisabled),
                        checkable   : true,
                        checked     : value.get_StretchBrackets() && value.get_MatchBrackets(),
                        equationProps: {type: type, callback: 'put_MatchBrackets', value: !value.get_MatchBrackets()}
                    });
                    arr.push(mnu);
                    break;
                case Asc.c_oAscMathInterfaceType.GroupChar:
                    if (value.can_ChangePos()) {
                        mnu = new Common.UI.MenuItem({
                            caption     : (value.get_Pos()==Asc.c_oAscMathInterfaceGroupCharPos.Top) ? me.txtGroupCharUnder : me.txtGroupCharOver,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_Pos', value: (value.get_Pos()==Asc.c_oAscMathInterfaceGroupCharPos.Top) ? Asc.c_oAscMathInterfaceGroupCharPos.Bottom : Asc.c_oAscMathInterfaceGroupCharPos.Top}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtDeleteGroupChar,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_Pos', value: Asc.c_oAscMathInterfaceGroupCharPos.None}
                        });
                        arr.push(mnu);
                    }
                    break;
                case Asc.c_oAscMathInterfaceType.Radical:
                    if (value.get_HideDegree() !== undefined) {
                        mnu = new Common.UI.MenuItem({
                            caption     : value.get_HideDegree() ? me.txtShowDegree : me.txtHideDegree,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_HideDegree', value: !value.get_HideDegree()}
                        });
                        arr.push(mnu);
                    }
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtDeleteRadical,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'remove_Radical'}
                    });
                    arr.push(mnu);
                    break;
            }
            if (value.can_IncreaseArgumentSize()) {
                mnu = new Common.UI.MenuItem({
                    caption     : me.txtIncreaseArg,
                    equation    : true,
                    disabled    : me._currentParaObjDisabled,
                    equationProps: {type: type, callback: 'increase_ArgumentSize'}
                });
                arr.push(mnu);
            }
            if (value.can_DecreaseArgumentSize()) {
                mnu = new Common.UI.MenuItem({
                    caption     : me.txtDecreaseArg,
                    equation    : true,
                    disabled    : me._currentParaObjDisabled,
                    equationProps: {type: type, callback: 'decrease_ArgumentSize'}
                });
                arr.push(mnu);
            }
            if (value.can_InsertManualBreak()) {
                mnu = new Common.UI.MenuItem({
                    caption     : me.txtInsertBreak,
                    equation    : true,
                    disabled    : me._currentParaObjDisabled,
                    equationProps: {type: type, callback: 'insert_ManualBreak'}
                });
                arr.push(mnu);
            }
            if (value.can_DeleteManualBreak()) {
                mnu = new Common.UI.MenuItem({
                    caption     : me.txtDeleteBreak,
                    equation    : true,
                    disabled    : me._currentParaObjDisabled,
                    equationProps: {type: type, callback: 'delete_ManualBreak'}
                });
                arr.push(mnu);
            }
            if (value.can_AlignToCharacter()) {
                mnu = new Common.UI.MenuItem({
                    caption     : me.txtAlignToChar,
                    equation    : true,
                    disabled    : me._currentParaObjDisabled,
                    equationProps: {type: type, callback: 'align_ToCharacter'}
                });
                arr.push(mnu);
            }
            return arr;
        },

        addEquationMenu: function(insertIdx) {
            var me = this;
            
            me.clearEquationMenu(insertIdx);

            var equationMenu = me.documentHolder.textInShapeMenu,
                menuItems = me.initEquationMenu();

            if (menuItems.length > 0) {
                _.each(menuItems, function(menuItem, index) {
                    if (menuItem.menu) {
                        _.each(menuItem.menu.items, function(item) {
                            item.on('click', _.bind(me.equationCallback, me, item.options.equationProps));
                        });
                    } else
                        menuItem.on('click', _.bind(me.equationCallback, me, menuItem.options.equationProps));
                    equationMenu.insertItem(insertIdx, menuItem);
                    insertIdx++;
                });
            }
            return menuItems.length;
        },

        clearEquationMenu: function(insertIdx) {
            var me = this;
            var equationMenu = me.documentHolder.textInShapeMenu;
            for (var i = insertIdx; i < equationMenu.items.length; i++) {
                if (equationMenu.items[i].options.equation) {
                    if (equationMenu.items[i].menu) {
                        _.each(equationMenu.items[i].menu.items, function(item) {
                            item.off('click');
                        });
                    } else
                        equationMenu.items[i].off('click');
                    equationMenu.removeItem(equationMenu.items[i]);
                    i--;
                } else
                    break;
            }
        },

        equationCallback: function(eqProps) {
            var me = this;
            if (eqProps) {
                var eqObj;
                switch (eqProps.type) {
                    case Asc.c_oAscMathInterfaceType.Accent:
                        eqObj = new CMathMenuAccent();
                        break;
                    case Asc.c_oAscMathInterfaceType.BorderBox:
                        eqObj = new CMathMenuBorderBox();
                        break;
                    case Asc.c_oAscMathInterfaceType.Box:
                        eqObj = new CMathMenuBox();
                        break;
                    case Asc.c_oAscMathInterfaceType.Bar:
                        eqObj = new CMathMenuBar();
                        break;
                    case Asc.c_oAscMathInterfaceType.Script:
                        eqObj = new CMathMenuScript();
                        break;
                    case Asc.c_oAscMathInterfaceType.Fraction:
                        eqObj = new CMathMenuFraction();
                        break;
                    case Asc.c_oAscMathInterfaceType.Limit:
                        eqObj = new CMathMenuLimit();
                        break;
                    case Asc.c_oAscMathInterfaceType.Matrix:
                        eqObj = new CMathMenuMatrix();
                        break;
                    case Asc.c_oAscMathInterfaceType.EqArray:
                        eqObj = new CMathMenuEqArray();
                        break;
                    case Asc.c_oAscMathInterfaceType.LargeOperator:
                        eqObj = new CMathMenuNary();
                        break;
                    case Asc.c_oAscMathInterfaceType.Delimiter:
                        eqObj = new CMathMenuDelimiter();
                        break;
                    case Asc.c_oAscMathInterfaceType.GroupChar:
                        eqObj = new CMathMenuGroupCharacter();
                        break;
                    case Asc.c_oAscMathInterfaceType.Radical:
                        eqObj = new CMathMenuRadical();
                        break;
                    case Asc.c_oAscMathInterfaceType.Common:
                        eqObj = new CMathMenuBase();
                        break;
                }
                if (eqObj) {
                    eqObj[eqProps.callback](eqProps.value);
                    me.api.asc_SetMathProps(eqObj);
                }
            }
            Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
        },

        onTextInShapeAfterRender:function(cmp) {
            var view = this.documentHolder,
                _conf = view.paraBulletsPicker.conf;
            view.paraBulletsPicker = new Common.UI.DataView({
                el          : $('#id-docholder-menu-bullets'),
                parentMenu  : view.menuParagraphBullets.menu,
                store       : view.paraBulletsPicker.store,
                itemTemplate: _.template('<div id="<%= id %>" class="item-markerlist" style="background-position: 0 -<%= offsety %>px;"></div>')
            });
            view.paraBulletsPicker.on('item:click', _.bind(this.onSelectBullets, this));
            _conf && view.paraBulletsPicker.selectRecord(_conf.rec, true);
        },

        onSignatureClick: function(item) {
            var datavalue = item.cmpEl.attr('data-value');
            switch (item.value) {
                case 0:
                    Common.NotificationCenter.trigger('protect:sign', datavalue); //guid
                    break;
                case 1:
                    this.api.asc_ViewCertificate(datavalue); //certificate id
                    break;
                case 2:
                    Common.NotificationCenter.trigger('protect:signature', 'visible', this._isDisabled, datavalue);//guid, can edit settings for requested signature
                    break;
                case 3:
                    this.api.asc_RemoveSignature(datavalue); //guid
                    break;
            }
        },

        onOriginalSizeClick: function(item) {
            if (this.api){
                var imgsize = this.api.asc_getOriginalImageSize();
                var w = imgsize.asc_getImageWidth();
                var h = imgsize.asc_getImageHeight();

                var properties = new Asc.asc_CImgProperty();
                properties.asc_putWidth(w);
                properties.asc_putHeight(h);
                properties.put_ResetCrop(true);
                this.api.asc_setGraphicObjectProps(properties);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Set Image Original Size');
            }
        },

        onImgReplace: function(menu, item) {
            var me = this;
            if (this.api) {
                if (item.value == 'file') {
                    setTimeout(function(){
                        if (me.api) me.api.asc_changeImageFromFile();
                        Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                    }, 10);
                } else {
                    (new Common.Views.ImageFromUrlDialog({
                        handler: function(result, value) {
                            if (result == 'ok') {
                                if (me.api) {
                                    var checkUrl = value.replace(/ /g, '');
                                    if (!_.isEmpty(checkUrl)) {
                                        var props = new Asc.asc_CImgProperty();
                                        props.asc_putImageUrl(checkUrl);
                                        me.api.asc_setGraphicObjectProps(props);
                                    }
                                }
                            }
                            Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                        }
                    })).show();
                }
            }
        },

        onNumberFormatSelect: function(menu, item) {
            if (item.value !== undefined && item.value !== 'advanced') {
                if (this.api)
                    this.api.asc_setCellFormat(item.options.format);
            }
            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        },

        onCustomNumberFormat: function(item) {
            var me = this,
                value = me.api.asc_getLocale();
            (!value) && (value = ((me.permissions.lang) ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(me.permissions.lang)) : 0x0409));

            (new SSE.Views.FormatSettingsDialog({
                api: me.api,
                handler: function(result, settings) {
                    if (settings) {
                        me.api.asc_setCellFormat(settings.format);
                    }
                    Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                },
                props   : {format: item.options.numformat, formatInfo: item.options.numformatinfo, langId: value}
            })).show();
            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        },

        onNumberFormatOpenAfter: function(menu) {
            if (this.api) {
                var me = this,
                    value = me.api.asc_getLocale();
                (!value) && (value = ((me.permissions.lang) ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(me.permissions.lang)) : 0x0409));

                if (this._state.langId !== value) {
                    this._state.langId = value;

                    var info = new Asc.asc_CFormatCellsInfo();
                    info.asc_setType(Asc.c_oAscNumFormatType.None);
                    info.asc_setSymbol(this._state.langId);
                    var arr = this.api.asc_getFormatCells(info); // all formats
                    for (var i=0; i<menu.items.length-2; i++) {
                        menu.items[i].options.format = arr[i];
                    }
                }

                var val = menu.options.numformatinfo;
                val = (val) ? val.asc_getType() : -1;
                for (var i=0; i<menu.items.length-2; i++) {
                    var mnu = menu.items[i];
                    mnu.options.exampleval = me.api.asc_getLocaleExample(mnu.options.format);
                    $(mnu.el).find('label').text(mnu.options.exampleval);
                    mnu.setChecked(val == mnu.value);
                }
            }
        },

        SetDisabled: function(state, canProtect) {
            this._isDisabled = state;
            this._canProtect = canProtect;
        },

        guestText               : 'Guest',
        textCtrlClick           : 'Click the link to open it or click and hold the mouse button to select the cell.',
        txtHeight               : 'Height',
        txtWidth                : 'Width',
        tipIsLocked             : 'This element is being edited by another user.',
        textChangeColumnWidth   : 'Column Width {0} symbols ({1} pixels)',
        textChangeRowHeight     : 'Row Height {0} points ({1} pixels)',
        textInsertLeft          : 'Insert Left',
        textInsertTop           : 'Insert Top',
        textSym                 : 'sym',
        notcriticalErrorTitle: 'Warning',
        errorInvalidLink: 'The link reference does not exist. Please correct the link or delete it.',
        txtRemoveAccentChar: 'Remove accent character',
        txtBorderProps: 'Borders property',
        txtHideTop: 'Hide top border',
        txtHideBottom: 'Hide bottom border',
        txtHideLeft: 'Hide left border',
        txtHideRight: 'Hide right border',
        txtHideHor: 'Hide horizontal line',
        txtHideVer: 'Hide vertical line',
        txtHideLT: 'Hide left top line',
        txtHideLB: 'Hide left bottom line',
        txtAddTop: 'Add top border',
        txtAddBottom: 'Add bottom border',
        txtAddLeft: 'Add left border',
        txtAddRight: 'Add right border',
        txtAddHor: 'Add horizontal line',
        txtAddVer: 'Add vertical line',
        txtAddLT: 'Add left top line',
        txtAddLB: 'Add left bottom line',
        txtRemoveBar: 'Remove bar',
        txtOverbar: 'Bar over text',
        txtUnderbar: 'Bar under text',
        txtRemScripts: 'Remove scripts',
        txtRemSubscript: 'Remove subscript',
        txtRemSuperscript: 'Remove superscript',
        txtScriptsAfter: 'Scripts after text',
        txtScriptsBefore: 'Scripts before text',
        txtFractionStacked: 'Change to stacked fraction',
        txtFractionSkewed: 'Change to skewed fraction',
        txtFractionLinear: 'Change to linear fraction',
        txtRemFractionBar: 'Remove fraction bar',
        txtAddFractionBar: 'Add fraction bar',
        txtRemLimit: 'Remove limit',
        txtLimitOver: 'Limit over text',
        txtLimitUnder: 'Limit under text',
        txtHidePlaceholder: 'Hide placeholder',
        txtShowPlaceholder: 'Show placeholder',
        txtMatrixAlign: 'Matrix alignment',
        txtColumnAlign: 'Column alignment',
        txtTop: 'Top',
        txtBottom: 'Bottom',
        txtInsertEqBefore: 'Insert equation before',
        txtInsertEqAfter: 'Insert equation after',
        txtDeleteEq: 'Delete equation',
        txtLimitChange: 'Change limits location',
        txtHideTopLimit: 'Hide top limit',
        txtShowTopLimit: 'Show top limit',
        txtHideBottomLimit: 'Hide bottom limit',
        txtShowBottomLimit: 'Show bottom limit',
        txtInsertArgBefore: 'Insert argument before',
        txtInsertArgAfter: 'Insert argument after',
        txtDeleteArg: 'Delete argument',
        txtHideOpenBracket: 'Hide opening bracket',
        txtShowOpenBracket: 'Show opening bracket',
        txtHideCloseBracket: 'Hide closing bracket',
        txtShowCloseBracket: 'Show closing bracket',
        txtStretchBrackets: 'Stretch brackets',
        txtMatchBrackets: 'Match brackets to argument height',
        txtGroupCharOver: 'Char over text',
        txtGroupCharUnder: 'Char under text',
        txtDeleteGroupChar: 'Delete char',
        txtHideDegree: 'Hide degree',
        txtShowDegree: 'Show degree',
        txtIncreaseArg: 'Increase argument size',
        txtDecreaseArg: 'Decrease argument size',
        txtInsertBreak: 'Insert manual break',
        txtDeleteBreak: 'Delete manual break',
        txtAlignToChar: 'Align to character',
        txtDeleteRadical: 'Delete radical',
        txtDeleteChars: 'Delete enclosing characters',
        txtDeleteCharsAndSeparators: 'Delete enclosing characters and separators',
        insertText: 'Insert',
        alignmentText: 'Alignment',
        leftText: 'Left',
        rightText: 'Right',
        centerText: 'Center',
        insertRowAboveText      : 'Row Above',
        insertRowBelowText      : 'Row Below',
        insertColumnLeftText    : 'Column Left',
        insertColumnRightText   : 'Column Right',
        deleteText              : 'Delete',
        deleteRowText           : 'Delete Row',
        deleteColumnText        : 'Delete Column',
        txtNoChoices: 'There are no choices for filling the cell.<br>Only text values from the column can be selected for replacement.',
        txtExpandSort: 'The data next to the selection will not be sorted. Do you want to expand the selection to include the adjacent data or continue with sorting the currently selected cells only?',
        txtExpand: 'Expand and sort',
        txtSorting: 'Sorting',
        txtSortSelected: 'Sort selected',
        txtPaste: 'Paste',
        txtPasteFormulas: 'Paste only formula',
        txtPasteFormulaNumFormat: 'Formula + number format',
        txtPasteKeepSourceFormat: 'Formula + all formatting',
        txtPasteBorders: 'Formula without borders',
        txtPasteColWidths: 'Formula + column width',
        txtPasteMerge: 'Merge conditional formatting',
        txtPasteTranspose: 'Transpose',
        txtPasteValues: 'Paste only value',
        txtPasteValNumFormat: 'Value + number format',
        txtPasteValFormat: 'Value + all formatting',
        txtPasteFormat: 'Paste only formatting',
        txtPasteLink: 'Paste Link',
        txtPastePicture: 'Picture',
        txtPasteLinkPicture: 'Linked Picture',
        txtPasteSourceFormat: 'Source formatting',
        txtPasteDestFormat: 'Destination formatting',
        txtKeepTextOnly: 'Keep text only',
        txtUseTextImport: 'Use text import wizard',
        txtUndoExpansion: 'Undo table autoexpansion',
        txtRedoExpansion: 'Redo table autoexpansion',
        txtAnd: 'and',
        txtOr: 'or',
        txtEquals           : "Equals",
        txtNotEquals        : "Does not equal",
        txtGreater          : "Greater than",
        txtGreaterEquals    : "Greater than or equal to",
        txtLess             : "Less than",
        txtLessEquals       : "Less than or equal to",
        txtAboveAve         : 'Above average',
        txtBelowAve         : 'Below average',
        txtBegins           : "Begins with",
        txtNotBegins        : "Does not begin with",
        txtEnds             : "Ends with",
        txtNotEnds          : "Does not end with",
        txtContains         : "Contains",
        txtNotContains      : "Does not contain",
        txtFilterTop: 'Top',
        txtFilterBottom: 'Bottom',
        txtItems: 'items',
        txtPercent: 'percent',
        txtEqualsToCellColor: 'Equals to cell color',
        txtEqualsToFontColor: 'Equals to font color',
        txtAll: '(All)',
        txtBlanks: '(Blanks)',
        txtColumn: 'Column',
        txtImportWizard: 'Text Import Wizard'

    }, SSE.Controllers.DocumentHolder || {}));
});