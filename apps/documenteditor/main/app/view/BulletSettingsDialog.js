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
 *  BulletSettingsDialog.js
 *
 *  Created by Julia Radzhabova on 03.12.2019
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

    DE.Views.BulletSettingsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 300,
            height: 334,
            style: 'min-width: 240px;',
            cls: 'modal-dlg',
            split: false,
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.txtTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td style="padding-right: 5px;">',
                                '<label class="input-label">' + this.txtBullet + '</label>',
                                '<button type="button" class="btn btn-text-default" id="id-dlg-bullet-font" style="width: 100%;margin-bottom: 10px;">' + this.txtFont + '</button>',
                            '</td>',
                            '<td style="padding-left: 5px;">',
                                '<label class="input-label">' + this.txtAlign + '</label>',
                                '<div id="id-dlg-bullet-align" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td style="padding-right: 5px;">',
                                '<label class="input-label">' + this.txtSize + '</label>',
                                '<div id="id-dlg-bullet-size" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td style="padding-left: 5px;">',
                                '<label class="input-label">' + this.txtColor + '</label>',
                                '<div id="id-dlg-bullet-color" style="margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2">',
                                '<label>' + this.textPreview + '</label>',
                                '<div id="page-margins-preview" style="margin-top: 2px; height: 120px; width: 100%; border: 1px solid #cfcfcf;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '</div>'
            ].join('');

            this.props = options.props;
            this.level = options.level;
            this.options.tpl = _.template(this.template)(this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.btnColor = new Common.UI.ColorButton({
                style: 'width:45px;',
                menu        : new Common.UI.Menu({
                    additionalAlign: this.menuAddAlign,
                    items: [
                        {
                            id: 'id-dlg-bullet-auto-color',
                            caption: this.textAuto,
                            template: _.template('<a tabindex="-1" type="menuitem"><span class="menu-item-icon" style="background-image: none; width: 12px; height: 12px; margin: 1px 7px 0 -7px; background-color: #dcdcdc;"></span><%= caption %></a>')
                        },
                        {caption: '--'},
                        { template: _.template('<div id="id-dlg-bullet-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                        { template: _.template('<a id="id-dlg-bullet-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                    ]
                })
            });
            this.btnColor.on('render:after', function(btn) {
                me.colors = new Common.UI.ThemeColorPalette({
                    el: $window.find('#id-dlg-bullet-color-menu'),
                    transparent: false
                });
                me.colors.on('select', _.bind(me.onColorsSelect, me));
            });
            this.btnColor.render($window.find('#id-dlg-bullet-color'));
            $window.find('#id-dlg-bullet-color-new').on('click', _.bind(this.addNewColor, this, this.colors));
            $window.find('#id-dlg-bullet-auto-color').on('click', _.bind(this.onAutoColor, this));

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

            this.btnEdit = new Common.UI.Button({
                el: $window.find('#id-dlg-bullet-font')
            });
            this.btnEdit.on('click', _.bind(this.onEditBullet, this));

            this.cmbAlign = new Common.UI.ComboBox({
                el          : $window.find('#id-dlg-bullet-align'),
                menuStyle   : 'min-width: 100%;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: AscCommon.align_Left, displayValue: this.textLeft },
                    { value: AscCommon.align_Center, displayValue: this.textCenter },
                    { value: AscCommon.align_Right, displayValue: this.textRight }
                ]
            });
            this.cmbAlign.on('selected', _.bind(function (combo, record) {
                if (this._changedProps)
                    this._changedProps.put_Align(record.value);
                if (this.api) {
                    //this.api.SetDrawImagePreviewMargins('page-margins-preview', this.properties);
                }
            }, this));

            this.cmbSize = new Common.UI.ComboBox({
                el          : $window.find('#id-dlg-bullet-size'),
                menuStyle   : 'min-width: 100%;max-height: 310px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: -1, displayValue: this.textAuto },
                    { value: 8, displayValue: "8" },
                    { value: 9, displayValue: "9" },
                    { value: 10, displayValue: "10" },
                    { value: 11, displayValue: "11" },
                    { value: 12, displayValue: "12" },
                    { value: 14, displayValue: "14" },
                    { value: 16, displayValue: "16" },
                    { value: 18, displayValue: "18" },
                    { value: 20, displayValue: "20" },
                    { value: 22, displayValue: "22" },
                    { value: 24, displayValue: "24" },
                    { value: 26, displayValue: "26" },
                    { value: 28, displayValue: "28" },
                    { value: 36, displayValue: "36" },
                    { value: 48, displayValue: "48" },
                    { value: 72, displayValue: "72" },
                    { value: 96, displayValue: "96" }
                ]
            });
            this.cmbSize.on('selected', _.bind(function (combo, record) {
                if (this._changedProps) {
                    if (!this._changedProps.get_TextPr()) this._changedProps.put_TextPr(new AscCommonWord.CTextPr());
                    this._changedProps.get_TextPr().put_FontSize(record.value);
                }
                if (this.api) {
                    //this.api.SetDrawImagePreviewMargins('page-margins-preview', this.properties);
                }
            }, this));

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

        onAutoColor: function(e) {
            var color = Common.Utils.ThemeColor.getHexColor(220, 220, 220);
            this.btnColor.setColor(color);
            this.colors.clearSelection();
            var clr_item = this.btnColor.menu.$el.find('#id-dlg-bullet-auto-color > a');
            !clr_item.hasClass('selected') && clr_item.addClass('selected');
            this.isAutoColor = true;
        },

        onColorsSelect: function(picker, color) {
            this.btnColor.setColor(color);
            if (this._changedProps) {
                // this._changedProps.asc_putBulletColor(Common.Utils.ThemeColor.getRgbColor(color));
            }
            this.isAutoColor = false;
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
                        if (me._changedProps) {
                            if (!me._changedProps.get_TextPr()) me._changedProps.put_TextPr(new AscCommonWord.CTextPr());
                            me._changedProps.get_TextPr().put_FontFamily(props.font);

                            if (!me._changedProps.get_Text()) me._changedProps.put_Text([]);
                            if (me._changedProps.get_Text().length<1) me._changedProps.get_Text().push(new Asc.CAscNumberingLvlText());
                            me._changedProps.get_Text()[0].put_Value(props.symbol);
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
            this.bulletProps = {};
            if (props) {
                this.cmbAlign.setValue(props.get_Align() || '');
                var textPr = props.get_TextPr(),
                    text = props.get_Text();
                if (text) {
                    this.bulletProps.symbol = text[0].get_Value();
                }
                if (textPr) {
                    this.cmbSize.setValue(textPr.get_FontSize() || -1);
                    this.bulletProps.font = textPr.get_FontFamily();

                    var color = textPr.get_Color();
                    if (color && !color.get_auto()) {
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
                            color = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                        } else
                            this.colors.select(color,true);
                    } else {
                        this.colors.clearSelection();
                        if (color && color.get_auto()) {
                            var clr_item = this.btnColor.menu.$el.find('#id-dlg-bullet-auto-color > a');
                            !clr_item.hasClass('selected') && clr_item.addClass('selected');
                            color = '000000';
                            this.isAutoColor = true;
                        } else
                            color = 'transparent';
                    }
                    this.btnColor.setColor(color);
                }
            }
            this._changedProps = new Asc.CAscNumberingLvl(this.level);
        },

        txtTitle: 'Define New Bullet',
        txtSize: 'Size',
        txtColor: 'Color',
        textNewColor: 'Add New Custom Color',
        txtBullet: 'Bullet',
        txtFont: 'Font and Symbol',
        txtAlign: 'Alignment',
        textLeft: 'Left',
        textCenter: 'Center',
        textRight: 'Right',
        textAuto: 'Auto',
        textPreview: 'Preview'
    }, DE.Views.BulletSettingsDialog || {}))
});