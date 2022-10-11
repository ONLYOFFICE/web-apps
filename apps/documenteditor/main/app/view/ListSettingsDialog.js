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
            height: 460,
            style: 'min-width: 240px;',
            cls: 'modal-dlg',
            split: false,
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            this.type = options.type || 0;

            _.extend(this.options, {
                title: this.txtTitle,
                height: (this.type==2) ? 520 : 424,
                width: (this.type==2) ? 460 : 300
        }, options || {});

            this.template = [
                '<div class="box">',
                '<% if (type == 2) { %>',
                    '<table cols="4" style="width: 100%;">',
                        '<tr>',
                            '<td colspan="3" style="padding-right: 5px;">',
                                '<label class="input-label">' + this.txtType + '</label>',
                                '<div id="id-dlg-numbering-format" class="input-group-nr" style="width: 120px;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td style="padding-left: 5px;">',
                                '<label class="input-label"></label>',
                                '<div id="id-dlg-numbering-restart" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" style="padding-right: 5px;width: 100%;">',
                                '<label class="input-label">' + this.txtNumFormatString + '</label>',
                                '<div id="id-dlg-numbering-format-str" style="width: 100%;height:22px;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td style="padding-left: 5px;padding-right: 5px;">',
                                '<label class="input-label">' + this.txtInclcudeLevel + '</label>',
                                '<div id="id-dlg-numbering-format-lvl" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td style="padding-left: 5px;">',
                                '<label class="input-label">' + this.txtStart + '</label>',
                                '<div id="id-dlg-numbering-spin-start" style="margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                    '<table cols="4" style="width: 100%;">',
                        '<tr>',
                            '<td style="padding-right: 5px;">',
                                '<label class="input-label">' + this.txtAlign + '</label>',
                                '<div id="id-dlg-bullet-align" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td style="padding-left: 5px;">',
                                '<label class="input-label">' + this.txtAlignAt + '</label>',
                                '<div id="id-dlg-numbering-align-at" style="margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td style="padding-left: 5px;padding-right: 5px;">',
                                '<label class="input-label">' + this.txtIndent + '</label>',
                                '<div id="id-dlg-numbering-indent" style="margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td style="padding-left: 5px;">',
                                '<label class="input-label">' + this.txtFollow + '</label>',
                                '<div id="id-dlg-numbering-follow" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                    '<table cols="4" style="width: 100%;">',
                        '<tr>',
                            '<td colspan="3" style="padding-right: 5px;">',
                                '<label class="input-label" style="display: block;">' + this.txtFontName + '</label>',
                                '<div id="id-dlg-numbering-font-name" style="display: inline-block;width: 200px;height:22px;margin-bottom: 10px;vertical-align: middle;"></div>',
                                '<div id="id-dlg-numbering-bold" style="display: inline-block;margin-left: 4px;margin-bottom: 10px;vertical-align: middle;"></div>',
                                '<div id="id-dlg-numbering-italic" style="display: inline-block;margin-left: 4px;margin-bottom: 10px;vertical-align: middle;"></div>',
                                '<div id="id-dlg-bullet-color" style="display: inline-block;margin-left: 4px;margin-bottom: 10px;vertical-align: middle;"></div>',
                            '</td>',
                            '<td style="padding-left: 5px;">',
                                '<label class="input-label">' + this.txtSize + '</label>',
                                '<div id="id-dlg-bullet-size" class="input-group-nr" style="width: 115px;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '<% } else if (type == 0) {%>', // bullets
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
                            '<td colspan="2">',
                                '<label class="input-label" style="display: block;">' + this.txtSize + '</label>',
                                '<div id="id-dlg-bullet-size" class="input-group-nr" style="width: 120px;display: inline-block;margin-bottom: 10px;vertical-align: middle;"></div>',
                                '<div id="id-dlg-numbering-bold" style="display: inline-block;margin-left: 4px;margin-bottom: 10px;vertical-align: middle;"></div>',
                                '<div id="id-dlg-numbering-italic" style="display: inline-block;margin-left: 4px;margin-bottom: 10px;vertical-align: middle;"></div>',
                                '<div id="id-dlg-bullet-color" style="display: inline-block;margin-left: 4px;margin-bottom: 10px;vertical-align: middle;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '<% } else { %>', // numbering
                    '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td style="padding-right: 5px;">',
                                '<label class="input-label">' + this.txtType + '</label>',
                                '<div id="id-dlg-numbering-format" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td style="padding-left: 5px;">',
                                '<label class="input-label">' + this.txtAlign + '</label>',
                                '<div id="id-dlg-bullet-align" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" style="width: 100%;">',
                                '<label class="input-label">' + this.txtNumFormatString + '</label>',
                                '<div id="id-dlg-numbering-format-str" style="width: 100%;height:22px;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                    '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td style="padding-right: 5px;">',
                                '<label class="input-label" style="display: block;">' + this.txtFontName + '</label>',
                                '<div id="id-dlg-numbering-font-name" style="display: inline-block;width: 90px;height:22px;margin-bottom: 10px;vertical-align: middle;"></div>',
                                '<div id="id-dlg-numbering-bold" style="display: inline-block;margin-left: 4px;margin-bottom: 10px;vertical-align: middle;"></div>',
                                '<div id="id-dlg-numbering-italic" style="display: inline-block;margin-left: 4px;margin-bottom: 10px;vertical-align: middle;"></div>',
                                '<div id="id-dlg-bullet-color" style="display: inline-block;margin-left: 4px;margin-bottom: 10px;vertical-align: middle;"></div>',
                            '</td>',
                            '<td style="padding-left: 5px;">',
                                '<label class="input-label">' + this.txtSize + '</label>',
                                '<div id="id-dlg-bullet-size" class="input-group-nr" style="width: 85px;margin-bottom: 10px;"></div>',
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
            this.fontStore = options.fontStore;
            this.fontName = '';
            this.options.tpl = _.template(this.template)(this.options);
            this.levels = [];
            this.formatString = {
                selectionStart: 0,
                selectionEnd: 0,
                text: '',
                lvlIndexes: []
            };
            this.spinners = [];

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.btnColor = new Common.UI.ButtonColored({
                parentEl: $window.find('#id-dlg-bullet-color'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-fontcolor',
                hint        : this.txtColor,
                menu: true,
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
            this.btnColor.setMenu();
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
            var items = [
                { displayValue: this.txtNone,       value: Asc.c_oAscNumberingFormat.None },
                { displayValue: '1, 2, 3,...',      value: Asc.c_oAscNumberingFormat.Decimal },
                { displayValue: 'a, b, c,...',      value: Asc.c_oAscNumberingFormat.LowerLetter },
                { displayValue: 'A, B, C,...',      value: Asc.c_oAscNumberingFormat.UpperLetter },
                { displayValue: 'i, ii, iii,...',   value: Asc.c_oAscNumberingFormat.LowerRoman },
                { displayValue: 'I, II, III,...',   value: Asc.c_oAscNumberingFormat.UpperRoman }
            ];
            if (Common.Locale.getDefaultLanguage() === 'ru') {
                items = items.concat([
                    { displayValue: 'а, б, в,...',      value: Asc.c_oAscNumberingFormat.RussianLower },
                    { displayValue: 'А, Б, В,...',      value: Asc.c_oAscNumberingFormat.RussianUpper }
                ]);
            }
            this.cmbFormat = new Common.UI.ComboBoxCustom({
                el          : $window.find('#id-dlg-numbering-format'),
                menuStyle   : 'min-width: 100%;max-height: 220px;',
                style       : this.type==2 ? "width: 107px;" : "width: 129px;",
                editable    : false,
                template    : _.template(template.join('')),
                itemsTemplate: _.template(itemsTemplate.join('')),
                takeFocusOnClose: true,
                data        : items,
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
                            me.fillLevelProps(me.levels[me.level]);
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
                        } else if (oldformat == Asc.c_oAscNumberingFormat.Bullet) {
                            if (!this._changedProps.get_TextPr()) this._changedProps.put_TextPr(new AscCommonWord.CTextPr());
                            this._changedProps.get_TextPr().put_FontFamily(undefined);

                            this._changedProps.put_Text([new Asc.CAscNumberingLvlText()]);
                            this._changedProps.get_Text()[0].put_Type(Asc.c_oAscNumberingLvlTextType.Num);
                            this._changedProps.get_Text()[0].put_Value(this.level);
                        } else if (oldformat == Asc.c_oAscNumberingFormat.None) {
                            if (!this.formatString.lvlIndexes[this.level][this.level]) {
                                var selectionStart = this.txtNumFormat.$el.find('input')[0].selectionStart;
                                this._changedProps.get_Text().splice(selectionStart, 0, new Asc.CAscNumberingLvlText(Asc.c_oAscNumberingLvlTextType.Num, this.level));
                            }
                        }
                        this.fillLevelProps(this.levels[this.level]);
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
                    this._changedProps.put_FontSize((record.value>0) ? record.value : undefined);
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

            this.txtNumFormat = new Common.UI.InputField({
                el          : $window.find('#id-dlg-numbering-format-str'),
                allowBlank  : true,
                value       : ''
            });
            var $formatInput = this.txtNumFormat.$el.find('input');
            $formatInput.on('keydown', _.bind(this.onKeyDown, this));
            $formatInput.on('keyup', _.bind(this.onKeyUp, this));
            $formatInput.on('input', _.bind(this.onFormatInput, this));

            var onMouseUp = function (e) {
                me.checkMousePosition($formatInput[0]);
                $(document).off('mouseup',   onMouseUp);
            };
            var onMouseDown = function (e) {
                $(document).on('mouseup',   onMouseUp);
            };
            $formatInput.on('mousedown', _.bind(onMouseDown, this));
            $formatInput.on('contextmenu', function(e) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            this.cmbLevel = new Common.UI.ComboBox({
                el          : $window.find('#id-dlg-numbering-format-lvl'),
                menuStyle   : 'min-width: 100%;',
                style       : "width: 130px;",
                editable    : false,
                cls         : 'input-group-nr',
                data        : [],
                takeFocusOnClose: true
            });
            this.cmbLevel.on('selected', _.bind(this.onIncludeLevelSelected, this));

            this.spnStart = new Common.UI.MetricSpinner({
                el: $window.find('#id-dlg-numbering-spin-start'),
                step: 1,
                width: 85,
                defaultUnit : "",
                value: 1,
                maxValue: 16383,
                minValue: 1,
                allowDecimal: false
            });
            this.spnStart.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.put_Start(field.getNumberValue());
                    this.makeFormatStr(this._changedProps);
                }
                if (this.api) {
                    this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
                }
            }, this));

            this.cmbFonts = new Common.UI.ComboBoxFonts({
                el          : $window.find('#id-dlg-numbering-font-name'),
                cls         : 'input-group-nr',
                style       : 'width: 100%;',
                menuCls     : 'scrollable-menu',
                menuStyle   : 'min-width: 100%;max-height: 270px;',
                store       : new Common.Collections.Fonts(),
                recent      : 0,
                hint        : this.tipFontName,
                takeFocusOnClose: true
            }).on('selected', _.bind(this.onFontName, this));

            this.btnBold = new Common.UI.Button({
                parentEl: $window.find('#id-dlg-numbering-bold'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-bold',
                enableToggle: true,
                hint: this.textBold
            });
            this.btnBold.on('click', _.bind(this.onBoldClick, this));

            this.btnItalic = new Common.UI.Button({
                parentEl: $window.find('#id-dlg-numbering-italic'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-italic',
                enableToggle: true,
                hint: this.textItalic
            });
            this.btnItalic.on('click', _.bind(this.onItalicClick, this));

            this.spnAlign = new Common.UI.MetricSpinner({
                el: $window.findById('#id-dlg-numbering-align-at'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spinners.push(this.spnAlign);
            this.spnAlign.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.put_NumberPosition(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
                if (this.api) {
                    this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
                }
            }, this));

            this.spnIndents = new Common.UI.MetricSpinner({
                el: $window.findById('#id-dlg-numbering-indent'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spinners.push(this.spnIndents);
            this.spnIndents.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.put_IndentSize(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
                if (this.api) {
                    this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
                }
            }, this));

            this.cmbFollow = new Common.UI.ComboBox({
                el          : $window.find('#id-dlg-numbering-follow'),
                menuStyle   : 'min-width: 100%;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: Asc.c_oAscNumberingSuff.Tab, displayValue: this.textTab },
                    { value: Asc.c_oAscNumberingSuff.Space, displayValue: this.textSpace },
                    { value: Asc.c_oAscNumberingSuff.None, displayValue: this.txtNone }
                ],
                takeFocusOnClose: true
            });
            this.cmbFollow.on('selected', _.bind(function (combo, record) {
                if (this._changedProps)
                    this._changedProps.put_Suff(record.value);
                if (this.api) {
                    this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
                }
            }, this));

            this.chRestart = new Common.UI.CheckBox({
                el: $window.find('#id-dlg-numbering-restart'),
                labelText: this.txtRestart
            });
            this.chRestart.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.put_Restart(field.getValue()=='checked' ? -1 : 0);
                }
            }, this));

            this.on('animate:after', _.bind(this.onAnimateAfter, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.btnEdit, this.cmbFormat, this.cmbAlign, this.cmbSize, this.btnColor, this.levelsList];
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
            this.cmbFonts.fillFonts(this.fontStore);
            this.cmbFonts.selectRecord(this.fontStore.findWhere({name: this.fontName}));

            this.updateMetricUnit();
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

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                    spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
                }
            }
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
                    var color = new Asc.asc_CColor();
                    color.put_auto(true);
                    this._changedProps.put_Color(color);
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
                    this._changedProps.put_Color(undefined);
                }
                if (this.api) {
                    this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
                }
            }
        },

        onColorsSelect: function(btn, color) {
            if (this._changedProps) {
                this._changedProps.put_Color(Common.Utils.ThemeColor.getRgbColor(color));
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
            this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
        },

        fillLevelProps: function(levelProps) {
            if (!levelProps) return;

            this.cmbAlign.setValue((levelProps.get_Align()!==undefined) ? levelProps.get_Align() : '');
            var format = levelProps.get_Format(),
                text = levelProps.get_Text();
            if (text && format == Asc.c_oAscNumberingFormat.Bullet) {
                this.bulletProps.symbol = text[0].get_Value();
            }

            this.cmbSize.setValue(levelProps.get_FontSize() || -1);

            var font = levelProps.get_FontFamily();
            if (font) {
                var rec = this.cmbFonts.store.findWhere({name: font});
                this.fontName = (rec) ? rec.get('name') : font;
                this.cmbFonts.setValue(this.fontName);
            } else
                this.cmbFonts.setValue('');
            this.bulletProps.font = font;

            this.btnBold.toggle(levelProps.get_Bold() === true, true);
            this.btnItalic.toggle(levelProps.get_Italic() === true, true);

            var color = levelProps.get_Color();
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

            if (this.type>0) {
                if (format == Asc.c_oAscNumberingFormat.Bullet) {
                    if (!this.cmbFormat.store.findWhere({value: Asc.c_oAscNumberingFormat.Bullet, symbol: this.bulletProps.symbol, font: this.bulletProps.font}))
                        this.cmbFormat.store.add({ displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: this.bulletProps.symbol, font: this.bulletProps.font }, {at: this.cmbFormat.store.length-1});
                    this.cmbFormat.setData(this.cmbFormat.store.models);
                    this.cmbFormat.selectRecord(this.cmbFormat.store.findWhere({value: Asc.c_oAscNumberingFormat.Bullet, symbol: this.bulletProps.symbol, font: this.bulletProps.font}));
                } else
                    this.cmbFormat.setValue((format!==undefined) ? format : '');
            }
            if (this.type===1) {
                this.makeFormatStr(levelProps);
            } else if (this.type===2) {
                this.spnStart.setValue(levelProps.get_Start(), true);
                this.spnAlign.setValue(Common.Utils.Metric.fnRecalcFromMM(levelProps.get_NumberPosition()), true);
                this.spnIndents.setValue(Common.Utils.Metric.fnRecalcFromMM(levelProps.get_IndentSize()), true);
                this.cmbFollow.setValue(levelProps.get_Suff());
                this.chRestart.setValue(levelProps.get_Restart()===-1);

                this.txtNumFormat.setDisabled(format == Asc.c_oAscNumberingFormat.Bullet);
                this.spnStart.setDisabled(format == Asc.c_oAscNumberingFormat.Bullet);
                // this.cmbFonts.setDisabled(format == Asc.c_oAscNumberingFormat.Bullet);
                // this.btnBold.setDisabled(format == Asc.c_oAscNumberingFormat.Bullet);
                // this.btnItalic.setDisabled(format == Asc.c_oAscNumberingFormat.Bullet);
                this.chRestart.setDisabled(this.level===0);

                var arr = [];
                var me = this;
                for (var lvl=0; lvl<this.level; lvl++) {
                    var frmt = this.props.get_Lvl(lvl).get_Format();
                    if (frmt !== Asc.c_oAscNumberingFormat.None && frmt !== Asc.c_oAscNumberingFormat.Bullet) {
                        arr.push({ displayValue: me.textLevel + ' ' + (lvl+1),  value: lvl });
                    }
                }
                this.cmbLevel.setData(arr);
                this.cmbLevel.setValue('');
                this.cmbLevel.setDisabled(format == Asc.c_oAscNumberingFormat.Bullet || this.level===0 || arr.length<1);
                this.makeFormatStr(levelProps);
            }
        },

        makeFormatStr: function(props) {
            var formatStr = '';
            this.formatString.lvlIndexes[this.level] = [];
            if (props) {
                if (props.get_Format() !== Asc.c_oAscNumberingFormat.Bullet) {
                    var text = props.get_Text();
                    var me = this;
                    var arr = this.formatString.lvlIndexes[this.level];
                    text.forEach(function (item, index) {
                        if (item.get_Type() === Asc.c_oAscNumberingLvlTextType.Text) {
                            formatStr += item.get_Value().toString();
                        } else if (item.get_Type() === Asc.c_oAscNumberingLvlTextType.Num) {
                            var num = item.get_Value();
                            if (me.levels[num] === undefined)
                                me.levels[num] = me.props.get_Lvl(num);
                            arr[num] = {start: formatStr.length, index: index};
                            var lvl = me.levels[num];
                            formatStr += AscCommon.IntToNumberFormat(lvl.get_Start(), lvl.get_Format());
                            arr[num].end = formatStr.length;
                        }
                    });
                }
            }
            this.formatString.text = formatStr;
            this.txtNumFormat.setValue(formatStr);
        },

        onIncludeLevelSelected: function (combo, record) {
            var $txt = this.txtNumFormat.$el.find('input'),
                selectionStart = $txt[0].selectionStart;

            if (this._changedProps) {
                var text = this._changedProps.get_Text(),
                    arr = this.formatString.lvlIndexes[this.level];
                for (var i=0; i<arr.length; i++) {
                    if (arr[i]) {
                        var item = arr[i];
                        if (i===record.value) {
                            text.splice(item.index, 1);
                            if (item.end<selectionStart)
                                selectionStart -= (item.end - item.start);
                        } else {
                            if (item.end<selectionStart)
                                selectionStart -= (item.end - item.start - 1);
                        }
                    }
                }
                text.splice(selectionStart, 0, new Asc.CAscNumberingLvlText(Asc.c_oAscNumberingLvlTextType.Num, record.value));
                this._changedProps.put_Text(text);
                this.makeFormatStr(this._changedProps);
                this.cmbLevel.setValue('');
            }
            if (this.api) {
                this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
            }
        },

        posToIndex: function (position) {
            if (this._changedProps) {
                var arr = this.formatString.lvlIndexes[this.level];
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i]) {
                        var item = arr[i];
                        if (item.end < position)
                            position -= (item.end - item.start - 1);
                    }
                }
            }
            return position;
        },

        isPosInRange: function (position, toEnd) {
            if (this._changedProps) {
                var arr = this.formatString.lvlIndexes[this.level];
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i]) {
                        var item = arr[i];
                        if (position > item.start && position < item.end)
                            return toEnd ? item.end : item.start;
                    }
                }
            }
        },

        checkMousePosition: function(target) {
            var me = this;
            setTimeout(function () {
                if (target.selectionStart===target.selectionEnd) {
                    var res = me.isPosInRange(target.selectionStart);
                    if (res !== undefined)
                        target.selectionStart = target.selectionEnd = res;
                } else {
                    var res = me.isPosInRange(target.selectionStart);
                    if (res !== undefined)
                        target.selectionStart = res;
                    res = me.isPosInRange(target.selectionEnd, true);
                    if (res !== undefined)
                        target.selectionEnd = res;
                }
                me.formatString.selectionStart = target.selectionStart;
                me.formatString.selectionEnd = target.selectionEnd;
            }, 0);
        },

        onFormatInput: function(e) {
            var newValue = $(e.target).val(),
                oldStr = this.formatString.text,
                newStr = newValue.slice(this.formatString.selectionStart, newValue.length - (oldStr.length - this.formatString.selectionEnd)),
                startIdx = this.posToIndex(this.formatString.selectionStart),
                endIdx = this.posToIndex(this.formatString.selectionEnd);
            if (this._changedProps) {
                var text = this._changedProps.get_Text();
                var arr = text.slice(0, startIdx);
                newStr.split('').forEach(function(str){
                    arr.push(new Asc.CAscNumberingLvlText(Asc.c_oAscNumberingLvlTextType.Text, str));
                });
                arr = arr.concat(text.slice(endIdx, text.length));
                this._changedProps.put_Text(arr);
                if (this.api) {
                    this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
                }
                this.makeFormatStr(this._changedProps);
                if (!this.formatString.lvlIndexes[this.level][this.level]) {
                    this._changedProps.put_Format(Asc.c_oAscNumberingFormat.None);
                    this.cmbFormat.setValue(Asc.c_oAscNumberingFormat.None);
                }
            }
            this.formatString.selectionStart = e.target.selectionStart;
            this.formatString.selectionEnd = e.target.selectionEnd;
        },

        onKeyDown: function(event) {
            var me = this,
                key = event.keyCode,
                shift = event.shiftKey;
            if (key === Common.UI.Keys.LEFT) {
                var res = me.isPosInRange(event.target.selectionStart-1);
                if (res !== undefined)
                    setTimeout(function () {
                        event.target.selectionStart = res;
                        !shift && (event.target.selectionEnd = res);
                        me.formatString.selectionStart = event.target.selectionStart;
                        me.formatString.selectionEnd = event.target.selectionEnd;
                    }, 0);
            } else if (key === Common.UI.Keys.RIGHT) {
                res = me.isPosInRange(event.target.selectionEnd+1, true);
                if (res !== undefined)
                    setTimeout(function () {
                        event.target.selectionEnd = res;
                        !shift && (event.target.selectionStart = res);
                        me.formatString.selectionStart = event.target.selectionStart;
                        me.formatString.selectionEnd = event.target.selectionEnd;
                    }, 0);
            } else if (key === Common.UI.Keys.BACKSPACE) {
                if (event.target.selectionStart === event.target.selectionEnd) {
                    this.formatString.selectionStart = event.target.selectionStart-1;
                    this.formatString.selectionEnd = event.target.selectionEnd;
                }
            }else if (key === Common.UI.Keys.DELETE) {
                if (event.target.selectionStart === event.target.selectionEnd) {
                    this.formatString.selectionStart = event.target.selectionStart;
                    this.formatString.selectionEnd = event.target.selectionEnd+1;
                }
            }
        },

        onKeyUp: function(event) {
            this.formatString.selectionStart = event.target.selectionStart;
            this.formatString.selectionEnd = event.target.selectionEnd;
        },

        onFontName: function(combo, record) {
            if (this._changedProps) {
                this._changedProps.put_FontFamily(record.name);
            }
            if (this.api) {
                this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
            }
        },

        onBoldClick: function() {
            if (this._changedProps) {
                this._changedProps.put_Bold(this.btnBold.isActive());
            }
            if (this.api) {
                this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
            }
        },

        onItalicClick: function() {
            if (this._changedProps) {
                this._changedProps.put_Italic(this.btnItalic.isActive());
            }
            if (this.api) {
                this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
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
        txtSymbol: 'Symbol',
        txtNumFormatString: 'Number format',
        txtInclcudeLevel: 'Include level number',
        txtStart: 'Start at',
        txtFontName: 'Font',
        textBold: 'Bold',
        textItalic: 'Italic',
        textTab: 'Tab character',
        textSpace: 'Space',
        txtAlignAt: 'Align at',
        txtIndent: 'Text Indent',
        txtFollow: 'Follow number with',
        txtRestart: 'Restart list'

    }, DE.Views.ListSettingsDialog || {}))
});