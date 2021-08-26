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
 *  AutoFilterDialog.js
 *
 *  Create filter for cell dialog.
 *
 *  Created by Alexey.Musinov on 22/04/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/ColorPaletteExt'
], function () {
    'use strict';

    SSE.Views = SSE.Views || {};

    SSE.Views.DigitalFilterDialog = Common.UI.Window.extend(_.extend({

        initialize: function (options) {
            var t = this, _options = {};

            _.extend(_options,  {
                width           : 501,
                height          : 230,
                contentWidth    : 180,
                header          : true,
                cls             : 'filter-dlg',
                contentTemplate : '',
                title           : t.txtTitle,
                items           : []
            }, options);

            this.template   =   options.template || [
                '<div class="box" style="height:' + (_options.height - 85) + 'px;">',
                    '<div class="content-panel" >',
                        '<label class="header">', t.textShowRows, '</label>',
                        '<div style="margin-top:15px;">',
                            '<div id="id-search-begin-digital-combo" class="input-group-nr" style="vertical-align:top;width:225px;display:inline-block;"></div>',
                            '<div id="id-sd-cell-search-begin" class="" style="width:225px;display:inline-block;margin-left:18px;"></div>',
                        '</div>',
                        '<div>',
                            '<div id="id-and-radio" class="padding-small" style="display: inline-block; margin-top:10px;"></div>',
                            '<div id="id-or-radio" class="padding-small" style="display: inline-block; margin-left:25px;"></div>',
                        '</div>',
                        '<div style="margin-top:10px;">',
                            '<div id="id-search-end-digital-combo" class="input-group-nr" style="vertical-align:top;width:225px;display:inline-block;"></div>',
                            '<div id="id-sd-cell-search-end" class="" style="width:225px;display:inline-block;margin-left:18px;"></div>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="separator horizontal" style="width:100%"></div>',
                '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok">', t.okButtonText, '</button>',
                    '<button class="btn normal dlg-btn" result="cancel">', t.cancelButtonText, '</button>',
                '</div>'
            ].join('');

            this.api        =   options.api;
            this.handler    =   options.handler;
            this.type       =   options.type || 'number';

            _options.tpl    =   _.template(this.template)(_options);

            Common.UI.Window.prototype.initialize.call(this, _options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);
            
            this.conditions = [
                {value: Asc.c_oAscCustomAutoFilter.equals,                   displayValue: this.capCondition1},
                {value: Asc.c_oAscCustomAutoFilter.doesNotEqual,             displayValue: this.capCondition2},
                {value: Asc.c_oAscCustomAutoFilter.isGreaterThan,            displayValue: this.capCondition3},
                {value: Asc.c_oAscCustomAutoFilter.isGreaterThanOrEqualTo,   displayValue: this.capCondition4},
                {value: Asc.c_oAscCustomAutoFilter.isLessThan,               displayValue: this.capCondition5},
                {value: Asc.c_oAscCustomAutoFilter.isLessThanOrEqualTo,      displayValue: this.capCondition6}
            ];
            if (this.type=='text') this.conditions = this.conditions.concat([
                {value: Asc.c_oAscCustomAutoFilter.beginsWith,               displayValue: this.capCondition7},
                {value: Asc.c_oAscCustomAutoFilter.doesNotBeginWith,         displayValue: this.capCondition8},
                {value: Asc.c_oAscCustomAutoFilter.endsWith,                 displayValue: this.capCondition9},
                {value: Asc.c_oAscCustomAutoFilter.doesNotEndWith,           displayValue: this.capCondition10},
                {value: Asc.c_oAscCustomAutoFilter.contains,                 displayValue: this.capCondition11},
                {value: Asc.c_oAscCustomAutoFilter.doesNotContain,           displayValue: this.capCondition12}
            ]);

            this.cmbCondition1 = new Common.UI.ComboBox({
                el          : $('#id-search-begin-digital-combo', this.$window),
                menuStyle   : 'min-width: 225px;max-height: 135px;',
                cls         : 'input-group-nr',
                data        : this.conditions,
                scrollAlwaysVisible: true,
                editable    : false,
                takeFocusOnClose: true
            });
            this.cmbCondition1.setValue(Asc.c_oAscCustomAutoFilter.equals);

            this.conditions.splice(0, 0,  {value: 0, displayValue: this.textNoFilter});

            this.cmbCondition2 = new Common.UI.ComboBox({
                el          : $('#id-search-end-digital-combo', this.$window),
                menuStyle   : 'min-width: 225px;max-height: 135px;',
                cls         : 'input-group-nr',
                data        : this.conditions,
                scrollAlwaysVisible: true,
                editable    : false,
                takeFocusOnClose: true
            });
            this.cmbCondition2.setValue(0);

            this.rbAnd = new Common.UI.RadioBox({
                el: $('#id-and-radio', this.$window),
                labelText: this.capAnd,
                name : 'asc-radio-filter-tab',
                checked: true
            });

            this.rbOr = new Common.UI.RadioBox({
                el: $('#id-or-radio', this.$window),
                labelText: this.capOr,
                name : 'asc-radio-filter-tab'
            });

            this.cmbValue1 = new Common.UI.ComboBox({
                el          : $('#id-sd-cell-search-begin', this.$window),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 225px;max-height: 135px;',
                scrollAlwaysVisible: true,
                data        : [],
                takeFocusOnClose: true
            });

            this.cmbValue2 = new Common.UI.ComboBox({
                el          : $('#id-sd-cell-search-end', this.$window),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 225px;max-height: 135px;',
                scrollAlwaysVisible: true,
                data        : [],
                takeFocusOnClose: true
            });

            var comparator = function(item1, item2) {
                var n1 = item1.get('intval'),
                    n2 = item2.get('intval'),
                    isN1 = n1!==undefined,
                    isN2 = n2!==undefined;
                if (isN1 !== isN2) return (isN1) ? -1 : 1;
                !isN1 && (n1 = item1.get('value').toLowerCase()) && (n2 = item2.get('value').toLowerCase());
                if (n1==n2) return 0;
                return (n2=='' || n1!=='' && n1<n2) ? -1 : 1;
            };
            this.cmbValue1.store.comparator = this.cmbValue2.store.comparator = comparator;

            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.loadDefaults();
        },

        getFocusedComponents: function() {
            return [this.cmbCondition1, this.cmbValue1, this.rbAnd, this.rbOr, this.cmbCondition2, this.cmbValue2];
        },

        getDefaultFocusableComponent: function () {
            return this.cmbValue1;
        },

        close: function () {
            if (this.api) {
                this.api.asc_enableKeyEvents(true);
            }
            Common.UI.Window.prototype.close.call(this);
        },

        onBtnClick: function (event) {
            if (event.currentTarget.attributes &&  event.currentTarget.attributes.result) {
                if ('ok' === event.currentTarget.attributes.result.value) {
                    this.save();
                }

                this.close();
            }
        },

        setSettings: function (properties) {
            this.properties = properties;
        },

        loadDefaults: function () {
            if (this.properties && this.rbOr && this.rbAnd &&
                this.cmbCondition1 && this.cmbCondition2 && this.cmbValue1 && this.cmbValue2) {

                var arr = [];
                this.properties.asc_getValues().forEach(function (item) {
                    var value    = item.asc_getText();
                    if (!_.isEmpty(value)) {
                        arr.push({value: value, displayValue: value,
                                  intval: (!isNaN(parseFloat(value)) && isFinite(value)) ? parseFloat(value) : undefined});
                    }
                });
                this.cmbValue1.setData(arr);
                this.cmbValue2.setData(arr);
                var filterObj = this.properties.asc_getFilterObj();
                if (filterObj.asc_getType() == Asc.c_oAscAutoFilterTypes.CustomFilters) {
                    var customFilter = filterObj.asc_getFilter(),
                        customFilters = customFilter.asc_getCustomFilters();
                    
                    (customFilter.asc_getAnd()) ? this.rbAnd.setValue(true) : this.rbOr.setValue(true);

                    this.cmbCondition1.setValue(customFilters[0].asc_getOperator() || Asc.c_oAscCustomAutoFilter.equals);
                    this.cmbCondition2.setValue((customFilters.length>1) ? (customFilters[1].asc_getOperator() || 0) : 0);

                    this.cmbValue1.setValue(null === customFilters[0].asc_getVal() ? '' : customFilters[0].asc_getVal());
                    this.cmbValue2.setValue((customFilters.length>1) ? (null === customFilters[1].asc_getVal() ? '' : customFilters[1].asc_getVal()) : '');
                }
            }
        },
        save: function () {
            if (this.api && this.properties && this.rbOr && this.rbAnd &&
                this.cmbCondition1 && this.cmbCondition2 && this.cmbValue1 && this.cmbValue2) {

                var filterObj = this.properties.asc_getFilterObj();
                filterObj.asc_setFilter(new Asc.CustomFilters());
                filterObj.asc_setType(Asc.c_oAscAutoFilterTypes.CustomFilters);

                var customFilter = filterObj.asc_getFilter();
                customFilter.asc_setCustomFilters((this.cmbCondition2.getValue() == 0) ? [new Asc.CustomFilter()] : [new Asc.CustomFilter(), new Asc.CustomFilter()]);

                var customFilters = customFilter.asc_getCustomFilters();

                customFilter.asc_setAnd(this.rbAnd.getValue());
                customFilters[0].asc_setOperator(this.cmbCondition1.getValue());
                customFilters[0].asc_setVal(this.cmbValue1.getValue());
                if (this.cmbCondition2.getValue() !== 0) {
                    customFilters[1].asc_setOperator(this.cmbCondition2.getValue() || undefined);
                    customFilters[1].asc_setVal(this.cmbValue2.getValue());
                }

                this.api.asc_applyAutoFilter(this.properties);
            }
        },

        onPrimary: function() {
            this.save();
            this.close();
            return false;
        },

        capAnd              : "And",
        capCondition1       : "equals",
        capCondition10      : "does not end with",
        capCondition11      : "contains",
        capCondition12      : "does not contain",
        capCondition2       : "does not equal",
        capCondition3       : "is greater than",
        capCondition4       : "is greater than or equal to",
        capCondition5       : "is less than",
        capCondition6       : "is less than or equal to",
        capCondition7       : "begins with",
        capCondition8       : "does not begin with",
        capCondition9       : "ends with",
        capOr               : "Or",
        textNoFilter        : "no filter",
        textShowRows        : "Show rows where",
        textUse1            : "Use ? to present any single character",
        textUse2            : "Use * to present any series of character",
        txtTitle            : "Custom Filter"

    }, SSE.Views.DigitalFilterDialog || {}));

    SSE.Views.Top10FilterDialog = Common.UI.Window.extend(_.extend({

        initialize: function (options) {
            var t = this, _options = {};

            this.type = options.type;

            _.extend(_options,  {
                width           : (this.type=='value') ? 450 : 318,
                height          : 160,
                contentWidth    : 180,
                header          : true,
                cls             : 'filter-dlg',
                contentTemplate : '',
                title           : t.txtTitle,
                items           : [],
                buttons: ['ok', 'cancel']
            }, options);

            this.template   =   options.template || [
                '<div class="box" style="height:' + (_options.height - 85) + 'px;">',
                    '<div class="content-panel" >',
                        '<label>', t.textType, '</label>',
                        '<div>',
                            '<div id="id-top10-type-combo" style="margin-right:10px; display: inline-block; vertical-align: middle;"></div>',
                            '<div id="id-top10-count-spin" class="input-group-nr" style="margin-right:10px; display: inline-block; vertical-align: middle;"></div>',
                            '<div id="id-top10-item-combo" class="input-group-nr" style="display: inline-block; vertical-align: middle;"></div>',
                            '<label id="id-top10-lblby" class="input-group-nr" style="min-width: 40px; text-align: center; display: inline-block; vertical-align: middle;">'+ t.txtBy +'</label>',
                            '<div id="id-top10-fields-combo" class="input-group-nr" style="width:100px;display: inline-block; vertical-align: middle;"></div>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="separator horizontal" style="width:100%"></div>'
            ].join('');

            this.api        =   options.api;
            this.handler    =   options.handler;

            _options.tpl    =   _.template(this.template)(_options);

            Common.UI.Window.prototype.initialize.call(this, _options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);

            this.cmbType = new Common.UI.ComboBox({
                el          : $('#id-top10-type-combo', this.$window),
                style       : 'width: 85px;',
                menuStyle   : 'min-width: 85px;',
                cls         : 'input-group-nr',
                data        : [
                    { value: true, displayValue: this.txtTop },
                    { value: false, displayValue: this.txtBottom }
                ],
                editable    : false,
                takeFocusOnClose: true
            });
            this.cmbType.setValue(true);

            var data = [
                { value: false, displayValue: this.txtItems },
                { value: true, displayValue: this.txtPercent }
            ];
            (this.type=='value') && data.push({ value: 0, displayValue: this.txtSum });

            this.cmbItem = new Common.UI.ComboBox({
                el          : $('#id-top10-item-combo', this.$window),
                style       : 'width: 85px;',
                menuStyle   : 'min-width: 85px;',
                cls         : 'input-group-nr',
                data        : data,
                editable    : false,
                takeFocusOnClose: true
            });
            this.cmbItem.setValue(false);
            this.cmbItem.on('selected', _.bind(function(combo, record) {
                this.spnCount.setDefaultUnit(record.value ? '%' : '');
            }, this));

            this.spnCount = new Common.UI.MetricSpinner({
                el: $('#id-top10-count-spin'),
                step: 1,
                width: 85,
                defaultUnit : "",
                value: '10',
                maxValue: 500,
                minValue: 1
            });

            this.cmbFields = new Common.UI.ComboBox({
                el          : $('#id-top10-fields-combo', this.$window),
                menuStyle   : 'min-width: 100%;max-height: 135px;',
                style       : 'width:100%;',
                cls         : 'input-group-nr',
                data        : [],
                scrollAlwaysVisible: true,
                editable    : false,
                takeFocusOnClose: true
            });
            this.cmbFields.setVisible(this.type=='value');
            (this.type!=='value') && this.$window.find('#id-top10-lblby').addClass('hidden');

            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.loadDefaults();
        },

        getFocusedComponents: function() {
            return [this.cmbType, this.spnCount, this.cmbItem, this.cmbFields];
        },

        getDefaultFocusableComponent: function () {
            return this.spnCount;
        },

        close: function () {
            if (this.api) {
                this.api.asc_enableKeyEvents(true);
            }
            Common.UI.Window.prototype.close.call(this);
        },

        onBtnClick: function (event) {
            if (event.currentTarget.attributes &&  event.currentTarget.attributes.result) {
                if ('ok' === event.currentTarget.attributes.result.value) {
                    this.save();
                }

                this.close();
            }
        },

        setSettings: function (properties) {
            this.properties = properties;
        },

        loadDefaults: function () {
            if (this.properties) {
                var isTop10Sum = false;
                if (this.type == 'value') {
                    var pivotObj = this.properties.asc_getPivotObj(),
                        idx = pivotObj.asc_getDataFieldIndexFilter(),
                        fields = pivotObj.asc_getDataFields();
                    isTop10Sum = pivotObj.asc_getIsTop10Sum();

                    this.setTitle(this.txtValueTitle + ' (' + fields[0] + ')');
                    fields.shift();
                    var arr = [];
                    fields && fields.forEach(function (item, index) {
                        item && arr.push({value: index, displayValue: item});
                    });
                    this.cmbFields.setData(arr);
                    this.cmbFields.setValue((idx!==0) ? idx-1 : 0);
                }

                var filterObj = this.properties.asc_getFilterObj();
                if (filterObj.asc_getType() == Asc.c_oAscAutoFilterTypes.Top10) {
                    var top10Filter = filterObj.asc_getFilter(),
                        type = top10Filter.asc_getTop(),
                        percent = top10Filter.asc_getPercent();

                    this.cmbType.setValue(type || type===null);
                    this.cmbItem.setValue(isTop10Sum ? 0 : (percent || percent===null));
                    this.spnCount.setDefaultUnit((percent || percent===null) && !isTop10Sum ? '%' : '');
                    this.spnCount.setValue(top10Filter.asc_getVal());
                }
            }
        },
        save: function () {
            if (this.api && this.properties) {

                var filterObj = this.properties.asc_getFilterObj();
                filterObj.asc_setFilter(new Asc.Top10());
                filterObj.asc_setType(Asc.c_oAscAutoFilterTypes.Top10);

                var top10Filter = filterObj.asc_getFilter();
                top10Filter.asc_setTop(this.cmbType.getValue());
                top10Filter.asc_setPercent(this.cmbItem.getValue()===true);
                top10Filter.asc_setVal(this.spnCount.getNumberValue());

                if (this.type == 'value') {
                    var pivotObj = this.properties.asc_getPivotObj();
                    pivotObj.asc_setIsTop10Sum(this.cmbItem.getValue()===0);
                    pivotObj.asc_setDataFieldIndexFilter((this.type == 'value') ? this.cmbFields.getValue()+1 : 0);
                }

                this.api.asc_applyAutoFilter(this.properties);
            }
        },

        onPrimary: function() {
            this.save();
            this.close();
            return false;
        },

        txtTitle            : "Top 10 AutoFilter",
        textType            : 'Show',
        txtTop              : 'Top',
        txtBottom           : 'Bottom',
        txtItems            : 'Item',
        txtPercent          : 'Percent',
        txtValueTitle: 'Top 10 Filter',
        txtSum: 'Sum',
        txtBy: 'by'

    }, SSE.Views.Top10FilterDialog || {}));

    SSE.Views.PivotDigitalFilterDialog = Common.UI.Window.extend(_.extend({

        initialize: function (options) {
            var t = this, _options = {};

            _.extend(_options,  {
                width           : 501,
                height          : 210,
                contentWidth    : 180,
                header          : true,
                cls             : 'filter-dlg',
                contentTemplate : '',
                title           : (options.type=='label') ?  t.txtTitleLabel : t.txtTitleValue,
                items           : []
            }, options);

            this.api        =   options.api;
            this.handler    =   options.handler;
            this.type       =   options.type || 'value';

            this.template   =   options.template || [
                    '<div class="box" style="height:' + (_options.height - 85) + 'px;">',
                    '<div class="content-panel" >',
                        '<label class="header">', ((t.type=='label') ? t.textShowLabel : t.textShowValue), '</label>',
                        '<div style="margin-top:15px;">',
                            '<div id="id-field-digital-combo" class="input-group-nr" style="vertical-align:middle;width:110px;display:inline-block;margin-right:10px;"></div>',
                            '<div id="id-cond-digital-combo" class="input-group-nr" style="vertical-align:middle;width:' + ((t.type=='label') ? 225 : 110) + 'px;display:inline-block;margin-right:10px;"></div>',
                            '<div id="id-input-digital-value1" class="" style="vertical-align: middle; width:225px;display:inline-block;"></div>',
                            '<label id="id-label-digital-and" style="vertical-align: middle;margin-left: 5px;">'+ this.txtAnd +'</label>',
                            '<div id="id-input-digital-value2" class="" style="vertical-align: middle; width:100px;display:inline-block;margin-left: 5px;"></div>',
                        '</div>',
                        '<div style="margin-top:10px;">',
                            '<label style="display:block;">' + t.textUse1 + '</label>',
                            '<label style="display:block;">' + t.textUse2 + '</label>',
                        '</div>',
                    '</div>',
                    '</div>',
                    '<div class="separator horizontal" style="width:100%"></div>',
                    '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok">', t.okButtonText, '</button>',
                    '<button class="btn normal dlg-btn" result="cancel">', t.cancelButtonText, '</button>',
                    '</div>'
                ].join('');

            _options.tpl    =   _.template(this.template)(_options);

            Common.UI.Window.prototype.initialize.call(this, _options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);

            this.conditions = [
                {value: Asc.c_oAscCustomAutoFilter.equals,                   displayValue: this.capCondition1},
                {value: Asc.c_oAscCustomAutoFilter.doesNotEqual,             displayValue: this.capCondition2},
                {value: Asc.c_oAscCustomAutoFilter.isGreaterThan,            displayValue: this.capCondition3},
                {value: Asc.c_oAscCustomAutoFilter.isGreaterThanOrEqualTo,   displayValue: this.capCondition4},
                {value: Asc.c_oAscCustomAutoFilter.isLessThan,               displayValue: this.capCondition5},
                {value: Asc.c_oAscCustomAutoFilter.isLessThanOrEqualTo,      displayValue: this.capCondition6},
                {value: -2,                                                  displayValue: this.capCondition13},
                {value: -3,                                                  displayValue: this.capCondition14}
            ];
            if (this.type=='label') this.conditions = this.conditions.concat([
                {value: Asc.c_oAscCustomAutoFilter.beginsWith,               displayValue: this.capCondition7},
                {value: Asc.c_oAscCustomAutoFilter.doesNotBeginWith,         displayValue: this.capCondition8},
                {value: Asc.c_oAscCustomAutoFilter.endsWith,                 displayValue: this.capCondition9},
                {value: Asc.c_oAscCustomAutoFilter.doesNotEndWith,           displayValue: this.capCondition10},
                {value: Asc.c_oAscCustomAutoFilter.contains,                 displayValue: this.capCondition11},
                {value: Asc.c_oAscCustomAutoFilter.doesNotContain,           displayValue: this.capCondition12}
            ]);

            this.cmbCondition1 = new Common.UI.ComboBox({
                el          : $('#id-cond-digital-combo', this.$window),
                menuStyle   : 'min-width: 100%;max-height: 135px;',
                style       : 'width:100%;',
                cls         : 'input-group-nr',
                data        : this.conditions,
                scrollAlwaysVisible: true,
                editable    : false,
                takeFocusOnClose: true
            });
            this.cmbCondition1.setValue(Asc.c_oAscCustomAutoFilter.equals);
            this.cmbCondition1.on('selected', _.bind(function(combo, record) {
                var isBetween = record.value == -2 || record.value == -3;
                this.inputValue2.setVisible(isBetween);
                this.lblAnd.toggleClass('hidden', !isBetween);
                this.inputValue.$el.width(isBetween ? 100 : 225);
                var me = this;
                _.defer(function () {
                    if (me.inputValue) {
                        me.inputValue.focus();
                    }
                }, 10);
            }, this));

            this.cmbFields = new Common.UI.ComboBox({
                el          : $('#id-field-digital-combo', this.$window),
                menuStyle   : 'min-width: 100%;max-height: 135px;',
                style       : 'width:100%;',
                cls         : 'input-group-nr',
                data        : [],
                scrollAlwaysVisible: true,
                editable    : false,
                takeFocusOnClose: true
            });
            this.cmbFields.setVisible(this.type=='value');
            this.cmbFields.on('selected', _.bind(function(combo, record) {
                var me = this;
                _.defer(function () {
                    if (me.inputValue) {
                        me.inputValue.focus();
                    }
                }, 10);
            }, this));

            this.inputValue = new Common.UI.InputField({
                el          : $('#id-input-digital-value1'),
                allowBlank  : false,
                style       : 'width: 100%;',
                validateOnBlur: false
            });

            this.inputValue2 = new Common.UI.InputField({
                el          : $('#id-input-digital-value2'),
                allowBlank  : false,
                style       : 'width: 100%;',
                validateOnBlur: false
            });

            this.lblAnd = this.$window.find('#id-label-digital-and');

            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.loadDefaults();
        },

        getFocusedComponents: function() {
            return [this.cmbFields, this.cmbCondition1, this.inputValue, this.inputValue2];
        },

        getDefaultFocusableComponent: function () {
            return this.inputValue;
        },

        close: function () {
            if (this.api) {
                this.api.asc_enableKeyEvents(true);
            }
            Common.UI.Window.prototype.close.call(this);
        },

        onBtnClick: function (event) {
            if (event.currentTarget.attributes &&  event.currentTarget.attributes.result) {
                if ('ok' === event.currentTarget.attributes.result.value) {
                    this.save();
                }

                this.close();
            }
        },

        setSettings: function (properties) {
            this.properties = properties;
        },

        loadDefaults: function () {
            if (this.properties && this.cmbCondition1 && this.cmbFields && this.inputValue) {

                var pivotObj = this.properties.asc_getPivotObj(),
                    idx = pivotObj.asc_getDataFieldIndexFilter(),
                    fields = pivotObj.asc_getDataFields();

                this.setTitle(this.options.title + ' (' + fields[0] + ')');
                if (this.type == 'value') {
                    fields.shift();
                    var arr = [];
                    fields && fields.forEach(function (item, index) {
                        item && arr.push({value: index, displayValue: item});
                    });
                    this.cmbFields.setData(arr);
                    this.cmbFields.setValue((idx!==0) ? idx-1 : 0);
                }

                var filterObj = this.properties.asc_getFilterObj();
                if (filterObj.asc_getType() == Asc.c_oAscAutoFilterTypes.CustomFilters) {
                    var customFilter = filterObj.asc_getFilter(),
                        customFilters = customFilter.asc_getCustomFilters(),
                        value = customFilters[0].asc_getOperator();

                    if ((customFilters.length>1)) {
                        var isAnd = customFilter.asc_getAnd();
                        var isBetween = (customFilters[0].asc_getOperator() == Asc.c_oAscCustomAutoFilter.isGreaterThanOrEqualTo && customFilters[1].asc_getOperator() == Asc.c_oAscCustomAutoFilter.isLessThanOrEqualTo),
                            isNotBetween = (customFilters[0].asc_getOperator() == Asc.c_oAscCustomAutoFilter.isLessThan && customFilters[1].asc_getOperator() == Asc.c_oAscCustomAutoFilter.isGreaterThan);

                        if (isAnd && isBetween)
                            value = -2;
                        else if (!isAnd && isNotBetween)
                            value = -3;
                    }
                    this.cmbCondition1.setValue(value || Asc.c_oAscCustomAutoFilter.equals);
                    this.inputValue.setValue(null === customFilters[0].asc_getVal() ? '' : customFilters[0].asc_getVal());
                    this.inputValue.$el.width((value==-2 || value==-3) ? 100 : 225);

                    this.lblAnd.toggleClass('hidden', !(value==-2 || value==-3));
                    this.inputValue2.setVisible(value==-2 || value==-3);
                    this.inputValue2.setValue((customFilters.length>1) ? (null === customFilters[1].asc_getVal() ? '' : customFilters[1].asc_getVal()) : '');
                }
            }
        },
        save: function () {
            if (this.api && this.properties && this.cmbCondition1 && this.cmbFields && this.inputValue) {

                var filterObj = this.properties.asc_getFilterObj();
                filterObj.asc_setFilter(new Asc.CustomFilters());
                filterObj.asc_setType(Asc.c_oAscAutoFilterTypes.CustomFilters);

                var customFilter = filterObj.asc_getFilter(),
                    type = this.cmbCondition1.getValue();
                if (type==-2) {
                    customFilter.asc_setCustomFilters([new Asc.CustomFilter(), new Asc.CustomFilter()]);
                    customFilter.asc_setAnd(true);
                    var customFilters = customFilter.asc_getCustomFilters();
                    customFilters[0].asc_setOperator(Asc.c_oAscCustomAutoFilter.isGreaterThanOrEqualTo);
                    customFilters[0].asc_setVal(this.inputValue.getValue());
                    customFilters[1].asc_setOperator(Asc.c_oAscCustomAutoFilter.isLessThanOrEqualTo);
                    customFilters[1].asc_setVal(this.inputValue2.getValue());
                } else if (type==-3) {
                    customFilter.asc_setCustomFilters([new Asc.CustomFilter(), new Asc.CustomFilter()]);
                    customFilter.asc_setAnd(false);
                    var customFilters = customFilter.asc_getCustomFilters();
                    customFilters[0].asc_setOperator(Asc.c_oAscCustomAutoFilter.isLessThan);
                    customFilters[0].asc_setVal(this.inputValue.getValue());
                    customFilters[1].asc_setOperator(Asc.c_oAscCustomAutoFilter.isGreaterThan);
                    customFilters[1].asc_setVal(this.inputValue2.getValue());
                } else {
                    customFilter.asc_setCustomFilters([new Asc.CustomFilter()]);
                    customFilter.asc_setAnd(true);
                    var customFilters = customFilter.asc_getCustomFilters();
                    customFilters[0].asc_setOperator(this.cmbCondition1.getValue());
                    customFilters[0].asc_setVal(this.inputValue.getValue());
                }
                var pivotObj = this.properties.asc_getPivotObj();
                pivotObj.asc_setDataFieldIndexFilter((this.type == 'value') ? this.cmbFields.getValue()+1 : 0);

                this.api.asc_applyAutoFilter(this.properties);
            }
        },

        onPrimary: function() {
            this.save();
            this.close();
            return false;
        },

        capCondition1       : "equals",
        capCondition10      : "does not end with",
        capCondition11      : "contains",
        capCondition12      : "does not contain",
        capCondition2       : "does not equal",
        capCondition3       : "is greater than",
        capCondition4       : "is greater than or equal to",
        capCondition5       : "is less than",
        capCondition6       : "is less than or equal to",
        capCondition7       : "begins with",
        capCondition8       : "does not begin with",
        capCondition9       : "ends with",
        textShowLabel       : "Show items for which the label:",
        textShowValue       : "Show items for which:",
        textUse1            : "Use ? to present any single character",
        textUse2            : "Use * to present any series of character",
        txtTitleValue: 'Value Filter',
        txtTitleLabel: 'Label Filter',
        capCondition13: 'between',
        capCondition14: 'not between',
        txtAnd: 'and'

    }, SSE.Views.PivotDigitalFilterDialog || {}));

    SSE.Views.SortFilterDialog = Common.UI.Window.extend(_.extend({

        initialize: function (options) {
            var t = this, _options = {};

            this.type = options.type;

            _.extend(_options,  {
                width           : 250,
                height          : 215,
                contentWidth    : 180,
                header          : true,
                cls             : 'filter-dlg',
                contentTemplate : '',
                title           : t.txtTitle,
                items           : [],
                buttons: ['ok', 'cancel']
            }, options);

            this.template   =   options.template || [
                    '<div class="box" style="height:' + (_options.height - 85) + 'px;">',
                    '<div class="content-panel" >',
                        '<div id="id-sort-filter-radio-asc" style="margin-bottom: 4px;"></div>',
                        '<div id="id-sort-filter-fields-asc" class="input-group-nr" style="margin-bottom: 10px;margin-left: 22px;"></div>',
                        '<div id="id-sort-filter-radio-desc" style="margin-bottom: 4px;"></div>',
                        '<div id="id-sort-filter-fields-desc" class="input-group-nr" style="margin-left: 22px;"></div>',
                    '</div>',
                    '</div>',
                    '<div class="separator horizontal" style="width:100%"></div>'
                ].join('');

            this.api        =   options.api;
            this.handler    =   options.handler;

            _options.tpl    =   _.template(this.template)(_options);

            Common.UI.Window.prototype.initialize.call(this, _options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);

            this.radioAsc = new Common.UI.RadioBox({
                el: $('#id-sort-filter-radio-asc'),
                labelText: this.textAsc,
                name: 'asc-radio-sort',
                checked: true
            });
            this.radioAsc.on('change', _.bind(function(field, newValue) {
                newValue && this.cmbFieldsAsc.setDisabled(false);
                newValue && this.cmbFieldsDesc.setDisabled(true);
            }, this));

            this.radioDesc = new Common.UI.RadioBox({
                el: $('#id-sort-filter-radio-desc'),
                labelText: this.textDesc,
                name: 'asc-radio-sort'
            });
            this.radioDesc.on('change', _.bind(function(field, newValue) {
                newValue && this.cmbFieldsAsc.setDisabled(true);
                newValue && this.cmbFieldsDesc.setDisabled(false);
            }, this));

            this.cmbFieldsAsc = new Common.UI.ComboBox({
                el          : $('#id-sort-filter-fields-asc', this.$window),
                menuStyle   : 'min-width: 100%;max-height: 135px;',
                style       : 'width:100%;',
                cls         : 'input-group-nr',
                data        : [],
                scrollAlwaysVisible: true,
                editable    : false,
                takeFocusOnClose: true
            });

            this.cmbFieldsDesc = new Common.UI.ComboBox({
                el          : $('#id-sort-filter-fields-desc', this.$window),
                menuStyle   : 'min-width: 100%;max-height: 135px;',
                style       : 'width:100%;',
                cls         : 'input-group-nr',
                data        : [],
                scrollAlwaysVisible: true,
                editable    : false,
                disabled: true,
                takeFocusOnClose: true
            });

            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.loadDefaults();
        },

        getFocusedComponents: function() {
            return [this.radioAsc, this.cmbFieldsAsc, this.radioDesc, this.cmbFieldsDesc];
        },

        getDefaultFocusableComponent: function () {
            return !this.cmbFieldsAsc.isDisabled() ? this.cmbFieldsAsc : this.cmbFieldsDesc;
        },

        show: function () {
            Common.UI.Window.prototype.show.call(this);
        },

        close: function () {
            if (this.api) {
                this.api.asc_enableKeyEvents(true);
            }
            Common.UI.Window.prototype.close.call(this);
        },

        onBtnClick: function (event) {
            if (event.currentTarget.attributes &&  event.currentTarget.attributes.result) {
                if ('ok' === event.currentTarget.attributes.result.value) {
                    this.save();
                }

                this.close();
            }
        },

        setSettings: function (properties) {
            this.properties = properties;
        },

        loadDefaults: function () {
            if (this.properties) {
                var pivotObj = this.properties.asc_getPivotObj(),
                    idx = pivotObj.asc_getDataFieldIndexSorting(),
                    fields = pivotObj.asc_getDataFields(),
                    sort = this.properties.asc_getSortState();

                this.setTitle(this.txtTitle + ' (' + fields[0] + ')');
                var arr = [];
                fields && fields.forEach(function (item, index) {
                    item && arr.push({value: index, displayValue: item});
                });
                this.cmbFieldsAsc.setData(arr);
                this.cmbFieldsAsc.setValue((idx>=0) ? idx : 0);
                this.cmbFieldsDesc.setData(arr);
                this.cmbFieldsDesc.setValue((idx>=0) ? idx : 0);

                this.radioDesc.setValue(sort == Asc.c_oAscSortOptions.Descending, true);
                this.cmbFieldsDesc.setDisabled(sort !== Asc.c_oAscSortOptions.Descending);
            }
        },
        save: function () {
            if (this.api && this.properties) {
                var combo = this.radioAsc.getValue() ? this.cmbFieldsAsc : this.cmbFieldsDesc;
                var pivotObj = this.properties.asc_getPivotObj();
                pivotObj.asc_setDataFieldIndexSorting(combo.getValue());
                this.properties.asc_setSortState(this.radioAsc.getValue() ? Asc.c_oAscSortOptions.Ascending : Asc.c_oAscSortOptions.Descending);
                this.api.asc_applyAutoFilter(this.properties);
            }
        },

        onPrimary: function() {
            this.save();
            this.close();
            return false;
        },

        txtTitle: "Sort",
        textAsc: 'Ascenging (A to Z) by',
        textDesc: 'Descending (Z to A) by'

    }, SSE.Views.SortFilterDialog || {}));

    SSE.Views.AutoFilterDialog = Common.UI.Window.extend(_.extend({

        initialize: function (options) {
            var t = this, _options = {}, width = 450, height = undefined;
            if (Common.Utils.InternalSettings.get('sse-settings-size-filter-window')) {
                width = Common.Utils.InternalSettings.get('sse-settings-size-filter-window')[0];
                height = Common.Utils.InternalSettings.get('sse-settings-size-filter-window')[1];
            }

            _.extend(_options, {
                width           : width || 450,
                height          : height || 265,
                contentWidth    : (width - 50) || 400,
                header          : false,
                cls             : 'filter-dlg',
                contentTemplate : '',
                title           : t.txtTitle,
                modal           : false,
                animate         : false,
                items           : [],
                resizable       : true,
                minwidth        : 450,
                minheight       : 265
            }, options);

            this.template   =   options.template || [
                '<div class="box" style="height: 100%; display: flex; justify-content: space-between;">',
                    '<div class="content-panel" style="width: 100%; border-right: 1px solid #cbcbcb; display: flex; flex-direction: column; justify-content: space-between;">',
                        '<div class="" style="display: flex; flex-direction: column; justify-content: flex-start; height: calc(100% - 40px);">',
                            '<div id="id-sd-cell-search" style="height:22px; margin-bottom:10px;"></div>',
                            '<div class="border-values" style="overflow: hidden; flex-grow: 1;">',
                                '<div id="id-dlg-filter-values" class="combo-values" style=""></div>',
                            '</div>',
                        '</div>',
                        '<div class="footer center">',
                            '<div id="id-apply-filter" style="display: inline-block;"></div>',
                            '<button class="btn normal dlg-btn" result="cancel">', t.cancelButtonText, '</button>',
                        '</div>',
                    '</div>',
                    '<div class="menu-panel" style="float: right;">',
                        '<div id="menu-container-filters" style=""><div class="dropdown-toggle" data-toggle="dropdown"></div></div>',
                    '</div>',
                '</div>'
            ].join('');

            this.api            =   options.api;
            this.handler        =   options.handler;
            this.throughIndexes =   [];
            this.filteredIndexes =  [];
            this.curSize = null;

            _options.tpl        =   _.template(this.template)(_options);

            Common.UI.Window.prototype.initialize.call(this, _options);

            this.on('resizing', _.bind(this.onWindowResizing, this));
            this.on('resize', _.bind(this.onWindowResize, this));
        },
        render: function () {

            var me = this;

            Common.UI.Window.prototype.render.call(this);

            var $border = this.$window.find('.resize-border');
            this.$window.find('.resize-border.left, .resize-border.top').css({'cursor': 'default'});
            $border.css({'background': 'none', 'border': 'none'});
            $border.removeClass('left');
            $border.removeClass('top');


            this.$window.find('.btn').on('click', _.bind(this.onBtnClick, this));

            this.btnOk = new Common.UI.Button({
                cls: 'btn normal dlg-btn primary',
                caption : this.okButtonText,
                enableToggle: false,
                allowDepress: false
            });

            if (this.btnOk) {
                this.btnOk.render($('#id-apply-filter', this.$window));
                this.btnOk.on('click', _.bind(this.onApplyFilter, this));
            }

            this.miSortLow2High = new Common.UI.MenuItem({
                caption     : this.txtSortLow2High,
                toggleGroup : 'menufiltersort',
                checkable   : true,
                checked     : false
            });
            this.miSortLow2High.on('click', _.bind(this.onSortType, this, Asc.c_oAscSortOptions.Ascending));

            this.miSortHigh2Low = new Common.UI.MenuItem({
                caption     : this.txtSortHigh2Low,
                toggleGroup : 'menufiltersort',
                checkable   : true,
                checked     : false
            });
            this.miSortHigh2Low.on('click', _.bind(this.onSortType, this, Asc.c_oAscSortOptions.Descending));

            this.miSortOptions = new Common.UI.MenuItem({
                caption     : this.txtSortOption
            });
            this.miSortOptions.on('click', _.bind(this.onSortOptions, this));

            this.miSortCellColor = new Common.UI.MenuItem({
                caption     : this.txtSortCellColor,
                toggleGroup : 'menufiltersort',
                checkable   : true,
                checked     : false,
                menu        : new Common.UI.Menu({
                    style: 'min-width: inherit; padding: 0px;',
                    menuAlign: 'tl-tr',
                        items: [
                            { template: _.template('<div id="filter-dlg-sort-cells-color" style="max-width: 147px; max-height: 120px;"></div>') }
                        ]
                })
            });

            this.miSortFontColor = new Common.UI.MenuItem({
                caption     : this.txtSortFontColor,
                toggleGroup : 'menufiltersort',
                checkable   : true,
                checked     : false,
                menu        : new Common.UI.Menu({
                    style: 'min-width: inherit; padding: 0px;',
                    menuAlign: 'tl-tr',
                        items: [
                            { template: _.template('<div id="filter-dlg-sort-font-color" style="max-width: 147px; max-height: 120px;"></div>') }
                        ]
                })
            });

            this.miNumFilter = new Common.UI.MenuItem({
                caption     : this.txtNumFilter,
                toggleGroup : 'menufilterfilter',
                checkable   : true,
                checked     : false,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        {value: Asc.c_oAscCustomAutoFilter.equals,                   caption: this.txtEquals,       checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters},
                        {value: Asc.c_oAscCustomAutoFilter.doesNotEqual,             caption: this.txtNotEquals,    checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters},
                        {value: Asc.c_oAscCustomAutoFilter.isGreaterThan,            caption: this.txtGreater,      checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters},
                        {value: Asc.c_oAscCustomAutoFilter.isGreaterThanOrEqualTo,   caption: this.txtGreaterEquals,checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters},
                        {value: Asc.c_oAscCustomAutoFilter.isLessThan,               caption: this.txtLess,         checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters},
                        {value: Asc.c_oAscCustomAutoFilter.isLessThanOrEqualTo,      caption: this.txtLessEquals,   checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters},
                        {value: -2,                                                  caption: this.txtBetween,      checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters},
                        {value: Asc.c_oAscCustomAutoFilter.top10,                    caption: this.txtTop10,        checkable: true, type: Asc.c_oAscAutoFilterTypes.Top10},
                        {value: Asc.c_oAscDynamicAutoFilter.aboveAverage,             caption: this.txtAboveAve,    checkable: true, type: Asc.c_oAscAutoFilterTypes.DynamicFilter},
                        {value: Asc.c_oAscDynamicAutoFilter.belowAverage,             caption: this.txtBelowAve,    checkable: true, type: Asc.c_oAscAutoFilterTypes.DynamicFilter},
                        {value: -1, caption: this.btnCustomFilter + '...', checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters}
                    ]
                })
            });
            var items = this.miNumFilter.menu.items;
            for (var i=0; i<items.length; i++) {
                items[i].on('click', _.bind((items[i].options.type == Asc.c_oAscAutoFilterTypes.CustomFilters) ? this.onNumCustomFilterItemClick :
                                            ((items[i].options.type == Asc.c_oAscAutoFilterTypes.DynamicFilter) ? this.onNumDynamicFilterItemClick : this.onTop10FilterItemClick ), this));
            }

            this.miTextFilter = new Common.UI.MenuItem({
                caption     : this.txtTextFilter,
                toggleGroup : 'menufilterfilter',
                checkable   : true,
                checked     : false,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        {value: Asc.c_oAscCustomAutoFilter.equals,                   caption: this.txtEquals,       checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters},
                        {value: Asc.c_oAscCustomAutoFilter.doesNotEqual,             caption: this.txtNotEquals,    checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters},
                        {value: Asc.c_oAscCustomAutoFilter.beginsWith,               caption: this.txtBegins,       checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters},
                        {value: Asc.c_oAscCustomAutoFilter.doesNotBeginWith,         caption: this.txtNotBegins,    checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters},
                        {value: Asc.c_oAscCustomAutoFilter.endsWith,                 caption: this.txtEnds,         checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters},
                        {value: Asc.c_oAscCustomAutoFilter.doesNotEndWith,           caption: this.txtNotEnds,      checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters},
                        {value: Asc.c_oAscCustomAutoFilter.contains,                 caption: this.txtContains,     checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters},
                        {value: Asc.c_oAscCustomAutoFilter.doesNotContain,           caption: this.txtNotContains,  checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters},
                        {value: -1, caption: this.btnCustomFilter + '...', checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters}
                    ]
                })
            });
            this.miTextFilter.menu.on('item:click', _.bind(this.onTextFilterMenuClick, this));

            this.miFilterCellColor = new Common.UI.MenuItem({
                caption     : this.txtFilterCellColor,
                toggleGroup : 'menufilterfilter',
                checkable   : true,
                checked     : false,
                menu        : new Common.UI.Menu({
                    style: 'min-width: inherit; padding: 0px;',
                    menuAlign: 'tl-tr',
                        items: [
                            { template: _.template('<div id="filter-dlg-filter-cells-color" style="max-width: 147px; max-height: 120px;"></div>') }
                        ]
                })
            });

            this.miFilterFontColor = new Common.UI.MenuItem({
                caption     : this.txtFilterFontColor,
                toggleGroup : 'menufilterfilter',
                checkable   : true,
                checked     : false,
                menu        : new Common.UI.Menu({
                    style: 'min-width: inherit; padding: 0px;',
                    menuAlign: 'tl-tr',
                        items: [
                            { template: _.template('<div id="filter-dlg-filter-font-color" style="max-width: 147px; max-height: 120px;"></div>') }
                        ]
                })
            });

            this.miClear = new Common.UI.MenuItem({
                caption     : this.txtClear,
                checkable   : false
            });
            this.miClear.on('click', _.bind(this.onClear, this));

            this.miReapply = new Common.UI.MenuItem({
                caption     : this.txtReapply,
                checkable   : false
            });
            this.miReapply.on('click', _.bind(this.onReapply, this));

            this.miReapplySeparator   = new Common.UI.MenuItem({ caption: '--' });

            // pivot
            this.miValueFilter = new Common.UI.MenuItem({
                caption     : this.txtValueFilter,
                toggleGroup : 'menufilterfilter',
                checkable   : true,
                checked     : false,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        {value: Asc.c_oAscCustomAutoFilter.equals,                   caption: this.txtEquals,       checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'value'},
                        {value: Asc.c_oAscCustomAutoFilter.doesNotEqual,             caption: this.txtNotEquals,    checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'value'},
                        {value: Asc.c_oAscCustomAutoFilter.isGreaterThan,            caption: this.txtGreater,      checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'value'},
                        {value: Asc.c_oAscCustomAutoFilter.isGreaterThanOrEqualTo,   caption: this.txtGreaterEquals,checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'value'},
                        {value: Asc.c_oAscCustomAutoFilter.isLessThan,               caption: this.txtLess,         checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'value'},
                        {value: Asc.c_oAscCustomAutoFilter.isLessThanOrEqualTo,      caption: this.txtLessEquals,   checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'value'},
                        {value: -2,                                                  caption: this.txtBetween,      checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'value'},
                        {value: -3,                                                  caption: this.txtNotBetween,   checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'value'},
                        {value: Asc.c_oAscCustomAutoFilter.top10,                    caption: this.txtTop10,        checkable: true, type: Asc.c_oAscAutoFilterTypes.Top10, pivottype: 'value'}
                    ]
                })
            });
            this.miValueFilter.menu.on('item:click', _.bind(this.onValueFilterMenuClick, this));

            this.miLabelFilter = new Common.UI.MenuItem({
                caption     : this.txtLabelFilter,
                toggleGroup : 'menufilterfilter',
                checkable   : true,
                checked     : false,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        {value: Asc.c_oAscCustomAutoFilter.equals,                   caption: this.txtEquals,       checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'label'},
                        {value: Asc.c_oAscCustomAutoFilter.doesNotEqual,             caption: this.txtNotEquals,    checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'label'},
                        {value: Asc.c_oAscCustomAutoFilter.beginsWith,               caption: this.txtBegins,       checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'label'},
                        {value: Asc.c_oAscCustomAutoFilter.doesNotBeginWith,         caption: this.txtNotBegins,    checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'label'},
                        {value: Asc.c_oAscCustomAutoFilter.endsWith,                 caption: this.txtEnds,         checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'label'},
                        {value: Asc.c_oAscCustomAutoFilter.doesNotEndWith,           caption: this.txtNotEnds,      checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'label'},
                        {value: Asc.c_oAscCustomAutoFilter.contains,                 caption: this.txtContains,     checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'label'},
                        {value: Asc.c_oAscCustomAutoFilter.doesNotContain,           caption: this.txtNotContains,  checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'label'},
                        {caption: '--'},
                        {value: Asc.c_oAscCustomAutoFilter.isGreaterThan,            caption: this.txtGreater,      checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'label'},
                        {value: Asc.c_oAscCustomAutoFilter.isGreaterThanOrEqualTo,   caption: this.txtGreaterEquals,checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'label'},
                        {value: Asc.c_oAscCustomAutoFilter.isLessThan,               caption: this.txtLess,         checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'label'},
                        {value: Asc.c_oAscCustomAutoFilter.isLessThanOrEqualTo,      caption: this.txtLessEquals,   checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'label'},
                        {value: -2,                                                  caption: this.txtBetween,      checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'label'},
                        {value: -3,                                                  caption: this.txtNotBetween,   checkable: true, type: Asc.c_oAscAutoFilterTypes.CustomFilters, pivottype: 'label'}
                    ]
                })
            });
            this.miLabelFilter.menu.on('item:click', _.bind(this.onLabelFilterMenuClick, this));

            this.filtersMenu = new Common.UI.Menu({
                items: [
                    this.miSortLow2High,
                    this.miSortHigh2Low,
                    this.miSortOptions,
                    this.miSortCellColor,
                    this.miSortFontColor,
                    {caption     : '--'},
                    this.miLabelFilter,
                    this.miValueFilter,
                    this.miNumFilter,
                    this.miTextFilter,
                    this.miFilterCellColor,
                    this.miFilterFontColor,
                    this.miClear,
                    this.miReapplySeparator,
                    this.miReapply
                ]
            });

            // Prepare menu container
            var menuContainer = this.$window.find('#menu-container-filters');
            this.filtersMenu.render(menuContainer);
            this.filtersMenu.cmpEl.attr({tabindex: "-1"});

            this.mnuSortColorCellsPicker = new Common.UI.ColorPaletteExt({
                el: $('#filter-dlg-sort-cells-color'),
                colors: []
            });
            this.mnuSortColorCellsPicker.on('select', _.bind(this.onSortColorSelect, this, Asc.c_oAscSortOptions.ByColorFill));

            this.mnuSortColorFontPicker = new Common.UI.ColorPaletteExt({
                el: $('#filter-dlg-sort-font-color'),
                colors: []
            });
            this.mnuSortColorFontPicker.on('select', _.bind(this.onSortColorSelect, this, Asc.c_oAscSortOptions.ByColorFont));

            this.mnuFilterColorCellsPicker = new Common.UI.ColorPaletteExt({
                el: $('#filter-dlg-filter-cells-color'),
                colors: []
            });
            this.mnuFilterColorCellsPicker.on('select', _.bind(this.onFilterColorSelect, this, true));

            this.mnuFilterColorFontPicker = new Common.UI.ColorPaletteExt({
                el: $('#filter-dlg-filter-font-color'),
                colors: []
            });
            this.mnuFilterColorFontPicker.on('select', _.bind(this.onFilterColorSelect, this, false));

            this.input = new Common.UI.InputField({
                el               : $('#id-sd-cell-search', this.$window),
                allowBlank       : true,
                placeHolder      : this.txtEmpty,
                validateOnChange : true,
                validation       : function () { return true; }
            }).on ('changing', function (input, value) {
                if (value.length) {
                    value = value.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
                    me.filter = new RegExp(value, 'ig');
                } else {
                    me.filter = undefined;
                }
                me.setupDataCells();
            });

            this.cells = new Common.UI.DataViewStore();
            this.filterExcludeCells = new Common.UI.DataViewStore();
            if (this.cells) {
                this.cellsList = new Common.UI.ListView({
                    el: $('#id-dlg-filter-values', this.$window),
                    store: this.cells,
                    simpleAddMode: true,
                    template: _.template(['<div class="listview inner" style="border:none;"></div>'].join('')),
                    itemTemplate: _.template([
                        '<div>',
                            '<label class="checkbox-indeterminate" style="position:absolute;">',
                                '<input id="afcheckbox-<%= id %>" type="checkbox" class="button__checkbox">',
                                '<label for="afcheckbox-<%= id %>" class="checkbox__shape"></label>',
                            '</label>',
                            '<div id="<%= id %>" class="list-item" style="pointer-events:none; margin-left: 20px;display: flex;">',
                                '<div style="flex-grow: 1;"><%= Common.Utils.String.htmlEncode(value) %></div>',
                                '<% if (typeof count !=="undefined" && count) { %>',
                                    '<div style="word-break: normal; margin-left: 10px; color: #afafaf;"><%= count%></div>',
                                '<% } %>',
                            '</div>',
                        '</div>'
                    ].join(''))
                });
                this.cellsList.store.comparator = function(item1, item2) {
                    if ('0' == item1.get('groupid')) return -1;
                    if ('0' == item2.get('groupid')) return 1;
                    if ('2' == item1.get('groupid')) return -1;
                    if ('2' == item2.get('groupid')) return 1;

                    var n1 = item1.get('intval'),
                        n2 = item2.get('intval'),
                        isN1 = n1!==undefined,
                        isN2 = n2!==undefined;
                    if (isN1 !== isN2) return (isN1) ? -1 : 1;
                    !isN1 && (n1 = item1.get('cellvalue').toLowerCase()) && (n2 = item2.get('cellvalue').toLowerCase());
                    if (n1==n2) return 0;
                    return (n2=='' || n1!=='' && n1<n2) ? -1 : 1;
                };
                this.cellsList.on({
                    'item:change': this.onItemChanged.bind(this),
                    'item:add': this.onItemChanged.bind(this),
                    'item:select': this.onCellCheck.bind(this)
                });
                this.cellsList.onKeyDown = _.bind(this.onListKeyDown, this);
            }

            this.setupDataCells();
            this._setDefaults();

            var checkDocumentClick = function(e) {
                if (me._skipCheckDocumentClick) return;
                if ($(e.target).closest('.filter-dlg').length<=0)
                    me.close();
            };
            this.on('close',function() {
                $(document.body).off('mousedown', checkDocumentClick);
            });
            _.delay(function () {
                $(document.body).on('mousedown', checkDocumentClick);
            }, 100, this);

            if(Common.Utils.InternalSettings.get('sse-settings-size-filter-window')) {
                this.$window.find('.combo-values').css({'height': Common.Utils.InternalSettings.get('sse-settings-size-filter-window')[1] - 103 + 'px'});
                this.cellsList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true, suppressScrollX: true});
            }
        },

        show: function (x, y) {
            Common.UI.Window.prototype.show.call(this, x, y);

            var me = this;
            if (this.input) {
                _.delay(function () {
                    me.input.focus();
                }, 500, this);
            }
        },

        onBtnClick: function (event) {
            if (event.currentTarget.attributes &&  event.currentTarget.attributes.result) {
                if ('cancel' === event.currentTarget.attributes.result.value) {
                    this.close();
                }
            }
        },
        onApplyFilter: function () {
            if (this.testFilter()) {
                this.save();
                this.close();
            }
        },

        onSortType: function (type) {
            if (this.api && this.configTo) {
                this.api.asc_sortColFilter(type, this.configTo.asc_getCellId(), this.configTo.asc_getDisplayName());
            }

            this.close();
        },

        onSortOptions: function () {
            var me = this,
                dlgSort = new SSE.Views.SortFilterDialog({api:this.api}).on({
                    'close': function() {
                        me.close();
                    }
                });
            this.close();

            dlgSort.setSettings(this.configTo);
            dlgSort.show();
        },

        onNumCustomFilterItemClick: function(item) {
            var filterObj = this.configTo.asc_getFilterObj(),
                value1 = '', value2 = '',
                cond1 = Asc.c_oAscCustomAutoFilter.equals,
                cond2 = 0, isAnd = true;
            if (filterObj.asc_getType() == Asc.c_oAscAutoFilterTypes.CustomFilters) {
                    var customFilter = filterObj.asc_getFilter(),
                        customFilters = customFilter.asc_getCustomFilters();

                    isAnd = (customFilter.asc_getAnd());
                    cond1 = customFilters[0].asc_getOperator();
                    cond2 = ((customFilters.length>1) ? (customFilters[1].asc_getOperator() || 0) : 0);

                    value1 = (null === customFilters[0].asc_getVal() ? '' : customFilters[0].asc_getVal());
                    value2 = ((customFilters.length>1) ? (null === customFilters[1].asc_getVal() ? '' : customFilters[1].asc_getVal()) : '');
            }

            if (item.value!==-1) {
                var newCustomFilter = new Asc.CustomFilters();
                newCustomFilter.asc_setCustomFilters((item.value == -2 || item.value == -3) ? [new Asc.CustomFilter(), new Asc.CustomFilter()]: [new Asc.CustomFilter()]);

                var newCustomFilters = newCustomFilter.asc_getCustomFilters();
                newCustomFilters[0].asc_setOperator((item.value == -2) ? Asc.c_oAscCustomAutoFilter.isGreaterThanOrEqualTo : ((item.value == -3) ? Asc.c_oAscCustomAutoFilter.isLessThan : item.value));

                if (item.value == -2) {
                    var isBetween = (cond1 == Asc.c_oAscCustomAutoFilter.isGreaterThanOrEqualTo && cond2 == Asc.c_oAscCustomAutoFilter.isLessThanOrEqualTo);
                    newCustomFilter.asc_setAnd(isBetween ? isAnd : true);
                    newCustomFilters[0].asc_setVal(isBetween ? value1 : '');
                    newCustomFilters[1].asc_setOperator(Asc.c_oAscCustomAutoFilter.isLessThanOrEqualTo);
                    newCustomFilters[1].asc_setVal(isBetween ? value2 : '');
                } else if (item.value == -3) {
                    var isNotBetween = (cond1 == Asc.c_oAscCustomAutoFilter.isLessThan && cond2 == Asc.c_oAscCustomAutoFilter.isGreaterThan);
                    newCustomFilter.asc_setAnd(isNotBetween ? isAnd : false);
                    newCustomFilters[0].asc_setVal(isNotBetween ? value1 : '');
                    newCustomFilters[1].asc_setOperator(Asc.c_oAscCustomAutoFilter.isGreaterThan);
                    newCustomFilters[1].asc_setVal(isNotBetween ? value2 : '');
                } else {
                    newCustomFilter.asc_setAnd(true);
                    newCustomFilters[0].asc_setVal((item.value == cond1) ? value1 : '');
                }

                filterObj.asc_setFilter(newCustomFilter);
                filterObj.asc_setType(Asc.c_oAscAutoFilterTypes.CustomFilters);
            } 

            var me = this,
                dlgDigitalFilter;
            if (item.options.pivottype == 'label' || item.options.pivottype == 'value')
                dlgDigitalFilter = new SSE.Views.PivotDigitalFilterDialog({api:this.api, type: item.options.pivottype}).on({
                    'close': function() {
                        me.close();
                    }
                });
            else
                dlgDigitalFilter = new SSE.Views.DigitalFilterDialog({api:this.api, type: 'number'}).on({
                    'close': function() {
                        me.close();
                    }
                });

            this.close();

            dlgDigitalFilter.setSettings(this.configTo);
            dlgDigitalFilter.show();
        },

        onTextFilterMenuClick: function(menu, item) {
            var filterObj = this.configTo.asc_getFilterObj(),
                value1 = '', value2 = '',
                cond1 = Asc.c_oAscCustomAutoFilter.equals,
                cond2 = 0, isAnd = true;
            if (filterObj.asc_getType() == Asc.c_oAscAutoFilterTypes.CustomFilters) {
                var customFilter = filterObj.asc_getFilter(),
                    customFilters = customFilter.asc_getCustomFilters();

                isAnd = (customFilter.asc_getAnd());
                cond1 = customFilters[0].asc_getOperator();
                cond2 = ((customFilters.length>1) ? (customFilters[1].asc_getOperator() || 0) : 0);

                value1 = (null === customFilters[0].asc_getVal() ? '' : customFilters[0].asc_getVal());
                value2 = ((customFilters.length>1) ? (null === customFilters[1].asc_getVal() ? '' : customFilters[1].asc_getVal()) : '');
            }

            if (item.value!==-1) {
                var newCustomFilter = new Asc.CustomFilters();
                newCustomFilter.asc_setCustomFilters([new Asc.CustomFilter()]);

                var newCustomFilters = newCustomFilter.asc_getCustomFilters();
                newCustomFilter.asc_setAnd(true);
                newCustomFilters[0].asc_setOperator(item.value);
                newCustomFilters[0].asc_setVal((item.value == cond1) ? value1 : '');

                filterObj.asc_setFilter(newCustomFilter);
                filterObj.asc_setType(Asc.c_oAscAutoFilterTypes.CustomFilters);
            }

            var me = this,
                dlgDigitalFilter;
            if (item.options.pivottype == 'label' || item.options.pivottype == 'value')
                dlgDigitalFilter = new SSE.Views.PivotDigitalFilterDialog({api:this.api, type: item.options.pivottype}).on({
                    'close': function() {
                        me.close();
                    }
                });
            else
                dlgDigitalFilter = new SSE.Views.DigitalFilterDialog({api:this.api, type: 'text'}).on({
                    'close': function() {
                        me.close();
                    }
                });
            this.close();

            dlgDigitalFilter.setSettings(this.configTo);
            dlgDigitalFilter.show();
        },

        onNumDynamicFilterItemClick: function(item) {
            var filterObj = this.configTo.asc_getFilterObj();

            if (filterObj.asc_getType() !== Asc.c_oAscAutoFilterTypes.DynamicFilter) {
                filterObj.asc_setFilter(new Asc.DynamicFilter());
                filterObj.asc_setType(Asc.c_oAscAutoFilterTypes.DynamicFilter);
            }

            filterObj.asc_getFilter().asc_setType(item.value);
            this.api.asc_applyAutoFilter(this.configTo);
            
            this.close();
        },

        onTop10FilterItemClick: function(item) {
            var me = this,
                dlgTop10Filter = new SSE.Views.Top10FilterDialog({api:this.api, type: item.options.pivottype}).on({
                    'close': function() {
                        me.close();
                    }
                });
            this.close();

            dlgTop10Filter.setSettings(this.configTo);
            dlgTop10Filter.show();
        },

        onLabelFilterMenuClick: function(menu, item) {
            if (item.value == Asc.c_oAscCustomAutoFilter.isGreaterThan || item.value == Asc.c_oAscCustomAutoFilter.isGreaterThanOrEqualTo || item.value == Asc.c_oAscCustomAutoFilter.isLessThan ||
                item.value == Asc.c_oAscCustomAutoFilter.isLessThanOrEqualTo || item.value == -2 || item.value == -3)
                this.onNumCustomFilterItemClick(item);
            else
                this.onTextFilterMenuClick(menu, item);
        },

        onValueFilterMenuClick: function(menu, item) {
            var me = this;
            var pivotObj = this.configTo.asc_getPivotObj(),
                fields = pivotObj.asc_getDataFields();
            if (fields.length<2) {
                Common.UI.warning({title: this.textWarning,
                    msg: this.warnFilterError,
                    callback: function() {
                        _.delay(function () {
                            me.close();
                        }, 10);
                    }
                });
            } else {
                if (item.options.type == Asc.c_oAscAutoFilterTypes.CustomFilters)
                    this.onNumCustomFilterItemClick(item);
                else
                    this.onTop10FilterItemClick(item);
            }
        },

        onFilterColorSelect: function(isCellColor, picker, color) {
            var filterObj = this.configTo.asc_getFilterObj();
            if (filterObj.asc_getType() !== Asc.c_oAscAutoFilterTypes.ColorFilter) {
                filterObj.asc_setFilter(new Asc.ColorFilter());
                filterObj.asc_setType(Asc.c_oAscAutoFilterTypes.ColorFilter);
            }

            var colorFilter = filterObj.asc_getFilter();
            colorFilter.asc_setCellColor(isCellColor ? null : false);
            colorFilter.asc_setCColor((isCellColor && color == 'transparent' || !isCellColor && color == '#000000') ? null : Common.Utils.ThemeColor.getRgbColor(color));

            this.api.asc_applyAutoFilter(this.configTo);

            this.close();
        },

        onSortColorSelect: function(type, picker, color) {
            if (this.api && this.configTo) {
                var isCellColor = (type == Asc.c_oAscSortOptions.ByColorFill);
                this.api.asc_sortColFilter(type, this.configTo.asc_getCellId(), this.configTo.asc_getDisplayName(), (isCellColor && color == 'transparent' || !isCellColor && color == '#000000') ? null : Common.Utils.ThemeColor.getRgbColor(color));
            }
            this.close();
        },

        onCellCheck: function (listView, itemView, record) {
            if (this.checkCellTrigerBlock)
                return;

            var target = '', isLabel = false, bound = null;

            var event = window.event ? window.event : window._event;
            if (event) {
                target = $(event.currentTarget).find('.list-item');

                if (target.length) {
                    bound = target.get(0).getBoundingClientRect();
                    var _clientX = event.clientX*Common.Utils.zoom(),
                        _clientY = event.clientY*Common.Utils.zoom();
                    if (bound.left < _clientX && _clientX < bound.right &&
                        bound.top < _clientY && _clientY < bound.bottom) {
                        isLabel = true;
                    }
                }

                if (isLabel || event.target.className.match('checkbox')) {
                    this.updateCellCheck(listView, record);

                    _.delay(function () {
                        listView.focus();
                    }, 100, this);
                }
            }
        },
        onListKeyDown: function (e, data) {
            var record = null, listView = this.cellsList;

            if (listView.disabled) return;
            if (_.isUndefined(undefined)) data = e;

            if (data.keyCode == Common.UI.Keys.SPACE) {
                data.preventDefault();
                data.stopPropagation();

                this.updateCellCheck(listView, listView.getSelectedRec());

            } else {
                Common.UI.DataView.prototype.onKeyDown.call(this.cellsList, e, data);
            }
        },

        updateCellCheck: function (listView, record) {
            if (record && listView) {
                // listView.isSuspendEvents = true;

                var check = !record.get('check'),
                    me = this,
                    idxs = (me.filter) ? me.filteredIndexes : me.throughIndexes;
                if ('0' == record.get('groupid')) {
                    this.cells.each(function(cell) {
                        if ('2' !== cell.get('groupid')) {
                            cell.set('check', check);
                            if (cell.get('throughIndex')>1)
                                idxs[parseInt(cell.get('throughIndex'))] = check;
                        }
                    });
                } else {
                    record.set('check', check);
                    idxs[parseInt(record.get('throughIndex'))] = check;

                    var selectAllState = check;
                    for (var i=0; i< this.cells.length; i++) {
                        var cell = this.cells.at(i);
                        if ('1' == cell.get('groupid') && cell.get('check') !== check) {
                            selectAllState = 'indeterminate';
                            break;
                        }
                    }
                    this.checkCellTrigerBlock = true;
                    this.cells.at(0).set('check', selectAllState);
                    this.checkCellTrigerBlock = undefined;
                }

                this.btnOk.setDisabled(false);
                this.configTo.asc_getFilterObj().asc_setType(Asc.c_oAscAutoFilterTypes.Filters);

                // listView.isSuspendEvents = false;
                listView.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true, suppressScrollX: true});
            }
        },

        onClear: function() {
            if (this.api && this.configTo)
                this.api.asc_clearFilterColumn(this.configTo.asc_getCellId(), this.configTo.asc_getDisplayName());
            this.close();
        },

        onReapply: function() {
            if (this.api && this.configTo)
                this.api.asc_reapplyAutoFilter(this.config.asc_getDisplayName());
            this.close();
        },

        setSettings: function (config) {
            this.config = config;
            this.configTo = config;
        },

        _setDefaults: function() {
            this.initialFilterType = this.configTo.asc_getFilterObj().asc_getType();
            var menuPanel = this.$window.find('.menu-panel');
            var pivotObj = this.configTo.asc_getPivotObj(),
                isPivot = !!pivotObj,
                isValueFilter = false;

            this.miValueFilter.setVisible(isPivot);
            this.miLabelFilter.setVisible(isPivot);
            this.miSortOptions.setVisible(isPivot);

            if (isPivot) {
                this.miReapplySeparator.setVisible(false);
                this.miReapply.setVisible(false);

                isValueFilter = (pivotObj.asc_getDataFieldIndexFilter()!==0);
            }

            var filterObj = this.configTo.asc_getFilterObj(),
                isCustomFilter = (this.initialFilterType === Asc.c_oAscAutoFilterTypes.CustomFilters),
                isDynamicFilter = (this.initialFilterType === Asc.c_oAscAutoFilterTypes.DynamicFilter),
                isTop10 = (this.initialFilterType === Asc.c_oAscAutoFilterTypes.Top10),
                isTextFilter = this.configTo.asc_getIsTextFilter(),
                colorsFill = this.configTo.asc_getColorsFill(),
                colorsFont = this.configTo.asc_getColorsFont(),
                sort = this.configTo.asc_getSortState(),
                sortColor = this.configTo.asc_getSortColor();

            if (sortColor) sortColor = Common.Utils.ThemeColor.getHexColor(sortColor.get_r(), sortColor.get_g(), sortColor.get_b()).toLocaleUpperCase();

            this.miTextFilter.setVisible(!isPivot && isTextFilter);
            this.miNumFilter.setVisible(!isPivot && !isTextFilter);
            this.miTextFilter.setChecked(isCustomFilter && isTextFilter, true);
            this.miNumFilter.setChecked((isCustomFilter || isDynamicFilter || isTop10) && !isTextFilter, true);

            this.miValueFilter.setChecked(isPivot && isValueFilter, true);
            this.miLabelFilter.setChecked(isPivot && !isValueFilter && (isCustomFilter || isTop10), true);

            this.miSortLow2High.setChecked(sort == Asc.c_oAscSortOptions.Ascending, true);
            this.miSortHigh2Low.setChecked(sort == Asc.c_oAscSortOptions.Descending, true);

            var hasColors = (colorsFont && colorsFont.length>0);
            this.miSortFontColor.setVisible(hasColors);
            this.miFilterFontColor.setVisible(!isPivot && hasColors);
            if (hasColors) {
                var colors = [];
                colorsFont.forEach(function(item, index) {
                    if (item)
                        colors.push(Common.Utils.ThemeColor.getHexColor(item.get_r(), item.get_g(), item.get_b()).toLocaleUpperCase());
                    else
                        colors.push('000000');
                });
                this.mnuSortColorFontPicker.updateColors(colors);
                this.mnuFilterColorFontPicker.updateColors(colors);

                this.miFilterFontColor.setChecked(false, true);
                this.miSortFontColor.setChecked(sort == Asc.c_oAscSortOptions.ByColorFont, true);
                if (sort == Asc.c_oAscSortOptions.ByColorFont)
                    this.mnuSortColorFontPicker.select((sortColor) ? sortColor : '000000', true);
            }

            hasColors = (colorsFill && colorsFill.length>0);
            this.miSortCellColor.setVisible(hasColors);
            this.miFilterCellColor.setVisible(!isPivot && hasColors);
            if (hasColors) {
                var colors = [];
                colorsFill.forEach(function(item, index) {
                    if (item)
                        colors.push(Common.Utils.ThemeColor.getHexColor(item.get_r(), item.get_g(), item.get_b()).toLocaleUpperCase());
                    else
                        colors.push('transparent');
                 });
                this.mnuSortColorCellsPicker.updateColors(colors);
                this.mnuFilterColorCellsPicker.updateColors(colors);

                this.miFilterCellColor.setChecked(false, true);
                this.miSortCellColor.setChecked(sort == Asc.c_oAscSortOptions.ByColorFill, true);
                if (sort == Asc.c_oAscSortOptions.ByColorFill)
                    this.mnuSortColorCellsPicker.select((sortColor) ? sortColor : 'transparent', true);
            }

            if (isCustomFilter) {
                var customFilter = filterObj.asc_getFilter(),
                    customFilters = customFilter.asc_getCustomFilters(),
                    isAnd = (customFilter.asc_getAnd()),
                    cond1 = customFilters[0].asc_getOperator(),
                    cond2 = ((customFilters.length>1) ? (customFilters[1].asc_getOperator() || 0) : 0),
                    items = isPivot ? (isValueFilter ? this.miValueFilter.menu.items : this.miLabelFilter.menu.items) : ((isTextFilter) ? this.miTextFilter.menu.items : this.miNumFilter.menu.items),
                    isCustomConditions = true;

                if (customFilters.length==1)
                    items.forEach(function(item){
                        var checked = (item.options.type == Asc.c_oAscAutoFilterTypes.CustomFilters) && (item.value == cond1);
                        item.setChecked(checked, true);
                        if (checked) isCustomConditions = false;
                    });
                else if ((isPivot || !isTextFilter) && (cond1 == Asc.c_oAscCustomAutoFilter.isGreaterThanOrEqualTo && cond2 == Asc.c_oAscCustomAutoFilter.isLessThanOrEqualTo)){
                    items[isPivot && !isValueFilter ? 13 : 6].setChecked(true, true); // between filter
                    isCustomConditions = false;
                } else if (isPivot && (cond1 == Asc.c_oAscCustomAutoFilter.isLessThan && cond2 == Asc.c_oAscCustomAutoFilter.isGreaterThan)) {
                    items[!isValueFilter ? 14 : 7].setChecked(true, true); // not between filter
                    isCustomConditions = false;
                }
                if (isCustomConditions)
                    items[items.length-1].setChecked(true, true);
            } else if (this.initialFilterType === Asc.c_oAscAutoFilterTypes.ColorFilter) {
                var colorFilter = filterObj.asc_getFilter(),
                    filterColor = colorFilter.asc_getCColor();
                if (filterColor)
                    filterColor = Common.Utils.ThemeColor.getHexColor(filterColor.get_r(), filterColor.get_g(), filterColor.get_b()).toLocaleUpperCase();
                if ( colorFilter.asc_getCellColor()===null ) { // cell color
                    this.miFilterCellColor.setChecked(true, true);
                    this.mnuFilterColorCellsPicker.select((filterColor) ? filterColor : 'transparent', true);
                } else if (colorFilter.asc_getCellColor()===false) { // font color
                    this.miFilterFontColor.setChecked(true, true);
                    this.mnuFilterColorFontPicker.select((filterColor) ? filterColor : '000000', true);
                }
            } else if (isDynamicFilter || isTop10) {
                var dynType = (isDynamicFilter) ? filterObj.asc_getFilter().asc_getType() : null,
                    items = isPivot ? this.miValueFilter.menu.items : this.miNumFilter.menu.items;
                items.forEach(function(item){
                    item.setChecked(isDynamicFilter && (item.options.type == Asc.c_oAscAutoFilterTypes.DynamicFilter) && (item.value == dynType) ||
                                    isTop10 && (item.options.type == Asc.c_oAscAutoFilterTypes.Top10), true);
                });
            }

            this.miClear.setDisabled(this.initialFilterType === Asc.c_oAscAutoFilterTypes.None);
            this.miReapply.setDisabled(this.initialFilterType === Asc.c_oAscAutoFilterTypes.None);
            this.btnOk.setDisabled(this.initialFilterType !== Asc.c_oAscAutoFilterTypes.Filters && this.initialFilterType !== Asc.c_oAscAutoFilterTypes.None);

            this.menuPanelWidth = menuPanel.innerWidth();
            var width = this.getWidth();
            if (width-this.menuPanelWidth<260) {
                width = Math.ceil(this.menuPanelWidth + 260);
                this.setResizable(true, [width, this.initConfig.minheight]);
            }
            if (Common.Utils.InternalSettings.get('sse-settings-size-filter-window')) {
                width = Common.Utils.InternalSettings.get('sse-settings-size-filter-window')[0] + this.menuPanelWidth;
            }
            if (isPivot && pivotObj.asc_getIsPageFilter()) {
                this.setResizable(true, [this.initConfig.minwidth - this.menuPanelWidth, this.initConfig.minheight]);
                menuPanel.addClass('hidden');
                width -= this.menuPanelWidth;
                this.menuPanelWidth = 0;
            }
            this.setSize(width, this.getHeight());
        },

        setupDataCells: function() {
            function isNumeric(value) {
                return !isNaN(parseFloat(value)) && isFinite(value);
            }

            var me = this,
                isnumber, value, count,
                index = 0, throughIndex = 2,
                applyfilter = true,
                selectAllState = false,
                selectedCells = 0,
                arr = [], arrEx = [],
                idxs = (me.filter) ? me.filteredIndexes : me.throughIndexes;

            this.configTo.asc_getValues().forEach(function (item) {
                value       = item.asc_getText();
                isnumber    = isNumeric(value);
                applyfilter = true;
                count = item.asc_getRepeats ? item.asc_getRepeats() : undefined;

                if (me.filter) {
                    if (null === value.match(me.filter)) {
                        applyfilter = false;
                    }
                    idxs[throughIndex] = applyfilter;
                } else if (idxs[throughIndex]==undefined)
                    idxs[throughIndex] = item.asc_getVisible();

                if (applyfilter) {
                    arr.push(new Common.UI.DataViewModel({
                        id              : ++index,
                        selected        : false,
                        allowSelected   : true,
                        cellvalue       : value,
                        value           : isnumber ? value : (value.length > 0 ? value: me.textEmptyItem),
                        intval          : isnumber ? parseFloat(value) : undefined,
                        strval          : !isnumber ? value : '',
                        groupid         : '1',
                        check           : idxs[throughIndex],
                        throughIndex    : throughIndex,
                        count: count ? count.toString() : ''
                    }));
                    if (idxs[throughIndex]) selectedCells++;
                } else {
                    arrEx.push(new Common.UI.DataViewModel({
                        cellvalue       : value
                    }));
                }

                ++throughIndex;
            });

            if (selectedCells==arr.length) selectAllState = true;
            else if (selectedCells>0) selectAllState = 'indeterminate';

            if (me.filter || idxs[0]==undefined)
                idxs[0] = true;
            if (!me.filter || arr.length>0)
                arr.unshift(new Common.UI.DataViewModel({
                    id              : ++index,
                    selected        : false,
                    allowSelected   : true,
                    value           : (me.filter) ? this.textSelectAllResults : this.textSelectAll,
                    groupid         : '0',
                    check           : idxs[0],
                    throughIndex    : 0
                }));
            if (me.filter && arr.length>1) {
                if (idxs[1]==undefined)
                    idxs[1] = false;
                arr.splice(1, 0, new Common.UI.DataViewModel({
                    id              : ++index,
                    selected        : false,
                    allowSelected   : true,
                    value           : this.textAddSelection,
                    groupid         : '2',
                    check           : idxs[1],
                    throughIndex    : 1
                }));
            }

            this.cells.reset(arr);
            this.filterExcludeCells.reset(arrEx);

            if (this.cells.length) {
                this.checkCellTrigerBlock = true;
                this.cells.at(0).set('check', selectAllState);
                this.checkCellTrigerBlock = undefined;
            }
            this.btnOk.setDisabled(this.cells.length<1);
            this.cellsList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true, suppressScrollX: true});
            this.cellsList.cmpEl.toggleClass('scroll-padding', this.cellsList.scroller.isVisible());
        },

        testFilter: function () {
            var me = this, isValid= false;

            if (this.cells) {
                if (this.filter && this.filteredIndexes[1])
                    isValid = true;
                else
                    this.cells.forEach(function(item){
                        if ('1' == item.get('groupid') && item.get('check')) {
                            isValid = true;
                            return true;
                        }
                    });
            }

            if (!isValid) {
                me._skipCheckDocumentClick = true;
                Common.UI.warning({title: this.textWarning,
                    msg: this.warnNoSelected,
                    callback: function() {
                        me._skipCheckDocumentClick = false;
                        _.delay(function () {
                            me.input.focus();
                        }, 100, this);
                    }
                });
            }

            return isValid;
        },
        save: function () {
            if (this.api && this.configTo && this.cells && this.filterExcludeCells) {
                var arr = this.configTo.asc_getValues(),
                    isValid = false;
                if (this.filter && this.filteredIndexes[1]) {
                    if (this.initialFilterType === Asc.c_oAscAutoFilterTypes.CustomFilters) {
                        arr.forEach(function(item, index) {
                            item.asc_setVisible(true);
                        });
                    }
                    this.cells.each(function(cell) {
                        if ('1' == cell.get('groupid')) {
                            arr[parseInt(cell.get('throughIndex'))-2].asc_setVisible(cell.get('check'));
                        }
                    });
                    arr.forEach(function(item, index) {
                        if (item.asc_getVisible()) {
                            isValid = true;
                            return true;
                        }
                    });
                } else {
                    var idxs = (this.filter) ? this.filteredIndexes : this.throughIndexes;
                    arr.forEach(function(item, index) {
                        item.asc_setVisible(idxs[index+2]);
                    });
                    isValid = true;
                }
                if (isValid) {
                    var pivotObj = this.configTo.asc_getPivotObj();
                    if (pivotObj && pivotObj.asc_getIsPageFilter())
                        pivotObj.asc_setIsMultipleItemSelectionAllowed(true);
                    this.configTo.asc_getFilterObj().asc_setType(Asc.c_oAscAutoFilterTypes.Filters);
                    this.api.asc_applyAutoFilter(this.configTo);
                }
            }
        },

        onPrimary: function() {
            this.save();
            this.close();
            return false;
        },

        onWindowResize: function (args) {
            if (args && args[1]=='start')
                this.curSize = {resize: false, height: this.getSize()[1]};
            else if (this.curSize.resize) {
                var size = this.getSize();
                this.$window.find('.combo-values').css({'height': size[1] - 100 + 'px'});
                this.cellsList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true, suppressScrollX: true});
            }
        },

        onWindowResizing: function () {
            if (!this.curSize) return;

            var size = this.getSize();
            if (size[1] !== this.curSize.height) {
                if (!this.curSize.resize) {
                    this.curSize.resize = true;
                    this.cellsList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: false, suppressScrollX: true});
                }
                this.$window.find('.combo-values').css({'height': size[1] - 100 + 'px'});
                this.curSize.height = size[1];
            }
            size[0] -= this.menuPanelWidth;
            Common.Utils.InternalSettings.set('sse-settings-size-filter-window', size);
        },

        onItemChanged: function (view, record) {
            var state = record.model.get('check');
            if ( state == 'indeterminate' )
                $('input[type=checkbox]', record.$el).prop('indeterminate', true);
            else $('input[type=checkbox]', record.$el).prop({checked: state, indeterminate: false});
        },

        btnCustomFilter     : 'Custom Filter',
        textSelectAll       : 'Select All',
        txtTitle            : 'Filter',
        warnNoSelected      : 'You must choose at least one value',
        textWarning         : 'Warning',
        textEmptyItem       : '{Blanks}',
        txtEmpty            : 'Enter cell\'s filter',
        txtSortLow2High     : 'Sort Lowest to Highest',
        txtSortHigh2Low     : 'Sort Highest to Lowest',
        txtSortCellColor    : 'Sort by cells color',
        txtSortFontColor    : 'Sort by font color',
        txtNumFilter        : 'Number filter',
        txtTextFilter       : 'Text filter',
        txtFilterCellColor  : 'Filter by cells color',
        txtFilterFontColor  : 'Filter by font color',
        txtClear            : 'Clear',
        txtReapply          : 'Reapply',
        txtEquals           : "Equals...",
        txtNotEquals        : "Does not equal...",
        txtGreater          : "Greater than...",
        txtGreaterEquals    : "Greater than or equal to...",
        txtLess             : "Less than...",
        txtLessEquals       : "Less than or equal to...",
        txtBetween          : 'Between...',
        txtTop10            : 'Top 10',
        txtAboveAve         : 'Above average',
        txtBelowAve         : 'Below average',
        txtBegins           : "Begins with...",
        txtNotBegins        : "Does not begin with...",
        txtEnds             : "Ends with...",
        txtNotEnds          : "Does not end with...",
        txtContains         : "Contains...",
        txtNotContains      : "Does not contain...",
        textSelectAllResults: 'Select All Search Results',
        textAddSelection    : 'Add current selection to filter',
        txtValueFilter: 'Value filter',
        txtLabelFilter: 'Label filter',
        warnFilterError: 'You need at least one field in the Values area in order to apply a value filter.',
        txtNotBetween: 'Not between...',
        txtSortOption: 'More sort options...'

    }, SSE.Views.AutoFilterDialog || {}));
});