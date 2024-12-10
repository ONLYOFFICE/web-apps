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
 *  Created on 30.10.2019
 *
 */

if (Common === undefined)
    var Common = {};

define([], function () { 'use strict';

    var _BulletTypes = {};
    _BulletTypes.none = -1;
    _BulletTypes.symbol = 0;
    _BulletTypes.image = 2;
    _BulletTypes.newSymbol = 1;
    _BulletTypes.newImage = -2;

    Common.Views.ListSettingsDialog = Common.UI.Window.extend(_.extend({
        options: {
            type: 0, // 0 - markers, 1 - numbers
            width: 285,
            height: 261,
            style: 'min-width: 240px;',
            cls: 'modal-dlg',
            id: 'window-list-settings',
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
                    '<div style="margin-bottom: 16px;">',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-list-bullet">', this.textBulleted,'</button>',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-list-numbering">', this.textNumbering,'</button>',
                    '</div>',
                    '<div style="height:120px;">',
                        '<table cols="3">',
                            '<tr>',
                                '<td class="padding-right-5" style="padding-bottom: 8px;min-width: 50px;">',
                                    '<label class="text">' + this.txtType + '</label>',
                                '</td>',
                                '<td class="padding-right-5" style="padding-bottom: 8px;width: 105px;">',
                                    '<div id="id-dlg-list-numbering-format" class="input-group-nr" style="width: 105px;"></div>',
                                    '<div id="id-dlg-list-bullet-format" class="input-group-nr" style="width: 105px;"></div>',
                                '</td>',
                                '<td style="padding-bottom: 8px;"></td>',
                            '</tr>',
                            '<tr class="image">',
                                '<td class="padding-right-5" style="padding-bottom: 8px;min-width: 50px;">',
                                    '<label class="text">' + this.txtImport + '</label>',
                                '</td>',
                                '<td class="padding-right-5" style="padding-bottom: 8px;width: 105px;">',
                                    '<div id="id-dlg-list-image" style="width: 105px;"></div>',
                                '</td>',
                                '<td style="padding-bottom: 8px;"></td>',
                            '</tr>',
                            '<tr>',
                                '<td class="padding-right-5" style="padding-bottom: 8px;min-width: 50px;">',
                                    '<label class="text">' + this.txtSize + '</label>',
                                '</td>',
                                '<td class="padding-right-5" style="padding-bottom: 8px;width: 105px;">',
                                    '<div id="id-dlg-list-size"></div>',
                                '</td>',
                                '<td style="padding-bottom: 8px;">',
                                    '<label class="text" style="white-space: nowrap;">' + this.txtOfText + '</label>',
                                '</td>',
                            '</tr>',
                            '<tr class="numbering">',
                                '<td class="padding-right-5" style="padding-bottom: 8px;min-width: 50px;">',
                                    '<label class="text" style="white-space: nowrap;">' + this.txtStart + '</label>',
                                '</td>',
                                '<td class="padding-right-5" style="padding-bottom: 8px;width: 105px;">',
                                    '<div id="id-dlg-list-start"></div>',
                                '</td>',
                                '<td style="padding-bottom: 8px;"></td>',
                            '</tr>',
                            '<tr class="color">',
                                '<td class="padding-right-5" style="padding-bottom: 8px;min-width: 50px;">',
                                    '<label class="text">' + this.txtColor + '</label>',
                                '</td>',
                                '<td class="padding-right-5" style="padding-bottom: 8px;width: 105px;">',
                                    '<div id="id-dlg-list-color"></div>',
                                '</td>',
                                '<td style="padding-bottom: 8px;"></td>',
                            '</tr>',
                        '</table>',
                    '</div>',
                '</div>'
            ].join('');

            this.props = options.props;
            this.options.tpl = _.template(this.template)(this.options);
            this.color = '000000';
            this.storage = !!options.storage;
            this.api = options.api;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            me.btnBullet = new Common.UI.Button({
                el: $('#id-dlg-list-bullet'),
                enableToggle: true,
                toggleGroup: 'list-type',
                allowDepress: false,
                pressed: true
            });
            me.btnBullet.on('click', _.bind(me.onListTypeClick, me, 0));

            me.btnNumbering = new Common.UI.Button({
                el: $('#id-dlg-list-numbering'),
                enableToggle: true,
                toggleGroup: 'list-type',
                allowDepress: false
            });
            me.btnNumbering.on('click', _.bind(me.onListTypeClick, me, 1));

            this.cmbNumFormat = new Common.UI.ComboBox({
                el          : $('#id-dlg-list-numbering-format'),
                menuStyle   : 'min-width: 100%;max-height: 183px;',
                editable    : false,
                takeFocusOnClose: true,
                cls         : 'input-group-nr',
                data        : [
                    { displayValue: this.txtNone,       value: -1 },
                    { displayValue: 'A, B, C,...',      value: 4 },
                    { displayValue: 'a), b), c),...',   value: 5 },
                    { displayValue: 'a, b, c,...',      value: 6 },
                    { displayValue: '1, 2, 3,...',      value: 1 },
                    { displayValue: '1), 2), 3),...',   value: 2 },
                    { displayValue: 'I, II, III,...',   value: 3 },
                    { displayValue: 'i, ii, iii,...',   value: 7 }
                ]
            });
            this.cmbNumFormat.on('selected', _.bind(function (combo, record) {
                if (this._changedProps) {
                    this._changedProps.asc_putListType(1, record.value);
                }
            }, this));
            this.cmbNumFormat.setValue(1);

            var itemsTemplate =
                [
                    '<% _.each(items, function(item) { %>',
                    '<li id="<%= item.id %>" data-value="<%= item.value %>"><a tabindex="-1" type="menuitem">',
                    '<%= item.displayValue %>',
                    '<% if (item.value === 0) { %><span style="font-family:<%=item.font%>;"><%=item.symbol%></span>',
                    '<% } else if (item.value === 2) { %><span id="id-dlg-list-bullet-image-preview" class="margin-left-4" style="width:12px; height: 12px; margin-bottom: 1px;display: inline-block; vertical-align: middle;"></span><% } %>',
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
            this.cmbBulletFormat = new Common.UI.ComboBoxCustom({
                el          : $('#id-dlg-list-bullet-format'),
                menuStyle   : 'min-width: 100%;max-height: 183px;',
                style       : "width: 105px;",
                editable    : false,
                takeFocusOnClose: true,
                template    : _.template(template.join('')),
                itemsTemplate: _.template(itemsTemplate.join('')),
                data        : [
                    { displayValue: this.txtNone,          value: _BulletTypes.none },
                    { displayValue: this.txtSymbol + ': ', value: _BulletTypes.symbol, symbol: "•", font: 'Arial' },
                    { displayValue: this.txtSymbol + ': ', value: _BulletTypes.symbol, symbol: "o", font: 'Courier New' },
                    { displayValue: this.txtSymbol + ': ', value: _BulletTypes.symbol, symbol: "§", font: 'Wingdings' },
                    { displayValue: this.txtSymbol + ': ', value: _BulletTypes.symbol, symbol: "v", font: 'Wingdings' },
                    { displayValue: this.txtSymbol + ': ', value: _BulletTypes.symbol, symbol: "Ø", font: 'Wingdings' },
                    { displayValue: this.txtSymbol + ': ', value: _BulletTypes.symbol, symbol: "ü", font: 'Wingdings' },
                    { displayValue: this.txtSymbol + ': ', value: _BulletTypes.symbol, symbol: "w", font: 'Wingdings' },
                    { displayValue: this.txtSymbol + ': ', value: _BulletTypes.symbol, symbol: "–", font: 'Arial' },
                    { displayValue: this.txtNewBullet,     value: _BulletTypes.newSymbol },
                    { displayValue: this.txtNewImage,      value: _BulletTypes.newImage }
                ],
                updateFormControl: function(record) {
                    var formcontrol = $(this.el).find('.form-control');
                    if (record) {
                        if (record.get('value')===_BulletTypes.symbol)
                            formcontrol[0].innerHTML = record.get('displayValue') + '<span style="font-family:' + (record.get('font') || 'Arial') + '">' + record.get('symbol') + '</span>';
                        else if (record.get('value')===_BulletTypes.image) {
                            formcontrol[0].innerHTML = record.get('displayValue') + '<span id="id-dlg-list-bullet-combo-preview" class="margin-left-2" style="width:12px; height: 12px; margin-bottom: 1px;display: inline-block; vertical-align: middle;"></span>';
                            var bullet = new Asc.asc_CBullet();
                            bullet.asc_fillBulletImage(me.imageProps.id);
                            bullet.drawSquareImage('id-dlg-list-bullet-combo-preview');
                        } else if (record.get('value')===_BulletTypes.newImage)
                            formcontrol[0].innerHTML = me.txtImage;
                        else
                            formcontrol[0].innerHTML = record.get('displayValue');
                    } else
                        formcontrol[0].innerHTML = '';
                }
            });
            var rec = this.cmbBulletFormat.store.at(1);
            this.cmbBulletFormat.selectRecord(rec);
            this.bulletProps = {symbol: rec.get('symbol'), font: rec.get('font')};
            this.cmbBulletFormat.on('selected', _.bind(function (combo, record) {
                this.imageControls.toggleClass('hidden', !(record.value === _BulletTypes.image || record.value === _BulletTypes.newImage));
                this.colorControls.toggleClass('hidden', record.value === _BulletTypes.image || record.value === _BulletTypes.newImage);
                if (record.value === _BulletTypes.newSymbol) {
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
                                    me._changedProps.asc_putFont(props.font);
                                    me._changedProps.asc_putSymbol(props.symbol);
                                }
                            }
                            var store = combo.store;
                            if (!store.findWhere({value: _BulletTypes.symbol, symbol: props.symbol, font: props.font})) {
                                var idx = store.indexOf(store.findWhere({value: _BulletTypes.image}));
                                if (idx<0)
                                    idx = store.indexOf(store.findWhere({value: _BulletTypes.newSymbol}));
                                store.add({ displayValue: me.txtSymbol + ': ', value: _BulletTypes.symbol, symbol: props.symbol, font: props.font }, {at: idx});
                            }
                            if (me.imageProps)
                                me.imageProps.redraw = true;

                            combo.setData(store.models);
                            combo.selectRecord(combo.store.findWhere({value: _BulletTypes.symbol, symbol: props.symbol, font: props.font}));
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
                            (btn===undefined) && handler && handler.call(me);
                            setTimeout(function(){me.cmbBulletFormat.focus();}, 1);
                        });
                    win.show();
                    win.on('symbol:dblclick', handler);
                } else if (record.value == _BulletTypes.newImage) { // new image
                } else if (record.value == _BulletTypes.image) { // image
                    if (this._changedProps)
                        this._changedProps.asc_fillBulletImage(this.imageProps.id);
                } else if (record.value == _BulletTypes.none) {
                    if (this._changedProps)
                        this._changedProps.asc_putListType(0, record.value);
                } else {
                    this.bulletProps.changed = true;
                    this.bulletProps.code = record.code;
                    this.bulletProps.font = record.font;
                    this.bulletProps.symbol = record.symbol;
                    if (this._changedProps) {
                        this._changedProps.asc_putFont(this.bulletProps.font);
                        this._changedProps.asc_putSymbol(this.bulletProps.symbol);
                    }
                }
                this.btnOk.setDisabled(record.value === _BulletTypes.newImage);
            }, this));
            this.cmbBulletFormat.on('show:after', _.bind(this.onBulletFormatOpen, this));

            this.spnSize = new Common.UI.MetricSpinner({
                el          : $window.find('#id-dlg-list-size'),
                step        : 1,
                width       : 105,
                value       : 100,
                defaultUnit : '',
                maxValue    : 400,
                minValue    : 25,
                allowDecimal: false
            }).on('change', function(field, newValue, oldValue, eOpts){
                if (me._changedProps) {
                    me._changedProps.asc_putSize(field.getNumberValue());
                }
            });

            var config = this.options.colorConfig || {};
            this.btnColor = new Common.UI.ColorButton({
                parentEl: $window.find('#id-dlg-list-color'),
                style: "width:45px;",
                additionalAlign: this.menuAddAlign,
                color: this.color,
                colors: config.colors,
                dynamiccolors: config.dynamiccolors,
                themecolors: config.themecolors,
                effects: config.effects,
                columns: config.columns,
                paletteCls: config.cls,
                paletteWidth: config.paletteWidth,
                takeFocusOnClose: true
            });
            this.btnColor.on('color:select', _.bind(this.onColorsSelect, this));
            this.colors = this.btnColor.getPicker();

            this.spnStart = new Common.UI.MetricSpinner({
                el          : $window.find('#id-dlg-list-start'),
                step        : 1,
                width       : 105,
                value       : 1,
                defaultUnit : '',
                maxValue    : 32767,
                minValue    : 1,
                allowDecimal: false
            }).on('change', function(field, newValue, oldValue, eOpts){
                if (me._changedProps) {
                    me._changedProps.asc_putNumStartAt(field.getNumberValue());
                }
            });

            this.btnSelectImage = new Common.UI.Button({
                parentEl: $('#id-dlg-list-image'),
                cls: 'btn-text-menu-default',
                caption: this.textSelect,
                style: 'width: 100%;',
                menu: new Common.UI.Menu({
                    style: 'min-width: 105px;',
                    maxHeight: 200,
                    additionalAlign: this.menuAddAlign,
                    items: [
                        {caption: this.textFromFile, value: 0},
                        {caption: this.textFromUrl, value: 1},
                        {caption: this.textFromStorage, value: 2}
                    ]
                }),
                takeFocusOnClose: true
            });
            this.btnSelectImage.menu.on('item:click', _.bind(this.onImageSelect, this));
            this.btnSelectImage.menu.items[2].setVisible(this.storage);

            this.btnOk = _.find(this.getFooterButtons(), function (item) {
                return (item.$el && item.$el.find('.primary').addBack().filter('.primary').length>0);
            }) || new Common.UI.Button({ el: $window.find('.primary') });

            me.numberingControls = $window.find('tr.numbering');
            me.imageControls = $window.find('tr.image');
            me.colorControls = $window.find('tr.color');

            var el = $window.find('table tr:first() td:first()');
            el.width(Math.max($window.find('.numbering .text').width(), el.width()));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.btnBullet, this.btnNumbering, this.cmbNumFormat, this.cmbBulletFormat, this.btnSelectImage, this.spnSize, this.spnStart, this.btnColor].concat(this.getFooterButtons());
        },

        afterRender: function() {
            !this.options.colorConfig && this.updateThemeColors();
            this._setDefaults(this.props);

            var me = this;
            var onApiImageLoaded = function(bullet) {
                me.imageProps = {id: bullet.asc_getImageId(), redraw: true};
                if (me._changedProps)
                    me._changedProps.asc_fillBulletImage(me.imageProps.id);
                // add or update record for image to btnBulletFormat and select it
                var store = me.cmbBulletFormat.store;
                if (!store.findWhere({value: _BulletTypes.image})) {
                    var idx = store.indexOf(store.findWhere({value: _BulletTypes.newSymbol}));
                    store.add({ displayValue: me.txtImage + ':', value: _BulletTypes.image }, {at: idx});
                }
                me.cmbBulletFormat.setData(store.models);
                me.cmbBulletFormat.selectRecord(me.cmbBulletFormat.store.findWhere({value: _BulletTypes.image}));
                me.btnOk.setDisabled(false);
            };
            this.api.asc_registerCallback('asc_onBulletImageLoaded', onApiImageLoaded);

            var insertImageFromStorage = function(data) {
                if (data && data._urls && data.c=='bullet') {
                    (new Asc.asc_CBullet()).asc_putImageUrl(data._urls[0], data.token);
                }
            };
            Common.NotificationCenter.on('storage:image-insert', insertImageFromStorage);

            this.on('close', function(obj){
                me.api.asc_unregisterCallback('asc_onBulletImageLoaded', onApiImageLoaded);
                Common.NotificationCenter.off('storage:image-insert', insertImageFromStorage);
            });
        },

        onBulletFormatOpen: function(combo) {
            var store = combo.store,
                rec = store.findWhere({value: _BulletTypes.image});
            if (rec && this.imageProps.redraw) {
                var bullet = new Asc.asc_CBullet();
                bullet.asc_fillBulletImage(this.imageProps.id);
                bullet.drawSquareImage('id-dlg-list-bullet-image-preview');
                this.imageProps.redraw = false;
            }
        },

        updateThemeColors: function() {
            this.colors.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
        },

        onColorsSelect: function(btn, color) {
            this.color = color;
            if (this._changedProps) {
                this._changedProps.asc_putColor(Common.Utils.ThemeColor.getRgbColor(color));
            }
        },

        onListTypeClick: function(type, btn, event) {
            this.ShowHideElem(type);
        },

        ShowHideElem: function(value) {
            var isImage = value==0 && (this.cmbBulletFormat.getValue()===_BulletTypes.image || this.cmbBulletFormat.getValue()===_BulletTypes.newImage ||
                                      (this.cmbBulletFormat.getValue()===undefined || this.cmbBulletFormat.getValue()==='') && this.originalType === AscFormat.BULLET_TYPE_BULLET_BLIP);
            this.numberingControls.toggleClass('hidden', value==0);
            this.imageControls.toggleClass('hidden', !isImage);
            this.colorControls.toggleClass('hidden', isImage);
            this.cmbNumFormat.setVisible(value==1);
            this.cmbBulletFormat.setVisible(value==0);
            this.btnOk.setDisabled(isImage && (this.cmbBulletFormat.getValue()===_BulletTypes.newImage));
            var me = this;
            _.delay(function(){
                if (value)
                    me.cmbNumFormat.focus();
                else
                    me.cmbBulletFormat.focus();
            },50);
        },

        _handleInput: function(state) {
            if (this.options.handler)
            {
                if (state == 'ok' && this.btnOk.isDisabled()) {
                    return;
                }
                var type = this.btnBullet.pressed ? 0 : 1;
                if (this.originalType == AscFormat.BULLET_TYPE_BULLET_NONE) {
                    this._changedProps = new Asc.asc_CBullet();
                    this._changedProps.asc_putSize(this.spnSize.getNumberValue());
                    if (type==0 && this.cmbBulletFormat.getValue()===_BulletTypes.image && this.imageProps) {//image
                        this._changedProps.asc_fillBulletImage(this.imageProps.id);
                    } else {
                        this._changedProps.asc_putColor(Common.Utils.ThemeColor.getRgbColor(this.color));
                    }
                }

                if (this.originalType == AscFormat.BULLET_TYPE_BULLET_NONE ||
                    (this.originalType == AscFormat.BULLET_TYPE_BULLET_CHAR || this.originalType == AscFormat.BULLET_TYPE_BULLET_BLIP) && type==1 ||
                    this.originalType == AscFormat.BULLET_TYPE_BULLET_AUTONUM && type==0) { // changed list type
                    if (type==0) {//markers
                        if (this.cmbBulletFormat.getValue()==_BulletTypes.none) {
                            this._changedProps.asc_putListType(0, -1);
                        } else if (this.cmbBulletFormat.getValue()==_BulletTypes.image) {

                        } else {
                            this._changedProps.asc_putFont(this.bulletProps.font);
                            this._changedProps.asc_putSymbol(this.bulletProps.symbol);
                        }
                    } else {
                        this._changedProps.asc_putListType(1, this.cmbNumFormat.getValue());
                        this._changedProps.asc_putNumStartAt(this.spnStart.getNumberValue());
                    }
                }
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
                var type = 0;
                var bullet = props.asc_getBullet();
                if (bullet) {
                    this.originalType = bullet.asc_getType();

                    this.spnSize.setValue(bullet.asc_getSize() || '', true);

                    var color = bullet.asc_getColor();
                    if (color) {
                        if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            color = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value()};
                        } else {
                            color = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                        }
                    } else
                        color = 'transparent';
                    this.color = Common.Utils.ThemeColor.colorValue2EffectId(color);
                    this.btnColor.setColor(color);
                    Common.Utils.ThemeColor.selectPickerColorByEffect(color, this.colors);

                    if (this.originalType == AscFormat.BULLET_TYPE_BULLET_NONE) {
                        this.cmbNumFormat.setValue(-1);
                        this.cmbBulletFormat.setValue(_BulletTypes.none);
                        type = this.type;
                    } else if (this.originalType == AscFormat.BULLET_TYPE_BULLET_CHAR) {
                        var symbol = bullet.asc_getSymbol();
                        if (symbol) {
                            this.bulletProps = {symbol: symbol, font: bullet.asc_getFont()};
                            if (!this.cmbBulletFormat.store.findWhere({value: _BulletTypes.symbol, symbol: this.bulletProps.symbol, font: this.bulletProps.font}))
                                this.cmbBulletFormat.store.add({ displayValue: this.txtSymbol + ': ', value: _BulletTypes.symbol, symbol: this.bulletProps.symbol, font: this.bulletProps.font }, {at: this.cmbBulletFormat.store.length-2});
                            this.cmbBulletFormat.setData(this.cmbBulletFormat.store.models);
                            this.cmbBulletFormat.selectRecord(this.cmbBulletFormat.store.findWhere({value: _BulletTypes.symbol, symbol: this.bulletProps.symbol, font: this.bulletProps.font}));
                        } else
                            this.cmbBulletFormat.setValue('');
                        this._changedProps = bullet;
                        type = 0;
                    } else if (this.originalType == AscFormat.BULLET_TYPE_BULLET_BLIP) {
                        var id = bullet.asc_getImageId();
                        if (id) {
                            this.imageProps = {id: id, redraw: true};
                            if (!this.cmbBulletFormat.store.findWhere({value: _BulletTypes.image}))
                                this.cmbBulletFormat.store.add({ displayValue: this.txtImage + ':', value: _BulletTypes.image}, {at: this.cmbBulletFormat.store.length-2});
                            this.cmbBulletFormat.setData(this.cmbBulletFormat.store.models);
                            this.cmbBulletFormat.selectRecord(this.cmbBulletFormat.store.findWhere({value: _BulletTypes.image}));
                        } else
                            this.cmbBulletFormat.setValue('');
                        this._changedProps = bullet;
                        type = 0;
                    } else if (this.originalType == AscFormat.BULLET_TYPE_BULLET_AUTONUM) {
                        var autonum = bullet.asc_getAutoNumType();
                        this.cmbNumFormat.setValue(autonum, '');

                        var value = bullet.asc_getNumStartAt();
                        this.spnStart.setValue(value || '', true);
                        this.spnStart.setDisabled(value===null);
                        this._changedProps = bullet;
                        type = 1;
                    }
                } else {// different bullet types
                    this.cmbNumFormat.setValue(-1);
                    this.cmbBulletFormat.setValue(_BulletTypes.none);
                    this._changedProps = new Asc.asc_CBullet();
                    type = this.type;
                }
            }

            (type == 1) ? this.btnNumbering.toggle(true) : this.btnBullet.toggle(true);
            this.ShowHideElem(type);
        },

        onImageSelect: function(menu, item) {
            if (item.value==1) {
                var me = this;
                (new Common.Views.ImageFromUrlDialog({
                    handler: function(result, value) {
                        if (result == 'ok') {
                            var checkUrl = value.replace(/ /g, '');
                            if (!_.isEmpty(checkUrl)) {
                                (new Asc.asc_CBullet()).asc_putImageUrl(checkUrl);
                            }
                        }
                    }
                })).on('close', function() {
                    me.btnSelectImage.focus();
                }).show();
            } else if (item.value==2) {
                Common.NotificationCenter.trigger('storage:image-load', 'bullet');
            } else {
                (new Asc.asc_CBullet()).asc_showFileDialog();
            }
        },

        txtTitle: 'List Settings',
        txtSize: 'Size',
        txtColor: 'Color',
        txtOfText: '% of text',
        txtStart: 'Start at',
        textBulleted: 'Bulleted',
        textNumbering: 'Numbered',
        txtType: 'Type',
        txtNone: 'None',
        txtNewBullet: 'New bullet',
        txtSymbol: 'Symbol',
        txtNewImage: 'New image',
        txtImage: 'Image',
        txtImport: 'Import',
        textSelect: 'Select From',
        textFromUrl: 'From URL',
        textFromFile: 'From File',
        textFromStorage: 'From Storage'
    }, Common.Views.ListSettingsDialog || {}))
});