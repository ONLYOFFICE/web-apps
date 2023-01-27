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
 *  CustomColumnsDialog.js
 *
 *  Created by Julia Radzhabova on 6/23/17
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/CheckBox'
], function () { 'use strict';

    DE.Views.CustomColumnsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 300,
            header: true,
            style: 'min-width: 216px;',
            cls: 'modal-dlg',
            id: 'window-custom-columns',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 203px;">',
                    '<div class="input-row" style="margin-bottom: 10px;">',
                        '<label class="input-label">' + this.textColumns + '</label><div id="custom-columns-spin-num" style="float: right;"></div>',
                    '</div>',
                    '<label class="input-label" style="width:27px; margin-left:6px;">#</label>',
                    '<label class="input-label" style="width:114px;">' + this.textWidth + '</label>',
                    '<label class="input-label" style="width:105px;">' + this.textSpacing + '</label>',
                    '<div id="custom-columns-list" style="width:100%; height: 91px;"></div>',
                    '<div class="input-row" style="margin: 10px 0;">',
                        '<div id="custom-columns-equal-width"></div>',
                    '</div>',
                    '<div class="input-row">',
                        '<div id="custom-columns-separator"></div>',
                    '</div>',
                '</div>',
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            this.totalWidth = 558.7;
            this.minWidthCol = 10;      //Minimum column width in mm
            this._noApply = false;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this;
            this.spnColumns = new Common.UI.MetricSpinner({
                el: $('#custom-columns-spin-num'),
                step: 1,
                allowDecimal: false,
                width: 45,
                defaultUnit : "",
                value: 1,
                maxValue: 30,
                minValue: 1,
                maskExp: /[0-9]/
            });
            this.spnColumns.on('change', function(field, newValue, oldValue, eOpts){
                var num = parseInt(newValue);

                if(me.columnsList.store.length > 0) {
                    if(num == me.columnsList.store.length) return;

                    var spacing = me.columnsList.store.at(0).get('spacing'),
                        calcWidth = me.calcWidthForEqualColumns(num, spacing),
                        arrColumnObj = [];
    
                    for(var i = 0; i < num; i++) {
                        arrColumnObj.push({
                            width: calcWidth,
                            spacing: spacing,
                        });
                    }     

                    me.updateColumnsList(arrColumnObj);
                }

                me.chEqualWidth.setDisabled(num<2);
                me.chSeparator.setDisabled(num<2);
            });

            this.columnsList = new Common.UI.ListView({
                el: $('#custom-columns-list', this.$window),
                store: new Common.UI.DataViewStore(),
                showLast: false,
                handleSelect: false,
                tabindex: 1,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div id="custom-columns-list-item-<%= index %>" class="list-item" style="display:flex; align-items:center; width=100%;">',
                        '<label class="level-caption" style="padding-right:5px; flex-shrink:0; width:20px;"><%= index + 1 %></label>',
                        '<div style="display:inline-block;flex-grow: 1;">',
                                '<div style="padding: 0 5px;display: inline-block;vertical-align: top;"><div id="custom-columns-list-item-spin-width-<%= index %>" class="input-group-nr" style=""></div></div>',
                                '<div style="padding: 0 5px;display: inline-block;vertical-align: top;"><div id="custom-columns-list-item-spin-spacing-<%= index %>" class="input-group-nr"></div></div>',
                        '</div>',
                    '</div>'
                ].join(''))
            });

            this.columnsList.on('item:add', _.bind(this.addControls, this));

            this.chEqualWidth = new Common.UI.CheckBox({
                el: $('#custom-columns-equal-width'),
                labelText: this.textEqualWidth
            }).on('change', function(item, newValue, oldValue) {
                me.lockSpinsForEqualColumns(newValue == 'checked');
                if(newValue == 'checked') {
                    me.setEqualWidthColumns();
                }
                else {
                    me.columnsList.store.each(function(col) {
                        me.setMaxValueSpinsForColumn(col);
                    });
                }
            });

            this.chSeparator = new Common.UI.CheckBox({
                el: $('#custom-columns-separator'),
                labelText: this.textSeparator
            });

            this.getChild().find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [this.spnColumns, this.chEqualWidth, this.chSeparator];
        },

        getDefaultFocusableComponent: function () {
            return this.spnColumns;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        setSettings: function (props) {
            if (props) {
                var equal = props.get_EqualWidth(),
                    num = (equal) ? props.get_Num() : props.get_ColsCount(),
                    total = props.get_TotalWidth(),
                    arrColumnObj = [];

                this.totalWidth = total;
                this.spnColumns.setValue(num);

                for(var i = 0; i < num; i++) {
                    if(!equal) {
                        var currentCol = props.get_Col(i);
                        arrColumnObj.push({
                            width: currentCol.get_W(),
                            spacing: currentCol.get_Space(),
                        });

                        if(currentCol.get_W() < this.minWidthCol)
                            this.minWidthCol = currentCol.get_W();
                    }
                    else {
                        var calcWidth = this.calcWidthForEqualColumns(num, props.get_Space());
                        arrColumnObj.push({
                            width: calcWidth,
                            spacing: props.get_Space(),
                        });
                    }  
                }                

                this.chEqualWidth.setValue(equal);
                this.chEqualWidth.setDisabled(num<2);
                this.chSeparator.setValue(props.get_Sep());
                this.chSeparator.setDisabled(num<2);
                
                this.updateColumnsList(arrColumnObj);
            }
        },

        getSettings: function() {
            var props = new Asc.CDocumentColumnsProps();

            props.put_Num(this.spnColumns.getNumberValue());
            props.put_Space(this.columnsList.store.at(0).get('spacing'));
            props.put_EqualWidth(this.chEqualWidth.getValue()=='checked');
            props.put_Sep(this.chSeparator.getValue()=='checked');

            if(this.chEqualWidth.getValue() != 'checked') {
                this.columnsList.store.each(function(col, index) {
                    props.put_ColByValue(index, col.get('width'), col.get('spacing'));
                });
            }
            return props;
        },

        updateColumnsList: function(arrColumnObj) {
            var me = this,
                arrItems = arrColumnObj.map(function(item, itemIndex) {
                    return {
                        index: itemIndex,
                        allowSelected: false,
                        width: item.width,
                        spacing: (itemIndex != arrColumnObj.length - 1 ? item.spacing : 0),
                        widthSpin: null,
                        spacingSpin: null,
                    };
                });

            this.columnsList.store.reset(arrItems);
            this.columnsList.store.each(function(item, index) {
                me.setMaxValueSpinsForColumn(item);
            });
            this.setMaxColumns();
        },

        setMaxColumns: function() {
            var spacing = this.columnsList.store.at(0).get('spacing'),
                maxColumns = Math.floor((this.totalWidth + spacing) / (spacing + this.minWidthCol));

            if(this.spnColumns.getNumberValue() > maxColumns)
                maxColumns = this.spnColumns.getNumberValue();
            this.spnColumns.setMaxValue(maxColumns);
        },

        lockSpinsForEqualColumns: function(bool) {
            var num = this.columnsList.store.length; 
            this.columnsList.store.each(function(col, index) {
                col.get('widthSpin').setDisabled(bool);
                col.get('spacingSpin').setDisabled(index != 0 && bool || index == num-1);
            });
        },

        calcWidthForEqualColumns: function(num, spacing) {
            return (this.totalWidth - (num - 1) * spacing ) / num;
        },

        setEqualWidthColumns: function () {
            if(this.columnsList.store.length == 0) return;

            var me = this,
                num = this.spnColumns.getNumberValue(),
                spacing = this.columnsList.store.at(0).get('spacing'),
                width = this.calcWidthForEqualColumns(num, spacing);
            
            if(width < this.minWidthCol) {
                width = this.minWidthCol + 0.0001;
                spacing = (this.totalWidth - (num * width)) / (num - 1);
            }

            this.columnsList.store.each(function(col, index) {
                me.setWidthColumnValue(col, width);
                me.setMaxValueSpinsForColumn(col);
                if(index != num - 1) {
                    me.setSpacingColumnValue(col, spacing);
                }
            });
        },

        setWidthColumnValue: function(item, value) {
            var widthSpin = item.get('widthSpin'),
                valueInUserMetric = Common.Utils.Metric.fnRecalcFromMM(value);

            item.set('width', value, {silent: true});
            if(widthSpin.getMaxValue() < valueInUserMetric) {
                widthSpin.setMaxValue(this.decimalRouding(valueInUserMetric))
            }
            widthSpin.setValue(valueInUserMetric, true);
        },

        setSpacingColumnValue: function(item, value) {
            item.set('spacing', value, {silent: true});
            item.get('spacingSpin').setValue(Common.Utils.Metric.fnRecalcFromMM(value), true);
            if(item.get('index') == 0)
                this.setMaxColumns();
        },

        setMaxValueSpinsForColumn: function(item) {
            var itemIndex = item.get('index');

            if(this.chEqualWidth.getValue() == 'checked') {
                var num = this.columnsList.store.length,
                    width = this.minWidthCol,
                    maxSpacing = Common.Utils.Metric.fnRecalcFromMM((this.totalWidth - (num * width)) / (num - 1));

                item.get('widthSpin').setMaxValue(1000);                
                item.get('spacingSpin').setMaxValue(this.decimalRouding(maxSpacing));
            }
            else {
                var nextItem = this.columnsList.store.at(itemIndex != this.columnsList.store.length - 1 ? itemIndex + 1 : 0);    
                if(nextItem.get('widthSpin') && nextItem.get('spacingSpin')) {
                    var spinWidthNextItem = nextItem.get('widthSpin'),
                        maxValSpacingSpin = spinWidthNextItem.getNumberValue() + item.get('spacingSpin').getNumberValue() - Common.Utils.Metric.fnRecalcFromMM(this.minWidthCol),
                        maxValWidthSpin = spinWidthNextItem.getNumberValue() + item.get('widthSpin').getNumberValue() - Common.Utils.Metric.fnRecalcFromMM(this.minWidthCol);
    
                    item.get('spacingSpin').setMaxValue(this.decimalRouding(maxValSpacingSpin));
                    item.get('widthSpin').setMaxValue(this.decimalRouding(maxValWidthSpin));
                }
            }
        },

        decimalRouding: function (a) {
            var x = Math.pow(10, 2);
            return Math.round(a * x) / x;
        },

        addControls: function(listView, itemView, item) {
            if (!item) return;

            var me = this,
                index = item.get('index'),
                isLastItem = index === me.columnsList.store.length - 1,
                isEqualWidth = me.chEqualWidth.getValue() == 'checked',
                metricName = Common.Utils.Metric.getCurrentMetricName();

            var spinWidth = new Common.UI.MetricSpinner({
                el: $('#custom-columns-list-item-spin-width-' + index),
                step: Common.Utils.Metric.getCurrentMetric() == Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1,
                width: 105,
                tabindex: 1,
                defaultUnit : metricName,
                value: me.decimalRouding(Common.Utils.Metric.fnRecalcFromMM(item.get('width'))) + ' ' + metricName,
                maxValue: 120,
                minValue: me.decimalRouding(Common.Utils.Metric.fnRecalcFromMM(me.minWidthCol)),
                disabled: isEqualWidth || (index == 0 && isLastItem),
            }).on('change', function(field, newValue, oldValue, eOpts) {
                var difference = Common.Utils.Metric.fnRecalcToMM(parseFloat(newValue) - Common.Utils.Metric.fnRecalcFromMM(item.get('width')).toFixed(2)),
                    nextItem = me.columnsList.store.at(isLastItem ? 0 : index + 1),
                    previosItem = me.columnsList.store.at(index == 0 ? me.columnsList.store.length - 1 : index - 1),
                    newWidthNextItem = nextItem.get('width') - difference;

                me.setWidthColumnValue(nextItem, newWidthNextItem);
                item.set('width', item.get('width') + difference, {silent: true});

                me.setMaxValueSpinsForColumn(previosItem);
                me.setMaxValueSpinsForColumn(item);
                me.setMaxValueSpinsForColumn(nextItem);
            });

            var spinSpacing = new Common.UI.MetricSpinner({
                el: $('#custom-columns-list-item-spin-spacing-' + index),
                step: Common.Utils.Metric.getCurrentMetric() == Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1,
                width: 105,
                tabindex: 1,
                defaultUnit : metricName,
                value: !isLastItem ? this.decimalRouding(Common.Utils.Metric.fnRecalcFromMM(item.get('spacing'))) + ' ' + metricName : '',
                maxValue: 120,
                minValue: 0,
                disabled: (isEqualWidth && index != 0) || isLastItem,
            }).on('change', function(field, newValue, oldValue, eOpts) {
                var difference = Common.Utils.Metric.fnRecalcToMM(parseFloat(newValue) - Common.Utils.Metric.fnRecalcFromMM(item.get('spacing')).toFixed(2));

                item.set('spacing', item.get('spacing') + difference, {silent: true});
                
                if(me.chEqualWidth.getValue() == 'checked') {
                    me.setEqualWidthColumns();
                }
                else if(!isLastItem) {
                    var nextItem = me.columnsList.store.at(index+1),
                        newWidthNextItem = nextItem.get('width') - difference;
                        
                    me.setWidthColumnValue(nextItem, newWidthNextItem);
                    me.setMaxValueSpinsForColumn(item);
                }

                if(index == 0)
                    me.setMaxColumns();
            });

            item.set('widthSpin', spinWidth, {silent: true});
            item.set('spacingSpin', spinSpacing, {silent: true});
        },

        textTitle: 'Columns',
        textColumns: 'Number of columns',
        textWidth: 'Width',
        textSpacing: 'Spacing',
        textEqualWidth: 'Equal column width',
        textSeparator: 'Column divider'
    }, DE.Views.CustomColumnsDialog || {}))
});