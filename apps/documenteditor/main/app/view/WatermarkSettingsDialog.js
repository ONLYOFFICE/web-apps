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
                        '</div>',
                        '<div class="footer center">',
                        '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + me.okButtonText + '</button>',
                        '<button class="btn normal dlg-btn" result="cancel">' + me.cancelButtonText + '</button>',
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

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.radioNone = new Common.UI.RadioBox({
                el: $('#watermark-radio-none'),
                name: 'asc-radio-watermark-type',
                labelText: this.textNone,
                checked: true
            });
            // this.radioNone.on('change', _.bind(this.onRadioTypeChange, this));

            this.radioImage = new Common.UI.RadioBox({
                el: $('#watermark-radio-image'),
                name: 'asc-radio-watermark-type',
                labelText: this.textImageW,
                checked: true
            });
            // this.radioImage.on('change', _.bind(this.onRadioTypeChange, this));

            this.radioText = new Common.UI.RadioBox({
                el: $('#watermark-radio-text'),
                name: 'asc-radio-watermark-type',
                labelText: this.textTextW,
                checked: true
            });
            // this.radioText.on('change', _.bind(this.onRadioTypeChange, this));

            // Image watermark
            this.btnFromFile = new Common.UI.Button({
                el: $('#watermark-from-file')
            });
            this.btnFromFile.on('click', _.bind(function(btn){
                // if (this.api) this.api.ChangeShapeImageFromFile(this.BlipFillType);
            }, this));

            this.btnFromUrl = new Common.UI.Button({
                el: $('#watermark-from-url')
            });
            // this.btnFromUrl.on('click', _.bind(this.insertFromUrl, this));

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
                menuStyle   : 'min-width: 90px;',
                editable: false,
                data        : this._arrScale
            }).on('selected', _.bind(function(combo, record) {
            }, this));
            this.cmbScale.setValue(this._arrScale[0].value);

            // Text watermark
            this.cmbText = new Common.UI.ComboBox({
                el          : $('#watermark-combo-text'),
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 100%;',
                data        : []
            }).on('selected', _.bind(function(combo, record) {
            }, this));

            this.cmbFonts = new Common.UI.ComboBoxFonts({
                el          : $('#watermark-fonts'),
                cls         : 'input-group-nr',
                style       : 'width: 142px;',
                menuCls     : 'scrollable-menu',
                menuStyle   : 'min-width: 100%;max-height: 270px;',
                store       : new Common.Collections.Fonts(),
                recent      : 0,
                hint        : this.tipFontName
            });
            // this.cmbFonts.on('selected', _.bind(this.onFontSelect, this));

            var data = [
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
                { value: 72, displayValue: "72" }
            ];
            this.cmbFontSize = new Common.UI.ComboBox({
                el: $('#watermark-font-size'),
                cls: 'input-group-nr',
                style: 'width: 55px;',
                menuCls     : 'scrollable-menu',
                menuStyle: 'min-width: 55px;max-height: 270px;',
                hint: this.tipFontSize,
                data: data
            });
            // this.cmbFontSize.on('selected', _.bind(this.onFontSizeSelect, this));
            this.cmbFontSize.setValue(-1);

            this.btnBold = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-bold',
                enableToggle: true,
                hint: this.textBold
            });
            this.btnBold.render($('#watermark-bold')) ;
            // this.btnBold.on('click', _.bind(this.onBoldClick, this));

            this.btnItalic = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-italic',
                enableToggle: true,
                hint: this.textItalic
            });
            this.btnItalic.render($('#watermark-italic')) ;
            // this.btnItalic.on('click', _.bind(this.onItalicClick, this));

            this.btnUnderline = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-underline',
                enableToggle: true,
                hint: this.textUnderline
            });
            this.btnUnderline.render($('#watermark-underline')) ;
            // this.btnUnderline.on('click', _.bind(this.onUnderlineClick, this));

            this.btnStrikeout = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-strikeout',
                enableToggle: true,
                hint: this.textStrikeout
            });
            this.btnStrikeout.render($('#watermark-strikeout')) ;
            // this.btnStrikeout.on('click',_.bind(this.onStrikeoutClick, this));

            var initNewColor = function(btn, picker_el) {
                if (btn && btn.cmpEl) {
                    btn.currentColor = '#000000';
                    var colorVal = $('<div class="btn-color-value-line"></div>');
                    $('button:first-child', btn.cmpEl).append(colorVal);
                    colorVal.css('background-color', btn.currentColor);
                    var picker = new Common.UI.ThemeColorPalette({
                        el: $(picker_el)
                    });
                    picker.currentColor = btn.currentColor;
                }
                btn.menu.cmpEl.on('click', picker_el+'-new', _.bind(function() {
                    picker.addNewColor((typeof(btn.color) == 'object') ? btn.color.color : btn.color);
                }, me));
                picker.on('select', _.bind(me.onColorSelect, me));
                return picker;
            };
            this.btnTextColor = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-fontcolor',
                hint        : this.textColor,
                menu        : new Common.UI.Menu({
                    items: [
                    {
                        id: 'watermark-auto-color',
                        caption: this.textAuto,
                        template: _.template('<a tabindex="-1" type="menuitem"><span class="menu-item-icon" style="background-image: none; width: 12px; height: 12px; margin: 1px 7px 0 -7px; background-color: #000;"></span><%= caption %></a>')
                    },
                    {caption: '--'},
                        { template: _.template('<div id="watermark-menu-textcolor" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                        { template: _.template('<a id="watermark-menu-textcolor-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                    ]
                })
            });
            this.btnTextColor.render($('#watermark-textcolor'));
            // this.btnTextColor.on('click', _.bind(this.onTextColor, this));
            this.mnuTextColorPicker = initNewColor(this.btnTextColor, "#watermark-menu-textcolor");
            $('#watermark-auto-color').on('click', _.bind(this.onAutoColor, this));


            this.numTransparency = new Common.UI.MetricSpinner({
                el: $('#watermark-spin-opacity'),
                step: 1,
                width: 62,
                value: '100 %',
                defaultUnit : "%",
                maxValue: 100,
                minValue: 0
            });
            // this.numTransparency.on('change', _.bind(this.onNumTransparencyChange, this));

            this.sldrTransparency = new Common.UI.SingleSlider({
                el: $('#watermark-slider-opacity'),
                width: 75,
                minValue: 0,
                maxValue: 100,
                value: 100
            });
            // this.sldrTransparency.on('change', _.bind(this.onTransparencyChange, this));
            // this.sldrTransparency.on('changecomplete', _.bind(this.onTransparencyChangeComplete, this));

            this.lblTransparencyStart = $(this.el).find('#watermark-lbl-opacity-start');
            this.lblTransparencyEnd = $(this.el).find('#watermark-lbl-opacity-end');

            this.radioDiag = new Common.UI.RadioBox({
                el: $('#watermark-radio-diag'),
                name: 'asc-radio-watermark-layout',
                labelText: this.textDiagonal,
                checked: true
            });
            this.radioHor = new Common.UI.RadioBox({
                el: $('#watermark-radio-hor'),
                name: 'asc-radio-watermark-layout',
                labelText: this.textHor
            });

            this.afterRender();
        },

        onColorSelect: function(picker, color) {
            var clr_item = this.btnTextColor.menu.$el.find('#watermark-auto-color > a');
            clr_item.hasClass('selected') && clr_item.removeClass('selected');
            this.isAutoColor = false;

            var clr = (typeof(color) == 'object') ? color.color : color;
            this.btnTextColor.currentColor = color;
            $('.btn-color-value-line', this.btnTextColor.cmpEl).css('background-color', '#' + clr);
            picker.currentColor = color;
            // this.HFObject.setTextColor(Common.Utils.ThemeColor.getRgbColor(color));
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

            var color = "000";
            this.btnTextColor.currentColor = color;
            $('.btn-color-value-line', this.btnTextColor.cmpEl).css('background-color', '#' + color);
            this.mnuTextColorPicker.currentColor = color;
        },

        afterRender: function() {
            this.cmbFonts.fillFonts(this.fontStore);
            this.cmbFonts.selectRecord(this.fontStore.findWhere({name: 'Arial'}));

            this.updateThemeColors();
            this._setDefaults(this.props);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        _setDefaults: function (props) {
            if (props) {
                var val = props.get_Alias();
                this.txtName.setValue(val ? val : '');

                val = props.get_Tag();
                this.txtTag.setValue(val ? val : '');

                val = props.get_Appearance();
                (val!==null && val!==undefined) && this.cmbShow.setValue(val);

                val = props.get_Color();
                this.isSystemColor = (val===null);
                if (val) {
                    val = Common.Utils.ThemeColor.getHexColor(val.get_r(), val.get_g(), val.get_b());
                    this.colors.selectByRGB(val,true);
                } else {
                    this.colors.clearSelection();
                    var clr_item = this.btnColor.menu.$el.find('#control-settings-system-color > a');
                    !clr_item.hasClass('selected') && clr_item.addClass('selected');
                    val = Common.Utils.ThemeColor.getHexColor(220, 220, 220);
                }
                this.btnColor.setColor(val);

                val = props.get_Lock();
                (val===undefined) && (val = Asc.c_oAscSdtLockType.Unlocked);
                this.chLockDelete.setValue(val==Asc.c_oAscSdtLockType.SdtContentLocked || val==Asc.c_oAscSdtLockType.SdtLocked);
                this.chLockEdit.setValue(val==Asc.c_oAscSdtLockType.SdtContentLocked || val==Asc.c_oAscSdtLockType.ContentLocked);
            }
        },

        getSettings: function () {
            var props   = new AscCommon.CContentControlPr();
            props.put_Alias(this.txtName.getValue());
            props.put_Tag(this.txtTag.getValue());
            props.put_Appearance(this.cmbShow.getValue());

            if (this.isSystemColor) {
                props.put_Color(null);
            } else {
                var color = Common.Utils.ThemeColor.getRgbColor(this.colors.getColor());
                props.put_Color(color.get_r(), color.get_g(), color.get_b());
            }

            var lock = Asc.c_oAscSdtLockType.Unlocked;

            if (this.chLockDelete.getValue()=='checked' && this.chLockEdit.getValue()=='checked')
                lock = Asc.c_oAscSdtLockType.SdtContentLocked;
            else if (this.chLockDelete.getValue()=='checked')
                lock = Asc.c_oAscSdtLockType.SdtLocked;
            else if (this.chLockEdit.getValue()=='checked')
                lock = Asc.c_oAscSdtLockType.ContentLocked;
            props.put_Lock(lock);

            return props;
        },

        onDlgBtnClick: function(event) {
            var me = this;
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'ok') {
                this.handler && this.handler.call(this, state, this.getSettings());
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
        textOpacity: 'Opacity',
        textLayout: 'Layout',
        textDiagonal: 'Diagonal',
        textHor: 'Horizontal',
        cancelButtonText: 'Cancel',
        okButtonText: 'Ok',
        textColor: 'Text color',
        textNewColor: 'Add New Custom Color'

    }, DE.Views.WatermarkSettingsDialog || {}))
});