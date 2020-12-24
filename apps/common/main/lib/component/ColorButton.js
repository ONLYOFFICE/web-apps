/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/Button',
    'common/main/lib/component/ThemeColorPalette'
], function () {
    'use strict';

    Common.UI.ColorButton = Common.UI.Button.extend(_.extend({
        options : {
            hint: false,
            enableToggle: false,
            visible: true
        },

        template: _.template([
            '<div class="btn-group" id="<%= id %>">',
                '<button type="button" class="btn btn-color dropdown-toggle <%= cls %>" data-toggle="dropdown" style="<%= style %>">',
                    '<span>&nbsp;</span>',
                    '<span class="inner-box-caret"><i class="caret img-commonctrl"></i></span>',
                '</button>',
            '</div>'
        ].join('')),

        initialize : function(options) {
            if (!options.menu && options.menu !== false) {// menu==null or undefined
                // set default menu
                var me = this;
                options.menu = me.getMenu(options);
                me.on('render:after', function(btn) {
                    me.getPicker(options.color, options.colors);
                });
            }

            Common.UI.Button.prototype.initialize.call(this, options);
        },

        render: function(parentEl) {
            Common.UI.Button.prototype.render.call(this, parentEl);

            if (this.options.color!==undefined)
                this.setColor(this.options.color);
        },

        onColorSelect: function(picker, color) {
            this.setColor(color);
            this.trigger('color:select', this, color);
        },

        setColor: function(color) {
            var span = $(this.cmpEl).find('button span:nth-child(1)');
            this.color = color;

            span.toggleClass('color-transparent', color=='transparent');
            span.css({'background-color': (color=='transparent') ? color : ((typeof(color) == 'object') ? '#'+color.color : '#'+color)});
        },

        getPicker: function(color, colors) {
            if (!this.colorPicker) {
                this.colorPicker = new Common.UI.ThemeColorPalette({
                    el: this.cmpEl.find('#' + this.menu.id + '-color-menu'),
                    transparent: this.options.transparent,
                    value: color,
                    colors: colors
                });
                this.colorPicker.on('select', _.bind(this.onColorSelect, this));
                this.cmpEl.find('#' + this.menu.id + '-color-new').on('click', _.bind(this.addNewColor, this));
            }
            return this.colorPicker;
        },

        getMenu: function(options) {
            if (typeof this.menu !== 'object') {
                options = options || this.options;
                var height = options.paletteHeight || 216;
                var id = Common.UI.getId(),
                    menu = new Common.UI.Menu({
                    id: id,
                    cls: 'shifted-left',
                    additionalAlign: options.additionalAlign,
                    items: (options.additionalItems ? options.additionalItems : []).concat([
                        { template: _.template('<div id="' + id + '-color-menu" style="width: 169px; height:' + height + 'px; margin: 10px;"></div>') },
                        { template: _.template('<a id="' + id + '-color-new" style="">' + this.textNewColor + '</a>') }
                    ])
                });
                return menu;
            }
            return this.menu;
        },

        setMenu: function (m) {
            m = m || this.getMenu();
            Common.UI.Button.prototype.setMenu.call(this, m);
            this.getPicker(this.options.color, this.options.colors);
        },

        addNewColor: function() {
            this.colorPicker && this.colorPicker.addNewColor((typeof(this.color) == 'object') ? this.color.color : this.color);
        },

        textNewColor: 'Add New Custom Color'

    }, Common.UI.ColorButton || {}));
});