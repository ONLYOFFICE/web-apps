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
//            this._originalLook = new CTablePropLook();

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

            this.chHeader.on('change', _.bind(this.onCheckTemplateChange, this, 0));
            this.chTotal.on('change', _.bind(this.onCheckTemplateChange, this, 1));
            this.chBanded.on('change', _.bind(this.onCheckTemplateChange, this, 2));
            this.chFirst.on('change', _.bind(this.onCheckTemplateChange, this, 3));
            this.chLast.on('change', _.bind(this.onCheckTemplateChange, this, 4));
            this.chColBanded.on('change', _.bind(this.onCheckTemplateChange, this, 5));
            this.chFilter.on('change', _.bind(this.onCheckFilterChange, this));

            this.cmbTableTemplate = new Common.UI.ComboDataView({
                itemWidth: 70,
                itemHeight: 50,
                menuMaxHeight: 300,
                enableKeyEvents: true,
                cls: 'combo-template'
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
                allowBlank  : false,
                blankError  : this.txtEmpty
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
                        { caption: this.selectRowText, value: 0 },
                        { caption: this.selectColumnText,  value: 1 },
                        { caption: this.selectCellText,  value: 2 },
                        { caption: this.selectTableText,  value: 3 },
                        { caption: '--' },
                        { caption: this.insertRowAboveText, value: 4 },
                        { caption: this.insertRowBelowText,  value: 5 },
                        { caption: this.insertColumnLeftText,  value: 6 },
                        { caption: this.insertColumnRightText,  value: 7 },
                        { caption: '--' },
                        { caption: this.deleteRowText, value: 8 },
                        { caption: this.deleteColumnText,  value: 9 },
                        { caption: this.deleteTableText,  value: 10 }
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
            if (this.api)   {
                var properties = new CTableProp();
                var look = (this._originalLook) ? this._originalLook : new CTablePropLook();
                switch (type) {
                    case 0:
                        look.put_FirstRow(field.getValue()=='checked');
                        break;
                    case 1:
                        look.put_LastRow(field.getValue()=='checked');
                        break;
                    case 2:
                        look.put_BandHor(field.getValue()=='checked');
                        break;
                    case 3:
                        look.put_FirstCol(field.getValue()=='checked');
                        break;
                    case 4:
                        look.put_LastCol(field.getValue()=='checked');
                        break;
                    case 5:
                        look.put_BandVer(field.getValue()=='checked');
                        break;
                }
                properties.put_TableLook(look);
                this.api.tblApply(properties);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onCheckFilterChange: function(field, newValue, oldValue, eOpts) {
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onTableTemplateSelect: function(combo, record){
            if (this.api && !this._noApply) {
                if (this._state.TemplateName)
                    this.api.asc_changeAutoFilter(this._state.TemplateName, c_oAscChangeFilterOptions.style, record.get('name'));
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onEditClick: function(menu, item, e) {
            if (this.api) {
                switch (item.value) {
                    case 0: this.api.selectRow(); break;
                    case 1: this.api.selectColumn(); break;
                    case 2: this.api.selectCell(); break;
                    case 3: this.api.selectTable(); break;
                    case 4: this.api.addRowAbove(); break;
                    case 5: this.api.addRowBelow(); break;
                    case 6: this.api.addColumnLeft(); break;
                    case 7: this.api.addColumnRight(); break;
                    case 8: this.api.remRow(); break;
                    case 9: this.api.remColumn(); break;
                    case 10: this.api.remTable(); break;
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

            if (props )//filterInfo
            {
                this._originalProps = props;

                //for table-template
                var value = props.asc_getTableStyleName();
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

                /*
                var look = props.get_TableLook();
                if (look) {
                    value = look.get_FirstRow();
                    if (this._state.CheckHeader!==value) {
                        this.chHeader.setValue(value, true);
                        this._state.CheckHeader=value;
                        this._originalLook.put_FirstRow(value);
                    }

                    value = look.get_LastRow();
                    if (this._state.CheckTotal!==value) {
                        this.chTotal.setValue(value, true);
                        this._state.CheckTotal=value;
                        this._originalLook.put_LastRow(value);
                    }

                    value = look.get_BandHor();
                    if (this._state.CheckBanded!==value) {
                        this.chBanded.setValue(value, true);
                        this._state.CheckBanded=value;
                        this._originalLook.put_BandHor(value);
                    }

                    value = look.get_FirstCol();
                    if (this._state.CheckFirst!==value) {
                        this.chFirst.setValue(value, true);
                        this._state.CheckFirst=value;
                        this._originalLook.put_FirstCol(value);
                    }

                    value = look.get_LastCol();
                    if (this._state.CheckLast!==value) {
                        this.chLast.setValue(value, true);
                        this._state.CheckLast=value;
                        this._originalLook.put_LastCol(value);
                    }

                    value = look.get_BandVer();
                    if (this._state.CheckColBanded!==value) {
                        this.chColBanded.setValue(value, true);
                        this._state.CheckColBanded=value;
                        this._originalLook.put_BandVer(value);
                    }
                }
                */
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
                        if (me._state.tablename)
                            me.api.asc_changeAutoFilter(me._state.tablename, c_oAscChangeFilterOptions.style, fmtname);
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
        selectColumnText        : 'Select Column',
        selectCellText          : 'Select Cell',
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