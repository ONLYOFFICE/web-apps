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
 *  SlicerSettingsAdvanced.js
 *
 *  Created on 14.04.2020
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/SlicerSettingsAdvanced.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) {
    'use strict';

    SSE.Views.SlicerSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 330,
            contentHeight: 350,
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
                    {panelId: 'id-adv-slicer-references',   panelCaption: this.strReferences},
                    {panelId: 'id-adv-slicer-snap',         panelCaption: this.textSnap},
                    {panelId: 'id-adv-slicer-alttext',      panelCaption: this.textAlt}
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);

            this.options.handler = function(result, value) {
                if ( result != 'ok' || this.isNameValid() ) {
                    if (options.handler)
                        options.handler.call(this, result, value);
                    return;
                }
                return true;
            };

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this._changedProps = null;
            this._noApply = true;
            this.spinners = [];
            this._nRatio = 1;

            this._originalProps = this.options.imageProps;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;

            // Style & Size
            this.inputHeader = new Common.UI.InputField({
                el          : $('#sliceradv-text-header'),
                allowBlank  : true,
                style       : 'width: 178px;'
            }).on('changed:after', function() {
                me.isCaptionChanged = true;
            });

            this.chHeader = new Common.UI.CheckBox({
                el: $('#sliceradv-checkbox-header'),
                labelText: this.strShowHeader
            });
            this.chHeader.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.asc_setShowCaption(field.getValue()=='checked');
                }
            }, this));

            this.btnSlicerStyle = new Common.UI.Button({
                parentEl: $('#sliceradv-btn-style'),
                cls         : 'btn-large-dataview sheet-template-slicer',
                iconCls     : 'icon-template-slicer',
                scaling     : false,
                menu        : new Common.UI.Menu({
                    style: 'width: 333px;',
                    additionalAlign: this.menuAddAlign,
                    items: [
                        { template: _.template('<div id="sliceradv-menu-style" class="menu-slicer-template"  style="margin: 5px 5px 5px 10px;"></div>') }
                    ]
                }),
                takeFocusOnClose: true
            });
            this.mnuSlicerPicker = new Common.UI.DataView({
                el: $('#sliceradv-menu-style'),
                parentMenu: this.btnSlicerStyle.menu,
                restoreHeight: 325,
                groups: new Common.UI.DataViewGroupStore(),
                store: new Common.UI.DataViewStore(),
                itemTemplate: _.template('<div id="<%= id %>" class="item"><img src="<%= imageUrl %>" height="49" width="36"></div>'),
                style: 'max-height: 325px;'
            });
            this.mnuSlicerPicker.on('item:click', _.bind(this.onSelectSlicerStyle, this, this.btnSlicerStyle));

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
                if (this.btnRatio.pressed) {
                    var w = field.getNumberValue();
                    var h = w/this._nRatio;
                    if (h>this.numHeight.options.maxValue) {
                        h = this.numHeight.options.maxValue;
                        w = h * this._nRatio;
                        this.numWidth.setValue(w, true);
                    }
                    this.numHeight.setValue(h, true);
                }
                if (this._originalProps) {
                    this._originalProps.put_Width(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this._originalProps.put_Height(Common.Utils.Metric.fnRecalcToMM(this.numHeight.getNumberValue()));
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
                var h = field.getNumberValue(), w = null;
                if (this.btnRatio.pressed) {
                    w = h * this._nRatio;
                    if (w>this.numWidth.options.maxValue) {
                        w = this.numWidth.options.maxValue;
                        h = w/this._nRatio;
                        this.numHeight.setValue(h, true);
                    }
                    this.numWidth.setValue(w, true);
                }
                if (this._originalProps) {
                    this._originalProps.put_Width(Common.Utils.Metric.fnRecalcToMM(this.numWidth.getNumberValue()));
                    this._originalProps.put_Height(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.numHeight);

            this.btnRatio = new Common.UI.Button({
                parentEl: $('#sliceradv-button-ratio'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-advanced-ratio',
                style: 'margin-bottom: 1px;',
                enableToggle: true,
                hint: this.textKeepRatio
            });
            this.btnRatio.on('click', _.bind(function(btn, e) {
                if (btn.pressed && this.numHeight.getNumberValue()>0) {
                    this._nRatio = this.numWidth.getNumberValue()/this.numHeight.getNumberValue();
                }
                if (this._originalProps) {
                    this._originalProps.asc_putLockAspect(btn.pressed);
                }
            }, this));

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
                    this._changedProps.asc_setRowHeight(Common.Utils.Metric.fnRecalcToMM(numval)*36000);
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
                minValue: 1
            });
            this.numCols.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var numval = field.getNumberValue();
                if (this._changedProps) {
                    this._changedProps.asc_setColumnCount(numval);
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
                    if (this._changedProps) {
                        this._changedProps.asc_setSortOrder(Asc.ST_tabularSlicerCacheSortOrder.Ascending);
                    }
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
                    if (this._changedProps) {
                        this._changedProps.asc_setSortOrder(Asc.ST_tabularSlicerCacheSortOrder.Descending);
                    }
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
                    this._changedProps.asc_setHideItemsWithNoData(checked);
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
                    this._changedProps.asc_setIndicateItemsWithNoData(checked);
                }
            }, this));

            this.chShowNoData = new Common.UI.CheckBox({
                el: $('#sliceradv-check-show-nodata-last'),
                disabled: true,
                labelText: this.strShowNoData
            });
            this.chShowNoData.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.asc_setShowItemsWithNoDataLast(field.getValue()=='checked');
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
            }).on('changed:after', function() {
                me.isNameChanged = true;
            });

            this.lblSource = $('#sliceradv-lbl-source');
            this.lblFormula = $('#sliceradv-lbl-formula');

            // Snapping
            this.radioTwoCell = new Common.UI.RadioBox({
                el: $('#slicer-advanced-radio-twocell'),
                name: 'asc-radio-snap',
                labelText: this.textTwoCell,
                value: AscCommon.c_oAscCellAnchorType.cellanchorTwoCell
            });
            this.radioTwoCell.on('change', _.bind(this.onRadioSnapChange, this));

            this.radioOneCell = new Common.UI.RadioBox({
                el: $('#slicer-advanced-radio-onecell'),
                name: 'asc-radio-snap',
                labelText: this.textOneCell,
                value: AscCommon.c_oAscCellAnchorType.cellanchorOneCell
            });
            this.radioOneCell.on('change', _.bind(this.onRadioSnapChange, this));

            this.radioAbsolute = new Common.UI.RadioBox({
                el: $('#slicer-advanced-radio-absolute'),
                name: 'asc-radio-snap',
                labelText: this.textAbsolute,
                value: AscCommon.c_oAscCellAnchorType.cellanchorAbsolute
            });
            this.radioAbsolute.on('change', _.bind(this.onRadioSnapChange, this));

            // Alt Text

            this.inputAltTitle = new Common.UI.InputField({
                el          : $('#sliceradv-alt-title'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            }).on('changed:after', function() {
                me.isAltTitleChanged = true;
            });

            this.textareaAltDescription = this.$window.find('textarea');
            this.textareaAltDescription.keydown(function (event) {
                if (event.keyCode == Common.UI.Keys.RETURN) {
                    event.stopPropagation();
                }
                me.isAltDescChanged = true;
            });

            this.afterRender();
        },

        getFocusedComponents: function() {
            return this.btnsCategory.concat([
                this.inputHeader, this.chHeader, this.btnSlicerStyle, this.numWidth, this.btnRatio, this.numHeight, this.numCols, this.numColHeight, // 0 tab
                this.radioAsc, this.radioDesc, this.chHideNoData, this.chIndNoData, this.chShowNoData, // 1 tab
                this.inputName,  // 2 tab
                this.radioTwoCell, this.radioOneCell, this.radioAbsolute, // 3 tab
                this.inputAltTitle, this.textareaAltDescription  // 4 tab
            ]).concat(this.getFooterButtons());
        },

        onCategoryClick: function(btn, index) {
            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var me = this;
            setTimeout(function(){
                switch (index) {
                    case 0:
                        me.inputHeader.focus();
                        break;
                    case 1:
                        me.chHideNoData.focus();
                        break;
                    case 2:
                        me.inputName.focus();
                        break;
                    case 3:
                        me.radioTwoCell.focus();
                        break;
                    case 4:
                        me.inputAltTitle.focus();
                        break;
                }
            }, 10);
        },

        getSettings: function() {
            if (this.isCaptionChanged)
                this._changedProps.asc_setCaption(this.inputHeader.getValue());
            if (this.isNameChanged)
                this._changedProps.asc_setName(this.inputName.getValue());

            if (this.isAltTitleChanged)
                this._originalProps.asc_putTitle(this.inputAltTitle.getValue());

            if (this.isAltDescChanged)
                this._originalProps.asc_putDescription(this.textareaAltDescription.val());

            return {imageProps: this._originalProps};
        },

        _setDefaults: function(props) {
            if (props){
                var value = props.asc_getWidth();
                this.numWidth.setValue((value!==null) ? Common.Utils.Metric.fnRecalcFromMM(value).toFixed(2) : '', true);
                value = props.asc_getHeight();
                this.numHeight.setValue((value!==null) ? Common.Utils.Metric.fnRecalcFromMM(value).toFixed(2) : '', true);

                if (props.asc_getHeight()>0)
                    this._nRatio = props.asc_getWidth()/props.asc_getHeight();

                value = props.asc_getLockAspect();
                this.btnRatio.toggle(value);

                value = props.asc_getTitle();
                this.inputAltTitle.setValue(value ? value : '');

                value = props.asc_getDescription();
                this.textareaAltDescription.val(value ? value : '');

                value = props.asc_getAnchor();
                switch (value) {
                    case AscCommon.c_oAscCellAnchorType.cellanchorTwoCell:
                        this.radioTwoCell.setValue(true, true);
                        break;
                    case AscCommon.c_oAscCellAnchorType.cellanchorOneCell:
                        this.radioOneCell.setValue(true, true);
                        break;
                    case AscCommon.c_oAscCellAnchorType.cellanchorAbsolute:
                        this.radioAbsolute.setValue(true, true);
                        break;
                }

                var slicerprops = props.asc_getSlicerProperties();
                if (slicerprops) {
                    this._noApply = true;

                    this.numCols.setValue(slicerprops.asc_getColumnCount(), true);
                    this.numColHeight.setValue(Common.Utils.Metric.fnRecalcFromMM(slicerprops.asc_getRowHeight()/36000).toFixed(2), true);

                    this.inputHeader.setValue(slicerprops.asc_getCaption(), true);
                    var checked = slicerprops.asc_getShowCaption();
                    this.chHeader.setValue(checked !== null && checked !== undefined ? checked : 'indeterminate', true);

                    // depends of data type
                    this.radioAsc.setCaption(this.textAsc + ' (' + this.textAZ + ')' );
                    this.radioDesc.setCaption(this.textDesc + ' (' + this.textZA + ')' );
                    (slicerprops.asc_getSortOrder()==Asc.ST_tabularSlicerCacheSortOrder.Ascending) ? this.radioAsc.setValue(true, true) : this.radioDesc.setValue(true, true);

                    checked = slicerprops.asc_getIndicateItemsWithNoData();
                    this.chIndNoData.setValue(checked !== null && checked !== undefined ? checked : 'indeterminate', true);
                    checked = slicerprops.asc_getShowItemsWithNoDataLast();
                    this.chShowNoData.setValue(checked !== null && checked !== undefined ? checked : 'indeterminate', true);
                    checked = slicerprops.asc_getHideItemsWithNoData();
                    this.chHideNoData.setValue(checked !== null && checked !== undefined ? checked : 'indeterminate', true);

                    this.chIndNoData.setDisabled(checked);
                    this.chShowNoData.setDisabled(checked || (this.chIndNoData.getValue()!='checked'));
                    this.chShowDel.setDisabled(checked);

                    value = slicerprops.asc_getName();
                    this.inputName.setValue(value !== null && value !== undefined ? value : '');
                    this.inputName.setDisabled(value === null || value === undefined);
                    this.lblSource.text(slicerprops.asc_getSourceName());
                    this.lblFormula.text(slicerprops.asc_getNameInFormulas());

                    value = slicerprops.asc_getStyle();
                    var rec = this.mnuSlicerPicker.store.findWhere({type: value});
                    if (!rec && this.mnuSlicerPicker.store.length>0) {
                        rec = this.mnuSlicerPicker.store.at(0);
                    }
                    if (rec) {
                        this.btnSlicerStyle.suspendEvents();
                        this.mnuSlicerPicker.selectRecord(rec, true);
                        this.btnSlicerStyle.resumeEvents();
                        this.$window.find('.icon-template-slicer').css({'background-image': 'url(' + rec.get("imageUrl") + ')', 'height': '49px', 'width': '36px', 'background-position': 'center', 'background-size': 'cover'});
                    } else
                        this.$window.find('.icon-template-slicer').css({'height': '49px', 'width': '36px', 'background-position': 'center', 'background-size': 'cover'});

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
            this.onInitStyles(this.options.styles);
            this._setDefaults(this._originalProps);
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
            }
        },

        onInitStyles: function(Templates){
            var arr = [];
            Templates && _.each(Templates, function(template){
                arr.push({
                    id          : Common.UI.getId(),
                    type        : template.asc_getName(),
                    imageUrl    : template.asc_getImage(),
                    allowSelected : true,
                    selected    : false
                });
            });
            this.mnuSlicerPicker.store.reset(arr);
            this.btnSlicerStyle.setDisabled(this.mnuSlicerPicker.store.length<1);
        },

        onSelectSlicerStyle: function(btn, picker, itemView, record) {
            if (this._noApply) return;

            if (this._changedProps) {
                this._changedProps.asc_setStyle(record.get('type'));
            }
            this.$window.find('.icon-template-slicer').css({'background-image': 'url(' + record.get("imageUrl") + ')', 'height': '49px', 'width': '36px', 'background-position': 'center', 'background-size': 'cover'});
        },

        onRadioSnapChange: function(field, newValue, eOpts) {
            if (newValue && this._originalProps) {
                this._originalProps.asc_putAnchor(field.options.value);
            }
        },

        isNameValid: function() {
            if (this.isNameChanged && _.isEmpty(this.inputName.getValue())) {
                this.setActiveCategory(2);
                this.inputName.cmpEl.find('input').focus();
                return false;
            }
            return true;
        },

        textTitle: 'Slicer - Advanced Settings',
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
        strShowDel: 'Show items deleted from the data source',
        textAlt: 'Alternative Text',
        textAltTitle: 'Title',
        textAltDescription: 'Description',
        textAltTip: 'The alternative text-based representation of the visual object information, which will be read to the people with vision or cognitive impairments to help them better understand what information there is in the image, autoshape, chart or table.',
        textSnap: 'Cell Snapping',
        textAbsolute: 'Don\'t move or size with cells',
        textOneCell: 'Move but don\'t size with cells',
        textTwoCell: 'Move and size with cells',
        textKeepRatio: 'Constant Proportions'

    }, SSE.Views.SlicerSettingsAdvanced || {}));
});
