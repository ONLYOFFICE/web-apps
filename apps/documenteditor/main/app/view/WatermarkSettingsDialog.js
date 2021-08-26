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
 *  WatermarkSettingsDialog.js.js
 *
 *  Created by Julia Radzhabova on 04.04.2019
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */

define(['text!documenteditor/main/app/template/WatermarkSettings.template',
    'common/main/lib/util/utils',
    'common/main/lib/component/RadioBox',
    'common/main/lib/component/InputField',
    'common/main/lib/view/AdvancedSettingsWindow'
], function (template) { 'use strict';

    DE.Views.WatermarkText = new(function() {
        var langs;
        var _get = function() {
            return langs;
        };
        var _load = function(callback) {
            langs = [];
            Common.Utils.loadConfig('resources/watermark/wm-text.json', function (langJson) {
                for (var lang in langJson) {
                    var val = Common.util.LanguageInfo.getLocalLanguageCode(lang);
                    if (val) {
                        langs.push({code: val, name: Common.util.LanguageInfo.getLocalLanguageName(val)[1], shortname: Common.util.LanguageInfo.getLocalLanguageName(val)[0], text: langJson[lang]});
                    }
                }
                langs.sort(function(a, b) {
                    if (a.shortname < b.shortname) return -1;
                    if (a.shortname > b.shortname) return 1;
                    return 0;
                });
                callback && callback(langs);
            });
        };
        return {
            get: _get,
            load: _load
        };
    })();

    DE.Views.WatermarkSettingsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 400,
            height: 442
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                template: _.template(
                    [
                        '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                        '<div class="content-panel" style="padding: 10px 5px;"><div class="inner-content">',
                        '<div class="settings-panel active">',
                        template,
                        '</div></div>',
                        '</div>',
                        '</div>'
                    ].join('')
                )({
                    scope: this
                })
            }, options);

            this.handler    = options.handler;
            this.props      = options.props;
            this.fontStore = options.fontStore;
            this.api        = options.api;
            this.storage    = !!options.storage;
            this.textControls = [];
            this.imageControls = [];
            this.fontName = 'Arial';
            this.text = '';
            this.isAutoColor = false;
            this.isImageLoaded = false;

            var lang = options.lang || 'en',
                val = Common.util.LanguageInfo.getLocalLanguageCode(lang);
            this.lang = val ? {value: lang, displayValue: Common.util.LanguageInfo.getLocalLanguageName(val)[1], default: true} : {value: 'en', displayValue: 'English', default: true};

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.radioNone = new Common.UI.RadioBox({
                el: $('#watermark-radio-none'),
                name: 'asc-radio-watermark-type',
                labelText: this.textNone,
                checked: false
            });
            this.radioNone.on('change', _.bind(function(field, newValue, eOpts) {
                if (newValue) {
                    // disable text and image
                    this.props.put_Type(Asc.c_oAscWatermarkType.None);
                    this.disableControls(Asc.c_oAscWatermarkType.None);
                }
            }, this));

            this.radioImage = new Common.UI.RadioBox({
                el: $('#watermark-radio-image'),
                name: 'asc-radio-watermark-type',
                labelText: this.textImageW,
                checked: false
            });
            this.radioImage.on('change', _.bind(function(field, newValue, eOpts) {
                if (newValue) {
                    // disable text
                    this.props.put_Type(Asc.c_oAscWatermarkType.Image);
                    this.disableControls(Asc.c_oAscWatermarkType.Image);
                    this.focusControls();
                }
            }, this));

            this.radioText = new Common.UI.RadioBox({
                el: $('#watermark-radio-text'),
                name: 'asc-radio-watermark-type',
                labelText: this.textTextW,
                checked: true
            });
            this.radioText.on('change', _.bind(function(field, newValue, eOpts) {
                if (newValue) {
                    // disable image
                    this.props.put_Type(Asc.c_oAscWatermarkType.Text);
                    this.disableControls(Asc.c_oAscWatermarkType.Text);
                    this.focusControls();
                }
            }, this));

            // Image watermark
            this.btnSelectImage = new Common.UI.Button({
                parentEl: $('#watermark-select-image'),
                cls: 'btn-text-menu-default',
                caption: this.textSelect,
                style: 'width: 142px;',
                menu: new Common.UI.Menu({
                    style: 'min-width: 142px;',
                    maxHeight: 200,
                    additionalAlign: this.menuAddAlign,
                    items: [
                        {caption: this.textFromFile, value: 0},
                        {caption: this.textFromUrl, value: 1},
                        {caption: this.textFromStorage, value: 2}
                    ]
                })
            });
            this.imageControls.push(this.btnSelectImage);
            this.btnSelectImage.menu.on('item:click', _.bind(this.onImageSelect, this));
            this.btnSelectImage.menu.items[2].setVisible(this.storage);

            this._arrScale = [
                {displayValue: this.textAuto,   value: -1},
                {displayValue: '500%', value: 500},
                {displayValue: '200%', value: 200},
                {displayValue: '150%', value: 150},
                {displayValue: '100%', value: 100},
                {displayValue: '50%', value: 50}
            ];
            this.cmbScale = new Common.UI.ComboBox({
                el          : $('#watermark-combo-scale'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 142px;',
                data        : this._arrScale,
                takeFocusOnClose: true
            }).on('selected', _.bind(function(combo, record) {
            }, this));
            this.cmbScale.setValue(this._arrScale[0].value);
            this.imageControls.push(this.cmbScale);

            // Text watermark
            this.cmbLang = new Common.UI.ComboBox({
                el          : $('#watermark-combo-lang'),
                cls         : 'input-group-nr',
                editable    : false,
                menuStyle   : 'min-width: 100%;max-height: 210px;',
                scrollAlwaysVisible: true,
                data        : [],
                takeFocusOnClose: true
            }).on('selected', _.bind(this.onSelectLang, this));
            this.cmbLang.setValue(Common.util.LanguageInfo.getLocalLanguageName(9)[1]);//en
            this.textControls.push(this.cmbLang);

            this.cmbText = new Common.UI.ComboBox({
                el          : $('#watermark-combo-text'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 100%;max-height: 210px;',
                scrollAlwaysVisible: true,
                displayField: 'value',
                data        : [{value: "ASAP"}, {value: "CONFIDENTIAL"}, {value: "COPY"}, {value: "DO NOT COPY"}, {value: "DRAFT"}, {value: "ORIGINAL"}, {value: "PERSONAL"}, {value: "SAMPLE"}, {value: "TOP SECRET"}, {value: "URGENT"} ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function(combo, record) {
            }, this));
            this.cmbText.setValue(this.cmbText.options.data[0].value);
            this.textControls.push(this.cmbText);

            this.cmbFonts = new Common.UI.ComboBoxFonts({
                el          : $('#watermark-fonts'),
                cls         : 'input-group-nr',
                style       : 'width: 142px;',
                menuCls     : 'scrollable-menu',
                menuStyle   : 'min-width: 100%;max-height: 270px;',
                store       : new Common.Collections.Fonts(),
                recent      : 0,
                hint        : this.tipFontName,
                takeFocusOnClose: true
            }).on('selected', _.bind(function(combo, record) {
                this.fontName = record.name;
            }, this));
            this.textControls.push(this.cmbFonts);

            var data = [
                { value: -1, displayValue: this.textAuto },
                { value: 36, displayValue: "36" },
                { value: 40, displayValue: "40" },
                { value: 44, displayValue: "44" },
                { value: 48, displayValue: "48" },
                { value: 54, displayValue: "54" },
                { value: 60, displayValue: "60" },
                { value: 66, displayValue: "66" },
                { value: 72, displayValue: "72" },
                { value: 80, displayValue: "80" },
                { value: 90, displayValue: "90" },
                { value: 96, displayValue: "96" },
                { value: 105, displayValue: "105" },
                { value: 120, displayValue: "120" },
                { value: 144, displayValue: "144" }
            ];
            this.cmbFontSize = new Common.UI.ComboBox({
                el: $('#watermark-font-size'),
                cls: 'input-group-nr',
                style: 'width: 55px;',
                menuCls     : 'scrollable-menu',
                menuStyle: 'min-width: 55px;max-height: 270px;',
                hint: this.tipFontSize,
                data: data,
                takeFocusOnClose: true
            });
            this.cmbFontSize.setValue(-1);
            this.textControls.push(this.cmbFontSize);

            this.btnBold = new Common.UI.Button({
                parentEl: $('#watermark-bold'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-bold',
                enableToggle: true,
                hint: this.textBold
            });
            this.textControls.push(this.btnBold);

            this.btnItalic = new Common.UI.Button({
                parentEl: $('#watermark-italic'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-italic',
                enableToggle: true,
                hint: this.textItalic
            });
            this.textControls.push(this.btnItalic);

            this.btnUnderline = new Common.UI.Button({
                parentEl: $('#watermark-underline'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-underline',
                enableToggle: true,
                hint: this.textUnderline
            });
            this.textControls.push(this.btnUnderline);

            this.btnStrikeout = new Common.UI.Button({
                parentEl: $('#watermark-strikeout'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-strikeout',
                enableToggle: true,
                hint: this.textStrikeout
            });
            this.textControls.push(this.btnStrikeout);

            var initNewColor = function(btn, picker_el) {
                if (btn && btn.cmpEl) {
                    btn.currentColor = 'c0c0c0';
                    btn.setColor( btn.currentColor);
                    var picker = new Common.UI.ThemeColorPalette({
                        el: $(picker_el)
                    });
                }
                btn.menu.cmpEl.on('click', picker_el+'-new', _.bind(function() {
                    picker.addNewColor((typeof(btn.color) == 'object') ? btn.color.color : btn.color);
                }, me));
                picker.on('select', _.bind(me.onColorSelect, me));
                return picker;
            };
            this.btnTextColor = new Common.UI.ButtonColored({
                parentEl: $('#watermark-textcolor'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-fontcolor',
                hint        : this.textColor,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-left',
                    additionalAlign: this.menuAddAlign,
                    items: [
                    {
                        id: 'watermark-auto-color',
                        caption: this.textAuto,
                        template: _.template('<a tabindex="-1" type="menuitem"><span class="menu-item-icon" style="background-image: none; width: 12px; height: 12px; margin: 1px 7px 0 1px; background-color: #000;"></span><%= caption %></a>')
                    },
                    {caption: '--'},
                        { template: _.template('<div id="watermark-menu-textcolor" style="width: 169px; height: 216px; margin: 10px;"></div>') },
                        { template: _.template('<a id="watermark-menu-textcolor-new">' + this.textNewColor + '</a>') }
                    ]
                })
            });
            this.mnuTextColorPicker = initNewColor(this.btnTextColor, "#watermark-menu-textcolor");
            $('#watermark-auto-color').on('click', _.bind(this.onAutoColor, this));
            this.textControls.push(this.btnTextColor);

            this.chTransparency = new Common.UI.CheckBox({
                el: $('#watermark-chb-transparency'),
                labelText: this.textTransparency,
                value: true
            });
            this.textControls.push(this.chTransparency);

            this.radioDiag = new Common.UI.RadioBox({
                el: $('#watermark-radio-diag'),
                name: 'asc-radio-watermark-layout',
                labelText: this.textDiagonal,
                checked: true
            });
            this.textControls.push(this.radioDiag);

            this.radioHor = new Common.UI.RadioBox({
                el: $('#watermark-radio-hor'),
                name: 'asc-radio-watermark-layout',
                labelText: this.textHor
            });
            this.textControls.push(this.radioHor);

            this.btnOk = new Common.UI.Button({
                el: this.$window.find('.primary'),
                disabled: true
            });

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [ this.radioNone, this.radioText, this.cmbLang, this.cmbText, this.cmbFonts, this.chTransparency, this.radioDiag, this.radioHor, this.radioImage, this.cmbFontSize, this.cmbScale ];
        },

        getDefaultFocusableComponent: function () {
            if (!this.cmbLang.isDisabled())
                return this.cmbLang;
            else if (!this.cmbScale.isDisabled())
                return this.cmbScale;
            else
                return this.radioNone;
        },

        focusControls: function() {
            var el = this.getDefaultFocusableComponent();
            el && setTimeout(function(){
                el.focus();
            }, 10);
        },

        onColorSelect: function(picker, color) {
            var clr_item = this.btnTextColor.menu.$el.find('#watermark-auto-color > a');
            clr_item.hasClass('selected') && clr_item.removeClass('selected');
            this.isAutoColor = false;

            this.btnTextColor.currentColor = color;
            this.btnTextColor.setColor( this.btnTextColor.currentColor);
        },

        updateThemeColors: function() {
            this.mnuTextColorPicker.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
        },

        addNewColor: function(picker, btn) {
            picker.addNewColor((typeof(btn.color) == 'object') ? btn.color.color : btn.color);
        },

        onAutoColor: function(e) {
            var clr_item = this.btnTextColor.menu.$el.find('#watermark-auto-color > a');
            !clr_item.hasClass('selected') && clr_item.addClass('selected');
            this.isAutoColor = true;

            this.btnTextColor.currentColor = "000";
            this.btnTextColor.setColor( this.btnTextColor.currentColor);
            this.mnuTextColorPicker.clearSelection();
        },

        afterRender: function() {
            this.cmbFonts.fillFonts(this.fontStore);
            this.cmbFonts.selectRecord(this.fontStore.findWhere({name: this.fontName}));

            this.updateThemeColors();
            this._setDefaults(this.props);

            var me = this;
            var onApiWMLoaded = function() {
                me.isImageLoaded = true;
                me.btnOk.setDisabled(false);
            };
            this.api.asc_registerCallback('asc_onWatermarkImageLoaded', onApiWMLoaded);

            var insertImageFromStorage = function(data) {
                if (data && data.url && data.c=='watermark') {
                    me.props.put_ImageUrl(data.url, data.token);
                }
            };
            Common.NotificationCenter.on('storage:image-insert', insertImageFromStorage);

            this.on('close', function(obj){
                me.api.asc_unregisterCallback('asc_onWatermarkImageLoaded', onApiWMLoaded);
                Common.NotificationCenter.off('storage:image-insert', insertImageFromStorage);
            });
        },

        loadLanguages: function() {
            var me = this,
                focus = false;
            var callback = function(languages) {
                var data = [];
                me.languages = languages;
                me.languages && me.languages.forEach(function(item) {
                    data.push({displayValue: item.name, value: item.shortname, wmtext: item.text});
                });
                if (data.length) {
                    me.cmbLang.setData(data);
                    var res = me.loadWMText(me.lang.value);
                    if (res && me.lang.default)
                        me.cmbLang.setValue(res);
                    else
                        me.cmbLang.setValue(me.lang.displayValue);
                    me.cmbLang.setDisabled(!me.radioText.getValue());
                    me.text && me.cmbText.setValue(me.text);
                } else
                    me.cmbLang.setDisabled(true);
                focus && me.focusControls();
            };
            var languages = DE.Views.WatermarkText.get();
            focus = !languages;
            if (languages)
                callback(languages);
            else
                DE.Views.WatermarkText.load(callback);
        },

        onSelectLang: function(combo, record) {
            if (!record) return;

            var data = [];
            record.wmtext.forEach(function(item) {
                data.push({value: item});
            });
            this.lang = record;
            if (data.length>0) {
                this.cmbText.setData(data);
                this.cmbText.setValue(data[0].value);
            }
        },

        loadWMText: function(lang) {
            if (!lang) return;

            var data = [];
            var item = this.cmbLang.store.findWhere({value: lang});
            if (!item)
                item = this.cmbLang.store.findWhere({value: lang.split(/[\-\_]/)[0]});
            if (!item)
                item = this.cmbLang.store.findWhere({value: 'en'});
            if (!item)
                item = this.cmbLang.store.at(0);

            item && item.get('wmtext').forEach(function(item) {
                data.push({value: item});
            });
            if (data.length>0) {
                this.cmbText.setData(data);
                this.cmbText.setValue(data[0].value);
            }
            return item ? item.get('displayValue') : null;
        },

        onImageSelect: function(menu, item) {
            if (item.value==1) {
                var me = this;
                (new Common.Views.ImageFromUrlDialog({
                    handler: function(result, value) {
                        if (result == 'ok') {
                            var checkUrl = value.replace(/ /g, '');
                            if (!_.isEmpty(checkUrl)) {
                                me.props.put_ImageUrl(checkUrl);
                            }
                        }
                    }
                })).show();
            } else if (item.value==2) {
                Common.NotificationCenter.trigger('storage:image-load', 'watermark');
            } else {
                this.props.showFileDialog();
            }
        },

        _setDefaults: function (props) {
            this.loadLanguages();
            if (props) {
                props.put_DivId('watermark-texture-img');
                props.put_Api(this.api);

                var val,
                    type = props.get_Type();
                if (type == Asc.c_oAscWatermarkType.None) {
                    this.radioNone.setValue(true, true);
                } else if (type == Asc.c_oAscWatermarkType.Image) {
                    this.radioImage.setValue(true, true);
                    this.isImageLoaded = !!props.get_ImageUrl();
                    val = props.get_Scale() || -1;
                    this.cmbScale.setValue((val<0) ? -1 : Math.round(val*100), Math.round(val*100) + ' %');
                } else {
                    this.radioText.setValue(true, true);
                    !props.get_IsDiagonal() && this.radioHor.setValue(true);
                    this.chTransparency.setValue(props.get_Opacity()<255);

                    val = props.get_TextPr();
                    if (val) {
                        var lang = Common.util.LanguageInfo.getLocalLanguageName(val.get_Lang());
                        this.lang = {value: lang[0], displayValue: lang[1]};
                        this.cmbLang.setValue(lang[1]);
                        this.loadWMText(lang[0]);

                        var font = val.get_FontFamily().get_Name();
                        if (font) {
                            var rec = this.cmbFonts.store.findWhere({name: font});
                            this.fontName = (rec) ? rec.get('name') : font;
                            this.cmbFonts.setValue(this.fontName);
                        }

                        this.cmbFontSize.setValue(val.get_FontSize());
                        this.btnBold.toggle(val.get_Bold());
                        this.btnItalic.toggle(val.get_Italic());
                        this.btnUnderline.toggle(val.get_Underline());
                        this.btnStrikeout.toggle(val.get_Strikeout());
                        var color = val.get_Color(),
                            clr_item = this.btnTextColor.menu.$el.find('#watermark-auto-color > a'),
                            clr = "c0c0c0";

                        if (color.get_auto()) {
                            clr = "000";
                            this.isAutoColor = true;
                            this.mnuTextColorPicker.clearSelection();
                            !clr_item.hasClass('selected') && clr_item.addClass('selected');
                        } else {
                            clr_item.hasClass('selected') && clr_item.removeClass('selected');
                            if (color) {
                                color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME ?
                                    clr = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value()} :
                                    clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                            }
                            if ( typeof(clr) == 'object' ) {
                                var isselected = false;
                                for (var i=0; i<10; i++) {
                                    if ( Common.Utils.ThemeColor.ThemeValues[i] == clr.effectValue ) {
                                        this.mnuTextColorPicker.select(clr,true);
                                        isselected = true;
                                        break;
                                    }
                                }
                                if (!isselected) this.mnuTextColorPicker.clearSelection();
                            } else {
                                this.mnuTextColorPicker.select(clr,true);
                            }
                        }
                        this.btnTextColor.currentColor = clr;
                        this.btnTextColor.setColor( this.btnTextColor.currentColor);
                    }
                    val = props.get_Text();
                    val && this.cmbText.setValue(val);
                    this.text = val || '';
                }
                this.disableControls(type);
            }
        },

        getSettings: function () {
            var props = this.props;

            var val = this.props.get_Type();
            if (val == Asc.c_oAscWatermarkType.Image) {
                val = parseInt(this.cmbScale.getValue());
                isNaN(val) && (val = -1);
                props.put_Scale((val<0) ? val : val/100);
            } else {
                props.put_Text(this.cmbText.getValue());
                props.put_IsDiagonal(this.radioDiag.getValue());
                props.put_Opacity((this.chTransparency.getValue()=='checked') ? 128: 255);

                val = props.get_TextPr() || new Asc.CTextProp();
                if (val) {
                    val.put_FontSize(Math.min(this.cmbFontSize.getValue(), 1638));
                    var font = new AscCommon.asc_CTextFontFamily();
                    font.put_Name(this.fontName);
                    font.put_Index(-1);
                    val.put_FontFamily(font);
                    val.put_Bold(this.btnBold.pressed);
                    val.put_Italic(this.btnItalic.pressed);
                    val.put_Underline(this.btnUnderline.pressed);
                    val.put_Strikeout(this.btnStrikeout.pressed);

                    val.put_Lang(parseInt(Common.util.LanguageInfo.getLocalLanguageCode(this.lang.value)));

                    var color = new Asc.asc_CColor();
                    if (this.isAutoColor) {
                        color.put_auto(true);
                    } else {
                        color = Common.Utils.ThemeColor.getRgbColor(this.btnTextColor.currentColor);
                    }
                    val.put_Color(color);
                    props.put_TextPr(val);
                }
            }

            return this.props;
        },

        disableControls: function(type) {// 0 - none, 1 - text, 2 - image
            var disable = (type!=Asc.c_oAscWatermarkType.Image);
            _.each(this.imageControls, function(item) {
                item.setDisabled(disable);
            });

            disable = (type!=Asc.c_oAscWatermarkType.Text);
            _.each(this.textControls, function(item) {
                item.setDisabled(disable);
            });
            this.cmbLang.setDisabled(disable || !this.languages || this.languages.length<1);
            this.btnOk.setDisabled(type==Asc.c_oAscWatermarkType.Image && !this.isImageLoaded);
        },

        onDlgBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.handler) {
                if (state == 'ok' && this.btnOk.isDisabled()) {
                    return;
                }
                this.handler.call(this, state, this.getSettings());
            }

            this.close();
        },

        textTitle: 'Watermark Settings',
        textNone: 'None',
        textImageW: 'Image watermark',
        textTextW: 'Text watermark',
        textFromUrl: 'From URL',
        textFromFile: 'From File',
        textScale: 'Scale',
        textAuto: 'Auto',
        textText: 'Text',
        textFont: 'Font',
        tipFontName: 'Font Name',
        tipFontSize: 'Font Size',
        textBold:    'Bold',
        textItalic:  'Italic',
        textUnderline: 'Underline',
        textStrikeout: 'Strikeout',
        textTransparency: 'Semitransparent',
        textLayout: 'Layout',
        textDiagonal: 'Diagonal',
        textHor: 'Horizontal',
        textColor: 'Text color',
        textNewColor: 'Add New Custom Color',
        textLanguage: 'Language',
        textFromStorage: 'From Storage',
        textSelect: 'Select Image'

    }, DE.Views.WatermarkSettingsDialog || {}))
});