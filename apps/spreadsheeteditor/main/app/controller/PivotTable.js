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
 *  PivotTable.js
 *
 *  Created by Julia.Radzhabova on 06.27.17
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
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
                    'pivottable:style':         _.bind(this.onPivotStyleSelect, this),
                    'pivottable:layout':        _.bind(this.onPivotLayout, this),
                    'pivottable:blankrows':     _.bind(this.onPivotBlankRows, this),
                    'pivottable:subtotals':     _.bind(this.onPivotSubtotals, this),
                    'pivottable:grandtotals':   _.bind(this.onPivotGrandTotals, this)
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

            this.view =   this.createView('PivotTable');

            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('api:disconnect', _.bind(this.SetDisabled, this));
        },

        setConfig: function (data, api) {
            this.setApi(api);

            if (data) {
                this.sdkViewName        =   data['sdkviewname'] || this.sdkViewName;
            }
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.SetDisabled, this));
                this.api.asc_registerCallback('asc_onSendThemeColors',      _.bind(this.onSendThemeColors, this));
                this.api.asc_registerCallback('asc_onSelectionChanged',     _.bind(this.onSelectionChanged, this));
            }
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

        onCreateClick: function(btn, opts){
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onRefreshClick: function(btn, opts){
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onSelectClick: function(btn, opts){
            if (this.api) {
                this._originalProps.asc_select(this.api);
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
                if (type === 'insert'){

                } else {

                }
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onPivotLayout: function(type){
            if (this.api) {
                switch (type){
                    case 0:
                        break;
                    case 1:
                        break;
                    case 2:
                        break;
                    case 3:
                        break;
                    case 4:
                        break;
                }
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
                switch (type){
                    case 0:
                        break;
                    case 1:
                        break;
                    case 2:
                        break;
                }
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
                            view.pivotStyles.fillComboView(view.pivotStyles.menuPicker.getSelectedRec()[0],true);
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
                var data = styles.menuPicker.store.models;
                _.each(Templates, function(template, index){
                    data[index].set('imageUrl', template.asc_getImage());
                });
            } else {
                styles.menuPicker.store.reset([]);
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
                styles.menuPicker.store.add(arr);
            }
        },

        onSelectionChanged: function(info) {
            if (this.rangeSelectionMode || !this.appConfig.isEdit) return;

            var selectType = info.asc_getFlags().asc_getSelectionType(),
                pivotInfo = info.asc_getPivotTableInfo();

            this.view.SetDisabled(!pivotInfo || info.asc_getLockedPivotTable());
            if (pivotInfo)
                this.ChangeSettings(pivotInfo);
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
        }

    }, SSE.Controllers.PivotTable || {}));
});