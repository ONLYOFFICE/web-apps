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
 *  HeaderFooterDialog.js
 *
 *  Created by Julia Radzhabova on 09.07.2019
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */
define(['text!presentationeditor/main/app/template/HeaderFooterDialog.template',
    'common/main/lib/util/utils',
    'common/main/lib/component/RadioBox',
    'common/main/lib/component/InputField',
    'common/main/lib/view/AdvancedSettingsWindow'
], function (template) { 'use strict';

    PE.Views.HeaderFooterDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 360,
            height: 380,
            buttons: null
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
                            '<div class="separator"></div>',
                            '<div class="menu-panel" style="width: 130px; padding-top: 17px;">',
                                '<label  style="display:block; margin-left: 15px;" class="input-label">' + me.textPreview + '</label>',
                                '<div style="width: 100px; height: 80px; padding: 5px; margin-left: 15px; border: 1px solid #AFAFAF; border-radius: 2px; background: #ffffff;">',
                                    '<div id="hf-dlg-canvas-preview" style="width: 100%;height: 100%;"></div>',
                                '</div>',
                            '</div>',
                        '</div>',
                        '<div class="separator horizontal"></div>',
                        '<div class="footer center">',
                            '<button class="btn normal dlg-btn primary" result="all" style="width: auto; min-width: 86px;">' + me.applyAllText + '</button>',
                            '<button class="btn normal dlg-btn" result="ok" style="width: auto; min-width: 86px;">' + me.applyText + '</button>',
                            '<button class="btn normal dlg-btn" result="cancel">' + me.cancelButtonText + '</button>',
                        '</div>'
                    ].join('')
                )({
                    scope: this
                })
            }, options);

            this.lang       = options.lang;
            this.handler    = options.handler;
            this.hfProps    = options.props;
            this.api        = options.api;
            this.dateControls = [];

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.chDateTime = new Common.UI.CheckBox({
                el: $('#hf-dlg-chb-datetime'),
                labelText: this.textDateTime
            });
            this.chDateTime.on('change', _.bind(this.setType, this, 'date'));

            this.chSlide = new Common.UI.CheckBox({
                el: $('#hf-dlg-chb-slide'),
                labelText: this.textSlideNum
            });
            this.chSlide.on('change', _.bind(this.setType, this, 'slide'));

            this.chFooter = new Common.UI.CheckBox({
                el: $('#hf-dlg-chb-text'),
                labelText: this.textFooter
            });
            this.chFooter.on('change', _.bind(this.setType, this, 'footer'));

            this.inputFooter = new Common.UI.InputField({
                el          : $('#hf-dlg-text'),
                validateOnBlur: false,
                style       : 'width: 100%;'
            });

            var data = [{ value: 0x042C }, { value: 0x0402 }, { value: 0x0405 }, { value: 0x0C07 }, { value: 0x0407 },  {value: 0x0807}, { value: 0x0408 }, { value: 0x0C09 }, { value: 0x0809 }, { value: 0x0409 }, { value: 0x0C0A }, { value: 0x080A },
                { value: 0x040B }, { value: 0x040C }, { value: 0x0410 }, { value: 0x0411 }, { value: 0x0412 }, { value: 0x0426 }, { value: 0x040E }, { value: 0x0413 }, { value: 0x0415 }, { value: 0x0416 },
                { value: 0x0816 }, { value: 0x0419 }, { value: 0x041B }, { value: 0x0424 }, { value: 0x081D }, { value: 0x041D }, { value: 0x041F }, { value: 0x0422 }, { value: 0x042A }, { value: 0x0804 }];
            data.forEach(function(item) {
                var langinfo = Common.util.LanguageInfo.getLocalLanguageName(item.value);
                item.displayValue = langinfo[1];
                item.langName = langinfo[0];
            });

            this.cmbLang = new Common.UI.ComboBox({
                el          : $('#hf-dlg-combo-lang'),
                menuStyle   : 'min-width: 100%; max-height: 185px;',
                cls         : 'input-group-nr',
                editable    : false,
                data        : data,
                search: true,
                scrollAlwaysVisible: true,
                takeFocusOnClose: true
            });
            this.cmbLang.setValue(0x0409);
            this.cmbLang.on('selected', _.bind(function(combo, record) {
                this.updateFormats(record.value);
            }, this));
            this.dateControls.push(this.cmbLang);

            this.cmbFormat = new Common.UI.ComboBox({
                el          : $('#hf-dlg-combo-format'),
                menuStyle   : 'min-width: 100%; max-height: 185px;',
                cls         : 'input-group-nr',
                editable    : false,
                data        : [],
                takeFocusOnClose: true
            });
            this.dateControls.push(this.cmbFormat);

            this.radioUpdate = new Common.UI.RadioBox({
                el: $('#hf-dlg-radio-update'),
                labelText: this.textUpdate,
                name: 'asc-radio-header-update',
                checked: true
            }).on('change', _.bind(this.setDateTimeType, this, 'update'));
            this.dateControls.push(this.radioUpdate);

            this.radioFixed = new Common.UI.RadioBox({
                el: $('#hf-dlg-radio-fixed'),
                labelText: this.textFixed,
                name: 'asc-radio-header-update'
            }).on('change', _.bind(this.setDateTimeType, this, 'fixed'));
            this.dateControls.push(this.radioFixed);

            this.inputFixed = new Common.UI.InputField({
                el: $('#hf-dlg-input-fixed'),
                validateOnBlur: false,
                style       : 'width: 100%;'
            });
            this.dateControls.push(this.inputFixed);

            this.chNotTitle = new Common.UI.CheckBox({
                el: $('#hf-dlg-chb-not-title'),
                labelText: this.textNotTitle
            });

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [ this.chDateTime,  this.radioUpdate, this.cmbFormat, this.cmbLang, this.radioFixed, this.inputFixed, this.chSlide, this.chFooter, this.inputFooter, this.chNotTitle ];
        },

        getDefaultFocusableComponent: function () {
            if (!this.cmbFormat.isDisabled())
                return this.cmbFormat;
            else if (!this.inputFixed.isDisabled())
                return this.inputFixed;
            else if (!this.inputFooter.isDisabled())
                return this.inputFooter;
            else
                return this.chDateTime;
        },

        focusControls: function() {
            var el = this.getDefaultFocusableComponent();
            el && setTimeout(function(){
                el.focus();
            }, 10);
        },

        afterRender: function() {
            var me = this,
                value =  Common.Utils.InternalSettings.get("pe-settings-datetime-default"),
                arr = (value) ? value.split(';') : [];
            this.defaultFormats = [];
            arr.forEach(function(item){
                var pair = item.split(' ');
                me.defaultFormats[parseInt(pair[0])] = pair[1];
            });

            this._setDefaults(this.hfProps);
        },

        setType: function(type, field, newValue) {
            var me = this;
            newValue = (newValue=='checked');
            if (type == 'date') {
                _.each(this.dateControls, function(item) {
                    item.setDisabled(!newValue);
                });
                newValue && this.setDateTimeType(this.radioFixed.getValue() ? 'fixed' : 'update', null, true);
                this.props.put_ShowDateTime(newValue);
                this.focusControls();
            } else if (type == 'slide') {
                this.props.put_ShowSlideNum(newValue);
            } else if (type == 'footer') {
                this.inputFooter.setDisabled(!newValue);
                this.props.put_ShowFooter(newValue);
                newValue && setTimeout(function(){
                                me.inputFooter.cmpEl.find('input').focus();
                            },50);
            }
            this.props.updateView();
        },

        updateFormats: function(lang, format) {
            var props = new AscCommonSlide.CAscDateTime();
            props.put_Lang(lang);
            var data = props.get_DateTimeExamples(),
                arr = [];
            for (var name in data) {
                if (data[name])  {
                    arr.push({
                        value: name,
                        displayValue: data[name]
                    });
                }
            }
            this.cmbFormat.setData(arr);
            format = format || this.defaultFormats[lang];
            this.cmbFormat.setValue(format ? format : arr[0].value);
        },

        setDateTimeType: function(type, field, newValue) {
            if (newValue) {
                var me = this;
                this.cmbLang.setDisabled(type == 'fixed');
                this.cmbFormat.setDisabled(type == 'fixed');
                this.inputFixed.setDisabled(type == 'update');
                this.focusControls();
            }
        },

        onSelectFormat: function(format) {
            if (this.radioUpdate.getValue()) {
                format = format || this.cmbFormat.getValue();
                this.props.get_DateTime().put_DateTime(format);
            } else {
                this.props.get_DateTime().put_DateTime(null);
                this.props.get_DateTime().put_CustomDateTime(this.inputFixed.getValue());
            }
        },

        _setDefaults: function (props) {
            if (props) {
                var slideprops = props.get_Slide() || new AscCommonSlide.CAscHFProps();

                var val = slideprops.get_ShowDateTime();
                this.chDateTime.setValue(val, true);
                _.each(this.dateControls, function(item) {
                    item.setDisabled(!val);
                });

                var format, fixed,
                    datetime = slideprops.get_DateTime(),
                    item = this.cmbLang.store.findWhere({value: datetime ? (datetime.get_Lang() || this.lang) : this.lang});
                this._originalLang = item ? item.get('value') : 0x0409;
                this.cmbLang.setValue(this._originalLang);

                if (val) {
                    format = datetime.get_DateTime();
                    !format ? this.radioFixed.setValue(true) : this.radioUpdate.setValue(true);
                    !format && (fixed = datetime.get_CustomDateTime() || '');
                    this.setDateTimeType(!format ? 'fixed' : 'update', null, true);
                }
                this.updateFormats(this.cmbLang.getValue(), format);
                this.inputFixed.setValue((fixed!==undefined) ? fixed : this.cmbFormat.getRawValue());

                val = slideprops.get_ShowSlideNum();
                this.chSlide.setValue(val, true);

                val = slideprops.get_ShowFooter();
                this.chFooter.setValue(val, true);
                this.inputFooter.setDisabled(!val);
                val && this.inputFooter.setValue(slideprops.get_Footer() || '');

                val = slideprops.get_ShowOnTitleSlide();
                this.chNotTitle.setValue(!val, true);

                this.props = slideprops;
            } else
                this.props = new AscCommonSlide.CAscHFProps();

            this.props.put_DivId('hf-dlg-canvas-preview');
            this.props.put_Api(this.api);
            this.props.updateView();
        },

        getSettings: function () {
            var props = this.props;
            if (props.get_ShowDateTime()) {
                !props.get_DateTime() && props.put_DateTime(new AscCommonSlide.CAscDateTime());
                props.get_DateTime().put_Lang(this.cmbLang.getValue());
                this.onSelectFormat();
            }
            if (props.get_ShowFooter()) {
                props.put_Footer(this.inputFooter.getValue());
            }
            props.put_ShowOnTitleSlide(this.chNotTitle.getValue()!='checked');

            this.hfProps.put_Slide(this.props);
            return this.hfProps;
        },

        onDlgBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function() {
            this._handleInput('all');
            return false;
        },

        _handleInput: function(state) {
            if (this.handler) {
                if (state == 'ok') {
                    if (this.cmbLang.getValue() !== this._originalLang)  {
                        Common.UI.warning({
                            title: this.notcriticalErrorTitle,
                            maxwidth: 600,
                            msg  : this.diffLanguage
                        });
                        return;
                    }
                }

                this.handler.call(this, state, this.getSettings());
            }
            this.close();
        },

        textTitle: 'Footer Settings',
        applyAllText: 'Apply to all',
        applyText: 'Apply',
        textLang: 'Language',
        textFormat: 'Formats',
        textUpdate: 'Update automatically',
        textDateTime: 'Date and time',
        textSlideNum: 'Slide number',
        textFooter: 'Text in footer',
        textNotTitle: 'Don\'t show on title slide',
        textPreview: 'Preview',
        diffLanguage: 'You can’t use a date format in a different language than the slide master.\nTo change the master, click \'Apply to all\' instead of \'Apply\'',
        notcriticalErrorTitle: 'Warning',
        textFixed: 'Fixed'

    }, PE.Views.HeaderFooterDialog || {}))
});