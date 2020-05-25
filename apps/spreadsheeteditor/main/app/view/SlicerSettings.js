/*
 *
 * (c) Copyright Ascensio System SIA 2010-2020
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
 *  SlicerSettings.js
 *
 *  Created by Julia Radzhabova on 14.04.2020
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([    'text!spreadsheeteditor/main/app/template/SlicerSettings.template',
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/RadioBox',
    'common/main/lib/component/ComboDataView'
], function (contentTemplate) {
    'use strict';

    SSE.Views.SlicerSettings = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 330,
            height: 435,
            toggleGroup: 'slicer-adv-settings-group',
            storageName: 'sse-slicer-settings-adv-category'
        },

        initialize : function(options) {
            var me = this;
            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-slicer-style',        panelCaption: this.strStyleSize},
                    {panelId: 'id-adv-slicer-sorting',      panelCaption: this.strSorting},
                    {panelId: 'id-adv-slicer-references',   panelCaption: this.strReferences}
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this._changedProps = null;
            this._noApply = true;
            this.spinners = [];

            this._originalProps = this.options.props;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;

            // Style & Size
            this.inputHeader = new Common.UI.InputField({
                el          : $('#sliceradv-text-header'),
                allowBlank  : false,
                blankError  : me.txtEmpty,
                style       : 'width: 178px;'
            });

            this.chHeader = new Common.UI.CheckBox({
                el: $('#sliceradv-checkbox-header'),
                labelText: this.strShowHeader
            });
            this.chHeader.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    // this._changedProps.asc_putStrikeout(field.getValue()=='checked');
                }
            }, this));

            this.cmbSlicerStyle = new Common.UI.ComboDataView({
                itemWidth: 50,
                itemHeight: 50,
                menuMaxHeight: 272,
                enableKeyEvents: true,
                cls: 'combo-spark-style',
                minWidth: 190
            });
            this.cmbSlicerStyle.render($('#sliceradv-combo-style'));
            this.cmbSlicerStyle.openButton.menu.cmpEl.css({
                'min-width': 178,
                'max-width': 178
            });
            this.cmbSlicerStyle.on('click', _.bind(this.onSelectSlicerStyle, this));
            this.cmbSlicerStyle.openButton.menu.on('show:after', function () {
                me.cmbSlicerStyle.menuPicker.scroller.update({alwaysVisibleY: true});
            });

            this.numWidth = new Common.UI.MetricSpinner({
                el: $('#sliceradv-spin-width'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 5963.9,
                minValue: 0
            });
            this.numWidth.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var numval = field.getNumberValue();
                if (this._changedProps) {
                }
            }, this));
            this.spinners.push(this.numWidth);

            this.numHeight = new Common.UI.MetricSpinner({
                el: $('#sliceradv-spin-height'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 5963.9,
                minValue: 0
            });
            this.numHeight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var numval = field.getNumberValue();
                if (this._changedProps) {
                }
            }, this));
            this.spinners.push(this.numHeight);

            this.numColWidth = new Common.UI.MetricSpinner({
                el: $('#sliceradv-spin-col-width'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 5963.9,
                minValue: 0
            });
            this.numColWidth.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var numval = field.getNumberValue();
                if (this._changedProps) {
                }
            }, this));
            this.spinners.push(this.numColWidth);

            this.numColHeight = new Common.UI.MetricSpinner({
                el: $('#sliceradv-spin-col-height'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 5963.9,
                minValue: 0
            });
            this.numColHeight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var numval = field.getNumberValue();
                if (this._changedProps) {
                }
            }, this));
            this.spinners.push(this.numColHeight);

            this.numCols = new Common.UI.MetricSpinner({
                el: $('#sliceradv-spin-columns'),
                step: 1,
                width: 85,
                defaultUnit : "",
                defaultValue : 1,
                value: '1',
                allowDecimal: false,
                maxValue: 20000,
                minValue: 0
            });
            this.numCols.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var numval = field.getNumberValue();
                if (this._changedProps) {
                }
            }, this));

            // Sorting & Filtering

            this.radioAsc = new Common.UI.RadioBox({
                el: $('#sliceradv-radio-asc'),
                name: 'asc-radio-sliceradv-sort',
                labelText: this.textAsc,
                checked: true
            });
            this.radioAsc.on('change', _.bind(function(field, newValue, eOpts) {
                if (newValue) {
                }
            }, this));

            this.radioDesc = new Common.UI.RadioBox({
                el: $('#sliceradv-radio-desc'),
                name: 'asc-radio-sliceradv-sort',
                labelText: this.textDesc,
                checked: false
            });
            this.radioDesc.on('change', _.bind(function(field, newValue, eOpts) {
                if (newValue) {
                }
            }, this));

            this.chHideNoData = new Common.UI.CheckBox({
                el: $('#sliceradv-check-hide-nodata'),
                labelText: this.strHideNoData
            });
            this.chHideNoData.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = (field.getValue()=='checked');
                this.chIndNoData.setDisabled(checked);
                this.chShowNoData.setDisabled(checked || (this.chIndNoData.getValue()!='checked'));
                this.chShowDel.setDisabled(checked);
                if (this._changedProps) {
                }
            }, this));

            this.chIndNoData = new Common.UI.CheckBox({
                el: $('#sliceradv-check-indicate-nodata'),
                labelText: this.strIndNoData
            });
            this.chIndNoData.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = (field.getValue()=='checked');
                this.chShowNoData.setDisabled(!checked);
                if (this._changedProps) {
                }
            }, this));

            this.chShowNoData = new Common.UI.CheckBox({
                el: $('#sliceradv-check-show-nodata-last'),
                disabled: true,
                labelText: this.strShowNoData
            });
            this.chShowNoData.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    // this._changedProps.asc_putStrikeout(field.getValue()=='checked');
                }
            }, this));

            this.chShowDel = new Common.UI.CheckBox({
                el: $('#sliceradv-check-show-deleted'),
                labelText: this.strShowDel
            });
            this.chShowDel.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    // this._changedProps.asc_putStrikeout(field.getValue()=='checked');
                }
            }, this));

            // References

            this.inputName = new Common.UI.InputField({
                el          : $('#sliceradv-text-name'),
                allowBlank  : false,
                blankError  : me.txtEmpty,
                style       : 'width: 178px;'
            });

            this.lblSource = $('#sliceradv-lbl-source');
            this.lblFormula = $('#sliceradv-lbl-formula');

            this.on('show', function(obj) {
                obj.getChild('.footer .primary').focus();
            });

            this.afterRender();
        },

        getSettings: function() {
            return this._changedProps;
        },

        _setDefaults: function(props) {
            if (props){
                var value = props.asc_getWidth();
                this.numWidth.setValue((value!==null) ? Common.Utils.Metric.fnRecalcFromMM(value).toFixed(2) : '', true);
                value = props.asc_getHeight();
                this.numHeight.setValue((value!==null) ? Common.Utils.Metric.fnRecalcFromMM(value).toFixed(2) : '', true);

                var slicerprops = props.asc_getSlicerProperties();
                if (slicerprops) {
                    this._noApply = true;

                    this.numCols.setValue(slicerprops.asc_getColumnCount(), true);
                    // this.numColWidth.setValue(Common.Utils.Metric.fnRecalcFromMM(slicerprops.asc_getColWidth()).toFixed(2), true);
                    this.numColHeight.setValue(Common.Utils.Metric.fnRecalcFromMM(slicerprops.asc_getRowHeight()).toFixed(2), true);

                    this.inputHeader.setValue(slicerprops.asc_getCaption());
                    this.chHeader.setValue(!!slicerprops.asc_getShowCaption());

                    // depends of data type
                    this.radioAsc.setCaption(this.textAsc + ' (' + this.textSmallLarge + ')' );
                    this.radioDesc.setCaption(this.textDesc + ' (' + this.textLargeSmall + ')' );

                    this.inputName.setValue(slicerprops.asc_getName());
                    this.lblSource.text('Source name');
                    this.lblFormula.text('Name in formulas');

                    this._noApply = false;

                    this._changedProps = slicerprops;
                }
            }
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                }
            }
        },

        afterRender: function() {
            this.updateMetricUnit();
            this._setDefaults(this._originalProps);
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
            }
        },

        onSelectSlicerStyle: function(combo, record) {
            if (this._noApply) return;

            if (this._changedProps) {
                // this._changedProps.asc_setStyle(record.get('data'));
            }
        },

        textTitle: 'Slicer Settings',
        textHeader: 'Header',
        strStyle: 'Style',
        strSize: 'Size',
        strWidth: 'Width',
        strHeight: 'Height',
        strButtons: 'Buttons',
        strColumns: 'Columns',
        textSort: 'Sort',
        textSourceName: 'Source name',
        textFormulaName: 'Name to use in formulas',
        textName: 'Name',
        strStyleSize: 'Style & Size',
        strSorting: 'Sorting & Filtering',
        strReferences: 'References',
        txtEmpty: 'This field is required',
        strShowHeader: 'Display header',
        textAsc: 'Ascending',
        textDesc: 'Descending',
        textAZ: 'A to Z',
        textZA: 'Z to A',
        textOldNew: 'oldest to newest',
        textNewOld: 'newest to oldest',
        textSmallLarge: 'smallest to largest',
        textLargeSmall: 'largest to smallest',
        strHideNoData: 'Hide items with no data',
        strIndNoData: 'Visually indicate items with no data',
        strShowNoData: 'Show items with no data last',
        strShowDel: 'Show items deleted from the data source'

    }, SSE.Views.SlicerSettings || {}));
});
