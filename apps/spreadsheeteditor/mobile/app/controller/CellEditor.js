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
 *    CellEditor.js
 *
 *    CellEditor Controller
 *
 *    Created by Maxim Kadushkin on 11/24/2016
 *    Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core'
], function (Viewport) {
    'use strict';

    SSE.Controllers.CellEditor = Backbone.Controller.extend({
        defEditorHeight: 30,
        maxEditorHeight: 70,

        events: function() {
            return {
                // 'keyup input#ce-cell-name': _.bind(this.onCellName,this),
                // 'keyup textarea#ce-cell-content': _.bind(this.onKeyupCellEditor,this),
                // 'blur textarea#ce-cell-content': _.bind(this.onBlurCellEditor,this),
                'click button#ce-btn-expand': _.bind(this.expandEditorField,this),
                // 'click button#ce-func-label': _.bind(this.onInsertFunction, this)
            };
        },

        initialize: function() {
            this.addListeners({
                'CellEditor': {},
                'Viewport': {
                    // 'layout:resizedrag': _.bind(this.onLayoutResize, this)
                }
            });
        },

        setApi: function(api) {
            this.api = api;

            // this.api.isCEditorFocused = false;
            this.api.asc_registerCallback('asc_onSelectionNameChanged', _.bind(this.onApiCellSelection, this));
            // this.api.asc_registerCallback('asc_onEditCell', _.bind(this.onApiEditCell, this));
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
            this.editor = { $el: $('#cell-editing-box') };
            this.editor.$el.height(this.defEditorHeight);

            this.editor.$btnexpand = this.editor.$el.find('#ce-btn-expand');
            this.editor.$btnexpand.on('click', this.expandEditorField.bind(this));

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
            if ( info ) {
                if ( !this.editor.$cellname )
                    this.editor.$cellname = this.editor.$el.find('#ce-cell-name');

                this.editor.$cellname.html(typeof(info)=='string' ? info : info.asc_getName());
            }
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
            if (this.editor.$el.height() > this.defEditorHeight) {
                this.editor.$el.height(this.defEditorHeight);
                this.editor.$btnexpand.removeClass('collapse');
            } else {
                this.editor.$el.height(this.maxEditorHeight);
                this.editor.$btnexpand.addClass('collapse');
            }

            // Common.NotificationCenter.trigger('layout:changed', 'celleditor');
            // Common.NotificationCenter.trigger('edit:complete', this.editor, {restorefocus:true});
        },

        onInsertFunction: function() {
            if ( this.mode.isEdit && !this.editor.$btnfunc['hasClass']('disabled')) {
                var controller = this.getApplication().getController('FormulaDialog');
                if (controller) {
                    $('#ce-func-label', this.editor.el).blur();
                    controller.showDialog();
                }
            }
        }
    });
});