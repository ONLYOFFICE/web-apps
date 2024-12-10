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

!window.Common && (window.Common = {});
!Common.Views && (Common.Views = {});

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/TextareaField'
], function () { 'use strict';

    Common.Views.EmbedDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 300,
            header: true,
            style: 'min-width: 300px;',
            cls: 'modal-dlg'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                buttons: [{value: 'ok', caption: this.txtCopy}]
            }, options || {});

            this.template = [
                '<div class="box" style="height: 110px;">',
                '<table cols="2" style="width: 100%;">',
                    '<tr>',
                        '<td style="padding-right: 10px;">',
                            '<label class="input-label">' + this.textWidth + ':</label>',
                            '<div id="embed-size-spin-width" style="display: inline-block;margin-left: 5px;"></div>',
                        '</td>',
                        '<td style="float:right;">',
                            '<label class="input-label">' + this.textHeight + ':</label>',
                            '<div id="embed-size-spin-height" style="display: inline-block;margin-left: 5px;"></div>',
                        '</td>',
                    '</tr>',
                    '<tr>',
                        '<td colspan="2">',
                            '<div id="embed-textarea" style="margin-top: 15px;"></div>',
                        '</td>',
                    '</tr>',
                '</table>',
                '</div>',
                '<div class="separator horizontal"></div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.embedConfig = this.options.embedConfig;
            this.embedCode = '<iframe allowtransparency="true" frameborder="0" scrolling="no" src="{0}" width="{1}" height="{2}"></iframe>';

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#embed-size-spin-width'),
                step: 1,
                width: 70,
                defaultUnit : "px",
                value: '400 px',
                minValue: 400,
                maxValue: 10000
            });
            this.spnWidth.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                this.updateEmbedCode();
            }, this));

            this.spnHeight = new Common.UI.MetricSpinner({
                el: $('#embed-size-spin-height'),
                step: 1,
                width: 70,
                defaultUnit : "px",
                value: '600 px',
                minValue: 600,
                maxValue: 10000
            });
            this.spnHeight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                this.updateEmbedCode();
            }, this));

            this.textareaInput = new Common.UI.TextareaField({
                el          : $('#embed-textarea'),
                style       : 'width: 100%; height: 65px;',
                value       : ''
            });
            this.textareaInput._input.attr('readonly', true);
            this.updateEmbedCode();

            this.getChild().find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [this.spnWidth, this.spnHeight, this.textareaInput];
        },

        getDefaultFocusableComponent: function () {
            return this.textareaInput;
        },

        onBtnClick: function(event) {
            this.textareaInput._input.select();
            if ( !document.execCommand('copy') ) {
                Common.UI.warning({
                    msg: this.warnCopy,
                    buttons: ['ok']
                });
            }
        },

        updateEmbedCode: function() {
            this.textareaInput.setValue(Common.Utils.String.format(this.embedCode, this.embedConfig.embedUrl, this.spnWidth.getNumberValue(), this.spnHeight.getNumberValue()));
        },

        textTitle: 'Embed',
        textWidth: 'Width',
        textHeight: 'Height',
        txtCopy: 'Copy to clipboard',
        warnCopy: 'Browser\'s error! Use keyboard shortcut [Ctrl] + [C]'
    }, Common.Views.EmbedDialog || {}));

    Common.Views.ShareDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 300,
            header: true,
            style: 'min-width: 300px;',
            cls: 'modal-dlg'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                buttons: [{value: 'ok', caption: this.txtCopy}]
            }, options || {});

            this.template = [
                '<div class="box" style="height: 100px;">',
                '<table cols="1" style="width: 100%;">',
                    '<tr>',
                        '<td>',
                            '<div id="share-link-txt"></div>',
                        '</td>',
                    '</tr>',
                    '<tr>',
                        '<td>',
                            '<div class="share-buttons" style="margin-top: 15px;">',
                                '<span class="svg big-facebook" data-name="facebook"></span>',
                                '<span class="svg big-twitter" data-name="twitter"></span>',
                                '<span class="svg big-email" data-name="email"></span>',
                                '<div class="autotest" id="email" style="display: none"></div>',
                            '</div>',
                        '</td>',
                    '</tr>',
                '</table>',
                '</div>',
                '<div class="separator horizontal"></div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.embedConfig = this.options.embedConfig;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.textUrl = new Common.UI.InputField({
                el          : $('#share-link-txt'),
                editable    : false,
                value: this.embedConfig.shareUrl || ''
            });
            this.updateShareCode();

            this.getChild().find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        onBtnClick: function(event) {
            this.textUrl._input.select();
            if ( !document.execCommand('copy') ) {
                Common.UI.warning({
                    msg: this.warnCopy,
                    buttons: ['ok']
                });
            }
        },

        updateShareCode: function() {
            var me = this,
                _encoded = encodeURIComponent(this.embedConfig.shareUrl),
                docTitle = this.embedConfig.docTitle || '',
                _mailto = 'mailto:?subject=I have shared a document with you: ' + docTitle + '&body=I have shared a document with you: ' + _encoded;

            this.getChild().find('.share-buttons > span').on('click', function(e){
                var _url;
                switch ($(e.target).attr('data-name')) {
                    case 'facebook':
                        _url = 'https://www.facebook.com/sharer/sharer.php?u=' + me.embedConfig.shareUrl + '&t=' + encodeURI(docTitle);
                        window.open(_url, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
                        break;
                    case 'twitter':
                        _url = 'https://twitter.com/share?url='+ _encoded;
                        !!docTitle && (_url += encodeURIComponent('&text=' + docTitle));
                        window.open(_url, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
                        break;
                    case 'email':
                        window.open(_mailto, '_self');
                        break;
                }
            });
        },

        textTitle: 'Share Link',
        txtCopy: 'Copy to clipboard',
        warnCopy: 'Browser\'s error! Use keyboard shortcut [Ctrl] + [C]'
    }, Common.Views.ShareDialog || {}))
});