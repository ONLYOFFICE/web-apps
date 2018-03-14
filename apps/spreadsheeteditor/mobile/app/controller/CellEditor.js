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
 *    CellEditor.js
 *
 *    CellEditor Controller
 *
 *    Created by Maxim Kadushkin on 11/24/2016
 *    Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'spreadsheeteditor/mobile/app/view/CellEditor'
], function (core) {
    'use strict';

    SSE.Controllers.CellEditor = Backbone.Controller.extend({
        views: [
            'CellEditor'
        ],

        events: function() {
            return {
                // 'keyup input#ce-cell-name': _.bind(this.onCellName,this),
                // 'keyup textarea#ce-cell-content': _.bind(this.onKeyupCellEditor,this),
                // 'blur textarea#ce-cell-content': _.bind(this.onBlurCellEditor,this),
                // 'click a#ce-function': _.bind(this.onInsertFunction, this)
            };
        },

        initialize: function() {
            var me = this;
            this.addListeners({
                'CellEditor': {
                    'function:click': this.onInsertFunction.bind(this),
                    'function:hint': function (name, type) {
                        setTimeout(function(){
                            me.api.asc_insertFormula(name, type, false);
                        }, 0);
                    }
                }
            //     'Viewport': {
                    // 'layout:resizedrag': _.bind(this.onLayoutResize, this)
                // }
            });
        },

        setApi: function(api) {
            this.api = api;

            // this.api.isCEditorFocused = false;
            this.api.asc_registerCallback('asc_onSelectionNameChanged', _.bind(this.onApiCellSelection, this));
            this.api.asc_registerCallback('asc_onEditCell', _.bind(this.onApiEditCell, this));
            this.api.asc_registerCallback('asc_onFormulaCompleteMenu',  _.bind(this.onFormulaCompleteMenu, this));
            // this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiDisconnect,this));
            // Common.NotificationCenter.on('api:disconnect', _.bind(this.onApiDisconnect, this));
            // Common.NotificationCenter.on('cells:range', _.bind(this.onCellsRange, this));
            // this.api.asc_registerCallback('asc_onInputKeyDown', _.bind(this.onInputKeyDown, this));

            return this;
        },

        setMode: function(mode) {
            this.mode = mode;

            // this.editor.$btnfunc[this.mode.isEdit?'removeClass':'addClass']('disabled');
            // this.editor.btnNamedRanges.setVisible(this.mode.isEdit && !this.mode.isEditDiagram && !this.mode.isEditMailMerge);
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
            this.editor = this.createView('CellEditor').render();

            // this.bindViewEvents(this.editor, this.events);
            // this.editor.$el.parent().find('.after').css({zIndex: '4'}); // for spreadsheets - bug 23127
        },

        onApiEditCell: function(state) {
            if (state == Asc.c_oAscCellEditorState.editStart){
                this.api.isCellEdited = true;
                this.editor.cellNameDisabled(true);
            } else if (state == Asc.c_oAscCellEditorState.editEnd) {
                this.api.isCellEdited = false;
                this.api.isCEditorFocused = false;
                this.editor.cellNameDisabled(false);
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
            // this.editor.cellNameDisabled(status != Asc.c_oAscSelectionDialogType.None);
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

        onInsertFunction: function() {
            if (this.mode.isEdit) {
                SSE.getController('AddContainer').showModal({
                    panel: 'function',
                    button: '#ce-function'
                });
            }
        },

        onFormulaCompleteMenu: function(funcarr) {
            if ( funcarr && funcarr.length ) {
                this.editor.resetFunctionsHint(funcarr);
                !this.editor.$boxfuncs.hasClass('.opened') && this.editor.$boxfuncs.addClass('opened');
            } else {
                this.editor.$boxfuncs.removeClass('opened');
            }
        }
    });
});