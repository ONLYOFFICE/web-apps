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
 *  FieldSettingsDialog.js
 *
 *  Created by Julia Radzhabova on 17.07.2017
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([    'text!spreadsheeteditor/main/app/template/FieldSettingsDialog.template',
    'common/main/lib/util/utils',
    'common/main/lib/component/InputField',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/CheckBox',
    'common/main/lib/view/AdvancedSettingsWindow'
], function (contentTemplate) { 'use strict';

    SSE.Views.FieldSettingsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 284,
            height: 440,
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
            this.names      = options.names || [];
            this.type       = options.type || 0; // 0 - columns, 1 - rows, 3 - filters

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

            this.afterRender();
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
                    cache_names = props.asc_getCacheFields(),
                    field = props.asc_getPivotFields()[this.fieldIndex];

                this.lblSourceName.html(Common.Utils.String.htmlEncode(cache_names[this.fieldIndex].asc_getName()));
                this.inputCustomName.setValue(Common.Utils.String.htmlEncode((field || cache_names[this.fieldIndex]).asc_getName()));

                (field.asc_getSubtotalTop()) ? this.radioTop.setValue(true) : this.radioBottom.setValue(true);

                var arr = field.asc_getSubtotals();
                if (arr) {
                    _.each(arr, function(item) {
                        switch(item) {
                            case Asc.c_oAscItemType.Sum:
                                me.chSum.setValue(true);
                            break;
                            case Asc.c_oAscItemType.Count:
                                me.chCount.setValue(true);
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
                                me.chNum.setValue(true);
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
        },

        getSettings: function () {
            return {};
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

        textTitle: 'Field Settings',
        textCancel: 'Cancel',
        textOk: 'OK',
        strSubtotals: 'Subtotals',
        strLayout: 'Layout',
        txtSourceName: 'Source name: ',
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
        txtVarp: 'Varp'

    }, SSE.Views.FieldSettingsDialog || {}))
});