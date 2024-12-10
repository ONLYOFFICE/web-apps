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
 *  ExternalEditor.js
 *
 *  Created on 22/06/22
 *
 */

define([], function () {
    'use strict';
    Common.Views.ExternalEditor = Common.UI.Window.extend(_.extend({
        initialize : function(options) {
            var filter = Common.localStorage.getKeysFilter(),
                appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';
            this.storageName = appPrefix + (options.storageName || 'external-editor');

            var _options = {},
                width = options.initwidth || 900,
                height = options.initheight || 700;
            var value = Common.localStorage.getItem(this.storageName + '-width');
            value && (width = parseInt(value));
            value = Common.localStorage.getItem(this.storageName + '-height');
            value && (height = parseInt(value));

            _.extend(_options,  {
                width: width,
                cls: 'advanced-settings-dlg',
                header: true,
                toolclose: 'hide',
                toolcallback: _.bind(this.onToolClose, this),
                resizable: true
            }, options);
            // (!_options.buttons || _.size(_options.buttons)<1) && (_options.cls += ' no-footer');
            _options.contentHeight = height;

            this.template = [
                '<div id="id-editor-container" class="box" style="height:' + _options.contentHeight + 'px; padding: 0 5px;">',
                    '<div id="' + (_options.sdkplaceholder || '') + '" style="width: 100%;height: 100%;"></div>',
                '</div>',
                '<div class="separator horizontal"></div>',
                '<div class="footer" style="text-align: center;">',
                    '<button id="id-btn-editor-apply" class="btn normal dlg-btn primary auto" result="ok" data-hint="1" data-hint-direction="bottom" data-hint-offset="big">' + this.textSave + '</button>',
                    '<button id="id-btn-editor-cancel" class="btn normal dlg-btn" result="cancel" data-hint="1" data-hint-direction="bottom" data-hint-offset="big">' + this.textClose + '</button>',
                '</div>'
            ].join('');

            _options.tpl = _.template(this.template)(_options);

            this.handler = _options.handler;
            this._isNewObject = true;
            this.on('resize', _.bind(this.onWindowResize, this));
            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);
            this.boxEl = this.$window.find('.body > .box');
            var bodyEl = this.$window.find('> .body');
            this._headerFooterHeight = this.initConfig.header ? parseInt(this.$window.find('.header').css('height')) : 0;
            this._headerFooterHeight += parseInt(this.$window.find('.footer').css('height')) + parseInt(bodyEl.css('padding-top')) + parseInt(bodyEl.css('padding-bottom'));
            this._headerFooterHeight += ((parseInt(this.$window.css('border-top-width')) + parseInt(this.$window.css('border-bottom-width'))));

            var _inner_height = Common.Utils.innerHeight() - Common.Utils.InternalSettings.get('window-inactive-area-top');
            if (_inner_height < this.initConfig.contentHeight + this._headerFooterHeight) {
                this.initConfig.contentHeight = _inner_height - this._headerFooterHeight;
                this.boxEl.css('height', this.initConfig.contentHeight);
            }

            this.btnSave = new Common.UI.Button({
                el: this.$window.find('#id-btn-editor-apply'),
                disabled: true
            });
            this.btnCancel = new Common.UI.Button({
                el: this.$window.find('#id-btn-editor-cancel')
            });

            this.$window.find('.dlg-btn').on('click', _.bind(this.onDlgBtnClick, this));
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);
        },

        setEditMode: function(mode) {
            this._isNewObject = !mode;
        },

        isEditMode: function() {
            return !this._isNewObject;
        },

        setControlsDisabled: function(disable) {
            this.btnSave.setDisabled(disable);
            this.btnCancel.setDisabled(disable);
            (disable) ? this.$window.find('.tool.close').addClass('disabled') : this.$window.find('.tool.close').removeClass('disabled');
        },

        onDlgBtnClick: function(event) {
            if ( this.handler ) {
                this.handler.call(this, event.currentTarget.attributes['result'].value);
                return;
            }
            this.hide();
        },

        onToolClose: function() {
            if ( this.handler ) {
                this.handler.call(this, 'cancel');
                return;
            }
            this.hide();
        },

        setHeight: function(height) {
            if (height >= 0) {
                var min = parseInt(this.$window.css('min-height'));
                height < min && (height = min);
                this.$window.height(height);

                var header_height = (this.initConfig.header) ? parseInt(this.$window.find('> .header').css('height')) : 0;

                this.$window.find('> .body').css('height', height-header_height);
                this.$window.find('> .body > .box').css('height', height-this._headerFooterHeight);
            }
        },

        setInCenter: function() {
            var height = this.$window.height(),
                top  = (Common.Utils.innerHeight() - Common.Utils.InternalSettings.get('window-inactive-area-top') - parseInt(height)) / 2,
                left = (Common.Utils.innerWidth() - parseInt(this.initConfig.width)) / 2;

            this.$window.css('left',left);
            this.$window.css('top', Common.Utils.InternalSettings.get('window-inactive-area-top') + top);
        },

        setInnerSize: function(width, height) {
            var maxHeight = Common.Utils.innerHeight(),
                maxWidth = Common.Utils.innerWidth(),
                borders_width = (parseInt(this.$window.css('border-left-width')) + parseInt(this.$window.css('border-right-width'))),
                paddings = (parseInt(this.boxEl.css('padding-left')) + parseInt(this.boxEl.css('padding-right')));
            height += 90; // add toolbar and statusbar height
            if (maxHeight<height + this._headerFooterHeight)
                height = maxHeight - this._headerFooterHeight;
            if (maxWidth<width + paddings + borders_width)
                width = maxWidth - paddings - borders_width;

            this.boxEl.css('height', height);

            this.setHeight(height + this._headerFooterHeight);
            this.setWidth(width + paddings + borders_width);

            if (this.getLeft()<0)
                this.$window.css('left', 0);
            if (this.getTop() < Common.Utils.InternalSettings.get('window-inactive-area-top') )
                this.$window.css('top', Common.Utils.InternalSettings.get('window-inactive-area-top'));
        },

        onWindowResize: function (args) {
            if (args && args[1]=='end') {
                var value = this.getSize();
                Common.localStorage.setItem(this.storageName + '-width', value[0]);
                Common.localStorage.setItem(this.storageName + '-height', value[1]);
            }
        },

        textSave: 'Save & Exit',
        textClose: 'Close'
    }, Common.Views.ExternalEditor || {}));
});
