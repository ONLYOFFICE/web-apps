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
 *
 *  FormatRulesEditDlg.js
 *
 *  Created by Julia.Radzhabova on 15.04.20
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *  
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/InputField'
], function () {
    'use strict';

    SSE.Views = SSE.Views || {};

    SSE.Views.FormatRulesEditDlg =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'FormatRulesEditDlg',
            contentWidth: 490,
            height: 445
        },

        initialize: function (options) {
            var me = this;
            
            _.extend(this.options, {
                title: this.txtTitleNew,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                        '<div class="content-panel" style="padding: 0;"><div class="inner-content">',
                            '<div class="settings-panel active">',
                                '<table cols="1" style="width: 100%;">',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<div style="width:150px; display: inline-block; margin-right: 10px;vertical-align: top;">',
                                                '<label class="header">', me.textRule,'</label>',
                                                '<div id="format-rules-edit-combo-category" class="input-group-nr"></div>',
                                            '</div>',
                                            // '<div style="width:150px; display: inline-block; margin-right: 10px;">',
                                            //     '<label class="header">', me.textApply,'</label>',
                                            //     '<div id="format-rules-edit-txt-scope" style="height: 22px;"></div>',
                                            // '</div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr class="hasformat">',
                                        '<td class="padding-large">',
                                            '<div id="format-rules-edit-combo-rule" class="input-group-nr" style="display: inline-block;vertical-align: top;margin-right: 10px;"></div>',
                                            '<div id="format-rules-edit-txt-r1" class="input-row" style="display: inline-block;vertical-align: top;margin-right: 10px;"></div>',
                                            '<div id="format-rules-edit-txt-r2" class="input-row" style="display: inline-block;vertical-align: top;"></div>',
                                            '<div id="format-rules-edit-spin-rank" class="input-row" style="display: inline-block;vertical-align: top;margin-right: 10px;"></div>',
                                            '<div id="format-rules-edit-combo-percent" class="input-row" style="display: inline-block;vertical-align: top;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr class="hasformat">',
                                        '<td class="padding-small">',
                                            '<label class="header">', me.textFormat,'</label>',
                                            '<div>',
                                                '<div id="format-rules-format-preset" class="input-group-nr" style="display: inline-block;vertical-align: top;"></div>',
                                                '<div id="format-rules-bold" style="display: inline-block;margin-left: 5px;"></div>','<div id="format-rules-italic" style="display: inline-block;margin-left: 5px;"></div>',
                                                '<div id="format-rules-underline" style="display: inline-block;margin-left: 5px;"></div>','<div id="format-rules-strikeout" style="display: inline-block;margin-left: 5px;"></div>',
                                                '<div id="format-rules-subscript" style="display: inline-block;margin-left: 5px;"></div>','<div id="format-rules-superscript" style="display: inline-block;margin-left: 5px;"></div>',
                                                '<div id="format-rules-fontcolor" style="display: inline-block;margin-left: 5px;"></div>','<div id="format-rules-fillcolor" style="display: inline-block;margin-left: 5px;"></div>',
                                            '</div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr class="scale">',
                                        '<td class="padding-large" style="padding-top: 8px;">',
                                            '<div style="width:150px; display: inline-block; margin-right: 10px;vertical-align: top;">',
                                                '<label style="display: block;">', me.textMinpoint,'</label>',
                                                '<div id="format-rules-edit-combo-scale-1" class="input-group-nr" style="margin-bottom: 8px;"></div>',
                                                '<div id="format-rules-edit-txt-scale-1" class="" style="height: 22px;margin-bottom: 8px;"></div>',
                                                '<div id="format-rules-edit-color-scale-1" style=""></div>',
                                            '</div>',
                                            '<div style="width:150px; display: inline-block; margin-right: 10px;">',
                                                '<label id="format-rules-edit-lbl-scale-2" style="display: block;">', me.textMidpoint,'</label>',
                                                '<div id="format-rules-edit-combo-scale-2" class="input-group-nr" style="margin-bottom: 8px;"></div>',
                                                '<div id="format-rules-edit-txt-scale-2" class="" style="height: 22px;margin-bottom: 8px;"></div>',
                                                '<div id="format-rules-edit-color-scale-2" style=""></div>',
                                            '</div>',
                                            '<div style="width:150px; display: inline-block;">',
                                                '<label style="display: block;">', me.textMaxpoint,'</label>',
                                                '<div id="format-rules-edit-combo-scale-3" class="input-group-nr" style="margin-bottom: 8px;"></div>',
                                                '<div id="format-rules-edit-txt-scale-3" class="" style="height: 22px;margin-bottom: 8px;"></div>',
                                                '<div id="format-rules-edit-color-scale-3" style=""></div>',
                                            '</div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr class="databar">',
                                        '<td class="padding-large" style="padding-top: 8px;">',
                                            '<div style="width:150px; display: inline-block; margin-right: 10px;vertical-align: top;">',
                                                '<label style="display: block;">', me.textMinimum,'</label>',
                                                '<div id="format-rules-edit-combo-bar-1" class="input-group-nr" style="margin-bottom: 8px;"></div>',
                                                '<div id="format-rules-edit-txt-bar-1" class="" style="height: 22px;"></div>',
                                            '</div>',
                                            '<div style="width:150px; display: inline-block;">',
                                                '<label style="display: block;">', me.textMaximum,'</label>',
                                                '<div id="format-rules-edit-combo-bar-2" class="input-group-nr" style="margin-bottom: 8px;"></div>',
                                                '<div id="format-rules-edit-txt-bar-2" class="" style="height: 22px;"></div>',
                                            '</div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr class="databar">',
                                        '<td class="" style="padding-bottom: 4px;">',
                                            '<label class="header">', me.textAppearance,'</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr class="databar">',
                                        '<td class="padding-large" style="">',
                                            '<div style="width:150px; display: inline-block; margin-right: 10px;vertical-align: top;">',
                                                '<label style="display: block;">', 'Fill','</label>',
                                                '<div id="format-rules-edit-combo-fill" class="input-group-nr" style="margin-bottom: 8px;"></div>',
                                                '<div style="width: 100%;margin-bottom: 4px;height: 23px;">',
                                                    '<label style="margin-top: 4px;">', 'Positive','</label>',
                                                    '<div id="format-rules-edit-color-pos-fill" style="float: right;"></div>',
                                                '</div>',
                                                '<div style="width: 100%;margin-bottom: 8px;height: 23px;">',
                                                    '<label style="margin-top: 4px;">', 'Negative','</label>',
                                                    '<div id="format-rules-edit-color-neg-fill" style="float: right;"></div>',
                                                '</div>',
                                                '<div id="format-rules-edit-chk-fill" style=""></div>',
                                            '</div>',
                                            '<div style="width:150px; display: inline-block; margin-right: 10px;vertical-align: top;">',
                                                '<label style="display: block;">', 'Border','</label>',
                                                '<div id="format-rules-edit-combo-border" class="input-group-nr" style="margin-bottom: 8px;"></div>',
                                                '<div style="width: 100%;margin-bottom: 4px;height: 23px;">',
                                                    '<label style="margin-top: 4px;">', 'Positive','</label>',
                                                    '<div id="format-rules-edit-color-pos-border" style="float: right;"></div>',
                                                '</div>',
                                                '<div style="width: 100%;margin-bottom: 8px;height: 23px;">',
                                                    '<label style="margin-top: 4px;">', 'Negative','</label>',
                                                    '<div id="format-rules-edit-color-neg-border" style="float: right;"></div>',
                                                '</div>',
                                                '<div id="format-rules-edit-chk-border" style=""></div>',
                                            '</div>',
                                            '<div style="width:150px; display: inline-block;vertical-align: top;">',
                                                '<label style="display: block;">', 'Bar Direction','</label>',
                                                '<div id="format-rules-edit-combo-direction" class="input-group-nr" style="margin-bottom: 8px;"></div>',
                                                '<div id="format-rules-edit-chk-show-bar" style="margin-top: 12px;"></div>',
                                            '</div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr class="databar">',
                                        '<td class="" style="padding-bottom: 4px;">',
                                            '<label class="header">', 'Axis','</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr class="databar">',
                                        '<td class="padding-large" style="">',
                                            '<label style="margin-right: 10px;margin-top: 1px;vertical-align: middle;">', 'Position','</label>',
                                            '<div id="format-rules-edit-combo-axis-pos" class="input-group-nr" style="margin-right: 10px;display: inline-block;vertical-align: middle;"></div>',
                                            '<div id="format-rules-edit-color-axis-color" style="display: inline-block;vertical-align: middle;"></div>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            '</div></div>',
                        '</div>',
                    '</div>',
                    '<div class="separator horizontal"></div>'
                ].join('')
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.isEdit     = options.isEdit || false;
            this.props      = options.props;
            this.type       = options.type; // rule category
            this.subtype    = options.subtype; // rule

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            var rules = [
                {
                    name: this.textValue,
                    type: Asc.c_oAscCFType.cellIs,
                    rules: [
                        { name: this.textGreater, subtype: Asc.c_oAscCFOperator.greaterThan},
                        { name: this.textGreaterEq, subtype: Asc.c_oAscCFOperator.greaterThanOrEqual},
                        { name: this.textLess, subtype: Asc.c_oAscCFOperator.lessThan},
                        { name: this.textLessEq, subtype: Asc.c_oAscCFOperator.lessThanOrEqual},
                        { name: this.textEqual, subtype: Asc.c_oAscCFOperator.equal},
                        { name: this.textNotEqual, subtype: Asc.c_oAscCFOperator.notEqual},
                        { name: this.textBetween, subtype: Asc.c_oAscCFOperator.between},
                        { name: this.textNotBetween, subtype: Asc.c_oAscCFOperator.notBetween}
                    ]
                },
                {
                    name: this.textRanked,
                    type: Asc.c_oAscCFType.top10,
                    rules: [
                        { name: this.textTop, subtype: 0},
                        { name: this.textBottom, subtype: 1}
                    ]
                },
                {
                    name: 'Average',
                    type: Asc.c_oAscCFType.aboveAverage,
                    rules: [
                        { name: 'Above', subtype: 0},
                        { name: 'Below', subtype: 1},
                        { name: 'Equal to or above', subtype: 2},
                        { name: 'Equal to or below', subtype: 3},
                        { name: '1 std dev above', subtype: 4},
                        { name: '1 std dev below', subtype: 5},
                        { name: '2 std dev above', subtype: 6},
                        { name: '2 std dev below', subtype: 7},
                        { name: '3 std dev above', subtype: 8},
                        { name: '3 std dev below', subtype: 9}
                    ]
                },
                {
                    name: 'Text',
                    type: Asc.c_oAscCFType.containsText,
                    rules: [
                        { name: 'Contains',   type: Asc.c_oAscCFType.containsText },
                        { name: 'Does not contain',   type: Asc.c_oAscCFType.notContainsText },
                        { name: 'Begins with',   type: Asc.c_oAscCFType.beginsWith },
                        { name: 'Ends with',   type: Asc.c_oAscCFType.endsWith }
                    ]
                },
                {
                    name: 'Date',
                    type: Asc.c_oAscCFType.timePeriod,
                    rules: [
                        { name: 'Yesterday', subtype: Asc.c_oAscTimePeriod.yesterday},
                        { name: 'Today', subtype: Asc.c_oAscTimePeriod.today},
                        { name: 'Tomorrow', subtype: Asc.c_oAscTimePeriod.tomorrow},
                        { name: 'In the last 7 days', subtype: Asc.c_oAscTimePeriod.last7Days},
                        { name: 'Last week', subtype: Asc.c_oAscTimePeriod.lastWeek},
                        { name: 'This week', subtype: Asc.c_oAscTimePeriod.thisWeek},
                        { name: 'Next week', subtype: Asc.c_oAscTimePeriod.nextWeek},
                        { name: 'Last month', subtype: Asc.c_oAscTimePeriod.lastMonth},
                        { name: 'This month', subtype: Asc.c_oAscTimePeriod.thisMonth},
                        { name: 'Next month', subtype: Asc.c_oAscTimePeriod.nextMonth}
                    ]
                },
                {
                    name: 'Blank/Error',
                    type: Asc.c_oAscCFType.containsBlanks,
                    rules: [
                        { name: 'Contains blanks',   type: Asc.c_oAscCFType.containsBlanks },
                        { name: 'Does not contain blanks',   type: Asc.c_oAscCFType.notContainsBlanks },
                        { name: 'Contains errors',   type: Asc.c_oAscCFType.containsErrors },
                        { name: 'Does not contain errors',   type: Asc.c_oAscCFType.notContainsErrors }
                    ]
                },
                {
                    name: 'Duplicate/Unique',
                    type: Asc.c_oAscCFType.duplicateValues,
                    rules: [
                        { name: 'Duplicate',   type: Asc.c_oAscCFType.duplicateValues },
                        { name: 'Unique',   type: Asc.c_oAscCFType.uniqueValues }
                    ]
                },
                {
                    name: '2 Color scale',
                    type: Asc.c_oAscCFType.colorScale,
                    num: 2
                },
                {
                    name: '3 Color scale',
                    type: Asc.c_oAscCFType.colorScale,
                    num: 3
                },
                {
                    name: 'Data bar',
                    type: Asc.c_oAscCFType.dataBar
                },
                {
                    name: 'Icon sets',
                    type: Asc.c_oAscCFType.iconSet
                },
                {
                    name: 'Formula',
                    type: Asc.c_oAscCFType.expression
                }
            ];
            var arrrules = [],
                cmbData = [];
            _.each(rules, function(rule, index){
                var arr = [];

                rule.rules && _.each(rule.rules, function(item, idx){
                    arr.push({
                        name     : item.name,
                        type     : item.type,
                        subtype  : item.subtype,
                        allowSelected : true,
                        selected: false
                    });
                });
                var store = new Backbone.Collection(arr);
                arrrules.push({
                    name   : rule.name,
                    type   : rule.type,
                    rules  : store,
                    num    : rule.num,
                    index  : index
                });
                cmbData.push({value: index, displayValue: rule.name});
            });
            this.ruleStore = new Backbone.Collection(arrrules);

            // this.txtScope = new Common.UI.InputFieldBtn({
            //     el          : $('#format-rules-edit-txt-scope'),
            //     name        : 'range',
            //     style       : 'width: 150px;',
            //     allowBlank  : true,
            //     btnHint     : this.textSelectData,
            //     validateOnChange: false
            // });
            // this.txtScope.on('button:click', _.bind(this.onSelectData, this));

            this.cmbCategory = new Common.UI.ComboBox({
                el          : $('#format-rules-edit-combo-category'),
                style       : 'width: 150px;',
                menuStyle   : 'min-width: 100%;max-height: 211px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : cmbData
            }).on('selected', function(combo, record) {
                me.refreshRules(record.value);
            });

            this.cmbRule = new Common.UI.ComboBox({
                el          : $('#format-rules-edit-combo-rule'),
                style       : 'width: 150px;',
                menuStyle   : 'min-width: 100%;max-height: 211px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : []
            }).on('selected', function(combo, record) {
                me.setControls(me.cmbCategory.getValue(), record.value);
            });

            this.txtRange1 = new Common.UI.InputFieldBtn({
                el          : $('#format-rules-edit-txt-r1'),
                name        : 'range',
                style       : 'width: 150px;',
                allowBlank  : true,
                btnHint     : this.textSelectData,
                validateOnChange: false
            });
            this.txtRange1.on('button:click', _.bind(this.onSelectData, this));
            
            this.txtRange2 = new Common.UI.InputFieldBtn({
                el          : $('#format-rules-edit-txt-r2'),
                name        : 'range',
                style       : 'width: 150px;',
                allowBlank  : true,
                btnHint     : this.textSelectData,
                validateOnChange: false
            });
            this.txtRange2.on('button:click', _.bind(this.onSelectData, this));

            // top 10
            this.cmbPercent = new Common.UI.ComboBox({
                el          : $('#format-rules-edit-combo-percent'),
                style       : 'width: 100px;',
                menuStyle   : 'min-width: 100%;max-height: 211px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    {value: 0, displayValue: 'Item'},
                    {value: 1, displayValue: 'Percent'}
                ]
            }).on('selected', function(combo, record) {
                var percent = !!record.value;
                me.numRank.setMaxValue(percent ? 100 : 1000);
                me.numRank.setValue(me.numRank.getNumberValue());
            });
            this.cmbPercent.setValue(0);

            this.numRank = new Common.UI.MetricSpinner({
                el: $('#format-rules-edit-spin-rank'),
                step: 1,
                width: 100,
                defaultUnit : "",
                defaultValue : 10,
                allowDecimal: false,
                value: '10',
                maxValue: 1000,
                minValue: 1
            });
            this.numRank.on('change', _.bind(function(field, newValue, oldValue, eOpts){
            }, this));

            // Format
            var color_data = [
                {   value: 'ffeb9c', displayValue: 'absdef', color: '#ffeb9c', displayColor: '9c6500' },
                {   value: 'ffc7ce', displayValue: 'absdef', color: '#ffc7ce', displayColor: 'b32e35' },
                {   value: 'c6efce', displayValue: 'absdef', color: '#c6efce', displayColor: '2e8230' },
                {   value: 'ffcc99', displayValue: 'absdef', color: '#ffcc99', displayColor: '56507b' },
                {   value: -1, displayValue: this.textCustom, color: null }
            ];
            this.cmbFormats = new Common.UI.ComboBoxColor({
                el          : $('#format-rules-format-preset'),
                editable    : false,
                style       : 'width: 150px;',
                menuStyle   : 'min-width: 100%;max-height: 211px;',
                data        : color_data
            }).on('selected', function(combo, record) {
                // record.color;
            });
            this.cmbFormats.setValue(color_data[0].value);
            // this.cmbFormats.on('selected', _.bind(this.onFormatsSelect, this));

            this.btnBold = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-bold',
                enableToggle: true,
                hint: this.textBold
            });
            this.btnBold.render($('#format-rules-bold')) ;
            // this.btnBold.on('click', _.bind(this.onBoldClick, this));

            this.btnItalic = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-italic',
                enableToggle: true,
                hint: this.textItalic
            });
            this.btnItalic.render($('#format-rules-italic')) ;
            // this.btnItalic.on('click', _.bind(this.onItalicClick, this));

            this.btnUnderline = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-underline',
                enableToggle: true,
                hint: this.textUnderline
            });
            this.btnUnderline.render($('#format-rules-underline')) ;
            // this.btnUnderline.on('click', _.bind(this.onUnderlineClick, this));

            this.btnStrikeout = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-strikeout',
                enableToggle: true,
                hint: this.textStrikeout
            });
            this.btnStrikeout.render($('#format-rules-strikeout')) ;
            // this.btnStrikeout.on('click',_.bind(this.onStrikeoutClick, this));

            this.btnSuperscript = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-superscript',
                enableToggle: true,
                toggleGroup: 'superscriptFRGroup',
                hint: this.textSuperscript
            });
            this.btnSuperscript.render($('#format-rules-superscript')) ;
            // this.btnSuperscript.on('click', _.bind(this.onSuperscriptClick, this));

            this.btnSubscript = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-subscript',
                enableToggle: true,
                toggleGroup: 'superscriptFRGroup',
                hint: this.textSubscript
            });
            this.btnSubscript.render($('#format-rules-subscript')) ;
            // this.btnSubscript.on('click', _.bind(this.onSubscriptClick, this));

            var initNewColor = function(btn, picker_el) {
                if (btn && btn.cmpEl) {
                    btn.currentColor = '#000000';
                    var colorVal = $('<div class="btn-color-value-line"></div>');
                    $('button:first-child', btn.cmpEl).append(colorVal);
                    colorVal.css('background-color', btn.currentColor);
                    var picker = new Common.UI.ThemeColorPalette({
                        el: $(picker_el)
                    });
                    picker.currentColor = btn.currentColor;
                }
                btn.menu.cmpEl.on('click', picker_el+'-new', _.bind(function() {
                    picker.addNewColor((typeof(btn.color) == 'object') ? btn.color.color : btn.color);
                }, me));
                // picker.on('select', _.bind(me.onColorSelect, me, btn));
                return picker;
            };

            this.btnTextColor = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-fontcolor',
                hint        : this.textColor,
                split       : true,
                menu        : new Common.UI.Menu({
                    additionalAlign: this.menuAddAlign,
                    items: [
                        { template: _.template('<div id="format-rules-menu-fontcolor" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                        { template: _.template('<a id="format-rules-menu-fontcolor-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                    ]
                })
            });
            this.btnTextColor.render($('#format-rules-fontcolor'));
            // this.btnTextColor.on('click', _.bind(this.onTextColor, this));
            this.mnuTextColorPicker = initNewColor(this.btnTextColor, "#format-rules-menu-fontcolor");

            this.btnFillColor = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-paracolor',
                hint        : this.fillColor,
                split       : true,
                menu        : new Common.UI.Menu({
                    additionalAlign: this.menuAddAlign,
                    items: [
                        { template: _.template('<div id="format-rules-menu-fillcolor" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                        { template: _.template('<a id="format-rules-menu-fillcolor-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                    ]
                })
            });
            this.btnFillColor.render($('#format-rules-fillcolor'));
            // this.btnFillColor.on('click', _.bind(this.onTextColor, this));
            this.mnuFillColorPicker = initNewColor(this.btnFillColor, "#format-rules-menu-fillcolor");

            // Scale
            this.scaleControls = [];
            this.lblMidScale = this.$window.find('#format-rules-edit-lbl-scale-2');

            var data = [
                {value: Asc.c_oAscCfvoType.Number, displayValue: 'Number'},
                {value: Asc.c_oAscCfvoType.Percent, displayValue: 'Percentage'},
                {value: Asc.c_oAscCfvoType.Formula, displayValue: 'Formula'},
                {value: Asc.c_oAscCfvoType.Percentile, displayValue: 'Percentile'}
            ];
            for (var i=0; i<3; i++) {
                var arr = data;
                if (i==0)
                    arr = [{value: Asc.c_oAscCfvoType.Minimum, displayValue: this.textMinimum}].concat(arr);
                else if (i==2)
                    arr = [{value: Asc.c_oAscCfvoType.Maximum, displayValue: this.textMaximum}].concat(arr);
                var combo = new Common.UI.ComboBox({
                    el          : $('#format-rules-edit-combo-scale-' + (i+1)),
                    style       : 'width: 100%;',
                    menuStyle   : 'min-width: 100%;max-height: 211px;',
                    editable    : false,
                    cls         : 'input-group-nr',
                    data        : arr,
                    type        : i
                }).on('selected', function(combo, record) {
                    me.scaleControls[combo.options.type].range.setDisabled(record.value==Asc.c_oAscCfvoType.Minimum || record.value==Asc.c_oAscCfvoType.Maximum);
                });
                combo.setValue((i==1) ? Asc.c_oAscCfvoType.Percentile : arr[0].value);

                var range = new Common.UI.InputFieldBtn({
                    el          : $('#format-rules-edit-txt-scale-' + (i+1)),
                    name        : 'range',
                    style       : 'width: 100%;',
                    allowBlank  : true,
                    btnHint     : this.textSelectData,
                    validateOnChange: false,
                    type        : i,
                    disabled    : (i!=1)
                });
                range.setValue((i==1) ? 50 : '');
                range.on('button:click', _.bind(this.onSelectData, this));

                var color = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : true,
                    type        : i
                });
                color.render( $('#format-rules-edit-color-scale-' + (i+1)));
                color.setColor('000000');
                this.scaleControls.push({combo: combo, range: range, color: color});
            }

            // Data Bar
            this.barControls = [];

            for (var i=0; i<2; i++) {
                var arr = data;
                if (i==0) {
                    arr = [{value: Asc.c_oAscCfvoType.Minimum, displayValue: this.textMinimum}].concat(arr);
                    arr.push({value: Asc.c_oAscCfvoType.AutoMin, displayValue: 'Automatic'});
                } else {
                    arr = [{value: Asc.c_oAscCfvoType.Maximum, displayValue: this.textMaximum}].concat(arr);
                    arr.push({value: Asc.c_oAscCfvoType.AutoMax, displayValue: 'Automatic'});
                }
                var combo = new Common.UI.ComboBox({
                    el          : $('#format-rules-edit-combo-bar-' + (i+1)),
                    style       : 'width: 100%;',
                    menuStyle   : 'min-width: 100%;max-height: 211px;',
                    editable    : false,
                    cls         : 'input-group-nr',
                    data        : arr,
                    type        : i
                }).on('selected', function(combo, record) {
                    me.barControls[combo.options.type].range.setDisabled(record.value==Asc.c_oAscCfvoType.Minimum || record.value==Asc.c_oAscCfvoType.Maximum ||
                                                                         record.value==Asc.c_oAscCfvoType.AutoMin || record.value==Asc.c_oAscCfvoType.AutoMax);
                });
                combo.setValue(arr[1].value);

                var range = new Common.UI.InputFieldBtn({
                    el          : $('#format-rules-edit-txt-bar-' + (i+1)),
                    name        : 'range',
                    style       : 'width: 100%;',
                    allowBlank  : true,
                    btnHint     : this.textSelectData,
                    validateOnChange: false,
                    type        : i
                });
                range.setValue('');
                range.on('button:click', _.bind(this.onSelectData, this));
                this.barControls.push({combo: combo, range: range});
            }

            // Fill
            this.cmbFill = new Common.UI.ComboBox({
                el          : $('#format-rules-edit-combo-fill'),
                style       : 'width: 100%;',
                menuStyle   : 'min-width: 100%;max-height: 211px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    {value: false, displayValue: 'Solid'},
                    {value: true, displayValue: 'Gradient'}
                ]
            }).on('selected', function(combo, record) {
            });
            this.cmbFill.setValue(false);

            this.btnPosFill = new Common.UI.ColorButton({
                style: "width:45px;",
                menu        : true
            });
            this.btnPosFill.render( $('#format-rules-edit-color-pos-fill'));
            this.btnPosFill.setColor('000000');

            this.btnNegFill = new Common.UI.ColorButton({
                style: "width:45px;",
                menu        : true
            });
            this.btnNegFill.render( $('#format-rules-edit-color-neg-fill'));
            this.btnNegFill.setColor('000000');

            this.chFill = new Common.UI.CheckBox({
                el: $('#format-rules-edit-chk-fill'),
                labelText: 'Same as positive'
            });
            this.chFill.on('change', function(field, newValue, oldValue, eOpts){
                me.btnNegFill.setDisabled(field.getValue()=='checked');
            });

            // Border
            this.cmbBorder = new Common.UI.ComboBox({
                el          : $('#format-rules-edit-combo-border'),
                style       : 'width: 100%;',
                menuStyle   : 'min-width: 100%;max-height: 211px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    {value: false, displayValue: 'Solid'},
                    {value: true, displayValue: 'None'}
                ]
            }).on('selected', function(combo, record) {
                me.btnPosBorder.setDisabled(record.value);
                me.btnNegBorder.setDisabled(record.value || me.chBorder.getValue()=='checked');
                me.chBorder.setDisabled(record.value);
            });
            this.cmbBorder.setValue(false);

            this.btnPosBorder = new Common.UI.ColorButton({
                style: "width:45px;",
                menu        : true
            });
            this.btnPosBorder.render( $('#format-rules-edit-color-pos-border'));
            this.btnPosBorder.setColor('000000');

            this.btnNegBorder = new Common.UI.ColorButton({
                style: "width:45px;",
                menu        : true
            });
            this.btnNegBorder.render( $('#format-rules-edit-color-neg-border'));
            this.btnNegBorder.setColor('000000');

            this.chBorder = new Common.UI.CheckBox({
                el: $('#format-rules-edit-chk-border'),
                labelText: 'Same as positive'
            });
            this.chBorder.on('change', function(field, newValue, oldValue, eOpts){
                me.btnNegBorder.setDisabled(field.getValue()=='checked');
            });

            // Axis
            this.cmbBarDirection = new Common.UI.ComboBox({
                el          : $('#format-rules-edit-combo-direction'),
                style       : 'width: 100%;',
                menuStyle   : 'min-width: 100%;max-height: 211px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    {value: Asc.c_oAscDataBarDirection.context, displayValue: 'Context'},
                    {value: Asc.c_oAscDataBarDirection.leftToRight, displayValue: 'Left to right'},
                    {value: Asc.c_oAscDataBarDirection.rightToLeft, displayValue: 'Right to left'}
                ]
            }).on('selected', function(combo, record) {
            });
            this.cmbBarDirection.setValue(Asc.c_oAscDataBarDirection.context);

            this.chShowBar = new Common.UI.CheckBox({
                el: $('#format-rules-edit-chk-show-bar'),
                labelText: 'Show bar only'
            });
            // this.chShowBar.on('change', _.bind(this.onShowBarChange, this));

            this.cmbAxisPos = new Common.UI.ComboBox({
                el          : $('#format-rules-edit-combo-axis-pos'),
                style       : 'width: 150px;',
                menuStyle   : 'min-width: 100%;max-height: 211px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    {value: Asc.c_oAscDataBarAxisPosition.automatic, displayValue: 'Automatic'},
                    {value: Asc.c_oAscDataBarAxisPosition.middle, displayValue: 'Cell midpoint'},
                    {value: Asc.c_oAscDataBarAxisPosition.none, displayValue: 'None'}
                ]
            }).on('selected', function(combo, record) {
                me.btnAxisColor.setDisabled(record.value == Asc.c_oAscDataBarAxisPosition.none);
            });
            this.cmbAxisPos.setValue(Asc.c_oAscDataBarDirection.context);

            this.btnAxisColor = new Common.UI.ColorButton({
                style: "width:45px;",
                menu        : true
            });
            this.btnAxisColor.render( $('#format-rules-edit-color-axis-color'));
            this.btnAxisColor.setColor('000000');

            this.afterRender();
        },

        afterRender: function() {
            this.updateThemeColors();

            this._setDefaults(this.props);
            this.setTitle((this.isEdit) ? this.txtTitleEdit : this.txtTitleNew);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        _setDefaults: function (props) {
            var type = props ? props.asc_getType() : this.type,
                ruleType,
                subtype = this.subtype;

            var setColor = function(color, control) {
                color = Common.Utils.ThemeColor.colorValue2EffectId(color);
                control.setColor(color);
                if (_.isObject(color)) {
                    var isselected = false;
                    for (var j = 0; j < 10; j++) {
                        if (Common.Utils.ThemeColor.ThemeValues[i] == color.effectValue) {
                            control.colorPicker.select(color, true);
                            isselected = true;
                            break;
                        }
                    }
                    if (!isselected) control.colorPicker.clearSelection();
                } else {
                    control.colorPicker.select(color, true);
                }
            };

            if (props) {
                var value;
                switch (type) {
                    case Asc.c_oAscCFType.containsText:
                    case Asc.c_oAscCFType.notContainsText:
                    case Asc.c_oAscCFType.beginsWith:
                    case Asc.c_oAscCFType.endsWith:
                        value = props.asc_getContainsText();
                        this.txtRange1.setValue(value || '');
                        break;
                    case Asc.c_oAscCFType.timePeriod:
                        subtype = props.asc_getTimePeriod();
                        break;
                    case Asc.c_oAscCFType.aboveAverage:
                        var above = props.asc_getAboveAverage(),
                            eq = props.asc_getEqualAverage(),
                            stddev = props.asc_getStdDev();
                            subtype = (above) ? 0 : 1;
                        if (eq)
                            subtype += 2;
                        else if (stddev) {
                            subtype += (2 + stddev*2);
                        }
                        break;
                    case Asc.c_oAscCFType.top10:
                        subtype = props.asc_getBottom() ? 1 : 0;
                        this.cmbPercent.setValue(props.asc_getPercent() ? 1 : 0);
                        this.numRank.setValue(props.asc_getRank() ? props.asc_getRank() : 10);
                        break;
                    case Asc.c_oAscCFType.cellIs:
                        subtype = props.asc_getOperator();
                        this.txtRange1.setValue(props.asc_getValue1() || '');
                        this.txtRange2.setValue(props.asc_getValue2() || '');
                        break;
                    case Asc.c_oAscCFType.expression:
                        this.txtRange1.setValue(props.asc_getValue1() || '');
                        break;
                    case Asc.c_oAscCFType.colorScale:
                        value = props.asc_getColorScaleOrDataBarOrIconSetRule();
                        var scales = value.asc_getCFVOs(),
                            colors = value.asc_getColors();
                        subtype = scales.length;
                        var arr = (scales.length==2) ? [this.scaleControls[0], this.scaleControls[2]] : this.scaleControls;
                        for (var i=0; i<scales.length; i++) {
                            var scaletype = scales[i].asc_getType(),
                                val =  scales[i].asc_getVal(),
                                color = Common.Utils.ThemeColor.colorValue2EffectId(colors[i]),
                                controls = arr[i];
                            controls.combo.setValue(scaletype);
                            controls.range.setDisabled(scaletype == Asc.c_oAscCfvoType.Minimum || scaletype == Asc.c_oAscCfvoType.Maximum);
                            controls.range.setValue((scaletype !== Asc.c_oAscCfvoType.Minimum && scaletype !== Asc.c_oAscCfvoType.Maximum && val!==null && val!==undefined) ? val : '');
                            setColor(color, controls.color);
                        }
                        break;
                    case Asc.c_oAscCFType.dataBar:
                        value = props.asc_getColorScaleOrDataBarOrIconSetRule();
                        var bars = value.asc_getCFVOs();
                        var arr = this.barControls;
                        for (var i=0; i<bars.length; i++) {
                            var bartype = bars[i].asc_getType(),
                                val =  bars[i].asc_getVal(),
                                controls = arr[i];
                            controls.combo.setValue(bartype);
                            controls.range.setDisabled(bartype == Asc.c_oAscCfvoType.Minimum || bartype == Asc.c_oAscCfvoType.Maximum || bartype == Asc.c_oAscCfvoType.AutoMin || bartype == Asc.c_oAscCfvoType.AutoMax);
                            controls.range.setValue((bartype !== Asc.c_oAscCfvoType.Minimum && bartype !== Asc.c_oAscCfvoType.Maximum  && bartype !== Asc.c_oAscCfvoType.AutoMin && bartype !== Asc.c_oAscCfvoType.AutoMax &&
                                                    val!==null && val!==undefined) ? val : '');
                        }
                        this.cmbFill.setValue(value.asc_getGradient());
                        setColor(value.asc_getColor(), this.btnPosFill);
                        setColor(value.asc_getNegativeColor() || value.asc_getColor(), this.btnNegFill);
                        this.chFill.setValue(value.asc_getNegativeBarColorSameAsPositive());

                        var color = value.asc_getBorderColor();
                        this.cmbBorder.setValue(color===null);
                        this.btnPosBorder.setDisabled(color===null);
                        if (color) {
                            setColor(value.asc_getBorderColor(), this.btnPosBorder);
                            setColor(value.asc_getNegativeBorderColor(), this.btnNegBorder);
                        }
                        this.chBorder.setValue(value.asc_getNegativeBarBorderColorSameAsPositive());
                        this.chBorder.setDisabled(color===null);
                        this.btnNegBorder.setDisabled(color===null || value.asc_getNegativeBarBorderColorSameAsPositive());

                        this.cmbBarDirection.setValue(value.asc_getDirection());
                        this.chShowBar.setValue(!value.asc_getShowValue());
                        this.cmbAxisPos.setValue(value.asc_getAxisPosition());
                        setColor(value.asc_getAxisColor(), this.btnAxisColor);
                        this.btnAxisColor.setDisabled(value.asc_getAxisPosition() == Asc.c_oAscDataBarAxisPosition.none);
                        break;
                    case Asc.c_oAscCFType.iconSet:
                        value = props.asc_getColorScaleOrDataBarOrIconSetRule();
                        break;
                }
            }

            var rec = this.ruleStore.where({type: type});
            if (rec.length>1) {
                if (type == Asc.c_oAscCFType.colorScale) {
                    rec = (subtype == rec[0].get('num')) ? rec[0] : rec[1];
                }
            } else if (rec.length==0) {
                var store = this.ruleStore;
                for (var i=0; i<store.length; i++) {
                    var item = store.at(i),
                        rules = item.get('rules');
                    if (rules && rules.findWhere({type: type})) {
                        rec = item;
                        ruleType = type;
                        break;
                    }
                }
            } else { // find rule
                rec = rec[0];
                var rules = rec.get('rules');
                if (rules && rules.findWhere({type: type})) {
                    ruleType = type;
                } else {
                    // find by subtype
                    if ((subtype!==undefined) && rules && rules.findWhere({subtype: subtype})) {
                        ruleType = subtype;
                    }
                }
            }
            if (!rec)
                rec = this.ruleStore.at(0);
            if (rec) {
                this.cmbCategory.setValue(rec.get('index'));
                this.refreshRules(rec.get('index'), ruleType);
            }

            if (props) {
                // var val = props.asc_getLocation();
                // this.txtScope.setValue((val) ? val : '');
            } else {
            }
        },

        refreshRules: function(index, ruleType) {
            var rec = this.ruleStore.findWhere({index: index});
            if (rec) {
                var rules = rec.get('rules'),
                    cmbData = [];
                rules && rules.each(function(rule, idx){
                    cmbData.push({value: (rule.get('type')!==undefined) ? rule.get('type') : rule.get('subtype'), displayValue: rule.get('name')});
                });
                this.cmbRule.setData(cmbData);
                (cmbData.length>0) && this.cmbRule.setValue((ruleType!==undefined) ? ruleType : cmbData[0].value);
            }
            this.setControls(index, this.cmbRule.getValue());
        },

        setControls: function(category, rule) {
            var hasformat = this.$window.find('.hasformat');
            hasformat.toggleClass('hidden', category>=7 && category<=10);

            this.cmbRule.setVisible(category<7);

            this.txtRange1.setVisible(category==0 || category==3 || category==11);
            this.txtRange2.setVisible(category==0 && (rule == Asc.c_oAscCFOperator.between || rule == Asc.c_oAscCFOperator.notBetween));

            this.cmbPercent.setVisible(category==1);
            this.numRank.setVisible(category==1);

            this.txtRange1.cmpEl.width(category==11 ? 305 : 150);

            this.$window.find('.scale').toggleClass('hidden', category<7 || category>8);
            if (category==7 || category==8) {
                this.scaleControls[1].combo.setVisible(category==8);
                this.scaleControls[1].range.setVisible(category==8);
                this.scaleControls[1].color.setVisible(category==8);
                this.lblMidScale.toggleClass('hidden', category==7);
            }

            this.$window.find('.databar').toggleClass('hidden', category!==9);
        },

        onSelectData: function(cmp) {
            var me = this;
            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        cmp.setValue(dlg.getSettings());
                        cmp.checkValidate();
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                }).on('close', function() {
                    me.show();
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 160, xy.top + 125);
                win.setSettings({
                    api     : me.api,
                    range   : (!_.isEmpty(cmp.getValue()) && (cmp.checkValidate()==true)) ? cmp.getValue() : '',
                    type    : Asc.c_oAscSelectionDialogType.Chart
                });
            }
        },

        updateThemeColors: function() {
            for (var i=0; i<this.scaleControls.length; i++) {
                var btn = this.scaleControls[i].color,
                    id = Common.UI.getId();
                btn.setMenu( new Common.UI.Menu({
                    items: [
                        { template: _.template('<div id="' + id + '" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                        { template: _.template('<a style="padding-left:12px;">' + this.textNewColor + '</a>') }
                    ]
                }));
                var colorPicker = new Common.UI.ThemeColorPalette({
                    el: this.$window.find('#' + id),
                    transparent: false,
                    type: i
                });
                // colorPicker.on('select', _.bind(this.onColorsSelect, this));
                colorPicker.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
                // btn.items[1].on('click', _.bind(this.addNewColor, this, colorPicker, btn));
                this.scaleControls[i].colorPicker = colorPicker;
            }

            var me = this;
            var initColor = function(btn) {
                var id = Common.UI.getId();
                btn.setMenu( new Common.UI.Menu({
                    items: [
                        { template: _.template('<div id="' + id + '" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                        { template: _.template('<a style="padding-left:12px;">' + me.textNewColor + '</a>') }
                    ]
                }));
                var colorPicker = new Common.UI.ThemeColorPalette({
                    el: me.$window.find('#' + id),
                    transparent: false,
                    type: i
                });
                colorPicker.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
                // btn.items[1].on('click', _.bind(this.addNewColor, this, colorPicker, btn));
                btn.colorPicker = colorPicker;
            };
            initColor(this.btnPosFill);
            // this.btnPosFill.colorPicker.on('select', _.bind(this.onBarColorsSelect, this));
            initColor(this.btnNegFill);
            // this.btnNegFill.colorPicker.on('select', _.bind(this.onBarColorsSelect, this));
            initColor(this.btnPosBorder);
            // this.btnPosBorder.colorPicker.on('select', _.bind(this.onBarColorsSelect, this));
            initColor(this.btnNegBorder);
            // this.btnNegBorder.colorPicker.on('select', _.bind(this.onBarColorsSelect, this));
            initColor(this.btnAxisColor);
            // this.btnAxisColor.colorPicker.on('select', _.bind(this.onAxisColorsSelect, this));

            this.mnuTextColorPicker.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.mnuFillColorPicker.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
        },

        getSettings: function() {
            return {};
        },

        onPrimary: function() {
            this.onDlgBtnClick('ok');
            return false;
        },

        onDlgBtnClick: function(event) {
            var me = this;
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'ok') {
                // var checkname = this.inputName.checkValidate(),
                //     checkrange = this.txtDataRange.checkValidate();
                // if (checkname !== true)  {
                //     this.inputName.cmpEl.find('input').focus();
                //     this.isInputFirstChange = true;
                //     return;
                // }
                // if (checkrange !== true) {
                //     this.txtDataRange.cmpEl.find('input').focus();
                //     return;
                // }
                this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            }

            this.close();
        },

        txtTitleNew: 'New Formatting Rule',
        txtTitleEdit: 'Edit Formatting Rule',
        textSelectData: 'Select Data',
        textApply: 'Apply to Range',
        textRule: 'Rule',
        txtEmpty: 'This field is required',
        textInvalidRange: 'ERROR! Invalid cells range',
        notcriticalErrorTitle: 'Warning',
        textFormat: 'Format',
        textValue: 'Value is',
        textGreater: 'Greater than',
        textGreaterEq: 'Greater than or equal to',
        textLess: 'Less than',
        textLessEq: 'Less than or equal to',
        textEqual: 'Equal to',
        textNotEqual: 'Not equal to',
        textBetween: 'Between',
        textNotBetween: 'Not between',
        textRanked: 'Ranked',
        textTop: 'Top',
        textBottom: 'Bottom',
        textText: 'Text',
        textDate: 'Date',
        textBlank: 'Blank',
        textDuplicate: 'Duplicate',
        textDataBars: 'Data Bars',
        textColorScales: 'Color Scales',
        textIconSets: 'Icon Sets',
        textCustom: 'Custom',
        textNewColor: 'Add New Custom Color',
        textBold:    'Bold',
        textItalic:  'Italic',
        textUnderline: 'Underline',
        textStrikeout: 'Strikeout',
        textSuperscript: 'Superscript',
        textSubscript: 'Subscript',
        textColor: 'Text color',
        fillColor: 'Background color',
        textMinpoint: 'Minpoint',
        textMidpoint: 'Midpoint',
        textMaxpoint: 'Maxpoint',
        textMinimum: 'Minimum',
        textMaximum: 'Maximum',
        textAppearance: 'Bar Appearance'

    }, SSE.Views.FormatRulesEditDlg || {}));
});