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
 *  ExternalDiagramEditor.js
 *
 *  Created by Julia Radzhabova on 4/08/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window'
], function () { 'use strict';

    Common.Views.ExternalDiagramEditor = Common.UI.Window.extend(_.extend({
        initialize : function(options) {
            var _options = {};
            _.extend(_options,  {
                title: this.textTitle,
                width: 910,
                height: (Common.Utils.innerHeight()-700)<0 ? Common.Utils.innerHeight(): 700,
                cls: 'advanced-settings-dlg',
                header: true,
                toolclose: 'hide',
                toolcallback: _.bind(this.onToolClose, this)
            }, options);

            this.template = [
                '<div id="id-diagram-editor-container" class="box" style="height:' + (_options.height-85) + 'px;">',
                    '<div id="id-diagram-editor-placeholder" style="width: 100%;height: 100%;"></div>',
                '</div>',
                '<div class="separator horizontal"/>',
                '<div class="footer" style="text-align: center;">',
                    '<button id="id-btn-diagram-editor-apply" class="btn normal dlg-btn primary custom" result="ok" style="margin-right: 10px;">' + this.textSave + '</button>',
                    '<button id="id-btn-diagram-editor-cancel" class="btn normal dlg-btn" result="cancel">' + this.textClose + '</button>',
                '</div>'
            ].join('');

            _options.tpl = _.template(this.template)(_options);

            this.handler = _options.handler;
            this._chartData = null;
            this._isNewChart = true;
            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.btnSave = new Common.UI.Button({
                el: $('#id-btn-diagram-editor-apply'),
                disabled: true
            });
            this.btnCancel = new Common.UI.Button({
                el: $('#id-btn-diagram-editor-cancel'),
                disabled: true
            });

            this.$window.find('.tool.close').addClass('disabled');
            this.$window.find('.dlg-btn').on('click', _.bind(this.onDlgBtnClick, this));
        },

        setChartData: function(data) {
            this._chartData = data;
            if (this._isExternalDocReady)
                this.fireEvent('setchartdata', this);
        },

        setEditMode: function(mode) {
            this._isNewChart = !mode;
        },

        isEditMode: function() {
            return !this._isNewChart;
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
                this.$window.find('> .body > .box').css('height', height-85);

                var top  = (Common.Utils.innerHeight() - parseInt(height)) / 2;
                var left = (Common.Utils.innerWidth() - parseInt(this.initConfig.width)) / 2;

                this.$window.css('left',left);
                this.$window.css('top',top);
            }
        },

        textSave: 'Save & Exit',
        textClose: 'Close',
        textTitle: 'Chart Editor'
    }, Common.Views.ExternalDiagramEditor || {}));
});