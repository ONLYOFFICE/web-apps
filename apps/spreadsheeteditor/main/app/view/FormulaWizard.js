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
 *  FormulaWizard.js
 *
 *  Created by Julia Radzhabova on 17.04.20
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/MetricSpinner'
], function () { 'use strict';

    SSE.Views.FormulaWizard = Common.UI.Window.extend(_.extend({
        options: {
            width: 400,
            header: true,
            style: 'min-width: 350px;',
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 350px;">',
                    '<div>',
                    '<table cols="2" style="width: 100%;margin-bottom: 10px;">',
                        '<tr>',
                            '<td colspan="2" style="">',
                                '<label id="formula-wizard-lbl-name-arg1" class="input-label">Argument1</label>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td style="padding-right: 10px;padding-bottom: 8px;width: 70%;vertical-align: middle;">',
                                '<div id="formula-wizard-txt-arg1"></div>',
                            '</td>',
                            '<td style="padding-bottom: 8px;vertical-align: middle;">',
                                '<label id="formula-wizard-lbl-val-arg1" class="input-label">= 0</label>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" style="">',
                                '<label id="formula-wizard-lbl-name-arg2" class="input-label">Argument2</label>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td style="padding-right: 10px;padding-bottom: 8px;width: 70%;vertical-align: middle;">',
                                '<div id="formula-wizard-txt-arg2"></div>',
                            '</td>',
                            '<td style="padding-bottom: 8px;vertical-align: middle;">',
                                '<label id="formula-wizard-lbl-val-arg2" class="input-label">= 234234</label>',
                            '</td>',
                        '</tr>',
                    '</table>',
                    '</div>',
                    '<label id="formula-wizard-value" style="display: block;margin-bottom: 16px"><b>Value:</b> 24123</label>',
                    '<label id="formula-wizard-arg-desc" style="display: block;margin-bottom: 16px"><b>Argument 1:</b> some argument description</label>',
                    '<label id="formula-wizard-args" style="display: block;margin-bottom: 4px"></label>',
                    '<label id="formula-wizard-desc" style="display: block;"></label>',
                '</div>',
                '<div class="separator horizontal"/>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.props = this.options.props;
            this.funcprops = this.options.funcprops;
            this._noApply = false;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.txtArg1 = new Common.UI.InputFieldBtn({
                el          : $('#formula-wizard-txt-arg1'),
                style       : 'width: 100%;',
                allowBlank  : true,
                validateOnChange: false
            });

            this.txtArg2 = new Common.UI.InputFieldBtn({
                el          : $('#formula-wizard-txt-arg2'),
                style       : 'width: 100%;',
                allowBlank  : true,
                validateOnChange: false
            });

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            $window.find('input').on('keypress', _.bind(this.onKeyPress, this));

            this.afterRender();
        },

        afterRender: function() {
            this.setSettings();
        },

        _handleInput: function(state) {
            if (this.options.handler)
                this.options.handler.call(this, state, (state == 'ok') ? this.getSettings() : undefined);

            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onKeyPress: function(event) {
            if (event.keyCode == Common.UI.Keys.RETURN) {
                this._handleInput('ok');
            }
        },

        setSettings: function () {
            if (this.funcprops) {
                var props = this.funcprops;
                props.args ? $('#formula-wizard-args').html('<b>' + props.name + '</b>' + props.args) : $('#formula-wizard-args').addClass('hidden');
                props.desc ? $('#formula-wizard-desc').text(props.desc) : $('#formula-wizard-desc').addClass('hidden');
            }
            if (this.props) {
                // fill arguments
                var props = this.props;
                var result = props.asc_getFormulaResult();
                $('#formula-wizard-value').html('<b>' + this.textValue + ': </b>' + ((result!==undefined && result!==null)? result : ''));
            }
        },

        getSettings: function() {
            return {};
        },

        textTitle: 'Function Argumens',
        textValue: 'Value'

    }, SSE.Views.FormulaWizard || {}))
});