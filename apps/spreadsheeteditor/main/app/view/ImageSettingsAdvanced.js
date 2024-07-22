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
 *  ImageSettingsAdvanced.js
 *
 *  Created on 1/19/17
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/ImageSettingsAdvanced.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) {
    'use strict';

    SSE.Views.ImageSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 300,
            contentHeight: 257,
            toggleGroup: 'image-adv-settings-group',
            properties: null,
            storageName: 'sse-image-settings-adv-category'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-image-rotate',     panelCaption: this.textRotation},
                    {panelId: 'id-adv-image-snap',       panelCaption: this.textSnap},
                    {panelId: 'id-adv-image-alttext',    panelCaption: this.textAlt}
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this._originalProps = this.options.imageProps;
            this._changedProps = null;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;

            // Rotation
            this.spnAngle = new Common.UI.MetricSpinner({
                el: $('#image-advanced-spin-angle'),
                step: 1,
                width: 80,
                defaultUnit : "°",
                value: '0 °',
                maxValue: 3600,
                minValue: -3600
            });

            this.chFlipHor = new Common.UI.CheckBox({
                el: $('#image-advanced-checkbox-hor'),
                labelText: this.textHorizontally
            });

            this.chFlipVert = new Common.UI.CheckBox({
                el: $('#image-advanced-checkbox-vert'),
                labelText: this.textVertically
            });

            // Snapping
            this.radioTwoCell = new Common.UI.RadioBox({
                el: $('#image-advanced-radio-twocell'),
                name: 'asc-radio-snap',
                labelText: this.textTwoCell,
                value: AscCommon.c_oAscCellAnchorType.cellanchorTwoCell
            });
            this.radioTwoCell.on('change', _.bind(this.onRadioSnapChange, this));

            this.radioOneCell = new Common.UI.RadioBox({
                el: $('#image-advanced-radio-onecell'),
                name: 'asc-radio-snap',
                labelText: this.textOneCell,
                value: AscCommon.c_oAscCellAnchorType.cellanchorOneCell
            });
            this.radioOneCell.on('change', _.bind(this.onRadioSnapChange, this));

            this.radioAbsolute = new Common.UI.RadioBox({
                el: $('#image-advanced-radio-absolute'),
                name: 'asc-radio-snap',
                labelText: this.textAbsolute,
                value: AscCommon.c_oAscCellAnchorType.cellanchorAbsolute
            });
            this.radioAbsolute.on('change', _.bind(this.onRadioSnapChange, this));

            // Alt Text

            this.inputAltTitle = new Common.UI.InputField({
                el          : $('#image-advanced-alt-title'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            }).on('changed:after', function() {
                me.isAltTitleChanged = true;
            });

            this.textareaAltDescription = this.$window.find('textarea');
            this.textareaAltDescription.keydown(function (event) {
                if (event.keyCode == Common.UI.Keys.RETURN) {
                    event.stopPropagation();
                }
                me.isAltDescChanged = true;
            });

            this.afterRender();
        },

        getFocusedComponents: function() {
            return this.btnsCategory.concat([
                this.spnAngle, this.chFlipHor, this.chFlipVert, // 0 tab
                this.radioTwoCell, this.radioOneCell, this.radioAbsolute, // 1 tab
                this.inputAltTitle, this.textareaAltDescription  // 2 tab
            ]).concat(this.getFooterButtons());
        },

        onCategoryClick: function(btn, index) {
            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var me = this;
            setTimeout(function(){
                switch (index) {
                    case 0:
                        me.spnAngle.focus();
                        break;
                    case 1:
                        me.radioTwoCell.focus();
                        break;
                    case 2:
                        me.inputAltTitle.focus();
                        break;
                }
            }, 10);
        },

        onRadioSnapChange: function(field, newValue, eOpts) {
            if (newValue && this._changedProps) {
                this._changedProps.asc_putAnchor(field.options.value);
            }
        },

        afterRender: function() {
            this._setDefaults(this._originalProps);
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
            }
        },

        _setDefaults: function(props) {
            if (props ){
                var value = props.asc_getTitle();
                this.inputAltTitle.setValue(value ? value : '');

                value = props.asc_getDescription();
                this.textareaAltDescription.val(value ? value : '');

                value = props.asc_getRot();
                this.spnAngle.setValue((value==undefined || value===null) ? '' : Math.floor(value*180/3.14159265358979+0.5), true);
                this.chFlipHor.setValue(props.asc_getFlipH());
                this.chFlipVert.setValue(props.asc_getFlipV());

                value = props.asc_getAnchor();
                switch (value) {
                    case AscCommon.c_oAscCellAnchorType.cellanchorTwoCell:
                        this.radioTwoCell.setValue(true, true);
                        break;
                    case AscCommon.c_oAscCellAnchorType.cellanchorOneCell:
                        this.radioOneCell.setValue(true, true);
                        break;
                    case AscCommon.c_oAscCellAnchorType.cellanchorAbsolute:
                        this.radioAbsolute.setValue(true, true);
                        break;
                }

                var pluginGuid = props.asc_getPluginGuid();
                this.btnsCategory[0].setVisible(pluginGuid === null || pluginGuid === undefined); // Rotation

                this._changedProps = new Asc.asc_CImgProperty();
            }
        },

        getSettings: function() {
            if (this.isAltTitleChanged)
                this._changedProps.asc_putTitle(this.inputAltTitle.getValue());

            if (this.isAltDescChanged)
                this._changedProps.asc_putDescription(this.textareaAltDescription.val());

            this._changedProps.asc_putRot(this.spnAngle.getNumberValue() * 3.14159265358979 / 180);
            this._changedProps.asc_putFlipH(this.chFlipHor.getValue()=='checked');
            this._changedProps.asc_putFlipV(this.chFlipVert.getValue()=='checked');

            return { imageProps: this._changedProps} ;
        },

        textTitle:      'Image - Advanced Settings',
        textAlt: 'Alternative Text',
        textAltTitle: 'Title',
        textAltDescription: 'Description',
        textAltTip: 'The alternative text-based representation of the visual object information, which will be read to the people with vision or cognitive impairments to help them better understand what information there is in the image, autoshape, chart or table.',
        textRotation: 'Rotation',
        textAngle: 'Angle',
        textFlipped: 'Flipped',
        textHorizontally: 'Horizontally',
        textVertically: 'Vertically',
        textSnap: 'Cell Snapping',
        textAbsolute: 'Don\'t move or size with cells',
        textOneCell: 'Move but don\'t size with cells',
        textTwoCell: 'Move and size with cells'

    }, SSE.Views.ImageSettingsAdvanced || {}));
});