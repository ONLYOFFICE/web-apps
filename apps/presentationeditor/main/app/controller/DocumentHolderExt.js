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
 *  Created on 13/12/24
 *
 */

define([], function () {
    'use strict';

    if (window.PE && window.PE.Controllers && window.PE.Controllers.DocumentHolder) {
        let dh = window.PE.Controllers.DocumentHolder.prototype;

        dh.checkEditorOffsets = function() {
            if (_.isUndefined(this._XY)) {
                let cmpEl = this.documentHolder.cmpEl;
                this._XY = [
                    Common.Utils.getOffset(cmpEl).left - $(window).scrollLeft(),
                    Common.Utils.getOffset(cmpEl).top - $(window).scrollTop()
                ];
                this._Width       = cmpEl.width();
                this._Height      = cmpEl.height();
                this._BodyWidth   = $('body').width();
            }
        };

        dh.setEvents = function() {
            var me = this;
            this.addListeners({
                'DocumentHolder': {
                    'createdelayedelements': this.createDelayedElements,
                    'equation:callback': this.equationCallback,
                    'layout:change': this.onLayoutChange,
                    'theme:change': this.onThemeChange
                }
            });

            if (me.api) {
                me.api.asc_registerCallback('asc_onContextMenu',        _.bind(me.onContextMenu, me));
                me.api.asc_registerCallback('asc_onMouseMoveStart',     _.bind(me.onMouseMoveStart, me));
                me.api.asc_registerCallback('asc_onMouseMoveEnd',       _.bind(me.onMouseMoveEnd, me));
                me.api.asc_registerCallback('asc_onPaintSlideNum',      _.bind(me.onPaintSlideNum, me));
                me.api.asc_registerCallback('asc_onEndPaintSlideNum',   _.bind(me.onEndPaintSlideNum, me));
                me.api.asc_registerCallback('asc_onCurrentPage',        _.bind(me.onApiCurrentPages, me));
                me.documentHolder.slidesCount = me.api.getCountPages();

                //hyperlink
                me.api.asc_registerCallback('asc_onHyperlinkClick',     _.bind(me.onHyperlinkClick, me));
                me.api.asc_registerCallback('asc_onMouseMove',          _.bind(me.onMouseMove, me));

                if (me.mode.isEdit===true) {
                    me.api.asc_registerCallback('asc_onDialogAddHyperlink', _.bind(me.onDialogAddHyperlink, me));
                    me.api.asc_registerCallback('asc_doubleClickOnChart', _.bind(me.onDoubleClickOnChart, me));
                    me.api.asc_registerCallback('asc_doubleClickOnTableOleObject', _.bind(me.onDoubleClickOnTableOleObject, me));
                    me.api.asc_registerCallback('asc_onSpellCheckVariantsFound',  _.bind(me.onSpellCheckVariantsFound, me));
                    me.api.asc_registerCallback('asc_onShowSpecialPasteOptions',  _.bind(me.onShowSpecialPasteOptions, me));
                    me.api.asc_registerCallback('asc_onHideSpecialPasteOptions',  _.bind(me.onHideSpecialPasteOptions, me));
                    me.api.asc_registerCallback('asc_ChangeCropState',            _.bind(me.onChangeCropState, me));
                    me.api.asc_registerCallback('asc_onHidePlaceholderActions',   _.bind(me.onHidePlaceholderActions, me));
                    me.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.Image, _.bind(me.onInsertImage, me, true));
                    me.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.ImageUrl, _.bind(me.onInsertImageUrl, me, true));
                    me.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.Chart, _.bind(me.onClickPlaceholderChart, me));
                    me.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.Table, _.bind(me.onClickPlaceholderTable, me));
                    me.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.Video, _.bind(me.onClickPlaceholder, me, AscCommon.PlaceholderButtonType.Video));
                    me.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.Audio, _.bind(me.onClickPlaceholder, me, AscCommon.PlaceholderButtonType.Audio));
                    me.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.SmartArt, _.bind(me.onClickPlaceholderSmartArt, me));
                    me.api.asc_registerCallback('asc_onTrackGuide',   _.bind(me.onTrackGuide, me));
                    me.api.asc_registerCallback('asc_onShowMathTrack',            _.bind(me.onShowMathTrack, me));
                    me.api.asc_registerCallback('asc_onHideMathTrack',            _.bind(me.onHideMathTrack, me));
                    me.api.asc_registerCallback('asc_onLockViewProps',          _.bind(me.onLockViewProps, me, true));
                    me.api.asc_registerCallback('asc_onUnLockViewProps',        _.bind(me.onLockViewProps, me, false));
                    me.api.asc_registerCallback('asc_onHideEyedropper',         _.bind(me.hideEyedropper, me));
                    me.api.asc_SetMathInputType(Common.localStorage.getBool("pe-equation-input-latex") ? Asc.c_oAscMathInputType.LaTeX : Asc.c_oAscMathInputType.Unicode);
                    me.api.asc_registerCallback('asc_onRemoveUnpreserveMasters', _.bind(me.onRemoveUnpreserveMasters, me));
                    me.api.asc_registerCallback('asc_onSingleChartSelectionChanged',  _.bind(this.onSingleChartSelectionChanged, this));
                }
                me.api.asc_registerCallback('asc_onShowForeignCursorLabel', _.bind(me.onShowForeignCursorLabel, me));
                me.api.asc_registerCallback('asc_onHideForeignCursorLabel', _.bind(me.onHideForeignCursorLabel, me));
                me.api.asc_registerCallback('asc_onFocusObject',            _.bind(me.onFocusObject, me));
                me.api.asc_registerCallback('onPluginContextMenu',          _.bind(me.onPluginContextMenu, me));
            }
        };

        dh.initExternalEditors = function() {
            var me = this;
            var diagramEditor = this.getApplication().getController('Common.Controllers.ExternalDiagramEditor').getView('Common.Views.ExternalDiagramEditor');
            if (diagramEditor) {
                diagramEditor.on('internalmessage', _.bind(function(cmp, message) {
                    var command = message.data.command;
                    var data = message.data.data;
                    if (this.api) {
                        ( diagramEditor.isEditMode() )
                            ? this.api.asc_editChartDrawingObject(data)
                            : this.api.asc_addChartDrawingObject(data, diagramEditor.getPlaceholder());
                    }
                }, this));
                diagramEditor.on('hide', _.bind(function(cmp, message) {
                    if (this.api) {
                        this.api.asc_onCloseFrameEditor();
                        this.api.asc_enableKeyEvents(true);
                    }
                    setTimeout(function(){
                        me.editComplete();
                    }, 10);
                }, this));
            }

            var oleEditor = this.getApplication().getController('Common.Controllers.ExternalOleEditor').getView('Common.Views.ExternalOleEditor');
            if (oleEditor) {
                oleEditor.on('internalmessage', _.bind(function(cmp, message) {
                    var command = message.data.command;
                    var data = message.data.data;
                    if (this.api) {
                        oleEditor.isEditMode()
                            ? this.api.asc_editTableOleObject(data)
                            : this.api.asc_addTableOleObject(data);
                    }
                }, this));
                oleEditor.on('hide', _.bind(function(cmp, message) {
                    if (this.api) {
                        this.api.asc_enableKeyEvents(true);
                        this.api.asc_onCloseFrameEditor();
                    }
                    setTimeout(function(){
                        me.editComplete();
                    }, 10);
                }, this));
            }
        };

        dh.createDelayedElements = function(view, type) {
            var me = this, view = me.documentHolder;

            if (type=='view') {
                view.menuViewCopy.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuViewAddComment.on('click', _.bind(me.addComment, me));
                view.menuViewUndo.on('click', _.bind(me.onUndo, me));
                view.mnuPreview.on('click', _.bind(me.onPreview, me));
                view.mnuSelectAll.on('click', _.bind(me.onSelectAll, me));
                view.mnuPrintSelection.on('click', _.bind(me.onPrintSelection, me));
                return;
            }

            view.menuEditObject.on('click', _.bind(me.onEditObject, me));
            view.menuSlidePaste.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuParaCopy.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuParaPaste.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuParaCut.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuImgCopy.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuImgPaste.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuImgCut.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuTableCopy.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuTablePaste.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuTableCut.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuAddHyperlinkPara.on('click', _.bind(me.addHyperlink, me));
            view.menuAddHyperlinkTable.on('click', _.bind(me.addHyperlink, me));
            view.menuEditHyperlinkPara.on('click', _.bind(me.editHyperlink, me));
            view.menuEditHyperlinkTable.on('click', _.bind(me.editHyperlink, me));
            view.menuRemoveHyperlinkPara.on('click', _.bind(me.removeHyperlink, me));
            view.menuRemoveHyperlinkTable.on('click', _.bind(me.removeHyperlink, me));
            view.menuChartEdit.on('click', _.bind(me.editChartClick, me, undefined));
            view.menuImgSaveAsPicture.on('click', _.bind(me.saveAsPicture, me));
            view.menuTableSaveAsPicture.on('click', _.bind(me.saveAsPicture, me));
            view.menuAddCommentPara.on('click', _.bind(me.addComment, me));
            view.menuAddCommentTable.on('click', _.bind(me.addComment, me));
            view.menuAddCommentImg.on('click', _.bind(me.addComment, me));
            view.menuImgReplace.menu.on('item:click', _.bind(me.onImgReplace, me));
            view.langParaMenu.menu.on('item:click', _.bind(me.onLangMenu, me, 'para'));
            view.langTableMenu.menu.on('item:click', _.bind(me.onLangMenu, me, 'table'));
            view.mnuPreview.on('click', _.bind(me.onPreview, me));
            view.mnuSelectAll.on('click', _.bind(me.onSelectAll, me));
            view.mnuPrintSelection.on('click', _.bind(me.onPrintSelection, me));
            view.mnuNewSlide.on('click', _.bind(me.onNewSlide, me));
            view.mnuDuplicateSlide.on('click', _.bind(me.onDuplicateSlide, me));
            view.mnuDeleteSlide.on('click', _.bind(me.onDeleteSlide, me));
            view.mnuResetSlide.on('click', _.bind(me.onResetSlide, me));
            view.mnuMoveSlideToStart.on('click', _.bind(me.onMoveSlideToStart, me));
            view.mnuMoveSlideToEnd.on('click', _.bind(me.onMoveSlideToEnd, me));
            view.menuSlideSettings.on('click', _.bind(me.onSlideSettings, me));
            view.mnuSlideHide.on('click', _.bind(me.onSlideHide, me));
            view.mnuTableMerge.on('click', _.bind(me.onTableMerge, me));
            view.mnuTableSplit.on('click', _.bind(me.onTableSplit, me));
            view.menuTableCellAlign.menu.on('item:click', _.bind(me.tableCellsVAlign, me));
            view.menuTableDistRows.on('click', _.bind(me.onTableDistRows, me));
            view.menuTableDistCols.on('click', _.bind(me.onTableDistCols, me));
            view.menuTableDirection.menu.on('item:click', _.bind(me.tableDirection, me));
            view.menuIgnoreSpellTable.on('click', _.bind(me.onIgnoreSpell, me));
            view.menuIgnoreSpellPara.on('click', _.bind(me.onIgnoreSpell, me));
            view.menuIgnoreAllSpellTable.on('click', _.bind(me.onIgnoreSpell, me));
            view.menuIgnoreAllSpellPara.on('click', _.bind(me.onIgnoreSpell, me));
            view.menuToDictionaryTable.on('click', _.bind(me.onToDictionary, me));
            view.menuToDictionaryPara.on('click', _.bind(me.onToDictionary, me));
            view.menuTableAdvanced.on('click', _.bind(me.onTableAdvanced, me));
            view.menuImageAdvanced.on('click', _.bind(me.onImageAdvanced, me));
            view.menuImgOriginalSize.on('click', _.bind(me.onImgOriginalSize, me));
            view.menuImgShapeRotate.menu.items[0].on('click', _.bind(me.onImgRotate, me));
            view.menuImgShapeRotate.menu.items[1].on('click', _.bind(me.onImgRotate, me));
            view.menuImgShapeRotate.menu.items[3].on('click', _.bind(me.onImgFlip, me));
            view.menuImgShapeRotate.menu.items[4].on('click', _.bind(me.onImgFlip, me));
            view.menuImgCrop.menu.on('item:click', _.bind(me.onImgCrop, me));
            view.menuImgResetCrop.on('click', _.bind(me.onImgResetCrop, me));
            view.menuImgEditPoints.on('click', _.bind(me.onImgEditPoints, me));
            view.menuShapeAdvanced.on('click', _.bind(me.onShapeAdvanced, me));
            view.menuParagraphAdvanced.on('click', _.bind(me.onParagraphAdvanced, me));
            view.menuChartAdvanced.on('click', _.bind(me.onChartAdvanced, me));
            view.mnuGroupImg.on('click', _.bind(me.onGroupImg, me));
            view.mnuUnGroupImg.on('click', _.bind(me.onUnGroupImg, me));
            view.mnuArrangeFront.on('click', _.bind(me.onArrangeFront, me));
            view.mnuArrangeBack.on('click', _.bind(me.onArrangeBack, me));
            view.mnuArrangeForward.on('click', _.bind(me.onArrangeForward, me));
            view.mnuArrangeBackward.on('click', _.bind(me.onArrangeBackward, me));
            view.menuImgShapeAlign.menu.on('item:click', _.bind(me.onImgShapeAlign, me));
            view.menuShapesMerge.menu.on('item:click', _.bind(me.onShapesMerge, me));
            view.menuParagraphVAlign.menu.on('item:click', _.bind(me.onParagraphVAlign, me));
            view.menuParagraphDirection.menu.on('item:click', _.bind(me.onParagraphDirection, me));
            view.menuTableSelectText.menu.on('item:click', _.bind(me.tableSelectText, me));
            view.menuTableInsertText.menu.on('item:click', _.bind(me.tableInsertText, me));
            view.menuTableDeleteText.menu.on('item:click', _.bind(me.tableDeleteText, me));
            view.mnuGuides.menu.on('item:click', _.bind(me.onGuidesClick, me));
            view.mnuGridlines.menu.on('item:click', _.bind(me.onGridlinesClick, me));
            view.mnuRulers.on('click', _.bind(me.onRulersClick, me));
            view.menuTableEquationSettings.menu.on('item:click', _.bind(me.convertEquation, me));
            view.menuParagraphEquation.menu.on('item:click', _.bind(me.convertEquation, me));
            view.animEffectMenu.on('item:click', _.bind(me.onAnimEffect, me));
            view.mnuInsertMaster.on('click', _.bind(me.onInsertMaster, me));
            view.mnuInsertLayout.on('click', _.bind(me.onInsertLayout, me));
            view.mnuDuplicateMaster.on('click', _.bind(me.onDuplicateMaster, me));
            view.mnuPreserveMaster.on('toggle', _.bind(me.onPreserveMaster, me));
            view.mnuDuplicateLayout.on('click', _.bind(me.onDuplicateLayout, me));
            view.mnuDeleteMaster.on('click', _.bind(me.onDeleteMaster, me));
            view.mnuDeleteLayout.on('click', _.bind(me.onDeleteLayout, me));
            view.mnuRenameMaster.on('click', _.bind(me.onRename, me));
            view.mnuRenameLayout.on('click', _.bind(me.onRename, me));
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
        };

        dh.fillMenuProps = function(selectedElements) {
            if (!selectedElements || !_.isArray(selectedElements)) return;
            var me = this,
                documentHolder = this.documentHolder;
            var menu_props = {},
                menu_to_show = null;
            _.each(selectedElements, function(element, index) {
                var elType  = element.get_ObjectType(),
                    elValue = element.get_ObjectValue();

                if (Asc.c_oAscTypeSelectElement.Image == elType) {
                    menu_to_show = documentHolder.pictureMenu;
                    menu_props.imgProps = {};
                    menu_props.imgProps.value = elValue;
                    menu_props.imgProps.locked = (elValue) ? elValue.get_Locked() : false;
                } else if (Asc.c_oAscTypeSelectElement.Table == elType)
                {
                    menu_to_show = documentHolder.tableMenu;
                    menu_props.tableProps = {};
                    menu_props.tableProps.value = elValue;
                    menu_props.tableProps.locked = (elValue) ? elValue.get_Locked() : false;
                } else if (Asc.c_oAscTypeSelectElement.Hyperlink == elType) {
                    menu_props.hyperProps = {};
                    menu_props.hyperProps.value = elValue;
                } else if (Asc.c_oAscTypeSelectElement.Shape == elType) { // shape
                    menu_to_show = documentHolder.pictureMenu;
                    menu_props.shapeProps = {};
                    menu_props.shapeProps.value = elValue;
                    menu_props.shapeProps.locked = (elValue) ? elValue.get_Locked() : false;
                    if (elValue.get_FromChart())
                        menu_props.shapeProps.isChart = true;
                }
                else if (Asc.c_oAscTypeSelectElement.Chart == elType) {
                    menu_to_show = documentHolder.pictureMenu;
                    menu_props.chartProps = {};
                    menu_props.chartProps.value = elValue;
                    menu_props.chartProps.locked = (elValue) ? elValue.get_Locked() : false;
                }
                else if (Asc.c_oAscTypeSelectElement.Slide == elType) {
                    menu_props.slideProps = {};
                    menu_props.slideProps.value = elValue;
                    menu_props.slideProps.locked = (elValue) ? elValue.get_LockDelete() : false;
                } else if (Asc.c_oAscTypeSelectElement.Paragraph == elType) {
                    menu_props.paraProps = {};
                    menu_props.paraProps.value = elValue;
                    menu_props.paraProps.locked = (elValue) ? elValue.get_Locked() : false;
                    if ( (menu_props.shapeProps && menu_props.shapeProps.value || menu_props.chartProps && menu_props.chartProps.value)&& // text in shape, need to show paragraph menu with vertical align
                        _.isUndefined(menu_props.tableProps))
                        menu_to_show = documentHolder.textMenu;
                } else if (Asc.c_oAscTypeSelectElement.SpellCheck == elType) {
                    menu_props.spellProps = {};
                    menu_props.spellProps.value = elValue;
                    documentHolder._currentSpellObj = elValue;
                } else if (Asc.c_oAscTypeSelectElement.Math == elType) {
                    menu_props.mathProps = {};
                    menu_props.mathProps.value = elValue;
                    documentHolder._currentMathObj = elValue;
                }
            });
            if (menu_to_show === null) {
                if (!_.isUndefined(menu_props.paraProps))
                    menu_to_show = documentHolder.textMenu;
                else if (!_.isUndefined(menu_props.slideProps)) {
                    menu_to_show = documentHolder.slideMenu;
                }
            }

            return {menu_to_show: menu_to_show, menu_props: menu_props};
        };

        dh.fillViewMenuProps = function(selectedElements) {
            if (!selectedElements || !_.isArray(selectedElements)) return;

            var me = this,
                documentHolder = this.documentHolder;
            if (!documentHolder.viewModeMenu)
                documentHolder.createDelayedElementsViewer();

            var menu_props = {},
                menu_to_show = null;
            _.each(selectedElements, function(element, index) {
                var elType  = element.get_ObjectType(),
                    elValue = element.get_ObjectValue();

                if (Asc.c_oAscTypeSelectElement.Image == elType || Asc.c_oAscTypeSelectElement.Table == elType || Asc.c_oAscTypeSelectElement.Shape == elType ||
                    Asc.c_oAscTypeSelectElement.Chart == elType || Asc.c_oAscTypeSelectElement.Paragraph == elType) {
                    menu_to_show = documentHolder.viewModeMenu;
                    menu_props.locked = menu_props.locked || ((elValue) ? elValue.get_Locked() : false);
                    if (Asc.c_oAscTypeSelectElement.Chart == elType)
                        menu_props.isChart = true;
                }
                else if (Asc.c_oAscTypeSelectElement.Slide == elType) {
                    menu_props.locked = menu_props.locked || ((elValue) ? elValue.get_LockDelete() : false);
                }
            });

            return (menu_to_show) ? {menu_to_show: menu_to_show, menu_props: menu_props} : null;
        };

        dh.onHyperlinkClick = function(url) {
            if (url) {
                var type = this.api.asc_getUrlType(url);
                if (type===AscCommon.c_oAscUrlType.Http || type===AscCommon.c_oAscUrlType.Email)
                    window.open(url);
                else {
                    var me = this;
                    setTimeout(function() {
                        Common.UI.warning({
                            maxwidth: 500,
                            msg: Common.Utils.String.format(me.documentHolder.txtWarnUrl, url),
                            buttons: ['no', 'yes'],
                            primary: 'no',
                            callback: function(btn) {
                                try {
                                    (btn == 'yes') && window.open(url);
                                } catch (err) {
                                    err && console.log(err.stack);
                                }
                            }
                        });
                    }, 1);
                }
            }
        };

        dh.onMouseMove = function(moveData) {
            var me = this,
                cmpEl = me.documentHolder.cmpEl,
                screenTip = me.screenTip;

            this.checkEditorOffsets();

            if (moveData) {
                var showPoint, ToolTip = '',
                    type = moveData.get_Type();

                if (type===Asc.c_oAscMouseMoveDataTypes.Hyperlink || type===Asc.c_oAscMouseMoveDataTypes.Placeholder || type===Asc.c_oAscMouseMoveDataTypes.EffectInfo) {
                    if (me.isTooltipHiding) {
                        me.mouseMoveData = moveData;
                        return;
                    }
                    if (type===Asc.c_oAscMouseMoveDataTypes.Hyperlink) {
                        var hyperProps = moveData.get_Hyperlink();
                        if (hyperProps) {
                            ToolTip = (_.isEmpty(hyperProps.get_ToolTip())) ? hyperProps.get_Value() : hyperProps.get_ToolTip();
                            ToolTip = Common.Utils.String.htmlEncode(ToolTip);
                            if (ToolTip.length>256)
                                ToolTip = ToolTip.substr(0, 256) + '...';
                        }
                    } else if (type===Asc.c_oAscMouseMoveDataTypes.Placeholder) {
                        switch (moveData.get_PlaceholderType()) {
                            case AscCommon.PlaceholderButtonType.Image:
                                ToolTip = me.documentHolder.txtInsImage;
                                break;
                            case AscCommon.PlaceholderButtonType.ImageUrl:
                                ToolTip = me.documentHolder.txtInsImageUrl;
                                break;
                            case AscCommon.PlaceholderButtonType.Chart:
                                ToolTip = me.documentHolder.txtInsChart;
                                break;
                            case AscCommon.PlaceholderButtonType.Table:
                                ToolTip = me.documentHolder.txtInsTable;
                                break;
                            case AscCommon.PlaceholderButtonType.Video:
                                ToolTip = me.documentHolder.txtInsVideo;
                                break;
                            case AscCommon.PlaceholderButtonType.Audio:
                                ToolTip = me.documentHolder.txtInsAudio;
                                break;
                            case AscCommon.PlaceholderButtonType.SmartArt:
                                ToolTip = me.documentHolder.txtInsSmartArt;
                                break;
                        }
                    } else if (type===Asc.c_oAscMouseMoveDataTypes.EffectInfo) {
                        if (me.documentHolder.currentMenu && me.documentHolder.currentMenu.isVisible())
                            return;
                        var tip = moveData.get_EffectText();
                        if (!tip) {
                            tip = me.getApplication().getController('Animation').getAnimationPanelTip(moveData.get_EffectDescription()) || '';
                        }
                        ToolTip = tip;
                    }
                    var recalc = false;
                    screenTip.isHidden = false;
                    if (screenTip.tipType !== type || screenTip.tipLength !== ToolTip.length || screenTip.strTip.indexOf(ToolTip)<0 ) {
                        screenTip.toolTip.setTitle((type===Asc.c_oAscMouseMoveDataTypes.Hyperlink) ? (ToolTip + (me.isPreviewVisible ? '' : '<br><b>' + Common.Utils.String.platformKey('Ctrl', me.documentHolder.txtPressLink) + '</b>')) : ToolTip);
                        screenTip.tipLength = ToolTip.length;
                        screenTip.strTip = ToolTip;
                        screenTip.tipType = type;
                        recalc = true;
                        screenTip.toolTip.getBSTip().options.container = me.isPreviewVisible ? '#pe-preview' : 'body';
                    }

                    showPoint = [moveData.get_X(), moveData.get_Y()];
                    showPoint[1] += ((me.isPreviewVisible ? 0 : me._XY[1])-15);
                    showPoint[0] += ((me.isPreviewVisible ? 0 : me._XY[0])+5);

                    if (!screenTip.isVisible || recalc) {
                        screenTip.isVisible = true;
                        screenTip.toolTip.show([-10000, -10000]);
                    }

                    if ( recalc ) {
                        screenTip.tipHeight = screenTip.toolTip.getBSTip().$tip.height();
                        screenTip.tipWidth = screenTip.toolTip.getBSTip().$tip.width();
                    }
                    showPoint[1] -= screenTip.tipHeight;
                    if (showPoint[1]<0)
                        showPoint[1] = 0;
                    if (showPoint[0] + screenTip.tipWidth > me._BodyWidth )
                        showPoint[0] = me._BodyWidth - screenTip.tipWidth;
                    screenTip.toolTip.getBSTip().$tip.css({top: showPoint[1] + 'px', left: showPoint[0] + 'px'});
                }
                else if (type===Asc.c_oAscMouseMoveDataTypes.Eyedropper) {
                    if (me.eyedropperTip.isTipVisible) {
                        me.eyedropperTip.isTipVisible = false;
                        me.eyedropperTip.toolTip.hide();
                    }

                    if (!me.eyedropperTip.toolTip) {
                        var tipEl = $('<div id="tip-container-eyedroppertip" style="position: absolute; z-index: 10000;"></div>');
                        me.documentHolder.cmpEl.append(tipEl);
                        me.eyedropperTip.toolTip = new Common.UI.Tooltip({
                            owner: tipEl,
                            html: true,
                            cls: 'eyedropper-tooltip'
                        });
                    }

                    var color = moveData.get_EyedropperColor().asc_getColor(),
                        r = color.get_r(),
                        g = color.get_g(),
                        b = color.get_b(),
                        hex = Common.Utils.ThemeColor.getHexColor(r,g,b);
                    if (!me.eyedropperTip.eyedropperColor) {
                        var colorEl = $(document.createElement("div"));
                        colorEl.addClass('eyedropper-color');
                        colorEl.appendTo(document.body);
                        me.eyedropperTip.eyedropperColor = colorEl;
                        $('#id_main_view').on('mouseleave', _.bind(me.hideEyedropper, me));
                    }
                    me.eyedropperTip.eyedropperColor.css({
                        backgroundColor: '#' + hex,
                        left: (moveData.get_X() + me._XY[0] + 23) + 'px',
                        top: (moveData.get_Y() + me._XY[1] - 53) + 'px'
                    });
                    me.eyedropperTip.isVisible = true;

                    if (me.eyedropperTip.tipInterval) {
                        clearInterval(me.eyedropperTip.tipInterval);
                    }
                    me.eyedropperTip.tipInterval = setInterval(function () {
                        clearInterval(me.eyedropperTip.tipInterval);
                        if (me.eyedropperTip.isVisible) {
                            ToolTip = '<div>RGB (' + r + ',' + g + ',' + b + ')</div>' +
                                '<div>' + moveData.get_EyedropperColor().asc_getName() + '</div>';
                            me.eyedropperTip.toolTip.setTitle(ToolTip);
                            me.eyedropperTip.isTipVisible = true;
                            me.eyedropperTip.toolTip.show([-10000, -10000]);
                            me.eyedropperTip.tipWidth = me.eyedropperTip.toolTip.getBSTip().$tip.width();
                            showPoint = [moveData.get_X(), moveData.get_Y()];
                            showPoint[1] += (me._XY[1] - 57);
                            showPoint[0] += (me._XY[0] + 58);
                            if (showPoint[0] + me.eyedropperTip.tipWidth > me._BodyWidth ) {
                                showPoint[0] = showPoint[0] - me.eyedropperTip.tipWidth - 40;
                            }
                            me.eyedropperTip.toolTip.getBSTip().$tip.css({
                                top: showPoint[1] + 'px',
                                left: showPoint[0] + 'px'
                            });
                        }
                    }, 800);
                    me.eyedropperTip.isHidden = false;
                }
                /** coauthoring begin **/
                else if (type===Asc.c_oAscMouseMoveDataTypes.LockedObject && me.mode.isEdit && me.isUserVisible(moveData.get_UserId())) { // 2 - locked object
                    var src;
                    if (me.usertipcount >= me.usertips.length) {
                        src = $(document.createElement("div"));
                        src.addClass('username-tip');
                        src.css({height: me._TtHeight + 'px', 'line-height': me._TtHeight + 'px', position: 'absolute', zIndex: '900', visibility: 'visible'});
                        $(document.body).append(src);
                        if (me.userTooltip) {
                            src.on('mouseover', me.wrapEvents.userTipMousover);
                            src.on('mouseout', me.wrapEvents.userTipMousout);
                        }

                        me.usertips.push(src);
                    }
                    src = me.usertips[me.usertipcount];
                    me.usertipcount++;

                    ToolTip = me.getUserName(moveData.get_UserId());

                    showPoint = [moveData.get_X()+me._XY[0], moveData.get_Y()+me._XY[1]];
                    var maxwidth = showPoint[0];
                    showPoint[0] = me._BodyWidth - showPoint[0];
                    showPoint[1] -= ((moveData.get_LockedObjectType()==2) ? me._TtHeight : 0);

                    if (showPoint[1] > me._XY[1] && showPoint[1]+me._TtHeight < me._XY[1]+me._Height)  {
                        src.text(ToolTip);
                        src.css({visibility: 'visible', top: showPoint[1] + 'px', right: showPoint[0] + 'px', 'max-width': maxwidth + 'px'});
                    }
                }
                /** coauthoring end **/
            }
        };

        dh.onShowForeignCursorLabel = function(UserId, X, Y, color) {
            if (!this.isUserVisible(UserId)) return;

            /** coauthoring begin **/
            var me = this;
            var src;
            for (var i=0; i<me.fastcoauthtips.length; i++) {
                if (me.fastcoauthtips[i].attr('userid') == UserId) {
                    src = me.fastcoauthtips[i];
                    break;
                }
            }

            if (!src) {
                src = $(document.createElement("div"));
                src.addClass('username-tip');
                src.attr('userid', UserId);
                src.css({height: me._TtHeight + 'px', 'line-height': me._TtHeight + 'px', position: 'absolute', zIndex: '900', display: 'none', 'pointer-events': 'none',
                    'background-color': '#'+Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())});
                src.text(me.getUserName(UserId));
                $('#id_main_parent').append(src);
                me.fastcoauthtips.push(src);
                src.fadeIn(150);
            }
            src.css({top: (Y-me._TtHeight) + 'px', left: X + 'px'});
            /** coauthoring end **/
        };

        dh.onHideForeignCursorLabel = function(UserId) {
            /** coauthoring begin **/
            var me = this;
            for (var i=0; i<me.fastcoauthtips.length; i++) {
                if (me.fastcoauthtips[i].attr('userid') == UserId) {
                    var src = me.fastcoauthtips[i];
                    me.fastcoauthtips[i].fadeOut(150, function(){src.remove()});
                    me.fastcoauthtips.splice(i, 1);
                    break;
                }
            }
            /** coauthoring end **/
        };

        dh.onDialogAddHyperlink = function(isButton) {
            var win, props, text;
            var me = this;
            if (me.api && me.mode.isEdit && !me._isDisabled && !PE.getController('LeftMenu').leftMenu.menuFile.isVisible()){
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        props = dlg.getSettings();
                        (text!==false)
                            ? me.api.add_Hyperlink(props)
                            : me.api.change_Hyperlink(props);
                    }

                    me.editComplete();
                };

                text = me.api.can_AddHyperlink();

                var _arr = [];
                for (var i=0; i<me.api.getCountPages(); i++) {
                    _arr.push({
                        displayValue: i+1,
                        value: i
                    });
                }
                if (text !== false) {
                    win = new PE.Views.HyperlinkSettingsDialog({
                        api: me.api,
                        appOptions: me.mode,
                        handler: handlerDlg,
                        type: isButton===true ? c_oHyperlinkType.InternalLink : undefined,
                        slides: _arr
                    });

                    if (isButton && (isButton instanceof Asc.CHyperlinkProperty))
                        props = isButton;
                    else {
                        props = new Asc.CHyperlinkProperty()
                        props.put_Text(text);
                    }

                    win.show();
                    win.setSettings(props);
                } else {
                    var selectedElements = me.api.getSelectedElements();
                    if (selectedElements && _.isArray(selectedElements)){
                        _.each(selectedElements, function(el, i) {
                            if (selectedElements[i].get_ObjectType() == Asc.c_oAscTypeSelectElement.Hyperlink)
                                props = selectedElements[i].get_ObjectValue();
                        });
                    }
                    if (props) {
                        win = new PE.Views.HyperlinkSettingsDialog({
                            api: me.api,
                            appOptions: me.mode,
                            handler: handlerDlg,
                            slides: _arr
                        });
                        win.show();
                        win.setSettings(props);
                    }
                }
            }
            Common.component.Analytics.trackEvent('DocumentHolder', 'Add Hyperlink');
        };

        dh.onPaintSlideNum = function (slideNum) {
            var me = this;
            me.checkEditorOffsets();

            if (_.isUndefined(me.slideNumDiv)) {
                me.slideNumDiv = $(document.createElement("div"));
                me.slideNumDiv.addClass('slidenum-div');
                me.slideNumDiv.css({
                    position    : 'absolute',
                    display     : 'block',
                    zIndex      : '900',
                    top         : me._XY[1] + me._Height / 2 + 'px',
                    right       : (me._BodyWidth - me._XY[0] - me._Width + 22) + 'px'
                });
                $(document.body).append(me.slideNumDiv);
            }

            me.slideNumDiv.html(me.documentHolder.txtSlide + ' ' + (slideNum + 1));
            me.slideNumDiv.show();
        };

        dh.onEndPaintSlideNum = function () {
            if (this.slideNumDiv)
                this.slideNumDiv.hide();
        };

        dh.onSpellCheckVariantsFound = function() {
            var me = this;
            var selectedElements = me.api.getSelectedElements(true);
            var props;
            if (selectedElements && _.isArray(selectedElements)){
                for (var i = 0; i <selectedElements.length; i++) {
                    if ( selectedElements[i].get_ObjectType() == Asc.c_oAscTypeSelectElement.SpellCheck) {
                        props = selectedElements[i].get_ObjectValue();
                        me.documentHolder._currentSpellObj = props;
                        break;
                    }
                }
            }
            if (props && props.get_Checked()===false && props.get_Variants() !== null && props.get_Variants() !== undefined) {
                me.documentHolder.addWordVariants();
                if (me.documentHolder.textMenu && me.documentHolder.textMenu.isVisible()) {
                    me.documentHolder.textMenu.alignPosition();
                }
            }
        };

        dh.equationCallback = function(eqObj) {
            eqObj && this.api.asc_SetMathProps(eqObj);
            this.editComplete();
        };

        dh.onApiCurrentPages = function(number) {
            var me = this;
            if (me.documentHolder.currentMenu && me.documentHolder.currentMenu.isVisible() && me._isFromSlideMenu !== true && me._isFromSlideMenu !== number)
                setTimeout(function() {
                    me.documentHolder.currentMenu && me.documentHolder.currentMenu.hide();
                }, 1);

            me._isFromSlideMenu = number;
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
            if (this.mode && !this.mode.isEdit) return;

            var me = this,
                documentHolderView = me.documentHolder,
                chartContainer = documentHolderView.cmpEl.find('#chart-element-container');
            me._state.currentChartRect = asc_CRect;

            me.getCurrentChartProps = function () {
                var selectedElements = me.api.getSelectedElements();
                if (selectedElements && selectedElements.length > 0) {
                    var elType, elValue;
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();

                        if (elType === Asc.c_oAscTypeSelectElement.Chart) {
                            return elValue.get_ChartProperties(); 
                        }
                    }
                }
                return null;
            };
        
            me.chartProps = me.getCurrentChartProps();
        
            if (chartContainer.length < 1) {
                chartContainer = $('<div id="chart-element-container" style="position: absolute; z-index: 990;"><div id="id-document-holder-btn-chart-element"></div></div>');
                documentHolderView.cmpEl.append(chartContainer);
            }

            me.isRtlSheet = me.api ? Common.UI.isRTL() : false;

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

                me._XY = undefined;
                me.checkEditorOffsets();
                var x = asc_CRect.asc_getX(),
                    y = asc_CRect.asc_getY(),
                    width = asc_CRect.asc_getWidth(),
                    height = asc_CRect.asc_getHeight(),
                    btn,
                    btnTop = y,
                    btnWidth = 50,
                    leftMenuWidth = $('#id_panel_thumbnails').outerWidth() || 0,
                    offsetLeft = chartContainer.width() === 40 ? 48 : 40, 
                    leftSide = x - offsetLeft,
                    rightSide = x + width + 10;

                if (me.isRtlSheet) {
                    if (leftSide >= 0) {
                        btn = leftSide;
                    } else if (rightSide + btnWidth <= me._Width - leftMenuWidth) {
                        btn = rightSide;
                    } else {
                        chartContainer.hide();
                        Common.UI.TooltipManager.closeTip('chartElements');
                        return;
                    }
                } else {
                    if (rightSide + btnWidth <= me._Width + 20) {
                        btn = rightSide;
                    } else if (leftSide >= leftMenuWidth) {
                        btn = leftSide;
                    } else {
                        chartContainer.hide();
                        Common.UI.TooltipManager.closeTip('chartElements');
                        return;
                    }
                }

                if (btnTop < 0) btnTop = 0;

                if (y < 0) {
                    var chartBottom = y + height;
                    if (chartBottom < 20) { 
                        chartContainer.hide();
                        Common.UI.TooltipManager.closeTip('chartElements');
                        return;
                    }
                }

                chartContainer.css({
                    left: btn + 'px',
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

        dh.onHideChartElementButton = function() {
            if (!this.documentHolder || !this.documentHolder.cmpEl) return;
            var chartContainer = this.documentHolder.cmpEl.find('#chart-element-container');
            if (chartContainer.is(':visible')) {
                chartContainer.hide();
                Common.UI.TooltipManager.closeTip('chartElements');
            }
        };

        dh.disableChartElementButton = function() {
            var chartContainer = this.documentHolder.cmpEl.find('#chart-element-container'),
                disabled = this._isDisabled  || this._state.chartLocked;

            if (chartContainer.length>0 && chartContainer.is(':visible')) {
                this.btnChartElement.setDisabled(!!disabled);
            }
        };

        dh.onShowSpecialPasteOptions = function(specialPasteShowOptions) {
            if (this.mode && !this.mode.isEdit) return;

            var me = this,
                documentHolder = me.documentHolder;
            var coord  = specialPasteShowOptions.asc_getCellCoord(),
                pasteContainer = documentHolder.cmpEl.find('#special-paste-container'),
                pasteItems = specialPasteShowOptions.asc_getOptions();
            if (!pasteItems) return;

            // Prepare menu container
            if (pasteContainer.length < 1) {
                me._arrSpecialPaste = [];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.paste] = documentHolder.textPaste;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = documentHolder.txtKeepTextOnly;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.picture] = documentHolder.txtPastePicture;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceformatting] = documentHolder.txtPasteSourceFormat;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormatting] = documentHolder.txtPasteDestFormat;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceFormattingEmbedding] = documentHolder.txtSourceEmbed;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormattingEmbedding] = documentHolder.txtDestEmbed;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceFormattingLink] = documentHolder.txtSourceLink;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormattingLink] = documentHolder.txtDestLink;

                pasteContainer = $('<div id="special-paste-container" style="position: absolute;"><div id="id-document-holder-btn-special-paste"></div></div>');
                documentHolder.cmpEl.append(pasteContainer);

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

                var group_prev = -1;
                _.each(pasteItems, function(menuItem, index) {
                    var mnu = new Common.UI.MenuItem({
                        caption: me._arrSpecialPaste[menuItem] + ' (' + me.hkSpecPaste[menuItem] + ')',
                        value: menuItem,
                        checkable: true,
                        toggleGroup : 'specialPasteGroup'
                    }).on('click', _.bind(me.onSpecialPasteItemClick, me));
                    menu.addItem(mnu);
                });
                (menu.items.length>0) && menu.items[0].setChecked(true, true);
            }
            if (coord.asc_getX()<0 || coord.asc_getY()<0) {
                if (pasteContainer.is(':visible')) pasteContainer.hide();
                $(document).off('keyup', this.wrapEvents.onKeyUp);
            } else {
                var offsetLeft = 0;
                var sdkPanelLeft = documentHolder.cmpEl.find('#id_panel_left');
                if (sdkPanelLeft.length)
                    offsetLeft += (sdkPanelLeft.css('display') !== 'none') ? sdkPanelLeft.width() : 0;

                var showPoint = [Math.max(0, coord.asc_getX() + coord.asc_getWidth() + 3 - offsetLeft), coord.asc_getY() + coord.asc_getHeight() + 3];
                if (showPoint[0]>me._Width || showPoint[1]>me._Height) {
                    if (pasteContainer.is(':visible')) pasteContainer.hide();
                    $(document).off('keyup', this.wrapEvents.onKeyUp);
                    return;
                }
                if (showPoint[1] + pasteContainer.height()>me._Height)
                    showPoint[1] = me._Height - pasteContainer.height();
                if (showPoint[0] + pasteContainer.width()>me._Width)
                    showPoint[0] = me._Width - pasteContainer.width();
                if (me.btnSpecialPaste.menu.isVisible() && (parseInt(pasteContainer.css('left')) !== showPoint[0] || parseInt(pasteContainer.css('top')) !== showPoint[1])) {
                    me.btnSpecialPaste.menu.hide();
                }

                pasteContainer.css({left: showPoint[0], top : showPoint[1]});
                pasteContainer.show();
                setTimeout(function() {
                    $(document).on('keyup', me.wrapEvents.onKeyUp);
                }, 10);
            }
            this.disableSpecialPaste();
        };

        dh.onHideSpecialPasteOptions = function() {
            if (!this.documentHolder || !this.documentHolder.cmpEl) return;
            var pasteContainer = this.documentHolder.cmpEl.find('#special-paste-container');
            if (pasteContainer.is(':visible')) {
                pasteContainer.hide();
                $(document).off('keyup', this.wrapEvents.onKeyUp);
            }
        };

        dh.disableSpecialPaste = function() {
            var pasteContainer = this.documentHolder.cmpEl.find('#special-paste-container');
            if (pasteContainer.length>0 && pasteContainer.is(':visible')) {
                this.btnSpecialPaste.setDisabled(!!this._isDisabled);
            }
        };

        dh.initSpecialPasteEvents = function() {
            var me = this;
            me.hkSpecPaste = [];
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.paste] = 'P';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = 'T';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.picture] = 'U';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceformatting] = 'K';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.destinationFormatting] = 'H';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceFormattingEmbedding] = 'K';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.destinationFormattingEmbedding] = 'H';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceFormattingLink] = 'F';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.destinationFormattingLink] = 'L';

            for(var key in me.hkSpecPaste){
                if(me.hkSpecPaste.hasOwnProperty(key)){
                    var keymap = {};
                    keymap[me.hkSpecPaste[key]] = _.bind(me.onSpecialPasteItemClick, me, {value: parseInt(key)});
                    Common.util.Shortcuts.delegateShortcuts({shortcuts:keymap});
                    Common.util.Shortcuts.suspendEvents(me.hkSpecPaste[key], undefined, true);
                }
            }

            me.btnSpecialPaste.menu.on('show:after', function(menu) {
                for (var i = 0; i < menu.items.length; i++) {
                    me.hkSpecPaste[menu.items[i].value] && Common.util.Shortcuts.resumeEvents(me.hkSpecPaste[menu.items[i].value]);
                }
            }).on('hide:after', function(menu) {
                for (var i = 0; i < menu.items.length; i++) {
                    me.hkSpecPaste[menu.items[i].value] && Common.util.Shortcuts.suspendEvents(me.hkSpecPaste[menu.items[i].value], undefined, true);
                }
            });
        };

        dh.onChangeCropState = function(state) {
            this.documentHolder.menuImgCrop && this.documentHolder.menuImgCrop.menu.items[0].setChecked(state, true);
        };

        dh.onDoubleClickOnTableOleObject = function(frameBinary) {
            if (!Common.Controllers.LaunchController.isScriptLoaded()) return;
            if (this.mode.isEdit && !this._isDisabled) {
                var oleEditor = PE.getController('Common.Controllers.ExternalOleEditor').getView('Common.Views.ExternalOleEditor');
                if (oleEditor && frameBinary) {
                    oleEditor.setEditMode(true);
                    oleEditor.show();
                    oleEditor.setOleData(frameBinary);
                }
            }
        };

        dh.addHyperlink = function(item){
            var win, me = this;
            if (me.api) {
                var _arr = [];
                for (var i=0; i<me.api.getCountPages(); i++) {
                    _arr.push({
                        displayValue: i+1,
                        value: i
                    });
                }
                win = new PE.Views.HyperlinkSettingsDialog({
                    api: me.api,
                    appOptions: me.mode,
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            me.api.add_Hyperlink(dlg.getSettings());
                        }
                        me.editComplete();
                    },
                    slides: _arr
                });

                win.show();
                win.setSettings(item.hyperProps.value);

                Common.component.Analytics.trackEvent('DocumentHolder', 'Add Hyperlink');
            }
        };

        dh.editHyperlink = function(item, e){
            var win, me = this;
            if (me.api){
                var _arr = [];
                for (var i=0; i<me.api.getCountPages(); i++) {
                    _arr.push({
                        displayValue: i+1,
                        value: i
                    });
                }
                win = new PE.Views.HyperlinkSettingsDialog({
                    api: me.api,
                    appOptions: me.mode,
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            me.api.change_Hyperlink(win.getSettings());
                        }
                        me.editComplete();
                    },
                    slides: _arr
                });
                win.show();
                win.setSettings(item.hyperProps.value);

                Common.component.Analytics.trackEvent('DocumentHolder', 'Edit Hyperlink');
            }
        };

        dh.removeHyperlink = function(item) {
            if (this.api){
                this.api.remove_Hyperlink();
            }

            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Remove Hyperlink');
        };

        dh.saveAsPicture = function() {
            if(this.api) {
                this.api.asc_SaveDrawingAsPicture();
            }
        };

        dh.editChartClick = function(chart, placeholder){
            if (!Common.Controllers.LaunchController.isScriptLoaded()) return;
            this.api.asc_editChartInFrameEditor();
        };

        dh.onDoubleClickOnChart = function(chart) {
            if (!Common.Controllers.LaunchController.isScriptLoaded()) return;

            if (this.mode.isEdit && !this._isDisabled) {
                var diagramEditor = this.getApplication().getController('Common.Controllers.ExternalDiagramEditor').getView('Common.Views.ExternalDiagramEditor');
                if (diagramEditor && chart) {
                    let x, y;
                    if (this._state.currentChartRect) {
                        this.checkEditorOffsets();

                        diagramEditor.setSize(diagramEditor.initConfig.initwidth, diagramEditor.initConfig.initheight);

                        let dlgW = diagramEditor.getWidth() || diagramEditor.initConfig.initwidth,
                            dlgH = diagramEditor.getHeight() || diagramEditor.initConfig.initheight,
                            rect_x = this._state.currentChartRect.asc_getX(),
                            rect_y = this._state.currentChartRect.asc_getY(),
                            w = this._state.currentChartRect.asc_getWidth(),
                            h = this._state.currentChartRect.asc_getHeight();
                        y = this._XY[1] + rect_y + h;
                        if (y + dlgH > Common.Utils.innerHeight()) {
                            y = this._XY[1] + rect_y - dlgH;
                            if (y<0) {
                                y = Common.Utils.innerHeight() - dlgH;
                            }
                        }
                        x = this._XY[0] + rect_x - (dlgW - w)/2;
                        if (x + dlgW > Common.Utils.innerWidth())
                            x = Common.Utils.innerWidth() - dlgW;
                    }
                    diagramEditor.setEditMode(true);
                    diagramEditor.show(x, y);
                    diagramEditor.setChartData(chart);
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

        dh.onCutCopyPaste = function(item, e) {
            var me = this;
            if (me.api) {
                var res =  (item.value == 'cut') ? me.api.Cut() : ((item.value == 'copy') ? me.api.Copy() : me.api.Paste());
                if (!res) {
                    if (!Common.localStorage.getBool("pe-hide-copywarning")) {
                        (new Common.Views.CopyWarningDialog({
                            handler: function(dontshow) {
                                if (dontshow) Common.localStorage.setItem("pe-hide-copywarning", 1);
                                me.editComplete();
                            }
                        })).show();
                    }
                }
            }
            me.editComplete();
        };

        dh.onInsertImage = function(placeholder, obj, x, y) {
            if (placeholder) {
                this.hideScreenTip();
                this.onHidePlaceholderActions();
            }
            if (this.api)
                (placeholder) ? this.api.asc_addImage(obj) : this.api.ChangeImageFromFile();
            this.editComplete();
        };

        dh.onInsertImageUrl = function(placeholder, obj, x, y) {
            if (!Common.Controllers.LaunchController.isScriptLoaded()) return;

            if (placeholder) {
                this.hideScreenTip();
                this.onHidePlaceholderActions();
            }
            var me = this;
            (new Common.Views.ImageFromUrlDialog({
                handler: function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            var checkUrl = value.replace(/ /g, '');
                            if (!_.isEmpty(checkUrl)) {
                                if (placeholder)
                                    me.api.AddImageUrl([checkUrl], undefined, undefined, obj);
                                else {
                                    var props = new Asc.asc_CImgProperty();
                                    props.put_ImageUrl(checkUrl);
                                    me.api.ImgApply(props, obj);
                                }
                            }
                        }
                    }
                    me.editComplete();
                }
            })).show();
        };

        dh.onClickPlaceholderChart = function(obj, x, y) {
            if (!this.api || !Common.Controllers.LaunchController.isScriptLoaded()) return;

            this._state.placeholderObj = obj;
            var menu = this.placeholderMenuChart,
                menuContainer = menu ? this.documentHolder.cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id)) : null,
                me = this;
            this._fromShowPlaceholder = true;
            Common.UI.Menu.Manager.hideAll();

            if (!menu) {
                this.placeholderMenuChart = menu = new Common.UI.Menu({
                    style: 'width: 364px;padding-top: 12px;',
                    items: [
                        {template: _.template('<div id="id-placeholder-menu-chart" class="menu-insertchart"></div>')}
                    ]
                });
                // Prepare menu container
                menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                this.documentHolder.cmpEl.append(menuContainer);
                menu.render(menuContainer);
                menu.cmpEl.attr({tabindex: "-1"});
                menu.on('hide:after', function(){
                    if (!me._fromShowPlaceholder)
                        me.api.asc_uncheckPlaceholders();
                });

                var picker = new Common.UI.DataView({
                    el: $('#id-placeholder-menu-chart'),
                    parentMenu: menu,
                    showLast: false,
                    // restoreHeight: 421,
                    groups: new Common.UI.DataViewGroupStore(Common.define.chartData.getChartGroupData()),
                    store: new Common.UI.DataViewStore(Common.define.chartData.getChartData()),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-chartlist"><svg width="40" height="40" class=\"icon uni-scale\"><use xlink:href=\"#chart-<%= iconCls %>\"></use></svg></div>')
                });
                picker.on('item:click', function (picker, item, record, e) {
                    me.api.asc_addChartDrawingObject(record.get('type'), me._state.placeholderObj, true);
                });
            }
            menuContainer.css({left: x, top : y});
            menuContainer.attr('data-value', 'prevent-canvas-click');
            this._preventClick = true;
            setTimeout(function() {
                menu.show();

                menu.alignPosition();
                _.delay(function() {
                    menu.cmpEl.find('.dataview').focus();
                }, 10);
            }, 1);
            this._fromShowPlaceholder = false;
        };

        dh.onClickPlaceholderTable = function(obj, x, y) {
            if (!this.api) return;

            this._state.placeholderObj = obj;
            var menu = this.placeholderMenuTable,
                menuContainer = menu ? this.documentHolder.cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id)) : null,
                me = this;
            this._fromShowPlaceholder = true;
            Common.UI.Menu.Manager.hideAll();

            if (!menu) {
                this.placeholderMenuTable = menu = new Common.UI.Menu({
                    cls: 'shifted-left',
                    items: [
                        {template: _.template('<div id="id-placeholder-menu-tablepicker" class="dimension-picker" style="margin: 5px 10px;"></div>')},
                        {caption: me.documentHolder.mniCustomTable, value: 'custom'}
                    ]
                });
                // Prepare menu container
                menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                this.documentHolder.cmpEl.append(menuContainer);
                menu.render(menuContainer);
                menu.cmpEl.attr({tabindex: "-1"});
                menu.on('hide:after', function(){
                    if (!me._fromShowPlaceholder)
                        me.api.asc_uncheckPlaceholders();
                });

                var picker = new Common.UI.DimensionPicker({
                    el: $('#id-placeholder-menu-tablepicker'),
                    minRows: 8,
                    minColumns: 10,
                    maxRows: 8,
                    maxColumns: 10,
                    customClear: true,          // because bug 74394
                });
                picker.on('select', function(picker, columns, rows){
                    me.api.put_Table(columns, rows, me._state.placeholderObj);
                    me.editComplete();
                });
                menu.on('hide:before', function(menu, e){
                    picker.setTableSize(0,0);
                });
                menu.on('item:click', function(menu, item, e){
                    if (item.value === 'custom') {
                        (new Common.Views.InsertTableDialog({
                            handler: function(result, value) {
                                if (result == 'ok')
                                    me.api.put_Table(value.columns, value.rows, me._state.placeholderObj);
                                me.editComplete();
                            }
                        })).show();
                    }
                });
            }
            menuContainer.css({left: x, top : y});
            menuContainer.attr('data-value', 'prevent-canvas-click');
            this._preventClick = true;
            setTimeout(function() {
                menu.show();

                menu.alignPosition();
                _.delay(function() {
                    menu.cmpEl.focus();
                }, 10);
            }, 1);
            this._fromShowPlaceholder = false;
        };

        dh.onClickPlaceholderSmartArt = function (obj, x, y) {
            if (!this.api || !Common.Controllers.LaunchController.isScriptLoaded()) return;

            this._state.placeholderObj = obj;
            var menu = this.placeholderMenuSmartArt,
                menuContainer = menu ? this.documentHolder.cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id)) : null,
                me = this;
            this._fromShowPlaceholder = true;
            Common.UI.Menu.Manager.hideAll();

            if (!menu) {
                this.placeholderMenuSmartArt = menu = new Common.UI.Menu({
                    cls: 'shifted-right',
                    items: []
                });
                var smartArtData = Common.define.smartArt.getSmartArtData();
                smartArtData.forEach(function (item, index) {
                    var length = item.items.length,
                        width = 399;
                    if (length < 5) {
                        width = length * (70 + 8) + 9; // 4px margin + 4px margin
                    }
                    menu.addItem({
                        caption: item.caption,
                        value: item.sectionId,
                        itemId: item.id,
                        itemsLength: length,
                        iconCls: item.icon ? 'menu__icon ' + item.icon : undefined,
                        menu: new Common.UI.Menu({
                            items: [
                                {template: _.template('<div id="placeholder-' + item.id + '" class="menu-add-smart-art margin-left-5" style="width: ' + width + 'px; height: 500px;"></div>')}
                            ],
                            menuAlign: 'tl-tr',
                        })});
                });
                // Prepare menu container
                menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                this.documentHolder.cmpEl.append(menuContainer);
                menu.render(menuContainer);
                menu.cmpEl.attr({tabindex: "-1"});
                menu.on('hide:after', function(){
                    if (!me._fromShowPlaceholder)
                        me.api.asc_uncheckPlaceholders();
                });

                var onShowBeforeSmartArt = function (menu) {
                    menu.items.forEach(function (item, index) {
                        var items = [];
                        for (var i=0; i<item.options.itemsLength; i++) {
                            items.push({
                                isLoading: true
                            });
                        }
                        item.menuPicker = new Common.UI.DataView({
                            el: $('#placeholder-' + item.options.itemId),
                            parentMenu: menu.items[index].menu,
                            itemTemplate: _.template([
                                '<% if (isLoading) { %>',
                                '<div class="loading-item" style="width: 70px; height: 70px;">',
                                '<i class="loading-spinner"></i>',
                                '</div>',
                                '<% } else { %>',
                                '<div>',
                                '<img src="<%= imageUrl %>" width="' + 70 + '" height="' + 70 + '" />',
                                '</div>',
                                '<% } %>'
                            ].join('')),
                            store: new Common.UI.DataViewStore(items),
                            delayRenderTips: true,
                            scrollAlwaysVisible: true,
                            showLast: false
                        });
                        item.menuPicker.on('item:click', function(picker, item, record, e) {
                            if (record && record.get('value') !== null) {
                                me.api.asc_createSmartArt(record.get('value'), me._state.placeholderObj);
                            }
                            Common.NotificationCenter.trigger('edit:complete', me);
                        });
                        item.menuPicker.loaded = false;
                        item.$el.on('mouseenter', function () {
                            if (!item.menuPicker.loaded) {
                                me.documentHolder.fireEvent('smartart:mouseenter', [item.value, menu]);
                            }
                        });
                        item.$el.on('mouseleave', function () {
                            me.documentHolder.fireEvent('smartart:mouseleave', [item.value]);
                        });
                    });
                    menu.off('show:before', onShowBeforeSmartArt);
                };
                menu.on('show:before', onShowBeforeSmartArt);
            }
            menuContainer.css({left: x, top : y});
            menuContainer.attr('data-value', 'prevent-canvas-click');
            this._preventClick = true;
            setTimeout(function() {
                menu.show();

                menu.alignPosition();
                _.delay(function() {
                    menu.cmpEl.focus();
                }, 10);
            }, 1);
            this._fromShowPlaceholder = false;
        };

        dh.onHidePlaceholderActions = function() {
            this.placeholderMenuChart && this.placeholderMenuChart.hide();
            this.placeholderMenuTable && this.placeholderMenuTable.hide();
            this.placeholderMenuSmartArt && this.placeholderMenuSmartArt.hide();
        };

        dh.onClickPlaceholder = function(type, obj, x, y) {
            if (!this.api) return;
            this.hideScreenTip();
            this.onHidePlaceholderActions();
            if (type == AscCommon.PlaceholderButtonType.Video) {
                this.api.asc_AddVideo(obj);
            } else if (type == AscCommon.PlaceholderButtonType.Audio) {
                this.api.asc_AddAudio(obj);
            }
            this.editComplete();
        };

        dh.onImgReplace = function(menu, item, e) {
            var me = this;
            if (item.value==1) {
                me.onInsertImageUrl(false);
            } else if (item.value==2) {
                Common.NotificationCenter.trigger('storage:image-load', 'change');
            } else {
                setTimeout(function(){
                    me.onInsertImage();
                }, 10);
            }
        };

        dh.onLangMenu = function(type, menu, item){
            var me = this;
            if (me.api){
                if (!_.isUndefined(item.langid))
                    me.api.put_TextPrLang(item.langid);

                (type==='para') ? (me.documentHolder._currLang.paraid = item.langid) : (me.documentHolder._currLang.tableid = item.langid);
                me.editComplete();
            }
        };

        dh.onUndo = function () {
            this.api.Undo();
        };

        dh.onPreview = function () {
            var current = this.api.getCurrentPage();
            Common.NotificationCenter.trigger('preview:start', _.isNumber(current) ? current : 0, false, false, true);
        };

        dh.onSelectAll = function () {
            if (this.api){
                this.api.SelectAllSlides();

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Select All Slides');
            }
        };

        dh.onPrintSelection = function () {
            if (this.api){
                var printopt = new Asc.asc_CAdjustPrint();
                printopt.asc_setPrintType(Asc.c_oAscPrintType.Selection);
                var opts = new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86); // if isChrome or isOpera == true use asc_onPrintUrl event
                opts.asc_setAdvancedOptions(printopt);
                this.api.asc_Print(opts);
                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Print Selection');
            }
        };

        dh.onNewSlide = function () {
            if (this.api){
                this._isFromSlideMenu = true;
                this.api.AddSlide();

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Add Slide');
            }
        };

        dh.onDuplicateSlide = function () {
            if (this.api){
                this._isFromSlideMenu = true;
                this.api.DublicateSlide();

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Dublicate Slide');
            }
        };

        dh.onDeleteSlide = function () {
            if (this.api){
                this._isFromSlideMenu = true;
                this.api.DeleteSlide();

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Delete Slide');
            }
        };

        dh.onResetSlide = function () {
            if (this.api){
                this.api.ResetSlide();

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Reset Slide');
            }
        };

        dh.onMoveSlideToStart = function () {
            if (this.api){
                this.api.asc_moveSelectedSlidesToStart();

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Move Slide to Start');
            }
        };

        dh.onMoveSlideToEnd = function () {
            if (this.api){
                this.api.asc_moveSelectedSlidesToEnd();

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Move Slide to End');
            }
        };

        dh.onSlideSettings = function (item) {
            PE.getController('RightMenu').onDoubleClickOnObject(item.options.value);
        };

        dh.onSlideHide = function (item) {
            if (this.api){
                this.api.asc_HideSlides(item.checked);

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Hide Slides');
            }
        };

        dh.onLayoutChange = function (record) {
            if (this.api) {
                this.api.ChangeLayout(record.get('data').idx);
                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Change Layout');
            }
        };

        dh.onThemeChange = function (record) {
            if (this.api) {
                this.api.ChangeTheme(record.get('themeId'), true);
                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Change Layout');
            }
        };

        dh.onTableMerge = function () {
            this.api && this.api.MergeCells();
        };

        dh.onTableSplit = function () {
            var me = this;
            if (me.api) {
                (new Common.Views.InsertTableDialog({
                    split: true,
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                me.api.SplitCell(value.columns, value.rows);
                            }
                            Common.component.Analytics.trackEvent('DocumentHolder', 'Table Split');
                        }
                        me.editComplete();
                    }
                })).show();
            }
        };

        dh.tableCellsVAlign = function(menu, item, e) {
            if (this.api) {
                var properties = new Asc.CTableProp();
                properties.put_CellsVAlign(item.value);
                this.api.tblApply(properties);
            }

            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Table Cell Align');
        };

        dh.onTableDistRows = function () {
            this.api && this.api.asc_DistributeTableCells(false);
            this.editComplete();
        };

        dh.onTableDistCols = function () {
            this.api && this.api.asc_DistributeTableCells(true);
            this.editComplete();
        };

        dh.tableDirection = function(menu, item, e) {
            var me = this;
            if (me.api) {
                var properties = new Asc.CTableProp();
                properties.put_CellsTextDirection(item.options.direction);
                me.api.tblApply(properties);
            }
        };

        dh.onIgnoreSpell = function(item, e){
            this.api && this.api.asc_ignoreMisspelledWord(this.documentHolder._currentSpellObj, !!item.value);
            this.editComplete();
        };

        dh.onToDictionary = function(item, e){
            this.api && this.api.asc_spellCheckAddToDictionary(this.documentHolder._currentSpellObj);
            this.editComplete();
        };

        dh.onTableAdvanced = function(item, e){
            var me = this;
            if (me.api) {
                var selectedElements = me.api.getSelectedElements();

                if (selectedElements && selectedElements.length > 0){
                    var elType, elValue;
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType  = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();

                        if (Asc.c_oAscTypeSelectElement.Table == elType) {
                            (new PE.Views.TableSettingsAdvanced(
                                {
                                    tableProps: elValue,
                                    slideSize: PE.getController('Toolbar').currentPageSize,
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.api.tblApply(value.tableProps);
                                            }
                                        }
                                        me.editComplete();
                                        Common.component.Analytics.trackEvent('DocumentHolder', 'Table Settings Advanced');
                                    }
                                })).show();
                            break;
                        }
                    }
                }
            }
        };

        dh.onImageAdvanced = function(item) {
            var me = this;
            if (me.api){
                var selectedElements = me.api.getSelectedElements();
                if (selectedElements && selectedElements.length>0){
                    var elType, elValue;

                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType  = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();

                        if (Asc.c_oAscTypeSelectElement.Image == elType) {
                            var imgsizeOriginal;

                            if (!me.documentHolder.menuImgOriginalSize.isDisabled()) {
                                imgsizeOriginal = me.api.asc_getCropOriginalImageSize();
                                if (imgsizeOriginal)
                                    imgsizeOriginal = {width:imgsizeOriginal.get_ImageWidth(), height:imgsizeOriginal.get_ImageHeight()};
                            }

                            (new PE.Views.ImageSettingsAdvanced(
                                {
                                    imageProps: elValue,
                                    sizeOriginal: imgsizeOriginal,
                                    slideSize: PE.getController('Toolbar').currentPageSize,
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.api.ImgApply(value.imageProps);
                                            }
                                        }
                                        me.editComplete();
                                        Common.component.Analytics.trackEvent('DocumentHolder', 'Image Settings Advanced');
                                    }
                                })).show();
                            break;
                        }
                    }
                }
            }
        };

        dh.onImgOriginalSize = function(item){
            var me = this;
            if (me.api){
                var originalImageSize = me.api.asc_getCropOriginalImageSize();

                if (originalImageSize) {
                    var properties = new Asc.asc_CImgProperty();

                    properties.put_Width(originalImageSize.get_ImageWidth());
                    properties.put_Height(originalImageSize.get_ImageHeight());
                    properties.put_Rot(0);
                    me.api.ImgApply(properties);
                }

                me.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Set Image Original Size');
            }
        };

        dh.onImgRotate = function(item) {
            var properties = new Asc.asc_CShapeProperty();
            properties.asc_putRotAdd((item.value==1 ? 90 : 270) * 3.14159265358979 / 180);
            this.api.ShapeApply(properties);
            this.editComplete();
        };

        dh.onImgFlip = function(item) {
            var properties = new Asc.asc_CShapeProperty();
            if (item.value==1)
                properties.asc_putFlipHInvert(true);
            else
                properties.asc_putFlipVInvert(true);
            this.api.ShapeApply(properties);
            this.editComplete();
        };

        dh.onImgCrop = function(menu, item) {
            if (item.value == 1) {
                this.api.asc_cropFill();
            } else if (item.value == 2) {
                this.api.asc_cropFit();
            } else {
                item.checked ? this.api.asc_startEditCrop() : this.api.asc_endEditCrop();
            }
            this.editComplete();
        };

        dh.onImgResetCrop = function() {
            if (this.api) {
                var properties = new Asc.asc_CImgProperty();
                properties.put_ResetCrop(true);
            }
            this.api.ShapeApply(properties);
            this.editComplete();
        };

        dh.onImgEditPoints = function(item) {
            this.api && this.api.asc_editPointsGeometry();
        };

        dh.onShapeAdvanced = function(item) {
            var me = this;
            if (me.api){
                var selectedElements = me.api.getSelectedElements();
                if (selectedElements && selectedElements.length>0){
                    var elType, elValue;
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();
                        if (Asc.c_oAscTypeSelectElement.Shape == elType) {
                            (new PE.Views.ShapeSettingsAdvanced(
                                {
                                    shapeProps: elValue,
                                    slideSize: PE.getController('Toolbar').currentPageSize,
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.api.ShapeApply(value.shapeProps);
                                            }
                                        }
                                        me.editComplete();
                                        Common.component.Analytics.trackEvent('DocumentHolder', 'Image Shape Advanced');
                                    }
                                })).show();
                            break;
                        }
                    }
                }
            }
        };

        dh.onParagraphAdvanced = function(item) {
            var me = this;
            if (me.api){
                var selectedElements = me.api.getSelectedElements();

                if (selectedElements && selectedElements.length > 0){
                    var elType, elValue;
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType  = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();

                        if (Asc.c_oAscTypeSelectElement.Paragraph == elType) {
                            (new PE.Views.ParagraphSettingsAdvanced(
                                {
                                    paragraphProps: elValue,
                                    api: me.api,
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.api.paraApply(value.paragraphProps);
                                            }
                                        }
                                        me.editComplete();
                                        Common.component.Analytics.trackEvent('DocumentHolder', 'Image Paragraph Advanced');
                                    }
                                })).show();
                            break;
                        }
                    }
                }
            }
        };

        dh.onChartAdvanced = function(item, e){
            var me = this;
            if (me.api) {
                var selectedElements = me.api.getSelectedElements();

                if (selectedElements && selectedElements.length > 0){
                    var elType, elValue;
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType  = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();

                        if (Asc.c_oAscTypeSelectElement.Chart == elType) {
                            (new PE.Views.ChartSettingsAdvanced(
                                {
                                    chartProps: elValue,
                                    slideSize: PE.getController('Toolbar').currentPageSize,
                                    chartSettings: me.api.asc_getChartSettings(),
                                    api : me.api,
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.api.ChartApply(value.chartProps);
                                            }
                                        }
                                        me.editComplete();
                                        Common.component.Analytics.trackEvent('DocumentHolder', 'Chart Settings Advanced');
                                    }
                                })).show();
                            break;
                        }
                    }
                }
            }
        };

        dh.onGroupImg = function(item) {
            this.api && this.api.groupShapes();
            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Group Image');
        };

        dh.onUnGroupImg = function(item) {
            this.api && this.api.unGroupShapes();
            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'UnGroup Image');
        };

        dh.onArrangeFront = function(item) {
            this.api && this.api.shapes_bringToFront();
            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Bring To Front');
        };

        dh.onArrangeBack = function(item) {
            this.api && this.api.shapes_bringToBack();
            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Bring To Back');
        };

        dh.onArrangeForward = function(item) {
            this.api && this.api.shapes_bringForward();
            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Send Forward');
        };

        dh.onArrangeBackward = function(item) {
            this.api && this.api.shapes_bringBackward();
            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Send Backward');
        };

        dh.onImgShapeAlign = function (menu, item) {
            var me = this;
            if (me.api) {
                var value = me.api.asc_getSelectedDrawingObjectsCount()<2 || Common.Utils.InternalSettings.get("pe-align-to-slide");
                value = value ? Asc.c_oAscObjectsAlignType.Slide : Asc.c_oAscObjectsAlignType.Selected;
                if (item.value < 6) {
                    me.api.put_ShapesAlign(item.value, value);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Shape Align');
                } else if (item.value == 6) {
                    me.api.DistributeHorizontally(value);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Distribute Horizontally');
                } else if (item.value == 7){
                    me.api.DistributeVertically(value);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Distribute Vertically');
                }
                me.editComplete();
            }
        };

        dh.onShapesMerge  = function(menu, item, e) {
            var me = this;
            if (item && item.value) {
                me.api.asc_mergeSelectedShapes(item.value);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Shapes Merge');
            }
            me.editComplete();
        };

        dh.onParagraphVAlign = function (menu, item) {
            var me = this;
            if (me.api) {
                var properties = new Asc.asc_CShapeProperty();
                properties.put_VerticalTextAlign(item.value);

                me.api.ShapeApply(properties);
            }

            me.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Text Vertical Align');
        };

        dh.onParagraphDirection = function(menu, item) {
            var me = this;
            if (me.api) {
                var properties = new Asc.asc_CShapeProperty();
                properties.put_Vert(item.options.direction);
                me.api.ShapeApply(properties);
            }
            me.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Text Direction');
        };

        dh.tableSelectText = function(menu, item) {
            if (this.api) {
                switch (item.value) {
                    case 0:
                        this.api.selectRow();
                        break;
                    case 1:
                        this.api.selectColumn();
                        break;
                    case 2:
                        this.api.selectCell();
                        break;
                    case 3:
                        this.api.selectTable();
                        break;
                }
            }
        };

        dh.tableInsertText = function(menu, item) {
            if (this.api) {
                switch (item.value) {
                    case 0:
                        this.api.addColumnLeft();
                        break;
                    case 1:
                        this.api.addColumnRight();
                        break;
                    case 2:
                        this.api.addRowAbove();
                        break;
                    case 3:
                        this.api.addRowBelow();
                        break;
                }
            }
        };

        dh.tableDeleteText = function(menu, item) {
            if (this.api) {
                switch (item.value) {
                    case 0:
                        this.api.remRow();
                        break;
                    case 1:
                        this.api.remColumn();
                        break;
                    case 2:
                        this.api.remTable();
                        break;
                }
            }
        };

        dh.onSpecialPasteItemClick = function(item, e) {
            if (this.api) {
                this.api.asc_SpecialPaste(item.value);
                var menu = this.btnSpecialPaste.menu;
                if (!item.cmpEl) {
                    for (var i = 0; i < menu.items.length; i++) {
                        menu.items[i].setChecked(menu.items[i].value===item.value, true);
                    }
                }
                setTimeout(function(){
                    menu.hide();
                }, 100);
            }
            return false;
        };

        dh.onGuidesClick = function(menu, item) {
            if (item.value == 'del-guide' && item.options.guideId)
                this.documentHolder.fireEvent('guides:delete', [item.options.guideId]);
            else if (item.value === 'add-vert' || item.value === 'add-hor')
                this.documentHolder.fireEvent('guides:add', [item.value]);
            else if (item.value === 'clear')
                this.documentHolder.fireEvent('guides:clear');
            else if (item.value === 'smart')
                this.documentHolder.fireEvent('guides:smart', [item.isChecked()]);
            else
                this.documentHolder.fireEvent('guides:show', [item.isChecked()]);
        };

        dh.onGridlinesClick = function(menu, item) {
            if (item.value === 'custom')
                this.documentHolder.fireEvent('gridlines:custom');
            else if (item.value === 'snap')
                this.documentHolder.fireEvent('gridlines:snap', [item.isChecked()]);
            else if (item.value === 'show')
                this.documentHolder.fireEvent('gridlines:show', [item.isChecked()]);
            else
                this.documentHolder.fireEvent('gridlines:spacing', [item.value]);
        };

        dh.onRulersClick = function(item) {
            this.documentHolder.fireEvent('rulers:change', [item.isChecked()]);
        };

        dh.onTrackGuide = function(dPos, x, y) {
            var tip = this.guideTip;
            if (dPos === undefined || x<0 || y<0) {
                if (!tip.isHidden && tip.ref) {
                    tip.ref.hide();
                    tip.ref = undefined;
                    tip.text = '';
                    tip.isHidden = true;
                }
            } else {
                this.checkEditorOffsets();
                if (!tip.parentEl) {
                    tip.parentEl = $('<div id="tip-container-guide" style="position: absolute; z-index: 10000;"></div>');
                    this.documentHolder.cmpEl.append(tip.parentEl);
                }

                var str = dPos.toFixed(2);
                if (tip.ref && tip.ref.isVisible()) {
                    if (tip.text != str) {
                        tip.text = str;
                        tip.ref.setTitle(str);
                        tip.ref.updateTitle();
                    }
                }

                if (!tip.ref || !tip.ref.isVisible()) {
                    tip.text = str;
                    tip.ref = new Common.UI.Tooltip({
                        owner   : tip.parentEl,
                        html    : true,
                        title   : str
                    });

                    tip.ref.show([-10000, -10000]);
                    tip.isHidden = false;
                }
                var showPoint = [x, y];
                showPoint[0] += (this._XY[0] + 6);
                showPoint[1] += (this._XY[1] - 20 - tip.ttHeight);

                var tipwidth = tip.ref.getBSTip().$tip.width();
                if (showPoint[0] + tipwidth > this._BodyWidth )
                    showPoint[0] = this._BodyWidth - tipwidth - 20;

                tip.ref.getBSTip().$tip.css({
                    top : showPoint[1] + 'px',
                    left: showPoint[0] + 'px'
                });
            }
        };

        dh.onShowMathTrack = function(bounds) {
            if (this.mode && !this.mode.isEdit) return;

            this.lastMathTrackBounds = bounds;
            if (!Common.Controllers.LaunchController.isScriptLoaded()) {
                this.showMathTrackOnLoad = true;
                return;
            }
            if (bounds[3] < 0 || Common.Utils.InternalSettings.get('pe-equation-toolbar-hide')) {
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
                        isEqToolbarHide = Common.Utils.InternalSettings.get('pe-equation-toolbar-hide');

                    menu.items[5].setChecked(eq===Asc.c_oAscMathInputType.Unicode);
                    menu.items[6].setChecked(eq===Asc.c_oAscMathInputType.LaTeX);
                    menu.items[8].options.isToolbarHide = isEqToolbarHide;
                    menu.items[8].setCaption(isEqToolbarHide ? me.documentHolder.showEqToolbar : me.documentHolder.hideEqToolbar, true);
                };
                me.equationSettingsBtn.menu.on('item:click', _.bind(me.convertEquation, me));
                me.equationSettingsBtn.menu.on('show:before', function(menu) {
                    bringForward();
                    menu.options.initMenu();
                });
                me.equationSettingsBtn.menu.on('hide:after', sendBackward);
            }

            var showPoint = [(bounds[0] + bounds[2])/2 - eqContainer.outerWidth()/2, bounds[1] - eqContainer.outerHeight() - 10];
            (showPoint[0]<0) && (showPoint[0] = 0);
            if (showPoint[1]<0) {
                showPoint[1] = bounds[3] + 10;
            }
            showPoint[1] = Math.min(me._Height - eqContainer.outerHeight(), Math.max(0, showPoint[1]));
            eqContainer.css({left: showPoint[0], top : showPoint[1]});

            this.checkEditorOffsets();

            var diffDown = me._Height - showPoint[1] - eqContainer.outerHeight(),
                diffUp = me._XY[1] + showPoint[1],
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

        dh.onHideMathTrack = function() {
            if (!this.documentHolder || !this.documentHolder.cmpEl) return;
            if (!Common.Controllers.LaunchController.isScriptLoaded()) {
                this.showMathTrackOnLoad = false;
                return;
            }
            var eqContainer = this.documentHolder.cmpEl.find('#equation-container');
            if (eqContainer.is(':visible')) {
                eqContainer.hide();
            }
        };

        dh.disableEquationBar = function() {
            var eqContainer = this.documentHolder.cmpEl.find('#equation-container'),
                disabled = this._isDisabled || this._state.equationLocked;

            if (eqContainer.length>0 && eqContainer.is(':visible')) {
                this.equationBtns.forEach(function(item){
                    item && item.setDisabled(!!disabled);
                });
                this.equationSettingsBtn.setDisabled(!!disabled);
            }
        };

        dh.convertEquation = function(menu, item, e) {
            if (this.api) {
                if (item.options.type=='input') {
                    this.api.asc_SetMathInputType(item.value);
                    Common.localStorage.setBool("pe-equation-input-latex", item.value === Asc.c_oAscMathInputType.LaTeX)
                } else if (item.options.type=='view')
                    this.api.asc_ConvertMathView(item.value.linear, item.value.all);
                else if(item.options.type=='hide') {
                    item.options.isToolbarHide = !item.options.isToolbarHide;
                    Common.Utils.InternalSettings.set('pe-equation-toolbar-hide', item.options.isToolbarHide);
                    Common.localStorage.setBool('pe-equation-toolbar-hide', item.options.isToolbarHide);
                    if(item.options.isToolbarHide) this.onHideMathTrack();
                    else this.onShowMathTrack(this.lastMathTrackBounds);
                }
            }
        };

        dh.onLockViewProps = function(lock) {
            Common.Utils.InternalSettings.set("pe-lock-view-props", lock);

            var me = this,
                currentMenu = me.documentHolder.currentMenu;
            if (currentMenu && currentMenu.isVisible() && me.documentHolder.slideMenu===currentMenu){
                if (me.api.asc_getCurrentFocusObject() !== 0 ){ // not thumbnails
                    if (!me._isDisabled && me.mode.isEdit) { // update slide menu items
                        var obj = me.fillMenuProps(me.api.getSelectedElements());
                        if (obj) {
                            if (obj.menu_to_show===currentMenu) {
                                currentMenu.options.initMenu(obj.menu_props);
                                currentMenu.alignPosition();
                            }
                        }
                    }
                }
            }
        };

        dh.onPluginContextMenu = function(data) {
            if (data && data.length>0 && this.documentHolder && this.documentHolder.currentMenu && this.documentHolder.currentMenu.isVisible()){
                this.documentHolder.updateCustomItems(this.documentHolder.currentMenu, data);
            }
        };

        dh.onAnimEffect = function (menu, item) {
            if (item.value === 'remove') {
                this.api.asc_RemoveSelectedAnimEffects();
            } else {
                this.api.asc_SetSelectedAnimEffectsStartType(item.value);
            }
        };

        dh.onInsertMaster = function () {
            this.api.asc_AddMasterSlide();
        };

        dh.onInsertLayout = function () {
            this.api.asc_AddSlideLayout();
        };

        dh.onDuplicateMaster = function () {
            this.api.asc_DuplicateMaster();
        };

        dh.onPreserveMaster = function(item) {
            this.api.asc_setPreserveSlideMaster(item.checked);
        };

        dh.onRemoveUnpreserveMasters = function(deleteMasterCallback) {
            const me = this;
            Common.UI.warning({
                msg: me.documentHolder.textRemoveUnpreserveMasters,
                buttons: ['yes', 'no'],
                primary: 'yes',
                callback: function(btn){
                    deleteMasterCallback(btn === 'yes');
                }
            });
        };

        dh.onDuplicateLayout = function () {
            this.api.asc_DuplicateLayout();
        };

        dh.onDeleteMaster = function () {
            this.api.asc_DeleteMaster();
        };

        dh.onDeleteLayout = function () {
            this.api.asc_DeleteLayout();
        };

        dh.onRename = function() {
            var me = this;
            var currentName = '';
            var selectedElements = me.api.getSelectedElements();
            var isMaster;
            if (selectedElements && _.isArray(selectedElements)) {
                _.each(selectedElements, function(element) {
                    if (Asc.c_oAscTypeSelectElement.Slide == element.get_ObjectType()) {
                        var elValue = element.get_ObjectValue();
                        isMaster = elValue.get_IsMasterSelected();
                        currentName = isMaster ? elValue.get_MasterName() : elValue.get_LayoutName();
                    }
                });
            }
            new Common.Views.TextInputDialog({
                title: isMaster ? me.textRenameTitleMaster : me.textRenameTitleLayout,
                label: isMaster ? me.textNameMaster : me.textNameLayout,
                value: currentName || '',
                inputConfig: {
                    allowBlank  : false,
                    validation: function(value) {
                        return value.length<255 ? true : me.textLongName;
                    }
                },
                handler: function(result, value) {
                    if (result === 'ok' && value) {
                        me.api[isMaster ? 'asc_SetMasterName' : 'asc_SetLayoutName'](value);
                    }
                }
            }).show();
        };
    }
});