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
 *  CaptionDialog.js
 *
 *  Created by Julia Radzhabova on 10.09.2019
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */
define([
    'common/main/lib/util/utils',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/ComboBox',
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    DE.Views.CaptionDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 351,
            height: 350
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                        '<div class="content-panel" style="padding: 0 5px;"><div class="inner-content">',
                            '<div class="settings-panel active">',
                                '<table cols="4" style="width: auto;">',
                                    '<tr>',
                                        '<td colspan="3" class="padding-small">',
                                            '<label class="input-label">', me.textCaption,'</label>',
                                            '<div id="caption-txt-caption" style="margin-right: 10px;"></div>',
                                        '</td>',
                                        '<td class="padding-small">',
                                            '<label class="input-label">', me.textInsert,'</label>',
                                            '<div id="caption-combo-position" class="input-group-nr" style="width:75px;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan="2" class="padding-small">',
                                            '<label class="input-label">', me.textLabel,'</label>',
                                            '<div id="caption-combo-label" class="input-group-nr" style="width:160px;margin-right: 10px;"></div>',
                                        '</td>',
                                        '<td class="padding-small" style="vertical-align: bottom;">',
                                            '<button type="button" result="add" class="btn btn-text-default" id="caption-btn-add" style="margin-right: 10px;">', me.textAdd,'</button>',
                                        '</td>',
                                        '<td class="padding-small" style="vertical-align: bottom;">',
                                            '<button type="button" result="add" class="btn btn-text-default" id="caption-btn-delete">', me.textDelete,'</button>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan="4" class="padding-small">',
                                            '<div id="caption-checkbox-exclude"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan="2" class="padding-large">',
                                            '<label class="input-label" >', me.textNumbering,'</label>',
                                            '<div id="caption-combo-numbering" class="input-group-nr" style="width:160px;"></div>',
                                        '</td>',
                                        '<td class="padding-large">',
                                        '</td>',
                                        '<td class="padding-large">',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan="4" class="padding-small">',
                                            '<div id="caption-checkbox-chapter"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan="2" class="padding-small">',
                                            '<label class="input-label">', me.textChapter,'</label>',
                                            '<div id="caption-combo-chapter" class="input-group-nr" style="width:160px;margin-right: 10px;"></div>',
                                        '</td>',
                                        '<td colspan="2" class="padding-small">',
                                            '<label class="input-label" >', me.textSeparator,'</label>',
                                            '<div id="caption-combo-separator" class="input-group-nr" style="width:160px;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan="4" class="padding-small">',
                                            '<label class="input-label" id="caption-label-example">', me.textExamples,'</label>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            '</div>',
                        '</div></div>',
                    '</div>',
                    '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
                    '</div>'
                ].join('')
            }, options);

            this.isObject   = options.isObject;
            this.handler    = options.handler;
            this.props      = options.props;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.txtCaption = new Common.UI.InputField({
                el          : $('#caption-txt-caption'),
                allowBlank  : false,
                value       : ''
            });
            var $captionInput = this.txtCaption.$el.find('input');
            $captionInput.on('mouseup', _.bind(this.checkStartPosition, this, 'mouse'));
            $captionInput.on('keydown', _.bind(this.checkStartPosition, this, 'key'));

            this.cmbPosition = new Common.UI.ComboBox({
                el: $('#caption-combo-position'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 75px;',
                editable: false,
                disabled: !this.isObject,
                data: [
                    { displayValue: this.textBefore,   value: 1 },
                    { displayValue: this.textAfter,   value: 0 }
                ]
            });
            this.cmbPosition.setValue(0);
            this.cmbPosition.on('selected', function(combo, record) {
                me.props.put_Before(!!record.value);
            });

            var arr = Common.Utils.InternalSettings.get("de-settings-captions");
            if (arr==null || arr==undefined) {
                arr = Common.localStorage.getItem("de-settings-captions") || '';
                Common.Utils.InternalSettings.set("de-settings-captions", arr);
            }
            arr = arr ? arr.split(';') : [];
            arr = _.map(arr, function(str){ return { displayValue: str, value: str, type: 1 }; });

            // 0 - not removable
            this.arrLabel = arr.concat([{ displayValue: this.textEquation,  value: this.textEquation, type: 0 },
                                        { displayValue: this.textFigure,    value: this.textFigure, type: 0 },
                                        { displayValue: this.textTable,     value: this.textTable, type: 0 }
                                        ]);

            this.cmbLabel = new Common.UI.ComboBox({
                el: $('#caption-combo-label'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 160px;max-height:155px;',
                editable: true,
                data: this.arrLabel,
                alwaysVisibleY: true
            });
            this.cmbLabel.scroller = new Common.UI.Scroller({
                el: this.cmbLabel.$el.find('ul'),
                useKeyboard: true,
                alwaysVisibleY: true
            });
            this.cmbLabel.scroller.update({alwaysVisibleY: true});
            this.cmbLabel.on('selected', function(combo, record) {
                var value = record.value;
                me.props.put_Label(value);
                me.props.updateName();
                me.txtCaption.setValue(me.props.get_Name());
                var custom = (record.type==1),
                    find = _.findWhere(me.arrLabel, {value: value}) ? true : false;
                me.btnAdd.setDisabled(find);
                me.btnDelete.setDisabled(!custom);
                me.currentLabel = value;
                me.positionCaption = me.txtCaption.getValue().length;
            });
            this.cmbLabel.on('changed:before', _.bind(function(field) {
                var value = field.getRawValue(),
                    disebled = _.findWhere(this.arrLabel, {value: value}) ? true : false;
                if (!value) {
                    Common.UI.error({
                        msg  : this.textLabelError
                    });
                    this.cmbLabel.setValue(this.currentLabel);
                    disebled = true;
                }
                this.btnAdd.setDisabled(disebled);
            }, this));
            this.cmbLabel.selectRecord(this.cmbLabel.store.at(this.arrLabel.length-1));

            this.btnAdd = new Common.UI.Button({
                el: $('#caption-btn-add'),
                disabled: true
            });
            this.btnAdd.on('click', _.bind(function (e) {
                var value = this.cmbLabel.getRawValue();
                if (value) {
                    var rec = { displayValue: value,  value: value, type: 1 };
                    this.arrLabel.unshift(rec);
                    this.cmbLabel.setData(this.arrLabel);
                    this.cmbLabel.setValue(value);
                    this.cmbLabel.trigger('selected', this.cmbLabel, rec);
                    this.cmbLabel.scroller.update({alwaysVisibleY: true});
                }
            }, this));

            this.btnDelete = new Common.UI.Button({
                el: $('#caption-btn-delete'),
                disabled: true
            });
            this.btnDelete.on('click', _.bind(function (e) {
                var value = this.cmbLabel.getValue();
                this.arrLabel = _.reject(this.arrLabel, function (item) {
                    return item.value === value;
                });
                this.cmbLabel.setData(this.arrLabel);
                this.cmbLabel.setValue(this.arrLabel[0].value);
                this.cmbLabel.trigger('selected', this.cmbLabel, this.arrLabel[0]);
            }, this));

            this.chExclude = new Common.UI.CheckBox({
                el: $('#caption-checkbox-exclude'),
                labelText: this.textExclude
            });
            this.chExclude.on('change', function(field, newValue, oldValue) {
                me.props.put_ExcludeLabel(newValue=='checked');
                me.props.updateName();
                me.txtCaption.setValue(me.props.get_Name());
            });

            this.cmbNumbering = new Common.UI.ComboBox({
                el: $('#caption-combo-numbering'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 160px;',
                editable: false,
                data: [
                    { displayValue: '1, 2, 3,...',      value: Asc.c_oAscNumberingFormat.Decimal, maskExp: /[0-9]/, defValue: 1 },
                    { displayValue: 'a, b, c,...',      value: Asc.c_oAscNumberingFormat.LowerLetter, maskExp: /[a-z]/, defValue: 'a' },
                    { displayValue: 'A, B, C,...',      value: Asc.c_oAscNumberingFormat.UpperLetter, maskExp: /[A-Z]/, defValue: 'A' },
                    { displayValue: 'i, ii, iii,...',   value: Asc.c_oAscNumberingFormat.LowerRoman, maskExp: /[ivxlcdm]/, defValue: 'i' },
                    { displayValue: 'I, II, III,...',   value: Asc.c_oAscNumberingFormat.UpperRoman, maskExp: /[IVXLCDM]/, defValue: 'I' }
                ]
            });
            this.cmbNumbering.setValue(Asc.c_oAscNumberingFormat.Decimal);
            this.cmbNumbering.on('selected', function(combo, record) {
                me.props.put_Format(record.value);
                me.props.updateName();
                me.txtCaption.setValue(me.props.get_Name());
            });

            this.chChapter = new Common.UI.CheckBox({
                el: $('#caption-checkbox-chapter'),
                labelText: this.textChapterInc
            });
            this.chChapter.on('change', function(field, newValue, oldValue) {
                me.props.put_IncludeChapterNumber(newValue=='checked');
                me.props.updateName();
                me.txtCaption.setValue(me.props.get_Name());
                me.cmbChapter.setDisabled(newValue!=='checked');
                me.cmbSeparator.setDisabled(newValue!=='checked');
            });

            var _main = DE.getController('Main');
            this._arrLevel = [];
            for (var i=0; i<9; i++) {
                this._arrLevel.push({displayValue: _main['txtStyle_Heading_' + (i+1)], value: i});
            }
            this.cmbChapter = new Common.UI.ComboBox({
                el: $('#caption-combo-chapter'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 160px;max-height:135px;',
                editable: false,
                disabled: true,
                data: this._arrLevel
            });
            this.cmbChapter.setValue(0);
            this.cmbChapter.on('selected', function(combo, record) {
                me.props.put_HeadingLvl(record.value);
                me.props.updateName();
                me.txtCaption.setValue(me.props.get_Name());
            });

            this.cmbSeparator = new Common.UI.ComboBox({
                el: $('#caption-combo-separator'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 160px;',
                editable: false,
                disabled: true,
                data: [
                    { displayValue: '-     (' + this.textHyphen + ')',      value: '-' },
                    { displayValue: '.     (' + this.textPeriod + ')',      value: '.' },
                    { displayValue: ':     (' + this.textColon + ')',       value: ':' },
                    { displayValue: '—  (' + this.textLongDash + ')',   value: '—' },
                    { displayValue: '–    (' + this.textDash + ')',       value: '–' }
                ]
            });
            this.cmbSeparator.setValue('-');
            this.cmbSeparator.on('selected', function(combo, record) {
                me.props.put_Separator(record.value);
                me.props.updateName();
                me.txtCaption.setValue(me.props.get_Name());
            });

            this.lblExample = this.$window.find('#caption-label-example');

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        close: function() {
            var val = _.pluck(_.where(this.arrLabel, {type: 1}), 'displayValue').join(';');
            Common.localStorage.setItem("de-settings-captions", val);
            Common.Utils.InternalSettings.set("de-settings-captions", val);

            Common.Views.AdvancedSettingsWindow.prototype.close.apply(this, arguments);
        },

        _setDefaults: function (props) {
            this.props = new Asc.CAscCaptionProperties();
            this.props.put_Before(!!this.cmbPosition.getValue());
            var valueLabel = this.cmbLabel.getValue();
            this.props.put_Label(valueLabel);
            var value = this.cmbLabel.getSelectedRecord();
            this.btnDelete.setDisabled(!value || value.type==0);
            this.props.put_ExcludeLabel(this.chExclude.getValue()=='checked');
            this.props.put_Format(this.cmbNumbering.getValue());
            this.props.put_IncludeChapterNumber(this.chChapter.getValue()=='checked');
            this.props.put_HeadingLvl(this.cmbChapter.getValue());
            this.props.put_Separator(this.cmbSeparator.getValue());
            this.props.updateName();
            this.txtCaption.setValue(this.props.get_Name());
            this.currentLabel = valueLabel;
            this.positionCaption = this.txtCaption.getValue().length;
        },

        getSettings: function () {
            return this.props ;
        },

        onDlgBtnClick: function(event) {
            this._handleInput((typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event);
        },

        onPrimary: function() {
            this._handleInput('insert');
            return false;
        },

        _handleInput: function(state) {
            this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            this.close();
        },

        checkStartPosition: function (type, event) {
            var me = this,
                key = event.key,
                start = event.target.selectionStart,
                end = event.target.selectionEnd;
            if (type === 'mouse' || key === 'ArrowLeft' || key === 'ArrowDown') {
                setTimeout(function () {
                    if (start < me.positionCaption + 1) {
                        event.target.selectionStart = me.positionCaption;
                    }
                }, );
            } else if (key === 'ArrowUp') {
                setTimeout(function () {
                    event.target.selectionStart = me.positionCaption;
                }, );
            }  else if (key === 'Backspace') {
                if ((start === end && start < me.positionCaption + 1) || start < me.positionCaption - 1) {
                    event.preventDefault();
                }
            } else if (key === 'Delete') {
                if (start < me.positionCaption - 1) {
                    event.preventDefault();
                }
            }
        },

        textTitle:    'Insert Caption',
        textCaption: 'Caption',
        textInsert: 'Insert',
        textLabel: 'Label',
        textAdd: 'Add label',
        textDelete: 'Delete label',
        textNumbering: 'Numbering',
        textChapterInc: 'Include chapter number',
        textChapter: 'Chapter starts with style',
        textSeparator: 'Use separator',
        textExamples: 'Examples: Table 2-A, Image 1.IV',
        textBefore: 'Before',
        textAfter: 'After',
        textHyphen: 'hyphen',
        textPeriod: 'period',
        textColon: 'colon',
        textLongDash: 'long dash',
        textDash: 'dash',
        textEquation: 'Equation',
        textFigure: 'Figure',
        textTable: 'Table',
        textExclude: 'Exclude label from caption',
        textLabelError: 'The entered value is incorrect.'

    }, DE.Views.CaptionDialog || {}))
});