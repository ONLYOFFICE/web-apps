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
 *  PdfSignDialog.js
 *
 *  Created on 26/08/24
 *
 */


define([], function () { 'use strict';
    Common.Views.PdfSignDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 535,
            style: 'min-width: 350px;',
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel'],
            id: 'window-pdf-sign'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.txtTitle
            }, options || {});

            this.api = this.options.api;
            this.props = this.options.props;
            this.fontStore = this.options.fontStore;
            this.mode = 0; // 0 - upload, 1 - draw, 2 - type
            this.storage    = !!this.options.storage;
            this.isImageLoaded = false;
            this.iconType = this.options.iconType;
            this.font = {
                size: 11,
                name: 'Arial',
                bold: false,
                italic: false
            };

            this.template = [
                '<div class="box">',
                    '<label style="display: block; margin-bottom: 10px;">' + this.textBefore + '</label>',
                    '<div style="margin-bottom: 15px;">',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-pdf-btn-upload">' + this.txtUpload + '</button>',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-pdf-btn-draw">' + this.txtDraw + '</button>',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-pdf-btn-type">' + this.txtType + '</button>',
                    '</div>',
                    '<label style="display: block; margin-bottom: 3px;">' + this.textLooksAs + '</label>',
                    '<div style="outline: 1px solid #cbcbcb;width: 500px; height: 150px;">',
                        '<div class="img-upload" style="width: 100%; height: 100%;">',
                            '<div id="pdf-sign-img-upload" style="width: 100%; height: 100%; display: flex; flex-direction:column; align-items: center;">',
                                '<table style="height: 100%; width: 60%;text-align: center;">',
                                    '<tr>',
                                        '<td><div id="id-dlg-pdf-select-image"></div><div><label class="light" style="margin-top:10px;">' + this.txtUploadDesc + '</div></label></div>',
                                    '</tr>',
                                '</table>',
                            '</div>',
                            '<div id="pdf-sign-img-upload-preview" class="hidden" style="width: 100%; height: 100%; position: relative; margin: 0 auto;"></div>',
                        '</div>',
                        '<div id="pdf-sign-img-draw-preview" class="img-draw hidden" style="width: 100%; height: 100%; position: relative; margin: 0 auto;"></div>',
                        '<div id="pdf-sign-img-type-preview" class="img-type hidden" style="width: 100%; height: 100%; position: relative; margin: 0 auto;"></div>',
                    '</div>',
                    '<div class="input-row display-flex-row-center" style="margin: 10px 0;">',
                        '<div id="pdf-sign-ch-back" class="img-upload"></div>',
                        '<div id="pdf-sign-name" class="img-type hidden"></div>',
                        '<div id="pdf-sign-fonts" class="img-type hidden margin-left-5"></div>',
                        '<div id="pdf-sign-font-size" class="img-type hidden margin-left-5"></div>',
                        '<div id="pdf-sign-bold" class="img-type hidden margin-left-5"></div>','<div id="pdf-sign-italic" class="img-type hidden margin-left-5" ></div>',
                        '<div id="pdf-sign-line-size" class="img-draw margin-right-5 hidden"></div>',
                        '<div id="pdf-sign-line-color" class="img-draw hidden"></div>',
                        '<div style="flex-grow: 1;display: flex; justify-content: center;"><div id="btn-sign-undo" class="img-draw margin-right-5 hidden"></div><div id="btn-sign-redo" class="img-draw hidden"></div></div>',
                        '<button type="button" class="btn btn-text-default auto" id="pdf-sign-btn-clear">' + this.textClear + '</button>',
                    '</div>',
                '</div>',
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild(),
                is_svg_icon = this.iconType === 'svg';

            this.btnUpload = new Common.UI.Button({
                el: $window.find('#id-dlg-pdf-btn-upload'),
                enableToggle: true,
                toggleGroup: 'pdf-img-type',
                allowDepress: false,
                pressed: true
            });
            this.btnUpload.on('click', _.bind(this.onImgModeClick, this, 0));

            this.btnDraw = new Common.UI.Button({
                el: $window.find('#id-dlg-pdf-btn-draw'),
                enableToggle: true,
                toggleGroup: 'pdf-img-type',
                allowDepress: false
            });
            this.btnDraw.on('click', _.bind(this.onImgModeClick, this, 1));

            this.btnType = new Common.UI.Button({
                el: $window.find('#id-dlg-pdf-btn-type'),
                enableToggle: true,
                toggleGroup: 'pdf-img-type',
                allowDepress: false
            });
            this.btnType.on('click', _.bind(this.onImgModeClick, this, 2));
            Common.UI.GroupedButtons([me.btnUpload, me.btnDraw, me.btnType]);

            this.btnSelectImage = new Common.UI.Button({
                parentEl: $window.find('#id-dlg-pdf-select-image'),
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
                }),
                takeFocusOnClose: true
            });
            this.btnSelectImage.menu.on('item:click', _.bind(this.onImageSelect, this));
            this.btnSelectImage.menu.items[2].setVisible(this.storage);
            this.btnSelectImage.menu.items[1].setDisabled(this.options.disableNetworkFunctionality);
            this.btnSelectImage.menu.items[2].setDisabled(this.options.disableNetworkFunctionality);

            this.chRemBack = new Common.UI.CheckBox({
                el: $window.find('#pdf-sign-ch-back'),
                labelText: this.txtRemBack
            });
            this.chRemBack.on('change', function(field, newValue, oldValue, eOpts){
                me.props && me.props.put_RemoveBackground(field.getValue()==='checked');
            });

            this.cmbFonts = new Common.UI.ComboBoxFonts({
                el          : $window.find('#pdf-sign-fonts'),
                cls         : 'input-group-nr',
                style       : 'width: 100px;',
                menuCls     : 'scrollable-menu',
                menuStyle   : 'min-width: 100%;max-height: 270px;',
                store       : new Common.Collections.Fonts(),
                recent      : 0,
                takeFocusOnClose: true
            }).on('selected', function(combo, record) {
                me.font.name = record.name;
                me.props && me.props.put_TypeFont(record.name);
            });

            this.cmbFontSize = new Common.UI.ComboBox({
                el: $window.find('#pdf-sign-font-size'),
                cls: 'input-group-nr',
                style: 'width: 50px;',
                menuCls     : 'scrollable-menu',
                menuStyle: 'min-width: 50px;max-height: 270px;',
                data: [
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
            }).on('selected', function(combo, record) {
                me.font.size= record.value;
                me.props && me.props.put_TypeFontSize(record.value);
            });
            this.cmbFontSize.setValue(this.font.size);
            this.cmbFontSize.on('changed:before', _.bind(this.onFontSizeChanged, this, true));
            this.cmbFontSize.on('changed:after',  _.bind(this.onFontSizeChanged, this, false));

            this.btnBold = new Common.UI.Button({
                parentEl: $window.find('#pdf-sign-bold'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-bold',
                enableToggle: true,
                hint: this.textBold
            });
            this.btnBold.on('click', function(btn, e) {
                me.font.bold = btn.pressed;
                me.props && me.props.put_TypeBold(btn.pressed);
            });

            this.btnItalic = new Common.UI.Button({
                parentEl: $window.find('#pdf-sign-italic'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-italic',
                enableToggle: true,
                hint: this.textItalic
            });
            this.btnItalic.on('click', function(btn, e) {
                me.font.italic = btn.pressed;
                me.props && me.props.put_TypeItalic(btn.pressed);
            });

            this.inputName = new Common.UI.InputField({
                el: $window.find('#pdf-sign-name'),
                style: 'width: 150px;',
                validateOnChange: true
            }).on ('changing', _.bind(this.onChangeName, this));

            this.btnLineColor = new Common.UI.ColorButton({
                parentEl: $window.find('#pdf-sign-line-color'),
                additionalAlign: this.menuAddAlign,
                color: 'auto',
                auto: true,
                takeFocusOnClose: true
            });
            this.colorsLine = this.btnLineColor.getPicker();
            this.btnLineColor.on('color:select', _.bind(this.onColorsLineSelect, this));
            this.btnLineColor.on('auto:select', _.bind(this.onColorsAutoSelect, this));

            var data = [];
            for (var i=1; i<6; i++) {
                data.push({ value: i, displayValue: i + ' px' });
            }
            this.cmbLineSize = new Common.UI.ComboBox({
                el: $window.find('#pdf-sign-line-size'),
                cls: 'input-group-nr',
                style: 'width: 50px;',
                menuCls     : 'scrollable-menu',
                menuStyle: 'min-width: 50px;max-height: 270px;',
                data: data,
                takeFocusOnClose: true
            });
            this.cmbLineSize.setValue(2);
            this.cmbLineSize.on('selected', function(combo, record) {
                me.props && me.props.put_LineSize(record.value);
            });

            this.btnUndo = new Common.UI.Button({
                parentEl    : $window.find('#btn-sign-undo'),
                cls         : 'btn-toolbar',
                iconCls     : is_svg_icon ? 'svg-icon undo icon-rtl scaling-off' : 'toolbar__icon btn-undo icon-rtl',
                hint        : this.tipUndo
            }).on('click', _.bind(this.onUndo, this));

            this.btnRedo = new Common.UI.Button({
                parentEl    : $window.find('#btn-sign-redo'),
                cls         : 'btn-toolbar',
                iconCls     : is_svg_icon ? 'svg-icon redo icon-rtl scaling-off' : 'toolbar__icon btn-redo icon-rtl',
                hint        : this.tipRedo
            }).on('click', _.bind(this.onRedo, this));

            this.btnClear = new Common.UI.Button({
                el: $window.find('#pdf-sign-btn-clear')
            });
            this.btnClear.on('click', _.bind(this.onClear, this));

            this.imgUploadPnl = $window.find('.img-upload');
            this.imgDrawPnl = $window.find('.img-draw');
            this.imgTypePnl = $window.find('.img-type');
            this.uploadEmptyPnl = $window.find('#pdf-sign-img-upload');
            this.uploadPreviewPnl = $window.find('#pdf-sign-img-upload-preview');

            this.btnOk = _.find(this.getFooterButtons(), function (item) {
                return (item.$el && item.$el.find('.primary').addBack().filter('.primary').length>0);
            }) || new Common.UI.Button({ el: this.$window.find('.primary') });
            this.btnOk.setDisabled(true);

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.btnUpload, this.btnDraw, this.btnType, this.btnSelectImage, this.chRemBack, this.cmbLineSize, this.btnLineColor,
                    this.inputName, this.cmbFonts, this.cmbFontSize, this.btnBold, this.btnItalic, this.btnUndo, this.btnRedo, this.btnClear].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
        },

        afterRender: function() {
            this.cmbFonts.fillFonts(this.fontStore);
            this.cmbFonts.selectRecord(this.fontStore.findWhere({name: this.font.name}));

            this.updateThemeColors();
            this._setDefaults(this.props);

            var me = this;
            var onApiImgLoaded = function() {
                me.isImageLoaded = true;
                me.uploadEmptyPnl.toggleClass('hidden', true);
                me.uploadPreviewPnl.toggleClass('hidden', false);
                me.btnOk.setDisabled(!me.mode);
            };
            this.api.asc_registerCallback('asc_onSignatureImageLoaded', onApiImgLoaded);

            var insertImageFromStorage = function(data) {
                if (data && data._urls && data.c==='signature') {
                    me.props.put_ImageUrl(data._urls[0], data.token);
                }
            };
            Common.NotificationCenter.on('storage:image-insert', insertImageFromStorage);

            this.on('close', function(obj){
                me.api.asc_unregisterCallback('asc_onSignatureImageLoaded', onApiImgLoaded);
                Common.NotificationCenter.off('storage:image-insert', insertImageFromStorage);
            });
        },

        updateThemeColors: function() {
            this.colorsLine.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
        },

        onImgModeClick: function(mode, btn) {
            this.mode = mode;
            this.ShowHideElem(mode);
        },

        ShowHideElem: function(mode) {
            this.imgUploadPnl.toggleClass('hidden', !!mode);
            this.imgDrawPnl.toggleClass('hidden', mode!==1);
            this.imgTypePnl.toggleClass('hidden', mode!==2);
            this.btnOk.setDisabled(!mode && !this.isImageLoaded);
            var me = this;
            _.delay(function(){
                mode===1 ? me.cmbLineSize.focus() : mode===2 ? me.inputName.focus() : me.btnSelectImage.focus();
            },50);
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
                })).on('close', function() {
                }).show();
            } else if (item.value==2) {
                Common.NotificationCenter.trigger('storage:image-load', 'signature');
            } else {
                this.props.showFileDialog();
            }
        },

        onColorsLineSelect: function(btn, color) {
            this.isAutoColor = false;
            this.props && this.props.put_LineColor(Common.Utils.ThemeColor.getRgbColor(color));
        },

        onColorsAutoSelect: function(e) {
            this.isAutoColor = true;
            this.props && this.props.put_LineColor("#000000");
        },

        _setDefaults: function (props) {
            if (props) {
                // props.put_PreviewImgId('#pdf-sign-img-upload-preview');
                // props.put_PreviewDrawId('#pdf-sign-img-draw-preview');
                // props.put_PreviewTypeId('#pdf-sign-img-type-preview');
            }
        },

        getSettings: function () {

        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function(event) {
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

        onClear: function () {
            switch (this.mode) {
                case 0:
                    this.props.clearImg();
                    this.isImageLoaded = false;
                    this.uploadEmptyPnl.toggleClass('hidden', false);
                    this.uploadPreviewPnl.toggleClass('hidden', true);
                    this.btnOk.setDisabled(true);
                    break;
                case 1:
                    this.props.clearDraw();
                    break;
                case 2:
                    this.props.clearType();
                    break;
            }
        },

        onUndo: function () {
            this.props.undo();
        },

        onRedo: function () {
            this.props.undo();
        },

        onFontSizeChanged: function(before, combo, record, e) {
            var value;

            if (before) {
                var item = combo.store.findWhere({
                    displayValue: record.value
                });

                if (!item) {
                    value = /^\+?(\d*(\.|,)?\d+)$|^\+?(\d+(\.|,)?\d*)$/.exec(record.value);

                    if (!value) {
                        value = combo.getValue();
                        combo.setRawValue(value);
                        e.preventDefault();
                        return false;
                    }
                }
            } else {
                var maxvalue = 300;
                value = Common.Utils.String.parseFloat(record.value);
                value = value > maxvalue ? maxvalue :
                    value < 1 ? 1 : Math.floor((value+0.4)*2)/2;

                combo.setRawValue(value);
                this.font.size = value;
                this.props && this.props.put_TypeFontSize(value);
            }
        },

        onChangeName: function (input, value) {
            this.props && this.props.setText(value);
        },

        txtTitle: 'Signature',
        txtUpload: 'Upload',
        txtDraw: 'Draw',
        txtType: 'Type',
        textLooksAs: 'Signature looks as',
        textClear: 'Clear',
        textSelect: 'Select Image',
        txtUploadDesc: 'You can upload images in JPEG, JPG, GIF and PNG formats with a max size of 30 Mb',
        textBefore: 'Before signing this document, verify that the content you are signing is correct',
        txtRemBack: 'Remove white background',
        textFromUrl: 'From URL',
        textFromFile: 'From File',
        textFromStorage: 'From Storage',
        tipUndo: 'Undo',
        tipRedo: 'Redo',
        textBold: 'Bold',
        textItalic: 'Italic'

    }, Common.Views.PdfSignDialog || {}))
});