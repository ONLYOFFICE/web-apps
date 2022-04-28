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

  Common.UI.ButtonColored = Common.UI.Button.extend(_.extend({
        render: function(parentEl) {
            Common.UI.Button.prototype.render.call(this, parentEl);

            $('button:first-child', this.cmpEl).append( $('<div class="btn-color-value-line"></div>'));
            this.colorEl = this.cmpEl.find('.btn-color-value-line');

            if (this.options.auto)
                this.autocolor = (typeof this.options.auto == 'object') ? this.options.auto.color || '000000' : '000000';

            if (this.options.color!==undefined)
                this.setColor(this.options.color);
        },

        getPicker: function(color, colors) {
            if (!this.colorPicker) {
                var config = {
                    el: this.cmpEl.find('#' + this.menu.id + '-color-menu'),
                    value: color,
                    colors: colors
                };
                (this.options.transparent!==undefined) && (config['transparent'] = this.options.transparent);
                (this.options.hideEmptyColors!==undefined) && (config['hideEmptyColors'] = this.options.hideEmptyColors);

                this.colorPicker = new Common.UI.ThemeColorPalette(config);
                this.colorPicker.on('select', _.bind(this.onColorSelect, this));
                this.cmpEl.find('#' + this.menu.id + '-color-new').on('click', _.bind(this.addNewColor, this));
                if (this.options.auto) {
                    this.cmpEl.find('#' + this.menu.id + '-color-auto').on('click', _.bind(this.onAutoColorSelect, this));
                    this.colorAuto = this.cmpEl.find('#' + this.menu.id + '-color-auto > a');
                    (color == 'auto') && this.setAutoColor(true);
                }
                this.initInnerMenu();
            }
            return this.colorPicker;
        },

        setPicker: function(picker) {
            this.colorPicker = picker;
        },

        getMenu: function(options) {
            if (typeof this.menu !== 'object') {
                options = options || this.options;
                var height = options.paletteHeight ? options.paletteHeight + 'px' : 'auto',
                    id = Common.UI.getId(),
                    auto = [];
                if (options.auto) {
                    this.autocolor = (typeof options.auto == 'object') ? options.auto.color || '000000' : '000000';
                    auto.push({
                        id: id + '-color-auto',
                        caption: (typeof options.auto == 'object') ? options.auto.caption || this.textAutoColor : this.textAutoColor,
                        template: _.template('<a tabindex="-1" type="menuitem"><span class="menu-item-icon color-auto" style="background-image: none; width: 12px; height: 12px; margin: 1px 7px 0 1px; background-color: #' + this.autocolor + ';"></span><%= caption %></a>')
                    });
                    auto.push({caption: '--'});
                }

                var menu = new Common.UI.Menu({
                    id: id,
                    cls: 'shifted-left',
                    additionalAlign: options.additionalAlign,
                    items: (options.additionalItems ? options.additionalItems : []).concat(auto).concat([
                        { template: _.template('<div id="' + id + '-color-menu" style="width: 164px; height:' + height + '; display: inline-block;"></div>') },
                        {caption: '--'},
                        {
                            id: id + '-color-new',
                            template: _.template('<a tabindex="-1" type="menuitem" style="">' + this.textNewColor + '</a>')
                        }
                    ])
                });
                this.initInnerMenu();
                var me = this;
                menu.on('keydown:before', _.bind(this.onBeforeKeyDown, this));
                menu.on('show:after', function(menu) {
                    me.colorPicker && _.delay(function() {
                        me.colorPicker.showLastSelected();
                        !(options.additionalItems || options.auto) && me.colorPicker.focus();
                    }, 10);
                }).on('hide:after', function() {
                    if (me.options.takeFocusOnClose) {
                        setTimeout(function(){me.focus();}, 1);
                    }
                });
                return menu;
            }
            return this.menu;
        },

        initInnerMenu: function() {
            if (!this.colorPicker || typeof this.menu !== 'object') return;

            var index = (this.options.additionalItems || []).length + (this.options.auto ? 2 : 0);
            this.colorPicker.outerMenu = {menu: this.menu, index: index};
            this.menu.setInnerMenu([{menu: this.colorPicker, index: index}]);
        },
      
        setMenu: function (m) {
            m = m || this.getMenu();
            Common.UI.Button.prototype.setMenu.call(this, m);
            this.getPicker(this.options.color, this.options.colors);
        },

        onColorSelect: function(picker, color) {
            this.setColor(color);
            this.setAutoColor(false);
            this.trigger('color:select', this, color);
        },

        setColor: function(color) {
            if (color == 'auto' && this.options.auto)
                color = this.autocolor;
            this.color = color;

            if (this.colorEl) {
                this.colorEl.css({'background-color': (color=='transparent') ? color : ((typeof(color) == 'object') ? '#'+color.color : '#'+color)});
                this.colorEl.toggleClass('bordered', color=='transparent');
            }
        },

        setAutoColor: function(selected) {
            if (!this.colorAuto) return;
            if (selected && !this.colorAuto.hasClass('selected'))
                this.colorAuto.addClass('selected');
            else if (!selected && this.colorAuto.hasClass('selected'))
                this.colorAuto.removeClass('selected');
        },

        isAutoColor: function() {
            return this.colorAuto && this.colorAuto.hasClass('selected');
        },

        onAutoColorSelect: function() {
            this.setColor('auto');
            this.setAutoColor(true);
            this.colorPicker && this.colorPicker.clearSelection();
            this.trigger('auto:select', this, this.autocolor);
        },

        addNewColor: function() {
            this.colorPicker && this.colorPicker.addNewColor((typeof(this.color) == 'object') ? this.color.color : this.color);
        },

        onBeforeKeyDown: function(menu, e) {
            if ((e.keyCode == Common.UI.Keys.DOWN || e.keyCode == Common.UI.Keys.SPACE) && !this.isMenuOpen()) {
                $('button', this.cmpEl).click();
                return false;
            }
        },

        isMenuOpen: function() {
            return this.cmpEl.hasClass('open');
        },

        textNewColor: 'Add New Custom Color',
        textAutoColor: 'Automatic'

    }, Common.UI.ButtonColored || {}));


    Common.UI.ColorButton = Common.UI.ButtonColored.extend(_.extend({
        options : {
            id              : null,
            hint            : false,
            enableToggle    : false,
            allowDepress    : false,
            toggleGroup     : null,
            cls             : '',
            iconCls         : '',
            caption         : '',
            menu            : null,
            disabled        : false,
            pressed         : false,
            split           : false,
            visible         : true
        },

        template: _.template([
            '<div class="btn-group" id="<%= id %>">',
                '<button type="button" class="btn btn-color dropdown-toggle <%= cls %>" data-toggle="dropdown" style="<%= style %>" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>">',
                    '<span>&nbsp;</span>',
                    '<span class="inner-box-caret">',
                        '<i class="caret"></i>',
                    '</span>',
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

            if (this.options.auto)
                this.autocolor = (typeof this.options.auto == 'object') ? this.options.auto.color || '000000' : '000000';

            if (this.options.color!==undefined)
                this.setColor(this.options.color);
        },

        setColor: function(color) {
            if (color == 'auto' && this.options.auto)
                color = this.autocolor;
            var span = $(this.cmpEl).find('button span:nth-child(1)');
            this.color = color;

            span.toggleClass('color-transparent', color=='transparent');
            span.css({'background-color': (color=='transparent') ? color : ((typeof(color) == 'object') ? '#'+color.color : '#'+color)});
        },

        focus: function() {
            $('button', this.cmpEl).focus();
        }

    }, Common.UI.ColorButton || {}));
});