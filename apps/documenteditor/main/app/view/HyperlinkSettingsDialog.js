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
 *  HyperlinkSettingsDialog.js
 *
 *  Created by Alexander Yuzhin on 2/20/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/InputField',
    'common/main/lib/component/Window'
], function () { 'use strict';

    DE.Views.HyperlinkSettingsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 350,
            style: 'min-width: 230px;',
            cls: 'modal-dlg'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div class="input-row">',
                        '<label>' + this.textUrl + ' *</label>',
                    '</div>',
                    '<div id="id-dlg-hyperlink-url" class="input-row" style="margin-bottom: 5px;"></div>',
                    '<div class="input-row">',
                        '<label>' + this.textDisplay + '</label>',
                    '</div>',
                    '<div id="id-dlg-hyperlink-display" class="input-row" style="margin-bottom: 5px;"></div>',
                    '<div class="input-row">',
                        '<label>' + this.textTooltip + '</label>',
                    '</div>',
                    '<div id="id-dlg-hyperlink-tip" class="input-row" style="margin-bottom: 5px;"></div>',
                '</div>',
                '<div class="footer right">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.api = this.options.api;
            this._originalProps = null;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();

            me.inputUrl = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-url'),
                allowBlank  : false,
                blankError  : me.txtEmpty,
                style       : 'width: 100%;',
                validateOnBlur: false,
                validation  : function(value) {
                    var urltype = me.api.asc_getUrlType($.trim(value));
                    me.isEmail = (urltype==2);
                    return (urltype>0) ? true : me.txtNotUrl;
                }
            });

            me.inputDisplay = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-display'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            }).on('changed:after', function() {
                me.isTextChanged = true;
            });

            me.inputTip = new Common.UI.InputField({
                el          : $('#id-dlg-hyperlink-tip'),
                style       : 'width: 100%;',
                maxLength   : Asc.c_oAscMaxTooltipLength
            });

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            $window.find('input').on('keypress', _.bind(this.onKeyPress, this));
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

            var me = this;
            _.delay(function(){
                me.inputUrl.cmpEl.find('input').focus();
            },500);
        },

        setSettings: function (props) {
            if (props) {
                var me = this;

                if (props.get_Value()) {
                    me.inputUrl.setValue(props.get_Value().replace(new RegExp(" ",'g'), "%20"));
                } else {
                    me.inputUrl.setValue('');
                }

                if (props.get_Text() !== null) {
                    me.inputDisplay.setValue(props.get_Text());
                    me.inputDisplay.setDisabled(false);
                } else {
                    me.inputDisplay.setValue(this.textDefault);
                    me.inputDisplay.setDisabled(true);
                }

                this.isTextChanged = false;

                me.inputTip.setValue(props.get_ToolTip());
                me._originalProps = props;
            }
        },

        getSettings: function () {
            var me      = this,
                props   = new Asc.CHyperlinkProperty(),
                url     = $.trim(me.inputUrl.getValue());

            if (! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url) )
                url = ( (me.isEmail) ? 'mailto:' : 'http://' ) + url;

            url = url.replace(new RegExp("%20",'g')," ");
            props.put_Value(url);

            if (!me.inputDisplay.isDisabled() && ( this.isTextChanged || _.isEmpty(me.inputDisplay.getValue()))) {
                if (_.isEmpty(me.inputDisplay.getValue()))
                    me.inputDisplay.setValue(url);
                props.put_Text(me.inputDisplay.getValue());
            } else {
                props.put_Text(null);
            }

            props.put_ToolTip(me.inputTip.getValue());
            props.put_InternalHyperlink(me._originalProps.get_InternalHyperlink());

            return props;
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
                    var checkurl = this.inputUrl.checkValidate(),
                        checkdisp = this.inputDisplay.checkValidate();
                    if (checkurl !== true)  {
                        this.inputUrl.cmpEl.find('input').focus();
                        return;
                    }
                    if (checkdisp !== true) {
                        this.inputDisplay.cmpEl.find('input').focus();
                        return;
                    }
                }

                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        textUrl:            'Link to',
        textDisplay:        'Display',
        cancelButtonText:   'Cancel',
        okButtonText:       'Ok',
        txtEmpty:           'This field is required',
        txtNotUrl:          'This field should be a URL in the format \"http://www.example.com\"',
        textTooltip:        'ScreenTip text',
        textDefault:        'Selected text',
        textTitle:          'Hyperlink Settings'
    }, DE.Views.HyperlinkSettingsDialog || {}))
});