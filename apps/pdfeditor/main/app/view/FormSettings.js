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
 *  FormSettings.js
 *
 *  Created on 04.03.2025
 *
 */

define([
    'text!pdfeditor/main/app/template/FormSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/TextareaField',
    'common/main/lib/component/CheckBox'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    PDFE.Views.FormSettings = Backbone.View.extend(_.extend({
        el: '#id-form-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'FormSettings'
        },

        initialize: function () {
            this._initSettings = true;

            this._state = {
                DisabledControls: undefined,
                LockDelete: undefined
            };
            this.spinners = [];
            this.lockedControls = [];
            this.internalId = null;
            this._locked = true;
            this._originalSpecProps = null;
            this._originalProps = null;

            this.render();
        },

        render: function () {
            var el = this.$el || $(this.el);
            el.html(this.template({
                scope: this
            }));
        },

        createDelayedElements: function() {
            this._initSettings = false;

            var $markup = this.$el || $(this.el);

            var me = this;

            this.labelFormName = $markup.findById('#form-settings-name');

            // Common props

            //Spec props
            this.txtPlaceholder = new Common.UI.InputField({
                el          : $markup.findById('#form-txt-pholder'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                value       : '',
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.lockedControls.push(this.txtPlaceholder);
            this.txtPlaceholder.on('changed:after', this.onPlaceholderChanged.bind(this));
            this.txtPlaceholder.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.txtPlaceholder.cmpEl.on('focus', 'input.form-control', function() {
                setTimeout(function(){me.txtPlaceholder._input && me.txtPlaceholder._input.select();}, 1);
            });
        },

        setApi: function(api) {
            this.api = api;
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
        },

        onPlaceholderChanged: function(input, newValue, oldValue, e) {
            if (this.api && !this._noApply && (newValue!==oldValue)) {
                // var props   = this._originalProps || new AscCommon.CContentControlPr();
                // props.put_PlaceholderText(newValue || '    ');
                // this.api.asc_SetContentControlProperties(props, this.internalId);
                // if (!e.relatedTarget || (e.relatedTarget.localName != 'input' && e.relatedTarget.localName != 'textarea') || !/form-control/.test(e.relatedTarget.className))
                //     this.fireEvent('editcomplete', this);
            }
        },


        ChangeSettings: function(props, isShape) {
            if (this._initSettings)
                this.createDelayedElements();

            if (props) {
                this._originalProps = props;
                this._noApply = true;

                this.disableControls(this._locked);

                var type = props.asc_getType();
                var specProps = props.asc_getFieldProps();
                this._originalSpecProps = specProps;

                if (type===AscPDF.FIELD_TYPES.text || type == AscPDF.FIELD_TYPES.combobox) {
                    if (specProps) {
                        var val = specProps.asc_getPlaceholder();
                        if (this._state.placeholder !== val) {
                            this.txtPlaceholder.setValue(val ? val : '');
                            this._state.placeholder = val;
                        }
                    }

                }
                //for list controls
                if (type == AscPDF.FIELD_TYPES.combobox || type == AscPDF.FIELD_TYPES.listbox) {
                    this.labelFormName.text(type == AscPDF.FIELD_TYPES.combobox ? this.textCombobox : this.textListBox);
                }

                if (type == AscPDF.FIELD_TYPES.button)
                    // this.labelFormName.text(props.is_Signature() ? this.textSignature : this.textImage);
                    this.labelFormName.text(this.textImage);

                if (type == AscPDF.FIELD_TYPES.checkbox || type == AscPDF.FIELD_TYPES.radiobutton) {
                    this.labelFormName.text(type == AscPDF.FIELD_TYPES.checkbox ? this.textCheckbox : this.textRadiobox);
                }

                this._noApply = false;

                if (this.type !== type)
                    this.fireEvent('updatescroller', this);
                this.type = type;
            }
        },

        onHideMenus: function(menu, e, isFromInputControl){
            if (!isFromInputControl) this.fireEvent('editcomplete', this);
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable) {
            if (this._initSettings) return;

            var me = this;
            if (this._state.DisabledControls!==(this._state.LockDelete || disable)) {
                this._state.DisabledControls = this._state.LockDelete || disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(me._state.DisabledControls);
                });
            }
        },

        showHideControls: function(type, textProps, specProps, isSimpleInsideComplex, isSignature) {
        }

    }, PDFE.Views.FormSettings || {}));
});