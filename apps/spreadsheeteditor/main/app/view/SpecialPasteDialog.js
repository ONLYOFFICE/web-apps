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
 *  SpecialPasteDialog.js
 *
 *  Created on 27.02.2020
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';

    SSE.Views.SpecialPasteDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 350,
            separator: false
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                contentStyle: 'padding: 0 5px;',
                contentTemplate: _.template([
                    '<div class="settings-panel active">',
                        '<div class="inner-content">',
                            '<table cols="2" style="width: 100%;">',
                                '<tr>',
                                    '<td colspan=2 class="padding-small">',
                                        '<label class="header">', me.textPaste,'</label>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="paste-radio-all"></div>',
                                    '</td>',
                                    '<td class="padding-small">',
                                        '<div id="paste-radio-without-borders"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="paste-radio-formulas"></div>',
                                    '</td>',
                                    '<td class="padding-small">',
                                        '<div id="paste-radio-formula-formats"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="paste-radio-values"></div>',
                                    '</td>',
                                    '<td class="padding-small">',
                                        '<div id="paste-radio-formula-col-width"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="paste-radio-formats"></div>',
                                    '</td>',
                                    '<td class="padding-small">',
                                        '<div id="paste-radio-formula-num-format"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="paste-radio-comments"></div>',
                                    '</td>',
                                    '<td class="padding-small">',
                                        '<div id="paste-radio-value-num-format"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-large">',
                                        '<div id="paste-radio-col-width"></div>',
                                    '</td>',
                                    '<td class="padding-large">',
                                        '<div id="paste-radio-value-formats"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td colspan=2 class="padding-small">',
                                        '<label class="header">', me.textOperation,'</label>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="paste-radio-none"></div>',
                                    '</td>',
                                    '<td class="padding-small">',
                                        '<div id="paste-radio-mult"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="paste-radio-add"></div>',
                                    '</td>',
                                    '<td class="padding-small">',
                                        '<div id="paste-radio-div"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="paste-radio-sub"></div>',
                                    '</td>',
                                    '<td class="padding-small">',
                                    '</td>',
                                '</tr>',
                            // '</table>',
                            // '<div class="separator horizontal padding-small"></div>',
                            // '<table cols="2" style="width: 100%;">',
                                '<tr>',
                                    '<td colspan=2 class="padding-small" style="border-top: 1px solid #cbcbcb;">',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="paste-checkbox-transpose"></div>',
                                    '</td>',
                                    '<td class="padding-small">',
                                        '<div id="paste-checkbox-blanks"></div>',
                                    '</td>',
                                '</tr>',
                            '</table>',
                        '</div></div>'
                ].join(''))({scope: this})
            }, options);

            this.handler    = options.handler;
            this.props      = options.props;
            this._changedProps = null;
            this.isTable = !!options.isTable;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.propControls = [];
            this.radioAll = new Common.UI.RadioBox({
                el: $('#paste-radio-all'),
                name: 'asc-radio-paste',
                labelText: this.textAll,
                value: Asc.c_oSpecialPasteProps.paste,
                disabled: true
            });
            this.radioAll.on('change', _.bind(this.onRadioPasteChange, this));
            this.propControls[Asc.c_oSpecialPasteProps.paste] = this.radioAll;

            this.radioFormulas = new Common.UI.RadioBox({
                el: $('#paste-radio-formulas'),
                name: 'asc-radio-paste',
                labelText: this.textFormulas,
                value: Asc.c_oSpecialPasteProps.pasteOnlyFormula,
                disabled: true
            });
            this.radioFormulas.on('change', _.bind(this.onRadioPasteChange, this));
            this.propControls[Asc.c_oSpecialPasteProps.pasteOnlyFormula] = this.radioFormulas;

            this.radioValues = new Common.UI.RadioBox({
                el: $('#paste-radio-values'),
                name: 'asc-radio-paste',
                labelText: this.textValues,
                value: Asc.c_oSpecialPasteProps.pasteOnlyValues,
                disabled: true
            });
            this.radioValues.on('change', _.bind(this.onRadioPasteChange, this));
            this.propControls[Asc.c_oSpecialPasteProps.pasteOnlyValues] = this.radioValues;

            this.radioFormats = new Common.UI.RadioBox({
                el: $('#paste-radio-formats'),
                name: 'asc-radio-paste',
                labelText: this.textFormats,
                value: Asc.c_oSpecialPasteProps.pasteOnlyFormating,
                disabled: true
            });
            this.radioFormats.on('change', _.bind(this.onRadioPasteChange, this));
            this.propControls[Asc.c_oSpecialPasteProps.pasteOnlyFormating] = this.radioFormats;

            this.radioComments = new Common.UI.RadioBox({
                el: $('#paste-radio-comments'),
                name: 'asc-radio-paste',
                labelText: this.textComments,
                value: Asc.c_oSpecialPasteProps.comments,
                disabled: true
            });
            this.radioComments.on('change', _.bind(this.onRadioPasteChange, this));
            this.propControls[Asc.c_oSpecialPasteProps.comments] = this.radioComments;

            this.radioColWidth = new Common.UI.RadioBox({
                el: $('#paste-radio-col-width'),
                name: 'asc-radio-paste',
                labelText: this.textColWidth,
                value: Asc.c_oSpecialPasteProps.columnWidth,
                disabled: true
            });
            this.radioColWidth.on('change', _.bind(this.onRadioPasteChange, this));
            this.propControls[Asc.c_oSpecialPasteProps.columnWidth] = this.radioColWidth;

            this.radioWBorders = new Common.UI.RadioBox({
                el: $('#paste-radio-without-borders'),
                name: 'asc-radio-paste',
                labelText: this.textWBorders,
                value: Asc.c_oSpecialPasteProps.formulaWithoutBorders,
                disabled: true
            });
            this.radioWBorders.on('change', _.bind(this.onRadioPasteChange, this));
            this.propControls[Asc.c_oSpecialPasteProps.formulaWithoutBorders] = this.radioWBorders;

            this.radioFFormat = new Common.UI.RadioBox({
                el: $('#paste-radio-formula-formats'),
                name: 'asc-radio-paste',
                labelText: this.textFFormat,
                value: Asc.c_oSpecialPasteProps.formulaAllFormatting,
                disabled: true
            });
            this.radioFFormat.on('change', _.bind(this.onRadioPasteChange, this));
            this.propControls[Asc.c_oSpecialPasteProps.formulaAllFormatting] = this.radioFFormat;

            this.radioFWidth = new Common.UI.RadioBox({
                el: $('#paste-radio-formula-col-width'),
                name: 'asc-radio-paste',
                labelText: this.textFWidth,
                value: Asc.c_oSpecialPasteProps.formulaColumnWidth,
                disabled: true
            });
            this.radioFWidth.on('change', _.bind(this.onRadioPasteChange, this));
            this.propControls[Asc.c_oSpecialPasteProps.formulaColumnWidth] = this.radioFWidth;

            this.radioFNFormat = new Common.UI.RadioBox({
                el: $('#paste-radio-formula-num-format'),
                name: 'asc-radio-paste',
                labelText: this.textFNFormat,
                value: Asc.c_oSpecialPasteProps.formulaNumberFormat,
                disabled: true
            });
            this.radioFNFormat.on('change', _.bind(this.onRadioPasteChange, this));
            this.propControls[Asc.c_oSpecialPasteProps.formulaNumberFormat] = this.radioFNFormat;

            this.radioVNFormat = new Common.UI.RadioBox({
                el: $('#paste-radio-value-num-format'),
                name: 'asc-radio-paste',
                labelText: this.textVNFormat,
                value: Asc.c_oSpecialPasteProps.valueNumberFormat,
                disabled: true
            });
            this.radioVNFormat.on('change', _.bind(this.onRadioPasteChange, this));
            this.propControls[Asc.c_oSpecialPasteProps.valueNumberFormat] = this.radioVNFormat;

            this.radioVFormat = new Common.UI.RadioBox({
                el: $('#paste-radio-value-formats'),
                name: 'asc-radio-paste',
                labelText: this.textVFormat,
                value: Asc.c_oSpecialPasteProps.valueAllFormating,
                disabled: true
            });
            this.radioVFormat.on('change', _.bind(this.onRadioPasteChange, this));
            this.propControls[Asc.c_oSpecialPasteProps.valueAllFormating] = this.radioVFormat;

            this.radioNone = new Common.UI.RadioBox({
                el: $('#paste-radio-none'),
                name: 'asc-radio-paste-operation',
                labelText: this.textNone,
                value: Asc.c_oSpecialPasteOperation.none,
                checked: true
            });
            this.radioNone.on('change', _.bind(this.onRadioOperationChange, this));

            this.radioAdd = new Common.UI.RadioBox({
                el: $('#paste-radio-add'),
                name: 'asc-radio-paste-operation',
                labelText: this.textAdd,
                value: Asc.c_oSpecialPasteOperation.add
            });
            this.radioAdd.on('change', _.bind(this.onRadioOperationChange, this));

            this.radioMult = new Common.UI.RadioBox({
                el: $('#paste-radio-mult'),
                name: 'asc-radio-paste-operation',
                labelText: this.textMult,
                value: Asc.c_oSpecialPasteOperation.multiply
            });
            this.radioMult.on('change', _.bind(this.onRadioOperationChange, this));

            this.radioSub = new Common.UI.RadioBox({
                el: $('#paste-radio-sub'),
                name: 'asc-radio-paste-operation',
                labelText: this.textSub,
                value: Asc.c_oSpecialPasteOperation.subtract
            });
            this.radioSub.on('change', _.bind(this.onRadioOperationChange, this));

            this.radioDiv = new Common.UI.RadioBox({
                el: $('#paste-radio-div'),
                name: 'asc-radio-paste-operation',
                labelText: this.textDiv,
                value: Asc.c_oSpecialPasteOperation.divide
            });
            this.radioDiv.on('change', _.bind(this.onRadioOperationChange, this));

            this.chBlanks = new Common.UI.CheckBox({
                el: $('#paste-checkbox-blanks'),
                labelText: this.textBlanks
            });
            this.chTranspose = new Common.UI.CheckBox({
                el: $('#paste-checkbox-transpose'),
                labelText: this.textTranspose
            });

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.radioAll, this.radioFormulas, this.radioValues, this.radioFormats, this.radioComments, this.radioColWidth,
                this.radioWBorders, this.radioFFormat, this.radioFWidth, this.radioFNFormat, this.radioVNFormat, this.radioVFormat,
                this.radioNone, this.radioAdd, this.radioMult, this.radioSub, this.radioDiv, this.chBlanks, this.chTranspose].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.radioAll;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        _setDefaults: function (props) {
            var me = this;
            props && _.each(props, function(menuItem, index) {
                me.propControls[menuItem] && me.propControls[menuItem].setDisabled(false);
            });
            this._changedProps = new Asc.SpecialPasteProps();
            this._changedProps.asc_setProps(Asc.c_oSpecialPasteProps.paste);
            this._changedProps.asc_setOperation(Asc.c_oSpecialPasteOperation.none);

            this.radioAll.setValue(true);
        },

        getSettings: function () {
            if (this._changedProps) {
                this._changedProps.asc_setTranspose(this.chTranspose.getValue()=='checked');
                this._changedProps.asc_setSkipBlanks(this.chBlanks.getValue()=='checked');
            }
            return this._changedProps;
        },

        onDlgBtnClick: function(event) {
            this._handleInput((typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            this.close();
        },

        onRadioPasteChange: function(field, newValue, eOpts) {
            if (newValue && this._changedProps) {
                this._changedProps.asc_setProps(field.options.value);
                var disable = field.options.value == Asc.c_oSpecialPasteProps.pasteOnlyFormating || field.options.value == Asc.c_oSpecialPasteProps.comments ||
                              field.options.value == Asc.c_oSpecialPasteProps.columnWidth,
                    disableTable = this.isTable && !!this._changedProps.asc_getTableAllowed();
                this.radioNone.setDisabled(disable || disableTable);
                this.radioAdd.setDisabled(disable || disableTable);
                this.radioDiv.setDisabled(disable || disableTable);
                this.radioSub.setDisabled(disable || disableTable);
                this.radioMult.setDisabled(disable || disableTable);
                this.chBlanks.setDisabled(disableTable);
                this.chTranspose.setDisabled(disableTable);
            }
        },

        onRadioOperationChange: function(field, newValue, eOpts) {
            if (newValue && this._changedProps) {
                this._changedProps.asc_setOperation(field.options.value);
            }
        },

        textTitle:    'Paste Special',
        textAll: 'All',
        textFormulas: 'Formulas',
        textValues: 'Values',
        textFormats: 'Formats',
        textComments: 'Comments',
        textColWidth: 'Column widths',
        textWBorders: 'All except borders',
        textFFormat: 'Formulas & formatting',
        textFWidth: 'Formulas & column widths',
        textFNFormat: 'Formulas & number formats',
        textVNFormat: 'Values & number formats',
        textVFormat: 'Values & formatting',
        textNone: 'None',
        textAdd: 'Add',
        textMult: 'Multiply',
        textDiv: 'Divide',
        textSub: 'Subtract',
        textBlanks: 'Skip blanks',
        textTranspose: 'Transpose',
        textOperation: 'Operation',
        textPaste: 'Paste'

    }, SSE.Views.SpecialPasteDialog || {}))
});