/*
 *
 * (c) Copyright Ascensio System Limited 2010-2016
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
 *  DocumentHolder.js
 *
 *  DocumentHolder controller
 *
 *  Created by Julia Radzhabova on 3/28/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'common/main/lib/util/utils',
    'common/main/lib/view/CopyWarningDialog',
    'spreadsheeteditor/main/app/view/DocumentHolder',
    'spreadsheeteditor/main/app/view/HyperlinkSettingsDialog',
    'spreadsheeteditor/main/app/view/ParagraphSettingsAdvanced',
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
                }
            };
            me.mouse = {};
            me.popupmenu = false;
            me.rangeSelectionMode = false;
            me.namedrange_locked = false;

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
        },

        onCreateDelayedElements: function(view) {
            var me = this;

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
            view.pmiRowHeight.on('click',                       _.bind(me.onSetSize, me));
            view.pmiColumnWidth.on('click',                     _.bind(me.onSetSize, me));
            view.pmiEntireHide.on('click',                      _.bind(me.onEntireHide, me));
            view.pmiEntireShow.on('click',                      _.bind(me.onEntireShow, me));
            view.pmiFreezePanes.on('click',                     _.bind(me.onFreezePanes, me));
            /** coauthoring begin **/
            view.pmiAddComment.on('click',                      _.bind(me.onAddComment, me));
            /** coauthoring end **/
            view.pmiAddNamedRange.on('click',                   _.bind(me.onAddNamedRange, me));
            view.imgMenu.on('item:click',                       _.bind(me.onImgMenu, me));
            view.menuParagraphVAlign.menu.on('item:click',      _.bind(me.onParagraphVAlign, me));
            view.menuParagraphDirection.menu.on('item:click',   _.bind(me.onParagraphDirection, me));
            view.menuAddHyperlinkShape.on('click',              _.bind(me.onInsHyperlink, me));
            view.menuEditHyperlinkShape.on('click',             _.bind(me.onInsHyperlink, me));
            view.menuRemoveHyperlinkShape.on('click',           _.bind(me.onRemoveHyperlinkShape, me));
            view.pmiTextAdvanced.on('click',                    _.bind(me.onTextAdvanced, me));
            view.mnuShapeAdvanced.on('click',                   _.bind(me.onShapeAdvanced, me));
            view.mnuChartEdit.on('click',                       _.bind(me.onChartEdit, me));

            var documentHolderEl = view.cmpEl;

            if (documentHolderEl) {
                documentHolderEl.on({
                    keydown: function(e) {
                        if (e.keyCode == e.F10 && e.shiftKey) {
                            e.stopEvent();
                            me.showObjectMenu(e);
                        }
                    },
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
            !(this.permissions.canCoAuthoring && this.permissions.isEdit && this.permissions.canComments)
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
            this.api.asc_registerCallback('asc_onSetAFDialog',          _.bind(this.onApiAutofilter, this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onApiCoAuthoringDisconnect, this));
            Common.NotificationCenter.on('api:disconnect',              _.bind(this.onApiCoAuthoringDisconnect, this));
            this.api.asc_registerCallback('asc_onEditCell',             _.bind(this.onApiEditCell, this));
            this.api.asc_registerCallback('asc_onLockDefNameManager',   _.bind(this.onLockDefNameManager, this));
            this.api.asc_registerCallback('asc_onSelectionChanged',     _.bind(this.onSelectionChanged, this));
            this.api.asc_registerCallback('asc_onEntriesListMenu',      _.bind(this.onEntriesListMenu, this));
            this.api.asc_registerCallback('asc_onFormulaCompleteMenu',  _.bind(this.onFormulaCompleteMenu, this));

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
                if (typeof window['AscDesktopEditor'] === 'object') {
                    (item.value == 'cut') ? me.api.asc_Cut() : ((item.value == 'copy') ? me.api.asc_Copy() : me.api.asc_Paste());
                } else {
                    var value = Common.localStorage.getItem("sse-hide-copywarning");
                    if (!(value && parseInt(value) == 1)) {
                        (new Common.Views.CopyWarningDialog({
                            handler: function(dontshow) {
                                (item.value == 'cut') ? me.api.asc_Cut() : ((item.value == 'copy') ? me.api.asc_Copy() : me.api.asc_Paste());
                                if (dontshow) Common.localStorage.setItem("sse-hide-copywarning", 1);
                                Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                            }
                        })).show();
                    } else {
                        (item.value == 'cut') ? me.api.asc_Cut() : ((item.value == 'copy') ? me.api.asc_Copy() : me.api.asc_Paste());
                        Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                    }
                    Common.component.Analytics.trackEvent('ToolBar', 'Copy Warning');
                }
            }
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
                this.api.asc_sortColFilter(item.value, '', undefined, (item.value==Asc.c_oAscSortOptions.ByColorFill) ? this.documentHolder.ssMenu.cellColor : this.documentHolder.ssMenu.fontColor);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Sort Cells');
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
                this.api.asc_enableKeyEvents(false);
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

        onSetSize: function(item) {
            var me = this;
            (new SSE.Views.SetValueDialog({
                title: item.caption,
                startvalue: item.options.action == 'row-height' ? me.api.asc_getRowHeight() : me.api.asc_getColumnWidth(),
                maxvalue: item.options.action == 'row-height' ? Asc.c_oAscMaxRowHeight : Asc.c_oAscMaxColumnWidth,
                step: item.options.action == 'row-height' ? 0.75 : 1,
                defaultUnit: item.options.action == 'row-height' ? Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.pt) : me.textSym,
                handler: function(dlg, result) {
                    if (result == 'ok') {
                        var val = dlg.getSettings();
                        if (!isNaN(val))
                            (item.options.action == 'row-height') ? me.api.asc_setRowHeight(val) : me.api.asc_setColumnWidth(val);
                    }

                    Common.NotificationCenter.trigger('edit:complete', me.documentHolder);
                }
            })).show();
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

        onAddComment: function(item) {
            if (this.api && this.permissions.canCoAuthoring && this.permissions.isEdit && this.permissions.canComments) {
                this.api.asc_enableKeyEvents(false);

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
                Common.component.Analytics.trackEvent('DocumentHolder', 'Text Directio');
            }
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

        onChartEdit: function(item) {
            var me = this;
            var win, props;
            if (me.api){
                props = me.api.asc_getChartObject();
                if (props) {
                    (new SSE.Views.ChartSettingsDlg(
                        {
                            chartSettings: props,
                            api: me.api,
                            handler: function(result, value) {
                                if (result == 'ok') {
                                    if (me.api) {
                                        me.api.asc_editChartDrawingObject(value.chartSettings);
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
                        index_column, index_row;
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
                    }
                }

                var me              = this,
                    showPoint       = [0, 0],
                    /** coauthoring begin **/
                    coAuthTip       = me.tooltips.coauth,
                    commentTip      = me.tooltips.comment,
                    /** coauthoring end **/
                    hyperlinkTip    = me.tooltips.hyperlink,
                    row_columnTip    = me.tooltips.row_column,
                    pos             = [
                        me.documentHolder.cmpEl.offset().left - $(window).scrollLeft(),
                        me.documentHolder.cmpEl.offset().top  - $(window).scrollTop()
                    ];

                hyperlinkTip.isHidden = false;
                row_columnTip.isHidden = false;

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
                        linkstr = props.asc_getTooltip() || (props.asc_getSheet() + '!' + props.asc_getRange());
                    }

                    if (hyperlinkTip.ref && hyperlinkTip.ref.isVisible()) {
                        if (hyperlinkTip.text != linkstr) {
                            hyperlinkTip.ref.hide();
                            hyperlinkTip.isHidden = true;
                        }
                    }

                    if (!hyperlinkTip.ref || !hyperlinkTip.ref.isVisible()) {
                        hyperlinkTip.text = linkstr;
                        hyperlinkTip.ref = new Common.UI.Tooltip({
                            owner   : me.documentHolder,
                            html    : true,
                            title   : linkstr
                        }).on('tooltip:hide', function(tip) {
                            hyperlinkTip.ref = undefined;
                            hyperlinkTip.text = '';
                        });

                        hyperlinkTip.ref.show([-10000, -10000]);
                        hyperlinkTip.isHidden = false;
                    }

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
                } else {
                    me.hideHyperlinkTip();
                }

                if (index_column!==undefined || index_row!==undefined) {
                    var data  = dataarray[(index_column!==undefined) ? (index_column-1) : (index_row-1)];
                    var str = Common.Utils.String.format((index_column!==undefined) ? this.textChangeColumnWidth : this.textChangeRowHeight, data.asc_getSizeCCOrPt().toFixed(2), data.asc_getSizePx());
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
                            owner   : me.documentHolder,
                            html    : true,
                            title   : str
                        }).on('tooltip:hide', function(tip) {
                            row_columnTip.ref = undefined;
                            row_columnTip.text = '';
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
                } else {
                    if (!row_columnTip.isHidden && row_columnTip.ref) {
                        row_columnTip.ref.hide();
                        row_columnTip.isHidden = true;
                    }
                }

                if (me.permissions.isEdit) {
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
                    } else {
                        commentTip.moveCommentId = undefined;
                        if (commentTip.viewCommentId != undefined) {
                            commentTip = {};

                            var commentsController = this.getApplication().getController('Common.Controllers.Comments');
                            if (commentsController) {
                                if (this.permissions.canCoAuthoring && this.permissions.canComments)
                                    setTimeout(function() {commentsController.onApiHideComment(true);}, 200);
                                else
                                    commentsController.onApiHideComment(true);
                            }
                        }
                    }

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
                                coAuthTip.x_point + coAuthTip.XY[0],
                                coAuthTip.y_point + coAuthTip.XY[1]
                            ];

                            !is_sheet_lock && (showPoint[0] = coAuthTip.bodyWidth - showPoint[0]);

                            if (showPoint[1] > coAuthTip.XY[1] &&
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
                    } else {
                        me.hideCoAuthTips();
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
            if (url && this.api.asc_getUrlType(url)>0) {
                var newDocumentPage = window.open(url, '_blank');
                if (newDocumentPage)
                    newDocumentPage.focus();
            }
        },

        onApiAutofilter: function(config) {
            var me = this;
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
                var doc = $(document),
                    docwidth = doc.width(),
                    docheight = doc.height();
                if (x+me.dlgFilter.options.width > docwidth)
                    x = docwidth - me.dlgFilter.options.width - 5;
                if (y+me.dlgFilter.options.height > docheight)
                    y = docheight - me.dlgFilter.options.height - 5;
                me.dlgFilter.show(x, y);
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
                me.tooltips.coauth.bodyWidth = $(window).width();
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
                    if (key === Common.UI.Keys.NUM_PLUS || key === Common.UI.Keys.EQUALITY || (Common.Utils.isOpera && key == 43)){
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
                    } else if (key === Common.UI.Keys.NUM_MINUS || key === Common.UI.Keys.MINUS || (Common.Utils.isOpera && key == 45)){
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

        showObjectMenu: function(event){
            if (this.api && this.permissions.isEdit && !this.mouse.isLeftButtonDown && !this.rangeSelectionMode){
                this.fillMenuProps(this.api.asc_getCellInfo(), true, event);
            }
        },

        onSelectionChanged: function(info){
            if (this.permissions.isEdit && !this.mouse.isLeftButtonDown && !this.rangeSelectionMode &&
                this.currentMenu && this.currentMenu.isVisible()){
                this.fillMenuProps(info);
            }
        },

        fillMenuProps: function(cellinfo, showMenu, event){
            var iscellmenu, isrowmenu, iscolmenu, isallmenu, ischartmenu, isimagemenu, istextshapemenu, isshapemenu, istextchartmenu,
                documentHolder      = this.documentHolder,
                seltype             = cellinfo.asc_getFlags().asc_getSelectionType(),
                isCellLocked        = cellinfo.asc_getLocked(),
                isObjLocked         = false,
                commentsController  = this.getApplication().getController('Common.Controllers.Comments'),
                insfunc             = false,
                cansort             = false;

            if (this.permissions.isEditMailMerge) {
                cansort = (seltype==Asc.c_oAscSelectionType.RangeCells);
            } else if (this.permissions.isEditDiagram) {
                insfunc = (seltype==Asc.c_oAscSelectionType.RangeCells);
            } 
            else {
                switch (seltype) {
                    case Asc.c_oAscSelectionType.RangeCells:    iscellmenu  = true; break;
                    case Asc.c_oAscSelectionType.RangeRow:      isrowmenu   = true; break;
                    case Asc.c_oAscSelectionType.RangeCol:      iscolmenu   = true; break;
                    case Asc.c_oAscSelectionType.RangeMax:      isallmenu   = true; break;
                    case Asc.c_oAscSelectionType.RangeImage:    isimagemenu = true; break;
                    case Asc.c_oAscSelectionType.RangeShape:    isshapemenu = true; break;
                    case Asc.c_oAscSelectionType.RangeChart:    ischartmenu = true; break;
                    case Asc.c_oAscSelectionType.RangeChartText:istextchartmenu = true; break;
                    case Asc.c_oAscSelectionType.RangeShapeText: istextshapemenu = true; break;
                }
            }

            if (isimagemenu || isshapemenu || ischartmenu) {
                if (!showMenu && !documentHolder.imgMenu.isVisible()) return;

                isimagemenu = isshapemenu = ischartmenu = false;
                var has_chartprops = false;
                var selectedObjects = this.api.asc_getGraphicObjectProps();
                for (var i = 0; i < selectedObjects.length; i++) {
                    if (selectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                        var elValue = selectedObjects[i].asc_getObjectValue();
                        isObjLocked = isObjLocked || elValue.asc_getLocked();
                        var shapeprops = elValue.asc_getShapeProperties();
                        if (shapeprops) {
                            if (shapeprops.asc_getFromChart())
                                ischartmenu = true;
                            else {
                                documentHolder.mnuShapeAdvanced.shapeInfo = elValue;
                                isshapemenu = true;
                            }
                        } else if ( elValue.asc_getChartProperties() ) {
                            ischartmenu = true;
                            has_chartprops = true;
                        } 
                        else
                            isimagemenu = true;
                    }
                }

                documentHolder.mnuUnGroupImg.setDisabled(isObjLocked || !this.api.asc_canUnGroupGraphicsObjects());
                documentHolder.mnuGroupImg.setDisabled(isObjLocked || !this.api.asc_canGroupGraphicsObjects());
                documentHolder.mnuShapeAdvanced.setVisible(isshapemenu && !isimagemenu && !ischartmenu);
                documentHolder.mnuShapeAdvanced.setDisabled(isObjLocked);
                documentHolder.mnuChartEdit.setVisible(ischartmenu && !isimagemenu && !isshapemenu && has_chartprops);
                documentHolder.mnuChartEdit.setDisabled(isObjLocked);
                documentHolder.pmiImgCut.setDisabled(isObjLocked);
                documentHolder.pmiImgPaste.setDisabled(isObjLocked);
                if (showMenu) this.showPopupMenu(documentHolder.imgMenu, {}, event);
                documentHolder.mnuShapeSeparator.setVisible(documentHolder.mnuShapeAdvanced.isVisible() || documentHolder.mnuChartEdit.isVisible());
            } else if (istextshapemenu || istextchartmenu) {
                if (!showMenu && !documentHolder.textInShapeMenu.isVisible()) return;
                
                documentHolder.pmiTextAdvanced.textInfo = undefined;

                var selectedObjects = this.api.asc_getGraphicObjectProps();

                for (var i = 0; i < selectedObjects.length; i++) {
                    var elType = selectedObjects[i].asc_getObjectType();
                    if (elType == Asc.c_oAscTypeSelectElement.Image) {
                        var value = selectedObjects[i].asc_getObjectValue(),
                            align = value.asc_getVerticalTextAlign(),
                            direct = value.asc_getVert();
                        isObjLocked = isObjLocked || value.asc_getLocked();
                        documentHolder.menuParagraphTop.setChecked(align == Asc.c_oAscVerticalTextAlign.TEXT_ALIGN_TOP);
                        documentHolder.menuParagraphCenter.setChecked(align == Asc.c_oAscVerticalTextAlign.TEXT_ALIGN_CTR);
                        documentHolder.menuParagraphBottom.setChecked(align == Asc.c_oAscVerticalTextAlign.TEXT_ALIGN_BOTTOM);

                        documentHolder.menuParagraphDirectH.setChecked(direct == Asc.c_oAscVertDrawingText.normal);
                        documentHolder.menuParagraphDirect90.setChecked(direct == Asc.c_oAscVertDrawingText.vert);
                        documentHolder.menuParagraphDirect270.setChecked(direct == Asc.c_oAscVertDrawingText.vert270);
                    } else if (elType == Asc.c_oAscTypeSelectElement.Paragraph) {
                        documentHolder.pmiTextAdvanced.textInfo = selectedObjects[i].asc_getObjectValue();
                        isObjLocked = isObjLocked || documentHolder.pmiTextAdvanced.textInfo.asc_getLocked();
                    }
                }

                var hyperinfo = cellinfo.asc_getHyperlink(),
                    can_add_hyperlink = this.api.asc_canAddShapeHyperlink();

                documentHolder.menuHyperlinkShape.setVisible(istextshapemenu && can_add_hyperlink!==false && hyperinfo);
                documentHolder.menuAddHyperlinkShape.setVisible(istextshapemenu && can_add_hyperlink!==false && !hyperinfo);
                documentHolder.menuParagraphVAlign.setVisible(istextchartmenu!==true); // убрать после того, как заголовок можно будет растягивать по вертикали!!
                documentHolder.menuParagraphDirection.setVisible(istextchartmenu!==true); // убрать после того, как заголовок можно будет растягивать по вертикали!!
                documentHolder.pmiTextAdvanced.setVisible(documentHolder.pmiTextAdvanced.textInfo!==undefined);
                _.each(documentHolder.textInShapeMenu.items, function(item) {
                    item.setDisabled(isObjLocked);
                });
                documentHolder.pmiTextCopy.setDisabled(false);
                if (showMenu) this.showPopupMenu(documentHolder.textInShapeMenu, {}, event);
                documentHolder.textInShapeMenu.items[3].setVisible( documentHolder.menuHyperlinkShape.isVisible() ||
                                                                    documentHolder.menuAddHyperlinkShape.isVisible() ||
                                                                    documentHolder.menuParagraphVAlign.isVisible());
            } else if (!this.permissions.isEditMailMerge && !this.permissions.isEditDiagram || (seltype !== Asc.c_oAscSelectionType.RangeImage && seltype !== Asc.c_oAscSelectionType.RangeShape &&
            seltype !== Asc.c_oAscSelectionType.RangeChart && seltype !== Asc.c_oAscSelectionType.RangeChartText && seltype !== Asc.c_oAscSelectionType.RangeShapeText)) {
                if (!showMenu && !documentHolder.ssMenu.isVisible()) return;
                
                var iscelledit = this.api.isCellEdited,
                    formatTableInfo = cellinfo.asc_getFormatTableInfo(),
                    isintable = (formatTableInfo !== null);
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
                documentHolder.pmiSortCells.setVisible((iscellmenu||isallmenu||cansort) && !iscelledit);
                documentHolder.pmiFilterCells.setVisible((iscellmenu||cansort) && !iscelledit);
                documentHolder.pmiReapply.setVisible((iscellmenu||isallmenu||cansort) && !iscelledit);
                documentHolder.ssMenu.items[12].setVisible((iscellmenu||isallmenu||cansort) && !iscelledit);
                documentHolder.pmiInsFunction.setVisible(iscellmenu||insfunc);
                documentHolder.pmiAddNamedRange.setVisible(iscellmenu && !iscelledit);

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
                documentHolder.menuHyperlink.setVisible(iscellmenu && hyperinfo && !iscelledit);
                documentHolder.menuAddHyperlink.setVisible(iscellmenu && !hyperinfo && !iscelledit);

                documentHolder.pmiRowHeight.setVisible(isrowmenu||isallmenu);
                documentHolder.pmiColumnWidth.setVisible(iscolmenu||isallmenu);
                documentHolder.pmiEntireHide.setVisible(iscolmenu||isrowmenu);
                documentHolder.pmiEntireShow.setVisible(iscolmenu||isrowmenu);
                documentHolder.pmiFreezePanes.setVisible(!iscelledit);
                documentHolder.pmiFreezePanes.setCaption(this.api.asc_getSheetViewSettings().asc_getIsFreezePane() ? documentHolder.textUnFreezePanes : documentHolder.textFreezePanes);

                /** coauthoring begin **/
                documentHolder.ssMenu.items[16].setVisible(iscellmenu && !iscelledit && this.permissions.canCoAuthoring && this.permissions.canComments);
                documentHolder.pmiAddComment.setVisible(iscellmenu && !iscelledit && this.permissions.canCoAuthoring && this.permissions.canComments);
                /** coauthoring end **/
                documentHolder.pmiCellMenuSeparator.setVisible(iscellmenu || isrowmenu || iscolmenu || isallmenu || insfunc);
                documentHolder.pmiEntireHide.isrowmenu = isrowmenu;
                documentHolder.pmiEntireShow.isrowmenu = isrowmenu;

                documentHolder.setMenuItemCommentCaptionMode(cellinfo.asc_getComments().length > 0);
                commentsController && commentsController.blockPopover(true);

                documentHolder.pmiClear.menu.items[1].setDisabled(iscelledit);
                documentHolder.pmiClear.menu.items[2].setDisabled(iscelledit);
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

                _.each(documentHolder.ssMenu.items, function(item) {
                    item.setDisabled(isCellLocked);
                });
                documentHolder.pmiCopy.setDisabled(false);
                documentHolder.pmiSortCells.setDisabled(isCellLocked || (filterInfo==null));
                documentHolder.pmiReapply.setDisabled(isCellLocked || (isApplyAutoFilter!==true));
                if (showMenu) this.showPopupMenu(documentHolder.ssMenu, {}, event);
            } else if (this.permissions.isEditDiagram && seltype == Asc.c_oAscSelectionType.RangeChartText) {
                if (!showMenu && !documentHolder.textInShapeMenu.isVisible()) return;

                documentHolder.pmiTextAdvanced.textInfo = undefined;

                documentHolder.menuHyperlinkShape.setVisible(false);
                documentHolder.menuAddHyperlinkShape.setVisible(false);
                documentHolder.menuParagraphVAlign.setVisible(false); // убрать после того, как заголовок можно будет растягивать по вертикали!!
                documentHolder.menuParagraphDirection.setVisible(false); // убрать после того, как заголовок можно будет растягивать по вертикали!!
                documentHolder.pmiTextAdvanced.setVisible(false);
                documentHolder.textInShapeMenu.items[3].setVisible(false);
                documentHolder.textInShapeMenu.items[8].setVisible(false);
                documentHolder.pmiTextCopy.setDisabled(false);
                if (showMenu) this.showPopupMenu(documentHolder.textInShapeMenu, {}, event);
            }
        },

        showPopupMenu: function(menu, value, event){
            if (!_.isUndefined(menu) && menu !== null){
                Common.UI.Menu.Manager.hideAll();

                var me                  = this,
                    documentHolderView  = me.documentHolder,
                    showPoint           = [event.pageX - documentHolderView.cmpEl.offset().left, event.pageY - documentHolderView.cmpEl.offset().top],
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
            }
        },

        onFormulaCompleteMenu: function(funcarr) {
            if (funcarr) {
                var me                  = this,
                    documentHolderView  = me.documentHolder,
                    menu                = documentHolderView.funcMenu,
                    menuContainer       = documentHolderView.cmpEl.find('#menu-formula-selection');

                for (var i = 0; i < menu.items.length; i++) {
                    menu.removeItem(menu.items[i]);
                    i--;
                }

                _.each(funcarr, function(menuItem, index) {
                    var type = menuItem.asc_getType(),
                        mnu = new Common.UI.MenuItem({
                        iconCls: (type==Asc.c_oAscPopUpSelectorType.Func) ? 'mnu-popup-func': ((type==Asc.c_oAscPopUpSelectorType.Table) ? 'mnu-popup-table' : 'mnu-popup-range') ,
                        caption: menuItem.asc_getName()
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
                        Common.UI.Menu.prototype.onAfterKeydownMenu.call(menu, e);

                        var li;
                        if (arguments.length>1 && arguments[1] instanceof jQuery.Event) {// when typing in cell editor
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
                        } else if (e.keyCode == Common.UI.Keys.TAB)
                            li = $(e.target).closest('li');

                        if (li) {
                            if (li.length>0) li.click();
                            Common.UI.Menu.Manager.hideAll();
                        }
                    };

                    menu.render(menuContainer);
                    menu.cmpEl.attr({tabindex: "-1"});

                    menu.on('hide:after', function() {
                        if (Common.Utils.isIE) me.documentHolder.focus();
                    });
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
                    if (infocus) {
                        me.cellEditor.focus();
                        _.delay(function() {
                            menu.cmpEl.find('li:first a').addClass('focus');
                        }, 10);
                    } else {
                        _.delay(function() {
                            menu.cmpEl.focus();
                            menu.cmpEl.find('li:first a').focus();
                        }, 10);
                    }
                }, 1);
            } else {
                this.documentHolder.funcMenu.hide();
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

        guestText               : 'Guest',
        textCtrlClick           : 'Press CTRL and click link',
        txtRowHeight            : 'Row Height',
        txtHeight               : 'Height',
        txtWidth                : 'Width',
        tipIsLocked             : 'This element is being edited by another user.',
        textChangeColumnWidth   : 'Column Width {0} symbols ({1} pixels)',
        textChangeRowHeight     : 'Row Height {0} points ({1} pixels)',
        textInsertLeft          : 'Insert Left',
        textInsertTop           : 'Insert Top',
        textSym                 : 'sym'

    }, SSE.Controllers.DocumentHolder || {}));
});