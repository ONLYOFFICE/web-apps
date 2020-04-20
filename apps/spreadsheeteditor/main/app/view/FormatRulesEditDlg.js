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
            contentWidth: 480,
            height: 350
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
                                        '<td class="padding-large">',
                                            '<label class="header">', me.textApply,'</label>',
                                            '<div id="format-rules-edit-txt-scope" class="input-row"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<label class="header">', me.textRule,'</label>',
                                            '<div id="format-rules-edit-combo-category" class="input-group-nr"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr class="hasformat">',
                                        '<td class="padding-large">',
                                            '<div id="format-rules-edit-combo-rule" class="input-group-nr" style="display: inline-block;vertical-align: top;margin-right: 5px;"></div>',
                                            '<div id="format-rules-edit-txt-r1" class="input-row" style="display: inline-block;vertical-align: top;margin-right: 5px;"></div>',
                                            '<div id="format-rules-edit-txt-r2" class="input-row" style="display: inline-block;vertical-align: top;"></div>',
                                            '<div id="format-rules-edit-spin-rank" class="input-row" style="display: inline-block;vertical-align: top;margin-right: 5px;"></div>',
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
                        { name: 'Equal or above', subtype: 2},
                        { name: 'Equal or below', subtype: 3},
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

            this.txtScope = new Common.UI.InputFieldBtn({
                el          : $('#format-rules-edit-txt-scope'),
                name        : 'range',
                style       : 'width: 150px;',
                allowBlank  : true,
                btnHint     : this.textSelectData,
                validateOnChange: false
            });
            this.txtScope.on('button:click', _.bind(this.onSelectData, this));

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
                            subtype += (3 + stddev);
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
                        subtype = props.asc_getOperator();
                        this.txtRange1.setValue(props.asc_getValue1() || '');
                        break;
                }
            }

            var rec = this.ruleStore.findWhere({type: type});
            if (!rec) {
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
                var val = props.asc_getLocation();
                this.txtScope.setValue((val) ? val : '');
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
        fillColor: 'Background color'

    }, SSE.Views.FormatRulesEditDlg || {}));
});