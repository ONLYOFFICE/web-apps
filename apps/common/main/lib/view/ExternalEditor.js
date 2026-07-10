/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
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
            this.storageName = options.storageName ? appPrefix + options.storageName : null;

            var _options = {},
                width = options.initwidth || 900,
                height = options.initheight || 700,
                footer = options.footer !== undefined ? options.footer : true;

            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName + '-width');
                value && (width = parseFloat(value));
                value = Common.localStorage.getItem(this.storageName + '-height');
                value && (height = parseFloat(value));
            }

            _.extend(_options,  {
                width: width,
                height: height,
                cls: 'advanced-settings-dlg',
                header: true,
                toolclose: 'hide',
                toolcallback: _.bind(this.onToolClose, this),
                resizable: true,
                footer: footer
            }, options);

            !footer && (_options.cls += ' no-footer');

            this.template = [
                '<div id="id-editor-container" class="box" style="padding: 0 5px;">',
                    '<div id="' + (_options.sdkplaceholder || '') + '" style="width: 100%;height: 100%;"></div>',
                '</div>',
                '<% if (footer) { %>',
                '<div class="separator horizontal"></div>',
                '<div class="footer" style="text-align: center;">',
                    '<button id="id-btn-editor-apply" class="btn normal dlg-btn primary auto" result="ok" data-hint="1" data-hint-direction="bottom" data-hint-offset="big">' + this.textSave + '</button>',
                    '<button id="id-btn-editor-cancel" class="btn normal dlg-btn" result="cancel" data-hint="1" data-hint-direction="bottom" data-hint-offset="big">' + this.textClose + '</button>',
                '</div>',
                '<% } %>'
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
            this._headerFooterHeight = this.initConfig.header ? parseFloat(this.$window.find('.header').css('height')) : 0;
            this._headerFooterHeight += (this.initConfig.footer ? parseFloat(this.$window.find('.footer').css('height')) : 0) + parseFloat(bodyEl.css('padding-top')) + parseFloat(bodyEl.css('padding-bottom'));
            this._headerFooterHeight += ((parseFloat(this.$window.css('border-top-width')) + parseFloat(this.$window.css('border-bottom-width'))));
            var resizeborder = this.$window.find('.resize-border.bottom');
            if (resizeborder.length>0)
                this._headerFooterHeight += $(resizeborder[0]).height()-2;

            this.boxEl.css('height', this.getHeight() - this._headerFooterHeight);

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
            if (this.$window && height >= 0) {
                var min = parseInt(this.$window.css('min-height'));
                height < min && (height = min);
                this.$window.height(height);

                var header_height = (this.initConfig.header) ? parseFloat(this.$window.find('> .header').css('height')) : 0;

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
                borders_width = (parseFloat(this.$window.css('border-left-width')) + parseFloat(this.$window.css('border-right-width'))),
                paddings = (parseFloat(this.boxEl.css('padding-left')) + parseFloat(this.boxEl.css('padding-right')));
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
                if (this.storageName) {
                    Common.localStorage.setItem(this.storageName + '-width', value[0]);
                    Common.localStorage.setItem(this.storageName + '-height', value[1]);
                }
            }
        },

        textSave: 'Save & Exit',
        textClose: 'Close'
    }, Common.Views.ExternalEditor || {}));
});
