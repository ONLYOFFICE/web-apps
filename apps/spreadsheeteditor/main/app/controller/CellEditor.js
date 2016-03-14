/**
 *    CellEditor.js
 *
 *    CellEditor Controller
 *
 *    Created by Maxim Kadushkin on 08 April 2014
 *    Copyright (c) 2014 Ascensio System SIA. All rights reserved.
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

            return this;
        },

        setMode: function(mode) {
            this.mode = mode;

            this.editor.$btnfunc[this.mode.isEdit?'removeClass':'addClass']('disabled');
            this.editor.btnNamedRanges.setVisible(this.mode.isEdit && !this.mode.isEditDiagram && !this.mode.isEditMailMerge);
        },

        onLaunch: function() {
            this.editor = this.createView('CellEditor',{
                el: '#cell-editing-box'
            }).render();

            this.bindViewEvents(this.editor, this.events);

            this.editor.$el.parent().find('.after').css({zIndex: '4'}); // for spreadsheets - bug 23127

            var me = this;
            $('#ce-cell-content').keydown(function (e) {
                if (Common.UI.Keys.ESC === e.keyCode) {
                    me.api.asc_enableKeyEvents(true);
                } else if (Common.UI.Keys.UP === e.keyCode || Common.UI.Keys.DOWN === e.keyCode ||
                           Common.UI.Keys.TAB === e.keyCode || Common.UI.Keys.RETURN === e.keyCode) {
                    var menu = $('#menu-formula-selection'); // for formula menu
                    if (menu.hasClass('open'))
                        menu.find('.dropdown-menu').trigger('keydown', e);
                    if (Common.UI.Keys.RETURN === e.keyCode)
                        me.api.asc_enableKeyEvents(true);
                }
            });

            this.editor.btnNamedRanges.menu.on('item:click', _.bind(this.onNamedRangesMenu, this))
                                           .on('show:before', _.bind(this.onNameBeforeShow, this));
            this.namedrange_locked = false;
        },

        onApiEditCell: function(state) {
            if (state == c_oAscCellEditorState.editStart)
                this.api.isCellEdited = true;
            else if (state == c_oAscCellEditorState.editEnd) {
                this.api.isCellEdited = false;
                this.api.isCEditorFocused = false;
            }
        },

        onApiCellSelection: function(info) {
            this.editor.updateCellInfo(info);
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
            var isRangeSelection = (status != c_oAscSelectionDialogType.None);

            if (isRangeSelection) {
                this.editor.$cellname.attr('disabled', 'disabled');
                this.editor.$btnfunc['addClass']('disabled');
            } else {
                this.editor.$cellname.removeAttr('disabled');
                this.editor.$btnfunc['removeClass']('disabled');
            }
            this.editor.btnNamedRanges.setDisabled(isRangeSelection);
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
            if (Common.Utils.isIE && !$('#menu-formula-selection').hasClass('open')) {// for formula menu
                this.getApplication().getController('DocumentHolder').documentHolder.focus();
            }
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
                    this.api.asc_enableKeyEvents(false);
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
                    ranges: this.api.asc_getDefinedNames(c_oAscGetDefinedNamesList.All),
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
            var names = this.api.asc_getDefinedNames(c_oAscGetDefinedNamesList.WorksheetWorkbook),
                rangesMenu = this.editor.btnNamedRanges.menu,
                prev_name='';

            rangesMenu.removeItems(2, rangesMenu.items.length-1);
            names.sort(function(item1, item2) {
                var n1 = item1.asc_getName().toLowerCase(),
                    n2 = item2.asc_getName().toLowerCase();
                if (n1==n2) return 0;
                return (n1<n2) ? -1 : 1;
            });
            _.each(names, function(field, index) {
                var name = field.asc_getName();
                if (prev_name !== name) {
                    rangesMenu.addItem(new Common.UI.MenuItem({
                        caption : field.asc_getName()
                    }));
                }
                prev_name = name;
            });
            this.editor.btnNamedRanges.menu.items[1].setVisible(rangesMenu.items.length>2);
        },

        onLockDefNameManager: function(state) {
            this.namedrange_locked = (state == c_oAscDefinedNameReason.LockDefNameManager);
        }
    });
});