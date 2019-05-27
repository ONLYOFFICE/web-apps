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
 *  ImageSettings.js
 *
 *  Created by Julia Radzhabova on 2/05/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!documenteditor/main/app/template/ImageSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/view/ImageFromUrlDialog',
    'documenteditor/main/app/view/ImageSettingsAdvanced'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.ImageSettings = Backbone.View.extend(_.extend({
        el: '#id-image-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'ImageSettings'
        },

        initialize: function () {
            this._initSettings = true;

            this._state = {
                WrappingStyle: Asc.c_oAscWrapStyle2.Inline,
                CanBeFlow: true,
                Width: 0,
                Height: 0,
                FromGroup: false,
                DisabledControls: false,
                isOleObject: false,
                cropMode: false
            };
            this.lockedControls = [];
            this._locked = false;

            this._originalProps = null;

            this.render();

            this.labelWidth = $(this.el).find('#image-label-width');
            this.labelHeight = $(this.el).find('#image-label-height');
        },

        render: function () {
            var el = $(this.el);
            el.html(this.template({
                scope: this
            }));
        },

        setApi: function(api) {
            this.api = api;
            if (this.api) {
                this.api.asc_registerCallback('asc_onImgWrapStyleChanged', _.bind(this._ImgWrapStyleChanged, this));
                this.api.asc_registerCallback('asc_ChangeCropState', _.bind(this._changeCropState, this));
            }
            return this;
        },

        updateMetricUnit: function() {
            var value = Common.Utils.Metric.fnRecalcFromMM(this._state.Width);
            this.labelWidth[0].innerHTML = this.textWidth + ': ' + value.toFixed(1) + ' ' + Common.Utils.Metric.getCurrentMetricName();

            value = Common.Utils.Metric.fnRecalcFromMM(this._state.Height);
            this.labelHeight[0].innerHTML = this.textHeight + ': ' + value.toFixed(1) + ' ' + Common.Utils.Metric.getCurrentMetricName();
        },

        createDelayedControls: function() {
            var me = this,
                viewData = [
                { offsetx: 0, data: Asc.c_oAscWrapStyle2.Inline, tip: this.txtInline, selected: true },
                { offsetx: 50, data: Asc.c_oAscWrapStyle2.Square, tip: this.txtSquare },
                { offsetx: 100, data: Asc.c_oAscWrapStyle2.Tight, tip: this.txtTight },
                { offsetx: 150, data: Asc.c_oAscWrapStyle2.Through, tip: this.txtThrough },
                { offsetx: 200, data: Asc.c_oAscWrapStyle2.TopAndBottom, tip: this.txtTopAndBottom },
                { offsetx: 250, data: Asc.c_oAscWrapStyle2.InFront, tip: this.txtInFront },
                { offsetx: 300, data: Asc.c_oAscWrapStyle2.Behind, tip: this.txtBehind }
            ];

            this.cmbWrapType = new Common.UI.ComboDataView({
                itemWidth: 50,
                itemHeight: 50,
                menuMaxHeight: 300,
                enableKeyEvents: true,
                store: new Common.UI.DataViewStore(viewData),
                cls: 'combo-chart-style'
            });
            this.cmbWrapType.menuPicker.itemTemplate = this.cmbWrapType.fieldPicker.itemTemplate = _.template([
                '<div class="style" id="<%= id %>">',
                '<img src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" class="combo-wrap-item" ',
                'width="' + this.cmbWrapType.itemWidth + '" height="' + this.cmbWrapType.itemHeight + '" ',
                'style="background-position: -<%= offsetx %>px 0;"/>',
                '</div>'
            ].join(''));
            this.cmbWrapType.render($('#image-combo-wrap'));
            this.cmbWrapType.openButton.menu.cmpEl.css({
                'min-width': 178,
                'max-width': 178
            });
            this.cmbWrapType.on('click', _.bind(this.onSelectWrap, this));
            this.cmbWrapType.openButton.menu.on('show:after', function () {
                me.cmbWrapType.menuPicker.scroller.update({alwaysVisibleY: true});
            });
            this.lockedControls.push(this.cmbWrapType);

            this.btnOriginalSize = new Common.UI.Button({
                el: $('#image-button-original-size')
            });
            this.lockedControls.push(this.btnOriginalSize);

            this.btnFitMargins = new Common.UI.Button({
                el: $('#image-button-fit-margins')
            });
            this.lockedControls.push(this.btnFitMargins);

            this.btnInsertFromFile = new Common.UI.Button({
                el: $('#image-button-from-file')
            });
            this.lockedControls.push(this.btnInsertFromFile);

            this.btnInsertFromUrl = new Common.UI.Button({
                el: $('#image-button-from-url')
            });
            this.lockedControls.push(this.btnInsertFromUrl);

            this.btnEditObject = new Common.UI.Button({
                el: $('#image-button-edit-object')
            });
            this.lockedControls.push(this.btnEditObject);

            this.btnOriginalSize.on('click', _.bind(this.setOriginalSize, this));
            this.btnInsertFromFile.on('click', _.bind(function(btn){
                if (this._isFromFile) return;
                this._isFromFile = true;
                if (this.api) this.api.ChangeImageFromFile();
                this.fireEvent('editcomplete', this);
                this._isFromFile = false;
            }, this));
            this.btnInsertFromUrl.on('click', _.bind(this.insertFromUrl, this));
            this.btnEditObject.on('click', _.bind(function(btn){
                if (this.api) this.api.asc_startEditCurrentOleObject();
                this.fireEvent('editcomplete', this);
            }, this));
            this.btnFitMargins.on('click', _.bind(this.setFitMargins, this));

            this.btnRotate270 = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'rotate-270',
                value: 0,
                hint: this.textHint270
            });
            this.btnRotate270.render( $('#image-button-270', me.$el));
            this.btnRotate270.on('click', _.bind(this.onBtnRotateClick, this));
            this.lockedControls.push(this.btnRotate270);

            this.btnRotate90 = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'rotate-90',
                value: 1,
                hint: this.textHint90
            });
            this.btnRotate90.render( $('#image-button-90', me.$el));
            this.btnRotate90.on('click', _.bind(this.onBtnRotateClick, this));
            this.lockedControls.push(this.btnRotate90);

            this.btnFlipV = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'flip-vert',
                value: 0,
                hint: this.textHintFlipV
            });
            this.btnFlipV.render( $('#image-button-flipv', me.$el));
            this.btnFlipV.on('click', _.bind(this.onBtnFlipClick, this));
            this.lockedControls.push(this.btnFlipV);

            this.btnFlipH = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'flip-hor',
                value: 1,
                hint: this.textHintFlipH
            });
            this.btnFlipH.render( $('#image-button-fliph', me.$el));
            this.btnFlipH.on('click', _.bind(this.onBtnFlipClick, this));
            this.lockedControls.push(this.btnFlipH);

            this.btnCrop = new Common.UI.Button({
                cls: 'btn-text-split-default',
                caption: this.textCrop,
                split: true,
                enableToggle: true,
                allowDepress: true,
                pressed: this._state.cropMode,
                width: 100,
                menu        : new Common.UI.Menu({
                    style       : 'min-width: 100px;',
                    items: [
                        {
                            caption: this.textCrop,
                            checkable: true,
                            allowDepress: true,
                            checked: this._state.cropMode,
                            value: 0
                        },
                        {
                            caption: this.textCropFill,
                            value: 1
                        },
                        {
                            caption: this.textCropFit,
                            value: 2
                        }]
                })
            });
            this.btnCrop.render( $('#image-button-crop')) ;
            this.btnCrop.on('click', _.bind(this.onCrop, this));
            this.btnCrop.menu.on('item:click', _.bind(this.onCropMenu, this));
            this.lockedControls.push(this.btnCrop);

            this.linkAdvanced = $('#image-advanced-link');
            this.lblReplace = $('#image-lbl-replace');
            $(this.el).on('click', '#image-advanced-link', _.bind(this.openAdvancedSettings, this));
        },

        _changeCropState: function(state) {
            this._state.cropMode = state;

            if (!this.btnCrop) return;
            this.btnCrop.toggle(state, true);
            this.btnCrop.menu.items[0].setChecked(state, true);
        },

        createDelayedElements: function() {
            this.createDelayedControls();
            this.updateMetricUnit();
            this._initSettings = false;
        },

        ChangeSettings: function(props) {
            if (this._initSettings)
                this.createDelayedElements();

            this.disableControls(this._locked);

            if (props ){
                this._originalProps = new Asc.asc_CImgProperty(props);

                var value = props.get_WrappingStyle();
                if (this._state.WrappingStyle!==value) {
                    this.cmbWrapType.suspendEvents();
                    var rec = this.cmbWrapType.menuPicker.store.findWhere({
                        data: value
                    });
                    this.cmbWrapType.menuPicker.selectRecord(rec);
                    this.cmbWrapType.resumeEvents();
                    this._state.WrappingStyle=value;
                }

                value = props.get_CanBeFlow() && !this._locked;
                var fromgroup = props.get_FromGroup() || this._locked;
                if (this._state.CanBeFlow!==value || this._state.FromGroup!==fromgroup) {
                    this.cmbWrapType.setDisabled(!value || fromgroup);
                    this._state.CanBeFlow=value;
                    this._state.FromGroup=fromgroup;
                }

                value = props.get_Width();
                if ( Math.abs(this._state.Width-value)>0.001 ) {
                    this.labelWidth[0].innerHTML = this.textWidth + ': ' + Common.Utils.Metric.fnRecalcFromMM(value).toFixed(1) + ' ' + Common.Utils.Metric.getCurrentMetricName();
                    this._state.Width = value;
                }

                value = props.get_Height();
                if ( Math.abs(this._state.Height-value)>0.001 ) {
                    this.labelHeight[0].innerHTML = this.textHeight + ': ' + Common.Utils.Metric.fnRecalcFromMM(value).toFixed(1) + ' ' + Common.Utils.Metric.getCurrentMetricName();
                    this._state.Height = value;
                }

                this.btnOriginalSize.setDisabled(props.get_ImageUrl()===null || props.get_ImageUrl()===undefined || this._locked);

                var pluginGuid = props.asc_getPluginGuid();
                value = (pluginGuid !== null && pluginGuid !== undefined);
                if (this._state.isOleObject!==value) {
                    this.btnInsertFromUrl.setVisible(!value);
                    this.btnInsertFromFile.setVisible(!value);
                    this.btnEditObject.setVisible(value);
                    this.lblReplace.text(value ? this.textEditObject : this.textInsert);
                    this.btnRotate270.setDisabled(value);
                    this.btnRotate90.setDisabled(value);
                    this.btnFlipV.setDisabled(value);
                    this.btnFlipH.setDisabled(value);
                    this._state.isOleObject=value;
                }

                if (this._state.isOleObject) {
                    var plugin = DE.getCollection('Common.Collections.Plugins').findWhere({guid: pluginGuid});
                    this.btnEditObject.setDisabled(plugin===null || plugin ===undefined || this._locked);
                } else {
                    this.btnInsertFromUrl.setDisabled(pluginGuid===null || this._locked);
                    this.btnInsertFromFile.setDisabled(pluginGuid===null || this._locked);
                }
            }
        },

        _ImgWrapStyleChanged: function(style) {
            if (!this.cmbWrapType) return;
            if (this._state.WrappingStyle!==style) {
                this.cmbWrapType.suspendEvents();
                var rec = this.cmbWrapType.menuPicker.store.findWhere({
                    data: style
                });
                this.cmbWrapType.menuPicker.selectRecord(rec);
                this.cmbWrapType.resumeEvents();
                this._state.WrappingStyle=style;
            }
        },

        onSelectWrap: function(combo, record){
            if (this.api) {
                var props = new Asc.asc_CImgProperty(),
                    data = record.get('data');
                props.put_WrappingStyle(data);
                if (this._state.WrappingStyle===Asc.c_oAscWrapStyle2.Inline && data!==Asc.c_oAscWrapStyle2.Inline ) {
                    props.put_PositionH(new Asc.CImagePositionH());
                    props.get_PositionH().put_UseAlign(false);
                    props.get_PositionH().put_RelativeFrom(Asc.c_oAscRelativeFromH.Column);
                    var val = this._originalProps.get_Value_X(Asc.c_oAscRelativeFromH.Column);
                    props.get_PositionH().put_Value(val);

                    props.put_PositionV(new Asc.CImagePositionV());
                    props.get_PositionV().put_UseAlign(false);
                    props.get_PositionV().put_RelativeFrom(Asc.c_oAscRelativeFromV.Paragraph);
                    val = this._originalProps.get_Value_Y(Asc.c_oAscRelativeFromV.Paragraph);
                    props.get_PositionV().put_Value(val);
                }

                this.api.ImgApply(props);
            }

            this.fireEvent('editcomplete', this);
        },

        setOriginalSize:  function() {
            if (this.api) {
                var imgsize = this.api.get_OriginalSizeImage();
                var w = imgsize.get_ImageWidth();
                var h = imgsize.get_ImageHeight();

                this.labelWidth[0].innerHTML = this.textWidth + ': ' + Common.Utils.Metric.fnRecalcFromMM(w).toFixed(1) + ' ' + Common.Utils.Metric.getCurrentMetricName();
                this.labelHeight[0].innerHTML = this.textHeight + ': ' + Common.Utils.Metric.fnRecalcFromMM(h).toFixed(1) + ' ' + Common.Utils.Metric.getCurrentMetricName();

                var properties = new Asc.asc_CImgProperty();
                properties.put_Width(w);
                properties.put_Height(h);
                properties.put_ResetCrop(true);
                this.api.ImgApply(properties);
                this.fireEvent('editcomplete', this);
            }
        },

        setFitMargins:  function() {
            if (this.api) {
                var section = this.api.asc_GetSectionProps(),
                    ratio = (this._state.Height>0) ? this._state.Width/this._state.Height : 1,
                    pagew = (this.api.asc_GetCurrentColumnWidth) ? this.api.asc_GetCurrentColumnWidth() : (section.get_W() - section.get_LeftMargin() - section.get_RightMargin()),
                    pageh = section.get_H() - section.get_TopMargin() - section.get_BottomMargin(),
                    pageratio = pagew/pageh,
                    w, h;

                if (ratio>pageratio) {
                    w = pagew;
                    h = w/ratio;
                } else if (ratio<pageratio) {
                    h = pageh;
                    w = h * ratio;
                } else {
                    w = pagew;
                    h = pageh;
                }

                this.labelWidth[0].innerHTML = this.textWidth + ': ' + Common.Utils.Metric.fnRecalcFromMM(w).toFixed(1) + ' ' + Common.Utils.Metric.getCurrentMetricName();
                this.labelHeight[0].innerHTML = this.textHeight + ': ' + Common.Utils.Metric.fnRecalcFromMM(h).toFixed(1) + ' ' + Common.Utils.Metric.getCurrentMetricName();

                var properties = new Asc.asc_CImgProperty();
                properties.put_Width(w);
                properties.put_Height(h);

                if (this._state.WrappingStyle!==Asc.c_oAscWrapStyle2.Inline) {
                    if (ratio>=1) {
                        var position = new Asc.CImagePositionH();
                        position.put_UseAlign(true);
                        position.put_Percent(false);
                        position.put_RelativeFrom(Asc.c_oAscRelativeFromH.Margin);
                        position.put_Align(Asc.c_oAscAlignH.Left);
                        properties.put_PositionH(position);
                    }
                    if (ratio<=1) {
                        position = new Asc.CImagePositionV();
                        position.put_UseAlign(true);
                        position.put_Percent(false);
                        position.put_RelativeFrom(Asc.c_oAscRelativeFromV.Margin);
                        position.put_Align(Asc.c_oAscAlignV.Top);
                        properties.put_PositionV(position);
                    }
                }

                this.api.ImgApply(properties);
                this.fireEvent('editcomplete', this);
            }
        },

        insertFromUrl: function() {
            var me = this;
            (new Common.Views.ImageFromUrlDialog({
                handler: function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            var checkUrl = value.replace(/ /g, '');
                            if (!_.isEmpty(checkUrl)) {
                                var props = new Asc.asc_CImgProperty();
                                props.put_ImageUrl(checkUrl);
                                me.api.ImgApply(props);
                            }
                        }
                    }
                    me.fireEvent('editcomplete', me);
                }
            })).show();
        },

        onBtnRotateClick: function(btn) {
            var properties = new Asc.asc_CImgProperty();
            properties.asc_putRotAdd((btn.options.value==1 ? 90 : 270) * 3.14159265358979 / 180);
            this.api.ImgApply(properties);
            this.fireEvent('editcomplete', this);
        },

        onBtnFlipClick: function(btn) {
            var properties = new Asc.asc_CImgProperty();
            if (btn.options.value==1)
                properties.asc_putFlipHInvert(true);
            else
                properties.asc_putFlipVInvert(true);
            this.api.ImgApply(properties);
            this.fireEvent('editcomplete', this);
        },

        onCrop: function(btn, e) {
            if (this.api) {
                btn.pressed ? this.api.asc_startEditCrop() : this.api.asc_endEditCrop();
            }
            this.fireEvent('editcomplete', this);
        },

        onCropMenu: function(menu, item) {
            if (this.api) {
                if (item.value == 1) {
                    this.api.asc_cropFill();
                } else if (item.value == 2) {
                    this.api.asc_cropFit();
                } else {
                    item.checked ? this.api.asc_startEditCrop() : this.api.asc_endEditCrop();
                }
            }
            this.fireEvent('editcomplete', this);
        },

        openAdvancedSettings: function(e) {
            if (this.linkAdvanced.hasClass('disabled')) return;

            var me = this;
            var win;
            if (me.api && !this._locked){
                var selectedElements = me.api.getSelectedElements();
                if (selectedElements && selectedElements.length>0){
                    var elType, elValue;
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();
                        if (Asc.c_oAscTypeSelectElement.Image == elType) {
                            var imgsizeOriginal;
                            if (!me.btnOriginalSize.isDisabled()) {
                                imgsizeOriginal = me.api.get_OriginalSizeImage();
                                if (imgsizeOriginal)
                                    imgsizeOriginal = {width:imgsizeOriginal.get_ImageWidth(), height:imgsizeOriginal.get_ImageHeight()};
                            }
                            (new DE.Views.ImageSettingsAdvanced(
                                {
                                    imageProps: elValue,
                                    sizeOriginal: imgsizeOriginal,
                                    sectionProps: me.api.asc_GetSectionProps(),
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.api.ImgApply(value.imageProps);
                                            }
                                        }
                                        me.fireEvent('editcomplete', me);
                                    }
                            })).show();
                            break;
                        }
                    }
                }
            }
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable) {
            if (this._initSettings) return;
            
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
                this.linkAdvanced.toggleClass('disabled', disable);
            }

            this.btnCrop.setDisabled(disable || !this.api.asc_canEditCrop());
        },

        textSize:       'Size',
        textWrap:       'Wraping Style',
        textWidth:      'Width',
        textHeight:     'Height',
        textOriginalSize: 'Default Size',
        textInsert:     'Replace Image',
        textFromUrl:    'From URL',
        textFromFile:   'From File',
        textAdvanced:   'Show advanced settings',
        txtInline: 'Inline',
        txtSquare: 'Square',
        txtTight: 'Tight',
        txtThrough: 'Through',
        txtTopAndBottom: 'Top and bottom',
        txtBehind: 'Behind',
        txtInFront: 'In front',
        textEditObject: 'Edit Object',
        textEdit:       'Edit',
        textFitMargins: 'Fit to Margin',
        textRotation: 'Rotation',
        textRotate90: 'Rotate 90°',
        textFlip: 'Flip',
        textHint270: 'Rotate 90° Counterclockwise',
        textHint90: 'Rotate 90° Clockwise',
        textHintFlipV: 'Flip Vertically',
        textHintFlipH: 'Flip Horizontally',
        textCrop: 'Crop',
        textCropFill: 'Fill',
        textCropFit: 'Fit'
    }, DE.Views.ImageSettings || {}));
});