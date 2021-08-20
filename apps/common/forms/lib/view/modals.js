
!window.Common && (window.Common = {});
!Common.Views && (Common.Views = {});

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/TextareaField'
], function () { 'use strict';

    Common.Views.ShareDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 300,
            header: true,
            style: 'min-width: 300px;',
            cls: 'modal-dlg',
            buttons: null
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 110px;">',
                '<table cols="2" style="width: 100%;">',
                    '<tr>',
                        '<td style="padding-right: 10px;">',
                            '<label class="input-label">' + this.textWidth + ':</label>',
                            '<div id="share-size-spin-width" style="display: inline-block;margin-left: 5px;"></div>',
                        '</td>',
                        '<td style="float:right;">',
                            '<label class="input-label">' + this.textHeight + ':</label>',
                            '<div id="share-size-spin-height" style="display: inline-block;margin-left: 5px;"></div>',
                        '</td>',
                    '</tr>',
                    '<tr>',
                        '<td colspan="2">',
                            '<div id="share-embed" style="margin-top: 15px;"></div>',
                        '</td>',
                    '</tr>',
                '</table>',
                '</div>',
                '<div class="separator horizontal"></div>',
                '<div class="footer center">',
                    '<button class="btn normal primary dlg-btn" style="min-width: 86px;width: auto;">' + this.txtCopy + '</button>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.embedConfig = this.options.embedConfig;
            this.embedCode = '<iframe allowtransparency="true" frameborder="0" scrolling="no" src="{0}" width="{1}" height="{2}"></iframe>';

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#share-size-spin-width'),
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
                el: $('#share-size-spin-height'),
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
                el          : $('#share-embed'),
                style       : 'width: 100%; height: 65px;',
                value       : ''
            });
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
    }, Common.Views.ShareDialog || {}))
});