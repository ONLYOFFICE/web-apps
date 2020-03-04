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

/**
 *  ListSettingsDialog.js
 *
 *  Created by Julia Radzhabova on 30.10.2019
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/ThemeColorPalette',
    'common/main/lib/component/ColorButton',
    'common/main/lib/view/SymbolTableDialog'
], function () { 'use strict';

    Common.Views.ListSettingsDialog = Common.UI.Window.extend(_.extend({
        options: {
            type: 0, // 0 - markers, 1 - numbers
            width: 230,
            height: 200,
            style: 'min-width: 240px;',
            cls: 'modal-dlg',
            split: false,
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            this.type = options.type || 0;

            _.extend(this.options, {
                title: this.txtTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div class="input-row" style="margin-bottom: 10px;">',
                    '<label class="text" style="width: 70px;">' + this.txtSize + '</label><div id="id-dlg-list-size"></div><label class="text" style="margin-left: 10px;">' + this.txtOfText + '</label>',
                    '</div>',
                    '<div style="margin-bottom: 10px;">',
                    '<label class="text" style="width: 70px;">' + this.txtColor + '</label><div id="id-dlg-list-color" style="display: inline-block;"></div>',
                    '</div>',
                    '<% if (type == 0) { %>',
                    '<div class="input-row" style="margin-bottom: 10px;">',
                    '<label class="text" style="width: 70px;vertical-align: top;">' + this.txtBullet + '</label>',
                    '<button type="button" class="btn btn-text-default" id="id-dlg-list-edit" style="width:53px;display: inline-block;vertical-align: top;"></button>',
                    '</div>',
                    '<% } %>',
                    '<% if (type == 1) { %>',
                    '<div class="input-row" style="margin-bottom: 10px;">',
                    '<label class="text" style="width: 70px;">' + this.txtStart + '</label><div id="id-dlg-list-start"></div>',
                    '</div>',
                    '<% } %>',
                '</div>'
            ].join('');

            this.props = options.props;
            this.options.tpl = _.template(this.template)(this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.menuAddAlign = function(menuRoot, left, top) {
                var self = this;
                if (!$window.hasClass('notransform')) {
                    $window.addClass('notransform');
                    menuRoot.addClass('hidden');
                    setTimeout(function() {
                        menuRoot.removeClass('hidden');
                        menuRoot.css({left: left, top: top});
                        self.options.additionalAlign = null;
                    }, 300);
                } else {
                    menuRoot.css({left: left, top: top});
                    self.options.additionalAlign = null;
                }
            };

            this.spnSize = new Common.UI.MetricSpinner({
                el          : $window.find('#id-dlg-list-size'),
                step        : 1,
                width       : 53,
                value       : 100,
                defaultUnit : '',
                maxValue    : 400,
                minValue    : 25,
                allowDecimal: false
            }).on('change', function(field, newValue, oldValue, eOpts){
                if (me._changedProps) {
                    me._changedProps.asc_putBulletSize(field.getNumberValue());
                }
            });

            this.btnColor = new Common.UI.ColorButton({
                style: "width:53px;",
                menu        : new Common.UI.Menu({
                    additionalAlign: this.menuAddAlign,
                    items: [
                        { template: _.template('<div id="id-dlg-list-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                        { template: _.template('<a id="id-dlg-list-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                    ]
                })
            });
            this.btnColor.on('render:after', function(btn) {
                me.colors = new Common.UI.ThemeColorPalette({
                    el: $('#id-dlg-list-color-menu'),
                    transparent: false
                });
                me.colors.on('select', _.bind(me.onColorsSelect, me));
            });
            this.btnColor.render($window.find('#id-dlg-list-color'));
            $('#id-dlg-list-color-new').on('click', _.bind(this.addNewColor, this, this.colors));

            this.spnStart = new Common.UI.MetricSpinner({
                el          : $window.find('#id-dlg-list-start'),
                step        : 1,
                width       : 53,
                value       : 1,
                defaultUnit : '',
                maxValue    : 32767,
                minValue    : 1,
                allowDecimal: false
            }).on('change', function(field, newValue, oldValue, eOpts){
                if (me._changedProps) {
                    me._changedProps.put_NumStartAt(field.getNumberValue());
                }
            });

            this.btnEdit = new Common.UI.Button({
                el: $window.find('#id-dlg-list-edit'),
                hint: this.tipChange
            });
            this.btnEdit.on('click', _.bind(this.onEditBullet, this));
            this.btnEdit.cmpEl.css({'font-size': '16px', 'line-height': '16px'});

            this.afterRender();
        },

        afterRender: function() {
            this.updateThemeColors();
            this._setDefaults(this.props);
        },

        updateThemeColors: function() {
            this.colors.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
        },

        addNewColor: function(picker, btn) {
            picker.addNewColor((typeof(btn.color) == 'object') ? btn.color.color : btn.color);
        },

        onColorsSelect: function(picker, color) {
            this.btnColor.setColor(color);
            if (this._changedProps) {
                this._changedProps.asc_putBulletColor(Common.Utils.ThemeColor.getRgbColor(color));
            }
        },

        onEditBullet: function() {
            var me = this,
                props = me.bulletProps,
                handler = function(dlg, result, settings) {
                    if (result == 'ok') {
                        props.changed = true;
                        props.code = settings.code;
                        props.font = settings.font;
                        props.symbol = settings.symbol;
                        props.font && me.btnEdit.cmpEl.css('font-family', props.font);
                        settings.symbol && me.btnEdit.setCaption(settings.symbol);
                        if (me._changedProps) {
                            me._changedProps.asc_putBulletFont(props.font);
                            me._changedProps.asc_putBulletSymbol(props.symbol);
                        }
                    }
                },
                win = new Common.Views.SymbolTableDialog({
                    api: me.options.api,
                    lang: me.options.interfaceLang,
                    modal: true,
                    type: 0,
                    font: props.font,
                    symbol: props.symbol,
                    handler: handler
                });
            win.show();
            win.on('symbol:dblclick', handler);
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, state, this._changedProps);
            }
            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        _setDefaults: function (props) {
            if (props) {
                this.spnSize.setValue(props.asc_getBulletSize() || '', true);
                var value = props.get_NumStartAt();
                this.spnStart.setValue(value || '', true);
                this.spnStart.setDisabled(value===null);
                var color = props.asc_getBulletColor();
                if (color) {
                    if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                        color = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value()};
                    } else {
                        color = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                    }
                } else
                    color = 'transparent';
                this.btnColor.setColor(color);
                if ( typeof(color) == 'object' ) {
                    var isselected = false;
                    for (var i=0; i<10; i++) {
                        if ( Common.Utils.ThemeColor.ThemeValues[i] == color.effectValue ) {
                            this.colors.select(color,true);
                            isselected = true;
                            break;
                        }
                    }
                    if (!isselected) this.colors.clearSelection();
                } else
                    this.colors.select(color,true);

                if (this.type==0) {
                    this.bulletProps = {symbol: props.asc_getBulletSymbol(), font: props.asc_getBulletFont()};
                    this.bulletProps.font && this.btnEdit.cmpEl.css('font-family', this.bulletProps.font);
                    this.bulletProps.symbol && this.btnEdit.setCaption(this.bulletProps.symbol);
                }
            }
            this._changedProps = new Asc.asc_CParagraphProperty();
        },

        txtTitle: 'List Settings',
        txtSize: 'Size',
        txtColor: 'Color',
        txtOfText: '% of text',
        textNewColor: 'Add New Custom Color',
        txtStart: 'Start at',
        txtBullet: 'Bullet',
        tipChange: 'Change bullet'
    }, Common.Views.ListSettingsDialog || {}))
});