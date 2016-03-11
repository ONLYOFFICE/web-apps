/**
 *  CopyWarningDialog.js
 *
 *  Created by Alexander Yuzhin on 4/15/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/Window'
], function () { 'use strict';

    Common.Views.CopyWarningDialog = Common.UI.Window.extend(_.extend({
        options: {
            width   : 500,
            height  : 325,
            cls     : 'modal-dlg copy-warning'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<p class="message">' + this.textMsg + '</p>',
                    '<div class="hotkeys">',
                        '<div>',
                            '<p class="hotkey">' + Common.Utils.String.platformKey('Ctrl+C', '{0}') + '</p>',
                            '<p class="message">' + this.textToCopy + '</p>',
                        '</div>',
                        '<div>',
                        '<p class="hotkey">' + Common.Utils.String.platformKey('Ctrl+X', '{0}') + '</p>',
                            '<p class="message">' + this.textToCut + '</p>',
                        '</div>',
                        '<div>',
                            '<p class="hotkey">' + Common.Utils.String.platformKey('Ctrl+V', '{0}') + '</p>',
                            '<p class="message">' + this.textToPaste + '</p>',
                        '</div>',
                    '</div>',
                    '<div id="copy-warning-checkbox" style="margin-top: 20px; text-align: left;"></div>',
                '</div>',
                '<div class="separator horizontal"/>',
                '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary">' + this.okButtonText + '</button>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template, this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.chDontShow = new Common.UI.CheckBox({
                el: $('#copy-warning-checkbox'),
                labelText: this.textDontShow
            });

            this.getChild().find('.btn').on('click', _.bind(this.onBtnClick, this));
            this.autoSize();
        },

        autoSize: function() {
            var text_cnt    = this.getChild('.box'),
                footer      = this.getChild('.footer'),
                header      = this.getChild('.header'),
                body        = this.getChild('.body');

            body.height(parseInt(text_cnt.height()) + parseInt(footer.css('height')));
            this.setHeight(parseInt(body.css('height')) + parseInt(header.css('height')));
        },

        onBtnClick: function(event) {
            if (this.options.handler) this.options.handler.call(this, this.chDontShow.getValue() == 'checked');
            this.close();
        },

        onKeyPress: function(event) {
            if (event.keyCode == Common.UI.Keys.RETURN) {
                if (this.options.handler) this.options.handler.call(this, this.chDontShow.getValue() == 'checked');
                this.close();
            }
        },

        getSettings: function() {
            return (this.chDontShow.getValue() == 'checked');
        },

        textTitle   : 'Copy, Cut and Paste Actions',
        textMsg     : 'Copy, cut and paste actions using the editor toolbar buttons and context menu actions will be performed within this editor tab only.<br><br>.To copy or paste to or from applications outside the editor tab use the following keyboard combinations:',
        textToCopy  : 'for Copy',
        textToPaste : 'for Paste',
        textToCut: 'for Cut',
        textDontShow: 'Don\'t show this message again'
    }, Common.Views.CopyWarningDialog || {}))
});