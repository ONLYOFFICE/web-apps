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

/**
 *  EditContainer.js
 *  Spreadsheet Editor
 *
 *  Created by Alexander Yuzhin on 12/6/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */
define([
    'core',
    'jquery',
    'underscore',
    'backbone'
], function (core, $, _, Backbone) {
    'use strict';

    SSE.Controllers.EditContainer = Backbone.Controller.extend(_.extend((function() {
        // Private
        var _settings = [];

        return {
            models: [],
            collections: [],
            views: [],

            initialize: function() {
                //
            },

            setApi: function(api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onFocusObject',      _.bind(this.onApiFocusObject, this)); //????
                this.api.asc_registerCallback('asc_onSelectionChanged', _.bind(this.onApiSelectionChanged, this));
            },

            onLaunch: function() {
                //
            },

            showModal: function() {
                var me = this,
                    mainView = SSE.getController('Editor').getView('Editor').f7View,
                    isAndroid = Framework7.prototype.device.android === true;

                if ($$('.container-edit.modal-in').length > 0) {
                    // myApp.closeModal('.picker-modal.edit.modal-in');
                    // me.fireEvent('editcontainer:error', [this, 'alreadyOpen']);
                    return;
                }

                uiApp.closeModal();

                me._showByStack(Common.SharedSettings.get('phone'));

                SSE.getController('Toolbar').getView('Toolbar').hideSearch();
            },

            hideModal: function () {
                if (this.picker) {
                    uiApp.closeModal(this.picker);
                }
            },

            _emptyEditController: function () {
                var layout =
                    '<div class="content-block inset">' +
                        '<div class="content-block-inner"> ' +
                            '<p>Select object to edit</p>' +
                        '</div>' +
                    '</div>';

                return {
                    caption: this.textSettings,
                    layout: layout
                }
            },

            _layoutEditorsByStack: function () {
                var me = this,
                    editors = [];

                if (_settings.length < 1) {
                    editors.push(me._emptyEditController());
                } else {
                    if (_.contains(_settings, 'cell')) {
                        editors.push({
                            caption: me.textCell,
                            id: 'edit-cell',
                            layout: SSE.getController('EditCell').getView('EditCell').rootLayout()
                        })
                    }
                    if (_.contains(_settings, 'table')) {
                        editors.push({
                            caption: me.textTable,
                            id: 'edit-table',
                            layout: SSE.getController('EditTable').getView('EditTable').rootLayout()
                        })
                    }
                    if (_.contains(_settings, 'shape')) {
                        editors.push({
                            caption: me.textShape,
                            id: 'edit-shape',
                            layout: SSE.getController('EditShape').getView('EditShape').rootLayout()
                        })
                    }
                    if (_.contains(_settings, 'image')) {
                        editors.push({
                            caption: me.textImage,
                            id: 'edit-image',
                            layout: SSE.getController('EditImage').getView('EditImage').rootLayout()
                        })
                    }
                    if (_.contains(_settings, 'chart')) {
                        editors.push({
                            caption: me.textChart,
                            id: 'edit-chart',
                            layout: SSE.getController('EditChart').getView('EditChart').rootLayout()
                        })
                    }
                    if (_.contains(_settings, 'text')) {
                        editors.push({
                            caption: me.textText,
                            id: 'edit-text',
                            layout: SSE.getController('EditText').getView('EditText').rootLayout()
                        })
                    }
                    if (_.contains(_settings, 'hyperlink')) {
                        editors.push({
                            caption: me.textHyperlink,
                            id: 'edit-link',
                            layout: SSE.getController('EditHyperlink').getView('EditHyperlink').rootLayout()
                        })
                    }
                }

                return editors;
            },

            _showByStack: function(isPhone) {
                var me = this,
                    mainView = SSE.getController('Editor').getView('Editor').f7View,
                    isAndroid = Framework7.prototype.device.android === true,
                    layoutEditors = me._layoutEditorsByStack();

                if ($$('.container-edit.modal-in').length > 0) {
                    return;
                }

                // Navigation bar
                var $layoutNavbar = $(
                    '<div class="navbar">' +
                        '<div data-page="index" class="navbar-inner">' +
                            '<div class="center sliding categories"></div>' +
                            (isPhone ? '<div class="right sliding"><a href="#" class="link icon-only close-picker"><i class="icon icon-expand-down"></i></a></div>' : '') +
                        '</div>' +
                    '</div>'
                );

                if (layoutEditors.length < 2) {
                    $layoutNavbar
                        .find('.center')
                        .removeClass('categories')
                        .html(layoutEditors[0].caption);
                } else {
                    if (isAndroid) {
                        $layoutNavbar
                            .find('.center')
                            .append('<div class="toolbar tabbar"><div data-page="index" class="toolbar-inner"></div></div>');

                        _.each(layoutEditors, function (layout, index) {
                            $layoutNavbar
                                .find('.toolbar-inner')
                                .append(
                                    '<a href="#' + layout.id + '" class="tab-link ' + (index < 1 ? 'active' : '') + '">' + layout.caption + '</a>'
                                );
                        });
                        $layoutNavbar
                            .find('.toolbar-inner')
                            .append('<span class="tab-link-highlight" style="width: ' + (100/layoutEditors.length) + '%;"></span>');
                    } else {
                        $layoutNavbar
                            .find('.center')
                            .append('<div class="buttons-row"></div>');

                        _.each(layoutEditors, function (layout, index) {
                            $layoutNavbar
                                .find('.buttons-row')
                                .append(
                                    '<a href="#' + layout.id + '" class="tab-link button ' + (index < 1 ? 'active' : '') + '">' + layout.caption + '</a>'
                                );
                        });
                    }
                }


                // Content

                var $layoutPages = $(
                    '<div class="pages">' +
                        '<div class="page" data-page="index">' +
                            '<div class="page-content">' +
                                '<div class="tabs-animated-wrap">' +
                                    '<div class="tabs"></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                );

                _.each(layoutEditors, function (editor, index) {
                    $layoutPages.find('.tabs').append(
                        '<div id="' + editor.id + '" class="tab view ' + (index < 1 ? 'active' : '') + '">' +
                            '<div class="pages">' +
                                '<div class="page no-navbar">' +
                                    '<div class="page-content">' +
                                        editor.layout +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>'
                    );
                });

                if (isPhone) {
                    me.picker = $$(uiApp.pickerModal(
                        '<div class="picker-modal settings container-edit">' +
                            '<div class="view edit-root-view navbar-through">' +
                                $layoutNavbar.prop('outerHTML') +
                                $layoutPages.prop('outerHTML') +
                            '</div>' +
                        '</div>'
                    )).on('opened', function () {
                        if (_.isFunction(me.api.asc_OnShowContextMenu)) {
                            me.api.asc_OnShowContextMenu()
                        }
                    }).on('close', function (e) {
                        mainView.showNavbar();
                        Common.NotificationCenter.trigger('layout:changed','navbar', {hidden:false});
                    }).on('closed', function () {
                        if (_.isFunction(me.api.asc_OnHideContextMenu)) {
                            me.api.asc_OnHideContextMenu()
                        }
                    });
                    mainView.hideNavbar();
                    Common.NotificationCenter.trigger('layout:changed','navbar', {hidden:true});
                } else {
                    me.picker = uiApp.popover(
                        '<div class="popover settings container-edit">' +
                            '<div class="popover-angle"></div>' +
                            '<div class="popover-inner">' +
                                '<div class="content-block">' +
                                '<div class="view popover-view edit-root-view navbar-through">' +
                                    $layoutNavbar.prop('outerHTML') +
                                    $layoutPages.prop('outerHTML') +
                                '</div>' +
                            '</div>' +
                        '</div>',
                        $$('#toolbar-edit')
                    );

                    // Prevent hide overlay. Conflict popover and modals.
                    var $overlay = $('.modal-overlay');

                    $$(me.picker).on('opened', function () {
                        $overlay.on('removeClass', function () {
                            if (!$overlay.hasClass('modal-overlay-visible')) {
                                $overlay.addClass('modal-overlay-visible')
                            }
                        });

                        if (_.isFunction(me.api.asc_OnShowContextMenu)) {
                            me.api.asc_OnShowContextMenu()
                        }
                    }).on('close', function () {
                        $overlay.off('removeClass');
                        $overlay.removeClass('modal-overlay-visible')
                    }).on('closed', function () {
                        if (_.isFunction(me.api.asc_OnHideContextMenu)) {
                            me.api.asc_OnHideContextMenu()
                        }
                    });
                }

                $('.container-edit .tab').single('show', function (e) {
                    Common.NotificationCenter.trigger('editcategory:show', e);
                });

                if (isAndroid) {
                    $$('.view.edit-root-view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
                    $$('.view.edit-root-view .navbar').prependTo('.view.edit-root-view > .pages > .page');
                }

                me.rootView = uiApp.addView('.edit-root-view', {
                    dynamicNavbar: true,
                    domCache: true
                });

                Common.NotificationCenter.trigger('editcontainer:show');
            },

            // API handlers

            onApiFocusObject: function (objects) {
                _settings = [];

                // Paragraph  : 0,
                // Table      : 1,
                // Image      : 2,
                // Header     : 3,
                // Shape      : 4,
                // Slide      : 5,
                // Chart      : 6,
                // MailMerge  : 7,
                // TextArt    : 8

                _.each(objects, function(object) {
                    var type = object.get_ObjectType();

                    if (Asc.c_oAscTypeSelectElement.Paragraph == type) {
                        _settings.push('text', 'paragraph');
                    } else if (Asc.c_oAscTypeSelectElement.Table == type) {
                        _settings.push('table');
                    } else if (Asc.c_oAscTypeSelectElement.Image == type) {
                        if (object.get_ObjectValue().get_ChartProperties()) {
                            _settings.push('chart');
                        } else if (object.get_ObjectValue().get_ShapeProperties()) {
                            _settings.push('shape');
                        } else {
                            _settings.push('image');
                        }
                    } else if (Asc.c_oAscTypeSelectElement.Hyperlink == type) {
                        _settings.push('hyperlink');
                    }
                });

                // Exclude shapes if chart exist
                if (_settings.indexOf('chart') > -1) {
                    _settings = _.without(_settings, 'shape');
                }

                _settings = _.uniq(_settings);

                //TODO: DEBUG ONLY
                _settings = [];
            },

            onApiSelectionChanged: function (cellInfo) {
                _settings = [];

                var isCell, isRow, isCol, isAll, isChart, isImage, isTextShape, isShape, isTextChart,
                    selType             = cellInfo.asc_getFlags().asc_getSelectionType(),
                    isCellLocked        = cellInfo.asc_getLocked(),
                    isTableLocked       = cellInfo.asc_getLockedTable()===true,
                    isObjLocked         = false;

                switch (selType) {
                    case Asc.c_oAscSelectionType.RangeCells:    isCell  = true; break;
                    case Asc.c_oAscSelectionType.RangeRow:      isRow   = true; break;
                    case Asc.c_oAscSelectionType.RangeCol:      isCol   = true; break;
                    case Asc.c_oAscSelectionType.RangeMax:      isAll   = true; break;
                    case Asc.c_oAscSelectionType.RangeImage:    isImage = true; break;
                    case Asc.c_oAscSelectionType.RangeShape:    isShape = true; break;
                    case Asc.c_oAscSelectionType.RangeChart:    isChart = true; break;
                    case Asc.c_oAscSelectionType.RangeChartText:isTextChart = true; break;
                    case Asc.c_oAscSelectionType.RangeShapeText: isTextShape = true; break;
                }

                if (isImage || isShape || isChart) {
                    isImage = isShape = isChart = false;
                    var has_chartprops = false;
                    var selectedObjects = this.api.asc_getGraphicObjectProps();

                    for (var i = 0; i < selectedObjects.length; i++) {
                        if (selectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                            var elValue = selectedObjects[i].asc_getObjectValue();
                            isObjLocked = isObjLocked || elValue.asc_getLocked();
                            var shapeProps = elValue.asc_getShapeProperties();

                            if (shapeProps) {
                                if (shapeProps.asc_getFromChart()) {
                                    isChart = true;
                                } else {
                                    // documentHolder.mnuShapeAdvanced.shapeInfo = elValue;
                                    isShape = true;
                                }
                            } else if (elValue.asc_getChartProperties()) {
                                isChart = true;
                                has_chartprops = true;
                            } else {
                                isImage = true;
                            }
                        }
                    }

                    // documentHolder.mnuUnGroupImg.setDisabled(isObjLocked || !this.api.asc_canUnGroupGraphicsObjects());
                    // documentHolder.mnuGroupImg.setDisabled(isObjLocked || !this.api.asc_canGroupGraphicsObjects());
                    // documentHolder.mnuShapeAdvanced.setVisible(isShape && !isImage && !isChart);
                    // documentHolder.mnuShapeAdvanced.setDisabled(isObjLocked);
                    // documentHolder.mnuChartEdit.setVisible(isChart && !isImage && !isShape && has_chartprops);
                    // documentHolder.mnuChartEdit.setDisabled(isObjLocked);
                    // documentHolder.pmiImgCut.setDisabled(isObjLocked);
                    // documentHolder.pmiImgPaste.setDisabled(isObjLocked);
                    // if (showMenu) this.showPopupMenu(documentHolder.imgMenu, {}, event);
                    // documentHolder.mnuShapeSeparator.setVisible(documentHolder.mnuShapeAdvanced.isVisible() || documentHolder.mnuChartEdit.isVisible());
                } else if (isTextShape || isTextChart) {
                    var selectedObjects = this.api.asc_getGraphicObjectProps(),
                        isEquation = false;

                    for (var i = 0; i < selectedObjects.length; i++) {
                        var elType = selectedObjects[i].asc_getObjectType();
                        if (elType == Asc.c_oAscTypeSelectElement.Image) {
                            var value = selectedObjects[i].asc_getObjectValue(),
                                align = value.asc_getVerticalTextAlign(),
                                direct = value.asc_getVert();

                            isObjLocked = isObjLocked || value.asc_getLocked();

                            // documentHolder.menuParagraphTop.setChecked(align == Asc.c_oAscVAlign.Top);
                            // documentHolder.menuParagraphCenter.setChecked(align == Asc.c_oAscVAlign.Center);
                            // documentHolder.menuParagraphBottom.setChecked(align == Asc.c_oAscVAlign.Bottom);
                            //
                            // documentHolder.menuParagraphDirectH.setChecked(direct == Asc.c_oAscVertDrawingText.normal);
                            // documentHolder.menuParagraphDirect90.setChecked(direct == Asc.c_oAscVertDrawingText.vert);
                            // documentHolder.menuParagraphDirect270.setChecked(direct == Asc.c_oAscVertDrawingText.vert270);
                        } else if (elType == Asc.c_oAscTypeSelectElement.Paragraph) {
                            // documentHolder.pmiTextAdvanced.textInfo = selectedObjects[i].asc_getObjectValue();
                            // isObjLocked = isObjLocked || documentHolder.pmiTextAdvanced.textInfo.asc_getLocked();
                        } else if (elType == Asc.c_oAscTypeSelectElement.Math) {
                            // this._currentMathObj = selectedObjects[i].asc_getObjectValue();
                            isEquation = true;
                        }
                    }

                    var hyperInfo = cellInfo.asc_getHyperlink(),
                        can_add_hyperlink = this.api.asc_canAddShapeHyperlink();

                    // documentHolder.menuHyperlinkShape.setVisible(isTextShape && can_add_hyperlink!==false && hyperInfo);
                    // documentHolder.menuAddHyperlinkShape.setVisible(isTextShape && can_add_hyperlink!==false && !hyperInfo);
                    // documentHolder.menuParagraphVAlign.setVisible(isTextChart!==true && !isEquation); // убрать после того, как заголовок можно будет растягивать по вертикали!!
                    // documentHolder.menuParagraphDirection.setVisible(isTextChart!==true && !isEquation); // убрать после того, как заголовок можно будет растягивать по вертикали!!
                    // documentHolder.pmiTextAdvanced.setVisible(documentHolder.pmiTextAdvanced.textInfo!==undefined);
                    //
                    // _.each(documentHolder.textInShapeMenu.items, function(item) {
                    //     item.setDisabled(isObjLocked);
                    // });
                    // documentHolder.pmiTextCopy.setDisabled(false);
                    //
                    // //equation menu
                    // var eqlen = 0;
                    // this._currentParaObjDisabled = isObjLocked;
                    // if (isEquation) {
                    //     eqlen = this.addEquationMenu(4);
                    // } else
                    //     this.clearEquationMenu(4);
                    //
                    // if (showMenu) this.showPopupMenu(documentHolder.textInShapeMenu, {}, event);
                    // documentHolder.textInShapeMenu.items[3].setVisible( documentHolder.menuHyperlinkShape.isVisible() ||
                    //     documentHolder.menuAddHyperlinkShape.isVisible() ||
                    //     documentHolder.menuParagraphVAlign.isVisible() || isEquation);
                }
                // } else if (selType !== Asc.c_oAscSelectionType.RangeImage && selType !== Asc.c_oAscSelectionType.RangeShape &&
                //     selType !== Asc.c_oAscSelectionType.RangeChart && selType !== Asc.c_oAscSelectionType.RangeChartText && selType !== Asc.c_oAscSelectionType.RangeShapeText) {
                //
                //     var isCellEdit = this.api.isCellEdited,
                //         formatTableInfo = cellInfo.asc_getFormatTableInfo(),
                //         isinsparkline = (cellInfo.asc_getSparklineInfo()!==null),
                //         isintable = (formatTableInfo !== null),
                //         ismultiselect = cellInfo.asc_getFlags().asc_getMultiselect();
                //     documentHolder.ssMenu.formatTableName = (isintable) ? formatTableInfo.asc_getTableName() : null;
                //     documentHolder.ssMenu.cellColor = cellInfo.asc_getFill().asc_getColor();
                //     documentHolder.ssMenu.fontColor = cellInfo.asc_getFont().asc_getColor();
                //
                //     documentHolder.pmiInsertEntire.setVisible(isRow||isCol);
                //     documentHolder.pmiInsertEntire.setCaption((isRow) ? this.textInsertTop : this.textInsertLeft);
                //     documentHolder.pmiDeleteEntire.setVisible(isRow||isCol);
                //     documentHolder.pmiInsertCells.setVisible(isCell && !isCellEdit && !isintable);
                //     documentHolder.pmiDeleteCells.setVisible(isCell && !isCellEdit && !isintable);
                //     documentHolder.pmiSelectTable.setVisible(isCell && !isCellEdit && isintable);
                //     documentHolder.pmiInsertTable.setVisible(isCell && !isCellEdit && isintable);
                //     documentHolder.pmiDeleteTable.setVisible(isCell && !isCellEdit && isintable);
                //     documentHolder.pmiSparklines.setVisible(isinsparkline);
                //     documentHolder.pmiSortCells.setVisible((isCell||isAll||cansort) && !isCellEdit);
                //     documentHolder.pmiFilterCells.setVisible((isCell||cansort) && !isCellEdit);
                //     documentHolder.pmiReapply.setVisible((isCell||isAll||cansort) && !isCellEdit);
                //     documentHolder.ssMenu.items[12].setVisible((isCell||isAll||cansort||isinsparkline) && !isCellEdit);
                //     documentHolder.pmiInsFunction.setVisible(isCell||insfunc);
                //     documentHolder.pmiAddNamedRange.setVisible(isCell && !isCellEdit);
                //
                //     if (isintable) {
                //         documentHolder.pmiInsertTable.menu.items[0].setDisabled(!formatTableInfo.asc_getIsInsertRowAbove());
                //         documentHolder.pmiInsertTable.menu.items[1].setDisabled(!formatTableInfo.asc_getIsInsertRowBelow());
                //         documentHolder.pmiInsertTable.menu.items[2].setDisabled(!formatTableInfo.asc_getIsInsertColumnLeft());
                //         documentHolder.pmiInsertTable.menu.items[3].setDisabled(!formatTableInfo.asc_getIsInsertColumnRight());
                //
                //         documentHolder.pmiDeleteTable.menu.items[0].setDisabled(!formatTableInfo.asc_getIsDeleteRow());
                //         documentHolder.pmiDeleteTable.menu.items[1].setDisabled(!formatTableInfo.asc_getIsDeleteColumn());
                //         documentHolder.pmiDeleteTable.menu.items[2].setDisabled(!formatTableInfo.asc_getIsDeleteTable());
                //
                //     }
                //
                //     var hyperinfo = cellInfo.asc_getHyperlink();
                //     documentHolder.menuHyperlink.setVisible(isCell && hyperinfo && !isCellEdit && !ismultiselect);
                //     documentHolder.menuAddHyperlink.setVisible(isCell && !hyperinfo && !isCellEdit && !ismultiselect);
                //
                //     documentHolder.pmiRowHeight.setVisible(isRow||isAll);
                //     documentHolder.pmiColumnWidth.setVisible(isCol||isAll);
                //     documentHolder.pmiEntireHide.setVisible(isCol||isRow);
                //     documentHolder.pmiEntireShow.setVisible(isCol||isRow);
                //     documentHolder.pmiFreezePanes.setVisible(!isCellEdit);
                //     documentHolder.pmiFreezePanes.setCaption(this.api.asc_getSheetViewSettings().asc_getIsFreezePane() ? documentHolder.textUnFreezePanes : documentHolder.textFreezePanes);
                //     documentHolder.pmiEntriesList.setVisible(!isCellEdit);
                //
                //     /** coauthoring begin **/
                //     documentHolder.ssMenu.items[17].setVisible(isCell && !isCellEdit && this.permissions.canCoAuthoring && this.permissions.canComments);
                //     documentHolder.pmiAddComment.setVisible(isCell && !isCellEdit && this.permissions.canCoAuthoring && this.permissions.canComments);
                //     /** coauthoring end **/
                //     documentHolder.pmiCellMenuSeparator.setVisible(isCell || isRow || isCol || isAll || insfunc);
                //     documentHolder.pmiEntireHide.isrowmenu = isRow;
                //     documentHolder.pmiEntireShow.isrowmenu = isRow;
                //
                //     documentHolder.setMenuItemCommentCaptionMode(cellInfo.asc_getComments().length > 0);
                //     commentsController && commentsController.blockPopover(true);
                //
                //     documentHolder.pmiClear.menu.items[1].setDisabled(isCellEdit);
                //     documentHolder.pmiClear.menu.items[2].setDisabled(isCellEdit);
                //     documentHolder.pmiClear.menu.items[3].setDisabled(isCellEdit);
                //     documentHolder.pmiClear.menu.items[4].setDisabled(isCellEdit);
                //
                //     documentHolder.pmiClear.menu.items[3].setVisible(!this.permissions.isEditDiagram);
                //     documentHolder.pmiClear.menu.items[4].setVisible(!this.permissions.isEditDiagram);
                //
                //     var filterInfo = cellInfo.asc_getAutoFilterInfo(),
                //         isApplyAutoFilter = (filterInfo) ? filterInfo.asc_getIsApplyAutoFilter() : false;
                //     filterInfo = (filterInfo) ? filterInfo.asc_getIsAutoFilter() : null;
                //     documentHolder.pmiInsertCells.menu.items[0].setDisabled(isApplyAutoFilter);
                //     documentHolder.pmiDeleteCells.menu.items[0].setDisabled(isApplyAutoFilter);
                //     documentHolder.pmiInsertCells.menu.items[1].setDisabled(isApplyAutoFilter);
                //     documentHolder.pmiDeleteCells.menu.items[1].setDisabled(isApplyAutoFilter);
                //
                //     _.each(documentHolder.ssMenu.items, function(item) {
                //         item.setDisabled(isCellLocked);
                //     });
                //     documentHolder.pmiCopy.setDisabled(false);
                //     documentHolder.pmiInsertEntire.setDisabled(isCellLocked || isTableLocked);
                //     documentHolder.pmiInsertCells.setDisabled(isCellLocked || isTableLocked);
                //     documentHolder.pmiInsertTable.setDisabled(isCellLocked || isTableLocked);
                //     documentHolder.pmiDeleteEntire.setDisabled(isCellLocked || isTableLocked);
                //     documentHolder.pmiDeleteCells.setDisabled(isCellLocked || isTableLocked);
                //     documentHolder.pmiDeleteTable.setDisabled(isCellLocked || isTableLocked);
                //     documentHolder.pmiFilterCells.setDisabled(isCellLocked || isTableLocked|| (filterInfo==null));
                //     documentHolder.pmiSortCells.setDisabled(isCellLocked || isTableLocked|| (filterInfo==null));
                //     documentHolder.pmiReapply.setDisabled(isCellLocked || isTableLocked|| (isApplyAutoFilter!==true));
                //     if (showMenu) this.showPopupMenu(documentHolder.ssMenu, {}, event);
                // }


                if (isChart || isTextChart) {
                    _settings.push('chart');

                    if (isTextChart) {
                        _settings.push('text');
                    }
                } else if (isShape || isTextShape) {
                    _settings.push('shape');

                    if (isTextShape) {
                        _settings.push('text');
                    }
                } else if (isImage) {
                    _settings.push('image');
                } else {
                    _settings.push('cell');

                    if (cellInfo.asc_getHyperlink()) {
                        _settings.push('hyperlink');
                    }
                }
            },

            textSettings: 'Settings',
            textCell: 'Cell',
            textTable: 'Table',
            textShape: 'Shape',
            textImage: 'Image',
            textChart: 'Chart',
            textText: 'Text',
            textHyperlink: 'Hyperlink'

        }
    })(), SSE.Controllers.EditContainer || {}))
});