/**
 *  TableSettings.js
 *
 *  Created by Julia Radzhabova on 3/28/16
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
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
    'spreadsheeteditor/main/app/view/TableOptionsDialog'
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
            var me = this;

            this._state = {
                TableName: '',
                TemplateName: '',
                CheckHeader: false,
                CheckTotal: false,
                CheckBanded: false,
                CheckFirst: false,
                CheckLast: false,
                CheckColBanded: false,
                CheckFilter: false,
                DisabledControls: false
            };
            this.lockedControls = [];
            this._locked = false;

            this._originalProps = null;
            this._noApply = false;

            this.render();

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

            this.chHeader.on('change', _.bind(this.onCheckTemplateChange, this, c_oAscChangeTableStyleInfo.rowHeader));
            this.chTotal.on('change', _.bind(this.onCheckTemplateChange, this, c_oAscChangeTableStyleInfo.rowTotal));
            this.chBanded.on('change', _.bind(this.onCheckTemplateChange, this, c_oAscChangeTableStyleInfo.rowBanded));
            this.chFirst.on('change', _.bind(this.onCheckTemplateChange, this, c_oAscChangeTableStyleInfo.columnFirst));
            this.chLast.on('change', _.bind(this.onCheckTemplateChange, this, c_oAscChangeTableStyleInfo.columnLast));
            this.chColBanded.on('change', _.bind(this.onCheckTemplateChange, this, c_oAscChangeTableStyleInfo.columnBanded));
            this.chFilter.on('change', _.bind(this.onCheckTemplateChange, this, c_oAscChangeTableStyleInfo.filterButton));

            this.cmbTableTemplate = new Common.UI.ComboDataView({
                itemWidth: 61,
                itemHeight: 46,
                menuMaxHeight: 300,
                enableKeyEvents: true
            });
            this.cmbTableTemplate.render($('#table-combo-template'));
            this.cmbTableTemplate.openButton.menu.cmpEl.css({
                'min-width': 175,
                'max-width': 175
            });
            this.cmbTableTemplate.on('click', _.bind(this.onTableTemplateSelect, this));
            this.cmbTableTemplate.openButton.menu.on('show:after', function () {
                me.cmbTableTemplate.menuPicker.scroller.update({alwaysVisibleY: true});
            });
            this.lockedControls.push(this.cmbTableTemplate);

            this.txtTableName = new Common.UI.InputField({
                el          : $('#table-txt-name'),
                name        : 'name',
                style       : 'width: 100%;',
                validateOnBlur: false
            }).on('changed:after', function(input, newValue, oldValue) {
                // set table name
            });
            this.lockedControls.push(this.txtTableName);

            this.btnSelectData = new Common.UI.Button({
                el: $('#table-btn-select-data')
            });
            this.btnSelectData.on('click', _.bind(this.onSelectData, this));

            this.btnEdit = new Common.UI.Button({
                cls: 'btn-icon-default',
                iconCls: 'btn-edit-table',
                menu        : new Common.UI.Menu({
                    menuAlign: 'tr-br',
                    items: [
                        { caption: this.selectRowText,      value:  c_oAscChangeSelectionFormatTable.row, idx: 0 },
                        { caption: this.selectColumnText,   value: c_oAscChangeSelectionFormatTable.column, idx: 1 },
                        { caption: this.selectDataText,     value: c_oAscChangeSelectionFormatTable.data, idx: 2 },
                        { caption: this.selectTableText,    value: c_oAscChangeSelectionFormatTable.all, idx: 3 },
                        { caption: '--' },
                        { caption: this.insertRowAboveText, value: c_oAscInsertOptions.InsertTableRowAbove, idx: 4 },
                        { caption: this.insertRowBelowText, value: c_oAscInsertOptions.InsertTableRowBelow, idx: 5 },
                        { caption: this.insertColumnLeftText,  value: c_oAscInsertOptions.InsertTableColLeft, idx: 6 },
                        { caption: this.insertColumnRightText, value: c_oAscInsertOptions.InsertTableColRight, idx: 7 },
                        { caption: '--' },
                        { caption: this.deleteRowText,      value: c_oAscDeleteOptions.DeleteRows, idx: 8 },
                        { caption: this.deleteColumnText,   value: c_oAscDeleteOptions.DeleteColumns, idx: 9 },
                        { caption: this.deleteTableText,    value: c_oAscDeleteOptions.DeleteColumns, idx: 10 }
                    ]
                })
            });
            this.btnEdit.render( $('#table-btn-edit')) ;
            this.btnEdit.menu.on('show:after', _.bind( function(){
                if (this.api) {
//                    this.mnuMerge.setDisabled(!this.api.CheckBeforeMergeCells());
//                    this.mnuSplit.setDisabled(!this.api.CheckBeforeSplitCells());
                }
            }, this));
            this.btnEdit.menu.on('item:click', _.bind(this.onEditClick, this));
            this.lockedControls.push(this.btnEdit);
        },

        onCheckTemplateChange: function(type, field, newValue, oldValue, eOpts) {
            if (this.api)
                this.api.asc_changeFormatTableInfo(this._state.TableName, type);
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onTableTemplateSelect: function(combo, record){
            if (this.api && !this._noApply) {
                if (this._state.TemplateName)
                    this.api.asc_changeAutoFilter(this._state.TableName, c_oAscChangeFilterOptions.style, record.get('name'));
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

        render: function () {
            var el = $(this.el);
            el.html(this.template({
                scope: this
            }));
        },

        setApi: function(o) {
            this.api = o;
            if (o) {
                this.api.asc_registerCallback('asc_onInitTablePictures',    _.bind(this.onApiInitTableTemplates, this));
            }
            return this;
        },

        ChangeSettings: function(props) {
            this.disableControls(this._locked);

            if (props )//formatTableInfo
            {
                this._originalProps = props;

                var value = props.asc_getTableName();
                if (this._state.TableName!==value) {
                    this.txtTableName.setValue(value);
                    this._state.TableName=value;
                }

                //for table-template
                value = props.asc_getTableStyleName();
                if (this._state.TemplateName!==value || this._isTemplatesChanged) {
                    this.cmbTableTemplate.suspendEvents();
                    var rec = this.cmbTableTemplate.menuPicker.store.findWhere({
                        name: value
                    });
                    this.cmbTableTemplate.menuPicker.selectRecord(rec);
                    this.cmbTableTemplate.resumeEvents();

                    if (this._isTemplatesChanged) {
                        if (rec)
                            this.cmbTableTemplate.fillComboView(this.cmbTableTemplate.menuPicker.getSelectedRec(),true);
                        else
                            this.cmbTableTemplate.fillComboView(this.cmbTableTemplate.menuPicker.store.at(0), true);
                    }
                    this._state.TemplateName=value;
                }
                this._isTemplatesChanged = false;

                value = props.asc_getFirstRow();
                if (this._state.CheckHeader!==value) {
                    this.chHeader.setValue(value, true);
                    this._state.CheckHeader=value;
                }

                value = props.asc_getLastRow();
                if (this._state.CheckTotal!==value) {
                    this.chTotal.setValue(value, true);
                    this._state.CheckTotal=value;
                }

                value = props.asc_getBandHor();
                if (this._state.CheckBanded!==value) {
                    this.chBanded.setValue(value, true);
                    this._state.CheckBanded=value;
                }

                value = props.asc_getFirstCol();
                if (this._state.CheckFirst!==value) {
                    this.chFirst.setValue(value, true);
                    this._state.CheckFirst=value;
                }

                value = props.asc_getLastCol();
                if (this._state.CheckLast!==value) {
                    this.chLast.setValue(value, true);
                    this._state.CheckLast=value;
                }

                value = props.asc_getBandVer();
                if (this._state.CheckColBanded!==value) {
                    this.chColBanded.setValue(value, true);
                    this._state.CheckColBanded=value;
                }

                value = props.asc_getFilterButton();
                if (this._state.CheckFilter!==value) {
                    this.chFilter.setValue(value, true);
                    this._state.CheckFilter=value;
                }
            }
        },

        onApiInitTableTemplates: function(Templates){
            var self = this;
            this._isTemplatesChanged = true;

            var count = self.cmbTableTemplate.menuPicker.store.length;
            if (count>0 && count==Templates.length) {
                var data = self.cmbTableTemplate.menuPicker.store.models;
                _.each(Templates, function(template, index){
                    data[index].set('imageUrl', template.asc_getImage());
                });
            } else {
                self.cmbTableTemplate.menuPicker.store.reset([]);
                var arr = [];
                _.each(Templates, function(template){
                    arr.push({
                        id          : Common.UI.getId(),
                        name        : template.asc_getName(),
                        caption     : template.asc_getDisplayName(),
                        type        : template.asc_getType(),
                        imageUrl    : template.asc_getImage(),
                        allowSelected : true,
                        selected    : false
                    });
                });
                self.cmbTableTemplate.menuPicker.store.add(arr);
            }
        },

        onSelectData: function() {
            return;
            var me = this;
            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        me.api.asc_setSelectionDialogMode(c_oAscSelectionDialogType.None);
                        if (me._state.Tablename)
                            me.api.asc_changeAutoFilter(me._state.Tablename, c_oAscChangeFilterOptions.style, fmtname);
                    }

                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                };
                var win = new SSE.Views.TableOptionsDialog({
                    handler: handlerDlg
                });

                win.show();
                win.setSettings({
                    api     : me.api
                });
            }
        },
        
        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable) {
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
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
        textOK                  : 'OK',
        textCancel              : 'Cancel',
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
        textSelectData          : 'Select Data'

    }, SSE.Views.TableSettings || {}));
});