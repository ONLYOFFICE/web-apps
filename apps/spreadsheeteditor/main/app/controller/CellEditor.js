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
 *    CellEditor.js
 *
 *    CellEditor Controller
 *
 *    Created by Maxim Kadushkin on 08 April 2014
 *    Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'spreadsheeteditor/main/app/view/CellEditor',
    'spreadsheeteditor/main/app/view/NameManagerDlg'
], function (Viewport) {
    'use strict';

    SSE.Controllers.CellEditor = Backbone.Controller.extend({
        views: [
            'CellEditor'
        ],

        events: function() {
            return {
                'keyup input#ce-cell-name': _.bind(this.onCellName,this),
                'keyup textarea#ce-cell-content': _.bind(this.onKeyupCellEditor,this),
                'blur textarea#ce-cell-content': _.bind(this.onBlurCellEditor,this),
                'click button#ce-btn-expand': _.bind(this.expandEditorField,this),
                'click button#ce-func-label': _.bind(this.onInsertFunction, this)
            };
        },

        initialize: function() {
            this.addListeners({
                'CellEditor': {},
                'Viewport': {
                    'layout:resizedrag': _.bind(this.onLayoutResize, this)
                },
                'Common.Views.Header': {
                    'formulabar:hide': function (state) {
                        this.editor.setVisible(!state);
                        Common.localStorage.setBool('sse-hidden-formula', state);
                        Common.NotificationCenter.trigger('layout:changed', 'celleditor', state?'hidden':'showed');
                    }.bind(this)
                }
            });
        },

        setApi: function(api) {
            this.api = api;

            this.api.isCEditorFocused = false;
            this.api.asc_registerCallback('asc_onSelectionNameChanged', _.bind(this.onApiCellSelection, this));
            this.api.asc_registerCallback('asc_onEditCell', _.bind(this.onApiEditCell, this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiDisconnect,this));
            Common.NotificationCenter.on('api:disconnect', _.bind(this.onApiDisconnect, this));
            Common.NotificationCenter.on('cells:range', _.bind(this.onCellsRange, this));
            this.api.asc_registerCallback('asc_onLockDefNameManager', _.bind(this.onLockDefNameManager, this));
            this.api.asc_registerCallback('asc_onInputKeyDown', _.bind(this.onInputKeyDown, this));

            return this;
        },

        setMode: function(mode) {
            this.mode = mode;

            this.editor.$btnfunc[this.mode.isEdit?'removeClass':'addClass']('disabled');
            this.editor.btnNamedRanges.setVisible(this.mode.isEdit && !this.mode.isEditDiagram && !this.mode.isEditMailMerge);

            if ( this.mode.isEdit ) {
                this.api.asc_registerCallback('asc_onSelectionChanged', _.bind(this.onApiSelectionChanged, this));
            }
        },

        onInputKeyDown: function(e) {
            if (Common.UI.Keys.UP === e.keyCode || Common.UI.Keys.DOWN === e.keyCode ||
                Common.UI.Keys.TAB === e.keyCode || Common.UI.Keys.RETURN === e.keyCode || Common.UI.Keys.ESC === e.keyCode ||
                Common.UI.Keys.LEFT === e.keyCode || Common.UI.Keys.RIGHT === e.keyCode) {
                var menu = $('#menu-formula-selection'); // for formula menu
                if (menu.hasClass('open'))
                    menu.find('.dropdown-menu').trigger('keydown', e);
            } 
        },

        onLaunch: function() {
            this.editor = this.createView('CellEditor',{
                el: '#cell-editing-box'
            }).render();

            this.bindViewEvents(this.editor, this.events);

            this.editor.$el.parent().find('.after').css({zIndex: '4'}); // for spreadsheets - bug 23127
            this.editor.btnNamedRanges.menu.on('item:click', _.bind(this.onNamedRangesMenu, this))
                                           .on('show:before', _.bind(this.onNameBeforeShow, this));
            this.namedrange_locked = false;
        },

        onApiEditCell: function(state) {
            if (state == Asc.c_oAscCellEditorState.editStart){
                this.api.isCellEdited = true;
                this.editor.cellNameDisabled(true);
            } else if (state == Asc.c_oAscCellEditorState.editInCell) {
                this.api.isCEditorFocused = 'clear';
            } else if (state == Asc.c_oAscCellEditorState.editEnd) {
                this.api.isCellEdited = false;
                this.api.isCEditorFocused = false;
                this.editor.cellNameDisabled(false);
            }
            this.editor.$btnfunc.toggleClass('disabled', state == Asc.c_oAscCellEditorState.editText);
        },

        onApiCellSelection: function(info) {
            this.editor.updateCellInfo(info);
        },

        onApiSelectionChanged: function(info) {
            var seltype = info.asc_getFlags().asc_getSelectionType(),
                coauth_disable = (!this.mode.isEditMailMerge && !this.mode.isEditDiagram) ? (info.asc_getLocked() === true || info.asc_getLockedTable() === true) : false;

            var is_chart_text   = seltype == Asc.c_oAscSelectionType.RangeChartText,
                is_chart        = seltype == Asc.c_oAscSelectionType.RangeChart,
                is_shape_text   = seltype == Asc.c_oAscSelectionType.RangeShapeText,
                is_shape        = seltype == Asc.c_oAscSelectionType.RangeShape,
                is_image        = seltype == Asc.c_oAscSelectionType.RangeImage,
                is_mode_2       = is_shape_text || is_shape || is_chart_text || is_chart;

            this.editor.$btnfunc.toggleClass('disabled', is_image || is_mode_2 || coauth_disable);
        },

        onApiDisconnect: function() {
            this.mode.isEdit = false;

            var controller = this.getApplication().getController('FormulaDialog');
            if (controller) {
                controller.hideDialog();
            }

            if (!this.mode.isEdit) {
                $('#ce-func-label', this.editor.el).addClass('disabled');
                this.editor.btnNamedRanges.setVisible(false);
            }
        },

        onCellsRange: function(status) {
            this.editor.cellNameDisabled(status != Asc.c_oAscSelectionDialogType.None);
            this.editor.$btnfunc.toggleClass('disabled', status != Asc.c_oAscSelectionDialogType.None);
        },

        onLayoutResize: function(o, r) {
            if (r == 'cell:edit') {
                if (this.editor.$el.height() > 19) {
                    if (!this.editor.$btnexpand.hasClass('btn-collapse'))
                        this.editor.$btnexpand['addClass']('btn-collapse');
                } else {
                    this.editor.$btnexpand['removeClass']('btn-collapse');
                }
            }
        },

        onCellName: function(e) {
            if (e.keyCode == Common.UI.Keys.RETURN){
                var name = this.editor.$cellname.val();
                if (name && name.length) {
                    this.api.asc_findCell(name);
                }

                Common.NotificationCenter.trigger('edit:complete', this.editor);
            }
        },

        onBlurCellEditor: function() {
            if (this.api.isCEditorFocused == 'clear')
                this.api.isCEditorFocused = undefined;
            else if (this.api.isCellEdited)
                this.api.isCEditorFocused = true;
//            if (Common.Utils.isIE && !$('#menu-formula-selection').hasClass('open')) {// for formula menu
//                this.getApplication().getController('DocumentHolder').documentHolder.focus();
//            }
        },

        onKeyupCellEditor: function(e) {
            if(e.keyCode == Common.UI.Keys.RETURN && !e.altKey){
                this.api.isCEditorFocused = 'clear';
            }
        },

        expandEditorField: function() {
            if (this.editor.$el.height() > 19) {
                this.editor.keep_height = this.editor.$el.height();
                this.editor.$el.height(19);
                this.editor.$btnexpand['removeClass']('btn-collapse');
            } else {
                this.editor.$el.height(this.editor.keep_height||74);
                this.editor.$btnexpand['addClass']('btn-collapse');
            }
            
            Common.NotificationCenter.trigger('layout:changed', 'celleditor');
            Common.NotificationCenter.trigger('edit:complete', this.editor, {restorefocus:true});
        },

        onInsertFunction: function() {
            if ( this.mode.isEdit && !this.editor.$btnfunc['hasClass']('disabled')) {
                var controller = this.getApplication().getController('FormulaDialog');
                if (controller) {
                    $('#ce-func-label', this.editor.el).blur();
                    controller.showDialog();
                }
            }
        },

        onNamedRangesMenu: function(menu, item) {
            var me = this;
            if (item.options.value=='manager') {
                var wc = this.api.asc_getWorksheetsCount(),
                        i = -1,
                        items = [], sheetNames = [];
                while (++i < wc) {
                    if (!this.api.asc_isWorksheetHidden(i)) {
                        sheetNames[i] = this.api.asc_getWorksheetName(i);
                        items.push({displayValue: sheetNames[i], value: i});
                    }
                }

                (new SSE.Views.NameManagerDlg({
                    api: this.api,
                    handler: function(result) {
                        Common.NotificationCenter.trigger('edit:complete', this.editor);
                    },
                    locked: this.namedrange_locked,
                    sheets: items,
                    sheetNames: sheetNames,
                    ranges: this.api.asc_getDefinedNames(Asc.c_oAscGetDefinedNamesList.All),
                    props : this.api.asc_getDefaultDefinedName(),
                    sort  : this.rangeListSort
                })).on('close', function(win){
                    me.rangeListSort = win.getSettings();
                }).show();
            } else {
                this.api.asc_findCell(item.caption);
                Common.NotificationCenter.trigger('edit:complete', this.editor);
            }
        },

        onNameBeforeShow: function() {
            var names = this.api.asc_getDefinedNames(Asc.c_oAscGetDefinedNamesList.WorksheetWorkbook),
                rangesMenu = this.editor.btnNamedRanges.menu,
                prev_name='';

            rangesMenu.removeItems(2, rangesMenu.items.length-1);
            names.sort(function(item1, item2) {
                var n1 = item1.asc_getName(true).toLowerCase(),
                    n2 = item2.asc_getName(true).toLowerCase();
                if (n1==n2) return 0;
                return (n1<n2) ? -1 : 1;
            });
            _.each(names, function(field, index) {
                var name = field.asc_getName(true);
                if (prev_name !== name) {
                    rangesMenu.addItem(new Common.UI.MenuItem({
                        caption : name
                    }));
                }
                prev_name = name;
            });
            this.editor.btnNamedRanges.menu.items[1].setVisible(rangesMenu.items.length>2);
        },

        onLockDefNameManager: function(state) {
            this.namedrange_locked = (state == Asc.c_oAscDefinedNameReason.LockDefNameManager);
        }
    });
});