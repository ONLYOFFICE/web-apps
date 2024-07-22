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
 *  FieldSettingsDialog.js
 *
 *  Created on 17.07.2017
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/FieldSettingsDialog.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) { 'use strict';

    SSE.Views.FieldSettingsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 284,
            contentHeight: 365,
            toggleGroup: 'pivot-field-settings-group',
            storageName: 'sse-pivot-field-settings-category'
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-pivot-field-settings-layout',     panelCaption: this.strLayout},
                    {panelId: 'id-pivot-field-settings-subtotals',  panelCaption: this.strSubtotals}
                ],
                contentTemplate:  _.template(contentTemplate)({
                    scope: this
                })
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;
            this.fieldIndex = options.fieldIndex || 0;
            this.type       = options.type || 0; // 0 - columns, 1 - rows, 3 - filters
            this.format = {formatStr: "General"};
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.inputCustomName = new Common.UI.InputField({
                el          : $('#field-settings-custom'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            });

            this.lblSourceName = this.$window.find('#field-settings-source');

            this.radioTabular = new Common.UI.RadioBox({
                el: $('#field-settings-radio-tab'),
                labelText: this.txtTabular,
                name: 'asc-radio-report-form'
            });

            this.radioOutline = new Common.UI.RadioBox({
                el: $('#field-settings-radio-outline'),
                labelText: this.txtOutline,
                name: 'asc-radio-report-form',
                checked: true
            });

            this.chCompact = new Common.UI.CheckBox({
                el: $('#field-settings-chk-compact'),
                labelText: this.txtCompact
            });

            this.chRepeat = new Common.UI.CheckBox({
                el: $('#field-settings-chk-repeat'),
                labelText: this.txtRepeat
            });

            this.chBlank = new Common.UI.CheckBox({
                el: $('#field-settings-chk-blank'),
                labelText: this.txtBlank
            });

            this.chSubtotals = new Common.UI.CheckBox({
                el: $('#field-settings-chk-subtotals'),
                labelText: this.txtShowSubtotals
            });

            this.radioTop = new Common.UI.RadioBox({
                el: $('#field-settings-radio-top'),
                labelText: this.txtTop,
                name: 'asc-radio-show-subtotals'
            });

            this.radioBottom = new Common.UI.RadioBox({
                el: $('#field-settings-radio-bottom'),
                labelText: this.txtBottom,
                name: 'asc-radio-show-subtotals',
                checked: true
            });

            this.chEmpty = new Common.UI.CheckBox({
                el: $('#field-settings-chk-empty'),
                labelText: this.txtEmpty
            });

            this.chSum = new Common.UI.CheckBox({
                el: $('#field-settings-chk-sum'),
                labelText: this.txtSum
            });
            // this.chSum.on('change', _.bind(this.onFunctionChange, this, Asc.c_oAscDataConsolidateFunction.Sum));

            this.chCount = new Common.UI.CheckBox({
                el: $('#field-settings-chk-count'),
                labelText: this.txtCount
            });
            // this.chCount.on('change', _.bind(this.onFunctionChange, this, Asc.c_oAscDataConsolidateFunction.Count));

            this.chAve = new Common.UI.CheckBox({
                el: $('#field-settings-chk-ave'),
                labelText: this.txtAverage
            });
            // this.chAve.on('change', _.bind(this.onFunctionChange, this, Asc.c_oAscDataConsolidateFunction.Average));

            this.chMax = new Common.UI.CheckBox({
                el: $('#field-settings-chk-max'),
                labelText: this.txtMax
            });
            // this.chMax.on('change', _.bind(this.onFunctionChange, this, Asc.c_oAscDataConsolidateFunction.Max));

            this.chMin = new Common.UI.CheckBox({
                el: $('#field-settings-chk-min'),
                labelText: this.txtMin
            });
            // this.chMin.on('change', _.bind(this.onFunctionChange, this, Asc.c_oAscDataConsolidateFunction.Min));

            this.chProduct = new Common.UI.CheckBox({
                el: $('#field-settings-chk-product'),
                labelText: this.txtProduct
            });
            // this.chProduct.on('change', _.bind(this.onFunctionChange, this, Asc.c_oAscDataConsolidateFunction.Product));

            this.chNum = new Common.UI.CheckBox({
                el: $('#field-settings-chk-num'),
                labelText: this.txtCountNums
            });
            // this.chNum.on('change', _.bind(this.onFunctionChange, this, Asc.c_oAscDataConsolidateFunction.CountNums));

            this.chDev = new Common.UI.CheckBox({
                el: $('#field-settings-chk-dev'),
                labelText: this.txtStdDev
            });
            // this.chDev.on('change', _.bind(this.onFunctionChange, this, Asc.c_oAscDataConsolidateFunction.StdDev));

            this.chDevp = new Common.UI.CheckBox({
                el: $('#field-settings-chk-devp'),
                labelText: this.txtStdDevp
            });
            // this.chDevp.on('change', _.bind(this.onFunctionChange, this, Asc.c_oAscDataConsolidateFunction.StdDevp));

            this.chVar = new Common.UI.CheckBox({
                el: $('#field-settings-chk-var'),
                labelText: this.txtVar
            });
            // this.chVar.on('change', _.bind(this.onFunctionChange, this, Asc.c_oAscDataConsolidateFunction.Var));

            this.chVarp = new Common.UI.CheckBox({
                el: $('#field-settings-chk-varp'),
                labelText: this.txtVarp
            });
            // this.chVarp.on('change', _.bind(this.onFunctionChange, this, Asc.c_oAscDataConsolidateFunction.Varp));

            this.btnFormat = new Common.UI.Button({
                parentEl: $('#field-settings-numformat'),
                cls: 'btn-text-default',
                style: 'width: 128px;',
                caption: this.textNumFormat
            });
            this.btnFormat.on('click', _.bind(this.openFormat, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return this.btnsCategory.concat([
                this.inputCustomName, this.radioTabular, this.radioOutline, this.chCompact, this.btnFormat, this.chRepeat, this.chBlank, this.chSubtotals, this.radioTop, this.radioBottom, this.chEmpty, // 0 tab
                this.chSum, this.chCount, this.chAve, this.chMax, this.chMin, this.chProduct, this.chNum, this.chDev, this.chDevp, this.chVar, this.chVarp  // 1 tab
            ]).concat(this.getFooterButtons());
        },

        onCategoryClick: function(btn, index) {
            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var me = this;
            setTimeout(function(){
                switch (index) {
                    case 0:
                        me.inputCustomName.focus();
                        break;
                    case 1:
                        me.chSum.focus();
                        break;
                }
            }, 10);
        },

        afterRender: function() {
            this._setDefaults(this.props);
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
            }
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        _setDefaults: function (props) {
            if (props) {
                var me = this,
                    field = props.asc_getPivotFields()[this.fieldIndex];

                this.format.formatStr = field.asc_getNumFormat();
                this.format.formatInfo = field.asc_getNumFormatInfo();
                this.lblSourceName.html(Common.Utils.String.htmlEncode(props.getCacheFieldName(this.fieldIndex)));
                this.inputCustomName.setValue(props.getPivotFieldName(this.fieldIndex));

                (field.asc_getOutline()) ? this.radioOutline.setValue(true) : this.radioTabular.setValue(true);
                this.chCompact.setValue(field.asc_getOutline() && field.asc_getCompact());

                this.chRepeat.setValue(field.asc_getFillDownLabelsDefault());
                this.chBlank.setValue(field.asc_getInsertBlankRow());

                this.chSubtotals.setValue(field.asc_getDefaultSubtotal());
                (field.asc_getSubtotalTop()) ? this.radioTop.setValue(true) : this.radioBottom.setValue(true);

                this.chEmpty.setValue(field.asc_getShowAll());
                if (field.asc_getDefaultSubtotal()) {
                    var arr = field.asc_getSubtotals();
                    if (arr) {
                        _.each(arr, function(item) {
                            switch(item) {
                                case Asc.c_oAscItemType.Sum:
                                    me.chSum.setValue(true);
                                    break;
                                case Asc.c_oAscItemType.Count:
                                    me.chNum.setValue(true);
                                    break;
                                case Asc.c_oAscItemType.Avg:
                                    me.chAve.setValue(true);
                                    break;
                                case Asc.c_oAscItemType.Max:
                                    me.chMax.setValue(true);
                                    break;
                                case Asc.c_oAscItemType.Min:
                                    me.chMin.setValue(true);
                                    break;
                                case Asc.c_oAscItemType.Product:
                                    me.chProduct.setValue(true);
                                    break;
                                case Asc.c_oAscItemType.CountA:
                                    me.chCount.setValue(true);
                                    break;
                                case Asc.c_oAscItemType.StdDev:
                                    me.chDev.setValue(true);
                                    break;
                                case Asc.c_oAscItemType.StdDevP:
                                    me.chDevp.setValue(true);
                                    break;
                                case Asc.c_oAscItemType.Var:
                                    me.chVar.setValue(true);
                                    break;
                                case Asc.c_oAscItemType.VarP:
                                    me.chVarp.setValue(true);
                                    break;
                            }
                        });
                    }
                }

                this.btnFormat.setVisible(props.asc_getFieldGroupType(this.fieldIndex) !== Asc.c_oAscGroupType.Text);
            }
        },

        getSettings: function () {
            var field = new Asc.CT_PivotField();
            field.asc_setName(this.inputCustomName.getValue());

            field.asc_setOutline(this.radioOutline.getValue());
            field.asc_setCompact(this.radioOutline.getValue() && this.chCompact.getValue() == 'checked');

            field.asc_setFillDownLabelsDefault(this.chRepeat.getValue() == 'checked');
            field.asc_setInsertBlankRow(this.chBlank.getValue() == 'checked');

            field.asc_setDefaultSubtotal(this.chSubtotals.getValue() == 'checked');
            field.asc_setSubtotalTop(this.radioTop.getValue());

            field.asc_setShowAll(this.chEmpty.getValue() == 'checked');
            if (field.asc_getDefaultSubtotal()) {
                var arr = [];
                if (this.chSum.getValue() == 'checked') {
                    arr.push(Asc.c_oAscItemType.Sum);
                }
                if (this.chNum.getValue() == 'checked') {
                    arr.push(Asc.c_oAscItemType.Count);
                }
                if (this.chAve.getValue() == 'checked') {
                    arr.push(Asc.c_oAscItemType.Avg);
                }
                if (this.chMax.getValue() == 'checked') {
                    arr.push(Asc.c_oAscItemType.Max);
                }
                if (this.chMin.getValue() == 'checked') {
                    arr.push(Asc.c_oAscItemType.Min);
                }
                if (this.chProduct.getValue() == 'checked') {
                    arr.push(Asc.c_oAscItemType.Product);
                }
                if (this.chCount.getValue() == 'checked') {
                    arr.push(Asc.c_oAscItemType.CountA);
                }
                if (this.chDev.getValue() == 'checked') {
                    arr.push(Asc.c_oAscItemType.StdDev);
                }
                if (this.chDevp.getValue() == 'checked') {
                    arr.push(Asc.c_oAscItemType.StdDevP);
                }
                if (this.chVar.getValue() == 'checked') {
                    arr.push(Asc.c_oAscItemType.Var);
                }
                if (this.chVarp.getValue() == 'checked') {
                    arr.push(Asc.c_oAscItemType.VarP);
                }
                field.asc_setSubtotals(arr);
            }

            this.format.isChanged && field.asc_setNumFormat(this.format.formatStr);

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
                    }
                },
                props   : {format: this.format.formatStr, formatInfo: this.format.formatInfo, langId: value}
            })).on('close', function() {
                me.btnFormat.cmpEl.focus();
            });
            win.show();
        },

        textTitle: 'Field Settings',
        strSubtotals: 'Subtotals',
        strLayout: 'Layout',
        txtSourceName: 'Source name:',
        txtCustomName: 'Custom name',
        textReport: 'Report Form',
        txtTabular: 'Tabular',
        txtOutline: 'Outline',
        txtCompact: 'Compact',
        txtRepeat: 'Repeat items labels at each row',
        txtBlank: 'Insert blank rows after each item',
        txtShowSubtotals: 'Show subtotals',
        txtTop: 'Show at top of group',
        txtBottom: 'Show at bottom of group',
        txtEmpty: 'Show items with no data',
        txtSummarize: 'Functions for Subtotals',
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
        textNumFormat: 'Number format'

    }, SSE.Views.FieldSettingsDialog || {}))
});