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
 *  TableSettings.js
 *
 *  Created by Julia Radzhabova on 3/28/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/TableSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/ComboDataView',
    'spreadsheeteditor/main/app/view/TableOptionsDialog',
    'spreadsheeteditor/main/app/view/TableSettingsAdvanced',
    'spreadsheeteditor/main/app/view/SlicerAddDialog'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    SSE.Views.TableSettings = Backbone.View.extend(_.extend({
        el: '#id-table-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'TableSettings'
        },

        initialize: function () {
            this._initSettings = true;

            this._state = {
                TableName: '',
                TemplateName: '',
                Range: '',
                CheckHeader: false,
                CheckTotal: false,
                CheckBanded: false,
                CheckFirst: false,
                CheckLast: false,
                CheckColBanded: false,
                CheckFilter: false,
                DisabledControls: false,
                TableNameError: false
            };
            this.lockedControls = [];
            this._locked = false;
            this.isEditCell = false;

            this._originalProps = null;
            this._noApply = false;

            this.render();
        },

        onCheckTemplateChange: function(type, stateName, field, newValue, oldValue, eOpts) {
            this._state[stateName] = undefined;
            if (this.api)
                this.api.asc_changeFormatTableInfo(this._state.TableName, type, newValue=='checked');
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onTableTemplateSelect: function(btn, picker, itemView, record){
            if (this.api && !this._noApply) {
                this.api.asc_changeAutoFilter(this._state.TableName, Asc.c_oAscChangeFilterOptions.style, record.get('name'));
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onEditClick: function(menu, item, e) {
            if (this.api) {
                if (item.options.idx>=0 && item.options.idx<4)
                    this.api.asc_changeSelectionFormatTable(this._state.TableName, item.value);
                else if (item.options.idx>=4 && item.options.idx<8) {
                    this.api.asc_insertCellsInTable(this._state.TableName, item.value);
                } else {
                    this.api.asc_deleteCellsInTable(this._state.TableName, item.value);
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onTableNameChanged: function(input, newValue, oldValue) {
            var oldName = this._state.TableName;
            this._state.TableName = '';

            if (oldName.toLowerCase() == newValue.toLowerCase()) {
                Common.NotificationCenter.trigger('edit:complete', this);
                return;
            }

            var me = this,
                isvalid = this.api.asc_checkDefinedName(newValue, null);
            if (isvalid.asc_getStatus() === true) isvalid = true;
            else {
                switch (isvalid.asc_getReason()) {
                    case Asc.c_oAscDefinedNameReason.IsLocked:
                        isvalid = this.textIsLocked;
                    break;
                    case Asc.c_oAscDefinedNameReason.Existed:
                        isvalid = this.textExistName;
                    break;
                    case Asc.c_oAscDefinedNameReason.NameReserved:
                        isvalid = this.textReservedName;
                    break;
                    default:
                        isvalid = this.textInvalidName;
                }
            }
            if (isvalid === true) {
                this.api.asc_changeDisplayNameTable(oldName, newValue);
                Common.NotificationCenter.trigger('edit:complete', this);
            } else if (!this._state.TableNameError) {
                this._state.TableNameError = true;
                Common.UI.alert({
                    msg: isvalid,
                    title: this.notcriticalErrorTitle,
                    iconCls: 'warn',
                    buttons: ['ok'],
                    callback: function(btn){
                        Common.NotificationCenter.trigger('edit:complete', this);
                        me._state.TableNameError = false;
                    }
                });
            }
        },

        render: function () {
            var el = $(this.el);
            el.html(this.template({
                scope: this
            }));

            this.linkAdvanced = $('#table-advanced-link');
        },

        setApi: function(o) {
            this.api = o;
            if (o) {
                this.api.asc_registerCallback('asc_onSendThemeColors',    _.bind(this.onSendThemeColors, this));
                this.api.asc_registerCallback('asc_onEditCell', this.onApiEditCell.bind(this));
            }
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
        },

        createDelayedControls: function() {
            var me = this;
            this.chHeader = new Common.UI.CheckBox({
                el: $('#table-checkbox-header'),
                labelText: this.textHeader
            });
            this.lockedControls.push(this.chHeader);

            this.chTotal = new Common.UI.CheckBox({
                el: $('#table-checkbox-total'),
                labelText: this.textTotal
            });
            this.lockedControls.push(this.chTotal);

            this.chBanded = new Common.UI.CheckBox({
                el: $('#table-checkbox-banded'),
                labelText: this.textBanded
            });
            this.lockedControls.push(this.chBanded);

            this.chFirst = new Common.UI.CheckBox({
                el: $('#table-checkbox-first'),
                labelText: this.textFirst
            });
            this.lockedControls.push(this.chFirst);

            this.chLast = new Common.UI.CheckBox({
                el: $('#table-checkbox-last'),
                labelText: this.textLast
            });
            this.lockedControls.push(this.chLast);

            this.chColBanded = new Common.UI.CheckBox({
                el: $('#table-checkbox-col-banded'),
                labelText: this.textBanded
            });
            this.lockedControls.push(this.chColBanded);

            this.chFilter = new Common.UI.CheckBox({
                el: $('#table-checkbox-filter'),
                labelText: this.textFilter
            });
            this.lockedControls.push(this.chFilter);

            this.chHeader.on('change', _.bind(this.onCheckTemplateChange, this, Asc.c_oAscChangeTableStyleInfo.rowHeader, 'CheckHeader'));
            this.chTotal.on('change', _.bind(this.onCheckTemplateChange, this, Asc.c_oAscChangeTableStyleInfo.rowTotal, 'CheckTotal'));
            this.chBanded.on('change', _.bind(this.onCheckTemplateChange, this, Asc.c_oAscChangeTableStyleInfo.rowBanded, 'CheckBanded'));
            this.chFirst.on('change', _.bind(this.onCheckTemplateChange, this, Asc.c_oAscChangeTableStyleInfo.columnFirst, 'CheckFirst'));
            this.chLast.on('change', _.bind(this.onCheckTemplateChange, this, Asc.c_oAscChangeTableStyleInfo.columnLast, 'CheckLast'));
            this.chColBanded.on('change', _.bind(this.onCheckTemplateChange, this, Asc.c_oAscChangeTableStyleInfo.columnBanded, 'CheckColBanded'));
            this.chFilter.on('change', _.bind(this.onCheckTemplateChange, this, Asc.c_oAscChangeTableStyleInfo.filterButton, 'CheckFilter'));

            this.txtTableName = new Common.UI.InputField({
                el          : $('#table-txt-name'),
                name        : 'tablename',
                style       : 'width: 100%;',
                validateOnBlur: false
            });
            this.txtTableName.on('changed:after', _.bind(this.onTableNameChanged, this));
            this.lockedControls.push(this.txtTableName);

            this.btnSelectData = new Common.UI.Button({
                el: $('#table-btn-select-data')
            });
            this.btnSelectData.on('click', _.bind(this.onSelectData, this));
            this.lockedControls.push(this.btnSelectData);

            this.btnEdit = new Common.UI.Button({
                parentEl: $('#table-btn-edit'),
                cls: 'btn-icon-default',
                iconCls: 'btn-edit-table',
                menu        : new Common.UI.Menu({
                    menuAlign: 'tr-br',
                    items: [
                        { caption: this.selectRowText,      value:  Asc.c_oAscChangeSelectionFormatTable.row,   idx: 0 },
                        { caption: this.selectColumnText,   value: Asc.c_oAscChangeSelectionFormatTable.column, idx: 1 },
                        { caption: this.selectDataText,     value: Asc.c_oAscChangeSelectionFormatTable.data,   idx: 2 },
                        { caption: this.selectTableText,    value: Asc.c_oAscChangeSelectionFormatTable.all,    idx: 3 },
                        { caption: '--' },
                        { caption: this.insertRowAboveText, value: Asc.c_oAscInsertOptions.InsertTableRowAbove,     idx: 4 },
                        { caption: this.insertRowBelowText, value: Asc.c_oAscInsertOptions.InsertTableRowBelow,     idx: 5 },
                        { caption: this.insertColumnLeftText,  value: Asc.c_oAscInsertOptions.InsertTableColLeft,   idx: 6 },
                        { caption: this.insertColumnRightText, value: Asc.c_oAscInsertOptions.InsertTableColRight,  idx: 7 },
                        { caption: '--' },
                        { caption: this.deleteRowText,      value: Asc.c_oAscDeleteOptions.DeleteRows,      idx: 8 },
                        { caption: this.deleteColumnText,   value: Asc.c_oAscDeleteOptions.DeleteColumns,   idx: 9 },
                        { caption: this.deleteTableText,    value: Asc.c_oAscDeleteOptions.DeleteTable,     idx: 10 }
                    ]
                })
            });
            this.btnEdit.menu.on('show:after', _.bind( function(menu){
                if (this.api) {
                    menu.items[5].setDisabled(!this._originalProps.asc_getIsInsertRowAbove());
                    menu.items[6].setDisabled(!this._originalProps.asc_getIsInsertRowBelow());
                    menu.items[7].setDisabled(!this._originalProps.asc_getIsInsertColumnLeft());
                    menu.items[8].setDisabled(!this._originalProps.asc_getIsInsertColumnRight());

                    menu.items[10].setDisabled(!this._originalProps.asc_getIsDeleteRow());
                    menu.items[11].setDisabled(!this._originalProps.asc_getIsDeleteColumn());
                    menu.items[12].setDisabled(!this._originalProps.asc_getIsDeleteTable());
                }
            }, this));
            this.btnEdit.menu.on('item:click', _.bind(this.onEditClick, this));
            this.lockedControls.push(this.btnEdit);

            this.btnConvertRange = new Common.UI.Button({
                parentEl: $('#table-btn-convert-range'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-convert-to-range',
                caption     : this.textConvertRange,
                style       : 'width: 100%;text-align: left;'
            });

            this.btnConvertRange.on('click', _.bind(function(btn){
                if (this.api) this.api.asc_convertTableToRange(this._state.TableName);
                Common.NotificationCenter.trigger('edit:complete', this);
            }, this));
            this.lockedControls.push(this.btnConvertRange);

            this.btnRemDuplicates = new Common.UI.Button({
                parentEl: $('#table-btn-rem-duplicates'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-remove-duplicates',
                caption     : this.textRemDuplicates,
                style       : 'width: 100%;text-align: left;'
            });
            this.btnRemDuplicates.on('click', _.bind(function(btn){
                Common.NotificationCenter.trigger('data:remduplicates', this);
            }, this));
            this.lockedControls.push(this.btnRemDuplicates);

            this.btnSlicer = new Common.UI.Button({
                parentEl: $('#table-btn-slicer'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-slicer',
                caption     : this.textSlicer,
                style       : 'width: 100%;text-align: left;'
            });
            this.btnSlicer.on('click', _.bind(this.onInsertSlicerClick, this));
            this.lockedControls.push(this.btnSlicer);

            this.btnPivot = new Common.UI.Button({
                parentEl: $('#table-btn-pivot'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-pivot-sum',
                caption     : this.textPivot,
                style       : 'width: 100%;text-align: left;'
            });
            this.btnPivot.on('click', _.bind(this.onInsertPivotClick, this));
            this.lockedControls.push(this.btnPivot);

            this.$el.find('.pivot-only').toggleClass('hidden', !this.mode.canFeaturePivot);

            $(this.el).on('click', '#table-advanced-link', _.bind(this.openAdvancedSettings, this));

            this._initSettings = false;
        },

        openAdvancedSettings: function(e) {
            if (this.linkAdvanced.hasClass('disabled')) return;

            var me = this;
            var win;
            if (me.api && !this._locked){
                (new SSE.Views.TableSettingsAdvanced(
                    {
                        tableProps: me._originalProps,
                        api: me.api,
                        handler: function(result, value) {
                            if (result == 'ok' && me.api && value) {
                                me.api.asc_changeFormatTableInfo(me._state.TableName, Asc.c_oAscChangeTableStyleInfo.advancedSettings, value);
                            }

                            Common.NotificationCenter.trigger('edit:complete', me);
                        }
                    })).show();
            }
        },

        ChangeSettings: function(props) {
            if (this._initSettings)
                this.createDelayedControls();

            this.disableControls(this._locked); // need to update combodataview after disabled state

            if (props )//formatTableInfo
            {
                this._originalProps = props;

                var value = props.asc_getTableName();
                if (this._state.TableName!==value) {
                    this.txtTableName.setValue(value);
                    this._state.TableName=value;
                }

                this._state.Range = props.asc_getTableRange();

                var needTablePictures = false;
                value = props.asc_getFirstRow();
                if (this._state.CheckHeader!==value) {
                    this.chHeader.setValue(value, true);
                    this._state.CheckHeader=value;
                    needTablePictures = true;
                }

                value = props.asc_getLastRow();
                if (this._state.CheckTotal!==value) {
                    this.chTotal.setValue(value, true);
                    this._state.CheckTotal=value;
                    needTablePictures = true;
                }

                value = props.asc_getBandHor();
                if (this._state.CheckBanded!==value) {
                    this.chBanded.setValue(value, true);
                    this._state.CheckBanded=value;
                    needTablePictures = true;
                }

                value = props.asc_getFirstCol();
                if (this._state.CheckFirst!==value) {
                    this.chFirst.setValue(value, true);
                    this._state.CheckFirst=value;
                    needTablePictures = true;
                }

                value = props.asc_getLastCol();
                if (this._state.CheckLast!==value) {
                    this.chLast.setValue(value, true);
                    this._state.CheckLast=value;
                    needTablePictures = true;
                }

                value = props.asc_getBandVer();
                if (this._state.CheckColBanded!==value) {
                    this.chColBanded.setValue(value, true);
                    this._state.CheckColBanded=value;
                    needTablePictures = true;
                }

                value = props.asc_getFilterButton();
                if (this._state.CheckFilter!==value) {
                    this.chFilter.setValue(value, true);
                    this._state.CheckFilter=value;
                }
                if (this.chFilter.isDisabled() !== (!this._state.CheckHeader || this._locked || value===null))
                    this.chFilter.setDisabled(!this._state.CheckHeader || this._locked || value===null);

                if (needTablePictures || !this.mnuTableTemplatePicker)
                    this.onApiInitTableTemplates(this.api.asc_getTablePictures(props));

                //for table-template
                value = props.asc_getTableStyleName();
                if (this._state.TemplateName!==value || this._isTemplatesChanged) {
                    var rec = this.mnuTableTemplatePicker.store.findWhere({
                        name: value
                    });
                    if (!rec) {
                        rec = this.mnuTableTemplatePicker.store.at(0);
                    }
                    this.btnTableTemplate.suspendEvents();
                    this.mnuTableTemplatePicker.selectRecord(rec, true);
                    this.btnTableTemplate.resumeEvents();

                    this.$el.find('.icon-template-table').css({'background-image': 'url(' + rec.get("imageUrl") + ')', 'height': '44px', 'width': '60px', 'background-position': 'center', 'background-size': 'cover'});

                    this._state.TemplateName=value;
                }
                this._isTemplatesChanged = false;
            }
        },

        onSendThemeColors: function() {
            // get new table templates
            this.btnTableTemplate && this.onApiInitTableTemplates(this.api.asc_getTablePictures(this._originalProps));
        },

        onApiInitTableTemplates: function(Templates){
            var self = this;
            this._isTemplatesChanged = true;

            if (!this.btnTableTemplate) {
                this.btnTableTemplate = new Common.UI.Button({
                    cls         : 'btn-large-dataview sheet-template-table',
                    iconCls     : 'icon-template-table',
                    menu        : new Common.UI.Menu({
                        style: 'width: 505px;',
                        items: [
                            { template: _.template('<div id="id-table-menu-template" class="menu-table-template"  style="margin: 5px 5px 5px 10px;"></div>') }
                        ]
                    })
                });
                this.btnTableTemplate.on('render:after', function(btn) {
                    self.mnuTableTemplatePicker = new Common.UI.DataView({
                        el: $('#id-table-menu-template'),
                        parentMenu: btn.menu,
                        restoreHeight: 325,
                        groups: new Common.UI.DataViewGroupStore(),
                        store: new Common.UI.DataViewStore(),
                        itemTemplate: _.template('<div id="<%= id %>" class="item"><img src="<%= imageUrl %>" height="44" width="60"></div>'),
                        style: 'max-height: 325px;'
                    });
                });
                this.btnTableTemplate.render($('#table-btn-template'));
                this.lockedControls.push(this.btnTableTemplate);
                this.mnuTableTemplatePicker.on('item:click', _.bind(this.onTableTemplateSelect, this, this.btnTableTemplate));
                if (this._locked) this.btnTableTemplate.setDisabled(this._locked);
            }


            var count = self.mnuTableTemplatePicker.store.length;
            if (count>0 && count==Templates.length) {
                var data = self.mnuTableTemplatePicker.dataViewItems;
                data && _.each(Templates, function(template, index){
                    var img = template.asc_getImage();
                    data[index].model.set('imageUrl', img, {silent: true});
                    $(data[index].el).find('img').attr('src', img);
                });
            } else {
                var arr = [];
                _.each(Templates, function(template){
                    arr.push({
                        id          : Common.UI.getId(),
                        name        : template.asc_getName(),
                        caption     : template.asc_getDisplayName(),
                        type        : template.asc_getType(),
                        imageUrl    : template.asc_getImage(),
                        allowSelected : true,
                        selected    : false,
                        tip         : template.asc_getDisplayName()
                    });
                });
                self.mnuTableTemplatePicker.store.reset(arr);
            }
        },

        onSelectData: function() {
            var me = this;
            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        me.api.asc_setSelectionDialogMode(Asc.c_oAscSelectionDialogType.None);

                        var settings = dlg.getSettings();
                        if (settings.selectionType == Asc.c_oAscSelectionType.RangeMax || settings.selectionType == Asc.c_oAscSelectionType.RangeRow ||
                            settings.selectionType == Asc.c_oAscSelectionType.RangeCol)
                            Common.UI.warning({
                                title: me.textLongOperation,
                                msg: me.warnLongOperation,
                                buttons: ['ok', 'cancel'],
                                callback: function(btn) {
                                    if (btn == 'ok')
                                        setTimeout(function() { me.api.asc_changeTableRange(me._state.TableName, settings.range)}, 1);
                                    Common.NotificationCenter.trigger('edit:complete', me);
                                }
                            });
                        else
                            me.api.asc_changeTableRange(me._state.TableName, settings.range);
                    }

                    Common.NotificationCenter.trigger('edit:complete', me);
                };
                var win = new SSE.Views.TableOptionsDialog({
                    handler: handlerDlg
                });

                win.show();
                win.setSettings({
                    api     : me.api,
                    range   : me._state.Range,
                    title: me.textResize
                });
            }
        },

        onInsertSlicerClick: function() {
            var me = this,
                props = me.api.asc_beforeInsertSlicer();
            if (props) {
                (new SSE.Views.SlicerAddDialog({
                    props: props,
                    handler: function (result, settings) {
                        if (me && me.api && result == 'ok') {
                            me.api.asc_insertSlicer(settings);
                        }
                        Common.NotificationCenter.trigger('edit:complete', me);
                    }
                })).show();
            }
        },

        onInsertPivotClick: function() {
            this.fireEvent('pivottable:create');
        },

        onApiEditCell: function(state) {
            this.isEditCell = (state != Asc.c_oAscCellEditorState.editEnd);
            if ( state == Asc.c_oAscCellEditorState.editStart || state == Asc.c_oAscCellEditorState.editEnd)
                this.disableControls(this._locked);
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable) {
            if (this._initSettings) return;
            disable = disable || this.isEditCell;

            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
                this.linkAdvanced.toggleClass('disabled', disable);
            }
        },

        textEdit:           'Rows & Columns',
        selectRowText           : 'Select Row',
        selectColumnText        : 'Select Entire Column',
        selectDataText          : 'Select Column Data',
        selectTableText         : 'Select Table',
        insertRowAboveText      : 'Insert Row Above',
        insertRowBelowText      : 'Insert Row Below',
        insertColumnLeftText    : 'Insert Column Left',
        insertColumnRightText   : 'Insert Column Right',
        deleteRowText           : 'Delete Row',
        deleteColumnText        : 'Delete Column',
        deleteTableText         : 'Delete Table',
        textTemplate            : 'Select From Template',
        textRows                : 'Rows',
        textColumns             : 'Columns',
        textHeader              : 'Header',
        textTotal               : 'Total',
        textBanded              : 'Banded',
        textFirst               : 'First',
        textLast                : 'Last',
        textEmptyTemplate       : 'No templates',
        textFilter              : 'Filter button',
        textTableName           : 'Table Name',
        textResize              : 'Resize table',
        textSelectData          : 'Select Data',
        textInvalidName         : 'ERROR! Invalid table name',
        textExistName           : 'ERROR! Range with such a name already exists',
        textIsLocked            : 'This element is being edited by another user.',
        notcriticalErrorTitle   : 'Warning',
        textReservedName        : 'The name you are trying to use is already referenced in cell formulas. Please use some other name.',
        textAdvanced:   'Show advanced settings',
        textConvertRange: 'Convert to range',
        textLongOperation: 'Long operation',
        warnLongOperation: 'The operation you are about to perform might take rather much time to complete.<br>Are you sure you want to continue?',
        textRemDuplicates: 'Remove duplicates',
        textSlicer: 'Insert slicer',
        textPivot: 'Insert pivot table',
        textActions: 'Table actions'
        
    }, SSE.Views.TableSettings || {}));
});