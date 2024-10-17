/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
                    labelText: this.textSave,
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
        },

        getFocusedComponents: function() {
            return this.focusedComponents.concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.focusedComponents[0];
        },

        onBtnClick: function(event) {
            if (event.currentTarget.attributes['result'].value == 'ok') {
                Common.NotificationCenter.trigger('quickaccess:changed', {
                    save: this.chSave.getValue() == 'checked',
                    print: this.chPrint.getValue() == 'checked',
                    quickPrint: this.chQuickPrint ? this.chQuickPrint.getValue() == 'checked' : undefined,
                    undo: this.chUndo.getValue() == 'checked',
                    redo: this.chRedo.getValue() == 'checked'
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
        textRedo: 'Redo'
    }, Common.Views.CustomizeQuickAccessDialog || {}))
});