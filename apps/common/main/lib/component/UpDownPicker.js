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
 *  UpDownPicker.js
 *
 *  Created on 3/29/23
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView'
], function () {
    'use strict';

    Common.UI.UpDownPicker = Common.UI.BaseView.extend((function(){
        return {
            options: {
                caption: '',
                iconUpCls: 'btn-zoomup',
                iconDownCls: 'btn-zoomdown',
                minWidth: 40
            },
            disabled    : false,

            template:_.template([
                '<label class="title float-left"><%= options.caption %></label>',
                '<button type="button" class="btn small btn-toolbar updown-picker-button-up float-right"><i class="icon menu__icon <%= options.iconUpCls %>">&nbsp;</i></button>',
                '<label class="updown-picker-value float-right" style="min-width: <%= options.minWidth %>px;"></label>',
                '<button type="button" class="btn small btn-toolbar updown-picker-button-down float-right"><i class="icon menu__icon <%= options.iconDownCls %>">&nbsp;</i></button>'
            ].join('')),

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.render();

                this.cmpEl = this.$el || $(this.el);

                this.btnUp = new Common.UI.Button({
                    el:  this.cmpEl.find('.updown-picker-button-up')
                }).on('click', _.bind(function () {
                    this.trigger('click', 'up');
                }, this));

                this.btnDown = new Common.UI.Button({
                    el:  this.cmpEl.find('.updown-picker-button-down')
                }).on('click', _.bind(function () {
                    this.trigger('click', 'down');
                }, this));

                this.displayValue = this.cmpEl.find('.updown-picker-value');

                if (this.options.disabled)
                    this.setDisabled(this.options.disabled);
            },

            render: function() {
                var el = this.$el || $(this.el);
                el.html($(this.template({
                    options: this.options
                })));

                this.rendered = true;

                return this;
            },

            setValue: function(value) {
                this.displayValue.html(value || '');
            },

            setDisabled: function(disabled) {
                if (!this.rendered)
                    return;

                disabled = (disabled===true);
                if (disabled !== this.disabled) {
                    this.btnUp.setDisabled(disabled);
                    this.btnDown.setDisabled(disabled);
                }

                this.disabled = disabled;
            }
        }
    })())
});
