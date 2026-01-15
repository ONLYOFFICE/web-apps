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
 *  TableDesignTab.js
 *
 *  Created on 07.07.2025
 *
 */

define([
    'core',
    'spreadsheeteditor/main/app/view/TableDesignTab'
], function () {
    'use strict';

    SSE.Controllers.TableDesignTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'TableDesignTab'
        ],
        sdkViewName : '#id_main',

        initialize: function () {
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
            this._originalProps = null;

            this.addListeners({
                'TableDesignTab': {
                    'tabledesigntab:insertslicer':       _.bind(this.onInsertSlicer, this),
                    'tabledesigntab:advanced':           _.bind(this.openAdvancedSettings, this),
                    'tabledesigntab:style':              _.bind(this.onTableStyleSelect, this),
                    'tabledesigntab:selectdata':         _.bind(this.onSelectData, this),
                    'tabledesign:namechanged':           _.bind(this.onTableNameChanged, this),
                    'tabledesigntab:convertrange':       _.bind(this.convertToRange, this),
                    'tabledesigntab:edit':               _.bind(this.onEditClick, this),
                    'tabledesigntab:stylechange':        _.bind(this.changeTableInfo, this)
                },
            });
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

        ChangeSettings: function(props) {
            if (props )//formatTableInfo
            {
                this._originalProps = props;
                this.view._originalProps = props;
                var view = this.view;
                var value = props.asc_getTableName();
                if (this._state.TableName!==value) {
                    view.txtTableName.setValue(value);
                    this._state.TableName=value;
                }

                this._state.Range = props.asc_getTableRange();

                var needTablePictures = false;
                value = props.asc_getFirstRow();
                if (this._state.CheckHeader!==value) {
                    view.chHeaderRow.setValue(value, true);
                    this._state.CheckHeader=value;
                    needTablePictures = true;
                }

                value = props.asc_getLastRow();
                if (this._state.CheckTotal!==value) {
                    view.chTotalRow.setValue(value, true);
                    this._state.CheckTotal=value;
                    needTablePictures = true;
                }

                value = props.asc_getBandHor();
                if (this._state.CheckBanded!==value) {
                    view.chBandedRows.setValue(value, true);
                    this._state.CheckBanded=value;
                    needTablePictures = true;
                }

                value = props.asc_getFirstCol();
                if (this._state.CheckFirst!==value) {
                    view.chFirstColumn.setValue(value, true);
                    this._state.CheckFirst=value;
                    needTablePictures = true;
                }

                value = props.asc_getLastCol();
                if (this._state.CheckLast!==value) {
                    view.chLastColumn.setValue(value, true);
                    this._state.CheckLast=value;
                    needTablePictures = true;
                }

                value = props.asc_getBandVer();
                if (this._state.CheckColBanded!==value) {
                    view.chBandedColumns.setValue(value, true);
                    this._state.CheckColBanded=value;
                    needTablePictures = true;
                }

                value = props.asc_getFilterButton();
                if (this._state.CheckFilter!==value) {
                    view.chFilterButton.setValue(value, true);
                    this._state.CheckFilter=value;
                }
                Common.Utils.lockControls(Common.enumLock.isFilterAvailable, !this._state.CheckHeader || value===null, {array: [this.view.chFilterButton]});

                if (needTablePictures)
                    this.onApiInitTableStyles(this.api.asc_getTablePictures(props));

                // for table-template
                value = props.asc_getTableStyleName();
                if (this._state.TemplateName!==value || this._isTemplatesChanged) {
                    view.tableStyles.suspendEvents();
                    var rec = view.tableStyles.menuPicker.store.findWhere({
                        name: value
                    });
                    view.tableStyles.menuPicker.selectRecord(rec);
                    view.tableStyles.resumeEvents();

                    if (this._isTemplatesChanged) {
                        if (rec)
                            view.tableStyles.fillComboView(view.tableStyles.menuPicker.getSelectedRec(),true);
                        else
                            view.tableStyles.fillComboView(view.tableStyles.menuPicker.store.at(0), true);
                    }
                    this._state.TemplateName=value;
                }
                this._isTemplatesChanged = false;
            }
        },

        onTableStyleSelect: function(record){
            if (this.api) {
                this.api.asc_changeAutoFilter(this._state.TableName, Asc.c_oAscChangeFilterOptions.style, record.get('name'));
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        convertToRange: function(btn) {
            if (this.api) this.api.asc_convertTableToRange(this._state.TableName);
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        changeTableInfo: function(type, stateName, newValue) {
            this._state[stateName] = undefined;
            if (this.api)
                this.api.asc_changeFormatTableInfo(this._state.TableName, type, newValue=='checked');
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onEditClick: function(item) {
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

        setApi: function(api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.SetDisabled, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.SetDisabled, this));
                this.api.asc_registerCallback('asc_onSelectionChanged',     _.bind(this.onSelectionChanged, this));
                this.api.asc_registerCallback('asc_onSendThemeColors',      _.bind(this.onSendThemeColors, this));
                Common.NotificationCenter.on('cells:range',                 _.bind(this.onCellsRange, this));
            }
            return this;
        },

        onSendThemeColors: function() {
            if (this.view.tableStyles && this._originalProps) {
                this.onApiInitTableStyles(this.api.asc_getTablePictures(this._originalProps));
                this.view.tableStyles.menuPicker.scroller.update({alwaysVisibleY: true});
            }
        },

        onApiInitTableStyles: function(Templates){
            var self = this,
                styles = this.view.tableStyles;
            this._isTemplatesChanged = true;
            var count = styles.menuPicker.store.length;

            if (count>0 && count==Templates.length) {
                var data = styles.menuPicker.dataViewItems;
                var findDataViewItem = function(template) {
                    for(var i = 0; i < data.length; i++) {
                        if(data[i].model.get('name') && data[i].model.get('name') === template.asc_getName()) return data[i];
                        else if(data[i].model.get('caption') === template.asc_getDisplayName()) return data[i];
                    }
                    return undefined;
                };

                data && _.each(Templates, function(template, index){
                    var img = template.asc_getImage();
                    var dataViewItem = findDataViewItem(template);
                    dataViewItem && dataViewItem.model.set('imageUrl', img, {silent: true});
                    dataViewItem && $(dataViewItem.el).find('img').attr('src', img);
                });
                styles.fieldPicker.store.reset(styles.fieldPicker.store.models);
            } else {
                styles.menuPicker.store.reset([]);
                var templates = [];
                var groups = [
                    {id: 'menu-table-group-custom',    caption: self.view.txtGroupTable_Custom, templates: []},
                    {id: 'menu-table-group-light',     caption: self.view.txtGroupTable_Light,  templates: []},
                    {id: 'menu-table-group-medium',    caption: self.view.txtGroupTable_Medium, templates: []},
                    {id: 'menu-table-group-dark',      caption: self.view.txtGroupTable_Dark,   templates: []},
                    {id: 'menu-table-group-no-name',   caption: '&nbsp',                        templates: []},
                ];
                _.each(Templates, function(template, index){
                    var tip = template.asc_getDisplayName(),
                        groupItem = '',
                        lastWordInTip = null;
                    
                    if (template.asc_getType()==0) {
                        var arr = tip.split(' ');
                        lastWordInTip = arr.pop();
                            
                        if(template.asc_getName() === null){
                            groupItem = 'menu-table-group-light';
                        }
                        else {
                            if(arr.length > 0){
                                groupItem = 'menu-table-group-' + arr[arr.length - 1].toLowerCase();
                            }
                            if(groups.some(function(item) {return item.id === groupItem;}) == false) {
                                groupItem = 'menu-table-group-no-name';
                            }
                        }
                        arr = 'txtTable_' + arr.join('');
                        tip = self.view[arr] ? self.view[arr] + ' ' + lastWordInTip : tip;
                        lastWordInTip = parseInt(lastWordInTip);
                    }
                    else {
                        groupItem = 'menu-table-group-custom'
                    }  
                    groups.filter(function(item){ return item.id == groupItem; })[0].templates.push({
                        id          : Common.UI.getId(),
                        name        : template.asc_getName(),
                        caption     : template.asc_getDisplayName(),
                        type        : template.asc_getType(),
                        imageUrl    : template.asc_getImage(),
                        group       : groupItem, 
                        allowSelected : true,
                        selected    : false,
                        tip         : tip,
                        numInGroup  : (lastWordInTip != null && !isNaN(lastWordInTip) ? lastWordInTip : null)
                    });
                });

                var sortFunc = function(a, b) {
                    var aNum = a.numInGroup,
                        bNum = b.numInGroup;
                    return aNum - bNum;
                };

                groups[1].templates.sort(sortFunc);
                groups[2].templates.sort(sortFunc);
                groups[3].templates.sort(sortFunc);

                groups = groups.filter(function(item, index){
                    return item.templates.length > 0
                });
                
                groups.forEach(function(item){
                    templates = templates.concat(item.templates);
                    delete item.templates;
                });
                
                styles.groups.reset(groups);
                styles.menuPicker.store.reset(templates);
            }
        },

        setMode: function(mode) {
            this.appConfig = mode;
            return this;
        },

        openAdvancedSettings: function(e) {
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

        setConfig: function(config) {
            this.view = this.createView('TableDesignTab', {
                toolbar: config.toolbar.toolbar
            });
        },

        SetDisabled: function(state) {
            this.view && this.view.SetDisabled(state);
        },

        onInsertSlicer: function() {
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

        createToolbarPanel: function() {
            return this.view.getPanel();
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true);
        },

        onSelectionChanged: function(info) {
            if (!this.appConfig.isEdit || !this.view) return;
            var tableInfo = info.asc_getFormatTableInfo();
            if (tableInfo)
                this.ChangeSettings(tableInfo);
        },

        onCellsRange: function(status) {
            this.rangeSelectionMode = (status != Asc.c_oAscSelectionDialogType.None);
        },

    }, SSE.Controllers.TableDesignTab || {}));
});
