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
 *  ListSettingsDialog.js
 *
 *  Created on 03.12.2019
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'documenteditor/main/app/view/ListTypesAdvanced'
], function () { 'use strict';
    var nMaxRecent = 5;

    DE.Views.ListSettingsDialog = Common.UI.Window.extend(_.extend({
        options: {
            type: 0, // 0 - markers, 1 - numbers, 2 - multilevel
            width: 300,
            height: 460,
            style: 'min-width: 240px;',
            cls: 'modal-dlg',
            split: false,
            buttons: null
        },

        initialize : function(options) {
            this.type = options.type || 0;
            this.extended = true;
            this.rightPanelWidth = 210;
            _.extend(this.options, {
                title: this.txtTitle,
                height: (this.type===2) ? 451 : (this.type===1 ? 470 : 424),
                width: (this.type===2) ? 415 + (this.extended ? this.rightPanelWidth : 0) : 300
        }, options || {});

            this.template = [
                '<table style="width:100%;" class="">',
                '<tr>',
                '<td style="vertical-align: top;">',
                '<div class="box list-settings">',
                '<% if (type == 2) { %>',
                    '<table style="width: 100%;">',
                        '<tr>',
                            '<td class="padding-right-5" style="width: 100%;">',
                                '<label class="input-label">' + this.txtType + '</label>',
                                '<div id="id-dlg-numbering-format" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td class="padding-left-5">',
                                '<label class="input-label">' + this.txtSize + '</label>',
                                '<div id="id-dlg-bullet-size" class="input-group-nr" style="width: 115px;margin-bottom: 10px;"></div>',
                            '</td>',
                            '</td>',
                            '<td class="padding-left-5">',
                                '<label class="input-label"></label>',
                                '<div id="id-dlg-numbering-bold" style="margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td class="padding-left-5">',
                                '<label class="input-label"></label>',
                                '<div id="id-dlg-numbering-italic" style="margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td class="padding-left-5">',
                                '<label class="input-label"></label>',
                                '<div id="id-dlg-bullet-color" style="margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                    '<table style="width: 100%;">',
                        '<tr>',
                            '<td class="padding-right-5" style="width: 100%;">',
                                '<label class="input-label">' + this.txtNumFormatString + '</label>',
                                '<div id="id-dlg-numbering-format-str" style="width: 100%;height:22px;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td class="padding-left-5">',
                                '<label class="input-label"></label>',
                                '<div id="id-dlg-btn-more" style="width: 100%;height:22px;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '<% } else if (type == 0) {%>', // bullets
                    '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td class="padding-right-5">',
                                '<label class="input-label">' + this.txtType + '</label>',
                                '<div id="id-dlg-numbering-format" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td class="padding-left-5">',
                                '<label class="input-label">' + this.txtAlign + '</label>',
                                '<div id="id-dlg-bullet-align" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2">',
                                '<label class="input-label" style="display: block;">' + this.txtSize + '</label>',
                                '<div id="id-dlg-bullet-size" class="input-group-nr" style="width: 129px;display: inline-block;margin-bottom: 10px;vertical-align: middle;"></div>',
                                '<div id="id-dlg-numbering-bold" class="margin-left-4" style="display: inline-block;margin-bottom: 10px;vertical-align: middle;"></div>',
                                '<div id="id-dlg-numbering-italic" class="margin-left-4" style="display: inline-block;margin-bottom: 10px;vertical-align: middle;"></div>',
                                '<div id="id-dlg-bullet-color" class="margin-left-4" style="display: inline-block;margin-bottom: 10px;vertical-align: middle;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '<% } else { %>', // numbering
                    '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td class="padding-right-5">',
                                '<label class="input-label">' + this.txtType + '</label>',
                                '<div id="id-dlg-numbering-format" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td class="padding-left-5">',
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
                            '<td class="padding-right-5">',
                                '<label class="input-label" style="display: block;">' + this.txtFontName + '</label>',
                                '<div id="id-dlg-numbering-font-name" style="display: inline-block;width: 90px;height:22px;margin-bottom: 10px;vertical-align: middle;"></div>',
                                '<div id="id-dlg-numbering-bold" class="margin-left-4" style="display: inline-block;margin-bottom: 10px;vertical-align: middle;"></div>',
                                '<div id="id-dlg-numbering-italic" class="margin-left-4" style="display: inline-block;margin-bottom: 10px;vertical-align: middle;"></div>',
                                '<div id="id-dlg-bullet-color" class="margin-left-4" style="display: inline-block;margin-bottom: 10px;vertical-align: middle;"></div>',
                            '</td>',
                            '<td class="padding-left-5">',
                                '<label class="input-label">' + this.txtSize + '</label>',
                                '<div id="id-dlg-bullet-size" class="input-group-nr" style="width: 85px;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '<% } %>',
                '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td colspan="2">',
                                '<label>' + (this.type === 2 ? this.textSelectLevel : this.textPreview) + '</label>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td class="padding-right-10 <% if (type != 2) { %> hidden <% } %>" style="width: 50px;vertical-align: top;">',
                                '<div id="levels-list" class="no-borders" style="width:100%; height:235px;"></div>',
                            '</td>',
                            '<td>',
                                '<div id="bulleted-list-preview" style="height:' + (this.type === 2 ? 235 : 208) + 'px;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '</div>',
                '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="width: 86px;">' + this.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + this.cancelButtonText + '</button>',
                '</div>',
                '</td>',
                '<% if (type == 2) { %>',
                '<td style="width: ' + this.rightPanelWidth + 'px;vertical-align: top;">',
                    '<div id="id-dlg-panel-more-settings" class="padding-left-5 padding-right-15" style="width: ' + this.rightPanelWidth + 'px;">',
                    '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td colspan="2">',
                                '<label class="input-label" style="display: block;">' + this.txtFontName + '</label>',
                                '<div id="id-dlg-numbering-font-name" style="display: inline-block;width: 100%;height:22px;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2">',
                                '<label class="input-label">' + this.txtInclcudeLevel + '</label>',
                                '<div id="id-dlg-numbering-format-lvl" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2">',
                                '<label class="input-label">' + this.txtStart + '</label>',
                                '<div id="id-dlg-numbering-spin-start" style="width: 100%;margin-bottom: 5px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2">',
                                '<div id="id-dlg-numbering-restart" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td>',
                                '<label class="input-label">' + this.txtAlign + '</label>',
                            '</td>',
                            '<td class="padding-left-5" style="vertical-align:bottom;">',
                                '<label class="input-label">' + this.txtAlignAt + '</label>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td>',
                                '<div id="id-dlg-bullet-align" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td class="padding-left-5">',
                                '<div id="id-dlg-numbering-align-at" style="width: 100%;min-width40px;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2">',
                                '<label class="input-label">' + this.txtIndent + '</label>',
                                '<div id="id-dlg-numbering-indent" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2">',
                                '<label class="input-label">' + this.txtFollow + '</label>',
                                '<div id="id-dlg-numbering-follow" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2">',
                                '<div id="id-dlg-chk-tabstop" class="input-group-nr" style="width: 100%;margin-bottom: 3px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" class="padding-left-22">',
                                '<div id="id-dlg-num-tabstop" style="width: 100%;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                    '</div>',
                '</td>',
                '<% } %>',
                '</tr>',
                '</table>'
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
            this.recentBullets = [];
            this.recentNumTypes = [];
            this.lang = this.api.asc_GetPossibleNumberingLanguage();
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
                takeFocusOnClose: true,
                additionalItemsBefore: [{
                        id: 'id-dlg-bullet-text-color',
                        caption: this.txtLikeText,
                        checkable: true,
                        toggleGroup: 'list-settings-color',
                        style: Common.UI.isRTL() ? 'padding-right:20px;' : 'padding-left:20px;',
                    },
                    {
                        id: 'id-dlg-bullet-auto-color',
                        caption: this.textAuto,
                        checkable: true,
                        toggleGroup: 'list-settings-color',
                        style: Common.UI.isRTL() ? 'padding-right:20px;' : 'padding-left:20px;',
                    },
                    {caption: '--'}],
                additionalAlign: this.menuAddAlign
            });
            this.btnColor.setMenu();
            this.btnColor.on('color:select', _.bind(this.onColorsSelect, this));
            this.btnColor.menu.items[0].on('toggle', _.bind(this.onLikeTextColor, this));
            this.btnColor.menu.items[1].on('toggle', _.bind(this.onAutoColor, this));
            this.colors = this.btnColor.getPicker();

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
                '<div class="form-control" style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-top:3px; line-height: 14px; cursor: pointer; <%= style %>"></div>',
                '<div style="display: table-cell;"></div>',
                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>',
                    '<ul class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">'].concat(itemsTemplate).concat([
                    '</ul>',
                '</div>'
            ]);
            this._arrNumbers = [
                { displayValue: '1, 2, 3,...',      value: Asc.c_oAscNumberingFormat.Decimal },
                { displayValue: 'a, b, c,...',      value: Asc.c_oAscNumberingFormat.LowerLetter },
                { displayValue: 'A, B, C,...',      value: Asc.c_oAscNumberingFormat.UpperLetter },
                { displayValue: 'i, ii, iii,...',   value: Asc.c_oAscNumberingFormat.LowerRoman },
                { displayValue: 'I, II, III,...',   value: Asc.c_oAscNumberingFormat.UpperRoman }
            ];
            if (Common.Locale.getDefaultLanguage() === 'ru') {
                this._arrNumbers = this._arrNumbers.concat([
                    { displayValue: 'а, б, в,...',      value: Asc.c_oAscNumberingFormat.RussianLower },
                    { displayValue: 'А, Б, В,...',      value: Asc.c_oAscNumberingFormat.RussianUpper }
                ]);
            }
            this._arrBullets = [
                { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "·", font: 'Symbol' },
                { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "o", font: 'Courier New' },
                { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "§", font: 'Wingdings' },
                { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "v", font: 'Wingdings' },
                { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "Ø", font: 'Wingdings' },
                { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "ü", font: 'Wingdings' },
                { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "¨", font: 'Symbol' },
                { displayValue: this.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: "–", font: 'Arial' }
            ];
            this._itemNoneBullet = { displayValue: this.txtNone, value: Asc.c_oAscNumberingFormat.None };
            this._itemNewBullet = { displayValue: this.txtNewBullet, value: -1 };
            this._itemMoreTypes = { displayValue: this.txtMoreTypes, value: -2 };
            this.loadRecent();
            this.cmbFormat = new Common.UI.ComboBoxCustom({
                el          : $window.find('#id-dlg-numbering-format'),
                menuStyle   : 'min-width: 100%;max-height: 220px;',
                style       : this.type===2 ? "width: 100%;" : "width: 129px;",
                editable    : false,
                template    : _.template(template.join('')),
                itemsTemplate: _.template(itemsTemplate.join('')),
                takeFocusOnClose: true,
                data        : [],
                updateFormControl: function(record, defValue) {
                    var formcontrol = $(this.el).find('.form-control');
                    if (record) {
                        if (record.get('value')==Asc.c_oAscNumberingFormat.Bullet)
                            formcontrol[0].innerHTML = record.get('displayValue') + '<span style="font-family:' + (record.get('font') || 'Arial') + '">' + record.get('symbol') + '</span>';
                        else
                            formcontrol[0].innerHTML = record.get('displayValue');
                    } else
                        formcontrol[0].innerHTML = defValue ? defValue : '';
                }
            });
            this.cmbFormat.on('selected', _.bind(function (combo, record) {
                if (this._changedProps) {
                    if (record.value == -1) {
                        var callback = function(result) {
                            me.fillLevelProps(me.levels[me.level]);
                        };
                        this.addNewBullet(callback);
                    } else if (record.value == -2) {
                        var callback = function(result) {
                            me.fillLevelProps(me.levels[me.level]);
                        };
                        this.addNewListType(callback);
                    } else {
                        var oldformat = this._changedProps.get_Format();
                        this._changedProps.put_Format(record.value);
                        if (record.value == Asc.c_oAscNumberingFormat.Bullet) {
                            this.bulletProps.font = record.font ? record.font : undefined;
                            this.bulletProps.symbol = record.symbol;
                            this._changedProps.put_FontFamily(this.bulletProps.font);

                            this._changedProps.put_Text([new Asc.CAscNumberingLvlText()]);
                            this._changedProps.get_Text()[0].put_Value(this.bulletProps.symbol);
                        } else if (oldformat == Asc.c_oAscNumberingFormat.Bullet) {
                            this._changedProps.put_FontFamily(undefined);

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
                style       : "width: 100%;",
                editable    : false,
                cls         : 'input-group-nr',
                data        : [],
                takeFocusOnClose: true
            });
            this.cmbLevel.on('selected', _.bind(this.onIncludeLevelSelected, this));

            this.spnStart = new Common.UI.MetricSpinner({
                el: $window.find('#id-dlg-numbering-spin-start'),
                step: 1,
                width: '100%',
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
                width: '100%',
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
                    this.spnTabStop.setMinValue(field.getNumberValue());
                    this.spnTabStop.setValue(this.spnTabStop.getValue(), true);
                }
                if (this.api) {
                    this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
                }
            }, this));

            this.spnIndents = new Common.UI.MetricSpinner({
                el: $window.findById('#id-dlg-numbering-indent'),
                step: .1,
                width: '100%',
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
                this.chTabStop.setDisabled(record.value!==Asc.c_oAscNumberingSuff.Tab);
                this.spnTabStop.setDisabled(record.value!==Asc.c_oAscNumberingSuff.Tab || this.chTabStop.getValue()!=='checked');
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

            this.chTabStop = new Common.UI.CheckBox({
                el: $window.find('#id-dlg-chk-tabstop'),
                labelText: this.txtTabStop
            });
            this.chTabStop.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.put_StopTab(field.getValue()==='checked' ? Common.Utils.Metric.fnRecalcToMM(this.spnTabStop.getNumberValue()) : null);
                    this.spnTabStop.setDisabled(field.getValue()!=='checked' || this.cmbFollow.getValue()!==Asc.c_oAscNumberingSuff.Tab);
                }
                if (this.api) {
                    this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
                }
            }, this));

            this.spnTabStop = new Common.UI.MetricSpinner({
                el: $window.findById('#id-dlg-num-tabstop'),
                step: .1,
                width: '100%',
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spinners.push(this.spnTabStop);
            this.spnTabStop.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.put_StopTab(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
                if (this.api) {
                    this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
                }
            }, this));

            this.panelMore = $window.findById('#id-dlg-panel-more-settings');
            this.panelMoreTable = this.panelMore.parent();
            this.btnMore = new Common.UI.Button({
                parentEl: $window.findById('#id-dlg-btn-more'),
                cls: 'btn-toolbar bg-white',
                iconCls: this.extended ? 'caret-double-left' : 'caret-double-right',
                scaling: false,
                hint: this.extended ? this.textHide : this.textMore
            });
            this.btnMore.on('click', _.bind(this.onMoreClick, this));
            this.on('animate:after', _.bind(this.onAnimateAfter, this));

            if (this.type == 2 && Common.localStorage.getBool("de-hide-multilevel-settings", true))
                this.onMoreClick(this.btnMore);

            this.afterRender();
        },

        getFocusedComponents: function() {
            switch (this.type) {
                case 0:
                    return [this.cmbFormat, this.cmbAlign, this.cmbSize, this.btnBold, this.btnItalic, this.btnColor].concat(this.getFooterButtons());
                case 1:
                    return [this.cmbFormat, this.cmbAlign, this.txtNumFormat, this.cmbFonts, this.btnBold, this.btnItalic, this.btnColor, this.cmbSize].concat(this.getFooterButtons());
                case 2:
                    return [this.cmbFormat, this.cmbSize, this.btnBold, this.btnItalic, this.btnColor, this.txtNumFormat, this.btnMore, this.levelsList,
                            this.cmbFonts, this.cmbLevel, this.spnStart, this.chRestart, this.cmbAlign, this.spnAlign, this.spnIndents, this.cmbFollow, this.chTabStop, this.spnTabStop].concat(this.getFooterButtons());
            }
            return [];
        },

        getDefaultFocusableComponent: function () {
            return this.cmbFormat;
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

        addNewBullet: function(callback) {
            var me = this,
                props = me.bulletProps,
                btn,
                handler = function(dlg, result, settings) {
                    btn = result;
                    if (result == 'ok') {
                        props.changed = true;
                        props.code = settings.code;
                        props.font = settings.font;
                        props.symbol = settings.symbol;
                        if (me._changedProps) {
                            me._changedProps.put_Format(Asc.c_oAscNumberingFormat.Bullet);
                            me._changedProps.put_FontFamily(props.font);

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
                }).on('close', function(obj){
                    (btn===undefined) && callback && callback.call(me);
                    setTimeout(function(){me.cmbFormat.focus();}, 1);
                });
            win.show();
            win.on('symbol:dblclick', handler);
        },

        addNewListType: function(callback) {
            var me = this,
                btn,
                handler = function(result, value) {
                    btn = result;
                    if (result == 'ok') {
                        if (me._changedProps) {
                            me._changedProps.put_Format(value);
                            if (me.api) {
                                me.api.SetDrawImagePreviewBullet('bulleted-list-preview', me.props, me.level, me.type==2);
                            }
                        }
                    }
                    callback && callback.call(me, result);
                },
                win = new DE.Views.ListTypesAdvanced({
                    modal: true,
                    lang: me.lang,
                    handler: handler
                }).on('close', function(obj){
                    (btn===undefined) && callback && callback.call(me);
                    setTimeout(function(){me.cmbFormat.focus();}, 1);
                });
            win.show();
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

            var me = this;

            this.cmbAlign.setValue((levelProps.get_Align()!==undefined) ? levelProps.get_Align() : '');
            var format = levelProps.get_Format(),
                text = levelProps.get_Text();
            if (text && text.length && format == Asc.c_oAscNumberingFormat.Bullet) {
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
                Common.Utils.ThemeColor.selectPickerColorByEffect(color, this.colors);
                ( typeof(color) == 'object' ) && (color = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()));
            } else {
                this.colors.clearSelection();
                color = '000000';
            }
            this.btnColor.setColor(color);

            if (this.type===1) { // numbers
                if (format !== Asc.c_oAscNumberingFormat.None || this.cmbFormat.store.length<1) {
                    this.checkRecentNum(format);
                }
                var store = [this._itemNoneBullet].concat(this._arrNumbers);
                this.recentNumTypes.forEach(function(item) {
                    if (item!==null && item!==undefined) {
                        item = parseInt(item);
                        store.push({ displayValue: AscCommon.IntToNumberFormat(1, item, me.lang) + ', ' + AscCommon.IntToNumberFormat(2, item, me.lang) + ', ' + AscCommon.IntToNumberFormat(3, item, me.lang) + ',...', value: item });
                    }
                });
                store.push(this._itemMoreTypes);
                this.cmbFormat.setData(store);
                this.cmbFormat.setValue((format!==undefined) ? format : '');
                if (levelProps.get_Start()===0 && AscCommon.IntToNumberFormat(0, format)==='') // check min start value
                    levelProps.put_Start(1);
                this.makeFormatStr(levelProps);
            } else {
                if (format !== Asc.c_oAscNumberingFormat.None || this.cmbFormat.store.length<1) {
                    if (format === Asc.c_oAscNumberingFormat.Bullet)
                        this.checkRecent(this.bulletProps.symbol, this.bulletProps.font);
                    else if (format !== Asc.c_oAscNumberingFormat.None)
                        this.checkRecentNum(format);
                    var store = (this.type===2) ? [this._itemNoneBullet].concat(this._arrNumbers) : [];
                    if (this.type===2) {
                        this.recentNumTypes.forEach(function(item) {
                            if (item!==null && item!==undefined) {
                                item = parseInt(item);
                                store.push({ displayValue: AscCommon.IntToNumberFormat(1, item, me.lang) + ', ' + AscCommon.IntToNumberFormat(2, item, me.lang) + ', ' + AscCommon.IntToNumberFormat(3, item, me.lang) + ',...', value: item });
                            }
                        });
                    }
                    store = store.concat(this._arrBullets);
                    this.recentBullets.forEach(function(item) {
                        store.push({ displayValue: me.txtSymbol + ': ', value: Asc.c_oAscNumberingFormat.Bullet, symbol: item.symbol, font: item.font });
                    });
                    (this.type===2) && store.push(this._itemMoreTypes);
                    store.push(this._itemNewBullet);
                    this.cmbFormat.setData(store);
                }
                if (format === Asc.c_oAscNumberingFormat.Bullet)
                    this.cmbFormat.selectRecord(this.cmbFormat.store.findWhere({value: Asc.c_oAscNumberingFormat.Bullet, symbol: this.bulletProps.symbol, font: this.bulletProps.font || ''}));
                else if (this.type===0 && format === Asc.c_oAscNumberingFormat.None)
                    this.cmbFormat.setValue(Asc.c_oAscNumberingFormat.None, this.txtNone);
                else
                    this.cmbFormat.setValue((format!==undefined) ? format : '');
            }

            if (this.type===2) {
                this.spnStart.setMinValue(AscCommon.IntToNumberFormat(0, format)!=='' ? 0 : 1);
                if (levelProps.get_Start()===0 && AscCommon.IntToNumberFormat(0, format)==='') // check min start value
                    levelProps.put_Start(1);
                this.spnStart.setValue(levelProps.get_Start(), true);
                this.spnAlign.setValue(Common.Utils.Metric.fnRecalcFromMM(levelProps.get_NumberPosition()), true);
                this.spnIndents.setValue(Common.Utils.Metric.fnRecalcFromMM(levelProps.get_IndentSize()), true);
                this.cmbFollow.setValue(levelProps.get_Suff());
                this.chRestart.setValue(levelProps.get_Restart()===-1, true);
                this.chTabStop.setValue(levelProps.get_StopTab()!==null, true);
                this.spnTabStop.setMinValue(this.spnAlign.getNumberValue());
                this.spnTabStop.setValue(levelProps.get_StopTab()!==null ? Common.Utils.Metric.fnRecalcFromMM(levelProps.get_StopTab()) : this.spnIndents.getNumberValue(), true);

                this.txtNumFormat.setDisabled(format == Asc.c_oAscNumberingFormat.Bullet);
                this.spnStart.setDisabled(format == Asc.c_oAscNumberingFormat.Bullet);
                this.chRestart.setDisabled(this.level===0);
                this.chTabStop.setDisabled(levelProps.get_Suff()!==Asc.c_oAscNumberingSuff.Tab);
                this.spnTabStop.setDisabled(levelProps.get_StopTab()===null || levelProps.get_Suff()!==Asc.c_oAscNumberingSuff.Tab);

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
                            formatStr += AscCommon.IntToNumberFormat(lvl.get_Start(), lvl.get_Format(), me.lang);
                            arr[num].end = formatStr.length;
                        }
                    });
                    this.txtNumFormat.$el.find('input').css('font-family', 'inherit');
                } else {
                    formatStr = this.bulletProps.symbol;
                    this.txtNumFormat.$el.find('input').css('font-family', this.bulletProps.font || 'inherit');
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
                this._changedProps.put_FontFamily(record.name ? record.name : undefined);
                if (this._changedProps.get_Format() === Asc.c_oAscNumberingFormat.Bullet) {
                    this.fillLevelProps(this._changedProps);
                }
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

        loadRecent: function(){
            var sRecents = Common.localStorage.getItem('de-recent-list-bullets');
            if(sRecents !== ''){
                sRecents = JSON.parse(sRecents);
            }
            if(_.isArray(sRecents)){
                this.recentBullets = sRecents;
                for (var i = 0; i < this.recentBullets.length; ++i){
                    if(!this.recentBullets[i].symbol){
                        this.recentBullets.splice(i, 1);
                        i--;
                    }
                }
            }

            sRecents = Common.localStorage.getItem('de-recent-list-formats');
            if(sRecents !== ''){
                sRecents = JSON.parse(sRecents);
            }
            if(_.isArray(sRecents)){
                this.recentNumTypes = sRecents;
            }
        },

        saveRecent: function(){
            var sJSON = JSON.stringify(this.recentBullets);
            Common.localStorage.setItem('de-recent-list-bullets', sJSON);
        },

        saveRecentNum: function(){
            var sJSON = JSON.stringify(this.recentNumTypes);
            Common.localStorage.setItem('de-recent-list-formats', sJSON);
        },

        checkRecent: function(sSymbol, sFont){
            if (!sSymbol) return;
            sFont = sFont || '';

            for(var i = 0; i < this._arrBullets.length; ++i){
                if(this._arrBullets[i].symbol === sSymbol && this._arrBullets[i].font === sFont){
                    return;
                }
            }
            if(this.recentBullets.length === 0){
                this.recentBullets.push({symbol: sSymbol, font: sFont});
                this.saveRecent();
                return;
            }
            for (var i = 0; i < this.recentBullets.length; ++i){
                if(this.recentBullets[i].symbol === sSymbol && this.recentBullets[i].font === sFont){
                    this.recentBullets.splice(i, 1);
                    break;
                }
            }
            this.recentBullets.splice(0, 0, {symbol: sSymbol, font: sFont});
            if(this.recentBullets.length > nMaxRecent){
                this.recentBullets.splice(nMaxRecent, this.recentBullets.length - nMaxRecent);
            }
            this.saveRecent();
        },

        checkRecentNum: function(format){
            if (format===null || format===undefined) return;

            for(var i = 0; i < this._arrNumbers.length; ++i){
                if(this._arrNumbers[i].value === format){
                    return;
                }
            }
            if(this.recentNumTypes.length === 0){
                this.recentNumTypes.push(format);
                this.saveRecentNum();
                return;
            }
            for (var i = 0; i < this.recentNumTypes.length; ++i){
                if(this.recentNumTypes[i] === format){
                    this.recentNumTypes.splice(i, 1);
                    break;
                }
            }
            this.recentNumTypes.splice(0, 0, format);
            if(this.recentNumTypes.length > nMaxRecent){
                this.recentNumTypes.splice(nMaxRecent, this.recentNumTypes.length - nMaxRecent);
            }
            this.saveRecentNum();
        },

        onMoreClick: function(btn) {
            if (!this.extended) {
                this.extended = true;
                this.panelMore.css({'display': 'block'});
                this.panelMoreTable.width(this.panelMore.width());
                this.setWidth(this.getWidth() + this.rightPanelWidth);
                btn.updateHint(this.textHide);
                btn.setIconCls('icon caret-double-left');
                Common.localStorage.setItem("de-hide-multilevel-settings", 0);
            } else {
                this.extended = false;
                this.panelMore.css({'display': 'none'});
                this.panelMoreTable.css({'width': 'auto'});
                this.setWidth(this.getWidth() - this.rightPanelWidth);
                btn.updateHint(this.textMore);
                btn.setIconCls('icon caret-double-right');
                Common.localStorage.setItem("de-hide-multilevel-settings", 1);
            }
        },

        txtTitle: 'List Settings',
        txtSize: 'Size',
        txtColor: 'Color',
        txtBullet: 'Bullet',
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
        txtAlignAt: 'at',
        txtIndent: 'Text Indent',
        txtFollow: 'Follow number with',
        txtRestart: 'Restart list',
        txtMoreTypes: 'More types',
        txtTabStop: 'Add tab stop at',
        textMore: 'Show more settings',
        textHide: 'Hide settings',
        textSelectLevel: 'Select level'

    }, DE.Views.ListSettingsDialog || {}))
});