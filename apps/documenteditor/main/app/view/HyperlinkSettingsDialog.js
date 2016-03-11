/**
 *  HyperlinkSettingsDialog.js
 *
 *  Created by Alexander Yuzhin on 2/20/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
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

            this.options.tpl = _.template(this.template, this.options);
            this.api = this.options.api;

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
                maxLength   : c_oAscMaxTooltipLength
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
            }
        },

        getSettings: function () {
            var me      = this,
                props   = new CHyperlinkProperty(),
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