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
 *  NotesRemoveDialog.js
 *
 *  Created on 29.07.2020
 *
 */
define([], function () { 'use strict';

    DE.Views.NotesRemoveDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 214,
            header: true,
            style: 'min-width: 214px;',
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options);

            this.template = [
                '<div class="box">',
                '<div id="notes-remove-chk-foot" style="margin-bottom: 5px;"></div>',
                '<div id="notes-remove-chk-end"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.chFootnote = new Common.UI.CheckBox({
                el: $window.find('#notes-remove-chk-foot'),
                labelText: this.textFoot,
                value: true
            });

            this.chEndnote = new Common.UI.CheckBox({
                el: $window.find('#notes-remove-chk-end'),
                labelText: this.textEnd,
                value: true
            });
        },

        getFocusedComponents: function() {
            return [this.chFootnote, this.chEndnote].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.chFootnote;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        getSettings: function() {
            return {footnote: this.chFootnote.isChecked(), endnote: this.chEndnote.isChecked()};
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },
        textTitle: 'Delete Notes',
        textFoot: 'Delete All Footnotes',
        textEnd: 'Delete All Endnotes'
    }, DE.Views.NotesRemoveDialog || {}))
});