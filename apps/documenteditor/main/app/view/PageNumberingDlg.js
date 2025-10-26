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
 *  PageNumberingDlg.js
 *
 *  Created on 24.10.2025
 *
 */

define([], function () {
    'use strict';

    DE.Views.PageNumberingDlg = Common.UI.Window.extend(_.extend({

        initialize : function (options) {
            var t = this,
                _options = {};

            _.extend(_options,  {
                title: options.title ? options.title : this.txtTitle,
                cls: 'modal-dlg',
                width: 350,
                height: 'auto',
                buttons: options.buttons ? options.buttons : [{
                    value: 'ok',
                    caption: 'Ok'
                }, 'cancel']
            }, options);

            this.handler        = options.handler;
            this.props = options.props;

            this.template = options.template || [
                '<div class="box">',
                    '<div class="" style="margin-bottom: 5px;">',
                        '<label class="font-weight-bold" style="margin-bottom: 5px;">' + 'Page numbering' + '</label>',
                    '</div>',
                    '<div id="id-headerfooter-radio-prev" style="margin-bottom: 8px;"></div>' +
                    '<div class="" style="margin-bottom: 5px;">',
                        '<div id="id-headerfooter-radio-from" style="margin-bottom: 8px; display: inline-block; vertical-align: middle;"></div>' +
                        '<div id="id-headerfooter-spin-from" style="margin-bottom: 8px; display: inline-block; vertical-align: middle; margin-left: 5px;"></div>' +
                    '</div>' +
                    '<label id="id-headerfooter-label-format" class="input-label">Number format</label>' +
                    '<div id="id-headerfooter-combo-format"></div>' +
                '</div>'
            ].join('');

            _options.tpl        =   _.template(this.template)(_options);

            Common.UI.Window.prototype.initialize.call(this, _options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);

            var me = this;
            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.rbPrev = new Common.UI.RadioBox({
                el: $('#id-headerfooter-radio-prev'),
                labelText: 'Continue from previous section',
                name: 'asc-radio-header-numbering',
                checked: true,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            })

            this.rbFrom = new Common.UI.RadioBox({
                el: $('#id-headerfooter-radio-from'),
                labelText: 'Start at',
                name: 'asc-radio-header-numbering',
                checked: true,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            })

            this.numFrom = new Common.UI.MetricSpinner({
                el: $('#id-headerfooter-spin-from'),
                step: 1,
                width: 85,
                value: '1',
                defaultUnit : "",
                maxValue: 2147483646,
                minValue: 0,
                allowDecimal: false,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textFrom
            });

            this.cmbFormat = new Common.UI.ComboBox({
                el          : $('#id-headerfooter-combo-format'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;max-height: 220px;',
                menuAlignEl: $(this.el).parent(),
                restoreMenuHeightAndTop: 110,
                style       : "width: 150px;",
                editable    : false,
                data        : [],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            this.btnOk = _.find(this.getFooterButtons(), function (item) {
                return (item.$el && item.$el.find('.primary').addBack().filter('.primary').length>0);
            }) || new Common.UI.Button({ el: this.$window.find('.primary') });

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.rbPrev,].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.inputPwd;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        _handleInput: function(state) {
            if (state === 'ok' && this.btnOk.isDisabled())
                return;

            if (this.handler) {
                if (state === 'ok') {
                    if (this.inputPwd.checkValidate() !== true)  {
                        this.inputPwd.focus();
                        return;
                    }
                    if (this.inputPwd.getValue() !== this.repeatPwd.getValue()) {
                        this.repeatPwd.checkValidate();
                        this.repeatPwd.focus();
                        return;
                    }
                }
                this.handler.call(this, state, this.inputPwd.getValue(), (state == 'ok') ? this.getSettings() : undefined);
            }

            this.close();
        },

        _setDefaults: function (props) {
            if (props) {
            }
        },

        getSettings: function() {
            if (this.rbView.getValue())
                return Asc.c_oAscEDocProtect.ReadOnly;
            if (this.rbForms.getValue())
                return Asc.c_oAscEDocProtect.Forms;
            if (this.rbReview.getValue())
                return Asc.c_oAscEDocProtect.TrackedChanges;
            if (this.rbComments.getValue())
                return Asc.c_oAscEDocProtect.Comments;
        },

        SetDisabled: function(disabled) {
            this.btnOk.setDisabled(disabled);
        },

        txtPassword : "Password",
        txtRepeat: 'Repeat password',
        txtOptional: 'optional',
        txtIncorrectPwd: 'Confirmation password is not identical',
        txtWarning: 'Warning: If you lose or forget the password, it cannot be recovered. Please keep it in a safe place.',
        txtProtect: 'Protect',
        txtTitle: 'Page numbering',
        txtAllow: 'Allow only this type of editing in the document',
        textView: 'No changes (Read only)',
        textForms: 'Filling forms',
        textReview: 'Tracked changes',
        textComments: 'Comments',
        txtLimit: 'Password is limited to 15 characters'

    }, DE.Views.PageNumberingDlg || {}));
});