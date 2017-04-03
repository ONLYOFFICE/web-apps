/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
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
                isOleObject: false
            };
            this.lockedControls = [];
            this._locked = false;

            this._noApply = false;
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
            if (this.api)
                this.api.asc_registerCallback('asc_onImgWrapStyleChanged', _.bind(this._ImgWrapStyleChanged, this));
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
                { offsetx: 0, data: Asc.c_oAscWrapStyle2.Inline, iconcls:'wrap-inline', tip: this.txtInline, selected: true },
                { offsetx: 50, data: Asc.c_oAscWrapStyle2.Square, iconcls:'wrap-square', tip: this.txtSquare },
                { offsetx: 100, data: Asc.c_oAscWrapStyle2.Tight, iconcls:'wrap-tight', tip: this.txtTight },
                { offsetx: 150, data: Asc.c_oAscWrapStyle2.Through, iconcls:'wrap-through', tip: this.txtThrough },
                { offsetx: 200, data: Asc.c_oAscWrapStyle2.TopAndBottom, iconcls:'wrap-topAndBottom', tip: this.txtTopAndBottom },
                { offsetx: 250, data: Asc.c_oAscWrapStyle2.InFront, iconcls:'wrap-inFront', tip: this.txtInFront },
                { offsetx: 300, data: Asc.c_oAscWrapStyle2.Behind, iconcls:'wrap-behind', tip: this.txtBehind }
            ];

            this.btnWrapType = new Common.UI.Button({
                cls         : 'btn-large-dataview',
                iconCls     : 'item-wrap wrap-inline',
                menu        : new Common.UI.Menu({
                    items: [
                        { template: _.template('<div id="id-image-menu-wrap" style="width: 235px; margin: 0 5px;"></div>') }
                    ]
                })
            });
            this.btnWrapType.on('render:after', function(btn) {
                me.mnuWrapPicker = new Common.UI.DataView({
                    el: $('#id-image-menu-wrap'),
                    parentMenu: btn.menu,
                    store: new Common.UI.DataViewStore(viewData),
                    allowScrollbar: false,
                    itemTemplate: _.template('<div id="<%= id %>" class="item-wrap" style="background-position: -<%= offsetx %>px 0;"></div>')
                });
            });
            this.btnWrapType.render($('#image-button-wrap'));
            this.mnuWrapPicker.on('item:click', _.bind(this.onSelectWrap, this, this.btnWrapType));
            this.lockedControls.push(this.btnWrapType);

            this.btnOriginalSize = new Common.UI.Button({
                el: $('#image-button-original-size')
            });
            this.lockedControls.push(this.btnOriginalSize);

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
                if (this.api) this.api.ChangeImageFromFile();
                this.fireEvent('editcomplete', this);
            }, this));
            this.btnInsertFromUrl.on('click', _.bind(this.insertFromUrl, this));
            this.btnEditObject.on('click', _.bind(function(btn){
                if (this.api) this.api.asc_startEditCurrentOleObject();
                this.fireEvent('editcomplete', this);
            }, this));

            this.linkAdvanced = $('#image-advanced-link');
            this.lblReplace = $('#image-lbl-replace');
            $(this.el).on('click', '#image-advanced-link', _.bind(this.openAdvancedSettings, this));
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
                    this._noApply = true;
                    var record = this.mnuWrapPicker.store.findWhere({data: value});
                    this.mnuWrapPicker.selectRecord(record, true);
                    if (record)
                        this.btnWrapType.setIconCls('item-wrap ' + record.get('iconcls'));
                    else
                        this.btnWrapType.setIconCls('');
                    this._noApply = false;
                    this._state.WrappingStyle=value;
                }

                value = props.get_CanBeFlow() && !this._locked;
                var fromgroup = props.get_FromGroup() || this._locked;
                if (this._state.CanBeFlow!==value || this._state.FromGroup!==fromgroup) {
                    this.btnWrapType.setDisabled(!value || fromgroup);
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
            if (!this.mnuWrapPicker) return;
            if (this._state.WrappingStyle!==style) {
                this._noApply = true;
                var record = this.mnuWrapPicker.store.findWhere({data: style});
                this.mnuWrapPicker.selectRecord(record, true);
                if (record)
                    this.btnWrapType.setIconCls('item-wrap ' + record.get('iconcls'));
                this._state.WrappingStyle=style;
                this._noApply = false;
            }
        },

        onSelectWrap: function(btn, picker, itemView, record) {
            if (this._noApply) return;

            var rawData = {},
                isPickerSelect = _.isFunction(record.toJSON);

            if (isPickerSelect){
                if (record.get('selected')) {
                    rawData = record.toJSON();
                } else {
                    // record deselected
                    return;
                }
            } else {
                rawData = record;
            }

            this.btnWrapType.setIconCls('item-wrap ' + rawData.iconcls);

            if (this.api) {
                var props = new Asc.asc_CImgProperty();
                props.put_WrappingStyle((rawData.data));
                if (this._state.WrappingStyle===Asc.c_oAscWrapStyle2.Inline && rawData.data!==Asc.c_oAscWrapStyle2.Inline ) {
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
                            var imgsizeMax = this.api.GetSectionInfo();
                            imgsizeMax = {width: imgsizeMax.get_PageWidth() - (imgsizeMax.get_MarginLeft()+imgsizeMax.get_MarginRight()),
                                          height:imgsizeMax.get_PageHeight() - (imgsizeMax.get_MarginTop()+imgsizeMax.get_MarginBottom())};

                            (new DE.Views.ImageSettingsAdvanced(
                                {
                                    imageProps: elValue,
                                    sizeOriginal: imgsizeOriginal,
                                    sizeMax: imgsizeMax,
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
        textEdit:       'Edit'

    }, DE.Views.ImageSettings || {}));
});