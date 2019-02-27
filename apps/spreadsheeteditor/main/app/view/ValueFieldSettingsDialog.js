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
 *  ValueFieldSettingsDialog.js
 *
 *  Created by Julia Radzhabova on 14.07.2017
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/InputField',
    'common/main/lib/component/ComboBox',
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    SSE.Views.ValueFieldSettingsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 284,
            height: 340
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                        '<div class="content-panel" style="padding: 0 10px;"><div class="inner-content">',
                        '<div class="settings-panel active">',
                        '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td colspan="2" class="padding-small" style="white-space: nowrap;">',
                                '<label class="header" style="vertical-align: middle; margin-right: 4px;">' + me.txtSourceName + '</label>',
                                '<label id="value-field-settings-source" style="vertical-align: middle; max-width: 220px; overflow: hidden; text-overflow: ellipsis;"></label>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" class="padding-large">',
                                '<label class="header">', me.txtCustomName,'</label>',
                                '<div id="value-field-settings-custom" style="width:264px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" class="padding-small">',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" class="padding-large">',
                                '<label class="header">', me.txtSummarize,'</label>',
                                '<div id="value-field-settings-summarize" class="input-group-nr" style="width:264px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" class="padding-small">',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" class="padding-large">',
                                '<label class="header">', me.txtShowAs,'</label>',
                                '<div id="value-field-settings-showas" class="input-group-nr" style="width:264px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-code">',
                            '<td>',
                                '<label class="header">', me.txtBaseField,'</label>',
                                '<div id="value-field-settings-field" class="input-group-nr" style="width:125px;"></div>',
                            '</td>',
                            '<td>',
                                '<label class="header">', me.txtBaseItem,'</label>',
                                '<div id="value-field-settings-item" class="input-group-nr" style="width:125px;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                    '</div></div>',
                    '</div>',
                    '</div>',
                    '<div class="separator horizontal"/>',
                    '<div class="footer center">',
                        '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;  width: 86px;">' + me.textOk + '</button>',
                        '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + me.textCancel + '</button>',
                    '</div>'
                ].join('')
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;
            this.field      = options.field || 0;
            this.names      = options.names || [];

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.inputCustomName = new Common.UI.InputField({
                el          : $('#value-field-settings-custom'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            });

            this.cmbSummarize = new Common.UI.ComboBox({
                el: $('#value-field-settings-summarize'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 264px;',
                editable: false,
                data: [
                    { value: Asc.c_oAscDataConsolidateFunction.Sum,     displayValue: this.txtSum },
                    { value: Asc.c_oAscDataConsolidateFunction.Count,   displayValue: this.txtCount },
                    { value: Asc.c_oAscDataConsolidateFunction.Average, displayValue: this.txtAverage },
                    { value: Asc.c_oAscDataConsolidateFunction.Max,     displayValue: this.txtMax },
                    { value: Asc.c_oAscDataConsolidateFunction.Min,     displayValue: this.txtMin },
                    { value: Asc.c_oAscDataConsolidateFunction.Product, displayValue: this.txtProduct },
                    { value: Asc.c_oAscDataConsolidateFunction.CountNums,displayValue: this.txtCountNums },
                    { value: Asc.c_oAscDataConsolidateFunction.StdDev,  displayValue: this.txtStdDev },
                    { value: Asc.c_oAscDataConsolidateFunction.StdDevp, displayValue: this.txtStdDevp },
                    { value: Asc.c_oAscDataConsolidateFunction.Var,     displayValue: this.txtVar },
                    { value: Asc.c_oAscDataConsolidateFunction.Varp,    displayValue: this.txtVarp }
                ]
            });
            this.cmbSummarize.setValue(Asc.c_oAscDataConsolidateFunction.Sum);
            this.cmbSummarize.on('selected', _.bind(this.onSummarizeSelect, this));

            this.cmbShowAs = new Common.UI.ComboBox({
                el: $('#value-field-settings-showas'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 264px;',
                editable: false,
                data: [
                    { value: Asc.c_oAscShowDataAs.Normal,           displayValue: this.txtNormal },
                    { value: Asc.c_oAscShowDataAs.PercentOfRow,     displayValue: this.txtPercentOfRow },
                    { value: Asc.c_oAscShowDataAs.PercentOfCol,     displayValue: this.txtPercentOfCol },
                    { value: Asc.c_oAscShowDataAs.PercentOfTotal,   displayValue: this.txtPercentOfTotal },
                    { value: Asc.c_oAscShowDataAs.Percent,          displayValue: this.txtPercent },
                    { value: Asc.c_oAscShowDataAs.Difference,       displayValue: this.txtDifference },
                    { value: Asc.c_oAscShowDataAs.PercentDiff,      displayValue: this.txtPercentDiff },
                    { value: Asc.c_oAscShowDataAs.RunTotal,         displayValue: this.txtRunTotal },
                    { value: Asc.c_oAscShowDataAs.Index,            displayValue: this.txtIndex }
                ]
            });
            this.cmbShowAs.setValue(Asc.c_oAscDataConsolidateFunction.Normal);
            this.cmbShowAs.on('selected', _.bind(this.onShowAsSelect, this));

            this.cmbBaseField = new Common.UI.ComboBox({
                el: $('#value-field-settings-field'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 264px;max-height:235px;',
                editable: false,
                data: [],
                scrollAlwaysVisible: true
            });
            this.cmbBaseField.on('selected', _.bind(this.onBaseFieldSelect, this));

            this.cmbBaseItem = new Common.UI.ComboBox({
                el: $('#value-field-settings-item'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 264px;max-height:235px;',
                editable: false,
                data: [],
                scrollAlwaysVisible: true
            });
            this.cmbBaseItem.on('selected', _.bind(this.onBaseItemSelect, this));

            this.lblSourceName = this.$window.find('#value-field-settings-source');

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        _setDefaults: function (props) {
            if (props) {
                var field = this.field,
                    cache_names = props.asc_getCacheFields(),
                    show_as = field.asc_getShowDataAs();

                this.lblSourceName.html(Common.Utils.String.htmlEncode(cache_names[field.asc_getIndex()].asc_getName()));
                this.inputCustomName.setValue(Common.Utils.String.htmlEncode(field.asc_getName()));

                this.cmbSummarize.setValue(field.asc_getSubtotal());
                this.cmbShowAs.setValue(show_as);

                var data = [];
                this.names.forEach(function(item){
                    data.push({value: item, displayValue: item});
                });
                this.cmbBaseField.setData(data);
                this.cmbBaseField.setValue(this.names[0]);
                this.cmbBaseField.setDisabled(show_as != c_oAscShowDataAs.Difference && show_as != c_oAscShowDataAs.Percent &&
                                              show_as != c_oAscShowDataAs.PercentDiff && show_as != c_oAscShowDataAs.RunTotal);

                // this.cmbBaseItem.setData(data);
                this.cmbBaseItem.setDisabled(show_as != c_oAscShowDataAs.Difference && show_as != c_oAscShowDataAs.Percent &&
                                             show_as != c_oAscShowDataAs.PercentDiff);
            }
        },

        getSettings: function () {
            var field = new Asc.CT_DataField();
            field.asc_setName(this.inputCustomName.getValue());
            field.asc_setSubtotal(this.cmbSummarize.getValue());

            return field;
        },

        onDlgBtnClick: function(event) {
            var me = this;
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'ok') {
                this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            }

            this.close();
        },

        onPrimary: function() {
            this.onDlgBtnClick('ok');
            return false;
        },

        onSummarizeSelect: function(combo, record) {
            this.inputCustomName.setValue(record.displayValue + ' ' + this.txtByField + ' ' + this.lblSourceName.text());
        },

        onShowAsSelect: function(combo, record) {
        },

        onBaseFieldSelect: function(combo, record) {
        },

        onBaseItemSelect: function(combo, record) {
        },

        textTitle: 'Value Field Settings',
        textCancel: 'Cancel',
        textOk: 'OK',
        txtSourceName: 'Source name: ',
        txtCustomName: 'Custom name',
        txtSummarize: 'Summarize value field by',
        txtShowAs: 'Show values as',
        txtBaseField: 'Base field',
        txtBaseItem: 'Base item',
        txtAverage: 'Average',
        txtCount: 'Count',
        txtCountNums: 'Count Numbers',
        txtMax: 'Max',
        txtMin: 'Min',
        txtProduct: 'Product',
        txtStdDev: 'StdDev',
        txtStdDevp: 'StdDevp',
        txtSum: 'Sum',
        txtVar: 'Var',
        txtVarp: 'Varp',
        txtNormal: 'No Calculation',
        txtDifference: 'The Difference From',
        txtPercent: 'Percent of',
        txtPercentDiff: 'Percent Difference From',
        txtRunTotal: 'Running Total In',
        txtPercentOfRow: 'Percent of Total',
        txtPercentOfCol: 'Percent of Column',
        txtPercentOfTotal: 'Percent of Row',
        txtIndex: 'Index',
        txtByField: 'by field'

    }, SSE.Views.ValueFieldSettingsDialog || {}))
});