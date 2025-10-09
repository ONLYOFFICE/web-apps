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
 *  DocumentHolderExt.js
 *
 *  DocumentHolder controller
 *
 *  Created on 14/12/24
 *
 */

define([], function () {
    'use strict';

    if (window.SSE && window.SSE.Controllers && window.SSE.Controllers.DocumentHolder) {
        let dh = window.SSE.Controllers.DocumentHolder.prototype;

        dh.setEvents = function() {
            var me = this;
            this.addListeners({
                'DocumentHolder': {
                    'createdelayedelements': this.onCreateDelayedElements,
                    'equation:callback': this.equationCallback
                }
            });

            Common.NotificationCenter.on({
                'tabs:dragend': _.bind(me.onDragEndMouseUp, me),
                'pivot:dragend': _.bind(me.onDragEndMouseUp, me)
            });
            Common.Gateway.on('setactionlink', _.bind(me.onSetActionLink, me));

            if (this.api) {
                this.api.asc_registerCallback('asc_onContextMenu',          _.bind(this.onApiContextMenu, this));
                this.api.asc_registerCallback('asc_onMouseMove',            _.bind(this.onApiMouseMove, this));
                /** coauthoring begin **/
                this.api.asc_registerCallback('asc_onHideComment',          this.wrapEvents.apiHideComment);
//            this.api.asc_registerCallback('asc_onShowComment',          this.wrapEvents.apiShowComment);
                /** coauthoring end **/
                this.api.asc_registerCallback('asc_onHyperlinkClick',       _.bind(this.onApiHyperlinkClick, this));
                this.api.asc_registerCallback('asc_onSelectionChanged', _.bind(this.onSelectionChanged, this));

                if (this.permissions.isEdit===true) {
                    this.api.asc_registerCallback('asc_onSetAFDialog',          _.bind(this.onApiAutofilter, this));
                    this.api.asc_registerCallback('asc_onEditCell', _.bind(this.onApiEditCell, this));
                    this.api.asc_registerCallback('asc_onEntriesListMenu', _.bind(this.onEntriesListMenu, this, false)); // Alt + Down
                    this.api.asc_registerCallback('asc_onValidationListMenu', _.bind(this.onEntriesListMenu, this, true));
                    this.api.asc_registerCallback('asc_onFormulaCompleteMenu', _.bind(this.onApiFormulaCompleteMenu, this));
                    this.api.asc_registerCallback('asc_onShowSpecialPasteOptions', _.bind(this.onShowSpecialPasteOptions, this));
                    this.api.asc_registerCallback('asc_onHideSpecialPasteOptions', _.bind(this.onHideSpecialPasteOptions, this));
                    this.api.asc_registerCallback('asc_onToggleAutoCorrectOptions', _.bind(this.onToggleAutoCorrectOptions, this));
                    this.api.asc_registerCallback('asc_onFormulaInfo', _.bind(this.onFormulaInfo, this));
                    this.api.asc_registerCallback('asc_ChangeCropState', _.bind(this.onChangeCropState, this));
                    this.api.asc_registerCallback('asc_onInputMessage', _.bind(this.onInputMessage, this));
                    this.api.asc_registerCallback('asc_onTableTotalMenu', _.bind(this.onTableTotalMenu, this));
                    this.api.asc_registerCallback('asc_onShowPivotHeaderDetailsDialog', _.bind(this.onShowPivotHeaderDetailsDialog, this));
                    this.api.asc_registerCallback('asc_onShowPivotGroupDialog', _.bind(this.onShowPivotGroupDialog, this));
                    if (!this.permissions.isEditMailMerge && !this.permissions.isEditDiagram && !this.permissions.isEditOle) {
                        this.api.asc_registerCallback('asc_doubleClickOnTableOleObject', _.bind(this.onDoubleClickOnTableOleObject, this));
                        this.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.Image, _.bind(this.onInsertImage, this));
                        this.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.ImageUrl, _.bind(this.onInsertImageUrl, this));

                    }
                    if (!this.permissions.isEditDiagram) this.api.asc_registerCallback('asc_onSingleChartSelectionChanged', _.bind(this.onSingleChartSelectionChanged, this));
                    this.api.asc_registerCallback('asc_onShowMathTrack',            _.bind(this.onShowMathTrack, this));
                    this.api.asc_registerCallback('asc_onHideMathTrack',            _.bind(this.onHideMathTrack, this));
                    this.api.asc_registerCallback('asc_onHideEyedropper',           _.bind(this.hideEyedropperTip, this));
                    this.api.asc_SetMathInputType(Common.localStorage.getBool("sse-equation-input-latex") ? Asc.c_oAscMathInputType.LaTeX : Asc.c_oAscMathInputType.Unicode);
                }
                this.api.asc_registerCallback('asc_onShowForeignCursorLabel',       _.bind(this.onShowForeignCursorLabel, this));
                this.api.asc_registerCallback('asc_onHideForeignCursorLabel',       _.bind(this.onHideForeignCursorLabel, this));
                this.api.asc_registerCallback('onPluginContextMenu',                _.bind(this.onPluginContextMenu, this));
            }
        };

        dh.onCreateDelayedElements = function(view, type) {
            var me = this;
            me.type = type;

            if (type==='edit') {
                view.pmiCut.on('click',                             _.bind(me.onCopyPaste, me));
                view.pmiCopy.on('click',                            _.bind(me.onCopyPaste, me));
                view.pmiPaste.on('click',                           _.bind(me.onCopyPaste, me));
                view.pmiImgCut.on('click',                          _.bind(me.onCopyPaste, me));
                view.pmiImgCopy.on('click',                         _.bind(me.onCopyPaste, me));
                view.pmiImgPaste.on('click',                        _.bind(me.onCopyPaste, me));
                view.pmiTextCut.on('click',                         _.bind(me.onCopyPaste, me));
                view.pmiTextCopy.on('click',                        _.bind(me.onCopyPaste, me));
                view.pmiTextPaste.on('click',                       _.bind(me.onCopyPaste, me));
                view.pmiCommonCut.on('click',                       _.bind(me.onCopyPaste, me));
                view.pmiCommonCopy.on('click',                      _.bind(me.onCopyPaste, me));
                view.pmiCommonPaste.on('click',                     _.bind(me.onCopyPaste, me));
                view.pmiInsertEntire.on('click',                    _.bind(me.onInsertEntire, me));
                view.pmiDeleteEntire.on('click',                    _.bind(me.onDeleteEntire, me));
                view.pmiInsertCells.menu.on('item:click',           _.bind(me.onInsertCells, me));
                view.pmiDeleteCells.menu.on('item:click',           _.bind(me.onDeleteCells, me));
                view.pmiSparklines.menu.on('item:click',            _.bind(me.onClear, me));
                view.pmiSortCells.menu.on('item:click',             _.bind(me.onSortCells, me));
                view.pmiFilterCells.menu.on('item:click',           _.bind(me.onFilterCells, me));
                view.pmiReapply.on('click',                         _.bind(me.onReapply, me));
                view.pmiCondFormat.on('click',                      _.bind(me.onCondFormat, me));
                view.mnuRefreshPivot.on('click',                    _.bind(me.onRefreshPivot, me));
                view.mnuExpandCollapsePivot.menu.on('item:click',   _.bind(me.onExpandCollapsePivot, me));
                view.mnuGroupPivot.on('click',                      _.bind(me.onGroupPivot, me));
                view.mnuUnGroupPivot.on('click',                    _.bind(me.onGroupPivot, me));
                view.mnuPivotSettings.on('click',                   _.bind(me.onPivotSettings, me));
                view.mnuFieldSettings.on('click',                   _.bind(me.onFieldSettings, me));
                view.mnuDeleteField.on('click',                     _.bind(me.onDeleteField, me));
                view.mnuSubtotalField.on('click',                   _.bind(me.onSubtotalField, me));
                view.mnuSummarize.menu.on('item:click',             _.bind(me.onSummarize, me));
                view.mnuShowAs.menu.on('item:click',                _.bind(me.onShowAs, me));
                view.mnuShowDetails.on('click',                     _.bind(me.onShowDetails, me));
                view.mnuPivotSort.menu.on('item:click',             _.bind(me.onPivotSort, me));
                view.mnuPivotFilter.menu.on('item:click',           _.bind(me.onPivotFilter, me));
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
                view.menuImgResetCrop.on('click',                   _.bind(me.onImgResetCrop, me));
                view.menuImageAlign.menu.on('item:click',           _.bind(me.onImgMenuAlign, me));
                view.menuShapesMerge.menu.on('item:click',           _.bind(me.onShapesMerge, me));
                view.menuChartElement.on('item:click',               _.bind(me.onChartElement, me));
                view.menuChartElement.menu.items.forEach(item => {
                    if (item.menu) {
                        item.menu.items.forEach(item => {
                            item.on('click', function() {
                                me.onChartElement(item.menu, item);
                            });
                        });
                    }
                });
                view.menuParagraphVAlign.menu.on('item:click',      _.bind(me.onParagraphVAlign, me));
                view.menuParagraphDirection.menu.on('item:click',   _.bind(me.onParagraphDirection, me));
                view.menuParagraphBullets.menu.on('item:click',     _.bind(me.onSelectBulletMenu, me));
                // view.menuParagraphBullets.menu.on('render:after',   _.bind(me.onBulletMenuShowAfter, me));
                view.menuParagraphBullets.menu.on('show:after',     _.bind(me.onBulletMenuShowAfter, me));
                view.menuAddHyperlinkShape.on('click',              _.bind(me.onInsHyperlink, me));
                view.menuEditHyperlinkShape.on('click',             _.bind(me.onInsHyperlink, me));
                view.menuRemoveHyperlinkShape.on('click',           _.bind(me.onDelHyperlink, me));
                view.pmiTextAdvanced.on('click',                    _.bind(me.onTextAdvanced, me));
                view.mnuShapeAdvanced.on('click',                   _.bind(me.onShapeAdvanced, me));
                view.mnuChartEdit.on('click',                       _.bind(me.onChartEdit, me));
                view.mnuChartData.on('click',                       _.bind(me.onChartData, me));
                view.mnuChartType.on('click',                       _.bind(me.onChartType, me));
                view.mnuImgAdvanced.on('click',                     _.bind(me.onImgAdvanced, me));
                view.mnuSlicerAdvanced.on('click',                  _.bind(me.onSlicerAdvanced, me));
                view.textInShapeMenu.on('render:after',             _.bind(me.onTextInShapeAfterRender, me));
                view.menuSignatureEditSign.on('click',              _.bind(me.onSignatureClick, me));
                view.menuSignatureEditSetup.on('click',             _.bind(me.onSignatureClick, me));
                view.menuImgOriginalSize.on('click',                _.bind(me.onOriginalSizeClick, me));
                view.menuImgReplace.menu.on('item:click',           _.bind(me.onImgReplace, me));
                view.pmiCellFormat.on('click',                      _.bind(me.onCellFormat, me));
                view.pmiNumFormat.menu.on('item:click',             _.bind(me.onNumberFormatSelect, me));
                view.pmiNumFormat.menu.on('show:after',             _.bind(me.onNumberFormatOpenAfter, me));
                view.pmiAdvancedNumFormat.on('click',               _.bind(me.onCustomNumberFormat, me));
                view.tableTotalMenu.on('item:click',                _.bind(me.onTotalMenuClick, me));
                view.menuImgMacro.on('click',                       _.bind(me.onImgMacro, me));
                view.menuImgEditPoints.on('click',                  _.bind(me.onImgEditPoints, me));
                view.pmiGetRangeList.on('click',                    _.bind(me.onGetLink, me));
                view.menuParagraphEquation.menu.on('item:click',    _.bind(me.convertEquation, me));
                view.menuSaveAsPicture.on('click',                  _.bind(me.saveAsPicture, me));
                view.fillMenu.on('item:click',                      _.bind(me.onFillSeriesClick, me));
                view.fillMenu.on('hide:after',                      _.bind(me.onFillSeriesHideAfter, me));
                view.menuEditObject.on('click', _.bind(me.onEditObject, me));
            } else {
                view.menuViewCopy.on('click',                       _.bind(me.onCopyPaste, me));
                view.menuViewUndo.on('click',                       _.bind(me.onUndo, me));
                view.menuViewAddComment.on('click',                 _.bind(me.onAddComment, me));
                view.menuSignatureViewSign.on('click',              _.bind(me.onSignatureClick, me));
                view.menuSignatureDetails.on('click',               _.bind(me.onSignatureClick, me));
                view.menuSignatureViewSetup.on('click',             _.bind(me.onSignatureClick, me));
                view.menuSignatureRemove.on('click',                _.bind(me.onSignatureClick, me));
                view.pmiViewGetRangeList.on('click',                _.bind(me.onGetLink, me));
            }

            var addEvent = function( elem, type, fn, options ) {
                elem.addEventListener ? elem.addEventListener( type, fn, options) : elem.attachEvent( "on" + type, fn );
            };

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
                            if (e.target.localName == 'canvas' && (!me.isEditFormula || me.rangeSelectionMode)) {
                                if (me._preventClick)
                                    me._preventClick = false;
                                else {
                                    if (e.target.getAttribute && e.target.getAttribute("oo_no_focused"))
                                        return;
                                    documentHolderEl.focus();
                                }
                            }
                        }
                    },
                    touchstart: function(e){
                        if (e.target.localName == 'canvas')
                            Common.UI.Menu.Manager.hideAll();
                    }
                });

                //NOTE: set mouse wheel handler
                var eventname=(/Firefox/i.test(navigator.userAgent))? 'DOMMouseScroll' : 'mousewheel';
                addEvent(view.el, eventname, _.bind(this.onDocumentWheel,this), false);

                me.cellEditor = $('#ce-cell-content');
            }
            Common.Utils.isChrome ? addEvent(document, 'mousewheel', _.bind(this.onDocumentWheel,this), { passive: false } ) :
                $(document).on('mousewheel',    _.bind(this.onDocumentWheel, this));
            this.onChangeProtectSheet();
        };

        dh.initExternalEditors = function() {
            var me = this;
            if (!me.permissions.isEditMailMerge && !me.permissions.isEditDiagram && !me.permissions.isEditOle) {
                var oleEditor = me.getApplication().getController('Common.Controllers.ExternalOleEditor').getView('Common.Views.ExternalOleEditor');
                if (oleEditor) {
                    oleEditor.on('internalmessage', _.bind(function(cmp, message) {
                        var command = message.data.command;
                        var data = message.data.data;
                        if (me.api) {
                            if (oleEditor.isEditMode())
                                me.api.asc_editTableOleObject(data);
                        }
                    }, me));
                    oleEditor.on('hide', _.bind(function(cmp, message) {
                        if (me.api) {
                            me.api.asc_enableKeyEvents(true);
                            me.api.asc_onCloseFrameEditor();
                        }
                        setTimeout(function(){
                            me.documentHolder.fireEvent('editcomplete', me.documentHolder);
                        }, 10);
                    }, me));
                }
            }
        };

        dh.onEditObject = function() {
            if (!Common.Controllers.LaunchController.isScriptLoaded()) return;
            if (this.api) {
                var oleobj = this.api.asc_canEditTableOleObject();
                if (oleobj) {
                    this.api.asc_editOleTableInFrameEditor();
                } else {
                    this.api.asc_startEditCurrentOleObject();
                }
            }
        };

        dh.onCopyPaste = function(item) {
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
        };

        dh.onInsertEntire = function(item) {
            if (this.api) {
                switch (this.api.asc_getCellInfo().asc_getSelectionType()) {
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
        };

        dh.onInsertCells = function(menu, item) {
            if (this.api) {
                this.api.asc_insertCells(item.value);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Insert Cells');
            }
        };

        dh.onDeleteEntire = function(item) {
            if (this.api) {
                switch (this.api.asc_getCellInfo().asc_getSelectionType()) {
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
        };

        dh.onDeleteCells = function(menu, item) {
            if (this.api) {
                this.api.asc_deleteCells(item.value);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Delete Cells');
            }
        };

        dh.onSortCells = function(menu, item) {
            Common.NotificationCenter.trigger('protect:check', this.onSortCellsCallback, this, [menu, item]);
        };

        dh.onSortCellsCallback = function(menu, item) {
            if (item.value=='advanced') {
                Common.NotificationCenter.trigger('data:sortcustom', this);
                return;
            }
            if (this.api) {
                var res = this.api.asc_sortCellsRangeExpand();
                switch (res) {
                    case Asc.c_oAscSelectionSortExpand.showExpandMessage:
                        var config = {
                            width: 500,
                            title: this.txtSorting,
                            msg: this.txtExpandSort,
                            buttons: [  {caption: this.txtExpand, primary: true, value: 'expand'},
                                {caption: this.txtSortSelected, value: 'sort'},
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
                        break;
                    case Asc.c_oAscSelectionSortExpand.showLockMessage:
                        var config = {
                            width: 500,
                            title: this.txtSorting,
                            msg: this.txtLockSort,
                            buttons: ['yes', 'no'],
                            primary: 'yes',
                            callback: _.bind(function(btn){
                                (btn == 'yes') && this.api.asc_sortColFilter(item.value, '', undefined, (item.value==Asc.c_oAscSortOptions.ByColorFill) ? this.documentHolder.ssMenu.cellColor : this.documentHolder.ssMenu.fontColor, false);
                                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                                Common.component.Analytics.trackEvent('DocumentHolder', 'Sort Cells');
                            }, this)
                        };
                        Common.UI.alert(config);
                        break;
                    case Asc.c_oAscSelectionSortExpand.expandAndNotShowMessage:
                    case Asc.c_oAscSelectionSortExpand.notExpandAndNotShowMessage:
                        this.api.asc_sortColFilter(item.value, '', undefined, (item.value==Asc.c_oAscSortOptions.ByColorFill) ? this.documentHolder.ssMenu.cellColor : this.documentHolder.ssMenu.fontColor, res === Asc.c_oAscSelectionSortExpand.expandAndNotShowMessage);
                        Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                        Common.component.Analytics.trackEvent('DocumentHolder', 'Sort Cells');
                        break;
                }
            }
        };

        dh.onFilterCells = function(menu, item) {
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
        };

        dh.onReapply = function() {
            this.api.asc_reapplyAutoFilter(this.documentHolder.ssMenu.formatTableName);
        };

        dh.onCondFormat = function() {
            var me = this,
                value = me.api.asc_getLocale();
            (!value) && (value = ((me.permissions.lang) ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(me.permissions.lang)) : 0x0409));

            (new SSE.Views.FormatRulesEditDlg({
                api: me.api,
                props   : null,
                isEdit  : false,
                langId  : value,
                handler : function(result, settings) {
                    if (result == 'ok' && settings) {
                        me.api.asc_setCF([settings], []);
                    }
                }
            })).show();
        };

        dh.onRefreshPivot = function(){
            if (this.api) {
                this.propsPivot.originalProps.asc_refresh(this.api);
            }
        };

        dh.onExpandCollapsePivot = function(menu, item, e) {
            this.propsPivot.originalProps.asc_setExpandCollapseByActiveCell(this.api, item.value.isAll, item.value.visible);
        };

        dh.onGroupPivot = function(item) {
            item.value=='grouping' ? this.api.asc_groupPivot() : this.api.asc_ungroupPivot();
        };

        dh.onShowPivotHeaderDetailsDialog = function(isRow, isAll) {
            var me = this,
                pivotInfo = this.api.asc_getCellInfo().asc_getPivotTableInfo(),
                cacheFields = pivotInfo.asc_getCacheFields(),
                pivotFields = pivotInfo.asc_getPivotFields(),
                fieldsNames = _.map(pivotFields, function(item, index) {
                    return {
                        index: index,
                        name: item.asc_getName() || cacheFields[index].asc_getName()
                    }
                }),
                excludedFields = [];

            if(isRow) excludedFields = pivotInfo.asc_getRowFields();
            else excludedFields = pivotInfo.asc_getColumnFields();

            excludedFields && (excludedFields = _.filter(excludedFields, function(item){
                var pivotIndex = item.asc_getIndex();
                return (pivotIndex>-1 || pivotIndex == -2);
            }));

            excludedFields.forEach(function(excludedItem) {
                var indexInFieldsNames = _.findIndex(fieldsNames, function(item) { return excludedItem.asc_getIndex() == item.index});
                fieldsNames.splice(indexInFieldsNames, 1);
            });

            new SSE.Views.PivotShowDetailDialog({
                handler: function(result, value) {
                    if (result == 'ok' && value) {
                        me.api.asc_pivotShowDetailsHeader(value.index, isAll) ;
                    }
                },
                fieldsNames: fieldsNames,
            }).show();
        };

        dh.onShowPivotGroupDialog = function(rangePr, dateTypes, defRangePr) {
            var win, props,
                me = this;
            win = new SSE.Views.PivotGroupDialog({
                date: !!dateTypes,
                handler: function(dlg, result) {
                    if (result == 'ok') {
                        props = dlg.getSettings();
                        me.api.asc_groupPivot(props[0], props[1]);
                        Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                    }
                }
            });
            win.show();
            win.setSettings(rangePr, dateTypes, defRangePr);
        };

        dh.onPivotSettings = function(){
            var props = this.propsPivot.originalProps;
            if (!props) return;

            var me = this;
            if (me.api){
                (new SSE.Views.PivotSettingsAdvanced(
                    {
                        props: props,
                        api: me.api,
                        handler: function(result, value) {
                            if (result == 'ok' && me.api && value) {
                                props.asc_set(me.api, value);
                                Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                            }

                            Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                        }
                    })).show();
            }
        };

        dh.onFieldSettings = function(){
            var props = this.propsPivot.originalProps;
            if (!props) return;

            var me = this;
            if (me.api){
                if (me.propsPivot.fieldType === 2) { // value field
                    var field = me.propsPivot.field;
                    (new SSE.Views.ValueFieldSettingsDialog(
                        {
                            props: props,
                            field: field,
                            showAsValue: me.propsPivot.showAsValue,
                            api: me.api,
                            handler: function(result, value) {
                                if (result === 'ok' && me.api && value) {
                                    field.asc_set(me.api, props, me.propsPivot.index, value);
                                    Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                                }

                                Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                            }
                        })).show();
                } else {
                    (new SSE.Views.FieldSettingsDialog(
                        {
                            props: props,
                            fieldIndex: me.propsPivot.pivotIndex,
                            api: me.api,
                            type: me.propsPivot.fieldType,
                            handler: function(result, value) {
                                if (result === 'ok' && me.api && value) {
                                    me.propsPivot.field.asc_set(me.api, props, me.propsPivot.pivotIndex, value);
                                    Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                                }

                                Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                            }
                        })).show();
                }
            }
        };

        dh.onDeleteField = function(){
            if (this.api && this.propsPivot.originalProps && this.propsPivot.field) {
                if (this.propsPivot.fieldType===2) { // value
                    if (this.propsPivot.rowTotal || this.propsPivot.colTotal) {
                        var props = new Asc.CT_pivotTableDefinition();
                        props.asc_setRowGrandTotals(this.propsPivot.rowTotal ? false : this.propsPivot.originalProps.asc_getRowGrandTotals());
                        props.asc_setColGrandTotals(this.propsPivot.colTotal ? false : this.propsPivot.originalProps.asc_getColGrandTotals());
                        this.propsPivot.originalProps.asc_set(this.api, props);
                    } else
                        this.propsPivot.originalProps.asc_removeDataField(this.api, this.propsPivot.pivotIndex, this.propsPivot.index);
                } else
                    this.propsPivot.originalProps.asc_removeNoDataField(this.api, this.propsPivot.pivotIndex);
            }
            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        };

        dh.onSubtotalField = function(item){
            if (this.api && this.propsPivot.originalProps) {
                var props = new Asc.CT_pivotTableDefinition();
                if (item.checked) {
                    props.asc_setDefaultSubtotal(true);
                    props.asc_setSubtotalTop(true);
                } else {
                    props.asc_setDefaultSubtotal(false);
                }
                this.propsPivot.originalProps.asc_set(this.api, props);
            }
        };

        dh.onSummarize = function(menu, item, e) {
            if (!this.propsPivot.originalProps) return;

            if (item.value===-1)
                this.onFieldSettings();
            else if (item.value!==undefined && item.value!==null) {
                var field = new Asc.CT_DataField();
                field.asc_setSubtotal(item.value);
                this.propsPivot.fieldSourceName && field.asc_setName(this.txtByField.replace('%1', item.caption).replace('%2',  this.propsPivot.fieldSourceName));
                this.propsPivot.field.asc_set(this.api, this.propsPivot.originalProps, this.propsPivot.index, field);
                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
            }
        };

        dh.onShowAs = function(menu, item, e) {
            if (!this.propsPivot.originalProps) return;

            if (item.value===-1 || item.options.showMore) {
                if (item.options.showMore)
                    this.propsPivot.showAsValue = item.value;
                this.onFieldSettings();
            } else if (item.value!==undefined && item.value!==null) {
                var field = new Asc.CT_DataField();
                field.asc_setShowDataAs(item.value);

                var info = new Asc.asc_CFormatCellsInfo();
                info.asc_setType(item.options.numFormat);
                info.asc_setDecimalPlaces(item.options.numFormat===Asc.c_oAscNumFormatType.Percent ? 2 : 0);
                info.asc_setSeparator(false);
                field.asc_setNumFormat(this.api.asc_getFormatCells(info)[0]);

                this.propsPivot.field.asc_set(this.api, this.propsPivot.originalProps, this.propsPivot.index, field);
                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
            }
        };

        dh.showCustomFilterDlg = function(filter, type) {
            var filterObj = filter.asc_getFilterObj();
            if (filterObj.asc_getType() !== Asc.c_oAscAutoFilterTypes.CustomFilters) {
                var newCustomFilter = new Asc.CustomFilters();
                newCustomFilter.asc_setCustomFilters([new Asc.CustomFilter()]);

                var newCustomFilters = newCustomFilter.asc_getCustomFilters();
                newCustomFilters[0].asc_setOperator(Asc.c_oAscCustomAutoFilter.equals);
                newCustomFilter.asc_setAnd(true);
                newCustomFilters[0].asc_setVal('');

                filterObj.asc_setFilter(newCustomFilter);
                filterObj.asc_setType(Asc.c_oAscAutoFilterTypes.CustomFilters);
            }

            var me = this,
                dlgDigitalFilter = new SSE.Views.PivotDigitalFilterDialog({api:this.api, type: type}).on({
                    'close': function() {
                        Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                    }
                });

            dlgDigitalFilter.setSettings(filter);
            dlgDigitalFilter.show();
        };

        dh.onPivotFilter = function(menu, item, e) {
            if (!this.propsPivot.filter) return;

            var filter = this.propsPivot.filter,
                me = this;
            if (item.value==='value') {
                var pivotObj = filter.asc_getPivotObj(),
                    fields = pivotObj.asc_getDataFields();
                if (fields.length<2) {
                    Common.UI.warning({title: this.textWarning,
                        msg: this.warnFilterError,
                        callback: function() {
                            Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                        }
                    });
                } else {
                    this.showCustomFilterDlg(filter, item.value);
                }
            } else if (item.value==='label') {
                this.showCustomFilterDlg(filter, item.value);
            } else if (item.value==='top10') {
                var dlgTop10Filter = new SSE.Views.Top10FilterDialog({api:this.api, type: 'value'}).on({
                    'close': function() {
                        Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                    }
                });
                dlgTop10Filter.setSettings(filter);
                dlgTop10Filter.show();
            } else if (item.value==='clear') {
                this.api.asc_clearFilterColumn(filter.asc_getCellId(), filter.asc_getDisplayName());
                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
            }
        };

        dh.onPivotSort = function(menu, item, e) {
            if (!(this.propsPivot.filter || this.propsPivot.rowFilter || this.propsPivot.colFilter)) return;

            var me = this;
            if (item.value==='advanced') {
                var dlgSort = new SSE.Views.SortFilterDialog({api:this.api}).on({
                    'close': function() {
                        Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                    }
                });
                dlgSort.setSettings({filter : this.propsPivot.filter, rowFilter: this.propsPivot.rowFilter, colFilter: this.propsPivot.colFilter});
                dlgSort.show();
            } else {
                var filter = this.propsPivot.filter || this.propsPivot.rowFilter || this.propsPivot.colFilter;
                this.api.asc_sortColFilter(item.value, filter.asc_getCellId(), filter.asc_getDisplayName());
                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
            }
        };

        dh.onShowDetails = function(item, e) {
            this.propsPivot.originalProps && this.api && this.api.asc_pivotShowDetails(this.propsPivot.originalProps);
        };

        dh.fillPivotProps = function() {
            var props = this.propsPivot.originalProps;
            if (!props) return;

            var info = this.api.asc_getPivotInfo(),
                pageFieldIndex = info.asc_getPageFieldIndex(),
                colFieldIndex = info.asc_getColFieldIndex(),
                rowFieldIndex = info.asc_getRowFieldIndex(),
                dataFieldIndex = info.asc_getDataFieldIndex();

            this.propsPivot.canExpandCollapse = info.asc_canExpandCollapse();
            this.propsPivot.canGroup = info.asc_canGroup();
            this.propsPivot.rowTotal = info.asc_getRowGrandTotals();
            this.propsPivot.colTotal = info.asc_getColGrandTotals();
            this.propsPivot.filter = info.asc_getFilter();
            this.propsPivot.rowFilter = info.asc_getFilterRow();
            this.propsPivot.colFilter = info.asc_getFilterCol();
            this.propsPivot.showDetails = info.asc_showDetails();

            if (colFieldIndex>-1) {
                var fprops = props.asc_getColumnFields();
                if (fprops) {
                    var pivotIndex = fprops[colFieldIndex].asc_getIndex();
                    if (pivotIndex>-1) {
                        this.propsPivot.pivotIndex = pivotIndex;
                        this.propsPivot.index = colFieldIndex;
                        this.propsPivot.field = props.asc_getPivotFields()[pivotIndex];
                        this.propsPivot.fieldType = 0;
                        this.propsPivot.fieldName = this.propsPivot.field.asc_getName() || props.asc_getCacheFields()[pivotIndex].asc_getName();
                    }
                }
            } else if (rowFieldIndex>-1) {
                var fprops = props.asc_getRowFields();
                if (fprops) {
                    var pivotIndex = fprops[rowFieldIndex].asc_getIndex();
                    if (pivotIndex>-1) {
                        this.propsPivot.pivotIndex = pivotIndex;
                        this.propsPivot.index = rowFieldIndex;
                        this.propsPivot.field = props.asc_getPivotFields()[pivotIndex];
                        this.propsPivot.fieldType = 1;
                        this.propsPivot.fieldName = this.propsPivot.field.asc_getName() || props.asc_getCacheFields()[pivotIndex].asc_getName();
                    }
                }
            }  else if (pageFieldIndex>-1) {
                var fprops = props.asc_getPageFields();
                if (fprops) {
                    var pivotIndex = fprops[pageFieldIndex].asc_getIndex();
                    if (pivotIndex>-1) {
                        this.propsPivot.pivotIndex = pivotIndex;
                        this.propsPivot.index = pageFieldIndex;
                        this.propsPivot.field = props.asc_getPivotFields()[pivotIndex];
                        this.propsPivot.fieldType = 3;
                        this.propsPivot.fieldName = this.propsPivot.field.asc_getName() || props.asc_getCacheFields()[pivotIndex].asc_getName();
                    }
                }
            }
            if (dataFieldIndex>-1) {
                var fprops = props.asc_getDataFields();
                if (fprops) {
                    var pivotIndex = fprops[dataFieldIndex].asc_getIndex();
                    if (pivotIndex>-1) {
                        this.propsPivot.pivotIndex = pivotIndex;
                        this.propsPivot.index = dataFieldIndex;
                        this.propsPivot.field = fprops[dataFieldIndex];
                        this.propsPivot.fieldType = 2;
                        this.propsPivot.fieldName = this.propsPivot.field.asc_getName();
                        this.propsPivot.fieldSourceName = props.asc_getCacheFields()[pivotIndex].asc_getName();
                    }
                }
            }
        };

        dh.onClear = function(menu, item, e) {
            if (item.value == Asc.c_oAscCleanOptions.Format && !this._state.wsProps['FormatCells'] || item.value == Asc.c_oAscCleanOptions.All && !this.api.asc_checkLockedCells())
                this.onClearCallback(menu, item);
            else if (item.value == Asc.c_oAscCleanOptions.Comments) {
                this._state.wsProps['Objects'] ? Common.NotificationCenter.trigger('showerror', Asc.c_oAscError.ID.ChangeOnProtectedSheet, Asc.c_oAscError.Level.NoCritical) : this.onClearCallback(menu, item);
            } else
                Common.NotificationCenter.trigger('protect:check', this.onClearCallback, this, [menu, item]);
        };

        dh.onClearCallback = function(menu, item) {
            if (this.api) {
                if (item.value == Asc.c_oAscCleanOptions.Comments) {
                    this.api.asc_RemoveAllComments(!this.permissions.canDeleteComments, true);// 1 param = true if remove only my comments, 2 param - remove current comments
                } else
                    this.api.asc_emptyCells(item.value, item.value == Asc.c_oAscCleanOptions.All && !this.permissions.canDeleteComments);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Clear');
            }
        };

        dh.onSelectTable = function(menu, item) {
            if (this.api && this.documentHolder.ssMenu.formatTableName) {
                this.api.asc_changeSelectionFormatTable(this.documentHolder.ssMenu.formatTableName, item.value);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Select Table');
            }
        };

        dh.onInsertTable = function(menu, item) {
            if (this.api && this.documentHolder.ssMenu.formatTableName) {
                this.api.asc_insertCellsInTable(this.documentHolder.ssMenu.formatTableName, item.value);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Insert to Table');
            }
        };

        dh.onDeleteTable = function(menu, item) {
            if (this.api && this.documentHolder.ssMenu.formatTableName) {
                this.api.asc_deleteCellsInTable(this.documentHolder.ssMenu.formatTableName, item.value);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Delete from Table');
            }
        };

        dh.onInsFunction = function(item) {
            var controller = this.getApplication().getController('FormulaDialog');
            if (controller && this.api) {
                controller.showDialog(undefined, item.value==Asc.ETotalsRowFunction.totalrowfunctionCustom);
            }
        };

        dh.onInsHyperlink = function(item) {
            Common.NotificationCenter.trigger('protect:check', this.onInsHyperlinkCallback, this, [item]);
        };

        dh.onInsHyperlinkCallback = function(item) {
            var me = this;
            var win,
                props;

            if (me.api) {
                var wc = me.api.asc_getWorksheetsCount(),
                    i = -1,
                    items = [];

                while (++i < wc) {
                    items.push({name: me.api.asc_getWorksheetName(i), hidden: me.api.asc_isWorksheetHidden(i)});
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
                    appOptions: me.permissions,
                    handler: handlerDlg
                });

                win.show();
                win.setSettings({
                    sheets  : items,
                    ranges  : me.api.asc_getDefinedNames(Asc.c_oAscGetDefinedNamesList.All, true),
                    currentSheet: me.api.asc_getActiveWorksheetIndex(),
                    props   : props,
                    text    : cell.asc_getText(),
                    isLock  : cell.asc_getLockText(),
                    allowInternal: item.options.inCell
                });
            }

            Common.component.Analytics.trackEvent('DocumentHolder', 'Add Hyperlink');
        };

        dh.onDelHyperlink = function(item) {
            Common.NotificationCenter.trigger('protect:check', this.onDelHyperlinkCallback, this);
        };

        dh.onDelHyperlinkCallback = function(item) {
            if (this.api) {
                this.api.asc_removeHyperlink();

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Remove Hyperlink');
            }
        };

        dh.onSetSize = function(menu, item) {
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
        };

        dh.onEntireHide = function(item) {
            if (this.api)
                this.api[item.isrowmenu ? 'asc_hideRows' : 'asc_hideColumns']();
        };

        dh.onEntireShow = function(item) {
            if (this.api)
                this.api[item.isrowmenu ? 'asc_showRows' : 'asc_showColumns']();
        };

        dh.onFreezePanes = function(item) {
            if (this.api)
                this.api.asc_freezePane();
        };

        dh.onEntriesList = function(item) {
            if (this.api) {
                var me = this;
                setTimeout(function() {
                    me.api.asc_showAutoComplete();
                }, 10);
            }
        };

        dh.onAddNamedRange = function(item) {
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
        };

        dh.onImgMenu = function(menu, item) {
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
        };

        dh.onImgCrop = function(menu, item) {
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
        };

        dh.onImgResetCrop = function() {
            if (this.api) {
                var properties = new Asc.asc_CImgProperty();
                properties.put_ResetCrop(true);
            }
            this.api.asc_setGraphicObjectProps(properties);
            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        };

        dh.onImgMenuAlign = function(menu, item) {
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
        };

        dh.onShapesMerge  = function(menu, item, e) {
            var me = this;
            if (item && item.value) {
                me.api.asc_mergeSelectedShapes(item.value);
                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Shapes Merge');
            }
        };

        dh.onParagraphVAlign = function(menu, item) {
            if (this.api) {
                var properties = new Asc.asc_CImgProperty();
                properties.asc_putVerticalTextAlign(item.value);

                this.api.asc_setGraphicObjectProps(properties);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Paragraph Vertical Align');
            }
        };

        dh.onParagraphDirection = function(menu, item) {
            if (this.api) {
                var properties = new Asc.asc_CImgProperty();
                properties.asc_putVert(item.options.direction);

                this.api.asc_setGraphicObjectProps(properties);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Text Direction');
            }
        };

        dh.onSelectBulletMenu = function(menu, item) {
            if (this.api) {
                if (item.options.value == -1) {
                    this.api.asc_setListType(0, item.options.value);
                    Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'List Type');
                } else if (item.options.value == 'settings') {
                    var me      = this,
                        props;
                    var selectedObjects = me.api.asc_getGraphicObjectProps();
                    for (var i = 0; i < selectedObjects.length; i++) {
                        if (selectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Paragraph) {
                            props = selectedObjects[i].asc_getObjectValue();
                            break;
                        }
                    }
                    if (props) {
                        var listtype = me.api.asc_getCurrentListType();
                        (new Common.Views.ListSettingsDialog({
                            api: me.api,
                            props: props,
                            type: 0,
                            storage: me.permissions.canRequestInsertImage || me.permissions.fileChoiceUrl && me.permissions.fileChoiceUrl.indexOf("{documentType}")>-1,
                            interfaceLang: me.permissions.lang,
                            handler: function(result, value) {
                                if (result == 'ok') {
                                    if (me.api) {
                                        props.asc_putBullet(value);
                                        me.api.asc_setGraphicObjectProps(props);
                                    }
                                }
                                Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                            }
                        })).show();
                    }
                }
            }
        };

        dh.onSelectBullets = function(picker, itemView, record, e) {
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

            if (rawData.type===0 && rawData.subtype===0x1000) {// custom bullet
                var bullet = rawData.customBullet;
                if (bullet) {
                    var props;
                    var selectedObjects = this.api.asc_getGraphicObjectProps();
                    for (var i = 0; i < selectedObjects.length; i++) {
                        if (selectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Paragraph) {
                            props = selectedObjects[i].asc_getObjectValue();
                            props.asc_putBullet(bullet);
                            this.api.asc_setGraphicObjectProps(props);
                            break;
                        }
                    }
                }
            } else
                this.api.asc_setListType(rawData.type, rawData.subtype);

            if (e.type !== 'click')
                this.documentHolder.textInShapeMenu.hide();

            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
            Common.component.Analytics.trackEvent('DocumentHolder', 'List Type');
        };

        dh.onTextAdvanced = function(item) {
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
        };

        dh.onShapeAdvanced = function(item) {
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
        };

        dh.onImgAdvanced = function(item) {
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
        };

        dh.onSlicerAdvanced = function(item) {
            var me = this;

            (new SSE.Views.SlicerSettingsAdvanced({
                imageProps: item.imageInfo,
                api       : me.api,
                styles    : item.imageInfo.asc_getSlicerProperties().asc_getStylesPictures(),
                handler   : function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            me.api.asc_setGraphicObjectProps(value.imageProps);

                            Common.component.Analytics.trackEvent('DocumentHolder', 'Apply slicer settings');
                        }
                    }
                    Common.NotificationCenter.trigger('edit:complete', me);
                }
            })).show();
        };

        dh.onChartEdit = function(item) {
            var me = this;
            var win, props;
            if (me.api){
                props = me.api.asc_getChartSettings();
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
                                        if (value.imageSettings) {
                                            value.imageSettings.asc_putChartProperties(value.chartSettings);
                                            me.api.asc_setGraphicObjectProps(value.imageSettings);
                                        } else
                                            me.api.asc_applyChartSettings(value.chartSettings);
                                    }
                                }
                                Common.NotificationCenter.trigger('edit:complete', me);
                            }
                        })).show();
                }
            }
        };

        dh.onChartData = function(btn) {
            if (!Common.Controllers.LaunchController.isScriptLoaded()) {
                return;
            }

            var me = this;
            var props;
            if (me.api){
                props = me.api.asc_getChartSettings();
                if (props) {
                    me._isEditRanges = true;
                    props.startEdit();
                    var win = new SSE.Views.ChartDataDialog({
                        chartSettings: props,
                        api: me.api,
                        handler: function(result, value) {
                            if (result == 'ok') {
                                props.endEdit();
                                me._isEditRanges = false;
                            }
                            Common.NotificationCenter.trigger('edit:complete', me);
                        }
                    }).on('close', function() {
                        me._isEditRanges && props.cancelEdit();
                        me._isEditRanges = false;
                    });
                    win.show();
                }
            }
        };

        dh.onChartType = function(btn) {
            var me = this;
            var props;
            if (me.api){
                props = me.api.asc_getChartSettings();
                if (props) {
                    me._isEditType = true;
                    props.startEdit();
                    var win = new SSE.Views.ChartTypeDialog({
                        chartSettings: props,
                        api: me.api,
                        handler: function(result, value) {
                            if (result == 'ok') {
                                props.endEdit();
                                me._isEditType = false;
                            }
                            Common.NotificationCenter.trigger('edit:complete', me);
                        }
                    }).on('close', function() {
                        me._isEditType && props.cancelEdit();
                        me._isEditType = false;
                    });
                    win.show();
                }
            }
        };

        dh.onImgMacro = function(item) {
            var me = this;

            (new SSE.Views.MacroDialog({
                props: {macroList: me.api.asc_getAllMacrosNames(), current: me.api.asc_getCurrentDrawingMacrosName()},
                handler: function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            me.api.asc_assignMacrosToCurrentDrawing(value);
                        }
                    }
                    Common.NotificationCenter.trigger('edit:complete', me);
                }
            })).show();
        };

        dh.onImgEditPoints = function(item) {
            this.api && this.api.asc_editPointsGeometry();
        };

        dh.onGetLink = function(item) {
            if (this.api) {
                var range = this.api.asc_getActiveRangeStr(Asc.referenceType.A, false, true),
                    name = this.api.asc_getEscapeSheetName(this.api.asc_getWorksheetName(this.api.asc_getActiveWorksheetIndex()));
                name = (name + ((name!=='' && range!=='') ? '!' : '') + range);
                name && Common.Gateway.requestMakeActionLink({
                    action: {
                        type: "internallink", data: name
                    }
                });
            }
        };

        dh.onSetActionLink = function (url) {
            if (Common.Utils.InternalSettings.get("sse-dialog-link-visible"))
                return;

            var me = this;
            navigator.clipboard && navigator.clipboard.writeText(url)
                .then(function() {
                    Common.NotificationCenter.trigger('showmessage', {msg: me.txtCopySuccess}, {timeout: 3000, hideCloseTip: true});
                })
                .catch(function(err) {
                    console.log(err);
                });
        };

        dh.onApiMouseMove = function(dataarray) {
            if (!this._isFullscreenMenu && dataarray.length) {
                var index_hyperlink,
                    /** coauthoring begin **/
                    index_comments,
                    /** coauthoring end **/
                    index_locked,
                    index_column, index_row,
                    index_filter,
                    index_slicer,
                    index_foreign,
                    index_eyedropper,
                    index_placeholder;
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
                        case Asc.c_oAscMouseMoveType.Tooltip:
                            index_slicer = i;
                            break;
                        case Asc.c_oAscMouseMoveType.ForeignSelect:
                            index_foreign = i;
                            break;
                        case Asc.c_oAscMouseMoveType.Eyedropper:
                            index_eyedropper = i;
                            break;
                        case Asc.c_oAscMouseMoveType.Placeholder:
                            index_placeholder = i;
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
                    slicerTip       = me.tooltips.slicer,
                    foreignSelect   = me.tooltips.foreignSelect,
                    eyedropperTip   = me.tooltips.eyedropper,
                    placeholderTip   = me.tooltips.placeholder,
                    pos             = [
                        Common.Utils.getOffset(me.documentHolder.cmpEl).left - $(window).scrollLeft(),
                        Common.Utils.getOffset(me.documentHolder.cmpEl).top  - $(window).scrollTop()
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
                if (!index_foreign) {
                    me.hideForeignSelectTips();
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
                    if (index_slicer===undefined) {
                        if (!slicerTip.isHidden && slicerTip.ref) {
                            slicerTip.ref.hide();
                            slicerTip.ref = undefined;
                            slicerTip.text = '';
                            slicerTip.isHidden = true;
                        }
                    }
                    if (!index_placeholder) {
                        me.hidePlaceholderTip();
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
                if (!index_eyedropper) {
                    me.hideEyedropperTip();
                }
                // show tooltips

                if (index_hyperlink) {
                    if (!hyperlinkTip.parentEl) {
                        hyperlinkTip.parentEl = $('<div id="tip-container-hyperlinktip" style="position: absolute; z-index: 10000;"></div>');
                        me.documentHolder.cmpEl.append(hyperlinkTip.parentEl);
                    }

                    var data  = dataarray[index_hyperlink-1],
                        props = data.asc_getHyperlink();

                    if (props.asc_getType() == Asc.c_oAscHyperlinkType.WebLink) {
                        var linkstr = props.asc_getTooltip();
                        linkstr = (linkstr) ? linkstr : props.asc_getHyperlinkUrl();
                        if (linkstr.length>256)
                            linkstr = linkstr.substr(0, 256) + '...';
                        linkstr = Common.Utils.String.htmlEncode(linkstr) + '<br><b>' + me.textCtrlClick + '</b>';
                    } else {
                        linkstr = Common.Utils.String.htmlEncode(props.asc_getTooltip() || (props.asc_getLocation()));
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
                    if (index_locked && me.isUserVisible(dataarray[index_locked-1].asc_getUserId())) {
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
                                'line-height':coAuthTip.ttHeight + 'px',
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
                                src.text(me.getUserName(data.asc_getUserId()));
                                if (coAuthTip.bodyWidth - showPoint[0] < coAuthTip.ref.outerWidth() ) {
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

                    if (index_placeholder) {
                        if (!placeholderTip.parentEl) {
                            placeholderTip.parentEl = $('<div id="tip-container-placeholdertip" style="position: absolute; z-index: 10000;"></div>');
                            me.documentHolder.cmpEl.append(placeholderTip.parentEl);
                        }

                        var data  = dataarray[index_placeholder-1],
                            phstr;

                        switch (data.asc_getPlaceholderType()) {
                            case AscCommon.PlaceholderButtonType.Image:
                                phstr = me.documentHolder.txtInsImage;
                                break;
                            case AscCommon.PlaceholderButtonType.ImageUrl:
                                phstr = me.documentHolder.txtInsImageUrl;
                                break;
                        }

                        if (placeholderTip.ref && placeholderTip.ref.isVisible()) {
                            if (placeholderTip.text != phstr) {
                                placeholderTip.ref.hide();
                                placeholderTip.ref = undefined;
                                placeholderTip.text = '';
                                placeholderTip.isHidden = true;
                            }
                        }

                        if (!placeholderTip.ref || !placeholderTip.ref.isVisible()) {
                            placeholderTip.text = phstr;
                            placeholderTip.ref = new Common.UI.Tooltip({
                                owner   : placeholderTip.parentEl,
                                html    : true,
                                title   : phstr
                            });

                            placeholderTip.ref.show([-10000, -10000]);
                            placeholderTip.isHidden = false;

                            showPoint = [data.asc_getX(), data.asc_getY()];
                            showPoint[0] += (pos[0] + 6);
                            showPoint[1] += (pos[1] - 20);
                            showPoint[1] -= placeholderTip.ref.getBSTip().$tip.height();
                            var tipwidth = placeholderTip.ref.getBSTip().$tip.width();
                            if (showPoint[0] + tipwidth > me.tooltips.coauth.bodyWidth )
                                showPoint[0] = me.tooltips.coauth.bodyWidth - tipwidth;

                            placeholderTip.ref.getBSTip().$tip.css({
                                top : showPoint[1] + 'px',
                                left: showPoint[0] + 'px'
                            });
                        }
                    }
                }
                if (index_foreign && me.isUserVisible(dataarray[index_foreign-1].asc_getUserId())) {
                    data = dataarray[index_foreign-1];

                    if (!coAuthTip.XY)
                        me.onDocumentResize();

                    if (foreignSelect.x_point != data.asc_getX() || foreignSelect.y_point != data.asc_getY()) {
                        me.hideForeignSelectTips();

                        foreignSelect.x_point = data.asc_getX();
                        foreignSelect.y_point = data.asc_getY();

                        var src = $(document.createElement("div")),
                            color = data.asc_getColor();
                        foreignSelect.ref = src;
                        foreignSelect.userId = data.asc_getUserId();

                        src.addClass('username-tip');
                        src.css({
                            height      : foreignSelect.ttHeight + 'px',
                            'line-height':foreignSelect.ttHeight + 'px',
                            position    : 'absolute',
                            zIndex      : '900',
                            visibility  : 'visible',
                            'background-color': '#'+Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())
                        });
                        $(document.body).append(src);

                        showPoint = [
                            foreignSelect.x_point + coAuthTip.XY[0],
                            foreignSelect.y_point + coAuthTip.XY[1] - foreignSelect.ttHeight
                        ];

                        src.text(me.getUserName(data.asc_getUserId()));
                        src.css({
                            visibility  : 'visible',
                            left       : ((showPoint[0]+foreignSelect.ref.outerWidth()>coAuthTip.bodyWidth-coAuthTip.rightMenuWidth) ? coAuthTip.bodyWidth-coAuthTip.rightMenuWidth-foreignSelect.ref.outerWidth() : showPoint[0]) + 'px',
                            top         : showPoint[1] + 'px'
                        });
                    }
                }
                if (index_filter!==undefined && !(me.dlgFilter && me.dlgFilter.isVisible()) && !(me.currentMenu && me.currentMenu.isVisible()) && !dataarray[index_filter-1].asc_getFilter().asc_getPivotObj()) {
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

                        var tipheight = filterTip.ref.getBSTip().$tip.height();
                        if (showPoint[1] + tipheight > me.tooltips.coauth.bodyHeight ) {
                            showPoint[1] = me.tooltips.coauth.bodyHeight - tipheight - 5;
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

                if (index_slicer!==undefined && me.permissions.isEdit) {
                    if (!slicerTip.parentEl) {
                        slicerTip.parentEl = $('<div id="tip-container-slicertip" style="position: absolute; z-index: 10000;"></div>');
                        me.documentHolder.cmpEl.append(slicerTip.parentEl);
                    }

                    var data  = dataarray[index_slicer-1],
                        str = data.asc_getTooltip();
                    if (slicerTip.ref && slicerTip.ref.isVisible()) {
                        if (slicerTip.text != str) {
                            slicerTip.text = str;
                            slicerTip.ref.setTitle(Common.Utils.String.htmlEncode(str));
                            slicerTip.ref.updateTitle();
                        }
                    }

                    if (!slicerTip.ref || !slicerTip.ref.isVisible()) {
                        slicerTip.text = str;
                        slicerTip.ref = new Common.UI.Tooltip({
                            owner   : slicerTip.parentEl,
                            html    : true,
                            title   : Common.Utils.String.htmlEncode(str)
                        });

                        slicerTip.ref.show([-10000, -10000]);
                        slicerTip.isHidden = false;

                        showPoint = [data.asc_getX(), data.asc_getY()];
                        showPoint[0] += (pos[0] + 6);
                        showPoint[1] += (pos[1] - 20 - slicerTip.ttHeight);

                        var tipwidth = slicerTip.ref.getBSTip().$tip.width();
                        if (showPoint[0] + tipwidth > me.tooltips.coauth.bodyWidth )
                            showPoint[0] = me.tooltips.coauth.bodyWidth - tipwidth - 20;

                        slicerTip.ref.getBSTip().$tip.css({
                            top : showPoint[1] + 'px',
                            left: showPoint[0] + 'px'
                        });
                    }
                }

                if (index_eyedropper) {
                    eyedropperTip.isHidden = false;
                    if (eyedropperTip.ref) {
                        eyedropperTip.ref.hide();
                        eyedropperTip.ref = undefined;
                    }

                    var data  = dataarray[index_eyedropper-1],
                        color = data.asc_getColor(),
                        r = color.get_r(),
                        g = color.get_g(),
                        b = color.get_b();
                    if (r !== undefined && r !== null) {
                        var hex = Common.Utils.ThemeColor.getHexColor(r, g, b),
                            name = color.asc_getName();

                        if (!eyedropperTip.color) {
                            var colorEl = $(document.createElement("div"));
                            colorEl.addClass('eyedropper-color');
                            colorEl.appendTo(document.body);
                            eyedropperTip.color = colorEl;
                        }
                        eyedropperTip.color.css({
                            backgroundColor: '#' + hex,
                            left: (data.asc_getX() + pos[0] + 23) + 'px',
                            top: (data.asc_getY() + pos[1] - 53) + 'px'
                        });
                        if (eyedropperTip.tipInterval) {
                            clearInterval(eyedropperTip.tipInterval);
                        }
                        eyedropperTip.tipInterval = setInterval(function () {
                            clearInterval(eyedropperTip.tipInterval);
                            if (!me.tooltips.eyedropper.isHidden) {
                                if (!eyedropperTip.parentEl) {
                                    eyedropperTip.parentEl = $('<div id="tip-container-eyedroppertip" style="position: absolute; z-index: 10000;"></div>');
                                    me.documentHolder.cmpEl.append(eyedropperTip.parentEl);
                                }

                                var title = '<div>RGB (' + r + ',' + g + ',' + b + ')</div>' +
                                    '<div>' + name + '</div>';
                                if (!eyedropperTip.ref) {
                                    eyedropperTip.ref = new Common.UI.Tooltip({
                                        owner   : eyedropperTip.parentEl,
                                        html    : true,
                                        title   : title,
                                        cls     : 'eyedropper-tooltip'
                                    });
                                }
                                eyedropperTip.ref.show([-10000, -10000]);
                                eyedropperTip.tipWidth = eyedropperTip.ref.getBSTip().$tip.width();
                                showPoint = [data.asc_getX(), data.asc_getY()];
                                showPoint[1] += (pos[1] - 57);
                                showPoint[0] += (pos[0] + 58);
                                if (showPoint[0] + eyedropperTip.tipWidth > me.tooltips.coauth.bodyWidth ) {
                                    showPoint[0] = showPoint[0] - eyedropperTip.tipWidth - 40;
                                }
                                eyedropperTip.ref.getBSTip().$tip.css({
                                    top: showPoint[1] + 'px',
                                    left: showPoint[0] + 'px'
                                });
                            }
                        }, 800);
                    }
                }
            }
        };

        dh.onApiHyperlinkClick = function(url) {
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
            var type = this.api.asc_getUrlType(url);
            if (type===AscCommon.c_oAscUrlType.Http || type===AscCommon.c_oAscUrlType.Email)
                window.open(url, '_blank');
            else
                Common.UI.warning({
                    maxwidth: 500,
                    msg: Common.Utils.String.format(this.txtWarnUrl, url),
                    buttons: ['no', 'yes'],
                    primary: 'no',
                    callback: function(btn) {
                        try {
                            (btn == 'yes') && window.open(url, '_blank');
                        } catch (err) {
                            err && console.log(err.stack);
                        }
                    }
                });
        };

        dh.onApiAutofilter = function(config) {
            var me = this;
            if (!me.tooltips.filter.isHidden && me.tooltips.filter.ref) {
                me.tooltips.filter.ref.hide();
                me.tooltips.filter.ref = undefined;
                me.tooltips.filter.text = '';
                me.tooltips.filter.isHidden = true;
            }
            if (me.permissions.isEdit) {
                if (!me.dlgFilter) {
                    if (me._state.wsProps['PivotTables'] && config.asc_getPivotObj() || me._state.wsProps['AutoFilter'] && !config.asc_getPivotObj()) return;

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
                    var offset = Common.Utils.getOffset(me.documentHolder.cmpEl),
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
                } else
                    me.dlgFilter.close();
            }
        };

        dh.makeFilterTip = function(props) {
            var filterObj = props.asc_getFilterObj(),
                filterType = filterObj.asc_getType(),
                isTextFilter = props.asc_getIsTextFilter(),
                colorsFill = props.asc_getColorsFill(),
                colorsFont = props.asc_getColorsFont(),
                str = "";

            if (filterType === Asc.c_oAscAutoFilterTypes.CustomFilters) {
                var customFilter = filterObj.asc_getFilter(),
                    customFilters = customFilter.asc_getCustomFilters();

                str = this.getFilterName(Asc.c_oAscAutoFilterTypes.CustomFilters, customFilters[0].asc_getOperator()) + " \"" + Common.Utils.String.htmlEncode(customFilters[0].asc_getVal()) + "\"";
                if (customFilters.length>1) {
                    str = str + " " + (customFilter.asc_getAnd() ? this.txtAnd : this.txtOr);
                    str = str + " " + this.getFilterName(Asc.c_oAscAutoFilterTypes.CustomFilters, customFilters[1].asc_getOperator()) + " \"" + Common.Utils.String.htmlEncode(customFilters[1].asc_getVal()) + "\"";
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
                            str += Common.Utils.String.htmlEncode(item.asc_getText()) + "; ";
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
            var colName = props.asc_getColumnName();
            colName && (colName = colName.replace(/\n/g, ' '));
            if (colName.length>100)
                colName = colName.substring(0, 100) + '...';
            str = "<b>" + (Common.Utils.String.htmlEncode(colName) || '(' + this.txtColumn + ' ' + Common.Utils.String.htmlEncode(props.asc_getSheetColumnName()) + ')') + ":</b><br>" + str;
            return str;
        };

        dh.getFilterName = function(type, subtype) {
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
        };

        dh.onUndo = function() {
            if (this.api) {
                this.api.asc_Undo();
                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
            }
        };

        dh.onSelectionChanged = function(info){
            if (!this.mouse.isLeftButtonDown && !this.rangeSelectionMode &&
                this.currentMenu && this.currentMenu.isVisible()){
                (this.permissions.isEdit && !this._isDisabled) ? this.fillMenuProps(info, true) : this.fillViewMenuProps(info, true);
            }
            if (this.dlgFilter && this.dlgFilter.isVisible())
                this.dlgFilter.close();

            if (this.permissions && this.permissions.isEdit) {
                var selectedObjects = this.api.asc_getGraphicObjectProps(),
                    i = -1,
                    in_equation = false,
                    in_chart = false,
                    locked = false;
                while (++i < selectedObjects.length) {
                    var type = selectedObjects[i].asc_getObjectType();
                    if (type === Asc.c_oAscTypeSelectElement.Math) {
                        in_equation = true;
                    } else if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                        var value = selectedObjects[i].asc_getObjectValue();
                        value && (locked = locked || value.asc_getLocked());
                    } else if (type == Asc.c_oAscTypeSelectElement.Image) {
                        var value = selectedObjects[i].asc_getObjectValue();
                        if (value.asc_getChartProperties() !== null) {
                            in_chart = true;
                            locked = value.asc_getLocked();
                        }
                    }
                }
                if (in_equation) {
                    this._state.equationLocked = locked;
                    this.disableEquationBar();
                }
                if (in_chart) {
                    this._state.chartLocked = locked;
                    this.disableChartElementButton();
                }
            }
        };

        dh.fillMenuProps = function(cellinfo, showMenu, event){
            if (!cellinfo) return;
            var iscellmenu, isrowmenu, iscolmenu, isallmenu, ischartmenu, isimagemenu, istextshapemenu, isshapemenu, istextchartmenu, isimageonly, isslicermenu,
                documentHolder      = this.documentHolder,
                seltype             = cellinfo.asc_getSelectionType(),
                isCellLocked        = cellinfo.asc_getLocked(),
                isTableLocked       = cellinfo.asc_getLockedTable()===true,
                isPivotLocked       = cellinfo.asc_getLockedPivotTable()===true,
                isObjLocked         = false,
                commentsController  = this.getApplication().getController('Common.Controllers.Comments'),
                internaleditor      = this.permissions.isEditMailMerge || this.permissions.isEditDiagram || this.permissions.isEditOle,
                diagramOrMergeEditor = this.permissions.isEditMailMerge || this.permissions.isEditDiagram,
                xfs = cellinfo.asc_getXfs(),
                isSmartArt = false,
                isSmartArtInternal = false;

            switch (seltype) {
                case Asc.c_oAscSelectionType.RangeCells:    iscellmenu = true; break;
                case Asc.c_oAscSelectionType.RangeRow:      isrowmenu = true; break;
                case Asc.c_oAscSelectionType.RangeCol:      iscolmenu = true; break;
                case Asc.c_oAscSelectionType.RangeMax:      isallmenu   = true; break;
                case Asc.c_oAscSelectionType.RangeSlicer:
                case Asc.c_oAscSelectionType.RangeImage:    isimagemenu = !(this.permissions.isEditMailMerge || this.permissions.isEditDiagram); break;
                case Asc.c_oAscSelectionType.RangeShape:    isshapemenu = !(this.permissions.isEditMailMerge || this.permissions.isEditDiagram); break;
                case Asc.c_oAscSelectionType.RangeChart:    ischartmenu = !(this.permissions.isEditMailMerge || this.permissions.isEditDiagram); break;
                case Asc.c_oAscSelectionType.RangeChartText:istextchartmenu = !(this.permissions.isEditMailMerge || this.permissions.isEditDiagram); break;
                case Asc.c_oAscSelectionType.RangeShapeText: istextshapemenu = !(this.permissions.isEditMailMerge || this.permissions.isEditDiagram); break;
            }

            if (this.api.asc_getHeaderFooterMode()) {
                if (!documentHolder.copyPasteMenu || !showMenu && !documentHolder.copyPasteMenu.isVisible()) return;
                if (showMenu) this.showPopupMenu(documentHolder.copyPasteMenu, {}, event);
            } else if (isimagemenu || isshapemenu || ischartmenu) {
                if (!documentHolder.imgMenu || !showMenu && !documentHolder.imgMenu.isVisible()) return;

                isimagemenu = isshapemenu = ischartmenu = isslicermenu = false;
                documentHolder.mnuImgAdvanced.imageInfo = undefined;

                var has_chartprops = false,
                    signGuid;
                var selectedObjects = this.api.asc_getGraphicObjectProps();
                for (var i = 0; i < selectedObjects.length; i++) {
                    if (selectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                        var elValue = selectedObjects[i].asc_getObjectValue();
                        isObjLocked = isObjLocked || elValue.asc_getLocked();

                        if (this._state.wsProps['Objects'] && elValue.asc_getProtectionLocked()) // don't show menu for locked shape
                            return;

                        var shapeprops = elValue.asc_getShapeProperties();
                        if (shapeprops) {
                            if (shapeprops.asc_getFromChart())
                                ischartmenu = true;
                            else if (shapeprops.asc_getFromImage())
                                isimageonly = true;
                            else {
                                documentHolder.mnuShapeAdvanced.shapeInfo = elValue;
                                isshapemenu = true;
                                if (shapeprops.asc_getFromSmartArt())
                                    isSmartArt = true;
                                if (shapeprops.asc_getFromSmartArtInternal())
                                    isSmartArtInternal = true;
                            }
                        } else if ( elValue.asc_getChartProperties() ) {
                            documentHolder.mnuChartEdit.chartInfo = elValue;
                            ischartmenu = true;
                            has_chartprops = true;
                        }  else if ( elValue.asc_getSlicerProperties() ) {
                            documentHolder.mnuSlicerAdvanced.imageInfo = elValue;
                            isslicermenu = true;
                        } else {
                            documentHolder.mnuImgAdvanced.imageInfo = elValue;
                            isimagemenu = true;
                        }
                        if (this.permissions.isSignatureSupport)
                            signGuid = elValue.asc_getSignatureId();
                    }
                }

                documentHolder.mnuBringToFront.setDisabled(isSmartArtInternal);
                documentHolder.mnuSendToBack.setDisabled(isSmartArtInternal);
                documentHolder.mnuBringForward.setDisabled(isSmartArtInternal);
                documentHolder.mnuSendBackward.setDisabled(isSmartArtInternal);

                var cangroup = this.api.asc_canGroupGraphicsObjects();
                documentHolder.mnuUnGroupImg.setDisabled(isObjLocked || !this.api.asc_canUnGroupGraphicsObjects());
                documentHolder.mnuGroupImg.setDisabled(isObjLocked || !cangroup);
                documentHolder.menuImageAlign.setDisabled(isObjLocked || !cangroup);

                documentHolder.menuShapesMerge.setDisabled(isObjLocked || !this.api.asc_canMergeSelectedShapes());
                if (!documentHolder.menuShapesMerge.isDisabled()) {
                    documentHolder.menuShapesMerge.menu.items.forEach(function (item) {
                        item.setDisabled(!documentHolder.api.asc_canMergeSelectedShapes(item.value));
                    });
                }

                var objcount = this.api.asc_getSelectedDrawingObjectsCount();
                documentHolder.menuImageAlign.menu.items[7].setDisabled(objcount<3);
                documentHolder.menuImageAlign.menu.items[8].setDisabled(objcount<3);

                documentHolder.mnuShapeAdvanced.setVisible(isshapemenu && !isimagemenu && !ischartmenu);
                documentHolder.mnuShapeAdvanced.setDisabled(isObjLocked);
                documentHolder.mnuChartEdit.setVisible(ischartmenu && !isimagemenu && !isshapemenu && has_chartprops);
                documentHolder.mnuChartEdit.setDisabled(isObjLocked);
                documentHolder.mnuChartData.setVisible(this.permissions.isEditOle && ischartmenu && !isimagemenu && !isshapemenu && has_chartprops);
                documentHolder.mnuChartData.setDisabled(isObjLocked);
                documentHolder.mnuChartType.setVisible(this.permissions.isEditOle && ischartmenu && !isimagemenu && !isshapemenu && has_chartprops);
                documentHolder.mnuChartType.setDisabled(isObjLocked);
                documentHolder.pmiImgCut.setDisabled(isObjLocked);
                documentHolder.pmiImgPaste.setDisabled(isObjLocked);
                documentHolder.mnuImgAdvanced.setVisible(isimagemenu && (!isshapemenu || isimageonly) && !ischartmenu);
                documentHolder.mnuImgAdvanced.setDisabled(isObjLocked);
                documentHolder.menuImgOriginalSize.setVisible(isimagemenu && (!isshapemenu || isimageonly) && !ischartmenu);
                if (documentHolder.mnuImgAdvanced.imageInfo)
                    documentHolder.menuImgOriginalSize.setDisabled(isObjLocked || documentHolder.mnuImgAdvanced.imageInfo.get_ImageUrl()===null || documentHolder.mnuImgAdvanced.imageInfo.get_ImageUrl()===undefined);

                documentHolder.mnuSlicerAdvanced.setVisible(isslicermenu);
                documentHolder.mnuSlicerAdvanced.setDisabled(isObjLocked);

                var pluginGuid = (documentHolder.mnuImgAdvanced.imageInfo) ? documentHolder.mnuImgAdvanced.imageInfo.asc_getPluginGuid() : null;
                documentHolder.menuImgReplace.setVisible(isimageonly && (pluginGuid===null || pluginGuid===undefined));
                documentHolder.menuImgReplace.setDisabled(isObjLocked || pluginGuid===null);
                documentHolder.menuImgReplace.menu.items[2].setVisible(this.permissions.canRequestInsertImage || this.permissions.fileChoiceUrl && this.permissions.fileChoiceUrl.indexOf("{documentType}")>-1);
                documentHolder.menuImageArrange.setDisabled(isObjLocked);

                var pluginGuidAvailable = (pluginGuid !== null && pluginGuid !== undefined);
                documentHolder.menuEditObject.setVisible(pluginGuidAvailable);
                documentHolder.menuEditObjectSeparator.setVisible(pluginGuidAvailable);

                if (pluginGuidAvailable) {
                    var plugin = SSE.getCollection('Common.Collections.Plugins').findWhere({guid: pluginGuid});
                    documentHolder.menuEditObject.setDisabled(!this.api.asc_canEditTableOleObject() && (plugin === null || plugin === undefined) || isObjLocked);
                }

                documentHolder.menuImgRotate.setVisible(!ischartmenu && (pluginGuid===null || pluginGuid===undefined) && !isslicermenu);
                documentHolder.menuImgRotate.setDisabled(isObjLocked || isSmartArt);
                documentHolder.menuImgRotate.menu.items[3].setDisabled(isSmartArtInternal);
                documentHolder.menuImgRotate.menu.items[4].setDisabled(isSmartArtInternal);

                documentHolder.menuImgCrop.setVisible(this.api.asc_canEditCrop());
                documentHolder.menuImgCrop.setDisabled(isObjLocked);

                documentHolder.menuImgResetCrop.setVisible(isimagemenu && documentHolder.mnuImgAdvanced.imageInfo.asc_getIsCrop());
                documentHolder.menuImgResetCrop.setDisabled(isObjLocked);

                var isInSign = !!signGuid;
                documentHolder.menuSignatureEditSign.setVisible(isInSign);
                documentHolder.menuSignatureEditSetup.setVisible(isInSign);
                documentHolder.menuEditSignSeparator.setVisible(isInSign);

                documentHolder.menuImgMacro.setVisible(!internaleditor);
                documentHolder.menuImgMacro.setDisabled(isObjLocked);

                var canEditPoints = this.api && this.api.asc_canEditGeometry();
                documentHolder.menuImgEditPoints.setVisible(canEditPoints);
                canEditPoints && documentHolder.menuImgEditPoints.setDisabled(isObjLocked);

                if (showMenu) this.showPopupMenu(documentHolder.imgMenu, {}, event);
                documentHolder.mnuShapeSeparator.setVisible(documentHolder.mnuShapeAdvanced.isVisible() || documentHolder.mnuChartEdit.isVisible() || documentHolder.mnuImgAdvanced.isVisible());
                documentHolder.mnuSlicerSeparator.setVisible(documentHolder.mnuSlicerAdvanced.isVisible());
                if (isInSign) {
                    documentHolder.menuSignatureEditSign.cmpEl.attr('data-value', signGuid); // sign
                    documentHolder.menuSignatureEditSetup.cmpEl.attr('data-value', signGuid); // edit signature settings
                }
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
                            listtype = this.api.asc_getCurrentListType(),
                            shapeProps = value ? value.asc_getShapeProperties() : null;

                        if (this._state.wsProps['Objects'] && value.asc_getProtectionLockText()) // don't show menu for locked text
                            return;

                        isObjLocked = isObjLocked || value.asc_getLocked();
                        isSmartArt = shapeProps ? shapeProps.asc_getFromSmartArt() : false;
                        isSmartArtInternal = shapeProps ? shapeProps.asc_getFromSmartArtInternal() : false;
                        var cls = '';
                        switch (align) {
                            case Asc.c_oAscVAlign.Top:
                                cls = 'menu__icon btn-align-top';
                                break;
                            case Asc.c_oAscVAlign.Center:
                                cls = 'menu__icon btn-align-middle';
                                break;
                            case Asc.c_oAscVAlign.Bottom:
                                cls = 'menu__icon btn-align-bottom';
                                break;
                        }
                        documentHolder.menuParagraphVAlign.setIconCls(cls);
                        documentHolder.menuParagraphTop.setChecked(align == Asc.c_oAscVAlign.Top);
                        documentHolder.menuParagraphCenter.setChecked(align == Asc.c_oAscVAlign.Center);
                        documentHolder.menuParagraphBottom.setChecked(align == Asc.c_oAscVAlign.Bottom);

                        cls = '';
                        switch (direct) {
                            case Asc.c_oAscVertDrawingText.normal:
                                cls = 'menu__icon btn-text-orient-hor';
                                break;
                            case Asc.c_oAscVertDrawingText.vert:
                                cls = 'menu__icon btn-text-orient-rdown';
                                break;
                            case Asc.c_oAscVertDrawingText.vert270:
                                cls = 'menu__icon btn-text-orient-rup';
                                break;
                        }
                        documentHolder.menuParagraphDirection.setIconCls(cls);
                        documentHolder.menuParagraphDirectH.setChecked(direct == Asc.c_oAscVertDrawingText.normal);
                        documentHolder.menuParagraphDirect90.setChecked(direct == Asc.c_oAscVertDrawingText.vert);
                        documentHolder.menuParagraphDirect270.setChecked(direct == Asc.c_oAscVertDrawingText.vert270);

                        documentHolder.menuParagraphBulletNone.setChecked(listtype.get_ListType() == -1);
                        var type = listtype.get_ListType(),
                            subtype = listtype.get_ListSubType(),
                            rec,
                            defrec = documentHolder.paraBulletsPicker.store.at(7),
                            drawDefBullet = (defrec.get('subtype')===0x1000) && (type===1 || subtype!==0x1000);
                        if (type===1 || subtype!==0x1000) {
                            rec = documentHolder.paraBulletsPicker.store.findWhere({ type: type, subtype: subtype });
                        } else {
                            var bullet = listtype.asc_getListCustom();
                            if (bullet) {
                                var bullettype = bullet.asc_getType();
                                if (bullettype === Asc.asc_PreviewBulletType.char) {
                                    var symbol = bullet.asc_getChar();
                                    if (symbol) {
                                        var custombullet = new Asc.asc_CBullet();
                                        custombullet.asc_putSymbol(symbol);
                                        custombullet.asc_putFont(bullet.asc_getSpecialFont());

                                        rec = defrec;
                                        rec.set('subtype', 0x1000);
                                        rec.set('customBullet', custombullet);
                                        rec.set('numberingInfo', JSON.stringify(custombullet.asc_getJsonBullet()));
                                        rec.set('tip', '');
                                        documentHolder.paraBulletsPicker.dataViewItems && this.updateBulletTip(documentHolder.paraBulletsPicker.dataViewItems[7], '');
                                        drawDefBullet = false;

                                    }
                                } else if (bullettype === Asc.asc_PreviewBulletType.image) {
                                    var id = bullet.asc_getImageId();
                                    if (id) {
                                        var custombullet = new Asc.asc_CBullet();
                                        custombullet.asc_fillBulletImage(id);

                                        rec = defrec;
                                        rec.set('subtype', 0x1000);
                                        rec.set('customBullet', custombullet);
                                        rec.set('numberingInfo', JSON.stringify(custombullet.asc_getJsonBullet()));
                                        rec.set('tip', '');
                                        documentHolder.paraBulletsPicker.dataViewItems && this.updateBulletTip(documentHolder.paraBulletsPicker.dataViewItems[7], '');
                                        drawDefBullet = false;
                                    }
                                }
                            }
                        }
                        documentHolder.paraBulletsPicker.selectRecord(rec, true);
                        if (drawDefBullet) {
                            defrec.set('subtype', 8);
                            defrec.set('numberingInfo', documentHolder._markersArr[7]);
                            defrec.set('tip', documentHolder.tipMarkersDash);
                            documentHolder.paraBulletsPicker.dataViewItems && this.updateBulletTip(documentHolder.paraBulletsPicker.dataViewItems[7], documentHolder.tipMarkersDash);
                        }
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

                documentHolder.menuParagraphBullets.setVisible(istextchartmenu!==true);
                documentHolder.menuHyperlinkShape.setVisible(istextshapemenu && can_add_hyperlink!==false && hyperinfo);
                documentHolder.menuAddHyperlinkShape.setVisible(istextshapemenu && can_add_hyperlink!==false && !hyperinfo);
                documentHolder.menuParagraphVAlign.setVisible(istextchartmenu!==true && !isEquation); // убрать после того, как заголовок можно будет растягивать по вертикали!!
                documentHolder.menuParagraphDirection.setVisible(istextchartmenu!==true && !isEquation); // убрать после того, как заголовок можно будет растягивать по вертикали!!
                documentHolder.textInShapeMenu.items[3].setVisible(istextchartmenu!==true || istextshapemenu && can_add_hyperlink!==false);
                documentHolder.pmiTextAdvanced.setVisible(documentHolder.pmiTextAdvanced.textInfo!==undefined);

                _.each(documentHolder.textInShapeMenu.items, function(item) {
                    item.setDisabled(isObjLocked);
                });
                documentHolder.pmiTextCopy.setDisabled(false);
                documentHolder.menuHyperlinkShape.setDisabled(isObjLocked || this._state.wsProps['InsertHyperlinks']);
                documentHolder.menuAddHyperlinkShape.setDisabled(isObjLocked || this._state.wsProps['InsertHyperlinks']);

                //equation menu
                var eqlen = 0;
                this._currentParaObjDisabled = isObjLocked;
                if (isEquation) {
                    eqlen = documentHolder.addEquationMenu(documentHolder.textInShapeMenu, 4);
                } else
                    documentHolder.clearEquationMenu(documentHolder.textInShapeMenu, 4);

                documentHolder.menuParagraphEquation.setVisible(isEquation);
                documentHolder.menuParagraphEquation.setDisabled(isObjLocked);
                if (isEquation) {
                    var eq = this.api.asc_GetMathInputType(),
                        isEqToolbarHide = Common.Utils.InternalSettings.get('sse-equation-toolbar-hide');

                    documentHolder.menuParagraphEquation.menu.items[5].setChecked(eq===Asc.c_oAscMathInputType.Unicode);
                    documentHolder.menuParagraphEquation.menu.items[6].setChecked(eq===Asc.c_oAscMathInputType.LaTeX);
                    documentHolder.menuParagraphEquation.menu.items[8].options.isToolbarHide = isEqToolbarHide;
                    documentHolder.menuParagraphEquation.menu.items[8].setCaption(isEqToolbarHide ? documentHolder.showEqToolbar : documentHolder.hideEqToolbar);
                }

                if (showMenu) this.showPopupMenu(documentHolder.textInShapeMenu, {}, event);

                documentHolder.menuParagraphBullets.setDisabled(isSmartArt || isSmartArtInternal);
            } else if (!this.permissions.isEditMailMerge && !this.permissions.isEditDiagram && !this.permissions.isEditOle ||
                (seltype !== Asc.c_oAscSelectionType.RangeImage && seltype !== Asc.c_oAscSelectionType.RangeShape &&
                seltype !== Asc.c_oAscSelectionType.RangeChart && seltype !== Asc.c_oAscSelectionType.RangeChartText &&
                seltype !== Asc.c_oAscSelectionType.RangeShapeText && seltype !== Asc.c_oAscSelectionType.RangeSlicer)) {
                if (!documentHolder.ssMenu || !showMenu && !documentHolder.ssMenu.isVisible()) return;
                this.propsPivot = {
                    originalProps: cellinfo.asc_getPivotTableInfo()
                };
                var iscelledit = this.api.isCellEdited,
                    formatTableInfo = cellinfo.asc_getFormatTableInfo(),
                    isinsparkline = (cellinfo.asc_getSparklineInfo()!==null),
                    isintable = (formatTableInfo !== null),
                    ismultiselect = cellinfo.asc_getMultiselect(),
                    inPivot = !!this.propsPivot.originalProps,
                    isUserProtected = cellinfo.asc_getUserProtected()===true;
                documentHolder.ssMenu.formatTableName = (isintable) ? formatTableInfo.asc_getTableName() : null;
                documentHolder.ssMenu.cellColor = xfs.asc_getFillColor();
                documentHolder.ssMenu.fontColor = xfs.asc_getFontColor();

                documentHolder.pmiCut.setVisible(!inPivot);
                documentHolder.pmiPaste.setVisible(!inPivot);
                documentHolder.pmiInsertEntire.setVisible(isrowmenu||iscolmenu);
                documentHolder.pmiInsertEntire.setCaption((isrowmenu) ? this.textInsertTop : this.textInsertLeft);
                documentHolder.pmiDeleteEntire.setVisible(isrowmenu||iscolmenu);
                documentHolder.pmiInsertCells.setVisible(iscellmenu && !iscelledit && !isintable && !inPivot);
                documentHolder.pmiDeleteCells.setVisible(iscellmenu && !iscelledit && !isintable && !inPivot);
                documentHolder.pmiSelectTable.setVisible(iscellmenu && !iscelledit && isintable);
                documentHolder.pmiInsertTable.setVisible(iscellmenu && !iscelledit && isintable);
                documentHolder.pmiDeleteTable.setVisible(iscellmenu && !iscelledit && isintable);
                documentHolder.pmiSparklines.setVisible(isinsparkline);
                documentHolder.pmiSortCells.setVisible((iscellmenu||isallmenu) && !iscelledit && !inPivot);
                documentHolder.pmiSortCells.menu.items[2].setVisible(!diagramOrMergeEditor);
                documentHolder.pmiSortCells.menu.items[3].setVisible(!diagramOrMergeEditor);
                documentHolder.pmiSortCells.menu.items[4].setVisible(!internaleditor);
                documentHolder.pmiFilterCells.setVisible(iscellmenu && !iscelledit && !diagramOrMergeEditor && !inPivot);
                documentHolder.pmiReapply.setVisible((iscellmenu||isallmenu) && !iscelledit && !diagramOrMergeEditor && !inPivot);
                documentHolder.pmiCondFormat.setVisible(!iscelledit && !diagramOrMergeEditor);

                documentHolder.pmiInsFunction.setVisible(iscellmenu && !iscelledit && !inPivot);
                documentHolder.pmiAddNamedRange.setVisible(iscellmenu && !iscelledit && !internaleditor);

                var needshow = iscellmenu && !iscelledit && !diagramOrMergeEditor && inPivot;
                documentHolder.pmiCellSeparator.setVisible((iscellmenu||isallmenu||isinsparkline) && !iscelledit && !inPivot || needshow);

                needshow && this.fillPivotProps();
                documentHolder.mnuRefreshPivot.setVisible(needshow);
                documentHolder.mnuPivotRefreshSeparator.setVisible(needshow);
                documentHolder.mnuPivotSort.setVisible(this.propsPivot.filter || this.propsPivot.rowFilter || this.propsPivot.colFilter);
                documentHolder.mnuPivotFilter.setVisible(!!this.propsPivot.filter);
                documentHolder.mnuPivotFilterSeparator.setVisible(this.propsPivot.filter || this.propsPivot.rowFilter || this.propsPivot.colFilter);
                documentHolder.mnuSubtotalField.setVisible(!!this.propsPivot.field && (this.propsPivot.fieldType===0 || this.propsPivot.fieldType===1));
                documentHolder.mnuPivotSubtotalSeparator.setVisible(!!this.propsPivot.field && (this.propsPivot.fieldType===0 || this.propsPivot.fieldType===1));
                documentHolder.mnuExpandCollapsePivot.setVisible(!!this.propsPivot.canExpandCollapse);
                documentHolder.mnuPivotExpandCollapseSeparator.setVisible(!!this.propsPivot.canExpandCollapse);
                documentHolder.mnuGroupPivot.setVisible(!!this.propsPivot.canGroup);
                documentHolder.mnuUnGroupPivot.setVisible(!!this.propsPivot.canGroup);
                documentHolder.mnuPivotGroupSeparator.setVisible(!!this.propsPivot.canGroup);
                documentHolder.mnuDeleteField.setVisible(!!this.propsPivot.field);
                documentHolder.mnuPivotDeleteSeparator.setVisible(!!this.propsPivot.field);
                documentHolder.mnuSummarize.setVisible(!!this.propsPivot.field && (this.propsPivot.fieldType===2));
                documentHolder.mnuShowAs.setVisible(!!this.propsPivot.field && (this.propsPivot.fieldType===2) && !this.propsPivot.rowTotal && !this.propsPivot.colTotal);
                documentHolder.mnuPivotValueSeparator.setVisible(!!this.propsPivot.field && (this.propsPivot.fieldType===2));
                documentHolder.mnuShowDetails.setVisible(!!this.propsPivot.showDetails);
                documentHolder.mnuShowDetailsSeparator.setVisible(!!this.propsPivot.showDetails);
                documentHolder.mnuPivotSettings.setVisible(needshow);
                documentHolder.mnuFieldSettings.setVisible(!!this.propsPivot.field);

                if (this.propsPivot.field) {
                    documentHolder.mnuDeleteField.setCaption(documentHolder.txtDelField + ' ' + (this.propsPivot.rowTotal || this.propsPivot.colTotal ? documentHolder.txtGrandTotal : '"' + this.propsPivot.fieldName + '"'));
                    documentHolder.mnuSubtotalField.setCaption(documentHolder.txtSubtotalField + ' "' + this.propsPivot.fieldName + '"');
                    documentHolder.mnuFieldSettings.setCaption(this.propsPivot.fieldType===2 ? documentHolder.txtValueFieldSettings : documentHolder.txtFieldSettings);
                    if (this.propsPivot.fieldType===2) {
                        var sumval = this.propsPivot.field.asc_getSubtotal();
                        for (var i = 0; i < documentHolder.mnuSummarize.menu.items.length; i++) {
                            var item = documentHolder.mnuSummarize.menu.items[i];
                            (item.value!==undefined) && item.setChecked(item.value===sumval, true);
                        }
                        if (!this.propsPivot.rowTotal && !this.propsPivot.colTotal) {
                            sumval = this.propsPivot.field.asc_getShowDataAs();
                            for (var i = 0; i < documentHolder.mnuShowAs.menu.items.length; i++) {
                                var item = documentHolder.mnuShowAs.menu.items[i];
                                (item.value!==undefined) && item.setChecked(item.value===sumval, true);
                            }
                        }
                    } else {
                        documentHolder.mnuSubtotalField.setChecked(!!this.propsPivot.field.asc_getDefaultSubtotal(), true);
                    }
                }
                if (this.propsPivot.filter) {
                    documentHolder.mnuPivotFilter.menu.items[0].setCaption(this.propsPivot.fieldName ? Common.Utils.String.format(documentHolder.txtClearPivotField, ' "' + this.propsPivot.fieldName + '"') : documentHolder.txtClear); // clear filter
                    documentHolder.mnuPivotFilter.menu.items[0].setDisabled(this.propsPivot.filter.asc_getFilterObj().asc_getType() === Asc.c_oAscAutoFilterTypes.None); // clear filter
                }
                if (inPivot) {
                    documentHolder.mnuPivotSort.menu.items[2].setDisabled(!(this.propsPivot.filter || this.propsPivot.rowFilter && this.propsPivot.colFilter));
                }

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
                documentHolder.menuHyperlink.setVisible(iscellmenu && hyperinfo && !iscelledit && !ismultiselect && !diagramOrMergeEditor && !inPivot);
                documentHolder.menuAddHyperlink.setVisible(iscellmenu && !hyperinfo && !iscelledit && !ismultiselect && !diagramOrMergeEditor && !inPivot);

                documentHolder.pmiRowHeight.setVisible(isrowmenu||isallmenu);
                documentHolder.pmiColumnWidth.setVisible(iscolmenu||isallmenu);
                documentHolder.pmiEntireHide.setVisible(iscolmenu||isrowmenu);
                documentHolder.pmiEntireShow.setVisible(iscolmenu||isrowmenu);
                documentHolder.pmiFreezePanes.setVisible(!iscelledit);
                documentHolder.pmiFreezePanes.setCaption(this.api.asc_getSheetViewSettings().asc_getIsFreezePane() ? documentHolder.textUnFreezePanes : documentHolder.textFreezePanes);

                /** coauthoring begin **/
                var celcomments = cellinfo.asc_getComments(); // celcomments===null - has comment, but no permissions to view it
                documentHolder.pmiAddCommentSeparator.setVisible(iscellmenu && !iscelledit && this.permissions.canCoAuthoring && this.permissions.canComments && celcomments && (celcomments.length < 1));
                documentHolder.pmiAddComment.setVisible(iscellmenu && !iscelledit && this.permissions.canCoAuthoring && this.permissions.canComments && celcomments && (celcomments.length < 1));
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

                documentHolder.pmiEntriesList.setVisible(!iscelledit && !inPivot);

                documentHolder.pmiNumFormat.setVisible(!iscelledit);
                documentHolder.pmiCellFormat.setVisible(!iscelledit && !(this.permissions.canBrandingExt && this.permissions.customization && this.permissions.customization.rightMenu === false || !Common.UI.LayoutManager.isElementVisible('rightMenu')) &&
                                                        !this.permissions.isEditMailMerge && !this.permissions.isEditDiagram && !this.permissions.isEditOle);
                documentHolder.pmiAdvancedNumFormat.options.numformatinfo = documentHolder.pmiNumFormat.menu.options.numformatinfo = xfs.asc_getNumFormatInfo();
                documentHolder.pmiAdvancedNumFormat.options.numformat = xfs.asc_getNumFormat();

                documentHolder.pmiGetRangeList.setVisible(!Common.Utils.isIE && iscellmenu && !iscelledit && !ismultiselect && !internaleditor && this.permissions.canMakeActionLink && !!navigator.clipboard);

                _.each(documentHolder.ssMenu.items, function(item) {
                    item.setDisabled(isCellLocked || isUserProtected);
                });
                documentHolder.pmiCopy.setDisabled(false);
                documentHolder.pmiSelectTable.setDisabled(this._state.wsLock);
                documentHolder.pmiInsertEntire.setDisabled(isCellLocked || isTableLocked || isrowmenu && this._state.wsProps['InsertRows'] || iscolmenu && this._state.wsProps['InsertColumns'] || isUserProtected);
                documentHolder.pmiInsertCells.setDisabled(isCellLocked || isTableLocked || inPivot || this._state.wsLock || isUserProtected);
                documentHolder.pmiInsertTable.setDisabled(isCellLocked || isTableLocked || this._state.wsLock || isUserProtected);
                documentHolder.pmiDeleteEntire.setDisabled(isCellLocked || isTableLocked || isrowmenu && this._state.wsProps['DeleteRows'] || iscolmenu && this._state.wsProps['DeleteColumns'] || isUserProtected);
                documentHolder.pmiDeleteCells.setDisabled(isCellLocked || isTableLocked || inPivot || this._state.wsLock || isUserProtected);
                documentHolder.pmiDeleteTable.setDisabled(isCellLocked || isTableLocked || this._state.wsLock || isUserProtected);
                documentHolder.pmiClear.setDisabled(isCellLocked || inPivot || isUserProtected);
                documentHolder.pmiFilterCells.setDisabled(isCellLocked || isTableLocked|| (filterInfo==null) || inPivot || !filterInfo && !this.permissions.canModifyFilter || this._state.wsLock || isUserProtected);
                documentHolder.pmiSortCells.setDisabled(isCellLocked || isTableLocked|| (filterInfo==null) || inPivot || !this.permissions.canModifyFilter || this._state.wsProps['Sort'] || isUserProtected);
                documentHolder.pmiReapply.setDisabled(isCellLocked || isTableLocked|| (isApplyAutoFilter!==true) || isUserProtected);
                documentHolder.pmiCondFormat.setDisabled(isCellLocked || isTableLocked || this._state.wsProps['FormatCells'] || isUserProtected);
                documentHolder.menuHyperlink.setDisabled(isCellLocked || inPivot || this._state.wsProps['InsertHyperlinks'] || isUserProtected);
                documentHolder.menuAddHyperlink.setDisabled(isCellLocked || inPivot || this._state.wsProps['InsertHyperlinks'] || isUserProtected);
                documentHolder.pmiInsFunction.setDisabled(isCellLocked || inPivot || isUserProtected);
                documentHolder.pmiFreezePanes.setDisabled(this.api.asc_isWorksheetLockedOrDeleted(this.api.asc_getActiveWorksheetIndex()));
                documentHolder.pmiRowHeight.setDisabled(isCellLocked || this._state.wsProps['FormatRows']);
                documentHolder.pmiColumnWidth.setDisabled(isCellLocked || this._state.wsProps['FormatColumns']);
                documentHolder.pmiEntireHide.setDisabled(isCellLocked || iscolmenu && this._state.wsProps['FormatColumns'] || isrowmenu && this._state.wsProps['FormatRows']);
                documentHolder.pmiEntireShow.setDisabled(isCellLocked || iscolmenu && this._state.wsProps['FormatColumns'] ||isrowmenu && this._state.wsProps['FormatRows']);
                documentHolder.pmiNumFormat.setDisabled(isCellLocked || this._state.wsProps['FormatCells'] || isUserProtected);
                documentHolder.pmiSparklines.setDisabled(isCellLocked || this._state.wsLock || isUserProtected);
                documentHolder.pmiEntriesList.setDisabled(isCellLocked || this._state.wsLock || isUserProtected);
                documentHolder.pmiAddNamedRange.setDisabled(isCellLocked || this._state.wsLock);
                documentHolder.pmiAddComment.setDisabled(isCellLocked || this._state.wsProps['Objects']);
                documentHolder.pmiGetRangeList.setDisabled(false);

                if (inPivot) {
                    documentHolder.mnuGroupPivot.setDisabled(isPivotLocked || this._state.wsLock);
                    documentHolder.mnuUnGroupPivot.setDisabled(isPivotLocked || this._state.wsLock);
                    documentHolder.mnuRefreshPivot.setDisabled(isPivotLocked || this._state.wsLock);
                    documentHolder.mnuPivotSettings.setDisabled(isPivotLocked || this._state.wsLock);
                    documentHolder.mnuFieldSettings.setDisabled(isPivotLocked || this._state.wsLock);
                    documentHolder.mnuDeleteField.setDisabled(isPivotLocked || this._state.wsLock);
                    documentHolder.mnuSubtotalField.setDisabled(isPivotLocked || this._state.wsLock);
                    documentHolder.mnuSummarize.setDisabled(isPivotLocked || this._state.wsLock);
                    documentHolder.mnuShowAs.setDisabled(isPivotLocked || this._state.wsLock);
                    documentHolder.mnuShowDetails.setDisabled(this.api.asc_isWorkbookLocked() || this.api.asc_isProtectedWorkbook());
                    documentHolder.mnuPivotFilter.setDisabled(isPivotLocked || this._state.wsLock);
                }

                if (showMenu) this.showPopupMenu(documentHolder.ssMenu, {}, event);

                documentHolder.pmiFunctionSeparator.setVisible(documentHolder.pmiInsFunction.isVisible() || documentHolder.menuAddHyperlink.isVisible() || documentHolder.menuHyperlink.isVisible() ||
                    isrowmenu || iscolmenu || isallmenu);
                documentHolder.pmiFreezeSeparator.setVisible(documentHolder.pmiFreezePanes.isVisible());

            } else if (this.permissions.isEditDiagram && seltype == Asc.c_oAscSelectionType.RangeChartText) {
                if (!showMenu && !documentHolder.textInShapeMenu.isVisible()) return;

                documentHolder.pmiTextAdvanced.textInfo = undefined;

                documentHolder.menuHyperlinkShape.setVisible(false);
                documentHolder.menuAddHyperlinkShape.setVisible(false);
                documentHolder.menuParagraphVAlign.setVisible(false); // убрать после того, как заголовок можно будет растягивать по вертикали!!
                documentHolder.menuParagraphDirection.setVisible(false); // убрать после того, как заголовок можно будет растягивать по вертикали!!
                documentHolder.pmiTextAdvanced.setVisible(false);
                documentHolder.menuParagraphEquation.setVisible(false);
                documentHolder.textInShapeMenu.items[9].setVisible(false);
                documentHolder.menuParagraphBullets.setVisible(false);
                documentHolder.textInShapeMenu.items[3].setVisible(false);
                documentHolder.pmiTextCopy.setDisabled(false);
                if (showMenu) this.showPopupMenu(documentHolder.textInShapeMenu, {}, event);
            }
        };

        dh.fillViewMenuProps = function(cellinfo, showMenu, event){
            if (!cellinfo) return;
            var documentHolder      = this.documentHolder,
                seltype             = cellinfo.asc_getSelectionType(),
                isCellLocked        = cellinfo.asc_getLocked(),
                isTableLocked       = cellinfo.asc_getLockedTable()===true,
                commentsController  = this.getApplication().getController('Common.Controllers.Comments'),
                iscellmenu = (seltype==Asc.c_oAscSelectionType.RangeCells) && !this.permissions.isEditMailMerge && !this.permissions.isEditDiagram && !this.permissions.isEditOle,
                iscelledit = this.api.isCellEdited,
                isimagemenu = (seltype==Asc.c_oAscSelectionType.RangeShape || seltype==Asc.c_oAscSelectionType.RangeImage) && !this.permissions.isEditMailMerge && !this.permissions.isEditDiagram && !this.permissions.isEditOle,
                signGuid,
                ismultiselect = cellinfo.asc_getMultiselect();

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
                canComment = iscellmenu && !iscelledit && this.permissions.canCoAuthoring && this.permissions.canComments && !this._isDisabled && cellinfo.asc_getComments() && cellinfo.asc_getComments().length < 1;

            documentHolder.menuViewUndo.setVisible(this.permissions.canCoAuthoring && this.permissions.canComments && !this._isDisabled);
            documentHolder.menuViewUndo.setDisabled(!this.api.asc_getCanUndo());
            documentHolder.menuViewCopySeparator.setVisible(isInSign);

            var isRequested = (signProps) ? signProps.asc_getRequested() : false;
            documentHolder.menuSignatureViewSign.setVisible(isInSign && isRequested);
            documentHolder.menuSignatureDetails.setVisible(isInSign && !isRequested);
            documentHolder.menuSignatureViewSetup.setVisible(isInSign);
            documentHolder.menuSignatureRemove.setVisible(isInSign && !isRequested);
            documentHolder.menuViewSignSeparator.setVisible(canComment);

            documentHolder.menuViewAddComment.setVisible(canComment);
            commentsController && commentsController.blockPopover(true);
            documentHolder.menuViewAddComment.setDisabled(isCellLocked || isTableLocked || this._state.wsProps['Objects']);

            var canGetLink = !Common.Utils.isIE && iscellmenu && !iscelledit && !ismultiselect && this.permissions.canMakeActionLink && !!navigator.clipboard;
            documentHolder.pmiViewGetRangeList.setVisible(canGetLink);
            documentHolder.pmiViewGetRangeList.setDisabled(false);
            documentHolder.menuViewCommentSeparator.setVisible(canGetLink);

            if (showMenu) this.showPopupMenu(documentHolder.viewModeMenu, {}, event);

            if (isInSign) {
                documentHolder.menuSignatureViewSign.cmpEl.attr('data-value', signGuid); // sign
                documentHolder.menuSignatureDetails.cmpEl.attr('data-value', signProps.asc_getId()); // view certificate
                documentHolder.menuSignatureViewSetup.cmpEl.attr('data-value', signGuid); // view signature settings
                documentHolder.menuSignatureRemove.cmpEl.attr('data-value', signGuid);
            }
        };

        dh.fillSeriesMenuProps = function(seriesinfo, event, type){
            if (!seriesinfo) return;
            var documentHolder = this.documentHolder,
                items = documentHolder.fillMenu.items,
                props = seriesinfo.asc_getContextMenuAllowedProps();

            for (var i = 0; i < items.length; i++) {
                var val = props[items[i].value];
                items[i].setVisible(val!==null);
                items[i].setDisabled(!val);
            }
            documentHolder.fillMenu.seriesinfo = seriesinfo;
            this.showPopupMenu(documentHolder.fillMenu, {}, event, type);
        };

        dh.onEntriesListMenu = function(validation, textarr, addarr) {
            if (textarr && textarr.length>0) {
                var me                  = this,
                    documentHolderView  = me.documentHolder,
                    menu                = documentHolderView.entriesMenu,
                    menuContainer       = documentHolderView.cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id));

                if (validation && menu.isVisible()) {
                    menu.hide();
                    return;
                }

                for (var i = 0; i < menu.items.length; i++) {
                    menu.removeItem(menu.items[i]);
                    i--;
                }

                _.each(textarr, function(menuItem, index) {
                    var mnu = new Common.UI.MenuItem({
                        caption     : menuItem,
                        value       : addarr ? addarr[index] : menuItem,
                        style: (typeof menuItem == 'string' && _.isEmpty(menuItem.trim())) ? 'min-height: 25px;' : ''
                    }).on('click', function(item, e) {
                        me.api.asc_insertInCell(item.value, Asc.c_oAscPopUpSelectorType.None, false );
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

                var coord  = me.api.asc_getActiveCellCoord(validation), // get merged cell for validation
                    offset = {left:0,top:0},
                    showPoint = [coord.asc_getX() + offset.left + (validation ? coord.asc_getWidth() : 0), (coord.asc_getY() < 0 ? 0 : coord.asc_getY()) + coord.asc_getHeight() + offset.top];

                menuContainer.css({left: showPoint[0], top : showPoint[1]});
                menu.menuAlign = validation ? 'tr-br' : 'tl-bl';
                if (Common.UI.isRTL()) {
                    menu.menuAlign = menu.menuAlign === 'tr-br' ? 'tl-bl' : 'tr-br';
                }

                me._preventClick = validation;
                validation && menuContainer.attr('data-value', 'prevent-canvas-click');
                menu.show();

                menu.alignPosition();
                _.delay(function() {
                    menu.cmpEl.focus();
                }, 10);
            } else {
                this.documentHolder.entriesMenu.hide();
                !validation && Common.UI.warning({
                    title: this.notcriticalErrorTitle,
                    maxwidth: 600,
                    msg  : this.txtNoChoices,
                    callback: _.bind(function(btn){
                        Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                    }, this)
                });
            }
        };

        dh.onTableTotalMenu = function(current) {
            if (current !== undefined) {
                var me                  = this,
                    documentHolderView  = me.documentHolder,
                    menu                = documentHolderView.tableTotalMenu,
                    menuContainer       = documentHolderView.cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id));

                if (menu.isVisible()) {
                    menu.hide();
                    return;
                }

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

                menu.clearAll();
                var func = _.find(menu.items, function(item) { return item.value == current; });
                if (func)
                    func.setChecked(true, true);

                var coord  = me.api.asc_getActiveCellCoord(),
                    offset = {left:0,top:0},
                    showPoint = [coord.asc_getX() + offset.left + coord.asc_getWidth(), (coord.asc_getY() < 0 ? 0 : coord.asc_getY()) + coord.asc_getHeight() + offset.top];
                menuContainer.css({left: showPoint[0], top : showPoint[1]});

                me._preventClick = true;
                menuContainer.attr('data-value', 'prevent-canvas-click');
                menu.show();

                menu.alignPosition();
                _.delay(function() {
                    menu.cmpEl.focus();
                }, 10);
            } else {
                this.documentHolder.tableTotalMenu.hide();
            }
        };

        dh.onTotalMenuClick = function(menu, item) {
            if (item.value==Asc.ETotalsRowFunction.totalrowfunctionCustom) {
                this.onInsFunction(item);
            } else {
                this.api.asc_insertInCell(item.value, Asc.c_oAscPopUpSelectorType.TotalRowFunc);
            }
            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        };

        dh.onApiFormulaCompleteMenu = function(funcarr, offset) {
            const me = this;
            setTimeout(function() {
                me.onFormulaCompleteMenu(funcarr, offset);
            }, 0);
        };

        dh.onFormulaCompleteMenu = function(funcarr, offset) {
            if (!this.documentHolder.funcMenu || Common.Utils.ModalWindow.isVisible() || this.rangeSelectionMode) return;

            if (funcarr) {
                var me                  = this,
                    documentHolderView  = me.documentHolder,
                    menu                = documentHolderView.funcMenu,
                    menuContainer       = documentHolderView.cmpEl.find('#menu-formula-selection'),
                    funcdesc = me.getApplication().getController('FormulaDialog').getDescription(Common.Utils.InternalSettings.get("sse-settings-func-locale"));

                for (var i = 0; i < menu.items.length; i++) {
                    var tip = menu.items[i].cmpEl.data('bs.tooltip');
                    if (tip)
                        tip.hide();
                    menu.removeItem(menu.items[i]);
                    i--;
                }
                funcarr.sort(function (a,b) {
                    var atype = a.asc_getType(),
                        btype = b.asc_getType();
                    if (atype===btype && (atype === Asc.c_oAscPopUpSelectorType.TableColumnName))
                        return 0;
                    if (atype === Asc.c_oAscPopUpSelectorType.TableThisRow) return -1;
                    if (btype === Asc.c_oAscPopUpSelectorType.TableThisRow) return 1;
                    if ((atype === Asc.c_oAscPopUpSelectorType.TableColumnName || btype === Asc.c_oAscPopUpSelectorType.TableColumnName) && atype !== btype)
                        return atype === Asc.c_oAscPopUpSelectorType.TableColumnName ? -1 : 1;
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
                        iconCls = '',
                        caption = name,
                        hint = '';
                    switch (type) {
                        case Asc.c_oAscPopUpSelectorType.Func:
                            iconCls = 'menu__icon btn-function';
                            if (funcdesc && funcdesc[origname])
                                hint = funcdesc[origname].d;
                            else {
                                var custom = me.api.asc_getCustomFunctionInfo(origname);
                                hint = custom ? custom.asc_getDescription() || '' : '';
                            }
                            break;
                        case Asc.c_oAscPopUpSelectorType.Table:
                            iconCls = 'menu__icon btn-menu-table';
                            break;
                        case Asc.c_oAscPopUpSelectorType.Slicer:
                            iconCls = 'menu__icon btn-slicer';
                            break;
                        case Asc.c_oAscPopUpSelectorType.Range:
                            iconCls = 'menu__icon btn-named-range';
                            break;
                        case Asc.c_oAscPopUpSelectorType.TableColumnName:
                            caption = '(...) ' + name;
                            break;
                        case Asc.c_oAscPopUpSelectorType.TableThisRow:
                            hint = me.txtThisRowHint;
                            break;
                        case Asc.c_oAscPopUpSelectorType.TableAll:
                            hint = me.txtAllTableHint;
                            break;
                        case Asc.c_oAscPopUpSelectorType.TableData:
                            hint = me.txtDataTableHint;
                            break;
                        case Asc.c_oAscPopUpSelectorType.TableHeaders:
                            hint = me.txtHeadersTableHint;
                            break;
                        case Asc.c_oAscPopUpSelectorType.TableTotals:
                            hint = me.txtTotalsTableHint;
                            break;
                    }
                    var mnu = new Common.UI.MenuItem({
                        iconCls: iconCls,
                        caption: caption,
                        name: name,
                        hint: hint
                    }).on('click', function(item, e) {
                        setTimeout(function(){ me.api.asc_insertInCell(item.options.name, type, false ); }, 10);
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
                                    li_focused = menuContainer.find('a.focus').closest('li'),
                                    innerHeight = innerEl.innerHeight(),
                                    padding = (innerHeight - innerEl.height())/2,
                                    pos = Common.Utils.getPosition(li_focused).top,
                                    itemHeight = li_focused.outerHeight(),
                                    newpos;
                                if (pos<0)
                                    newpos = innerEl.scrollTop() + pos - padding;
                                else if (pos+itemHeight>innerHeight)
                                    newpos = innerEl.scrollTop() + pos + itemHeight - innerHeight + padding;
                                if (newpos!==undefined) {
                                    menu.scroller ? menu.scroller.scrollTop(newpos, 0) : innerEl.scrollTop(newpos);
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

                var infocus = me.cellEditor.is(":focus");
                var isFunctipShow = this.tooltips.func_arg.isHidden === false;

                if (infocus) {
                    menu.menuAlignEl = me.cellEditor;
                    menu.offset = [
                        0,
                        (offset ? offset[1] : 0) + (isFunctipShow ? this.tooltips.func_arg.ref.getBSTip().$tip.height() + 2 : 0)
                    ];
                    me.focusInCellEditor = true;
                } else {
                    menu.menuAlignEl = undefined;
                    menu.offset = [0 ,0];
                    me.focusInCellEditor = false;
                    var coord  = me.api.asc_getActiveCellCoord(),
                        showPoint = [
                            coord.asc_getX() + (offset ? offset[0] : 0),
                            (coord.asc_getY() < 0 ? 0 : coord.asc_getY()) + coord.asc_getHeight() + (offset ? offset[1] : 0) + (isFunctipShow ? this.tooltips.func_arg.ref.getBSTip().$tip.height() + 2 : 0)
                        ];
                    menuContainer.css({left: showPoint[0], top : showPoint[1]});
                }
                menu.alignPosition();

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
        };

        dh.parseArgsDesc = function(args) {
            if (args.charAt(0)=='(')
                args = args.substring(1);
            if (args.charAt(args.length-1)==')')
                args = args.substring(0, args.length-1);
            var arr = args.split(this.api.asc_getFunctionArgumentSeparator());
            arr.forEach(function(item, index){
                var str = item.trim();
                if (str.charAt(0)=='[')
                    str = str.substring(1);
                if (str.charAt(str.length-1)==']')
                    str = str.substring(0, str.length-1);
                arr[index] = str.trim();
            });
            return arr;
        };

        dh.fillRepeatedNames = function(argsNames, repeatedArg) {
            var repeatedIdx = 1;
            if (argsNames.length>=1) {
                if (repeatedArg && repeatedArg.length>0 && argsNames[argsNames.length-1]==='...') {
                    var req = argsNames.length-1 - repeatedArg.length; // required/no-repeated
                    for (var i=0; i<repeatedArg.length; i++) {
                        var str = argsNames[argsNames.length-2-i],
                            ch = str.charAt(str.length-1);
                        if ('123456789'.indexOf(ch)>-1) {
                            repeatedIdx = parseInt(ch);
                            argsNames[argsNames.length-2-i] = str.substring(0, str.length-1);
                        }
                    }
                }
            }
            return repeatedIdx;
        };

        dh.getArgumentName = function(argcount, argsNames, repeatedArg, minArgCount, maxArgCount, repeatedIdx) {
            var name = '',
                namesLen = argsNames.length,
                idxInRepeatedArr = -1;
            if ((!repeatedArg || repeatedArg.length<1) && argcount<namesLen && argsNames[argcount]!=='...') { // no repeated args
                name = argsNames[argcount];
                (name==='') && (name = this.textArgument + (maxArgCount>1 ? (' ' + (argcount+1)) : ''));
            } else if (repeatedArg && repeatedArg.length>0 && argsNames[namesLen-1]==='...') {
                var repeatedLen = repeatedArg.length;
                var req = namesLen-1 - repeatedLen; // required/no-repeated
                if (argcount<req) // get required args as is
                    name = argsNames[argcount];
                else {
                    var idx = repeatedLen - (argcount - req)%repeatedLen,
                        num = Math.floor((argcount - req)/repeatedLen) + repeatedIdx;
                    idxInRepeatedArr = repeatedLen - idx;
                    name = argsNames[namesLen-1-idx] + num;
                }
            } else
                name = this.textArgument + (maxArgCount>1 ? (' ' + (argcount+1)) : '');
            if (maxArgCount>0 && argcount>=minArgCount)
                name = (idxInRepeatedArr<=0 ? '[' : '') + name + (idxInRepeatedArr<0 || repeatedArg && idxInRepeatedArr===repeatedArg.length-1 ? ']' : '');

            return name;
        };

        dh.onFormulaInfo = function(name, shiftpos, funcInfo) {
            if(!Common.Utils.InternalSettings.get("sse-settings-function-tooltip")) return;

            var functip = this.tooltips.func_arg;

            if (name) {
                if (!functip.parentEl) {
                    functip.parentEl = $('<div id="tip-container-functip" style="position: absolute; z-index: 10000;"></div>');
                    this.documentHolder.cmpEl.append(functip.parentEl);
                }
                var funcdesc = this.getApplication().getController('FormulaDialog').getDescription(Common.Utils.InternalSettings.get("sse-settings-func-locale")),
                    hint = '',
                    argstype = funcInfo ? funcInfo.asc_getArgumentsType() : null,
                    activeArg = funcInfo ? funcInfo.asc_getActiveArgPos() : null,
                    activeArgsCount = funcInfo ? funcInfo.asc_getActiveArgsCount() : null;

                if (argstype && activeArgsCount) {
                    var args = '';
                    if (funcdesc && funcdesc[name]) {
                        args = funcdesc[name].a.replace(/[,;]/g, this.api.asc_getFunctionArgumentSeparator());
                    } else {
                        var custom = this.api.asc_getCustomFunctionInfo(name),
                            arr_args = custom ? custom.asc_getArg() || [] : [];
                        args = '(' + arr_args.map(function (item) { return item.asc_getIsOptional() ? '[' + item.asc_getName() + ']' : item.asc_getName(); }).join(this.api.asc_getFunctionArgumentSeparator() + ' ') + ')';
                    }

                    var argsNames = this.parseArgsDesc(args),
                        minArgCount = funcInfo.asc_getArgumentMin(),
                        maxArgCount = funcInfo.asc_getArgumentMax(),
                        repeatedArg = undefined,
                        repeatedIdx = 1,
                        arr = [],
                        me = this;

                    function fillArgs(types) {
                        let argcount = arr.length;
                        for (var j = 0; j < types.length; j++) {
                            var str = me.getArgumentName(argcount, argsNames, repeatedArg, minArgCount, maxArgCount, repeatedIdx);
                            activeArg && (argcount===activeArg-1) && (str = '<span class="contrast">' + str + '</span>');
                            arr.push(str);
                            argcount++;
                        }
                    }

                    for (var i=0; i<argstype.length; i++) {
                        var type = argstype[i],
                            types = [];

                        if (typeof type == 'object') {
                            repeatedArg = type;
                            repeatedIdx = this.fillRepeatedNames(argsNames, repeatedArg);
                            types = type;
                        } else
                            types.push(type);

                        fillArgs(types);
                    }
                    if (arr.length<=activeArgsCount && repeatedArg) { // add repeated
                        while (arr.length<=activeArgsCount) {
                            fillArgs(repeatedArg);
                        }
                    }
                    repeatedArg && arr.push('...');
                    hint = this.api.asc_getFormulaLocaleName(name);
                    !activeArg && (hint = '<span class="contrast">' + hint + '</span>');
                    hint += '(' + arr.join(this.api.asc_getFunctionArgumentSeparator() + ' ') + ')';
                } else {
                    if (funcdesc && funcdesc[name]) {
                        hint = this.api.asc_getFormulaLocaleName(name) + funcdesc[name].a;
                        hint = hint.replace(/[,;]/g, this.api.asc_getFunctionArgumentSeparator());
                    } else {
                        var custom = this.api.asc_getCustomFunctionInfo(name),
                            arr_args = custom ? custom.asc_getArg() || [] : [];
                        hint = this.api.asc_getFormulaLocaleName(name) + '(' + arr_args.map(function (item) { return item.asc_getIsOptional() ? '[' + item.asc_getName() + ']' : item.asc_getName(); }).join(this.api.asc_getFunctionArgumentSeparator() + ' ') + ')';
                    }
                }

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
                        cls: 'auto-tooltip',
                        animation: false
                    });

                    functip.ref.show([-10000, -10000]);
                    functip.isHidden = false;
                }

                var infocus = this.cellEditor.is(":focus"),
                    showPoint;
                if (infocus || this.focusInCellEditor) {
                    var offset = Common.Utils.getOffset(this.cellEditor);
                    showPoint = [offset.left, offset.top + this.cellEditor.height() + 3];
                } else {
                    var pos = [
                            Common.Utils.getOffset(this.documentHolder.cmpEl).left - $(window).scrollLeft(),
                            Common.Utils.getOffset(this.documentHolder.cmpEl).top  - $(window).scrollTop()
                        ],
                        coord  = this.api.asc_getActiveCellCoord();
                    showPoint = [coord.asc_getX() + pos[0] - 3, coord.asc_getY() + pos[1] + coord.asc_getHeight() + 4];
                }
                var tipwidth = functip.ref.getBSTip().$tip.width();
                if (showPoint[0] + tipwidth > this.tooltips.coauth.bodyWidth )
                    showPoint[0] = this.tooltips.coauth.bodyWidth - tipwidth;
                if (showPoint[0]<0) {
                    showPoint[0] = 0;
                    functip.ref.getBSTip().$tip.find('.tooltip-inner').css('max-width', this.tooltips.coauth.bodyWidth);
                }

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
        };

        dh.changeInputMessagePosition = function (inputTip) {
            var pos = [
                    Common.Utils.getOffset(this.documentHolder.cmpEl).left - $(window).scrollLeft(),
                    Common.Utils.getOffset(this.documentHolder.cmpEl).top  - $(window).scrollTop()
                ],
                coord  = this.api.asc_getActiveCellCoord(),
                showPoint = [coord.asc_getX() + pos[0] - 3, coord.asc_getY() + pos[1] - inputTip.ref.getBSTip().$tip.height() - 5];
            var tipwidth = inputTip.ref.getBSTip().$tip.width();
            if (showPoint[0] + tipwidth > this.tooltips.coauth.bodyWidth )
                showPoint[0] = this.tooltips.coauth.bodyWidth - tipwidth;
            if (showPoint[1] < pos[1])
                showPoint[1] = pos[1] + coord.asc_getY() + coord.asc_getHeight() + 5;

            inputTip.ref.getBSTip().$tip.css({
                top : showPoint[1] + 'px',
                left: showPoint[0] + 'px',
                'z-index': 900
            });
        };

        dh.onInputMessage = function(title, message) {
            var inputtip = this.tooltips.input_msg;

            if (message) {
                if (!inputtip.parentEl) {
                    inputtip.parentEl = $('<div id="tip-container-inputtip" style="position: absolute; z-index: 10000;"></div>');
                    this.documentHolder.cmpEl.append(inputtip.parentEl);
                }

                var hint = title ? ('<b>' + (Common.Utils.String.htmlEncode(title || '')) + '</b><br>') : '';
                hint += (Common.Utils.String.htmlEncode(message || ''));

                if (inputtip.ref && inputtip.ref.isVisible()) {
                    if (inputtip.text != hint) {
                        inputtip.ref.hide();
                        inputtip.ref = undefined;
                        inputtip.text = '';
                        inputtip.isHidden = true;
                    }
                }

                if (!inputtip.ref || !inputtip.ref.isVisible()) {
                    inputtip.text = hint;
                    inputtip.ref = new Common.UI.Tooltip({
                        owner   : inputtip.parentEl,
                        html    : true,
                        title   : hint,
                        keepvisible: true,
                        dir: 'auto'
                    });

                    inputtip.ref.show([-10000, -10000]);

                    var $tip = inputtip.ref.getBSTip().$tip;
                    $tip.on('click', function () {
                        inputtip.ref.hide();
                        inputtip.ref = undefined;
                        inputtip.text = '';
                        inputtip.isHidden = true;
                    });

                    inputtip.isHidden = false;
                }

                this.changeInputMessagePosition(inputtip);
            } else {
                if (!inputtip.isHidden && inputtip.ref) {
                    inputtip.ref.hide();
                    inputtip.ref = undefined;
                    inputtip.text = '';
                    inputtip.isHidden = true;
                }
            }
        };

        const _set = Asc.c_oAscChartTypeSettings,
            chartElementMap = {
                [_set.barNormal]:              ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend', 'trendLines'],
                [_set.barStacked]:             ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend'],
                [_set.barStackedPer]:          ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend'],
                [_set.barNormal3d]:            ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'gridLines', 'legend'],
                [_set.barStacked3d]:           ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'gridLines', 'legend'],
                [_set.barStackedPer3d]:        ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'gridLines', 'legend'],
                [_set.barNormal3dPerspective]: ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'gridLines', 'legend'],
                [_set.lineNormal]:             ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend', 'trendLines', 'upDownBars'],
                [_set.lineStacked]:            ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend', 'upDownBars'],
                [_set.lineStackedPer]:         ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend', 'trendLines', 'upDownBars'],
                [_set.lineNormalMarker]:       ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend', 'trendLines', 'upDownBars'],
                [_set.lineStackedMarker]:      ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend', 'upDownBars'],
                [_set.lineStackedPerMarker]:   ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend', 'upDownBars'],
                [_set.line3d]:                 ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'gridLines', 'legend'],
                [_set.pie]:                    ['chartTitle', 'dataLabels', 'legend'],
                [_set.pie3d]:                  ['chartTitle', 'dataLabels', 'legend'],
                [_set.hBarNormal]:             ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend', 'trendLines'],
                [_set.hBarStacked]:            ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend'],
                [_set.hBarStackedPer]:         ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend'],
                [_set.hBarNormal3d]:           ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'gridLines', 'legend'],
                [_set.hBarStacked3d]:          ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'gridLines', 'legend'],
                [_set.hBarStackedPer3d]:       ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'gridLines', 'legend'],
                [_set.areaNormal]:             ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend'],
                [_set.areaStacked]:            ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend'],
                [_set.areaStackedPer]:         ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend'],
                [_set.doughnut]:               ['chartTitle', 'dataLabels', 'legend'],
                [_set.stock]:                  ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend', 'trendLines', 'upDownBars'],
                [_set.scatter]:                ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'errorBars', 'gridLines', 'legend', 'trendLines'],
                [_set.scatterLine]:            ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'errorBars', 'gridLines', 'legend', 'trendLines'],
                [_set.scatterLineMarker]:      ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'errorBars', 'gridLines', 'legend', 'trendLines'],
                [_set.scatterMarker]:          ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'errorBars', 'gridLines', 'legend', 'trendLines'],
                [_set.scatterNone]:            ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'errorBars', 'gridLines', 'legend', 'trendLines'],
                [_set.scatterSmooth]:          ['axes', 'axisTitles', 'chartTitle', 'dataTable', 'errorBars', 'gridLines', 'legend', 'trendLines'],
                [_set.scatterSmoothMarker]:    ['axes', 'axisTitles', 'chartTitle', 'dataTable', 'errorBars', 'gridLines', 'legend', 'trendLines'],
                [_set.surfaceNormal]:          ['axes', 'axisTitles', 'chartTitle', 'gridLines', 'legend'],
                [_set.surfaceWireframe]:       ['axes', 'axisTitles', 'chartTitle', 'gridLines', 'legend'],
                [_set.contourNormal]:          ['axes', 'axisTitles', 'chartTitle', 'gridLines', 'legend'],
                [_set.contourWireframe]:       ['axes', 'axisTitles', 'chartTitle', 'gridLines', 'legend'],
                [_set.comboCustom]:            ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend', 'trendLines'],
                [_set.comboBarLine]:           ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend', 'trendLines'],
                [_set.comboBarLineSecondary]:  ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend', 'trendLines'],
                [_set.comboAreaBar]:           ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend'],
                [_set.radar]:                  ['axes', 'chartTitle', 'dataLabels', 'gridLines', 'legend'],
                [_set.radarMarker]:            ['axes', 'chartTitle', 'dataLabels', 'gridLines', 'legend'],
                [_set.radarFilled]:            ['axes', 'chartTitle', 'dataLabels', 'gridLines', 'legend'],
                [_set.unknown]:                ['axes', 'axisTitles', 'chartTitle', 'dataLabels', 'dataTable', 'errorBars', 'gridLines', 'legend', 'trendLines', 'upDownBars']
            };

         dh.onChartElement = function(menu, item) {
            var chartProps = this.chartProps,
                HorAxis = chartProps.getHorAxesProps && chartProps.getHorAxesProps()[0],
                SecHorAxis = chartProps.getHorAxesProps && chartProps.getHorAxesProps()[1],
                VertAxis = chartProps.getVertAxesProps && chartProps.getVertAxesProps()[0],
                SecVertAxis = chartProps.getVertAxesProps && chartProps.getVertAxesProps()[1],
                DepthAxis = chartProps.getDepthAxesProps && chartProps.getDepthAxesProps()[0],
                HorMajorGridlines = HorAxis && (HorAxis.getGridlines() === 1 || HorAxis.getGridlines() === 3),
                HorMinorGridlines = HorAxis && (HorAxis.getGridlines() === 2 || HorAxis.getGridlines() === 3),
                VertMajorGridlines = VertAxis && (VertAxis.getGridlines() === 1 || VertAxis.getGridlines() === 3),
                VertMinorGridlines = VertAxis && (VertAxis.getGridlines() === 2 || VertAxis.getGridlines() === 3);
                
            const value = item.value,
                type = chartProps.getType(),
                RadarChart = [_set.radar, _set.radarMarker, _set.radarFilled].includes(type),
                hBarChart = [_set.hBarNormal, _set.hBarStacked, _set.hBarStackedPer, _set.hBarNormal3d, _set.hBarStacked3d, _set.hBarStackedPer3d].includes(type),
                scatterChart = [_set.scatter, _set.scatterLine, _set.scatterLineMarker, _set.scatterMarker, _set.scatterNone, _set.scatterSmooth, _set.scatterSmoothMarker, _set.surfaceNormal].includes(type),
                comboCustom = [_set.comboCustom].includes(type);
            
            switch (value) {
                case 'bShowHorAxis':
                    if (hBarChart) {
                        chartProps.setDisplayAxes(VertAxis && VertAxis.getShow(), SecVertAxis && SecVertAxis.getShow(), item.checked, SecHorAxis && SecHorAxis.getShow(), DepthAxis && DepthAxis.getShow());
                    } else if (scatterChart) {
                        chartProps.setDisplayAxes(SecVertAxis && SecVertAxis.getShow(), SecHorAxis && SecHorAxis.getShow(), item.checked, VertAxis && VertAxis.getShow(), DepthAxis && DepthAxis.getShow());
                    } else if (comboCustom) {
                        chartProps.setDisplayAxes(item.checked, SecVertAxis && SecVertAxis.getShow(), VertAxis && VertAxis.getShow(), SecHorAxis && SecHorAxis.getShow(), DepthAxis && DepthAxis.getShow());
                    } else {
                        chartProps.setDisplayAxes(item.checked, SecHorAxis && SecHorAxis.getShow(), VertAxis && VertAxis.getShow(), SecVertAxis && SecVertAxis.getShow(), DepthAxis && DepthAxis.getShow());
                    }
                    break;                
                case 'bShowVertAxis':
                    if (hBarChart) {
                        chartProps.setDisplayAxes(item.checked, SecVertAxis && SecVertAxis.getShow(), HorAxis && HorAxis.getShow(), SecHorAxis && SecHorAxis.getShow(), DepthAxis && DepthAxis.getShow());
                    } else if (scatterChart) {
                        chartProps.setDisplayAxes(SecVertAxis && SecVertAxis.getShow(), SecHorAxis && SecHorAxis.getShow(), HorAxis && HorAxis.getShow(), item.checked, DepthAxis && DepthAxis.getShow());
                    } else if (comboCustom) {
                        chartProps.setDisplayAxes(HorAxis && HorAxis.getShow(), SecVertAxis && SecVertAxis.getShow(), item.checked, SecHorAxis && SecHorAxis.getShow(), DepthAxis && DepthAxis.getShow());
                    } else {
                        chartProps.setDisplayAxes(HorAxis && HorAxis.getShow(), SecHorAxis && SecHorAxis.getShow(), item.checked, SecVertAxis && SecVertAxis.getShow(), DepthAxis && DepthAxis.getShow());
                    }
                    break;
                case 'bShowHorAxSec':
                    if (comboCustom) {
                        chartProps.setDisplayAxes(HorAxis && HorAxis.getShow(), SecVertAxis && SecVertAxis.getShow(), VertAxis && VertAxis.getShow(), item.checked, DepthAxis && DepthAxis.getShow());
                    } else {
                        chartProps.setDisplayAxes(HorAxis && HorAxis.getShow(), item.checked, VertAxis && VertAxis.getShow(), SecVertAxis && SecVertAxis.getShow(), DepthAxis && DepthAxis.getShow());
                    }
                    break;          
                case 'bShowVertAxSec':
                    if (comboCustom) {
                        chartProps.setDisplayAxes(HorAxis && HorAxis.getShow(), item.checked, VertAxis && VertAxis.getShow(), SecHorAxis && SecHorAxis.getShow(), DepthAxis && DepthAxis.getShow());
                    } else {
                        chartProps.setDisplayAxes(HorAxis && HorAxis.getShow(), SecHorAxis && SecHorAxis.getShow(), VertAxis && VertAxis.getShow(), item.checked, DepthAxis && DepthAxis.getShow());
                    }
                    break; 
                case 'bShowDepthAxes':
                    chartProps.setDisplayAxes(HorAxis && HorAxis.getShow(), SecHorAxis && SecHorAxis.getShow(), VertAxis && VertAxis.getShow(), SecVertAxis && SecVertAxis.getShow(), item.checked);
                    break;
                case 'bShowHorAxTitle':
                    if (hBarChart) {
                        chartProps.setDisplayAxisTitles((VertAxis && VertAxis.getLabel() === 1), (SecVertAxis && SecVertAxis.getLabel() === 1), item.checked,  (SecHorAxis && SecHorAxis.getLabel() === 1), (DepthAxis && DepthAxis.getLabel() === 1));
                    } else if (scatterChart) {
                        chartProps.setDisplayAxisTitles((SecHorAxis && SecHorAxis.getLabel() === 1), (SecVertAxis && SecVertAxis.getLabel() === 1), item.checked, (VertAxis && VertAxis.getLabel() === 1), (DepthAxis && DepthAxis.getLabel() === 1));
                    } else if (comboCustom) {
                        chartProps.setDisplayAxisTitles(item.checked, (SecVertAxis && SecVertAxis.getLabel() === 1), (VertAxis && VertAxis.getLabel() === 1), (SecHorAxis && SecHorAxis.getLabel() === 1), (DepthAxis && DepthAxis.getLabel() === 1));
                    } else {
                        chartProps.setDisplayAxisTitles(item.checked, (SecHorAxis && SecHorAxis.getLabel() === 1), (VertAxis && VertAxis.getLabel() === 1), (SecVertAxis && SecVertAxis.getLabel() === 1), (DepthAxis && DepthAxis.getLabel() === 1));
                    }
                    break;
                case 'bShowVertAxTitle':
                    if (hBarChart) {
                        chartProps.setDisplayAxisTitles(item.checked, (SecVertAxis && SecVertAxis.getLabel() === 1), (HorAxis && HorAxis.getLabel() === 1), (SecHorAxis && SecHorAxis.getLabel() === 1), (DepthAxis && DepthAxis.getLabel() === 1));
                    } else if (scatterChart) {
                        chartProps.setDisplayAxisTitles((SecHorAxis && SecHorAxis.getLabel() === 1), (SecVertAxis && SecVertAxis.getLabel() === 1), (HorAxis && HorAxis.getLabel() === 1), item.checked, (DepthAxis && DepthAxis.getLabel() === 1));
                    } else if (comboCustom) {
                        chartProps.setDisplayAxisTitles((HorAxis && HorAxis.getLabel() === 1), (SecVertAxis && SecVertAxis.getLabel() === 1), item.checked, (SecHorAxis && SecHorAxis.getLabel() === 1), (DepthAxis && DepthAxis.getLabel() === 1));
                    } else {
                        chartProps.setDisplayAxisTitles((HorAxis && HorAxis.getLabel() === 1), (SecHorAxis && SecHorAxis.getLabel() === 1), item.checked, (SecVertAxis && SecVertAxis.getLabel() === 1), (DepthAxis && DepthAxis.getLabel() === 1));
                    }
                    break;
                case 'bShowHorAxTitleSec':
                    if (comboCustom) {
                        chartProps.setDisplayAxisTitles((HorAxis && HorAxis.getLabel() === 1), (SecVertAxis && SecVertAxis.getLabel() === 1), (VertAxis && VertAxis.getLabel() === 1), item.checked, (DepthAxis && DepthAxis.getLabel() === 1));
                    } else {
                        chartProps.setDisplayAxisTitles((HorAxis && HorAxis.getLabel() === 1), item.checked, (VertAxis && VertAxis.getLabel() === 1), (SecVertAxis && SecVertAxis.getLabel() === 1), (DepthAxis && DepthAxis.getLabel() === 1));
                    }
                    break;
                case 'bShowVertAxisTitleSec':
                    if (comboCustom) {
                        chartProps.setDisplayAxisTitles((HorAxis && HorAxis.getLabel() === 1), item.checked, (VertAxis && VertAxis.getLabel() === 1), (SecHorAxis && SecHorAxis.getLabel() === 1), (DepthAxis && DepthAxis.getLabel() === 1));
                    } else { 
                        chartProps.setDisplayAxisTitles((HorAxis && HorAxis.getLabel() === 1), (SecHorAxis && SecHorAxis.getLabel() === 1), (VertAxis && VertAxis.getLabel() === 1), item.checked, (DepthAxis && DepthAxis.getLabel() === 1));
                    }
                    break;
                case 'bShowDepthAxisTitle':
                    chartProps.setDisplayAxes((HorAxis && HorAxis.getLabel() === 1), (SecHorAxis && SecHorAxis.getLabel() === 1), (VertAxis && VertAxis.getLabel() === 1), (SecVertAxis && SecVertAxis.getLabel() === 1), item.checked);
                    break;
                case 'bShowChartTitleNone':
                    chartProps.setDisplayChartTitle(false, false); 
                    break;
                case 'bShowChartTitle':
                    chartProps.setDisplayChartTitle(true, false); 
                    break;
                case 'bOverlayTitle':
                    chartProps.setDisplayChartTitle(true, true); 
                    break;    
                case 'CenterData':
                    chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.ctr); 
                    break;
                case 'InnerBottomData':
                    chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.inBase); 
                    break;
                case 'InnerTopData':
                    chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.inEnd); 
                    break;            
                case 'OuterTopData':
                    chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.outEnd); 
                    break;
                case 'TopData':
                    chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.t); 
                    break;
                case 'LeftData':
                    chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.l); 
                    break;
                case 'RightData':
                    chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.r); 
                    break;
                case 'BottomData':
                    chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.b); 
                    break; 
                case 'FitWidthData':
                    chartProps.setDisplayDataLabels(true, Asc.c_oAscChartDataLabelsPos.bestFit); 
                    break;        
                case 'bShowDataLabels':
                    chartProps.setDisplayDataLabels(false, false);
                    break;
                // case 'bShowDataNone':
                //     chartProps.setDisplayDataTable(false, false);
                //     break;
                // case 'bShowDataTable':
                //     chartProps.setDisplayDataTable(true, false);
                //     break;
                // case 'bShowLegendKeys':
                //     chartProps.setDisplayDataTable(true, true);
                //     break;
                case 'standardError':
                    chartProps.setDisplayErrorBars(true, 4);
                    break;
                case 'percentage':
                    chartProps.setDisplayErrorBars(true, 2);
                    break;
                case 'standardDeviation':
                    chartProps.setDisplayErrorBars(true, 3);
                    break;       
               case 'bShowHorMajor':
                    if (hBarChart) {
                        chartProps.setDisplayGridlines(HorMajorGridlines, item.checked, HorMinorGridlines, VertMinorGridlines);
                    } else 
                       chartProps.setDisplayGridlines(item.checked, HorMajorGridlines, VertMinorGridlines, HorMinorGridlines);
                    break;
                case 'bShowVerMajor':
                    if (hBarChart || RadarChart) {
                        chartProps.setDisplayGridlines(item.checked, VertMajorGridlines, HorMinorGridlines, VertMinorGridlines);
                    } else 
                        chartProps.setDisplayGridlines(VertMajorGridlines, item.checked, VertMinorGridlines, HorMinorGridlines);
                    break;
                case 'bShowHorMinor':
                    if (hBarChart) {
                        chartProps.setDisplayGridlines(HorMajorGridlines, VertMajorGridlines, HorMinorGridlines, item.checked);
                    } else 
                        chartProps.setDisplayGridlines(VertMajorGridlines, HorMajorGridlines, item.checked, HorMinorGridlines);
                    break; 
                case 'bShowVerMinor':
                    if (hBarChart || RadarChart) {
                        chartProps.setDisplayGridlines(HorMajorGridlines, VertMajorGridlines, item.checked, VertMinorGridlines);
                    }else 
                        chartProps.setDisplayGridlines(VertMajorGridlines, HorMajorGridlines, VertMinorGridlines, item.checked);
                    break;
                case 'NoneLegend':
                        chartProps.setDisplayLegend(false, Asc.c_oAscChartLegendShowSettings.none);
                    break;
                case 'LeftLegend':
                        chartProps.setDisplayLegend(true, Asc.c_oAscChartLegendShowSettings.left);
                    break;
                case 'TopLegend':
                        chartProps.setDisplayLegend(true, Asc.c_oAscChartLegendShowSettings.top);
                    break;
                case 'RightLegend':
                        chartProps.setDisplayLegend(true, Asc.c_oAscChartLegendShowSettings.right);
                    break;
                case 'BottomLegend':
                        chartProps.setDisplayLegend(true, Asc.c_oAscChartLegendShowSettings.bottom);
                    break;
                case 'LeftOverlay':
                        chartProps.setDisplayLegend(true, Asc.c_oAscChartLegendShowSettings.leftOverlay);
                    break;
                case 'RightOverlay':
                        chartProps.setDisplayLegend(true, Asc.c_oAscChartLegendShowSettings.rightOverlay);
                    break;
                case 'trendLineNone':
                    chartProps.setDisplayTrendlines(false, false, 0, 0);
                    break;
                case 'trendLineLinear':
                    chartProps.setDisplayTrendlines(true, 1, 0, 0);
                    break;
                case 'trendLineExponential':
                    chartProps.setDisplayTrendlines(true, 0, 0, 0);
                    break;
                case 'trendLineForecast':
                    chartProps.setDisplayTrendlines(true, 1, 2, 0);
                    break;
                case 'trendLineMovingAverage':
                    chartProps.setDisplayTrendlines(true, 3, 0, 0);
                    break;
                case 'bShowUpDownBars':
                    chartProps.setDisplayUpDownBars(true);
                    break;
                case 'bShowUpDownNone':
                    chartProps.setDisplayUpDownBars(false);
                    break;
            }
        };

        dh.updateChartElementMenu = function(menu, chartProps) {
            const type = chartProps.getType(),
                horAxes = chartProps.getHorAxesProps && chartProps.getHorAxesProps(),
                vertAxes = chartProps.getVertAxesProps && chartProps.getVertAxesProps(),
                depthAxes = chartProps.getDepthAxesProps && chartProps.getDepthAxesProps(),
                dataLabelsPos = chartProps.getDataLabelsPos && chartProps.getDataLabelsPos(),
                title = chartProps.getTitle && chartProps.getTitle(),
                legendPos = chartProps.getLegendPos && chartProps.getLegendPos(),
                GridMajor = Asc.c_oAscGridLinesSettings.major,
                GridMinor = Asc.c_oAscGridLinesSettings.minor,
                GridMajorMinor = Asc.c_oAscGridLinesSettings.majorMinor,
                ComboChart = [_set.comboCustom, _set.comboBarLine,_set.comboBarLineSecondary,_set.comboAreaBar].includes(type),
                RadarChart = [_set.radar, _set.radarMarker, _set.radarFilled].includes(type),
                LabelGroup1Types = [_set.barNormal, _set.barStacked, _set.barStackedPer, _set.hBarNormal, _set.hBarStacked, _set.hBarStackedPer],
                LabelGroup2Types = [_set.barNormal, _set.barStacked, _set.barStackedPer, _set.pie, _set.pie3d, _set.hBarNormal, _set.hBarStacked, _set.hBarStackedPer],
                LabelGroup3Types = [_set.barNormal, _set.pie, _set.pie3d, _set.hBarNormal],
                LabelGroup4Types = [_set.lineNormal, _set.lineStacked, _set.lineStackedPer, _set.lineNormalMarker, _set.lineStackedMarker, _set.lineStackedPerMarker, _set.stock, _set.scatter, _set.scatterLine, _set.scatterLineMarker, _set.scatterSmooth, _set.scatterSmoothMarker],
                LabelGroup5Types = [_set.pie, _set.pie3d],   
                comboType = ComboChart ? (chartProps.getSeries && chartProps.getSeries()[0] && chartProps.getSeries()[0].asc_getChartType()) : type,
                LabelGroup1 = LabelGroup1Types.includes(comboType),
                LabelGroup2 = LabelGroup2Types.includes(comboType),
                LabelGroup3 = LabelGroup3Types.includes(comboType),
                LabelGroup4 = LabelGroup4Types.includes(comboType),
                LabelGroup5 = LabelGroup5Types.includes(comboType);

            const axesMenu = menu.items[0].menu;
            axesMenu.items[0].setVisible(!RadarChart);
            axesMenu.items[0].setChecked(!RadarChart && horAxes && horAxes[0] && horAxes[0].getShow());
            axesMenu.items[1].setChecked(vertAxes && vertAxes[0] && vertAxes[0].getShow());
            axesMenu.items[4].setVisible(depthAxes && depthAxes[0]);
            axesMenu.items[4].setChecked(depthAxes && depthAxes[0] && depthAxes[0].getShow());
            if (ComboChart) {
                axesMenu.items[2].setVisible(horAxes && horAxes[1]);
                axesMenu.items[2].setChecked(horAxes && horAxes[1] && horAxes[1].getShow());
                axesMenu.items[3].setVisible(vertAxes && vertAxes[1]);
                axesMenu.items[3].setChecked(vertAxes && vertAxes[1] && vertAxes[1].getShow());
            } else {
                axesMenu.items[2].setVisible(false);
                axesMenu.items[3].setVisible(false);
            }

            const titlesMenu = menu.items[1].menu;
            titlesMenu.items[0].setChecked(horAxes && horAxes[0] && horAxes[0].getLabel() === Asc.c_oAscChartHorAxisLabelShowSettings.noOverlay);
            titlesMenu.items[1].setChecked(vertAxes && vertAxes[0] && vertAxes[0].getLabel() === Asc.c_oAscChartVertAxisLabelShowSettings.rotated);
            titlesMenu.items[4].setVisible(depthAxes && depthAxes[0]);
            titlesMenu.items[4].setChecked(depthAxes && depthAxes[0] && depthAxes[0].getLabel() === Asc.c_oAscChartVertAxisLabelShowSettings.rotated);
            if (ComboChart) {
                titlesMenu.items[2].setVisible(horAxes && horAxes[1]);
                titlesMenu.items[2].setChecked(horAxes && horAxes[1] && horAxes[1].getLabel() === Asc.c_oAscChartHorAxisLabelShowSettings.noOverlay);
                titlesMenu.items[3].setVisible(vertAxes && vertAxes[1]);
                titlesMenu.items[3].setChecked(vertAxes && vertAxes[1] && vertAxes[1].getLabel() === Asc.c_oAscChartVertAxisLabelShowSettings.rotated);
            } else {
                titlesMenu.items[2].setVisible(false);
                titlesMenu.items[3].setVisible(false);
            }
            
            const titleMenu = menu.items[2].menu;
            titleMenu.items[0].setChecked(title === Asc.c_oAscChartTitleShowSettings.none);
            titleMenu.items[1].setChecked(title === Asc.c_oAscChartTitleShowSettings.noOverlay);
            titleMenu.items[2].setChecked(title === Asc.c_oAscChartTitleShowSettings.overlay);

            const labelsMenu = menu.items[3].menu;
            labelsMenu.items[0].setChecked(dataLabelsPos === Asc.c_oAscChartDataLabelsPos.none);
            labelsMenu.items[1].setChecked(dataLabelsPos === Asc.c_oAscChartDataLabelsPos.ctr);
            labelsMenu.items[2].setChecked(LabelGroup1 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.inBase);
            labelsMenu.items[3].setChecked(LabelGroup2 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.inEnd);
            labelsMenu.items[4].setChecked(LabelGroup3 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.outEnd);
            labelsMenu.items[5].setChecked(LabelGroup4 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.t);
            labelsMenu.items[6].setChecked(LabelGroup4 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.l);
            labelsMenu.items[7].setChecked(LabelGroup4 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.r);
            labelsMenu.items[8].setChecked(LabelGroup4 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.b);
            labelsMenu.items[9].setChecked(LabelGroup5 && dataLabelsPos === Asc.c_oAscChartDataLabelsPos.bestFit);
            if (dataLabelsPos !== undefined) {
                labelsMenu.items[2].setVisible(LabelGroup1);
                labelsMenu.items[3].setVisible(LabelGroup2);
                labelsMenu.items[4].setVisible(LabelGroup3);
                labelsMenu.items[5].setVisible(LabelGroup4);
                labelsMenu.items[6].setVisible(LabelGroup4);
                labelsMenu.items[7].setVisible(LabelGroup4);
                labelsMenu.items[8].setVisible(LabelGroup4);
                labelsMenu.items[9].setVisible(LabelGroup5);
            }
            
            // const tableMenu = menu.items[4].menu;
            // highlightSubmenuItem(tableMenu.items[0], false, 'table');
            // highlightSubmenuItem(tableMenu.items[1], false, 'table');
            // highlightSubmenuItem(tableMenu.items[2], false,'table');

            const gridMenu = menu.items[5].menu;
            gridMenu.items[0].setVisible(true);
            gridMenu.items[2].setVisible(true);
            if (RadarChart) {
                gridMenu.items[0].setVisible(false);
                gridMenu.items[0].setChecked(false);
                gridMenu.items[1].setChecked(vertAxes && vertAxes[0] && (vertAxes[0].getGridlines() === GridMajor || vertAxes[0].getGridlines() === GridMajorMinor));
                gridMenu.items[2].setChecked(false);
                gridMenu.items[2].setVisible(false);
                gridMenu.items[3].setChecked(vertAxes && vertAxes[0] && (vertAxes[0].getGridlines() === GridMinor || vertAxes[0].getGridlines() === GridMajorMinor));
            } else if (type !== Asc.c_oAscChartTypeSettings.pie && type !== Asc.c_oAscChartTypeSettings.pie3d) {
                gridMenu.items[0].setChecked(vertAxes && vertAxes[0] && (vertAxes[0].getGridlines() === GridMajor || vertAxes[0].getGridlines() === GridMajorMinor));
                gridMenu.items[1].setChecked(horAxes && horAxes[0] && (horAxes[0].getGridlines() === GridMajor || horAxes[0].getGridlines() === GridMajorMinor));
                gridMenu.items[2].setChecked(vertAxes && vertAxes[0] && (vertAxes[0].getGridlines() === GridMinor || vertAxes[0].getGridlines() === GridMajorMinor));
                gridMenu.items[3].setChecked(horAxes && horAxes[0] && (horAxes[0].getGridlines() === GridMinor || horAxes[0].getGridlines() === GridMajorMinor));
            }
            
            const legendMenu = menu.items[6].menu;
            legendMenu.items[0].setChecked(legendPos === Asc.c_oAscChartLegendShowSettings.top);
            legendMenu.items[1].setChecked(legendPos === Asc.c_oAscChartLegendShowSettings.left);
            legendMenu.items[2].setChecked(legendPos === Asc.c_oAscChartLegendShowSettings.right);
            legendMenu.items[3].setChecked(legendPos === Asc.c_oAscChartLegendShowSettings.bottom);
            legendMenu.items[4].setChecked(legendPos === Asc.c_oAscChartLegendShowSettings.leftOverlay);
            legendMenu.items[5].setChecked(legendPos === Asc.c_oAscChartLegendShowSettings.rightOverlay);

            const supportedElements = chartElementMap[type] || [];
            menu.items.forEach(function(item) {
                item.setVisible(supportedElements.includes(item.value));
            });
        };

        dh.onSingleChartSelectionChanged = function(asc_CRect) {
            if (this.permissions && !this.permissions.isEdit) return;

            var me = this,
                documentHolderView = me.documentHolder,
                chartContainer = documentHolderView.cmpEl.find('#chart-element-container');
            
            me.getCurrentChartProps = function() {
                var selectedObjects = me.api.asc_getGraphicObjectProps();
                for (var i = 0; i < selectedObjects.length; i++) {
                    if (selectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                        var elValue = selectedObjects[i].asc_getObjectValue();
                        if (elValue.asc_getChartProperties()) {
                            return elValue.asc_getChartProperties();
                        }
                    }
                }
                return null;
            };
        
            me.chartProps = me.getCurrentChartProps();
        
            if (chartContainer.length < 1) {
                chartContainer = $('<div id="chart-element-container" style="position: absolute; z-index: 990;"><div id="id-document-holder-btn-chart-element"></div></div>');
                documentHolderView.cmpEl.find('#ws-canvas-outer').append(chartContainer);
            }

            me.isRtl = me.api ? Common.UI.isRTL() : false;
            me.isRtlSheet = me.api.asc_getSheetViewSettings().asc_getRightToLeft();

            if (me.chartProps) {
                
                if (!me.btnChartElement) {
                    me.btnChartElement = new Common.UI.Button({
                        parentEl: $('#id-document-holder-btn-chart-element'),
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-chart-elements',
                        hint: me.documentHolder.btnChart,
                        menu: me.documentHolder.menuChartElement.menu
                    });
        
                    me.btnChartElement.on('click', function() {
                        me.chartProps = me.getCurrentChartProps();
                        if (me.chartProps) {
                            me.updateChartElementMenu(me.documentHolder.menuChartElement.menu, me.chartProps);
                        }
                        Common.UI.TooltipManager.closeTip('chartElements');
                    });
                }

                me.tooltips.coauth.XY = undefined
                me.onDocumentResize();
                var x = asc_CRect.asc_getX(),
                    y = asc_CRect.asc_getY(),
                    width = asc_CRect.asc_getWidth(),
                    height = asc_CRect.asc_getHeight(),
                    btnLeft,
                    btnTop = y,
                    btnWidth = 50,
                    offsetLeft = chartContainer.width() === 40 ? 18 : 10, 
                    leftSide = x - btnWidth - offsetLeft,
                    rightSide = x + width + 7,
                    rtlSheet = x + width - 45; 

                if (me.isRtlSheet) {
                    if (rtlSheet >= 0 && rtlSheet + btnWidth <= me.tooltips.coauth.apiWidth) {
                        btnLeft = rtlSheet;
                    } else if (leftSide >= 0) {
                        btnLeft = leftSide - 32; 
                    } else {
                        chartContainer.hide();
                        Common.UI.TooltipManager.closeTip('chartElements');
                        return;
                    }
                } else if (me.isRtl) {
                    if (leftSide >= 0) {
                        btnLeft = leftSide + 18;
                    } else if (rightSide + btnWidth <= me.tooltips.coauth.apiWidth) {
                        btnLeft = rightSide; 
                    } else {
                        chartContainer.hide();
                        Common.UI.TooltipManager.closeTip('chartElements');
                        return;
                    }
                } else {
                    if (rightSide + btnWidth <= me.tooltips.coauth.apiWidth + 5) {
                        btnLeft = rightSide;
                    } else if (leftSide >= 0) {
                        btnLeft = leftSide + 18; 
                    } else {
                        chartContainer.hide();
                        Common.UI.TooltipManager.closeTip('chartElements');
                        return;
                    }
                }

                if (btnTop < 20) btnTop = 20;

                if (y < 0) {
                    var chartBottom = y + height;
                    if (chartBottom < 40) { 
                        chartContainer.hide();
                        Common.UI.TooltipManager.closeTip('chartElements');
                        return;
                    }
                }

                chartContainer.css({
                    left: btnLeft + 'px',
                    top: btnTop + 'px'
                }).show();
                setTimeout(function (){
                    Common.UI.TooltipManager.showTip('chartElements');
                    Common.UI.TooltipManager.applyPlacement('chartElements');
                }, 100);
        
                me.disableChartElementButton();
            } else {
                chartContainer.hide();
                Common.UI.TooltipManager.closeTip('chartElements');
            }
        };

        dh.onShowSpecialPasteOptions = function(specialPasteShowOptions) {
            if (this.permissions && !this.permissions.isEdit) return;

            var me                  = this,
                documentHolderView  = me.documentHolder,
                coord  = specialPasteShowOptions.asc_getCellCoord(),
                pasteContainer = documentHolderView.cmpEl.find('#special-paste-container'),
                pasteItems = specialPasteShowOptions.asc_getOptions(),
                isTable = !!specialPasteShowOptions.asc_getContainTables();
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
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.pasteOnlyValues] = [me.txtPasteValues, 1];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.valueNumberFormat] = [me.txtPasteValNumFormat, 1];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.valueAllFormating] = [me.txtPasteValFormat, 1];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.pasteOnlyFormating] = [me.txtPasteFormat, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.link] = [me.txtPasteLink, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.transpose] = [me.txtPasteTranspose, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.picture] = [me.txtPastePicture, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.linkedPicture] = [me.txtPasteLinkPicture, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceformatting] = [me.txtPasteSourceFormat, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormatting] = [me.txtPasteDestFormat, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = [me.txtKeepTextOnly, 2];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.useTextImport] = [me.txtUseTextImport, 3];

                pasteContainer = $('<div id="special-paste-container" style="position: absolute;"><div id="id-document-holder-btn-special-paste"></div></div>');
                documentHolderView.cmpEl.find('#ws-canvas-outer').append(pasteContainer);

                me.btnSpecialPaste = new Common.UI.Button({
                    parentEl: $('#id-document-holder-btn-special-paste'),
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-paste',
                    caption     : Common.Utils.String.format('({0})', Common.Utils.String.textCtrl),
                    menu        : new Common.UI.Menu({items: []})
                });
                me.initSpecialPasteEvents();
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

                var importText, pasteItem;
            
                _.each(pasteItems, function(menuItem, index) {
                    if (me._arrSpecialPaste[menuItem]) {
                        var mnu = new Common.UI.MenuItem({
                            caption: me._arrSpecialPaste[menuItem][0] + (me.hkSpecPaste[menuItem] ? ' (' + me.hkSpecPaste[menuItem] + ')' : ''),
                            value: menuItem,
                            checkable: true,
                            toggleGroup: 'specialPasteGroup'
                        }).on('click', _.bind(me.onSpecialPasteItemClick, me));
                
                        if (menuItem == Asc.c_oSpecialPasteProps.paste) {
                            pasteItem = mnu;
                        } else if (menuItem == Asc.c_oSpecialPasteProps.useTextImport) {
                            importText = mnu;
                        } else {
                            groups[me._arrSpecialPaste[menuItem][1]].push(mnu);
                        }
                
                        me._arrSpecialPaste[menuItem][2] = mnu;
                    }
                });
                var groupTitles = [me.txtFormula, me.txtValue, me.txtOther];
                
                if (pasteItem) {
                    menu.addItem(pasteItem);
                }

                for (var i = 0; i < 3; i++) {
                    if (groups[i].length > 0) {
                        if (menu.items.length > 0) {
                            menu.addItem(new Common.UI.MenuItem({ caption: '--' }));
                        }
                        menu.addItem(new Common.UI.MenuItem({
                            header: groupTitles[i],
                            disabled: true,
                            cls: 'menu-header'
                        }));
                        _.each(groups[i], function (menuItem, index) {
                            menu.addItem(menuItem);
                        });
                    }
                }
                (menu.items.length>0) && menu.items[0].setChecked(true, true);
                me._state.lastSpecPasteChecked = (menu.items.length>0) ? menu.items[0] : null;

                if (importText) {
                    menu.addItem(new Common.UI.MenuItem({ caption: '--' }));
                    menu.addItem(importText);
                }
                if (menu.items.length>0 && specialPasteShowOptions.asc_getShowPasteSpecial()) {
                    menu.addItem(new Common.UI.MenuItem({ caption: '--' }));
                    var mnu = new Common.UI.MenuItem({
                        caption: me.textPasteSpecial,
                        value: 'special'
                    }).on('click', function(item, e) {
                        (new SSE.Views.SpecialPasteDialog({
                            props: pasteItems,
                            isTable: isTable,
                            handler: function (result, settings) {
                                if (result == 'ok') {
                                    me._state.lastSpecPasteChecked && me._state.lastSpecPasteChecked.setChecked(false, true);
                                    me._state.lastSpecPasteChecked = settings && me._arrSpecialPaste[settings.asc_getProps()] ? me._arrSpecialPaste[settings.asc_getProps()][2] : null;
                                    me._state.lastSpecPasteChecked && me._state.lastSpecPasteChecked.setChecked(true, true);
                                    if (me && me.api) {
                                        me.api.asc_SpecialPaste(settings);
                                    }
                                }
                            }
                        })).show();
                        setTimeout(function(){menu.hide();}, 100);
                    });
                    menu.addItem(mnu);
                }
            }

            // if ( coord[0].asc_getX()<0 || coord[0].asc_getY()<0) {
            //     if (pasteContainer.is(':visible')) pasteContainer.hide();
            //     $(document).off('keyup', this.wrapEvents.onKeyUp);
            //     return;
            // }

            var rightBottom = coord[0],
                leftTop = coord[1],
                width = me.tooltips.coauth.bodyWidth - me.tooltips.coauth.XY[0] - me.tooltips.coauth.rightMenuWidth - 15,
                height = me.tooltips.coauth.apiHeight - 15, // height - scrollbar height
                showPoint = [],
                showAtBottom = false;

            var controller = this.getApplication().getController('Common.Controllers.Comments');
            if (controller) {
                var comments = this.api.asc_getCellInfo().asc_getComments();
                showAtBottom = comments && comments.length>0 && controller.getPopover().isVisible() && controller.findPopupComment(controller.findComment(comments[0].asc_getId()).get('id'));
            }

            pasteContainer.css({left: -10000, top : -10000});
            pasteContainer.show();

            var isRtlSheet = !!this.api.asc_getSheetViewSettings().asc_getRightToLeft(),
                btnSize = me.btnSpecialPaste.cmpEl ? [me.btnSpecialPaste.cmpEl.width(), me.btnSpecialPaste.cmpEl.height()] : [70, 20],
                bottom = rightBottom.asc_getY() + rightBottom.asc_getHeight() + 3 + btnSize[1];

            if (isRtlSheet) {
                var left = rightBottom.asc_getX() - 3 - btnSize[0];
                if (left<0 || showAtBottom) {
                    showPoint[0] = (leftTop!==undefined) ? leftTop.asc_getX() + leftTop.asc_getWidth() - btnSize[0] : 0;
                    if (bottom > height)
                        showPoint[0] += (btnSize[0]+3);
                    if (showPoint[0]<0 || showPoint[0] + btnSize[0] > width) showPoint[0] = 0;
                } else
                    showPoint[0] = left;
            } else {
                var right = rightBottom.asc_getX() + rightBottom.asc_getWidth() + 3 + btnSize[0];
                if (right > width || showAtBottom) {
                    showPoint[0] = (leftTop!==undefined) ? leftTop.asc_getX() : (width - btnSize[0] - 3); // leftTop is undefined when paste to text box
                    if (bottom > height)
                        showPoint[0] -= (btnSize[0]+3);
                    if (showPoint[0]<0 || showPoint[0] + btnSize[0] > width) showPoint[0] = width - 3 - btnSize[0];
                } else
                    showPoint[0] = right - btnSize[0];
            }

            showPoint[1] = (bottom > height) ? height - 3 - btnSize[1] : bottom - btnSize[1];

            pasteContainer.css({left: showPoint[0], top : showPoint[1]});
            setTimeout(function() {
                $(document).on('keyup', me.wrapEvents.onKeyUp);
            }, 10);
            this.disableSpecialPaste();
        };

        dh.onSpecialPasteItemClick = function(item, e) {
            var me = this,
                menu = this.btnSpecialPaste.menu;
            if (item.value == Asc.c_oSpecialPasteProps.useTextImport) {
                (new Common.Views.OpenDialog({
                    title: me.txtImportWizard,
                    closable: true,
                    type: Common.Utils.importTextType.Paste,
                    preview: true,
                    api: me.api,
                    handler: function (result, settings) {
                        if (result == 'ok') {
                            if (me && me.api) {
                                var props = new Asc.SpecialPasteProps();
                                props.asc_setProps(Asc.c_oSpecialPasteProps.useTextImport);
                                props.asc_setAdvancedOptions(settings.textOptions);
                                me.api.asc_SpecialPaste(props);
                            }
                            me._state.lastSpecPasteChecked = item;
                        } else if (item.cmpEl) {
                            item.setChecked(false, true);
                            me._state.lastSpecPasteChecked && me._state.lastSpecPasteChecked.setChecked(true, true);
                        }
                    }
                })).show();
                setTimeout(function(){menu.hide();}, 100);
            } else {
                me._state.lastSpecPasteChecked = item;
                var props = new Asc.SpecialPasteProps();
                props.asc_setProps(item.value);
                me.api.asc_SpecialPaste(props);
                setTimeout(function(){menu.hide();}, 100);
            }
            if (!item.cmpEl && me._state.lastSpecPasteChecked) {
                for (var i = 0; i < menu.items.length; i++) {
                    menu.items[i].setChecked(menu.items[i].value===me._state.lastSpecPasteChecked.value, true);
                    if (menu.items[i].value===me._state.lastSpecPasteChecked.value)
                        me._state.lastSpecPasteChecked = menu.items[i];
                }
            }
            return false;
        };

        dh.initSpecialPasteEvents = function() {
            var me = this;
            me.hkSpecPaste = [];
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.paste] = 'P';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.pasteOnlyFormula] = 'F';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.formulaNumberFormat] = 'O';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.formulaAllFormatting] = 'K';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.formulaWithoutBorders] = 'B';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.formulaColumnWidth] = 'W';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.mergeConditionalFormating] = 'G';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.transpose] = 'T';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.pasteOnlyValues] = 'V';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.valueNumberFormat] = 'A';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.valueAllFormating] = 'E';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.pasteOnlyFormating] = 'R';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.link] = 'N';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.picture] = 'U';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.linkedPicture] = 'I';

            me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceformatting] = 'K';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.destinationFormatting] = 'M';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = 'T';
            // me.hkSpecPaste[Asc.c_oSpecialPasteProps.useTextImport] = '';

            var str = '';
            for(var key in me.hkSpecPaste){
                if(me.hkSpecPaste.hasOwnProperty(key)){
                    if (str.indexOf(me.hkSpecPaste[key])<0)
                        str += me.hkSpecPaste[key] + ',';
                }
            }
            str = str.substring(0, str.length-1)
            var keymap = {};
            keymap[str] = _.bind(function(e) {
                var menu = this.btnSpecialPaste.menu;
                for (var i = 0; i < menu.items.length; i++) {
                    if (this.hkSpecPaste[menu.items[i].value] === String.fromCharCode(e.keyCode)) {
                        return me.onSpecialPasteItemClick({value: menu.items[i].value});
                    }
                }
            }, me);
            Common.util.Shortcuts.delegateShortcuts({shortcuts:keymap});
            Common.util.Shortcuts.suspendEvents(str, undefined, true);

            var pasteContainer = me.documentHolder.cmpEl.find('#special-paste-container');
            me.btnSpecialPaste.menu.on('show:after', function(menu) {
                Common.util.Shortcuts.resumeEvents(str);
                pasteContainer.addClass('has-open-menu');
            }).on('hide:after', function(menu) {
                Common.util.Shortcuts.suspendEvents(str, undefined, true);
                pasteContainer.removeClass('has-open-menu');
            });
        };

        dh.onToggleAutoCorrectOptions = function(autoCorrectOptions) {
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
                me._arrAutoCorrectPaste[Asc.c_oAscAutoCorrectOptions.UndoTableAutoExpansion] = {caption: me.txtUndoExpansion, icon: 'menu__icon btn-undo icon-rtl'};
                me._arrAutoCorrectPaste[Asc.c_oAscAutoCorrectOptions.RedoTableAutoExpansion] = {caption: me.txtRedoExpansion, icon: 'menu__icon btn-redo icon-rtl'};

                pasteContainer = $('<div id="autocorrect-paste-container" style="position: absolute;"><div id="id-document-holder-btn-autocorrect-paste"></div></div>');
                documentHolderView.cmpEl.append(pasteContainer);

                me.btnAutoCorrectPaste = new Common.UI.Button({
                    parentEl: $('#id-document-holder-btn-autocorrect-paste'),
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-autocorrect',
                    menu        : new Common.UI.Menu({cls: 'shifted-right', items: []})
                });
                me.btnAutoCorrectPaste.menu.on('show:after', _.bind(me.onAutoCorrectOpenAfter, me));
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
                        caption: me._arrAutoCorrectPaste[menuItem].caption,
                        value: menuItem,
                        iconCls: me._arrAutoCorrectPaste[menuItem].icon
                    }).on('click', function(item, e) {
                        me.api.asc_applyAutoCorrectOptions(item.value);
                        setTimeout(function(){menu.hide();}, 100);
                    });
                    menu.addItem(mnu);
                });
                me.mnuAutoCorrectStop = new Common.UI.MenuItem({
                    caption: me.textStopExpand,
                    checkable: true,
                    allowDepress: true,
                    checked: !Common.Utils.InternalSettings.get("sse-settings-autoformat-new-rows")
                }).on('click', function(item){
                    Common.localStorage.setBool("sse-settings-autoformat-new-rows", !item.checked);
                    Common.Utils.InternalSettings.set("sse-settings-autoformat-new-rows", !item.checked);
                    me.api.asc_setIncludeNewRowColTable(!item.checked);
                    setTimeout(function(){menu.hide();}, 100);
                });
                menu.addItem(me.mnuAutoCorrectStop);
                menu.addItem({caption: '--'});
                var mnu = new Common.UI.MenuItem({
                    caption: me.textAutoCorrectSettings
                }).on('click', _.bind(me.onAutoCorrectOptions, me));
                menu.addItem(mnu);
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
        };

        dh.onCellsRange = function(status) {
            this.rangeSelectionMode = (status != Asc.c_oAscSelectionDialogType.None);
        };

        dh.onApiEditCell = function(state) {
            this.isEditFormula = (state == Asc.c_oAscCellEditorState.editFormula);
            this.isEditCell = (state != Asc.c_oAscCellEditorState.editEnd);
        };

        dh.onChangeCropState = function(state) {
            this.documentHolder.menuImgCrop && this.documentHolder.menuImgCrop.menu.items[0].setChecked(state, true);
        };

        dh.equationCallback = function(eqObj) {
            eqObj && this.api.asc_SetMathProps(eqObj);
            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        };

        dh.onTextInShapeAfterRender = function(cmp) {
            var view = this.documentHolder,
                _conf = view.paraBulletsPicker.conf;
            view.paraBulletsPicker = new Common.UI.DataView({
                el          : $('#id-docholder-menu-bullets'),
                parentMenu  : view.menuParagraphBullets.menu,
                outerMenu:  {menu: view.menuParagraphBullets.menu, index: 0},
                groups      : view.paraBulletsPicker.groups,
                store       : view.paraBulletsPicker.store,
                delayRenderTips: true,
                itemTemplate: _.template('<% if (type==0) { %>' +
                    '<div id="<%= id %>" class="item-markerlist"></div>' +
                    '<% } else if (type==1) { %>' +
                    '<div id="<%= id %>" class="item-multilevellist"></div>' +
                    '<% } %>')
            });
            view.paraBulletsPicker.on('item:click', _.bind(this.onSelectBullets, this));
            view.menuParagraphBullets.menu.setInnerMenu([{menu: view.paraBulletsPicker, index: 0}]);
            _conf && view.paraBulletsPicker.selectRecord(_conf.rec, true);
        };

        dh.onBulletMenuShowAfter = function() {
            var store = this.documentHolder.paraBulletsPicker.store;
            var arrNum = [], arrMarker = [];
            store.each(function(item){
                (item.get('group')==='menu-list-bullet-group' ? arrMarker : arrNum).push({
                    numberingInfo: {bullet: item.get('numberingInfo')==='undefined' ? undefined : JSON.parse(item.get('numberingInfo'))},
                    divId: item.get('id')
                });
            });

            if (this.api && this.api.SetDrawImagePreviewBulletForMenu) {
                this.api.SetDrawImagePreviewBulletForMenu(arrMarker, 0);
                this.api.SetDrawImagePreviewBulletForMenu(arrNum, 1);
            }
        };

        dh.updateBulletTip = function(view, title) {
            if (view) {
                var tip = $(view.el).data('bs.tooltip');
                if (tip) {
                    tip.options.title = title;
                    tip.$tip.find('.tooltip-inner').text(title);
                }
            }
        };

        dh.onSignatureClick = function(item) {
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
                    var me = this;
                    Common.UI.warning({
                        title: this.notcriticalErrorTitle,
                        msg: this.txtRemoveWarning,
                        buttons: ['ok', 'cancel'],
                        primary: 'ok',
                        callback: function(btn) {
                            if (btn == 'ok') {
                                me.api.asc_RemoveSignature(datavalue);
                            }
                        }
                    });
                    break;
            }
        };

        dh.onOriginalSizeClick = function(item) {
            if (this.api){
                var imgsize = this.api.asc_getCropOriginalImageSize();
                var w = imgsize.asc_getImageWidth();
                var h = imgsize.asc_getImageHeight();

                var properties = new Asc.asc_CImgProperty();
                properties.asc_putWidth(w);
                properties.asc_putHeight(h);
                properties.put_Rot(0);
                this.api.asc_setGraphicObjectProps(properties);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Set Image Original Size');
            }
        };

        dh.onImgReplace = function(menu, item) {
            var me = this;
            if (this.api) {
                if (item.value == 'file') {
                    setTimeout(function(){
                        if (me.api) me.api.asc_changeImageFromFile();
                        Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                    }, 10);
                } else if (item.value == 'storage') {
                    Common.NotificationCenter.trigger('storage:image-load', 'change');
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
        };

        dh.isPivotNumberFormat = function() {
            if (this.propsPivot && this.propsPivot.originalProps && this.propsPivot.field) {
                return (this.propsPivot.originalProps.asc_getFieldGroupType(this.propsPivot.pivotIndex) !== Asc.c_oAscGroupType.Text);
            }
            return false;
        };

        dh.onNumberFormatSelect = function(menu, item) {
            if (item.value !== undefined && item.value !== 'advanced') {
                if (this.api)
                    if (this.isPivotNumberFormat()) {
                        var field = (this.propsPivot.fieldType === 2) ? new Asc.CT_DataField() : new Asc.CT_PivotField();
                        field.asc_setNumFormat(item.options.format);
                        this.propsPivot.field.asc_set(this.api, this.propsPivot.originalProps, (this.propsPivot.fieldType === 2) ? this.propsPivot.index : this.propsPivot.pivotIndex, field);
                    } else
                        this.api.asc_setCellFormat(item.options.format);
            }
            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        };

        dh.onCustomNumberFormat = function(item) {
            var me = this,
                value = me.api.asc_getLocale();
            (!value) && (value = ((me.permissions.lang) ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(me.permissions.lang)) : 0x0409));

            (new Common.Views.FormatSettingsDialog({
                api: me.api,
                handler: function(result, settings) {
                    if (settings) {
                        if (me.isPivotNumberFormat()) {
                            var field = (me.propsPivot.fieldType === 2) ? new Asc.CT_DataField() : new Asc.CT_PivotField();
                            field.asc_setNumFormat(settings.format);
                            me.propsPivot.field.asc_set(me.api, me.propsPivot.originalProps, (me.propsPivot.fieldType === 2) ? me.propsPivot.index : me.propsPivot.pivotIndex, field);
                        } else
                            me.api.asc_setCellFormat(settings.format);
                    }
                    Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                },
                props   : {format: item.options.numformat, formatInfo: item.options.numformatinfo, langId: value}
            })).show();
            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        };

        dh.onNumberFormatOpenAfter = function(menu) {
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

                for (var i=0; i<menu.items.length-2; i++) {
                    var mnu = menu.items[i];
                    mnu.options.exampleval = me.api.asc_getLocaleExample(mnu.options.format);
                    $(mnu.el).find('label').text(mnu.options.exampleval);
                }
            }
        };

        dh.onAutoCorrectOpenAfter = function(menu) {
            this.mnuAutoCorrectStop && this.mnuAutoCorrectStop.setChecked(!Common.Utils.InternalSettings.get("sse-settings-autoformat-new-rows"));
        };

        dh.onAutoCorrectOptions = function() {
            var win = (new Common.Views.AutoCorrectDialog({
                api: this.api
            }));
            if (win) {
                win.show();
                win.setActiveCategory(2);
            }
        };

        dh.onShowForeignCursorLabel = function(UserId, X, Y, color) {
            if (!this.isUserVisible(UserId)) return;

            /** coauthoring begin **/
            var src;
            var me = this;
            if (me.tooltips && me.tooltips.foreignSelect && (me.tooltips.foreignSelect.userId == UserId)) {
                me.hideForeignSelectTips();
            }
            for (var i=0; i<me.fastcoauthtips.length; i++) {
                if (me.fastcoauthtips[i].attr('userid') == UserId) {
                    src = me.fastcoauthtips[i];
                    break;
                }
            }
            var coAuthTip = this.tooltips.coauth;
            if (X<0 || X+coAuthTip.XY[0]>coAuthTip.bodyWidth-coAuthTip.rightMenuWidth || Y<0 || Y>coAuthTip.apiHeight) {
                src && this.onHideForeignCursorLabel(UserId);
                return;
            }

            if (!src) {
                src = $(document.createElement("div"));
                src.addClass('username-tip');
                src.attr('userid', UserId);
                src.css({height: me._TtHeight + 'px', 'line-height': me._TtHeight + 'px', position: 'absolute', zIndex: '900', display: 'none', 'pointer-events': 'none',
                    'background-color': '#'+Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())});
                src.text(me.getUserName(UserId));

                $('#editor_sdk').append(src);
                me.fastcoauthtips.push(src);
                src.fadeIn(150);
            }
            src.css({
                left       : ((X+coAuthTip.XY[0]+src.outerWidth()>coAuthTip.bodyWidth-coAuthTip.rightMenuWidth) ? coAuthTip.bodyWidth-coAuthTip.rightMenuWidth-src.outerWidth()-coAuthTip.XY[0] : X) + 'px',
                top         : (Y-me._TtHeight) + 'px'
            });
            /** coauthoring end **/
        };

        dh.onHideForeignCursorLabel = function(UserId) {
            var me = this;
            for (var i=0; i<me.fastcoauthtips.length; i++) {
                if (me.fastcoauthtips[i].attr('userid') == UserId) {
                    var src = me.fastcoauthtips[i];
                    me.fastcoauthtips[i].fadeOut(150, function(){src.remove()});
                    me.fastcoauthtips.splice(i, 1);
                    break;
                }
            }
        };

        dh.onDoubleClickOnTableOleObject = function(frameBinary) {
            if (!Common.Controllers.LaunchController.isScriptLoaded()) return;
            if (this.permissions.isEdit && !this._isDisabled) {
                var oleEditor = SSE.getController('Common.Controllers.ExternalOleEditor').getView('Common.Views.ExternalOleEditor');
                if (oleEditor && frameBinary) {
                    oleEditor.setEditMode(true);
                    oleEditor.show();
                    oleEditor.setOleData(frameBinary);
                }
            }
        };

        dh.onShowMathTrack = function(bounds) {
            if (this.permissions && !this.permissions.isEdit) return;

            this.lastMathTrackBounds = bounds;
            if (!Common.Controllers.LaunchController.isScriptLoaded()) {
                this.showMathTrackOnLoad = true;
                return;
            }

            if (bounds[3] < 0 || Common.Utils.InternalSettings.get('sse-equation-toolbar-hide')) {
                this.onHideMathTrack();
                return;
            }
            var me = this,
                documentHolder = me.documentHolder,
                eqContainer = documentHolder.cmpEl.find('#equation-container');

            // Prepare menu container
            if (eqContainer.length < 1) {
                var equationsStore = me.getApplication().getCollection('EquationGroups'),
                    eqStr = '<div id="equation-container" style="position: absolute;">';

                me.getApplication().getController('Toolbar').onMathTypes();

                me.equationBtns = [];
                for (var i = 0; i < equationsStore.length; ++i) {
                    eqStr += '<span id="id-document-holder-btn-equation-' + i + '"></span>';
                }
                eqStr += '<div class="separator"></div>';
                eqStr += '<span id="id-document-holder-btn-equation-settings"></span>';
                eqStr += '</div>';
                eqContainer = $(eqStr);
                documentHolder.cmpEl.append(eqContainer);
                var onShowBefore = function (menu) {
                    var index = menu.options.value,
                        group = equationsStore.at(index);
                    var equationPicker = new Common.UI.DataViewSimple({
                        el: $('#id-document-holder-btn-equation-menu-' + index, menu.cmpEl),
                        parentMenu: menu,
                        store: group.get('groupStore'),
                        scrollAlwaysVisible: true,
                        showLast: false,
                        restoreHeight: 450,
                        itemTemplate: _.template(
                            '<div class="item-equation" style="" >' +
                            '<div class="equation-icon" style="background-position:<%= posX %>px <%= posY %>px;width:<%= width %>px;height:<%= height %>px;" id="<%= id %>"></div>' +
                            '</div>')
                    });
                    equationPicker.on('item:click', function(picker, item, record, e) {
                        if (me.api) {
                            if (record)
                                me.api.asc_AddMath(record.get('data').equationType);
                        }
                    });
                    menu.off('show:before', onShowBefore);
                };
                var bringForward = function (menu) {
                    eqContainer.addClass('has-open-menu');
                };
                var sendBackward = function (menu) {
                    eqContainer.removeClass('has-open-menu');
                };
                for (var i = 0; i < equationsStore.length; ++i) {
                    var equationGroup = equationsStore.at(i);
                    var btn = new Common.UI.Button({
                        parentEl: $('#id-document-holder-btn-equation-' + i, documentHolder.cmpEl),
                        cls         : 'btn-toolbar no-caret',
                        iconCls     : 'svgicon ' + equationGroup.get('groupIcon'),
                        hint        : equationGroup.get('groupName'),
                        menu        : new Common.UI.Menu({
                            value: i,
                            items: [
                                { template: _.template('<div id="id-document-holder-btn-equation-menu-' + i +
                                    '" class="menu-shape margin-left-5" style="width:' + (equationGroup.get('groupWidth') + 8) + 'px; ' +
                                    equationGroup.get('groupHeightStr') + '"></div>') }
                            ]
                        })
                    });
                    btn.menu.on('show:before', onShowBefore);
                    btn.menu.on('show:before', bringForward);
                    btn.menu.on('hide:after', sendBackward);
                    me.equationBtns.push(btn);
                }

                me.equationSettingsBtn = new Common.UI.Button({
                    parentEl: $('#id-document-holder-btn-equation-settings', documentHolder.cmpEl),
                    cls         : 'btn-toolbar no-caret',
                    iconCls     : 'toolbar__icon btn-more-vertical',
                    hint        : me.documentHolder.advancedEquationText,
                    menu        : me.documentHolder.createEquationMenu('popuptbeqinput', 'tl-bl')
                });
                me.equationSettingsBtn.menu.options.initMenu = function() {
                    var eq = me.api.asc_GetMathInputType(),
                        menu = me.equationSettingsBtn.menu,
                        isEqToolbarHide = Common.Utils.InternalSettings.get('sse-equation-toolbar-hide');

                    menu.items[5].setChecked(eq===Asc.c_oAscMathInputType.Unicode);
                    menu.items[6].setChecked(eq===Asc.c_oAscMathInputType.LaTeX);
                    menu.items[8].options.isToolbarHide = isEqToolbarHide;
                    menu.items[8].setCaption(isEqToolbarHide ? me.documentHolder.showEqToolbar : me.documentHolder.hideEqToolbar);
                };
                me.equationSettingsBtn.menu.on('item:click', _.bind(me.convertEquation, me));
                me.equationSettingsBtn.menu.on('show:before', function(menu) {
                    bringForward();
                    menu.options.initMenu();
                });
                me.equationSettingsBtn.menu.on('hide:after', sendBackward);
            }

            if (!me.tooltips.coauth.XY)
                me.onDocumentResize();

            var showPoint = [(bounds[0] + bounds[2])/2 - eqContainer.outerWidth()/2, bounds[1] - eqContainer.outerHeight() - 10];
            (showPoint[0]<0) && (showPoint[0] = 0);
            if (showPoint[1]<0) {
                showPoint[1] = bounds[3] + 10;
            }
            showPoint[1] = Math.min(me.tooltips.coauth.apiHeight - eqContainer.outerHeight(), Math.max(0, showPoint[1]));
            eqContainer.css({left: showPoint[0], top : showPoint[1]});

            var diffDown = me.tooltips.coauth.apiHeight - showPoint[1] - eqContainer.outerHeight(),
                diffUp = me.tooltips.coauth.XY[1] + showPoint[1],
                menuAlign = (diffDown < 220 && diffDown < diffUp*0.9) ? 'bl-tl' : 'tl-bl';
            if (Common.UI.isRTL()) {
                menuAlign = menuAlign === 'bl-tl' ? 'br-tr' : 'tr-br';
            }
            me.equationBtns.forEach(function(item){
                item && (item.menu.menuAlign = menuAlign);
            });
            me.equationSettingsBtn.menu.menuAlign = menuAlign;
            if (eqContainer.is(':visible')) {
                if (me.equationSettingsBtn.menu.isVisible()) {
                    me.equationSettingsBtn.menu.options.initMenu();
                    me.equationSettingsBtn.menu.alignPosition();
                }
            } else {
                eqContainer.show();
            }
            me.disableEquationBar();
        };

        dh.convertEquation = function(menu, item, e) {
            if (this.api) {
                if (item.options.type=='input') {
                    this.api.asc_SetMathInputType(item.value);
                    Common.localStorage.setBool("sse-equation-input-latex", item.value===Asc.c_oAscMathInputType.LaTeX)
                } else if (item.options.type=='view')
                    this.api.asc_ConvertMathView(item.value.linear, item.value.all);
                else if(item.options.type=='hide') {
                    item.options.isToolbarHide = !item.options.isToolbarHide;
                    Common.Utils.InternalSettings.set('sse-equation-toolbar-hide', item.options.isToolbarHide);
                    Common.localStorage.setBool('sse-equation-toolbar-hide', item.options.isToolbarHide);
                    if(item.options.isToolbarHide) this.onHideMathTrack();
                    else this.onShowMathTrack(this.lastMathTrackBounds);
                }
            }
        };

        dh.saveAsPicture = function() {
            if(this.api) {
                this.api.asc_SaveDrawingAsPicture();
            }
        };

        dh.onInsertImage = function(obj, x, y) {
            if (this.api)
                this.api.asc_addImage(obj);
            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        };

        dh.onInsertImageUrl = function(obj, x, y) {
            var me = this;
            (new Common.Views.ImageFromUrlDialog({
                handler: function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            var checkUrl = value.replace(/ /g, '');
                            if (!_.isEmpty(checkUrl)) {
                                me.api.AddImageUrl([checkUrl], undefined, undefined, obj);
                            }
                        }
                    }
                    Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                }
            })).show();
        };

        dh.onFillSeriesClick = function(menu, item) {
            this._state.fillSeriesItemClick = true;
            if (this.api) {
                if (item.value===Asc.c_oAscFillType.series) {
                    var me = this,
                        res,
                        win = (new SSE.Views.FillSeriesDialog({
                            handler: function(result, settings) {
                                if (result == 'ok' && settings) {
                                    res = result;
                                    me.api.asc_FillCells(item.value, settings);
                                }
                                Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                            },
                            props: menu.seriesinfo
                        })).on('close', function() {
                            (res!=='ok') && me.api.asc_CancelFillCells();
                        });
                    win.show();
                } else {
                    this.api.asc_FillCells(item.value, menu.seriesinfo);
                    Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                }
            }
        };

        dh.onFillSeriesHideAfter = function() {
            this.api && !this._state.fillSeriesItemClick && this.api.asc_CancelFillCells();
            this._state.fillSeriesItemClick = false;
        };

        dh.onCellFormat = function() {
            this.getApplication().getController('RightMenu').onRightMenuOpen(Common.Utils.documentSettingsType.Cell);
        };
    }
});