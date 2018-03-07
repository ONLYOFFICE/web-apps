/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 * Created by Vladimir Karas on 26.05.15.
 */
if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/InputField',
    'common/main/lib/component/Window'
], function () { 'use strict';

    DE.Views.StyleTitleDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 350,
            height: 200,
            style: 'min-width: 230px;',
            cls: 'modal-dlg'
        },

            initialize : function(options) {
                _.extend(this.options, {
                    title: this.textHeader
                }, options || {});

                this.template = [
                    '<div class="box">',
                        '<label class="input-row" style="margin-bottom: -5px;">' + this.textTitle + ' </label>',
                        '<div id="id-dlg-style-title" class="input-row" style="margin-bottom: 5px;"></div>',

                        '<label class="input-row" style="margin-bottom: -5px; margin-top: 5px;">' + this.textNextStyle + '</label>',
                        '<div id="id-dlg-style-next-par" class="input-group-nr" style="margin-bottom: 5px;" ></div>',
                    '</div>',

                    '<div class="footer right">',
                        '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                        '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
                    '</div>'
                ].join('');

                this.options.tpl = _.template(this.template)(this.options);

                Common.UI.Window.prototype.initialize.call(this, this.options);
            },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();

            me.inputTitle = new Common.UI.InputField({
                el          : $('#id-dlg-style-title'),
                allowBlank  : false,
                blankError  : me.txtEmpty,
                style       : 'width: 100%;',
                validateOnBlur: false,
                validation  : function(value) {
                    var isvalid = value != '';

                    if (isvalid) {
                        return true;
                    } else {
                        return me.txtNotEmpty;
                    }
                }
            });

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            $window.find('input').on('keypress', _.bind(this.onKeyPress, this));

            this.cmbNextStyle = new Common.UI.ComboBox({
                el          : $('#id-dlg-style-next-par'),
                style       : 'width: 100%;',
                menuStyle   : 'width: 100%; max-height: 290px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : this.options.formats,
                disabled    : (this.options.formats.length==0)
            });
            if (this.options.formats.length>0)
                this.cmbNextStyle.setValue(this.options.formats[0].value);
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

            var me = this;
            _.delay(function(){
                me.inputTitle.cmpEl.find('input').focus();
            },500);
        },

        getTitle: function () {
            var me = this;
            return me.inputTitle.getValue();
        },

        getNextStyle: function () {
            var me = this;
            return (me.options.formats.length>0) ? me.cmbNextStyle.getValue() : null;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onKeyPress: function(event) {
            if (event.keyCode == Common.UI.Keys.RETURN) {
                this._handleInput('ok');
                return false;
            }
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    var checkurl = this.inputTitle.checkValidate();
                    if (checkurl !== true)  {
                        this.inputTitle.cmpEl.find('input').focus();
                        return;
                    }
                }

                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        textTitle:            'Title',
        textHeader:           'Create New Style',
        txtEmpty:             'This field is required',
        txtNotEmpty:          'Field must not be empty',
        textNextStyle:        'Next paragraph style'

    }, DE.Views.StyleTitleDialog || {}))

});