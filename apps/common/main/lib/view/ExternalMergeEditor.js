/**
 *  ExternalDiagramEditor.js
 *
 *  Created by Julia Radzhabova on 4/08/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window'
], function () { 'use strict';

    Common.Views.ExternalMergeEditor = Common.UI.Window.extend(_.extend({
        initialize : function(options) {
            var _options = {};
            _.extend(_options,  {
                title: this.textTitle,
                width: 910,
                height: (window.innerHeight-700)<0 ? window.innerHeight: 700,
                cls: 'advanced-settings-dlg',
                header: true,
                toolclose: 'hide',
                toolcallback: _.bind(this.onToolClose, this)
            }, options);

            this.template = [
                '<div id="id-merge-editor-container" class="box" style="height:' + (_options.height-85) + 'px;">',
                    '<div id="id-merge-editor-placeholder" style="width: 100%;height: 100%;"></div>',
                '</div>',
                '<div class="separator horizontal"/>',
                '<div class="footer" style="text-align: center;">',
                    '<button id="id-btn-merge-editor-apply" class="btn normal dlg-btn primary custom" result="ok" style="margin-right: 10px;">' + this.textSave + '</button>',
                    '<button id="id-btn-merge-editor-cancel" class="btn normal dlg-btn disabled" result="cancel">' + this.textClose + '</button>',
                '</div>'
            ].join('');

            _options.tpl = _.template(this.template, _options);

            this.handler = _options.handler;
            this._mergeData = null;
            this._isNewMerge = true;
            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.btnSave = new Common.UI.Button({
                el: $('#id-btn-merge-editor-apply'),
                disabled: true
            });
            this.btnCancel = new Common.UI.Button({
                el: $('#id-btn-merge-editor-cancel'),
                disabled: true
            });

            this.$window.find('.tool.close').addClass('disabled');
            this.$window.find('.dlg-btn').on('click', _.bind(this.onDlgBtnClick, this));
        },

        setMergeData: function(data) {
            this._mergeData = data;
            if (this._isExternalDocReady)
                this.fireEvent('setmergedata', this);
        },

        setEditMode: function(mode) {
            this._isNewMerge = !mode;
        },

        isEditMode: function() {
            return !this._isNewMerge;
        },

        setControlsDisabled: function(disable) {
            this.btnSave.setDisabled(disable);
            this.btnCancel.setDisabled(disable);
            (disable) ? this.$window.find('.tool.close').addClass('disabled') : this.$window.find('.tool.close').removeClass('disabled');
        },

        onDlgBtnClick: function(event) {
            var state = event.currentTarget.attributes['result'].value;
            if ( this.handler && this.handler.call(this, state) )
                return;
            this.hide();
        },

        onToolClose: function() {
            if ( this.handler && this.handler.call(this, 'cancel') )
                return;
            this.hide();
        },

        setHeight: function(height) {
            if (height >= 0) {
                var min = parseInt(this.$window.css('min-height'));
                height < min && (height = min);
                this.$window.height(height);

                var header_height = (this.initConfig.header) ? parseInt(this.$window.find('> .header').css('height')) : 0;

                this.$window.find('> .body').css('height', height-header_height);
                this.$window.find('> .body > .box').css('height', height-85);

                var top  = ((parseInt(window.innerHeight) - parseInt(height)) / 2) * 0.9;
                var left = (parseInt(window.innerWidth) - parseInt(this.initConfig.width)) / 2;

                this.$window.css('left',left);
                this.$window.css('top',top);
            }
        },

        textSave: 'Save & Exit',
        textClose: 'Close',
        textTitle: 'Mail Merge Recipients'
    }, Common.Views.ExternalMergeEditor || {}));
});