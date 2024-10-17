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
 *  TableToTextDialog.js
 *
 *  Created on 15/04/21
 *
 */

define([
], function () { 'use strict';

    DE.Views.TableToTextDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 300,
            header: true,
            style: 'min-width: 240px;',
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div style="margin-bottom: 8px;"><label class="font-weight-bold">' + this.textSeparator + '</label></div>',
                    '<div id="id-table-text-radio-para" style="margin-bottom: 8px;"></div>',
                    '<div id="id-table-text-radio-tabs" style="margin-bottom: 8px;"></div>',
                    '<div id="id-table-text-radio-semi" style="margin-bottom: 5px;"></div>',
                    '<div style="margin-bottom: 24px;">',
                        '<div id="id-table-text-radio-other" class="margin-right-10" style="display: inline-block;vertical-align: middle;"></div>',
                        '<div id="id-table-text-txt-other" style="display: inline-block;vertical-align: middle;"></div>',
                    '</div>',
                    '<div id="id-table-text-check-nested"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild();

            this.rbPara = new Common.UI.RadioBox({
                el: $window.find('#id-table-text-radio-para'),
                labelText: this.textPara,
                name: 'asc-radio-table-text-separator',
                value: 1
            }).on('change', _.bind(this.onRadioSeparatorChange, this));

            this.rbTabs = new Common.UI.RadioBox({
                el: $window.find('#id-table-text-radio-tabs'),
                labelText: this.textTab,
                name: 'asc-radio-table-text-separator',
                value: 2,
                checked: true
            }).on('change', _.bind(this.onRadioSeparatorChange, this));

            this.rbSemi = new Common.UI.RadioBox({
                el: $window.find('#id-table-text-radio-semi'),
                labelText: this.textSemicolon,
                name: 'asc-radio-table-text-separator',
                value: ';'
            }).on('change', _.bind(this.onRadioSeparatorChange, this));

            this.rbOther = new Common.UI.RadioBox({
                el: $window.find('#id-table-text-radio-other'),
                labelText: this.textOther,
                name: 'asc-radio-table-text-separator',
                value: 3
            }).on('change', _.bind(this.onRadioSeparatorChange, this));

            this.inputOther = new Common.UI.InputField({
                el          : $window.find('#id-table-text-txt-other'),
                style       : 'width: 30px;',
                maxLength: 1,
                validateOnChange: true,
                validateOnBlur: false,
                value: '-',
                disabled: true
            });

            this.chNested = new Common.UI.CheckBox({
                el: $window.find('#id-table-text-check-nested'),
                labelText: this.textNested,
                value: true,
                disabled: true
            });

            this.getChild().find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [this.rbPara, this.rbTabs, this.rbSemi, this.rbOther, this.inputOther, this.chNested].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.rbTabs;
        },

        setSettings: function (props) {
            if (props) {
            }
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    if (!this.isRangeValid()) return;
                }
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

        getSettings: function() {
            var type = this.rbPara.getValue() ? 1 : (this.rbTabs.getValue() ? 2 : 3),
                separator = this.rbSemi.getValue() ? ';'.charCodeAt(0) : (this.rbOther.getValue() ? this.inputOther.getValue().charCodeAt(0) : undefined);

            return {type: type, separator: separator, nested: this.chNested.getValue()==='checked'};
        },

        onRadioSeparatorChange: function(field, newValue, eOpts) {
            var value = field.options.value,
                me = this;
            if (newValue) {
                this.inputOther.setDisabled(value!==3);
                (value==3) && setTimeout(function(){ me.inputOther.focus(); }, 1);
                (value!==1) && this.chNested.setValue(true);
                this.chNested.setDisabled(value!==1);
            }
        },

        isRangeValid: function() {
            if (this.rbOther.getValue() && this.inputOther.getValue()=='') {
                var me = this;
                Common.UI.warning({
                    msg: this.textEmpty,
                    maxwidth: 600,
                    callback: function(btn){
                        me.inputOther.focus();
                    }});
                return false;
            }
            return true;
        },

        textTitle: 'Convert Table to Text',
        textSeparator: 'Separate text with',
        textPara: 'Paragraph marks',
        textTab: 'Tabs',
        textSemicolon: 'Semicolons',
        textOther: 'Other',
        textNested: 'Convert nested tables',
        textEmpty: 'You must type a character for the custom separator.'
    }, DE.Views.TableToTextDialog || {}))
});