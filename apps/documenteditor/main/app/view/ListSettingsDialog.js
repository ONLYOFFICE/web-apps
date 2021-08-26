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
    'common/main/lib/component/ComboBox',
    'common/main/lib/view/SymbolTableDialog'
], function () { 'use strict';

    DE.Views.ListSettingsDialog = Common.UI.Window.extend(_.extend({
        options: {
            type: 0, // 0 - markers, 1 - numbers, 2 - multilevel
            width: 300,
            height: 422,
            style: 'min-width: 240px;',
            cls: 'modal-dlg',
            split: false,
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            this.type = options.type || 0;

            _.extend(this.options, {
                title: this.txtTitle,
                height: (this.type==2) ? 376 : 422,
                width: (this.type==2) ? 430 : 300
        }, options || {});

            this.template = [
                '<div class="box">',
                '<% if (type == 2) { %>',
                    '<table cols="4" style="width: 100%;">',
                        '<tr>',
                            '<td style="padding-right: 5px;">',
                                '<label class="input-label">' + this.txtType + '</label>',
                                '<div id="id-dlg-numbering-format" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td style="padding-left: 5px;padding-right: 5px;">',
                                '<label class="input-label">' + this.txtAlign + '</label>',
                                '<div id="id-dlg-bullet-align" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td style="padding-left: 5px;padding-right: 5px;">',
                                '<label class="input-label">' + this.txtSize + '</label>',
                                '<div id="id-dlg-bullet-size" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td style="padding-left: 5px;">',
                                '<label class="input-label">' + this.txtColor + '</label>',
                                '<div id="id-dlg-bullet-color" style="margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '<% } else {%>',
                    '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td style="padding-right: 5px;">',
                                '<% if (type == 0) { %>',
                                '<label class="input-label">' + this.txtBullet + '</label>',
                                '<button type="button" class="btn btn-text-default" id="id-dlg-bullet-font" style="width: 100%;margin-bottom: 10px;">' + this.txtFont + '</button>',
                                '<% } else { %>',
                                '<label class="input-label">' + this.txtType + '</label>',
                                '<div id="id-dlg-numbering-format" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                                '<% } %>',
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
                '</table>',
                '<% } %>',
                '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td class="<% if (type != 2) { %> hidden <% } %>" style="width: 50px; padding-right: 10px;">',
                                '<label>' + this.textLevel + '</label>',
                                '<div id="levels-list" class="no-borders" style="width:100%; height:208px;margin-top: 2px; "></div>',
                            '</td>',
                            '<td>',
                                '<label>' + this.textPreview + '</label>',
                                '<div id="bulleted-list-preview"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '</div>'
            ].join('');

            this.props = options.props;
            this.level = options.level || 0;
            this.api = options.api;
            this.options.tpl = _.template(this.template)(this.options);
            this.levels = [];

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.btnColor = new Common.UI.ColorButton({
                parentEl: $window.find('#id-dlg-bullet-color'),
                additionalItems: [{
                        id: 'id-dlg-bullet-text-color',
                        caption: this.txtLikeText,
                        checkable: true,
                        toggleGroup: 'list-settings-color',
                        style: 'padding-left: 20px;'
                    },
                    {
                        id: 'id-dlg-bullet-auto-color',
                        caption: this.textAuto,
                        checkable: true,
                        toggleGroup: 'list-settings-color',
                        style: 'padding-left: 20px;'
                    },
                    {caption: '--'}],
                additionalAlign: this.menuAddAlign
            });
            this.btnColor.on('color:select', _.bind(this.onColorsSelect, this));
            this.btnColor.menu.items[0].on('toggle', _.bind(this.onLikeTextColor, this));
            this.btnColor.menu.items[1].on('toggle', _.bind(this.onAutoColor, this));
            this.colors = this.btnColor.getPicker();

            this.btnEdit = new Common.UI.Button({
                el: $window.find('#id-dlg-bullet-font')
            });
            this.btnEdit.on('click', _.bind(this.onEditBullet, this));

            var itemsTemplate =
                [
                    '<% _.each(items, function(item) { %>',
                    '<li id="<%= item.id %>" data-value="<%= item.value %>"><a tabindex="-1" type="menuitem">',
                    '<%= item.displayValue %><% if (item.value === Asc.c_oAscNumberingFormat.Bullet) { %><span style="font-family:<%=item.font%>;"><%=item.symbol%></span><% } %>',
                    '</a></li>',
                    '<% }); %>'
                ];
            var template = [
                '<div class="input-group combobox input-group-nr <%= cls %>" id="<%= id %>" style="<%= style %>">',
                '<div class="form-control" style="padding-top:3px; line-height: 14px; cursor: pointer; <%= style %>"></div>',
                '<div style="display: table-cell;"></div>',
                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>',
                    '<ul class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">'].concat(itemsTemplate).concat([
                    '</ul>',
                '</div>'
            ]);
            this.cmbFormat = new Common.UI.ComboBoxCustom({
                el          : $window.find('#id-dlg-numbering-format'),
                menuStyle   : 'min-width: 100%;max-height: 183px;',
                style       : this.type==2 ? "width: 107px;" : "width: 129px;",
                editable    : false,
                template    : _.template(template.join('')),
                itemsTemplate: _.template(itemsTemplate.join('')),
                takeFocusOnClose: true,
                data        : [
                    { displayValue: this.txtNone,       value: Asc.c_oAscNumberingFormat.None },
                    { displayValue: '1, 2, 3,...',      value: Asc.c_oAscNumberingFormat.Decimal },
                    { displayValue: 'a, b, c,...',      value: Asc.c_oAscNumberingFormat.LowerLetter },
                    { displayValue: 'A, B, C,...',      value: Asc.c_oAscNumberingFormat.UpperLetter },
                    { displayValue: 'i, ii, iii,...',   value: Asc.c_oAscNumberingFormat.LowerRoman },
                    { displayValue: 'I, II, III,...',   value: Asc.c_oAscNumberingFormat.UpperRoman }
                ],
                updateFormControl: function(record) {
                    var formcontrol = $(this.el).find('.form-control');
                    if (record) {
                        if (record.get('value')==Asc.c_oAscNumberingFormat.Bullet)
                            formcontrol[0].innerHTML = record.get('displayValue') + '<span style="font-family:' + (record.get('font') || 'Arial') + '">' + record.get('symbol') + '</span>';
                        else
                            formcontrol[0].innerHTML = record.get('displayValue');
                    } else
                        formcontrol[0].innerHTML = '';
                }
            });
            this.cmbFormat.on('selected', _.bind(function (combo, record) {
                if (this._changedProps) {
                    if (record.value == -1) {
                        var callback = function(result) {
                            var format = me._changedProps.get_Format();
                            if (format == Asc.c_oAscNumberingFormat.Bullet) {
                                var store = combo.store;
                                if (!store.findWhere({value: Asc.c_oAscNumberingFormat.Bullet, symbol: me.bulletProps.symbol, font: me.bulletProps.font}))
                                    store.add({ displayValue: me.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: me.bulletProps.symbol, font: me.bulletProps.font }, {at: store.length-1});
                                combo.setData(store.models);
                                combo.selectRecord(combo.store.findWhere({value: Asc.c_oAscNumberingFormat.Bullet, symbol: me.bulletProps.symbol, font: me.bulletProps.font}));
                            } else
                                combo.setValue(format || '');
                        };
                        this.addNewBullet(callback);
                    } else {
                        var oldformat = this._changedProps.get_Format();
                        this._changedProps.put_Format(record.value);
                        if (record.value == Asc.c_oAscNumberingFormat.Bullet) {
                            this.bulletProps.font = record.font;
                            this.bulletProps.symbol = record.symbol;
                            if (!this._changedProps.get_TextPr()) this._changedProps.put_TextPr(new AscCommonWord.CTextPr());
                            this._changedProps.get_TextPr().put_FontFamily(this.bulletProps.font);

                            this._changedProps.put_Text([new Asc.CAscNumberingLvlText()]);
                            this._changedProps.get_Text()[0].put_Value(this.bulletProps.symbol);
                        } else if (record.value == Asc.c_oAscNumberingFormat.None || oldformat == Asc.c_oAscNumberingFormat.Bullet) {
                            if (!this._changedProps.get_TextPr()) this._changedProps.put_TextPr(new AscCommonWord.CTextPr());
                            this._changedProps.get_TextPr().put_FontFamily(undefined);

                            this._changedProps.put_Text([new Asc.CAscNumberingLvlText()]);
                            this._changedProps.get_Text()[0].put_Type(Asc.c_oAscNumberingLvlTextType.Num);
                            this._changedProps.get_Text()[0].put_Value(this.level);
                        }
                    }
                }
                if (this.api) {
                    this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
                }
            }, this));

            this.cmbAlign = new Common.UI.ComboBox({
                el          : $window.find('#id-dlg-bullet-align'),
                menuStyle   : 'min-width: 100%;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: AscCommon.align_Left, displayValue: this.textLeft },
                    { value: AscCommon.align_Center, displayValue: this.textCenter },
                    { value: AscCommon.align_Right, displayValue: this.textRight }
                ],
                takeFocusOnClose: true
            });
            this.cmbAlign.on('selected', _.bind(function (combo, record) {
                if (this._changedProps)
                    this._changedProps.put_Align(record.value);
                if (this.api) {
                    this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
                }
            }, this));

            this.cmbSize = new Common.UI.ComboBox({
                el          : $window.find('#id-dlg-bullet-size'),
                menuStyle   : 'min-width: 100%;max-height: 183px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: -1, displayValue: this.txtLikeText },
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
                ],
                takeFocusOnClose: true
            });
            this.cmbSize.on('selected', _.bind(function (combo, record) {
                if (this._changedProps) {
                    if (!this._changedProps.get_TextPr()) this._changedProps.put_TextPr(new AscCommonWord.CTextPr());
                    this._changedProps.get_TextPr().put_FontSize((record.value>0) ? record.value : undefined);
                }
                if (this.api) {
                    this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
                }
            }, this));

            var levels = [];
            for (var i=0; i<9; i++)
                levels.push({value: i});
            this.levelsList = new Common.UI.ListView({
                el: $('#levels-list', this.$window),
                store: new Common.UI.DataViewStore(levels),
                tabindex: 1,
                itemTemplate: _.template('<div id="<%= id %>" class="list-item" style="pointer-events:none;overflow: hidden; text-overflow: ellipsis;line-height: 15px;"><%= (value+1) %></div>')
            });
            this.levelsList.on('item:select', _.bind(this.onSelectLevel, this));

            this.on('animate:after', _.bind(this.onAnimateAfter, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.btnEdit, this.cmbFormat, this.cmbAlign, this.cmbSize, this.levelsList];
        },

        getDefaultFocusableComponent: function () {
            return this.type > 0 ? this.cmbFormat : this.cmbAlign;
        },

        onAnimateAfter: function() {
            if (this.api) {
                this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
            }
        },

        afterRender: function() {
            this.updateThemeColors();
            this._setDefaults(this.props);
            var me = this;
            var onApiLevelChange = function(level) {
                me.levelsList.selectByIndex(level);
            };
            this.api.asc_registerCallback('asc_onPreviewLevelChange', onApiLevelChange);
            this.on('close', function(obj){
                me.api.asc_unregisterCallback('asc_onPreviewLevelChange', onApiLevelChange);
            });
        },

        updateThemeColors: function() {
            this.colors.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
        },

        onAutoColor: function(item, state) {
            if (!!state) {
                var color = Common.Utils.ThemeColor.getHexColor(0, 0, 0);
                this.btnColor.setColor(color);
                this.colors.clearSelection();
                if (this._changedProps) {
                    if (!this._changedProps.get_TextPr()) this._changedProps.put_TextPr(new AscCommonWord.CTextPr());
                    var color = new Asc.asc_CColor();
                    color.put_auto(true);
                    this._changedProps.get_TextPr().put_Color(color);
                }
                if (this.api) {
                    this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
                }
            }
        },

        onLikeTextColor: function(item, state) {
            if (!!state) {
                var color = Common.Utils.ThemeColor.getHexColor(0, 0, 0);
                this.btnColor.setColor(color);
                this.colors.clearSelection();
                if (this._changedProps) {
                    if (!this._changedProps.get_TextPr()) this._changedProps.put_TextPr(new AscCommonWord.CTextPr());
                    this._changedProps.get_TextPr().put_Color(undefined);
                }
                if (this.api) {
                    this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
                }
            }
        },

        onColorsSelect: function(btn, color) {
            if (this._changedProps) {
                if (!this._changedProps.get_TextPr()) this._changedProps.put_TextPr(new AscCommonWord.CTextPr());
                this._changedProps.get_TextPr().put_Color(Common.Utils.ThemeColor.getRgbColor(color));
            }
            this.btnColor.menu.items[0].setChecked(false, true);
            this.btnColor.menu.items[1].setChecked(false, true);
            if (this.api) {
                this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
            }
        },

        onEditBullet: function(callback) {
            this.addNewBullet();
        },

        addNewBullet: function(callback) {
            var me = this,
                props = me.bulletProps,
                handler = function(dlg, result, settings) {
                    if (result == 'ok') {
                        props.changed = true;
                        props.code = settings.code;
                        props.font = settings.font;
                        props.symbol = settings.symbol;
                        if (me._changedProps) {
                            me._changedProps.put_Format(Asc.c_oAscNumberingFormat.Bullet);
                            if (!me._changedProps.get_TextPr()) me._changedProps.put_TextPr(new AscCommonWord.CTextPr());
                            me._changedProps.get_TextPr().put_FontFamily(props.font);

                            me._changedProps.put_Text([new Asc.CAscNumberingLvlText()]);
                            me._changedProps.get_Text()[0].put_Value(props.symbol);
                            if (me.api) {
                                me.api.SetDrawImagePreviewBullet('bulleted-list-preview', me.props, me.level, me.type==2);
                            }
                        }
                    }
                    callback && callback.call(me, result);
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
                var props = [], lvlnum = [];
                for (var i=0; i<9; i++) {
                    if (!this.levels[i]) continue;
                    props.push(this.levels[i]);
                    lvlnum.push(i);
                }
                this.options.handler.call(this, state, {props: (props.length==1) ? props[0] : props, num: (lvlnum.length==1) ? lvlnum[0] : lvlnum});
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
                var levelProps = props.get_Lvl(this.level);
                (this.level<0) && (this.level = 0);
                this.levels[this.level] = levelProps || new Asc.CAscNumberingLvl(this.level);

                if (this.type==2) {
                    var store = this.cmbFormat.store;
                    store.push([
                            { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "·", font: 'Symbol' },
                            { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "o", font: 'Courier New' },
                            { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "§", font: 'Wingdings' },
                            { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "v", font: 'Wingdings' },
                            { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "Ø", font: 'Wingdings' },
                            { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "ü", font: 'Wingdings' },
                            { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "¨", font: 'Symbol' },
                            { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "–", font: 'Arial' },
                            { displayValue: this.txtNewBullet, value: -1 }
                            ]);
                    this.cmbFormat.setData(store.models);
                    this.levelsList.selectByIndex(this.level);
                } else
                    this.fillLevelProps(this.levels[this.level]);
            }
            this._changedProps = this.levels[this.level];
        },

        onSelectLevel: function(listView, itemView, record) {
            this.level = record.get('value');
            if (this.levels[this.level] === undefined)
                this.levels[this.level] = this.props.get_Lvl(this.level);
            this.fillLevelProps(this.levels[this.level]);
            this._changedProps = this.levels[this.level];
        },

        fillLevelProps: function(levelProps) {
            if (!levelProps) return;

            this.cmbAlign.setValue((levelProps.get_Align()!==undefined) ? levelProps.get_Align() : '');
            var format = levelProps.get_Format(),
                textPr = levelProps.get_TextPr(),
                text = levelProps.get_Text();
            if (text && format == Asc.c_oAscNumberingFormat.Bullet) {
                this.bulletProps.symbol = text[0].get_Value();
            }
            if (textPr) {
                this.cmbSize.setValue(textPr.get_FontSize() || -1);
                this.bulletProps.font = textPr.get_FontFamily();

                var color = textPr.get_Color();
                this.btnColor.menu.items[0].setChecked(color===undefined, true);
                this.btnColor.menu.items[1].setChecked(!!color && color.get_auto(), true);
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
                    color = '000000';
                }
                this.btnColor.setColor(color);
            }
            if (this.type>0) {
                if (format == Asc.c_oAscNumberingFormat.Bullet) {
                    if (!this.cmbFormat.store.findWhere({value: Asc.c_oAscNumberingFormat.Bullet, symbol: this.bulletProps.symbol, font: this.bulletProps.font}))
                        this.cmbFormat.store.add({ displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: this.bulletProps.symbol, font: this.bulletProps.font }, {at: this.cmbFormat.store.length-1});
                    this.cmbFormat.setData(this.cmbFormat.store.models);
                    this.cmbFormat.selectRecord(this.cmbFormat.store.findWhere({value: Asc.c_oAscNumberingFormat.Bullet, symbol: this.bulletProps.symbol, font: this.bulletProps.font}));
                } else
                    this.cmbFormat.setValue((format!==undefined) ? format : '');
            }
        },

        txtTitle: 'List Settings',
        txtSize: 'Size',
        txtColor: 'Color',
        txtBullet: 'Bullet',
        txtFont: 'Font and Symbol',
        txtAlign: 'Alignment',
        textLeft: 'Left',
        textCenter: 'Center',
        textRight: 'Right',
        textAuto: 'Automatic',
        textPreview: 'Preview',
        txtType: 'Type',
        txtLikeText: 'Like a text',
        textLevel: 'Level',
        txtNone: 'None',
        txtNewBullet: 'New bullet',
        txtSymbol: 'Symbol'
    }, DE.Views.ListSettingsDialog || {}))
});