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
 *  CustomizeQuickAccessDialog.js
 *
 *  Created on 9/04/24
 *
 */

if (Common === undefined)
    var Common = {};

define([], function () { 'use strict';

    Common.Views.CustomizeQuickAccessDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 296,
            style: 'min-width: 296px;',
            cls: 'modal-dlg quick-access-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<label class="padding-medium">' + this.textMsg + '</label>',
                    '<div class="padding-small" id="quick-access-chb-save"></div>',
                    '<div class="padding-small" id="quick-access-chb-print"></div>',
                    '<div class="padding-small" id="quick-access-chb-quick-print" style="display:none;"></div>',
                    '<div class="padding-small" id="quick-access-chb-undo"></div>',
                    '<div class="padding-small" id="quick-access-chb-redo"></div>',
                    '<div class="padding-small" id="quick-access-chb-start-over" style="display:none;"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            this.props = this.options.props;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);
            this.focusedComponents = [];

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            if (this.options.showSave) {
                this.chSave = new Common.UI.CheckBox({
                    el: $('#quick-access-chb-save'),
                    labelText: this.options.mode && (this.options.mode.canSaveToFile || this.options.mode.isDesktopApp && this.options.mode.isOffline) ? this.textSave : this.textDownload,
                    value: this.props.save
                });
                this.focusedComponents.push(this.chSave);
            }

            if (this.options.showPrint) {
                this.chPrint = new Common.UI.CheckBox({
                    el: $('#quick-access-chb-print'),
                    labelText: this.textPrint,
                    value: this.props.print
                });
                this.focusedComponents.push(this.chPrint);
            }

            if (this.options.showQuickPrint) {
                this.chQuickPrint = new Common.UI.CheckBox({
                    el: $('#quick-access-chb-quick-print'),
                    labelText: this.textQuickPrint,
                    value: this.props.quickPrint
                });
                this.focusedComponents.push(this.chQuickPrint);
                this.chQuickPrint.show();
            }

            this.chUndo = new Common.UI.CheckBox({
                el: $('#quick-access-chb-undo'),
                labelText: this.textUndo,
                value: this.props.undo
            });
            this.focusedComponents.push(this.chUndo);

            this.chRedo = new Common.UI.CheckBox({
                el: $('#quick-access-chb-redo'),
                labelText: this.textRedo,
                value: this.props.redo
            });
            this.focusedComponents.push(this.chRedo);

            if (!!window.PE) {
                this.chStartOver = new Common.UI.CheckBox({
                    el: $('#quick-access-chb-start-over'),
                    labelText: this.textStartOver,
                    value: this.props.startOver
                });
                this.focusedComponents.push(this.chStartOver);
                this.chStartOver.show();
            }    
        },

        getFocusedComponents: function() {
            return this.focusedComponents.concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.focusedComponents[0];
        },

        onBtnClick: function(event) {
            if (event.currentTarget.attributes['result'].value === 'ok') {
                Common.NotificationCenter.trigger('quickaccess:changed', {
                    save: this.chSave ? this.chSave.getValue() === 'checked' : undefined,
                    print: this.chPrint ? this.chPrint.getValue() === 'checked' : undefined,
                    quickPrint: this.chQuickPrint ? this.chQuickPrint.getValue() === 'checked' : undefined,
                    undo: this.chUndo.getValue() === 'checked',
                    redo: this.chRedo.getValue() === 'checked',
                    startOver: this.chStartOver ? this.chStartOver.getValue() === 'checked' : undefined
                });
            }

            this.close();
        },

        textTitle: 'Customize quick access',
        textMsg: 'Check the commands that will be displayed on the Quick Access Toolbar',
        textSave: 'Save',
        textPrint: 'Print',
        textQuickPrint: 'Quick Print',
        textUndo: 'Undo',
        textRedo: 'Redo',
        textDownload: 'Download file'
    }, Common.Views.CustomizeQuickAccessDialog || {}))
});