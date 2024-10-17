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
 *  ValueFieldSettingsDialog.js
 *
 *  Created on 14.07.2017
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';

    SSE.Views.ValueFieldSettingsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 284,
            separator: false
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                contentStyle: 'padding: 0 10px;',
                contentTemplate: _.template([
                    '<div class="settings-panel active">',
                    '<div class="inner-content">',
                        '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td colspan="2" class="padding-small" style="white-space: nowrap;">',
                                '<label class="header" class="margin-right-4" style="vertical-align: middle;">' + me.txtSourceName + '</label>',
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
                            '<td colspan="2" class="padding-large">',
                                '<label class="header">', me.txtSummarize,'</label>',
                                '<div id="value-field-settings-summarize" class="input-group-nr" style="width:264px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" class="padding-large">',
                                '<label class="header" style="display:block;">', me.txtShowAs,'</label>',
                                '<div id="value-field-settings-showas" class="input-group-nr float-left" style="width:128px;"></div>',
                                '<div id="value-field-settings-numformat" class="float-right" style="width:128px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-code">',
                            '<td class="padding-small">',
                                '<label class="header">', me.txtBaseField,'</label>',
                                '<div id="value-field-settings-field" class="input-group-nr" style="width:128px;"></div>',
                            '</td>',
                            '<td class="padding-small float-right">',
                                '<label class="header">', me.txtBaseItem,'</label>',
                                '<div id="value-field-settings-item" class="input-group-nr" style="width:128px;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                    '</div></div>'
                ].join(''))({scope: this})
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;
            this.field      = options.field || 0;
            this.showAsValue = options.showAsValue;
            this.baseFieldChanged = false;
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
                menuStyle: 'min-width: 264px;max-height:160px;',
                scrollAlwaysVisible: true,
                editable: false,
                takeFocusOnClose: true,
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
                menuStyle: 'min-width: 264px;max-height:160px;',
                editable: false,
                takeFocusOnClose: true,
                data: [
                    { value: Asc.c_oAscShowDataAs.Normal,               displayValue: this.txtNormal,           numFormat: Asc.c_oAscNumFormatType.General },
                    { value: Asc.c_oAscShowDataAs.PercentOfTotal,       displayValue: this.txtPercentOfGrand,   numFormat: Asc.c_oAscNumFormatType.Percent },
                    { value: Asc.c_oAscShowDataAs.PercentOfCol,         displayValue: this.txtPercentOfCol,     numFormat: Asc.c_oAscNumFormatType.Percent },
                    { value: Asc.c_oAscShowDataAs.PercentOfRow,         displayValue: this.txtPercentOfTotal,   numFormat: Asc.c_oAscNumFormatType.Percent },
                    { value: Asc.c_oAscShowDataAs.Percent,              displayValue: this.txtPercent,          numFormat: Asc.c_oAscNumFormatType.Percent },
                    { value: Asc.c_oAscShowDataAs.PercentOfParentRow,   displayValue: this.txtPercentOfParentRow, numFormat: Asc.c_oAscNumFormatType.Percent },
                    { value: Asc.c_oAscShowDataAs.PercentOfParentCol,   displayValue: this.txtPercentOfParentCol, numFormat: Asc.c_oAscNumFormatType.Percent },
                    { value: Asc.c_oAscShowDataAs.PercentOfParent,      displayValue: this.txtPercentOfParent,  numFormat: Asc.c_oAscNumFormatType.Percent },
                    { value: Asc.c_oAscShowDataAs.Difference,           displayValue: this.txtDifference,       numFormat: Asc.c_oAscNumFormatType.General },
                    { value: Asc.c_oAscShowDataAs.PercentDiff,          displayValue: this.txtPercentDiff,      numFormat: Asc.c_oAscNumFormatType.Percent },
                    { value: Asc.c_oAscShowDataAs.RunTotal,             displayValue: this.txtRunTotal,         numFormat: Asc.c_oAscNumFormatType.General },
                    { value: Asc.c_oAscShowDataAs.PercentOfRunningTotal,displayValue: this.txtPercentOfRunTotal,numFormat: Asc.c_oAscNumFormatType.Percent },
                    { value: Asc.c_oAscShowDataAs.RankAscending,        displayValue: this.txtRankAscending,    numFormat: Asc.c_oAscNumFormatType.General },
                    { value: Asc.c_oAscShowDataAs.RankDescending,       displayValue: this.txtRankDescending,   numFormat: Asc.c_oAscNumFormatType.General },
                    { value: Asc.c_oAscShowDataAs.Index,                displayValue: this.txtIndex,            numFormat: Asc.c_oAscNumFormatType.General }
                ]
            });
            this.cmbShowAs.setValue(Asc.c_oAscShowDataAs.Normal);
            this.cmbShowAs.on('selected', _.bind(this.onShowAsSelect, this));

            this.cmbBaseField = new Common.UI.ComboBox({
                el: $('#value-field-settings-field'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;max-height:160px;',
                editable: false,
                takeFocusOnClose: true,
                data: [],
                scrollAlwaysVisible: true
            });
            this.cmbBaseField.on('selected', _.bind(this.onBaseFieldSelect, this));

            this.cmbBaseItem = new Common.UI.ComboBox({
                el: $('#value-field-settings-item'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;max-height:160px;',
                editable: false,
                takeFocusOnClose: true,
                data: [],
                scrollAlwaysVisible: true
            });
            this.cmbBaseItem.on('selected', _.bind(this.onBaseItemSelect, this));

            this.lblSourceName = this.$window.find('#value-field-settings-source');

            this.btnFormat = new Common.UI.Button({
                parentEl: $('#value-field-settings-numformat'),
                cls: 'btn-text-default',
                style: 'width: 128px;',
                caption: this.textNumFormat
            });
            this.btnFormat.on('click', _.bind(this.openFormat, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.inputCustomName, this.cmbSummarize, this.cmbShowAs, this.btnFormat, this.cmbBaseField, this.cmbBaseItem].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.inputCustomName;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {

            this.format = {
                defFormats: []
            };
            var info = new Asc.asc_CFormatCellsInfo();
            info.asc_setType(Asc.c_oAscNumFormatType.General);
            info.asc_setDecimalPlaces(0);
            info.asc_setSeparator(false);
            this.format.defFormats[Asc.c_oAscNumFormatType.General] = { formatStr: this.api.asc_getFormatCells(info)[0], formatInfo: info };

            info = new Asc.asc_CFormatCellsInfo();
            info.asc_setType(Asc.c_oAscNumFormatType.Percent);
            info.asc_setDecimalPlaces(2);
            info.asc_setSeparator(false);
            this.format.defFormats[Asc.c_oAscNumFormatType.Percent] = { formatStr: this.api.asc_getFormatCells(info)[0], formatInfo: info };

            if (props) {
                var field = this.field,
                    me = this;
                this.cache_names = props.asc_getCacheFields();
                this.pivot_names = props.asc_getPivotFields();
                this.format.formatStr = field.asc_getNumFormat();
                this.format.formatInfo = field.asc_getNumFormatInfo();

                this.lblSourceName.html(Common.Utils.String.htmlEncode(this.cache_names[field.asc_getIndex()].asc_getName()));
                this.inputCustomName.setValue(field.asc_getName());
                this.cmbSummarize.setValue(field.asc_getSubtotal());

                var show_as = field.asc_getShowDataAs();
                this.cmbShowAs.setValue(show_as);
                this.format.show_as = show_as;

                var data = [];
                this.pivot_names.forEach(function (item, index) {
                    data.push({value: index, displayValue: item.asc_getName() || me.cache_names[index].asc_getName()});
                });

                var defValue = this.api.asc_getPivotShowValueAsInfo(Asc.c_oAscShowDataAs.Difference);
                this.cmbBaseField.setData(data);
                var disabled = (show_as === Asc.c_oAscShowDataAs.Normal || show_as === Asc.c_oAscShowDataAs.PercentOfTotal || show_as === Asc.c_oAscShowDataAs.PercentOfRow || show_as === Asc.c_oAscShowDataAs.PercentOfCol ||
                                show_as === Asc.c_oAscShowDataAs.PercentOfParentRow || show_as === Asc.c_oAscShowDataAs.PercentOfParentCol || show_as === Asc.c_oAscShowDataAs.Index);
                this.cmbBaseField.setDisabled(disabled);
                this.cmbBaseField.setValue(disabled && defValue ? defValue.asc_getBaseField() : field.asc_getBaseField() , '');

                data = [];
                var baseitems = this.pivot_names[field.asc_getBaseField()].asc_getBaseItemObject(this.cache_names[field.asc_getBaseField()]);
                baseitems.forEach(function(item, index){
                    data.push({value: item["baseItem"], displayValue: index===0 ? me.textPrev : (index===1 ? me.textNext : item["name"])});
                });
                this.cmbBaseItem.setData(data);
                this.cmbBaseItem.setDisabled(data.length<1 || show_as !== Asc.c_oAscShowDataAs.Difference && show_as !== Asc.c_oAscShowDataAs.Percent && show_as !== Asc.c_oAscShowDataAs.PercentDiff);
                this.cmbBaseItem.setValue((data.length>0) && (show_as === Asc.c_oAscShowDataAs.Difference || show_as === Asc.c_oAscShowDataAs.Percent || show_as === Asc.c_oAscShowDataAs.PercentDiff) ? field.asc_getBaseItem() : '', '');

                this.btnFormat.setDisabled(this.props.asc_getFieldGroupType(field.asc_getIndex()) === Asc.c_oAscGroupType.Text);
                if (this.getDefFormat(show_as)===Asc.c_oAscNumFormatType.General)
                    this.format.defFormats[Asc.c_oAscNumFormatType.General] = {formatStr: this.format.formatStr, formatInfo: this.format.formatInfo }
            }

            if (this.showAsValue!==undefined) {
                this.cmbShowAs.setValue(this.showAsValue);
                this.onShowAsSelect(this.cmbShowAs, this.cmbShowAs.getSelectedRecord());
            }
        },

        getSettings: function () {
            var field = new Asc.CT_DataField();
            field.asc_setName(this.inputCustomName.getValue());
            field.asc_setSubtotal(this.cmbSummarize.getValue());
            field.asc_setShowDataAs(this.cmbShowAs.getValue());

            this.format.isChanged && this.cmbShowAs.getSelectedRecord() && field.asc_setNumFormat(this.format.formatStr);

            if (!this.cmbBaseField.isDisabled())
                field.asc_setBaseField(this.cmbBaseField.getValue());
            if (!this.cmbBaseItem.isDisabled())
                field.asc_setBaseItem(this.cmbBaseItem.getValue());

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
            this.inputCustomName.setValue(this.txtByField.replace('%1', record.displayValue).replace('%2',  this.lblSourceName.text()));
        },

        onShowAsSelect: function(combo, record) {
            var show_as = record.value,
                disabled = (show_as === Asc.c_oAscShowDataAs.Normal || show_as === Asc.c_oAscShowDataAs.PercentOfTotal || show_as === Asc.c_oAscShowDataAs.PercentOfRow || show_as === Asc.c_oAscShowDataAs.PercentOfCol ||
                            show_as === Asc.c_oAscShowDataAs.PercentOfParentRow || show_as === Asc.c_oAscShowDataAs.PercentOfParentCol || show_as === Asc.c_oAscShowDataAs.Index);
            this.cmbBaseField.setDisabled(disabled);
            if (!this.baseFieldChanged) {
                var defValue = this.api.asc_getPivotShowValueAsInfo(show_as);
                if (defValue) {
                    this.cmbBaseField.setValue(defValue.asc_getBaseField(), '');
                    this.cmbBaseField.getSelectedRecord() && this.changeBaseField(defValue.asc_getBaseItem());
                }
            } else {
                this.cmbBaseItem.setValue((show_as === Asc.c_oAscShowDataAs.Difference || show_as === Asc.c_oAscShowDataAs.Percent || show_as === Asc.c_oAscShowDataAs.PercentDiff) && this.cmbBaseItem.store.length>0 ?
                                            this.cmbBaseItem.store.at(this.cmbBaseItem.store.length>2 ? 2 : 0).get('value') : '', '');
            }
            this.cmbBaseItem.setDisabled(this.cmbBaseItem.store.length<1 || show_as !== Asc.c_oAscShowDataAs.Difference && show_as !== Asc.c_oAscShowDataAs.Percent && show_as !== Asc.c_oAscShowDataAs.PercentDiff);
            var newFormat = this.getDefFormat(show_as);
            if (newFormat !== this.getDefFormat(this.format.show_as)) {
                this.format.isChanged = true;
                this.format.formatStr = this.format.defFormats[newFormat].formatStr;
                this.format.formatInfo = this.format.defFormats[newFormat].formatInfo;
            }
            this.format.show_as = show_as;
        },

        onBaseFieldSelect: function(combo, record) {
            this.changeBaseField();
            this.baseFieldChanged = true;
        },

        changeBaseField: function(value) {
            var field = this.cmbBaseField.getValue(),
                baseitems = this.pivot_names[field].asc_getBaseItemObject(this.cache_names[field]),
                data = [],
                me = this;
            baseitems.forEach(function(item, index){
                data.push({value: item["baseItem"], displayValue: index===0 ? me.textPrev : (index===1 ? me.textNext : item["name"])});
            });
            this.cmbBaseItem.setData(data);
            if (value===undefined && data.length>0) {
                value = this.cmbBaseItem.store.at(data.length>2 ? 2 : 0).get('value');
            }
            var show_as = this.cmbShowAs.getValue();
            this.cmbBaseItem.setDisabled(data.length<1 || show_as !== Asc.c_oAscShowDataAs.Difference && show_as !== Asc.c_oAscShowDataAs.Percent && show_as !== Asc.c_oAscShowDataAs.PercentDiff);
            this.cmbBaseItem.setValue((show_as === Asc.c_oAscShowDataAs.Difference || show_as === Asc.c_oAscShowDataAs.Percent || show_as === Asc.c_oAscShowDataAs.PercentDiff) && data.length>0 ?
                                    value : '', '');
        },

        onBaseItemSelect: function(combo, record) {
        },

        openFormat: function() {
            var me = this,
                value = me.api.asc_getLocale(),
                lang = Common.Utils.InternalSettings.get("sse-config-lang");
            (!value) && (value = (lang ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(lang)) : 0x0409));

            var win = (new SSE.Views.FormatSettingsDialog({
                api: me.api,
                handler: function(result, settings) {
                    if (result=='ok' && settings) {
                        me.format.isChanged = true;
                        me.format.formatStr = settings.format;
                        me.format.formatInfo = settings.formatInfo;
                        if (me.getDefFormat(me.format.show_as)===Asc.c_oAscNumFormatType.General) {
                            me.format.defFormats[Asc.c_oAscNumFormatType.General].formatStr = settings.format;
                            me.format.defFormats[Asc.c_oAscNumFormatType.General].formatInfo = settings.formatInfo;
                        }
                    }
                },
                props   : {format: this.format.formatStr, formatInfo: this.format.formatInfo, langId: value}
            })).on('close', function() {
                me.btnFormat.cmpEl.focus();
            });
            win.show();
        },

        getDefFormat: function(value) {
            if (value === Asc.c_oAscShowDataAs.Normal || value === Asc.c_oAscShowDataAs.Difference || value === Asc.c_oAscShowDataAs.RunTotal ||
                value === Asc.c_oAscShowDataAs.RankAscending || value === Asc.c_oAscShowDataAs.RankDescending || value === Asc.c_oAscShowDataAs.Index )
                return Asc.c_oAscNumFormatType.General;

            return Asc.c_oAscNumFormatType.Percent;
        },
        textTitle: 'Value Field Settings',
        txtSourceName: 'Source name:',
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
        txtNormal: 'No calculation',
        txtDifference: 'Difference from',
        txtPercent: '% of',
        txtPercentDiff: '% difference from',
        txtRunTotal: 'Running total in',
        txtPercentOfRunTotal: '% running total in',
        txtPercentOfCol: '% of column total',
        txtPercentOfTotal: '% of row total',
        txtPercentOfGrand: '% of grand total',
        txtIndex: 'Index',
        txtByField: '%1 of %2',
        txtPercentOfParentRow: '% of parent row total',
        txtPercentOfParentCol: '% of parent column total',
        txtPercentOfParent: '% of parent total',
        txtRankAscending: 'Rank smallest to largest',
        txtRankDescending: 'Rank largest to smallest',
        textPrev: '(previous)',
        textNext: '(next)',
        textNumFormat: 'Number format'

    }, SSE.Views.ValueFieldSettingsDialog || {}))
});