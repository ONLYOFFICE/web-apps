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
 *  ControlSettingsDialog.js.js
 *
 *  Created by Julia Radzhabova on 12.12.2017
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([ 'text!documenteditor/main/app/template/ControlSettingsDialog.template',
    'common/main/lib/util/utils',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/InputField',
    'common/main/lib/view/AdvancedSettingsWindow'
], function (contentTemplate) { 'use strict';

    DE.Views.ControlSettingsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 310,
            height: 412,
            toggleGroup: 'control-adv-settings-group',
            storageName: 'de-control-settings-adv-category'
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-control-settings-general', panelCaption: this.strGeneral},
                    {panelId: 'id-adv-control-settings-lock',    panelCaption: this.textLock}
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);

            this.handler    = options.handler;
            this.props      = options.props;
            this.api        = options.api;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.txtName = new Common.UI.InputField({
                el          : $('#control-settings-txt-name'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                maxLength: 64,
                value       : ''
            });

            this.txtTag = new Common.UI.InputField({
                el          : $('#control-settings-txt-tag'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                maxLength: 64,
                value       : ''
            });

            this.cmbShow = new Common.UI.ComboBox({
                el: $('#control-settings-combo-show'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 120px;',
                editable: false,
                data: [
                    { displayValue: this.textBox,   value: Asc.c_oAscSdtAppearance.Frame },
                    { displayValue: this.textNone,  value: Asc.c_oAscSdtAppearance.Hidden }
                ]
            });
            this.cmbShow.setValue(Asc.c_oAscSdtAppearance.Frame);

            this.btnColor = new Common.UI.ColorButton({
                style: "width:45px;",
                menu        : new Common.UI.Menu({
                    additionalAlign: this.menuAddAlign,
                    items: [
                        {
                            id: 'control-settings-system-color',
                            caption: this.textSystemColor,
                            template: _.template('<a tabindex="-1" type="menuitem"><span class="menu-item-icon" style="background-image: none; width: 12px; height: 12px; margin: 1px 7px 0 -7px; background-color: #dcdcdc;"></span><%= caption %></a>')
                        },
                        {caption: '--'},
                        { template: _.template('<div id="control-settings-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                        { template: _.template('<a id="control-settings-color-new" style="padding-left:12px;">' + me.textNewColor + '</a>') }
                    ]
                })
            });

            this.btnColor.on('render:after', function(btn) {
                me.colors = new Common.UI.ThemeColorPalette({
                    el: $('#control-settings-color-menu')
                });
                me.colors.on('select', _.bind(me.onColorsSelect, me));
            });
            this.btnColor.render( $('#control-settings-color-btn'));
            this.btnColor.setColor('000000');
            this.btnColor.menu.items[3].on('click',  _.bind(this.addNewColor, this, this.colors, this.btnColor));
            $('#control-settings-system-color').on('click', _.bind(this.onSystemColor, this));

            this.btnApplyAll = new Common.UI.Button({
                el: $('#control-settings-btn-all')
            });
            this.btnApplyAll.on('click', _.bind(this.applyAllClick, this));

            this.chLockDelete = new Common.UI.CheckBox({
                el: $('#control-settings-chb-lock-delete'),
                labelText: this.txtLockDelete
            });

            this.chLockEdit = new Common.UI.CheckBox({
                el: $('#control-settings-chb-lock-edit'),
                labelText: this.txtLockEdit
            });

            this.afterRender();
        },

        onColorsSelect: function(picker, color) {
            this.btnColor.setColor(color);
            var clr_item = this.btnColor.menu.$el.find('#control-settings-system-color > a');
            clr_item.hasClass('selected') && clr_item.removeClass('selected');
            this.isSystemColor = false;
        },

        updateThemeColors: function() {
            this.colors.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
        },

        addNewColor: function(picker, btn) {
            picker.addNewColor((typeof(btn.color) == 'object') ? btn.color.color : btn.color);
        },

        onSystemColor: function(e) {
            var color = Common.Utils.ThemeColor.getHexColor(220, 220, 220);
            this.btnColor.setColor(color);
            this.colors.clearSelection();
            var clr_item = this.btnColor.menu.$el.find('#control-settings-system-color > a');
            !clr_item.hasClass('selected') && clr_item.addClass('selected');
            this.isSystemColor = true;
        },

        afterRender: function() {
            this.updateThemeColors();
            this._setDefaults(this.props);
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
            }
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

        applyAllClick: function(btn, eOpts){
            if (this.api) {
                var props   = new AscCommon.CContentControlPr();
                props.put_Appearance(this.cmbShow.getValue());
                if (this.isSystemColor) {
                    props.put_Color(null);
                } else {
                    var color = Common.Utils.ThemeColor.getRgbColor(this.colors.getColor());
                    props.put_Color(color.get_r(), color.get_g(), color.get_b());
                }
                this.api.asc_SetContentControlProperties(props, null, true);
            }
        },

        textTitle:    'Content Control Settings',
        textName: 'Title',
        textTag: 'Tag',
        txtLockDelete: 'Content control cannot be deleted',
        txtLockEdit: 'Contents cannot be edited',
        textLock: 'Locking',
        textShowAs: 'Show as',
        textColor: 'Color',
        textBox: 'Bounding box',
        textNone: 'None',
        textNewColor: 'Add New Custom Color',
        textApplyAll: 'Apply to All',
        textAppearance: 'Appearance',
        textSystemColor: 'System',
        strGeneral: 'General'

    }, DE.Views.ControlSettingsDialog || {}))
});