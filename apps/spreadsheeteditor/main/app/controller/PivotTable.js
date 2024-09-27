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
 *  PivotTable.js
 *
 *  Created on 06.27.17
 *
 */

define([
    'core',
    'spreadsheeteditor/main/app/view/PivotTable'
], function () {
    'use strict';

    SSE.Controllers.PivotTable = Backbone.Controller.extend(_.extend({
        models : [],
        views : [
            'PivotTable'
        ],
        sdkViewName : '#id_main',

        initialize: function () {

            this.addListeners({
                'PivotTable': {
                    // comments handlers
                    'pivottable:rowscolumns':   _.bind(this.onCheckTemplateChange, this),
                    'pivottable:create':        _.bind(this.onCreateClick, this),
                    'pivottable:refresh':       _.bind(this.onRefreshClick, this),
                    'pivottable:select':        _.bind(this.onSelectClick, this),
                    'pivottable:expand':        _.bind(this.onExpandClick, this),
                    'pivottable:collapse':      _.bind(this.onCollapseClick, this),
                    'pivottable:style':         _.bind(this.onPivotStyleSelect, this),
                    'pivottable:layout':        _.bind(this.onPivotLayout, this),
                    'pivottable:blankrows':     _.bind(this.onPivotBlankRows, this),
                    'pivottable:subtotals':     _.bind(this.onPivotSubtotals, this),
                    'pivottable:grandtotals':   _.bind(this.onPivotGrandTotals, this),
                    'pivot:open':               _.bind(this.onPivotOpen, this)
                },
                'TableSettings': {
                    'pivottable:create':        _.bind(this.onCreateClick, this)
                }
            });
        },
        onLaunch: function () {
            this._state = {
                TableName: '',
                TemplateName: '',
                RowHeader: undefined,
                RowBanded: undefined,
                ColHeader: undefined,
                ColBanded: undefined,
                DisabledControls: false
            };
            this._originalProps = null;

            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('api:disconnect', _.bind(this.SetDisabled, this));
            Common.NotificationCenter.on('more:toggle', _.bind(this.onMoreToggle, this));
        },

        setConfig: function (config) {
            this.view =   this.createView('PivotTable', {
                toolbar: config.toolbar.toolbar
            });
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.SetDisabled, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.SetDisabled, this));
                this.api.asc_registerCallback('asc_onSendThemeColors',      _.bind(this.onSendThemeColors, this));
                this.api.asc_registerCallback('asc_onSelectionChanged',     _.bind(this.onSelectionChanged, this));
                Common.NotificationCenter.on('cells:range',                 _.bind(this.onCellsRange, this));
            }
            return this;
        },

        setMode: function(mode) {
            this.appConfig = mode;
            return this;
        },

        SetDisabled: function() {
            this.view && this.view.SetDisabled(true);
        },

        // helpers

        onCheckTemplateChange: function(type, value) {
            // this._state[stateName] = undefined;
            // if (this.api)
            //     this.api.asc_changeFormatTableInfo(this._state.TableName, type, value=='checked');
            // for test
            switch (type) {
                case 0:
                    this._originalProps.asc_getStyleInfo().asc_setShowRowHeaders(this.api, this._originalProps, value=='checked');
                    break;
                case 1:
                    this._originalProps.asc_getStyleInfo().asc_setShowColHeaders(this.api, this._originalProps, value=='checked');
                    break;
                case 2:
                    this._originalProps.asc_getStyleInfo().asc_setShowRowStripes(this.api, this._originalProps, value=='checked');
                    break;
                case 3:
                    this._originalProps.asc_getStyleInfo().asc_setShowColStripes(this.api, this._originalProps, value=='checked');
                    break;
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        createSheetName: function() {
            var items = [], wc = this.api.asc_getWorksheetsCount();
            while (wc--) {
                items.push(this.api.asc_getWorksheetName(wc).toLowerCase());
            }

            var index = 0, name;
            while(++index < 1000) {
                name = this.strSheet + index;
                if (items.indexOf(name.toLowerCase()) < 0) break;
            }

            return name;
        },

        onCreateClick: function(btn, opts){
            if (this.api) {
				var options = this.api.asc_getAddPivotTableOptions();
				if (options) {
				    var me = this;
                    (new SSE.Views.CreatePivotDialog(
                        {
                            props: options,
                            api: me.api,
                            handler: function(result, settings) {
                                if (result == 'ok' && settings) {
                                    me.view && me.view.fireEvent('insertpivot', me.view);
                                    if (settings.destination)
                                        me.api.asc_insertPivotExistingWorksheet(settings.source, settings.destination);
                                    else
                                        me.api.asc_insertPivotNewWorksheet(settings.source, me.createSheetName());
                                }
                                Common.NotificationCenter.trigger('edit:complete', me);
                            }
                        })).show();
				}
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onRefreshClick: function(type){
            if (this.api) {
                if(type == 'current') this._originalProps.asc_refresh(this.api);
                else if(type == 'all') this.api.asc_refreshAllPivots();
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onSelectClick: function(btn, opts){
            if (this.api) {
                this._originalProps.asc_select(this.api);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onExpandClick: function(){
            if (this.api) {
                this._originalProps.asc_setExpandCollapseByActiveCell(this.api, true, true);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onCollapseClick: function(){
            if (this.api) {
                this._originalProps.asc_setExpandCollapseByActiveCell(this.api, true, false);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onPivotStyleSelect: function(record){
            if (this.api) {
                this._originalProps.asc_getStyleInfo().asc_setName(this.api, this._originalProps, record.get('name'));
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onPivotBlankRows: function(type){
            if (this.api) {
                var props = new Asc.CT_pivotTableDefinition();
                props.asc_setInsertBlankRow(type === 'insert');
                this._originalProps.asc_set(this.api, props);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onPivotLayout: function(type){
            if (this.api) {
                var props = new Asc.CT_pivotTableDefinition();
                switch (type){
                    case 0:
                        props.asc_setCompact(true);
                        props.asc_setOutline(true);
                        break;
                    case 1:
                        props.asc_setCompact(false);
                        props.asc_setOutline(true);
                        break;
                    case 2:
                        props.asc_setCompact(false);
                        props.asc_setOutline(false);
                        break;
                    case 3:
                        props.asc_setFillDownLabelsDefault(true);
                        break;
                    case 4:
                        props.asc_setFillDownLabelsDefault(false);
                        break;
                }
                this._originalProps.asc_set(this.api, props);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onPivotGrandTotals: function(type){
            if (this.api) {
                var props = new Asc.CT_pivotTableDefinition();
                props.asc_setColGrandTotals(type == 1 || type == 2);
                props.asc_setRowGrandTotals(type == 1 || type == 3);
                this._originalProps.asc_set(this.api, props);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onPivotSubtotals: function(type){
            if (this.api) {
                var props = new Asc.CT_pivotTableDefinition();
                switch (type){
                    case 0:
                        props.asc_setDefaultSubtotal(false);
                        break;
                    case 1:
                        props.asc_setDefaultSubtotal(true);
                        props.asc_setSubtotalTop(false);
                        break;
                    case 2:
                        props.asc_setDefaultSubtotal(true);
                        props.asc_setSubtotalTop(true);
                        break;
                }
                this._originalProps.asc_set(this.api, props);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        ChangeSettings: function(props) {
            if (props )
            {
                this._originalProps = props;

                var view = this.view,
                    needTablePictures = false,
                    styleInfo = props.asc_getStyleInfo(),
                    value = styleInfo.asc_getShowRowHeaders();
                if (this._state.RowHeader!==value) {
                    view.chRowHeader.setValue(value, true);
                    this._state.RowHeader=value;
                    needTablePictures = true;
                }

                value = styleInfo.asc_getShowColHeaders();
				if (this._state.ColHeader!==value) {
					view.chColHeader.setValue(value, true);
					this._state.ColHeader=value;
					needTablePictures = true;
				}

                value = styleInfo.asc_getShowColStripes();
				if (this._state.ColBanded!==value) {
					view.chColBanded.setValue(value, true);
					this._state.ColBanded=value;
					needTablePictures = true;
				}

                value = styleInfo.asc_getShowRowStripes();
				if (this._state.RowBanded!==value) {
					view.chRowBanded.setValue(value, true);
					this._state.RowBanded=value;
					needTablePictures = true;
				}

                value = props.asc_getColGrandTotals();
                if (this._state.ColGrandTotals!==value) {
                    this._state.ColGrandTotals=value;
                    needTablePictures = true;
                }

                value = props.asc_getRowGrandTotals();
                if (this._state.RowGrandTotals!==value) {
                    this._state.RowGrandTotals=value;
                    needTablePictures = true;
                }

                if (needTablePictures)
                    this.onApiInitPivotStyles(this.api.asc_getTablePictures(this._originalProps, true));

                //for table-template
                value = styleInfo.asc_getName();
                if (this._state.TemplateName!==value || this._isTemplatesChanged) {
                    view.pivotStyles.suspendEvents();
                    var rec = view.pivotStyles.menuPicker.store.findWhere({
                        name: value
                    });
                    view.pivotStyles.menuPicker.selectRecord(rec);
                    view.pivotStyles.resumeEvents();

                    if (this._isTemplatesChanged) {
                        if (rec)
                            view.pivotStyles.fillComboView(view.pivotStyles.menuPicker.getSelectedRec(),true);
                        else
                            view.pivotStyles.fillComboView(view.pivotStyles.menuPicker.store.at(0), true);
                    }
                    this._state.TemplateName=value;
                }
                this._isTemplatesChanged = false;
            }
        },

        onSendThemeColors: function() {
            // get new table templates
            if (this.view.pivotStyles && this._originalProps) {
                this.onApiInitPivotStyles(this.api.asc_getTablePictures(this._originalProps, true));
                this.view.pivotStyles.menuPicker.scroller.update({alwaysVisibleY: true});
            }
        },

        onApiInitPivotStyles: function(Templates){
            var self = this,
                styles = this.view.pivotStyles;
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
                    {id: 'menu-table-group-custom',    caption: self.view.txtGroupPivot_Custom, templates: []},
                    {id: 'menu-table-group-light',     caption: self.view.txtGroupPivot_Light,  templates: []},
                    {id: 'menu-table-group-medium',    caption: self.view.txtGroupPivot_Medium, templates: []},
                    {id: 'menu-table-group-dark',      caption: self.view.txtGroupPivot_Dark,   templates: []},
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

        onPivotOpen: function() {
            var styles = this.view.pivotStyles;
            if (styles && styles.needFillComboView &&  styles.menuPicker.store.length > 0 && styles.rendered){
                var styleRec;
                if (this._state.TemplateName) styleRec = styles.menuPicker.store.findWhere({name: this._state.TemplateName});
                styles.fillComboView((styleRec) ? styleRec : styles.menuPicker.store.at(0), true);
            }
        },

        onSelectionChanged: function(info) {
            if (this.rangeSelectionMode || !this.appConfig.isEdit || !this.view) return;

            var pivotInfo = info.asc_getPivotTableInfo();

            Common.Utils.lockControls(Common.enumLock.noPivot, !pivotInfo, {array: this.view.lockedControls});
            Common.Utils.lockControls(Common.enumLock.pivotLock, pivotInfo && (info.asc_getLockedPivotTable()===true), {array: this.view.lockedControls});
            Common.Utils.lockControls(Common.enumLock.editPivot, !!pivotInfo, {array: this.view.btnsAddPivot});
            Common.Utils.lockControls(Common.enumLock.pivotExpandLock, !(pivotInfo && pivotInfo.asc_canExpandCollapseByActiveCell(this.api)), {array: [this.view.btnExpandField, this.view.btnCollapseField]});

            if (pivotInfo)
                this.ChangeSettings(pivotInfo);
        },

        onCellsRange: function(status) {
            this.rangeSelectionMode = (status != Asc.c_oAscSelectionDialogType.None);
        },

        createToolbarPanel: function() {
            return this.view.getPanel();
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onAppReady: function (config) {
            var me = this;
            (new Promise(function (resolve) {
                resolve();
            })).then(function () {
            });
        },

        onMoreToggle: function(btn, state, e) {
            if (this.view && this.view.toolbar && this.view.toolbar.isTabActive('pivot') && state) {
                var styles = this.view.pivotStyles;
                if (styles && styles.needFillComboView &&  styles.menuPicker.store.length > 0 && styles.rendered){
                    var styleRec;
                    if (this._state.TemplateName) styleRec = styles.menuPicker.store.findWhere({name: this._state.TemplateName});
                    styles.fillComboView((styleRec) ? styleRec : styles.menuPicker.store.at(0), true);
                }
            }
        },

        strSheet        : 'Sheet'

    }, SSE.Controllers.PivotTable || {}));
});